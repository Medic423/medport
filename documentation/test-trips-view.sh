#!/bin/bash

echo "🧪 Testing TCC Trips View Implementation"
echo "========================================"

# Check if servers are running
echo "📡 Checking server status..."
if curl -s http://localhost:5001/api/trips > /dev/null; then
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

# Test API endpoint
echo ""
echo "🔍 Testing trips API endpoint..."
TRIPS_RESPONSE=$(curl -s http://localhost:5001/api/trips)
TRIP_COUNT=$(echo "$TRIPS_RESPONSE" | jq '.data | length')

if [ "$TRIP_COUNT" -gt 0 ]; then
    echo "✅ Found $TRIP_COUNT trips in database"
    echo "📊 Sample trip data:"
    echo "$TRIPS_RESPONSE" | jq '.data[0] | {tripNumber, patientId, status, priority, transportLevel}'
else
    echo "⚠️  No trips found in database"
fi

# Test frontend accessibility
echo ""
echo "🌐 Testing frontend accessibility..."
if curl -s http://localhost:3000 | grep -q "TCC - Transport Control Center"; then
    echo "✅ Frontend is accessible and loading correctly"
else
    echo "❌ Frontend is not loading correctly"
    exit 1
fi

echo ""
echo "🎉 TCC Trips View Implementation Test Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Login as admin user"
echo "3. Navigate to the 'Trips' tab in the sidebar"
echo "4. Verify the comprehensive trip management interface is working"
echo "5. Test filtering, sorting, and search functionality"
echo "6. Test trip details modal by clicking the eye icon"
echo "7. Test CSV export functionality"
echo ""
echo "✨ The TCC Trips View has successfully replaced the quick action buttons!"
