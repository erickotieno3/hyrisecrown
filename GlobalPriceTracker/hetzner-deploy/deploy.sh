#!/bin/bash
# Tesco Price Comparison Deployment Script for Hetzner Cloud
# Run this script on your Hetzner Cloud server

# Exit on error
set -e

# Display commands being executed
set -x

# Update package lists
sudo apt update
sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Install PM2 to manage Node.js process
sudo npm install -g pm2

# Set up PostgreSQL
echo "Creating PostgreSQL user and database..."
sudo -u postgres psql -c "CREATE USER tesco_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "CREATE DATABASE tesco_db OWNER tesco_user;"

# Configure PostgreSQL to allow password authentication if needed
echo "host    all             all             127.0.0.1/32            scram-sha-256" | sudo tee -a /etc/postgresql/14/main/pg_hba.conf
sudo systemctl restart postgresql

# Create application directory
sudo mkdir -p /var/www/tesco-price-comparison
sudo chown $USER:$USER /var/www/tesco-price-comparison

# Clone repository (replace with your actual repository URL)
# For this example, we'll assume the app is copied manually
# git clone https://github.com/yourusername/tesco-price-comparison.git /var/www/tesco-price-comparison

# Create .env file
cat > /var/www/tesco-price-comparison/.env << EOL
DATABASE_URL=postgres://tesco_user:your_secure_password@localhost:5432/tesco_db
NODE_ENV=production
PORT=5000
# Add your API keys here
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
EOL

# Navigate to app directory
cd /var/www/tesco-price-comparison

# Install dependencies
npm install

# Build the application
npm run build

# Initialize database (adjust as needed)
npm run db:push

# Set up PM2 to manage the Node.js process
pm2 start server/index.js --name tesco-price-comparison
pm2 save
pm2 startup

# Configure Nginx as reverse proxy
sudo tee /etc/nginx/sites-available/tesco-price-comparison > /dev/null << EOL
server {
    listen 80;
    server_name hyrisecrown.com www.hyrisecrown.com;

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
sudo ln -s /etc/nginx/sites-available/tesco-price-comparison /etc/nginx/sites-enabled/

# Remove default Nginx site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Set up SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d hyrisecrown.com -d www.hyrisecrown.com

# Set up automatic updates
cat > /root/update.sh << EOL
#!/bin/bash
cd /var/www/tesco-price-comparison
git pull
npm install
npm run build
pm2 restart tesco-price-comparison
EOL

# Make the script executable
sudo chmod +x /root/update.sh

# Set up cron job to check for updates daily
(sudo crontab -l 2>/dev/null; echo "0 2 * * * /root/update.sh") | sudo crontab -

# Set up database backup
cat > /root/backup.sh << EOL
#!/bin/bash
BACKUP_DIR="/root/backups"
TIMESTAMP=\$(date +"%Y%m%d_%H%M%S")
mkdir -p \$BACKUP_DIR
pg_dump -U postgres tesco_db > \$BACKUP_DIR/tesco_db_\$TIMESTAMP.sql
find \$BACKUP_DIR -type f -mtime +7 -delete
EOL

# Make the script executable
sudo chmod +x /root/backup.sh

# Set up cron job to run backup daily
(sudo crontab -l 2>/dev/null; echo "0 3 * * * /root/backup.sh") | sudo crontab -

echo "==================================================="
echo "Deployment completed successfully!"
echo "Your application is now running at https://hyrisecrown.com"
echo "==================================================="
