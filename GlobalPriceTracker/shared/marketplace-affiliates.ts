/**
 * Shared Marketplace Affiliates Configuration
 * 
 * This file contains the configuration for supported online marketplaces
 * and their affiliate programs. It is used by both client and server.
 */

export interface MarketplaceAffiliate {
  id: string;
  name: string;
  logoPath: string;
  baseUrl: string;
  primaryRegions: string[];
  secondaryRegions: string[];
  affiliateParam?: string;
  searchEndpoint?: string;
  affiliateBaseUrl?: string;
  commissionRate?: string;
  availableCategories?: string[];
}

export const marketplaceAffiliates: MarketplaceAffiliate[] = [
  {
    id: "amazon",
    name: "Amazon",
    logoPath: "/assets/marketplace-logos/amazon.svg",
    baseUrl: "https://www.amazon.com",
    primaryRegions: ["USA", "UK", "Germany", "Canada", "Japan", "Australia"],
    secondaryRegions: ["France", "Italy", "Spain", "Netherlands", "Mexico", "Brazil", "UAE"],
    affiliateParam: "tag",
    searchEndpoint: "/s",
    affiliateBaseUrl: "https://www.amazon.com/",
    commissionRate: "1-10% depending on category",
    availableCategories: [
      "Electronics", "Books", "Home & Kitchen", "Fashion", "Beauty", "Toys",
      "Sports & Outdoors", "Automotive", "Health & Personal Care", "Grocery"
    ]
  },
  {
    id: "ebay",
    name: "eBay",
    logoPath: "/assets/marketplace-logos/ebay.svg",
    baseUrl: "https://www.ebay.com",
    primaryRegions: ["USA", "UK", "Germany", "Australia", "Canada"],
    secondaryRegions: ["France", "Italy", "Spain", "Hong Kong", "Singapore"],
    affiliateParam: "campid",
    searchEndpoint: "/sch/i.html",
    affiliateBaseUrl: "https://rover.ebay.com/rover/1/",
    commissionRate: "Up to 4% on most categories",
    availableCategories: [
      "Electronics", "Fashion", "Home & Garden", "Sporting Goods", "Collectibles",
      "Business & Industrial", "Automotive", "Health & Beauty", "Media"
    ]
  },
  {
    id: "aliexpress",
    name: "AliExpress",
    logoPath: "/assets/marketplace-logos/aliexpress.svg",
    baseUrl: "https://www.aliexpress.com",
    primaryRegions: ["Global", "China", "Russia", "Brazil", "Spain"],
    secondaryRegions: ["USA", "France", "UK", "Italy", "Poland", "Saudi Arabia"],
    affiliateParam: "aff_platform",
    searchEndpoint: "/wholesale",
    affiliateBaseUrl: "https://s.click.aliexpress.com/",
    commissionRate: "Up to 50% depending on category",
    availableCategories: [
      "Consumer Electronics", "Fashion", "Home & Garden", "Beauty", "Automotive",
      "Sports & Entertainment", "Toys & Hobbies", "Health & Personal Care"
    ]
  },
  {
    id: "jumia",
    name: "Jumia",
    logoPath: "/assets/marketplace-logos/jumia.svg",
    baseUrl: "https://www.jumia.com",
    primaryRegions: ["Nigeria", "Kenya", "Ghana", "Uganda", "Tanzania", "South Africa"],
    secondaryRegions: ["Egypt", "Morocco", "Ivory Coast", "Senegal", "Tunisia"],
    affiliateParam: "id",
    searchEndpoint: "/catalog/",
    affiliateBaseUrl: "https://kol.jumia.com/api/click/link/",
    commissionRate: "8-12% depending on category",
    availableCategories: [
      "Phones & Tablets", "Electronics", "Fashion", "Home & Kitchen", "Health & Beauty",
      "Baby Products", "Sporting Goods", "Grocery", "Automotive"
    ]
  },
  {
    id: "kilimall",
    name: "Kilimall",
    logoPath: "/assets/marketplace-logos/kilimall.svg",
    baseUrl: "https://www.kilimall.co.ke",
    primaryRegions: ["Kenya", "Uganda", "Nigeria"],
    secondaryRegions: ["Tanzania", "Ethiopia", "Rwanda", "Ghana"],
    affiliateParam: "share_mas_id",
    searchEndpoint: "/c/",
    affiliateBaseUrl: "https://www.kilimall.co.ke/",
    commissionRate: "5-15% commission on sales",
    availableCategories: [
      "Electronics", "Fashion", "Home & Living", "Health & Beauty", "Baby Products",
      "Sports & Outdoors", "Automotive", "Office Products"
    ]
  }
];

/**
 * Get marketplace affiliation information by ID
 */
export function getMarketplaceById(id: string): MarketplaceAffiliate | undefined {
  return marketplaceAffiliates.find(marketplace => marketplace.id === id);
}

/**
 * Get marketplaces by region
 */
export function getMarketplacesByRegion(region: string): MarketplaceAffiliate[] {
  return marketplaceAffiliates.filter(
    marketplace => marketplace.primaryRegions.includes(region) || marketplace.secondaryRegions.includes(region)
  );
}

/**
 * Get marketplaces by category
 */
export function getMarketplacesByCategory(category: string): MarketplaceAffiliate[] {
  return marketplaceAffiliates.filter(
    marketplace => marketplace.availableCategories?.includes(category)
  );
}

/**
 * Generate an affiliate link for a marketplace product
 */
export function generateAffiliateLink(
  marketplaceId: string,
  productUrl: string,
  affiliateId: string
): string {
  const marketplace = getMarketplaceById(marketplaceId);
  
  if (!marketplace || !marketplace.affiliateParam) {
    return productUrl;
  }
  
  const url = new URL(productUrl);
  url.searchParams.set(marketplace.affiliateParam, affiliateId);
  
  return url.toString();
}