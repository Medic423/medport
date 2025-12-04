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
    const devAgencies = await devPrisma.ems_agencies.findMany();
    console.log(`   Found ${devAgencies.length} agencies in dev`);
    
    for (const agency of devAgencies) {
      await prodPrisma.ems_agencies.upsert({
        where: { id: agency.id },
        update: {
          name: agency.name,
          contactName: agency.contactName,
          phone: agency.phone,
          email: agency.email,
          address: agency.address,
          city: agency.city,
          state: agency.state,
          zipCode: agency.zipCode,
          capabilities: agency.capabilities,
          isActive: agency.isActive,
          status: agency.status
        },
        create: agency
      });
      console.log(`   ✅ Synced: ${agency.name}`);
    }
    
    // Step 2: Sync EMS Users
    console.log('\n👤 Step 2: Syncing EMS Users...');
    const devEMSUsers = await devPrisma.ems_users.findMany();
    console.log(`   Found ${devEMSUsers.length} EMS users in dev`);
    
    for (const user of devEMSUsers) {
      await prodPrisma.ems_users.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          password: user.password,
          name: user.name,
          agencyName: user.agencyName,
          agencyId: user.agencyId,
          isActive: user.isActive,
          userType: user.userType
        },
        create: user
      });
      console.log(`   ✅ Synced: ${user.email} (${user.name})`);
    }
    
    // Step 3: Sync Healthcare Users
    console.log('\n🏥 Step 3: Syncing Healthcare Users...');
    const devHealthcareUsers = await devPrisma.healthcare_users.findMany();
    console.log(`   Found ${devHealthcareUsers.length} healthcare users in dev`);
    
    for (const user of devHealthcareUsers) {
      await prodPrisma.healthcare_users.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          password: user.password,
          name: user.name,
          facilityName: user.facilityName,
          facilityType: user.facilityType,
          isActive: user.isActive
        },
        create: user
      });
      console.log(`   ✅ Synced: ${user.email}`);
    }
    
    // Step 4: Sync Units
    console.log('\n🚑 Step 4: Syncing Units...');
    const devUnits = await devPrisma.units.findMany();
    console.log(`   Found ${devUnits.length} units in dev`);
    
    for (const unit of devUnits) {
      await prodPrisma.units.upsert({
        where: { id: unit.id },
        update: {
          unitNumber: unit.unitNumber,
          type: unit.type,
          status: unit.status,
          agencyId: unit.agencyId,
          currentLocation: unit.currentLocation
        },
        create: unit
      });
      console.log(`   ✅ Synced: Unit ${unit.unitNumber}`);
    }
    
    // Step 5: Sync Healthcare Locations
    console.log('\n📍 Step 5: Syncing Healthcare Locations...');
    const devLocations = await devPrisma.healthcare_locations.findMany();
    console.log(`   Found ${devLocations.length} locations in dev`);
    
    for (const location of devLocations) {
      await prodPrisma.healthcare_locations.upsert({
        where: { id: location.id },
        update: {
          healthcareUserId: location.healthcareUserId,
          locationName: location.locationName,
          address: location.address,
          city: location.city,
          state: location.state,
          zipCode: location.zipCode,
          phone: location.phone,
          facilityType: location.facilityType,
          isActive: location.isActive,
          latitude: location.latitude,
          longitude: location.longitude
        },
        create: location
      });
      console.log(`   ✅ Synced: ${location.locationName}`);
    }
    
    // Step 6: Sync Trips (optional - might be large)
    console.log('\n🚗 Step 6: Syncing Transport Requests...');
    const devTrips = await devPrisma.transport_requests.findMany();
    console.log(`   Found ${devTrips.length} trips in dev (skipping for now to avoid conflicts)`);
    console.log('   ⚠️  Skipping trips to avoid ID conflicts');
    
    console.log('\n✅ Data sync completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Agencies: ${devAgencies.length}`);
    console.log(`   - EMS Users: ${devEMSUsers.length}`);
    console.log(`   - Healthcare Users: ${devHealthcareUsers.length}`);
    console.log(`   - Units: ${devUnits.length}`);
    console.log(`   - Locations: ${devLocations.length}`);
    console.log(`   - Trips: Skipped`);
    
  } catch (error) {
    console.error('\n❌ Error during sync:', error);
    throw error;
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Run the sync
syncData().catch(console.error);





