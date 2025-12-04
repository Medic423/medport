#!/usr/bin/env node

/**
 * Healthcare Trip Flow Integration Test
 * 
 * Tests:
 * 1. Login as healthcare user
 * 2. Create a trip using enhanced endpoint
 * 3. Verify trip appears in GET /api/trips list
 * 4. Update trip status (Edit → Save)
 * 5. Cancel trip
 * 
 * Run: node test-healthcare-trip-flow.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const HEALTHCARE_USER = {
  email: 'test@hospital.com',
  password: 'password123'
};

let authToken = null;
let createdTripId = null;
let userId = null;

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${ step }] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`  ✓ ${message}`, 'green');
}

function logError(message) {
  log(`  ✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`  ⚠ ${message}`, 'yellow');
}

// Test: Login as healthcare user
async function testLogin() {
  logStep('STEP 1', 'Login as healthcare user');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/healthcare/login`, {
      email: HEALTHCARE_USER.email,
      password: HEALTHCARE_USER.password
    });
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      userId = response.data.user?.id;
      logSuccess(`Logged in successfully as ${HEALTHCARE_USER.email}`);
      logSuccess(`User ID: ${userId}`);
      return true;
    } else {
      logError('Login failed: No token received');
      return false;
    }
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test: Create trip using enhanced endpoint
async function testCreateTrip() {
  logStep('STEP 2', 'Create trip using enhanced endpoint');
  
  const tripData = {
    patientId: `TEST-${Date.now()}`,
    patientWeight: '75',
    fromLocation: 'Test Hospital',
    toLocation: 'Destination Hospital',
    scheduledTime: new Date().toISOString(),
    transportLevel: 'BLS',
    urgencyLevel: 'Routine',
    diagnosis: 'Cardiac',
    mobilityLevel: 'Ambulatory',
    oxygenRequired: false,
    monitoringRequired: false,
    notes: 'Integration test trip',
    createdVia: 'HEALTHCARE_PORTAL'
  };
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/trips/with-responses`,
      tripData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success && response.data.data?.id) {
      createdTripId = response.data.data.id;
      logSuccess(`Trip created successfully: ${createdTripId}`);
      logSuccess(`Patient ID: ${tripData.patientId}`);
      
      // Verify healthcareCreatedById is set
      if (response.data.data.healthcareCreatedById) {
        logSuccess(`healthcareCreatedById is set: ${response.data.data.healthcareCreatedById}`);
      } else {
        logWarning('healthcareCreatedById is NOT set (this may cause display issues)');
      }
      
      return true;
    } else {
      logError('Trip creation failed: No trip ID received');
      return false;
    }
  } catch (error) {
    logError(`Trip creation failed: ${error.response?.data?.error || error.message}`);
    console.log('Response data:', error.response?.data);
    return false;
  }
}

// Test: Verify trip appears in list
async function testGetTrips() {
  logStep('STEP 3', 'Verify trip appears in GET /api/trips');
  
  // Wait a moment for database to update
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/trips`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success && Array.isArray(response.data.data)) {
      const trips = response.data.data;
      logSuccess(`Retrieved ${trips.length} trips`);
      
      // Find our created trip
      const createdTrip = trips.find(t => t.id === createdTripId);
      
      if (createdTrip) {
        logSuccess(`Created trip found in list: ${createdTripId}`);
        logSuccess(`Trip status: ${createdTrip.status}`);
        
        // Verify healthcareCreatedById matches our user
        if (createdTrip.healthcareCreatedById === userId) {
          logSuccess(`healthcareCreatedById matches logged-in user: ${userId}`);
        } else {
          logWarning(`healthcareCreatedById mismatch: expected ${userId}, got ${createdTrip.healthcareCreatedById}`);
        }
        
        return true;
      } else {
        logError(`Created trip NOT found in list (ID: ${createdTripId})`);
        logWarning(`This means the trip was created but filtering is not working correctly`);
        log(`  All trip IDs: ${trips.map(t => t.id).join(', ')}`);
        return false;
      }
    } else {
      logError('Failed to get trips: Invalid response');
      return false;
    }
  } catch (error) {
    logError(`Failed to get trips: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test: Update trip status (Edit → Save)
async function testUpdateTrip() {
  logStep('STEP 4', 'Update trip status (Edit → Save)');
  
  const updateData = {
    status: 'PENDING',
    urgencyLevel: 'Urgent',
    transportLevel: 'ALS',
    diagnosis: 'Respiratory',
    mobilityLevel: 'Wheelchair',
    oxygenRequired: true,
    monitoringRequired: false
  };
  
  try {
    const response = await axios.put(
      `${BASE_URL}/api/trips/${createdTripId}/status`,
      updateData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      logSuccess('Trip updated successfully');
      logSuccess(`Urgency changed to: ${updateData.urgencyLevel}`);
      logSuccess(`Transport level changed to: ${updateData.transportLevel}`);
      return true;
    } else {
      logError(`Update failed: ${response.data.error}`);
      return false;
    }
  } catch (error) {
    logError(`Update failed: ${error.response?.data?.error || error.message}`);
    log(`  Status: ${error.response?.status}`);
    log(`  Response: ${JSON.stringify(error.response?.data)}`);
    return false;
  }
}

// Test: Cancel trip
async function testCancelTrip() {
  logStep('STEP 5', 'Cancel trip (soft delete)');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/api/trips/${createdTripId}/status`,
      { status: 'CANCELLED' },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      logSuccess('Trip cancelled successfully');
      return true;
    } else {
      logError(`Cancel failed: ${response.data.error}`);
      return false;
    }
  } catch (error) {
    logError(`Cancel failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  log('\n' + '='.repeat(70), 'blue');
  log('  Healthcare Trip Flow Integration Test', 'blue');
  log('='.repeat(70) + '\n', 'blue');
  
  const results = {
    login: await testLogin(),
    create: false,
    list: false,
    update: false,
    cancel: false
  };
  
  if (results.login) {
    results.create = await testCreateTrip();
  }
  
  if (results.create) {
    results.list = await testGetTrips();
    results.update = await testUpdateTrip();
  }
  
  if (results.update) {
    results.cancel = await testCancelTrip();
  }
  
  // Summary
  log('\n' + '='.repeat(70), 'blue');
  log('  Test Summary', 'blue');
  log('='.repeat(70), 'blue');
  
  const tests = [
    { name: 'Login', result: results.login },
    { name: 'Create Trip', result: results.create },
    { name: 'List Trip', result: results.list },
    { name: 'Update Trip', result: results.update },
    { name: 'Cancel Trip', result: results.cancel }
  ];
  
  tests.forEach(test => {
    if (test.result) {
      logSuccess(`${test.name}: PASSED`);
    } else {
      logError(`${test.name}: FAILED`);
    }
  });
  
  const allPassed = Object.values(results).every(r => r === true);
  
  log('\n' + '='.repeat(70), 'blue');
  if (allPassed) {
    log('  ✓ ALL TESTS PASSED', 'green');
  } else {
    log('  ✗ SOME TESTS FAILED', 'red');
  }
  log('='.repeat(70) + '\n', 'blue');
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  logError(`Unhandled error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

