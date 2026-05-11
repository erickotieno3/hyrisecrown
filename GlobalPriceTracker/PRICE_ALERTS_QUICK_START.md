# Real-Time Price & Push Notifications - Quick Start

## 🎯 What's New

Your app now has **real-time supermarket price fetching** with **push notifications** for price drops and deals!

### Features at a Glance
✅ **Real-Time Prices** - Fetches from Tesco, Sainsbury's, Asda, Walmart, eBay UK, eBay US  
✅ **Smart Comparisons** - Shows cheapest vs most expensive across stores  
✅ **Price Alerts** - Users create alerts for specific products/prices  
✅ **Push Notifications** - Instant alerts when prices drop or deals found  
✅ **Automatic Updates** - Scheduled daily (or every 6 hours)  
✅ **Fully Automated** - Commit and push to GitHub automatically

---

## 🚀 Quick Commands

### Test Locally (One-Time)
```bash
# Fetch prices from all stores
npm run price:fetch

# Process price changes → Send notifications
npm run price:notify

# Run both + commit to GitHub
npm run price:full

# Or run complete workflow
npm run price:workflow
```

### Automated Schedule
```bash
# Set up GitHub Actions to run automatically
# Price updates: Every 6 hours (2 AM, 8 AM, 2 PM, 8 PM)
# Notifications: Sent when prices change by 15%+
```

---

## 📱 For Users

### Enable Price Alerts (In App)

1. Navigate to **Settings** > **Notifications**
2. Click **Enable Price Alerts**
3. Grant browser notification permission
4. Create alerts for products you watch:
   - Product: "Whole Milk 1L"
   - Store: "Tesco"
   - Target Price: "£1.50"
   - Alert when: "Price drops to"

### Notification Types

| When | You Get |
|------|---------|
| Price drops 15%+ | 💰 **Price Drop Alert** - "Milk is now £1.40 (was £1.60)" |
| Meets your target | 🎯 **Target Met** - "Milk reached your £1.50 target!" |
| Great savings found | 🔥 **Amazing Deal** - "Save £0.25 vs other stores!" |
| Store updates posted | 📦 **Store Update** - "45 products updated at Tesco" |
| Back in stock | 📍 **In Stock** - "Product is back in stock!" |

---

## 🔧 Setup for Deployment

### Step 1: Configure Environment Variables
```bash
# Get VAPID keys from https://web-push-codelab.glitch.me/
VITE_VAPID_PUBLIC_KEY=BCf...  # Public key for browser
VAPID_PRIVATE_KEY=...         # Private key (server only, never commit!)
VAPID_SUBJECT=mailto:your@email.com
```

### Step 2: Add GitHub Secrets
```bash
GitHub Settings → Secrets and variables → Actions
- VAPID_PRIVATE_KEY
- VAPID_SUBJECT
- (Optional) SLACK_WEBHOOK for notifications
```

### Step 3: Enable via GitHub Actions
The workflow runs automatically, or trigger manually:
```bash
# GitHub > Actions > price-alerts > Run workflow
```

---

## 📊 Data Files Generated

```
data/
├── real-time-prices.json          # All fetched prices
├── price-comparison.json          # Store comparisons
├── price-changes.json             # Detected changes (15%+)
├── price-fetch-summary.json       # Summary statistics
├── push-subscriptions.json        # User subscriptions
├── notification-summary.json      # Notification stats
└── enhanced-workflow-summary.json # Complete run summary
```

**Example: real-time-prices.json**
```json
[
  {
    "id": "tesco-001",
    "name": "Whole Milk 1L",
    "price": 1.50,
    "store": "Tesco",
    "stock": 45,
    "lastUpdated": "2026-03-17T14:00:00Z"
  }
]
```

---

## 🐛 Troubleshooting

### Issue: "Push notifications not working"
```bash
# Check:
1. Service worker registered: Open DevTools > Application > Service Workers
2. Notification permission granted: browser settings
3. User has subscription: Check data/push-subscriptions.json
4. Price changes detected: Check data/price-changes.json
```

### Issue: "Prices not updating"
```bash
# Debug:
npm run price:fetch  # Check for errors
tail logs/price-fetch-errors.log
ls -la data/real-time-prices.json  # Check timestamp
```

### Issue: "Missing GitHub Actions logs"
Go to: GitHub > Actions > price-alerts > Latest run > Logs

---

## 📈 Monitoring & Analytics

### View Today's Metrics
```bash
# Check how many updates happened
cat data/enhanced-workflow-summary.json | jq '.results'

# Output:
{
  "productsMonitored": 150,
  "priceChanges": 8,
  "notificationsSent": 12,
  "commitsPushed": 1
}
```

### Real-Time Monitoring
```bash
# Watch logs as updates happen
tail -f logs/push-notifications.log
tail -f logs/auto-commit.log

# Check active subscriptions
cat data/push-subscriptions.json | jq '.users | length'
```

---

## 🎮 Testing the System

### Test 1: Fetch Prices (30 seconds)
```bash
npm run price:fetch
# Expected: 150+ products from 4 stores, savings identified
```

### Test 2: Send Notifications (10 seconds)
```bash
npm run price:notify
# Expected: Price changes processed, notifications queued
```

### Test 3: Full Workflow (1 minute)
```bash
npm run price:workflow
# Expected: All steps complete, commit pushed to GitHub
```

### Test 4: User Can Create Alert
```bash
# In browser:
1. App > Settings > Enable Price Alerts
2. Click "Create New Alert"
3. Fill: Product="Milk", Store="Tesco", Price=£1.50
4. Click "Create Alert"
# Expected: Alert saved, ready for price drops
```

---

## 🔐 Security Notes

### Never Commit These
- `VAPID_PRIVATE_KEY` (use GitHub Secrets)
- User subscription endpoints (stored in `data/push-subscriptions.json` locally)
- Personal Firebase/FCM credentials

### Best Practices
✅ Use environment variables for secrets  
✅ Rotate VAPID keys every 6 months  
✅ Encrypt stored subscription data in production  
✅ Validate all price changes on backend  
✅ Rate-limit API endpoints  

---

## 💡 Next Enhancements

- [ ] Support for international stores (currently UK/USA)
- [ ] SMS notifications (Twilio integration)
- [ ] Email digest summaries (SendGrid)
- [ ] Custom price drop %  threshold per user
- [ ] Recurring shopping list with auto-checks
- [ ] Historical price graphs (chartjs)
- [ ] ML-powered price prediction
- [ ] Social sharing of deals found

---

## 📞 Support

**Questions?**
- 📧 erickotienokjv@gmail.com
- 📱 +254 0748-548285
- 🐛 Open an issue on GitHub

---

**Last Updated:** March 17, 2026  
**Version:** 2.0  
**Status:** ✅ Ready for Production
