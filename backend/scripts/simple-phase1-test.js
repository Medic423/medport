#!/usr/bin/env node

/**
 * Simple Phase 1 Test - Basic Database Siloing Validation
 * 
 * This script tests the basic database setup and functionality
 * without the complex TypeScript services.
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
 * Database connections using the existing Prisma client
 */
let hospitalDB, emsDB, centerDB;

async function initializeDatabases() {
  try {
    log('🔧 Initializing database connections...', 'blue');
    
    // Use the existing Prisma client with different database URLs
    hospitalDB = new PrismaClient({
      datasources: {
        db: {
          url: process.env.HOSPITAL_DATABASE_URL || 'postgresql://scooper@localhost:5432/medport_hospital'
        }
      }
    });

    emsDB = new PrismaClient({
      datasources: {
        db: {
          url: process.env.EMS_DATABASE_URL || 'postgresql://scooper@localhost:5432/medport_ems'
        }
      }
    });

    centerDB = new PrismaClient({
      datasources: {
        db: {
          url: process.env.CENTER_DATABASE_URL || 'postgresql://scooper@localhost:5432/medport_center'
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
    // Test Hospital DB tables
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

    // Test EMS DB tables
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

    // Test Center DB tables
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
 * Test 2: Basic Database Operations
 */
async function testBasicOperations() {
  log('\n📋 Test 2: Basic Database Operations', 'cyan');
  
  try {
    // Test Hospital DB - try to create a simple record
    const testUser = await hospitalDB.user.create({
      data: {
        email: 'test@hospital.com',
        password: 'hashedpassword123',
        name: 'Test Hospital User',
        role: 'ADMIN',
        isActive: true
      }
    });
    
    recordTest('Hospital DB user creation', !!testUser.id);

    // Test EMS DB - try to create a simple record
    const testAgency = await emsDB.transportAgency.create({
      data: {
        name: 'Test EMS Agency',
        contactName: 'Test Contact',
        phone: '555-0123',
        email: 'test@ems.com',
        address: '123 Test St',
        city: 'Test City',
        state: 'PA',
        zipCode: '12345',
        serviceArea: ['Test Area'],
        operatingHours: '24/7',
        capabilities: ['ALS', 'BLS'],
        isActive: true
      }
    });
    
    recordTest('EMS DB agency creation', !!testAgency.id);

    // Test Center DB - try to create a simple record
    const testConfig = await centerDB.systemConfiguration.create({
      data: {
        key: 'test_key',
        value: 'test_value',
        description: 'Test configuration',
        category: 'test',
        isActive: true
      }
    });
    
    recordTest('Center DB configuration creation', !!testConfig.id);

    // Cleanup test data
    await hospitalDB.user.delete({ where: { id: testUser.id } });
    await emsDB.transportAgency.delete({ where: { id: testAgency.id } });
    await centerDB.systemConfiguration.delete({ where: { id: testConfig.id } });

  } catch (error) {
    recordTest('Basic database operations', false, error.message);
  }
}

/**
 * Test 3: Cross-Database Access Simulation
 */
async function testCrossDatabaseAccess() {
  log('\n📋 Test 3: Cross-Database Access Simulation', 'cyan');
  
  try {
    // Test that we can access different databases independently
    const hospitalUsers = await hospitalDB.user.findMany();
    const emsAgencies = await emsDB.transportAgency.findMany();
    const centerConfigs = await centerDB.systemConfiguration.findMany();
    
    recordTest('Hospital DB access', Array.isArray(hospitalUsers));
    recordTest('EMS DB access', Array.isArray(emsAgencies));
    recordTest('Center DB access', Array.isArray(centerConfigs));

  } catch (error) {
    recordTest('Cross-database access simulation', false, error.message);
  }
}

/**
 * Test 4: Performance Tests
 */
async function testPerformance() {
  log('\n📋 Test 4: Performance Tests', 'cyan');
  
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

    // Test query performance
    const queryStart = Date.now();
    
    await hospitalDB.user.findMany();
    await emsDB.transportAgency.findMany();
    await centerDB.systemConfiguration.findMany();
    
    const queryDuration = Date.now() - queryStart;
    const queryFast = queryDuration < 2000; // Should complete within 2 seconds
    
    recordTest('Database query performance', queryFast,
      queryFast ? `Queries completed in ${queryDuration}ms` : `Queries took ${queryDuration}ms (too slow)`);

  } catch (error) {
    recordTest('Performance tests', false, error.message);
  }
}

/**
 * Main test execution
 */
async function runTests() {
  log('🧪 Simple Phase 1 Testing - Database Siloing Implementation', 'blue');
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
    await testBasicOperations();
    await testCrossDatabaseAccess();
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
      log('🎉 All tests passed! Phase 1 database siloing is working.', 'green');
      log('✅ Basic database setup and operations are functional', 'green');
    } else {
      log('⚠️  Some tests failed. Please review and fix issues.', 'yellow');
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
  testBasicOperations,
  testCrossDatabaseAccess,
  testPerformance
};
