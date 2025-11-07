#!/bin/bash

# Quick Backend Health Check Script
# Usage: ./check-backend-health.sh

HEALTH_URL="http://localhost:5001/health"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== TCC Backend Health Check ===${NC}"
echo "Checking: $HEALTH_URL"
echo "Time: $(date)"
echo

# Check if backend is responding
response=$(curl -s -w "%{http_code}" -o /dev/null "$HEALTH_URL" 2>/dev/null || echo "000")

if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Backend is healthy (HTTP $response)${NC}"
    
    # Get detailed status
    echo -e "\n${BLUE}Detailed Status:${NC}"
    curl -s "$HEALTH_URL" | jq . 2>/dev/null || curl -s "$HEALTH_URL"
    
    # Check if units API is working
    echo -e "\n${BLUE}Testing Units API:${NC}"
    units_response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:5001/api/units" 2>/dev/null || echo "000")
    
    if [ "$units_response" = "401" ] || [ "$units_response" = "200" ]; then
        echo -e "${GREEN}✅ Units API is responding (HTTP $units_response)${NC}"
    else
        echo -e "${YELLOW}⚠️  Units API returned HTTP $units_response${NC}"
    fi
    
else
    echo -e "${RED}❌ Backend is not responding (HTTP $response)${NC}"
    
    # Check if process is running
    if pgrep -f "node dist/index.js" > /dev/null; then
        echo -e "${YELLOW}⚠️  Backend process is running but not responding${NC}"
    else
        echo -e "${RED}❌ Backend process is not running${NC}"
    fi
fi

echo
echo -e "${BLUE}=== End Health Check ===${NC}"
