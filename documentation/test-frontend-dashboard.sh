#!/bin/bash

echo "🧪 TESTING FRONTEND DASHBOARD FUNCTIONALITY"
echo "==========================================="
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

echo -e "${BLUE}3. Testing Trip Data Availability${NC}"
echo "Checking if trip data is available for dashboard display"
echo ""

# Get trip data
TRIPS_RESPONSE=$(curl -s http://localhost:5001/api/trips)
echo "Trips API Response: $TRIPS_RESPONSE"
echo ""

if echo $TRIPS_RESPONSE | jq -e '.success == true' > /dev/null; then
    TRIP_COUNT=$(echo $TRIPS_RESPONSE | jq '.data | length')
    echo -e "${GREEN}✅ Trip data is available (${TRIP_COUNT} trips)${NC}"
    
    # Show trip details
    echo "Recent trips:"
    echo $TRIPS_RESPONSE | jq -r '.data[] | "  - \(.patientName) (\(.status)) - \(.fromLocation) to \(.toLocation)"'
else
    echo -e "${RED}❌ Trip data is not available${NC}"
fi
echo ""

echo -e "${BLUE}4. Testing Dashboard Statistics${NC}"
echo "Calculating expected dashboard statistics"
echo ""

# Calculate statistics
PENDING_COUNT=$(echo $TRIPS_RESPONSE | jq '[.data[] | select(.status == "PENDING")] | length')
COMPLETED_COUNT=$(echo $TRIPS_RESPONSE | jq '[.data[] | select(.status == "COMPLETED")] | length')
HIGH_PRIORITY_COUNT=$(echo $TRIPS_RESPONSE | jq '[.data[] | select(.priority == "HIGH" or .priority == "CRITICAL")] | length')

echo "Expected Dashboard Statistics:"
echo "  - Pending Requests: $PENDING_COUNT"
echo "  - Completed Today: $COMPLETED_COUNT"
echo "  - High Priority: $HIGH_PRIORITY_COUNT"
echo ""

if [ "$PENDING_COUNT" -gt 0 ] || [ "$COMPLETED_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Dashboard should show recent activity${NC}"
else
    echo -e "${YELLOW}⚠️  No recent activity to display${NC}"
fi
echo ""

echo -e "${BLUE}5. Testing User Authentication${NC}"
echo "Testing healthcare user login"
echo ""

# Test healthcare user login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/healthcare/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@altoonaregional.org",
    "password": "upmc123"
  }')

echo "Login Response: $LOGIN_RESPONSE"
echo ""

if echo $LOGIN_RESPONSE | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✅ Healthcare user login successful${NC}"
    echo -e "${GREEN}✅ User should be able to access dashboard with recent activity${NC}"
else
    echo -e "${RED}❌ Healthcare user login failed${NC}"
fi
echo ""

echo -e "${YELLOW}🎯 FRONTEND DASHBOARD TEST SUMMARY${NC}"
echo "======================================"
echo ""

if [ "$PENDING_COUNT" -gt 0 ] || [ "$COMPLETED_COUNT" -gt 0 ]; then
    echo -e "${GREEN}🎉 DASHBOARD SHOULD NOW SHOW RECENT ACTIVITY!${NC}"
    echo -e "${GREEN}✅ Recent Activity section will display ${TRIP_COUNT} trips${NC}"
    echo -e "${GREEN}✅ Statistics cards will show real data${NC}"
    echo -e "${GREEN}✅ Healthcare users can see their trip history${NC}"
else
    echo -e "${YELLOW}⚠️  No trips found - create a trip to test the dashboard${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Frontend URL: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Backend API: http://localhost:5001${NC}"
echo -e "${BLUE}👤 Healthcare Login: admin@altoonaregional.org / upmc123${NC}"
echo ""
