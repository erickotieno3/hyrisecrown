#!/bin/bash
# Combined Deployment Status Script
# This script checks the status of all deployment components

# Change to the project root directory
cd "$(dirname "$0")/.."

# Check keep-alive script
if [ -f deployment/keep-alive.pid ]; then
  if ps -p $(cat deployment/keep-alive.pid) > /dev/null; then
    echo "✓ Keep-alive script: RUNNING (PID: $(cat deployment/keep-alive.pid))"
  else
    echo "✗ Keep-alive script: STOPPED (stale PID file)"
  fi
else
  echo "✗ Keep-alive script: NOT STARTED"
fi

# Check deployment coordinator
if [ -f deployment/coordinator.pid ]; then
  if ps -p $(cat deployment/coordinator.pid) > /dev/null; then
    echo "✓ Deployment coordinator: RUNNING (PID: $(cat deployment/coordinator.pid))"
  else
    echo "✗ Deployment coordinator: STOPPED (stale PID file)"
  fi
else
  echo "✗ Deployment coordinator: NOT STARTED"
fi

# Check auto-deployment script
if [ -f deployment/auto-deploy.pid ]; then
  if ps -p $(cat deployment/auto-deploy.pid) > /dev/null; then
    echo "✓ Auto-deployment script: RUNNING (PID: $(cat deployment/auto-deploy.pid))"
  else
    echo "✗ Auto-deployment script: STOPPED (stale PID file)"
  fi
else
  echo "✗ Auto-deployment script: NOT STARTED"
fi

# Check marketing automation system
if [ -f deployment/marketing-automation.pid ]; then
  if ps -p $(cat deployment/marketing-automation.pid) > /dev/null; then
    echo "✓ Marketing automation system: RUNNING (PID: $(cat deployment/marketing-automation.pid))"
  else
    echo "✗ Marketing automation system: STOPPED (stale PID file)"
  fi
else
  echo "✗ Marketing automation system: NOT STARTED"
fi

echo ""
echo "Recent log entries:"
echo "-------------------"
echo "Keep-alive log:"
tail -n 3 logs/keep-alive.log 2>/dev/null || echo "No keep-alive logs found"
echo ""
echo "Coordinator log:"
tail -n 3 logs/deployment-coordinator.log 2>/dev/null || echo "No coordinator logs found"
echo ""
echo "Auto-deployment log:"
tail -n 3 logs/auto-deploy.log 2>/dev/null || echo "No auto-deployment logs found"
echo ""
echo "Marketing Automation log:"
tail -n 5 logs/marketing-automation.log 2>/dev/null || echo "No marketing automation logs found"
echo ""
echo "Marketing Health Report:"
if [ -f logs/marketing-health.json ]; then
  echo "✓ Health report available - last updated: $(date -r logs/marketing-health.json '+%Y-%m-%d %H:%M:%S')"
  if command -v jq &> /dev/null; then
    jq -r '"✓ Overall Health Score: " + (.overallHealthScore | tostring) + "%"' logs/marketing-health.json 2>/dev/null || echo "  Unable to parse health score"
  else
    grep -o '"overallHealthScore": [0-9]*' logs/marketing-health.json | grep -o '[0-9]*' | xargs -I{} echo "✓ Overall Health Score: {}%" 2>/dev/null || echo "  Unable to parse health score"
  fi
else
  echo "✗ No marketing health report found"
fi
echo ""
echo "Legacy Logs (for reference):"
echo "Auto-SEO log:"
tail -n 2 logs/auto-seo.log 2>/dev/null || echo "No auto-SEO logs found"
echo ""
echo "Auto-Campaign log:"
tail -n 2 logs/auto-campaign.log 2>/dev/null || echo "No auto-campaign logs found"

# Check for marketing content
echo ""
echo "Marketing Campaign Status:"
echo "-------------------------"
if [ -d marketing/campaigns ]; then
  campaign_count=$(find marketing/campaigns -name "*.json" | wc -l)
  echo "✓ Marketing campaigns generated: $campaign_count"
  newest_campaign=$(find marketing/campaigns -name "*.json" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -f2- -d" " 2>/dev/null)
  if [ ! -z "$newest_campaign" ]; then
    echo "✓ Latest campaign: $(basename "$newest_campaign")"
    echo "  Generated on: $(date -r "$newest_campaign" '+%Y-%m-%d %H:%M:%S')"
  fi
else
  echo "✗ No marketing campaigns found"
fi

# Check for SEO content
echo ""
echo "SEO Optimization Status:"
echo "------------------------"
if [ -f public/sitemap.xml ]; then
  echo "✓ Sitemap generated: public/sitemap.xml"
  echo "  Last updated: $(date -r public/sitemap.xml '+%Y-%m-%d %H:%M:%S')"
else
  echo "✗ No sitemap found"
fi

if [ -f public/robots.txt ]; then
  echo "✓ Robots.txt generated: public/robots.txt"
  echo "  Last updated: $(date -r public/robots.txt '+%Y-%m-%d %H:%M:%S')"
else
  echo "✗ No robots.txt found"
fi

seo_config_count=$(find public/seo -name "*.json" | wc -l)
if [ $seo_config_count -gt 0 ]; then
  echo "✓ SEO configurations generated: $seo_config_count"
else
  echo "✗ No SEO configurations found"
fi