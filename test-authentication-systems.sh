#!/bin/bash

# Authentication Systems Test Script
# Tests all user types: Healthcare, EMS, and Admin

echo "======================================"
echo "Authentication Systems Test"
echo "======================================"
echo ""

API_URL="http://localhost:5001/api"
RESULTS=()

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test login
test_login() {
    local user_type=$1
    local email=$2
    local password=$3
    local description=$4
    
    echo "Testing: $description"
    echo "  User Type: $user_type"
    echo "  Email: $email"
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\",\"userType\":\"$user_type\"}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" == "200" ]; then
        token=$(echo "$body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        success=$(echo "$body" | grep -o '"success":[^,}]*' | cut -d':' -f2)
        
        if [ "$success" == "true" ] && [ ! -z "$token" ]; then
            echo -e "  ${GREEN}✓ SUCCESS${NC} - Login successful, token received"
            RESULTS+=("✓ $description")
            echo "  Token: ${token:0:50}..."
            
            # Test token verification
            verify_response=$(curl -s -X GET "$API_URL/auth/verify" \
                -H "Authorization: Bearer $token")
            
            if echo "$verify_response" | grep -q "\"success\":true"; then
                echo -e "  ${GREEN}✓ Token verification successful${NC}"
            else
                echo -e "  ${RED}✗ Token verification failed${NC}"
            fi
        else
            echo -e "  ${RED}✗ FAILED${NC} - Login returned success:false or no token"
            RESULTS+=("✗ $description - No token")
            echo "  Response: $body"
        fi
    else
        echo -e "  ${RED}✗ FAILED${NC} - HTTP $http_code"
        RESULTS+=("✗ $description - HTTP $http_code")
        echo "  Response: $body"
    fi
    echo ""
}

# Test Healthcare Users
echo "======================================"
echo "1. HEALTHCARE AUTHENTICATION"
echo "======================================"
echo ""

test_login "HEALTHCARE" "test@hospital.com" "password123" "Healthcare User - Single Facility"
test_login "HEALTHCARE" "chuck@ferrellhospitals.com" "password123" "Healthcare User - Multi-location"

# Test EMS Users
echo "======================================"
echo "2. EMS AUTHENTICATION (Bug Fix Test)"
echo "======================================"
echo ""

test_login "EMS" "test@ems.com" "password123" "EMS User - Primary Test Account"

# Test Admin Users
echo "======================================"
echo "3. ADMIN AUTHENTICATION"
echo "======================================"
echo ""

test_login "ADMIN" "admin@tcc.com" "admin123" "Admin User - TCC Admin"

# Summary
echo "======================================"
echo "TEST SUMMARY"
echo "======================================"
echo ""

success_count=0
fail_count=0

for result in "${RESULTS[@]}"; do
    if [[ $result == ✓* ]]; then
        echo -e "${GREEN}$result${NC}"
        ((success_count++))
    else
        echo -e "${RED}$result${NC}"
        ((fail_count++))
    fi
done

echo ""
echo "Total: $((success_count + fail_count)) tests"
echo -e "${GREEN}Passed: $success_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}All authentication systems working!${NC}"
    exit 0
else
    echo -e "${RED}Some authentication systems failed!${NC}"
    exit 1
fi

