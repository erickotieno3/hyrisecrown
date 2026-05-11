/**
 * AI-Powered API Routes
 * 
 * This file contains routes for various AI-powered features including:
 * - Product recommendations
 * - Natural language search
 * - Price trend analysis
 * - Smart shopping guide generation
 * - Product comparison
 */

import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { storage } from './storage';
import { uploadProductImage, handleVisualSearch, getB2BInsights } from './visual-search';

// Initialize OpenAI client
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.warn('OPENAI_API_KEY not set. AI features will use fallback mechanisms.');
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

export const aiRouter = Router();

/**
 * Get AI-powered product recommendations
 */
aiRouter.get('/recommendations', async (req: Request, res: Response) => {
  try {
    // Extract query parameters
    const { userId, productId, category } = req.query;

    // Fetch data needed for recommendations
    let products = [];
    if (category) {
      const categories = await storage.getCategoriesByName(category as string);
      if (categories?.length) {
        const categoryId = categories[0].id;
        products = await storage.getProductsByCategory(categoryId);
      }
    } else {
      products = await storage.getRecentProducts(20);
    }

    // If no products found, return empty recommendations
    if (!products || products.length === 0) {
      return res.json({ recommendations: [] });
    }

    // If OpenAI is available, use it for personalized recommendations
    if (openai) {
      // Limited subset of products to reduce token usage
      const productSubset = products.slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        category: p.categoryId,
        description: p.description?.substring(0, 100)
      }));

      // Generate recommendations context
      let context = `Based on ${category ? `the ${category} category` : 'recent products'}`;
      if (userId) context += ` and user ${userId}'s preferences`;
      if (productId) context += ` and similarity to product ID ${productId}`;

      // Get AI-powered recommendations
      const response = await openai.chat.completions.create({
        model: "gpt-4o",  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are a product recommendation assistant. Generate useful, relevant product recommendations based on the context provided."
          },
          {
            role: "user",
            content: `${context}, recommend products from this list: ${JSON.stringify(productSubset)}. For each product, provide a reason for the recommendation. Return the response as a JSON array with objects containing id, reason fields.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      if (response.choices && response.choices.length > 0) {
        try {
          const aiRecommendations = JSON.parse(response.choices[0].message?.content || '[]');
          
          // Map AI recommendations to actual product data
          const recommendedProducts = aiRecommendations.map((rec: any) => {
            const product = products.find(p => p.id === rec.id);
            if (!product) return null;
            
            return {
              ...product,
              reason: rec.reason
            };
          }).filter(Boolean);
          
          return res.json({ recommendations: recommendedProducts });
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', parseError);
          // Fall through to fallback
        }
      }
    }

    // Fallback: Return random selection of products without AI enhancement
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const recommendations = shuffled.slice(0, 3).map(product => ({
      ...product,
      reason: category 
        ? `Popular item in ${category}`
        : 'Currently trending product'
    }));

    return res.json({ recommendations });
  } catch (error) {
    console.error('Error in AI recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

/**
 * Natural language search for products
 */
aiRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Fetch products to search through
    const products = await storage.getAllProducts();
    
    if (!products || products.length === 0) {
      return res.json({ results: [] });
    }

    // If OpenAI is available, use it for semantic search
    if (openai) {
      // Generate search context with simplified product data to reduce token usage
      const productData = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description?.substring(0, 100) || '',
        category: p.categoryId,
        brand: p.brand
      }));

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are a product search assistant. Find the most relevant products based on the user's natural language query."
          },
          {
            role: "user",
            content: `Search for products matching: "${query}". Return the most relevant products from this list: ${JSON.stringify(productData.slice(0, 50))}. Return JSON array with only product IDs.`
          }
        ],
        temperature: 0.3,
        max_tokens: 250
      });

      if (response.choices && response.choices.length > 0) {
        try {
          const productIds = JSON.parse(response.choices[0].message?.content || '[]');
          
          // Map product IDs to actual product data
          const results = productIds
            .map((id: number) => products.find(p => p.id === id))
            .filter(Boolean);
          
          if (results.length > 0) {
            return res.json({ results });
          }
          // Fall through to fallback if no results
        } catch (parseError) {
          console.error('Failed to parse OpenAI search response:', parseError);
          // Fall through to fallback
        }
      }
    }

    // Fallback: Simple keyword search
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    
    // Score products based on keyword matches
    const scoredProducts = products.map(product => {
      let score = 0;
      const productText = `${product.name} ${product.description || ''} ${product.brand || ''}`.toLowerCase();
      
      keywords.forEach(keyword => {
        if (productText.includes(keyword)) {
          score += 1;
          // Bonus points for matches in name or brand
          if (product.name.toLowerCase().includes(keyword)) score += 2;
          if (product.brand?.toLowerCase().includes(keyword)) score += 1;
        }
      });
      
      return { product, score };
    });
    
    // Return products with any matches, sorted by score
    const results = scoredProducts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.product);
    
    res.json({ results });
  } catch (error) {
    console.error('Error in natural language search:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

/**
 * Get AI-powered price trend insights
 */
aiRouter.get('/price-insights/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Valid product ID is required' });
    }

    // Fetch product and price history
    const product = await storage.getProduct(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const priceHistory = await storage.getProductPriceHistory(productId);
    
    // If OpenAI is available, use it for price trend analysis
    if (openai && priceHistory && priceHistory.length > 0) {
      // Format price history for analysis
      const formattedHistory = priceHistory.map(record => ({
        date: record.lastUpdated.toISOString().split('T')[0],
        price: record.price,
        currency: record.currency,
        store: record.storeId
      }));

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are a price analysis assistant. Analyze price trends and provide insights."
          },
          {
            role: "user",
            content: `Analyze the price history for ${product.name}: ${JSON.stringify(formattedHistory)}. Provide insights on price trends, when to buy, and price predictions. Return as JSON with fields: summary, priceRange, trend, bestTimeToBuy, prediction.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 350
      });

      if (response.choices && response.choices.length > 0) {
        try {
          const insights = JSON.parse(response.choices[0].message.content || '{}');
          return res.json({ 
            product,
            priceHistory,
            insights
          });
        } catch (parseError) {
          console.error('Failed to parse OpenAI price insights:', parseError);
          // Fall through to fallback
        }
      }
    }

    // Fallback: Generate basic insights without AI
    let insights = {};
    
    if (priceHistory && priceHistory.length > 0) {
      const prices = priceHistory.map(h => h.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const currentPrice = priceHistory[0].price;
      
      // Determine if price is trending up, down or stable
      let trend = "stable";
      if (priceHistory.length > 1) {
        const recentPrices = priceHistory.slice(0, Math.min(3, priceHistory.length));
        const oldestRecent = recentPrices[recentPrices.length - 1].price;
        const percentChange = ((currentPrice - oldestRecent) / oldestRecent) * 100;
        
        if (percentChange > 5) trend = "rising";
        else if (percentChange < -5) trend = "falling";
      }
      
      insights = {
        summary: `The price of this product ranges from ${minPrice} to ${maxPrice} ${priceHistory[0].currency}.`,
        priceRange: `${minPrice} - ${maxPrice} ${priceHistory[0].currency}`,
        trend: trend === "rising" ? "Prices are trending up" : trend === "falling" ? "Prices are trending down" : "Prices are relatively stable",
        bestTimeToBuy: trend === "falling" ? "Consider waiting as prices are falling" : "Current price is a fair value",
        prediction: "Prices expected to remain within the current range"
      };
    } else {
      insights = {
        summary: "Not enough price data to provide insights.",
        priceRange: "Unknown",
        trend: "Unknown",
        bestTimeToBuy: "Not enough data",
        prediction: "Insufficient data for prediction"
      };
    }

    return res.json({
      product,
      priceHistory: priceHistory || [],
      insights
    });
  } catch (error) {
    console.error('Error generating price insights:', error);
    res.status(500).json({ error: 'Failed to generate price insights' });
  }
});

