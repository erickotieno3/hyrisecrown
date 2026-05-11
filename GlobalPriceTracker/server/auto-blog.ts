/**
 * Auto-Blog Service
 * 
 * This module is responsible for automatically generating blog content about
 * price comparisons, deals, and product updates. It uses OpenAI's API to
 * generate content based on price data and product information from our system.
 */

import OpenAI from "openai";
import { storage } from "./storage";
import { 
  InsertBlogPost, 
  Product, 
  ProductPrice, 
  InsertAutoPilotLog, 
  AutoPilotConfig 
} from "@shared/schema";
import { slugify } from "@shared/utils";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Types for blog generation
interface BlogGenerationParams {
  productId?: number;
  categoryId?: number;
  storeId?: number;
  countryId?: number;
  topic?: string;
  tags?: string[];
}

interface PriceChangeData {
  product: Product;
  oldPrice: number;
  newPrice: number;
  currency: string;
  storeName: string;
  countryName: string;
  percentageChange: number;
  isDecrease: boolean;
}

/**
 * Main function to generate and publish a blog post
 */
export async function generateAndPublishBlogPost(params: BlogGenerationParams): Promise<{ success: boolean; blogPostId?: number; error?: string }> {
  try {
    // 1. Gather data based on the params
    let blogData: any;
    
    if (params.productId) {
      blogData = await generateProductBlogData(params.productId);
    } else if (params.categoryId) {
      blogData = await generateCategoryBlogData(params.categoryId);
    } else if (params.topic) {
      blogData = await generateTopicalBlogData(params.topic);
    } else {
      // Default - generate a weekly price comparison summary
      blogData = await generateWeeklySummaryBlogData();
    }
    
    // 2. Generate the blog content using OpenAI
    const blogContent = await generateBlogContent(blogData, params.tags || []);
    
    // 3. Insert the blog post into the database
    const slug = slugify(blogContent.title);
    
    const newBlogPost: InsertBlogPost = {
      title: blogContent.title,
      slug,
      content: blogContent.content,
      excerpt: blogContent.excerpt,
      imageUrl: blogContent.imageUrl || null,
      authorName: "Tesco Price Comparison AI",
      categoryId: params.categoryId || null,
      tags: params.tags || [],
      isPublished: true,
      isAutomated: true,
      metaTitle: blogContent.title,
      metaDescription: blogContent.excerpt,
      relatedProductIds: blogData.relatedProductIds || [],
    };
    
    const blogPost = await storage.createBlogPost(newBlogPost);
    
    // 4. Log the successful operation
    await logAutoPilotRun("auto-blog", "success", {
      blogPostId: blogPost.id,
      params,
      blogData: { 
        title: blogContent.title, 
        excerpt: blogContent.excerpt,
        tags: params.tags || [] 
      }
    });
    
    return { success: true, blogPostId: blogPost.id };
  } catch (error) {
    console.error("Error generating blog post:", error);
    
    // Log the failed operation
    await logAutoPilotRun("auto-blog", "error", { 
      params, 
      error: error instanceof Error ? error.message : String(error)
    });
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error generating blog post" 
    };
  }
}

/**
 * Generate blog data for a specific product
 */
async function generateProductBlogData(productId: number) {
  const product = await storage.getProduct(productId);
  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }
  
  const prices = await storage.compareProductPrices(productId);
  const category = await storage.getCategory(product.categoryId);
  
  // Find the best and worst prices
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  const bestPrice = sortedPrices[0];
  const worstPrice = sortedPrices[sortedPrices.length - 1];
  
  // Calculate price differences and percentages
  const priceRange = worstPrice.price - bestPrice.price;
  const percentageDifference = (priceRange / worstPrice.price) * 100;
  
  return {
    product,
    category,
    prices,
    bestPrice,
    worstPrice,
    priceRange,
    percentageDifference,
    type: 'product',
    relatedProductIds: [productId]
  };
}

/**
 * Generate blog data for a product category
 */
