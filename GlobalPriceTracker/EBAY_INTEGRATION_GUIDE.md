# eBay Integration Guide

## Overview

Global Price Tracker now includes **eBay UK and eBay US** as price sources, with support for both:
1. **Price Tracking** - Monitor prices on eBay listings
2. **Shopping Integration** - Direct links to buy on eBay through API

Both use **free, publicly available eBay APIs** with no licensing restrictions.

---

## Quick Setup

### Option 1: Use Mock Data (No Setup Required)
The system works out of the box with realistic mock eBay data:
```bash
npm run price:fetch
# Fetches data including eBay UK and eBay US listings
```

### Option 2: Enable Real eBay API (Recommended)
For live product data from eBay.

#### Step 1: Register for Free eBay Developer Account
1. Visit https://developer.ebay.com/
2. Sign up for free account
3. Navigate to **My Account → Keys & Tokens**
4. Copy your **App ID** (formerly called AppName)

#### Step 2: Add Environment Variable
Create/update `.env`:
```env
EBAY_APP_ID=your_ebay_app_id_here
```

#### Step 3: Test the Integration
```bash
npm run price:fetch
# Should now fetch real data from eBay
```

---

## What Gets Collected

### eBay UK Prices
- Electronics (iPhones, MacBooks, GPUs)
- Accessories (Cables, Chargers, Cases)
- Consumer goods across all categories
- Location: `https://www.ebay.co.uk`

### eBay US Prices
- Gaming (PS5, Xbox Series X)
- Electronics (iPads, Computers)
- Audio equipment
- High-tech products
- Location: `https://www.ebay.com`

### Data Structure
```json
{
  "id": "ebay-uk-001",
  "itemId": "123456789",  // eBay item ID
  "name": "Product Name",
  "price": 189.99,
  "currency": "GBP",
  "store": "eBay UK",
  "seller": "Seller Name",
  "sellerFeedback": 98.5,  // Seller rating %
  "condition": "Used",     // New / Used / Refurbished
  "shippingPrice": 0,      // Free shipping or cost
  "url": "https://www.ebay.co.uk/itm/...",
  "soldCount": 89,         // Number sold
  "lastUpdated": "2024-01-01T12:00:00Z",
  "stock": 5               // Available quantity
}
```

---

## API Options

### Option A: eBay Shopping API (Recommended)
**Status**: ✅ Free, publicly available  
**Best For**: Price tracking, product search  

**Features**:
- Find items by keyword
- Get detailed product information
- Check seller ratings
- View shipping costs
- No API authentication required (just App ID)

**Endpoint**:
```
https://svcs.ebay.com/services/search/FindingService/v1
```

**Example Request**:
```bash
curl "https://svcs.ebay.com/services/search/FindingService/v1?
  OPERATION-NAME=findItemsAdvanced&
  SERVICE-VERSION=1.0.0&
  SECURITY-APPNAME=YOUR_APP_ID&
  RESPONSE-DATA-FORMAT=JSON&
  REST-PAYLOAD&
  keywords=laptop&
  globalId=EBAY-GB" \
  -H "Accept: application/json"
```

**Rate Limits**:
- 100 API calls per API user session
- Reasonable for daily/hourly updates

### Option B: eBay Browse API (Modern, OAuth)
**Status**: ✅ Public API  
**Best For**: Advanced browsing, filtering, detailed results  

**Features**:
- More detailed product information
- Better filtering options
- Trending items
- Product reviews and ratings
- Requires OAuth authentication

**Setup**:
1. https://developer.ebay.com/api-docs/buy/browse/overview.html
2. Create OAuth credential
3. Get access token
4. Use token in API requests

**Not required for basic price tracking**

### Option C: Marketplace Insights API
**Status**: ✅ Available  
**Best For**: Market analytics, trends  

- Pricing trends
- Demand metrics
- Competition analysis
- Category insights

---

## Enable Live eBay Data

### Update `scripts/real-time-price-fetcher.mjs`

Current implementation uses mock data. To enable real API:

```javascript
async fetchEbayUKData() {
  const appId = process.env.EBAY_APP_ID || 'demo';
  
  // Replace mock data section with real API call:
  const keywords = 'laptop';  // Search term
  const response = await this.fetchUrl(
    `https://svcs.ebay.com/services/search/FindingService/v1?
      OPERATION-NAME=findItemsAdvanced&
      SERVICE-VERSION=1.0.0&
      SECURITY-APPNAME=${appId}&
      RESPONSE-DATA-FORMAT=JSON&
      REST-PAYLOAD&
      keywords=${keyword}&
      globalId=EBAY-GB&
      paginationInput.entriesPerPage=50`
  );
  
  // Map response to our data structure
  return response.findItemsAdvancedResponse[0].searchResult[0].item
    .map(item => ({
      id: `ebay-uk-${item.itemId}`,
      itemId: item.itemId,
      name: item.title,
      price: parseFloat(item.sellingStatus[0].currentPrice[0].__value__),
      store: 'eBay UK',
      seller: item.sellerInfo[0].sellerUserName[0],
      condition: item.condition[0].conditionDisplayName[0],
      url: item.viewItemURL[0],
      soldCount: item.sellingStatus[0].soldCount?.[0] || 0,
      lastUpdated: new Date().toISOString()
    }));
}
```

---

## Legal & Compliance

### ✅ Allowed Uses
- Personal price monitoring
- App/website development
- Business analytics
- Educational projects
- Comparison shopping
- Consumer research

