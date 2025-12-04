#!/usr/bin/env node

/**
 * E2E Test Data Cleanup Script
 * Clean up test data after E2E testing
 * 
 * This script removes all test data created for E2E testing:
 * - Test users and related data
 * - Test locations and facilities
 * - Test EMS data
 * - Test trips created during testing
 */

const { PrismaClient } = require('../backend/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function cleanupE2ETestData() {
  console.log('🧹 E2E Test Data Cleanup');
  console.log('========================');
  console.log('');

  try {
    // Step 1: Load test data IDs if available
    let testDataIds = null;
    try {
      const fs = require('fs');
      const testDataFile = fs.readFileSync('e2e-test-data-ids.json', 'utf8');
      testDataIds = JSON.parse(testDataFile);
      console.log('📄 Loaded test data IDs from file');
    } catch (error) {
      console.log('⚠️  No test data IDs file found, using email-based cleanup');
    }

    // Step 2: Clean up test data
    console.log('🧹 Cleaning up test data...');
    
    if (testDataIds) {
      await cleanupByIds(testDataIds);
    } else {
      await cleanupByEmails();
    }

    console.log('✅ Test data cleanup complete');
    console.log('');

    // Step 3: Verify cleanup
    console.log('🔍 Verifying cleanup...');
    await verifyCleanup();
    console.log('✅ Cleanup verification complete');
    console.log('');

    // Step 4: Clean up test data IDs file
    try {
      const fs = require('fs');
      fs.unlinkSync('e2e-test-data-ids.json');
      console.log('🗑️  Test data IDs file removed');
    } catch (error) {
      // File doesn't exist, that's fine
    }

    console.log('🎉 E2E test data cleanup complete!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanupByIds(testDataIds) {
  console.log('   Using ID-based cleanup...');

  // Clean up test trips first
  const testUserIds = Object.values(testDataIds.users);
  const deletedTrips = await prisma.transportRequest.deleteMany({
    where: {
      OR: [
        { healthcareCreatedById: { in: testUserIds } },
        { assignedAgencyId: { in: testUserIds } }
      ]
    }
  });
  console.log(`   🗑️  Deleted ${deletedTrips.count} test trips`);

  // Clean up test units
  if (testDataIds.ems.unit) {
    await prisma.unit.deleteMany({
      where: { id: testDataIds.ems.unit }
    });
    console.log('   🗑️  Deleted test unit');
  }

  // Clean up test agency
  if (testDataIds.ems.agency) {
    await prisma.emsAgency.deleteMany({
      where: { id: testDataIds.ems.agency }
    });
    console.log('   🗑️  Deleted test agency');
  }

  // Clean up test locations
  if (testDataIds.locations.healthcareLocation) {
    await prisma.healthcareLocation.deleteMany({
      where: { id: testDataIds.locations.healthcareLocation }
    });
    console.log('   🗑️  Deleted test healthcare location');
  }

  if (testDataIds.locations.facility) {
    await prisma.facility.deleteMany({
      where: { id: testDataIds.locations.facility }
    });
    console.log('   🗑️  Deleted test facility');
  }

  // Clean up test users
  await prisma.centerUser.deleteMany({
    where: { id: { in: testUserIds } }
  });
  console.log(`   🗑️  Deleted ${testUserIds.length} test users`);
}

async function cleanupByEmails() {
  console.log('   Using email-based cleanup...');

  const testEmails = [
    'test-healthcare-e2e@example.com',
    'test-ems-e2e@example.com',
    'test-admin-e2e@example.com'
  ];

  // Find and delete test users and related data
  for (const email of testEmails) {
    const user = await prisma.centerUser.findUnique({ where: { email } });
    if (user) {
      // Delete related data first
      const deletedTrips = await prisma.transportRequest.deleteMany({ 
        where: { healthcareCreatedById: user.id } 
      });
      console.log(`   🗑️  Deleted ${deletedTrips.count} trips for ${email}`);

      await prisma.healthcareLocation.deleteMany({ where: { userId: user.id } });
      await prisma.unit.deleteMany({ where: { agencyId: user.id } });
      await prisma.emsAgency.deleteMany({ where: { userId: user.id } });
      
      // Delete user
      await prisma.centerUser.delete({ where: { id: user.id } });
      console.log(`   🗑️  Deleted user: ${email}`);
    }
  }

  // Delete test locations by name
  const deletedHealthcareLocations = await prisma.healthcareLocation.deleteMany({ 
    where: { name: 'E2E Test Hospital' } 
  });
  console.log(`   🗑️  Deleted ${deletedHealthcareLocations.count} test healthcare locations`);

  const deletedFacilities = await prisma.facility.deleteMany({ 
    where: { name: 'E2E Test Facility' } 
  });
  console.log(`   🗑️  Deleted ${deletedFacilities.count} test facilities`);

  const deletedAgencies = await prisma.emsAgency.deleteMany({ 
    where: { name: 'E2E Test EMS Agency' } 
  });
  console.log(`   🗑️  Deleted ${deletedAgencies.count} test EMS agencies`);
}

async function verifyCleanup() {
  // Check that no test users remain
  const testEmails = [
    'test-healthcare-e2e@example.com',
    'test-ems-e2e@example.com',
    'test-admin-e2e@example.com'
  ];

  for (const email of testEmails) {
    const user = await prisma.centerUser.findUnique({ where: { email } });
    if (user) {
      throw new Error(`Test user still exists: ${email}`);
    }
  }
  console.log('   ✅ No test users found');

  // Check that no test locations remain
  const testHealthcareLocation = await prisma.healthcareLocation.findFirst({ 
    where: { name: 'E2E Test Hospital' } 
  });
  if (testHealthcareLocation) {
    throw new Error('Test healthcare location still exists');
  }
  console.log('   ✅ No test healthcare locations found');

  const testFacility = await prisma.facility.findFirst({ 
    where: { name: 'E2E Test Facility' } 
  });
  if (testFacility) {
    throw new Error('Test facility still exists');
  }
  console.log('   ✅ No test facilities found');

  const testAgency = await prisma.emsAgency.findFirst({ 
    where: { name: 'E2E Test EMS Agency' } 
  });
  if (testAgency) {
    throw new Error('Test EMS agency still exists');
  }
  console.log('   ✅ No test EMS agencies found');

  const testUnit = await prisma.unit.findFirst({ 
    where: { unitNumber: 'E2E-001' } 
  });
  if (testUnit) {
    throw new Error('Test EMS unit still exists');
  }
  console.log('   ✅ No test EMS units found');
}

// Run the cleanup
cleanupE2ETestData().catch(console.error);
