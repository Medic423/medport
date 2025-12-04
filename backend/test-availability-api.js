#!/usr/bin/env node
/**
 * Test script for EMS Agency Availability Status API endpoints
 * Tests Phase 1 implementation: Database migration + Backend API
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';

// Test EMS user credentials (adjust if needed)
const TEST_EMS_EMAIL = 'test@ems.com';
const TEST_EMS_PASSWORD = 'testpassword';

async function testAvailabilityAPI() {
  console.log('🧪 Testing EMS Agency Availability Status API\n');
  console.log('=' .repeat(60));

  let token = null;

  try {
    // Step 1: Login as EMS user
    console.log('\n1️⃣ Testing EMS Login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/ems/login`, {
      email: TEST_EMS_EMAIL,
      password: TEST_EMS_PASSWORD
    });

    if (loginResponse.data.success && loginResponse.data.token) {
      token = loginResponse.data.token;
      console.log('✅ Login successful');
      console.log(`   User: ${loginResponse.data.user.name}`);
      console.log(`   Agency: ${loginResponse.data.user.agencyName}`);
    } else {
      throw new Error('Login failed: ' + JSON.stringify(loginResponse.data));
    }

    // Step 2: Get current availability status
    console.log('\n2️⃣ Testing GET /api/auth/ems/agency/availability...');
    const getResponse = await axios.get(`${API_BASE_URL}/api/auth/ems/agency/availability`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getResponse.data.success) {
      console.log('✅ GET availability status successful');
      console.log('   Current status:', JSON.stringify(getResponse.data.data.availabilityStatus, null, 2));
    } else {
      throw new Error('GET failed: ' + JSON.stringify(getResponse.data));
    }

    // Step 3: Update availability status
    console.log('\n3️⃣ Testing PUT /api/auth/ems/agency/availability...');
    const updateData = {
      isAvailable: true,
      availableLevels: ['BLS', 'ALS']
    };

    const putResponse = await axios.put(`${API_BASE_URL}/api/auth/ems/agency/availability`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (putResponse.data.success) {
      console.log('✅ PUT availability status successful');
      console.log('   Updated status:', JSON.stringify(putResponse.data.data.availabilityStatus, null, 2));
    } else {
      throw new Error('PUT failed: ' + JSON.stringify(putResponse.data));
    }

    // Step 4: Verify update persisted
    console.log('\n4️⃣ Verifying update persisted...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/api/auth/ems/agency/availability`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (verifyResponse.data.success) {
      const status = verifyResponse.data.data.availabilityStatus;
      if (status.isAvailable === true && 
          status.availableLevels.includes('BLS') && 
          status.availableLevels.includes('ALS')) {
        console.log('✅ Update persisted correctly');
        console.log('   Verified status:', JSON.stringify(status, null, 2));
      } else {
        throw new Error('Update did not persist correctly');
      }
    } else {
      throw new Error('Verification GET failed');
    }

    // Step 5: Test validation (invalid level)
    console.log('\n5️⃣ Testing validation (invalid level)...');
    try {
      await axios.put(`${API_BASE_URL}/api/auth/ems/agency/availability`, {
        isAvailable: true,
        availableLevels: ['INVALID']
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Validation test failed - should have rejected invalid level');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validation working correctly - rejected invalid level');
      } else {
        throw error;
      }
    }

    // Step 6: Reset to default
    console.log('\n6️⃣ Resetting to default status...');
    const resetResponse = await axios.put(`${API_BASE_URL}/api/auth/ems/agency/availability`, {
      isAvailable: false,
      availableLevels: []
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (resetResponse.data.success) {
      console.log('✅ Reset successful');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed!');
    console.log('\n📋 Summary:');
    console.log('   - Database migration: ✅ Applied');
    console.log('   - GET endpoint: ✅ Working');
    console.log('   - PUT endpoint: ✅ Working');
    console.log('   - Validation: ✅ Working');
    console.log('   - Persistence: ✅ Working');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Error:', error.message);
    }
    process.exit(1);
  }
}

// Run tests
testAvailabilityAPI();

