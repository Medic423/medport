#!/usr/bin/env node

/**
 * Siloed Database Testing Script
 * 
 * This script tests the complete data entry process and cross-database functionality
 * by creating fresh test data in each siloed database and verifying all operations work.
 */

const { PrismaClient: HospitalPrismaClient } = require('../dist/prisma/hospital');
const { PrismaClient: EMSPrismaClient } = require('../dist/prisma/ems');
const { PrismaClient: CenterPrismaClient } = require('../dist/prisma/center');

// Database connections
const hospitalDB = new HospitalPrismaClient({
  datasources: {
    db: {
      url: process.env.HOSPITAL_DATABASE_URL || 'postgresql://scooper@localhost:5432/medport_hospital'
    }
  }
});

const emsDB = new EMSPrismaClient({
  datasources: {
    db: {
      url: process.env.EMS_DATABASE_URL || 'postgresql://scooper@localhost:5432/medport_ems'
    }
  }
});

const centerDB = new CenterPrismaClient({
  datasources: {
    db: {
      url: process.env.CENTER_DATABASE_URL || 'postgresql://scooper@localhost:5432/medport_center'
    }
  }
});

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Test data creation functions
 */

async function createTestUsers() {
  log('👥 Creating test users in Center DB...', 'blue');
  
  try {
    // Create Center user
    const timestamp = Date.now();
    const centerUser = await centerDB.user.create({
      data: {
        email: `center-${timestamp}@medport.test`,
        password: '$2b$10$test.hash.for.center.user',
        name: 'Transport Center Admin',
        userType: 'CENTER',
        isActive: true
      }
    });
    log(`  ✅ Created Center user: ${centerUser.email}`, 'green');

    // Create Hospital user
    const hospitalUser = await centerDB.user.create({
      data: {
        email: `hospital-${timestamp}@medport.test`,
        password: '$2b$10$test.hash.for.hospital.user',
        name: 'Hospital Coordinator',
        userType: 'HOSPITAL',
        isActive: true
      }
    });
    log(`  ✅ Created Hospital user: ${hospitalUser.email}`, 'green');

    // Create EMS user
    const emsUser = await centerDB.user.create({
      data: {
        email: `ems-${timestamp}@medport.test`,
        password: '$2b$10$test.hash.for.ems.user',
        name: 'EMS Agency Manager',
        userType: 'EMS',
        isActive: true
      }
    });
    log(`  ✅ Created EMS user: ${emsUser.email}`, 'green');

    return { centerUser, hospitalUser, emsUser };
    
  } catch (error) {
    log(`❌ Error creating test users: ${error.message}`, 'red');
    throw error;
  }
}

async function createTestHospitals() {
  log('🏥 Creating test hospitals in Center DB...', 'blue');
  
  try {
    const hospital1 = await centerDB.hospital.create({
      data: {
        name: 'Test General Hospital',
        address: '123 Medical Drive',
        city: 'Test City',
        state: 'TC',
        zipCode: '12345',
        phone: '555-0101',
        email: 'info@testgeneral.test',
        isActive: true
      }
    });
    log(`  ✅ Created hospital: ${hospital1.name}`, 'green');

    const hospital2 = await centerDB.hospital.create({
      data: {
        name: 'Test Regional Medical Center',
        address: '456 Health Boulevard',
        city: 'Test City',
        state: 'TC',
        zipCode: '12346',
        phone: '555-0102',
        email: 'info@testregional.test',
        isActive: true
      }
    });
    log(`  ✅ Created hospital: ${hospital2.name}`, 'green');

    return { hospital1, hospital2 };
    
  } catch (error) {
    log(`❌ Error creating test hospitals: ${error.message}`, 'red');
    throw error;
  }
}

