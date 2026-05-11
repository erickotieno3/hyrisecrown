#!/bin/bash
# Combined Deployment Startup Script
# This script starts all the components of the combined deployment approach

# Change to the project root directory
cd "$(dirname "$0")/.."

# Create logs directory if it doesn't exist
mkdir -p logs
mkdir -p marketing/campaigns
mkdir -p marketing/templates
mkdir -p public/seo

# Load environment variables
if [ -f deployment/.env ]; then
  export $(grep -v '^#' deployment/.env | xargs)
else
  echo "Error: .env file not found. Please create it from .env.template"
  exit 1
fi

# Start the keep-alive script for the Replit deployment
echo "Starting keep-alive script for Replit deployment..."
node scripts/keep-alive.js > logs/keep-alive.log 2>&1 &
echo $! > deployment/keep-alive.pid
echo "Keep-alive script started with PID $(cat deployment/keep-alive.pid)"

# Start the deployment coordinator
echo "Starting deployment coordinator..."
node scripts/deployment-coordinator.js > logs/deployment-coordinator.log 2>&1 &
echo $! > deployment/coordinator.pid
echo "Deployment coordinator started with PID $(cat deployment/coordinator.pid)"

# Start the auto-deployment script for Replit
echo "Starting auto-deployment script..."
node scripts/auto-deploy.js > logs/auto-deploy.log 2>&1 &
echo $! > deployment/auto-deploy.pid
echo "Auto-deployment script started with PID $(cat deployment/auto-deploy.pid)"

# Start the unified marketing automation system
echo "Starting marketing automation system..."
node scripts/marketing-automation.js > logs/marketing-automation.log 2>&1 &
echo $! > deployment/marketing-automation.pid
echo "Marketing automation system started with PID $(cat deployment/marketing-automation.pid)"

echo ""
echo "All components started successfully!"
echo "Check the logs directory for outputs."
echo ""
echo "To stop all components, run: deployment/stop.sh"