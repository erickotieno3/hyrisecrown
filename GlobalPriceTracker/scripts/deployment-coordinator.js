/**
 * Deployment Coordinator
 * 
 * This script coordinates between multiple deployment options (Replit and Hetzner Cloud)
 * to provide maximum reliability and uptime through redundancy and automatic failover.
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration (customize these values)
const config = {
  // Deployment URLs
  primaryUrl: process.env.PRIMARY_URL || 'https://your-replit-deployment.replit.app',
  backupUrl: process.env.BACKUP_URL || 'https://your-hetzner-server.com',
  
  // Health check configuration
  healthCheckInterval: 5 * 60 * 1000, // Check every 5 minutes
  failureThreshold: 3, // Number of failures before triggering failover
  recoveryThreshold: 3, // Number of successful checks before switching back to primary
  requestTimeout: 10000, // 10 second timeout for health checks
  
  // Notification configuration (optional)
  notifyOnFailover: true,
  notificationEmail: process.env.NOTIFICATION_EMAIL || 'your-email@example.com',
  
  // Log configuration
  logFile: path.join(__dirname, '..', 'logs', 'deployment-coordinator.log'),
  maxLogSize: 5 * 1024 * 1024 // 5MB
};

// State tracking
const state = {
  primaryFailureCount: 0,
  primaryRecoveryCount: 0,
  backupFailureCount: 0,
  currentActive: 'primary', // 'primary' or 'backup'
  lastSwitchTime: null,
  lastPrimaryStatus: null,
  lastBackupStatus: null
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
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}`;
  
  if (isError) {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
  
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
 * Perform a health check on a given URL
 */
async function checkHealth(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.requestTimeout);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    
    return {
      status: response.status,
      isHealthy: response.ok,
      responseTime: null // Could implement response time tracking if needed
    };
  } catch (error) {
    log(`Health check error for ${url}: ${error.message}`, true);
    return {
      status: null,
      isHealthy: false,
      error: error.message
    };
  }
}

/**
 * Send a notification about deployment status changes
 */
async function sendNotification(subject, message) {
  if (!config.notifyOnFailover) return;
  
  log(`Would send notification: ${subject}`);
  // Implementation would depend on your preferred notification method
  // Could use email (via nodemailer), SMS, Slack webhook, etc.
}

/**
 * Perform failover to backup deployment
 */
async function switchToBackup() {
  if (state.currentActive === 'backup') return;
  
  log('⚠️ Switching to backup deployment', true);
  state.currentActive = 'backup';
  state.lastSwitchTime = new Date();
  
  // Send notification
  await sendNotification(
    'Deployment Failover: Switched to Backup',
    `Primary deployment (${config.primaryUrl}) is down. Automatically switched to backup deployment (${config.backupUrl}).`
  );
}

/**
 * Switch back to primary deployment
 */
async function switchToPrimary() {
  if (state.currentActive === 'primary') return;
  
  log('✓ Switching back to primary deployment');
  state.currentActive = 'primary';
  state.lastSwitchTime = new Date();
  
  // Send notification
  await sendNotification(
    'Deployment Recovery: Switched to Primary',
    `Primary deployment (${config.primaryUrl}) is healthy again. Automatically switched back from backup deployment.`
  );
}

/**
 * Check both deployments and manage failover if needed
 */
async function performHealthChecks() {
  // Check primary deployment
  const primaryHealth = await checkHealth(config.primaryUrl);
  state.lastPrimaryStatus = primaryHealth;
  
  // Check backup deployment
  const backupHealth = await checkHealth(config.backupUrl);
  state.lastBackupStatus = backupHealth;
  
  // Log health check results
  log(`Primary: ${primaryHealth.isHealthy ? 'Healthy' : 'Unhealthy'} (${primaryHealth.status || 'No response'}), Backup: ${backupHealth.isHealthy ? 'Healthy' : 'Unhealthy'} (${backupHealth.status || 'No response'})`);
  
  // Update counters
  if (primaryHealth.isHealthy) {
    state.primaryFailureCount = 0;
    state.primaryRecoveryCount++;
  } else {
    state.primaryFailureCount++;
    state.primaryRecoveryCount = 0;
  }
  
  if (backupHealth.isHealthy) {
    state.backupFailureCount = 0;
  } else {
    state.backupFailureCount++;
  }
  
  // Handle failover logic
  if (state.currentActive === 'primary' && state.primaryFailureCount >= config.failureThreshold) {
    // Only switch to backup if backup is healthy
    if (backupHealth.isHealthy) {
      await switchToBackup();
    } else {
      log('⚠️ Primary deployment unhealthy but backup is also unhealthy. Staying on primary.', true);
    }
  } else if (state.currentActive === 'backup' && state.primaryRecoveryCount >= config.recoveryThreshold) {
    await switchToPrimary();
  }
  
  // Alert if both deployments are down
  if (!primaryHealth.isHealthy && !backupHealth.isHealthy) {
    log('🔴 CRITICAL: Both primary and backup deployments are unhealthy!', true);
    
    await sendNotification(
      'CRITICAL: All Deployments Down',
      `Both primary (${config.primaryUrl}) and backup (${config.backupUrl}) deployments are unhealthy. Immediate attention required.`
    );
  }
}

/**
 * Display current status summary
 */
function displayStatusSummary() {
  const summary = {
    currentActiveDeployment: state.currentActive,
    primaryUrl: config.primaryUrl,
    backupUrl: config.backupUrl,
    primaryStatus: state.lastPrimaryStatus ? (state.lastPrimaryStatus.isHealthy ? 'Healthy' : 'Unhealthy') : 'Unknown',
    backupStatus: state.lastBackupStatus ? (state.lastBackupStatus.isHealthy ? 'Healthy' : 'Unhealthy') : 'Unknown',
    lastSwitchTime: state.lastSwitchTime,
    uptime: process.uptime()
  };
  
  log(`\nStatus Summary:\n${JSON.stringify(summary, null, 2)}`);
}

/**
 * Main function to start the coordinator
 */
async function startCoordinator() {
  log('Deployment Coordinator started');
  log(`Primary URL: ${config.primaryUrl}`);
  log(`Backup URL: ${config.backupUrl}`);
  log(`Health check interval: ${config.healthCheckInterval / 1000} seconds`);
  
  // Perform initial health checks
  await performHealthChecks();
  
  // Display initial status
  displayStatusSummary();
  
  // Set up regular health checks
  setInterval(async () => {
    await performHealthChecks();
    
    // Periodically display status summary (every 6 hours)
    if (Math.random() < 0.01) { // Approximately once every 100 checks
      displayStatusSummary();
    }
  }, config.healthCheckInterval);
  
  // Set up hourly status reports
  setInterval(() => {
    displayStatusSummary();
  }, 60 * 60 * 1000); // Every hour
}

// Start the coordinator
startCoordinator().catch(error => {
  log(`Unhandled error in coordinator: ${error.message}`, true);
});