/**
 * Deployment Helper Script
 * 
 * This script helps with deploying the application to Replit
 * by automating some common deployment tasks.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  deploymentName: 'tesco-price-comparison',
  cleanupFiles: [
    'node_modules/.cache',
    'dist',
    '.parcel-cache'
  ]
};

/**
 * Run a shell command and return a promise
 */
function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        console.log(`stderr: ${stderr}`);
      }
      
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

/**
 * Clean up unnecessary files before deployment
 */
async function cleanup() {
  console.log('Cleaning up unnecessary files...');
  
  for (const file of config.cleanupFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      if (fs.lstatSync(fullPath).isDirectory()) {
        fs.rmdirSync(fullPath, { recursive: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      console.log(`Removed: ${file}`);
    }
  }
}

/**
 * Create a deployment on Replit
 */
async function createDeployment() {
  console.log('Creating deployment...');
  
  try {
    // Check if replit CLI is installed
    await runCommand('which replit');
    
    // Create the deployment
    await runCommand(`replit deployments create --name="${config.deploymentName}"`);
    
    console.log('Deployment created successfully!');
    console.log('Note: You still need to promote this deployment in the Replit dashboard');
  } catch (error) {
    console.error('Failed to create deployment. Make sure replit CLI is installed.');
    console.error('Run: npm install -g @replit/replit-cli');
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    await cleanup();
    await createDeployment();
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Run the script
main();