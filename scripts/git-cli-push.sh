#!/bin/bash
set -e

TOKEN="${GITHUB_TOKEN:-$REPLIT_AUTOSYNC}"
if [ -z "$TOKEN" ]; then
    echo "ERROR: Set GITHUB_TOKEN in Replit Secrets"
    exit 1
fi

REPO="erickotieno3/hyrisecrown"
BRANCH="main"

# Use inline git config to avoid modifying .git/config (which is locked)
# Set user info and remote URL as command-line options
GIT_CMD="git -c user.name='Erick Otieno' -c user.email='erickotienokjv@gmail.com' -c remote.origin.url=https://erickotieno3:${TOKEN}@github.com/${REPO}.git"

echo "=== Adding files ==="
$GIT_CMD add -A

echo "=== Committing ==="
$GIT_CMD commit -m "Push from Replit: $(date '+%Y-%m-%d %H:%M')" || echo "(nothing new)"

echo "=== Pushing ==="
$GIT_CMD push origin "HEAD:${BRANCH}" --force

echo "✅ Done: https://github.com/${REPO}"
