import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertNewsletterSubscriberSchema } from "@shared/schema";
import paymentRouter from "./payment-routes";
import affiliateRouter from "./affiliate-routes";
import adminRouter, { setWebSocketServer } from "./admin-routes";
import vendorRouter, { setWebSocketServer as setVendorWebSocketServer } from "./vendor-routes";
import marketplaceRouter from "./marketplace-routes";
import { aiRouter } from "./ai-routes";
import { socialMediaRouter } from "./social-media";
import { savingsChallengeRouter } from "./savings-challenge-routes";
import paybillRouter from "./paybill-routes";
import ipBlocker from "./ip-blocker";
import { WebSocketServer, WebSocket } from 'ws';
import { revisionRouter } from "./revision-routes";
import { shopifyRouter } from "./shopify-routes";
import { initializeShopifyIntegration, getShopifyIntegration } from "./shopify-integration";
import { uploadProductImage, handleVisualSearch, getB2BInsights } from "./visual-search";
import fs from 'fs';
import path from 'path';
import { initializeAutoUpdater } from "./auto-updater";
import { initializeAutoPilot, manuallyTriggerTask } from "./auto-pilot";
import cookieParser from "cookie-parser";
import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import { stores, products, productPrices } from "@shared/schema";
import pushNotificationRouter from "./push-notification-routes";
import WebSocketNetworkServer from "./websocket-server";
import UnlimitedRevisionSystem from "./unlimited-revisions";
import syncRouter, { setSyncServices } from "./network-sync-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Cookie parser middleware for authentication
  app.use(cookieParser());

  // Critical: Serve static assets first to ensure they are accessible
  // Serve static files from the public directory with highest priority
  // dotfiles: 'allow' ensures .well-known/assetlinks.json is served for Google Play TWA
  app.use(express.static('public', { dotfiles: 'allow' }));
  
  // Custom health check endpoints for deployment
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      time: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  });
  
  app.get('/ping', (req, res) => {
    res.status(200).send('pong');
  });
  
  app.get('/barebones', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Tesco Price Comparison - Status Check</title></head>
        <body>
          <h1>Server is running!</h1>
          <p>Status: Online</p>
          <p>Time: ${new Date().toISOString()}</p>
        </body>
      </html>
    `);
  });
  
  // Domain validation endpoint for custom domains
  app.get('/.well-known/custom-domain-verification', (req, res) => {
    res.send('tesco-compare--hyrisecrown.repl.co domain verification');
  });
  
  // Serve mobile app static assets with high priority
  app.use('/mobile-app', express.static('mobile-app', { index: false }));
  
  // Serve mobile app assets directly with high priority
  app.use('/assets', express.static('mobile-app/assets'));
  
  // Explicit route for mobile-app.html to ensure it works
  app.get('/mobile-app.html', (req, res) => {
    try {
      const htmlFile = fs.readFileSync('./public/mobile-app.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving mobile-app.html:', err);
      res.status(500).send('Error loading mobile app');
    }
  });
  
  // Security bypass page for handling certificate warnings
  app.get('/secure', (req, res) => {
    try {
      const htmlFile = fs.readFileSync('./public/secure-redirect.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving secure-redirect.html:', err);
      res.status(500).send('Error loading secure redirect page');
    }
  });
  
  // Admin dashboard
  app.get('/admin-dashboard.html', (req, res) => {
    try {
      const htmlFile = fs.readFileSync('./public/admin-dashboard.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving admin-dashboard.html:', err);
      res.status(500).send('Error loading admin dashboard');
    }
  });
  
  // Alias for admin dashboard at /admin
  app.get('/admin', (req, res) => {
    res.redirect('/admin-dashboard.html');
  });
  
  // Direct vendor login page
  app.get('/vendor-login', (req, res) => {
    try {
      const htmlFile = fs.readFileSync('./public/vendor-login.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving vendor login:', err);
      res.status(500).send('Error loading vendor login page');
    }
  });
  
  // Special route for tesco vendor portal
  app.get('/tesco-vendor', (req, res) => {
    try {
      const htmlFile = fs.readFileSync('./public/tesco-vendor.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving tesco vendor page:', err);
      res.status(500).send('Error loading tesco vendor page');
    }
  });
  
  // Direct access page for vendor login (with clear hyperlink)
  app.get('/vendor-access', (req, res) => {
    try {
      const htmlFile = fs.readFileSync('./public/vendor-access.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving vendor access page:', err);
      res.status(500).send('Error loading vendor access page');
    }
  });
  
  // Vendor Hub - Simple access portal with all vendor options
  app.get('/vendor-hub', (req, res) => {
    try {
      const htmlFile = fs.readFileSync('./public/vendor-hub.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving vendor hub page:', err);
      res.status(500).send('Error loading vendor hub page');
    }
  });
  
  // Root mobile app (highest priority route)
  // Create a simple direct HTML response to check routing
  app.get('/health-check', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Health Check</title>
        </head>
        <body>
          <h1>Server is working!</h1>
          <p>This is a direct response from Express.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </body>
      </html>
    `);
  });

  // Serve the mobile app at the root path - DIRECT HTML APPROACH
  app.get('/', (req, res) => {
    // Read the file manually and serve it directly
    try {
      const htmlFile = fs.readFileSync('./mobile-app/index.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving mobile app at root:', err);
      res.status(500).send('Error loading mobile app');
    }
  });
  
  // Mobile-specific routes with high priority
  app.get('/mobile', (req, res) => {
    // Read the file manually and serve it directly
    try {
      const htmlFile = fs.readFileSync('./mobile-app/index.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving mobile app:', err);
      res.status(500).send('Error loading mobile app');
    }
  });
  
  // Additional mobile app routes - all of these serve the same index.html
  // This ensures that our client-side navigation works correctly
  app.get('/mobile/search', (req, res) => {
    try {
      const htmlFile = fs.readFileSync('./mobile-app/index.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving mobile search page:', err);
      res.status(500).send('Error loading mobile search page');
    }
  });
  
  app.get('/mobile/compare', (req, res) => {
    try {
      const htmlFile = fs.readFileSync('./mobile-app/index.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving mobile compare page:', err);
      res.status(500).send('Error loading mobile compare page');
    }
  });
  
  app.get('/mobile/account', (req, res) => {
    try {
      const htmlFile = fs.readFileSync('./mobile-app/index.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving mobile account page:', err);
      res.status(500).send('Error loading mobile account page');
    }
  });
  
  app.get('/mobile-redirect', (req, res) => {
    try {
      const htmlFile = fs.readFileSync('./public/mobile-redirect.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving mobile redirect:', err);
      res.status(500).send('Error loading mobile redirect page');
    }
  });

  // API Routes
  
  // Countries
  app.get("/api/countries", async (req, res) => {
    try {
      const countries = await storage.getActiveCountries();
      res.json(countries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch countries" });
    }
  });
  
  app.get("/api/countries/coming-soon", async (req, res) => {
    try {
      const countries = await storage.getComingSoonCountries();
      res.json(countries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coming soon countries" });
    }
  });
  
  app.get("/api/countries/:code", async (req, res) => {
    try {
      const country = await storage.getCountryByCode(req.params.code);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      res.json(country);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch country" });
    }
  });
  
  // Stores
  app.get("/api/stores", async (req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stores" });
    }
  });
  
  app.get("/api/stores/featured", async (req, res) => {
    try {
      const stores = await storage.getFeaturedStores();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured stores" });
    }
  });
  
  app.get("/api/countries/:countryId/stores", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      if (isNaN(countryId)) {
        return res.status(400).json({ message: "Invalid country ID" });
      }
      
      const stores = await storage.getStoresByCountry(countryId);
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stores for country" });
    }
  });
  
  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  
  app.get("/api/products/trending", async (req, res) => {
    try {
      const limitParam = req.query.limit;
      const limit = limitParam ? parseInt(limitParam as string) : undefined;
      
      const products = await storage.getTrendingProducts(limit);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending products" });
    }
  });
  
  app.get("/api/products/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to search products" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  
  app.get("/api/categories/:categoryId/products", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const products = await storage.getProductsByCategory(categoryId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products for category" });
    }
  });
  
  // Product Prices
  app.get("/api/products/:id/compare", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const prices = await storage.compareProductPrices(productId);
      res.json(prices);
    } catch (error) {
      res.status(500).json({ message: "Failed to compare product prices" });
    }
  });
  
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  // Newsletter subscription
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const validationResult = insertNewsletterSubscriberSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid subscriber data", 
          errors: validationResult.error.errors 
        });
      }
      
      const subscriber = await storage.createNewsletterSubscriber(validationResult.data);
      res.status(201).json({ message: "Successfully subscribed to newsletter", subscriber });
    } catch (error) {
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });
  
  // Languages
  app.get("/api/languages", async (req, res) => {
    try {
      const languages = await storage.getActiveLanguages();
      res.json(languages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch languages" });
    }
  });
  
  // Blog posts
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });
  
  app.get("/api/blog/recent", async (req, res) => {
    try {
      const limitParam = req.query.limit;
      const limit = limitParam ? parseInt(limitParam as string) : undefined;
      
      const posts = await storage.getRecentBlogPosts(limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent blog posts" });
    }
  });
  
  app.get("/api/blog/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      const post = await storage.getBlogPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  
  app.get("/api/blog/slug/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  
  app.get("/api/categories/:categoryId/blog", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const posts = await storage.getBlogPostsByCategory(categoryId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts for category" });
    }
  });
  
  // Auto-pilot configuration endpoints
  app.get("/api/auto-pilot/configs", async (req, res) => {
    try {
      const configs = await storage.getAutoPilotConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch auto-pilot configurations" });
    }
  });
  
  app.get("/api/auto-pilot/logs", async (req, res) => {
    try {
      const logs = await storage.getAutoPilotLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch auto-pilot logs" });
    }
  });
  
  // Endpoint to manually trigger an auto-pilot task
  app.post("/api/auto-pilot/trigger/:feature", async (req, res) => {
    try {
      const feature = req.params.feature;
      
      // Check if this feature exists
      const config = await storage.getAutoPilotConfigByFeature(feature);
      if (!config) {
        return res.status(404).json({ message: "Auto-pilot feature not found" });
      }
      
      // Trigger the task
      const result = await manuallyTriggerTask(feature, wss);
      
      res.json({
        message: `Task '${feature}' triggered successfully`,
        result
      });
    } catch (error) {
      console.error(`Error triggering auto-pilot task:`, error);
      res.status(500).json({ 
        message: "Failed to trigger auto-pilot task", 
        error: error.message 
      });
    }
  });
  
  // API status endpoint for detection by WordPress integration
  app.get("/api/status", (req, res) => {
    res.json({
      status: "ok",
      api: "nodejs",
      version: "1.0.0",
      serverTime: new Date().toISOString()
    });
  });
  
  // Mobile app connectivity endpoint
  app.get("/api/mobile/status", (req, res) => {
    res.json({
      status: "online",
      version: "1.0.0",
      serverTime: new Date().toISOString(),
      message: "Server is running and ready to accept connections from mobile applications",
      features: [
        "price_comparison",
        "store_locator",
        "product_search",
        "country_selection",
        "multilingual_support"
      ]
    });
  });
  
  // Super simple connectivity test endpoint - absolute minimal dependencies
  app.get("/ping", (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.send('pong ' + new Date().toISOString());
  });
  
  // Barebones HTML page for troubleshooting
  app.get("/barebones", (req, res) => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Barebones Test</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: sans-serif; margin: 20px; }
    .box { border: 1px solid #ccc; padding: 15px; margin: 15px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>Barebones Test Page</h1>
  <p>This is an extremely simple HTML page with no external dependencies.</p>
  
  <div class="box">
    <h2>Server Info</h2>
    <p>Time: ${new Date().toISOString()}</p>
    <p>Path: ${req.path}</p>
    <p>Method: ${req.method}</p>
  </div>

  <div class="box">
    <h2>Links to Test</h2>
    <ul>
      <li><a href="/ping">/ping</a> - Basic text response</li>
      <li><a href="/test-basic">/test-basic</a> - HTML test with diagnostics</li>
      <li><a href="/health-check">/health-check</a> - Health check page</li>
    </ul>
  </div>

  <div class="box">
    <h2>Client Info</h2>
    <p>User Agent: ${req.headers['user-agent'] || 'Not available'}</p>
    <p>IP Address: ${req.ip || req.connection.remoteAddress || 'Not available'}</p>
    <div id="client-info">Loading client info...</div>
  </div>

  <script>
    // Very simple inline script
    document.getElementById('client-info').innerHTML = 
      '<p>Window Size: ' + window.innerWidth + 'x' + window.innerHeight + '</p>' +
      '<p>Browser Language: ' + navigator.language + '</p>';
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.send(html);
  });
  
  // Simple HTML test endpoint (bypass React entirely)
  app.get("/test-basic", (req, res) => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Direct Server HTML Test</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            text-align: center;
            color: #333;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
          }
          
          h1 {
            color: #00539f;
          }
          
          .btn {
            display: inline-block;
            background: #00539f;
            color: white;
            padding: 8px 16px;
            margin: 5px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          
          .btn-reset {
            background: #e10600;
          }
          
          .server-info {
            margin-top: 20px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          
          pre {
            text-align: left;
            background: #f0f0f0;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Tesco Price Comparison - Direct Server Test</h1>
          <p>This is a simple static HTML page served directly from Express.</p>
          <p>If you can see this page, the server is working correctly.</p>
          
          <div id="counter-display">
            <p>Counter: <span id="count">0</span></p>
            <button class="btn" onclick="incrementCounter()">Increment</button>
            <button class="btn btn-reset" onclick="resetCounter()">Reset</button>
          </div>
          
          <p id="time">Current time: Loading...</p>
          
          <div class="server-info">
            <h2>Server Information</h2>
            <p>Server time: ${new Date().toISOString()}</p>
            <p>Node.js version: ${process.version}</p>
            <p>Server environment: ${process.env.NODE_ENV || 'development'}</p>
            
            <h3>Server Diagnostics</h3>
            <p>Headers received:</p>
            <pre>${JSON.stringify(req.headers, null, 2)}</pre>
            
            <h3>Try These URLs:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><a href="/health-check" target="_blank">/health-check</a> - Basic server health check</li>
              <li><a href="/direct-html" target="_blank">/direct-html</a> - Simple HTML test</li>
              <li><a href="/api/mobile/status" target="_blank">/api/mobile/status</a> - API status</li>
              <li><a href="/mobile" target="_blank">/mobile</a> - Mobile app view</li>
            </ul>
            
            <p>WebSocket test (check console):</p>
            <button class="btn" onclick="testWebSocket()">Test WebSocket</button>
            <div id="ws-status">WebSocket: Not tested</div>
          </div>
        </div>

        <script>
          // Simple counter functionality
          let count = 0;
          const countDisplay = document.getElementById('count');
          
          function incrementCounter() {
            count++;
            countDisplay.textContent = count;
          }
          
          function resetCounter() {
            count = 0;
            countDisplay.textContent = count;
          }
          
          // Update time
          function updateTime() {
            document.getElementById('time').textContent = 'Current time: ' + new Date().toLocaleTimeString();
          }
          
          // Initial time update and set interval
          updateTime();
          setInterval(updateTime, 1000);
          
          // WebSocket test
          function testWebSocket() {
            const wsStatusEl = document.getElementById('ws-status');
            wsStatusEl.textContent = 'WebSocket: Connecting...';
            
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = protocol + '//' + window.location.host + '/ws';
            console.log('Attempting to connect to WebSocket at:', wsUrl);
            
            const socket = new WebSocket(wsUrl);
            
            socket.onopen = function() {
              console.log('WebSocket connection established');
              wsStatusEl.textContent = 'WebSocket: Connected!';
              wsStatusEl.style.color = 'green';
              
              // Send a test message
              socket.send(JSON.stringify({
                type: 'diagnostics',
                message: 'Testing connection',
                timestamp: new Date().toISOString()
              }));
            };
            
            socket.onmessage = function(event) {
              console.log('WebSocket message received:', event.data);
              try {
                const data = JSON.parse(event.data);
                wsStatusEl.textContent = 'WebSocket: Received data - ' + JSON.stringify(data).substring(0, 30) + '...';
              } catch(e) {
                wsStatusEl.textContent = 'WebSocket: Received: ' + event.data.substring(0, 30) + '...';
              }
            };
            
            socket.onerror = function(error) {
              console.error('WebSocket error:', error);
              wsStatusEl.textContent = 'WebSocket: Error occurred';
              wsStatusEl.style.color = 'red';
            };
            
            socket.onclose = function() {
              console.log('WebSocket connection closed');
              wsStatusEl.textContent = 'WebSocket: Connection closed';
            };
          }
        </script>
      </body>
      </html>
    `;
    res.send(html);
  });

  // Special direct HTML rendering route - completely bypasses all complex rendering
  app.get("/direct-html", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Direct HTML Response</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 0; 
      padding: 20px; 
      text-align: center;
      background-color: #f0f0f0;
      line-height: 1.6;
    }
    h1 { color: #00539f; margin-bottom: 20px; }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .counter {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    button {
      background: #00539f;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      margin: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    .reset { background: #e10600; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Tesco Price Comparison - Direct HTML Test</h1>
    <p>This is a completely self-contained HTML page sent directly from the server with no external dependencies.</p>
    
    <div class="counter">
      <h2>Interactive Counter</h2>
      <p>Counter value: <span id="count">0</span></p>
      <button onclick="increment()">Increment</button>
      <button class="reset" onclick="reset()">Reset</button>
    </div>
    
    <p id="time">Current time: Loading...</p>
    
    <script>
      // No external dependencies - everything is inline
      let count = 0;
      
      function increment() {
        count++;
        document.getElementById('count').textContent = count;
      }
      
      function reset() {
        count = 0;
        document.getElementById('count').textContent = count;
      }
      
      // Update time function
      function updateTime() {
        document.getElementById('time').textContent = 'Current time: ' + new Date().toLocaleTimeString();
      }
      
      // Initial update and set interval
      updateTime();
      setInterval(updateTime, 1000);
      
      // Log to console for verification
      console.log('Direct HTML test page loaded successfully!');
    </script>
  </div>
</body>
</html>
    `);
  });
  
  // Delete the duplicated routes (they are already defined at the top of the file)

  // Payment routes
  app.use("/api/payments", paymentRouter);
  
  // Affiliate routes
  app.use("/api/affiliate", affiliateRouter);
  
  // Use the admin routes
  app.use("/api/admin", adminRouter);
  
  // Use the vendor routes
  app.use("/api/vendor", vendorRouter);
  
  // Use the marketplace routes
  app.use("/api/marketplace", marketplaceRouter);
  
  // Register AI routes for AI-powered features
  app.use("/api/ai", aiRouter);
  
  // Register social media integration routes
  app.use("/api/social-media", socialMediaRouter);
  
  // Register savings challenge routes
  app.use("/api/savings-challenge", savingsChallengeRouter);
  
  // Register revision management routes
  app.use("/api/revisions", revisionRouter);
  
  // Shopify integration
  app.use("/api/shopify", shopifyRouter);
  
  // Mini Paybill System with E-Top-Up functionality
  app.use("/api/paybill", paybillRouter);
  
  // Push notification routes for price alerts
  app.use("/api/push-notifications", pushNotificationRouter);
  app.use("/api/price-alerts", pushNotificationRouter);
  app.use("/api/notifications", pushNotificationRouter);
  
  // Network sync and revision routes
  app.use("/api/sync", syncRouter);
  
  // Visual search direct routes
  app.post("/api/ai/visual-search", uploadProductImage, handleVisualSearch);
  app.get("/api/ai/b2b-insights/:productId", getB2BInsights);
  
  // Special admin login routes
  app.get('/admin-login.html', (req, res) => {
    try {
      const htmlFile = fs.readFileSync('./public/admin-login.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving admin-login.html:', err);
      res.status(500).send('Error loading admin login page');
    }
  });
  
  app.get('/admin-2fa.html', (req, res) => {
    try {
      const htmlFile = fs.readFileSync('./public/admin-2fa.html', 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlFile);
    } catch (err) {
      console.error('Error serving admin-2fa.html:', err);
      res.status(500).send('Error loading admin 2FA page');
    }
  });
Initialize Network Integration Systems
  const wsNetworkServer = new WebSocketNetworkServer(httpServer);
  setSyncServices(wsNetworkServer);
  
  // 
  const httpServer = createServer(app);
  
  // WebSocket server for real-time price updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Make the WebSocket server available to the admin routes for auto-pilot updates
  setWebSocketServer(wss);
  
  // Make the WebSocket server available to the vendor routes
  setVendorWebSocketServer(wss);
  
  // Initialize the product data auto-updater system
  initializeAutoUpdater(wss);
  
  // Initialize the auto-pilot system
  initializeAutoPilot(wss);
  
  // Initialize the Shopify integration
  initializeShopifyIntegration(wss);
  
  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to Tesco Price Comparison WebSocket server',
      timestamp: new Date().toISOString()
    }));
    
    // Handle messages from clients
    ws.on('message', async (message) => {
      try {
        console.log('Received WebSocket message:', message.toString());
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'subscribe_product':
            if (data.productId) {
              const productId = parseInt(data.productId);
              
              // Fetch updated product prices
              const prices = await storage.compareProductPrices(productId);
              
              // Update prices with correct currencies for each store country
              const formattedPrices = prices.map(priceData => {
                // Set appropriate currencies for each store based on country
                if (priceData.store.name === "Naivas" || priceData.store.name.includes("Kenya")) {
                  return {
                    ...priceData,
                    currency: "KSh",  // Kenyan Shilling
                    price: Math.round(priceData.price * 129.5), // Convert to KSh
                  };
                } else if (priceData.store.name === "Tesco" || priceData.store.name.includes("UK")) {
                  return {
                    ...priceData,
                    currency: "£", // British Pound
                    price: Math.round(priceData.price * 0.78 * 100) / 100, // Convert to GBP
                  };
                } else if (priceData.store.name === "Carrefour" || priceData.store.name.includes("France")) {
                  return {
                    ...priceData,
                    currency: "€", // Euro
                    price: Math.round(priceData.price * 0.92 * 100) / 100, // Convert to EUR
                  };
                } else if (priceData.store.name === "Shoprite" || priceData.store.name.includes("South Africa")) {
                  return {
                    ...priceData,
                    currency: "R", // South African Rand
                    price: Math.round(priceData.price * 18.27), // Convert to ZAR
                  };
                }
                return priceData;
              });
              
              // Send real-time price updates
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'price_update',
                  productId,
                  prices: formattedPrices,
                  timestamp: new Date().toISOString()
                }));
              }
            }
            break;
            
          case 'subscribe_country':
            if (data.countryCode) {
              const country = await storage.getCountryByCode(data.countryCode);
              const stores = country ? await storage.getStoresByCountry(country.id) : [];
              
              // Send country stores update
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'country_stores_update',
                  countryCode: data.countryCode,
                  stores,
                  timestamp: new Date().toISOString()
                }));
              }
            }
            break;
            
          case 'auto_pilot_trigger':
            if (data.feature) {
              try {
                // Trigger the auto-pilot task
                const result = await manuallyTriggerTask(data.feature, wss);
                
                // Send response
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({
                    type: 'auto_pilot_response',
                    feature: data.feature,
                    success: true,
                    result,
                    timestamp: new Date().toISOString()
                  }));
                }
              } catch (error) {
                console.error(`Error triggering auto-pilot task via WebSocket:`, error);
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({
                    type: 'auto_pilot_response',
                    feature: data.feature,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                  }));
                }
              }
            }
            break;
            
          case 'get_auto_pilot_status':
            try {
              // Get all auto-pilot configurations
              const configs = await storage.getAutoPilotConfigs();
              
              // Send response
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'auto_pilot_status',
                  configs,
                  timestamp: new Date().toISOString()
                }));
              }
            } catch (error) {
              console.error(`Error getting auto-pilot status via WebSocket:`, error);
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'error',
                  message: 'Error getting auto-pilot status',
                  error: error.message,
                  timestamp: new Date().toISOString()
                }));
              }
            }
            break;
            
          case 'get_blog_posts':
            try {
              // Get recent blog posts
              const posts = await storage.getRecentBlogPosts(data.limit || 5);
              
              // Send response
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'blog_posts',
                  posts,
                  timestamp: new Date().toISOString()
                }));
              }
            } catch (error) {
              console.error(`Error getting blog posts via WebSocket:`, error);
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'error',
                  message: 'Error getting blog posts',
                  error: error.message,
                  timestamp: new Date().toISOString()
                }));
              }
            }
            break;
            
          case 'diagnostics':
            // Echo back diagnostic information
            console.log('Received diagnostics request:', data);
            ws.send(JSON.stringify({
              type: 'diagnostics_response',
              message: 'Server received your diagnostic message',
              originalMessage: data,
              serverTime: new Date().toISOString(),
              serverInfo: {
                nodeVersion: process.version,
                environment: process.env.NODE_ENV || 'development'
              }
            }));
            break;
            
          case 'get_autopilot_status':
            try {
              // Get all auto-pilot configs
              const configs = await storage.getAutoPilotConfigs();
              
              // Get running and completed tasks
              const logs = await storage.getAutoPilotLogs();
              const runningTasks = logs.filter(log => !log.endTime).length;
              const completedTasks = logs.filter(log => log.status === 'success').length;
              
              // Get the next scheduled task
              const enabledConfigs = await storage.getEnabledAutoPilotConfigs();
              let nextTaskTime = null;
              
              if (enabledConfigs.length > 0) {
                // Find the task with the closest nextRun time
                const nextTask = enabledConfigs
                  .filter(config => config.nextRun)
                  .sort((a, b) => {
                    const aTime = a.nextRun ? a.nextRun.getTime() : Infinity;
                    const bTime = b.nextRun ? b.nextRun.getTime() : Infinity;
                    return aTime - bTime;
                  })[0];
                
                if (nextTask) {
                  nextTaskTime = nextTask.nextRun;
                }
              }
              
              // Get recent blog posts
              const blogPosts = await storage.getRecentBlogPosts(10);
              
              // Send complete status data
              ws.send(JSON.stringify({
                type: 'autopilot_status',
                runningTasks,
                completedTasks,
                nextTaskTime,
                blogPostsCount: blogPosts.length,
                tasks: configs.map(config => ({
                  id: config.id,
                  feature: config.feature,
                  description: config.description,
                  isEnabled: config.isEnabled,
                  lastRun: config.lastRun,
                  nextRun: config.nextRun
                })),
                blogPosts: blogPosts.map(post => ({
                  id: post.id,
                  title: post.title,
                  publishedDate: post.publishedDate,
                  slug: post.slug,
                  categoryId: post.categoryId
                })),
                logs: logs.slice(0, 20).map(log => ({
                  id: log.id,
                  feature: configs.find(c => c.id === log.featureId)?.feature || 'unknown',
                  startTime: log.startTime,
                  endTime: log.endTime,
                  status: log.status,
                  details: log.details
                }))
              }));
            } catch (error) {
              console.error('Error fetching auto-pilot status:', error);
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to fetch auto-pilot status',
                timestamp: new Date().toISOString()
              }));
            }
            break;
            
          case 'trigger_autopilot_task':
            try {
              if (!data.feature) {
                throw new Error('Missing feature parameter');
              }
              
              // Manually trigger the task
              await manuallyTriggerTask(data.feature, wss);
              
              ws.send(JSON.stringify({
                type: 'task_triggered',
                feature: data.feature,
                timestamp: new Date().toISOString()
              }));
            } catch (error) {
              console.error('Error triggering auto-pilot task:', error);
              ws.send(JSON.stringify({
                type: 'error',
                message: `Failed to trigger task: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date().toISOString()
              }));
            }
            break;
            
          case 'shopify_sync':
            try {
              const shopifyIntegration = getShopifyIntegration();
              
              ws.send(JSON.stringify({
                type: 'shopify_sync_started',
                message: 'Shopify sync started',
                timestamp: new Date().toISOString()
              }));
              
              // Run the sync async without waiting for completion
              shopifyIntegration.fetchAllStoreProducts()
                .then(count => {
                  console.log(`Synced ${count} products from Shopify stores`);
                })
                .catch(error => {
                  console.error('Error during Shopify sync:', error);
                });
            } catch (error) {
              console.error('Error triggering Shopify sync:', error);
              ws.send(JSON.stringify({
                type: 'error',
                message: `Failed to trigger Shopify sync: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date().toISOString()
              }));
            }
            break;
            
          case 'get_shopify_products':
            try {
              // Get Shopify products with pagination
              const page = data.page || 1;
              const limit = data.limit || 20;
              const offset = (page - 1) * limit;
              
              const products = await db
                .select({
                  product: products,
                  store: stores,
                  price: productPrices,
                })
                .from(products)
                .innerJoin(productPrices, eq(products.id, productPrices.productId))
                .innerJoin(stores, eq(productPrices.storeId, stores.id))
                .where(eq(products.source, 'shopify'))
                .orderBy(desc(products.updatedAt))
                .limit(limit)
                .offset(offset);
              
              // Format results
              const formattedProducts = products.map(item => ({
                id: item.product.id,
                name: item.product.name,
                imageUrl: item.product.imageUrl,
                price: item.price.price,
                currency: item.price.currency,
                storeName: item.store.name,
                storeLogoUrl: item.store.logoUrl,
              }));
              
              ws.send(JSON.stringify({
                type: 'shopify_products',
                products: formattedProducts,
                page,
                limit,
                timestamp: new Date().toISOString()
              }));
            } catch (error) {
              console.error('Error fetching Shopify products:', error);
              ws.send(JSON.stringify({
                type: 'error',
                message: `Failed to fetch Shopify products: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date().toISOString()
              }));
            }
            break;
            
          default:
            // Unknown message type
            console.log('Received unknown message type:', data.type);
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Unknown message type',
              timestamp: new Date().toISOString()
            }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Error processing message',
            timestamp: new Date().toISOString()
          }));
        }
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
    
    // Error handling
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // Special test endpoints for development environment only
  if (process.env.NODE_ENV === 'development') {
    // Test endpoint to trigger auto-blog generation
    app.get('/api/test/auto-blog-trigger', async (req, res) => {
      try {
        console.log('Test endpoint triggered: auto-blog generation');
        const result = await manuallyTriggerTask('auto-blog-weekly', wss);
        res.json({ 
          success: true, 
          message: 'Auto-blog generation triggered successfully',
          note: 'This is a test endpoint only available in development mode'
        });
      } catch (error) {
        console.error('Error in test endpoint:', error);
        res.status(500).json({ 
          error: 'Failed to trigger auto-blog generation',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });
    
    // Test endpoint to check OpenAI API status
    app.get('/api/test/openai-status', async (req, res) => {
      try {
        // Check if OpenAI API key is configured
        const hasApiKey = !!process.env.OPENAI_API_KEY;
        
        res.json({
          success: true,
          apiKeyConfigured: hasApiKey,
          fallbackMechanismEnabled: true,
          message: hasApiKey 
            ? 'OpenAI API key is configured, using AI-generated content' 
            : 'OpenAI API key is not configured, using fallback content'
        });
      } catch (error) {
        console.error('Error checking OpenAI status:', error);
        res.status(500).json({
          error: 'Failed to check OpenAI status',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });
    
    // Test endpoint to get auto-pilot configurations
    app.get('/api/test/auto-pilot-configs', async (req, res) => {
      try {
        const configs = await storage.getAutoPilotConfigs();
        res.json({
          success: true,
          configs: configs.map(config => ({
            id: config.id,
            feature: config.feature,
            isEnabled: config.isEnabled,
            description: config.description,
            nextRun: config.nextRun,
            lastRun: config.lastRun
          }))
        });
      } catch (error) {
        console.error('Error fetching auto-pilot configs:', error);
        res.status(500).json({
          error: 'Failed to fetch auto-pilot configurations',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });
  }
  
  return httpServer;
}