async function createTestAgencies() {
  log('🚑 Creating test EMS agencies in Center DB...', 'blue');
  
  try {
    const agency1 = await centerDB.agency.create({
      data: {
        name: 'Test EMS Services',
        contactName: 'John Smith',
        phone: '555-0201',
        email: 'contact@testems.test',
        address: '789 Emergency Lane',
        city: 'Test City',
        state: 'TC',
        zipCode: '12347',
        isActive: true
      }
    });
    log(`  ✅ Created agency: ${agency1.name}`, 'green');

    const agency2 = await centerDB.agency.create({
      data: {
        name: 'Test Ambulance Company',
        contactName: 'Jane Doe',
        phone: '555-0202',
        email: 'contact@testambulance.test',
        address: '321 Transport Street',
        city: 'Test City',
        state: 'TC',
        zipCode: '12348',
        isActive: true
      }
    });
    log(`  ✅ Created agency: ${agency2.name}`, 'green');

    return { agency1, agency2 };
    
  } catch (error) {
    log(`❌ Error creating test agencies: ${error.message}`, 'red');
    throw error;
  }
}

async function createTestHospitalUsers(hospitals) {
  log('👨‍⚕️ Creating test hospital users in Hospital DB...', 'blue');
  
  try {
    const hospitalUser1 = await hospitalDB.hospitalUser.create({
      data: {
        email: 'coordinator1@testgeneral.test',
        password: '$2b$10$test.hash.for.hospital.coordinator1',
        name: 'Dr. Sarah Johnson',
        hospitalName: hospitals.hospital1.name,
        isActive: true
      }
    });
    log(`  ✅ Created hospital user: ${hospitalUser1.email}`, 'green');

    const hospitalUser2 = await hospitalDB.hospitalUser.create({
      data: {
        email: 'coordinator2@testregional.test',
        password: '$2b$10$test.hash.for.hospital.coordinator2',
        name: 'Dr. Michael Brown',
        hospitalName: hospitals.hospital2.name,
        isActive: true
      }
    });
    log(`  ✅ Created hospital user: ${hospitalUser2.email}`, 'green');

    return { hospitalUser1, hospitalUser2 };
    
  } catch (error) {
    log(`❌ Error creating test hospital users: ${error.message}`, 'red');
    throw error;
  }
}

async function createTestFacilities(hospitals, hospitalUsers) {
  log('🏢 Creating test facilities in Hospital DB...', 'blue');
  
  try {
    const facility1 = await hospitalDB.hospitalFacility.create({
      data: {
        hospitalId: hospitalUsers.hospitalUser1.id,
        name: 'Test General Hospital - Main Campus',
        type: 'HOSPITAL',
        address: '123 Medical Drive',
        city: 'Test City',
        state: 'TC',
        zipCode: '12345',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        phone: '555-0101',
        email: 'main@testgeneral.test',
        operatingHours: '24/7',
        capabilities: ['Emergency', 'Surgery', 'ICU'],
        isActive: true
      }
    });
    log(`  ✅ Created facility: ${facility1.name}`, 'green');

    const facility2 = await hospitalDB.hospitalFacility.create({
      data: {
        hospitalId: hospitalUsers.hospitalUser2.id,
        name: 'Test Regional - Emergency Department',
        type: 'HOSPITAL',
        address: '456 Health Boulevard',
        city: 'Test City',
        state: 'TC',
        zipCode: '12346',
        coordinates: { lat: 40.7589, lng: -73.9851 },
        phone: '555-0102',
        email: 'emergency@testregional.test',
        operatingHours: '24/7',
        capabilities: ['Emergency', 'Trauma'],
        isActive: true
      }
    });
    log(`  ✅ Created facility: ${facility2.name}`, 'green');

    const facility3 = await hospitalDB.hospitalFacility.create({
      data: {
        hospitalId: hospitalUsers.hospitalUser1.id,
        name: 'Test Nursing Home',
        type: 'NURSING_HOME',
        address: '789 Care Street',
        city: 'Test City',
        state: 'TC',
        zipCode: '12349',
        coordinates: { lat: 40.7505, lng: -73.9934 },
        phone: '555-0103',
        email: 'info@testnursing.test',
        operatingHours: '24/7',
        capabilities: ['Long-term Care', 'Rehabilitation'],
        isActive: true
      }
    });
    log(`  ✅ Created facility: ${facility3.name}`, 'green');

    return { facility1, facility2, facility3 };
    
  } catch (error) {
    log(`❌ Error creating test facilities: ${error.message}`, 'red');
    throw error;
  }
}

