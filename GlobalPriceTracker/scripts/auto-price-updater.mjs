/**
 * Automatic Price & Stock Update Service
 * Periodically updates product prices, stock levels, and market data
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new Anthropic();

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  stock: number;
  store: string;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  priceHistory: Array<{ date: string; price: number }>;
}

interface MarketData {
  timestamp: string;
  averagePrice: number;
  highestPrice: number;
  lowestPrice: number;
  totalProducts: number;
  topCategories: Category[];
}

interface Category {
  name: string;
  productCount: number;
  averagePrice: number;
}

class PriceStockUpdater {
  private dataDir = path.join(__dirname, '..', 'data');
  private productsFile = path.join(this.dataDir, 'products.json');
  private marketDataFile = path.join(this.dataDir, 'market-data.json');

  constructor() {
    this.ensureDataDirectory();
  }

  /**
   * Ensure data directory exists
   */
  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Generate realistic price update
   */
  private async generatePriceUpdate(product: Product): Promise<{ newPrice: number; trend: 'up' | 'down' | 'stable' }> {
    // Simulate price movement (±5%)
    const change = (Math.random() - 0.5) * 0.1; // -5% to +5%
    const newPrice = Math.round(product.price * (1 + change) * 100) / 100;
    const trend = newPrice > product.price ? 'up' : newPrice < product.price ? 'down' : 'stable';

    return { newPrice, trend };
  }

  /**
   * Update stock levels
   */
  private async updateStockLevel(product: Product): Promise<number> {
    // Simulate stock changes based on sales (reduce by 0-10%)
    const sold = Math.floor(Math.random() * product.stock * 0.1);
    const restocked = Math.floor(Math.random() * 50); // Random restock 0-50 units
    const newStock = Math.max(0, product.stock - sold + restocked);

    return newStock;
  }

  /**
   * Load existing products
   */
  private loadProducts(): Product[] {
    if (!fs.existsSync(this.productsFile)) {
      return this.generateSampleProducts();
    }

    try {
      const data = fs.readFileSync(this.productsFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return this.generateSampleProducts();
    }
  }

  /**
   * Generate sample products
   */
  private generateSampleProducts(): Product[] {
    const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books'];
    const stores = ['Amazon', 'eBay', 'Walmart', 'Target', 'Best Buy'];
    const products: Product[] = [];

    for (let i = 1; i <= 50; i++) {
      const basePrice = Math.floor(Math.random() * 1000) + 10;
      const discount = Math.floor(Math.random() * 50);

      products.push({
        id: `PROD-${String(i).padStart(5, '0')}`,
        name: `Product ${i}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        price: Math.round(basePrice * (1 - discount / 100) * 100) / 100,
        originalPrice: basePrice,
        discount,
        stock: Math.floor(Math.random() * 500),
        store: stores[Math.floor(Math.random() * stores.length)],
        lastUpdated: new Date().toISOString(),
        trend: 'stable',
        priceHistory: [{ date: new Date().toISOString(), price: basePrice }]
      });
    }

    return products;
  }

  /**
   * Update all products
   */
  async updateAllProducts(): Promise<Product[]> {
    const products = this.loadProducts();

    for (const product of products) {
      // Update price
      const { newPrice, trend } = await this.generatePriceUpdate(product);
      product.price = newPrice;
      product.trend = trend;

      // Update stock
      product.stock = await this.updateStockLevel(product);

      // Update timestamp
      product.lastUpdated = new Date().toISOString();

      // Add to price history
      product.priceHistory.push({
        date: new Date().toISOString(),
        price: newPrice
      });

      // Keep only last 30 days of history
      if (product.priceHistory.length > 30) {
        product.priceHistory = product.priceHistory.slice(-30);
      }

      // Recalculate discount
      product.discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }

    // Save updated products
    fs.writeFileSync(this.productsFile, JSON.stringify(products, null, 2));
    console.log(`✅ Updated ${products.length} products`);

    return products;
  }

  /**
   * Generate market data
   */
  private generateMarketData(products: Product[]): MarketData {
    const categories = new Map<string, Category>();

    // Calculate category stats
    for (const product of products) {
      const category = categories.get(product.category) || {
        name: product.category,
        productCount: 0,
        averagePrice: 0
      };

      category.productCount += 1;
      category.averagePrice += product.price;

      categories.set(product.category, category);
    }

    // Calculate final averages
    for (const category of categories.values()) {
      category.averagePrice = Math.round(category.averagePrice / category.productCount * 100) / 100;
    }

    const prices = products.map(p => p.price);
    const marketData: MarketData = {
      timestamp: new Date().toISOString(),
      averagePrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 100) / 100,
      highestPrice: Math.max(...prices),
      lowestPrice: Math.min(...prices),
      totalProducts: products.length,
      topCategories: Array.from(categories.values())
        .sort((a, b) => b.productCount - a.productCount)
        .slice(0, 5)
    };

    return marketData;
  }

  /**
   * Update market data
   */
  async updateMarketData(products: Product[]): Promise<MarketData> {
    const marketData = this.generateMarketData(products);

    // Load existing market data and append
    let allMarketData: MarketData[] = [];
    if (fs.existsSync(this.marketDataFile)) {
      try {
        const data = fs.readFileSync(this.marketDataFile, 'utf-8');
        allMarketData = JSON.parse(data);
      } catch {
        allMarketData = [];
      }
    }

    allMarketData.push(marketData);

    // Keep only last 90 days of data
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    allMarketData = allMarketData.filter(
      d => new Date(d.timestamp) > ninetyDaysAgo
    );

    fs.writeFileSync(this.marketDataFile, JSON.stringify(allMarketData, null, 2));
    console.log(`✅ Market data updated (${allMarketData.length} records)`);

    return marketData;
  }

  /**
   * Generate update summary
   */
  generateSummary(products: Product[]): void {
    const topGainers = products
      .filter(p => p.trend === 'up')
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 5);

    const topDroppers = products
      .filter(p => p.trend === 'down')
      .sort((a, b) => a.discount - b.discount)
      .slice(0, 5);

    const lowStock = products
      .filter(p => p.stock < 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

    console.log('\n📊 Update Summary:');
    console.log(`Total Products: ${products.length}`);
    console.log(`Price Increases: ${products.filter(p => p.trend === 'up').length}`);
    console.log(`Price Decreases: ${products.filter(p => p.trend === 'down').length}`);
    console.log(`Out of Stock: ${products.filter(p => p.stock === 0).length}`);
    console.log(`Low Stock (<10): ${lowStock.length}`);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting Price & Stock Auto-Update...\n');

    const updater = new PriceStockUpdater();

    // Update all products
    const updatedProducts = await updater.updateAllProducts();

    // Update market data
    const marketData = await updater.updateMarketData(updatedProducts);
    console.log(`📈 Market Average Price: $${marketData.averagePrice}`);
    console.log(`📊 High: $${marketData.highestPrice}, Low: $${marketData.lowestPrice}`);

    // Generate summary
    updater.generateSummary(updatedProducts);

    console.log('\n🎉 Price & Stock Update Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
