#!/usr/bin/env node

/**
 * Test script to create an enhanced trip with age fields
 * This will authenticate and create a trip to verify the fix works
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5001';

// Test healthcare user credentials (adjust if needed)
const HEALTHCARE_USER = {
  email: 'admin@altoonaregional.org',
  password: 'upmc123'
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 Logging in as healthcare user...');
    const response = await axios.post(`${BASE_URL}/api/auth/healthcare/login`, {
      email: HEALTHCARE_USER.email,
      password: HEALTHCARE_USER.password
    });
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Login successful');
      console.log('   User:', response.data.user?.email);
      console.log('   User ID:', response.data.user?.id);
      return true;
    } else {
      console.error('❌ Login failed: No token received');
      return false;
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.error || error.message);
    if (error.response?.data) {
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function testCreateTrip() {
  try {
    console.log('\n🧪 Testing Enhanced Trip Creation...');
    
    const tripPayload = {
      patientId: `TEST-${Date.now()}`,
      patientWeight: '100',
      specialNeeds: 'VA',
      insuranceCompany: 'Medicare',
      patientAgeCategory: 'ADULT',
      patientAgeYears: 37,
      fromLocation: 'Penn Highlands Clearfield',
      fromLocationId: 'loc_004', // You may need to adjust this
      pickupLocationId: undefined, // Optional
      toLocation: 'Penn Highlands DuBois',
      scheduledTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      transportLevel: 'BLS',
      urgencyLevel: 'Routine',
      diagnosis: 'None',
      mobilityLevel: 'Stretcher',
      oxygenRequired: true,
      monitoringRequired: false,
      generateQRCode: false,
      selectedAgencies: [],
      notificationRadius: 100,
      notes: 'Test trip with age fields',
      priority: 'LOW',
      createdVia: 'HEALTHCARE_PORTAL'
    };

    console.log('\n📦 Payload being sent:');
    console.log(JSON.stringify(tripPayload, null, 2));

    const response = await axios.post(
      `${BASE_URL}/api/trips/enhanced`,
      tripPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (response.data.success) {
      console.log('\n✅ Trip created successfully!');
      console.log('   Trip ID:', response.data.data?.id);
      console.log('   Trip Number:', response.data.data?.tripNumber);
      console.log('   Patient Age Years:', response.data.data?.patientAgeYears);
      console.log('   Patient Age Category:', response.data.data?.patientAgeCategory);
      return true;
    } else {
      console.error('\n❌ Trip creation failed:', response.data.error);
      return false;
    }
  } catch (error) {
    console.error('\n❌ Trip creation failed with error:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data?.error || error.response.data?.message);
      console.error('   Full Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Error:', error.message);
      console.error('   Stack:', error.stack);
    }
    return false;
  }
}

async function runTest() {
  console.log('🚀 Starting Enhanced Trip Creation Test\n');
  console.log('='.repeat(60));
  
  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('\n❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Step 2: Create trip
  const tripSuccess = await testCreateTrip();
  
  console.log('\n' + '='.repeat(60));
  if (tripSuccess) {
    console.log('✅ ALL TESTS PASSED');
    process.exit(0);
  } else {
    console.log('❌ TEST FAILED - See errors above');
    process.exit(1);
  }
}

// Run the test
runTest().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});

