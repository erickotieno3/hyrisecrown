/**
 * Network Sync Routes
 * 
 * REST API endpoints for network synchronization and revision management
 */

import { Router, Request, Response } from 'express';
import WebSocketNetworkServer from './websocket-server';
import UnlimitedRevisionSystem from './unlimited-revisions';

const syncRouter = Router();

// Initialize services
const revisionSystem = new UnlimitedRevisionSystem();

// Middleware to inject WebSocket server (passed from main index.ts)
export function setSyncServices(wsServer: WebSocketNetworkServer) {
  // Update the POST /api/sync/track handler to use wsServer
  syncRouter.post('/track', async (req: Request, res: Response) => {
    try {
      const {
        entityType,
        entityId,
        action,
        previousData,
        newData,
        userId,
        username,
        ipAddress,
        userAgent
      } = req.body;

      // Validate required fields
      if (!entityType || !entityId || !action) {
        return res.status(400).json({
          error: 'Missing required fields: entityType, entityId, action'
        });
      }

      // Track the revision
      const revision = await revisionSystem.trackRevision(
        entityType,
        entityId,
        action,
        previousData,
        newData,
        {
          userId: userId || req.user?.id,
          username: username || req.user?.username,
          ipAddress: ipAddress || req.ip,
          userAgent: userAgent || req.get('user-agent')
        }
      );

      // Broadcast change through WebSocket if needed
      if (newData) {
        wsServer.broadcastPriceUpdate({
          productId: parseInt(entityId),
          storeId: 0,
          oldPrice: previousData?.price || 0,
          newPrice: newData?.price || 0,
          priceChange: (newData?.price || 0) - (previousData?.price || 0),
          percentChange: previousData?.price 
            ? (((newData?.price || 0) - (previousData?.price || 0)) / previousData.price) * 100
            : 0,
          timestamp: Date.now()
        });
      }

      res.json({
        success: true,
        revision: {
          id: revision.id,
          version: revision.version,
          timestamp: revision.timestamp,
          changesSummary: revision.changesSummary
        }
      });
    } catch (error: any) {
      console.error('Error tracking revision:', error);
      res.status(500).json({
        error: 'Failed to track revision',
        details: error.message
      });
    }
  });
}

/**
 * Get revision history for an entity
 */
syncRouter.get('/revisions/:entityType/:entityId', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const revisions = revisionSystem.getRevisionHistory(entityType, entityId, limit, offset);

    res.json({
      success: true,
      entityType,
      entityId,
      totalRevisions: revisions.length,
      limit,
      offset,
      revisions: revisions.map(r => ({
        id: r.id,
        version: r.version,
        action: r.action,
        username: r.username,
        timestamp: r.timestamp,
        changesSummary: r.changesSummary,
        changes: r.changes
      }))
    });
  } catch (error: any) {
    console.error('Error getting revision history:', error);
    res.status(500).json({
      error: 'Failed to get revision history',
      details: error.message
    });
  }
});

/**
 * Get specific revision
 */
syncRouter.get('/revisions/:entityType/:entityId/:version', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId, version } = req.params;
    const versionNum = parseInt(version);

    const revision = revisionSystem.getRevision(entityType, entityId, versionNum);

    if (!revision) {
      return res.status(404).json({
        error: 'Revision not found'
      });
    }

    res.json({
      success: true,
      revision: {
        id: revision.id,
        version: revision.version,
        action: revision.action,
        previousData: revision.previousData,
        newData: revision.newData,
        changes: revision.changes,
        changesSummary: revision.changesSummary,
        username: revision.username,
        timestamp: revision.timestamp,
        ipAddress: revision.ipAddress
      }
    });
  } catch (error: any) {
    console.error('Error getting revision:', error);
    res.status(500).json({
      error: 'Failed to get revision',
      details: error.message
    });
  }
});

/**
 * Get diff between two revisions
 */
syncRouter.get('/revisions/:entityType/:entityId/diff/:fromVersion/:toVersion', 
  async (req: Request, res: Response) => {
    try {
      const { entityType, entityId, fromVersion, toVersion } = req.params;

      const diff = revisionSystem.getRevisionDiff(
        entityType,
        entityId,
        parseInt(fromVersion),
        parseInt(toVersion)
      );

      res.json({
        success: true,
        entityType,
        entityId,
        fromVersion: parseInt(fromVersion),
        toVersion: parseInt(toVersion),
        differences: diff
      });
    } catch (error: any) {
      console.error('Error getting diff:', error);
      res.status(500).json({
        error: 'Failed to get revision diff',
        details: error.message
      });
    }
  }
);

