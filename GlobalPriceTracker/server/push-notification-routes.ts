/**
 * Push Notification Routes
 * Handles subscription management and notification sending
 */

import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// In-memory store (in production, use database)
let subscriptions = [];
let priceAlerts = [];

// Load persisted data on startup
const loadData = () => {
  const dataDir = path.join(process.cwd(), 'data');
  
  try {
    const subFile = path.join(dataDir, 'push-subscriptions.json');
    if (fs.existsSync(subFile)) {
      const data = JSON.parse(fs.readFileSync(subFile, 'utf-8'));
      subscriptions = data.users || [];
      priceAlerts = data.priceAlerts || [];
    }
  } catch (error) {
    console.error('Error loading subscription data:', error.message);
  }
};

// Save data periodically
const saveData = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  try {
    fs.writeFileSync(
      path.join(dataDir, 'push-subscriptions.json'),
      JSON.stringify({
        users: subscriptions,
        priceAlerts: priceAlerts,
        lastUpdated: new Date().toISOString()
      }, null, 2)
    );
  } catch (error) {
    console.error('Error saving subscription data:', error.message);
  }
};

// Load data on initialization
loadData();

/**
 * POST /api/push-notifications/subscribe
 * Subscribe user to push notifications
 */
router.post('/subscribe', (req, res) => {
  try {
    const { userId, subscription } = req.body;

    if (!userId || !subscription) {
      return res.status(400).json({ error: 'Missing userId or subscription' });
    }

    // Find and update or create subscription
    const existingIndex = subscriptions.findIndex(s => s.userId === userId);
    const newSubscription = {
      userId,
      subscription,
      createdAt: existingIndex === -1 ? new Date().toISOString() : subscriptions[existingIndex].createdAt,
      lastUpdated: new Date().toISOString(),
      active: true
    };

    if (existingIndex === -1) {
      subscriptions.push(newSubscription);
      console.log(`✅ New subscription: ${userId}`);
    } else {
      subscriptions[existingIndex] = newSubscription;
      console.log(`✅ Updated subscription: ${userId}`);
    }

    saveData();
    res.json({
      ...newSubscription,
      message: 'Successfully subscribed to notifications'
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Subscription failed' });
  }
});

/**
 * POST /api/push-notifications/unsubscribe
 * Unsubscribe user from push notifications
 */
router.post('/unsubscribe', (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const index = subscriptions.findIndex(s => s.userId === userId);
    if (index !== -1) {
      subscriptions[index].active = false;
      console.log(`✅ Unsubscribed: ${userId}`);
      saveData();
      res.json({ message: 'Successfully unsubscribed' });
    } else {
      res.status(404).json({ error: 'Subscription not found' });
    }
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Unsubscribe failed' });
  }
});

/**
 * GET /api/push-notifications/status/:userId
 * Get subscription status for user
 */
router.get('/status/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const subscription = subscriptions.find(s => s.userId === userId);

    if (!subscription) {
      return res.json({ subscribed: false, message: 'No subscription found' });
    }

    res.json({
      subscribed: subscription.active,
      createdAt: subscription.createdAt,
      lastUpdated: subscription.lastUpdated
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Status check failed' });
  }
});

/**
 * POST /api/price-alerts
 * Create a new price alert
 */
router.post('/price-alerts', (req, res) => {
  try {
    const { userId, productId, productName, store, targetPrice, direction } = req.body;

    if (!userId || !productId || !productName || !store || !targetPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      productId,
      productName,
      store,
      targetPrice: parseFloat(targetPrice),
      direction: direction || 'down',
      createdAt: new Date().toISOString(),
      active: true,
      notificationsSent: 0
    };

    priceAlerts.push(alert);
    saveData();

    console.log(`✅ Price alert created: ${productName} at ${store} ${direction === 'down' ? '≤' : '≥'} £${targetPrice}`);
    res.json(alert);
  } catch (error) {
    console.error('Price alert creation error:', error);
    res.status(500).json({ error: 'Failed to create price alert' });
  }
});

/**
 * GET /api/price-alerts
 * Get price alerts for user
 */
router.get('/price-alerts', (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const userAlerts = priceAlerts.filter(
      a => a.userId === userId && a.active
    );

    res.json(userAlerts);
  } catch (error) {
    console.error('Get price alerts error:', error);
    res.status(500).json({ error: 'Failed to retrieve price alerts' });
  }
});

/**
 * DELETE /api/price-alerts/:alertId
 * Delete a price alert
 */
router.delete('/price-alerts/:alertId', (req, res) => {
  try {
    const { alertId } = req.params;
    const index = priceAlerts.findIndex(a => a.id === alertId);

    if (index === -1) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const alert = priceAlerts[index];
    priceAlerts[index].active = false;
    saveData();

    console.log(`✅ Price alert deleted: ${alert.productName}`);
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete price alert' });
  }
});

/**
 * POST /api/notifications/test
 * Send a test notification to user
 */
router.post('/test', async (req, res) => {
  try {
    const { userId, title, body } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ error: 'Missing userId or title' });
    }

    const subscription = subscriptions.find(s => s.userId === userId && s.active);
    if (!subscription) {
      return res.status(404).json({ error: 'User subscription not found' });
    }

    // In production, send via web push service (Firebase Cloud Messaging, etc.)
    console.log(`📲 Test notification prepared: "${title}" for ${userId}`);

    res.json({
      message: 'Test notification prepared',
      notificationId: `test-${Date.now()}`,
      user: userId,
      notification: { title, body }
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

/**
 * GET /api/notifications/summary
 * Get notification summary and statistics
 */
router.get('/summary', (req, res) => {
  try {
    const activeSubscriptions = subscriptions.filter(s => s.active);
    const activeAlerts = priceAlerts.filter(a => a.active);

    res.json({
      timestamp: new Date().toISOString(),
      subscriptions: {
        total: subscriptions.length,
        active: activeSubscriptions.length,
        inactive: subscriptions.filter(s => !s.active).length
      },
      priceAlerts: {
        total: priceAlerts.length,
        active: activeAlerts.length,
        byDirection: {
          down: activeAlerts.filter(a => a.direction === 'down').length,
          up: activeAlerts.filter(a => a.direction === 'up').length
        }
      },
      stores: [...new Set(activeAlerts.map(a => a.store))],
      products: [...new Set(activeAlerts.map(a => a.productName))]
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Periodic data save
setInterval(saveData, 5 * 60 * 1000); // Save every 5 minutes

export default router;
