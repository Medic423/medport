#!/usr/bin/env node

/**
 * E2E Test Data Setup Script
 * Phase 2.1.2: Create test data for end-to-end testing
 * 
 * This script creates isolated test data for E2E testing:
 * - Test users (healthcare, EMS, admin)
 * - Test locations and facilities
 * - Test EMS units
 * - Clean test environment
 */

const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Test data configuration
const TEST_DATA = {
  users: {
    healthcare: {
      email: 'test-healthcare-e2e@example.com',
      password: 'TestPass123!',
      name: 'E2E Test Healthcare User',
      userType: 'HEALTHCARE',
      facilityName: 'E2E Test Hospital'
    },
    ems: {
      email: 'test-ems-e2e@example.com',
      password: 'TestPass123!',
      name: 'E2E Test EMS User',
      userType: 'EMS',
      agencyName: 'E2E Test EMS Agency'
    },
    admin: {
      email: 'test-admin-e2e@example.com',
      password: 'TestPass123!',
      name: 'E2E Test Admin User',
      userType: 'ADMIN'
    }
  },
  locations: {
    healthcareLocation: {
      name: 'E2E Test Hospital',
      address: '123 Test Street, Test City, TC 12345',
      city: 'Test City',
      state: 'TC',
      zipCode: '12345',
      phone: '555-0123',
      email: 'test-hospital@example.com',
      latitude: 40.7128,
      longitude: -74.0060
    },
    facility: {
      name: 'E2E Test Facility',
      address: '456 Test Avenue, Test City, TC 12345',
      city: 'Test City',
      state: 'TC',
      zipCode: '12345',
      phone: '555-0456',
      email: 'test-facility@example.com',
      latitude: 40.7589,
      longitude: -73.9851
    }
  },
  emsData: {
    agency: {
      name: 'E2E Test EMS Agency',
      address: '789 EMS Street, Test City, TC 12345',
      city: 'Test City',
      state: 'TC',
      zipCode: '12345',
      phone: '555-0789',
      email: 'test-ems-agency@example.com',
      contactPerson: 'E2E Test Contact',
      licenseNumber: 'E2E-EMS-001'
    },
    unit: {
      unitNumber: 'E2E-001',
      unitName: 'E2E Test Unit 1',
      unitType: 'AMBULANCE',
      status: 'AVAILABLE',
      isActive: true
    }
  }
};

