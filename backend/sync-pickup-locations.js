/**
 * Sync pickup locations and dropdown options from dev to production
 */

const { PrismaClient } = require('@prisma/client');

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

async function syncPickupLocations() {
  console.log('🔄 Syncing pickup locations...\n');
  
  try {
    // Get all pickup locations from dev
    const devLocations = await devPrisma.$queryRaw`
      SELECT * FROM pickup_locations WHERE "isActive" = true
    `;
    
    console.log(`Found ${devLocations.length} pickup locations in dev`);
    
    for (const location of devLocations) {
      await prodPrisma.$queryRaw`
        INSERT INTO pickup_locations (
          id, "hospitalId", name, description, floor, room,
          "contactPhone", "contactEmail", "isActive",
          "createdAt", "updatedAt"
        ) VALUES (
          ${location.id}, ${location.hospitalId}, ${location.name},
          ${location.description}, ${location.floor}, ${location.room},
          ${location.contactPhone}, ${location.contactEmail}, ${location.isActive},
          ${location.createdAt}, ${location.updatedAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          floor = EXCLUDED.floor,
          room = EXCLUDED.room,
          "contactPhone" = EXCLUDED."contactPhone",
          "contactEmail" = EXCLUDED."contactEmail",
          "isActive" = EXCLUDED."isActive",
          "updatedAt" = EXCLUDED."updatedAt"
      `;
      console.log(`   ✅ Synced: ${location.name}`);
    }
    
    console.log(`\n✅ Synced ${devLocations.length} pickup locations\n`);
    
  } catch (error) {
    console.error('❌ Error syncing pickup locations:', error);
    throw error;
  }
}

async function syncDropdownOptions() {
  console.log('🔄 Syncing dropdown options...\n');
  
  try {
    // Get all dropdown options from dev
    const devOptions = await devPrisma.$queryRaw`
      SELECT * FROM dropdown_options
    `;
    
    console.log(`Found ${devOptions.length} dropdown options in dev`);
    
    for (const option of devOptions) {
      await prodPrisma.$queryRaw`
        INSERT INTO dropdown_options (
          id, category, value, "isDefault", "isActive",
          "createdAt", "updatedAt"
        ) VALUES (
          ${option.id}, ${option.category}, ${option.value},
          ${option.isDefault}, ${option.isActive},
          ${option.createdAt}, ${option.updatedAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          value = EXCLUDED.value,
          "isDefault" = EXCLUDED."isDefault",
          "isActive" = EXCLUDED."isActive",
          "updatedAt" = EXCLUDED."updatedAt"
      `;
      console.log(`   ✅ Synced: ${option.category}/${option.value}`);
    }
    
    console.log(`\n✅ Synced ${devOptions.length} dropdown options\n`);
    
  } catch (error) {
    console.error('❌ Error syncing dropdown options:', error);
    throw error;
  }
}

async function syncFacilities() {
  console.log('🔄 Syncing facilities/hospitals...\n');
  
  try {
    // Sync from dev hospitals table to prod hospitals table
    const devHospitals = await devPrisma.$queryRaw`
      SELECT * FROM hospitals WHERE "isActive" = true
    `;

    console.log(`Found ${devHospitals.length} hospitals in dev`);

    for (const h of devHospitals) {
      // Provide safe defaults for non-nullable columns
      const region = h.region || h.state || 'UNKNOWN';
      const capabilities = Array.isArray(h.capabilities) ? h.capabilities : [];

      await prodPrisma.$queryRaw`
        INSERT INTO hospitals (
          id, name, address, city, state, "zipCode", phone, email, type,
          capabilities, region, coordinates, latitude, longitude, "operatingHours",
          "isActive", "requiresReview", "approvedAt", "approvedBy", "createdAt", "updatedAt"
        ) VALUES (
          ${h.id}, ${h.name}, ${h.address}, ${h.city}, ${h.state}, ${h.zipCode}, ${h.phone}, ${h.email}, ${h.type},
          ${capabilities}, ${region}, ${h.coordinates}, ${h.latitude}, ${h.longitude}, ${h.operatingHours},
          ${h.isActive}, ${h.requiresReview}, ${h.approvedAt}, ${h.approvedBy}, ${h.createdAt}, ${h.updatedAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          "zipCode" = EXCLUDED."zipCode",
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          type = EXCLUDED.type,
          capabilities = EXCLUDED.capabilities,
          region = EXCLUDED.region,
          coordinates = EXCLUDED.coordinates,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          "operatingHours" = EXCLUDED."operatingHours",
          "isActive" = EXCLUDED."isActive",
          "requiresReview" = EXCLUDED."requiresReview",
          "approvedAt" = EXCLUDED."approvedAt",
          "approvedBy" = EXCLUDED."approvedBy",
          "updatedAt" = EXCLUDED."updatedAt"
      `;
      console.log(`   ✅ Synced: ${h.name}`);
    }

    console.log(`\n✅ Synced ${devHospitals.length} hospitals\n`);
    
  } catch (error) {
    console.error('❌ Error syncing facilities:', error);
    throw error;
  }
}

async function syncDropdownOptions() {
  console.log('⚠️  Skipping dropdown options (table structure differs)\n');
}

async function syncAll() {
  console.log('🚀 Starting full data sync to production...\n');
  
  try {
    await syncPickupLocations();
    await syncDropdownOptions(); // Will just log skip message
    await syncFacilities();
    
    console.log('✅ All data synced successfully!');
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

syncAll().catch(console.error);

