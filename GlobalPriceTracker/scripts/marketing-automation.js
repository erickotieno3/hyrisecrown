/**
 * Marketing Automation System
 * 
 * This script coordinates the auto-SEO optimization and auto-campaign marketing systems,
 * ensuring they work together efficiently to promote the Tesco Price Comparison platform.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { startAutoSeo, runSeoOptimization } from './auto-seo.js';
import { startAutoCampaign, generateCampaigns } from './auto-campaign.js';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  // Base intervals (in milliseconds)
  seoInterval: 7 * 24 * 60 * 60 * 1000,      // 7 days
  campaignInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Stagger the updates to prevent resource contention
  campaignDelay: 12 * 60 * 60 * 1000,       // 12 hours after SEO update
  
  // Log configuration
  logFile: path.join(__dirname, '..', 'logs', 'marketing-automation.log'),
  maxLogSize: 5 * 1024 * 1024 // 5MB
};

/**
 * Make sure necessary directories exist
 */
function ensureDirectories() {
  const logsDir = path.dirname(config.logFile);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
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
 * Start the SEO and campaign marketing systems with coordinated timing
 */
async function startMarketingAutomation() {
  log('Marketing Automation System started');
  
  try {
    // Start SEO optimization system immediately
    log('Starting Auto-SEO system...');
    startAutoSeo().catch(error => {
      log(`Error in Auto-SEO system: ${error.message}`, true);
    });
    
    // Delay campaign system start to stagger resource usage
    log(`Starting Auto-Campaign system after ${config.campaignDelay / (60 * 60 * 1000)} hours delay...`);
    setTimeout(() => {
      startAutoCampaign().catch(error => {
        log(`Error in Auto-Campaign system: ${error.message}`, true);
      });
    }, config.campaignDelay);
    
    // Schedule periodic status checks and coordination
    setInterval(checkMarketingStatus, 24 * 60 * 60 * 1000); // Daily check
    
    log('Marketing Automation System fully initialized');
  } catch (error) {
    log(`Marketing Automation System initialization failed: ${error.message}`, true);
  }
}

/**
 * Check the status of SEO and marketing campaigns
 */
async function checkMarketingStatus() {
  log('Performing marketing systems status check');
  
  // Check SEO sitemap existence and freshness
  try {
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    const sitemapExists = fs.existsSync(sitemapPath);
    
    if (!sitemapExists) {
      log('Sitemap not found, triggering SEO optimization', true);
      await runSeoOptimization();
    } else {
      const stats = fs.statSync(sitemapPath);
      const lastModified = stats.mtime.getTime();
      const now = new Date().getTime();
      const daysSinceUpdate = Math.floor((now - lastModified) / (24 * 60 * 60 * 1000));
      
      log(`Sitemap last updated ${daysSinceUpdate} days ago`);
      if (daysSinceUpdate > 10) {
        log('Sitemap is outdated, triggering SEO optimization');
        await runSeoOptimization();
      }
    }
  } catch (error) {
    log(`Error checking SEO status: ${error.message}`, true);
  }
  
  // Check campaign freshness
  try {
    const campaignIndexPath = path.join(__dirname, '..', 'marketing', 'campaigns', 'campaign-index.json');
    const campaignIndexExists = fs.existsSync(campaignIndexPath);
    
    if (!campaignIndexExists) {
      log('Campaign index not found, triggering campaign generation', true);
      await generateCampaigns();
    } else {
      const indexData = JSON.parse(fs.readFileSync(campaignIndexPath, 'utf8'));
      const lastGenerated = new Date(indexData.generatedAt).getTime();
      const now = new Date().getTime();
      const daysSinceUpdate = Math.floor((now - lastGenerated) / (24 * 60 * 60 * 1000));
      
      log(`Marketing campaigns last updated ${daysSinceUpdate} days ago`);
      if (daysSinceUpdate > 10) {
        log('Marketing campaigns are outdated, triggering regeneration');
        await generateCampaigns();
      }
    }
  } catch (error) {
    log(`Error checking campaign status: ${error.message}`, true);
  }
  
  // Generate overall marketing health report
  generateMarketingHealthReport();
}

/**
 * Generate a marketing health report
 */
function generateMarketingHealthReport() {
  log('Generating marketing health report');
  
  try {
    const report = {
      generatedAt: new Date().toISOString(),
      seoStatus: {},
      campaignStatus: {}
    };
    
    // Check SEO artifacts
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      const stats = fs.statSync(sitemapPath);
      report.seoStatus.sitemap = {
        exists: true,
        lastModified: stats.mtime.toISOString(),
        sizeBytes: stats.size
      };
    } else {
      report.seoStatus.sitemap = {
        exists: false
      };
    }
    
    // Count SEO configurations
    const seoDir = path.join(__dirname, '..', 'public', 'seo');
    if (fs.existsSync(seoDir)) {
      const seoFiles = fs.readdirSync(seoDir).filter(file => file.endsWith('.json'));
      report.seoStatus.configFiles = {
        count: seoFiles.length,
        files: seoFiles
      };
    } else {
      report.seoStatus.configFiles = {
        count: 0
      };
    }
    
    // Check campaign artifacts
    const campaignDir = path.join(__dirname, '..', 'marketing', 'campaigns');
    if (fs.existsSync(campaignDir)) {
      const campaignFiles = fs.readdirSync(campaignDir).filter(file => file.endsWith('.json'));
      report.campaignStatus.campaigns = {
        count: campaignFiles.length,
        files: campaignFiles
      };
      
      // Check campaign index
      const indexPath = path.join(campaignDir, 'campaign-index.json');
      if (fs.existsSync(indexPath)) {
        const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        report.campaignStatus.index = {
          exists: true,
          generatedAt: indexData.generatedAt,
          campaignCount: indexData.campaigns.length
        };
      } else {
        report.campaignStatus.index = {
          exists: false
        };
      }
    } else {
      report.campaignStatus.campaigns = {
        count: 0
      };
    }
    
    // Generate overall health score
    let healthScore = 100;
    
    if (!report.seoStatus.sitemap?.exists) {
      healthScore -= 30;
    } else if (report.seoStatus.sitemap?.lastModified) {
      const lastModified = new Date(report.seoStatus.sitemap.lastModified).getTime();
      const now = new Date().getTime();
      const daysSinceUpdate = Math.floor((now - lastModified) / (24 * 60 * 60 * 1000));
      if (daysSinceUpdate > 14) {
        healthScore -= 20;
      } else if (daysSinceUpdate > 7) {
        healthScore -= 10;
      }
    }
    
    if (!report.campaignStatus.index?.exists) {
      healthScore -= 30;
    } else if (report.campaignStatus.index?.generatedAt) {
      const lastGenerated = new Date(report.campaignStatus.index.generatedAt).getTime();
      const now = new Date().getTime();
      const daysSinceUpdate = Math.floor((now - lastGenerated) / (24 * 60 * 60 * 1000));
      if (daysSinceUpdate > 14) {
        healthScore -= 20;
      } else if (daysSinceUpdate > 7) {
        healthScore -= 10;
      }
    }
    
    report.overallHealthScore = Math.max(0, healthScore);
    
    // Save the report
    const reportPath = path.join(__dirname, '..', 'logs', 'marketing-health.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`Marketing health report generated at ${reportPath} with score: ${report.overallHealthScore}%`);
    
    // Console output of key metrics
    console.log('---------------------------------------');
    console.log('MARKETING AUTOMATION HEALTH DASHBOARD');
    console.log('---------------------------------------');
    console.log(`Overall Health: ${report.overallHealthScore}%`);
    console.log(`SEO Sitemap: ${report.seoStatus.sitemap?.exists ? 'Present' : 'Missing'}`);
    if (report.seoStatus.sitemap?.lastModified) {
      console.log(`Last Updated: ${report.seoStatus.sitemap.lastModified}`);
    }
    console.log(`Campaign Count: ${report.campaignStatus.campaigns?.count || 0}`);
    if (report.campaignStatus.index?.generatedAt) {
      console.log(`Last Campaign Update: ${report.campaignStatus.index.generatedAt}`);
    }
    console.log('---------------------------------------');
    
    return report;
  } catch (error) {
    log(`Error generating marketing health report: ${error.message}`, true);
    return null;
  }
}

// Run the Marketing Automation system if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startMarketingAutomation().catch(error => {
    log(`Unhandled error in Marketing Automation system: ${error.message}`, true);
  });
}

// Export for use in other modules
export { startMarketingAutomation, checkMarketingStatus, generateMarketingHealthReport };