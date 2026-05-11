#!/bin/bash

# Global Price Comparison - Complete Auto-Automation Setup
# This script sets up all automation systems

set -e

echo "🚀 Setting up Global Price Comparison Auto-Automation..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Run this script from project root.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found package.json${NC}"
echo ""

# Create required directories
echo "📁 Creating required directories..."
mkdir -p data logs public/blog

echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Check for ANTHROPIC_API_KEY
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  ANTHROPIC_API_KEY not set${NC}"
    echo "   To use auto-blog generation, set:"
    echo "   export ANTHROPIC_API_KEY=sk-ant-..."
    echo ""
else
    echo -e "${GREEN}✅ ANTHROPIC_API_KEY configured${NC}"
    echo ""
fi

# Configure git (if not already configured)
if ! git config user.email > /dev/null; then
    echo -e "${YELLOW}⚠️  Git not configured${NC}"
    read -p "Enter your git email: " git_email
    read -p "Enter your git name: " git_name
    git config --global user.email "$git_email"
    git config --global user.name "$git_name"
    echo -e "${GREEN}✅ Git configured${NC}"
    echo ""
fi

# Show available commands
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📝 Available automation commands:"
echo ""
echo "  npm run auto:blog       - Generate blog posts"
echo "  npm run auto:prices     - Update prices and stock"
echo "  npm run auto:commit     - Commit and push changes"
echo "  npm run auto:all        - Run all automations"
echo "  npm run auto:deploy     - Deploy to Google Play"
echo ""

echo "📋 GitHub Actions workflows:"
echo ""
echo "  auto-update.yml         - Daily: Blog + Prices + Commit (2:00 UTC)"
echo "  google-play-deploy.yml  - On push: Build & deploy Android app"
echo ""

echo "📚 For detailed setup instructions, see:"
echo "   - AUTO_AUTOMATION_GUIDE.md"
echo "   - OAUTH_IMPLEMENTATION.md"
echo "   - GOOGLE_PLAY_QUICKSTART.md"
echo ""

echo "🔑 Required GitHub Secrets:"
echo ""
echo "  ANTHROPIC_API_KEY"
echo "  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON"
echo "  EAS_USERNAME"
echo "  EAS_PASSWORD"
echo "  (Optional) SLACK_WEBHOOK"
echo ""

echo "🎉 All done! Start automating with 'npm run auto:all'"
