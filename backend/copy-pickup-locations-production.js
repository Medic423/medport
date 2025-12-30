// Script to copy pickup locations from source user to target user in production
const { PrismaClient } = require('@prisma/client');

const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SOURCE_DB || 'postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require'
    }
  }
});

const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TARGET_DB || 'postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require'
    }
  }
});

const SOURCE_EMAIL = process.env.SOURCE_EMAIL || 'chuck@ferrellhospitals.com';
const TARGET_EMAIL = process.env.TARGET_EMAIL || 'test-healthcare@tcc.com';

function generateId() {
  return `pickup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function copyPickupLocations() {
  try {
    console.log('🔄 Copying Pickup Locations...\n');
    console.log(`Source: ${SOURCE_EMAIL}`);
    console.log(`Target: ${TARGET_EMAIL}\n`);

    // Get source user and locations
    const sourceUser = await sourcePrisma.healthcareUser.findUnique({
      where: { email: SOURCE_EMAIL },
      include: {
        locations: {
          orderBy: { locationName: 'asc' }
        }
      }
    });

    if (!sourceUser) {
      throw new Error(`Source user not found: ${SOURCE_EMAIL}`);
    }

    console.log(`✅ Found source user: ${sourceUser.name} (${sourceUser.facilityName})`);
    console.log(`   Locations: ${sourceUser.locations.length}\n`);

    // Get target user and locations
    const targetUser = await targetPrisma.healthcareUser.findUnique({
      where: { email: TARGET_EMAIL },
      include: {
        locations: {
          orderBy: { locationName: 'asc' }
        }
      }
    });

    if (!targetUser) {
      throw new Error(`Target user not found: ${TARGET_EMAIL}`);
    }

    console.log(`✅ Found target user: ${targetUser.name} (${targetUser.facilityName})`);
    console.log(`   Locations: ${targetUser.locations.length}\n`);

    // Create a map of location names to target location IDs
    const targetLocationMap = new Map();
    targetUser.locations.forEach(loc => {
      targetLocationMap.set(loc.locationName, loc.id);
    });

    let totalCopied = 0;
    let totalSkipped = 0;

    // Copy pickup locations for each matching location
    for (const sourceLocation of sourceUser.locations) {
      const targetLocationId = targetLocationMap.get(sourceLocation.locationName);
      
      if (!targetLocationId) {
        console.log(`⚠️  Skipping ${sourceLocation.locationName} - not found in target`);
        continue;
      }

      console.log(`📍 Copying pickup locations for: ${sourceLocation.locationName}`);

      // Get pickup locations for this source location
      const sourcePickups = await sourcePrisma.pickup_locations.findMany({
        where: {
          hospitalId: sourceLocation.id,
          isActive: true
        },
        orderBy: { name: 'asc' }
      });

      if (sourcePickups.length === 0) {
        console.log(`   No pickup locations to copy\n`);
        continue;
      }

      let copied = 0;
      let skipped = 0;

      for (const pickup of sourcePickups) {
        // Check if pickup location already exists
        const existing = await targetPrisma.pickup_locations.findFirst({
          where: {
            hospitalId: targetLocationId,
            name: pickup.name
          }
        });

        if (existing) {
          console.log(`   ⚠️  ${pickup.name}: Already exists`);
          skipped++;
          continue;
        }

        // Create new pickup location
        try {
          await targetPrisma.pickup_locations.create({
            data: {
              id: generateId(),
              hospitalId: targetLocationId,
              name: pickup.name,
              description: pickup.description,
              contactPhone: pickup.contactPhone,
              contactEmail: pickup.contactEmail,
              floor: pickup.floor,
              room: pickup.room,
              isActive: pickup.isActive,
              createdAt: pickup.createdAt,
              updatedAt: pickup.updatedAt
            }
          });
          console.log(`   ✅ ${pickup.name}`);
          copied++;
        } catch (error) {
          console.error(`   ❌ ${pickup.name}: ${error.message}`);
        }
      }

      console.log(`   Copied ${copied}/${sourcePickups.length} pickup locations\n`);
      totalCopied += copied;
      totalSkipped += skipped;
    }

    console.log('✅ Pickup locations copy completed!\n');
    console.log('📋 Summary:');
    console.log(`   Source: ${sourceUser.name} (${sourceUser.facilityName})`);
    console.log(`   Target: ${targetUser.name} (${targetUser.facilityName})`);
    console.log(`   Total copied: ${totalCopied}`);
    console.log(`   Total skipped: ${totalSkipped}`);

  } catch (error) {
    console.error('❌ Error copying pickup locations:', error);
    throw error;
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

copyPickupLocations();

