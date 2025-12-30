#!/usr/bin/env node
/**
 * Copy Healthcare User Data from Source to Target
 * 
 * Copies:
 * 1. Hospital Settings data:
 *    - Hospital record (matched by facilityName)
 *    - Pickup Locations (linked by hospitalId)
 * 
 * 2. Manage Locations data:
 *    - Healthcare Locations (linked by healthcareUserId)
 *    - Healthcare Destinations (linked by healthcareUserId)
 *    - Healthcare Agency Preferences (linked by healthcareUserId)
 * 
 * Usage:
 *   SOURCE_DB="..." TARGET_DB="..." SOURCE_EMAIL="chuck@ferrellhospitals.com" TARGET_EMAIL="test-healthcare@tcc.com" node copy-healthcare-user-data.js
 */

const { PrismaClient } = require('@prisma/client');
const { randomBytes } = require('crypto');

const SOURCE_DB = process.env.SOURCE_DB;
const TARGET_DB = process.env.TARGET_DB;
const SOURCE_EMAIL = process.env.SOURCE_EMAIL || 'chuck@ferrellhospitals.com';
const TARGET_EMAIL = process.env.TARGET_EMAIL || 'test-healthcare@tcc.com';

if (!SOURCE_DB || !TARGET_DB) {
  console.error('❌ Error: SOURCE_DB and TARGET_DB environment variables are required');
  console.error('\nUsage:');
  console.error('  SOURCE_DB="postgresql://..." TARGET_DB="postgresql://..." \\');
  console.error('  SOURCE_EMAIL="chuck@ferrellhospitals.com" TARGET_EMAIL="test-healthcare@tcc.com" \\');
  console.error('  node copy-healthcare-user-data.js');
  process.exit(1);
}

const sourcePrisma = new PrismaClient({ datasources: { db: { url: SOURCE_DB } } });
const targetPrisma = new PrismaClient({ datasources: { db: { url: TARGET_DB } } });

// Generate a CUID-like ID
function generateId() {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(6).toString('hex');
  return `c${timestamp}${random}`;
}

