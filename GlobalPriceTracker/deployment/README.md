# Combined Deployment System

This directory contains the scripts and configuration for the combined deployment approach using both Replit and Hetzner Cloud for maximum reliability.

## Quick Start

1. Copy `.env.template` to `.env` and fill in your values:
   ```bash
   cp .env.template .env
   nano .env  # Or use your preferred text editor
   ```

2. Make the scripts executable:
   ```bash
   chmod +x start.sh stop.sh status.sh
   ```

3. Start the combined deployment system:
   ```bash
   ./start.sh
   ```

4. Check the status:
   ```bash
   ./status.sh
   ```

5. Stop the system when needed:
   ```bash
   ./stop.sh
   ```

## Components

The combined deployment system consists of several components:

1. **Replit Deployment**: The primary hosting option
   - Set up through the Replit interface (Deploy button)
   - Monitored by the keep-alive script

2. **Hetzner Cloud Server**: The backup hosting option
   - €1.58/month with unlimited bandwidth
   - Set up using the scripts in `../hetzner-deploy/`

3. **Deployment Coordinator**: Manages failover between deployments
   - Continuously monitors both deployments
   - Automatically switches between primary and backup if one fails

4. **Keep-Alive Script**: Prevents Replit from sleeping
   - Sends regular pings to the Replit deployment
   - Logs activity to `../logs/keep-alive.log`

5. **Auto-Deployment Script**: Ensures regular updates
   - Creates new deployments automatically
   - Logs activity to `../logs/auto-deploy.log`

## Deployment Setup

### Replit Deployment

1. From your Replit project, click the "Deploy" button in the top right
2. Follow the prompts to create a new deployment
3. Note the deployment URL (e.g., `https://tesco-price-comparison.username.replit.app`)
4. Update the `PRIMARY_URL` in your `.env` file with this URL

### Hetzner Cloud Deployment

1. Sign up for Hetzner Cloud (€1.58/month plan)
2. Follow the steps in `../ECONOMICAL_HOSTING.md`
3. Use the scripts in `../hetzner-deploy/` folder
4. Note the server IP/domain
5. Update the `BACKUP_URL` in your `.env` file with this URL

## Monitoring

- Use `./status.sh` to check the status of all components
- Check individual logs in the `../logs/` directory
- The deployment coordinator logs to `../logs/deployment-coordinator.log`

## Automatic Failover

The deployment coordinator automatically:

1. Checks the health of both deployments every 5 minutes
2. Switches to the backup if the primary fails multiple checks
3. Switches back to primary once it's healthy again
4. Can send notifications on deployment changes (if configured)

## Troubleshooting

If any component fails:

1. Check the logs for error messages:
   ```bash
   tail -f ../logs/deployment-coordinator.log
   ```

2. Ensure environment variables are correctly set in `.env`

3. Restart the system:
   ```bash
   ./stop.sh
   ./start.sh
   ```

## Recommended Monitoring Services

For additional monitoring:

1. [UptimeRobot](https://uptimerobot.com/) - Free tier offers 50 monitors
2. [Freshping](https://www.freshworks.com/website-monitoring/) - Free tier includes 10 monitors
3. [Pingdom](https://www.pingdom.com/) - Paid service with advanced features

## Additional Information

For more information on the individual deployment options, see:

- `../AUTO_DEPLOYMENT_SETUP.md` - Complete deployment setup guide
- `../ECONOMICAL_HOSTING.md` - Guide for Hetzner Cloud hosting