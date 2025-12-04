#!/usr/bin/env node

/**
 * Cleanup Verification Script
 * Phase 1.1.3: Verify that cleanup was successful
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyCleanup() {
  console.log('✅ TCC Cleanup Verification');
  console.log('============================');
  console.log('');

  try {
    // Get all trips after cleanup
    const trips = await prisma.transportRequest.findMany({
      include: {
        healthcareCreatedBy: true,
        assignedUnit: true,
        fromLocation: true,
        destinationFacility: true
      }
    });

    console.log(`📊 Verifying ${trips.length} trips...`);
    console.log('');

    // Check for remaining issues
    const remainingIssues = {
      missingFromLocation: 0,
      missingToLocation: 0,
      missingPatientId: 0,
      missingTransportLevel: 0,
      missingUrgencyLevel: 0,
      unknownLocations: 0,
      emptyStrings: 0
    };

    const problemTrips = [];

    trips.forEach(trip => {
      const issues = [];
      
      if (!trip.fromLocation || trip.fromLocation.trim() === '') {
        remainingIssues.missingFromLocation++;
        issues.push('Missing fromLocation');
      }
      
      if (!trip.toLocation || trip.toLocation.trim() === '') {
        remainingIssues.missingToLocation++;
        issues.push('Missing toLocation');
      }
      
      if (!trip.patientId || trip.patientId.trim() === '') {
        remainingIssues.missingPatientId++;
        issues.push('Missing patientId');
      }
      
      if (!trip.transportLevel || trip.transportLevel.trim() === '') {
        remainingIssues.missingTransportLevel++;
        issues.push('Missing transportLevel');
      }
      
      if (!trip.urgencyLevel || trip.urgencyLevel.trim() === '') {
        remainingIssues.missingUrgencyLevel++;
        issues.push('Missing urgencyLevel');
      }
      
      if (trip.fromLocation && trip.fromLocation.includes('Unknown')) {
        remainingIssues.unknownLocations++;
        issues.push('Unknown fromLocation');
      }
      
      if (trip.toLocation && trip.toLocation.includes('Unknown')) {
        remainingIssues.unknownLocations++;
        issues.push('Unknown toLocation');
      }

      if (trip.fromLocationId === '' || trip.destinationFacilityId === '') {
        remainingIssues.emptyStrings++;
        issues.push('Empty string fields');
      }

      if (issues.length > 0) {
        problemTrips.push({
          id: trip.id,
          tripNumber: trip.tripNumber || 'No Number',
          issues: issues,
          fromLocation: trip.fromLocation,
          toLocation: trip.toLocation,
          status: trip.status
        });
      }
    });

    // Display results
    console.log('📋 VERIFICATION RESULTS:');
    console.log('========================');
    console.log(`Missing fromLocation: ${remainingIssues.missingFromLocation}`);
    console.log(`Missing toLocation: ${remainingIssues.missingToLocation}`);
    console.log(`Missing patientId: ${remainingIssues.missingPatientId}`);
    console.log(`Missing transportLevel: ${remainingIssues.missingTransportLevel}`);
    console.log(`Missing urgencyLevel: ${remainingIssues.missingUrgencyLevel}`);
    console.log(`Unknown locations: ${remainingIssues.unknownLocations}`);
    console.log(`Empty string fields: ${remainingIssues.emptyStrings}`);
    console.log('');

    const totalIssues = Object.values(remainingIssues).reduce((sum, count) => sum + count, 0);
    
    if (totalIssues === 0) {
      console.log('🎉 SUCCESS: All trips are now clean!');
      console.log('✅ Ready for end-to-end testing');
    } else {
      console.log(`⚠️  ${totalIssues} issues still remain`);
      console.log(`🚨 ${problemTrips.length} trips still have problems`);
      
      if (problemTrips.length > 0) {
        console.log('');
        console.log('❌ REMAINING PROBLEMATIC TRIPS:');
        problemTrips.slice(0, 5).forEach(trip => {
          console.log(`- ${trip.tripNumber} (${trip.id})`);
          console.log(`  Status: ${trip.status}`);
          console.log(`  From: "${trip.fromLocation || 'MISSING'}"`);
          console.log(`  To: "${trip.toLocation || 'MISSING'}"`);
          console.log(`  Issues: ${trip.issues.join(', ')}`);
          console.log('');
        });

        if (problemTrips.length > 5) {
          console.log(`... and ${problemTrips.length - 5} more trips with issues`);
        }
      }
    }

    // Summary
    console.log('');
    console.log('📊 SUMMARY:');
    console.log(`Total trips: ${trips.length}`);
    console.log(`Clean trips: ${trips.length - problemTrips.length}`);
    console.log(`Problem trips: ${problemTrips.length}`);
    console.log(`Total issues: ${totalIssues}`);

    if (totalIssues === 0) {
      console.log('');
      console.log('🚀 NEXT STEPS:');
      console.log('1. Proceed to Phase 2 - Create E2E test framework');
      console.log('2. Test complete workflow: Healthcare → EMS → Healthcare');
      console.log('3. Verify unit assignment functionality');
    } else {
      console.log('');
      console.log('🔧 NEXT STEPS:');
      console.log('1. Review remaining issues above');
      console.log('2. Run cleanup script again if needed');
      console.log('3. Consider manual fixes for complex issues');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCleanup();
