#!/bin/bash

echo "🧪 Testing End-to-End Trip Data Flow"
echo "===================================="

# Configuration
API_BASE="http://localhost:5001"
EMS_EMAIL="fferguson@movalleyems.com"
EMS_PASSWORD="movalley123"

# Authenticate as EMS to obtain token and user id
echo "🔐 Authenticating EMS user..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/ems/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMS_EMAIL\",\"password\":\"$EMS_PASSWORD\"}")

LOGIN_SUCCESS=$(echo "$LOGIN_RESPONSE" | jq -r '.success // false')
if [ "$LOGIN_SUCCESS" != "true" ]; then
  echo "❌ EMS login failed"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // .data.token')
EMS_USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id // .data.user.id')
AUTH_HEADER="Authorization: Bearer $TOKEN"
echo "✅ EMS login succeeded; user: $EMS_USER_ID"

# Check if servers are running
echo "📡 Checking server status..."
if curl -s -H "$AUTH_HEADER" "$API_BASE/api/trips" > /dev/null; then
    echo "✅ Backend server is running on port 5001"
else
    echo "❌ Backend server is not running on port 5001"
    exit 1
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend server is running on port 3000"
else
    echo "❌ Frontend server is not running on port 3000"
    exit 1
fi

# Test 1: Check current trips in database
echo ""
echo "🔍 Test 1: Current trips in database"
TRIPS_COUNT=$(curl -s -H "$AUTH_HEADER" "$API_BASE/api/trips" | jq '.data | length')
echo "Found $TRIPS_COUNT trips in database"

if [ "$TRIPS_COUNT" -gt 0 ]; then
    echo "📊 Sample trip data:"
    curl -s -H "$AUTH_HEADER" "$API_BASE/api/trips" | jq '.data[0] | {tripNumber, patientId, status, fromLocation, toLocation, createdAt}'
else
    echo "⚠️  No trips found in database"
fi

# Test 2: Check PENDING trips (for EMS Dashboard)
echo ""
echo "🔍 Test 2: PENDING trips (for EMS Dashboard)"
PENDING_COUNT=$(curl -s -H "$AUTH_HEADER" "$API_BASE/api/trips?status=PENDING" | jq '.data | length')
echo "Found $PENDING_COUNT PENDING trips"

if [ "$PENDING_COUNT" -gt 0 ]; then
    echo "📊 Sample PENDING trip:"
    curl -s -H "$AUTH_HEADER" "$API_BASE/api/trips?status=PENDING" | jq '.data[0] | {tripNumber, patientId, status, fromLocation, toLocation}'
else
    echo "⚠️  No PENDING trips found"
fi

# Test 3: Check ACCEPTED/IN_PROGRESS/COMPLETED trips (for EMS Dashboard)
echo ""
echo "🔍 Test 3: ACCEPTED/IN_PROGRESS/COMPLETED trips (for EMS Dashboard)"
ACCEPTED_COUNT=$(curl -s -H "$AUTH_HEADER" "$API_BASE/api/trips?status=ACCEPTED,IN_PROGRESS,COMPLETED" | jq '.data | length')
echo "Found $ACCEPTED_COUNT ACCEPTED/IN_PROGRESS/COMPLETED trips"

# Test 4: Create a new test trip
echo ""
echo "🔍 Test 4: Creating a new test trip"
NEW_TRIP_DATA='{
  "patientId": "TEST-E2E-001",
  "patientWeight": "180",
  "specialNeeds": "Test end-to-end flow",
  "fromLocation": "UPMC Altoona",
  "toLocation": "General Hospital",
  "scheduledTime": "2025-09-09T15:00:00.000Z",
  "transportLevel": "BLS",
  "urgencyLevel": "Routine",
  "diagnosis": "General Medical",
  "mobilityLevel": "Ambulatory",
  "oxygenRequired": false,
  "monitoringRequired": false,
  "generateQRCode": false,
  "selectedAgencies": [],
  "notificationRadius": 100,
  "notes": "End-to-end test trip",
  "priority": "LOW"
}'

echo "Creating new trip..."
NEW_TRIP_RESPONSE=$(curl -s -X POST "$API_BASE/api/trips/enhanced" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "$NEW_TRIP_DATA")

echo "Response: $NEW_TRIP_RESPONSE"

