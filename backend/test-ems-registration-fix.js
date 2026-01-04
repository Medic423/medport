#!/usr/bin/env node
/**
 * Test script for EMS Registration Transaction Fix
 * Tests the SAVEPOINT-based transaction recovery fix
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';

// Generate unique test email
const timestamp = Date.now();
const testEmail = `test-ems-fix-${timestamp}@test.local`;
const testAgencyName = `Test EMS Agency ${timestamp}`;

async function testEMSRegistration() {
  console.log('🧪 Testing EMS Registration Transaction Fix\n');
  console.log('='.repeat(60));
  console.log(`Test Email: ${testEmail}`);
  console.log(`Test Agency: ${testAgencyName}`);
  console.log('='.repeat(60));

  try {
    // Test data for EMS registration
    const registrationData = {
      name: 'Test EMS Contact',
      email: testEmail,
      password: 'TestPassword123!',
      agencyName: testAgencyName,
      phone: '555-0100',
      address: '123 Test Street',
      city: 'Altoona',
      state: 'PA',
      zipCode: '16601',
      latitude: '40.5187',
      longitude: '-78.3947',
      serviceArea: ['Altoona', 'Blair County'],
      capabilities: ['BLS', 'ALS'],
      operatingHours: '24/7'
    };

    console.log('\n1️⃣ Testing EMS Registration...');
    console.log('   Submitting registration request...');

    const response = await axios.post(
      `${API_BASE_URL}/api/auth/ems/register`,
      registrationData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 600 // Don't throw on any status
      }
    );

    console.log(`   Status Code: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(response.data, null, 2));

    if (response.status === 200 || response.status === 201) {
      if (response.data.success) {
        console.log('\n✅ EMS Registration SUCCESSFUL!');
        console.log(`   User ID: ${response.data.user?.id}`);
        console.log(`   Email: ${response.data.user?.email}`);
        console.log(`   Agency: ${response.data.user?.agencyName}`);
        console.log(`   Message: ${response.data.message}`);
        return { success: true, data: response.data };
      } else {
        console.log('\n❌ EMS Registration FAILED');
        console.log(`   Error: ${response.data.error}`);
        console.log(`   Code: ${response.data.code || 'N/A'}`);
        return { success: false, error: response.data.error };
      }
    } else {
      console.log('\n❌ EMS Registration FAILED');
      console.log(`   HTTP Status: ${response.status}`);
      console.log(`   Error: ${response.data.error || 'Unknown error'}`);
      console.log(`   Code: ${response.data.code || 'N/A'}`);
      
      // Check for transaction abort error
      if (response.data.code === 'P2010' || response.data.code === '25P02' ||
          (response.data.error && response.data.error.includes('transaction is aborted'))) {
        console.log('\n⚠️  TRANSACTION ABORT ERROR DETECTED - Fix may not be working!');
        return { success: false, error: 'Transaction abort error', transactionAbort: true };
      }
      
      return { success: false, error: response.data.error || 'Unknown error' };
    }
  } catch (error) {
    console.log('\n❌ EMS Registration ERROR');
    console.log(`   Error: ${error.message}`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, JSON.stringify(error.response.data, null, 2));
      
      // Check for transaction abort error
      if (error.response.data?.code === 'P2010' || error.response.data?.code === '25P02' ||
          (error.response.data?.error && error.response.data.error.includes('transaction is aborted'))) {
        console.log('\n⚠️  TRANSACTION ABORT ERROR DETECTED - Fix may not be working!');
        return { success: false, error: 'Transaction abort error', transactionAbort: true };
      }
    }
    
    return { success: false, error: error.message };
  }
}

// Run the test
testEMSRegistration()
  .then((result) => {
    console.log('\n' + '='.repeat(60));
    if (result.success) {
      console.log('✅ TEST PASSED - EMS Registration working correctly');
      process.exit(0);
    } else if (result.transactionAbort) {
      console.log('❌ TEST FAILED - Transaction abort error still occurring');
      process.exit(1);
    } else {
      console.log('❌ TEST FAILED - Registration failed with error');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ TEST ERROR:', error);
    process.exit(1);
  });

