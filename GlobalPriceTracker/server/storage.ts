import {
  Country,
  Store,
  Product,
  Category,
  ProductPrice,
  NewsletterSubscriber,
  Language,
  InsertCountry,
  InsertStore,
  InsertProduct,
  InsertCategory,
  InsertProductPrice,
  InsertNewsletterSubscriber,
  InsertLanguage,
  ProductWithPrices,
  StoreWithCountry,
  CountryWithStores,
  BlogPost,
  InsertBlogPost,
  AutoPilotConfig,
  InsertAutoPilotConfig,
  AutoPilotLog,
  InsertAutoPilotLog
} from "@shared/schema";

export interface IStorage {
  // Countries
  getCountries(): Promise<Country[]>;
  getCountry(id: number): Promise<Country | undefined>;
  getCountryByCode(code: string): Promise<Country | undefined>;
  createCountry(country: InsertCountry): Promise<Country>;
  getActiveCountries(): Promise<Country[]>;
  getComingSoonCountries(): Promise<Country[]>;
  
  // Stores
  getStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  getStoresByCountry(countryId: number): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;
  getFeaturedStores(): Promise<StoreWithCountry[]>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  getTrendingProducts(limit?: number): Promise<ProductWithPrices[]>;
  searchProducts(query: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  
  // Product Prices
  getProductPrices(productId: number): Promise<ProductPrice[]>;
  getProductPrice(productId: number, storeId: number): Promise<ProductPrice | undefined>;
  createProductPrice(productPrice: InsertProductPrice): Promise<ProductPrice>;
  compareProductPrices(productId: number): Promise<(ProductPrice & { store: Store })[]>;
  
  // Newsletter Subscribers
  createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  
  // Languages
  getLanguages(): Promise<Language[]>;
  getActiveLanguages(): Promise<Language[]>;
  getLanguage(id: number): Promise<Language | undefined>;
  getLanguageByCode(code: string): Promise<Language | undefined>;
  createLanguage(language: InsertLanguage): Promise<Language>;

  // Blog posts
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost>;
  getBlogPostsByCategory(categoryId: number): Promise<BlogPost[]>;
  getRecentBlogPosts(limit?: number): Promise<BlogPost[]>;
  
  // Auto-pilot configurations
  getAutoPilotConfigs(): Promise<AutoPilotConfig[]>;
  getAutoPilotConfig(id: number): Promise<AutoPilotConfig | undefined>;
  getAutoPilotConfigByFeature(feature: string): Promise<AutoPilotConfig | undefined>;
  createAutoPilotConfig(config: InsertAutoPilotConfig): Promise<AutoPilotConfig>;
  updateAutoPilotConfig(id: number, updates: Partial<AutoPilotConfig>): Promise<AutoPilotConfig>;
  getEnabledAutoPilotConfigs(): Promise<AutoPilotConfig[]>;
  
  // Auto-pilot logs
  getAutoPilotLogs(): Promise<AutoPilotLog[]>;
  getAutoPilotLog(id: number): Promise<AutoPilotLog | undefined>;
  createAutoPilotLog(log: InsertAutoPilotLog): Promise<AutoPilotLog>;
  updateAutoPilotLog(id: number, updates: Partial<AutoPilotLog>): Promise<AutoPilotLog>;
  getAutoPilotLogsByFeature(featureId: number): Promise<AutoPilotLog[]>;
}

export class MemStorage implements IStorage {
  private countries: Map<number, Country>;
  private stores: Map<number, Store>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private productPrices: Map<string, ProductPrice>; // productId-storeId composite key
  private newsletterSubscribers: Map<number, NewsletterSubscriber>;
  private languages: Map<number, Language>;
  private blogPosts: Map<number, BlogPost>;
  private autoPilotConfigs: Map<number, AutoPilotConfig>;
  private autoPilotLogs: Map<number, AutoPilotLog>;
  
  private countryId: number;
  private storeId: number;
  private categoryId: number;
  private productId: number;
  private productPriceId: number;
  private subscriberId: number;
  private languageId: number;
  private blogPostId: number;
  private autoPilotConfigId: number;
  private autoPilotLogId: number;

