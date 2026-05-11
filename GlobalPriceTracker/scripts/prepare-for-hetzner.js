/**
 * Prepare Tesco Price Comparison for Hetzner Cloud Deployment
 * 
 * This script helps prepare your application for deployment to a Hetzner Cloud
 * server running Ubuntu 22.04 LTS.
 * 
 * It generates:
 * 1. A deployment script for your application
 * 2. Nginx configuration for the reverse proxy
 * 3. Process management setup with PM2
 * 4. Database setup and migration script
 * 5. SSL setup with Let's Encrypt
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration (modify as needed)
const config = {
  appName: 'tesco-price-comparison',
  domain: 'hyrisecrown.com', // Your domain name
  serverPort: 5000, // The port your Node.js app runs on
  outputDir: path.join(__dirname, '..', 'hetzner-deploy')
};

/**
 * Ensure the output directory exists
 */
function ensureOutputDirectory() {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
}

/**
 * Create the deployment script
 */
function createDeploymentScript() {
  console.log('Creating deployment script...');
  
  const deployScript = `#!/bin/bash
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
sudo mkdir -p /var/www/${config.appName}
sudo chown $USER:$USER /var/www/${config.appName}

# Clone repository (replace with your actual repository URL)
# For this example, we'll assume the app is copied manually
# git clone https://github.com/yourusername/${config.appName}.git /var/www/${config.appName}

# Create .env file
cat > /var/www/${config.appName}/.env << EOL
DATABASE_URL=postgres://tesco_user:your_secure_password@localhost:5432/tesco_db
NODE_ENV=production
PORT=${config.serverPort}
# Add your API keys here
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
EOL

# Navigate to app directory
cd /var/www/${config.appName}

# Install dependencies
npm install

# Build the application
npm run build

# Initialize database (adjust as needed)
npm run db:push

# Set up PM2 to manage the Node.js process
pm2 start server/index.js --name ${config.appName}
pm2 save
pm2 startup

# Configure Nginx as reverse proxy
sudo tee /etc/nginx/sites-available/${config.appName} > /dev/null << EOL
server {
    listen 80;
    server_name ${config.domain} www.${config.domain};

    location / {
        proxy_pass http://localhost:${config.serverPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_cache_bypass \\$http_upgrade;
    }
}
EOL

# Enable the site
sudo ln -s /etc/nginx/sites-available/${config.appName} /etc/nginx/sites-enabled/

# Remove default Nginx site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Set up SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ${config.domain} -d www.${config.domain}

# Set up automatic updates
cat > /root/update.sh << EOL
#!/bin/bash
cd /var/www/${config.appName}
git pull
npm install
npm run build
pm2 restart ${config.appName}
EOL

# Make the script executable
sudo chmod +x /root/update.sh

# Set up cron job to check for updates daily
(sudo crontab -l 2>/dev/null; echo "0 2 * * * /root/update.sh") | sudo crontab -

# Set up database backup
cat > /root/backup.sh << EOL
#!/bin/bash
BACKUP_DIR="/root/backups"
TIMESTAMP=\\$(date +"%Y%m%d_%H%M%S")
mkdir -p \\$BACKUP_DIR
pg_dump -U postgres tesco_db > \\$BACKUP_DIR/tesco_db_\\$TIMESTAMP.sql
find \\$BACKUP_DIR -type f -mtime +7 -delete
EOL

# Make the script executable
sudo chmod +x /root/backup.sh

# Set up cron job to run backup daily
(sudo crontab -l 2>/dev/null; echo "0 3 * * * /root/backup.sh") | sudo crontab -

echo "==================================================="
echo "Deployment completed successfully!"
echo "Your application is now running at https://${config.domain}"
echo "==================================================="
`;

  fs.writeFileSync(path.join(config.outputDir, 'deploy.sh'), deployScript);
  console.log('✓ deploy.sh created successfully');
  
  // Make the script executable
  try {
    fs.chmodSync(path.join(config.outputDir, 'deploy.sh'), '755');
  } catch (error) {
    console.warn(`Warning: Could not make script executable: ${error.message}`);
  }
}

/**
 * Create upload script
 */
function createUploadScript() {
  console.log('Creating upload script...');
  
  const uploadScript = `#!/bin/bash
# Upload application to Hetzner Cloud server
# Usage: ./upload.sh <server_ip>

if [ -z "$1" ]; then
  echo "Error: Server IP address is required"
  echo "Usage: ./upload.sh <server_ip>"
  exit 1
fi

SERVER_IP=$1
APP_DIR="/var/www/${config.appName}"

# Create a deployment package
echo "Creating deployment package..."
cd ..
zip -r hetzner-deploy/deploy.zip . -x "node_modules/*" ".git/*" "hetzner-deploy/*"

# Upload deployment package and deploy script
echo "Uploading files to server..."
scp hetzner-deploy/deploy.zip hetzner-deploy/deploy.sh root@$SERVER_IP:/root/

# Connect to server and deploy
echo "Connecting to server and deploying..."
ssh root@$SERVER_IP << EOF
  # Extract the deployment package
  mkdir -p $APP_DIR
  unzip -o /root/deploy.zip -d $APP_DIR
  
  # Run the deployment script
  chmod +x /root/deploy.sh
  /root/deploy.sh
EOF

echo "==================================================="
echo "Upload and deployment completed!"
echo "Your application is now available at https://${config.domain}"
echo "==================================================="
`;

  fs.writeFileSync(path.join(config.outputDir, 'upload.sh'), uploadScript);
  console.log('✓ upload.sh created successfully');
  
  // Make the script executable
  try {
    fs.chmodSync(path.join(config.outputDir, 'upload.sh'), '755');
  } catch (error) {
    console.warn(`Warning: Could not make script executable: ${error.message}`);
  }
}

