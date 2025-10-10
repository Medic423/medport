#!/usr/bin/env node

/**
 * Migration Script: Export chuck@ferrellhospitals.com from development and import to production
 * This script handles the multi-location healthcare user migration for sales demo
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Database connections
const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://scooper@localhost:5432/medport_ems'
    }
  }
});

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://tcc_production_db_user:kduvfSGb4YrhCQGBR0h40pcXi9bb9Ij9@dpg-d2u62j3e5dus73eeo4l0-a.oregon-postgres.render.com:5432/tcc_production_db?sslmode=require'
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

    return userData;

  } catch (error) {
    console.error('❌ Error exporting user data:', error);
    throw error;
  }
}

async function importUserData(userData) {
  console.log('📥 Importing user data to production...');
  
  try {
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

async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  try {
    const user = await prodPrisma.healthcareUser.findUnique({
      where: { email: TARGET_EMAIL },
      include: {
        locations: true
      }
    });

    if (!user) {
      throw new Error('User not found in production after migration');
    }

    console.log('✅ Migration verification successful:');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Multi-location enabled:', user.manageMultipleLocations);
    console.log('   Locations count:', user.locations.length);
    console.log('   Active locations:', user.locations.filter(l => l.isActive).length);
    console.log('   Primary location:', user.locations.find(l => l.isPrimary)?.locationName || 'None');

    return user;

  } catch (error) {
    console.error('❌ Migration verification failed:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting multi-location user migration...');
  console.log('   Target user:', TARGET_EMAIL);
  console.log('   From: Development database');
  console.log('   To: Production database');
  console.log('');

  try {
    // Step 1: Export from development
    const userData = await exportUserData();
    
    // Step 2: Import to production
    await importUserData(userData);
    
    // Step 3: Verify migration
    await verifyMigration();
    
    console.log('');
    console.log('🎉 Migration completed successfully!');
    console.log('   The user should now be available in production with multi-location capabilities.');
    
  } catch (error) {
    console.error('');
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Run the migration
main().catch(console.error);
