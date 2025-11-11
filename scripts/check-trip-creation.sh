#!/bin/bash

# Trip Creation Smoke Test
# Verifies that the critical trip creation functionality is working
# Usage: ./scripts/check-trip-creation.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

HEALTH_URL="http://localhost:5001/health"
API_BASE="http://localhost:5001/api"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0

echo -e "${BLUE}=== Trip Creation Smoke Test ===${NC}"
echo "Time: $(date)"
echo

# Test 1: Backend Health
echo -e "${BLUE}Test 1: Backend Health${NC}"
health_response=$(curl -s -w "%{http_code}" -o /dev/null "$HEALTH_URL" 2>/dev/null || echo "000")
if [ "$health_response" = "200" ]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
    ((PASS_COUNT++))
else
    echo -e "${RED}❌ Backend health check failed (HTTP $health_response)${NC}"
    echo -e "${RED}CRITICAL: Cannot proceed with trip creation test${NC}"
    ((FAIL_COUNT++))
    echo
    echo -e "${YELLOW}=== Test Summary ===${NC}"
    echo -e "Passed: ${PASS_COUNT}"
    echo -e "Failed: ${FAIL_COUNT}"
    exit 1
fi

# Test 2: Database Connectivity
echo -e "${BLUE}Test 2: Database Connectivity${NC}"
db_status=$(curl -s "$HEALTH_URL" | grep -o '"databases":"[^"]*"' | cut -d'"' -f4)
if [ "$db_status" = "connected" ]; then
    echo -e "${GREEN}✅ Database is connected${NC}"
    ((PASS_COUNT++))
else
    echo -e "${RED}❌ Database connection failed: $db_status${NC}"
    ((FAIL_COUNT++))
fi

# Test 3: Trip Creation Endpoint Exists
echo -e "${BLUE}Test 3: Trip Creation Endpoint${NC}"
# Try to hit the endpoint without auth (should get 401, not 404)
trip_endpoint_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$API_BASE/trips/enhanced" 2>/dev/null || echo "000")
if [ "$trip_endpoint_response" = "401" ]; then
    echo -e "${GREEN}✅ Trip creation endpoint exists (requires auth)${NC}"
    ((PASS_COUNT++))
elif [ "$trip_endpoint_response" = "404" ]; then
    echo -e "${RED}❌ Trip creation endpoint not found${NC}"
    ((FAIL_COUNT++))
else
    echo -e "${YELLOW}⚠️  Unexpected response: HTTP $trip_endpoint_response${NC}"
fi

# Test 4: Backend File Integrity
echo -e "${BLUE}Test 4: Backend Source Files${NC}"
if [ -f "$PROJECT_ROOT/backend/src/routes/trips.ts" ] && [ -f "$PROJECT_ROOT/backend/src/services/tripService.ts" ]; then
    echo -e "${GREEN}✅ Trip-related source files exist${NC}"
    ((PASS_COUNT++))
else
    echo -e "${RED}❌ Critical trip files missing${NC}"
    ((FAIL_COUNT++))
fi

# Test 5: Prisma Client
echo -e "${BLUE}Test 5: Prisma Client${NC}"
if [ -f "$PROJECT_ROOT/backend/node_modules/@prisma/client/index.js" ]; then
    echo -e "${GREEN}✅ Prisma client is generated${NC}"
    ((PASS_COUNT++))
else
    echo -e "${RED}❌ Prisma client not found - run 'npx prisma generate'${NC}"
    ((FAIL_COUNT++))
fi

echo
echo -e "${BLUE}=== Test Summary ===${NC}"
echo -e "Passed: ${GREEN}${PASS_COUNT}${NC}"
echo -e "Failed: ${RED}${FAIL_COUNT}${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo
    echo -e "${GREEN}✅ All smoke tests passed! Trip creation should work.${NC}"
    exit 0
else
    echo
    echo -e "${RED}❌ Some smoke tests failed! Trip creation may not work.${NC}"
    exit 1
fi