# Check if trip was created successfully
if echo "$NEW_TRIP_RESPONSE" | jq -e '.success' > /dev/null; then
    echo "✅ New trip created successfully"
    NEW_TRIP_ID=$(echo "$NEW_TRIP_RESPONSE" | jq -r '.data.id')
    echo "New trip ID: $NEW_TRIP_ID"
    
    # Wait a moment for database sync
    sleep 2
    
    # Test 5: Verify trip appears in TCC Trips View
    echo ""
    echo "🔍 Test 5: Verify trip appears in TCC Trips View"
    UPDATED_TRIPS_COUNT=$(curl -s -H "$AUTH_HEADER" "$API_BASE/api/trips" | jq '.data | length')
    echo "Total trips after creation: $UPDATED_TRIPS_COUNT"
    
    if [ "$UPDATED_TRIPS_COUNT" -gt "$TRIPS_COUNT" ]; then
        echo "✅ Trip appears in TCC Trips View"
    else
        echo "❌ Trip does not appear in TCC Trips View"
    fi
    
    # Test 6: Verify trip appears in EMS Dashboard (PENDING status)
    echo ""
    echo "🔍 Test 6: Verify trip appears in EMS Dashboard (PENDING status)"
    UPDATED_PENDING_COUNT=$(curl -s -H "$AUTH_HEADER" "$API_BASE/api/trips?status=PENDING" | jq '.data | length')
    echo "PENDING trips after creation: $UPDATED_PENDING_COUNT"
    
    if [ "$UPDATED_PENDING_COUNT" -gt "$PENDING_COUNT" ]; then
        echo "✅ Trip appears in EMS Dashboard as PENDING"
    else
        echo "❌ Trip does not appear in EMS Dashboard as PENDING"
    fi
    
    # Test 7: Test trip status update (Accept trip)
    echo ""
    echo "🔍 Test 7: Test trip status update (Accept trip)"
    ACCEPT_RESPONSE=$(curl -s -X PUT "$API_BASE/api/trips/$NEW_TRIP_ID/status" \
      -H "Content-Type: application/json" \
      -H "$AUTH_HEADER" \
      -d '{
        "status": "ACCEPTED",
        "assignedAgencyId": "'$EMS_USER_ID'"
      }')
    
    echo "Accept response: $ACCEPT_RESPONSE"
    
    if echo "$ACCEPT_RESPONSE" | jq -e '.success' > /dev/null; then
        echo "✅ Trip status updated to ACCEPTED successfully"
        
        # Wait a moment for database sync
        sleep 2
        
        # Test 8: Verify trip appears in EMS Dashboard as ACCEPTED
        echo ""
        echo "🔍 Test 8: Verify trip appears in EMS Dashboard as ACCEPTED"
        UPDATED_ACCEPTED_COUNT=$(curl -s -H "$AUTH_HEADER" "$API_BASE/api/trips?status=ACCEPTED,IN_PROGRESS,COMPLETED" | jq '.data | length')
        echo "ACCEPTED/IN_PROGRESS/COMPLETED trips after acceptance: $UPDATED_ACCEPTED_COUNT"
        
        if [ "$UPDATED_ACCEPTED_COUNT" -gt "$ACCEPTED_COUNT" ]; then
            echo "✅ Trip appears in EMS Dashboard as ACCEPTED"
        else
            echo "❌ Trip does not appear in EMS Dashboard as ACCEPTED"
        fi
    else
        echo "❌ Failed to update trip status to ACCEPTED"
    fi
    
else
    echo "❌ Failed to create new trip"
    echo "Error: $NEW_TRIP_RESPONSE"
fi

echo ""
echo "🎉 End-to-End Trip Data Flow Test Complete!"
echo ""
echo "📋 Summary:"
echo "- Total trips in database: $TRIPS_COUNT"
echo "- PENDING trips: $PENDING_COUNT"
echo "- ACCEPTED/IN_PROGRESS/COMPLETED trips: $ACCEPTED_COUNT"
echo ""
echo "🌐 Next Steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Login as admin user"
echo "3. Navigate to the 'Trips' tab to see the TCC Trips View"
echo "4. Login as EMS user (fferguson@movalleyems.com / password123)"
echo "5. Check the 'Available Trips' tab to see PENDING trips"
echo "6. Test accepting a trip and verify it appears in 'My Trips'"