/**
 * Generate AI-powered personalized shopping guide
 */
aiRouter.get('/shopping-guide/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    // In a real application, we would fetch user preferences and shopping history
    // For demo purposes, we'll create a simple shopping guide
    
    // If OpenAI is available, use it for personalized shopping guide
    if (openai) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are a personal shopping assistant. Generate helpful shopping guides based on user preferences."
          },
          {
            role: "user",
            content: `Generate a shopping guide for user ${userId} who enjoys electronics and grocery shopping in the mid-price range. Return as JSON with fields: recommendations (array of objects with title, description, stores), tips (array of strings).`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 500
      });

      if (response.choices && response.choices.length > 0) {
        try {
          const shoppingGuide = JSON.parse(response.choices[0].message.content || '{}');
          return res.json(shoppingGuide);
        } catch (parseError) {
          console.error('Failed to parse OpenAI shopping guide:', parseError);
          // Fall through to fallback
        }
      }
    }

    // Fallback: Generate basic shopping guide without AI
    const shoppingGuide = {
      recommendations: [
        {
          title: "Weekly Grocery Essentials",
          description: "Focus on fresh produce and essentials at Tesco for best value.",
          stores: ["Tesco", "Aldi", "Walmart"]
        },
        {
          title: "Electronics Shopping",
          description: "Compare prices across stores for best deals on electronics.",
          stores: ["Amazon", "eBay", "Best Buy"]
        }
      ],
      tips: [
        "Buy non-perishable items in bulk when on sale to save money",
        "Check weekly circulars for the best grocery deals",
        "For electronics, wait for seasonal sales for biggest discounts",
        "Sign up for store loyalty programs to get additional discounts"
      ]
    };

    res.json(shoppingGuide);
  } catch (error) {
    console.error('Error generating shopping guide:', error);
    res.status(500).json({ error: 'Failed to generate shopping guide' });
  }
});

