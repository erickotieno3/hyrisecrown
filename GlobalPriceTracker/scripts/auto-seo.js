/**
 * Auto-SEO Optimization System
 * 
 * This script automatically optimizes SEO for the Tesco Price Comparison platform by:
 * 1. Generating optimized meta tags and descriptions
 * 2. Creating structured data (JSON-LD) for product listings
 * 3. Generating SEO-friendly URLs and sitemaps
 * 4. Implementing canonical URLs to prevent duplicate content
 * 5. Optimizing content for featured snippets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { OpenAI } from 'openai';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  // Deployment URLs
  siteUrl: process.env.PRIMARY_URL || 'https://tesco-price-comparison.hyrisecrown.replit.app',
  
  // SEO update interval (default: 7 days)
  seoUpdateInterval: 7 * 24 * 60 * 60 * 1000,
  
  // Priority categories and products for SEO
  priorityCategories: ['groceries', 'electronics', 'household', 'beauty'],
  
  // Target keywords by priority
  targetKeywords: {
    primary: ['price comparison', 'best deals', 'save money', 'lowest prices', 'tesco offers'],
    secondary: ['compare supermarkets', 'food price comparison', 'grocery savings', 'cheap shopping'],
    local: ['tesco prices kenya', 'supermarket comparison nairobi', 'uk price comparison']
  },
  
  // Output directories
  outputDir: path.join(__dirname, '..', 'public', 'seo'),
  sitemapPath: path.join(__dirname, '..', 'public', 'sitemap.xml'),
  robotsPath: path.join(__dirname, '..', 'public', 'robots.txt'),
  
  // Log configuration
  logFile: path.join(__dirname, '..', 'logs', 'auto-seo.log'),
  maxLogSize: 5 * 1024 * 1024 // 5MB
};

// Initialize OpenAI client if API key is available
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  log('OpenAI client initialized for AI-powered SEO optimization');
} catch (error) {
  log(`OpenAI client initialization failed: ${error.message}`, true);
}

/**
 * Make sure necessary directories exist
 */
function ensureDirectories() {
  const logsDir = path.dirname(config.logFile);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
}

/**
 * Log a message to both console and log file
 */
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}`;
  
  if (isError) {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
  
  // Append to log file
  ensureDirectories();
  fs.appendFileSync(config.logFile, logMessage + '\n');
  
  // Check log file size and rotate if needed
  rotateLogFile();
}

/**
 * Rotate the log file when it gets too big
 */
function rotateLogFile() {
  try {
    const stats = fs.statSync(config.logFile);
    if (stats.size > config.maxLogSize) {
      const backupFile = `${config.logFile}.old`;
      if (fs.existsSync(backupFile)) {
        fs.unlinkSync(backupFile);
      }
      fs.renameSync(config.logFile, backupFile);
      log('Log file rotated due to size limit');
    }
  } catch (error) {
    // Ignore errors if file doesn't exist yet
    if (error.code !== 'ENOENT') {
      console.error('Error rotating log file:', error.message);
    }
  }
}

/**
 * Generate SEO metadata for a page using AI
 */
async function generateSeoMetadata(page, content) {
  if (!openai) {
    log('OpenAI client not available, using fallback SEO metadata', true);
    return {
      title: `${page.charAt(0).toUpperCase() + page.slice(1)} | Tesco Price Comparison`,
      description: `Compare prices for ${page} across multiple stores and save money on your shopping.`,
      keywords: config.targetKeywords.primary.join(', ')
    };
  }
  
  try {
    const prompt = `
Generate SEO metadata for a price comparison website page about "${page}".
Include title, description (max 160 chars), and keywords.
Make it compelling, include price comparison, savings, and bargain-related terms.
Format as JSON: {"title": "...", "description": "...", "keywords": "..."}
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are an SEO expert specializing in e-commerce and price comparison websites." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    log(`Generated SEO metadata for ${page}`);
    return result;
  } catch (error) {
    log(`Error generating SEO metadata with AI: ${error.message}`, true);
    return {
      title: `${page.charAt(0).toUpperCase() + page.slice(1)} | Tesco Price Comparison`,
      description: `Compare prices for ${page} across multiple stores and save money on your shopping.`,
      keywords: config.targetKeywords.primary.join(', ')
    };
  }
}

/**
 * Generate structured data (JSON-LD) for a product
 */
function generateStructuredData(product) {
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.imageUrl,
    "offers": product.prices.map(price => ({
      "@type": "Offer",
      "price": price.price,
      "priceCurrency": price.currency,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": price.storeName
      }
    }))
  };
  
  return JSON.stringify(jsonLd, null, 2);
}

