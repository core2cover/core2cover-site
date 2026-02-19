#!/bin/bash

# Script to push to upstream demo branch
# Usage: ./push-to-demo.sh [branch-name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Push to Upstream Demo Branch${NC}"
echo "========================================"

# Get the branch to push (default to current branch)
BRANCH_TO_PUSH=${1:-$(git branch --show-current)}

echo -e "Branch to push: ${GREEN}${BRANCH_TO_PUSH}${NC}"

# Check if upstream remote exists
if ! git remote | grep -q "^upstream$"; then
    echo -e "${YELLOW}Adding upstream remote...${NC}"
    git remote add upstream https://github.com/core2cover/core2cover-site.git
fi

# Show current remotes
echo -e "\n${YELLOW}Current remotes:${NC}"
git remote -v

# Confirm before pushing
echo -e "\n${YELLOW}This will push '${BRANCH_TO_PUSH}' to 'upstream/demo'${NC}"
read -p "Are you sure you want to continue? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted${NC}"
    exit 1
fi

# Fetch upstream to check status
echo -e "\n${YELLOW}Fetching upstream...${NC}"
git fetch upstream

# Push to upstream demo branch
echo -e "\n${YELLOW}Pushing to upstream demo branch...${NC}"
if git push upstream ${BRANCH_TO_PUSH}:demo; then
    echo -e "\n${GREEN}✅ Successfully pushed to https://github.com/core2cover/core2cover-site/tree/demo${NC}"
else
    echo -e "\n${RED}❌ Failed to push. You may need to:"
    echo "  1. Check your GitHub credentials"
    echo "  2. Ensure you have write access to the upstream repository"
    echo "  3. Try using SSH instead of HTTPS (git remote set-url upstream git@github.com:core2cover/core2cover-site.git)"
    echo -e "${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Note: If you're seeing authentication issues, you can:"
echo "  - Use SSH: git remote set-url upstream git@github.com:core2cover/core2cover-site.git"
echo "  - Use a GitHub Personal Access Token"
echo -e "${NC}"
