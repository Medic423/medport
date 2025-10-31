#!/usr/bin/env node

/**
 * Test script to simulate trip creation and check what urgencyLevel is being sent
 * This helps verify the payload doesn't contain "Critical"
 */

const axios = require('axios');

// You'll need to set these based on your dev server
const API_BASE_URL = process.env.API_URL || 'http://localhost:5001';
const TEST_TOKEN = process.env.TEST_TOKEN || ''; // You may need to get this from a login

async function testTripCreationPayload() {
  try {
    console.log('🧪 Testing Trip Creation Payload...\n');
    console.log('API Base URL:', API_BASE_URL);
    console.log('=' .repeat(60) + '\n');

    // Test payload with various urgency levels
    const testCases = [
      { urgencyLevel: 'Routine', expected: 'PASS' },
      { urgencyLevel: 'Urgent', expected: 'PASS' },
      { urgencyLevel: 'Emergent', expected: 'PASS' },
      { urgencyLevel: 'Critical', expected: 'FAIL (should be rejected)' }
    ];

    console.log('📋 Test Cases:\n');
    
    for (const testCase of testCases) {
      const payload = {
        patientId: 'TEST-' + Date.now(),
        patientWeight: '70',
        specialNeeds: '',
        insuranceCompany: 'Medicare',
        patientAgeCategory: 'ADULT',
        patientAgeYears: 45,
        fromLocation: 'Test Hospital',
        fromLocationId: undefined,
        pickupLocationId: undefined,
        toLocation: 'Test Destination',
        scheduledTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        transportLevel: 'BLS',
        urgencyLevel: testCase.urgencyLevel,
        diagnosis: '',
        mobilityLevel: 'Ambulatory',
        oxygenRequired: false,
        monitoringRequired: false,
        generateQRCode: false,
        selectedAgencies: [],
        notificationRadius: 100,
        notes: 'Test trip',
        priority: testCase.urgencyLevel === 'Emergent' ? 'HIGH' : 
                 testCase.urgencyLevel === 'Urgent' ? 'MEDIUM' : 'LOW',
        createdVia: 'HEALTHCARE_PORTAL'
      };

      console.log(`\n1. Testing urgencyLevel: "${testCase.urgencyLevel}"`);
      console.log(`   Expected: ${testCase.expected}`);
      console.log(`   Payload urgencyLevel: ${payload.urgencyLevel}`);
      
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/trips/enhanced`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(TEST_TOKEN && { 'Authorization': `Bearer ${TEST_TOKEN}` })
            }
          }
        );

        if (testCase.urgencyLevel === 'Critical') {
          console.log(`   ❌ UNEXPECTED: Backend accepted "Critical" (should have rejected)`);
        } else {
          console.log(`   ✅ PASS: Backend accepted "${testCase.urgencyLevel}"`);
          console.log(`   Response:`, response.data.success ? 'Success' : 'Failed');
        }
      } catch (error) {
        if (error.response) {
          const status = error.response.status;
          const errorMsg = error.response.data?.error || error.message;
          
          if (testCase.urgencyLevel === 'Critical') {
            console.log(`   ✅ PASS: Backend correctly rejected "Critical"`);
            console.log(`   Error: ${errorMsg} (Status: ${status})`);
          } else {
            console.log(`   ❌ FAIL: Backend rejected valid urgency "${testCase.urgencyLevel}"`);
            console.log(`   Error: ${errorMsg} (Status: ${status})`);
          }
        } else {
          console.log(`   ⚠️  Request failed:`, error.message);
        }
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('\n✅ Test complete!');
    console.log('\n💡 Notes:');
    console.log('   - If "Critical" was accepted, there\'s a backend validation issue');
    console.log('   - If valid urgency levels were rejected, check backend validation logic');
    console.log('   - Make sure your dev server is running and DATABASE_URL is set');

  } catch (error) {
    console.error('❌ Test script error:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Dev server is running on', API_BASE_URL);
    console.error('   2. DATABASE_URL is set in environment');
    console.error('   3. Authentication token is set if required');
  }
}

testTripCreationPayload();

