#!/usr/bin/env node

/**
 * Conservative Trip Data Cleanup Script
 * Phase 1.1.2: Fix malformed trip data (DO NOT DELETE)
 * 
 * This script focuses on REPAIRING data, not deleting it.
 * All changes are logged and can be rolled back.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_BEFORE_FIX = true;

async function cleanupMalformedTrips() {
  console.log('🔧 TCC Trip Data Cleanup Script');
  console.log('================================');
  console.log('');
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
    console.log('');
  }

  try {
    // Step 1: Create backup if requested
    if (BACKUP_BEFORE_FIX && !DRY_RUN) {
      console.log('📦 Creating backup before cleanup...');
      const backupData = await prisma.transportRequest.findMany();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.writeFileSync(`trip-backup-${timestamp}.json`, JSON.stringify(backupData, null, 2));
      console.log(`✅ Backup created: trip-backup-${timestamp}.json`);
      console.log('');
    }

    // Step 2: Get all trips with their related data
    console.log('🔍 Analyzing trip data...');
    const trips = await prisma.transportRequest.findMany({
      include: {
        healthcareCreatedBy: true,
        assignedUnit: true,
        fromLocation: true,
        destinationFacility: true
      }
    });

    console.log(`📊 Found ${trips.length} trips to analyze`);
    console.log('');

    // Step 3: Identify issues and create fix plan
    const fixPlan = {
      criticalFixes: [],
      moderateFixes: [],
      minorFixes: [],
      skipped: []
    };

    // Step 4: Analyze each trip and create fixes
    trips.forEach((trip, index) => {
      const fixes = [];
      const tripId = trip.id;
      const tripNumber = trip.tripNumber || `Trip-${index + 1}`;

      // CRITICAL FIXES - Required for basic functionality
      
      // Fix missing fromLocation
      if (!trip.fromLocation || trip.fromLocation.trim() === '') {
        const fix = {
          tripId,
          tripNumber,
          field: 'fromLocation',
          currentValue: trip.fromLocation,
          newValue: 'Unknown Origin',
          reason: 'Missing required field - using placeholder',
          severity: 'CRITICAL'
        };
        fixes.push(fix);
        fixPlan.criticalFixes.push(fix);
      }

      // Fix missing toLocation
      if (!trip.toLocation || trip.toLocation.trim() === '') {
        const fix = {
          tripId,
          tripNumber,
          field: 'toLocation',
          currentValue: trip.toLocation,
          newValue: 'Unknown Destination',
          reason: 'Missing required field - using placeholder',
          severity: 'CRITICAL'
        };
        fixes.push(fix);
        fixPlan.criticalFixes.push(fix);
      }

      // Fix missing patientId
      if (!trip.patientId || trip.patientId.trim() === '') {
        const fix = {
          tripId,
          tripNumber,
          field: 'patientId',
          currentValue: trip.patientId,
          newValue: `PATIENT-${tripId.slice(-8).toUpperCase()}`,
          reason: 'Missing required field - generating from trip ID',
          severity: 'CRITICAL'
        };
        fixes.push(fix);
        fixPlan.criticalFixes.push(fix);
      }

      // Fix missing transportLevel
      if (!trip.transportLevel || trip.transportLevel.trim() === '') {
        const fix = {
          tripId,
          tripNumber,
          field: 'transportLevel',
          currentValue: trip.transportLevel,
          newValue: 'BLS',
          reason: 'Missing required field - defaulting to BLS',
          severity: 'CRITICAL'
        };
        fixes.push(fix);
        fixPlan.criticalFixes.push(fix);
      }

      // Fix missing urgencyLevel
      if (!trip.urgencyLevel || trip.urgencyLevel.trim() === '') {
        const fix = {
          tripId,
          tripNumber,
          field: 'urgencyLevel',
          currentValue: trip.urgencyLevel,
          newValue: 'Routine',
          reason: 'Missing required field - defaulting to Routine',
          severity: 'CRITICAL'
        };
        fixes.push(fix);
        fixPlan.criticalFixes.push(fix);
      }

      // MODERATE FIXES - Important for full functionality
      
      // Fix "Unknown" locations with better placeholders
      if (trip.fromLocation && trip.fromLocation.includes('Unknown')) {
        const fix = {
          tripId,
          tripNumber,
          field: 'fromLocation',
          currentValue: trip.fromLocation,
          newValue: trip.fromLocation.replace('Unknown', 'Location'),
          reason: 'Improving placeholder text',
          severity: 'MODERATE'
        };
        fixes.push(fix);
        fixPlan.moderateFixes.push(fix);
      }

      if (trip.toLocation && trip.toLocation.includes('Unknown')) {
        const fix = {
          tripId,
          tripNumber,
          field: 'toLocation',
          currentValue: trip.toLocation,
          newValue: trip.toLocation.replace('Unknown', 'Location'),
          reason: 'Improving placeholder text',
          severity: 'MODERATE'
        };
        fixes.push(fix);
        fixPlan.moderateFixes.push(fix);
      }

      // Fix missing healthcareCreatedById (if we can determine it)
      if (!trip.healthcareCreatedById && trip.healthcareCreatedBy) {
        const fix = {
          tripId,
          tripNumber,
          field: 'healthcareCreatedById',
          currentValue: trip.healthcareCreatedById,
          newValue: trip.healthcareCreatedBy.id,
          reason: 'Missing foreign key - using existing relation',
          severity: 'MODERATE'
        };
        fixes.push(fix);
        fixPlan.moderateFixes.push(fix);
      }

      // MINOR FIXES - Nice to have improvements
      
      // Fix empty strings to null for optional fields
      if (trip.fromLocationId === '') {
        const fix = {
          tripId,
          tripNumber,
          field: 'fromLocationId',
          currentValue: trip.fromLocationId,
          newValue: null,
          reason: 'Empty string converted to null',
          severity: 'MINOR'
        };
        fixes.push(fix);
        fixPlan.minorFixes.push(fix);
      }

      if (trip.destinationFacilityId === '') {
        const fix = {
          tripId,
          tripNumber,
          field: 'destinationFacilityId',
          currentValue: trip.destinationFacilityId,
          newValue: null,
          reason: 'Empty string converted to null',
          severity: 'MINOR'
        };
        fixes.push(fix);
        fixPlan.minorFixes.push(fix);
      }

      // If no fixes needed, mark as skipped
      if (fixes.length === 0) {
        fixPlan.skipped.push({
          tripId,
          tripNumber,
          reason: 'No issues found'
        });
      }
    });

    // Step 5: Display fix plan
    console.log('📋 CLEANUP PLAN');
    console.log('===============');
    console.log(`🔴 Critical fixes: ${fixPlan.criticalFixes.length}`);
    console.log(`🟡 Moderate fixes: ${fixPlan.moderateFixes.length}`);
    console.log(`🟢 Minor fixes: ${fixPlan.minorFixes.length}`);
    console.log(`✅ Trips with no issues: ${fixPlan.skipped.length}`);
    console.log('');

    // Display critical fixes
    if (fixPlan.criticalFixes.length > 0) {
      console.log('🔴 CRITICAL FIXES:');
      fixPlan.criticalFixes.slice(0, 10).forEach(fix => {
        console.log(`   - ${fix.tripNumber}: ${fix.field} "${fix.currentValue}" → "${fix.newValue}"`);
        console.log(`     Reason: ${fix.reason}`);
      });
      if (fixPlan.criticalFixes.length > 10) {
        console.log(`   ... and ${fixPlan.criticalFixes.length - 10} more critical fixes`);
      }
      console.log('');
    }

    // Display moderate fixes
    if (fixPlan.moderateFixes.length > 0) {
      console.log('🟡 MODERATE FIXES:');
      fixPlan.moderateFixes.slice(0, 5).forEach(fix => {
        console.log(`   - ${fix.tripNumber}: ${fix.field} "${fix.currentValue}" → "${fix.newValue}"`);
      });
      if (fixPlan.moderateFixes.length > 5) {
        console.log(`   ... and ${fixPlan.moderateFixes.length - 5} more moderate fixes`);
      }
      console.log('');
    }

    // Step 6: Apply fixes (if not dry run)
    if (!DRY_RUN) {
      console.log('🔧 APPLYING FIXES...');
      console.log('====================');
      
      let appliedFixes = 0;
      let errors = 0;

      // Apply critical fixes first
      for (const fix of fixPlan.criticalFixes) {
        try {
          const updateData = { [fix.field]: fix.newValue };
          await prisma.transportRequest.update({
            where: { id: fix.tripId },
            data: updateData
          });
          console.log(`✅ Fixed ${fix.tripNumber}: ${fix.field}`);
          appliedFixes++;
        } catch (error) {
          console.log(`❌ Failed to fix ${fix.tripNumber}: ${error.message}`);
          errors++;
        }
      }

      // Apply moderate fixes
      for (const fix of fixPlan.moderateFixes) {
        try {
          const updateData = { [fix.field]: fix.newValue };
          await prisma.transportRequest.update({
            where: { id: fix.tripId },
            data: updateData
          });
          console.log(`✅ Fixed ${fix.tripNumber}: ${fix.field}`);
          appliedFixes++;
        } catch (error) {
          console.log(`❌ Failed to fix ${fix.tripNumber}: ${error.message}`);
          errors++;
        }
      }

      // Apply minor fixes
      for (const fix of fixPlan.minorFixes) {
        try {
          const updateData = { [fix.field]: fix.newValue };
          await prisma.transportRequest.update({
            where: { id: fix.tripId },
            data: updateData
          });
          console.log(`✅ Fixed ${fix.tripNumber}: ${fix.field}`);
          appliedFixes++;
        } catch (error) {
          console.log(`❌ Failed to fix ${fix.tripNumber}: ${error.message}`);
          errors++;
        }
      }

      console.log('');
      console.log('📊 CLEANUP RESULTS:');
      console.log(`✅ Fixes applied: ${appliedFixes}`);
      console.log(`❌ Errors: ${errors}`);
      console.log(`📋 Total trips processed: ${trips.length}`);
    } else {
      console.log('🔍 DRY RUN - No changes applied');
      console.log('Run without --dry-run to apply fixes');
    }

    // Step 7: Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      dryRun: DRY_RUN,
      totalTrips: trips.length,
      fixPlan: fixPlan,
      summary: {
        criticalFixes: fixPlan.criticalFixes.length,
        moderateFixes: fixPlan.moderateFixes.length,
        minorFixes: fixPlan.minorFixes.length,
        skipped: fixPlan.skipped.length
      }
    };

    const reportFile = `trip-cleanup-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log('');
    console.log(`📄 Detailed report saved: ${reportFile}`);

    // Step 8: Recommendations
    console.log('');
    console.log('💡 RECOMMENDATIONS:');
    console.log('===================');
    
    if (fixPlan.criticalFixes.length > 0) {
      console.log('🔴 Critical fixes applied - these were blocking basic functionality');
    }
    
    if (fixPlan.moderateFixes.length > 0) {
      console.log('🟡 Moderate fixes applied - these improve data quality');
    }
    
    if (fixPlan.minorFixes.length > 0) {
      console.log('🟢 Minor fixes applied - these clean up data formatting');
    }

    if (fixPlan.skipped.length === trips.length) {
      console.log('✅ All trips were already clean - no fixes needed!');
    }

    console.log('');
    console.log('🔄 Next steps:');
    console.log('1. Verify fixes in the UI');
    console.log('2. Test end-to-end workflow');
    console.log('3. Run Phase 1.1.3 to verify cleanup success');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupMalformedTrips();
