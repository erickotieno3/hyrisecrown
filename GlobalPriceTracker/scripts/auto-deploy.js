/**
 * Auto-Deployment Script for Replit
 * 
 * This script automatically creates a new deployment of your application
 * using the Replit API. It can be scheduled to run at specified intervals.
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  // Deployment interval in milliseconds (default: 2 days)
  deploymentInterval: 2 * 24 * 60 * 60 * 1000,
  
  // Log file path
  logFile: path.join(__dirname, '..', 'logs', 'auto-deploy.log'),
  
  // Max log file size before rotation (5MB)
  maxLogSize: 5 * 1024 * 1024,
  
  // API base URL
  apiBaseUrl: 'https://replit.com/api/v1/deployments',
  
  // Headers for Replit API requests
  headers: {
    'X-Requested-With': 'Tesco-Price-Comparison-Auto-Deploy',
    'Content-Type': 'application/json'
    // Note: Authentication headers will be added from environment variables
  }
};

/**
 * Make sure the logs directory exists
 */
function ensureLogDirectory() {
  const logDir = path.dirname(config.logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

/**
 * Log a message to console and the log file
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}`;
  
  console.log(logMessage);
  
  // Append to log file
  ensureLogDirectory();
  fs.appendFileSync(config.logFile, logMessage + '\n');
  
  // Check log file size and rotate if needed
  const stats = fs.statSync(config.logFile);
  if (stats.size > config.maxLogSize) {
    const backupFile = `${config.logFile}.old`;
    if (fs.existsSync(backupFile)) {
      fs.unlinkSync(backupFile);
    }
    fs.renameSync(config.logFile, backupFile);
  }
}

/**
 * Clean up unnecessary files before deployment
 */
function cleanup() {
  log('Cleaning up unnecessary files before deployment...');
  
  // Add your cleanup logic here
  // For example:
  // - Remove temporary files
  // - Clean up log files
  // - Remove development artifacts
  
  log('Cleanup completed');
}

/**
 * Create a new deployment using the Replit API
 */
async function createDeployment() {
  log('Creating new deployment...');
  
  // First, clean up files
  cleanup();
  
  // Check if required environment variables are set
  if (!process.env.REPLIT_DEPLOYMENT_TOKEN) {
    log('ERROR: REPLIT_DEPLOYMENT_TOKEN environment variable not set. Cannot deploy.');
    return false;
  }
  
  if (!process.env.REPL_ID || !process.env.REPL_OWNER) {
    log('ERROR: REPL_ID or REPL_OWNER environment variables not set. Cannot deploy.');
    return false;
  }
  
  try {
    // Add authentication headers
    const headers = {
      ...config.headers,
      'Authorization': `Bearer ${process.env.REPLIT_DEPLOYMENT_TOKEN}`
    };
    
    // Make API request to create deployment
    const response = await fetch(config.apiBaseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: process.env.REPL_ID,
        user: process.env.REPL_OWNER
      })
    });
    
    // Check response
    if (response.status === 201 || response.status === 200) {
      const data = await response.json();
      log(`Deployment created successfully! Deployment ID: ${data.id}`);
      return true;
    } else {
      const error = await response.text();
      log(`Failed to create deployment. Status: ${response.status}, Error: ${error}`);
      return false;
    }
  } catch (error) {
    log(`Error creating deployment: ${error.message}`);
    return false;
  }
}

/**
 * Main function to run the auto-deployment process
 */
async function main() {
  log('Auto-deployment process started');
  
  // Create initial deployment
  const result = await createDeployment();
  
  if (result) {
    log(`Scheduling next deployment in ${config.deploymentInterval / (1000 * 60 * 60)} hours`);
    
    // Schedule regular deployments
    setInterval(async () => {
      log('Scheduled deployment time reached');
      await createDeployment();
    }, config.deploymentInterval);
  } else {
    log('Initial deployment failed. Please check the issues before scheduling regular deployments.');
  }
}

// Run the main function
main().catch(error => {
  log(`Unhandled error in main process: ${error.message}`);
});