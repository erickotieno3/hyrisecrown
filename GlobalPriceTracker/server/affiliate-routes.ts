/**
 * Affiliate Marketing Routes
 * 
 * This file contains routes for handling affiliate marketing tracking, 
 * commission management, and related analytics.
 */
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from './storage';

// Create affiliate router
const affiliateRouter = express.Router();

// Validate click data
const clickSchema = z.object({
  affiliateId: z.string(),
  storeId: z.number(),
  productId: z.number().optional(),
  referrer: z.string().optional(),
  userAgent: z.string(),
  ipHash: z.string(), // Hashed for privacy
});

// Validate conversion data
const conversionSchema = z.object({
  clickId: z.string(),
  orderId: z.string(),
  amount: z.number(),
  currency: z.string(),
  commission: z.number(),
  status: z.enum(['pending', 'approved', 'rejected']),
});

/**
 * Record an affiliate click 
 * This endpoint is called when a user clicks an affiliate link
 */
affiliateRouter.post('/click', async (req: Request, res: Response) => {
  try {
    // Validate request data
    const result = clickSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid data',
        details: result.error.format() 
      });
    }
    
    const clickData = result.data;
    
    // Generate a unique click ID
    const clickId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Store click data (would go to database in real implementation)
    // In a real implementation, this would be saved to the database
    const clickRecord = {
      id: clickId,
      timestamp: new Date(),
      ...clickData
    };
    
    console.log('Recorded affiliate click:', clickRecord);
    
    // Return the click ID for conversion tracking
    return res.status(200).json({ 
      success: true,
      clickId,
      redirectUrl: `/redirect?clickId=${clickId}`
    });
  } catch (error: any) {
    console.error('Error recording affiliate click:', error);
    return res.status(500).json({ error: 'Server error recording click' });
  }
});

/**
 * Record a conversion
 * This endpoint is called by the store's webhook when a purchase is completed
 */
affiliateRouter.post('/conversion', async (req: Request, res: Response) => {
  try {
    // Validate conversion data
    const result = conversionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid data',
        details: result.error.format() 
      });
    }
    
    const conversionData = result.data;
    
    // In a real implementation, verify the conversion with the store
    // and calculate the commission based on the configured rates
    
    // Record the conversion (would go to database in real implementation)
    const conversionRecord = {
      id: `conv-${Date.now()}`,
      timestamp: new Date(),
      ...conversionData
    };
    
    console.log('Recorded affiliate conversion:', conversionRecord);
    
    return res.status(200).json({ 
      success: true,
      conversionId: conversionRecord.id 
    });
  } catch (error: any) {
    console.error('Error recording conversion:', error);
    return res.status(500).json({ error: 'Server error recording conversion' });
  }
});

/**
 * Get affiliate statistics
 * This endpoint is used by the affiliate dashboard to display stats
 */
affiliateRouter.get('/stats/:affiliateId', async (req: Request, res: Response) => {
  try {
    const { affiliateId } = req.params;
    
    // In a real implementation, query the database for stats
    // Here we return mock data
    const stats = {
      clicks: 1250,
      conversions: 38,
      conversionRate: 3.04,
      revenue: 5670.25,
      commission: 453.62,
      pendingPayouts: 210.45,
      topProducts: [
        { id: 1, name: 'Organic Breakfast Cereal', clicks: 75, conversions: 8 },
        { id: 5, name: 'Basmati Rice 1kg', clicks: 52, conversions: 6 },
        { id: 12, name: 'Premium Coffee Beans', clicks: 48, conversions: 5 }
      ]
    };
    
    return res.status(200).json(stats);
  } catch (error: any) {
    console.error('Error fetching affiliate stats:', error);
    return res.status(500).json({ error: 'Server error fetching affiliate stats' });
  }
});

/**
 * Redirect endpoint for affiliate links
 * This intermediary endpoint allows for click tracking before redirecting to the store
 */
affiliateRouter.get('/redirect', (req: Request, res: Response) => {
  const { clickId, destination } = req.query;
  
  if (!clickId || !destination) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  // In a real implementation, look up the click record and validate it
  
  // Then redirect to the destination
  return res.redirect(destination as string);
});

export default affiliateRouter;