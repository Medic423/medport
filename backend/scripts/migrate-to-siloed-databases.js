#!/usr/bin/env node

/**
 * Data Migration Script for Database Siloing
 * 
 * This script migrates existing data from the single database
 * to the three siloed databases based on the new architecture.
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
 * Migration functions with enhanced error handling and verification
 */

// Migration tracking
const migrationLog = {
  users: { migrated: 0, errors: [] },
  hospital: { migrated: 0, errors: [] },
  ems: { migrated: 0, errors: [] },
  system: { migrated: 0, errors: [] }
};

async function migrateUsers() {
  log('🔄 Migrating users to Center DB...', 'blue');
  
  try {
    // Get all users from legacy database
    const users = await legacyDB.user.findMany({
      include: {
        hospital: true,
        agency: true
      }
    });

    log(`Found ${users.length} users to migrate`, 'yellow');

    for (const user of users) {
      try {
        // Create user in Center DB
        await centerDB.user.create({
          data: {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            userType: mapUserType(user.role),
            hospitalId: user.hospital?.id,
            agencyId: user.agency?.id,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        });

        // Create hospital reference if exists
        if (user.hospital) {
          await centerDB.hospital.upsert({
            where: { id: user.hospital.id },
            update: {},
            create: {
              id: user.hospital.id,
              name: user.hospital.name,
              address: user.hospital.address,
              city: user.hospital.city,
              state: user.hospital.state,
              zipCode: user.hospital.zipCode,
              phone: user.hospital.phone,
              email: user.hospital.email,
              isActive: user.hospital.isActive,
              createdAt: user.hospital.createdAt,
              updatedAt: user.hospital.updatedAt
            }
          });
        }

        // Create agency reference if exists
        if (user.agency) {
          await centerDB.agency.upsert({
            where: { id: user.agency.id },
            update: {},
            create: {
              id: user.agency.id,
              name: user.agency.name,
              contactName: user.agency.contactName,
              phone: user.agency.phone,
              email: user.agency.email,
              address: user.agency.address,
              city: user.agency.city,
              state: user.agency.state,
              zipCode: user.agency.zipCode,
              isActive: user.agency.isActive,
              createdAt: user.agency.createdAt,
              updatedAt: user.agency.updatedAt
            }
          });
        }

        migrationLog.users.migrated++;
        log(`  ✅ Migrated user: ${user.email}`, 'green');
      } catch (userError) {
        migrationLog.users.errors.push({
          user: user.email,
          error: userError.message
        });
        log(`  ❌ Failed to migrate user ${user.email}: ${userError.message}`, 'red');
      }
    }

    log(`✅ Successfully migrated ${migrationLog.users.migrated}/${users.length} users to Center DB`, 'green');
    if (migrationLog.users.errors.length > 0) {
      log(`⚠️  ${migrationLog.users.errors.length} users failed to migrate`, 'yellow');
    }
  } catch (error) {
    log(`❌ Error migrating users: ${error.message}`, 'red');
    throw error;
  }
}

async function migrateHospitalData() {
  log('🔄 Migrating hospital data to Hospital DB...', 'blue');
  
  try {
    // Migrate hospital users
    const hospitalUsers = await legacyDB.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'HOSPITAL_COORDINATOR']
        }
      }
    });

    log(`Found ${hospitalUsers.length} hospital users to migrate`, 'yellow');

    for (const user of hospitalUsers) {
      await hospitalDB.hospitalUser.create({
        data: {
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          hospitalName: user.hospital?.name || 'Unknown Hospital',
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    }

    // Migrate facilities
    const facilities = await legacyDB.facility.findMany();
    log(`Found ${facilities.length} facilities to migrate`, 'yellow');

    for (const facility of facilities) {
      await hospitalDB.hospitalFacility.create({
        data: {
          id: facility.id,
          hospitalId: facility.hospitalId || hospitalUsers[0]?.id,
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
          capabilities: facility.capabilities || [],
          isActive: facility.isActive,
          createdAt: facility.createdAt,
          updatedAt: facility.updatedAt
        }
      });
    }

    // Migrate transport requests
    const transportRequests = await legacyDB.transportRequest.findMany();
    log(`Found ${transportRequests.length} transport requests to migrate`, 'yellow');

    for (const request of transportRequests) {
      await hospitalDB.transportRequest.create({
        data: {
          id: request.id,
          hospitalId: request.hospitalId,
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
    }

    log('✅ Successfully migrated hospital data to Hospital DB', 'green');
  } catch (error) {
    log(`❌ Error migrating hospital data: ${error.message}`, 'red');
    throw error;
  }
}

async function migrateEMSData() {
  log('🔄 Migrating EMS data to EMS DB...', 'blue');
  
  try {
    // Migrate EMS agencies
    const agencies = await legacyDB.transportAgency.findMany();
    log(`Found ${agencies.length} EMS agencies to migrate`, 'yellow');

    for (const agency of agencies) {
      await emsDB.eMSAgency.create({
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
          serviceArea: agency.serviceArea || [],
          operatingHours: agency.operatingHours,
          capabilities: agency.capabilities || [],
          pricingStructure: agency.pricingStructure,
          isActive: agency.isActive,
          status: mapServiceStatus(agency.status),
          addedBy: agency.addedBy,
          addedAt: agency.addedAt,
          createdAt: agency.createdAt,
          updatedAt: agency.updatedAt
        }
      });
    }

    // Migrate units
    const units = await legacyDB.unit.findMany();
    log(`Found ${units.length} units to migrate`, 'yellow');

    for (const unit of units) {
      await emsDB.unit.create({
        data: {
          id: unit.id,
          agencyId: unit.agencyId,
          unitNumber: unit.unitNumber,
          type: unit.type,
          capabilities: unit.capabilities || [],
          currentStatus: unit.currentStatus,
          currentLocation: unit.currentLocation,
          shiftStart: unit.shiftStart,
          shiftEnd: unit.shiftEnd,
          isActive: unit.isActive,
          createdAt: unit.createdAt,
          updatedAt: unit.updatedAt
        }
      });
    }

    // Migrate transport bids
    const bids = await legacyDB.transportBid.findMany();
    log(`Found ${bids.length} transport bids to migrate`, 'yellow');

    for (const bid of bids) {
      await emsDB.transportBid.create({
        data: {
          id: bid.id,
          agencyId: bid.agencyId,
          transportRequestId: bid.transportRequestId,
          bidAmount: bid.bidAmount,
          estimatedArrival: bid.estimatedArrival,
          estimatedPickup: bid.estimatedPickup,
          specialNotes: bid.specialNotes,
          status: bid.status,
          submittedAt: bid.submittedAt,
          updatedAt: bid.updatedAt
        }
      });
    }

    log('✅ Successfully migrated EMS data to EMS DB', 'green');
  } catch (error) {
    log(`❌ Error migrating EMS data: ${error.message}`, 'red');
    throw error;
  }
}

async function migrateSystemData() {
  log('🔄 Migrating system data to Center DB...', 'blue');
  
  try {
    // Migrate system configurations
    const configs = await legacyDB.systemConfiguration.findMany();
    log(`Found ${configs.length} system configurations to migrate`, 'yellow');

    for (const config of configs) {
      await centerDB.systemConfiguration.create({
        data: {
          id: config.id,
          key: config.key,
          value: config.value,
          description: config.description,
          category: config.category,
          isActive: config.isActive,
          updatedBy: config.updatedBy,
          updatedAt: config.updatedAt
        }
      });
    }

    // Migrate audit logs
    const auditLogs = await legacyDB.auditLog.findMany();
    log(`Found ${auditLogs.length} audit logs to migrate`, 'yellow');

    for (const log of auditLogs) {
      await centerDB.auditLog.create({
        data: {
          id: log.id,
          userId: log.userId,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          changes: log.changes,
          timestamp: log.timestamp,
          ipAddress: log.ipAddress
        }
      });
    }

    log('✅ Successfully migrated system data to Center DB', 'green');
  } catch (error) {
    log(`❌ Error migrating system data: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Helper functions
 */

function mapUserType(role) {
  const roleMapping = {
    'ADMIN': 'CENTER',
    'COORDINATOR': 'CENTER',
    'HOSPITAL_COORDINATOR': 'HOSPITAL',
    'TRANSPORT_AGENCY': 'EMS',
    'BILLING_STAFF': 'CENTER'
  };
  
  return roleMapping[role] || 'CENTER';
}

function mapServiceStatus(status) {
  const statusMapping = {
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
    'PENDING': 'PENDING'
  };
  
  return statusMapping[status] || 'ACTIVE';
}

/**
 * Data verification functions
 */

async function verifyMigration() {
  log('🔍 Verifying migration integrity...', 'blue');
  
  try {
    // Verify user counts
    const legacyUserCount = await legacyDB.user.count();
    const centerUserCount = await centerDB.user.count();
    
    log(`  Users: Legacy=${legacyUserCount}, Center=${centerUserCount}`, 
        legacyUserCount === centerUserCount ? 'green' : 'red');
    
    // Verify transport request counts
    const legacyRequestCount = await legacyDB.transportRequest.count();
    const hospitalRequestCount = await hospitalDB.transportRequest.count();
    
    log(`  Transport Requests: Legacy=${legacyRequestCount}, Hospital=${hospitalRequestCount}`, 
        legacyRequestCount === hospitalRequestCount ? 'green' : 'red');
    
    // Verify agency counts
    const legacyAgencyCount = await legacyDB.transportAgency.count();
    const emsAgencyCount = await emsDB.eMSAgency.count();
    
    log(`  Agencies: Legacy=${legacyAgencyCount}, EMS=${emsAgencyCount}`, 
        legacyAgencyCount === emsAgencyCount ? 'green' : 'red');
    
    // Verify facility counts
    const legacyFacilityCount = await legacyDB.facility.count();
    const hospitalFacilityCount = await hospitalDB.hospitalFacility.count();
    
    log(`  Facilities: Legacy=${legacyFacilityCount}, Hospital=${hospitalFacilityCount}`, 
        legacyFacilityCount === hospitalFacilityCount ? 'green' : 'red');
    
    log('✅ Migration verification completed', 'green');
    
  } catch (error) {
    log(`❌ Verification failed: ${error.message}`, 'red');
    throw error;
  }
}

async function createBackup() {
  log('💾 Creating backup of current state...', 'blue');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `./migration-backup-${timestamp}`;
    
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Save migration log
    fs.writeFileSync(
      `${backupDir}/migration-log.json`, 
      JSON.stringify(migrationLog, null, 2)
    );
    
    // Save environment configuration
    fs.writeFileSync(
      `${backupDir}/env-config.json`,
      JSON.stringify({
        legacy: process.env.DATABASE_URL,
        hospital: process.env.HOSPITAL_DATABASE_URL,
        ems: process.env.EMS_DATABASE_URL,
        center: process.env.CENTER_DATABASE_URL
      }, null, 2)
    );
    
    log(`✅ Backup created in ${backupDir}`, 'green');
    return backupDir;
    
  } catch (error) {
    log(`❌ Backup creation failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Main migration function with enhanced safety features
 */

async function runMigration() {
  log('🚀 Starting database siloing migration...', 'blue');
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

    // Create backup before migration
    backupDir = await createBackup();
    log('', 'reset');

    // Run migrations in order
    await migrateUsers();
    log('', 'reset');
    
    await migrateHospitalData();
    log('', 'reset');
    
    await migrateEMSData();
    log('', 'reset');
    
    await migrateSystemData();
    log('', 'reset');

    // Verify migration integrity
    await verifyMigration();
    log('', 'reset');

    log('🎉 Database siloing migration completed successfully!', 'green');
    log('', 'reset');
    
    log('📋 Migration Summary:', 'blue');
    log(`  ✅ Users: ${migrationLog.users.migrated} migrated, ${migrationLog.users.errors.length} errors`, 
        migrationLog.users.errors.length === 0 ? 'green' : 'yellow');
    log(`  ✅ Hospital: ${migrationLog.hospital.migrated} records migrated, ${migrationLog.hospital.errors.length} errors`, 
        migrationLog.hospital.errors.length === 0 ? 'green' : 'yellow');
    log(`  ✅ EMS: ${migrationLog.ems.migrated} records migrated, ${migrationLog.ems.errors.length} errors`, 
        migrationLog.ems.errors.length === 0 ? 'green' : 'yellow');
    log(`  ✅ System: ${migrationLog.system.migrated} records migrated, ${migrationLog.system.errors.length} errors`, 
        migrationLog.system.errors.length === 0 ? 'green' : 'yellow');
    log('', 'reset');
    
    if (backupDir) {
      log(`💾 Backup available at: ${backupDir}`, 'blue');
    }
    
    log('🔄 Next Steps:', 'blue');
    log('  1. Update your application to use DatabaseManager', 'yellow');
    log('  2. Test cross-database functionality', 'yellow');
    log('  3. Update API endpoints to use new database structure', 'yellow');
    log('  4. Deploy and monitor system performance', 'yellow');

  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, 'red');
    log('', 'reset');
    log('🔧 Troubleshooting:', 'blue');
    log('  1. Check database connections and credentials', 'yellow');
    log('  2. Ensure all databases are running and accessible', 'yellow');
    log('  3. Verify Prisma schemas are properly generated', 'yellow');
    log('  4. Check for data conflicts or constraint violations', 'yellow');
    log('  5. Review migration log for specific errors', 'yellow');
    
    if (backupDir) {
      log(`💾 Backup available for rollback: ${backupDir}`, 'blue');
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

// Run migration if this script is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  migrateUsers,
  migrateHospitalData,
  migrateEMSData,
  migrateSystemData
};

