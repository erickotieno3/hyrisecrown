#!/bin/bash
# Combined Deployment Shutdown Script
# This script stops all the components of the combined deployment approach

# Change to the project root directory
cd "$(dirname "$0")/.."

# Stop the keep-alive script
if [ -f deployment/keep-alive.pid ]; then
  echo "Stopping keep-alive script..."
  kill $(cat deployment/keep-alive.pid) 2>/dev/null || echo "Keep-alive process not running"
  rm deployment/keep-alive.pid
fi

# Stop the deployment coordinator
if [ -f deployment/coordinator.pid ]; then
  echo "Stopping deployment coordinator..."
  kill $(cat deployment/coordinator.pid) 2>/dev/null || echo "Coordinator process not running"
  rm deployment/coordinator.pid
fi

# Stop the auto-deployment script
if [ -f deployment/auto-deploy.pid ]; then
  echo "Stopping auto-deployment script..."
  kill $(cat deployment/auto-deploy.pid) 2>/dev/null || echo "Auto-deployment process not running"
  rm deployment/auto-deploy.pid
fi

# Stop the marketing automation system
if [ -f deployment/marketing-automation.pid ]; then
  echo "Stopping marketing automation system..."
  kill $(cat deployment/marketing-automation.pid) 2>/dev/null || echo "Marketing automation process not running"
  rm deployment/marketing-automation.pid
fi

# Legacy cleanup - remove old PIDs if they exist
if [ -f deployment/auto-seo.pid ]; then
  echo "Cleaning up old auto-SEO PID file..."
  rm deployment/auto-seo.pid
fi

if [ -f deployment/auto-campaign.pid ]; then
  echo "Cleaning up old auto-campaign PID file..."
  rm deployment/auto-campaign.pid
fi

echo ""
echo "All components stopped."