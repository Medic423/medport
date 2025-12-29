#!/usr/bin/env node
/**
 * Sync dropdown categories, dropdown options, and pickup locations from dev to target
 * Usage: SOURCE_DB="..." TARGET_DB="..." node sync-dropdown-and-pickup-data.js
 */

const { PrismaClient } = require('@prisma/client');

const SOURCE_DB = process.env.SOURCE_DB;
const TARGET_DB = process.env.TARGET_DB;

if (!SOURCE_DB || !TARGET_DB) {
  console.error('Usage: SOURCE_DB="..." TARGET_DB="..." node sync-dropdown-and-pickup-data.js');
  process.exit(1);
}

async function syncDropdownCategories(sourcePrisma, targetPrisma) {
  console.log('🔄 Syncing Dropdown Categories...');
  try {
    const categories = await sourcePrisma.$queryRaw`
      SELECT * FROM dropdown_categories ORDER BY "displayOrder";
    `;
    
    let synced = 0;
    for (const category of categories) {
      try {
        await targetPrisma.$executeRaw`
          INSERT INTO dropdown_categories (
            id, slug, "displayName", "displayOrder", "isActive", "createdAt", "updatedAt"
          )
          VALUES (
            ${category.id}, ${category.slug}, ${category.displayName}, 
            ${category.displayOrder}, ${category.isActive},
            ${category.createdAt}::timestamp, ${category.updatedAt}::timestamp
          )
          ON CONFLICT (slug) DO UPDATE SET
            "displayName" = EXCLUDED."displayName",
            "displayOrder" = EXCLUDED."displayOrder",
            "isActive" = EXCLUDED."isActive",
            "updatedAt" = NOW();
        `;
        synced++;
        console.log(`  ✅ ${category.displayName} (${category.slug})`);
      } catch (error) {
        console.error(`  ⚠️  ${category.displayName}:`, error.message.substring(0, 100));
      }
    }
    console.log(`✅ Synced ${synced}/${categories.length} Dropdown Categories\n`);
  } catch (error) {
    console.error('❌ Error syncing Dropdown Categories:', error.message);
  }
}

async function syncDropdownOptions(sourcePrisma, targetPrisma) {
  console.log('🔄 Syncing Dropdown Options...');
  try {
    const options = await sourcePrisma.$queryRaw`
      SELECT * FROM dropdown_options ORDER BY category, value;
    `;
    
    let synced = 0;
    for (const option of options) {
      try {
        await targetPrisma.$executeRaw`
          INSERT INTO dropdown_options (
            id, category, value, "isActive", "createdAt", "updatedAt"
          )
          VALUES (
            ${option.id}, ${option.category}, ${option.value}, 
            ${option.isActive}, ${option.createdAt}::timestamp, ${option.updatedAt}::timestamp
          )
          ON CONFLICT (id) DO UPDATE SET
            category = EXCLUDED.category,
            value = EXCLUDED.value,
            "isActive" = EXCLUDED."isActive",
            "updatedAt" = NOW()
          ON CONFLICT (category, value) DO UPDATE SET
            "isActive" = EXCLUDED."isActive",
            "updatedAt" = NOW();
        `;
        synced++;
      } catch (error) {
        console.error(`  ⚠️  ${option.category}/${option.value}:`, error.message.substring(0, 80));
      }
    }
    console.log(`✅ Synced ${synced}/${options.length} Dropdown Options\n`);
  } catch (error) {
    console.error('❌ Error syncing Dropdown Options:', error.message);
  }
}

async function syncPickupLocations(sourcePrisma, targetPrisma) {
  console.log('🔄 Syncing Pickup Locations...');
  try {
    const locations = await sourcePrisma.$queryRaw`
      SELECT * FROM pickup_locations ORDER BY "hospitalId", name;
    `;
    
    let synced = 0;
    for (const location of locations) {
      try {
        await targetPrisma.$executeRaw`
          INSERT INTO pickup_locations (
            id, "hospitalId", name, description, "contactPhone", "contactEmail",
            floor, room, "isActive", "createdAt", "updatedAt"
          )
          VALUES (
            ${location.id}, ${location.hospitalId}, ${location.name},
            ${location.description}, ${location.contactPhone}, ${location.contactEmail},
            ${location.floor}, ${location.room}, ${location.isActive},
            ${location.createdAt}::timestamp, ${location.updatedAt}::timestamp
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            "contactPhone" = EXCLUDED."contactPhone",
            "contactEmail" = EXCLUDED."contactEmail",
            floor = EXCLUDED.floor,
            room = EXCLUDED.room,
            "isActive" = EXCLUDED."isActive",
            "updatedAt" = NOW();
        `;
        synced++;
        console.log(`  ✅ ${location.name} (${location.hospitalId})`);
      } catch (error) {
        console.error(`  ⚠️  ${location.name}:`, error.message.substring(0, 100));
      }
    }
    console.log(`✅ Synced ${synced}/${locations.length} Pickup Locations\n`);
  } catch (error) {
    console.error('❌ Error syncing Pickup Locations:', error.message);
  }
}

async function main() {
  const sourcePrisma = new PrismaClient({ datasources: { db: { url: SOURCE_DB } } });
  const targetPrisma = new PrismaClient({ datasources: { db: { url: TARGET_DB } } });
  
  try {
    await syncDropdownCategories(sourcePrisma, targetPrisma);
    await syncDropdownOptions(sourcePrisma, targetPrisma);
    await syncPickupLocations(sourcePrisma, targetPrisma);
    
    console.log('✅ Dropdown and Pickup data sync completed!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

main();

