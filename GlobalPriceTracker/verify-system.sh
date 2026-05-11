#!/bin/bash

# Verification Script for Real-Time Price & Push Notifications System
# This script verifies all components are correctly implemented

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  REAL-TIME PRICE SYSTEM VERIFICATION                          ║"
echo "║  Checking all components are properly installed               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Track results
PASSED=0
FAILED=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅${NC} $2 exists"
    ((PASSED++))
  else
    echo -e "${RED}❌${NC} $2 NOT FOUND: $1"
    ((FAILED++))
  fi
}

# Function to check if directory exists
check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✅${NC} $2 directory exists"
    ((PASSED++))
  else
    echo -e "${RED}❌${NC} $2 directory NOT FOUND: $1"
    ((FAILED++))
  fi
}

# Function to check npm script
check_npm_script() {
  if grep -q "\"$1\":" package.json; then
    echo -e "${GREEN}✅${NC} npm script '$1' is defined"
    ((PASSED++))
  else
    echo -e "${RED}❌${NC} npm script '$1' NOT FOUND in package.json"
    ((FAILED++))
  fi
}

# Function to check if code contains a string
check_code() {
  if grep -r "$2" "$1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} $3 found in $1"
    ((PASSED++))
  else
    echo -e "${RED}❌${NC} $3 NOT FOUND in $1"
    ((FAILED++))
  fi
}

echo "📁 Checking Core Script Files..."
echo "─────────────────────────────────────────────────────────────────"
check_file "scripts/real-time-price-fetcher.mjs" "Real-time Price Fetcher"
check_file "scripts/push-notification-service.mjs" "Push Notification Service"
check_file "scripts/enhanced-price-workflow.mjs" "Enhanced Price Workflow"
check_file "scripts/auto-blog-generator.mjs" "Auto Blog Generator"
check_file "scripts/auto-price-updater.mjs" "Auto Price Updater"
check_file "scripts/auto-commit-push.mjs" "Auto Commit & Push"
echo ""

echo "🎨 Checking Frontend Components..."
echo "─────────────────────────────────────────────────────────────────"
check_file "client/src/components/PriceAlerts.tsx" "PriceAlerts Component"
check_file "client/src/services/pushNotifications.ts" "Push Notifications Service"
echo ""

echo "🔧 Checking Backend Routes..."
echo "─────────────────────────────────────────────────────────────────"
check_file "server/push-notification-routes.ts" "Push Notification Routes"
check_code "server/routes.ts" "pushNotificationRouter" "Push routes integration"
echo ""

echo "📚 Checking Documentation..."
echo "─────────────────────────────────────────────────────────────────"
check_file "REAL_TIME_PRICE_ALERTS_GUIDE.md" "Real-Time Price Guide"
check_file "PRICE_ALERTS_QUICK_START.md" "Quick Start Guide"
check_file "REAL_TIME_IMPLEMENTATION_SUMMARY.md" "Implementation Summary"
echo ""

echo "📋 Checking Configuration Files..."
echo "─────────────────────────────────────────────────────────────────"
check_npm_script "price:fetch" "NPM script"
check_npm_script "price:notify" "NPM script"
check_npm_script "price:workflow" "NPM script"
check_npm_script "price:full" "NPM script"
echo ""

echo "🔧 Checking Service Worker..."
echo "─────────────────────────────────────────────────────────────────"
check_code "mobile-app/service-worker.js" "push" "Push event listener"
check_code "mobile-app/service-worker.js" "notificationclick" "Notification click handler"
echo ""

echo "📁 Checking Data Directory Structure..."
echo "─────────────────────────────────────────────────────────────────"
check_dir "data" "Data"
check_dir "logs" "Logs"
check_dir "public/blog" "Blog"
echo ""

echo "🔍 Checking Code Integration..."
echo "─────────────────────────────────────────────────────────────────"
check_code "client/src/" "pushNotificationClient" "Push notification client usage"
check_code "package.json" "price:fetch" "Price fetch script in package.json"
check_code "package.json" "price:notify" "Price notify script in package.json"
echo ""

# Test if npm can find the scripts
echo "⚙️  Checking NPM Script Accessibility..."
echo "─────────────────────────────────────────────────────────────────"
if npm --version > /dev/null 2>&1; then
  echo -e "${GREEN}✅${NC} npm is installed and accessible"
  ((PASSED++))
else
  echo -e "${RED}❌${NC} npm is NOT installed or not in PATH"
  ((FAILED++))
fi

if node --version > /dev/null 2>&1; then
  echo -e "${GREEN}✅${NC} Node.js is installed and accessible"
  ((PASSED++))
  echo "   Version: $(node --version)"
else
  echo -e "${RED}❌${NC} Node.js is NOT installed or not in PATH"
  ((FAILED++))
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  VERIFICATION SUMMARY                                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Passed:${NC} $PASSED"
echo -e "${RED}❌ Failed:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL CHECKS PASSED! System is ready to use.${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Test locally: npm run price:workflow"
  echo "2. Check GitHub Actions runs"
  echo "3. Monitor logs: tail -f logs/push-notifications.log"
  echo ""
  exit 0
else
  echo -e "${RED}⚠️  Some checks failed. Please review above.${NC}"
  echo ""
  echo "Common issues:"
  echo "- Files not in correct location (check path)"
  echo "- npm/node not installed (install Node.js 20+)"
  echo "- package.json not updated (re-run setup)"
  echo ""
  exit 1
fi
