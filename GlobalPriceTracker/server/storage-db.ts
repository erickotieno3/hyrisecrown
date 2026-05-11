import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";
import { IStorage } from "./storage";
import {
  countries,
  stores,
  categories,
  products,
  productPrices,
  newsletterSubscribers,
  languages,
  blogPosts,
  autoPilotConfig,
  autoPilotLogs,
  type Country,
  type InsertCountry,
  type Store,
  type InsertStore,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type ProductPrice,
  type InsertProductPrice,
  type NewsletterSubscriber,
  type InsertNewsletterSubscriber,
  type Language,
  type InsertLanguage,
  type ProductWithPrices,
  type StoreWithCountry,
  type CountryWithStores,
  type BlogPost,
  type InsertBlogPost,
  type AutoPilotConfig,
  type InsertAutoPilotConfig,
  type AutoPilotLog,
  type InsertAutoPilotLog,
} from "@shared/schema";

// Types for AI features
interface UserPreferences {
  id: string;
  preferredCategories: string[];
  preferredStores: string[];
  priceAlertThreshold: number;
  interests: string[];
}

interface ShoppingHistoryItem {
  productId: number;
  productName: string;
  storeName: string;
  price: number;
  purchaseDate: Date;
  quantity: number;
}

interface PriceInsight {
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  priceVolatility: number;
  bestStoreToBuy: string;
  bestDayToBuy: string;
  isTrendingDown: boolean;
}

interface ProductComparison {
  categories: string[];
  priceDifference: number;
  cheaperOption: string;
  featureComparison: Record<string, any>;
  overallRecommendation: string;
}

interface ShoppingGuide {
  recommendedProducts: any[];
  savingTips: string[];
  bestStores: string[];
  weeklyPlan: any;
}

export class DatabaseStorage implements IStorage {
  async getCountries(): Promise<Country[]> {
    return await db.select().from(countries);
  }
  
  async getCountry(id: number): Promise<Country | undefined> {
    const [country] = await db.select().from(countries).where(eq(countries.id, id));
    return country;
  }
  
  async getCountryByCode(code: string): Promise<Country | undefined> {
    const [country] = await db.select().from(countries).where(eq(countries.code, code));
    return country;
  }
  
  async createCountry(country: InsertCountry): Promise<Country> {
    const [newCountry] = await db.insert(countries).values(country).returning();
    return newCountry;
  }
  
  async getActiveCountries(): Promise<Country[]> {
    return await db
      .select()
      .from(countries)
      .where(eq(countries.active, true))
      .orderBy(countries.displayOrder);
  }
  
  async getComingSoonCountries(): Promise<Country[]> {
    return await db
      .select()
      .from(countries)
      .where(eq(countries.comingSoon, true))
      .orderBy(countries.displayOrder);
  }
  
  async getStores(): Promise<Store[]> {
    return await db.select().from(stores);
  }
  
  async getStore(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }
  
  async getStoresByCountry(countryId: number): Promise<Store[]> {
    return await db
      .select()
      .from(stores)
      .where(eq(stores.countryId, countryId))
      .orderBy(stores.displayOrder);
  }
  
  async createStore(store: InsertStore): Promise<Store> {
    const [newStore] = await db.insert(stores).values(store).returning();
    return newStore;
  }
  
