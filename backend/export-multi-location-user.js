#!/usr/bin/env node

/**
 * Export Script: Export chuck@ferrellhospitals.com from development
 * This script exports the multi-location healthcare user data for manual import to production
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Development database connection
const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://scooper@localhost:5432/medport_ems'
    }
  }
});

const TARGET_EMAIL = 'chuck@ferrellhospitals.com';

async function exportUserData() {
  console.log('🔍 Exporting user data from development...');
  
  try {
    // Find the user in development
    const user = await devPrisma.healthcareUser.findUnique({
      where: { email: TARGET_EMAIL },
      include: {
        locations: true
      }
    });

    if (!user) {
      throw new Error(`User ${TARGET_EMAIL} not found in development database`);
    }

    console.log('✅ Found user:', {
      id: user.id,
      email: user.email,
      name: user.name,
      facilityName: user.facilityName,
      facilityType: user.facilityType,
      manageMultipleLocations: user.manageMultipleLocations,
      locationsCount: user.locations.length
    });

    // Export user data (excluding sensitive fields)
    const userData = {
      email: user.email,
      password: user.password, // Keep hashed password for migration
      name: user.name,
      facilityName: user.facilityName,
      facilityType: user.facilityType,
      userType: user.userType,
      isActive: user.isActive,
      manageMultipleLocations: user.manageMultipleLocations,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      locations: user.locations.map(loc => ({
        locationName: loc.locationName,
        address: loc.address,
        city: loc.city,
        state: loc.state,
        zipCode: loc.zipCode,
        phone: loc.phone,
        facilityType: loc.facilityType,
        isActive: loc.isActive,
        isPrimary: loc.isPrimary,
        latitude: loc.latitude,
        longitude: loc.longitude,
        createdAt: loc.createdAt,
        updatedAt: loc.updatedAt
      }))
    };

    // Save to file
    const exportPath = path.join(__dirname, 'chuck-ferrellhospitals-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(userData, null, 2));
    
    console.log(`✅ User data exported to: ${exportPath}`);
    console.log('');
    console.log('📊 Export Summary:');
    console.log(`   User: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Facility: ${user.facilityName}`);
    console.log(`   Multi-location enabled: ${user.manageMultipleLocations}`);
    console.log(`   Locations: ${user.locations.length}`);
    console.log('');
    console.log('📍 Location Details:');
    user.locations.forEach((loc, index) => {
      console.log(`   ${index + 1}. ${loc.locationName} (${loc.facilityType})`);
      console.log(`      ${loc.address}, ${loc.city}, ${loc.state} ${loc.zipCode}`);
      console.log(`      Primary: ${loc.isPrimary}, Active: ${loc.isActive}`);
    });

    return userData;

  } catch (error) {
    console.error('❌ Error exporting user data:', error);
    throw error;
  }
}

async function generateImportScript(userData) {
  console.log('');
  console.log('🔧 Generating import script...');
  
  const importScript = `
-- Import script for chuck@ferrellhospitals.com
-- Run this on the production database

-- Insert the healthcare user
INSERT INTO healthcare_users (
  id, email, password, name, "facilityName", "facilityType", 
  "userType", "isActive", "manageMultipleLocations", 
  "createdAt", "updatedAt"
) VALUES (
  '${userData.email.replace('@', '_at_')}_prod', -- Generate new ID for production
  '${userData.email}',
  '${userData.password}', -- Keep the same hashed password
  '${userData.name}',
  '${userData.facilityName}',
  '${userData.facilityType}',
  '${userData.userType}',
  ${userData.isActive},
  ${userData.manageMultipleLocations},
  '${userData.createdAt.toISOString()}',
  '${userData.updatedAt.toISOString()}'
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  "facilityName" = EXCLUDED."facilityName",
  "facilityType" = EXCLUDED."facilityType",
  "isActive" = EXCLUDED."isActive",
  "manageMultipleLocations" = EXCLUDED."manageMultipleLocations",
  "updatedAt" = EXCLUDED."updatedAt";

-- Get the user ID for location insertion
-- Note: You'll need to replace 'USER_ID_HERE' with the actual ID after inserting the user

${userData.locations.map((loc, index) => `
-- Location ${index + 1}: ${loc.locationName}
INSERT INTO healthcare_locations (
  id, "healthcareUserId", "locationName", address, city, state, 
  "zipCode", phone, "facilityType", "isActive", "isPrimary", 
  latitude, longitude, "createdAt", "updatedAt"
) VALUES (
  'loc_${userData.email.replace('@', '_at_')}_${index + 1}_prod',
  (SELECT id FROM healthcare_users WHERE email = '${userData.email}'),
  '${loc.locationName}',
  '${loc.address}',
  '${loc.city}',
  '${loc.state}',
  '${loc.zipCode}',
  ${loc.phone ? `'${loc.phone}'` : 'NULL'},
  '${loc.facilityType}',
  ${loc.isActive},
  ${loc.isPrimary},
  ${loc.latitude || 'NULL'},
  ${loc.longitude || 'NULL'},
  '${loc.createdAt.toISOString()}',
  '${loc.updatedAt.toISOString()}'
) ON CONFLICT (id) DO UPDATE SET
  "locationName" = EXCLUDED."locationName",
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  "zipCode" = EXCLUDED."zipCode",
  phone = EXCLUDED.phone,
  "facilityType" = EXCLUDED."facilityType",
  "isActive" = EXCLUDED."isActive",
  "isPrimary" = EXCLUDED."isPrimary",
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  "updatedAt" = EXCLUDED."updatedAt";`).join('')}
`;

  const scriptPath = path.join(__dirname, 'import-chuck-ferrellhospitals.sql');
  fs.writeFileSync(scriptPath, importScript);
  
  console.log(`✅ Import script generated: ${scriptPath}`);
  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. Run the SQL script on your production database');
  console.log('   2. Or use the JSON file to create a production import script');
  console.log('   3. Test the user login in production');
}

async function main() {
  console.log('🚀 Starting multi-location user export...');
  console.log('   Target user:', TARGET_EMAIL);
  console.log('   From: Development database');
  console.log('');

  try {
    // Step 1: Export from development
    const userData = await exportUserData();
    
    // Step 2: Generate import script
    await generateImportScript(userData);
    
    console.log('');
    console.log('🎉 Export completed successfully!');
    console.log('   The user data is ready for production import.');
    
  } catch (error) {
    console.error('');
    console.error('💥 Export failed:', error.message);
    process.exit(1);
  } finally {
    await devPrisma.$disconnect();
  }
}

// Run the export
main().catch(console.error);
