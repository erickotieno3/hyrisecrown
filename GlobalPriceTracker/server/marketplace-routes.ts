/**
 * Online Marketplace Routes
 *
 * This file contains routes for integrating with various online marketplaces
 * including Amazon, eBay, AliExpress, Jumia, and Kilimall.
 */

import express, { Request, Response } from 'express';
import { marketplaceAffiliates, getMarketplaceById, getMarketplacesByRegion, getMarketplacesByCategory } from '../shared/marketplace-affiliates';

const marketplaceRouter = express.Router();

// Sample/mock data structure for tracking affiliate clicks
interface AffiliateClick {
  id: string;
  marketplaceId: string;
  productLink: string;
  timestamp: Date;
  userIp: string;
  userAgent: string;
  referrer: string;
  converted: boolean;
  conversionAmount?: number;
  conversionDate?: Date;
}

// In-memory storage for tracking clicks (would use database in production)
const affiliateClicks: AffiliateClick[] = [];

/**
 * Get all supported marketplaces
 */
marketplaceRouter.get('/marketplaces', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: marketplaceAffiliates
  });
});

/**
 * Get marketplaces by region
 */
marketplaceRouter.get('/marketplaces/region/:region', (req: Request, res: Response) => {
  const region = req.params.region;
  const marketplaces = getMarketplacesByRegion(region);
  
  res.json({
    success: true,
    data: marketplaces
  });
});

/**
 * Get marketplaces by category
 */
marketplaceRouter.get('/marketplaces/category/:category', (req: Request, res: Response) => {
  const category = req.params.category;
  const marketplaces = getMarketplacesByCategory(category);
  
  res.json({
    success: true,
    data: marketplaces.map((marketplace) => ({
      id: marketplace.id,
      name: marketplace.name,
      logoPath: marketplace.logoPath,
      commissionRate: marketplace.commissionRate
    }))
  });
});

/**
 * Search products across multiple marketplaces
 */
marketplaceRouter.get('/search', async (req: Request, res: Response) => {
  const query = req.query.query as string;
  const category = req.query.category as string;
  const region = req.query.region as string;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }
  
  try {
    // In a real implementation, we would:
    // 1. Determine which marketplaces to search based on region & category
    // 2. Make parallel API requests to each marketplace
    // 3. Format and combine the results
    
    // For now, we'll return demo data to show the UI
    const results = generateDemoResults(query, category, region);
    
    res.json({
      success: true,
      query,
      results
    });
  } catch (error) {
    console.error('Marketplace search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching marketplaces'
    });
  }
});

/**
 * Generate an affiliate link for a marketplace product
 */
marketplaceRouter.post('/affiliate/link', (req: Request, res: Response) => {
  const { marketplaceId, productUrl } = req.body;
  
  if (!marketplaceId || !productUrl) {
    return res.status(400).json({
      success: false,
      message: 'Marketplace ID and product URL are required'
    });
  }
  
  const marketplace = getMarketplaceById(marketplaceId);
  
  if (!marketplace) {
    return res.status(404).json({
      success: false,
      message: 'Marketplace not found'
    });
  }
  
  const affiliateId = getDefaultAffiliateId(marketplaceId);
  const affiliateUrl = generateAffiliateUrl(marketplaceId, productUrl, affiliateId);
  
  res.json({
    success: true,
    originalUrl: productUrl,
    affiliateUrl
  });
});

/**
 * Track an affiliate link click
 */
marketplaceRouter.post('/affiliate/click', (req: Request, res: Response) => {
  const { marketplaceId, productLink } = req.body;
  
  if (!marketplaceId || !productLink) {
    return res.status(400).json({
      success: false,
      message: 'Marketplace ID and product link are required'
    });
  }
  
  const clickId = generateClickId();
  
  const click: AffiliateClick = {
    id: clickId,
    marketplaceId,
    productLink,
    timestamp: new Date(),
    userIp: req.ip || '0.0.0.0',
    userAgent: req.headers['user-agent'] || 'Unknown',
    referrer: req.headers.referer || 'Direct',
    converted: false
  };
  
  // In production, this would be stored in a database
  affiliateClicks.push(click);
  
  res.json({
    success: true,
    clickId
  });
});

/**
 * Record a marketplace conversion (usually called by webhook)
 */
marketplaceRouter.post('/affiliate/conversion', (req: Request, res: Response) => {
  const { clickId, amount } = req.body;
  
  if (!clickId) {
    return res.status(400).json({
      success: false,
      message: 'Click ID is required'
    });
  }
  
  // Find the click in our storage
  const clickIndex = affiliateClicks.findIndex(click => click.id === clickId);
  
  if (clickIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Click not found'
    });
  }
  
  // Update the click record with conversion data
  affiliateClicks[clickIndex].converted = true;
  affiliateClicks[clickIndex].conversionAmount = amount;
  affiliateClicks[clickIndex].conversionDate = new Date();
  
  res.json({
    success: true,
    message: 'Conversion recorded successfully'
  });
});