async function createTestEMSData(agencies) {
  log('🚑 Creating test EMS data in EMS DB...', 'blue');
  
  try {
    // Create EMS agencies
    const emsAgency1 = await emsDB.eMSAgency.create({
      data: {
        name: agencies.agency1.name,
        contactName: 'John Smith',
        phone: agencies.agency1.phone,
        email: agencies.agency1.email,
        address: agencies.agency1.address,
        city: agencies.agency1.city,
        state: agencies.agency1.state,
        zipCode: agencies.agency1.zipCode,
        serviceArea: ['Test City', 'Test County'],
        operatingHours: '24/7',
        capabilities: ['BLS', 'ALS', 'CCT'],
        pricingStructure: { baseRate: 500, perMile: 15 },
        isActive: true,
        status: 'ACTIVE'
      }
    });
    log(`  ✅ Created EMS agency: ${emsAgency1.name}`, 'green');

    const emsAgency2 = await emsDB.eMSAgency.create({
      data: {
        name: agencies.agency2.name,
        contactName: 'Jane Doe',
        phone: agencies.agency2.phone,
        email: agencies.agency2.email,
        address: agencies.agency2.address,
        city: agencies.agency2.city,
        state: agencies.agency2.state,
        zipCode: agencies.agency2.zipCode,
        serviceArea: ['Test City', 'Test County'],
        operatingHours: '24/7',
        capabilities: ['BLS', 'ALS'],
        pricingStructure: { baseRate: 450, perMile: 12 },
        isActive: true,
        status: 'ACTIVE'
      }
    });
    log(`  ✅ Created EMS agency: ${emsAgency2.name}`, 'green');

    // Create units
    const unit1 = await emsDB.unit.create({
      data: {
        agencyId: emsAgency1.id,
        unitNumber: 'ALS-101',
        type: 'ALS',
        capabilities: ['ALS', 'Cardiac', 'Trauma'],
        currentStatus: 'AVAILABLE',
        currentLocation: { lat: 40.7128, lng: -74.0060 },
        shiftStart: new Date(),
        shiftEnd: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        isActive: true
      }
    });
    log(`  ✅ Created unit: ${unit1.unitNumber}`, 'green');

    const unit2 = await emsDB.unit.create({
      data: {
        agencyId: emsAgency2.id,
        unitNumber: 'BLS-201',
        type: 'BLS',
        capabilities: ['BLS', 'Basic Transport'],
        currentStatus: 'AVAILABLE',
        currentLocation: { lat: 40.7589, lng: -73.9851 },
        shiftStart: new Date(),
        shiftEnd: new Date(Date.now() + 12 * 60 * 60 * 1000),
        isActive: true
      }
    });
    log(`  ✅ Created unit: ${unit2.unitNumber}`, 'green');

    return { emsAgency1, emsAgency2, unit1, unit2 };
    
  } catch (error) {
    log(`❌ Error creating test EMS data: ${error.message}`, 'red');
    throw error;
  }
}

