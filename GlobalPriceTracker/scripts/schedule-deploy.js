/**
 * Scheduled Deployment Script for Replit
 * 
 * This script schedules automatic deployments at specified intervals.
 * It can be run alongside your main application.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  // Deployment schedule (in milliseconds)
  // Default: Every 12 hours (12 * 60 * 60 * 1000)
  deploymentInterval: 12 * 60 * 60 * 1000,
  
  // Path to the deployment script
  deploymentScript: path.join(__dirname, 'auto-deploy.js'),
  
  // Log file for the scheduler
  logFile: path.join(__dirname, '..', 'logs', 'deployment-scheduler.log')
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
  const logMessage = `[${timestamp}] ${message}`;
  
  console.log(logMessage);
  
  ensureLogDirectory();
  fs.appendFileSync(config.logFile, logMessage + '\n');
}

/**
 * Run the deployment script as a separate process
 */
function runDeploymentScript() {
  log('Running scheduled deployment...');
  
  if (!fs.existsSync(config.deploymentScript)) {
    log(`❌ Deployment script not found at: ${config.deploymentScript}`);
    return;
  }
  
  const deployProcess = spawn('node', [config.deploymentScript], {
    stdio: 'pipe',
    detached: true
  });
  
  deployProcess.stdout.on('data', (data) => {
    log(`Deployment output: ${data.toString().trim()}`);
  });
  
  deployProcess.stderr.on('data', (data) => {
    log(`Deployment error: ${data.toString().trim()}`);
  });
  
  deployProcess.on('close', (code) => {
    if (code === 0) {
      log('✓ Scheduled deployment completed successfully');
    } else {
      log(`❌ Scheduled deployment failed with exit code: ${code}`);
    }
  });
  
  // Unref the child process so it doesn't keep the parent from exiting
  deployProcess.unref();
}

/**
 * Schedule deployments at the configured interval
 */
function scheduleDeployments() {
  log(`Starting deployment scheduler (interval: ${config.deploymentInterval}ms)`);
  
  // Run an initial deployment immediately
  runDeploymentScript();
  
  // Schedule regular deployments
  setInterval(runDeploymentScript, config.deploymentInterval);
}

// Only start the scheduler if this script is run directly
if (require.main === module) {
  scheduleDeployments();
}

module.exports = { scheduleDeployments, runDeploymentScript };