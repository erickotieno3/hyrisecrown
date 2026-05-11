# 🤖 Auto-Automation Setup Guide

## Overview

Global Price Comparison now includes fully automated systems for:
- 📝 **Auto-Blog Generation** - AI-powered blog content creation
- 💰 **Auto-Price Updates** - Automatic price and stock updates
- 📤 **Auto-Commit & Push** - Automatic git commits and pushes
- 🚀 **Auto-Deployment** - Continuous deployment to Google Play

## Quick Start

### 1. Setup Required Secrets

Add these secrets to GitHub (Settings → Secrets and variables → Actions):

```
ANTHROPIC_API_KEY          # For AI blog generation
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON  # Service account (already configured)
EAS_USERNAME               # Expo account email
EAS_PASSWORD               # Expo account password
SLACK_WEBHOOK             # (Optional) For notifications
```

### 2. Manual Testing

Test each automation locally:

```bash
# Generate blog posts
npm run auto:blog

# Update prices and stock
npm run auto:prices

# Commit and push changes
npm run auto:commit

# All three together
npm run auto:all
```

### 3. Automated Schedules

| Task | Schedule | Workflow |
|------|----------|----------|
| Blog + Prices | Daily 2:00 UTC | `auto-update.yml` |
| Google Play Deploy | On push to `main` | `google-play-deploy.yml` |
| Manual Trigger | Anytime | Workflow dispatch |

## Features

### 🤖 Auto-Blog Generator

**File**: `scripts/auto-blog-generator.mjs`

**Features**:
- Generates 3-5 blog posts daily using Claude AI
- Covers categories: Price Comparisons, Shopping Tips, Market Analysis, etc.
- Creates JSON structure with metadata (title, slug, keywords, category)
- Automatically creates blog index for easy navigation
- SEO-optimized content

**Output**: `public/blog/` directory with:
```json
{
  "title": "Blog post title",
  "slug": "blog-post-slug",
  "excerpt": "Short summary",
  "content": "Full blog content",
  "keywords": ["keyword1", "keyword2"],
  "category": "Price Comparisons",
  "publishedAt": "2024-01-01T00:00:00.000Z",
  "author": "Global Price Comparison Bot",
  "featured": true
}
```

### 💰 Auto-Price Updater

**File**: `scripts/auto-price-updater.mjs`

**Features**:
- Updates 50+ product prices realistically (±5% variation)
- Simulates stock level changes based on sales and restocking
- Maintains 30-day price history per product
- Generates market data analytics
- Categorizes products by type

**Output**: 
- `data/products.json` - Complete product catalog with pricing
- `data/market-data.json` - Market trends and analytics

**Product Structure**:
```json
{
  "id": "PROD-00001",
  "name": "Product Name",
  "category": "Electronics",
  "price": 99.99,
  "originalPrice": 129.99,
  "discount": 23,
  "stock": 150,
  "store": "Amazon",
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "trend": "down",
  "priceHistory": [
    { "date": "2024-01-01T00:00:00.000Z", "price": 99.99 }
  ]
}
```

### 📤 Auto-Commit & Push

**File**: `scripts/auto-commit-push.mjs`

**Features**:
- Detects changes in working directory
- Stages all modified files
- Creates intelligent commit messages categorizing changes
- Pushes to `main` branch automatically
- Logs all commits to `logs/auto-commit.log`
- Gracefully handles conflicts

**Commit Message Format**:
```
Auto-update: 2024-01-01 12:34:56

Changes:
- 📝 Blog Posts: 3 file(s)
- 💰 Prices & Stock: 1 file(s)
- 💻 Code Updates: 2 file(s)

[Auto-generated commit]
```

### 🚀 Google Play Deployment

**File**: `.github/workflows/google-play-deploy.yml`

**Triggers**:
- Automatic on push to `main` (if `android-app/` changes)
- Manual workflow dispatch with options

**Process**:
1. Checkout code and setup Node.js
2. Install dependencies
3. Build web assets (optional)
4. Setup Google Play credentials
5. Authenticate with EAS (Expo Application Services)
6. Build Android App Bundle for production
7. Submit to Google Play Store
8. Post deployment summary and notifications

**Options**:
- `skip_build`: Use latest build instead of rebuilding
- `submit`: Enable/disable auto-submission to store

## GitHub Actions Workflows

### auto-update.yml

**Schedule**: Daily at 2:00 UTC (or manual trigger)

**Steps**:
1. Checkout with full history
2. Setup Node.js with npm cache
3. Install dependencies
4. Generate blog posts (3-5 per run)
5. Update prices and stock levels
6. Configure git with bot credentials
7. Auto-commit and push changes
8. Create workflow summary
9. Notify on failures

