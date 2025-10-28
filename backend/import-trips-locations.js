/**
 * Import trips, locations, and healthcare data to production
 * Focus: Import essential data for testing healthcare → EMS flow
 */

const { PrismaClient } = require('@prisma/client');

const DEV_DATABASE_URL = process.env.DEV_DATABASE_URL || 'postgresql://scooper@localhost:5432/medport_ems?schema=public';
const PROD_DATABASE_URL = process.env.DATABASE_URL || 'postgres://83b6f3a648992f0d604de269444988ad1248aa92f5ea7b85b794af2bc447f869:sk_53MYkpIqmD_l7bf7ex3lw@db.prisma.io:5432/postgres?sslmode=require';

const devPrisma = new PrismaClient({
  datasources: { db: { url: DEV_DATABASE_URL } }
});

const prodPrisma = new PrismaClient({
  datasources: { db: { url: PROD_DATABASE_URL } }
});

async function importData() {
  console.log('🚀 Starting data import...\n');
  
  try {
    // 1. Import Healthcare Locations
    console.log('📍 Importing healthcare locations...');
    const devLocations = await devPrisma.$queryRaw`
      SELECT * FROM healthcare_locations WHERE "isActive" = true
    `;
    
    for (const loc of devLocations) {
      try {
        await prodPrisma.$queryRaw`
          INSERT INTO healthcare_locations (
            id, name, address, city, state, zip, latitude, longitude,
            "hospitalId", "isActive", "createdAt", "updatedAt"
          ) VALUES (
            ${loc.id}, ${loc.name}, ${loc.address || null}, ${loc.city || null},
            ${loc.state || null}, ${loc.zip || null}, ${loc.latitude || null},
            ${loc.longitude || null}, ${loc.hospitalId || null}, ${loc.isActive},
            ${loc.createdAt}, ${loc.updatedAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude
        `;
      } catch (e) {
        console.log(`  ⚠️  Location ${loc.name}: ${e.message.substring(0, 50)}`);
      }
    }
    console.log(`  ✅ Imported ${devLocations.length} healthcare locations\n`);
    
    // 2. Import Transport Requests (Trips)
    console.log('🚗 Importing transport requests...');
    const devTrips = await devPrisma.$queryRaw`
      SELECT * FROM transport_requests ORDER BY "createdAt" DESC LIMIT 50
    `;
    
    let imported = 0;
    for (const trip of devTrips) {
      try {
        await prodPrisma.$queryRaw`
          INSERT INTO transport_requests (
            id, "patientId", "fromLocation", "toLocation", "transportLevel",
            "urgencyLevel", status, "requesterId", "requestedDate",
            "assignedAgencyId", "createdAt", "updatedAt"
          ) VALUES (
            ${trip.id}, ${trip.patientId || null}, ${trip.fromLocation || null},
            ${trip.toLocation || null}, ${trip.transportLevel || null},
            ${trip.urgencyLevel || null}, ${trip.status || 'PENDING'},
            ${trip.requesterId || null}, ${trip.requestedDate || null},
            ${trip.assignedAgencyId || null}, ${trip.createdAt}, ${trip.updatedAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            "assignedAgencyId" = EXCLUDED."assignedAgencyId"
        `;
        imported++;
      } catch (e) {
        console.log(`  ⚠️  Trip ${trip.id}: ${e.message.substring(0, 50)}`);
      }
    }
    console.log(`  ✅ Imported ${imported}/${devTrips.length} transport requests\n`);
    
    // 3. Import Agency Responses
    console.log('🏥 Importing agency responses...');
    const devResponses = await devPrisma.$queryRaw`
      SELECT * FROM agency_responses ORDER BY "responseTimestamp" DESC
    `;
    
    imported = 0;
    for (const response of devResponses) {
      try {
        await prodPrisma.$queryRaw`
          INSERT INTO agency_responses (
            id, "tripId", "agencyId", response, "responseTimestamp",
            "isSelected", "createdAt", "updatedAt"
          ) VALUES (
            ${response.id}, ${response.tripId}, ${response.agencyId},
            ${response.response}, ${response.responseTimestamp},
            ${response.isSelected || false}, ${response.createdAt},
            ${response.updatedAt}
          )
          ON CONFLICT (id) DO UPDATE SET
            response = EXCLUDED.response,
            "isSelected" = EXCLUDED."isSelected"
        `;
        imported++;
      } catch (e) {
        console.log(`  ⚠️  Response ${response.id}: ${e.message.substring(0, 50)}`);
      }
    }
    console.log(`  ✅ Imported ${imported}/${devResponses.length} agency responses\n`);
    
    console.log('✅ Data import complete!\n');
    
  } catch (error) {
    console.error('❌ Import error:', error);
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

importData();

