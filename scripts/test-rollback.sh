#!/bin/bash

# MedPort Rollback Test Script
# This script tests rolling back to the working login system

echo "🔄 Testing rollback to working login system..."

# Check current status
echo "📊 Current git status:"
git status --porcelain

# Check if we're on the working tag
CURRENT_COMMIT=$(git rev-parse HEAD)
WORKING_COMMIT=$(git rev-parse working-login-system)

if [ "$CURRENT_COMMIT" = "$WORKING_COMMIT" ]; then
    echo "✅ Already on working login system commit"
else
    echo "🔄 Rolling back to working login system..."
    git checkout working-login-system
    
    echo "🧪 Testing login system..."
    
    # Test backend startup
    echo "🔧 Starting backend..."
    cd backend && npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    sleep 5
    
    # Test login
    echo "🔐 Testing login..."
    LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
        -d '{"email": "hospital@medport.com", "password": "password123"}' \
        http://localhost:5001/api/auth/login)
    
    if echo "$LOGIN_RESPONSE" | grep -q "Login successful"; then
        echo "✅ Login test PASSED"
    else
        echo "❌ Login test FAILED"
        echo "Response: $LOGIN_RESPONSE"
    fi
    
    # Clean up
    kill $BACKEND_PID 2>/dev/null
    
    echo "🔄 Returning to main branch..."
    git checkout main
fi

echo "✅ Rollback test completed!"
