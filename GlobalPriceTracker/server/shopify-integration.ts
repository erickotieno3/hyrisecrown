/**
 * Shopify Integration Module
 * 
 * This module handles integration with Shopify stores to fetch product data,
 * prices, and other information for price comparison.
 */

import axios from 'axios';
import { db } from './db';
import { stores, products, productPrices, insertStoreSchema, insertProductPriceSchema } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { WebSocketServer, WebSocket } from 'ws';

interface ShopifyStore {
  shopDomain: string;
  accessToken: string;
  apiVersion: string;
  countryId: number;
  storeId: number;
}

interface ShopifyProduct {
  id: number;
  title: string;
  description: string;
  price: string;
  compare_at_price: string | null;
  image: {
    src: string;
  } | null;
  variants: Array<{
    id: number;
    price: string;
    compare_at_price: string | null;
    inventory_quantity: number;
  }>;
}

export class ShopifyIntegration {
  private shopifyStores: ShopifyStore[] = [];
  private wss: WebSocketServer | null = null;

  constructor(wss?: WebSocketServer) {
    this.wss = wss || null;
  }

  /**
   * Initialize Shopify integration by loading store configurations
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Shopify integration...');
      // Load Shopify stores from database
      const shopifyStores = await db
        .select()
        .from(stores)
        .where(eq(stores.type, 'shopify'));

      this.shopifyStores = shopifyStores.map(store => ({
        shopDomain: store.apiUrl ? store.apiUrl.replace('https://', '').replace('/', '') : '',
        accessToken: store.apiKey || '',
        apiVersion: '2024-04', // Latest Shopify API version
        countryId: store.countryId,
        storeId: store.id
      }));

      console.log(`Initialized Shopify integration with ${this.shopifyStores.length} stores`);
    } catch (error) {
      console.error('Failed to initialize Shopify integration (swallowed for stability):', error);
    }
  }

  /**
   * Add a new Shopify store to the system
   */
  async addShopifyStore(storeData: {
    name: string;
    shopDomain: string;
    accessToken: string;
    countryId: number;
    logoUrl?: string;
  }): Promise<number> {
    try {
      // Create store record in database
      const [newStore] = await db
        .insert(stores)
        .values({
          name: storeData.name,
          type: 'shopify',
          apiUrl: `https://${storeData.shopDomain}`,
          apiKey: storeData.accessToken,
          countryId: storeData.countryId,
          logoUrl: storeData.logoUrl || null,
          active: true,
          updateInterval: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Add to internal store list
      this.shopifyStores.push({
        shopDomain: storeData.shopDomain,
        accessToken: storeData.accessToken,
        apiVersion: '2024-04',
        countryId: storeData.countryId,
        storeId: newStore.id
      });

      console.log(`Added new Shopify store: ${storeData.name}`);
      return newStore.id;
    } catch (error) {
      console.error('Failed to add Shopify store:', error);
      throw error;
    }
  }

  /**
   * Fetch products from all connected Shopify stores
   */
  async fetchAllStoreProducts(): Promise<number> {
    let totalProductsUpdated = 0;

    for (const store of this.shopifyStores) {
      try {
        const count = await this.fetchProductsFromStore(store);
        totalProductsUpdated += count;
      } catch (error) {
        console.error(`Error fetching products from ${store.shopDomain}:`, error);
      }
    }

    if (this.wss) {
      this.broadcastUpdate({
        type: 'shopify-sync-complete',
        productsUpdated: totalProductsUpdated
      });
    }

    return totalProductsUpdated;
  }

  /**
   * Fetch products from a specific Shopify store
   */
  private async fetchProductsFromStore(store: ShopifyStore): Promise<number> {
    let productsUpdated = 0;
    let hasMoreProducts = true;
    let page = 1;
    const limit = 50; // Number of products per request
    
    try {
      while (hasMoreProducts) {
        const url = `https://${store.shopDomain}/admin/api/${store.apiVersion}/products.json?limit=${limit}&page=${page}`;
        
        const response = await axios.get(url, {
          headers: {
            'X-Shopify-Access-Token': store.accessToken
          }
        });

        const shopifyProducts = response.data.products as ShopifyProduct[];
        
        if (shopifyProducts.length === 0) {
          hasMoreProducts = false;
          continue;
        }

        for (const shopifyProduct of shopifyProducts) {
          await this.processShopifyProduct(shopifyProduct, store);
          productsUpdated++;
        }

        page++;
      }

      console.log(`Updated ${productsUpdated} products from ${store.shopDomain}`);
      return productsUpdated;
    } catch (error) {
      console.error(`Error fetching products from Shopify store ${store.shopDomain}:`, error);
      throw error;
    }
  }

  /**
   * Process a single Shopify product
   */
  private async processShopifyProduct(shopifyProduct: ShopifyProduct, store: ShopifyStore): Promise<void> {
    try {
      // Check if product already exists
      const existingProducts = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.externalId, String(shopifyProduct.id)),
            eq(products.source, 'shopify')
          )
        );

      let productId: number;
      
      if (existingProducts.length === 0) {
        // Create new product
        const [newProduct] = await db
          .insert(products)
          .values({
            name: shopifyProduct.title,
            description: shopifyProduct.description || '',
            imageUrl: shopifyProduct.image?.src || null,
            barcode: null, // Shopify doesn't provide barcode in basic API response
            categoryId: null, // Would need additional logic to determine category
            brand: null, // Would need additional processing to extract brand
            source: 'shopify',
            externalId: String(shopifyProduct.id),
            attributes: JSON.stringify({
              shopifyProductId: shopifyProduct.id,
              variants: shopifyProduct.variants.length
            }),
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
          
        productId = newProduct.id;
      } else {
        // Update existing product
        productId = existingProducts[0].id;
        
        await db
          .update(products)
          .set({
            name: shopifyProduct.title,
            description: shopifyProduct.description || '',
            imageUrl: shopifyProduct.image?.src || null,
            attributes: JSON.stringify({
              shopifyProductId: shopifyProduct.id,
              variants: shopifyProduct.variants.length
            }),
            updatedAt: new Date()
          })
          .where(eq(products.id, productId));
      }

      // Get main product price from the first variant
      if (shopifyProduct.variants && shopifyProduct.variants.length > 0) {
        const mainVariant = shopifyProduct.variants[0];
        const price = parseFloat(mainVariant.price);
        
        // Update product price
        const existingPrices = await db
          .select()
          .from(productPrices)
          .where(
            and(
              eq(productPrices.productId, productId),
              eq(productPrices.storeId, store.storeId)
            )
          );

        if (existingPrices.length === 0) {
          // Create new price record
          await db
            .insert(productPrices)
            .values({
              productId,
              storeId: store.storeId,
              price,
              currency: 'USD', // Default - ideally would be based on store country
              inStock: mainVariant.inventory_quantity > 0,
              onSale: mainVariant.compare_at_price !== null,
              originalPrice: mainVariant.compare_at_price ? parseFloat(mainVariant.compare_at_price) : null,
              url: `https://${store.shopDomain}/products/${shopifyProduct.id}`,
              lastChecked: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            });
        } else {
          // Update existing price record
          await db
            .update(productPrices)
            .set({
              price,
              inStock: mainVariant.inventory_quantity > 0,
              onSale: mainVariant.compare_at_price !== null,
              originalPrice: mainVariant.compare_at_price ? parseFloat(mainVariant.compare_at_price) : null,
              lastChecked: new Date(),
              updatedAt: new Date()
            })
            .where(eq(productPrices.id, existingPrices[0].id));
        }
      }
    } catch (error) {
      console.error(`Error processing Shopify product ${shopifyProduct.id}:`, error);
    }
  }

  /**
   * Fetch a single product by Shopify ID
   */
  async fetchSingleProduct(shopDomain: string, productId: number): Promise<ShopifyProduct | null> {
    try {
      const store = this.shopifyStores.find(s => s.shopDomain === shopDomain);
      
      if (!store) {
        throw new Error(`Shopify store ${shopDomain} not found`);
      }

      const url = `https://${store.shopDomain}/admin/api/${store.apiVersion}/products/${productId}.json`;
      
      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': store.accessToken
        }
      });

      return response.data.product;
    } catch (error) {
      console.error(`Error fetching Shopify product ${productId}:`, error);
      return null;
    }
  }

  /**
   * Broadcast updates to connected WebSocket clients
   */
  private broadcastUpdate(data: any): void {
    if (!this.wss) return;
    
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

let shopifyIntegration: ShopifyIntegration | null = null;

export function initializeShopifyIntegration(wss?: WebSocketServer): ShopifyIntegration {
  if (!shopifyIntegration) {
    shopifyIntegration = new ShopifyIntegration(wss);
    shopifyIntegration.initialize();
  }
  return shopifyIntegration;
}

export function getShopifyIntegration(): ShopifyIntegration {
  if (!shopifyIntegration) {
    throw new Error('Shopify integration not initialized');
  }
  return shopifyIntegration;
}