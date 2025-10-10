#!/usr/bin/env node

/**
 * Production Import Script: Import chuck@ferrellhospitals.com to production
 * This script should be run on the production server with access to the production database
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Production database connection (will use environment variables)
const prodPrisma = new PrismaClient();

const TARGET_EMAIL = 'chuck@ferrellhospitals.com';

async function importUserData() {
  console.log('📥 Importing user data to production...');
  
  try {
    // Read the exported data
    const exportPath = path.join(__dirname, 'chuck-ferrellhospitals-export.json');
    if (!fs.existsSync(exportPath)) {
      throw new Error('Export file not found. Please run export-multi-location-user.js first.');
    }
    
    const userData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    console.log('✅ Loaded user data from export file');
    
    // Check if user already exists in production
    const existingUser = await prodPrisma.healthcareUser.findUnique({
      where: { email: TARGET_EMAIL }
    });

    if (existingUser) {
      console.log('⚠️  User already exists in production. Updating...');
      
      // Update existing user
      const updatedUser = await prodPrisma.healthcareUser.update({
        where: { email: TARGET_EMAIL },
        data: {
          name: userData.name,
          facilityName: userData.facilityName,
          facilityType: userData.facilityType,
          isActive: userData.isActive,
          manageMultipleLocations: userData.manageMultipleLocations,
          updatedAt: new Date()
        }
      });

      console.log('✅ Updated existing user:', updatedUser.id);

      // Delete existing locations and recreate them
      await prodPrisma.healthcareLocation.deleteMany({
        where: { healthcareUserId: updatedUser.id }
      });

      console.log('🗑️  Deleted existing locations');

      // Create new locations
      for (const locationData of userData.locations) {
        await prodPrisma.healthcareLocation.create({
          data: {
            healthcareUserId: updatedUser.id,
            ...locationData
          }
        });
      }

      console.log(`✅ Created ${userData.locations.length} locations for existing user`);

    } else {
      console.log('🆕 Creating new user in production...');
      
      // Create new user
      const newUser = await prodPrisma.healthcareUser.create({
        data: {
          email: userData.email,
          password: userData.password, // Keep the same hashed password
          name: userData.name,
          facilityName: userData.facilityName,
          facilityType: userData.facilityType,
          userType: userData.userType,
          isActive: userData.isActive,
          manageMultipleLocations: userData.manageMultipleLocations,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        }
      });

      console.log('✅ Created new user:', newUser.id);

      // Create locations
      for (const locationData of userData.locations) {
        await prodPrisma.healthcareLocation.create({
          data: {
            healthcareUserId: newUser.id,
            ...locationData
          }
        });
      }

      console.log(`✅ Created ${userData.locations.length} locations for new user`);
    }

  } catch (error) {
    console.error('❌ Error importing user data:', error);
    throw error;
  }
}

async function verifyImport() {
  console.log('🔍 Verifying import...');
  
  try {
    const user = await prodPrisma.healthcareUser.findUnique({
      where: { email: TARGET_EMAIL },
      include: {
        locations: true
      }
    });

    if (!user) {
      throw new Error('User not found in production after import');
    }

    console.log('✅ Import verification successful:');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Multi-location enabled:', user.manageMultipleLocations);
    console.log('   Locations count:', user.locations.length);
    console.log('   Active locations:', user.locations.filter(l => l.isActive).length);
    console.log('   Primary location:', user.locations.find(l => l.isPrimary)?.locationName || 'None');

    console.log('');
    console.log('📍 Location Details:');
    user.locations.forEach((loc, index) => {
      console.log(`   ${index + 1}. ${loc.locationName} (${loc.facilityType})`);
      console.log(`      ${loc.address}, ${loc.city}, ${loc.state} ${loc.zipCode}`);
      console.log(`      Primary: ${loc.isPrimary}, Active: ${loc.isActive}`);
    });

    return user;

  } catch (error) {
    console.error('❌ Import verification failed:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting production import...');
  console.log('   Target user:', TARGET_EMAIL);
  console.log('   Database: Production');
  console.log('');

  try {
    // Step 1: Import user data
    await importUserData();
    
    // Step 2: Verify import
    await verifyImport();
    
    console.log('');
    console.log('🎉 Import completed successfully!');
    console.log('   The user is now available in production with multi-location capabilities.');
    console.log('');
    console.log('🧪 Next Steps:');
    console.log('   1. Test login at https://traccems.com');
    console.log('   2. Verify multi-location feature works');
    console.log('   3. Test creating trips from different locations');
    
  } catch (error) {
    console.error('');
    console.error('💥 Import failed:', error.message);
    process.exit(1);
  } finally {
    await prodPrisma.$disconnect();
  }
}

// Run the import
main().catch(console.error);
