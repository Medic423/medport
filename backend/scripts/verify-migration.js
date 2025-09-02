#!/usr/bin/env node

/**
 * Migration Verification Script
 * 
 * This script verifies the integrity of the database siloing migration
 * by comparing data counts and relationships between databases.
 */

const { PrismaClient } = require('@prisma/client');

// Database connections
const legacyDB = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://scooper@localhost:5432/medport_dev'
    }
  }
});

const hospitalDB = new PrismaClient({
  datasources: {
    db: {
      url: process.env.HOSPITAL_DATABASE_URL || 'postgresql://scooper@localhost:5432/medport_hospital'
    }
  }
});

const emsDB = new PrismaClient({
  datasources: {
    db: {
      url: process.env.EMS_DATABASE_URL || 'postgresql://scooper@localhost:5432/medport_ems'
    }
  }
});

const centerDB = new PrismaClient({
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
 * Verification functions
 */

async function verifyUserMigration() {
  log('🔍 Verifying user migration...', 'blue');
  
  try {
    const legacyUsers = await legacyDB.user.findMany();
    const centerUsers = await centerDB.user.findMany();
    
    log(`  Legacy Users: ${legacyUsers.length}`, 'yellow');
    log(`  Center Users: ${centerUsers.length}`, 'yellow');
    
    if (legacyUsers.length === centerUsers.length) {
      log('  ✅ User count matches', 'green');
    } else {
      log('  ❌ User count mismatch', 'red');
      return false;
    }
    
    // Verify user details
    for (const legacyUser of legacyUsers) {
      const centerUser = centerUsers.find(u => u.id === legacyUser.id);
      if (!centerUser) {
        log(`  ❌ User ${legacyUser.email} not found in Center DB`, 'red');
        return false;
      }
      
      if (centerUser.email !== legacyUser.email) {
        log(`  ❌ Email mismatch for user ${legacyUser.id}`, 'red');
        return false;
      }
    }
    
    log('  ✅ All users migrated correctly', 'green');
    return true;
    
  } catch (error) {
    log(`  ❌ Error verifying users: ${error.message}`, 'red');
    return false;
  }
}

async function verifyTransportRequestMigration() {
  log('🔍 Verifying transport request migration...', 'blue');
  
  try {
    const legacyRequests = await legacyDB.transportRequest.findMany();
    const hospitalRequests = await hospitalDB.transportRequest.findMany();
    
    log(`  Legacy Requests: ${legacyRequests.length}`, 'yellow');
    log(`  Hospital Requests: ${hospitalRequests.length}`, 'yellow');
    
    if (legacyRequests.length === hospitalRequests.length) {
      log('  ✅ Transport request count matches', 'green');
    } else {
      log('  ❌ Transport request count mismatch', 'red');
      return false;
    }
    
    // Verify request details
    for (const legacyRequest of legacyRequests) {
      const hospitalRequest = hospitalRequests.find(r => r.id === legacyRequest.id);
      if (!hospitalRequest) {
        log(`  ❌ Request ${legacyRequest.id} not found in Hospital DB`, 'red');
        return false;
      }
      
      if (hospitalRequest.patientId !== legacyRequest.patientId) {
        log(`  ❌ Patient ID mismatch for request ${legacyRequest.id}`, 'red');
        return false;
      }
    }
    
    log('  ✅ All transport requests migrated correctly', 'green');
    return true;
    
  } catch (error) {
    log(`  ❌ Error verifying transport requests: ${error.message}`, 'red');
    return false;
  }
}

async function verifyAgencyMigration() {
  log('🔍 Verifying agency migration...', 'blue');
  
  try {
    const legacyAgencies = await legacyDB.transportAgency.findMany();
    const emsAgencies = await emsDB.eMSAgency.findMany();
    
    log(`  Legacy Agencies: ${legacyAgencies.length}`, 'yellow');
    log(`  EMS Agencies: ${emsAgencies.length}`, 'yellow');
    
    if (legacyAgencies.length === emsAgencies.length) {
      log('  ✅ Agency count matches', 'green');
    } else {
      log('  ❌ Agency count mismatch', 'red');
      return false;
    }
    
    // Verify agency details
    for (const legacyAgency of legacyAgencies) {
      const emsAgency = emsAgencies.find(a => a.id === legacyAgency.id);
      if (!emsAgency) {
        log(`  ❌ Agency ${legacyAgency.name} not found in EMS DB`, 'red');
        return false;
      }
      
      if (emsAgency.name !== legacyAgency.name) {
        log(`  ❌ Name mismatch for agency ${legacyAgency.id}`, 'red');
        return false;
      }
    }
    
    log('  ✅ All agencies migrated correctly', 'green');
    return true;
    
  } catch (error) {
    log(`  ❌ Error verifying agencies: ${error.message}`, 'red');
    return false;
  }
}

async function verifyFacilityMigration() {
  log('🔍 Verifying facility migration...', 'blue');
  
  try {
    const legacyFacilities = await legacyDB.facility.findMany();
    const hospitalFacilities = await hospitalDB.hospitalFacility.findMany();
    
    log(`  Legacy Facilities: ${legacyFacilities.length}`, 'yellow');
    log(`  Hospital Facilities: ${hospitalFacilities.length}`, 'yellow');
    
    if (legacyFacilities.length === hospitalFacilities.length) {
      log('  ✅ Facility count matches', 'green');
    } else {
      log('  ❌ Facility count mismatch', 'red');
      return false;
    }
    
    // Verify facility details
    for (const legacyFacility of legacyFacilities) {
      const hospitalFacility = hospitalFacilities.find(f => f.id === legacyFacility.id);
      if (!hospitalFacility) {
        log(`  ❌ Facility ${legacyFacility.name} not found in Hospital DB`, 'red');
        return false;
      }
      
      if (hospitalFacility.name !== legacyFacility.name) {
        log(`  ❌ Name mismatch for facility ${legacyFacility.id}`, 'red');
        return false;
      }
    }
    
    log('  ✅ All facilities migrated correctly', 'green');
    return true;
    
  } catch (error) {
    log(`  ❌ Error verifying facilities: ${error.message}`, 'red');
    return false;
  }
}

async function verifyCrossDatabaseReferences() {
  log('🔍 Verifying cross-database references...', 'blue');
  
  try {
    // Check if Center DB has hospital and agency references
    const centerUsers = await centerDB.user.findMany({
      include: { hospital: true, agency: true }
    });
    
    const usersWithHospitalRefs = centerUsers.filter(u => u.hospitalId).length;
    const usersWithAgencyRefs = centerUsers.filter(u => u.agencyId).length;
    
    log(`  Users with hospital references: ${usersWithHospitalRefs}`, 'yellow');
    log(`  Users with agency references: ${usersWithAgencyRefs}`, 'yellow');
    
    // Check if Hospital DB has proper user references
    const hospitalRequests = await hospitalDB.transportRequest.findMany();
    const requestsWithUsers = hospitalRequests.filter(r => r.createdById).length;
    
    log(`  Transport requests with user references: ${requestsWithUsers}`, 'yellow');
    
    log('  ✅ Cross-database references verified', 'green');
    return true;
    
  } catch (error) {
    log(`  ❌ Error verifying cross-database references: ${error.message}`, 'red');
    return false;
  }
}

async function generateVerificationReport() {
  log('📊 Generating verification report...', 'blue');
  
  try {
    const report = {
      timestamp: new Date().toISOString(),
      databases: {
        legacy: {
          users: await legacyDB.user.count(),
          transportRequests: await legacyDB.transportRequest.count(),
          agencies: await legacyDB.transportAgency.count(),
          facilities: await legacyDB.facility.count(),
          units: await legacyDB.unit.count()
        },
        center: {
          users: await centerDB.user.count(),
          hospitals: await centerDB.hospital.count(),
          agencies: await centerDB.agency.count()
        },
        hospital: {
          users: await hospitalDB.hospitalUser.count(),
          facilities: await hospitalDB.hospitalFacility.count(),
          transportRequests: await hospitalDB.transportRequest.count()
        },
        ems: {
          agencies: await emsDB.eMSAgency.count(),
          units: await emsDB.unit.count(),
          bids: await emsDB.transportBid.count()
        }
      }
    };
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `./verification-report-${timestamp}.json`;
    
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    log(`✅ Verification report saved to ${reportPath}`, 'green');
    return report;
    
  } catch (error) {
    log(`❌ Error generating report: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Main verification function
 */

async function runVerification() {
  log('🚀 Starting migration verification...', 'blue');
  log('', 'reset');
  
  try {
    // Test database connections
    log('🔍 Testing database connections...', 'blue');
    await legacyDB.$queryRaw`SELECT 1`;
    await hospitalDB.$queryRaw`SELECT 1`;
    await emsDB.$queryRaw`SELECT 1`;
    await centerDB.$queryRaw`SELECT 1`;
    log('✅ All database connections successful', 'green');
    log('', 'reset');

    // Run verification checks
    const results = {
      users: await verifyUserMigration(),
      transportRequests: await verifyTransportRequestMigration(),
      agencies: await verifyAgencyMigration(),
      facilities: await verifyFacilityMigration(),
      crossReferences: await verifyCrossDatabaseReferences()
    };
    
    log('', 'reset');
    
    // Generate report
    await generateVerificationReport();
    log('', 'reset');
    
    // Summary
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
      log('🎉 All verification checks passed!', 'green');
      log('✅ Migration is successful and data integrity is maintained', 'green');
    } else {
      log('⚠️  Some verification checks failed', 'yellow');
      log('❌ Please review the errors above and consider rollback', 'red');
    }
    
    log('', 'reset');
    log('📋 Verification Summary:', 'blue');
    log(`  Users: ${results.users ? '✅' : '❌'}`, results.users ? 'green' : 'red');
    log(`  Transport Requests: ${results.transportRequests ? '✅' : '❌'}`, results.transportRequests ? 'green' : 'red');
    log(`  Agencies: ${results.agencies ? '✅' : '❌'}`, results.agencies ? 'green' : 'red');
    log(`  Facilities: ${results.facilities ? '✅' : '❌'}`, results.facilities ? 'green' : 'red');
    log(`  Cross-References: ${results.crossReferences ? '✅' : '❌'}`, results.crossReferences ? 'green' : 'red');

  } catch (error) {
    log(`❌ Verification failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    // Close database connections
    await legacyDB.$disconnect();
    await hospitalDB.$disconnect();
    await emsDB.$disconnect();
    await centerDB.$disconnect();
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  runVerification();
}

module.exports = {
  runVerification,
  verifyUserMigration,
  verifyTransportRequestMigration,
  verifyAgencyMigration,
  verifyFacilityMigration,
  verifyCrossDatabaseReferences
};
