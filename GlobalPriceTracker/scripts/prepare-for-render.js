/**
 * Prepare Tesco Price Comparison for Render.com Deployment
 * 
 * This script helps prepare your application for deployment to Render.com
 * which offers a generous free tier.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  appName: 'tesco-price-comparison',
  databaseName: 'tesco-db',
};

/**
 * Create the render.yaml configuration file
 */
function createRenderConfig() {
  console.log('Creating render.yaml configuration file...');
  
  const renderYaml = `services:
  # Web service
  - type: web
    name: ${config.appName}
    env: node
    buildCommand: npm ci && npm run build
    startCommand: node server/index.js
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: ${config.databaseName}
          property: connectionString
      - key: OPENAI_API_KEY
        sync: false
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: VITE_STRIPE_PUBLIC_KEY
        sync: false
    autoDeploy: true

# Database
databases:
  - name: ${config.databaseName}
    databaseName: ${config.databaseName}
    user: tesco_user
    plan: free
`;
  
  fs.writeFileSync(path.join(__dirname, '..', 'render.yaml'), renderYaml);
  console.log('✓ render.yaml created successfully');
}

/**
 * Create a health check endpoint for Render.com
 */
function createHealthCheckEndpoint() {
  console.log('Creating health check endpoint for Render.com...');
  
  // Check if the health route already exists
  const serverRoutesPath = path.join(__dirname, '..', 'server', 'routes.ts');
  if (fs.existsSync(serverRoutesPath)) {
    let routesContent = fs.readFileSync(serverRoutesPath, 'utf8');
    
    // Only add health check if it doesn't exist
    if (!routesContent.includes('/api/health')) {
      // Look for a good insertion point
      const insertionPoint = routesContent.includes('app.get(') 
        ? routesContent.indexOf('app.get(') 
        : routesContent.includes('const httpServer = createServer(app);')
          ? routesContent.indexOf('const httpServer = createServer(app);')
          : null;
          
      if (insertionPoint !== null) {
        const healthCheckCode = `
  // Health check endpoint for Render.com
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: Date.now() });
  });

`;
        const updatedContent = routesContent.slice(0, insertionPoint) + 
                              healthCheckCode + 
                              routesContent.slice(insertionPoint);
                              
        fs.writeFileSync(serverRoutesPath, updatedContent);
        console.log('✓ Health check endpoint added to server/routes.ts');
      } else {
        console.log('⚠️ Could not find a good insertion point in server/routes.ts');
        console.log('  Please manually add a health check endpoint at /api/health');
      }
    } else {
      console.log('✓ Health check endpoint already exists');
    }
  } else {
    console.log('⚠️ Could not find server/routes.ts');
    console.log('  Please manually add a health check endpoint at /api/health');
  }
}

/**
 * Create a README with Render.com deployment instructions
 */
function createRenderReadme() {
  console.log('Creating Render.com deployment README...');
  
  const readmeContent = `# Deploying Tesco Price Comparison to Render.com

This guide explains how to deploy your application to Render.com's free tier.

## Prerequisites

1. A Render.com account (sign up at https://render.com)
2. Your Tesco Price Comparison codebase
3. A GitHub or GitLab repository for your code (recommended)

## Deployment Options

### Option 1: Deploy from GitHub/GitLab (Recommended)

1. Push your code to a GitHub or GitLab repository
2. Log in to Render.com
3. Click "New" > "Blueprint"
4. Connect your GitHub/GitLab account
5. Select your repository
6. Render will automatically detect the render.yaml file and use its configuration
7. Click "Apply" to create the services
8. Under Environment Variables, add your sensitive keys:
   - OPENAI_API_KEY
   - STRIPE_SECRET_KEY
   - VITE_STRIPE_PUBLIC_KEY
9. Wait for the deployment to complete

### Option 2: Manual Deployment

#### Web Service Setup

1. Log in to Render.com
2. Click "New" > "Web Service"
3. Connect your GitHub/GitLab repository or use the "Public Git repository" option
4. Fill in the following details:
   - Name: ${config.appName}
   - Environment: Node
   - Build Command: npm ci && npm run build
   - Start Command: node server/index.js
5. Under Advanced, add the following environment variables:
   - NODE_ENV: production
   - DATABASE_URL: (add after creating the database)
   - OPENAI_API_KEY: your_openai_api_key
   - STRIPE_SECRET_KEY: your_stripe_secret_key
   - VITE_STRIPE_PUBLIC_KEY: your_stripe_public_key
6. Click "Create Web Service"

#### Database Setup

1. Click "New" > "PostgreSQL"
2. Fill in the following details:
   - Name: ${config.databaseName}
   - Database: ${config.databaseName}
   - User: tesco_user
   - Region: (choose the one closest to your users)
3. Click "Create Database"
4. Once created, copy the "External Database URL"
5. Go back to your web service
6. Add the DATABASE_URL environment variable with the value copied from the PostgreSQL service

## Free Tier Limitations

Render.com's free tier includes:
- Web Services: 750 hours of runtime per month
  - Note: Free web services will "sleep" after 15 minutes of inactivity
  - They automatically wake up when a new request comes in
- PostgreSQL: 90-day free trial, gets deleted after that period
  - You'll need to recreate the database and migrate data every 90 days

## Keeping Your App Active

To prevent your app from sleeping, you can set up a service to ping it regularly:

1. Use a service like UptimeRobot (https://uptimerobot.com) to ping your app every 5 minutes
2. Set up a ping to https://your-app-name.onrender.com/api/health

## Custom Domain Setup

1. In your Render dashboard, go to your web service
2. Click on "Settings"
3. Scroll down to "Custom Domain"
4. Click "Add Custom Domain"
5. Enter your domain name: hyrisecrown.com
6. Follow the DNS configuration instructions provided by Render
7. Typically, you'll need to:
   - Create a CNAME record for www pointing to your Render URL
   - Create an ANAME/ALIAS record for the root domain pointing to your Render URL

## Troubleshooting

- **Deployment Failures**: Check the build logs for errors
- **Database Connection Issues**: Verify the DATABASE_URL environment variable
- **Application Errors**: Check the logs in the Render dashboard
- **Slow First Load**: This is normal for free tier as your app "wakes up"

## Monitoring

Render provides basic monitoring in the dashboard:
- CPU and memory usage
- Request logs
- Application logs

For more advanced monitoring, consider adding your own logging solution or using a third-party service.
`;
  
  fs.writeFileSync(path.join(__dirname, '..', 'RENDER_DEPLOYMENT.md'), readmeContent);
  console.log('✓ RENDER_DEPLOYMENT.md created successfully');
}

/**
 * Main function
 */
function main() {
  console.log('Preparing Tesco Price Comparison for Render.com deployment...\n');
  
  try {
    createRenderConfig();
    createHealthCheckEndpoint();
    createRenderReadme();
    
    console.log('\n✓ Preparation for Render.com deployment completed!');
    console.log('\nNext steps:');
    console.log('1. Create a Render.com account at https://render.com');
    console.log('2. Push your code to GitHub or GitLab (recommended)');
    console.log('3. Use the "Blueprint" option in Render to deploy using render.yaml');
    console.log('4. Follow the complete instructions in RENDER_DEPLOYMENT.md');
  } catch (error) {
    console.error(`\n❌ Preparation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();