/**
 * Generate a sitemap.xml file
 */
async function generateSitemap(pages) {
  log('Generating sitemap.xml...');
  
  const now = new Date().toISOString();
  
  // Add product and category pages
  let xmlEntries = pages.map(page => `
  <url>
    <loc>${config.siteUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changeFreq || 'weekly'}</changefreq>
    <priority>${page.priority || '0.7'}</priority>
  </url>
  `).join('');
  
  // Add store pages
  const stores = await fetchStores();
  const storeEntries = stores.map(store => `
  <url>
    <loc>${config.siteUrl}/store/${store.id}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('');
  
  xmlEntries += storeEntries;
  
  // Add important static pages
  const staticPages = [
    { url: '/about', priority: '0.6', changeFreq: 'monthly' },
    { url: '/contact', priority: '0.6', changeFreq: 'monthly' },
    { url: '/terms', priority: '0.4', changeFreq: 'monthly' },
    { url: '/privacy', priority: '0.4', changeFreq: 'monthly' },
    { url: '/faq', priority: '0.7', changeFreq: 'weekly' },
    { url: '/blog', priority: '0.8', changeFreq: 'weekly' },
    { url: '/savings-challenge', priority: '0.8', changeFreq: 'weekly' },
    { url: '/compare', priority: '0.9', changeFreq: 'daily' }
  ];
  
  const staticEntries = staticPages.map(page => `
  <url>
    <loc>${config.siteUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
  `).join('');
  
  xmlEntries += staticEntries;
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${config.siteUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${xmlEntries}
</urlset>`;
  
  fs.writeFileSync(config.sitemapPath, sitemap);
  log(`Sitemap generated at ${config.sitemapPath} with ${pages.length + stores.length + staticPages.length + 1} URLs`);
  
  // Generate sitemap index if we have a large number of URLs
  if (pages.length > 1000) {
    log('Large number of URLs detected, generating sitemap index...');
    generateSitemapIndex(pages, stores, staticPages);
  }
}

/**
 * Generate sitemap_index.xml file for large number of URLs
 */
async function generateSitemapIndex(products, stores, staticPages) {
  log('Generating sitemap index...');
  
  const now = new Date().toISOString();
  const sitemapDir = path.dirname(config.sitemapPath);
  
  // Create subdirectory for multiple sitemap files
  const sitemapsDir = path.join(sitemapDir, 'sitemaps');
  if (!fs.existsSync(sitemapsDir)) {
    fs.mkdirSync(sitemapsDir, { recursive: true });
  }
  
  // Create product sitemap (chunked into files of 1000 products)
  const productChunks = [];
  for (let i = 0; i < products.length; i += 1000) {
    productChunks.push(products.slice(i, i + 1000));
  }
  
  const sitemapFiles = [];
  
  // Generate product sitemap files
  for (let i = 0; i < productChunks.length; i++) {
    const chunk = productChunks[i];
    const filename = `sitemap-products-${i + 1}.xml`;
    const filePath = path.join(sitemapsDir, filename);
    
    const productEntries = chunk.map(page => `
  <url>
    <loc>${config.siteUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changeFreq || 'weekly'}</changefreq>
    <priority>${page.priority || '0.7'}</priority>
  </url>
  `).join('');
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${productEntries}
</urlset>`;
    
    fs.writeFileSync(filePath, sitemap);
    sitemapFiles.push({ path: `/sitemaps/${filename}`, lastmod: now });
    log(`Generated product sitemap chunk ${i + 1} with ${chunk.length} URLs`);
  }
  
  // Generate stores sitemap
  const storeEntries = stores.map(store => `
  <url>
    <loc>${config.siteUrl}/store/${store.id}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('');
  
  const storesSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${storeEntries}
</urlset>`;
  
  const storesPath = path.join(sitemapsDir, 'sitemap-stores.xml');
  fs.writeFileSync(storesPath, storesSitemap);
  sitemapFiles.push({ path: '/sitemaps/sitemap-stores.xml', lastmod: now });
  log(`Generated stores sitemap with ${stores.length} URLs`);
  
  // Generate static pages sitemap
  const staticEntries = staticPages.map(page => `
  <url>
    <loc>${config.siteUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
  `).join('');
  
  // Add homepage
  const homeEntry = `
  <url>
    <loc>${config.siteUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  `;
  
  const staticSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${homeEntry}
${staticEntries}
</urlset>`;
  
  const staticPath = path.join(sitemapsDir, 'sitemap-static.xml');
  fs.writeFileSync(staticPath, staticSitemap);
  sitemapFiles.push({ path: '/sitemaps/sitemap-static.xml', lastmod: now });
  log(`Generated static pages sitemap with ${staticPages.length + 1} URLs`);
  
  // Generate the sitemap index
  const sitemapIndexEntries = sitemapFiles.map(file => `
  <sitemap>
    <loc>${config.siteUrl}${file.path}</loc>
    <lastmod>${file.lastmod}</lastmod>
  </sitemap>
  `).join('');
  
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapIndexEntries}
</sitemapindex>`;
  
  const sitemapIndexPath = path.join(sitemapDir, 'sitemap_index.xml');
  fs.writeFileSync(sitemapIndexPath, sitemapIndex);
  log(`Generated sitemap index at ${sitemapIndexPath} with ${sitemapFiles.length} sitemaps`);
  
  // Update robots.txt to point to the sitemap index
  const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${config.siteUrl}/sitemap_index.xml

# Optimize crawl rate
Crawl-delay: 5

# Block admin routes
Disallow: /admin
Disallow: /api/
Disallow: /vendor-portal/

# Allow Googlebot all access
User-agent: Googlebot
Allow: /
`;
  
  fs.writeFileSync(config.robotsPath, robotsTxt);
  log(`Updated robots.txt to point to sitemap index`);
}

/**
 * Generate robots.txt file
 */
function generateRobotsTxt() {
  log('Generating robots.txt...');
  
  const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${config.siteUrl}/sitemap.xml

# Optimize crawl rate
Crawl-delay: 5

# Block admin routes
Disallow: /admin
Disallow: /api/
Disallow: /vendor-portal/

# Allow Googlebot all access
User-agent: Googlebot
Allow: /
`;
  
  fs.writeFileSync(config.robotsPath, robotsTxt);
  log(`robots.txt generated at ${config.robotsPath}`);
}

/**
 * Generate canonical URL configuration
 */
function generateCanonicalConfig() {
  log('Generating canonical URL configuration...');
  
  const canonicalConfig = {
    homePage: `${config.siteUrl}/`,
    categoryPages: {},
    productPages: {},
    defaultCanonical: config.siteUrl
  };
  
  // Add canonical URLs for priority categories
  config.priorityCategories.forEach(category => {
    canonicalConfig.categoryPages[category] = `${config.siteUrl}/category/${category}`;
  });
  
  const canonicalConfigPath = path.join(config.outputDir, 'canonical.json');
  fs.writeFileSync(canonicalConfigPath, JSON.stringify(canonicalConfig, null, 2));
  log(`Canonical URL configuration generated at ${canonicalConfigPath}`);
}

/**
 * Fetch popular products for SEO optimization
 */
async function fetchPopularProducts() {
  try {
    const response = await fetch(`${config.siteUrl}/api/products/popular?limit=20`);
    if (response.ok) {
      return await response.json();
    } else {
      log(`Failed to fetch popular products: ${response.status}`, true);
      // Attempt to fetch using alternate endpoint
      try {
        const alternateResponse = await fetch(`${config.siteUrl}/api/products?sort=popularity&limit=20`);
        if (alternateResponse.ok) {
          return await alternateResponse.json();
        }
      } catch (altError) {
        log(`Failed to fetch from alternate endpoint: ${altError.message}`, true);
      }
      return [];
    }
  } catch (error) {
    log(`Error fetching popular products: ${error.message}`, true);
    return [];
  }
}

/**
 * Fetch category data for SEO optimization
 */
async function fetchCategories() {
  try {
    const response = await fetch(`${config.siteUrl}/api/categories`);
    if (response.ok) {
      return await response.json();
    } else {
      log(`Failed to fetch categories: ${response.status}`, true);
      return config.priorityCategories.map(name => ({ name, id: name.toLowerCase().replace(/\s+/g, '-') }));
    }
  } catch (error) {
    log(`Error fetching categories: ${error.message}`, true);
    return config.priorityCategories.map(name => ({ name, id: name.toLowerCase().replace(/\s+/g, '-') }));
  }
}

/**
 * Fetch store data for SEO optimization
 */
async function fetchStores() {
  try {
    const response = await fetch(`${config.siteUrl}/api/stores`);
    if (response.ok) {
      return await response.json();
    } else {
      log(`Failed to fetch stores: ${response.status}`, true);
      return [
        { name: 'Tesco', id: 'tesco' },
        { name: 'Walmart', id: 'walmart' },
        { name: 'Carrefour', id: 'carrefour' },
        { name: 'Aldi', id: 'aldi' }
      ];
    }
  } catch (error) {
    log(`Error fetching stores: ${error.message}`, true);
    return [
      { name: 'Tesco', id: 'tesco' },
      { name: 'Walmart', id: 'walmart' },
      { name: 'Carrefour', id: 'carrefour' },
      { name: 'Aldi', id: 'aldi' }
    ];
  }
}

/**
 * Generate SEO-friendly product pages configuration
 */
async function generateProductSeoConfig(products) {
  log('Generating SEO configuration for product pages...');
  
  const productSeoConfig = [];
  
  for (const product of products) {
    const seoMetadata = await generateSeoMetadata(`${product.name} - price comparison`, product.description);
    const structuredData = generateStructuredData(product);
    
    productSeoConfig.push({
      id: product.id,
      name: product.name,
      url: `/product/${product.id}/${encodeURIComponent(product.name.toLowerCase().replace(/\s+/g, '-'))}`,
      metadata: seoMetadata,
      structuredData,
      priority: product.popularity > 8 ? '0.9' : '0.7',
      changeFreq: 'daily'
    });
  }
  
  const productSeoConfigPath = path.join(config.outputDir, 'product-seo.json');
  fs.writeFileSync(productSeoConfigPath, JSON.stringify(productSeoConfig, null, 2));
  log(`Product SEO configuration generated at ${productSeoConfigPath}`);
  
  return productSeoConfig;
}

/**
 * Generate SEO-friendly category pages configuration
 */
async function generateCategorySeoConfig() {
  log('Generating SEO configuration for category pages...');
  
  const categorySeoConfig = [];
  
  for (const category of config.priorityCategories) {
    const seoMetadata = await generateSeoMetadata(`${category} - price comparison`, `Find the best prices for ${category} products across multiple stores.`);
    
    categorySeoConfig.push({
      name: category,
      url: `/category/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`,
      metadata: seoMetadata,
      priority: '0.8',
      changeFreq: 'weekly'
    });
  }
  
  const categorySeoConfigPath = path.join(config.outputDir, 'category-seo.json');
  fs.writeFileSync(categorySeoConfigPath, JSON.stringify(categorySeoConfig, null, 2));
  log(`Category SEO configuration generated at ${categorySeoConfigPath}`);
  
  return categorySeoConfig;
}

/**
 * Run the main SEO optimization process
 */
async function runSeoOptimization() {
  log('Starting SEO optimization process...');
  
  try {
    // Ensure necessary directories exist
    ensureDirectories();
    
    // Generate SEO configurations
    const products = await fetchPopularProducts();
    const productSeoConfig = await generateProductSeoConfig(products);
    const categorySeoConfig = await generateCategorySeoConfig();
    
    // Generate sitemap and robots.txt
    const allPages = [...productSeoConfig, ...categorySeoConfig];
    await generateSitemap(allPages);
    generateRobotsTxt();
    
    // Generate canonical URL configuration
    generateCanonicalConfig();
    
    log('SEO optimization completed successfully');
    return true;
  } catch (error) {
    log(`SEO optimization process failed: ${error.message}`, true);
    return false;
  }
}

/**
 * Check if SEO needs to be updated
 */
function needsSeoUpdate() {
  try {
    const sitemapExists = fs.existsSync(config.sitemapPath);
    if (!sitemapExists) {
      return true;
    }
    
    const stats = fs.statSync(config.sitemapPath);
    const lastModified = stats.mtime.getTime();
    const now = new Date().getTime();
    
    return (now - lastModified) > config.seoUpdateInterval;
  } catch (error) {
    // If there's any error checking, assume we need an update
    return true;
  }
}

/**
 * Main function to start the Auto-SEO system
 */
async function startAutoSeo() {
  log('Auto-SEO system started');
  
  // Perform initial SEO optimization if needed
  if (needsSeoUpdate()) {
    log('Initial SEO update needed');
    await runSeoOptimization();
  } else {
    log('SEO is up to date, no immediate update needed');
  }
  
  // Schedule regular SEO updates
  setInterval(async () => {
    log('Scheduled SEO update time reached');
    await runSeoOptimization();
  }, config.seoUpdateInterval);
}

// Run the Auto-SEO system if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startAutoSeo().catch(error => {
    log(`Unhandled error in Auto-SEO system: ${error.message}`, true);
  });
}

// Export for use in other modules
export { startAutoSeo, runSeoOptimization, generateSeoMetadata, generateStructuredData };