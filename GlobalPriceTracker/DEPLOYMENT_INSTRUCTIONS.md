# Tesco Price Comparison Deployment Instructions

This document provides a comprehensive guide to deploy and maintain your Tesco Price Comparison application using a combined approach for maximum reliability.

## Quick Start Deployment Guide

### Option 1: Deploy with Replit (Quick and Free)

1. Click the "Deploy" button at the top of your Replit project
2. Follow the prompts to create a new deployment
3. Once deployed, your app will be available at a URL like `https://tesco-price-comparison.username.replit.app`

### Option 2: Deploy to Hetzner Cloud (€1.58/month - Most Reliable)

For a dedicated server with unlimited bandwidth:

1. Follow the instructions in `ECONOMICAL_HOSTING.md`
2. Use the deployment scripts in the `hetzner-deploy` folder

### Option 3: Combined Approach (Maximum Reliability - Recommended)

This approach uses both Replit and Hetzner Cloud for redundancy with automatic failover:

1. Deploy to both Replit and Hetzner Cloud following Options 1 and 2 above
2. Create a `.env` file from the template:
   ```bash
   cp deployment/.env.template deployment/.env
   ```
3. Edit the `.env` file to include your actual deployment URLs and API keys
4. Start the combined deployment system:
   ```bash
   deployment/start.sh
   ```

## Deployment Components

The combined deployment system includes:

1. **Keep-Alive Script** (`scripts/keep-alive.js`)
   - Prevents Replit from sleeping due to inactivity
   - Sends regular HTTP requests to your application

2. **Auto-Deployment Script** (`scripts/auto-deploy.js`) 
   - Creates new deployments automatically at regular intervals
   - Ensures your application stays up-to-date

3. **Deployment Coordinator** (`scripts/deployment-coordinator.js`)
   - Monitors both Replit and Hetzner deployments
   - Automatically switches between them if one fails
   - Provides logging and alerting

4. **Management Scripts** (in the `deployment` directory)
   - `start.sh` - Start all deployment components
   - `stop.sh` - Stop all deployment components
   - `status.sh` - Check the status of deployment components

## Monitoring Your Deployment

To check the status of your deployment:

```bash
deployment/status.sh
```

This will show:
- Whether each component is running
- Recent log entries from each component
- Current active deployment (primary or backup)

## Deployment Logs

Logs for all deployment components are stored in the `logs` directory:

- `logs/keep-alive.log` - Keep-alive script logs
- `logs/auto-deploy.log` - Auto-deployment script logs
- `logs/deployment-coordinator.log` - Deployment coordinator logs

You can monitor these logs with:

```bash
tail -f logs/deployment-coordinator.log
```

## Troubleshooting

### The application is not accessible

1. Check if the application is running locally:
   ```bash
   deployment/status.sh
   ```

2. Verify both Replit and Hetzner deployments:
   - Check Replit deployment status in the Replit dashboard
   - Check Hetzner server status using SSH:
     ```bash
     ssh root@your_server_ip "systemctl status nginx && pm2 status"
     ```

3. Check the deployment coordinator logs:
   ```bash
   tail -f logs/deployment-coordinator.log
   ```

### Automatic failover not working

1. Ensure the deployment coordinator is running:
   ```bash
   deployment/status.sh
   ```

2. Check that both URLs are correctly configured in `deployment/.env`

3. Restart the deployment coordinator:
   ```bash
   deployment/stop.sh
   deployment/start.sh
   ```

## Recommended External Monitoring

For additional monitoring, consider setting up:

1. [UptimeRobot](https://uptimerobot.com/) - Free tier with 50 monitors
2. [Freshping](https://www.freshworks.com/website-monitoring/) - Free tier with 10 monitors

## Deployment Maintenance

### Updating Your Application

1. Make changes to your application code
2. Test locally
3. Commit changes to your repository
4. Deploy to Replit by clicking "Deploy"
5. For Hetzner, run:
   ```bash
   cd hetzner-deploy
   ./upload.sh your_server_ip
   ```

### Regular Maintenance Tasks

1. Check logs regularly for errors
2. Update dependencies periodically
3. Rotate log files if they get too large
4. Check disk space on the Hetzner server:
   ```bash
   ssh root@your_server_ip "df -h"
   ```

## Additional Resources

- `AUTO_DEPLOYMENT_SETUP.md` - Detailed deployment setup guide
- `ECONOMICAL_HOSTING.md` - Comprehensive Hetzner Cloud hosting guide
- `deployment/README.md` - Information on the combined deployment system