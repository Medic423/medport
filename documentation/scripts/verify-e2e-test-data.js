#!/usr/bin/env node

/**
 * E2E Test Data Verification Script
 * Verify that test data is properly set up for E2E testing
 * 
 * This script checks that all test data exists and is properly configured:
 * - Test users can authenticate
 * - Test locations are properly linked
 * - Test EMS data is correctly configured
 * - All relationships are intact
 */

const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyE2ETestData() {
  console.log('🔍 E2E Test Data Verification');
  console.log('==============================');
  console.log('');

  try {
    // Step 1: Load test data IDs
    let testDataIds = null;
    try {
      const fs = require('fs');
      const testDataFile = fs.readFileSync('e2e-test-data-ids.json', 'utf8');
      testDataIds = JSON.parse(testDataFile);
      console.log('📄 Loaded test data IDs from file');
    } catch (error) {
      console.log('❌ No test data IDs file found. Run setup-e2e-test-data.js first.');
      process.exit(1);
    }

    // Step 2: Verify test users
    console.log('👥 Verifying test users...');
    await verifyTestUsers(testDataIds.users);
    console.log('✅ Test users verified');
    console.log('');

    // Step 3: Verify test locations
    console.log('📍 Verifying test locations...');
    await verifyTestLocations(testDataIds.locations);
    console.log('✅ Test locations verified');
    console.log('');

    // Step 4: Verify test EMS data
    console.log('🚑 Verifying test EMS data...');
    await verifyTestEMSData(testDataIds.ems);
    console.log('✅ Test EMS data verified');
    console.log('');

    // Step 5: Verify relationships
    console.log('🔗 Verifying relationships...');
    await verifyRelationships(testDataIds);
    console.log('✅ Relationships verified');
    console.log('');

    // Step 6: Test authentication
    console.log('🔐 Testing authentication...');
    await testAuthentication(testDataIds.users);
    console.log('✅ Authentication verified');
    console.log('');

    console.log('🎉 All E2E test data verification passed!');
    console.log('');
    console.log('📊 VERIFICATION SUMMARY:');
    console.log('========================');
    console.log('✅ Test users: 3 users created and verified');
    console.log('✅ Test locations: 2 locations created and verified');
    console.log('✅ Test EMS data: 1 agency, 1 unit created and verified');
    console.log('✅ Relationships: All relationships properly linked');
    console.log('✅ Authentication: All users can authenticate');
    console.log('');
    console.log('🚀 Ready for E2E testing!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function verifyTestUsers(userIds) {
  const expectedUsers = ['healthcare', 'ems', 'admin'];
  
  for (const role of expectedUsers) {
    const userId = userIds[role];
    if (!userId) {
      throw new Error(`Missing ${role} user ID`);
    }

    let user;
    if (role === 'healthcare') {
      user = await prisma.healthcareUser.findUnique({ where: { id: userId } });
    } else {
      user = await prisma.centerUser.findUnique({ where: { id: userId } });
    }
    if (!user) {
      throw new Error(`${role} user not found`);
    }

    // Verify user properties
    const expectedEmail = `test-${role}-e2e@example.com`;
    if (user.email !== expectedEmail) {
      throw new Error(`${role} user has wrong email: ${user.email}`);
    }

    if (!user.isActive) {
      throw new Error(`${role} user is not active`);
    }

    console.log(`   ✅ ${role} user: ${user.email} (${user.id})`);
  }
}

async function verifyTestLocations(locationIds) {
  // Verify healthcare location
  const healthcareLocation = await prisma.healthcareLocation.findUnique({ 
    where: { id: locationIds.healthcareLocation } 
  });
  if (!healthcareLocation) {
    throw new Error('Healthcare location not found');
  }
  if (healthcareLocation.locationName !== 'E2E Test Hospital') {
    throw new Error('Healthcare location has wrong name');
  }
  console.log(`   ✅ Healthcare location: ${healthcareLocation.locationName} (${healthcareLocation.id})`);

  // Verify facility
  const facility = await prisma.facility.findUnique({ 
    where: { id: locationIds.facility } 
  });
  if (!facility) {
    throw new Error('Facility not found');
  }
  if (facility.name !== 'E2E Test Facility') {
    throw new Error('Facility has wrong name');
  }
  console.log(`   ✅ Facility: ${facility.name} (${facility.id})`);
}

async function verifyTestEMSData(emsIds) {
  // Verify EMS agency
  const agency = await prisma.eMSAgency.findUnique({ 
    where: { id: emsIds.agency } 
  });
  if (!agency) {
    throw new Error('EMS agency not found');
  }
  if (agency.name !== 'E2E Test EMS Agency') {
    throw new Error('EMS agency has wrong name');
  }
  console.log(`   ✅ EMS agency: ${agency.name} (${agency.id})`);

  // Verify EMS unit
  const unit = await prisma.unit.findUnique({ 
    where: { id: emsIds.unit } 
  });
  if (!unit) {
    throw new Error('EMS unit not found');
  }
  if (unit.unitNumber !== 'E2E-001') {
    throw new Error('EMS unit has wrong unit number');
  }
  if (unit.status !== 'AVAILABLE') {
    throw new Error('EMS unit is not available');
  }
  console.log(`   ✅ EMS unit: ${unit.unitNumber} (${unit.id})`);
}

async function verifyRelationships(testDataIds) {
  // Verify unit-agency relationship
  const unit = await prisma.unit.findUnique({ 
    where: { id: testDataIds.ems.unit } 
  });
  if (unit.agencyId !== testDataIds.ems.agency) {
    throw new Error('Unit not properly linked to agency');
  }
  console.log('   ✅ Unit-Agency relationship verified');

  // Verify healthcare location-user relationship
  const healthcareLocation = await prisma.healthcareLocation.findUnique({ 
    where: { id: testDataIds.locations.healthcareLocation } 
  });
  if (healthcareLocation.healthcareUserId !== testDataIds.users.healthcare) {
    throw new Error('Healthcare location not properly linked to user');
  }
  console.log('   ✅ Healthcare location-User relationship verified');

  // Verify EMS agency-user relationship
  const agency = await prisma.eMSAgency.findUnique({ 
    where: { id: testDataIds.ems.agency } 
  });
  if (agency.addedBy !== testDataIds.users.ems) {
    throw new Error('EMS agency not properly linked to user');
  }
  console.log('   ✅ EMS agency-User relationship verified');
}

async function testAuthentication(userIds) {
  const testPassword = 'TestPass123!';

  // Test healthcare user authentication
  const healthcareUser = await prisma.healthcareUser.findUnique({ 
    where: { id: userIds.healthcare } 
  });
  const healthcarePasswordValid = await bcrypt.compare(testPassword, healthcareUser.password);
  if (!healthcarePasswordValid) {
    throw new Error('Healthcare user password authentication failed');
  }
  console.log('   ✅ Healthcare user authentication verified');

  // Test EMS user authentication
  const emsUser = await prisma.centerUser.findUnique({ 
    where: { id: userIds.ems } 
  });
  const emsPasswordValid = await bcrypt.compare(testPassword, emsUser.password);
  if (!emsPasswordValid) {
    throw new Error('EMS user password authentication failed');
  }
  console.log('   ✅ EMS user authentication verified');

  // Test admin user authentication
  const adminUser = await prisma.centerUser.findUnique({ 
    where: { id: userIds.admin } 
  });
  const adminPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
  if (!adminPasswordValid) {
    throw new Error('Admin user password authentication failed');
  }
  console.log('   ✅ Admin user authentication verified');
}

// Run the verification
verifyE2ETestData().catch(console.error);
