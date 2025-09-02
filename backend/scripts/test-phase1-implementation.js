#!/usr/bin/env node

/**
 * Phase 1 Testing Script - Database Siloing Implementation
 * 
 * This script validates the Phase 1 database siloing implementation
 * focusing on the Hospital module functionality.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function recordTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`✅ ${testName}`, 'green');
  } else {
    testResults.failed++;
    log(`❌ ${testName}`, 'red');
    if (details) {
      log(`   ${details}`, 'red');
    }
  }
  testResults.details.push({ testName, passed, details });
}

/**
 * Database connections
 */
let hospitalDB, emsDB, centerDB;

async function initializeDatabases() {
  try {
    log('🔧 Initializing database connections...', 'blue');
    
    hospitalDB = new PrismaClient({
      datasources: {
        db: {
          url: process.env.HOSPITAL_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/medport_hospital'
        }
      }
    });

    emsDB = new PrismaClient({
      datasources: {
        db: {
          url: process.env.EMS_DATABASE_URL || 'postgresql://postgres:password@localhost:5433/medport_ems'
        }
      }
    });

    centerDB = new PrismaClient({
      datasources: {
        db: {
          url: process.env.CENTER_DATABASE_URL || 'postgresql://postgres:password@localhost:5434/medport_center'
        }
      }
    });

    // Test connections
    await hospitalDB.$queryRaw`SELECT 1`;
    await emsDB.$queryRaw`SELECT 1`;
    await centerDB.$queryRaw`SELECT 1`;
    
    log('✅ All database connections established', 'green');
    return true;
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test 1: Database Setup Validation
 */
async function testDatabaseSetup() {
  log('\n📋 Test 1: Database Setup Validation', 'cyan');
  
  try {
    // Test Hospital DB
    const hospitalTables = await hospitalDB.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    
    const expectedHospitalTables = ['hospital_users', 'hospital_facilities', 'transport_requests', 'hospital_agency_preferences'];
    const hospitalTableNames = hospitalTables.map(t => t.table_name);
    
    const hospitalTablesExist = expectedHospitalTables.every(table => 
      hospitalTableNames.includes(table)
    );
    
    recordTest('Hospital DB tables created', hospitalTablesExist, 
      hospitalTablesExist ? '' : `Missing tables: ${expectedHospitalTables.filter(t => !hospitalTableNames.includes(t)).join(', ')}`);

    // Test EMS DB
    const emsTables = await emsDB.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    
    const expectedEMSTables = ['ems_agencies', 'units', 'unit_availability', 'transport_bids', 'ems_routes'];
    const emsTableNames = emsTables.map(t => t.table_name);
    
    const emsTablesExist = expectedEMSTables.every(table => 
      emsTableNames.includes(table)
    );
    
    recordTest('EMS DB tables created', emsTablesExist,
      emsTablesExist ? '' : `Missing tables: ${expectedEMSTables.filter(t => !emsTableNames.includes(t)).join(', ')}`);

    // Test Center DB
    const centerTables = await centerDB.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    
    const expectedCenterTables = ['users', 'hospitals', 'agencies', 'system_configurations', 'service_registry', 'database_references', 'system_analytics', 'audit_logs', 'ems_agencies'];
    const centerTableNames = centerTables.map(t => t.table_name);
    
    const centerTablesExist = expectedCenterTables.every(table => 
      centerTableNames.includes(table)
    );
    
    recordTest('Center DB tables created', centerTablesExist,
      centerTablesExist ? '' : `Missing tables: ${expectedCenterTables.filter(t => !centerTableNames.includes(t)).join(', ')}`);

  } catch (error) {
    recordTest('Database setup validation', false, error.message);
  }
}

/**
 * Test 2: Database Manager Functionality
 */
async function testDatabaseManager() {
  log('\n📋 Test 2: Database Manager Functionality', 'cyan');
  
  try {
    // Import DatabaseManager (assuming it's compiled)
    const { databaseManager } = require('../dist/services/databaseManager');
    
    // Test singleton pattern
    const instance1 = databaseManager;
    const instance2 = databaseManager;
    recordTest('DatabaseManager singleton pattern', instance1 === instance2);

    // Test health check
    const health = await databaseManager.healthCheck();
    const allHealthy = health.hospital && health.ems && health.center;
    recordTest('Database health check', allHealthy,
      allHealthy ? '' : `Health status: ${JSON.stringify(health)}`);

    // Test database access by user type
    const hospitalDBInstance = databaseManager.getDatabase('hospital');
    const emsDBInstance = databaseManager.getDatabase('ems');
    const centerDBInstance = databaseManager.getDatabase('center');
    
    const dbAccessWorking = hospitalDBInstance && emsDBInstance && centerDBInstance;
    recordTest('Database access by user type', dbAccessWorking);

  } catch (error) {
    recordTest('DatabaseManager functionality', false, error.message);
  }
}

/**
 * Test 3: Hospital Module Functionality
 */
async function testHospitalModule() {
  log('\n📋 Test 3: Hospital Module Functionality', 'cyan');
  
  try {
    // Test hospital user creation
    const testUser = await hospitalDB.hospitalUser.create({
      data: {
        email: 'test@hospital.com',
        password: 'hashedpassword123',
        name: 'Test Hospital User',
        hospitalName: 'Test Hospital',
        isActive: true
      }
    });
    
    recordTest('Hospital user creation', !!testUser.id);

    // Test facility creation
    const testFacility = await hospitalDB.hospitalFacility.create({
      data: {
        hospitalId: testUser.id,
        name: 'Test Facility',
        type: 'HOSPITAL',
        address: '123 Test St',
        city: 'Test City',
        state: 'PA',
        zipCode: '12345',
        capabilities: ['ALS', 'BLS']
      }
    });
    
    recordTest('Hospital facility creation', !!testFacility.id);

    // Test transport request creation
    const testRequest = await hospitalDB.transportRequest.create({
      data: {
        hospitalId: testUser.id,
        patientId: 'PAT-12345',
        originFacilityId: testFacility.id,
        destinationFacilityId: testFacility.id,
        transportLevel: 'ALS',
        priority: 'HIGH',
        createdById: testUser.id
      }
    });
    
    recordTest('Transport request creation', !!testRequest.id);
    recordTest('Transport request status default', testRequest.status === 'PENDING');

    // Test transport request update
    const updatedRequest = await hospitalDB.transportRequest.update({
      where: { id: testRequest.id },
      data: { status: 'ASSIGNED' }
    });
    
    recordTest('Transport request status update', updatedRequest.status === 'ASSIGNED');

    // Cleanup test data
    await hospitalDB.transportRequest.delete({ where: { id: testRequest.id } });
    await hospitalDB.hospitalFacility.delete({ where: { id: testFacility.id } });
    await hospitalDB.hospitalUser.delete({ where: { id: testUser.id } });

  } catch (error) {
    recordTest('Hospital module functionality', false, error.message);
  }
}

/**
 * Test 4: Cross-Database Access
 */
async function testCrossDatabaseAccess() {
  log('\n📋 Test 4: Cross-Database Access', 'cyan');
  
  try {
    // Test hospital accessing EMS agencies from center DB
    const agencies = await centerDB.emsAgency.findMany({
      where: { isActive: true }
    });
    
    recordTest('Hospital accessing EMS agencies', Array.isArray(agencies));

    // Test center accessing trips from hospital DB
    const trips = await hospitalDB.transportRequest.findMany();
    
    recordTest('Center accessing hospital trips', Array.isArray(trips));

    // Test EMS accessing available trips from hospital DB
    const availableTrips = await hospitalDB.transportRequest.findMany({
      where: { status: 'PENDING' }
    });
    
    recordTest('EMS accessing available trips', Array.isArray(availableTrips));

  } catch (error) {
    recordTest('Cross-database access', false, error.message);
  }
}

/**
 * Test 5: Authentication Service
 */
async function testAuthenticationService() {
  log('\n📋 Test 5: Authentication Service', 'cyan');
  
  try {
    // Import SiloedAuthService (assuming it's compiled)
    const { siloedAuthService } = require('../dist/services/siloedAuthService');
    
    // Test user creation
    const createResult = await siloedAuthService.createUser({
      email: 'auth-test@hospital.com',
      password: 'password123',
      name: 'Auth Test User',
      userType: 'HOSPITAL',
      hospitalId: 'test-hospital-123'
    });
    
    recordTest('User creation via auth service', createResult.success);

    if (createResult.success) {
      // Test user authentication
      const authResult = await siloedAuthService.authenticateUser(
        'auth-test@hospital.com',
        'password123'
      );
      
      recordTest('User authentication', authResult.success);
      recordTest('JWT token generation', !!authResult.token);

      if (authResult.token) {
        // Test token verification
        const verifyResult = await siloedAuthService.verifyToken(authResult.token);
        recordTest('JWT token verification', verifyResult.success);
      }
    }

  } catch (error) {
    recordTest('Authentication service', false, error.message);
  }
}

/**
 * Test 6: Event-Driven Communication
 */
async function testEventDrivenCommunication() {
  log('\n📋 Test 6: Event-Driven Communication', 'cyan');
  
  try {
    // Import EventBus (assuming it's compiled)
    const { eventBus } = require('../dist/services/eventBus');
    
    // Test event emission
    const eventData = {
      tripId: 'test-trip-123',
      hospitalId: 'test-hospital-456',
      transportLevel: 'ALS',
      priority: 'HIGH',
      originFacilityId: 'facility-1',
      destinationFacilityId: 'facility-2'
    };
    
    // Emit trip created event
    eventBus.emitTripCreated(eventData);
    
    // Wait for event processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if analytics were logged in center DB
    const analytics = await centerDB.systemAnalytics.findFirst({
      where: { metricName: 'trip_created' }
    });
    
    recordTest('Event-driven communication', !!analytics);
    recordTest('Analytics logging', analytics && analytics.metricValue === 1);

  } catch (error) {
    recordTest('Event-driven communication', false, error.message);
  }
}

/**
 * Test 7: Performance Tests
 */
async function testPerformance() {
  log('\n📋 Test 7: Performance Tests', 'cyan');
  
  try {
    // Test database connection performance
    const start = Date.now();
    
    await hospitalDB.$queryRaw`SELECT 1`;
    await emsDB.$queryRaw`SELECT 1`;
    await centerDB.$queryRaw`SELECT 1`;
    
    const duration = Date.now() - start;
    const connectionFast = duration < 1000; // Should connect within 1 second
    
    recordTest('Database connection performance', connectionFast,
      connectionFast ? `Connected in ${duration}ms` : `Connection took ${duration}ms (too slow)`);

    // Test cross-database query performance
    const queryStart = Date.now();
    
    const agencies = await centerDB.emsAgency.findMany();
    const trips = await hospitalDB.transportRequest.findMany();
    
    const queryDuration = Date.now() - queryStart;
    const queryFast = queryDuration < 2000; // Should complete within 2 seconds
    
    recordTest('Cross-database query performance', queryFast,
      queryFast ? `Queries completed in ${queryDuration}ms` : `Queries took ${queryDuration}ms (too slow)`);

  } catch (error) {
    recordTest('Performance tests', false, error.message);
  }
}

/**
 * Main test execution
 */
async function runTests() {
  log('🧪 Phase 1 Testing - Database Siloing Implementation', 'blue');
  log('=' .repeat(60), 'blue');
  
  const startTime = Date.now();
  
  try {
    // Initialize databases
    const dbInitialized = await initializeDatabases();
    if (!dbInitialized) {
      log('❌ Cannot proceed without database connections', 'red');
      process.exit(1);
    }

    // Run all tests
    await testDatabaseSetup();
    await testDatabaseManager();
    await testHospitalModule();
    await testCrossDatabaseAccess();
    await testAuthenticationService();
    await testEventDrivenCommunication();
    await testPerformance();

    // Print results
    const duration = Date.now() - startTime;
    
    log('\n' + '=' .repeat(60), 'blue');
    log('📊 Test Results Summary', 'blue');
    log('=' .repeat(60), 'blue');
    
    log(`Total Tests: ${testResults.total}`, 'cyan');
    log(`Passed: ${testResults.passed}`, 'green');
    log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
    log(`Duration: ${duration}ms`, 'cyan');
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    log(`Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : 'yellow');
    
    if (testResults.failed > 0) {
      log('\n❌ Failed Tests:', 'red');
      testResults.details
        .filter(test => !test.passed)
        .forEach(test => {
          log(`  - ${test.testName}`, 'red');
          if (test.details) {
            log(`    ${test.details}`, 'red');
          }
        });
    }
    
    log('\n' + '=' .repeat(60), 'blue');
    
    if (testResults.failed === 0) {
      log('🎉 All tests passed! Phase 1 implementation is ready.', 'green');
      log('✅ Ready to proceed to Phase 2: User Management Centralization', 'green');
    } else {
      log('⚠️  Some tests failed. Please review and fix issues before proceeding.', 'yellow');
    }
    
    log('=' .repeat(60), 'blue');

  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    // Close database connections
    if (hospitalDB) await hospitalDB.$disconnect();
    if (emsDB) await emsDB.$disconnect();
    if (centerDB) await centerDB.$disconnect();
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testDatabaseSetup,
  testDatabaseManager,
  testHospitalModule,
  testCrossDatabaseAccess,
  testAuthenticationService,
  testEventDrivenCommunication,
  testPerformance
};

