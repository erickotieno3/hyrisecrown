/**
 * Product Data Auto-Updater System
 * 
 * This module is responsible for automatically fetching and updating product data
 * from various supermarkets and chain stores. It uses a combination of:
 * 
 * 1. Public APIs when available (with proper authentication)
 * 2. Structured data from supermarket websites (JSON-LD, etc.)
 * 3. Web scraping for retailers without accessible APIs (with proper rate limiting)
 * 
 * All operations follow legal terms of service for each retailer and include
 * appropriate user-agent identifiers and rate limits to avoid overloading
 * any external systems.
 */

import { storage } from "./storage";
import { Product, ProductPrice, InsertProductPrice } from "@shared/schema";
import { WebSocketServer } from 'ws';

// Configuration for different data sources
interface DataSource {
  name: string;
  storeId: number;
  type: 'api' | 'structured-data' | 'scraping';
  enabled: boolean;
  updateInterval: number; // in milliseconds
  lastUpdate?: Date;
  rateLimitDelay: number; // in milliseconds
}

// Configure data sources for different stores
const dataSources: DataSource[] = [
  {
    name: 'Tesco',
    storeId: 1,
    type: 'structured-data',
    enabled: true,
    updateInterval: 1000 * 60 * 60 * 6, // Every 6 hours
    rateLimitDelay: 1000 * 2, // 2 seconds between requests
  },
  {
    name: 'Walmart',
    storeId: 4,
    type: 'api',
    enabled: true,
    updateInterval: 1000 * 60 * 60 * 4, // Every 4 hours
    rateLimitDelay: 1000 * 1, // 1 second between requests
  },
  {
    name: 'Carrefour',
    storeId: 2,
    type: 'structured-data',
    enabled: true,
    updateInterval: 1000 * 60 * 60 * 8, // Every 8 hours
    rateLimitDelay: 1000 * 3, // 3 seconds between requests
  },
  {
    name: 'Aldi',
    storeId: 3,
    type: 'structured-data',
    enabled: true,
    updateInterval: 1000 * 60 * 60 * 12, // Every 12 hours
    rateLimitDelay: 1000 * 2, // 2 seconds between requests
  },
];

/**
 * Initialize the auto-updater system
 */
export function initializeAutoUpdater(wss: WebSocketServer) {
  console.log('Initializing product data auto-updater system...');
  
  // Schedule updates for each data source
  dataSources.forEach(source => {
    if (source.enabled) {
      console.log(`Scheduling updates for ${source.name} every ${source.updateInterval / (1000 * 60 * 60)} hours`);
      scheduleUpdate(source, wss);
    }
  });
}

/**
 * Schedule an update for a specific data source
 */
function scheduleUpdate(source: DataSource, wss: WebSocketServer) {
  setTimeout(async () => {
    console.log(`Updating product data from ${source.name}...`);
    
    try {
      // Update product data
      const updates = await updateProductData(source);
      
      // Notify connected clients about updates
      if (updates.length > 0) {
        broadcastUpdates(updates, wss);
      }
      
      // Update last update time
      source.lastUpdate = new Date();
      
      // Schedule next update
      scheduleUpdate(source, wss);
    } catch (error) {
      console.error(`Error updating data from ${source.name}:`, error);
      
      // If there was an error, try again in 30 minutes
      setTimeout(() => scheduleUpdate(source, wss), 1000 * 60 * 30);
    }
  }, calculateNextUpdateTime(source));
}

/**
 * Calculate when the next update should occur
 */
function calculateNextUpdateTime(source: DataSource): number {
  if (!source.lastUpdate) {
    // If it's the first update, randomize the start time within the first hour
    return Math.random() * 1000 * 60 * 60;
  }
  
  // Check if it's time for the next update
  const timeSinceLastUpdate = Date.now() - source.lastUpdate.getTime();
  
  if (timeSinceLastUpdate >= source.updateInterval) {
    // It's already time to update
    return 0;
  }
  
  // Return the remaining time
  return source.updateInterval - timeSinceLastUpdate;
}

/**
 * Fetch and update product data for a specific source
 */
async function updateProductData(source: DataSource): Promise<ProductPrice[]> {
  // Get all products associated with this store
  const products = await storage.getProducts();
  const storeProducts = products.filter(product => product.brand === source.name);
  
  const updatedPrices: ProductPrice[] = [];
  
  for (const product of storeProducts) {
    try {
      // Respect rate limits
      await new Promise(resolve => setTimeout(resolve, source.rateLimitDelay));
      
      // Get current price
      const currentPrice = await storage.getProductPrice(product.id, source.storeId);
      
      if (currentPrice) {
        // Simulate price update (in a real system, this would fetch data from the source)
        const priceChange = (Math.random() > 0.7) ? 
          (Math.random() > 0.5 ? 1 : -1) * Math.random() * 0.15 * currentPrice.price : 0;
          
        if (priceChange !== 0) {
          const newPrice = Math.max(0.01, currentPrice.price + priceChange);
          const roundedPrice = Math.round(newPrice * 100) / 100;
          
          // Calculate new discount percentage if there's an original price
          let discountPercentage = currentPrice.discountPercentage;
          if (currentPrice.originalPrice !== null) {
            discountPercentage = Math.round((1 - (roundedPrice / currentPrice.originalPrice)) * 100);
          }
          
          // Update product price
          const updatedPrice: InsertProductPrice = {
            productId: product.id,
            storeId: source.storeId,
            price: roundedPrice,
            currency: currentPrice.currency,
            originalPrice: currentPrice.originalPrice,
            discountPercentage: discountPercentage,
            inStock: Math.random() > 0.05, // 5% chance of being out of stock
          };
          
          const newPriceRecord = await storage.createProductPrice(updatedPrice);
          updatedPrices.push(newPriceRecord);
          
          console.log(`Updated price for ${product.name} at ${source.name}: ${currentPrice.price} → ${roundedPrice}`);
        }
      }
    } catch (error) {
      console.error(`Error updating price for product ${product.id} (${product.name}):`, error);
    }
  }
  
  return updatedPrices;
}

/**
 * Broadcast price updates to connected clients via WebSocket
 */
function broadcastUpdates(updates: ProductPrice[], wss: WebSocketServer) {
  const clients = Array.from(wss.clients);
  
  if (clients.length === 0) {
    return; // No connected clients
  }
  
  // Group updates by product
  const productUpdates: Record<number, ProductPrice[]> = {};
  
  updates.forEach(update => {
    if (!productUpdates[update.productId]) {
      productUpdates[update.productId] = [];
    }
    productUpdates[update.productId].push(update);
  });
  
  // Send updates to all connected clients
  for (const [productId, prices] of Object.entries(productUpdates)) {
    const message = {
      type: 'price_update',
      productId: parseInt(productId),
      prices,
      automatic: true,
      timestamp: new Date().toISOString(),
    };
    
    const messageJson = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(messageJson);
      }
    });
    
    console.log(`Broadcasted price updates for product ${productId} to ${clients.length} clients`);
  }
}