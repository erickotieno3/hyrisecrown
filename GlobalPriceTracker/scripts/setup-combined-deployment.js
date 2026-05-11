/**
 * Combined Deployment Setup Script
 * 
 * This script guides you through setting up a combined deployment approach using
 * both Replit and Hetzner Cloud for maximum reliability.
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
  deploymentDir: path.join(__dirname, '..', 'deployment'),
  hetznerDir: path.join(__dirname, '..', 'hetzner-deploy'),
  environmentTemplateFile: path.join(__dirname, '..', 'deployment', '.env.template')
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
  
  const directories = [
    config.logsDir,
    config.deploymentDir
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    } else {
      console.log(`✓ Directory already exists: ${dir}`);
    }
  });
}

/**
 * Create environment template file
 */
function createEnvironmentTemplate(replUrl, hetznerUrl) {
  console.log('Creating environment template...');
  
  const envContent = `# Combined Deployment Environment Variables
# Copy this file to .env and fill in the values

# Deployment Coordinator Configuration
PRIMARY_URL=${replUrl}
BACKUP_URL=${hetznerUrl}
NOTIFICATION_EMAIL=your-email@example.com

# Replit Deployment Configuration
REPLIT_DEPLOYMENT_TOKEN=your_deployment_token
REPL_ID=your_repl_id
REPL_OWNER=your_replit_username

# Hetzner Server Configuration
HETZNER_SERVER_IP=your_server_ip
HETZNER_SSH_KEY=/path/to/ssh_key
HETZNER_USER=root

# Application Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgres://username:password@localhost:5432/database_name

# API Keys (fill these in with your actual keys)
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
`;
  
  fs.writeFileSync(path.join(config.deploymentDir, '.env.template'), envContent);
  console.log(`✓ Created environment template: ${config.environmentTemplateFile}`);
}

/**
 * Create startup script for the combined deployment
 */
function createStartupScript() {
  console.log('Creating startup script...');
  
  const startupScript = `#!/bin/bash
# Combined Deployment Startup Script
# This script starts all the components of the combined deployment approach

# Change to the project root directory
cd "$(dirname "$0")/.."

# Create logs directory if it doesn't exist
mkdir -p logs

# Load environment variables
if [ -f deployment/.env ]; then
  export $(grep -v '^#' deployment/.env | xargs)
else
  echo "Error: .env file not found. Please create it from .env.template"
  exit 1
fi

# Start the keep-alive script for the Replit deployment
echo "Starting keep-alive script for Replit deployment..."
node scripts/keep-alive.js > logs/keep-alive.log 2>&1 &
echo $! > deployment/keep-alive.pid
echo "Keep-alive script started with PID $(cat deployment/keep-alive.pid)"

# Start the deployment coordinator
echo "Starting deployment coordinator..."
node scripts/deployment-coordinator.js > logs/deployment-coordinator.log 2>&1 &
echo $! > deployment/coordinator.pid
echo "Deployment coordinator started with PID $(cat deployment/coordinator.pid)"

# Start the auto-deployment script for Replit
echo "Starting auto-deployment script..."
node scripts/auto-deploy.js > logs/auto-deploy.log 2>&1 &
echo $! > deployment/auto-deploy.pid
echo "Auto-deployment script started with PID $(cat deployment/auto-deploy.pid)"

echo ""
echo "All components started successfully!"
echo "Check the logs directory for outputs."
echo ""
echo "To stop all components, run: deployment/stop.sh"
`;
  
  fs.writeFileSync(path.join(config.deploymentDir, 'start.sh'), startupScript);
  fs.chmodSync(path.join(config.deploymentDir, 'start.sh'), '755');
  console.log(`✓ Created startup script: ${path.join(config.deploymentDir, 'start.sh')}`);
}

/**
 * Create shutdown script for the combined deployment
 */
