#!/bin/bash

# Fix Vercel Deployment - Comprehensive Solution
# This script helps diagnose and fix the Vercel deployment caching issue

set -e

echo "🔍 TCC Vercel Deployment Fix Script"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check if Vercel CLI is installed
echo -e "${BLUE}Step 1: Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
else
    echo -e "${GREEN}✅ Vercel CLI is installed${NC}"
    vercel --version
fi
echo ""

# Step 2: Show current deployment status
echo -e "${BLUE}Step 2: Checking current frontend deployment...${NC}"
cd /Users/scooper/Code/tcc-new-project/frontend
echo "Current directory: $(pwd)"
echo ""

# Step 3: List recent deployments
echo -e "${BLUE}Step 3: Listing recent deployments...${NC}"
echo "Run this command to see your deployments:"
echo -e "${YELLOW}vercel ls${NC}"
echo ""

# Step 4: Show which project is linked
echo -e "${BLUE}Step 4: Checking project linking...${NC}"
if [ -f ".vercel/project.json" ]; then
    echo -e "${GREEN}✅ Project is linked${NC}"
    cat .vercel/project.json
else
    echo -e "${RED}❌ Project is not linked${NC}"
    echo "You need to link this directory to your Vercel project"
fi
echo ""

# Step 5: Check current build
echo -e "${BLUE}Step 5: Checking current build output...${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Dist folder exists${NC}"
    echo "Latest files in dist:"
    ls -lht dist/assets/ | head -n 5
else
    echo -e "${YELLOW}⚠️  No dist folder found${NC}"
fi
echo ""

# Step 6: Verify API configuration in built files
echo -e "${BLUE}Step 6: Checking API configuration in built files...${NC}"
if [ -d "dist" ]; then
    echo "Searching for backend URL in built JS files..."
    if grep -r "backend-omqtq4bj7" dist/ 2>/dev/null | head -n 3; then
        echo -e "${GREEN}✅ New backend URL found in built files${NC}"
    elif grep -r "backend-7gq6yna1p" dist/ 2>/dev/null | head -n 3; then
        echo -e "${RED}❌ OLD backend URL found in built files!${NC}"
        echo "This means the dist folder contains old code"
    else
        echo -e "${YELLOW}⚠️  Could not find backend URLs (files may be minified)${NC}"
    fi
fi
echo ""

# Step 7: Clean and rebuild
echo -e "${BLUE}Step 7: Instructions to clean and rebuild...${NC}"
echo ""
echo "To fix the deployment, follow these steps:"
echo ""
echo -e "${YELLOW}1. Clean the build:${NC}"
echo "   cd /Users/scooper/Code/tcc-new-project/frontend"
echo "   rm -rf dist node_modules/.vite"
echo ""
echo -e "${YELLOW}2. Rebuild:${NC}"
echo "   npm run build"
echo ""
echo -e "${YELLOW}3. Verify the build contains new backend URL:${NC}"
echo "   grep -r 'backend-omqtq4bj7' dist/"
echo ""
echo -e "${YELLOW}4. Deploy to Vercel (PRODUCTION):${NC}"
echo "   vercel --prod"
echo ""
echo -e "${YELLOW}5. Check which domains are assigned:${NC}"
echo "   vercel domains ls"
echo ""
echo -e "${YELLOW}6. If traccems.com is not pointing to latest deployment:${NC}"
echo "   - Go to https://vercel.com/chuck-ferrells-projects/frontend/settings/domains"
echo "   - Verify traccems.com is pointing to the correct deployment"
echo "   - Or reassign the domain to the latest deployment"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# Step 8: Automatic deployment option
echo -e "${BLUE}Step 8: Automatic Deployment (OPTIONAL)${NC}"
echo ""
read -p "Do you want to automatically clean, rebuild, and deploy? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Starting automatic deployment...${NC}"
    
    # Clean
    echo -e "${BLUE}Cleaning build artifacts...${NC}"
    rm -rf dist node_modules/.vite
    
    # Rebuild
    echo -e "${BLUE}Building frontend...${NC}"
    npm run build
    
    # Verify
    echo -e "${BLUE}Verifying build...${NC}"
    if grep -r "backend-omqtq4bj7" dist/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Build verified - contains new backend URL${NC}"
        
        # Deploy
        echo -e "${BLUE}Deploying to Vercel (PRODUCTION)...${NC}"
        echo -e "${YELLOW}This will deploy to production. Press Ctrl+C to cancel.${NC}"
        sleep 3
        vercel --prod
        
        echo ""
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo "1. Wait 2-3 minutes for CDN propagation"
        echo "2. Visit https://traccems.com in incognito mode"
        echo "3. Open browser console and look for:"
        echo "   - 'TCC_DEBUG: API_BASE_URL is set to: https://backend-omqtq4bj7-chuck-ferrells-projects.vercel.app'"
        echo "4. Check XHR requests to verify they're using the new backend URL"
        echo ""
    else
        echo -e "${RED}❌ Build verification failed - old backend URL still present${NC}"
        echo "Please check frontend/src/services/api.ts"
        exit 1
    fi
else
    echo "Skipping automatic deployment. Follow manual steps above."
fi

echo ""
echo -e "${GREEN}Script complete!${NC}"

