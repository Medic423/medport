#!/usr/bin/env node

/**
 * Migration Rollback Script
 * 
 * This script provides rollback functionality for the database siloing migration.
 * It can restore the system to use the original single database.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

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
 * Rollback functions
 */

async function createRollbackBackup() {
  log('💾 Creating rollback backup...', 'blue');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `./rollback-backup-${timestamp}`;
    
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Backup current siloed database states
    const backupData = {
      timestamp: new Date().toISOString(),
      center: {
        users: await centerDB.user.findMany(),
        hospitals: await centerDB.hospital.findMany(),
        agencies: await centerDB.agency.findMany()
      },
      hospital: {
        users: await hospitalDB.hospitalUser.findMany(),
        facilities: await hospitalDB.hospitalFacility.findMany(),
        transportRequests: await hospitalDB.transportRequest.findMany()
      },
      ems: {
        agencies: await emsDB.eMSAgency.findMany(),
        units: await emsDB.unit.findMany(),
        bids: await emsDB.transportBid.findMany()
      }
    };
    
    fs.writeFileSync(
      `${backupDir}/siloed-data-backup.json`,
      JSON.stringify(backupData, null, 2)
    );
    
    log(`✅ Rollback backup created in ${backupDir}`, 'green');
    return backupDir;
    
  } catch (error) {
    log(`❌ Rollback backup creation failed: ${error.message}`, 'red');
    throw error;
  }
}

async function restoreUsersToLegacy() {
  log('🔄 Restoring users to legacy database...', 'blue');
  
  try {
    const centerUsers = await centerDB.user.findMany();
    log(`Found ${centerUsers.length} users to restore`, 'yellow');
    
    for (const user of centerUsers) {
      try {
        // Check if user already exists in legacy DB
        const existingUser = await legacyDB.user.findUnique({
          where: { id: user.id }
        });
        
        if (!existingUser) {
          // Create user in legacy DB
          await legacyDB.user.create({
            data: {
              id: user.id,
              email: user.email,
              password: user.password,
              name: user.name,
              role: mapUserTypeToRole(user.userType),
              isActive: user.isActive,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            }
          });
          log(`  ✅ Restored user: ${user.email}`, 'green');
        } else {
          log(`  ⚠️  User ${user.email} already exists in legacy DB`, 'yellow');
        }
      } catch (userError) {
        log(`  ❌ Failed to restore user ${user.email}: ${userError.message}`, 'red');
      }
    }
    
    log('✅ User restoration completed', 'green');
    
  } catch (error) {
    log(`❌ Error restoring users: ${error.message}`, 'red');
    throw error;
  }
}

async function restoreTransportRequestsToLegacy() {
  log('🔄 Restoring transport requests to legacy database...', 'blue');
  
  try {
    const hospitalRequests = await hospitalDB.transportRequest.findMany();
    log(`Found ${hospitalRequests.length} transport requests to restore`, 'yellow');
    
    for (const request of hospitalRequests) {
      try {
        // Check if request already exists in legacy DB
        const existingRequest = await legacyDB.transportRequest.findUnique({
          where: { id: request.id }
        });
        
        if (!existingRequest) {
          // Create request in legacy DB
          await legacyDB.transportRequest.create({
            data: {
              id: request.id,
              patientId: request.patientId,
              originFacilityId: request.originFacilityId,
              destinationFacilityId: request.destinationFacilityId,
              transportLevel: request.transportLevel,
              priority: request.priority,
              status: request.status,
              specialRequirements: request.specialRequirements,
              requestTimestamp: request.requestTimestamp,
              acceptedTimestamp: request.acceptedTimestamp,
              pickupTimestamp: request.pickupTimestamp,
              completionTimestamp: request.completionTimestamp,
              assignedAgencyId: request.assignedAgencyId,
              assignedUnitId: request.assignedUnitId,
              createdById: request.createdById,
              cancellationReason: request.cancellationReason,
              createdAt: request.createdAt,
              updatedAt: request.updatedAt
            }
          });
          log(`  ✅ Restored transport request: ${request.id}`, 'green');
        } else {
          log(`  ⚠️  Transport request ${request.id} already exists in legacy DB`, 'yellow');
        }
      } catch (requestError) {
        log(`  ❌ Failed to restore transport request ${request.id}: ${requestError.message}`, 'red');
      }
    }
    
    log('✅ Transport request restoration completed', 'green');
    
  } catch (error) {
    log(`❌ Error restoring transport requests: ${error.message}`, 'red');
    throw error;
  }
}

