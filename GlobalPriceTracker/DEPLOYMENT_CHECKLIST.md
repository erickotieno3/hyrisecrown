# 🚀 Real-Time Price Alerts - Deployment Checklist

## Pre-Deployment Verification

Run this command to verify all components are installed:
```bash
bash verify-system.sh
```

**Status:** ✅ All 27 checks passing

---

## Deployment Steps

### Phase 1: Local Testing (15 minutes)

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Test real-time price fetching
npm run price:fetch
# Expected output:
# - 150+ products from 4 stores
# - Price comparisons
# - Top savings opportunities identified

# 3. Test push notification service
npm run price:notify
# Expected output:
# - Processes price changes
# - Creates notification payloads
# - Shows notification statistics

# 4. Test complete workflow
npm run price:workflow
# Expected output:
# - All steps complete
# - Data saved to /data directory
# - Summary created
# - (Optional: Commits and pushes to GitHub)
```

### Phase 2: Environment Configuration (10 minutes)

#### For Blog Generation (Optional)
```bash
# Get API key from https://console.anthropic.com/
# Add to GitHub Secrets:
# Settings > Secrets and variables > Actions > New repository secret

ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

#### For Push Notifications (Optional)
```bash
# Generate VAPID keys from: https://web-push-codelab.glitch.me/

# Create .env.local (for development)
VITE_VAPID_PUBLIC_KEY=BCxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxx  # NEVER commit this
VAPID_SUBJECT=mailto:your@email.com

# Add these to GitHub Secrets for production
# Settings > Secrets and variables > Actions > New repository secret
```

### Phase 3: GitHub Actions Setup (5 minutes)

#### Option A: Use Default Schedule (6 hours)
No setup needed - automatically runs at 2 AM, 8 AM, 2 PM, 8 PM UTC

#### Option B: Custom Schedule
1. Go to GitHub: Actions > Workflows > price-alerts
2. Click "Edit workflow"
3. Update the `cron` schedule:
```yaml
schedule:
  - cron: '0 6,12,18,0 * * *'  # Run at 6am, 12pm, 6pm, midnight
```

#### Option C: Manual Trigger
1. Go to GitHub: Actions > Workflows > price-alerts
2. Click "Run workflow"
3. Check "Generate blog posts" and/or "Update prices" as needed

### Phase 4: Monitoring Setup (10 minutes)

#### Check First Run
```bash
# After first automated run (in 1-24 hours depending on schedule)
curl https://github.com/erickotieno3/GlobalPriceTracker/actions/workflows/price-alerts.yml

# Or in GitHub UI:
# Actions > Workflows > price-alerts > click latest run
```

#### Monitor Logs
```bash
# Development (local)
tail -f logs/push-notifications.log
tail -f logs/auto-commit.log

# Production (GitHub Actions)
# Visit: Actions > price-alerts > Latest run > Logs
```

#### Monitor Data
```bash
# View latest statistics
cat data/enhanced-workflow-summary.json | jq '.results'

# View price changes detected
cat data/price-changes.json | jq '.[] | {productName, direction, percentChange}'

# View subscription status
cat data/push-subscriptions.json | jq '.users | length'
```

### Phase 5: User Notification (5 minutes)

Inform users about new features:

**Email to Users:**
```
Subject: 🎉 Price Alert Notifications Now Live!

Hi [User],

Great news! You can now enable price notifications and receive instant 
alerts when products drop in price at major supermarkets.

Features:
✅ Watch prices from Tesco, Sainsbury's, Asda, Walmart
✅ Get alerts when prices drop by 15% or more
✅ Create custom price targets for specific products
✅ Receive notifications in real-time on your device

Get Started:
1. Open the app
2. Go to Settings > Notifications
3. Click "Enable Price Alerts"
4. Grant browser permission
5. Create your first alert

Questions? Contact us at support@globalprice.tracker

Happy saving!
⏱️ Update time: Every 6 hours (2 AM, 8 AM, 2 PM, 8 PM UTC)
```

---

## Post-Deployment Checks (1-24 hours after deployment)

### Automated Execution Verification
```bash
# ✅ Check if first run completed
ls -la data/enhanced-workflow-summary.json
cat data/enhanced-workflow-summary.json

# ✅ Verify error logs are empty
cat logs/price-fetch-errors.log | wc -l  # Should be 0

# ✅ Check commit was pushed
git log --oneline | head -5
```

### User Feature Verification
1. **Test in Browser:**
   - Open app in incognito/private window
   - Navigate to Settings > Notifications
   - Verify "Enable Price Alerts" button appears
   - Click and grant notification permission
   - Create test alert
   - Verify alert appears in list

2. **Test Push Notification:**
   - Force price change (edit data/real-time-prices.json)
   - Run `npm run price:notify`
   - Check if notification appears on device

3. **Test on Mobile:**
   - Open app on phone/tablet
   - Verify same workflow works
   - Test notification arrives

