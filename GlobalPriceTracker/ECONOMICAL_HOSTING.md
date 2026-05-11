# Economical Hosting Guide: Hetzner Cloud ($1.74/month)

This guide explains how to deploy your Tesco Price Comparison application to Hetzner Cloud's €1.58/month (~$1.74) plan with unlimited bandwidth, providing excellent value and predictable pricing.

## Hetzner Cloud Advantages

- **Fixed monthly price**: €1.58 (~$1.74) with no bandwidth charges or surprise fees
- **Generous specs**: 1 vCPU, 1GB RAM, 10GB SSD - perfect for your application
- **Unlimited bandwidth**: No traffic limits or overage concerns
- **Reliable German provider**: Excellent uptime and network performance
- **Pay-as-you-go**: Can be billed hourly if needed (€0.00298/hour)
- **No credit card required**: PayPal accepted

## Account Setup

1. Go to [Hetzner Cloud](https://www.hetzner.com/cloud)
2. Click "Sign Up" and create an account
3. Verify your email address
4. Add a payment method (credit card or PayPal)

## Server Setup

### Step 1: Create Cloud Server

1. Log in to [Hetzner Console](https://console.hetzner.cloud/)
2. Click "Add Server"
3. Choose a location (Nuremberg/Germany is good for European users)
4. Select "CPX11" (€1.58/month plan)
5. Choose "Ubuntu 22.04" as the operating system
6. Add an SSH key (optional but recommended)
7. Give your server a name (e.g., "tesco-price-comparison")
8. Click "Create & Buy Now"

### Step 2: Connect to Your Server

Using SSH (replace with your actual IP):
```bash
ssh root@your_server_ip
```

### Step 3: Install Required Software

```bash
# Update package lists
apt update
apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install nginx
apt install -y nginx

# Install Git
apt install -y git

# Install PM2 to manage Node.js process
npm install -g pm2
```

### Step 4: Configure PostgreSQL

```bash
# Switch to postgres user
sudo -i -u postgres

# Create a new database user
createuser -P tesco_user
# Enter a password when prompted

# Create a new database
createdb -O tesco_user tesco_db

# Exit postgres user shell
exit

# Configure PostgreSQL to allow password authentication
echo "host    all             all             127.0.0.1/32            scram-sha-256" | sudo tee -a /etc/postgresql/14/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Step 5: Deploy Your Application

```bash
# Create a directory for your application
mkdir -p /var/www/tesco
cd /var/www/tesco

# Clone your repository (replace with your actual repository URL)
git clone https://github.com/yourusername/tesco-price-comparison.git .

# Install dependencies
npm install

# Build the application
npm run build

# Configure environment variables
cat > .env << EOL
DATABASE_URL=postgres://tesco_user:your_password@localhost:5432/tesco_db
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
EOL

# Set up database
npm run db:push

# Start the application with PM2
pm2 start server/index.js --name tesco
pm2 save
pm2 startup
```

### Step 6: Configure Nginx as Reverse Proxy

```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/tesco << EOL
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Enable the site
ln -s /etc/nginx/sites-available/tesco /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Step 7: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot will automatically modify your Nginx configuration
```

### Step 8: Configure Domain (DNS)

1. In your domain registrar (Porkbun), create:
   - An A record for @ (root domain) pointing to your Hetzner server IP
   - An A record for www pointing to the same IP

### Step 9: Set Up Automatic Updates

```bash
# Create update script
cat > /root/update.sh << EOL
#!/bin/bash
cd /var/www/tesco
git pull
npm install
npm run build
pm2 restart tesco
EOL

# Make the script executable
chmod +x /root/update.sh

# Set up cron job to check for updates daily
(crontab -l 2>/dev/null; echo "0 2 * * * /root/update.sh") | crontab -
```

## Maintenance and Monitoring

### Basic Monitoring

```bash
# Install basic monitoring tools
apt install -y htop

# Monitor resources
htop
```

### Logs

```bash
# View application logs
pm2 logs tesco

# View Nginx access logs
tail -f /var/log/nginx/access.log

# View Nginx error logs
tail -f /var/log/nginx/error.log
```

### Database Backup

```bash
# Create backup script
cat > /root/backup.sh << EOL
#!/bin/bash
BACKUP_DIR="/root/backups"
TIMESTAMP=\$(date +"%Y%m%d_%H%M%S")
mkdir -p \$BACKUP_DIR
pg_dump -U postgres tesco_db > \$BACKUP_DIR/tesco_db_\$TIMESTAMP.sql
find \$BACKUP_DIR -type f -mtime +7 -delete
EOL

# Make the script executable
chmod +x /root/backup.sh

# Set up cron job to run backup daily
(crontab -l 2>/dev/null; echo "0 3 * * * /root/backup.sh") | crontab -
```

## Cost Optimization

Hetzner's €1.58/month is already extremely economical, but to ensure you stay within this budget:

1. **Monitor disk usage**:
   ```bash
   df -h
   ```

2. **Clean up logs periodically**:
   ```bash
   journalctl --vacuum-time=7d
   ```

3. **Clean up npm cache**:
   ```bash
   npm cache clean --force
   ```

## Scaling Options

If you need more resources in the future, Hetzner offers simple upgrades:

- **CPX21**: €2.69/month (2GB RAM, 2 vCPU)
- **CPX31**: €4.82/month (4GB RAM, 2 vCPU)

Upgrading is simple through the Hetzner Cloud Console with minimal downtime.

## Alternative Budget Options

If Hetzner doesn't work for you, consider these alternatives:

1. **Vultr**: $2.50/month (512MB RAM, 10GB SSD)
2. **AlphaVPS**: $1/month (512MB RAM, 5GB SSD)
3. **Oracle Cloud Always Free**: $0/month (but requires credit card verification)

## Support

Hetzner offers ticket-based support if you encounter any issues with the infrastructure.