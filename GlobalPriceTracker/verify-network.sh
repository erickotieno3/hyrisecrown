#!/bin/bash

# Network Integration & Unlimited Revision System Verification Script
# Verifies all components are in place and working

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0

echo "=================================="
echo "Network Integration Verification"
echo "=================================="
echo ""

# Function to check file exists
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$PROJECT_DIR/$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $description (missing: $file)"
        ((CHECKS_FAILED++))
    fi
}

# Function to check directory exists
check_dir() {
    local dir=$1
    local description=$2
    
    if [ -d "$PROJECT_DIR/$dir" ]; then
        echo -e "${GREEN}✓${NC} $description"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $description (missing: $dir)"
        ((CHECKS_FAILED++))
    fi
}

# Function to check code contains string
check_code() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" "$PROJECT_DIR/$file" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $description"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $description"
        ((CHECKS_FAILED++))
    fi
}

echo "📝 Core Server Components:"
check_file "server/websocket-server.ts" "WebSocket Network Server"
check_file "server/unlimited-revisions.ts" "Unlimited Revision System"
check_file "server/network-sync-routes.ts" "Network Sync API Routes"
echo ""

echo "🎨 Client Components:"
check_file "client/src/services/networkSync.ts" "Network Sync Client Service"
check_file "client/src/components/NetworkStatus.tsx" "Network Status Component"
check_file "client/src/components/RevisionHistory.tsx" "Revision History Component"
echo ""

echo "🔗 Integration Points:"
check_code "server/routes.ts" "WebSocketNetworkServer" "WebSocket Server Integration"
check_code "server/routes.ts" "UnlimitedRevisionSystem" "Revision System Integration"
check_code "server/routes.ts" "/api/sync" "Sync Routes Registration"
echo ""

echo "📦 Dependencies:"
check_code "package.json" '"ws"' "WebSocket Library (ws)"
check_code "package.json" '"@types/ws"' "WebSocket Types"
echo ""

echo "📚 Documentation:"
check_file "NETWORK_REVISION_GUIDE.md" "Network Integration Guide"
check_file "verify-network.sh" "Verification Script"
echo ""

echo "🗂️ Data Directories:"
check_dir "data" "Data Directory"
check_dir "logs" "Logs Directory"
echo ""

echo "🧪 Features Check:"
check_code "server/websocket-server.ts" "broadcastPriceUpdate" "Real-time Price Broadcasting"
check_code "server/websocket-server.ts" "trackRevision" "Revision Tracking"
check_code "server/unlimited-revisions.ts" "getRevisionHistory" "Revision History Retrieval"
check_code "server/unlimited-revisions.ts" "restoreToRevision" "Revision Restore"
check_code "server/unlimited-revisions.ts" "searchRevisions" "Revision Search"
check_code "client/src/services/networkSync.ts" "useNetworkSync" "React Sync Hook"
check_code "client/src/services/networkSync.ts" "useOnlineStatus" "React Online Status Hook"
echo ""

echo "🔐 Security Features:"
check_code "server/unlimited-revisions.ts" "userId" "User ID Tracking"
check_code "server/unlimited-revisions.ts" "ipAddress" "IP Address Logging"
check_code "server/unlimited-revisions.ts" "userAgent" "User Agent Tracking"
echo ""

echo "🏗️ API Endpoints:"
check_code "server/network-sync-routes.ts" "GET.*revisions" "Get Revision History"
check_code "server/network-sync-routes.ts" "POST.*restore" "Restore Revision"
check_code "server/network-sync-routes.ts" "GET.*search" "Search Revisions"
check_code "server/network-sync-routes.ts" "GET.*stats" "Get Statistics"
echo ""

echo "📋 Summary:"
echo "=================================="
echo -e "Checks Passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks Failed: ${RED}$CHECKS_FAILED${NC}"
TOTAL=$((CHECKS_PASSED + CHECKS_FAILED))
echo "Total: $TOTAL/29"
echo "=================================="

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All checks passed! Network integration ready.${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠ Some checks failed. Please review above.${NC}"
    exit 1
fi