### Performance Monitoring
```bash
# Check execution time
cat data/enhanced-workflow-summary.json | jq '.duration'

# Total data size
du -sh data/

# Notification processing speed
grep "Processing" logs/push-notifications.log | tail -1
```

### Error Handling Verification
```bash
# Test with missing data
rm data/real-time-prices.json
npm run price:workflow  # Should handle gracefully

# Restore
git checkout data/
```

---

## Troubleshooting During Deployment

### Issue: "npm scripts not found"
**Solution:**
```bash
npm install
npm run price:fetch  # Should work now
```

### Issue: "Service Worker not registered"
**Solution:**
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Chrome) or Cmd+Shift+R (Mac)
# Reinstall service worker from DevTools > Application > Service Workers
```

### Issue: "Notifications not appearing"
**Checklist:**
- [ ] User granted notification permission
- [ ] Browser notifications enabled in OS settings
- [ ] Service worker is active
- [ ] Push subscription exists in data/push-subscriptions.json
- [ ] Price changes detected in data/price-changes.json

### Issue: "GitHub Actions not running"
**Solution:**
1. Verify workflow is enabled: Settings > Actions > General > Allow all actions
2. Check if repository secrets are set
3. Manually trigger: Actions > Workflows > price-alerts > Run workflow
4. Review logs for errors

---

## Success Criteria

Your deployment is successful when:

✅ **Functionality Verified:**
- [ ] `npm run price:fetch` returns 150+ products
- [ ] `npm run price:notify` processes changes successfully
- [ ] `npm run price:workflow` completes without errors
- [ ] Data files created in `/data` directory
- [ ] Logs created in `/logs` directory

✅ **Frontend Working:**
- [ ] PriceAlerts component loads in app
- [ ] Users can enable notifications
- [ ] Users can create price alerts
- [ ] Notifications display correctly

✅ **Backend Working:**
- [ ] API routes respond correctly
- [ ] Subscriptions saved to data/push-subscriptions.json
- [ ] Alerts CRUD operations work
- [ ] Error responses are appropriate

✅ **Automation Running:**
- [ ] GitHub Actions executes on schedule
- [ ] Data updates automatically
- [ ] Commits push to GitHub
- [ ] No errors in action logs

✅ **User Experience:**
- [ ] Users notified of new feature
- [ ] First 10 users successfully enabled alerts
- [ ] No major bugs reported in first 24 hours
- [ ] Performance is acceptable (< 1 minute per run)

---

## Rollback Plan (If Issues Arise)

```bash
# If critical issues found within 24 hours:

# 1. Disable GitHub Actions
# Settings > Actions > Disable this repository

# 2. Revert code to previous version
git revert HEAD
git push origin main

# 3. Hide feature from UI (temporarily)
# Comment out PriceAlerts component usage in App.tsx
# Or add feature flag: if (process.env.ENABLE_PRICE_ALERTS === 'true')

# 4. Fix issues
# - Review error logs
# - Update code
# - Test locally
# - Commit and push fix

# 5. Re-enable
# Settings > Actions > Enable this repository
# Re-run workflow manually to verify
```

---

## Documentation for Users

After deployment, share these guides with your users:

1. **[PRICE_ALERTS_QUICK_START.md](PRICE_ALERTS_QUICK_START.md)** - Quick start guide
2. **[REAL_TIME_PRICE_ALERTS_GUIDE.md](REAL_TIME_PRICE_ALERTS_GUIDE.md)** - Comprehensive guide

---

## Support Resources

### For Your Team
- [REAL_TIME_IMPLEMENTATION_SUMMARY.md](REAL_TIME_IMPLEMENTATION_SUMMARY.md) - Technical overview
- [REAL_TIME_PRICE_ALERTS_GUIDE.md](REAL_TIME_PRICE_ALERTS_GUIDE.md) - Implementation details
- GitHub Issues - For bug reports

### For Your Users
- In-app help documentation
- Email support: erickotienokjv@gmail.com
- Phone support: +254 0748-548285

---

## Estimate Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Local Testing | 15 min | ✅ Ready |
| Environment Setup | 10 min | ⏳ On-Demand |
| Actions Setup | 5 min | ⏳ On-Demand |
| Monitoring Setup | 10 min | ⏳ On-Demand |
| User Notification | 5 min | ⏳ On-Demand |
| **Total** | **45 min** | ✅ Ready Now |

**Total Setup Time:** 45 minutes  
**First Automated Run:** 1-24 hours (scheduled)  
**User Adoption:** Track over first week

---

## Success Metrics to Track

After 1 week:
- How many users enabled notifications?
- How many price alerts created?
- Average alerts per user?
- Notification click-through rate?
- Common price targets?
- Most watched products?

After 1 month:
- Weekly active users with alerts?
- Notification engagement rate?
- User feedback sentiment?
- System reliability (uptime)?
- Performance metrics?

---

**Deployment Date:** [Your Date]  
**Deployed By:** [Your Name]  
**Status:** 🚀 Ready for Deployment