  constructor() {
    this.countries = new Map();
    this.stores = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.productPrices = new Map();
    this.newsletterSubscribers = new Map();
    this.languages = new Map();
    this.blogPosts = new Map();
    this.autoPilotConfigs = new Map();
    this.autoPilotLogs = new Map();
    
    this.countryId = 1;
    this.storeId = 1;
    this.categoryId = 1;
    this.productId = 1;
    this.productPriceId = 1;
    this.subscriberId = 1;
    this.languageId = 1;
    this.blogPostId = 1;
    this.autoPilotConfigId = 1;
    this.autoPilotLogId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize languages
    const languages: InsertLanguage[] = [
      { code: "en", name: "English", nativeName: "English", active: true },
      { code: "sw", name: "Swahili", nativeName: "Kiswahili", active: true },
      { code: "fr", name: "French", nativeName: "Français", active: true },
      { code: "de", name: "German", nativeName: "Deutsch", active: true },
      { code: "ar", name: "Arabic", nativeName: "العربية", active: true },
    ];
    
    languages.forEach(lang => this.createLanguage(lang));
    
    // Initialize countries
    const countries: InsertCountry[] = [
      { name: "United Kingdom", code: "UK", flagUrl: "/flags/uk.svg", continent: "Europe", active: true, comingSoon: false, displayOrder: 1 },
      { name: "Kenya", code: "KE", flagUrl: "/flags/ke.svg", continent: "Africa", active: true, comingSoon: false, displayOrder: 2 },
      { name: "Uganda", code: "UG", flagUrl: "/flags/ug.svg", continent: "Africa", active: true, comingSoon: false, displayOrder: 3 },
      { name: "Tanzania", code: "TZ", flagUrl: "/flags/tz.svg", continent: "Africa", active: true, comingSoon: false, displayOrder: 4 },
      { name: "South Africa", code: "ZA", flagUrl: "/flags/za.svg", continent: "Africa", active: true, comingSoon: false, displayOrder: 5 },
      { name: "Germany", code: "DE", flagUrl: "/flags/de.svg", continent: "Europe", active: true, comingSoon: false, displayOrder: 6 },
      { name: "Italy", code: "IT", flagUrl: "/flags/it.svg", continent: "Europe", active: true, comingSoon: false, displayOrder: 7 },
      { name: "France", code: "FR", flagUrl: "/flags/fr.svg", continent: "Europe", active: true, comingSoon: false, displayOrder: 8 },
      { name: "United States", code: "US", flagUrl: "/flags/us.svg", continent: "North America", active: true, comingSoon: false, displayOrder: 9 },
      { name: "Canada", code: "CA", flagUrl: "/flags/ca.svg", continent: "North America", active: true, comingSoon: false, displayOrder: 10 },
      { name: "Australia", code: "AU", flagUrl: "/flags/au.svg", continent: "Oceania", active: true, comingSoon: false, displayOrder: 11 },
      // Coming soon countries
      { name: "Nigeria", code: "NG", flagUrl: "/flags/ng.svg", continent: "Africa", active: false, comingSoon: true, displayOrder: 12 },
      { name: "Ghana", code: "GH", flagUrl: "/flags/gh.svg", continent: "Africa", active: false, comingSoon: true, displayOrder: 13 },
      { name: "Spain", code: "ES", flagUrl: "/flags/es.svg", continent: "Europe", active: false, comingSoon: true, displayOrder: 14 },
      { name: "Japan", code: "JP", flagUrl: "/flags/jp.svg", continent: "Asia", active: false, comingSoon: true, displayOrder: 15 },
    ];
    
    const countryEntities = countries.map(country => this.createCountry(country));
    
    // Initialize stores
    const stores: InsertStore[] = [
      { name: "Tesco", logoUrl: "/logos/tesco.svg", countryId: 1, active: true, displayOrder: 1 },
      { name: "Carrefour", logoUrl: "/logos/carrefour.svg", countryId: 2, active: true, displayOrder: 1 },
      { name: "Aldi", logoUrl: "/logos/aldi.svg", countryId: 6, active: true, displayOrder: 1 },
      { name: "Walmart", logoUrl: "/logos/walmart.svg", countryId: 9, active: true, displayOrder: 1 },
      { name: "Nakumatt", logoUrl: "/logos/nakumatt.svg", countryId: 2, active: true, displayOrder: 2 },
      { name: "Woolworths", logoUrl: "/logos/woolworths.svg", countryId: 5, active: true, displayOrder: 1 },
      { name: "Coles", logoUrl: "/logos/coles.svg", countryId: 11, active: true, displayOrder: 1 },
      { name: "Sainsbury's", logoUrl: "/logos/sainsburys.svg", countryId: 1, active: true, displayOrder: 2 },
      { name: "Lidl", logoUrl: "/logos/lidl.svg", countryId: 6, active: true, displayOrder: 2 },
      { name: "Carrefour", logoUrl: "/logos/carrefour.svg", countryId: 8, active: true, displayOrder: 1 },
    ];
    
    stores.forEach(store => this.createStore(store));
    
    // Initialize categories
    const categories: InsertCategory[] = [
      { name: "Groceries", description: "Food and household items", imageUrl: "/categories/groceries.svg", displayOrder: 1 },
      { name: "Fresh Food", description: "Fresh fruits, vegetables and meat", imageUrl: "/categories/fresh-food.svg", displayOrder: 2 },
      { name: "Beverages", description: "Drinks and liquids", imageUrl: "/categories/beverages.svg", displayOrder: 3 },
      { name: "Household", description: "Cleaning and household products", imageUrl: "/categories/household.svg", displayOrder: 4 },
      { name: "Health & Beauty", description: "Personal care and beauty products", imageUrl: "/categories/health-beauty.svg", displayOrder: 5 },
    ];
    
    categories.forEach(category => this.createCategory(category));
    
    // Initialize products
    const products: InsertProduct[] = [
      { name: "Organic Breakfast Cereal Variety Pack", description: "A variety pack of organic breakfast cereals", imageUrl: "/products/cereal.jpg", categoryId: 1, brand: "Tesco", active: true, featured: true },
      { name: "Premium Ground Coffee 250g", description: "Premium ground coffee beans", imageUrl: "/products/coffee.jpg", categoryId: 3, brand: "Carrefour", active: true, featured: true },
      { name: "Organic Semi-Skimmed Milk 1L", description: "Organic semi-skimmed milk", imageUrl: "/products/milk.jpg", categoryId: 3, brand: "Aldi", active: true, featured: true },
      { name: "Fresh Mixed Fruit Pack 500g", description: "Mix of fresh seasonal fruits", imageUrl: "/products/fruits.jpg", categoryId: 2, brand: "Walmart", active: true, featured: true },
      { name: "Basmati Rice 1kg", description: "Long grain aromatic rice, perfect for curries and pilaf", imageUrl: "/products/rice.jpg", categoryId: 1, brand: "Tesco", active: true, featured: false },
      
      // Walmart products
      { name: "Great Value Whole Milk", description: "Fresh whole milk", imageUrl: "/products/whole-milk.jpg", categoryId: 3, brand: "Walmart", active: true, featured: true },
      { name: "Great Value White Bread", description: "Freshly baked white bread", imageUrl: "/products/white-bread.jpg", categoryId: 1, brand: "Walmart", active: true, featured: false },
      { name: "Great Value Chicken Breast", description: "Fresh boneless chicken breast", imageUrl: "/products/chicken.jpg", categoryId: 2, brand: "Walmart", active: true, featured: true },
      { name: "Great Value Toilet Paper", description: "Soft and strong toilet paper", imageUrl: "/products/toilet-paper.jpg", categoryId: 4, brand: "Walmart", active: true, featured: false },
      { name: "Great Value Dishwashing Liquid", description: "Cleans tough grease and food", imageUrl: "/products/dish-soap.jpg", categoryId: 4, brand: "Walmart", active: true, featured: false },
    ];
    
    products.forEach(product => this.createProduct(product));
    
    // Initialize product prices
    const productPrices: InsertProductPrice[] = [
      // Cereal prices
      { productId: 1, storeId: 1, price: 3.75, currency: "GBP", originalPrice: 5.00, discountPercentage: 25, inStock: true },
      { productId: 1, storeId: 2, price: 4.50, currency: "EUR", originalPrice: 5.00, discountPercentage: 10, inStock: true },
      { productId: 1, storeId: 3, price: 4.00, currency: "EUR", originalPrice: 4.50, discountPercentage: 11, inStock: true },
      { productId: 1, storeId: 4, price: 4.99, currency: "USD", originalPrice: 5.99, discountPercentage: 17, inStock: true },
      
      // Coffee prices
      { productId: 2, storeId: 1, price: 4.50, currency: "GBP", originalPrice: 5.00, discountPercentage: 10, inStock: true },
      { productId: 2, storeId: 2, price: 4.25, currency: "EUR", originalPrice: 5.00, discountPercentage: 15, inStock: true },
      { productId: 2, storeId: 3, price: 4.75, currency: "EUR", originalPrice: 5.50, discountPercentage: 14, inStock: true },
      
      // Milk prices
      { productId: 3, storeId: 1, price: 1.20, currency: "GBP", originalPrice: 1.40, discountPercentage: 14, inStock: true },
      { productId: 3, storeId: 3, price: 0.99, currency: "EUR", originalPrice: 1.25, discountPercentage: 21, inStock: true },
      { productId: 3, storeId: 4, price: 1.49, currency: "USD", originalPrice: 1.79, discountPercentage: 17, inStock: true },
      
      // Fruits prices
      { productId: 4, storeId: 1, price: 2.99, currency: "GBP", originalPrice: 3.99, discountPercentage: 25, inStock: true },
      { productId: 4, storeId: 4, price: 2.49, currency: "USD", originalPrice: 3.99, discountPercentage: 38, inStock: true },
      
      // Rice prices
      { productId: 5, storeId: 1, price: 1.80, currency: "GBP", originalPrice: null, discountPercentage: null, inStock: true },
      { productId: 5, storeId: 3, price: 2.15, currency: "EUR", originalPrice: null, discountPercentage: null, inStock: true },
      { productId: 5, storeId: 2, price: 2.49, currency: "EUR", originalPrice: null, discountPercentage: null, inStock: true },
      { productId: 5, storeId: 4, price: 2.99, currency: "USD", originalPrice: null, discountPercentage: null, inStock: false },
      
      // Walmart Great Value Whole Milk prices
      { productId: 6, storeId: 4, price: 3.27, currency: "USD", originalPrice: 3.78, discountPercentage: 13, inStock: true },
      
      // Walmart Great Value White Bread prices
      { productId: 7, storeId: 4, price: 0.88, currency: "USD", originalPrice: 1.00, discountPercentage: 12, inStock: true },
      
      // Walmart Great Value Chicken Breast prices
      { productId: 8, storeId: 4, price: 2.97, currency: "USD", originalPrice: 3.48, discountPercentage: 15, inStock: true },
      
      // Walmart Great Value Toilet Paper prices
      { productId: 9, storeId: 4, price: 4.97, currency: "USD", originalPrice: 5.97, discountPercentage: 17, inStock: true },
      
      // Walmart Great Value Dishwashing Liquid prices
      { productId: 10, storeId: 4, price: 1.97, currency: "USD", originalPrice: 2.27, discountPercentage: 13, inStock: true },
    ];
    
    productPrices.forEach(price => this.createProductPrice(price));
  }

