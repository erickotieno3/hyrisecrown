/**
 * Keep-Alive Script for Replit
 * 
 * This script prevents your Replit application from sleeping due to inactivity
 * by sending regular HTTP requests to it.
 * 
 * To use this script:
 * 1. Update the REPLIT_URL with your actual Replit app URL
 * 2. Run it with 'node scripts/keep-alive.js'
 * 3. For best results, run this on another server or another Replit
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration (update with your Replit URL after deployment)
const config = {
  replitUrl: process.env.REPLIT_URL || 'https://tesco-price-comparison.yourusername.replit.app',
  pingInterval: 5 * 60 * 1000, // 5 minutes in milliseconds
  logFile: path.join(__dirname, '..', 'logs', 'keep-alive.log'),
  maxLogSize: 5 * 1024 * 1024 // 5MB
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
 * Log a message to both console and log file
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}`;
  
  console.log(logMessage);
  
  // Append to log file
  ensureLogDirectory();
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
 * Send a ping to keep the Replit application alive
 */
async function pingReplit() {
  try {
    const response = await fetch(config.replitUrl);
    
    if (response.ok) {
      log(`Successful ping to ${config.replitUrl} - Status: ${response.status}`);
    } else {
      log(`Failed ping to ${config.replitUrl} - Status: ${response.status}`);
    }
  } catch (error) {
    log(`Error pinging ${config.replitUrl}: ${error.message}`);
  }
}

/**
 * Main function to start the keep-alive service
 */
function startKeepAliveService() {
  log('Keep-alive service started');
  log(`Target URL: ${config.replitUrl}`);
  log(`Ping interval: ${config.pingInterval / 1000} seconds`);
  
  // Immediately ping once
  pingReplit();
  
  // Set up regular interval
  setInterval(pingReplit, config.pingInterval);
}

// Start the service
startKeepAliveService();