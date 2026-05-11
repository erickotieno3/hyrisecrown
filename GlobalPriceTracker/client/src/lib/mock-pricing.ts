/**
 * Mock Pricing Data for Development
 * 
 * This file contains mock data structures for pricing across different stores and countries.
 * The currency is determined by the store's country of operation.
 */

type StoreInfo = {
  id: number;
  name: string;
  country: string;
  currency: string;
  currencySymbol: string;
};

export const storeInfoMap: Record<string, StoreInfo> = {
  "Tesco": {
    id: 1,
    name: "Tesco",
    country: "UK",
    currency: "GBP",
    currencySymbol: "£"
  },
  "Carrefour": {
    id: 2,
    name: "Carrefour",
    country: "France",
    currency: "EUR",
    currencySymbol: "€"
  },
  "Naivas": {
    id: 3,
    name: "Naivas",
    country: "Kenya",
    currency: "KES",
    currencySymbol: "KSh"
  },
  "Aldi": {
    id: 4,
    name: "Aldi",
    country: "Germany",
    currency: "EUR",
    currencySymbol: "€"
  },
  "Lidl": {
    id: 5,
    name: "Lidl",
    country: "Germany",
    currency: "EUR",
    currencySymbol: "€"
  },
  "Walmart": {
    id: 6,
    name: "Walmart",
    country: "USA",
    currency: "USD",
    currencySymbol: "$"
  },
  "Kroger": {
    id: 7,
    name: "Kroger",
    country: "USA",
    currency: "USD",
    currencySymbol: "$"
  },
  "Shoprite": {
    id: 8,
    name: "Shoprite",
    country: "South Africa",
    currency: "ZAR",
    currencySymbol: "R"
  },
  "Coles": {
    id: 9,
    name: "Coles",
    country: "Australia",
    currency: "AUD",
    currencySymbol: "A$"
  },
  "Loblaws": {
    id: 10,
    name: "Loblaws",
    country: "Canada",
    currency: "CAD",
    currencySymbol: "C$"
  }
};

// Function to convert a price to the correct currency based on store
export function getPriceInStoreCurrency(basePrice: number, storeName: string): { price: number, currency: string, symbol: string } {
  const store = storeInfoMap[storeName];
  
  if (!store) {
    return { price: basePrice, currency: "USD", symbol: "$" };
  }
  
  // Apply conversion rates (simplified for development purposes)
  let convertedPrice = basePrice;
  
  switch (store.currency) {
    case "GBP":
      convertedPrice = basePrice * 0.78; // USD to GBP
      break;
    case "EUR":
      convertedPrice = basePrice * 0.92; // USD to EUR
      break;
    case "KES":
      convertedPrice = basePrice * 129.5; // USD to KES
      break;
    case "ZAR":
      convertedPrice = basePrice * 18.27; // USD to ZAR
      break;
    case "AUD":
      convertedPrice = basePrice * 1.49; // USD to AUD
      break;
    case "CAD":
      convertedPrice = basePrice * 1.36; // USD to CAD
      break;
    default:
      // Keep as USD
      break;
  }
  
  // Round to appropriate precision
  convertedPrice = Math.round(convertedPrice * 100) / 100;
  
  return {
    price: convertedPrice,
    currency: store.currency,
    symbol: store.currencySymbol
  };
}

// Function to format price with the proper currency symbol and format
export function formatPrice(price: number, currency: string): string {
  const store = Object.values(storeInfoMap).find(s => s.currency === currency);
  const symbol = store?.currencySymbol || "$";
  
  // Handle special cases for currencies that go after the amount
  if (currency === "KES") {
    return `${price.toFixed(2)} ${symbol}`;
  }
  
  // Default format with symbol before amount
  return `${symbol}${price.toFixed(2)}`;
}