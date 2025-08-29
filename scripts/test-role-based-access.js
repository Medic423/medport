#!/usr/bin/env node

/**
 * Test script to verify role-based access endpoints
 * Run with: node scripts/test-role-based-access.js
 */

const axios = require('axios');

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5001';
const TEST_TOKEN = process.env.TEST_TOKEN || 'demo-token';

async function testEndpoint(endpoint, token = TEST_TOKEN) {
  try {
    console.log(`\n🔍 Testing ${endpoint}...`);
    
    const response = await axios.get(`${BASE_URL}/api/role-based-access${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      validateStatus: () => true // Don't throw on non-2xx status codes
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📋 Response headers:`, response.headers);

    const responseText = response.data;
    console.log(`📄 Response data type: ${typeof responseText}`);
    
    if (typeof responseText === 'string') {
      if (responseText.trim() === '') {
        console.error('❌ EMPTY RESPONSE - This will cause JSON.parse errors!');
        return false;
      }
      
      if (responseText.length < 10) {
        console.warn('⚠️  Very short response:', responseText);
      }
    }

    // Check if response is already parsed JSON
    if (typeof responseText === 'object' && responseText !== null) {
      console.log('✅ Valid JSON response (already parsed)');
      console.log('📦 Response structure:', {
        hasSuccess: 'success' in responseText,
        hasData: 'data' in responseText,
        dataKeys: responseText.data ? Object.keys(responseText.data) : 'no data'
      });
      return true;
    }

    // Try to parse if it's a string
    if (typeof responseText === 'string') {
      try {
        const jsonData = JSON.parse(responseText);
        console.log('✅ Valid JSON response (parsed from string)');
        console.log('📦 Response structure:', {
          hasSuccess: 'success' in jsonData,
          hasData: 'data' in jsonData,
          dataKeys: jsonData.data ? Object.keys(jsonData.data) : 'no data'
        });
        return true;
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError.message);
        console.error('📄 Raw response:', responseText);
        return false;
      }
    }

    console.warn('⚠️  Unexpected response type:', typeof responseText);
    return false;

  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing Role-Based Access Endpoints');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🔑 Test Token: ${TEST_TOKEN}`);
  
  const endpoints = [
    '/navigation',
    '/modules',
    '/landing-page',
    '/demo/navigation',
    '/demo/modules'
  ];

  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n🔧 Recommendations:');
    console.log('1. Check backend logs for errors');
    console.log('2. Verify JWT_SECRET environment variable is set');
    console.log('3. Check database connectivity');
    console.log('4. Verify user permissions are properly configured');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };
