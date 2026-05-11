# Tesco Price Comparison API Endpoints Documentation

This document provides information about the available API endpoints in the Tesco Price Comparison platform. The API is organized into several categories:

## Core Data Endpoints

### Countries

- `GET /api/countries` - Get all active countries
- `GET /api/countries/coming-soon` - Get all countries marked as "coming soon"
- `GET /api/countries/:code` - Get a country by its code (e.g., "GB", "KE")

### Stores

- `GET /api/stores` - Get all stores
- `GET /api/stores/featured` - Get featured stores with their country data
- `GET /api/countries/:countryId/stores` - Get all stores for a specific country

### Products

- `GET /api/products` - Get all products
- `GET /api/products/trending` - Get trending products with their price data
- `GET /api/products/search?q=query` - Search products by name or description
- `GET /api/products/:id` - Get a product by ID
- `GET /api/categories/:categoryId/products` - Get all products in a specific category

### Product Prices

- `GET /api/products/:id/compare` - Compare prices for a product across all stores

### Categories

- `GET /api/categories` - Get all product categories

### Languages

- `GET /api/languages` - Get all active languages

### Newsletter

- `POST /api/newsletter/subscribe` - Subscribe to the newsletter

## Affiliate Marketing Endpoints

### Click Tracking

- `POST /api/affiliate/click` - Record an affiliate click
  - Body:
    ```json
    {
      "affiliateId": "affiliate123",
      "storeId": 5,
      "productId": 12345,
      "referrer": "https://example.com/blog",
      "userAgent": "Mozilla/5.0...",
      "ipHash": "anonymized-ip-hash"
    }
    ```

### Referral Tracking

- `POST /api/affiliate/referral` - Record a site referral from an affiliate
  - Body:
    ```json
    {
      "affiliateId": "affiliate123",
      "referrer": "https://example.com/blog",
      "landingPage": "https://hyrisecrown.com/product/1234",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2025-04-24T14:35:12.000Z"
    }
    ```

### Conversion Tracking

- `POST /api/affiliate/conversion` - Record a conversion/sale
  - Body:
    ```json
    {
      "affiliateId": "affiliate123", 
      "orderId": "ORDER-12345",
      "amount": 67.99,
      "currency": "GBP",
      "timestamp": "2025-04-24T14:40:27.000Z"
    }
    ```

### Statistics and Analytics

- `GET /api/affiliate/stats/:affiliateId` - Get statistics for an affiliate
- `POST /api/affiliate/pageview` - Record a page view for affiliate analytics
  - Body:
    ```json
    {
      "affiliateId": "affiliate123",
      "path": "/products/category/electronics",
      "referrer": "https://example.com/blog",
      "timestamp": "2025-04-24T14:38:45.000Z"
    }
    ```

### Redirect

- `GET /api/affiliate/redirect?clickId=abc123&destination=https://store.com/product` - Redirect to a store with tracking

## Payment Processing Endpoints

### Stripe Integration

- `POST /api/payments/stripe/create-payment-intent` - Create a payment intent for Stripe
  - Body:
    ```json
    {
      "amount": 49.99,
      "currency": "USD",
      "description": "Price comparison subscription"
    }
    ```
- `POST /api/payments/stripe/webhook` - Webhook for Stripe events

### PayPal Integration

- `POST /api/payments/paypal/create-order` - Create a PayPal order
  - Body:
    ```json
    {
      "value": "49.99",
      "currency_code": "USD",
      "description": "Price comparison subscription"
    }
    ```
- `POST /api/payments/paypal/webhook` - Webhook for PayPal events

### M-Pesa Integration (Africa)

- `POST /api/payments/mpesa/initiate` - Initiate an M-Pesa payment
  - Body:
    ```json
    {
      "phone": "254712345678",
      "amount": 1000,
      "reference": "Subscription",
      "description": "Monthly price comparison"
    }
    ```
- `POST /api/payments/mpesa/callback` - Callback endpoint for M-Pesa

## Mobile Connectivity Endpoints

- `GET /api/mobile/status` - Check API status and available features for mobile apps

## WebSocket API

The WebSocket API is available at `/ws` and supports the following message types:

### Subscribe to Product Price Updates

```json
{
  "type": "subscribe_product",
  "productId": 12345
}
```

When price changes are detected, the server will send:

```json
{
  "type": "price_update",
  "productId": 12345,
  "prices": [...],
  "timestamp": "2025-04-24T14:30:00.000Z"
}
```

### Subscribe to Country Store Updates

```json
{
  "type": "subscribe_country",
  "countryCode": "KE"
}
```

When stores change for a country, the server will send:

```json
{
  "type": "country_stores_update",
  "countryCode": "KE",
  "stores": [...],
  "timestamp": "2025-04-24T14:30:00.000Z"
}
```

## Authentication

The API currently does not require authentication for most endpoints. Future versions will implement OAuth2 authentication for secure endpoints.

## API Versioning

This is API version 1. The base URL is `/api`.

## Rate Limiting

API calls are limited to 100 requests per minute per IP address.

## Error Responses

All API errors follow a standard format:

```json
{
  "message": "Error message description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific validation error"
    }
  ]
}
```