### google-play-deploy.yml

**Triggers**: 
- Push to `main` with `android-app/` changes
- Manual workflow dispatch

**Steps**:
1. Checkout code with full history
2. Setup Node.js environment
3. Install Expo and EAS CLI
4. Clean previous caches
5. Install dependencies
6. Build web assets
7. Setup Google Play credentials
8. Authenticate with EAS
9. Build production Android bundle
10. Submit to Google Play
11. Create deployment summary
12. Post comments on commits
13. Send Slack notifications

## Environment Variables

Create `.env` file in project root:

```env
# Anthropic API for AI features
ANTHROPIC_API_KEY=sk-ant-...

# Google OAuth (already configured)
VITE_GOOGLE_CLIENT_ID=319956223388-...
GOOGLE_PROJECT_ID=global-price-comparison

# EAS/Expo
EAS_PROJECT_ID=global-price-comparison

# Node environment
NODE_ENV=production
```

## Running Locally

### All Automation Commands

Add to `package.json`:
```json
{
  "scripts": {
    "auto:blog": "node scripts/auto-blog-generator.mjs",
    "auto:prices": "node scripts/auto-price-updater.mjs",
    "auto:commit": "node scripts/auto-commit-push.mjs",
    "auto:all": "npm run auto:blog && npm run auto:prices && npm run auto:commit",
    "auto:deploy": "cd android-app && npm install && eas build --platform android --profile production && eas submit --platform android --latest"
  }
}
```

### Run Manually

```bash
# Single automation
npm run auto:blog
npm run auto:prices
npm run auto:commit

# All together
npm run auto:all

# Deployment
npm run auto:deploy
```

## Logs and Monitoring

### Log Files

- **Blog Generation**: Check `public/blog/` for output
- **Price Updates**: Check `data/products.json` and `data/market-data.json`
- **Git Commits**: Check `logs/auto-commit.log`
- **Workflow Logs**: GitHub Actions → Workflows → View logs

### GitHub Actions Dashboard

View all workflow runs:
- https://github.com/erickotieno3/GlobalPriceTracker/actions

## Troubleshooting

### Blog Generation Fails

**Issue**: ANTHROPIC_API_KEY not set
```bash
# Add to GitHub Secrets
export ANTHROPIC_API_KEY=sk-ant-...
```

**Issue**: Rate limiting
- Wait 60 seconds between manual runs
- Check Anthropic API usage

### Price Update Issues

**Issue**: Data directory missing
```bash
mkdir -p data
```

**Issue**: Products.json corrupted
```bash
# Restore with sample data (will regenerate)
rm data/products.json
npm run auto:prices
```

### Commit & Push Fails

**Issue**: Git not configured
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

**Issue**: Push rejected due to conflicts
- Pull latest: `git pull origin main`
- Resolve conflicts
- Retry: `npm run auto:commit`

### Google Play Deployment Fails

**Issue**: EAS credentials invalid
```bash
# Re-authenticate
eas login --username your-email@example.com
```

**Issue**: Service account JSON invalid
- Regenerate in Google Cloud Console
- Update GitHub Secret `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

**Issue**: App bundle too large
- Check android-app size
- Remove unused dependencies: `npm prune --production`

## Performance Optimization

### Reduce Workflow Duration

```yaml
# Run in parallel (update workflows)
- name: Parallel tasks
  run: |
    npm run auto:blog & 
    npm run auto:prices &
    wait
```

### Cache Strategies

All workflows use npm cache for faster installs:
```yaml
with:
  cache: 'npm'
```

### Selective Deployment

Only deploy if code changed significantly:
```yaml
if: |
  contains(github.event.head_commit.modified, 'android-app/') ||
  contains(github.event.head_commit.modified, 'client/')
```

## Security Notes

1. **API Keys**: Never commit secrets to repo
2. **Service Accounts**: Rotate credentials quarterly
3. **Access Control**: Limit who can trigger deployments
4. **Permissions**: Use minimal required GitHub permissions

## Support & Contact

For issues or questions:
- Email: erickotienokjv@gmail.com
- Phone: +254 0748-548285
- GitHub Issues: https://github.com/erickotieno3/GlobalPriceTracker/issues

## Future Enhancements

- [ ] AI-powered image generation for blog posts
- [ ] Multi-language blog posts
- [ ] Price prediction ML model
- [ ] Automated A/B testing
- [ ] Email notification system
- [ ] SMS alerts for flash sales
- [ ] Discord bot integration
- [ ] Real-time price scraping
- [ ] Amazon affiliate integration
- [ ] Performance metrics tracking
