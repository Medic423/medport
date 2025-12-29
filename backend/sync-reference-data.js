#!/usr/bin/env node
/**
 * Sync reference data (Hospitals, Facilities, Healthcare Locations) from dev to target
 * Usage: SOURCE_DB="..." TARGET_DB="..." node sync-reference-data.js
 */

const { PrismaClient } = require('@prisma/client');

const SOURCE_DB = process.env.SOURCE_DB;
const TARGET_DB = process.env.TARGET_DB;

if (!SOURCE_DB || !TARGET_DB) {
  console.error('Usage: SOURCE_DB="..." TARGET_DB="..." node sync-reference-data.js');
  process.exit(1);
}

async function syncHospitals(sourcePrisma, targetPrisma) {
  console.log('🔄 Syncing Hospitals...');
  try {
    const hospitals = await sourcePrisma.$queryRaw`
      SELECT * FROM hospitals ORDER BY name;
    `;
    
    let synced = 0;
    for (const hospital of hospitals) {
      try {
        await targetPrisma.$executeRaw`
          INSERT INTO hospitals (
            id, name, address, city, state, "zipCode", phone, email, type,
            capabilities, region, coordinates, latitude, longitude,
            "operatingHours", "isActive", "requiresReview", "approvedAt",
            "approvedBy", "createdAt", "updatedAt"
          )
          VALUES (
            ${hospital.id}, ${hospital.name}, 
            COALESCE(${hospital.address}, ''),
            COALESCE(${hospital.city}, ''),
            COALESCE(${hospital.state}, 'PA'),
            COALESCE(${hospital.zipCode}, ''),
            ${hospital.phone},
            ${hospital.email},
            ${hospital.type},
            COALESCE(${hospital.capabilities}::text[], ARRAY[]::text[]),
            COALESCE(${hospital.region}, ''),
            CASE 
              WHEN ${hospital.coordinates} IS NULL THEN '{}'::jsonb 
              WHEN jsonb_typeof(${hospital.coordinates}::jsonb) IS NULL THEN '{}'::jsonb
              ELSE ${hospital.coordinates}::jsonb 
            END,
            ${hospital.latitude},
            ${hospital.longitude},
            COALESCE(${hospital.operatingHours}, ''),
            COALESCE(${hospital.isActive}, true),
            COALESCE(${hospital.requiresReview}, false),
            ${hospital.approvedAt}::timestamp,
            ${hospital.approvedBy},
            ${hospital.createdAt}::timestamp,
            ${hospital.updatedAt}::timestamp
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
            "isActive" = EXCLUDED."isActive",
            "updatedAt" = NOW();
        `;
        synced++;
        console.log(`  ✅ ${hospital.name}`);
      } catch (error) {
        console.error(`  ⚠️  ${hospital.name}:`, error.message.substring(0, 100));
      }
    }
    console.log(`✅ Synced ${synced}/${hospitals.length} Hospitals\n`);
  } catch (error) {
    console.error('❌ Error syncing Hospitals:', error.message);
  }
}

async function syncFacilities(sourcePrisma, targetPrisma) {
  console.log('🔄 Syncing Facilities...');
  try {
    const facilities = await sourcePrisma.$queryRaw`
      SELECT * FROM facilities ORDER BY name;
    `;
    
    let synced = 0;
    for (const facility of facilities) {
      try {
        await targetPrisma.$executeRaw`
          INSERT INTO facilities (
            id, name, address, city, state, "zipCode", phone, email, type,
            capabilities, region, coordinates, latitude, longitude,
            "operatingHours", "isActive", "requiresReview", "approvedAt",
            "approvedBy", "createdAt", "updatedAt"
          )
          VALUES (
            ${facility.id}, ${facility.name}, 
            COALESCE(${facility.address}, ''),
            COALESCE(${facility.city}, ''),
            COALESCE(${facility.state}, 'PA'),
            COALESCE(${facility.zipCode}, ''),
            ${facility.phone},
            ${facility.email},
            ${facility.type},
            COALESCE(${facility.capabilities}::text[], ARRAY[]::text[]),
            COALESCE(${facility.region}, ''),
            COALESCE(${facility.coordinates}::jsonb, '{}'::jsonb),
            ${facility.latitude},
            ${facility.longitude},
            COALESCE(${facility.operatingHours}::jsonb, '{}'::jsonb),
            COALESCE(${facility.isActive}, true),
            COALESCE(${facility.requiresReview}, false),
            ${facility.approvedAt}::timestamp,
            ${facility.approvedBy},
            ${facility.createdAt}::timestamp,
            ${facility.updatedAt}::timestamp
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
            "isActive" = EXCLUDED."isActive",
            "updatedAt" = NOW();
        `;
        synced++;
        console.log(`  ✅ ${facility.name}`);
      } catch (error) {
        console.error(`  ⚠️  ${facility.name}:`, error.message.substring(0, 100));
      }
    }
    console.log(`✅ Synced ${synced}/${facilities.length} Facilities\n`);
  } catch (error) {
    console.error('❌ Error syncing Facilities:', error.message);
  }
}

async function syncHealthcareLocations(sourcePrisma, targetPrisma) {
  console.log('🔄 Syncing Healthcare Locations...');
  try {
    const locations = await sourcePrisma.$queryRaw`
      SELECT * FROM healthcare_locations ORDER BY "locationName";
    `;
    
    let synced = 0;
    for (const location of locations) {
      try {
        await targetPrisma.$executeRaw`
          INSERT INTO healthcare_locations (
            id, "healthcareUserId", "locationName", address, city, state, "zipCode",
            phone, "facilityType", "isActive", "isPrimary", latitude, longitude,
            "createdAt", "updatedAt"
          )
          VALUES (
            ${location.id},
            ${location.healthcareUserId},
            ${location.locationName},
            COALESCE(${location.address}, ''),
            COALESCE(${location.city}, ''),
            COALESCE(${location.state}, 'PA'),
            COALESCE(${location.zipCode}, ''),
            ${location.phone},
            ${location.facilityType},
            COALESCE(${location.isActive}, true),
            COALESCE(${location.isPrimary}, false),
            ${location.latitude},
            ${location.longitude},
            ${location.createdAt}::timestamp,
            ${location.updatedAt}::timestamp
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
            "isPrimary" = EXCLUDED."isPrimary",
            "updatedAt" = NOW();
        `;
        synced++;
        console.log(`  ✅ ${location.locationName}`);
      } catch (error) {
        console.error(`  ⚠️  ${location.locationName}:`, error.message.substring(0, 100));
      }
    }
    console.log(`✅ Synced ${synced}/${locations.length} Healthcare Locations\n`);
  } catch (error) {
    console.error('❌ Error syncing Healthcare Locations:', error.message);
  }
}

async function main() {
  const sourcePrisma = new PrismaClient({ datasources: { db: { url: SOURCE_DB } } });
  const targetPrisma = new PrismaClient({ datasources: { db: { url: TARGET_DB } } });
  
  try {
    await syncHospitals(sourcePrisma, targetPrisma);
    await syncFacilities(sourcePrisma, targetPrisma);
    await syncHealthcareLocations(sourcePrisma, targetPrisma);
    
    console.log('✅ Reference data sync completed!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

main();

