const { PrismaClient } = require('@prisma/client');

// Connect to BOTH databases
const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DEV_DATABASE_URL || 'postgresql://scooper@localhost:5432/medport_ems?schema=public'
    }
  }
});

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function syncData() {
  console.log('🔄 Starting development to production data sync...\n');
  
  try {
    // Step 1: Sync EMS Agencies
    console.log('📋 Step 1: Syncing EMS Agencies...');
    const devAgencies = await devPrisma.$queryRaw`SELECT * FROM ems_agencies`;
    console.log(`   Found ${devAgencies.length} agencies in dev`);
    
    for (const agency of devAgencies) {
      await prodPrisma.$queryRaw`
        INSERT INTO ems_agencies (
          id, name, "contactName", phone, email, address, city, state, "zipCode", 
          capabilities, "isActive", status, "createdAt", "updatedAt"
        ) VALUES (
          ${agency.id}, ${agency.name}, ${agency.contactName}, ${agency.phone}, ${agency.email}, 
          ${agency.address}, ${agency.city}, ${agency.state}, ${agency.zipCode},
          ${agency.capabilities}, ${agency.isActive}, ${agency.status}, 
          ${agency.createdAt}, ${agency.updatedAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          "contactName" = EXCLUDED."contactName",
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          "zipCode" = EXCLUDED."zipCode",
          capabilities = EXCLUDED.capabilities,
          "isActive" = EXCLUDED."isActive",
          status = EXCLUDED.status,
          "updatedAt" = EXCLUDED."updatedAt"
      `;
      console.log(`   ✅ Synced: ${agency.name}`);
    }
    
    // Step 2: Sync EMS Users
    console.log('\n👤 Step 2: Syncing EMS Users...');
    const devEMSUsers = await devPrisma.$queryRaw`SELECT * FROM ems_users`;
    console.log(`   Found ${devEMSUsers.length} EMS users in dev`);
    
    for (const user of devEMSUsers) {
      // Skip users with null agencyId (they'll fail foreign key constraint)
      if (!user.agencyId) {
        console.log(`   ⚠️  Skipped: ${user.email} - no agencyId`);
        continue;
      }
      
      // Check if agency exists in production
      const agencyExists = await prodPrisma.$queryRaw`
        SELECT id FROM ems_agencies WHERE id = ${user.agencyId}
      `;
      
      if (agencyExists.length === 0) {
        console.log(`   ⚠️  Skipped: ${user.email} - agency ${user.agencyId} not in production`);
        continue;
      }
      
      try {
        await prodPrisma.$queryRaw`
          INSERT INTO ems_users (
            id, email, password, name, "agencyName", "agencyId", "isActive", "userType", "createdAt", "updatedAt"
          ) VALUES (
            ${user.id}, ${user.email}, ${user.password}, ${user.name}, ${user.agencyName},
            ${user.agencyId}, ${user.isActive}, ${user.userType}, ${user.createdAt}, ${user.updatedAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            name = EXCLUDED.name,
            "agencyName" = EXCLUDED."agencyName",
            "agencyId" = EXCLUDED."agencyId",
            "isActive" = EXCLUDED."isActive",
            "userType" = EXCLUDED."userType",
            "updatedAt" = EXCLUDED."updatedAt"
        `;
        console.log(`   ✅ Synced: ${user.email} (${user.name})`);
      } catch (error) {
        console.log(`   ❌ Failed: ${user.email} - ${error.message}`);
      }
    }
    
    // Step 3: Sync Healthcare Users
    console.log('\n🏥 Step 3: Syncing Healthcare Users...');
    const devHealthcareUsers = await devPrisma.$queryRaw`SELECT * FROM healthcare_users`;
    console.log(`   Found ${devHealthcareUsers.length} healthcare users in dev`);
    
    for (const user of devHealthcareUsers) {
      await prodPrisma.$queryRaw`
        INSERT INTO healthcare_users (
          id, email, password, name, "facilityName", "facilityType", "userType", "isActive", "createdAt", "updatedAt"
        ) VALUES (
          ${user.id}, ${user.email}, ${user.password}, ${user.name}, ${user.facilityName},
          ${user.facilityType}, ${user.userType}, ${user.isActive}, ${user.createdAt}, ${user.updatedAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          password = EXCLUDED.password,
          name = EXCLUDED.name,
          "facilityName" = EXCLUDED."facilityName",
          "facilityType" = EXCLUDED."facilityType",
          "isActive" = EXCLUDED."isActive",
          "updatedAt" = EXCLUDED."updatedAt"
      `;
      console.log(`   ✅ Synced: ${user.email}`);
    }
    
    // Step 4: Sync Units
    console.log('\n🚑 Step 4: Syncing Units...');
    const devUnits = await devPrisma.$queryRaw`SELECT * FROM units`;
    console.log(`   Found ${devUnits.length} units in dev`);
    
    for (const unit of devUnits) {
      await prodPrisma.$queryRaw`
        INSERT INTO units (
          id, "unitNumber", type, status, "agencyId", "currentLocation", "currentStatus", "isActive",
          capabilities, "createdAt", "updatedAt"
        ) VALUES (
          ${unit.id}, ${unit.unitNumber}, ${unit.type}, ${unit.status}, ${unit.agencyId},
          ${unit.currentLocation}, ${unit.currentStatus}, ${unit.isActive},
          ${unit.capabilities}, ${unit.createdAt}, ${unit.updatedAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          "unitNumber" = EXCLUDED."unitNumber",
          type = EXCLUDED.type,
          status = EXCLUDED.status,
          "agencyId" = EXCLUDED."agencyId",
          "currentLocation" = EXCLUDED."currentLocation",
          "currentStatus" = EXCLUDED."currentStatus",
          "isActive" = EXCLUDED."isActive",
          capabilities = EXCLUDED.capabilities,
          "updatedAt" = EXCLUDED."updatedAt"
      `;
      console.log(`   ✅ Synced: Unit ${unit.unitNumber}`);
    }
    
    // Step 5: Sync Healthcare Locations
    console.log('\n📍 Step 5: Syncing Healthcare Locations...');
    const devLocations = await devPrisma.$queryRaw`SELECT * FROM healthcare_locations`;
    console.log(`   Found ${devLocations.length} locations in dev`);
    
    for (const location of devLocations) {
      await prodPrisma.$queryRaw`
        INSERT INTO healthcare_locations (
          id, "healthcareUserId", "locationName", address, city, state, "zipCode", phone,
          "facilityType", "isActive", "isPrimary", latitude, longitude, "createdAt", "updatedAt"
        ) VALUES (
          ${location.id}, ${location.healthcareUserId}, ${location.locationName}, ${location.address},
          ${location.city}, ${location.state}, ${location.zipCode}, ${location.phone},
          ${location.facilityType}, ${location.isActive}, ${location.isPrimary},
          ${location.latitude}, ${location.longitude}, ${location.createdAt}, ${location.updatedAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          "locationName" = EXCLUDED."locationName",
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          "zipCode" = EXCLUDED."zipCode",
          phone = EXCLUDED.phone,
          "facilityType" = EXCLUDED."facilityType",
          "isActive" = EXCLUDED."isActive",
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          "updatedAt" = EXCLUDED."updatedAt"
      `;
      console.log(`   ✅ Synced: ${location.locationName}`);
    }
    
    console.log('\n✅ Data sync completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Agencies: ${devAgencies.length}`);
    console.log(`   - EMS Users: ${devEMSUsers.length}`);
    console.log(`   - Healthcare Users: ${devHealthcareUsers.length}`);
    console.log(`   - Units: ${devUnits.length}`);
    console.log(`   - Locations: ${devLocations.length}`);
    
  } catch (error) {
    console.error('\n❌ Error during sync:', error.message);
    throw error;
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Run the sync
syncData().catch(console.error);
