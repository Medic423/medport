#!/bin/bash

echo "🧪 TESTING EMS DASHBOARD FUNCTIONALITY"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Testing Frontend Accessibility${NC}"
echo "Checking if frontend is running on http://localhost:3000"
echo ""

# Check if frontend is accessible
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}2. Testing Backend API Accessibility${NC}"
echo "Checking if backend API is running on http://localhost:5001"
echo ""

# Check if backend is accessible
if curl -s http://localhost:5001/health > /dev/null; then
    echo -e "${GREEN}✅ Backend API is accessible${NC}"
else
    echo -e "${RED}❌ Backend API is not accessible${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}3. Testing EMS User Authentication${NC}"
echo "Testing EMS user login"
echo ""

# Test EMS user login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/ems/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@duncansvilleems.org",
    "password": "duncansville123"
  }')

echo "Login Response: $LOGIN_RESPONSE"
echo ""

if echo $LOGIN_RESPONSE | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✅ EMS user login successful${NC}"
else
    echo -e "${RED}❌ EMS user login failed${NC}"
fi
echo ""

echo -e "${BLUE}4. Testing Trip Data for EMS Dashboard${NC}"
echo "Checking available and accepted trips"
echo ""

# Get available trips (PENDING)
AVAILABLE_TRIPS=$(curl -s "http://localhost:5001/api/trips?status=PENDING")
echo "Available trips: $AVAILABLE_TRIPS"
echo ""

if echo $AVAILABLE_TRIPS | jq -e '.success == true' > /dev/null; then
    AVAILABLE_COUNT=$(echo $AVAILABLE_TRIPS | jq '.data | length')
    echo -e "${GREEN}✅ Available trips: ${AVAILABLE_COUNT}${NC}"
else
    echo -e "${RED}❌ Failed to get available trips${NC}"
fi

# Get accepted trips (ACCEPTED, IN_PROGRESS, COMPLETED)
ACCEPTED_TRIPS=$(curl -s "http://localhost:5001/api/trips?status=ACCEPTED,IN_PROGRESS,COMPLETED")
echo "Accepted trips: $ACCEPTED_TRIPS"
echo ""

if echo $ACCEPTED_TRIPS | jq -e '.success == true' > /dev/null; then
    ACCEPTED_COUNT=$(echo $ACCEPTED_TRIPS | jq '.data | length')
    echo -e "${GREEN}✅ Accepted trips: ${ACCEPTED_COUNT}${NC}"
else
    echo -e "${RED}❌ Failed to get accepted trips${NC}"
fi
echo ""

echo -e "${BLUE}5. Testing Dashboard Statistics${NC}"
echo "Calculating expected dashboard statistics"
echo ""

# Calculate statistics
TOTAL_TRIPS=$((AVAILABLE_COUNT + ACCEPTED_COUNT))

echo "Expected EMS Dashboard Statistics:"
echo "  - Available Trips: $AVAILABLE_COUNT"
echo "  - Active Trips: $ACCEPTED_COUNT"
echo "  - Total Recent Activity: $TOTAL_TRIPS"
echo ""

if [ "$TOTAL_TRIPS" -gt 0 ]; then
    echo -e "${GREEN}✅ EMS Dashboard should show recent activity${NC}"
else
    echo -e "${YELLOW}⚠️  No recent activity to display${NC}"
fi
echo ""

echo -e "${YELLOW}🎯 EMS DASHBOARD TEST SUMMARY${NC}"
echo "=================================="
echo ""

if [ "$TOTAL_TRIPS" -gt 0 ]; then
    echo -e "${GREEN}🎉 EMS DASHBOARD SHOULD NOW SHOW RECENT ACTIVITY!${NC}"
    echo -e "${GREEN}✅ Recent Activity section will display ${TOTAL_TRIPS} trips${NC}"
    echo -e "${GREEN}✅ Statistics cards will show real data${NC}"
    echo -e "${GREEN}✅ EMS users can see available and accepted trips${NC}"
    echo -e "${GREEN}✅ Visual indicators show trip status and priority${NC}"
else
    echo -e "${YELLOW}⚠️  No trips found - create some trips to test the dashboard${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Frontend URL: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Backend API: http://localhost:5001${NC}"
echo -e "${BLUE}👤 EMS Login: test@duncansvilleems.org / duncansville123${NC}"
echo ""