/**
 * Extract product features from description
 */
aiRouter.post('/extract-features', async (req: Request, res: Response) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Product description is required' });
    }

    // If OpenAI is available, use it for feature extraction
    if (openai) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are a product analysis assistant. Extract key features and specifications from product descriptions."
          },
          {
            role: "user",
            content: `Extract the key features and specifications from this product description: "${description}". Return as JSON with fields: features (array of strings), specifications (object with key-value pairs), keyHighlights (array of strings).`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 350
      });

      if (response.choices && response.choices.length > 0) {
        try {
          const features = JSON.parse(response.choices[0].message.content || '{}');
          return res.json(features);
        } catch (parseError) {
          console.error('Failed to parse OpenAI feature extraction:', parseError);
          // Fall through to fallback
        }
      }
    }

    // Fallback: Simple keyword-based feature extraction
    const words = description.split(/\s+/);
    const keyFeatures = new Set();
    
    // Simple keyword extraction (very basic)
    const featureKeywords = ["capacity", "power", "battery", "resolution", "wireless", "smart", "automatic", "memory", "storage", "screen", "display", "camera", "processor"];
    
    words.forEach((word, index, self) => {
      featureKeywords.forEach(keyword => {
        if (self.slice(Math.max(0, index - 3), Math.min(self.length, index + 4)).join(' ').toLowerCase().includes(keyword)) {
          keyFeatures.add(self.slice(Math.max(0, index - 1), Math.min(self.length, index + 3)).join(' '));
        }
      });
    });

    const features = {
      features: Array.from(keyFeatures),
      specifications: {},
      keyHighlights: ["Quality product", "Good value"]
    };

    res.json(features);
  } catch (error) {
    console.error('Error extracting product features:', error);
    res.status(500).json({ error: 'Failed to extract product features' });
  }
});

/**
 * Compare two products using AI
 */