async function generateCategoryBlogData(categoryId: number) {
  const category = await storage.getCategory(categoryId);
  if (!category) {
    throw new Error(`Category with ID ${categoryId} not found`);
  }
  
  const products = await storage.getProductsByCategory(categoryId);
  if (products.length === 0) {
    throw new Error(`No products found in category with ID ${categoryId}`);
  }
  
  // Get price data for a subset of the products (max 5)
  const productSample = products.slice(0, 5);
  const productData = [];
  const relatedProductIds = [];
  
  for (const product of productSample) {
    const prices = await storage.compareProductPrices(product.id);
    const bestPrice = [...prices].sort((a, b) => a.price - b.price)[0];
    
    productData.push({
      product,
      bestPrice,
      prices
    });
    
    relatedProductIds.push(product.id);
  }
  
  return {
    category,
    products: productSample,
    productData,
    type: 'category',
    relatedProductIds
  };
}

/**
 * Generate blog data for a specific topic
 */
async function generateTopicalBlogData(topic: string) {
  // Search for products related to the topic
  const products = await storage.searchProducts(topic);
  
  if (products.length === 0) {
    // If no products found, generate a general blog about the topic
    return {
      topic,
      products: [],
      type: 'topic',
      relatedProductIds: []
    };
  }
  
  // Get price data for a subset of the products (max 5)
  const productSample = products.slice(0, 5);
  const productData = [];
  const relatedProductIds = [];
  
  for (const product of productSample) {
    const prices = await storage.compareProductPrices(product.id);
    if (prices.length > 0) {
      const bestPrice = [...prices].sort((a, b) => a.price - b.price)[0];
      
      productData.push({
        product,
        bestPrice,
        prices
      });
      
      relatedProductIds.push(product.id);
    }
  }
  
  return {
    topic,
    products: productSample,
    productData,
    type: 'topic',
    relatedProductIds
  };
}

/**
 * Generate a weekly price comparison summary
 */
async function generateWeeklySummaryBlogData() {
  // Get trending products
  const trendingProducts = await storage.getTrendingProducts(8);
  
  // Get data for price changes
  const priceChanges: PriceChangeData[] = [];
  
  for (const product of trendingProducts) {
    if (product.prices && product.prices.length > 0) {
      const priceChangesForProduct = findSignificantPriceChanges(product);
      priceChanges.push(...priceChangesForProduct);
    }
  }
  
  // Sort price changes by percentage (most significant first)
  const sortedPriceChanges = priceChanges.sort((a, b) => 
    Math.abs(b.percentageChange) - Math.abs(a.percentageChange)
  );
  
  // Take the top 5 most significant price changes
  const topPriceChanges = sortedPriceChanges.slice(0, 5);
  
  return {
    trendingProducts,
    priceChanges: topPriceChanges,
    date: new Date(),
    type: 'weekly-summary',
    relatedProductIds: trendingProducts.map(p => p.id)
  };
}

/**
 * Find significant price changes for a product
 */
function findSignificantPriceChanges(productWithPrices: any): PriceChangeData[] {
  const priceChanges: PriceChangeData[] = [];
  
  for (const priceData of productWithPrices.prices) {
    // We consider a price changed significantly if the original price exists
    // and differs from the current price by more than 1%
    if (priceData.originalPrice && priceData.originalPrice !== priceData.price) {
      const percentageChange = ((priceData.price - priceData.originalPrice) / priceData.originalPrice) * 100;
      
      // Only include changes more significant than 1%
      if (Math.abs(percentageChange) > 1) {
        priceChanges.push({
          product: productWithPrices,
          oldPrice: priceData.originalPrice,
          newPrice: priceData.price,
          currency: priceData.currency,
          storeName: priceData.store.name,
          countryName: "Unknown", // You might need to fetch this
          percentageChange,
          isDecrease: percentageChange < 0
        });
      }
    }
  }
  
  return priceChanges;
}

/**
 * Generate blog content using OpenAI
 */
