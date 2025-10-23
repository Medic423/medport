#!/usr/bin/env node

/**
 * Automated E2E Test Script
 * Phase 2.1.3: Automated end-to-end testing
 * 
 * This script performs automated E2E testing of the TCC system:
 * - Healthcare user creates trip
 * - EMS user views and accepts trip
 * - EMS user assigns unit to trip
 * - Healthcare user verifies updates
 * - Status progression testing
 * - Bug identification and reporting
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const CONFIG = {
  baseURL: 'http://localhost:5001',
  timeout: 10000,
  testDataFile: 'e2e-test-data-ids.json',
  resultsFile: 'e2e-test-results.json'
};

// Test state
let testState = {
  testDataIds: null,
  authTokens: {},
  testTripId: null,
  testResults: {
    startTime: new Date().toISOString(),
    phases: {},
    bugs: [],
    summary: {}
  }
};

async function runE2ETest() {
  console.log('🧪 E2E Test Execution');
  console.log('=====================');
  console.log('');

  try {
    // Step 1: Load test data
    console.log('📄 Loading test data...');
    await loadTestData();
    console.log('✅ Test data loaded');
    console.log('');

    // Step 2: Run test phases
    console.log('🚀 Starting E2E test phases...');
    console.log('');

    // Phase A: Test Data Setup Verification
    await runPhaseA();
    
    // Phase B: Healthcare Trip Creation
    await runPhaseB();
    
    // Phase C: EMS Trip Visibility
    await runPhaseC();
    
    // Phase D: EMS Trip Acceptance
    await runPhaseD();
    
    // Phase E: Unit Assignment (CRITICAL BUG AREA)
    await runPhaseE();
    
    // Phase F: Status Progression
    await runPhaseF();
    
    // Phase G: Data Integrity Verification
    await runPhaseG();

    // Step 3: Generate test report
    console.log('📊 Generating test report...');
    await generateTestReport();
    console.log('✅ Test report generated');
    console.log('');

    // Step 4: Display results
    displayTestResults();

  } catch (error) {
    console.error('❌ E2E test failed:', error.message);
    testState.testResults.summary.status = 'FAILED';
    testState.testResults.summary.error = error.message;
    await saveTestResults();
    process.exit(1);
  }
}

async function loadTestData() {
  try {
    const testDataFile = fs.readFileSync(CONFIG.testDataFile, 'utf8');
    testState.testDataIds = JSON.parse(testDataFile);
    console.log(`   📄 Loaded test data IDs from ${CONFIG.testDataFile}`);
  } catch (error) {
    throw new Error(`Failed to load test data: ${error.message}`);
  }
}

async function runPhaseA() {
  console.log('🏗️  Phase A: Test Data Setup Verification');
  console.log('------------------------------------------');
  
  const phaseStart = Date.now();
  const phase = {
    name: 'Test Data Setup Verification',
    startTime: new Date().toISOString(),
    steps: [],
    status: 'RUNNING'
  };

  try {
    // Verify test data exists
    const step1 = await verifyTestDataExists();
    phase.steps.push(step1);

    // Test server connectivity
    const step2 = await testServerConnectivity();
    phase.steps.push(step2);

    phase.status = 'PASSED';
    phase.endTime = new Date().toISOString();
    phase.duration = Date.now() - phaseStart;
    testState.testResults.phases.phaseA = phase;

    console.log('✅ Phase A completed successfully');
    console.log('');

  } catch (error) {
    phase.status = 'FAILED';
    phase.error = error.message;
    phase.endTime = new Date().toISOString();
    phase.duration = Date.now() - phaseStart;
    testState.testResults.phases.phaseA = phase;
    throw error;
  }
}

async function runPhaseB() {
  console.log('🏥 Phase B: Healthcare Trip Creation');
  console.log('------------------------------------');
  
  const phaseStart = Date.now();
  const phase = {
    name: 'Healthcare Trip Creation',
    startTime: new Date().toISOString(),
    steps: [],
    status: 'RUNNING'
  };

  try {
    // Authenticate healthcare user
    const step1 = await authenticateUser('healthcare');
    phase.steps.push(step1);

    // Create test trip
    const step2 = await createTestTrip();
    phase.steps.push(step2);

    // Verify trip creation
    const step3 = await verifyTripCreation();
    phase.steps.push(step3);

    phase.status = 'PASSED';
    phase.endTime = new Date().toISOString();
    phase.duration = Date.now() - phaseStart;
    testState.testResults.phases.phaseB = phase;

    console.log('✅ Phase B completed successfully');
    console.log('');

  } catch (error) {
    phase.status = 'FAILED';
    phase.error = error.message;
    phase.endTime = new Date().toISOString();
    phase.duration = Date.now() - phaseStart;
    testState.testResults.phases.phaseB = phase;
    throw error;
  }
}

async function runPhaseC() {
  console.log('🚑 Phase C: EMS Trip Visibility');
  console.log('--------------------------------');
  
  const phaseStart = Date.now();
  const phase = {
    name: 'EMS Trip Visibility',
    startTime: new Date().toISOString(),
    steps: [],
    status: 'RUNNING'
  };

  try {
    // Authenticate EMS user
    const step1 = await authenticateUser('ems');
    phase.steps.push(step1);

    // Verify trip visibility
    const step2 = await verifyTripVisibility();
    phase.steps.push(step2);

    // Verify trip data integrity
    const step3 = await verifyTripDataIntegrity();
    phase.steps.push(step3);

    phase.status = 'PASSED';
    phase.endTime = new Date().toISOString();
    phase.duration = Date.now() - phaseStart;
    testState.testResults.phases.phaseC = phase;

    console.log('✅ Phase C completed successfully');
    console.log('');

  } catch (error) {
    phase.status = 'FAILED';
    phase.error = error.message;
    phase.endTime = new Date().toISOString();
    phase.duration = Date.now() - phaseStart;
    testState.testResults.phases.phaseC = phase;
    throw error;
  }
}

async function runPhaseD() {
  console.log('✅ Phase D: EMS Trip Acceptance');
  console.log('-------------------------------');
  
  const phaseStart = Date.now();
  const phase = {
    name: 'EMS Trip Acceptance',
    startTime: new Date().toISOString(),
    steps: [],
    status: 'RUNNING'
  };

  try {
    // Accept trip
    const step1 = await acceptTrip();
    phase.steps.push(step1);

    // Verify status update
    const step2 = await verifyStatusUpdate('ACCEPTED');
    phase.steps.push(step2);

    // Verify healthcare visibility
    const step3 = await verifyHealthcareVisibility();
    phase.steps.push(step3);

    phase.status = 'PASSED';
    phase.endTime = new Date().toISOString();
    phase.duration = Date.now() - phaseStart;
    testState.testResults.phases.phaseD = phase;

    console.log('✅ Phase D completed successfully');
    console.log('');

  } catch (error) {
    phase.status = 'FAILED';
    phase.error = error.message;
    phase.endTime = new Date().toISOString();
    phase.duration = Date.now() - phaseStart;
    testState.testResults.phases.phaseD = phase;
    throw error;
  }
}

async function runPhaseE() {
  console.log('🚗 Phase E: Unit Assignment (CRITICAL BUG AREA)');
  console.log('-----------------------------------------------');
  
  const phaseStart = Date.now();
  const phase = {
    name: 'Unit Assignment',
    startTime: new Date().toISOString(),
    steps: [],
    status: 'RUNNING'
  };

  try {
    // Attempt unit assignment
    const step1 = await attemptUnitAssignment();
    phase.steps.push(step1);

    // Verify assignment success
    const step2 = await verifyUnitAssignment();
    phase.steps.push(step2);

    // Test assignment visibility
    const step3 = await testAssignmentVisibility();
    phase.steps.push(step3);

    phase.status = 'PASSED';
    phase.endTime = new Date().toISOString();
    phase.duration = Date.now() - phaseStart;
    testState.testResults.phases.phaseE = phase;

    console.log('✅ Phase E completed successfully');
    console.log('');

  } catch (error) {
    phase.status = 'FAILED';
    phase.error = error.message;
    phase.endTime = new Date().toISOString();
    phase.duration = Date.now() - phaseStart;
    testState.testResults.phases.phaseE = phase;
    
    // This is expected to fail - it's our main bug area
    console.log('⚠️  Phase E failed (expected - this is our main bug area)');
    console.log(`   Error: ${error.message}`);
    console.log('');
  }
}

async function runPhaseF() {
  console.log('📊 Phase F: Status Progression');
  console.log('------------------------------');
  
  const phaseStart = Date.now();
  const phase = {
    name: 'Status Progression',
    startTime: new Date().toISOString(),
    steps: [],
    status: 'RUNNING'
  };

  try {
    // Start trip (IN_PROGRESS)
    const step1 = await updateTripStatus('IN_PROGRESS');
    phase.steps.push(step1);

    // Complete trip (COMPLETED)
    const step2 = await updateTripStatus('COMPLETED');
    phase.steps.push(step2);

    // Verify final status
    const step3 = await verifyFinalStatus();
    phase.steps.push(step3);

    phase.status = 'PASSED';
    phase.endTime = new Date().toISOString();
    phase.duration = Date.now() - phaseStart;
    testState.testResults.phases.phaseF = phase;

    console.log('✅ Phase F completed successfully');
    console.log('');

  } catch (error) {
    phase.status = 'FAILED';
    phase.error = error.message;
    phase.endTime = new Date().toISOString();
    phase.duration = Date.now() - phaseStart;
    testState.testResults.phases.phaseF = phase;
    throw error;
  }
}

async function runPhaseG() {
  console.log('🔍 Phase G: Data Integrity Verification');
  console.log('---------------------------------------');
  
  const phaseStart = Date.now();
  const phase = {
    name: 'Data Integrity Verification',
    startTime: new Date().toISOString(),
    steps: [],
    status: 'RUNNING'
  };

  try {
    // Verify database integrity
    const step1 = await verifyDatabaseIntegrity();
    phase.steps.push(step1);

    // Verify API consistency
    const step2 = await verifyAPIConsistency();
    phase.steps.push(step2);

    // Verify UI data
    const step3 = await verifyUIData();
    phase.steps.push(step3);

    phase.status = 'PASSED';
    phase.endTime = new Date().toISOString();
    phase.duration = Date.now() - phaseStart;
    testState.testResults.phases.phaseG = phase;

    console.log('✅ Phase G completed successfully');
    console.log('');

  } catch (error) {
    phase.status = 'FAILED';
    phase.error = error.message;
    phase.endTime = new Date().toISOString();
    phase.duration = Date.now() - phaseStart;
    testState.testResults.phases.phaseG = phase;
    throw error;
  }
}

// Helper functions for each test step

async function verifyTestDataExists() {
  console.log('   🔍 Verifying test data exists...');
  
  if (!testState.testDataIds) {
    throw new Error('Test data IDs not loaded');
  }

  const requiredIds = [
    'users.healthcare',
    'users.ems',
    'users.admin',
    'locations.healthcareLocation',
    'locations.facility',
    'ems.agency',
    'ems.unit'
  ];

  for (const path of requiredIds) {
    const keys = path.split('.');
    let current = testState.testDataIds;
    for (const key of keys) {
      if (!current[key]) {
        throw new Error(`Missing test data ID: ${path}`);
      }
      current = current[key];
    }
  }

  return {
    name: 'Verify test data exists',
    status: 'PASSED',
    message: 'All required test data IDs found'
  };
}

async function testServerConnectivity() {
  console.log('   🌐 Testing server connectivity...');
  
  try {
    const response = await axios.get(`${CONFIG.baseURL}/health`, { timeout: CONFIG.timeout });
    if (response.status !== 200) {
      throw new Error(`Server health check failed: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Server connectivity failed: ${error.message}`);
  }

  return {
    name: 'Test server connectivity',
    status: 'PASSED',
    message: 'Server is accessible'
  };
}

async function authenticateUser(userType) {
  console.log(`   🔐 Authenticating ${userType} user...`);
  
  const userEmail = `test-${userType}-e2e@example.com`;
  const password = 'TestPass123!';

  try {
    const response = await axios.post(`${CONFIG.baseURL}/api/auth/login`, {
      email: userEmail,
      password: password
    }, { timeout: CONFIG.timeout });

    if (!response.data.success || !response.data.token) {
      throw new Error('Authentication failed: No token received');
    }

    testState.authTokens[userType] = response.data.token;

    return {
      name: `Authenticate ${userType} user`,
      status: 'PASSED',
      message: `Successfully authenticated ${userType} user`,
      data: { userEmail, tokenLength: response.data.token.length }
    };

  } catch (error) {
    throw new Error(`Authentication failed for ${userType}: ${error.message}`);
  }
}

async function createTestTrip() {
  console.log('   🏥 Creating test trip...');
  
  const tripData = {
    patientId: 'E2E-PATIENT-001',
    patientWeight: '70kg',
    specialNeeds: 'None',
    transportLevel: 'BLS',
    urgencyLevel: 'Routine',
    priority: 'MEDIUM',
    specialRequirements: 'None',
    diagnosis: 'E2E Test Diagnosis',
    mobilityLevel: 'Ambulatory',
    oxygenRequired: false,
    monitoringRequired: false,
    fromLocation: 'E2E Test Hospital',
    fromLocationId: testState.testDataIds.locations.healthcareLocation,
    toLocation: 'E2E Test Facility',
    destinationFacilityId: testState.testDataIds.locations.facility
  };

  try {
    const response = await axios.post(`${CONFIG.baseURL}/api/trips/enhanced`, tripData, {
      headers: { Authorization: `Bearer ${testState.authTokens.healthcare}` },
      timeout: CONFIG.timeout
    });

    if (!response.data.success || !response.data.data) {
      throw new Error('Trip creation failed: No trip data received');
    }

    testState.testTripId = response.data.data.id;

    return {
      name: 'Create test trip',
      status: 'PASSED',
      message: 'Test trip created successfully',
      data: { tripId: testState.testTripId }
    };

  } catch (error) {
    throw new Error(`Trip creation failed: ${error.message}`);
  }
}

async function verifyTripCreation() {
  console.log('   ✅ Verifying trip creation...');
  
  try {
    const response = await axios.get(`${CONFIG.baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${testState.authTokens.healthcare}` },
      timeout: CONFIG.timeout
    });

    if (!response.data.success || !response.data.data) {
      throw new Error('Trip verification failed: No trips data received');
    }

    const trip = response.data.data.find(t => t.id === testState.testTripId);
    if (!trip) {
      throw new Error('Trip not found in healthcare dashboard');
    }

    if (trip.status !== 'PENDING') {
      throw new Error(`Unexpected trip status: ${trip.status}`);
    }

    return {
      name: 'Verify trip creation',
      status: 'PASSED',
      message: 'Trip found in healthcare dashboard with correct status',
      data: { tripId: testState.testTripId, status: trip.status }
    };

  } catch (error) {
    throw new Error(`Trip verification failed: ${error.message}`);
  }
}

async function verifyTripVisibility() {
  console.log('   👁️  Verifying trip visibility in EMS dashboard...');
  
  try {
    const response = await axios.get(`${CONFIG.baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${testState.authTokens.ems}` },
      timeout: CONFIG.timeout
    });

    if (!response.data.success || !response.data.data) {
      throw new Error('Trip visibility check failed: No trips data received');
    }

    const trip = response.data.data.find(t => t.id === testState.testTripId);
    if (!trip) {
      throw new Error('Trip not visible in EMS dashboard');
    }

    return {
      name: 'Verify trip visibility',
      status: 'PASSED',
      message: 'Trip visible in EMS dashboard',
      data: { tripId: testState.testTripId }
    };

  } catch (error) {
    throw new Error(`Trip visibility check failed: ${error.message}`);
  }
}

async function verifyTripDataIntegrity() {
  console.log('   🔍 Verifying trip data integrity...');
  
  try {
    const response = await axios.get(`${CONFIG.baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${testState.authTokens.ems}` },
      timeout: CONFIG.timeout
    });

    const trip = response.data.data.find(t => t.id === testState.testTripId);
    if (!trip) {
      throw new Error('Trip not found for data integrity check');
    }

    // Check critical fields
    const requiredFields = ['id', 'status', 'patientId', 'transportLevel', 'urgencyLevel'];
    const missingFields = requiredFields.filter(field => !trip[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Check for unit assignment (this should be null initially)
    if (trip.assignedUnitId !== null) {
      console.log('   ⚠️  Unexpected: Trip already has assigned unit');
    }

    return {
      name: 'Verify trip data integrity',
      status: 'PASSED',
      message: 'Trip data is complete and accurate',
      data: { 
        tripId: testState.testTripId,
        assignedUnitId: trip.assignedUnitId,
        hasAssignedUnit: trip.assignedUnitId !== null
      }
    };

  } catch (error) {
    throw new Error(`Trip data integrity check failed: ${error.message}`);
  }
}

async function acceptTrip() {
  console.log('   ✅ Accepting trip...');
  
  try {
    const response = await axios.put(`${CONFIG.baseURL}/api/trips/${testState.testTripId}/status`, {
      status: 'ACCEPTED'
    }, {
      headers: { Authorization: `Bearer ${testState.authTokens.ems}` },
      timeout: CONFIG.timeout
    });

    if (!response.data.success) {
      throw new Error('Trip acceptance failed');
    }

    return {
      name: 'Accept trip',
      status: 'PASSED',
      message: 'Trip accepted successfully',
      data: { tripId: testState.testTripId }
    };

  } catch (error) {
    throw new Error(`Trip acceptance failed: ${error.message}`);
  }
}

async function verifyStatusUpdate(expectedStatus) {
  console.log(`   🔍 Verifying status update to ${expectedStatus}...`);
  
  try {
    const response = await axios.get(`${CONFIG.baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${testState.authTokens.ems}` },
      timeout: CONFIG.timeout
    });

    const trip = response.data.data.find(t => t.id === testState.testTripId);
    if (!trip) {
      throw new Error('Trip not found for status verification');
    }

    if (trip.status !== expectedStatus) {
      throw new Error(`Status mismatch: expected ${expectedStatus}, got ${trip.status}`);
    }

    return {
      name: `Verify status update to ${expectedStatus}`,
      status: 'PASSED',
      message: `Status correctly updated to ${expectedStatus}`,
      data: { tripId: testState.testTripId, status: trip.status }
    };

  } catch (error) {
    throw new Error(`Status update verification failed: ${error.message}`);
  }
}

async function verifyHealthcareVisibility() {
  console.log('   👁️  Verifying status update visibility in healthcare dashboard...');
  
  try {
    const response = await axios.get(`${CONFIG.baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${testState.authTokens.healthcare}` },
      timeout: CONFIG.timeout
    });

    const trip = response.data.data.find(t => t.id === testState.testTripId);
    if (!trip) {
      throw new Error('Trip not found in healthcare dashboard');
    }

    if (trip.status !== 'ACCEPTED') {
      throw new Error(`Status not updated in healthcare dashboard: ${trip.status}`);
    }

    return {
      name: 'Verify healthcare visibility',
      status: 'PASSED',
      message: 'Status update visible in healthcare dashboard',
      data: { tripId: testState.testTripId, status: trip.status }
    };

  } catch (error) {
    throw new Error(`Healthcare visibility check failed: ${error.message}`);
  }
}

async function attemptUnitAssignment() {
  console.log('   🚗 Attempting unit assignment...');
  
  try {
    const response = await axios.put(`${CONFIG.baseURL}/api/trips/${testState.testTripId}/assign-unit`, {
      unitId: testState.testDataIds.ems.unit
    }, {
      headers: { Authorization: `Bearer ${testState.authTokens.ems}` },
      timeout: CONFIG.timeout
    });

    if (!response.data.success) {
      throw new Error('Unit assignment failed');
    }

    return {
      name: 'Attempt unit assignment',
      status: 'PASSED',
      message: 'Unit assignment request completed',
      data: { 
        tripId: testState.testTripId, 
        unitId: testState.testDataIds.ems.unit 
      }
    };

  } catch (error) {
    // This is expected to fail - it's our main bug area
    const bug = {
      phase: 'Unit Assignment',
      severity: 'CRITICAL',
      description: 'Unit assignment failed',
      error: error.message,
      expected: 'Unit should be assigned successfully',
      actual: 'Assignment failed',
      impact: 'Workflow blocker - trips cannot be assigned to units'
    };
    
    testState.testResults.bugs.push(bug);

    return {
      name: 'Attempt unit assignment',
      status: 'FAILED',
      message: 'Unit assignment failed (expected - this is our main bug)',
      data: { 
        tripId: testState.testTripId, 
        unitId: testState.testDataIds.ems.unit,
        error: error.message
      }
    };
  }
}

async function verifyUnitAssignment() {
  console.log('   🔍 Verifying unit assignment...');
  
  try {
    const response = await axios.get(`${CONFIG.baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${testState.authTokens.ems}` },
      timeout: CONFIG.timeout
    });

    const trip = response.data.data.find(t => t.id === testState.testTripId);
    if (!trip) {
      throw new Error('Trip not found for unit assignment verification');
    }

    if (trip.assignedUnitId === null) {
      const bug = {
        phase: 'Unit Assignment',
        severity: 'CRITICAL',
        description: 'Unit assignment not persisted',
        error: 'assignedUnitId is null after assignment',
        expected: 'assignedUnitId should be set to unit ID',
        actual: 'assignedUnitId is null',
        impact: 'Unit assignment not visible in UI'
      };
      
      testState.testResults.bugs.push(bug);

      return {
        name: 'Verify unit assignment',
        status: 'FAILED',
        message: 'Unit assignment not persisted (expected - this is our main bug)',
        data: { 
          tripId: testState.testTripId,
          assignedUnitId: trip.assignedUnitId,
          expectedUnitId: testState.testDataIds.ems.unit
        }
      };
    }

    return {
      name: 'Verify unit assignment',
      status: 'PASSED',
      message: 'Unit assignment verified successfully',
      data: { 
        tripId: testState.testTripId,
        assignedUnitId: trip.assignedUnitId
      }
    };

  } catch (error) {
    throw new Error(`Unit assignment verification failed: ${error.message}`);
  }
}

async function testAssignmentVisibility() {
  console.log('   👁️  Testing assignment visibility...');
  
  try {
    // Check EMS visibility
    const emsResponse = await axios.get(`${CONFIG.baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${testState.authTokens.ems}` },
      timeout: CONFIG.timeout
    });

    const emsTrip = emsResponse.data.data.find(t => t.id === testState.testTripId);
    if (!emsTrip) {
      throw new Error('Trip not found in EMS dashboard');
    }

    // Check healthcare visibility
    const healthcareResponse = await axios.get(`${CONFIG.baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${testState.authTokens.healthcare}` },
      timeout: CONFIG.timeout
    });

    const healthcareTrip = healthcareResponse.data.data.find(t => t.id === testState.testTripId);
    if (!healthcareTrip) {
      throw new Error('Trip not found in healthcare dashboard');
    }

    // Check if assignment is visible on both sides
    const emsHasAssignment = emsTrip.assignedUnitId !== null;
    const healthcareHasAssignment = healthcareTrip.assignedUnitId !== null;

    if (!emsHasAssignment && !healthcareHasAssignment) {
      const bug = {
        phase: 'Unit Assignment',
        severity: 'CRITICAL',
        description: 'Unit assignment not visible on either side',
        error: 'assignedUnitId is null on both EMS and healthcare sides',
        expected: 'Assignment should be visible on both sides',
        actual: 'Assignment not visible on either side',
        impact: 'Users cannot see which unit is assigned'
      };
      
      testState.testResults.bugs.push(bug);
    }

    return {
      name: 'Test assignment visibility',
      status: emsHasAssignment || healthcareHasAssignment ? 'PASSED' : 'FAILED',
      message: emsHasAssignment || healthcareHasAssignment ? 
        'Assignment visibility verified' : 
        'Assignment not visible on either side (expected - this is our main bug)',
      data: { 
        tripId: testState.testTripId,
        emsHasAssignment,
        healthcareHasAssignment,
        emsAssignedUnitId: emsTrip.assignedUnitId,
        healthcareAssignedUnitId: healthcareTrip.assignedUnitId
      }
    };

  } catch (error) {
    throw new Error(`Assignment visibility test failed: ${error.message}`);
  }
}

async function updateTripStatus(newStatus) {
  console.log(`   📊 Updating trip status to ${newStatus}...`);
  
  try {
    const response = await axios.put(`${CONFIG.baseURL}/api/trips/${testState.testTripId}/status`, {
      status: newStatus
    }, {
      headers: { Authorization: `Bearer ${testState.authTokens.ems}` },
      timeout: CONFIG.timeout
    });

    if (!response.data.success) {
      throw new Error(`Status update to ${newStatus} failed`);
    }

    return {
      name: `Update trip status to ${newStatus}`,
      status: 'PASSED',
      message: `Status updated to ${newStatus} successfully`,
      data: { tripId: testState.testTripId, newStatus }
    };

  } catch (error) {
    throw new Error(`Status update to ${newStatus} failed: ${error.message}`);
  }
}

async function verifyFinalStatus() {
  console.log('   ✅ Verifying final trip status...');
  
  try {
    const response = await axios.get(`${CONFIG.baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${testState.authTokens.healthcare}` },
      timeout: CONFIG.timeout
    });

    const trip = response.data.data.find(t => t.id === testState.testTripId);
    if (!trip) {
      throw new Error('Trip not found for final status verification');
    }

    if (trip.status !== 'COMPLETED') {
      throw new Error(`Final status mismatch: expected COMPLETED, got ${trip.status}`);
    }

    return {
      name: 'Verify final status',
      status: 'PASSED',
      message: 'Final status verified successfully',
      data: { tripId: testState.testTripId, status: trip.status }
    };

  } catch (error) {
    throw new Error(`Final status verification failed: ${error.message}`);
  }
}

async function verifyDatabaseIntegrity() {
  console.log('   🗄️  Verifying database integrity...');
  
  // This would typically involve direct database queries
  // For now, we'll verify through API calls
  
  try {
    const response = await axios.get(`${CONFIG.baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${testState.authTokens.healthcare}` },
      timeout: CONFIG.timeout
    });

    const trip = response.data.data.find(t => t.id === testState.testTripId);
    if (!trip) {
      throw new Error('Trip not found in database');
    }

    // Check for data corruption
    const requiredFields = ['id', 'status', 'patientId', 'createdAt'];
    const missingFields = requiredFields.filter(field => !trip[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Data corruption detected: missing fields ${missingFields.join(', ')}`);
    }

    return {
      name: 'Verify database integrity',
      status: 'PASSED',
      message: 'Database integrity verified',
      data: { tripId: testState.testTripId, hasRequiredFields: true }
    };

  } catch (error) {
    throw new Error(`Database integrity verification failed: ${error.message}`);
  }
}

async function verifyAPIConsistency() {
  console.log('   🔄 Verifying API consistency...');
  
  try {
    // Test API consistency across different endpoints
    const tripsResponse = await axios.get(`${CONFIG.baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${testState.authTokens.healthcare}` },
      timeout: CONFIG.timeout
    });

    const tripResponse = await axios.get(`${CONFIG.baseURL}/api/trips/${testState.testTripId}`, {
      headers: { Authorization: `Bearer ${testState.authTokens.healthcare}` },
      timeout: CONFIG.timeout
    });

    if (!tripsResponse.data.success || !tripResponse.data.success) {
      throw new Error('API consistency check failed: One or more endpoints failed');
    }

    const tripFromList = tripsResponse.data.data.find(t => t.id === testState.testTripId);
    const tripFromDetail = tripResponse.data.data;

    if (!tripFromList || !tripFromDetail) {
      throw new Error('API consistency check failed: Trip not found in one or more endpoints');
    }

    // Compare key fields
    const keyFields = ['id', 'status', 'patientId'];
    const inconsistencies = keyFields.filter(field => 
      tripFromList[field] !== tripFromDetail[field]
    );

    if (inconsistencies.length > 0) {
      throw new Error(`API inconsistency detected: ${inconsistencies.join(', ')}`);
    }

    return {
      name: 'Verify API consistency',
      status: 'PASSED',
      message: 'API consistency verified',
      data: { tripId: testState.testTripId, consistentFields: keyFields }
    };

  } catch (error) {
    throw new Error(`API consistency verification failed: ${error.message}`);
  }
}

async function verifyUIData() {
  console.log('   🖥️  Verifying UI data...');
  
  // This would typically involve UI testing
  // For now, we'll verify through API calls that would be used by the UI
  
  try {
    const response = await axios.get(`${CONFIG.baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${testState.authTokens.healthcare}` },
      timeout: CONFIG.timeout
    });

    const trip = response.data.data.find(t => t.id === testState.testTripId);
    if (!trip) {
      throw new Error('Trip not found for UI data verification');
    }

    // Check that all UI-required fields are present
    const uiFields = ['id', 'status', 'patientId', 'transportLevel', 'urgencyLevel', 'createdAt'];
    const missingFields = uiFields.filter(field => !trip[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`UI data incomplete: missing fields ${missingFields.join(', ')}`);
    }

    return {
      name: 'Verify UI data',
      status: 'PASSED',
      message: 'UI data verified',
      data: { tripId: testState.testTripId, hasUIFields: true }
    };

  } catch (error) {
    throw new Error(`UI data verification failed: ${error.message}`);
  }
}

async function generateTestReport() {
  testState.testResults.endTime = new Date().toISOString();
  testState.testResults.duration = new Date(testState.testResults.endTime) - new Date(testState.testResults.startTime);
  
  // Calculate summary
  const phases = Object.values(testState.testResults.phases);
  const passedPhases = phases.filter(p => p.status === 'PASSED').length;
  const failedPhases = phases.filter(p => p.status === 'FAILED').length;
  
  testState.testResults.summary = {
    status: failedPhases === 0 ? 'PASSED' : 'FAILED',
    totalPhases: phases.length,
    passedPhases,
    failedPhases,
    totalBugs: testState.testResults.bugs.length,
    criticalBugs: testState.testResults.bugs.filter(b => b.severity === 'CRITICAL').length,
    duration: testState.testResults.duration
  };

  await saveTestResults();
}

async function saveTestResults() {
  fs.writeFileSync(CONFIG.resultsFile, JSON.stringify(testState.testResults, null, 2));
}

function displayTestResults() {
  console.log('📊 E2E TEST RESULTS');
  console.log('==================');
  console.log('');
  
  const summary = testState.testResults.summary;
  console.log(`Status: ${summary.status}`);
  console.log(`Duration: ${Math.round(summary.duration / 1000)}s`);
  console.log(`Phases: ${summary.passedPhases}/${summary.totalPhases} passed`);
  console.log(`Bugs Found: ${summary.totalBugs} (${summary.criticalBugs} critical)`);
  console.log('');

  if (testState.testResults.bugs.length > 0) {
    console.log('🐛 BUGS IDENTIFIED:');
    console.log('------------------');
    testState.testResults.bugs.forEach((bug, index) => {
      console.log(`${index + 1}. [${bug.severity}] ${bug.description}`);
      console.log(`   Phase: ${bug.phase}`);
      console.log(`   Error: ${bug.error}`);
      console.log(`   Expected: ${bug.expected}`);
      console.log(`   Actual: ${bug.actual}`);
      console.log(`   Impact: ${bug.impact}`);
      console.log('');
    });
  }

  console.log('📄 Detailed results saved to:', CONFIG.resultsFile);
  console.log('');
  console.log('🎯 Next Steps:');
  console.log('1. Review test results and identified bugs');
  console.log('2. Fix critical bugs (especially unit assignment)');
  console.log('3. Re-run E2E test to verify fixes');
  console.log('4. Clean up test data');
}

// Run the E2E test
runE2ETest().catch(console.error);
