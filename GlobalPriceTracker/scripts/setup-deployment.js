/**
 * Deployment Setup Script
 * 
 * This script helps you set up the deployment environment for your Tesco Price Comparison application.
 * It creates necessary directories, generates configuration files, and provides
 * guidance on how to keep your application running permanently.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const config = {
  logsDir: path.join(__dirname, '..', 'logs'),
  scriptsDir: path.join(__dirname, '..', 'scripts'),
  deploymentDir: path.join(__dirname, '..', 'deployment')
};

/**
 * Ask a question and get user input
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Create necessary directories
 */
function createDirectories() {
  console.log('Creating necessary directories...');
  
  // Ensure logs directory exists
  if (!fs.existsSync(config.logsDir)) {
    fs.mkdirSync(config.logsDir, { recursive: true });
    console.log(`✓ Created logs directory: ${config.logsDir}`);
  } else {
    console.log(`✓ Logs directory already exists: ${config.logsDir}`);
  }
  
  // Ensure deployment directory exists
  if (!fs.existsSync(config.deploymentDir)) {
    fs.mkdirSync(config.deploymentDir, { recursive: true });
    console.log(`✓ Created deployment directory: ${config.deploymentDir}`);
  } else {
    console.log(`✓ Deployment directory already exists: ${config.deploymentDir}`);
  }
}

/**
 * Create deployment configuration file
 */
function createDeploymentConfig(deploymentUrl) {
  console.log('Creating deployment configuration...');
  
  const configFile = path.join(config.deploymentDir, 'config.json');
  const configData = {
    deploymentUrl: deploymentUrl,
    keepAliveInterval: 5 * 60 * 1000, // 5 minutes
    autoDeployInterval: 2 * 24 * 60 * 60 * 1000, // 2 days
    lastDeployment: new Date().toISOString(),
    environment: 'production'
  };
  
  fs.writeFileSync(configFile, JSON.stringify(configData, null, 2));
  console.log(`✓ Created deployment configuration: ${configFile}`);
}

/**
 * Create deployment environment file
 */
function createEnvFile() {
  console.log('Creating environment configuration...');
  
  const envFile = path.join(config.deploymentDir, '.env.example');
  const envContent = `# Deployment Environment Variables
# Copy this file to .env and fill in the values

# Replit Deployment
REPLIT_DEPLOYMENT_TOKEN=your_deployment_token
REPL_ID=your_repl_id
REPL_OWNER=your_replit_username

# Application Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgres://username:password@localhost:5432/database_name

# API Keys
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
`;
  
  fs.writeFileSync(envFile, envContent);
  console.log(`✓ Created environment configuration example: ${envFile}`);
}

/**
 * Create a simple deployment README
 */
function createDeploymentReadme() {
  console.log('Creating deployment README...');
  
  const readmeFile = path.join(config.deploymentDir, 'README.md');
  const readmeContent = `# Tesco Price Comparison Deployment

This directory contains configuration and scripts for deploying and maintaining
your Tesco Price Comparison application.

## Quick Start

1. Copy \`.env.example\` to \`.env\` and fill in your values
2. Run the keep-alive script: \`node ../scripts/keep-alive.js\`
3. Run the auto-deployment script: \`node ../scripts/auto-deploy.js\`

## Files

- \`config.json\`: Contains deployment configuration
- \`.env\`: Environment variables for deployment (create from .env.example)
- \`README.md\`: This file

## Logs

Logs are stored in the \`../logs\` directory:

- \`keep-alive.log\`: Keep-alive script logs
- \`auto-deploy.log\`: Auto-deployment script logs

## Deployment Options

For more deployment options, refer to:

- \`../AUTO_DEPLOYMENT_SETUP.md\`: Complete deployment setup guide
- \`../ECONOMICAL_HOSTING.md\`: Guide for Hetzner Cloud hosting
`;
  
  fs.writeFileSync(readmeFile, readmeContent);
  console.log(`✓ Created deployment README: ${readmeFile}`);
}

/**
 * Display next steps
 */
function displayNextSteps(deploymentUrl) {
  console.log('\n=================================================');
  console.log('Deployment Setup Complete!');
  console.log('=================================================\n');
  
  console.log('Next Steps:');
  console.log('1. Deploy your application using the Replit deployment button');
  console.log(`2. Update the deployment URL in config.json to: ${deploymentUrl}`);
  console.log('3. Run the keep-alive script: node scripts/keep-alive.js');
  console.log('4. Run the auto-deployment script: node scripts/auto-deploy.js');
  console.log('5. For more options, see AUTO_DEPLOYMENT_SETUP.md');
  
  console.log('\nAlternatively, deploy to Hetzner Cloud:');
  console.log('1. Follow the instructions in ECONOMICAL_HOSTING.md');
  console.log('2. Use the scripts in the hetzner-deploy directory');
  
  console.log('\nFor more information:');
  console.log('- Replit Deployments: https://docs.replit.com/hosting/deployments/about-deployments');
  console.log('- Hetzner Cloud: https://docs.hetzner.com/cloud/');
}

/**
 * Main function
 */
async function main() {
  console.log('Setting up deployment environment for Tesco Price Comparison...\n');
  
  try {
    // Create directories
    createDirectories();
    
    // Ask for deployment URL
    const deploymentUrl = await askQuestion('Enter your deployment URL (or press Enter for default): ');
    const finalUrl = deploymentUrl || 'https://tesco-price-comparison.yourusername.replit.app';
    
    // Create configuration files
    createDeploymentConfig(finalUrl);
    createEnvFile();
    createDeploymentReadme();
    
    // Display next steps
    displayNextSteps(finalUrl);
    
    // Close readline interface
    rl.close();
  } catch (error) {
    console.error(`\n❌ Setup failed: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

// Run the script
main();