async function generateBlogContent(blogData: any, tags: string[]): Promise<{ 
  title: string; 
  content: string; 
  excerpt: string; 
  imageUrl?: string; 
}> {
  // Create a detailed prompt based on the blog data type
  let prompt = '';
  let systemPrompt = '';
  
  switch (blogData.type) {
    case 'product':
      systemPrompt = `You are an expert price comparison blogger. 
      Generate a detailed blog post about a product's price comparison across different stores.
      Include specific price details, highlight the best deals, and explain why shopping around matters.
      Use a friendly, informative tone suitable for price-conscious shoppers.
      Format the blog post in HTML. Include h2, h3, paragraph tags, tables, and bullet lists as appropriate.
      Make the content SEO-friendly, comprehensive, and informative.`;
      
      prompt = `Write a detailed blog post about ${blogData.product.name}.
      
      Product details:
      - Name: ${blogData.product.name}
      - Description: ${blogData.product.description || 'Not available'}
      - Category: ${blogData.category ? blogData.category.name : 'Not specified'}
      - Brand: ${blogData.product.brand || 'Not specified'}
      
      Price comparison:
      - Best price: ${blogData.bestPrice.price} ${blogData.bestPrice.currency} at ${blogData.bestPrice.store.name}
      - Worst price: ${blogData.worstPrice.price} ${blogData.worstPrice.currency} at ${blogData.worstPrice.store.name}
      - Price range: ${blogData.priceRange.toFixed(2)} ${blogData.bestPrice.currency}
      - Percentage difference: ${blogData.percentageDifference.toFixed(2)}%
      
      All available prices:
      ${blogData.prices.map((p: any) => `- ${p.store.name}: ${p.price} ${p.currency}`).join('\n')}
      
      Additional tags: ${tags.join(', ')}
      
      Provide the response in JSON format with the following structure:
      {
        "title": "An engaging title for the blog post",
        "content": "The full blog post content in HTML format",
        "excerpt": "A 1-2 sentence summary of the blog post"
      }`;
      break;
      
    case 'category':
      systemPrompt = `You are an expert price comparison blogger.
      Generate a detailed blog post about a product category, comparing prices and highlighting deals.
      Use a friendly, informative tone suitable for price-conscious shoppers.
      Format the blog post in HTML. Include h2, h3, paragraph tags, tables, and bullet lists as appropriate.
      Make the content SEO-friendly, comprehensive, and informative.`;
      
      prompt = `Write a detailed blog post about ${blogData.category.name} products.
      
      Category details:
      - Name: ${blogData.category.name}
      - Description: ${blogData.category.description || 'Not available'}
      
      Featured products and their best prices:
      ${blogData.productData.map((pd: any) => 
        `- ${pd.product.name}: ${pd.bestPrice ? `${pd.bestPrice.price} ${pd.bestPrice.currency} at ${pd.bestPrice.store.name}` : 'No price data available'}`
      ).join('\n')}
      
      Additional tags: ${tags.join(', ')}
      
      Provide the response in JSON format with the following structure:
      {
        "title": "An engaging title for the blog post",
        "content": "The full blog post content in HTML format",
        "excerpt": "A 1-2 sentence summary of the blog post"
      }`;
      break;
      
    case 'weekly-summary':
      systemPrompt = `You are an expert price comparison blogger.
      Generate a weekly price comparison summary highlighting significant price changes and deals.
      Use a friendly, informative tone suitable for price-conscious shoppers.
      Format the blog post in HTML. Include h2, h3, paragraph tags, tables, and bullet lists as appropriate.
      Make the content SEO-friendly, comprehensive, and informative.`;
      
      prompt = `Write a weekly price comparison summary blog post.
      
      Date: ${blogData.date.toDateString()}
      
      Trending products:
      ${blogData.trendingProducts.map((p: any) => `- ${p.name}`).join('\n')}
      
      Significant price changes:
      ${blogData.priceChanges.map((pc: PriceChangeData) => 
        `- ${pc.product.name} at ${pc.storeName}: ${pc.oldPrice} → ${pc.newPrice} ${pc.currency} (${pc.percentageChange.toFixed(2)}% ${pc.isDecrease ? 'decrease' : 'increase'})`
      ).join('\n')}
      
      Additional tags: ${tags.join(', ')}
      
      Provide the response in JSON format with the following structure:
      {
        "title": "An engaging title for the blog post",
        "content": "The full blog post content in HTML format",
        "excerpt": "A 1-2 sentence summary of the blog post"
      }`;
      break;
      
    case 'topic':
      systemPrompt = `You are an expert price comparison blogger.
      Generate a detailed blog post about a specific shopping topic or trend.
      Use a friendly, informative tone suitable for price-conscious shoppers.
      Format the blog post in HTML. Include h2, h3, paragraph tags, tables, and bullet lists as appropriate.
      Make the content SEO-friendly, comprehensive, and informative.`;
      
      prompt = `Write a detailed blog post about the topic: ${blogData.topic}.
      
      ${blogData.products.length > 0 ? `Related products:
      ${blogData.productData.map((pd: any) => 
        `- ${pd.product.name}: ${pd.bestPrice ? `${pd.bestPrice.price} ${pd.bestPrice.currency} at ${pd.bestPrice.store.name}` : 'No price data available'}`
      ).join('\n')}` : 'No specific product data available for this topic.'}
      
      Additional tags: ${tags.join(', ')}
      
      Provide the response in JSON format with the following structure:
      {
        "title": "An engaging title for the blog post",
        "content": "The full blog post content in HTML format",
        "excerpt": "A 1-2 sentence summary of the blog post"
      }`;
      break;
  }
  
  // Generate content with OpenAI
  try {
    // Check if OPENAI_API_KEY is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY is not configured. Using fallback mechanism.");
      await logAutoPilotRun('auto-blog', 'warning', { 
        message: 'OpenAI API key not configured. Unable to generate content.'
      });
      
      // Return a placeholder response for debugging and to allow workflow to continue
      return {
        title: `Upcoming Price Comparison Report (${new Date().toLocaleDateString()})`,
        content: `<p>Our team is currently gathering the latest price data from multiple retailers to provide you with a comprehensive comparison. Check back soon for the complete report!</p><p>In the meantime, you can explore our <a href="/products/trending">trending products</a> section to see what's popular this week.</p>`,
        excerpt: "Our price comparison team is gathering data for our next report. Check back soon!",
        imageUrl: undefined
      };
    }
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    const responseText = response.choices[0].message.content || '{}';
    const parsedResponse = JSON.parse(responseText);
    
    return {
      title: parsedResponse.title,
      content: parsedResponse.content,
      excerpt: parsedResponse.excerpt,
      imageUrl: parsedResponse.imageUrl
    };
  } catch (error) {
    console.error("Error generating blog content with OpenAI:", error);
    
    // Log the error but provide a fallback for auto-pilot to continue
    if (error instanceof Error && (error.message.includes('429') || error.message.includes('quota'))) {
      console.warn("OpenAI API quota exceeded. Using fallback mechanism to allow auto-pilot to continue.");
      await logAutoPilotRun('auto-blog', 'warning', { 
        message: 'OpenAI API quota exceeded. Using fallback content.',
        error: error.message
      });
      
      // Return a placeholder response so the system can continue functioning
      return {
        title: `Price Comparison Insights (${new Date().toLocaleDateString()})`,
        content: `<p>Our automated price tracking system has detected significant price movements across several retailers. Our analysis team is working on detailed comparisons.</p><p>Stay tuned for our comprehensive analysis coming soon. In the meantime, check out our <a href="/products/trending">trending products</a>.</p>`,
        excerpt: "Our price tracking system has detected significant price movements. Stay tuned for our detailed analysis.",
        imageUrl: undefined
      };
    }
    
    // For other errors, still throw to be handled by the caller
    throw new Error(`Failed to generate blog content: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Log the result of an auto-pilot run
 */
async function logAutoPilotRun(
  feature: string, 
  status: string, 
  details: any, 
  error?: string
): Promise<void> {
  try {
    // Find the feature ID
    const featureConfig = await storage.getAutoPilotConfigByFeature(feature);
    
    if (!featureConfig) {
      console.warn(`Auto-pilot feature '${feature}' not found in configuration`);
      return;
    }
    
    const logEntry: InsertAutoPilotLog = {
      featureId: featureConfig.id,
      status,
      details,
      error: error || null,
      endTime: new Date()
    };
    
    await storage.createAutoPilotLog(logEntry);
    
    // Update the last run time in the feature config
    await storage.updateAutoPilotConfig(featureConfig.id, {
      lastRun: new Date()
    });
  } catch (err) {
    console.error("Error logging auto-pilot run:", err);
    // Don't throw, as this is a non-critical operation
  }
}