/**
 * Get affiliate statistics
 */
marketplaceRouter.get('/affiliate/stats', (req: Request, res: Response) => {
  // In production, this would be calculated from database queries
  const totalClicks = affiliateClicks.length;
  const totalConversions = affiliateClicks.filter(click => click.converted).length;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  
  const totalRevenue = affiliateClicks
    .filter(click => click.converted && click.conversionAmount)
    .reduce((sum, click) => sum + (click.conversionAmount || 0), 0);
  
  // Group by marketplace
  const marketplaceStats = marketplaceAffiliates.map(marketplace => {
    const marketplaceClicks = affiliateClicks.filter(click => click.marketplaceId === marketplace.id);
    const marketplaceConversions = marketplaceClicks.filter(click => click.converted);
    
    return {
      id: marketplace.id,
      name: marketplace.name,
      clicks: marketplaceClicks.length,
      conversions: marketplaceConversions.length,
      conversionRate: marketplaceClicks.length > 0 
        ? (marketplaceConversions.length / marketplaceClicks.length) * 100 
        : 0,
      revenue: marketplaceConversions
        .reduce((sum, click) => sum + (click.conversionAmount || 0), 0)
    };
  });
  
  res.json({
    success: true,
    overall: {
      clicks: totalClicks,
      conversions: totalConversions,
      conversionRate,
      revenue: totalRevenue
    },
    marketplaces: marketplaceStats
  });
});

// Demo data generation for the UI
function generateDemoResults(query: string, category?: string, region?: string) {
  // This function generates mock data for demo purposes
  // In production, this would be real API data from marketplaces
  
  const products = [
    {
      id: 'amz1',
      name: `${query} - Premium Version`,
      price: 199.99,
      currency: '$',
      url: 'https://www.amazon.com/product',
      image: 'https://via.placeholder.com/300',
      marketplace: 'Amazon',
      rating: 4.5,
      reviews: 258,
      freeShipping: true
    },
    {
      id: 'ebay1',
      name: `${query} - Used Good Condition`,
      price: 149.99,
      currency: '$',
      url: 'https://www.ebay.com/itm/123',
      image: 'https://via.placeholder.com/300',
      marketplace: 'eBay',
      rating: 4.1,
      reviews: 42,
      shipping: 12.99
    },
    {
      id: 'ali1',
      name: `${query} - Chinese Import Version`,
      price: 89.99,
      currency: '$',
      url: 'https://www.aliexpress.com/item/123',
      image: 'https://via.placeholder.com/300',
      marketplace: 'AliExpress',
      shipping: 0,
      freeShipping: true
    },
    {
      id: 'jum1',
      name: `${query} - African Edition`,
      price: 25999,
      currency: 'KSh',
      url: 'https://www.jumia.co.ke/catalog/',
      image: 'https://via.placeholder.com/300',
      marketplace: 'Jumia',
      rating: 3.9,
      reviews: 17,
      shipping: 599
    },
    {
      id: 'kil1',
      name: `${query} - Standard Package`,
      price: 22499,
      currency: 'KSh',
      url: 'https://www.kilimall.co.ke/new/goods/',
      image: 'https://via.placeholder.com/300',
      marketplace: 'Kilimall',
      rating: 4.0,
      reviews: 8,
      shipping: 0,
      freeShipping: true
    }
  ];
  
  // If region is specified, filter by region
  let filteredProducts = products;
  if (region) {
    const marketplacesInRegion = getMarketplacesByRegion(region).map(m => m.name);
    filteredProducts = products.filter(p => marketplacesInRegion.includes(p.marketplace));
  }
  
  return filteredProducts;
}

/**
 * Generate an affiliate URL
 */
function generateAffiliateUrl(marketplaceId: string, productUrl: string, affiliateId: string): string {
  const marketplace = getMarketplaceById(marketplaceId);
  
  if (!marketplace || !marketplace.affiliateParam) {
    return productUrl;
  }
  
  // Simple implementation - in production we would use the proper URL structure for each marketplace
  try {
    const url = new URL(productUrl);
    url.searchParams.set(marketplace.affiliateParam, affiliateId);
    return url.toString();
  } catch (error) {
    console.error(`Error generating affiliate URL for ${marketplaceId}:`, error);
    return productUrl;
  }
}

/**
 * Get the default affiliate ID for a marketplace
 * In production, these would be stored in environment variables or the database
 */
function getDefaultAffiliateId(marketplaceId: string): string {
  const affiliateIds: Record<string, string> = {
    amazon: 'tescoprice-20',
    ebay: '5338909602',
    aliexpress: 'tescoprice',
    jumia: 'tescoprice',
    kilimall: 'tescoprice'
  };
  
  return affiliateIds[marketplaceId] || 'tescoprice';
}

/**
 * Generate a unique ID for click tracking
 */
function generateClickId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export default marketplaceRouter;