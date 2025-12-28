#!/usr/bin/env node
/**
 * Sync full database from dev to local/production
 * Includes: EMS Agencies, Hospitals, Facilities, and related data
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const SOURCE_DB = process.env.SOURCE_DB;
const TARGET_DB = process.env.TARGET_DB;

if (!SOURCE_DB || !TARGET_DB) {
  console.error('Usage: SOURCE_DB="..." TARGET_DB="..." node sync-full-database.js');
  process.exit(1);
}

async function syncEMS Agencies(sourcePrisma, targetPrisma) {
  console.log('🔄 Syncing EMS Agencies...');
  try {
    const agencies = await sourcePrisma.$queryRaw`
      SELECT * FROM ems_agencies ORDER BY name;
    `;
    
    for (const agency of agencies) {
      try {
        await targetPrisma.$executeRaw`
          INSERT INTO ems_agencies (
            id, name, email, address, city, state, "zipCode", "serviceArea",
            phone, "licenseNumber", "serviceType", "isActive", "requiresReview",
            "approvedAt", "approvedBy", "availableUnits", "lastUpdated",
            latitude, longitude, "notificationMethods", "serviceRadius",
            "totalUnits", "availabilityStatus", "createdAt", "updatedAt"
          )
          VALUES (
            ${agency.id}, ${agency.name}, ${agency.email}, ${agency.address},
            ${agency.city}, ${agency.state}, ${agency.zipCode}, ${agency.serviceArea}::text[],
            ${agency.phone}, ${agency.licenseNumber}, ${agency.serviceType}, ${agency.isActive},
            ${agency.requiresReview}, ${agency.approvedAt}::timestamp, ${agency.approvedBy},
            ${agency.availableUnits}, ${agency.lastUpdated}::timestamp, ${agency.latitude},
            ${agency.longitude}, ${agency.notificationMethods}::text[], ${agency.serviceRadius},
            ${agency.totalUnits}, ${agency.availabilityStatus}::jsonb,
            ${agency.createdAt}::timestamp, ${agency.updatedAt}::timestamp
          )
          ON CONFLICT (id) DO UPDATE
          SET name = EXCLUDED.name,
              email = EXCLUDED.email,
              address = EXCLUDED.address,
              city = EXCLUDED.city,
              state = EXCLUDED.state,
              "zipCode" = EXCLUDED."zipCode",
              "serviceArea" = EXCLUDED."serviceArea",
              phone = EXCLUDED.phone,
              "licenseNumber" = EXCLUDED."licenseNumber",
              "serviceType" = EXCLUDED."serviceType",
              "isActive" = EXCLUDED."isActive",
              "updatedAt" = NOW();
        `;
      } catch (error) {
        console.error(`⚠️  Error syncing agency ${agency.name}:`, error.message);
      }
    }
    console.log(`✅ Synced ${agencies.length} EMS Agencies`);
  } catch (error) {
    console.error('❌ Error syncing EMS Agencies:', error.message);
  }
}

async function syncHospitals(sourcePrisma, targetPrisma) {
  console.log('🔄 Syncing Hospitals...');
  try {
    const hospitals = await sourcePrisma.$queryRaw`
      SELECT * FROM hospitals ORDER BY name;
    `;
    
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
            ${hospital.id}, ${hospital.name}, ${hospital.address}, ${hospital.city},
            ${hospital.state}, ${hospital.zipCode}, ${hospital.phone}, ${hospital.email},
            ${hospital.type}, ${hospital.capabilities}::text[], ${hospital.region},
            ${hospital.coordinates}::jsonb, ${hospital.latitude}, ${hospital.longitude},
            ${hospital.operatingHours}, ${hospital.isActive}, ${hospital.requiresReview},
            ${hospital.approvedAt}::timestamp, ${hospital.approvedBy},
            ${hospital.createdAt}::timestamp, ${hospital.updatedAt}::timestamp
          )
          ON CONFLICT (id) DO UPDATE
          SET name = EXCLUDED.name,
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
      } catch (error) {
        console.error(`⚠️  Error syncing hospital ${hospital.name}:`, error.message);
      }
    }
    console.log(`✅ Synced ${hospitals.length} Hospitals`);
  } catch (error) {
    console.error('❌ Error syncing Hospitals:', error.message);
  }
}

async function updateHealthcareUserAdmin(sourcePrisma, targetPrisma) {
  console.log('🔄 Updating chuck@ferrellhospitals.com to admin...');
  try {
    await targetPrisma.$executeRaw`
      UPDATE healthcare_users
      SET "orgAdmin" = true
      WHERE email = 'chuck@ferrellhospitals.com';
    `;
    console.log('✅ Updated chuck@ferrellhospitals.com to orgAdmin');
  } catch (error) {
    console.error('❌ Error updating user:', error.message);
  }
}

async function main() {
  const sourcePrisma = new PrismaClient({ datasources: { db: { url: SOURCE_DB } } });
  const targetPrisma = new PrismaClient({ datasources: { db: { url: TARGET_DB } } });
  
  try {
    await syncEMS Agencies(sourcePrisma, targetPrisma);
    await syncHospitals(sourcePrisma, targetPrisma);
    await updateHealthcareUserAdmin(sourcePrisma, targetPrisma);
    
    // Now sync EMS users (agencies should exist now)
    console.log('🔄 Re-syncing EMS Users...');
    const { execSync } = require('child_process');
    execSync(`SOURCE_DB="${SOURCE_DB}" TARGET_DB="${TARGET_DB}" node sync-users-across-environments.js sync`, { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

main();

