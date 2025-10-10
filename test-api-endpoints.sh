#!/bin/bash

# TCC API Endpoint Testing Script
# Tests all major API endpoints for proper responses and data

set -e

BASE_URL="http://localhost:5001"
ADMIN_EMAIL="admin@tcc.com"
ADMIN_PASSWORD="admin123"

echo "🧪 TCC API Endpoint Testing Suite"
echo "=================================="
echo "Base URL: $BASE_URL"
echo ""

# Function to get auth token
get_auth_token() {
    local response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
    
    local token=$(echo "$response" | jq -r '.token')
    if [ "$token" = "null" ] || [ -z "$token" ]; then
        echo "❌ Failed to get auth token"
        echo "Response: $response"
        exit 1
    fi
    echo "$token"
}

# Function to test endpoint
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local token="$3"
    local data="$4"
    local expected_status="$5"
    
    echo "Testing $method $endpoint..."
    
    local curl_cmd="curl -s -w '%{http_code}' -o /tmp/api_response.json"
    
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        curl_cmd="$curl_cmd -X $method -H 'Content-Type: application/json'"
        if [ -n "$data" ]; then
            curl_cmd="$curl_cmd -d '$data'"
        fi
    else
        curl_cmd="$curl_cmd -X $method"
    fi
    
    if [ -n "$token" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $token'"
    fi
    
    curl_cmd="$curl_cmd '$BASE_URL$endpoint'"
    
    local status_code=$(eval $curl_cmd)
    local response=$(cat /tmp/api_response.json)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo "✅ $method $endpoint - Status: $status_code"
        echo "   Response: $(echo "$response" | jq -r '.success // .message // "OK"' 2>/dev/null || echo "OK")"
    else
        echo "❌ $method $endpoint - Expected: $expected_status, Got: $status_code"
        echo "   Response: $response"
    fi
    echo ""
}

# Get auth token
echo "🔐 Getting authentication token..."
TOKEN=$(get_auth_token)
echo "✅ Token obtained: ${TOKEN:0:20}..."
echo ""

# Test Authentication endpoints
echo "🔐 AUTHENTICATION ENDPOINTS"
echo "============================"
test_endpoint "POST" "/api/auth/login" "" '{"email":"admin@tcc.com","password":"admin123"}' "200"
test_endpoint "GET" "/api/auth/verify" "$TOKEN" "" "200"
echo ""

# Test Health endpoint
echo "🏥 HEALTH CHECK"
echo "==============="
test_endpoint "GET" "/health" "" "" "200"
echo ""

# Test Hospitals endpoints
echo "🏥 HOSPITALS ENDPOINTS"
echo "======================"
test_endpoint "GET" "/api/tcc/hospitals" "$TOKEN" "" "200"
test_endpoint "POST" "/api/tcc/hospitals" "$TOKEN" '{"name":"Test Hospital API","address":"123 Test St","city":"Test City","state":"TS","zipCode":"12345","phone":"555-0123","email":"test@hospital.com","type":"HOSPITAL","capabilities":["EMERGENCY"],"region":"NORTHEAST"}' "200"
echo ""

# Test Agencies endpoints
echo "🚑 AGENCIES ENDPOINTS"
echo "====================="
test_endpoint "GET" "/api/tcc/agencies" "$TOKEN" "" "200"
echo ""

# Test Facilities endpoints
echo "🏢 FACILITIES ENDPOINTS"
echo "======================="
test_endpoint "GET" "/api/tcc/facilities" "$TOKEN" "" "200"
echo ""

# Test Trips endpoints
echo "🚗 TRIPS ENDPOINTS"
echo "=================="
test_endpoint "GET" "/api/trips" "$TOKEN" "" "200"
echo ""

# Test Units endpoints
echo "🚑 UNITS ENDPOINTS"
echo "=================="
test_endpoint "GET" "/api/tcc/units" "$TOKEN" "" "200"
test_endpoint "GET" "/api/units" "$TOKEN" "" "200"
echo ""

# Test Analytics endpoints
echo "📊 ANALYTICS ENDPOINTS"
echo "======================"
test_endpoint "GET" "/api/tcc/analytics/overview" "$TOKEN" "" "200"
test_endpoint "GET" "/api/tcc/analytics/trips" "$TOKEN" "" "200"
test_endpoint "GET" "/api/tcc/analytics/agencies" "$TOKEN" "" "200"
test_endpoint "GET" "/api/tcc/analytics/hospitals" "$TOKEN" "" "200"
echo ""

# Test Notifications endpoints
echo "🔔 NOTIFICATIONS ENDPOINTS"
echo "=========================="
test_endpoint "GET" "/api/notifications" "$TOKEN" "" "200"
test_endpoint "GET" "/api/notifications/settings" "$TOKEN" "" "200"
echo ""

# Test Dropdown Options endpoints
echo "📋 DROPDOWN OPTIONS ENDPOINTS"
echo "============================="
test_endpoint "GET" "/api/dropdown-options/insurance" "$TOKEN" "" "200"
test_endpoint "GET" "/api/dropdown-options/transport-levels" "$TOKEN" "" "200"
test_endpoint "GET" "/api/dropdown-options/priorities" "$TOKEN" "" "200"
echo ""

# Test Optimization endpoints
echo "🎯 OPTIMIZATION ENDPOINTS"
echo "========================="
test_endpoint "GET" "/api/optimize/units" "$TOKEN" "" "200"
test_endpoint "POST" "/api/optimize/route" "$TOKEN" '{"trips":[],"units":[]}' "200"
echo ""

# Test Error handling
echo "🚨 ERROR HANDLING TESTS"
echo "======================="
test_endpoint "GET" "/api/nonexistent" "$TOKEN" "" "404"
test_endpoint "GET" "/api/tcc/hospitals" "" "" "401"
echo ""

echo "✅ API Testing Complete!"
echo "========================"
echo "Check the results above for any failed endpoints."
echo "All endpoints should return status 200 (or expected status) for successful requests."