/**
 * Create initial server setup script
 */
function createServerSetupScript() {
  console.log('Creating server setup script...');
  
  const setupScript = `#!/bin/bash
# Initial Hetzner Cloud Server Setup
# Usage: ./setup-server.sh <server_ip>

if [ -z "$1" ]; then
  echo "Error: Server IP address is required"
  echo "Usage: ./setup-server.sh <server_ip>"
  exit 1
fi

SERVER_IP=$1

# Create a new SSH key if one doesn't exist
if [ ! -f ~/.ssh/id_rsa ]; then
  echo "Generating new SSH key..."
  ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
fi

# Copy SSH key to server
echo "Copying SSH key to server..."
ssh-copy-id root@$SERVER_IP

# Basic security setup
echo "Setting up basic security..."
ssh root@$SERVER_IP << EOF
  # Update and upgrade
  apt update && apt upgrade -y
  
  # Install fail2ban for SSH protection
  apt install -y fail2ban
  
  # Set up firewall
  apt install -y ufw
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow ssh
  ufw allow http
  ufw allow https
  ufw --force enable
  
  # Set up automatic security updates
  apt install -y unattended-upgrades
  dpkg-reconfigure -plow unattended-upgrades
EOF

echo "==================================================="
echo "Server setup completed!"
echo "Your server is now ready for application deployment."
echo "Run ./upload.sh $SERVER_IP to deploy your application."
echo "==================================================="
`;

  fs.writeFileSync(path.join(config.outputDir, 'setup-server.sh'), setupScript);
  console.log('✓ setup-server.sh created successfully');
  
  // Make the script executable
  try {
    fs.chmodSync(path.join(config.outputDir, 'setup-server.sh'), '755');
  } catch (error) {
    console.warn(`Warning: Could not make script executable: ${error.message}`);
  }
}

/**
 * Create Hetzner Cloud setup instructions
 */
function createInstructions() {
  console.log('Creating deployment instructions...');
  
  const instructions = `# Hetzner Cloud Deployment Instructions (€1.58/month)

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
6. Give your server a name (e.g., "${config.appName}")
7. Click "Create & Buy Now"

## Step 3: Configure Your Server

1. Note the IP address of your new server
2. Run the setup script from your local machine:
   \`\`\`bash
   ./setup-server.sh your_server_ip
   \`\`\`

## Step 4: Deploy Your Application

1. Edit the \`.env\` section in \`deploy.sh\` to include your actual API keys
2. Run the upload and deployment script from your local machine:
   \`\`\`bash
   ./upload.sh your_server_ip
   \`\`\`

## Step 5: Configure DNS for Your Domain

1. Log in to your domain registrar (Porkbun)
2. Create an A record for @ (root domain) pointing to your Hetzner server IP
3. Create an A record for www pointing to the same IP
4. Wait for DNS propagation (can take up to 24 hours)

## Using Your Deployment

- Your application will be available at https://${config.domain}
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
   \`\`\`bash
   ./upload.sh your_server_ip
   \`\`\`

### Monitoring

1. SSH into your server:
   \`\`\`bash
   ssh root@your_server_ip
   \`\`\`

2. Check application status:
   \`\`\`bash
   pm2 status
   \`\`\`

3. View application logs:
   \`\`\`bash
   pm2 logs ${config.appName}
   \`\`\`

### Backups

Database backups are automatically created daily and stored in \`/root/backups/\` on your server. To download a backup:

\`\`\`bash
scp root@your_server_ip:/root/backups/tesco_db_*.sql ./local_backup/
\`\`\`

## Troubleshooting

### Application Not Starting

Check the application logs:
\`\`\`bash
ssh root@your_server_ip "pm2 logs ${config.appName}"
\`\`\`

### Database Connection Issues

Verify PostgreSQL is running:
\`\`\`bash
ssh root@your_server_ip "systemctl status postgresql"
\`\`\`

### SSL Certificate Issues

Run Certbot again:
\`\`\`bash
ssh root@your_server_ip "certbot --nginx -d ${config.domain} -d www.${config.domain}"
\`\`\`

## Cost Management

Hetzner's €1.58/month is already extremely economical with unlimited bandwidth. No need to worry about bandwidth charges or surprise fees!`;

  fs.writeFileSync(path.join(config.outputDir, 'INSTRUCTIONS.md'), instructions);
  console.log('✓ INSTRUCTIONS.md created successfully');
}

/**
 * Main function
 */
async function main() {
  console.log('Preparing Tesco Price Comparison for Hetzner Cloud deployment...\n');
  
  try {
    ensureOutputDirectory();
    createDeploymentScript();
    createUploadScript();
    createServerSetupScript();
    createInstructions();
    
    console.log('\n✓ Preparation for Hetzner Cloud deployment completed!');
    console.log(`\nAll deployment files are in: ${config.outputDir}`);
    console.log('\nNext steps:');
    console.log('1. Sign up for Hetzner Cloud');
    console.log('2. Create a server with the €1.58/month (CPX11) plan');
    console.log('3. Follow the instructions in INSTRUCTIONS.md to deploy your application');
  } catch (error) {
    console.error(`\n❌ Preparation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();