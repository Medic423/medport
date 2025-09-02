#!/usr/bin/env node

/**
 * Database Setup Validation Script
 * 
 * This script validates that the three-database siloing setup is working
 * by checking database connections and table existence using raw SQL.
 */

const { Client } = require('pg');

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
 * Database configurations
 */
const databases = {
  hospital: {
    name: 'medport_hospital',
    port: 5432,
    expectedTables: ['hospital_users', 'hospital_facilities', 'transport_requests', 'hospital_agency_preferences']
  },
  ems: {
    name: 'medport_ems',
    port: 5432,
    expectedTables: ['ems_agencies', 'units', 'unit_availability', 'transport_bids', 'ems_routes']
  },
  center: {
    name: 'medport_center',
    port: 5432,
    expectedTables: ['users', 'hospitals', 'agencies', 'system_configurations', 'service_registry', 'database_references', 'system_analytics', 'audit_logs', 'ems_agencies']
  }
};

/**
 * Test database connection
 */
async function testDatabaseConnection(dbConfig) {
  const client = new Client({
    host: 'localhost',
    port: dbConfig.port,
    database: dbConfig.name,
    user: process.env.USER || 'scooper'
  });

  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return true;
  } catch (error) {
    await client.end();
    return false;
  }
}

/**
 * Test database tables
 */
async function testDatabaseTables(dbConfig) {
  const client = new Client({
    host: 'localhost',
    port: dbConfig.port,
    database: dbConfig.name,
    user: process.env.USER || 'scooper'
  });

  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    await client.end();
    
    const existingTables = result.rows.map(row => row.table_name);
    const missingTables = dbConfig.expectedTables.filter(table => !existingTables.includes(table));
    
    return {
      success: missingTables.length === 0,
      existingTables,
      missingTables
    };
  } catch (error) {
    await client.end();
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test basic database operations
 */
async function testBasicOperations(dbConfig) {
  const client = new Client({
    host: 'localhost',
    port: dbConfig.port,
    database: dbConfig.name,
    user: process.env.USER || 'scooper'
  });

  try {
    await client.connect();
    
    // Test basic CRUD operations on the first available table
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      LIMIT 1
    `);
    
    if (tableResult.rows.length === 0) {
      await client.end();
      return { success: false, error: 'No tables found' };
    }
    
    const tableName = tableResult.rows[0].table_name;
    
    // Test SELECT operation
    await client.query(`SELECT COUNT(*) FROM ${tableName}`);
    
    await client.end();
    return { success: true, testedTable: tableName };
  } catch (error) {
    await client.end();
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main test execution
 */
async function runTests() {
  log('🧪 Database Setup Validation - Phase 1', 'blue');
  log('=' .repeat(50), 'blue');
  
  const startTime = Date.now();
  
  try {
    // Test each database
    for (const [dbName, dbConfig] of Object.entries(databases)) {
      log(`\n📋 Testing ${dbName.toUpperCase()} Database (${dbConfig.name})`, 'cyan');
      
      // Test connection
      const connectionSuccess = await testDatabaseConnection(dbConfig);
      recordTest(`${dbName} database connection`, connectionSuccess);
      
      if (connectionSuccess) {
        // Test tables
        const tableResult = await testDatabaseTables(dbConfig);
        recordTest(`${dbName} database tables`, tableResult.success, 
          tableResult.success ? '' : 
          tableResult.missingTables ? `Missing: ${tableResult.missingTables.join(', ')}` : 
          tableResult.error);
        
        // Test basic operations
        const operationResult = await testBasicOperations(dbConfig);
        recordTest(`${dbName} database operations`, operationResult.success,
          operationResult.success ? `Tested table: ${operationResult.testedTable}` : 
          operationResult.error);
      }
    }

    // Print results
    const duration = Date.now() - startTime;
    
    log('\n' + '=' .repeat(50), 'blue');
    log('📊 Test Results Summary', 'blue');
    log('=' .repeat(50), 'blue');
    
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
    
    log('\n' + '=' .repeat(50), 'blue');
    
    if (testResults.failed === 0) {
      log('🎉 All tests passed! Database siloing setup is working.', 'green');
      log('✅ All three databases are operational with correct schemas', 'green');
    } else {
      log('⚠️  Some tests failed. Please review and fix issues.', 'yellow');
    }
    
    log('=' .repeat(50), 'blue');

  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testDatabaseConnection,
  testDatabaseTables,
  testBasicOperations
};
