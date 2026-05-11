# Azure Deployment Guide for Tesco Price Comparison

This guide explains how to deploy your Tesco Price Comparison application to Microsoft Azure App Service for improved reliability, scalability, and simplified management.

## Prerequisites

1. Microsoft Azure account
2. Azure CLI installed locally (optional)
3. Your Tesco Price Comparison codebase

## Step 1: Prepare Your Application

Ensure your application is ready for production deployment:

1. Make sure your package.json has appropriate scripts:
   ```json
   "scripts": {
     "start": "node server/index.js",
     "build": "npm run build:client && npm run build:server",
     "build:client": "vite build",
     "build:server": "tsc -p tsconfig.server.json"
   }
   ```

2. Configure environment variables to work with Azure:
   - Update any hardcoded URLs to use environment variables
   - Ensure database connection strings can be configured via environment

3. Add a web.config file for Azure App Service (in the root directory):
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <configuration>
     <system.webServer>
       <webSocket enabled="false" />
       <handlers>
         <add name="iisnode" path="server/index.js" verb="*" modules="iisnode" />
       </handlers>
       <rewrite>
         <rules>
           <rule name="StaticContent">
             <action type="Rewrite" url="client/dist{REQUEST_URI}" />
           </rule>
           <rule name="DynamicContent">
             <conditions>
               <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True" />
             </conditions>
             <action type="Rewrite" url="server/index.js" />
           </rule>
         </rules>
       </rewrite>
       <iisnode watchedFiles="web.config;*.js"/>
     </system.webServer>
   </configuration>
   ```

## Step 2: Create Azure Resources

### Using Azure Portal

1. Sign in to [Azure Portal](https://portal.azure.com)

2. Create a new Resource Group:
   - Click "Resource groups" > "Create"
   - Enter "tesco-comparison-group" for the name
   - Select a region close to your target audience (e.g., "East US" or "West Europe")
   - Click "Review + create" > "Create"

3. Create an App Service Plan:
   - In your resource group, click "Add"
   - Search for "App Service Plan" and select it
   - Click "Create"
   - Name: "tesco-comparison-plan"
   - Operating System: Linux
   - Region: Same as your resource group
   - Pricing Plan: Choose at least "Basic B1" for production (or "Premium P1v3" for higher performance)
   - Click "Review + create" > "Create"

4. Create an App Service:
   - In your resource group, click "Add"
   - Search for "Web App" and select it
   - Click "Create"
   - Name: "tesco-price-comparison" (this will be part of your app's URL)
   - Publish: Code
   - Runtime stack: Node 18 LTS
   - Operating System: Linux
   - Region: Same as your resource group
   - App Service Plan: Select the plan you created
   - Click "Review + create" > "Create"

5. Create an Azure Database for PostgreSQL:
   - In your resource group, click "Add"
   - Search for "Azure Database for PostgreSQL" and select "Flexible Server"
   - Click "Create"
   - Server name: "tesco-comparison-db"
   - Region: Same as your resource group
   - PostgreSQL version: 14
   - Authentication method: Use both PostgreSQL and Azure Active Directory
   - Admin username: Create a secure admin username
   - Password: Create a secure password
   - Under "Compute + storage," select an appropriate tier (General Purpose is recommended for production)
   - Click "Review + create" > "Create"

## Step 3: Configure Environment Variables

1. In the Azure Portal, go to your App Service
2. Click on "Configuration" in the left sidebar
3. Under "Application settings", add the following environment variables:
   - DATABASE_URL: Your PostgreSQL connection string (get from database overview)
   - NODE_ENV: "production"
   - OPENAI_API_KEY: Your OpenAI API key
   - STRIPE_SECRET_KEY: Your Stripe secret key
   - VITE_STRIPE_PUBLIC_KEY: Your Stripe public key
   - Add any other environment variables your application needs
4. Click "Save"

## Step 4: Configure Deployment

### Option 1: GitHub Actions (Recommended)

1. Push your code to a GitHub repository
2. In the Azure Portal, go to your App Service
3. Click on "Deployment Center" in the left sidebar
4. Source: GitHub
5. Sign in to your GitHub account
6. Organization: Select your GitHub organization
7. Repository: Select your repository
8. Branch: main (or your preferred branch)
9. Build Provider: GitHub Actions
10. Click "Save"

GitHub will automatically create a workflow file in your repository and start the deployment.

### Option 2: Azure CLI Deployment

If you prefer using the command line:

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "your-subscription-id"

# Create a ZIP package of your app
zip -r app.zip . -x "node_modules/*" ".git/*"

# Deploy the ZIP package
az webapp deploy --resource-group tesco-comparison-group --name tesco-price-comparison --src-path app.zip
```

## Step 5: Configure Custom Domain

1. In the Azure Portal, go to your App Service
2. Click on "Custom domains" in the left sidebar
3. Click "Add custom domain"
4. Enter your domain: "hyrisecrown.com"
5. Configure your DNS:
   - Create an A record pointing to the IP address of your App Service
   - Create a TXT record for verification
6. Click "Validate" to confirm your setup
7. Add the domain

## Step 6: Enable SSL (HTTPS)

1. In the Custom domains page, click on the domain you added
2. Click "Add binding" to add an HTTPS binding
3. Choose "Create new" or upload your existing SSL certificate
4. Select TLS/SSL type (usually SNI SSL)
5. Click "Add binding"

## Step 7: Configure Continuous Deployment

GitHub Actions will handle continuous deployment for you if you chose that option. Every time you push to your main branch, a new deployment will be triggered automatically.

## Monitoring and Scaling

1. Set up Application Insights for monitoring:
   - In your App Service, go to "Application Insights"
   - Click "Turn on Application Insights"
   - Follow the setup wizard

2. Configure auto-scaling:
   - In your App Service, go to "Scale out (App Service Plan)"
   - Click "Enable autoscale"
   - Configure your scaling rules based on CPU usage, memory, or request count

## Cost Optimization

- Choose a pricing tier that matches your needs
- Consider using reserved instances for long-term cost savings
- Set up auto-scaling to handle traffic spikes efficiently
- Consider using Azure Dev/Test pricing for non-production environments

## Troubleshooting

- Check "Log stream" in your App Service for real-time logs
- Use "Diagnose and solve problems" for automated troubleshooting
- Review "Application Insights" for detailed performance metrics