async function restoreAgenciesToLegacy() {
  log('🔄 Restoring agencies to legacy database...', 'blue');
  
  try {
    const emsAgencies = await emsDB.eMSAgency.findMany();
    log(`Found ${emsAgencies.length} agencies to restore`, 'yellow');
    
    for (const agency of emsAgencies) {
      try {
        // Check if agency already exists in legacy DB
        const existingAgency = await legacyDB.transportAgency.findUnique({
          where: { id: agency.id }
        });
        
        if (!existingAgency) {
          // Create agency in legacy DB
          await legacyDB.transportAgency.create({
            data: {
              id: agency.id,
              name: agency.name,
              contactName: agency.contactName,
              phone: agency.phone,
              email: agency.email,
              address: agency.address,
              city: agency.city,
              state: agency.state,
              zipCode: agency.zipCode,
              serviceArea: agency.serviceArea,
              operatingHours: agency.operatingHours,
              capabilities: agency.capabilities,
              pricingStructure: agency.pricingStructure,
              isActive: agency.isActive,
              status: mapServiceStatusToLegacy(agency.status),
              addedBy: agency.addedBy,
              addedAt: agency.addedAt,
              createdAt: agency.createdAt,
              updatedAt: agency.updatedAt
            }
          });
          log(`  ✅ Restored agency: ${agency.name}`, 'green');
        } else {
          log(`  ⚠️  Agency ${agency.name} already exists in legacy DB`, 'yellow');
        }
      } catch (agencyError) {
        log(`  ❌ Failed to restore agency ${agency.name}: ${agencyError.message}`, 'red');
      }
    }
    
    log('✅ Agency restoration completed', 'green');
    
  } catch (error) {
    log(`❌ Error restoring agencies: ${error.message}`, 'red');
    throw error;
  }
}

async function restoreFacilitiesToLegacy() {
  log('🔄 Restoring facilities to legacy database...', 'blue');
  
  try {
    const hospitalFacilities = await hospitalDB.hospitalFacility.findMany();
    log(`Found ${hospitalFacilities.length} facilities to restore`, 'yellow');
    
    for (const facility of hospitalFacilities) {
      try {
        // Check if facility already exists in legacy DB
        const existingFacility = await legacyDB.facility.findUnique({
          where: { id: facility.id }
        });
        
        if (!existingFacility) {
          // Create facility in legacy DB
          await legacyDB.facility.create({
            data: {
              id: facility.id,
              name: facility.name,
              type: facility.type,
              address: facility.address,
              city: facility.city,
              state: facility.state,
              zipCode: facility.zipCode,
              coordinates: facility.coordinates,
              phone: facility.phone,
              email: facility.email,
              operatingHours: facility.operatingHours,
              capabilities: facility.capabilities,
              isActive: facility.isActive,
              createdAt: facility.createdAt,
              updatedAt: facility.updatedAt
            }
          });
          log(`  ✅ Restored facility: ${facility.name}`, 'green');
        } else {
          log(`  ⚠️  Facility ${facility.name} already exists in legacy DB`, 'yellow');
        }
      } catch (facilityError) {
        log(`  ❌ Failed to restore facility ${facility.name}: ${facilityError.message}`, 'red');
      }
    }
    
    log('✅ Facility restoration completed', 'green');
    
  } catch (error) {
    log(`❌ Error restoring facilities: ${error.message}`, 'red');
    throw error;
  }
}