async function copyHealthcareUserData() {
  try {
    console.log('🔄 Copying Healthcare User Data...\n');
    console.log(`Source: ${SOURCE_EMAIL}`);
    console.log(`Target: ${TARGET_EMAIL}\n`);

    // Find source user
    const sourceUser = await sourcePrisma.healthcareUser.findUnique({
      where: { email: SOURCE_EMAIL },
      include: {
        locations: true,
        destinations: true,
        agencyPreferences: true
      }
    });

    if (!sourceUser) {
      console.error(`❌ Source user not found: ${SOURCE_EMAIL}`);
      process.exit(1);
    }

    console.log(`✅ Found source user: ${sourceUser.name} (${sourceUser.facilityName})`);
    console.log(`   Locations: ${sourceUser.locations.length}`);
    console.log(`   Destinations: ${sourceUser.destinations.length}`);
    console.log(`   Agency Preferences: ${sourceUser.agencyPreferences.length}\n`);

    // Find target user
    const targetUser = await targetPrisma.healthcareUser.findUnique({
      where: { email: TARGET_EMAIL }
    });

    if (!targetUser) {
      console.error(`❌ Target user not found: ${TARGET_EMAIL}`);
      console.error('   Please create the target user first using create-prod-test-users.js');
      process.exit(1);
    }

    console.log(`✅ Found target user: ${targetUser.name} (${targetUser.facilityName})\n`);

    // 1. Copy Hospital record (matched by facilityName)
    console.log('📋 Copying Hospital Settings...');
    // Try to find hospital by exact name match first
    let sourceHospital = await sourcePrisma.hospital.findFirst({
      where: { name: sourceUser.facilityName }
    });
    
    // If not found, try case-insensitive search
    if (!sourceHospital) {
      const hospitals = await sourcePrisma.hospital.findMany();
      sourceHospital = hospitals.find(h => 
        h.name.toLowerCase() === sourceUser.facilityName.toLowerCase()
      );
    }

    if (sourceHospital) {
      console.log(`   Found hospital: ${sourceHospital.name}`);
      
      // Check if target hospital exists
      const targetHospital = await targetPrisma.hospital.findFirst({
        where: { name: targetUser.facilityName }
      });

      if (targetHospital) {
        console.log(`   Updating existing hospital: ${targetHospital.name}`);
        await targetPrisma.hospital.update({
          where: { id: targetHospital.id },
          data: {
            address: sourceHospital.address,
            city: sourceHospital.city,
            state: sourceHospital.state,
            zipCode: sourceHospital.zipCode,
            phone: sourceHospital.phone,
            email: sourceHospital.email || targetUser.email,
            type: sourceHospital.type,
            capabilities: sourceHospital.capabilities,
            region: sourceHospital.region,
            coordinates: sourceHospital.coordinates,
            latitude: sourceHospital.latitude,
            longitude: sourceHospital.longitude,
            operatingHours: sourceHospital.operatingHours,
            isActive: sourceHospital.isActive
          }
        });
        console.log('   ✅ Hospital updated');
      } else {
        console.log(`   Creating new hospital: ${targetUser.facilityName}`);
        const newHospitalId = generateId();
        await targetPrisma.hospital.create({
          data: {
            id: newHospitalId,
            name: targetUser.facilityName,
            address: sourceHospital.address,
            city: sourceHospital.city,
            state: sourceHospital.state,
            zipCode: sourceHospital.zipCode,
            phone: sourceHospital.phone,
            email: targetUser.email,
            type: sourceHospital.type,
            capabilities: sourceHospital.capabilities,
            region: sourceHospital.region,
            coordinates: sourceHospital.coordinates,
            latitude: sourceHospital.latitude,
            longitude: sourceHospital.longitude,
            operatingHours: sourceHospital.operatingHours,
            isActive: sourceHospital.isActive
          }
        });
        console.log('   ✅ Hospital created');
      }

      // Copy Pickup Locations for this hospital
      const sourcePickupLocations = await sourcePrisma.pickup_locations.findMany({
        where: { hospitalId: sourceHospital.id }
      });

      console.log(`   Found ${sourcePickupLocations.length} pickup locations`);

      // Get target hospital ID (either updated or newly created)
      const finalTargetHospital = await targetPrisma.hospital.findFirst({
        where: { name: targetUser.facilityName }
      });

      if (finalTargetHospital && sourcePickupLocations.length > 0) {
        let copied = 0;
        for (const pickupLoc of sourcePickupLocations) {
          try {
            // Check if pickup location already exists
            const existing = await targetPrisma.pickup_locations.findFirst({
              where: {
                hospitalId: finalTargetHospital.id,
                name: pickupLoc.name
              }
            });

            if (existing) {
              // Update existing
              await targetPrisma.pickup_locations.update({
                where: { id: existing.id },
                data: {
                  description: pickupLoc.description,
                  contactPhone: pickupLoc.contactPhone,
                  contactEmail: pickupLoc.contactEmail,
                  floor: pickupLoc.floor,
                  room: pickupLoc.room,
                  isActive: pickupLoc.isActive
                }
              });
            } else {
              // Create new
              const newPickupId = generateId();
              await targetPrisma.pickup_locations.create({
                data: {
                  id: newPickupId,
                  hospitalId: finalTargetHospital.id,
                  name: pickupLoc.name,
                  description: pickupLoc.description,
                  contactPhone: pickupLoc.contactPhone,
                  contactEmail: pickupLoc.contactEmail,
                  floor: pickupLoc.floor,
                  room: pickupLoc.room,
                  isActive: pickupLoc.isActive,
                  createdAt: pickupLoc.createdAt,
                  updatedAt: pickupLoc.updatedAt
                }
              });
            }
            copied++;
            console.log(`     ✅ ${pickupLoc.name}`);
          } catch (error) {
            console.error(`     ⚠️  ${pickupLoc.name}:`, error.message.substring(0, 100));
          }
        }
        console.log(`   ✅ Copied ${copied}/${sourcePickupLocations.length} pickup locations\n`);
      }
    } else {
      console.log(`   ⚠️  Hospital not found for facility: ${sourceUser.facilityName}\n`);
    }

    // 2. Copy Healthcare Locations
    console.log('📍 Copying Healthcare Locations...');
    if (sourceUser.locations.length > 0) {
      let copied = 0;
      for (const location of sourceUser.locations) {
        try {
          // Check if location already exists
          const existing = await targetPrisma.healthcareLocation.findFirst({
            where: {
              healthcareUserId: targetUser.id,
              locationName: location.locationName
            }
          });

          if (existing) {
            // Update existing
            await targetPrisma.healthcareLocation.update({
              where: { id: existing.id },
              data: {
                address: location.address,
                city: location.city,
                state: location.state,
                zipCode: location.zipCode,
                phone: location.phone,
                facilityType: location.facilityType,
                isActive: location.isActive,
                isPrimary: location.isPrimary,
                latitude: location.latitude,
                longitude: location.longitude
              }
            });
          } else {
            // Create new
            const newLocationId = generateId();
            await targetPrisma.healthcareLocation.create({
              data: {
                id: newLocationId,
                healthcareUserId: targetUser.id,
                locationName: location.locationName,
                address: location.address,
                city: location.city,
                state: location.state,
                zipCode: location.zipCode,
                phone: location.phone,
                facilityType: location.facilityType,
                isActive: location.isActive,
                isPrimary: location.isPrimary,
                latitude: location.latitude,
                longitude: location.longitude,
                createdAt: location.createdAt,
                updatedAt: location.updatedAt
              }
            });
          }
          copied++;
          console.log(`   ✅ ${location.locationName}`);
        } catch (error) {
          console.error(`   ⚠️  ${location.locationName}:`, error.message.substring(0, 100));
        }
      }
      console.log(`✅ Copied ${copied}/${sourceUser.locations.length} healthcare locations\n`);
    } else {
      console.log('   No healthcare locations to copy\n');
    }

    // 3. Copy Healthcare Destinations
    console.log('🎯 Copying Healthcare Destinations...');
    if (sourceUser.destinations.length > 0) {
      let copied = 0;
      for (const destination of sourceUser.destinations) {
        try {
          // Use raw SQL to check if destination exists (more reliable)
          // Note: Production uses snake_case column names
          const existing = await targetPrisma.$queryRaw`
            SELECT id FROM healthcare_destinations 
            WHERE healthcare_user_id = ${targetUser.id} AND name = ${destination.name}
            LIMIT 1
          `;

          if (existing && existing.length > 0) {
            // Update existing using raw SQL with snake_case columns
            await targetPrisma.$executeRaw`
              UPDATE healthcare_destinations SET
                type = ${destination.type},
                address = ${destination.address},
                city = ${destination.city},
                state = ${destination.state},
                zip_code = ${destination.zipCode},
                phone = ${destination.phone},
                email = ${destination.email},
                contact_name = ${destination.contactName},
                latitude = ${destination.latitude},
                longitude = ${destination.longitude},
                is_active = ${destination.isActive},
                notes = ${destination.notes},
                updated_at = NOW()
              WHERE id = ${existing[0].id}
            `;
          } else {
            // Create new using raw SQL with snake_case columns
            const newDestId = generateId();
            await targetPrisma.$executeRaw`
              INSERT INTO healthcare_destinations (
                id, healthcare_user_id, name, type, address, city, state, zip_code,
                phone, email, contact_name, latitude, longitude, is_active, notes,
                created_at, updated_at
              )
              VALUES (
                ${newDestId}, ${targetUser.id}, ${destination.name}, ${destination.type},
                ${destination.address}, ${destination.city}, ${destination.state}, ${destination.zipCode},
                ${destination.phone}, ${destination.email}, ${destination.contactName},
                ${destination.latitude}, ${destination.longitude}, ${destination.isActive}, ${destination.notes},
                ${destination.createdAt}::timestamp, ${destination.updatedAt}::timestamp
              )
            `;
          }
          copied++;
          console.log(`   ✅ ${destination.name}`);
        } catch (error) {
          console.error(`   ⚠️  ${destination.name}:`, error.message.substring(0, 100));
        }
      }
      console.log(`✅ Copied ${copied}/${sourceUser.destinations.length} healthcare destinations\n`);
    } else {
      console.log('   No healthcare destinations to copy\n');
    }

    // 4. Copy Healthcare Agency Preferences
    console.log('🚑 Copying Healthcare Agency Preferences...');
    if (sourceUser.agencyPreferences.length > 0) {
      let copied = 0;
      let skipped = 0;
      for (const pref of sourceUser.agencyPreferences) {
        try {
          // Check if agency exists in target database using raw SQL
          const targetAgency = await targetPrisma.$queryRaw`
            SELECT id, name FROM "ems_agencies" WHERE id = ${pref.agencyId} LIMIT 1
          `;

          if (!targetAgency || targetAgency.length === 0) {
            skipped++;
            console.log(`   ⚠️  Skipping preference - agency ${pref.agencyId} not found in target database`);
            continue;
          }
          
          const agency = targetAgency[0];

          // Check if preference already exists using raw SQL
          const existing = await targetPrisma.$queryRaw`
            SELECT id FROM healthcare_agency_preferences 
            WHERE "healthcareUserId" = ${targetUser.id} AND "agencyId" = ${pref.agencyId}
            LIMIT 1
          `;

          if (existing && existing.length > 0) {
            // Update existing using raw SQL
            await targetPrisma.$executeRaw`
              UPDATE healthcare_agency_preferences SET
                "isPreferred" = ${pref.isPreferred},
                "updatedAt" = NOW()
              WHERE id = ${existing[0].id}
            `;
          } else {
            // Create new using raw SQL
            await targetPrisma.$executeRaw`
              INSERT INTO healthcare_agency_preferences (
                id, "healthcareUserId", "agencyId", "isPreferred", "createdAt", "updatedAt"
              )
              VALUES (
                ${generateId()}, ${targetUser.id}, ${pref.agencyId}, ${pref.isPreferred},
                ${pref.createdAt}::timestamp, ${pref.updatedAt}::timestamp
              )
            `;
          }
          copied++;
          console.log(`   ✅ Agency: ${agency.name} (preferred: ${pref.isPreferred})`);
        } catch (error) {
          console.error(`   ⚠️  Agency preference:`, error.message.substring(0, 100));
          skipped++;
        }
      }
      console.log(`✅ Copied ${copied}/${sourceUser.agencyPreferences.length} agency preferences`);
      if (skipped > 0) {
        console.log(`   ⚠️  Skipped ${skipped} preferences (agencies not found in target database)\n`);
      } else {
        console.log('');
      }
    } else {
      console.log('   No agency preferences to copy\n');
    }

    // Update target user's manageMultipleLocations flag if source has it
    if (sourceUser.manageMultipleLocations && !targetUser.manageMultipleLocations) {
      console.log('🔄 Updating manageMultipleLocations flag...');
      await targetPrisma.healthcareUser.update({
        where: { id: targetUser.id },
        data: { manageMultipleLocations: true }
      });
      console.log('   ✅ Updated manageMultipleLocations to true\n');
    }

    console.log('✅ Data copy completed successfully!');
    console.log(`\n📋 Summary:`);
    console.log(`   Source: ${sourceUser.name} (${sourceUser.facilityName})`);
    console.log(`   Target: ${targetUser.name} (${targetUser.facilityName})`);
    console.log(`   Locations: ${sourceUser.locations.length} copied`);
    console.log(`   Destinations: ${sourceUser.destinations.length} copied`);
    console.log(`   Agency Preferences: ${sourceUser.agencyPreferences.length} copied`);

  } catch (error) {
    console.error('❌ Error copying healthcare user data:', error);
    console.error('   Full error:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

copyHealthcareUserData();