aiRouter.post('/compare-products', async (req: Request, res: Response) => {
  try {
    const { product1Id, product2Id } = req.body;
    
    if (!product1Id || !product2Id) {
      return res.status(400).json({ error: 'Two product IDs are required' });
    }

    // Fetch products
    const product1 = await storage.getProduct(product1Id);
    const product2 = await storage.getProduct(product2Id);
    
    if (!product1 || !product2) {
      return res.status(404).json({ error: 'One or both products not found' });
    }

    // Fetch price data
    const prices1 = await storage.getLatestProductPrices(product1Id);
    const prices2 = await storage.getLatestProductPrices(product2Id);

    // If OpenAI is available, use it for product comparison
    if (openai) {
      // Prepare product data for comparison
      const productData1 = {
        ...product1,
        prices: prices1 || []
      };
      
      const productData2 = {
        ...product2,
        prices: prices2 || []
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are a product comparison assistant. Compare products objectively based on their features, specifications, and prices."
          },
          {
            role: "user",
            content: `Compare these two products: Product 1: ${JSON.stringify(productData1)} and Product 2: ${JSON.stringify(productData2)}. Return comparison as JSON with fields: summary, valuePick, featureComparison (array of objects with feature, product1, product2, winner), priceComparison, overallRecommendation.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 500
      });

      if (response.choices && response.choices.length > 0) {
        try {
          const comparison = JSON.parse(response.choices[0].message.content || '{}');
          return res.json({
            product1,
            product2,
            prices1: prices1 || [],
            prices2: prices2 || [],
            comparison
          });
        } catch (parseError) {
          console.error('Failed to parse OpenAI product comparison:', parseError);
          // Fall through to fallback
        }
      }
    }

    // Fallback: Generate basic comparison without AI
    const getAveragePrice = (prices: any[]) => {
      if (!prices || prices.length === 0) return 0;
      return prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
    };
    
    const avgPrice1 = getAveragePrice(prices1 || []);
    const avgPrice2 = getAveragePrice(prices2 || []);
    
    const priceDiff = avgPrice1 - avgPrice2;
    const cheaperProduct = priceDiff > 0 ? product2.name : priceDiff < 0 ? product1.name : "Both are similarly priced";

    const comparison = {
      summary: `Comparing ${product1.name} and ${product2.name}. The main differences are in price and features.`,
      valuePick: cheaperProduct,
      featureComparison: [
        {
          feature: "Brand",
          product1: product1.brand || "Unknown",
          product2: product2.brand || "Unknown",
          winner: "Depends on preference"
        }
      ],
      priceComparison: `${product1.name} average price: ${avgPrice1.toFixed(2)}, ${product2.name} average price: ${avgPrice2.toFixed(2)}`,
      overallRecommendation: "Both products have their strengths. Consider your specific needs and budget."
    };

    res.json({
      product1,
      product2,
      prices1: prices1 || [],
      prices2: prices2 || [],
      comparison
    });
  } catch (error) {
    console.error('Error comparing products:', error);
    res.status(500).json({ error: 'Failed to compare products' });
  }
});

/**
 * Generate personalized content
 */
aiRouter.post('/generate-content', async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // If OpenAI is available, use it for content generation
    if (openai) {
      const contextStr = context ? JSON.stringify(context) : 'No additional context provided';
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are a content generation assistant for an e-commerce platform. Generate helpful, informative, and engaging content."
          },
          {
            role: "user",
            content: `Generate content based on this prompt: "${prompt}". Additional context: ${contextStr}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      if (response.choices && response.choices.length > 0) {
        const content = response.choices[0].message.content;
        return res.json({ content });
      }
    }

    // Fallback: Provide a message explaining AI limitations
    res.json({ 
      content: "AI-generated content is currently unavailable. Please try again later or contact customer support for assistance."
    });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

/**
 * Visual Product Search - Upload and analyze product image
 */
aiRouter.post('/visual-search', uploadProductImage, handleVisualSearch);

/**
 * Get B2B insights for a specific product
 */
aiRouter.get('/b2b-insights/:productId', getB2BInsights);

export default aiRouter;