  // Country methods
  async getCountries(): Promise<Country[]> {
    return Array.from(this.countries.values());
  }

  async getCountry(id: number): Promise<Country | undefined> {
    return this.countries.get(id);
  }

  async getCountryByCode(code: string): Promise<Country | undefined> {
    return Array.from(this.countries.values()).find(
      (country) => country.code.toLowerCase() === code.toLowerCase(),
    );
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    const id = this.countryId++;
    const newCountry: Country = { ...country, id };
    this.countries.set(id, newCountry);
    return newCountry;
  }

  async getActiveCountries(): Promise<Country[]> {
    return Array.from(this.countries.values()).filter(country => country.active).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getComingSoonCountries(): Promise<Country[]> {
    return Array.from(this.countries.values()).filter(country => country.comingSoon).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  // Store methods
  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async getStoresByCountry(countryId: number): Promise<Store[]> {
    return Array.from(this.stores.values())
      .filter(store => store.countryId === countryId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async createStore(store: InsertStore): Promise<Store> {
    const id = this.storeId++;
    const newStore: Store = { ...store, id };
    this.stores.set(id, newStore);
    return newStore;
  }

  async getFeaturedStores(): Promise<StoreWithCountry[]> {
    const storesArray = Array.from(this.stores.values());
    const featuredStores: StoreWithCountry[] = [];
    
    for (const store of storesArray) {
      const country = await this.getCountry(store.countryId);
      if (country) {
        featuredStores.push({
          ...store,
          country,
        });
      }
    }
    
    return featuredStores.slice(0, 8);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId,
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async getTrendingProducts(limit: number = 4): Promise<ProductWithPrices[]> {
    const products = Array.from(this.products.values())
      .filter(product => product.featured)
      .slice(0, limit);
    
    const productsWithPrices: ProductWithPrices[] = [];
    
    for (const product of products) {
      const prices = await this.getProductPrices(product.id);
      const category = await this.getCategory(product.categoryId);
      
      if (category) {
        const pricesWithStores = await Promise.all(
          prices.map(async (price) => {
            const store = await this.getStore(price.storeId);
            return {
              ...price,
              store: store!,
            };
          })
        );
        
        productsWithPrices.push({
          ...product,
          prices: pricesWithStores,
          category,
        });
      }
    }
    
    return productsWithPrices;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) => product.name.toLowerCase().includes(lowerQuery) || 
                  (product.description && product.description.toLowerCase().includes(lowerQuery)) ||
                  (product.brand && product.brand.toLowerCase().includes(lowerQuery))
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.featured);
  }

  // Product Price methods
  async getProductPrices(productId: number): Promise<ProductPrice[]> {
    return Array.from(this.productPrices.values()).filter(
      (price) => price.productId === productId,
    );
  }

  async getProductPrice(productId: number, storeId: number): Promise<ProductPrice | undefined> {
    const key = `${productId}-${storeId}`;
    return this.productPrices.get(key);
  }

  async createProductPrice(productPrice: InsertProductPrice): Promise<ProductPrice> {
    const id = this.productPriceId++;
    const key = `${productPrice.productId}-${productPrice.storeId}`;
    const lastUpdated = new Date();
    
    const newProductPrice: ProductPrice = { 
      ...productPrice, 
      id,
      lastUpdated 
    };
    
    this.productPrices.set(key, newProductPrice);
    return newProductPrice;
  }

  async compareProductPrices(productId: number): Promise<(ProductPrice & { store: Store })[]> {
    const prices = await this.getProductPrices(productId);
    const pricesWithStores = await Promise.all(
      prices.map(async (price) => {
        const store = await this.getStore(price.storeId);
        return {
          ...price,
          store: store!,
        };
      })
    );
    
    return pricesWithStores.sort((a, b) => a.price - b.price);
  }

  // Newsletter Subscriber methods
  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const id = this.subscriberId++;
    const subscribedAt = new Date();
    const subscribed = true;
    
    const newSubscriber: NewsletterSubscriber = {
      ...subscriber,
      id,
      subscribed,
      subscribedAt,
    };
    
    this.newsletterSubscribers.set(id, newSubscriber);
    return newSubscriber;
  }

  // Language methods
  async getLanguages(): Promise<Language[]> {
    return Array.from(this.languages.values());
  }

  async getActiveLanguages(): Promise<Language[]> {
    return Array.from(this.languages.values()).filter(language => language.active);
  }

  async getLanguage(id: number): Promise<Language | undefined> {
    return this.languages.get(id);
  }

  async getLanguageByCode(code: string): Promise<Language | undefined> {
    return Array.from(this.languages.values()).find(
      (language) => language.code.toLowerCase() === code.toLowerCase(),
    );
  }

  async createLanguage(language: InsertLanguage): Promise<Language> {
    const id = this.languageId++;
    const newLanguage: Language = { ...language, id };
    this.languages.set(id, newLanguage);
    return newLanguage;
  }

  // Blog post methods
  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values());
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(
      (post) => post.slug === slug
    );
  }

