/**
 * Visual Product Search Module
 * 
 * This module provides functionality for AI-powered visual search using the OpenAI API
 * to identify products from images and find similar products across multiple stores.
 */

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { storage } from './storage';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      // Ensure the directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to handle product image uploads
export const uploadProductImage = upload.single('productImage');

/**
 * Handle visual search requests
 */
export const handleVisualSearch = async (req: Request, res: Response) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file was uploaded'
      });
    }

    const filePath = req.file.path;
    
    // Analyze the image with OpenAI
    const identifiedProduct = await analyzeProductImage(filePath);
    
    // Find similar products
    const similarProducts = await findSimilarProducts(identifiedProduct);
    
    // Cleanup: Delete the uploaded file after processing
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temporary file:', err);
    });
    
    // Return the results
    res.json({
      success: true,
      identifiedProduct,
      similarProducts
    });
  } catch (error) {
    console.error('Error processing visual search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process the image. Please try again.'
    });
  }
};

/**
 * Analyze a product image using OpenAI Vision to identify the product
 */
async function analyzeProductImage(imagePath: string): Promise<{
  name: string;
  brand: string;
  category: string;
  attributes: Record<string, string>;
  confidence: number;
}> {
  try {
    // Read the image file as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a computer vision expert specialized in product identification. 
          Your task is to analyze the uploaded product image and extract accurate information. 
          Respond with a JSON object containing:
          
          1. name: The product name (be specific but concise)
          2. brand: The brand name (if visible, otherwise "Unknown")
          3. category: The product category (e.g., Electronics, Food, Clothing, etc.)
          4. attributes: An object containing key product attributes visible in the image (e.g., color, size, material, etc.)
          5. confidence: A number between 0 and 1 representing your confidence in this identification
          
          If you cannot identify the product clearly, provide your best guess but set a lower confidence score.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify this product with as much detail as possible"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Ensure we have all required fields with defaults if missing
    return {
      name: result.name || 'Unknown product',
      brand: result.brand || 'Unknown brand',
      category: result.category || 'Miscellaneous',
      attributes: result.attributes || {},
      confidence: result.confidence || 0.5
    };
  } catch (error) {
    console.error('Error analyzing product image:', error);
    // Return a default response if analysis fails
    return {
      name: 'Unknown product',
      brand: 'Unknown brand',
      category: 'Miscellaneous',
      attributes: {},
      confidence: 0
    };
  }
}

/**
 * Find similar products based on the identified product
 */
async function findSimilarProducts(identifiedProduct: {
  name: string;
  brand: string;
  category: string;
  attributes: Record<string, string>;
  confidence: number;
}): Promise<Array<{
  id: number;
  name: string;
  brand: string;
  imageUrl: string;
  price?: number;
  store?: string;
  currency?: string;
}>> {
  try {
    // Get all products from the database
    const allProducts = await storage.getProducts();
    
    if (!allProducts || allProducts.length === 0) {
      return [];
    }

    // Calculate similarity scores for each product
    const productsWithScores = allProducts.map(product => {
      const nameMatchScore = calculateTextSimilarity(identifiedProduct.name, product.name);
      const brandMatchScore = calculateTextSimilarity(
        identifiedProduct.brand, 
        product.brand || ''
      );
      
      // For product category, we need to compare with the category name
      let categoryMatchScore = 0;
      if (product.categoryId) {
        const category = getCategoryName(product.categoryId);
        if (category) {
          categoryMatchScore = calculateTextSimilarity(identifiedProduct.category, category);
        }
      }
      
      // Combine scores - name match is most important
      const totalScore = (nameMatchScore * 0.6) + (brandMatchScore * 0.3) + (categoryMatchScore * 0.1);
      
      return {
        product,
        score: totalScore
      };
    });
    
    // Sort by similarity score (descending)
    productsWithScores.sort((a, b) => b.score - a.score);
    
    // Get top matches (maximum 10)
    const topMatches = productsWithScores
      .filter(item => item.score > 0.2) // Filter out very low matches
      .slice(0, 10)
      .map(item => item.product);
    
    // Get prices for each product
    const productsWithPrices = await Promise.all(
      topMatches.map(async (product) => {
        const prices = await storage.getProductPrices(product.id);
        
        // Find the lowest price if available
        let lowestPrice: number | undefined;
        let storeName: string | undefined;
        let currency: string | undefined;
        
        if (prices && prices.length > 0) {
          const lowestPriceItem = prices.reduce((lowest, current) => {
            return (current.price < lowest.price) ? current : lowest;
          });
          
          lowestPrice = lowestPriceItem.price;
          storeName = lowestPriceItem.storeName;
          currency = lowestPriceItem.currency || 'USD';
        }
        
        return {
          id: product.id,
          name: product.name,
          brand: product.brand || 'Unknown brand',
          imageUrl: product.imageUrl,
          price: lowestPrice,
          store: storeName,
          currency
        };
      })
    );
    
    return productsWithPrices;
  } catch (error) {
    console.error('Error finding similar products:', error);
    return [];
  }
}

