#!/bin/bash
set -e

# Git CLI push script - run this in the Replit shell
# This bypasses the API rate limits by using git directly

echo "=== Git Push Setup ==="

# Set GitHub token from environment
TOKEN="${GITHUB_TOKEN:-$REPLIT_AUTOSYNC}"
if [ -z "$TOKEN" ]; then
    echo "ERROR: No GitHub token found. Set GITHUB_TOKEN in Replit Secrets first."
    exit 1
fi

REPO="erickotieno3/hyrisecrown"
BRANCH="main"

echo "Target repo: $REPO"
echo "Branch: $BRANCH"

# Update origin remote to correct repo with token
git remote remove origin 2>/dev/null || true
git remote add origin "https://erickotieno3:${TOKEN}@github.com/${REPO}.git"

echo ""
echo "=== Adding all files ==="
git add -A

echo ""
echo "=== Committing ==="
git commit -m "Auto push from Replit: $(date '+%Y-%m-%d %H:%M')" || echo "Nothing new to commit"

echo ""
echo "=== Pushing to GitHub ==="
git push origin "HEAD:${BRANCH}" --force

echo ""
echo "=== DONE ==="
echo "All files pushed to https://github.com/${REPO}"
