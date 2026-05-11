/**
 * Shopify Integration Routes
 * 
 * This file contains routes for interacting with Shopify stores
 * and managing the Shopify integration.
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import { stores, products, productPrices, insertStoreSchema } from '@shared/schema';
import { initializeShopifyIntegration, getShopifyIntegration } from './shopify-integration';
import { eq, sql } from 'drizzle-orm';

export const shopifyRouter = Router();

// Schema for adding a new Shopify store
const addShopifyStoreSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  shopDomain: z.string().min(1, "Shop domain is required"),
  accessToken: z.string().min(1, "Access token is required"),
  countryId: z.string().or(z.number()).transform(val => Number(val)),
  logoUrl: z.string().optional(),
});

/**
 * Add a new Shopify store
 */
shopifyRouter.post('/stores', async (req: Request, res: Response) => {
  try {
    const validatedData = addShopifyStoreSchema.parse(req.body);
    
    // Check if store with this domain already exists
    const existingStore = await db
      .select()
      .from(stores)
      .where(eq(stores.apiUrl, `https://${validatedData.shopDomain}`));
    
    if (existingStore.length > 0) {
      return res.status(400).json({
        error: 'A store with this domain already exists'
      });
    }
    
    // Add store using the Shopify integration
    const shopifyIntegration = getShopifyIntegration();
    const storeId = await shopifyIntegration.addShopifyStore({
      name: validatedData.name,
      shopDomain: validatedData.shopDomain,
      accessToken: validatedData.accessToken,
      countryId: validatedData.countryId,
      logoUrl: validatedData.logoUrl
    });
    
    const newStore = await db.select().from(stores).where(eq(stores.id, storeId));
    
    return res.status(201).json(newStore[0]);
  } catch (error) {
    console.error('Error adding Shopify store:', error);
    return res.status(400).json({
      error: error instanceof z.ZodError 
        ? error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        : 'Failed to add Shopify store'
    });
  }
});

/**
 * List all Shopify stores
 */
shopifyRouter.get('/stores', async (req: Request, res: Response) => {
  try {
    const shopifyStores = await db
      .select()
      .from(stores)
      .where(eq(stores.type, 'shopify'));
    
    return res.json(shopifyStores);
  } catch (error) {
    console.error('Error fetching Shopify stores:', error);
    return res.status(500).json({
      error: 'Failed to fetch Shopify stores'
    });
  }
});

/**
 * Start a sync for all Shopify stores
 */
shopifyRouter.post('/sync', async (req: Request, res: Response) => {
  try {
    const shopifyIntegration = getShopifyIntegration();
    
    // Start sync process asynchronously
    shopifyIntegration.fetchAllStoreProducts().then(count => {
      console.log(`Synced ${count} products from Shopify stores`);
    }).catch(error => {
      console.error('Error syncing Shopify stores:', error);
    });
    
    return res.status(202).json({
      message: 'Shopify sync process started'
    });
  } catch (error) {
    console.error('Error starting Shopify sync:', error);
    return res.status(500).json({
      error: 'Failed to start Shopify sync'
    });
  }
});

/**
 * Get products from Shopify stores with pagination
 */
shopifyRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Get all Shopify products
    const shopifyProducts = await db
      .select({
        product: products,
        price: productPrices,
        store: stores
      })
      .from(products)
      .leftJoin(productPrices, eq(products.id, productPrices.productId))
      .leftJoin(stores, eq(productPrices.storeId, stores.id))
      .where(eq(products.source, 'shopify'))
      .limit(limit)
      .offset(offset);
    
    // Format response
    const formattedProducts = shopifyProducts.map(item => {
      return {
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        imageUrl: item.product.imageUrl,
        price: item.price ? item.price.price : null,
        currency: item.price ? item.price.currency : null,
        originalPrice: item.price ? item.price.originalPrice : null,
        onSale: item.price ? item.price.onSale : false,
        inStock: item.price ? item.price.inStock : false,
        lastChecked: item.price ? item.price.lastChecked : null,
        storeName: item.store ? item.store.name : null,
        storeLogoUrl: item.store ? item.store.logoUrl : null,
        attributes: item.product.attributes ? JSON.parse(item.product.attributes as string) : {},
      };
    });
    
    // Count total products for pagination
    const totalCount = await db.select({ count: sql`count(*)` }).from(products)
      .where(eq(products.source, 'shopify'));
    
    return res.json({
      products: formattedProducts,
      page,
      limit,
      total: parseInt(totalCount[0].count as string)
    });
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    return res.status(500).json({
      error: 'Failed to fetch Shopify products'
    });
  }
});