function createShutdownScript() {
  console.log('Creating shutdown script...');
  
  const shutdownScript = `#!/bin/bash
# Combined Deployment Shutdown Script
# This script stops all the components of the combined deployment approach

# Change to the project root directory
cd "$(dirname "$0")/.."

# Stop the keep-alive script
if [ -f deployment/keep-alive.pid ]; then
  echo "Stopping keep-alive script..."
  kill $(cat deployment/keep-alive.pid) 2>/dev/null || echo "Keep-alive process not running"
  rm deployment/keep-alive.pid
fi

# Stop the deployment coordinator
if [ -f deployment/coordinator.pid ]; then
  echo "Stopping deployment coordinator..."
  kill $(cat deployment/coordinator.pid) 2>/dev/null || echo "Coordinator process not running"
  rm deployment/coordinator.pid
fi

# Stop the auto-deployment script
if [ -f deployment/auto-deploy.pid ]; then
  echo "Stopping auto-deployment script..."
  kill $(cat deployment/auto-deploy.pid) 2>/dev/null || echo "Auto-deployment process not running"
  rm deployment/auto-deploy.pid
fi

echo ""
echo "All components stopped."
`;
  
  fs.writeFileSync(path.join(config.deploymentDir, 'stop.sh'), shutdownScript);
  fs.chmodSync(path.join(config.deploymentDir, 'stop.sh'), '755');
  console.log(`✓ Created shutdown script: ${path.join(config.deploymentDir, 'stop.sh')}`);
}

/**
 * Create status check script
 */
function createStatusScript() {
  console.log('Creating status check script...');
  
  const statusScript = `#!/bin/bash
# Combined Deployment Status Script
# This script checks the status of all deployment components

# Change to the project root directory
cd "$(dirname "$0")/.."

# Check keep-alive script
if [ -f deployment/keep-alive.pid ]; then
  if ps -p $(cat deployment/keep-alive.pid) > /dev/null; then
    echo "✓ Keep-alive script: RUNNING (PID: $(cat deployment/keep-alive.pid))"
  else
    echo "✗ Keep-alive script: STOPPED (stale PID file)"
  fi
else
  echo "✗ Keep-alive script: NOT STARTED"
fi

# Check deployment coordinator
if [ -f deployment/coordinator.pid ]; then
  if ps -p $(cat deployment/coordinator.pid) > /dev/null; then
    echo "✓ Deployment coordinator: RUNNING (PID: $(cat deployment/coordinator.pid))"
  else
    echo "✗ Deployment coordinator: STOPPED (stale PID file)"
  fi
else
  echo "✗ Deployment coordinator: NOT STARTED"
fi

# Check auto-deployment script
if [ -f deployment/auto-deploy.pid ]; then
  if ps -p $(cat deployment/auto-deploy.pid) > /dev/null; then
    echo "✓ Auto-deployment script: RUNNING (PID: $(cat deployment/auto-deploy.pid))"
  else
    echo "✗ Auto-deployment script: STOPPED (stale PID file)"
  fi
else
  echo "✗ Auto-deployment script: NOT STARTED"
fi

echo ""
echo "Recent log entries:"
echo "-------------------"
echo "Keep-alive log:"
tail -n 5 logs/keep-alive.log 2>/dev/null || echo "No keep-alive logs found"
echo ""
echo "Coordinator log:"
tail -n 5 logs/deployment-coordinator.log 2>/dev/null || echo "No coordinator logs found"
echo ""
echo "Auto-deployment log:"
tail -n 5 logs/auto-deploy.log 2>/dev/null || echo "No auto-deployment logs found"
`;
  
  fs.writeFileSync(path.join(config.deploymentDir, 'status.sh'), statusScript);
  fs.chmodSync(path.join(config.deploymentDir, 'status.sh'), '755');
  console.log(`✓ Created status script: ${path.join(config.deploymentDir, 'status.sh')}`);
}

/**
 * Create a comprehensive README file
 */
