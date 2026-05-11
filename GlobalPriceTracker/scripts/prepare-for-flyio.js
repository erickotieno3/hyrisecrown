/**
 * Prepare Tesco Price Comparison for Fly.io Deployment
 * 
 * This script helps prepare your application for deployment to Fly.io
 * which offers a generous free tier with no sleep times.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  appName: 'tesco-price-comparison',
  region: 'lhr', // London region, change if needed
  organization: 'personal', // Default organization
};

/**
 * Create the fly.toml configuration file
 */
function createFlyConfig() {
  console.log('Creating fly.toml configuration file...');
  
  const flyToml = `app = "${config.appName}"
primary_region = "${config.region}"
kill_signal = "SIGINT"
kill_timeout = 5

[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = "8080"
  NODE_ENV = "production"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
`;
  
  fs.writeFileSync(path.join(__dirname, '..', 'fly.toml'), flyToml);
  console.log('✓ fly.toml created successfully');
}

/**
 * Create a Procfile for Heroku buildpack compatibility
 */
function createProcfile() {
  console.log('Creating Procfile for Heroku buildpack compatibility...');
  
  const procfile = 'web: node server/index.js';
  
  fs.writeFileSync(path.join(__dirname, '..', 'Procfile'), procfile);
  console.log('✓ Procfile created successfully');
}

/**
 * Create an .env file template for Fly.io secrets
 */
function createEnvTemplate() {
  console.log('Creating .env template for Fly.io secrets...');
  
  const envTemplate = `# Fly.io Environment Variables Template
# Copy these to fly secrets using:
# fly secrets set DATABASE_URL=your_value OPENAI_API_KEY=your_value

DATABASE_URL=postgres://postgres:postgres@tesco-db.internal:5432/postgres
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
`;
  
  fs.writeFileSync(path.join(__dirname, '..', '.env.fly'), envTemplate);
  console.log('✓ .env.fly template created successfully');
}

/**
 * Create a deployment script for Fly.io
 */
function createDeploymentScript() {
  console.log('Creating deployment script for Fly.io...');
  
  const deployScript = `#!/bin/bash
# Deploy to Fly.io

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
  echo "Error: flyctl is not installed"
  echo "Install it with: curl -L https://fly.io/install.sh | sh"
  exit 1
fi

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
  echo "You are not logged in to Fly.io"
  echo "Please run: flyctl auth login"
  exit 1
fi

# Deploy the app
echo "Deploying ${config.appName} to Fly.io..."
flyctl deploy

# Check deployment status
if [ $? -eq 0 ]; then
  echo "✅ Deployment successful!"
  echo "Your app is available at: https://${config.appName}.fly.dev"
else
  echo "❌ Deployment failed"
  exit 1
fi
`;
  
  const deployScriptPath = path.join(__dirname, '..', 'deploy-to-fly.sh');
  fs.writeFileSync(deployScriptPath, deployScript);
  
  // Make the script executable
  try {
    fs.chmodSync(deployScriptPath, '755');
  } catch (error) {
    console.warn(`Warning: Could not make script executable: ${error.message}`);
    console.log('You may need to manually set execute permission: chmod +x deploy-to-fly.sh');
  }
  
  console.log('✓ deploy-to-fly.sh created successfully');
}

/**
 * Create a README with Fly.io deployment instructions
 */
function createFlyioReadme() {
  console.log('Creating Fly.io deployment README...');
  
  const readmeContent = `# Deploying Tesco Price Comparison to Fly.io

This guide explains how to deploy your application to Fly.io's free tier.

## Prerequisites

1. Install the Fly.io CLI:
   \`\`\`bash
   curl -L https://fly.io/install.sh | sh
   \`\`\`

2. Add Fly.io to your PATH (if not done by the installer)
   \`\`\`bash
   export FLYCTL_INSTALL="/home/your-username/.fly"
   export PATH="$FLYCTL_INSTALL/bin:$PATH"
   \`\`\`

3. Sign up for Fly.io (if you don't have an account):
   \`\`\`bash
   flyctl auth signup
   \`\`\`
   
   Note: Fly.io requires a credit card for verification, but they won't charge you
   unless you explicitly upgrade to a paid plan.

4. Log in to Fly.io:
   \`\`\`bash
   flyctl auth login
   \`\`\`

## Deployment Steps

1. Create a Fly.io app (only needed the first time):
   \`\`\`bash
   flyctl apps create ${config.appName}
   \`\`\`

2. Create a PostgreSQL database (only needed the first time):
   \`\`\`bash
   flyctl postgres create --name tesco-db
   \`\`\`

3. Attach the database to your app:
   \`\`\`bash
   flyctl postgres attach --app ${config.appName} tesco-db
   \`\`\`

4. Set your environment secrets:
   \`\`\`bash
   flyctl secrets set OPENAI_API_KEY=your_openai_api_key STRIPE_SECRET_KEY=your_stripe_secret_key VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   \`\`\`

5. Deploy your application:
   \`\`\`bash
   ./deploy-to-fly.sh
   \`\`\`
   
   Or use the fly command directly:
   \`\`\`bash
   flyctl deploy
   \`\`\`

6. Set up your custom domain:
   \`\`\`bash
   flyctl certs create hyrisecrown.com
   \`\`\`

7. Update your DNS settings to point to Fly.io:
   - Create an A record for the root domain (@) pointing to Fly.io's IP
   - Create a CNAME record for www pointing to your Fly.io app URL

## Checking Status and Logs

- View app status:
  \`\`\`bash
  flyctl status
  \`\`\`

- View logs:
  \`\`\`bash
  flyctl logs
  \`\`\`

- Access your app:
  \`\`\`
  https://${config.appName}.fly.dev
  \`\`\`

## Free Tier Limitations

Fly.io's free tier includes:
- 3 shared-cpu-1x 256mb VMs
- 3GB persistent volume storage
- 160GB outbound data transfer

This is sufficient for your application with moderate traffic. If you need more resources,
you'll need to upgrade to a paid plan.

## Scaling

If you need to scale your application (still within free tier):
\`\`\`bash
flyctl scale count 2
\`\`\`

This will run 2 instances of your application for higher availability.
`;
  
  fs.writeFileSync(path.join(__dirname, '..', 'FLYIO_DEPLOYMENT.md'), readmeContent);
  console.log('✓ FLYIO_DEPLOYMENT.md created successfully');
}

/**
 * Main function
 */
function main() {
  console.log('Preparing Tesco Price Comparison for Fly.io deployment...\n');
  
  try {
    createFlyConfig();
    createProcfile();
    createEnvTemplate();
    createDeploymentScript();
    createFlyioReadme();
    
    console.log('\n✓ Preparation for Fly.io deployment completed!');
    console.log('\nNext steps:');
    console.log('1. Install the Fly.io CLI with: curl -L https://fly.io/install.sh | sh');
    console.log('2. Sign up for Fly.io with: flyctl auth signup');
    console.log('3. Deploy your app with: ./deploy-to-fly.sh');
    console.log('4. Follow the complete instructions in FLYIO_DEPLOYMENT.md');
  } catch (error) {
    console.error(`\n❌ Preparation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();