/**
 * Get detailed information about a single product
 */
shopifyRouter.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    
    const productData = await db
      .select({
        product: products,
        price: productPrices,
        store: stores
      })
      .from(products)
      .leftJoin(productPrices, eq(products.id, productPrices.productId))
      .leftJoin(stores, eq(productPrices.storeId, stores.id))
      .where(eq(products.id, productId));
    
    if (productData.length === 0) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }
    
    const item = productData[0];
    
    const formattedProduct = {
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      imageUrl: item.product.imageUrl,
      price: item.price ? item.price.price : null,
      currency: item.price ? item.price.currency : null,
      originalPrice: item.price ? item.price.originalPrice : null,
      onSale: item.price ? item.price.onSale : false,
      discount: item.price && item.price.originalPrice ? 
        ((item.price.originalPrice - item.price.price) / item.price.originalPrice) * 100 : 0,
      inStock: item.price ? item.price.inStock : false,
      url: item.price ? item.price.url : null,
      storeName: item.store ? item.store.name : null,
      storeLogoUrl: item.store ? item.store.logoUrl : null,
      attributes: item.product.attributes ? JSON.parse(item.product.attributes as string) : {},
      lastChecked: item.price ? item.price.lastChecked : null,
      externalId: item.product.externalId,
      source: item.product.source
    };
    
    return res.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching Shopify product:', error);
    return res.status(500).json({
      error: 'Failed to fetch Shopify product'
    });
  }
});

/**
 * Compare prices between Shopify and other sources
 */
shopifyRouter.get('/compare', async (req: Request, res: Response) => {
  try {
    const productName = req.query.name as string;
    
    if (!productName) {
      return res.status(400).json({
        error: 'Product name is required'
      });
    }
    
    // Find matching products across all sources
    const matchingProducts = await db
      .select({
        product: products,
        price: productPrices,
        store: stores
      })
      .from(products)
      .leftJoin(productPrices, eq(products.id, productPrices.productId))
      .leftJoin(stores, eq(productPrices.storeId, stores.id))
      .where(eq(products.name, productName));
    
    // Group by source
    const comparison = matchingProducts.map(item => {
      return {
        id: item.product.id,
        name: item.product.name,
        price: item.price ? item.price.price : null,
        currency: item.price ? item.price.currency : null,
        originalPrice: item.price ? item.price.originalPrice : null,
        onSale: item.price ? item.price.onSale : false,
        inStock: item.price ? item.price.inStock : false,
        url: item.price ? item.price.url : null,
        storeName: item.store ? item.store.name : null,
        storeType: item.store ? item.store.type : null,
        attributes: item.product.attributes ? JSON.parse(item.product.attributes as string) : {},
        lastChecked: item.price ? item.price.lastChecked : null,
        source: item.product.source
      };
    });
    
    // Get price differences
    const shopifyProducts = comparison.filter(p => p.source === 'shopify');
    const otherProducts = comparison.filter(p => p.source !== 'shopify');
    
    // Calculate average price difference
    let avgDifference = 0;
    let comparisonCount = 0;
    
    if (shopifyProducts.length > 0 && otherProducts.length > 0) {
      const shopifyAvgPrice = shopifyProducts.reduce((sum, p) => sum + (p.price || 0), 0) / shopifyProducts.length;
      
      otherProducts.forEach(p => {
        if (p.price) {
          avgDifference += calculatePercentageDifference(shopifyAvgPrice, p.price);
          comparisonCount++;
        }
      });
      
      if (comparisonCount > 0) {
        avgDifference = avgDifference / comparisonCount;
      }
    }
    
    return res.json({
      shopifyProducts,
      otherProducts,
      avgDifference,
      comparisonCount
    });
  } catch (error) {
    console.error('Error comparing Shopify products:', error);
    return res.status(500).json({
      error: 'Failed to compare Shopify products'
    });
  }
});

/**
 * Helper function to calculate percentage difference between two prices
 */
function calculatePercentageDifference(price1: number, price2: number): number {
  if (price1 === 0 || price2 === 0) return 0;
  return ((price1 - price2) / ((price1 + price2) / 2)) * 100;
}