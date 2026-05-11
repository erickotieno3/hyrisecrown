/**
 * Push Notification Service
 * Sends push notifications for price alerts and deals
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const logsDir = path.join(__dirname, '..', 'logs');

class PushNotificationService {
  constructor() {
    this.ensureDirectories();
    this.subscriptions = this.loadSubscriptions();
    this.notificationLog = [];
  }

  ensureDirectories() {
    [dataDir, logsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Load user subscriptions from storage
   */
  loadSubscriptions() {
    const subFile = path.join(dataDir, 'push-subscriptions.json');
    try {
      if (fs.existsSync(subFile)) {
        return JSON.parse(fs.readFileSync(subFile, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error.message);
    }
    return {
      users: [],
      priceAlerts: [],
      storeAlerts: []
    };
  }

  /**
   * Save subscriptions
   */
  saveSubscriptions() {
    const subFile = path.join(dataDir, 'push-subscriptions.json');
    fs.writeFileSync(subFile, JSON.stringify(this.subscriptions, null, 2));
  }

  /**
   * Add user subscription (called from frontend when user opts in)
   */
  addUserSubscription(userId, subscription) {
    const existing = this.subscriptions.users.find(u => u.userId === userId);
    
    if (existing) {
      existing.subscription = subscription;
      existing.lastUpdated = new Date().toISOString();
    } else {
      this.subscriptions.users.push({
        userId,
        subscription,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        active: true
      });
    }

    this.saveSubscriptions();
    console.log(`✅ Subscription added for user: ${userId}`);
    return this.subscriptions.users.find(u => u.userId === userId);
  }

  /**
   * Add price alert for a user
   */
  addPriceAlert(userId, productId, productName, store, targetPrice, direction = 'down') {
    const alert = {
      id: `alert-${Date.now()}`,
      userId,
      productId,
      productName,
      store,
      targetPrice,
      direction, // 'up' or 'down'
      createdAt: new Date().toISOString(),
      active: true,
      notificationsSent: 0
    };

    this.subscriptions.priceAlerts.push(alert);
    this.saveSubscriptions();
    console.log(`✅ Price alert created: ${productName} at ${store} ${direction === 'down' ? '≤' : '≥'} £${targetPrice}`);
    return alert;
  }

  /**
   * Add store alert
   */
  addStoreAlert(userId, storeName, frequency = 'daily') {
    const alert = {
      id: `store-alert-${Date.now()}`,
      userId,
      storeName,
      frequency, // 'daily', 'weekly', or 'on-change'
      createdAt: new Date().toISOString(),
      active: true,
      lastNotified: null
    };

    this.subscriptions.storeAlerts.push(alert);
    this.saveSubscriptions();
    console.log(`✅ Store alert created: ${storeName} (${frequency})`);
    return alert;
  }

  /**
   * Prepare notification payload
   */
  createNotification(type, data) {
    const basePayload = {
      timestamp: new Date().toISOString(),
      tags: [type],
      requireInteraction: false
    };

    switch (type) {
      case 'price-drop':
        return {
          ...basePayload,
          title: '💰 Price Drop Alert!',
          body: `${data.productName} at ${data.store} is now £${data.newPrice} (was £${data.oldPrice})`,
          badge: '/assets/icon-192x192.png',
          icon: '/assets/icon-192x192.png',
          data: {
            url: `/products/${data.productId}`,
            action: 'view_product',
            productId: data.productId,
            store: data.store
          }
        };

      case 'price-target-reached':
        return {
          ...basePayload,
          title: '🎯 Your Price Target Met!',
          body: `${data.productName} at ${data.store} reached your target of £${data.targetPrice}`,
          badge: '/assets/icon-192x192.png',
          icon: '/assets/icon-192x192.png',
          data: {
            url: `/products/${data.productId}`,
            action: 'buy_now',
            productId: data.productId
          }
        };

      case 'great-deal':
        return {
          ...basePayload,
          title: '🔥 Amazing Deal Found!',
          body: `${data.productName} - Save £${data.savings} vs other stores!`,
          badge: '/assets/icon-192x192.png',
          icon: '/assets/icon-192x192.png',
          data: {
            url: '/deals',
            action: 'view_deals'
          }
        };

      case 'store-update':
        return {
          ...basePayload,
          title: `📦 ${data.storeName} Price Update`,
          body: `${data.updateCount} products updated at ${data.storeName}`,
          badge: '/assets/icon-192x192.png',
          icon: '/assets/icon-192x192.png',
          data: {
            url: `/store/${data.storeId}`,
            action: 'view_store'
          }
        };

      case 'back-in-stock':
        return {
          ...basePayload,
          title: '📍 Back in Stock!',
          body: `${data.productName} is back in stock at ${data.store}`,
          badge: '/assets/icon-192x192.png',
          icon: '/assets/icon-192x192.png',
          data: {
            url: `/products/${data.productId}`,
            action: 'view_product'
          }
        };

      default:
        return {
          ...basePayload,
          title: 'Global Price Tracker',
          body: data.message || 'New update available'
        };
    }
  }

  /**
   * Send notification to user (would use web push service in production)
   */
  async sendNotificationToUser(userId, notificationType, data) {
    const user = this.subscriptions.users.find(u => u.userId === userId && u.active);
    
    if (!user) {
      console.log(`⚠️  No active subscription for user: ${userId}`);
      return { sent: false, reason: 'no_subscription' };
    }

    const notification = this.createNotification(notificationType, data);
    
    // In production, would send via web push service (Firebase Cloud Messaging, etc.)
    // For now, log the notification
    this.notificationLog.push({
      userId,
      type: notificationType,
      notification,
      sentAt: new Date().toISOString(),
      status: 'logged' // Would be 'sent' in production
    });

    console.log(`📲 Notification prepared for ${userId}: ${notification.title}`);
    return {
      sent: true,
      notificationId: `notif-${Date.now()}`,
      notification
    };
  }

  /**
   * Process price changes and send relevant notifications
   */
  async processPriceChanges(priceChanges) {
    console.log(`\n📢 Processing ${priceChanges.length} price changes for notifications...\n`);

    const sentNotifications = [];

    for (const change of priceChanges) {
      // Check for price drop alerts
      if (change.direction === 'down') {
        const relevantAlerts = this.subscriptions.priceAlerts.filter(
          alert => alert.active && alert.productId === change.productId && alert.store === change.store
        );

        for (const alert of relevantAlerts) {
          if (change.newPrice <= alert.targetPrice) {
            const result = await this.sendNotificationToUser(alert.userId, 'price-target-reached', {
              productName: change.productName,
              store: change.store,
              newPrice: change.newPrice,
              targetPrice: alert.targetPrice,
              productId: change.productId
            });

            if (result.sent) {
              alert.notificationsSent += 1;
              sentNotifications.push(result);
            }
          }
        }

        // Send generic price drop notification
        const priceDropAlerts = this.subscriptions.priceAlerts.filter(
          a => a.active && a.productName.toLowerCase().includes(change.productName.toLowerCase()) && a.direction === 'down'
        );

        for (const alert of priceDropAlerts) {
          const result = await this.sendNotificationToUser(alert.userId, 'price-drop', {
            productName: change.productName,
            store: change.store,
            newPrice: change.newPrice,
            oldPrice: change.oldPrice,
            productId: change.productId
          });

          if (result.sent) {
            sentNotifications.push(result);
          }
        }
      }
    }

    console.log(`✅ Processed notifications for price changes\n`);
    return sentNotifications;
  }

  /**
   * Send deal notifications based on comparison data
   */
  async sendDealNotifications(priceComparison) {
    console.log(`\n🎁 Processing deal notifications...\n`);

    const sentNotifications = [];
    const SAVINGS_THRESHOLD = 1.0; // Minimum £1 savings

    for (const [key, comparison] of Object.entries(priceComparison)) {
      if (comparison.stores.length > 1) {
        const savings = parseFloat(comparison.savingsPotential);
        
        if (savings >= SAVINGS_THRESHOLD) {
          // Find users interested in this product
          const interestedUsers = this.subscriptions.priceAlerts
            .filter(a => a.active && a.productName.toLowerCase().includes(comparison.productName.toLowerCase()))
            .map(a => a.userId);

          for (const userId of [...new Set(interestedUsers)]) {
            const result = await this.sendNotificationToUser(userId, 'great-deal', {
              productName: comparison.productName,
              cheapestStore: comparison.cheapest.store,
              mostExpensiveStore: comparison.mostExpensive.store,
              savings: comparison.savingsPotential,
              cheapestPrice: comparison.cheapest.price
            });

            if (result.sent) {
              sentNotifications.push(result);
            }
          }
        }
      }
    }

    console.log(`✅ Deal notifications processed\n`);
    return sentNotifications;
  }

  /**
   * Get notifications for user
   */
  getUserNotifications(userId, limit = 20) {
    return this.notificationLog
      .filter(n => n.userId === userId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Save notification log
   */
  saveNotificationLog() {
    const logFile = path.join(logsDir, 'push-notifications.log');
    fs.writeFileSync(logFile, JSON.stringify(this.notificationLog, null, 2));
    console.log(`✅ Notification log saved to ${logFile}`);
  }

  /**
   * Generate summary
   */
  generateSummary() {
    return {
      timestamp: new Date().toISOString(),
      totalSubscriptions: this.subscriptions.users.length,
      activePriceAlerts: this.subscriptions.priceAlerts.filter(a => a.active).length,
      activeStoreAlerts: this.subscriptions.storeAlerts.filter(a => a.active).length,
      notificationsSent: this.notificationLog.length,
      notificationLog: this.notificationLog
    };
  }

  /**
   * Run notification service with price changes
   */
  async run(priceChangesFile = null, priceComparisonFile = null) {
    console.log('═════════════════════════════════════════════');
    console.log('  PUSH NOTIFICATION SERVICE');
    console.log('═════════════════════════════════════════════\n');

    try {
      let priceChanges = [];
      let priceComparison = {};

      // Load price changes if available
      if (priceChangesFile) {
        const file = path.join(dataDir, priceChangesFile);
        if (fs.existsSync(file)) {
          priceChanges = JSON.parse(fs.readFileSync(file, 'utf-8'));
        }
      } else {
        // Try default file
        const defaultFile = path.join(dataDir, 'price-changes.json');
        if (fs.existsSync(defaultFile)) {
          priceChanges = JSON.parse(fs.readFileSync(defaultFile, 'utf-8'));
        }
      }

      // Load price comparison if available
      if (priceComparisonFile) {
        const file = path.join(dataDir, priceComparisonFile);
        if (fs.existsSync(file)) {
          priceComparison = JSON.parse(fs.readFileSync(file, 'utf-8'));
        }
      } else {
        const defaultFile = path.join(dataDir, 'price-comparison.json');
        if (fs.existsSync(defaultFile)) {
          priceComparison = JSON.parse(fs.readFileSync(defaultFile, 'utf-8'));
        }
      }

      // Process price changes
      if (priceChanges.length > 0) {
        await this.processPriceChanges(priceChanges);
      }

      // Send deal notifications
      if (Object.keys(priceComparison).length > 0) {
        await this.sendDealNotifications(priceComparison);
      }

      // Save logs
      this.saveSubscriptions();
      this.saveNotificationLog();

      // Generate and save summary
      const summary = this.generateSummary();
      fs.writeFileSync(
        path.join(dataDir, 'notification-summary.json'),
        JSON.stringify(summary, null, 2)
      );

      console.log('═════════════════════════════════════════════');
      console.log(`  ✅ Notification Service Completed`);
      console.log(`  📊 Subscriptions: ${this.subscriptions.users.length}`);
      console.log(`  🔔 Price Alerts: ${this.subscriptions.priceAlerts.filter(a => a.active).length}`);
      console.log(`  📢 Notifications: ${this.notificationLog.length}`);
      console.log('═════════════════════════════════════════════\n');

      return summary;
    } catch (error) {
      console.error('❌ Error in notification service:', error);
      process.exit(1);
    }
  }
}

export default PushNotificationService;

// Run if called directly
const service = new PushNotificationService();
await service.run();
