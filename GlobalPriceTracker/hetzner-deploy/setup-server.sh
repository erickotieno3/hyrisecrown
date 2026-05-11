#!/bin/bash
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
