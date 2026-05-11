# Hetzner Cloud Deployment Instructions (€1.58/month)

This guide will help you deploy your Tesco Price Comparison application to Hetzner Cloud's €1.58/month (~$1.74) plan with unlimited bandwidth.

## Step 1: Create Hetzner Cloud Account

1. Go to [Hetzner Cloud](https://www.hetzner.com/cloud)
2. Click "Sign Up" and create an account
3. Verify your email address
4. Add a payment method (credit card or PayPal)

## Step 2: Create a Server

1. Log in to [Hetzner Console](https://console.hetzner.cloud/)
2. Click "Add Server"
3. Choose a location (Nuremberg/Germany is good for European users)
4. Select "CPX11" (€1.58/month plan with 1 vCPU, 1GB RAM, 10GB SSD)
5. Choose "Ubuntu 22.04" as the operating system
6. Give your server a name (e.g., "tesco-price-comparison")
7. Click "Create & Buy Now"

## Step 3: Configure Your Server

1. Note the IP address of your new server
2. Run the setup script from your local machine:
   ```bash
   ./setup-server.sh your_server_ip
   ```

## Step 4: Deploy Your Application

1. Edit the `.env` section in `deploy.sh` to include your actual API keys
2. Run the upload and deployment script from your local machine:
   ```bash
   ./upload.sh your_server_ip
   ```

## Step 5: Configure DNS for Your Domain

1. Log in to your domain registrar (Porkbun)
2. Create an A record for @ (root domain) pointing to your Hetzner server IP
3. Create an A record for www pointing to the same IP
4. Wait for DNS propagation (can take up to 24 hours)

## Using Your Deployment

- Your application will be available at https://hyrisecrown.com
- The deployment sets up:
  - Nginx as a reverse proxy
  - Let's Encrypt SSL certificates (auto-renewing)
  - PM2 for process management
  - Automatic daily backups
  - Security with fail2ban and UFW firewall

## Maintenance

### Updating Your Application

To update your application after making changes:

1. Push changes to your repository
2. Run the upload script again:
   ```bash
   ./upload.sh your_server_ip
   ```

### Monitoring

1. SSH into your server:
   ```bash
   ssh root@your_server_ip
   ```

2. Check application status:
   ```bash
   pm2 status
   ```

3. View application logs:
   ```bash
   pm2 logs tesco-price-comparison
   ```

### Backups

Database backups are automatically created daily and stored in `/root/backups/` on your server. To download a backup:

```bash
scp root@your_server_ip:/root/backups/tesco_db_*.sql ./local_backup/
```

## Troubleshooting

### Application Not Starting

Check the application logs:
```bash
ssh root@your_server_ip "pm2 logs tesco-price-comparison"
```

### Database Connection Issues

Verify PostgreSQL is running:
```bash
ssh root@your_server_ip "systemctl status postgresql"
```

### SSL Certificate Issues

Run Certbot again:
```bash
ssh root@your_server_ip "certbot --nginx -d hyrisecrown.com -d www.hyrisecrown.com"
```

## Cost Management

Hetzner's €1.58/month is already extremely economical with unlimited bandwidth. No need to worry about bandwidth charges or surprise fees!