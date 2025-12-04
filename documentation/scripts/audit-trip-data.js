#!/usr/bin/env node

/**
 * Trip Data Quality Audit Script
 * Phase 1.1.1: Audit existing trips for data quality issues
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://scooper@localhost:5432/medport_ems?schema=public'
    }
  }
});

async function auditTripData() {
  console.log('🔍 TCC Trip Data Quality Audit');
  console.log('================================');
  console.log('');

  try {
    // Get all trips
    const trips = await prisma.transportRequest.findMany({
      include: {
        healthcareCreatedBy: true,
        assignedUnit: true,
        fromLocation: true,
        destinationFacility: true
      }
    });

    console.log(`📊 Total trips found: ${trips.length}`);
    console.log('');

    // Initialize audit results
    const auditResults = {
      totalTrips: trips.length,
      issues: {
        missingFromLocation: [],
        missingToLocation: [],
        missingFromLocationId: [],
        missingDestinationFacilityId: [],
        missingPatientId: [],
        missingTransportLevel: [],
        missingUrgencyLevel: [],
        invalidFromLocationId: [],
        invalidDestinationFacilityId: [],
        missingHealthcareCreatedBy: [],
        malformedData: []
      },
      summary: {
        criticalIssues: 0,
        moderateIssues: 0,
        minorIssues: 0
      }
    };

    // Audit each trip
    trips.forEach((trip, index) => {
      const tripIssues = [];
      const tripId = trip.id;
      const tripNumber = trip.tripNumber || `Trip-${index + 1}`;

      // Critical issues (missing required fields)
      if (!trip.fromLocation || trip.fromLocation.trim() === '') {
        auditResults.issues.missingFromLocation.push({
          id: tripId,
          tripNumber,
          issue: 'Missing fromLocation'
        });
        tripIssues.push('Missing fromLocation');
        auditResults.summary.criticalIssues++;
      }

      if (!trip.toLocation || trip.toLocation.trim() === '') {
        auditResults.issues.missingToLocation.push({
          id: tripId,
          tripNumber,
          issue: 'Missing toLocation'
        });
        tripIssues.push('Missing toLocation');
        auditResults.summary.criticalIssues++;
      }

      if (!trip.patientId || trip.patientId.trim() === '') {
        auditResults.issues.missingPatientId.push({
          id: tripId,
          tripNumber,
          issue: 'Missing patientId'
        });
        tripIssues.push('Missing patientId');
        auditResults.summary.criticalIssues++;
      }

      if (!trip.transportLevel || trip.transportLevel.trim() === '') {
        auditResults.issues.missingTransportLevel.push({
          id: tripId,
          tripNumber,
          issue: 'Missing transportLevel'
        });
        tripIssues.push('Missing transportLevel');
        auditResults.summary.criticalIssues++;
      }

      if (!trip.urgencyLevel || trip.urgencyLevel.trim() === '') {
        auditResults.issues.missingUrgencyLevel.push({
          id: tripId,
          tripNumber,
          issue: 'Missing urgencyLevel'
        });
        tripIssues.push('Missing urgencyLevel');
        auditResults.summary.criticalIssues++;
      }

      // Moderate issues (missing optional but important fields)
      if (!trip.fromLocationId) {
        auditResults.issues.missingFromLocationId.push({
          id: tripId,
          tripNumber,
          issue: 'Missing fromLocationId'
        });
        tripIssues.push('Missing fromLocationId');
        auditResults.summary.moderateIssues++;
      }

      if (!trip.destinationFacilityId) {
        auditResults.issues.missingDestinationFacilityId.push({
          id: tripId,
          tripNumber,
          issue: 'Missing destinationFacilityId'
        });
        tripIssues.push('Missing destinationFacilityId');
        auditResults.summary.moderateIssues++;
      }

      if (!trip.healthcareCreatedById) {
        auditResults.issues.missingHealthcareCreatedBy.push({
          id: tripId,
          tripNumber,
          issue: 'Missing healthcareCreatedById'
        });
        tripIssues.push('Missing healthcareCreatedById');
        auditResults.summary.moderateIssues++;
      }

      // Check for invalid references
      if (trip.fromLocationId && !trip.fromLocation) {
        auditResults.issues.invalidFromLocationId.push({
          id: tripId,
          tripNumber,
          issue: 'Has fromLocationId but no fromLocation data',
          fromLocationId: trip.fromLocationId
        });
        tripIssues.push('Invalid fromLocationId reference');
        auditResults.summary.moderateIssues++;
      }

      if (trip.destinationFacilityId && !trip.destinationFacility) {
        auditResults.issues.invalidDestinationFacilityId.push({
          id: tripId,
          tripNumber,
          issue: 'Has destinationFacilityId but no destinationFacility data',
          destinationFacilityId: trip.destinationFacilityId
        });
        tripIssues.push('Invalid destinationFacilityId reference');
        auditResults.summary.moderateIssues++;
      }

      // Check for malformed data
      if (trip.fromLocation && trip.fromLocation.includes('Unknown')) {
        auditResults.issues.malformedData.push({
          id: tripId,
          tripNumber,
          issue: 'fromLocation contains "Unknown"',
          value: trip.fromLocation
        });
        tripIssues.push('Malformed fromLocation');
        auditResults.summary.minorIssues++;
      }

      if (trip.toLocation && trip.toLocation.includes('Unknown')) {
        auditResults.issues.malformedData.push({
          id: tripId,
          tripNumber,
          issue: 'toLocation contains "Unknown"',
          value: trip.toLocation
        });
        tripIssues.push('Malformed toLocation');
        auditResults.summary.minorIssues++;
      }

      // If trip has multiple issues, add to malformed data
      if (tripIssues.length > 3) {
        auditResults.issues.malformedData.push({
          id: tripId,
          tripNumber,
          issue: `Multiple issues: ${tripIssues.join(', ')}`,
          issues: tripIssues
        });
      }
    });

    // Display results
    console.log('📋 AUDIT RESULTS');
    console.log('================');
    console.log('');

    console.log(`🔴 Critical Issues: ${auditResults.summary.criticalIssues}`);
    console.log(`🟡 Moderate Issues: ${auditResults.summary.moderateIssues}`);
    console.log(`🟢 Minor Issues: ${auditResults.summary.minorIssues}`);
    console.log('');

    // Display detailed issues
    if (auditResults.issues.missingFromLocation.length > 0) {
      console.log('❌ MISSING FROM LOCATION:');
      auditResults.issues.missingFromLocation.forEach(issue => {
        console.log(`   - ${issue.tripNumber} (${issue.id}): ${issue.issue}`);
      });
      console.log('');
    }

    if (auditResults.issues.missingToLocation.length > 0) {
      console.log('❌ MISSING TO LOCATION:');
      auditResults.issues.missingToLocation.forEach(issue => {
        console.log(`   - ${issue.tripNumber} (${issue.id}): ${issue.issue}`);
      });
      console.log('');
    }

    if (auditResults.issues.missingPatientId.length > 0) {
      console.log('❌ MISSING PATIENT ID:');
      auditResults.issues.missingPatientId.forEach(issue => {
        console.log(`   - ${issue.tripNumber} (${issue.id}): ${issue.issue}`);
      });
      console.log('');
    }

    if (auditResults.issues.missingTransportLevel.length > 0) {
      console.log('❌ MISSING TRANSPORT LEVEL:');
      auditResults.issues.missingTransportLevel.forEach(issue => {
        console.log(`   - ${issue.tripNumber} (${issue.id}): ${issue.issue}`);
      });
      console.log('');
    }

    if (auditResults.issues.missingUrgencyLevel.length > 0) {
      console.log('❌ MISSING URGENCY LEVEL:');
      auditResults.issues.missingUrgencyLevel.forEach(issue => {
        console.log(`   - ${issue.tripNumber} (${issue.id}): ${issue.issue}`);
      });
      console.log('');
    }

    if (auditResults.issues.missingFromLocationId.length > 0) {
      console.log('⚠️  MISSING FROM LOCATION ID:');
      auditResults.issues.missingFromLocationId.forEach(issue => {
        console.log(`   - ${issue.tripNumber} (${issue.id}): ${issue.issue}`);
      });
      console.log('');
    }

    if (auditResults.issues.missingDestinationFacilityId.length > 0) {
      console.log('⚠️  MISSING DESTINATION FACILITY ID:');
      auditResults.issues.missingDestinationFacilityId.forEach(issue => {
        console.log(`   - ${issue.tripNumber} (${issue.id}): ${issue.issue}`);
      });
      console.log('');
    }

    if (auditResults.issues.missingHealthcareCreatedBy.length > 0) {
      console.log('⚠️  MISSING HEALTHCARE CREATED BY:');
      auditResults.issues.missingHealthcareCreatedBy.forEach(issue => {
        console.log(`   - ${issue.tripNumber} (${issue.id}): ${issue.issue}`);
      });
      console.log('');
    }

    if (auditResults.issues.invalidFromLocationId.length > 0) {
      console.log('⚠️  INVALID FROM LOCATION ID REFERENCES:');
      auditResults.issues.invalidFromLocationId.forEach(issue => {
        console.log(`   - ${issue.tripNumber} (${issue.id}): ${issue.issue}`);
      });
      console.log('');
    }

    if (auditResults.issues.invalidDestinationFacilityId.length > 0) {
      console.log('⚠️  INVALID DESTINATION FACILITY ID REFERENCES:');
      auditResults.issues.invalidDestinationFacilityId.forEach(issue => {
        console.log(`   - ${issue.tripNumber} (${issue.id}): ${issue.issue}`);
      });
      console.log('');
    }

    if (auditResults.issues.malformedData.length > 0) {
      console.log('🔧 MALFORMED DATA:');
      auditResults.issues.malformedData.forEach(issue => {
        console.log(`   - ${issue.tripNumber} (${issue.id}): ${issue.issue}`);
        if (issue.value) {
          console.log(`     Value: "${issue.value}"`);
        }
        if (issue.issues) {
          console.log(`     Issues: ${issue.issues.join(', ')}`);
        }
      });
      console.log('');
    }

    // Summary
    console.log('📊 SUMMARY');
    console.log('==========');
    console.log(`Total trips audited: ${auditResults.totalTrips}`);
    console.log(`Trips with critical issues: ${auditResults.summary.criticalIssues}`);
    console.log(`Trips with moderate issues: ${auditResults.summary.moderateIssues}`);
    console.log(`Trips with minor issues: ${auditResults.summary.minorIssues}`);
    console.log('');

    const totalIssues = auditResults.summary.criticalIssues + auditResults.summary.moderateIssues + auditResults.summary.minorIssues;
    if (totalIssues === 0) {
      console.log('✅ All trips have clean data! No cleanup needed.');
    } else {
      console.log(`⚠️  ${totalIssues} total issues found. Cleanup recommended.`);
    }

    // Save detailed results to file
    const fs = require('fs');
    const auditReport = {
      timestamp: new Date().toISOString(),
      summary: auditResults.summary,
      totalTrips: auditResults.totalTrips,
      issues: auditResults.issues
    };

    fs.writeFileSync('trip-audit-report.json', JSON.stringify(auditReport, null, 2));
    console.log('');
    console.log('📄 Detailed audit report saved to: trip-audit-report.json');

  } catch (error) {
    console.error('❌ Error during audit:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the audit
auditTripData().catch(console.error);
