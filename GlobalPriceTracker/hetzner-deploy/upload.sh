#!/bin/bash
# Upload application to Hetzner Cloud server
# Usage: ./upload.sh <server_ip>

if [ -z "$1" ]; then
  echo "Error: Server IP address is required"
  echo "Usage: ./upload.sh <server_ip>"
  exit 1
fi

SERVER_IP=$1
APP_DIR="/var/www/tesco-price-comparison"

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
echo "Your application is now available at https://hyrisecrown.com"
echo "==================================================="