### ⚠️ Follow eBay Terms
1. **Use Official API** - Never scrape website HTML
2. **Respect Rate Limits** - 100 calls per session
3. **Proper Attribution** - If displaying results, credit eBay
4. **No Bulk Scraping** - Don't download entire catalogs
5. **Terms of Service** - https://developer.ebay.com/en-US/terms

### 📜 API License
- **Free License** - for non-commercial use
- **Commercial License** - available for businesses
- **Check Seller Terms** - Respect individual seller policies

---

## Shopping Integration

### Direct Purchase Links

Add shopping functionality by including eBay URLs:

```javascript
{
  "id": "ebay-uk-001",
  "name": "iPhone 12",
  "price": 189.99,
  "url": "https://www.ebay.co.uk/itm/...",
  "buyButton": {
    "label": "Buy on eBay",
    "url": "https://www.ebay.co.uk/itm/...",
    "affiliate": false  // Set to true if using affiliate program
  }
}
```

### Frontend Component Integration

```jsx
<div className="product-card">
  <h3>{product.name}</h3>
  <p>Price: ${product.price}</p>
  <a href={product.url} target="_blank" rel="noopener noreferrer">
    🛒 Buy on {product.store}
  </a>
</div>
```

### Affiliate Program (Optional)

eBay Partner Network for commission:
1. https://ebaypartnernetwork.com/
2. Sign up for affiliate program
3. Use affiliate links instead of direct links
4. Earn commission on referred purchases

---

## Configuration Files

### `scripts/real-time-price-fetcher.mjs`

eBay configuration in STORE_CONFIGS:
```javascript
ebayUK: {
  name: 'eBay UK',
  country: 'UK',
  apiEndpoint: 'https://svcs.ebay.com/services/search/FindingService/v1',
  hasRealApi: true,
  globalId: 'EBAY-GB',
  buyerUrl: 'https://www.ebay.co.uk',
  mockUrl: null
},
ebayUS: {
  name: 'eBay US',
  country: 'USA',
  apiEndpoint: 'https://svcs.ebay.com/services/search/FindingService/v1',
  hasRealApi: true,
  globalId: 'EBAY-US',
  buyerUrl: 'https://www.ebay.com',
  mockUrl: null
}
```

### Environment Variables

```env
# eBay API (Optional)
EBAY_APP_ID=your_free_app_id_from_developer.ebay.com

# For GitHub Actions
# Add EBAY_APP_ID to GitHub Secrets:
# Settings → Secrets and variables → Actions → New repository secret
```

---

## Testing

### Test Mock Data
```bash
npm run price:fetch
# Output includes eBay UK and eBay US mock listings
```

### Test with Real API
```bash
export EBAY_APP_ID=your_app_id
npm run price:fetch
# Output includes real eBay listings
```

### View Output Files
```bash
# All prices
cat data/real-time-prices.json | grep -A 5 "eBay"

# Price comparisons
cat data/price-comparison.json | grep -A 5 "eBay"

# Fetch summary
cat data/price-fetch-summary.json
```

---

## Troubleshooting

### Issue: eBay data not fetching
```
❌ eBay UK fetch error: timeout
```

**Solutions**:
1. Check internet connection
2. Verify `EBAY_APP_ID` is set correctly
3. Check eBay API status: https://status.developer.ebay.com/
4. Wait a few minutes and retry (rate limits)

### Issue: Invalid App ID
```
Error: Invalid API credentials
```

**Solutions**:
1. Verify App ID from https://developer.ebay.com/
2. Ensure it's NOT the Cert ID
3. Copy exact value without spaces
4. Check that account is active

### Issue: Mock data not updating
```
Same products every run
```

**Solutions**:
1. This is expected - mock data is static
2. To get real data, set `EBAY_APP_ID`
3. Real data will vary based on actual listings

---

## Advanced Usage

### A/B Testing Prices
Compare eBay prices with supermarket prices:
```json
{
  "productName": "Milk 1L",
  "category": "Dairy",
  "stores": {
    "tesco": 1.50,
    "sainsburys": 1.65,
    "ebay_uk": 2.99,  // Usually higher for specialty items
    "ebay_us": 3.48
  }
}
```

### Specific Product Searches

Modify keywords in `fetchEbayUKData()`:
```javascript
const keywords = ['laptop', 'headphones', 'gaming', 'electronics'];
// Fetch multiple categories
```

### Result Filtering

Filter by:
- Price range (min/max)
- Seller rating (feedback score)
- Condition (New/Used/Refurbished)
- Shipping cost (free shipping)
- Item location

---

## Next Steps

1. ✅ **Register** - eBay Developer Account (free)
2. ✅ **Get App ID** - From My Account → Keys & Tokens
3. ✅ **Add to .env** - EBAY_APP_ID variable
4. ✅ **Test** - `npm run price:fetch`
5. ✅ **Deploy** - Add EBAY_APP_ID to GitHub Secrets
6. ✅ **Monitor** - Check logs for real eBay data

---

## Resources

- **eBay Developer Center**: https://developer.ebay.com/
- **Finding API Docs**: https://developer.ebay.com/api-docs/buy/static/api-browse.html
- **Browse API Docs**: https://developer.ebay.com/api-docs/buy/browse/overview.html
- **API Status**: https://status.developer.ebay.com/
- **Rate Limits**: https://developer.ebay.com/api-docs/static/rate-limiting.html
- **Terms of Service**: https://developer.ebay.com/en-US/terms

---

## Support

For issues with:
- **eBay API**: Contact eBay Developer Support
- **Integration**: Check logs in `logs/` directory
- **General**: Review `REAL_TIME_PRICE_ALERTS_GUIDE.md`
