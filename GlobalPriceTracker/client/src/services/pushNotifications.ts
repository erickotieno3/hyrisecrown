/**
 * Push Notification Client Service
 * Manages browser push notifications and subscriptions
 */

export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  store: string;
  targetPrice: number;
  direction: 'up' | 'down';
  createdAt: string;
  active: boolean;
}

export interface NotificationSubscription {
  userId: string;
  subscription: PushSubscription;
  createdAt: string;
  lastUpdated: string;
  active: boolean;
}

class PushNotificationClient {
  private serviceWorkerSupported: boolean;
  private pushSupported: boolean;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.serviceWorkerSupported = 'serviceWorker' in navigator;
    this.pushSupported = 'PushManager' in window && 'Notification' in window;
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return this.serviceWorkerSupported && this.pushSupported;
  }

  /**
   * Check if user has granted notification permissions
   */
  hasPermission(): boolean {
    return Notification.permission === 'granted';
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Push notifications not supported in this browser');
      return false;
    }

    if (this.hasPermission()) {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log(`Notification permission: ${permission}`);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Register service worker
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.serviceWorkerSupported) {
      console.warn('Service Workers not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        { scope: '/' }
      );
      console.log('✅ Service Worker registered:', this.registration);
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(
    userId: string,
    vapidPublicKey: string
  ): Promise<NotificationSubscription | null> {
    try {
      // Register service worker if not done
      if (!this.registration) {
        this.registration = await this.registerServiceWorker();
      }

      if (!this.registration) {
        throw new Error('Service Worker registration failed');
      }

      // Check and request permission
      if (!this.hasPermission()) {
        const granted = await this.requestPermission();
        if (!granted) {
          throw new Error('Notification permission denied by user');
        }
      }

      // Subscribe to push
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('✅ Subscribed to push notifications:', subscription);

      // Send subscription to server
      const result = await this.sendSubscriptionToServer(userId, subscription);
      
      return result;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<boolean> {
    try {
      if (!this.registration) {
        this.registration = await navigator.serviceWorker.ready;
      }

      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('✅ Unsubscribed from push notifications');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  }

  /**
   * Check if user is subscribed
   */
  async isSubscribed(): Promise<boolean> {
    try {
      if (!this.registration) {
        this.registration = await navigator.serviceWorker.ready;
      }

      const subscription = await this.registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Get current subscription
   */
  async getSubscription(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        this.registration = await navigator.serviceWorker.ready;
      }

      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(
    userId: string,
    subscription: PushSubscription
  ): Promise<NotificationSubscription | null> {
    try {
      const response = await fetch('/api/push-notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
              auth: arrayBufferToBase64(subscription.getKey('auth'))
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      return null;
    }
  }

  /**
   * Create price alert
   */
  async createPriceAlert(
    userId: string,
    productId: string,
    productName: string,
    store: string,
    targetPrice: number,
    direction: 'up' | 'down' = 'down'
  ): Promise<PriceAlert | null> {
    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          productId,
          productName,
          store,
          targetPrice,
          direction
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating price alert:', error);
      return null;
    }
  }

  /**
   * Get user's price alerts
   */
  async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    try {
      const response = await fetch(`/api/price-alerts?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching price alerts:', error);
      return [];
    }
  }

  /**
   * Delete price alert
   */
  async deletePriceAlert(alertId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/price-alerts/${alertId}`, {
        method: 'DELETE'
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting price alert:', error);
      return false;
    }
  }

  /**
   * Show local notification (for testing)
   */
  async showLocalNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (!this.hasPermission()) {
      console.warn('Notification permission not granted');
      return;
    }

    if (this.registration && this.registration.active) {
      await this.registration.active.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options
      });
    } else {
      new Notification(title, options);
    }
  }

  /**
   * Request notification badge
   */
  async showBadge(count: number = 1): Promise<void> {
    if ('setAppBadge' in navigator) {
      try {
        await navigator.setAppBadge(count);
      } catch (error) {
        console.error('Error setting app badge:', error);
      }
    }
  }

  /**
   * Clear notification badge
   */
  async clearBadge(): Promise<void> {
    if ('clearAppBadge' in navigator) {
      try {
        await navigator.clearAppBadge();
      } catch (error) {
        console.error('Error clearing app badge:', error);
      }
    }
  }

  /**
   * Helper: Convert VAPID public key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

/**
 * Helper: Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Export singleton instance
export const pushNotificationClient = new PushNotificationClient();

export default PushNotificationClient;
