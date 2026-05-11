import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { pushNotificationClient, type PriceAlert } from '@/services/pushNotifications';
import { Bell, BellOff, Trash2, Plus, AlertCircle } from 'lucide-react';

interface PriceAlertsProps {
  onAlertCreated?: (alert: PriceAlert) => void;
}

export const PriceAlerts: React.FC<PriceAlertsProps> = ({ onAlertCreated }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notificationSupported] = useState(pushNotificationClient.isSupported());

  // Form state
  const [formData, setFormData] = useState({
    productName: '',
    store: '',
    targetPrice: '',
    direction: 'down' as const
  });

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Initialize push notifications
  useEffect(() => {
    if (!user) return;

    const initializePushNotifications = async () => {
      setIsLoading(true);
      try {
        // Check if already subscribed
        const subscribed = await pushNotificationClient.isSubscribed();
        setIsSubscribed(subscribed);

        // Load user's price alerts
        const userAlerts = await pushNotificationClient.getPriceAlerts(user.id);
        setAlerts(userAlerts);

        if (subscribed && !pushNotificationClient.hasPermission()) {
          setFeedback({
            type: 'info',
            message: 'Notification permissions may have been revoked. Re-subscribe to enable alerts.'
          });
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
        setFeedback({
          type: 'error',
          message: 'Failed to load notifications. Please refresh the page.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializePushNotifications();
  }, [user]);

  const handleSubscribe = async () => {
    if (!notificationSupported) {
      setFeedback({
        type: 'error',
        message: 'Push notifications are not supported in your browser'
      });
      return;
    }

    setIsLoading(true);
    try {
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
      
      if (!vapidPublicKey) {
        setFeedback({
          type: 'error',
          message: 'Push notification service not configured'
        });
        return;
      }

      const subscription = await pushNotificationClient.subscribeToPush(user!.id, vapidPublicKey);
      
      if (subscription) {
        setIsSubscribed(true);
        setFeedback({
          type: 'success',
          message: 'Successfully subscribed to price alerts!'
        });
      } else {
        setFeedback({
          type: 'error',
          message: 'Failed to subscribe to notifications'
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to subscribe'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const success = await pushNotificationClient.unsubscribeFromPush();
      if (success) {
        setIsSubscribed(false);
        setFeedback({
          type: 'success',
          message: 'Unsubscribed from price alerts'
        });
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setFeedback({
        type: 'error',
        message: 'Failed to unsubscribe'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSubscribed) {
      setFeedback({
        type: 'error',
        message: 'You must subscribe to notifications first'
      });
      return;
    }

    if (!formData.productName || !formData.store || !formData.targetPrice) {
      setFeedback({
        type: 'error',
        message: 'Please fill in all fields'
      });
      return;
    }

    setIsLoading(true);
    try {
      const alert = await pushNotificationClient.createPriceAlert(
        user!.id,
        `${formData.productName.toLowerCase()}-${formData.store.toLowerCase()}`,
        formData.productName,
        formData.store,
        parseFloat(formData.targetPrice),
        formData.direction
      );

      if (alert) {
        setAlerts([...alerts, alert]);
        setFormData({ productName: '', store: '', targetPrice: '', direction: 'down' });
        setShowForm(false);
        setFeedback({
          type: 'success',
          message: `Price alert created for ${formData.productName}`
        });
        
        if (onAlertCreated) {
          onAlertCreated(alert);
        }
      }
    } catch (error) {
      console.error('Alert creation error:', error);
      setFeedback({
        type: 'error',
        message: 'Failed to create price alert'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    setIsLoading(true);
    try {
      const success = await pushNotificationClient.deletePriceAlert(alertId);
      if (success) {
        setAlerts(alerts.filter(a => a.id !== alertId));
        setFeedback({
          type: 'success',
          message: 'Price alert deleted'
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setFeedback({
        type: 'error',
        message: 'Failed to delete alert'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!notificationSupported) {
    return (
      <Card className="w-full border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-5 w-5" />
            Push Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-800">
            Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Subscription Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {isSubscribed ? <Bell className="h-5 w-5 text-green-600" /> : <BellOff className="h-5 w-5 text-gray-400" />}
              Price Notifications
            </span>
            {isSubscribed && <span className="text-sm font-normal text-green-600">Active</span>}
          </CardTitle>
          <CardDescription>
            Get instant alerts when product prices change
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedback && (
            <div className={`p-3 border rounded ${
              feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              feedback.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              {feedback.message}
            </div>
          )}

          {!isSubscribed ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Enable price alerts to receive notifications when products go on sale or reach your target price.
              </p>
              <Button 
                onClick={handleSubscribe} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Enabling...' : 'Enable Price Alerts'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                ✓ You're receiving price notifications
              </p>
              <Button 
                onClick={handleUnsubscribe} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Disabling...' : 'Disable Price Alerts'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Alert */}
      {isSubscribed && (
        <>
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Alert
            </Button>
          )}

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>New Price Alert</CardTitle>
                <CardDescription>
                  Set up an alert for when a product reaches your target price
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAlert} className="space-y-4">
                  <div>
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      placeholder="e.g., Whole Milk 1L"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="store">Store *</Label>
                    <Input
                      id="store"
                      placeholder="e.g., Tesco, Sainsbury's, Asda"
                      value={formData.store}
                      onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="targetPrice">Target Price (£) *</Label>
                      <Input
                        id="targetPrice"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 1.50"
                        value={formData.targetPrice}
                        onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="direction">Alert When Price *</Label>
                      <select
                        id="direction"
                        value={formData.direction}
                        onChange={(e) => setFormData({ ...formData, direction: e.target.value as 'up' | 'down' })}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="down">Drops to</option>
                        <option value="up">Rises to</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Creating...' : 'Create Alert'}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Active Alerts List */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Price Alerts ({alerts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.productName}</p>
                    <p className="text-sm text-gray-600">
                      {alert.store} · Alert when {alert.direction === 'down' ? '≤' : '≥'} £{alert.targetPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAlert(alert.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isSubscribed && alerts.length === 0 && !showForm && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <Bell className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 mb-3">No price alerts yet</p>
            <Button 
              onClick={() => setShowForm(true)}
              variant="outline"
            >
              Create Your First Alert
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PriceAlerts;