/**
 * Calculate text similarity between two strings
 * Returns a value between 0 and 1, where 1 means perfect match
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  
  // Convert to lowercase for comparison
  const s1 = text1.toLowerCase();
  const s2 = text2.toLowerCase();
  
  // Check for exact match
  if (s1 === s2) return 1;
  
  // Check if one string contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    const longerLength = Math.max(s1.length, s2.length);
    const shorterLength = Math.min(s1.length, s2.length);
    return shorterLength / longerLength * 0.9; // 0.9 as it's not an exact match
  }
  
  // Split into words and check for word matches
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  let matchCount = 0;
  for (const word1 of words1) {
    if (word1.length < 3) continue; // Skip very short words
    
    for (const word2 of words2) {
      if (word2.length < 3) continue;
      
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        matchCount++;
        break;
      }
    }
  }
  
  const maxPossibleMatches = Math.max(words1.length, words2.length);
  return maxPossibleMatches > 0 ? matchCount / maxPossibleMatches * 0.8 : 0;
}

/**
 * Get category name by ID (simple implementation)
 */
function getCategoryName(categoryId: number): string | null {
  // In a real implementation, this would query the database for the category name
  // For now, just return a default based on category ID
  const categories = {
    1: 'Electronics',
    2: 'Groceries',
    3: 'Clothing',
    4: 'Home & Garden',
    5: 'Beauty & Personal Care',
    6: 'Sports & Outdoors',
    7: 'Books',
    8: 'Toys',
    9: 'Health',
    10: 'Automotive'
  };
  
  return categories[categoryId] || null;
}

/**
 * Get B2B insights for a specific product
 */
export const getB2BInsights = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      });
    }
    
    const product = await storage.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Get all products to find market trends
    const allProducts = await storage.getProducts();
    
    // Get products in the same category
    const categoryProducts = allProducts.filter(p => 
      p.categoryId === product.categoryId
    );
    
    // Generate B2B insights
    const insights = await generateB2BInsights(product, categoryProducts);
    
    res.json({
      success: true,
      insights
    });
  } catch (error) {
    console.error('Error generating B2B insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate B2B insights. Please try again.'
    });
  }
};

/**
 * Generate B2B insights for a product using OpenAI
 */
async function generateB2BInsights(
  product: any,
  categoryProducts: any[]
): Promise<{
  marketTrends: string;
  competitiveAnalysis: string;
  pricePointInsights: string;
  businessOpportunities: string;
}> {
  try {
    // Get average price, price range, and other metrics from category products
    const prices = categoryProducts
      .filter(p => p.prices && p.prices.length > 0)
      .map(p => p.prices[0].price);
    
    const avgPrice = prices.length > 0 
      ? prices.reduce((sum, price) => sum + price, 0) / prices.length 
      : 0;
    
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    
    // Format data for the AI prompt
    const productData = {
      name: product.name,
      brand: product.brand,
      description: product.description,
      category: getCategoryName(product.categoryId),
      categoryStats: {
        totalProducts: categoryProducts.length,
        averagePrice: avgPrice,
        priceRange: { min: minPrice, max: maxPrice }
      }
    };

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a business intelligence expert specializing in B2B market analysis.
          You provide concise, actionable insights for businesses based on product and market data.
          Your analysis should be professional, data-driven, and focused on business opportunities.`
        },
        {
          role: "user",
          content: `Please provide B2B market insights for this product and its category:
          ${JSON.stringify(productData, null, 2)}
          
          Format your response as a JSON object with these sections:
          1. marketTrends: Recent trends in this product category
          2. competitiveAnalysis: Brief analysis of competitive landscape
          3. pricePointInsights: Insights on optimal pricing strategy
          4. businessOpportunities: Potential B2B opportunities`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000
    });

    const insights = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      marketTrends: insights.marketTrends || 'No market trend data available',
      competitiveAnalysis: insights.competitiveAnalysis || 'No competitive analysis data available',
      pricePointInsights: insights.pricePointInsights || 'No price point insights available',
      businessOpportunities: insights.businessOpportunities || 'No business opportunities data available'
    };
  } catch (error) {
    console.error('Error generating B2B insights with AI:', error);
    return {
      marketTrends: 'Unable to generate market trends at this time',
      competitiveAnalysis: 'Unable to generate competitive analysis at this time',
      pricePointInsights: 'Unable to generate price point insights at this time',
      businessOpportunities: 'Unable to generate business opportunities at this time'
    };
  }
}