async function createTestTransportRequests(facilities, hospitalUsers) {
  log('🚨 Creating test transport requests in Hospital DB...', 'blue');
  
  try {
    const request1 = await hospitalDB.transportRequest.create({
      data: {
        hospitalId: hospitalUsers.hospitalUser1.id,
        patientId: 'PAT-001',
        originFacilityId: facilities.facility1.id,
        destinationFacilityId: facilities.facility2.id,
        transportLevel: 'ALS',
        priority: 'HIGH',
        status: 'PENDING',
        specialRequirements: 'Cardiac monitoring required',
        requestTimestamp: new Date(),
        createdById: hospitalUsers.hospitalUser1.id
      }
    });
    log(`  ✅ Created transport request: ${request1.id}`, 'green');

    const request2 = await hospitalDB.transportRequest.create({
      data: {
        hospitalId: hospitalUsers.hospitalUser2.id,
        patientId: 'PAT-002',
        originFacilityId: facilities.facility3.id,
        destinationFacilityId: facilities.facility1.id,
        transportLevel: 'BLS',
        priority: 'MEDIUM',
        status: 'PENDING',
        specialRequirements: 'Wheelchair accessible',
        requestTimestamp: new Date(),
        createdById: hospitalUsers.hospitalUser2.id
      }
    });
    log(`  ✅ Created transport request: ${request2.id}`, 'green');

    const request3 = await hospitalDB.transportRequest.create({
      data: {
        hospitalId: hospitalUsers.hospitalUser1.id,
        patientId: 'PAT-003',
        originFacilityId: facilities.facility2.id,
        destinationFacilityId: facilities.facility3.id,
        transportLevel: 'CCT',
        priority: 'URGENT',
        status: 'PENDING',
        specialRequirements: 'Critical care transport with ventilator',
        requestTimestamp: new Date(),
        createdById: hospitalUsers.hospitalUser1.id
      }
    });
    log(`  ✅ Created transport request: ${request3.id}`, 'green');

    return { request1, request2, request3 };
    
  } catch (error) {
    log(`❌ Error creating test transport requests: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Cross-database functionality tests
 */

async function testCrossDatabaseAccess() {
  log('🔗 Testing cross-database access patterns...', 'blue');
  
  try {
    // Test 1: Hospital should be able to see EMS agencies (from Center DB)
    log('  Test 1: Hospital accessing EMS agencies from Center DB...', 'yellow');
    const agencies = await centerDB.agency.findMany({ where: { isActive: true } });
    log(`    ✅ Hospital can see ${agencies.length} EMS agencies`, 'green');

    // Test 2: EMS should be able to see transport requests (from Hospital DB)
    log('  Test 2: EMS accessing transport requests from Hospital DB...', 'yellow');
    const requests = await hospitalDB.transportRequest.findMany({ where: { status: 'PENDING' } });
    log(`    ✅ EMS can see ${requests.length} pending transport requests`, 'green');

    // Test 3: Center should be able to see all transport requests (from Hospital DB)
    log('  Test 3: Center accessing all transport requests from Hospital DB...', 'yellow');
    const allRequests = await hospitalDB.transportRequest.findMany();
    log(`    ✅ Center can see ${allRequests.length} total transport requests`, 'green');

    // Test 4: Center should be able to see all EMS agencies (from Center DB)
    log('  Test 4: Center accessing EMS agencies from Center DB...', 'yellow');
    const allAgencies = await centerDB.agency.findMany();
    log(`    ✅ Center can see ${allAgencies.length} total EMS agencies`, 'green');

    // Test 5: Verify user authentication routing
    log('  Test 5: Testing user authentication routing...', 'yellow');
    const centerUsers = await centerDB.user.findMany({ where: { userType: 'CENTER' } });
    const hospitalUsers = await centerDB.user.findMany({ where: { userType: 'HOSPITAL' } });
    const emsUsers = await centerDB.user.findMany({ where: { userType: 'EMS' } });
    log(`    ✅ Authentication routing: ${centerUsers.length} Center, ${hospitalUsers.length} Hospital, ${emsUsers.length} EMS users`, 'green');

    log('  ✅ All cross-database access tests passed!', 'green');
    return true;
    
  } catch (error) {
    log(`  ❌ Cross-database access test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testDataIntegrity() {
  log('🔍 Testing data integrity and relationships...', 'blue');
  
  try {
    // Test transport request relationships
    const requests = await hospitalDB.transportRequest.findMany({
      include: {
        originFacility: true,
        destinationFacility: true,
        hospitalUser: true
      }
    });

    for (const request of requests) {
      if (!request.originFacility) {
        log(`  ❌ Transport request ${request.id} missing origin facility`, 'red');
        return false;
      }
      if (!request.destinationFacility) {
        log(`  ❌ Transport request ${request.id} missing destination facility`, 'red');
        return false;
      }
      if (!request.hospitalUser) {
        log(`  ❌ Transport request ${request.id} missing hospital user`, 'red');
        return false;
      }
    }
    log(`  ✅ All ${requests.length} transport requests have valid relationships`, 'green');

    // Test EMS unit relationships
    const units = await emsDB.unit.findMany({
      include: { agency: true }
    });

    for (const unit of units) {
      if (!unit.agency) {
        log(`  ❌ Unit ${unit.unitNumber} missing agency relationship`, 'red');
        return false;
      }
    }
    log(`  ✅ All ${units.length} units have valid agency relationships`, 'green');

    log('  ✅ All data integrity tests passed!', 'green');
    return true;
    
  } catch (error) {
    log(`  ❌ Data integrity test failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Main testing function
 */

async function runSiloedDatabaseTest() {
  log('🚀 Starting siloed database functionality test...', 'blue');
  log('', 'reset');
  
  try {
    // Test database connections
    log('🔍 Testing database connections...', 'blue');
    await hospitalDB.$queryRaw`SELECT 1`;
    await emsDB.$queryRaw`SELECT 1`;
    await centerDB.$queryRaw`SELECT 1`;
    log('✅ All database connections successful', 'green');
    log('', 'reset');

    // Create test data
    log('📝 Creating test data...', 'blue');
    const users = await createTestUsers();
    const hospitals = await createTestHospitals();
    const agencies = await createTestAgencies();
    const hospitalUsers = await createTestHospitalUsers(hospitals);
    const facilities = await createTestFacilities(hospitals, hospitalUsers);
    const emsData = await createTestEMSData(agencies);
    const transportRequests = await createTestTransportRequests(facilities, hospitalUsers);
    log('', 'reset');

    // Test cross-database functionality
    const crossDbTest = await testCrossDatabaseAccess();
    log('', 'reset');

    // Test data integrity
    const integrityTest = await testDataIntegrity();
    log('', 'reset');

    // Summary
    if (crossDbTest && integrityTest) {
      log('🎉 All siloed database tests passed!', 'green');
      log('✅ The database siloing architecture is working correctly', 'green');
      log('', 'reset');
      
      log('📊 Test Data Summary:', 'blue');
      log(`  👥 Users: ${Object.keys(users).length} created`, 'green');
      log(`  🏥 Hospitals: ${Object.keys(hospitals).length} created`, 'green');
      log(`  🚑 Agencies: ${Object.keys(agencies).length} created`, 'green');
      log(`  👨‍⚕️ Hospital Users: ${Object.keys(hospitalUsers).length} created`, 'green');
      log(`  🏢 Facilities: ${Object.keys(facilities).length} created`, 'green');
      log(`  🚑 EMS Data: ${Object.keys(emsData).length} created`, 'green');
      log(`  🚨 Transport Requests: ${Object.keys(transportRequests).length} created`, 'green');
      log('', 'reset');
      
      log('🔄 Next Steps:', 'blue');
      log('  1. Update application to use DatabaseManager', 'yellow');
      log('  2. Test frontend integration with siloed databases', 'yellow');
      log('  3. Deploy and monitor system performance', 'yellow');
      log('  4. Consider migrating existing data if needed', 'yellow');
    } else {
      log('❌ Some tests failed - please review the errors above', 'red');
    }

  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    log('', 'reset');
    log('🔧 Troubleshooting:', 'blue');
    log('  1. Check database connections and credentials', 'yellow');
    log('  2. Ensure all databases are running and accessible', 'yellow');
    log('  3. Verify Prisma schemas are properly generated', 'yellow');
    log('  4. Check for constraint violations or conflicts', 'yellow');
    process.exit(1);
  } finally {
    // Close database connections
    await hospitalDB.$disconnect();
    await emsDB.$disconnect();
    await centerDB.$disconnect();
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  runSiloedDatabaseTest();
}

module.exports = {
  runSiloedDatabaseTest,
  createTestUsers,
  createTestHospitals,
  createTestAgencies,
  createTestHospitalUsers,
  createTestFacilities,
  createTestEMSData,
  createTestTransportRequests,
  testCrossDatabaseAccess,
  testDataIntegrity
};
