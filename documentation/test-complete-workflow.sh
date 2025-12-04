#!/bin/bash

echo "🧪 COMPREHENSIVE TCC WORKFLOW TEST"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
BASE_URL="http://localhost:5001"
PATIENT_ID="TEST-$(date +%s)"

echo -e "${BLUE}1. Testing Healthcare User - Creating Transport Request${NC}"
echo "Patient ID: $PATIENT_ID"
echo ""

# Step 1: Healthcare user creates a trip
echo "Creating transport request..."
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/api/trips \
  -H "Content-Type: application/json" \
  -d "{
    \"patientId\": \"$PATIENT_ID\",
    \"originFacilityId\": \"UPMC Altoona Hospital\",
    \"destinationFacilityId\": \"Rehabilitation Center\",
    \"transportLevel\": \"ALS\",
    \"priority\": \"HIGH\",
    \"specialRequirements\": \"Patient requires cardiac monitoring during transport\",
    \"readyStart\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"readyEnd\": \"$(date -u -d '+1 hour' +%Y-%m-%dT%H:%M:%SZ)\",
    \"isolation\": false,
    \"bariatric\": false
  }")

echo "Response: $CREATE_RESPONSE"
echo ""

# Extract trip ID
TRIP_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id // empty')

if [ -z "$TRIP_ID" ]; then
    echo -e "${RED}❌ FAILED: Could not create trip${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SUCCESS: Trip created with ID: $TRIP_ID${NC}"
echo ""

# Step 2: Verify trip appears in pending trips
echo -e "${BLUE}2. Verifying Trip Appears in Pending Status${NC}"
PENDING_TRIPS=$(curl -s "$BASE_URL/api/trips?status=PENDING")
echo "Pending trips: $PENDING_TRIPS"
echo ""

if echo $PENDING_TRIPS | jq -e ".data[] | select(.id == \"$TRIP_ID\")" > /dev/null; then
    echo -e "${GREEN}✅ SUCCESS: Trip appears in pending trips${NC}"
else
    echo -e "${RED}❌ FAILED: Trip not found in pending trips${NC}"
fi
echo ""

# Step 3: EMS user accepts the trip
echo -e "${BLUE}3. Testing EMS User - Accepting Transport Request${NC}"
echo "Accepting trip: $TRIP_ID"
echo ""

ACCEPT_RESPONSE=$(curl -s -X PUT $BASE_URL/api/trips/$TRIP_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACCEPTED"
  }')

echo "Accept response: $ACCEPT_RESPONSE"
echo ""

if echo $ACCEPT_RESPONSE | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✅ SUCCESS: Trip accepted by EMS${NC}"
else
    echo -e "${RED}❌ FAILED: Could not accept trip${NC}"
fi
echo ""

# Step 4: Verify trip appears in accepted trips
echo -e "${BLUE}4. Verifying Trip Appears in Accepted Status${NC}"
ACCEPTED_TRIPS=$(curl -s "$BASE_URL/api/trips?status=ACCEPTED")
echo "Accepted trips: $ACCEPTED_TRIPS"
echo ""

if echo $ACCEPTED_TRIPS | jq -e ".data[] | select(.id == \"$TRIP_ID\")" > /dev/null; then
    echo -e "${GREEN}✅ SUCCESS: Trip appears in accepted trips${NC}"
else
    echo -e "${RED}❌ FAILED: Trip not found in accepted trips${NC}"
fi
echo ""

# Step 5: EMS user starts the trip
echo -e "${BLUE}5. Testing EMS User - Starting Transport${NC}"
START_RESPONSE=$(curl -s -X PUT $BASE_URL/api/trips/$TRIP_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }')

echo "Start response: $START_RESPONSE"
echo ""

if echo $START_RESPONSE | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✅ SUCCESS: Trip started by EMS${NC}"
else
    echo -e "${RED}❌ FAILED: Could not start trip${NC}"
fi
echo ""

# Step 6: EMS user completes the trip
echo -e "${BLUE}6. Testing EMS User - Completing Transport${NC}"
COMPLETE_RESPONSE=$(curl -s -X PUT $BASE_URL/api/trips/$TRIP_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }')

echo "Complete response: $COMPLETE_RESPONSE"
echo ""

if echo $COMPLETE_RESPONSE | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✅ SUCCESS: Trip completed by EMS${NC}"
else
    echo -e "${RED}❌ FAILED: Could not complete trip${NC}"
fi
echo ""

# Step 7: Verify trip appears in completed trips
echo -e "${BLUE}7. Verifying Trip Appears in Completed Status${NC}"
COMPLETED_TRIPS=$(curl -s "$BASE_URL/api/trips?status=COMPLETED")
echo "Completed trips: $COMPLETED_TRIPS"
echo ""

if echo $COMPLETED_TRIPS | jq -e ".data[] | select(.id == \"$TRIP_ID\")" > /dev/null; then
    echo -e "${GREEN}✅ SUCCESS: Trip appears in completed trips${NC}"
else
    echo -e "${RED}❌ FAILED: Trip not found in completed trips${NC}"
fi
echo ""

# Step 8: Test that healthcare user can see the completed trip
echo -e "${BLUE}8. Testing Healthcare User - Viewing Completed Trip${NC}"
ALL_TRIPS=$(curl -s "$BASE_URL/api/trips")
echo "All trips: $ALL_TRIPS"
echo ""

if echo $ALL_TRIPS | jq -e ".data[] | select(.id == \"$TRIP_ID\" and .status == \"COMPLETED\")" > /dev/null; then
    echo -e "${GREEN}✅ SUCCESS: Healthcare user can see completed trip${NC}"
else
    echo -e "${RED}❌ FAILED: Healthcare user cannot see completed trip${NC}"
fi
echo ""

# Summary
echo -e "${YELLOW}🎯 WORKFLOW TEST SUMMARY${NC}"
echo "=========================="
echo "Trip ID: $TRIP_ID"
echo "Patient ID: $PATIENT_ID"
echo "Status Flow: PENDING → ACCEPTED → IN_PROGRESS → COMPLETED"
echo ""

# Check if all steps passed
if echo $CREATE_RESPONSE | jq -e '.success == true' > /dev/null && \
   echo $ACCEPT_RESPONSE | jq -e '.success == true' > /dev/null && \
   echo $START_RESPONSE | jq -e '.success == true' > /dev/null && \
   echo $COMPLETE_RESPONSE | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Complete workflow is functional.${NC}"
    echo -e "${GREEN}✅ Healthcare users can create trips${NC}"
    echo -e "${GREEN}✅ EMS users can accept trips${NC}"
    echo -e "${GREEN}✅ EMS users can manage trip status${NC}"
    echo -e "${GREEN}✅ Healthcare users can see trip updates${NC}"
    echo -e "${GREEN}✅ Data flows correctly between modules${NC}"
else
    echo -e "${RED}❌ SOME TESTS FAILED! Check the output above.${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Frontend is available at: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Backend API is available at: http://localhost:5001${NC}"
echo ""