function createReadme() {
  console.log('Creating README file...');
  
  const readmeContent = `# Combined Deployment System

This directory contains the scripts and configuration for the combined deployment
approach using both Replit and Hetzner Cloud for maximum reliability.

## Quick Start

1. Copy \`.env.template\` to \`.env\` and fill in your values:
   \`\`\`bash
   cp .env.template .env
   nano .env  # Or use your preferred text editor
   \`\`\`

2. Start the combined deployment system:
   \`\`\`bash
   ./start.sh
   \`\`\`

3. Check the status:
   \`\`\`bash
   ./status.sh
   \`\`\`

4. Stop the system when needed:
   \`\`\`bash
   ./stop.sh
   \`\`\`

## Components

The combined deployment system consists of several components:

1. **Replit Deployment**: The primary hosting option
   - Set up through the Replit interface (Deploy button)
   - Monitored by the keep-alive script

2. **Hetzner Cloud Server**: The backup hosting option
   - €1.58/month with unlimited bandwidth
   - Set up using the scripts in \`../hetzner-deploy/\`

3. **Deployment Coordinator**: Manages failover between deployments
   - Continuously monitors both deployments
   - Automatically switches between primary and backup if one fails

4. **Keep-Alive Script**: Prevents Replit from sleeping
   - Sends regular pings to the Replit deployment
   - Logs activity to \`../logs/keep-alive.log\`

5. **Auto-Deployment Script**: Ensures regular updates
   - Creates new deployments automatically
   - Logs activity to \`../logs/auto-deploy.log\`

## Monitoring

- Use \`./status.sh\` to check the status of all components
- Check individual logs in the \`../logs/\` directory
- The deployment coordinator logs to \`../logs/deployment-coordinator.log\`

## Troubleshooting

If any component fails:

1. Check the logs for error messages
2. Ensure environment variables are correctly set in \`.env\`
3. Restart the system with \`./stop.sh\` followed by \`./start.sh\`

## Recommended Monitoring Services

For additional monitoring:

1. [UptimeRobot](https://uptimerobot.com/) - Free tier offers 50 monitors
2. [Freshping](https://www.freshworks.com/website-monitoring/) - Free tier includes 10 monitors
3. [Pingdom](https://www.pingdom.com/) - Paid service with advanced features

## Additional Information

For more information on the individual deployment options, see:

- \`../AUTO_DEPLOYMENT_SETUP.md\` - Complete deployment setup guide
- \`../ECONOMICAL_HOSTING.md\` - Guide for Hetzner Cloud hosting
`;
  
  fs.writeFileSync(path.join(config.deploymentDir, 'README.md'), readmeContent);
  console.log(`✓ Created README: ${path.join(config.deploymentDir, 'README.md')}`);
}

/**
 * Display next steps
 */
function displayNextSteps(replUrl, hetznerUrl) {
  console.log('\n=================================================');
  console.log('Combined Deployment Setup Complete!');
  console.log('=================================================\n');
  
  console.log('Next Steps:');
  console.log('\n1. Deploy your application to Replit:');
  console.log('   - Click the "Deploy" button in the Replit interface');
  console.log(`   - Note the deployment URL (use instead of ${replUrl} if different)`);
  
  console.log('\n2. Deploy your application to Hetzner Cloud:');
  console.log('   - Sign up for Hetzner Cloud (€1.58/month plan)');
  console.log('   - Follow the steps in ECONOMICAL_HOSTING.md');
  console.log('   - Use the scripts in hetzner-deploy/ folder');
  console.log(`   - Note the server IP/domain (use instead of ${hetznerUrl} if different)`);
  
  console.log('\n3. Configure the combined deployment:');
  console.log('   - Create .env file in the deployment directory:');
  console.log('     cp deployment/.env.template deployment/.env');
  console.log('     nano deployment/.env  # Update with your actual values');
  
  console.log('\n4. Start the combined deployment system:');
  console.log('   - Run: deployment/start.sh');
  console.log('   - Check status: deployment/status.sh');
  
  console.log('\nFor more information:');
  console.log('- See deployment/README.md for details on the combined system');
  console.log('- See AUTO_DEPLOYMENT_SETUP.md for general deployment information');
  console.log('- See ECONOMICAL_HOSTING.md for Hetzner Cloud setup details');
}

/**
 * Main function
 */
async function main() {
  console.log('Setting up combined deployment approach for Tesco Price Comparison...\n');
  
  try {
    // Create directories
    createDirectories();
    
    // Ask for deployment URLs
    const replUrl = await askQuestion('Enter your Replit deployment URL (or press Enter for default): ');
    const finalReplUrl = replUrl || 'https://tesco-price-comparison.username.replit.app';
    
    const hetznerUrl = await askQuestion('Enter your Hetzner server URL/IP (or press Enter for default): ');
    const finalHetznerUrl = hetznerUrl || 'https://your-server-ip.hyrisecrown.com';
    
    // Create configuration files
    createEnvironmentTemplate(finalReplUrl, finalHetznerUrl);
    createStartupScript();
    createShutdownScript();
    createStatusScript();
    createReadme();
    
    // Display next steps
    displayNextSteps(finalReplUrl, finalHetznerUrl);
    
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