  async createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostId++;
    const now = new Date();
    const newPost: BlogPost = {
      ...blogPost,
      id,
      publishedDate: now
    };
    this.blogPosts.set(id, newPost);
    return newPost;
  }

  async getBlogPostsByCategory(categoryId: number): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.categoryId === categoryId && post.isPublished)
      .sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
  }

  async getRecentBlogPosts(limit: number = 5): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.isPublished)
      .sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime())
      .slice(0, limit);
  }

  // Auto-pilot configuration methods
  async getAutoPilotConfigs(): Promise<AutoPilotConfig[]> {
    return Array.from(this.autoPilotConfigs.values());
  }

  async getAutoPilotConfig(id: number): Promise<AutoPilotConfig | undefined> {
    return this.autoPilotConfigs.get(id);
  }

  async getAutoPilotConfigByFeature(feature: string): Promise<AutoPilotConfig | undefined> {
    return Array.from(this.autoPilotConfigs.values()).find(
      (config) => config.feature === feature
    );
  }

  async createAutoPilotConfig(config: InsertAutoPilotConfig): Promise<AutoPilotConfig> {
    const id = this.autoPilotConfigId++;
    const now = new Date();
    const newConfig: AutoPilotConfig = {
      ...config,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.autoPilotConfigs.set(id, newConfig);
    return newConfig;
  }

  async updateAutoPilotConfig(id: number, updates: Partial<AutoPilotConfig>): Promise<AutoPilotConfig> {
    const config = this.autoPilotConfigs.get(id);
    if (!config) {
      throw new Error(`Auto-pilot config with ID ${id} not found`);
    }

    const updatedConfig: AutoPilotConfig = {
      ...config,
      ...updates,
      updatedAt: new Date(),
      id // ensure id isn't overwritten
    };

    this.autoPilotConfigs.set(id, updatedConfig);
    return updatedConfig;
  }

  async getEnabledAutoPilotConfigs(): Promise<AutoPilotConfig[]> {
    return Array.from(this.autoPilotConfigs.values())
      .filter(config => config.isEnabled);
  }

  // Auto-pilot logs methods
  async getAutoPilotLogs(): Promise<AutoPilotLog[]> {
    return Array.from(this.autoPilotLogs.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async getAutoPilotLog(id: number): Promise<AutoPilotLog | undefined> {
    return this.autoPilotLogs.get(id);
  }

  async createAutoPilotLog(log: InsertAutoPilotLog): Promise<AutoPilotLog> {
    const id = this.autoPilotLogId++;
    const now = new Date();
    const newLog: AutoPilotLog = {
      ...log,
      id,
      startTime: now
    };
    this.autoPilotLogs.set(id, newLog);
    return newLog;
  }

  async updateAutoPilotLog(id: number, updates: Partial<AutoPilotLog>): Promise<AutoPilotLog> {
    const log = this.autoPilotLogs.get(id);
    if (!log) {
      throw new Error(`Auto-pilot log with ID ${id} not found`);
    }

    const updatedLog: AutoPilotLog = {
      ...log,
      ...updates,
      id // ensure id isn't overwritten
    };

    this.autoPilotLogs.set(id, updatedLog);
    return updatedLog;
  }

  async getAutoPilotLogsByFeature(featureId: number): Promise<AutoPilotLog[]> {
    return Array.from(this.autoPilotLogs.values())
      .filter(log => log.featureId === featureId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }
}

// Import database storage implementation
import { DatabaseStorage } from "./storage-db";

// Use database storage instead of in-memory storage
export const storage = new DatabaseStorage();
