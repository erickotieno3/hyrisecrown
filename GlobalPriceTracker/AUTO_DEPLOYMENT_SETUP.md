# Auto-Deployment Setup Guide

This guide explains how to set up automatic deployment for your Tesco Price Comparison application to ensure it stays running at all times.

## Deployment Options

### 1. Replit Deployment (Recommended for Simplicity)

Replit offers a built-in deployment feature that creates a production-ready version of your application that remains online even when you're not actively using the Replit editor.

**Steps to Deploy:**
1. Click the "Deploy" button in the Replit interface (top right)
2. Follow the prompts to create a new deployment
3. When deployment is complete, you'll receive a public URL (e.g., `https://tesco-price-comparison.yourusername.replit.app`)

**Benefits:**
- Simple one-click deployment
- Production-ready environment
- Automatic SSL/TLS certificate
- Custom domain support
- Auto-scaling capabilities

### 2. Auto-Deployment with Scripts

For more advanced deployment needs, we've created scripts that automate the deployment process:

#### Keep-Alive Script (`scripts/keep-alive.js`)

This script prevents your Replit application from sleeping due to inactivity by sending regular HTTP requests to it.

**Setup:**
1. After deploying your app, update the `replitUrl` in `scripts/keep-alive.js` with your actual deployment URL
2. Set up the script to run continuously on another server or another Replit using:
   ```bash
   node scripts/keep-alive.js
   ```

3. To run the keep-alive script in the background on Linux/macOS:
   ```bash
   nohup node scripts/keep-alive.js > /dev/null 2>&1 &
   ```

#### Auto-Deployment Script (`scripts/auto-deploy.js`)

This script automatically creates a new deployment of your application at regular intervals using the Replit API.

**Setup:**
1. Generate a Replit deployment token:
   - Go to your Replit account settings
   - Navigate to "API Keys"
   - Create a new API key with deployment permissions
   
2. Set the required environment variables:
   ```bash
   export REPLIT_DEPLOYMENT_TOKEN=your_deployment_token
   export REPL_ID=your_repl_id
   export REPL_OWNER=your_replit_username
   ```

3. Run the auto-deployment script:
   ```bash
   node scripts/auto-deploy.js
   ```

4. To run the auto-deployment script in the background:
   ```bash
   nohup node scripts/auto-deploy.js > /dev/null 2>&1 &
   ```

### 3. Economical Server Hosting (Hetzner Cloud)

For maximum control and reliability, you can deploy to a dedicated virtual server. We've prepared scripts for Hetzner Cloud, which offers excellent value at just €1.58/month (~$1.74) with unlimited bandwidth.

**Setup:**
1. Follow the instructions in `ECONOMICAL_HOSTING.md`
2. Use the deployment scripts in the `hetzner-deploy` folder

## Using Multiple Deployment Methods for Maximum Reliability

For maximum uptime, consider using a combination of deployment methods:

1. **Replit Deployment**: Primary hosting method
2. **Keep-Alive Script**: Prevent sleep/idle shutdown
3. **Auto-Deployment Script**: Ensure regular updates
4. **Backup Server (Hetzner)**: For redundancy

## Schedule & Monitoring

### Recommended Schedule

- **Keep-Alive Pings**: Every 5 minutes (configured in `scripts/keep-alive.js`)
- **Auto-Deployments**: Every 2 days (configured in `scripts/auto-deploy.js`)
- **Database Backups**: Daily (configured in Hetzner deployment)

### Monitoring

Monitor your deployment using:

1. **Logs**:
   - Keep-alive logs: `logs/keep-alive.log`
   - Auto-deployment logs: `logs/auto-deploy.log`

2. **Uptime Monitoring**:
   - Consider setting up [UptimeRobot](https://uptimerobot.com/) (free tier available) to monitor your deployment URL
   - Configure alerts to notify you of any downtime

## Troubleshooting

### Common Issues

1. **Deployment Fails**:
   - Check that your environment variables are correctly set
   - Ensure your Replit token has the necessary permissions
   - Check the auto-deployment logs for specific error messages

2. **Application Goes Offline**:
   - Verify the keep-alive script is running
   - Check for error logs
   - Check if your Replit account has reached usage limits

3. **Database Connection Issues**:
   - Verify your database credentials are correctly set in environment variables
   - Check if the database service is running
   - Ensure your IP is whitelisted if using external database services

### Getting Help

If you encounter any issues with the deployment process, refer to:

1. Replit documentation: https://docs.replit.com/hosting/deployments/about-deployments
2. Hetzner Cloud documentation: https://docs.hetzner.com/cloud/
3. Open an issue in the project repository for specific deployment questions