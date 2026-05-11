# Real-Time Price Fetcher & Push Notifications Guide

## Overview

This comprehensive guide covers the real-time price fetching and push notification system for Global Price Tracker. Users now receive instant alerts when products drop in price at major supermarket chains.

**Key Features:**
- ✅ Real-time price fetching from multiple supermarket chains
- ✅ Intelligent price comparison across stores
- ✅ Push notifications for price drops and deals
- ✅ Automatic price alert detection (configurable thresholds)
- ✅ User-defined price targets
- ✅ Store-specific monitoring
- ✅ Offline-capable notifications (Service Worker)
- ✅ Automatic data persistence

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Real-Time Price Fetcher](#real-time-price-fetcher)
3. [Push Notification Service](#push-notification-service)
4. [Frontend Implementation](#frontend-implementation)
5. [Backend Routes](#backend-routes)
6. [Setup & Configuration](#setup--configuration)
7. [Usage Examples](#usage-examples)
8. [Monitoring & Logs](#monitoring--logs)
9. [Troubleshooting](#troubleshooting)
10. [Performance Optimization](#performance-optimization)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER (PWA)                       │
├─────────────────────────────────────────────────────────────┤
│  • PriceAlerts.tsx (React Component)                        │
│  • pushNotifications.ts (Client Service)                    │
│  • Service Worker (Push & Notifications)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS BACKEND                          │
├─────────────────────────────────────────────────────────────┤
│  • push-notification-routes.ts (API Endpoints)              │
│  • Subscription Management                                  │
│  • Price Alert Persistence                                 │
│  • Webhook Support (optional)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Scheduled Jobs (GitHub Actions)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  AUTOMATION SCRIPTS                         │
├─────────────────────────────────────────────────────────────┤
│  1. real-time-price-fetcher.mjs                            │
│     ↓ Fetches from Tesco, Sainsbury's, Asda, Walmart       │
│  2. push-notification-service.mjs                          │
│     ↓ Processes price changes → Sends notifications         │
│  3. auto-commit-push.mjs                                    │
│     ↓ Commits and pushes to GitHub                          │
│  4. enhanced-price-workflow.mjs (Orchestrator)             │
│     └ Runs all above in sequence                            │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Data Directory (/data)     │
        ├──────────────────────────────┤
        │ • real-time-prices.json      │
        │ • price-comparison.json      │
        │ • price-changes.json         │
        │ • price-fetch-summary.json   │
        │ • push-subscriptions.json    │
        │ • notification-summary.json  │
        └──────────────────────────────┘
```

---

## Real-Time Price Fetcher

### File Location
`scripts/real-time-price-fetcher.mjs`

### Supported Stores

Currently integrates with or mocks:
- **Tesco** (UK) - Sample products: Milk, Bread, Cheese, Eggs, Condiments
- **Sainsbury's** (UK) - Premium dairy and household items
- **Asda** (UK) - Value-range products
- **Walmart** (USA) - American pricing
- **eBay UK** (UK Marketplace) - Electronics, Accessories, Consumer Goods - *Publicly available API*
- **eBay US** (USA Marketplace) - Gaming, Electronics, Audio, Computing - *Publicly available API*
- **Extensible** - Easy to add more stores

### How It Works

#### 1. **Price Fetching**
```mermaid
Fetch Store Data → Parse Products → Calculate Prices → Compare Across Stores
```

Each store provides:
- Product ID, Name, Category
- Current Price + Original Price
- Stock Level
- Barcode (for reference)
- Store Location

#### 2. **Price Comparison Algorithm**
```javascript
For each product name:
  - Collect prices from all stores
  - Sort by price (cheapest first)
  - Calculate savings gap (most expensive - cheapest)
  - Flag if savings > £1
```

#### 3. **Change Detection**
When previous data exists:
- Compare old price vs new price
- If change > 15% → Flag as significant
- Direction: 'up' (price increase) or 'down' (price drop)
- Generate notifications for users watching

### Output Files

| File | Purpose | Example |
|------|---------|---------|
| `data/real-time-prices.json` | All fetched products | `[{id, name, price, store, ...}]` |
| `data/price-comparison.json` | Cross-store comparison | `{product: {cheapest, most expensive, stores[]}}` |
| `data/price-changes.json` | Significant price movements | `[{productId, direction, percentChange, ...}]` |
| `data/price-fetch-summary.json` | Execution summary | `{timestamp, totalProducts, storesMonitored, topSavings}` |

### Running Standalone

```bash
# Fetch real-time prices from all stores
npm run price:fetch

# Output
📦 Fetching real-time prices from major chains...
🌐 Fetching Tesco prices...
📦 Fetched 1250 products from 8 stores

🎯 TOP SAVINGS OPPORTUNITIES:
1. Whole Milk 1L
   Cheapest: Asda - £1.40
   Most Expensive: Sainsbury's - £1.65
   💰 Save: £0.25

✅ Real-time price fetch completed
```

---

## Push Notification Service

### File Location
`scripts/push-notification-service.mjs`

### System Components

#### 1. **User Subscriptions**
Store per-user push notification endpoints securely
```json
{
  "users": [
    {
      "userId": "user123",
      "subscription": {
        "endpoint": "https://fcm.googleapis.com/...",
        "keys": { "p256dh": "...", "auth": "..." }
      },
      "createdAt": "2026-03-17T10:00:00Z",
      "active": true
    }
  ]
}
```

#### 2. **Price Alerts**
User-defined alerts for specific products and stores
```json
{
  "priceAlerts": [
    {
      "id": "alert-1234567890",
      "userId": "user123",
      "productId": "tesco-001",
      "productName": "Whole Milk 1L",
      "store": "Tesco",
      "targetPrice": 1.50,
      "direction": "down",  // alert when price drops TO this
      "active": true
    }
  ]
}
```

#### 3. **Notification Types**

**Price Drop Alert**
```
Title: 💰 Price Drop Alert!
Body: Whole Milk 1L at Tesco is now £1.40 (was £1.60)
Action: View product
```

**Price Target Met**
```
Title: 🎯 Your Price Target Met!
Body: Whole Milk 1L at Tesco reached your target of £1.50
Action: Buy now
```

**Great Deal Found**
```
Title: 🔥 Amazing Deal Found!
Body: Whole Milk 1L - Save £0.25 vs other stores!
Action: View deals
```

**Store Update**
```
Title: 📦 Tesco Price Update
Body: 45 products updated at Tesco
Action: View store
```

**Back in Stock**
```
Title: 📍 Back in Stock!
Body: Product X is back in stock at Store Y
Action: View product
```

### Processing Logic

```javascript
Detect Price Changes
  ├─ For each significant change
  ├─ Find users with matching alerts
  └─ If price meets target → Send notification

Compare Prices
  ├─ Group products by name
  ├─ Calculate savings vs competitor
  └─ If savings > £1 → Send to interested users

Send Notifications
  ├─ Check user subscription
  ├─ Create notification payload
  └─ Log for persistence
```

### Output Files

| File | Purpose |
|------|---------|
| `data/push-subscriptions.json` | User subscriptions + alerts |
| `data/notification-summary.json` | Daily notification stats |
| `logs/push-notifications.log` | Detailed notification log |

### Running Standalone

```bash
# Process price changes and send notifications
npm run price:notify

# Output
📢 Processing 8 price changes for notifications...

🔔 PRICE CHANGES DETECTED (8):

📈 Whole Milk 1L at Tesco
   £1.60 → £1.80 (12.5%)

📉 Bread 800g at Sainsbury's
   £1.10 → £0.95 (13.6%)

📲 Notification prepared for user123: 💰 Price Drop Alert!

✅ Notification Service Completed
  Subscriptions: 152
  Price Alerts: 428
  Notifications: 12
```

---

## Frontend Implementation

### PriceAlerts Component

**Location:** `client/src/components/PriceAlerts.tsx`

**Features:**
- Subscribe/unsubscribe to push notifications
- Create price alerts for specific products
- View active alerts with targets
- Delete alerts
- Real-time status indicator

**Usage in App:**
```tsx
import PriceAlerts from '@/components/PriceAlerts';

export function App() {
  return (
    <div>
      <PriceAlerts 
        onAlertCreated={(alert) => console.log('Alert created:', alert)} 
      />
    </div>
  );
}
```

### Push Notification Service

**Location:** `client/src/services/pushNotifications.ts`

**Client API:**
```typescript
// Initialize and check support
const client = pushNotificationClient;
client.isSupported(); // boolean
client.hasPermission(); // boolean

// Request permission and subscribe
await client.requestPermission();
await client.subscribeToPush(userId, vapidPublicKey);

// Manage alerts
await client.createPriceAlert(userId, productId, name, store, targetPrice, 'down');
await client.getPriceAlerts(userId);
await client.deletePriceAlert(alertId);

// Utilities
await client.showLocalNotification('Title', { body: '...' });
await client.showBadge(5);
await client.clearBadge();
```

### Service Worker Integration

**Location:** `mobile-app/service-worker.js`

**Handles:**
- `push` event: Receive and display notifications
- `notificationclick` event: Handle user interactions
- `notificationclose` event: Track dismissed notifications
- `message` event: Receive messages from frontend

---

## Backend Routes

### API Endpoints

#### Push Subscription Endpoints

**POST `/api/push-notifications/subscribe`**
Subscribe user to push notifications
```bash
curl -X POST http://localhost:5000/api/push-notifications/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "subscription": {
      "endpoint": "https://...",
      "keys": { "p256dh": "...", "auth": "..." }
    }
  }'
```

**POST `/api/push-notifications/unsubscribe`**
Unsubscribe user
```bash
curl -X POST http://localhost:5000/api/push-notifications/unsubscribe \
  -d '{"userId": "user123"}'
```

**GET `/api/push-notifications/status/:userId`**
Check subscription status
```bash
curl http://localhost:5000/api/push-notifications/status/user123
```

#### Price Alert Endpoints

**POST `/api/price-alerts`**
Create price alert
```bash
curl -X POST http://localhost:5000/api/price-alerts \
  -d '{
    "userId": "user123",
    "productId": "tesco-001",
    "productName": "Milk 1L",
    "store": "Tesco",
    "targetPrice": 1.50,
    "direction": "down"
  }'
```

**GET `/api/price-alerts?userId=user123`**
Get user's price alerts
```bash
curl "http://localhost:5000/api/price-alerts?userId=user123"
```

**DELETE `/api/price-alerts/:alertId`**
Delete alert
```bash
curl -X DELETE http://localhost:5000/api/price-alerts/alert-123
```

#### Utility Endpoints

**POST `/api/notifications/test`**
Send test notification
```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -d '{
    "userId": "user123",
    "title": "Test Notification",
    "body": "This is a test"
  }'
```

**GET `/api/notifications/summary`**
Get system statistics
```bash
curl http://localhost:5000/api/notifications/summary
```

---

## Setup & Configuration

### 1. Environment Variables

Create `.env` file with:
```env
# Push Notifications (generate from Firebase Console or similar)
VITE_VAPID_PUBLIC_KEY=BF...  # Public key for client-side subscription

# eBay API (Optional - for real eBay data)
EBAY_APP_ID=your_ebay_app_id  # Get free from https://developer.ebay.com/

# Server-side (not in git)
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=...  # mailto:your@email.com
```

### 1a. eBay API Integration (Optional)

eBay provides **free, publicly available APIs** for price tracking and shopping:

#### Option A: eBay Shopping API (Recommended for Price Tracking)
- **Status**: Publicly available, free tier available
- **Registration**: https://developer.ebay.com/
- **Steps**:
  1. Sign up for eBay Developer Account (free)
  2. Navigate to **My Account → Keys & Tokens**
  3. Copy your **App ID** (formerly called AppName)
  4. Add to `.env`: `EBAY_APP_ID=your_app_id`
  5. Works for basic price searches and product information
  
**Current Implementation**: Uses mock data. To enable real eBay API:
- Set `EBAY_APP_ID` environment variable
- Modify `fetchEbayUKData()` and `fetchEbayUSData()` in `scripts/real-time-price-fetcher.mjs`
- Use endpoint: `https://svcs.ebay.com/services/search/FindingService/v1`
- Example API call:
```bash
curl "https://svcs.ebay.com/services/search/FindingService/v1?
  OPERATION-NAME=findItemsAdvanced&
  SERVICE-VERSION=1.0.0&
  SECURITY-APPNAME=YOUR_APP_ID&
  RESPONSE-DATA-FORMAT=JSON&
  REST-PAYLOAD&
  keywords=laptop" \
  -H "Accept: application/json"
```

#### Option B: eBay Browse API (Modern, OAuth Required)
- **Status**: Public API, requires OAuth authentication
- **Capabilities**: Full product browsing, ratings, detailed listings
- **Setup**: More complex, but more comprehensive data
- **Documentation**: https://developer.ebay.com/api-docs/buy/browse/overview.html

#### Option C: eBay Commerce Catalog API (Product Reference)
- **Status**: Public API for product information
- **Use Case**: Product details, categories, specifications
- **Documentation**: https://developer.ebay.com/api-docs/buy/catalog/overview.html

#### Example Mock vs Real Data

**Current Mock Data** (No API key required):
```javascript
{
  id: 'ebay-uk-001',
  name: 'iPhone 12 64GB',
  price: 189.99,
  store: 'eBay UK',
  seller: 'Electronics Seller'
}
```

**Real eBay Data** (With API key):
```javascript
{
  id: 'ebay-uk-001',
  itemId: '123456789',
  title: 'iPhone 12 64GB Used - Great Condition',
  price: 189.99,
  currency: 'GBP',
  store: 'eBay UK',
  seller: 'Electronics Seller',
  sellerFeedback: 98.5,
  condition: 'Used',
  shippingPrice: 0,
  viewCount: 1250,
  soldCount: 89
}
```

#### Legal & Use Rights
✅ **eBay API is free and legal to use for**:
- Personal price monitoring
- App development
- Business analytics
- Educational purposes

⚠️ **Follow eBay Developer Terms**:
- Comply with eBay's API Terms of Service
- Don't scrape website (use official API only)
- Respect rate limits (100 calls per session)
- Include proper attribution if displaying results

### 2. Database Setup

If using persistent database for alerts:
```sql
CREATE TABLE IF NOT EXISTS price_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  endpoint TEXT NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS price_alerts (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  store VARCHAR(100) NOT NULL,
  target_price DECIMAL(10, 2) NOT NULL,
  direction VARCHAR(10) NOT NULL,  -- 'up' or 'down'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT true,
  notifications_sent INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES price_subscriptions(user_id)
);

CREATE INDEX idx_user_alerts ON price_alerts(user_id, active);
CREATE INDEX idx_product_alerts ON price_alerts(product_id, active);
```

### 3. Initialize Automation

```bash
# Create necessary directories and files
bash setup-automation.sh

# Verify setup
npm run price:fetch  # Test price fetching
npm run price:notify  # Test notifications
```

---

## Usage Examples

### Example 1: Complete Workflow (Local Test)

```bash
# Run entire workflow locally
npm run price:workflow

# Output
╔═══════════════════════════════════════════════════╗
║  ENHANCED PRICE UPDATE & NOTIFICATION WORKFLOW  ║
╚═══════════════════════════════════════════════════╝

▶️  Running: real-time-price-fetcher.mjs
✅ Fetched 150 products from 4 stores
   Price changes detected: 8

▶️  Running: push-notification-service.mjs
✅ Notifications prepared: 12
   Subscriptions active: 152

▶️  Running: auto-commit-push.mjs
✅ 1 commit pushed to main

📊 Summary:
   Products Fetched: 150
   Notifications Sent: 12
   Commits Pushed: 1
   Duration: 45s
   Status: success
```

### Example 2: GitHub Actions Automated Schedule

In `.github/workflows/price-alerts.yml`:
```yaml
name: Real-Time Price Alerts

on:
  schedule:
    - cron: '0 6,12,18 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  price-alerts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Fetch prices
        run: npm run price:fetch
      
      - name: Send notifications
        env:
          VAPID_PRIVATE_KEY: ${{ secrets.VAPID_PRIVATE_KEY }}
        run: npm run price:notify
      
      - name: Git commit
        run: |
          git config user.email "bot@globalprice.tracker"
          git config user.name "Price Bot"
          git add data/
          git commit -m "Price update: $(date)"
          git push
```

### Example 3: Frontend - User Creates Alert

```tsx
// User subscribes in UI
<PriceAlerts 
  onAlertCreated={(alert) => {
    console.log('Alert set!', alert);
    // Triggers notification service
  }}
/>

// When user creates:
// Product: "Whole Milk 1L"
// Store: "Tesco"
// Target Price: £1.50

// If price drops to £1.40:
// 📲 Notification: "Whole Milk 1L at Tesco is now £1.40 (was £1.60)"
```

---

## Monitoring & Logs

### Log Locations

```
logs/
├── push-notifications.log      # Notification history
├── auto-commit.log             # Git commits
├── auto-deploy.log             # Deployment events
└── price-fetch-errors.log      # Fetch errors (if any)
```

### Data Files for Analysis

```
data/
├── real-time-prices.json              # Current prices
├── price-comparison.json              # Store comparisons
├── price-changes.json                 # Detected changes
├── price-fetch-summary.json           # Fetch stats
├── push-subscriptions.json            # User subscriptions
├── notification-summary.json          # Notification stats
└── enhanced-workflow-summary.json     # Complete workflow run
```

### Monitoring Query Examples

```bash
# Check last fetch
jq '.summary' data/price-fetch-summary.json

# Find products with biggest price drops
jq '.[] | select(.percentChange > 20) | .productName' data/price-changes.json

# User notification stats
jq '.notificationLog[] | select(.userId=="user123")' logs/push-notifications.log

# Current price for a product
jq '.[] | select(.name | contains("Milk"))' data/real-time-prices.json
```

### Metrics Dashboard (Optional)

Create a monitoring dashboard showing:
- Daily products fetched
- Average price changes
- User subscriptions trend
- Notifications sent per day
- Top savings opportunities

---

## Troubleshooting

### Issue: "Push notifications not supported in this browser"

**Solution:** Ensure:
- Browser is modern (Chrome 50+, Firefox 48+, Edge 17+)
- HTTPS is enabled (required for service workers)
- Service workers are enabled in browser settings
- Not in private/incognito mode

### Issue: "Notification permission denied"

**Solution:**
- User must grant permission when prompted
- Re-enable in browser settings: Settings > Privacy > Notifications
- Click "Restore defaults" if blocked

### Issue: "Subscription failed"

**Debug steps:**
```bash
# Check service worker registration
# In browser console:
navigator.serviceWorker.getRegistrations().then(r => console.log(r))

# Check push manager
navigator.serviceWorker.ready.then(sw => 
  sw.pushManager.getSubscription().then(s => console.log(s))
)

# Review backend logs for subscription errors
grep "error" logs/push-notifications.log
```

### Issue: "Notifications not received"

**Checklist:**
- [ ] User has active subscription (`data/push-subscriptions.json`)
- [ ] Price changes detected (`data/price-changes.json` not empty)
- [ ] Active price alert matches product (`data/push-subscriptions.json`)
- [ ] Service worker active in browser
- [ ] System notifications enabled in OS

### Issue: "Prices not updating"

**Debug:**
```bash
# Check if fetch ran successfully
tail logs/price-fetch-errors.log

# Verify output files exist and updated
ls -la data/real-time-prices.json
stat data/real-time-prices.json | grep Modify

# Check workflow logs in GitHub Actions
# Settings > Actions > Workflow runs > price-alerts
```

### Issue: "Performance degradation"

**Optimize:**
- Limit products monitored (filter by category/store)
- Increase check interval (6 hours instead of every hour)
- Archive old notification logs: `logs/push-notifications.log` → `logs/archive/`
- Use `jq` for parsing large JSON files instead of loading in memory

---

## Performance Optimization

### Database Indexes

```sql
-- Add these for faster queries
CREATE INDEX idx_alert_product ON price_alerts(product_id);
CREATE INDEX idx_alert_user_active ON price_alerts(user_id, active);
CREATE INDEX idx_subscription_active ON price_subscriptions(active);
```

### Caching Strategy

```javascript
// Cache prices for 1 hour to reduce API calls
const CACHE_DURATION = 3600000; // 1 hour

// In real-time-price-fetcher.mjs
if (fs.existsSync(cachePath)) {
  const cacheTime = fs.statSync(cachePath).mtimeMs;
  if (Date.now() - cacheTime < CACHE_DURATION) {
    return loadCachedPrices(); // Use cache
  }
}
```

### Notification Batching

Instead of sending individual notifications:
```javascript
// Batch notifications every 5 minutes
setInterval(async () => {
  const changes = await detectAllChanges();
  const batched = groupByUser(changes);
  
  for (const [userId, userChanges] of batched) {
    await sendBatchNotification(userId, userChanges);
  }
}, 5 * 60 * 1000);
```

### Data Retention Policy

```javascript
// Keep only last 90 days of price history
function pruneOldData() {
  const cutoffDate = Date.now() - (90 * 24 * 60 * 60 * 1000);
  
  priceHistory = priceHistory.filter(entry => 
    new Date(entry.timestamp).getTime() > cutoffDate
  );
}

// Run daily
schedule.scheduleJob('0 2 * * *', pruneOldData);
```

---

## Next Steps

1. **Deploy to production:** Follow [DEPLOYMENT_INSTRUCTIONS.md](DEPLOYMENT_INSTRUCTIONS.md)
2. **Configure VAPID keys:** Set up Web Push Protocol keys
3. **Monitor first run:** Watch logs for any errors
4. **Gather user feedback:** Monitor which alerts users find valuable
5. **Expand store integrations:** Add more supermarket chains
6. **Implement analytics:** Track notification engagement rates

---

## Support & Contribution

For issues or improvements:
- 📧 Email: erickotienokjv@gmail.com
- 📱 Phone: +254 0748-548285
- 🐛 Report bugs: Open an issue on GitHub
- 🚀 Suggest features: Create a discussion

---

**Last Updated:** March 17, 2026  
**Version:** 2.0 (Real-Time + Push Notifications)