/**
 * Restore to specific revision
 */
syncRouter.post('/restore/:entityType/:entityId/:version', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId, version } = req.params;
    const { reason } = req.body;

    const restoredData = revisionSystem.restoreToRevision(
      entityType,
      entityId,
      parseInt(version),
      {
        userId: req.user?.id,
        username: req.user?.username || 'system'
      }
    );

    res.json({
      success: true,
      message: `Restored to version ${version}`,
      restoredData,
      reason
    });
  } catch (error: any) {
    console.error('Error restoring revision:', error);
    res.status(500).json({
      error: 'Failed to restore revision',
      details: error.message
    });
  }
});

/**
 * Search revisions
 */
syncRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const {
      entityType,
      entityId,
      action,
      userId,
      startTime,
      endTime,
      limit = 100
    } = req.query;

    const revisions = revisionSystem.searchRevisions({
      entityType: entityType as string,
      entityId: entityId as string,
      action: action as string,
      userId: userId as string,
      startTime: startTime ? parseInt(startTime as string) : undefined,
      endTime: endTime ? parseInt(endTime as string) : undefined,
      limit: parseInt(limit as string)
    });

    res.json({
      success: true,
      count: revisions.length,
      revisions: revisions.map(r => ({
        id: r.id,
        entityType: r.entityType,
        entityId: r.entityId,
        version: r.version,
        action: r.action,
        username: r.username,
        timestamp: r.timestamp,
        changesSummary: r.changesSummary
      }))
    });
  } catch (error: any) {
    console.error('Error searching revisions:', error);
    res.status(500).json({
      error: 'Failed to search revisions',
      details: error.message
    });
  }
});

/**
 * Get revision statistics
 */
syncRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const { entityType } = req.query;

    const stats = revisionSystem.getRevisionStats(entityType as string);

    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      error: 'Failed to get revision statistics',
      details: error.message
    });
  }
});

/**
 * Generate revision report
 */
syncRouter.get('/report', async (req: Request, res: Response) => {
  try {
    const { entityType, format = 'text' } = req.query;

    if (format === 'json') {
      const stats = revisionSystem.getRevisionStats(entityType as string);
      return res.json({ success: true, stats });
    }

    const report = revisionSystem.generateRevisionReport(entityType as string);

    res.setHeader('Content-Type', 'text/markdown');
    res.send(report);
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({
      error: 'Failed to generate report',
      details: error.message
    });
  }
});

/**
 * Export revisions
 */
syncRouter.get('/export/:entityType', async (req: Request, res: Response) => {
  try {
    const { entityType } = req.params;
    const { format = 'json' } = req.query;

    const exported = revisionSystem.exportRevisions(
      entityType,
      format as 'json' | 'csv'
    );

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${entityType}-revisions.csv"`);
    }

    res.send(exported);
  } catch (error: any) {
    console.error('Error exporting revisions:', error);
    res.status(500).json({
      error: 'Failed to export revisions',
      details: error.message
    });
  }
});

/**
 * Get network connection statistics
 */
syncRouter.get('/network/stats', async (req: Request, res: Response) => {
  try {
    // This would need wsServer to be injected
    res.json({
      success: true,
      message: 'Network stats endpoint - requires wsServer injection'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to get network stats',
      details: error.message
    });
  }
});

/**
 * Clean up old revisions
 */
syncRouter.post('/cleanup', async (req: Request, res: Response) => {
  try {
    const { entityType, keepVersions = 100 } = req.body;

    // Only allow admins
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        error: 'Unauthorized - admin only'
      });
    }

    const cleaned = revisionSystem.cleanupOldRevisions(entityType, keepVersions);

    res.json({
      success: true,
      message: `Cleaned up ${cleaned} old revisions`,
      cleaned
    });
  } catch (error: any) {
    console.error('Error cleaning up revisions:', error);
    res.status(500).json({
      error: 'Failed to clean up revisions',
      details: error.message
    });
  }
});

export default syncRouter;
