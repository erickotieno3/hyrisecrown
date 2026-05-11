import { db } from "./db";
import {
  countries,
  stores,
  categories,
  products,
  productPrices,
  languages,
} from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Clear existing data
    await db.delete(productPrices);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(stores);
    await db.delete(countries);
    await db.delete(languages);
    
    console.log("✓ Cleared existing data");

    // Seed languages
    await db.insert(languages).values([
      { code: "en", name: "English", nativeName: "English", active: true },
      { code: "sw", name: "Swahili", nativeName: "Kiswahili", active: true },
      { code: "fr", name: "French", nativeName: "Français", active: true },
      { code: "de", name: "German", nativeName: "Deutsch", active: true },
      { code: "ar", name: "Arabic", nativeName: "العربية", active: true },
    ]);
    console.log("✓ Languages seeded");
    
    // Seed countries
    const seededCountries = await db.insert(countries).values([
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
      { name: "Nigeria", code: "NG", flagUrl: "/flags/ng.svg", continent: "Africa", active: false, comingSoon: true, displayOrder: 12 },
      { name: "Ghana", code: "GH", flagUrl: "/flags/gh.svg", continent: "Africa", active: false, comingSoon: true, displayOrder: 13 },
      { name: "Spain", code: "ES", flagUrl: "/flags/es.svg", continent: "Europe", active: false, comingSoon: true, displayOrder: 14 },
      { name: "Japan", code: "JP", flagUrl: "/flags/jp.svg", continent: "Asia", active: false, comingSoon: true, displayOrder: 15 },
    ]).returning();
    console.log("✓ Countries seeded");
    
    // Create a map of country codes to IDs for easy reference
    const countryMap = new Map(seededCountries.map(country => [country.code, country.id]));
    
    // Seed stores
    const seededStores = await db.insert(stores).values([
      { name: "Tesco", logoUrl: "/logos/tesco.svg", countryId: countryMap.get("UK")!, active: true, displayOrder: 1 },
      { name: "Carrefour", logoUrl: "/logos/carrefour.svg", countryId: countryMap.get("KE")!, active: true, displayOrder: 1 },
      { name: "Aldi", logoUrl: "/logos/aldi.svg", countryId: countryMap.get("DE")!, active: true, displayOrder: 1 },
      { name: "Walmart", logoUrl: "/logos/walmart.svg", countryId: countryMap.get("US")!, active: true, displayOrder: 1 },
      { name: "Nakumatt", logoUrl: "/logos/nakumatt.svg", countryId: countryMap.get("KE")!, active: true, displayOrder: 2 },
      { name: "Woolworths", logoUrl: "/logos/woolworths.svg", countryId: countryMap.get("ZA")!, active: true, displayOrder: 1 },
      { name: "Coles", logoUrl: "/logos/coles.svg", countryId: countryMap.get("AU")!, active: true, displayOrder: 1 },
      { name: "Sainsbury's", logoUrl: "/logos/sainsburys.svg", countryId: countryMap.get("UK")!, active: true, displayOrder: 2 },
      { name: "Lidl", logoUrl: "/logos/lidl.svg", countryId: countryMap.get("DE")!, active: true, displayOrder: 2 },
      { name: "Carrefour France", logoUrl: "/logos/carrefour.svg", countryId: countryMap.get("FR")!, active: true, displayOrder: 1 },
    ]).returning();
    console.log("✓ Stores seeded");
    
    // Create a map of store names to IDs
    const storeMap = new Map(seededStores.map(store => [store.name, store.id]));
    
    // Seed categories
    const seededCategories = await db.insert(categories).values([
      { name: "Groceries", description: "Food and household items", imageUrl: "/categories/groceries.svg", displayOrder: 1 },
      { name: "Fresh Food", description: "Fresh fruits, vegetables and meat", imageUrl: "/categories/fresh-food.svg", displayOrder: 2 },
      { name: "Beverages", description: "Drinks and liquids", imageUrl: "/categories/beverages.svg", displayOrder: 3 },
      { name: "Household", description: "Cleaning and household products", imageUrl: "/categories/household.svg", displayOrder: 4 },
      { name: "Health & Beauty", description: "Personal care and beauty products", imageUrl: "/categories/health-beauty.svg", displayOrder: 5 },
    ]).returning();
    console.log("✓ Categories seeded");
    
    // Create a map of category names to IDs
    const categoryMap = new Map(seededCategories.map(category => [category.name, category.id]));
    
    // Seed products
    const seededProducts = await db.insert(products).values([
      { name: "Organic Breakfast Cereal Variety Pack", description: "A variety pack of organic breakfast cereals", imageUrl: "/products/cereal.jpg", categoryId: categoryMap.get("Groceries")!, brand: "Tesco", active: true, featured: true },
      { name: "Premium Ground Coffee 250g", description: "Premium ground coffee beans", imageUrl: "/products/coffee.jpg", categoryId: categoryMap.get("Beverages")!, brand: "Carrefour", active: true, featured: true },
      { name: "Organic Semi-Skimmed Milk 1L", description: "Organic semi-skimmed milk", imageUrl: "/products/milk.jpg", categoryId: categoryMap.get("Beverages")!, brand: "Aldi", active: true, featured: true },
      { name: "Fresh Mixed Fruit Pack 500g", description: "Mix of fresh seasonal fruits", imageUrl: "/products/fruits.jpg", categoryId: categoryMap.get("Fresh Food")!, brand: "Walmart", active: true, featured: true },
      { name: "Basmati Rice 1kg", description: "Long grain aromatic rice, perfect for curries and pilaf", imageUrl: "/products/rice.jpg", categoryId: categoryMap.get("Groceries")!, brand: "Tesco", active: true, featured: false },
    ]).returning();
    console.log("✓ Products seeded");
    
    // Create a map of product names to IDs
    const productMap = new Map(seededProducts.map(product => [product.name, product.id]));
    
    // Seed product prices
    await db.insert(productPrices).values([
      // Cereal prices
      { productId: productMap.get("Organic Breakfast Cereal Variety Pack")!, storeId: storeMap.get("Tesco")!, price: 3.75, currency: "GBP", originalPrice: 5.00, discountPercentage: 25, inStock: true, lastUpdated: new Date() },
      { productId: productMap.get("Organic Breakfast Cereal Variety Pack")!, storeId: storeMap.get("Carrefour")!, price: 4.50, currency: "EUR", originalPrice: 5.00, discountPercentage: 10, inStock: true, lastUpdated: new Date() },
      { productId: productMap.get("Organic Breakfast Cereal Variety Pack")!, storeId: storeMap.get("Aldi")!, price: 4.00, currency: "EUR", originalPrice: 4.50, discountPercentage: 11, inStock: true, lastUpdated: new Date() },
      { productId: productMap.get("Organic Breakfast Cereal Variety Pack")!, storeId: storeMap.get("Walmart")!, price: 4.99, currency: "USD", originalPrice: 5.99, discountPercentage: 17, inStock: true, lastUpdated: new Date() },
      
      // Coffee prices
      { productId: productMap.get("Premium Ground Coffee 250g")!, storeId: storeMap.get("Tesco")!, price: 4.50, currency: "GBP", originalPrice: 5.00, discountPercentage: 10, inStock: true, lastUpdated: new Date() },
      { productId: productMap.get("Premium Ground Coffee 250g")!, storeId: storeMap.get("Carrefour")!, price: 4.25, currency: "EUR", originalPrice: 5.00, discountPercentage: 15, inStock: true, lastUpdated: new Date() },
      { productId: productMap.get("Premium Ground Coffee 250g")!, storeId: storeMap.get("Aldi")!, price: 4.75, currency: "EUR", originalPrice: 5.50, discountPercentage: 14, inStock: true, lastUpdated: new Date() },
      
      // Milk prices
      { productId: productMap.get("Organic Semi-Skimmed Milk 1L")!, storeId: storeMap.get("Tesco")!, price: 1.20, currency: "GBP", originalPrice: 1.40, discountPercentage: 14, inStock: true, lastUpdated: new Date() },
      { productId: productMap.get("Organic Semi-Skimmed Milk 1L")!, storeId: storeMap.get("Aldi")!, price: 0.99, currency: "EUR", originalPrice: 1.25, discountPercentage: 21, inStock: true, lastUpdated: new Date() },
      { productId: productMap.get("Organic Semi-Skimmed Milk 1L")!, storeId: storeMap.get("Walmart")!, price: 1.49, currency: "USD", originalPrice: 1.79, discountPercentage: 17, inStock: true, lastUpdated: new Date() },
      
      // Fruits prices
      { productId: productMap.get("Fresh Mixed Fruit Pack 500g")!, storeId: storeMap.get("Tesco")!, price: 2.99, currency: "GBP", originalPrice: 3.99, discountPercentage: 25, inStock: true, lastUpdated: new Date() },
      { productId: productMap.get("Fresh Mixed Fruit Pack 500g")!, storeId: storeMap.get("Walmart")!, price: 2.49, currency: "USD", originalPrice: 3.99, discountPercentage: 38, inStock: true, lastUpdated: new Date() },
      
      // Rice prices
      { productId: productMap.get("Basmati Rice 1kg")!, storeId: storeMap.get("Tesco")!, price: 1.80, currency: "GBP", originalPrice: null, discountPercentage: null, inStock: true, lastUpdated: new Date() },
      { productId: productMap.get("Basmati Rice 1kg")!, storeId: storeMap.get("Aldi")!, price: 2.15, currency: "EUR", originalPrice: null, discountPercentage: null, inStock: true, lastUpdated: new Date() },
      { productId: productMap.get("Basmati Rice 1kg")!, storeId: storeMap.get("Carrefour")!, price: 2.49, currency: "EUR", originalPrice: null, discountPercentage: null, inStock: true, lastUpdated: new Date() },
      { productId: productMap.get("Basmati Rice 1kg")!, storeId: storeMap.get("Walmart")!, price: 2.99, currency: "USD", originalPrice: null, discountPercentage: null, inStock: false, lastUpdated: new Date() },
    ]);
    console.log("✓ Product prices seeded");

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exit(1);
  });