  async getFeaturedStores(): Promise<StoreWithCountry[]> {
    const featuredStores = await db.select().from(stores).limit(8);
    
    return await Promise.all(
      featuredStores.map(async (store) => {
        const country = await this.getCountry(store.countryId);
        return {
          ...store,
          country: country!
        };
      })
    );
  }
  
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }
  
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  
  async getTrendingProducts(limit: number = 4): Promise<ProductWithPrices[]> {
    const featuredProducts = await db
      .select()
      .from(products)
      .where(eq(products.featured, true))
      .limit(limit);
    
    return await Promise.all(
      featuredProducts.map(async (product) => {
        const productPricesWithStores = await this.compareProductPrices(product.id);
        const category = await this.getCategory(product.categoryId);
        
        return {
          ...product,
          prices: productPricesWithStores,
          category: category!
        };
      })
    );
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return await db
      .select()
      .from(products)
      .where(
        sql`LOWER(${products.name}) LIKE ${`%${lowerQuery}%`} OR LOWER(${products.description}) LIKE ${`%${lowerQuery}%`}`
      );
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true));
  }
  
  async getProductPrices(productId: number): Promise<ProductPrice[]> {
    return await db.select().from(productPrices).where(eq(productPrices.productId, productId));
  }
  
  async getProductPrice(productId: number, storeId: number): Promise<ProductPrice | undefined> {
    const [price] = await db
      .select()
      .from(productPrices)
      .where(
        and(
          eq(productPrices.productId, productId),
          eq(productPrices.storeId, storeId)
        )
      );
    return price;
  }
  
  async createProductPrice(productPrice: InsertProductPrice): Promise<ProductPrice> {
    const [newProductPrice] = await db.insert(productPrices).values(productPrice).returning();
    return newProductPrice;
  }
  
  async compareProductPrices(productId: number): Promise<(ProductPrice & { store: Store })[]> {
    const prices = await this.getProductPrices(productId);
    
    return await Promise.all(
      prices.map(async (price) => {
        const store = await this.getStore(price.storeId);
        return { ...price, store: store! };
      })
    );
  }
  
  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [newSubscriber] = await db
      .insert(newsletterSubscribers)
      .values(subscriber)
      .returning();
    return newSubscriber;
  }
  
  async getLanguages(): Promise<Language[]> {
    return await db.select().from(languages);
  }
  
  async getActiveLanguages(): Promise<Language[]> {
    return await db.select().from(languages).where(eq(languages.active, true));
  }
  
  async getLanguage(id: number): Promise<Language | undefined> {
    const [language] = await db.select().from(languages).where(eq(languages.id, id));
    return language;
  }
  
  async getLanguageByCode(code: string): Promise<Language | undefined> {
    const [language] = await db.select().from(languages).where(eq(languages.code, code));
    return language;
  }
  
  async createLanguage(language: InsertLanguage): Promise<Language> {
    const [newLanguage] = await db.insert(languages).values(language).returning();
    return newLanguage;
  }

  // Blog post methods
  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts);
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(blogPost).returning();
    return newPost;
  }

  async getBlogPostsByCategory(categoryId: number): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.categoryId, categoryId), 
          eq(blogPosts.isPublished, true)
        )
      )
      .orderBy(desc(blogPosts.publishedDate));
  }

  async getRecentBlogPosts(limit: number = 5): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedDate))
      .limit(limit);
  }

  // Auto-pilot configuration methods
  async getAutoPilotConfigs(): Promise<AutoPilotConfig[]> {
    return await db.select().from(autoPilotConfig);
  }

  async getAutoPilotConfig(id: number): Promise<AutoPilotConfig | undefined> {
    const [config] = await db.select().from(autoPilotConfig).where(eq(autoPilotConfig.id, id));
    return config;
  }

  async getAutoPilotConfigByFeature(feature: string): Promise<AutoPilotConfig | undefined> {
    const [config] = await db.select().from(autoPilotConfig).where(eq(autoPilotConfig.feature, feature));
    return config;
  }

  async createAutoPilotConfig(config: InsertAutoPilotConfig): Promise<AutoPilotConfig> {
    const [newConfig] = await db.insert(autoPilotConfig).values(config).returning();
    return newConfig;
  }

  async updateAutoPilotConfig(id: number, updates: Partial<AutoPilotConfig>): Promise<AutoPilotConfig> {
    const [updatedConfig] = await db
      .update(autoPilotConfig)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(autoPilotConfig.id, id))
      .returning();
    
    if (!updatedConfig) {
      throw new Error(`Auto-pilot config with ID ${id} not found`);
    }
    
    return updatedConfig;
  }

  async getEnabledAutoPilotConfigs(): Promise<AutoPilotConfig[]> {
    return await db
      .select()
      .from(autoPilotConfig)
      .where(eq(autoPilotConfig.isEnabled, true));
  }

  // Auto-pilot logs methods
  async getAutoPilotLogs(): Promise<AutoPilotLog[]> {
    return await db
      .select()
      .from(autoPilotLogs)
      .orderBy(desc(autoPilotLogs.startTime));
  }

  async getAutoPilotLog(id: number): Promise<AutoPilotLog | undefined> {
    const [log] = await db.select().from(autoPilotLogs).where(eq(autoPilotLogs.id, id));
    return log;
  }

  async createAutoPilotLog(log: InsertAutoPilotLog): Promise<AutoPilotLog> {
    const [newLog] = await db.insert(autoPilotLogs).values(log).returning();
    return newLog;
  }

  async updateAutoPilotLog(id: number, updates: Partial<AutoPilotLog>): Promise<AutoPilotLog> {
    const [updatedLog] = await db
      .update(autoPilotLogs)
      .set(updates)
      .where(eq(autoPilotLogs.id, id))
      .returning();
    
    if (!updatedLog) {
      throw new Error(`Auto-pilot log with ID ${id} not found`);
    }
    
    return updatedLog;
  }

  async getAutoPilotLogsByFeature(featureId: number): Promise<AutoPilotLog[]> {
    return await db
      .select()
      .from(autoPilotLogs)
      .where(eq(autoPilotLogs.featureId, featureId))
      .orderBy(desc(autoPilotLogs.startTime));
  }

  // ------------- AI SERVICES METHODS ------------- //

  // Get recommended products based on category or related product
  async getRecommendedProducts(categoryName?: string, relatedProductId?: number): Promise<Product[]> {
    try {
      if (relatedProductId) {
        // Get related products based on same category
        const product = await this.getProduct(relatedProductId);
        if (product) {
          return await db
            .select()
            .from(products)
            .where(
              and(
                eq(products.categoryId, product.categoryId),
                sql`${products.id} != ${relatedProductId}`
              )
            )
            .limit(5);
        }
      }
      
      if (categoryName) {
        // Search for category by name if it's a string
        const lowerCategoryName = categoryName.toLowerCase();
        const [category] = await db
          .select()
          .from(categories)
          .where(sql`LOWER(${categories.name}) = ${lowerCategoryName}`);
          
        if (category) {
          return await this.getProductsByCategory(category.id);
        }
      }
      
      // Fallback to featured products
      return await this.getFeaturedProducts();
    } catch (error) {
      console.error('Error getting recommended products:', error);
      return [];
    }
  }

  // Enhanced product search with AI-generated parameters
  async enhancedProductSearch(searchParams: any): Promise<Product[]> {
    try {
      // Start with a base query
      let query = db
        .select()
        .from(products);
      
      // Add filters based on searchParams
      const filters = [];
      
      // Add keyword search
      if (searchParams.keywords?.length) {
        const keywordConditions = searchParams.keywords.map((keyword: string) => 
          sql`LOWER(${products.name}) LIKE ${`%${keyword.toLowerCase()}%`} OR LOWER(${products.description}) LIKE ${`%${keyword.toLowerCase()}%`}`
        );
        
        if (keywordConditions.length > 0) {
          filters.push(sql`(${sql.join(keywordConditions, sql` OR `)})`);
        }
      }
      
      // Add category filter
      if (searchParams.mainCategory) {
        // Find category ID by name
        const lowerCategoryName = searchParams.mainCategory.toLowerCase();
        const [category] = await db
          .select()
          .from(categories)
          .where(sql`LOWER(${categories.name}) = ${lowerCategoryName}`);
          
        if (category) {
          filters.push(eq(products.categoryId, category.id));
        }
      }
      
      // Add brand filter if available
      if (searchParams.brands?.length) {
        const brandConditions = searchParams.brands.map((brand: string) => 
          sql`LOWER(${products.brand}) LIKE ${`%${brand.toLowerCase()}%`}`
        );
        
        if (brandConditions.length > 0) {
          filters.push(sql`(${sql.join(brandConditions, sql` OR `)})`);
        }
      }
      
      // Apply filters
      if (filters.length > 0) {
        query = query.where(sql.join(filters, sql` AND `));
      }
      
      // Apply sorting if specified
      if (searchParams.sortBy) {
        if (searchParams.sortBy === 'price_asc') {
          // This would be more complex in real app as prices are in another table
          // Simplified here without actual price sorting
          query = query.orderBy(products.name);
        } else if (searchParams.sortBy === 'price_desc') {
          query = query.orderBy(desc(products.name));
        } else if (searchParams.sortBy === 'name_asc') {
          query = query.orderBy(products.name);
        } else if (searchParams.sortBy === 'name_desc') {
          query = query.orderBy(desc(products.name));
        }
      }
      
      return await query.limit(20);
    } catch (error) {
      console.error('Error in enhanced product search:', error);
      return this.searchProducts(searchParams.keywords?.join(' ') || '');
    }
  }

  // Get product price history
  async getProductPriceHistory(productId: number): Promise<ProductPrice[]> {
    try {
      // In a real application, we would have a separate table for price history
      // Here we'll just return current prices as if they were history
      return await this.getProductPrices(productId);
    } catch (error) {
      console.error('Error getting product price history:', error);
      return [];
    }
  }

  // Get basic price insights without AI
  async getBasicPriceInsights(productId: number): Promise<PriceInsight> {
    try {
      const prices = await this.getProductPrices(productId);
      
      if (prices.length === 0) {
        throw new Error('No prices available for this product');
      }
      
      // Calculate some basic statistics
      const priceValues = prices.map(p => p.price);
      const avgPrice = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
      const lowestPrice = Math.min(...priceValues);
      const highestPrice = Math.max(...priceValues);
      
      // Find store with lowest price
      const lowestPriceItem = prices.find(p => p.price === lowestPrice);
      let bestStore = 'Unknown';
      
      if (lowestPriceItem) {
        const store = await this.getStore(lowestPriceItem.storeId);
        if (store) {
          bestStore = store.name;
        }
      }
      
      return {
        averagePrice: avgPrice,
        lowestPrice,
        highestPrice,
        priceVolatility: (highestPrice - lowestPrice) / avgPrice,
        bestStoreToBuy: bestStore,
        bestDayToBuy: 'Any day', // We don't have day-based data here
        isTrendingDown: false // Cannot determine trend without historical data
      };
    } catch (error) {
      console.error('Error calculating price insights:', error);
      
      return {
        averagePrice: 0,
        lowestPrice: 0,
        highestPrice: 0,
        priceVolatility: 0,
        bestStoreToBuy: 'Unknown',
        bestDayToBuy: 'Unknown',
        isTrendingDown: false
      };
    }
  }

  // Basic comparison of two products
  async getBasicProductComparison(product1Id: number, product2Id: number): Promise<ProductComparison> {
    try {
      const product1 = await this.getProduct(product1Id);
      const product2 = await this.getProduct(product2Id);
      
      if (!product1 || !product2) {
        throw new Error('One or more products not found');
      }
      
      // Get prices for both products
      const prices1 = await this.getProductPrices(product1Id);
      const prices2 = await this.getProductPrices(product2Id);
      
      // Get minimum prices for comparison
      const minPrice1 = prices1.length > 0 ? Math.min(...prices1.map(p => p.price)) : 0;
      const minPrice2 = prices2.length > 0 ? Math.min(...prices2.map(p => p.price)) : 0;
      
      // Get categories for both products
      const category1 = product1.categoryId ? await this.getCategory(product1.categoryId) : null;
      const category2 = product2.categoryId ? await this.getCategory(product2.categoryId) : null;
      
      const categories = [
        category1?.name || 'Unknown',
        category2?.name || 'Unknown'
      ].filter((value, index, self) => self.indexOf(value) === index); // Unique categories
      
      return {
        categories,
        priceDifference: Math.abs(minPrice1 - minPrice2),
        cheaperOption: minPrice1 < minPrice2 ? product1.name : minPrice2 < minPrice1 ? product2.name : 'Same price',
        featureComparison: {
          [product1.name]: { price: minPrice1, category: category1?.name || 'Unknown' },
          [product2.name]: { price: minPrice2, category: category2?.name || 'Unknown' }
        },
        overallRecommendation: minPrice1 < minPrice2 ? 
          `${product1.name} is cheaper by ${(minPrice2 - minPrice1).toFixed(2)}` : 
          `${product2.name} is cheaper by ${(minPrice1 - minPrice2).toFixed(2)}`
      };
    } catch (error) {
      console.error('Error comparing products:', error);
      
      return {
        categories: [],
        priceDifference: 0,
        cheaperOption: 'Unknown',
        featureComparison: {},
        overallRecommendation: 'Comparison failed'
      };
    }
  }

  // Get basic user preferences (mock implementation)
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    // In a real application, this would fetch from a user preferences table
    // Here we return a mock object for demonstration
    return {
      id: userId,
      preferredCategories: ['Electronics', 'Food', 'Household'],
      preferredStores: ['Tesco', 'Walmart'],
      priceAlertThreshold: 15, // Percentage
      interests: ['discounts', 'organic food', 'electronics']
    };
  }

  // Get user shopping history (mock implementation)
  async getUserShoppingHistory(userId: string): Promise<ShoppingHistoryItem[]> {
    // In a real application, this would fetch from a shopping history table
    // Here we return an empty array for demonstration
    return [];
  }

  // Get basic shopping guide (mock implementation)
  async getBasicShoppingGuide(userId: string): Promise<ShoppingGuide> {
    // In a real application, this would generate based on user data
    // Here we return a simple object for demonstration
    const featuredProducts = await this.getFeaturedProducts();
    
    return {
      recommendedProducts: featuredProducts.slice(0, 3).map(p => ({ 
        id: p.id, 
        name: p.name,
        reason: 'Popular item'
      })),
      savingTips: [
        'Compare prices across multiple stores',
        'Look for seasonal discounts'
      ],
      bestStores: ['Tesco', 'Walmart', 'Carrefour'],
      weeklyPlan: {
        Monday: 'Grocery shopping',
        Wednesday: 'Check for new deals',
        Sunday: 'Meal planning'
      }
    };
  }

  // Enhance AI recommendations with real product data
  async enhanceRecommendations(aiRecommendations: any[]): Promise<any[]> {
    try {
      if (!aiRecommendations || !Array.isArray(aiRecommendations)) {
        return [];
      }
      
      const enhancedRecommendations = [];
      
      for (const rec of aiRecommendations) {
        if (!rec.name) continue;
        
        // Try to find a matching product
        const matchingProducts = await db
          .select()
          .from(products)
          .where(sql`LOWER(${products.name}) LIKE ${`%${rec.name.toLowerCase()}%`}`)
          .limit(1);
          
        if (matchingProducts.length > 0) {
          // Found a matching product, enhance with real data
          const product = matchingProducts[0];
          const prices = await this.getProductPrices(product.id);
          const category = product.categoryId ? await this.getCategory(product.categoryId) : null;
          
          enhancedRecommendations.push({
            ...rec,
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            category: category?.name || rec.category || 'Unknown',
            price: prices.length > 0 ? Math.min(...prices.map(p => p.price)) : null,
            description: product.description,
            isRealProduct: true
          });
        } else {
          // No matching product, return as-is with flag
          enhancedRecommendations.push({
            ...rec,
            isRealProduct: false
          });
        }
      }
      
      return enhancedRecommendations;
    } catch (error) {
      console.error('Error enhancing recommendations:', error);
      return aiRecommendations;
    }
  }

  // Get a country by name
  async getCountryByName(name: string): Promise<Country | undefined> {
    const lowerName = name.toLowerCase();
    const [country] = await db
      .select()
      .from(countries)
      .where(sql`LOWER(${countries.name}) = ${lowerName}`);
      
    return country;
  }
}