async function setupE2ETestData() {
  console.log('🧪 E2E Test Data Setup');
  console.log('========================');
  console.log('');

  try {
    // Step 1: Clean existing test data
    console.log('🧹 Cleaning existing test data...');
    await cleanTestData();
    console.log('✅ Test data cleaned');
    console.log('');

    // Step 2: Create test users
    console.log('👥 Creating test users...');
    const users = await createTestUsers();
    console.log('✅ Test users created');
    console.log('');

    // Step 3: Create test locations
    console.log('📍 Creating test locations...');
    const locations = await createTestLocations(users);
    console.log('✅ Test locations created');
    console.log('');

    // Step 4: Create test EMS data
    console.log('🚑 Creating test EMS data...');
    const emsData = await createTestEMSData(users);
    console.log('✅ Test EMS data created');
    console.log('');

    // Step 5: Verify setup
    console.log('🔍 Verifying test data setup...');
    await verifyTestData(users, locations, emsData);
    console.log('✅ Test data verification complete');
    console.log('');

    // Step 6: Generate test data summary
    console.log('📊 E2E TEST DATA SUMMARY');
    console.log('=========================');
    console.log('');
    console.log('👥 Test Users:');
    console.log(`   Healthcare: ${users.healthcare.email} (${users.healthcare.id})`);
    console.log(`   EMS: ${users.ems.email} (${users.ems.id})`);
    console.log(`   Admin: ${users.admin.email} (${users.admin.id})`);
    console.log('');
    console.log('📍 Test Locations:');
    console.log(`   Healthcare Location: ${locations.healthcareLocation.name} (${locations.healthcareLocation.id})`);
    console.log(`   Facility: ${locations.facility.name} (${locations.facility.id})`);
    console.log('');
    console.log('🚑 Test EMS Data:');
    console.log(`   Agency: ${emsData.agency.name} (${emsData.agency.id})`);
    console.log(`   Unit: ${emsData.unit.unitNumber} (${emsData.unit.id})`);
    console.log('');
    console.log('🎯 Ready for E2E Testing!');
    console.log('');

    // Save test data IDs for use in E2E test
    const testDataIds = {
      users: {
        healthcare: users.healthcare.id,
        ems: users.ems.id,
        admin: users.admin.id
      },
      locations: {
        healthcareLocation: locations.healthcareLocation.id,
        facility: locations.facility.id
      },
      ems: {
        agency: emsData.agency.id,
        unit: emsData.unit.id
      }
    };

    const fs = require('fs');
    fs.writeFileSync('e2e-test-data-ids.json', JSON.stringify(testDataIds, null, 2));
    console.log('💾 Test data IDs saved to: e2e-test-data-ids.json');

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanTestData() {
  // Clean up any existing test data
  const testEmails = [
    'test-healthcare-e2e@example.com',
    'test-ems-e2e@example.com',
    'test-admin-e2e@example.com'
  ];

  // Delete test users and related data
  for (const email of testEmails) {
    const user = await prisma.centerUser.findUnique({ where: { email } });
    if (user) {
      // Delete related data first
      await prisma.transportRequest.deleteMany({ where: { healthcareCreatedById: user.id } });
      await prisma.healthcareLocation.deleteMany({ where: { userId: user.id } });
      await prisma.unit.deleteMany({ where: { agencyId: user.id } });
      await prisma.emsAgency.deleteMany({ where: { userId: user.id } });
      
      // Delete user
      await prisma.centerUser.delete({ where: { id: user.id } });
    }
  }

  // Delete test locations
  await prisma.healthcareLocation.deleteMany({ where: { name: 'E2E Test Hospital' } });
  await prisma.facility.deleteMany({ where: { name: 'E2E Test Facility' } });
  await prisma.emsAgency.deleteMany({ where: { name: 'E2E Test EMS Agency' } });
}

async function createTestUsers() {
  const users = {};

  // Create healthcare user
  const hashedPassword = await bcrypt.hash(TEST_DATA.users.healthcare.password, 10);
  users.healthcare = await prisma.centerUser.create({
    data: {
      email: TEST_DATA.users.healthcare.email,
      password: hashedPassword,
      name: TEST_DATA.users.healthcare.name,
      userType: TEST_DATA.users.healthcare.userType,
      facilityName: TEST_DATA.users.healthcare.facilityName,
      isActive: true
    }
  });

  // Create EMS user
  const emsHashedPassword = await bcrypt.hash(TEST_DATA.users.ems.password, 10);
  users.ems = await prisma.centerUser.create({
    data: {
      email: TEST_DATA.users.ems.email,
      password: emsHashedPassword,
      name: TEST_DATA.users.ems.name,
      userType: TEST_DATA.users.ems.userType,
      agencyName: TEST_DATA.users.ems.agencyName,
      isActive: true
    }
  });

  // Create admin user
  const adminHashedPassword = await bcrypt.hash(TEST_DATA.users.admin.password, 10);
  users.admin = await prisma.centerUser.create({
    data: {
      email: TEST_DATA.users.admin.email,
      password: adminHashedPassword,
      name: TEST_DATA.users.admin.name,
      userType: TEST_DATA.users.admin.userType,
      isActive: true
    }
  });

  return users;
}

async function createTestLocations(users) {
  const locations = {};

  // Create healthcare location
  locations.healthcareLocation = await prisma.healthcareLocation.create({
    data: {
      name: TEST_DATA.locations.healthcareLocation.name,
      address: TEST_DATA.locations.healthcareLocation.address,
      city: TEST_DATA.locations.healthcareLocation.city,
      state: TEST_DATA.locations.healthcareLocation.state,
      zipCode: TEST_DATA.locations.healthcareLocation.zipCode,
      phone: TEST_DATA.locations.healthcareLocation.phone,
      email: TEST_DATA.locations.healthcareLocation.email,
      latitude: TEST_DATA.locations.healthcareLocation.latitude,
      longitude: TEST_DATA.locations.healthcareLocation.longitude,
      userId: users.healthcare.id,
      isActive: true
    }
  });

  // Create facility
  locations.facility = await prisma.facility.create({
    data: {
      name: TEST_DATA.locations.facility.name,
      address: TEST_DATA.locations.facility.address,
      city: TEST_DATA.locations.facility.city,
      state: TEST_DATA.locations.facility.state,
      zipCode: TEST_DATA.locations.facility.zipCode,
      phone: TEST_DATA.locations.facility.phone,
      email: TEST_DATA.locations.facility.email,
      latitude: TEST_DATA.locations.facility.latitude,
      longitude: TEST_DATA.locations.facility.longitude,
      isActive: true
    }
  });

  return locations;
}

async function createTestEMSData(users) {
  const emsData = {};

  // Create EMS agency
  emsData.agency = await prisma.emsAgency.create({
    data: {
      name: TEST_DATA.emsData.agency.name,
      address: TEST_DATA.emsData.agency.address,
      city: TEST_DATA.emsData.agency.city,
      state: TEST_DATA.emsData.agency.state,
      zipCode: TEST_DATA.emsData.agency.zipCode,
      phone: TEST_DATA.emsData.agency.phone,
      email: TEST_DATA.emsData.agency.email,
      contactPerson: TEST_DATA.emsData.agency.contactPerson,
      licenseNumber: TEST_DATA.emsData.agency.licenseNumber,
      userId: users.ems.id,
      isActive: true
    }
  });

  // Create EMS unit
  emsData.unit = await prisma.unit.create({
    data: {
      unitNumber: TEST_DATA.emsData.unit.unitNumber,
      unitName: TEST_DATA.emsData.unit.unitName,
      unitType: TEST_DATA.emsData.unit.unitType,
      status: TEST_DATA.emsData.unit.status,
      isActive: TEST_DATA.emsData.unit.isActive,
      agencyId: emsData.agency.id
    }
  });

  return emsData;
}

async function verifyTestData(users, locations, emsData) {
  // Verify users exist and can authenticate
  for (const [role, user] of Object.entries(users)) {
    const foundUser = await prisma.centerUser.findUnique({ where: { id: user.id } });
    if (!foundUser) {
      throw new Error(`Test user ${role} not found`);
    }
    console.log(`   ✅ ${role} user verified: ${foundUser.email}`);
  }

  // Verify locations exist
  const foundHealthcareLocation = await prisma.healthcareLocation.findUnique({ 
    where: { id: locations.healthcareLocation.id } 
  });
  if (!foundHealthcareLocation) {
    throw new Error('Healthcare location not found');
  }
  console.log(`   ✅ Healthcare location verified: ${foundHealthcareLocation.name}`);

  const foundFacility = await prisma.facility.findUnique({ 
    where: { id: locations.facility.id } 
  });
  if (!foundFacility) {
    throw new Error('Facility not found');
  }
  console.log(`   ✅ Facility verified: ${foundFacility.name}`);

  // Verify EMS data exists
  const foundAgency = await prisma.emsAgency.findUnique({ 
    where: { id: emsData.agency.id } 
  });
  if (!foundAgency) {
    throw new Error('EMS agency not found');
  }
  console.log(`   ✅ EMS agency verified: ${foundAgency.name}`);

  const foundUnit = await prisma.unit.findUnique({ 
    where: { id: emsData.unit.id } 
  });
  if (!foundUnit) {
    throw new Error('EMS unit not found');
  }
  console.log(`   ✅ EMS unit verified: ${foundUnit.unitNumber}`);

  // Verify relationships
  if (foundUnit.agencyId !== foundAgency.id) {
    throw new Error('Unit not properly linked to agency');
  }
  console.log(`   ✅ Unit-Agency relationship verified`);

  if (foundHealthcareLocation.userId !== users.healthcare.id) {
    throw new Error('Healthcare location not properly linked to user');
  }
  console.log(`   ✅ Healthcare location-User relationship verified`);
}

// Run the setup
setupE2ETestData().catch(console.error);
