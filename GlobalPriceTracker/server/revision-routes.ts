/**
 * Revision Routes
 * 
 * API endpoints for managing content revisions in the Node.js API
 */

import { Router, Request, Response } from 'express';
import {
  saveProductRevision,
  saveStoreRevision,
  savePriceRevision,
  getProductRevisions,
  getStoreRevisions,
  getPriceRevisions,
  restoreProductRevision,
  restoreStoreRevision,
  restorePriceRevision,
  cleanupOldRevisions
} from './revisions';
import { db } from './db';
import { revisionConfig } from '../shared/schema-revisions';
import { eq } from 'drizzle-orm';

export const revisionRouter = Router();

/**
 * Get revisions for a product
 */
revisionRouter.get('/product/:id', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID'
      });
    }
    
    const revisions = await getProductRevisions(productId);
    
    res.json(revisions);
    
  } catch (error: any) {
    console.error('Error getting product revisions:', error);
    res.status(500).json({
      error: 'Failed to get product revisions',
      details: error.message
    });
  }
});

/**
 * Get revisions for a store
 */
revisionRouter.get('/store/:id', async (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.id);
    
    if (isNaN(storeId)) {
      return res.status(400).json({
        error: 'Invalid store ID'
      });
    }
    
    const revisions = await getStoreRevisions(storeId);
    
    res.json(revisions);
    
  } catch (error: any) {
    console.error('Error getting store revisions:', error);
    res.status(500).json({
      error: 'Failed to get store revisions',
      details: error.message
    });
  }
});

/**
 * Get revisions for a price
 */
revisionRouter.get('/price/:id', async (req: Request, res: Response) => {
  try {
    const priceId = parseInt(req.params.id);
    
    if (isNaN(priceId)) {
      return res.status(400).json({
        error: 'Invalid price ID'
      });
    }
    
    const revisions = await getPriceRevisions(priceId);
    
    res.json(revisions);
    
  } catch (error: any) {
    console.error('Error getting price revisions:', error);
    res.status(500).json({
      error: 'Failed to get price revisions',
      details: error.message
    });
  }
});

/**
 * Restore a product to a specific revision
 */
revisionRouter.post('/product/restore/:id', async (req: Request, res: Response) => {
  try {
    const revisionId = parseInt(req.params.id);
    
    if (isNaN(revisionId)) {
      return res.status(400).json({
        error: 'Invalid revision ID'
      });
    }
    
    const product = await restoreProductRevision(revisionId);
    
    if (!product) {
      return res.status(404).json({
        error: 'Revision not found'
      });
    }
    
    res.json({
      success: true,
      product
    });
    
  } catch (error: any) {
    console.error('Error restoring product revision:', error);
    res.status(500).json({
      error: 'Failed to restore product revision',
      details: error.message
    });
  }
});

/**
 * Restore a store to a specific revision
 */
revisionRouter.post('/store/restore/:id', async (req: Request, res: Response) => {
  try {
    const revisionId = parseInt(req.params.id);
    
    if (isNaN(revisionId)) {
      return res.status(400).json({
        error: 'Invalid revision ID'
      });
    }
    
    const store = await restoreStoreRevision(revisionId);
    
    if (!store) {
      return res.status(404).json({
        error: 'Revision not found'
      });
    }
    
    res.json({
      success: true,
      store
    });
    
  } catch (error: any) {
    console.error('Error restoring store revision:', error);
    res.status(500).json({
      error: 'Failed to restore store revision',
      details: error.message
    });
  }
});

/**
 * Restore a price to a specific revision
 */
revisionRouter.post('/price/restore/:id', async (req: Request, res: Response) => {
  try {
    const revisionId = parseInt(req.params.id);
    
    if (isNaN(revisionId)) {
      return res.status(400).json({
        error: 'Invalid revision ID'
      });
    }
    
    const price = await restorePriceRevision(revisionId);
    
    if (!price) {
      return res.status(404).json({
        error: 'Revision not found'
      });
    }
    
    res.json({
      success: true,
      price
    });
    
  } catch (error: any) {
    console.error('Error restoring price revision:', error);
    res.status(500).json({
      error: 'Failed to restore price revision',
      details: error.message
    });
  }
});

/**
 * Get revision config
 */
revisionRouter.get('/config', async (_req: Request, res: Response) => {
  try {
    const [config] = await db.select().from(revisionConfig);
    
    if (!config) {
      // Create default config if it doesn't exist
      const [newConfig] = await db.insert(revisionConfig)
        .values({
          retentionDays: 0, // Unlimited by default
          autoCleanup: true,
          updatedAt: new Date()
        })
        .returning();
        
      return res.json(newConfig);
    }
    
    res.json(config);
    
  } catch (error: any) {
    console.error('Error getting revision config:', error);
    res.status(500).json({
      error: 'Failed to get revision config',
      details: error.message
    });
  }
});

/**
 * Update revision config
 */
revisionRouter.put('/config', async (req: Request, res: Response) => {
  try {
    const { retentionDays, autoCleanup } = req.body;
    
    // Validate inputs
    if (typeof retentionDays !== 'number' || retentionDays < 0) {
      return res.status(400).json({
        error: 'retentionDays must be a non-negative number'
      });
    }
    
    if (typeof autoCleanup !== 'boolean') {
      return res.status(400).json({
        error: 'autoCleanup must be a boolean'
      });
    }
    
    // Get existing config
    const [existingConfig] = await db.select().from(revisionConfig);
    
    if (!existingConfig) {
      // Create new config
      const [newConfig] = await db.insert(revisionConfig)
        .values({
          retentionDays,
          autoCleanup,
          updatedAt: new Date()
        })
        .returning();
        
      return res.json(newConfig);
    }
    
    // Update existing config
    const [updatedConfig] = await db.update(revisionConfig)
      .set({
        retentionDays,
        autoCleanup,
        updatedAt: new Date()
      })
      .where(eq(revisionConfig.id, existingConfig.id))
      .returning();
      
    // Run cleanup if autoCleanup is enabled and retention days is set
    if (autoCleanup && retentionDays > 0) {
      await cleanupOldRevisions(retentionDays);
    }
    
    res.json(updatedConfig);
    
  } catch (error: any) {
    console.error('Error updating revision config:', error);
    res.status(500).json({
      error: 'Failed to update revision config',
      details: error.message
    });
  }
});

/**
 * Manually trigger cleanup
 */
revisionRouter.post('/cleanup', async (req: Request, res: Response) => {
  try {
    const { days } = req.body;
    
    // Validate inputs
    if (typeof days !== 'number' || days <= 0) {
      return res.status(400).json({
        error: 'days must be a positive number'
      });
    }
    
    await cleanupOldRevisions(days);
    
    res.json({
      success: true,
      message: `Cleaned up revisions older than ${days} days`
    });
    
  } catch (error: any) {
    console.error('Error cleaning up revisions:', error);
    res.status(500).json({
      error: 'Failed to clean up revisions',
      details: error.message
    });
  }
});