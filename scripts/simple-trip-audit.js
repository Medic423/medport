#!/usr/bin/env node

/**
 * Simple Trip Data Quality Audit
 * Quick audit to identify the most critical data issues
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simpleAudit() {
  console.log('🔍 Simple Trip Data Audit');
  console.log('========================');
  
  try {
    // Get basic trip data
    const trips = await prisma.transportRequest.findMany({
      select: {
        id: true,
        tripNumber: true,
        fromLocation: true,
        toLocation: true,
        patientId: true,
        transportLevel: true,
        urgencyLevel: true,
        fromLocationId: true,
        destinationFacilityId: true,
        healthcareCreatedById: true,
        status: true,
        createdAt: true
      }
    });

    console.log(`📊 Total trips: ${trips.length}`);
    console.log('');

    // Quick analysis
    const issues = {
      missingFromLocation: 0,
      missingToLocation: 0,
      missingPatientId: 0,
      missingTransportLevel: 0,
      missingUrgencyLevel: 0,
      missingFromLocationId: 0,
      missingDestinationFacilityId: 0,
      missingHealthcareCreatedBy: 0,
      unknownLocations: 0
    };

    const problemTrips = [];

    trips.forEach(trip => {
      const tripIssues = [];
      
      if (!trip.fromLocation || trip.fromLocation.trim() === '') {
        issues.missingFromLocation++;
        tripIssues.push('Missing fromLocation');
      }
      
      if (!trip.toLocation || trip.toLocation.trim() === '') {
        issues.missingToLocation++;
        tripIssues.push('Missing toLocation');
      }
      
      if (!trip.patientId || trip.patientId.trim() === '') {
        issues.missingPatientId++;
        tripIssues.push('Missing patientId');
      }
      
      if (!trip.transportLevel || trip.transportLevel.trim() === '') {
        issues.missingTransportLevel++;
        tripIssues.push('Missing transportLevel');
      }
      
      if (!trip.urgencyLevel || trip.urgencyLevel.trim() === '') {
        issues.missingUrgencyLevel++;
        tripIssues.push('Missing urgencyLevel');
      }
      
      if (!trip.fromLocationId) {
        issues.missingFromLocationId++;
        tripIssues.push('Missing fromLocationId');
      }
      
      if (!trip.destinationFacilityId) {
        issues.missingDestinationFacilityId++;
        tripIssues.push('Missing destinationFacilityId');
      }
      
      if (!trip.healthcareCreatedById) {
        issues.missingHealthcareCreatedBy++;
        tripIssues.push('Missing healthcareCreatedById');
      }
      
      if (trip.fromLocation && trip.fromLocation.includes('Unknown')) {
        issues.unknownLocations++;
        tripIssues.push('Unknown fromLocation');
      }
      
      if (trip.toLocation && trip.toLocation.includes('Unknown')) {
        issues.unknownLocations++;
        tripIssues.push('Unknown toLocation');
      }

      if (tripIssues.length > 0) {
        problemTrips.push({
          id: trip.id,
          tripNumber: trip.tripNumber || 'No Number',
          issues: tripIssues,
          fromLocation: trip.fromLocation,
          toLocation: trip.toLocation,
          status: trip.status
        });
      }
    });

    // Display results
    console.log('📋 ISSUE SUMMARY:');
    console.log('=================');
    console.log(`Missing fromLocation: ${issues.missingFromLocation}`);
    console.log(`Missing toLocation: ${issues.missingToLocation}`);
    console.log(`Missing patientId: ${issues.missingPatientId}`);
    console.log(`Missing transportLevel: ${issues.missingTransportLevel}`);
    console.log(`Missing urgencyLevel: ${issues.missingUrgencyLevel}`);
    console.log(`Missing fromLocationId: ${issues.missingFromLocationId}`);
    console.log(`Missing destinationFacilityId: ${issues.missingDestinationFacilityId}`);
    console.log(`Missing healthcareCreatedBy: ${issues.missingHealthcareCreatedBy}`);
    console.log(`Unknown locations: ${issues.unknownLocations}`);
    console.log('');

    const totalIssues = Object.values(issues).reduce((sum, count) => sum + count, 0);
    console.log(`🔢 Total issues found: ${totalIssues}`);
    console.log(`🚨 Trips with problems: ${problemTrips.length}`);
    console.log('');

    if (problemTrips.length > 0) {
      console.log('❌ PROBLEMATIC TRIPS:');
      console.log('====================');
      problemTrips.slice(0, 10).forEach(trip => {
        console.log(`- ${trip.tripNumber} (${trip.id})`);
        console.log(`  Status: ${trip.status}`);
        console.log(`  From: "${trip.fromLocation || 'MISSING'}"`);
        console.log(`  To: "${trip.toLocation || 'MISSING'}"`);
        console.log(`  Issues: ${trip.issues.join(', ')}`);
        console.log('');
      });

      if (problemTrips.length > 10) {
        console.log(`... and ${problemTrips.length - 10} more trips with issues`);
      }
    } else {
      console.log('✅ No problematic trips found!');
    }

    // Recommendations
    console.log('');
    console.log('💡 RECOMMENDATIONS:');
    console.log('===================');
    
    if (issues.missingFromLocation > 0 || issues.missingToLocation > 0) {
      console.log('🔴 CRITICAL: Fix missing location data - these trips cannot be processed');
    }
    
    if (issues.missingPatientId > 0) {
      console.log('🔴 CRITICAL: Fix missing patient IDs - required for trip identification');
    }
    
    if (issues.missingTransportLevel > 0 || issues.missingUrgencyLevel > 0) {
      console.log('🟡 MODERATE: Fix missing transport/urgency levels - affects trip prioritization');
    }
    
    if (issues.missingFromLocationId > 0 || issues.missingDestinationFacilityId > 0) {
      console.log('🟡 MODERATE: Add location/facility IDs - needed for distance calculations');
    }
    
    if (issues.unknownLocations > 0) {
      console.log('🟢 MINOR: Replace "Unknown" locations with proper location names');
    }

    if (totalIssues === 0) {
      console.log('✅ All trips have clean data! Ready for E2E testing.');
    } else {
      console.log('');
      console.log('⚠️  Cleanup recommended before E2E testing.');
    }

  } catch (error) {
    console.error('❌ Error during audit:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

simpleAudit();