async function restoreUnitsToLegacy() {
  log('🔄 Restoring units to legacy database...', 'blue');
  
  try {
    const emsUnits = await emsDB.unit.findMany();
    log(`Found ${emsUnits.length} units to restore`, 'yellow');
    
    for (const unit of emsUnits) {
      try {
        // Check if unit already exists in legacy DB
        const existingUnit = await legacyDB.unit.findUnique({
          where: { id: unit.id }
        });
        
        if (!existingUnit) {
          // Create unit in legacy DB
          await legacyDB.unit.create({
            data: {
              id: unit.id,
              agencyId: unit.agencyId,
              unitNumber: unit.unitNumber,
              type: unit.type,
              capabilities: unit.capabilities,
              currentStatus: unit.currentStatus,
              currentLocation: unit.currentLocation,
              shiftStart: unit.shiftStart,
              shiftEnd: unit.shiftEnd,
              isActive: unit.isActive,
              createdAt: unit.createdAt,
              updatedAt: unit.updatedAt
            }
          });
          log(`  ✅ Restored unit: ${unit.unitNumber}`, 'green');
        } else {
          log(`  ⚠️  Unit ${unit.unitNumber} already exists in legacy DB`, 'yellow');
        }
      } catch (unitError) {
        log(`  ❌ Failed to restore unit ${unit.unitNumber}: ${unitError.message}`, 'red');
      }
    }
    
    log('✅ Unit restoration completed', 'green');
    
  } catch (error) {
    log(`❌ Error restoring units: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Helper functions
 */

function mapUserTypeToRole(userType) {
  const roleMapping = {
    'CENTER': 'ADMIN',
    'HOSPITAL': 'HOSPITAL_COORDINATOR',
    'EMS': 'TRANSPORT_AGENCY'
  };
  
  return roleMapping[userType] || 'COORDINATOR';
}

function mapServiceStatusToLegacy(status) {
  const statusMapping = {
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
    'PENDING': 'PENDING'
  };
  
  return statusMapping[status] || 'ACTIVE';
}

/**
 * Main rollback function
 */

async function runRollback() {
  log('🚀 Starting migration rollback...', 'blue');
  log('⚠️  This will restore data from siloed databases to the legacy database', 'yellow');
  log('', 'reset');
  
  let backupDir = null;
  
  try {
    // Test database connections
    log('🔍 Testing database connections...', 'blue');
    await legacyDB.$queryRaw`SELECT 1`;
    await hospitalDB.$queryRaw`SELECT 1`;
    await emsDB.$queryRaw`SELECT 1`;
    await centerDB.$queryRaw`SELECT 1`;
    log('✅ All database connections successful', 'green');
    log('', 'reset');

    // Create rollback backup
    backupDir = await createRollbackBackup();
    log('', 'reset');

    // Restore data in order
    await restoreUsersToLegacy();
    log('', 'reset');
    
    await restoreTransportRequestsToLegacy();
    log('', 'reset');
    
    await restoreAgenciesToLegacy();
    log('', 'reset');
    
    await restoreFacilitiesToLegacy();
    log('', 'reset');
    
    await restoreUnitsToLegacy();
    log('', 'reset');

    log('🎉 Migration rollback completed successfully!', 'green');
    log('', 'reset');
    
    log('📋 Rollback Summary:', 'blue');
    log('  ✅ Users restored to legacy database', 'green');
    log('  ✅ Transport requests restored to legacy database', 'green');
    log('  ✅ Agencies restored to legacy database', 'green');
    log('  ✅ Facilities restored to legacy database', 'green');
    log('  ✅ Units restored to legacy database', 'green');
    log('', 'reset');
    
    if (backupDir) {
      log(`💾 Rollback backup available at: ${backupDir}`, 'blue');
    }
    
    log('🔄 Next Steps:', 'blue');
    log('  1. Update your application to use the legacy database', 'yellow');
    log('  2. Test all functionality with the restored data', 'yellow');
    log('  3. Consider the reasons for rollback and plan improvements', 'yellow');
    log('  4. Update environment configuration to use legacy database', 'yellow');

  } catch (error) {
    log(`❌ Rollback failed: ${error.message}`, 'red');
    log('', 'reset');
    log('🔧 Troubleshooting:', 'blue');
    log('  1. Check database connections and credentials', 'yellow');
    log('  2. Ensure all databases are running and accessible', 'yellow');
    log('  3. Verify data integrity in source databases', 'yellow');
    log('  4. Check for constraint violations or conflicts', 'yellow');
    
    if (backupDir) {
      log(`💾 Rollback backup available at: ${backupDir}`, 'blue');
    }
    
    process.exit(1);
  } finally {
    // Close database connections
    await legacyDB.$disconnect();
    await hospitalDB.$disconnect();
    await emsDB.$disconnect();
    await centerDB.$disconnect();
  }
}

// Run rollback if this script is executed directly
if (require.main === module) {
  runRollback();
}

module.exports = {
  runRollback,
  restoreUsersToLegacy,
  restoreTransportRequestsToLegacy,
  restoreAgenciesToLegacy,
  restoreFacilitiesToLegacy,
  restoreUnitsToLegacy
};
