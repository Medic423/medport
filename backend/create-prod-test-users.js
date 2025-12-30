#!/usr/bin/env node
/**
 * Create test users (Healthcare and EMS) in production database
 * Uses raw SQL to work with current production schema
 * Usage: DATABASE_URL="..." node create-prod-test-users.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');

const prisma = new PrismaClient();

// Generate a CUID-like ID
function generateId() {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(6).toString('hex');
  return `c${timestamp}${random}`;
}

async function createTestUsers() {
  try {
    console.log('🔐 Creating production test users...\n');
    
    // Healthcare User
    const healthcareEmail = 'test-healthcare@tcc.com';
    const healthcarePassword = 'testpassword123';
    const healthcareHashedPassword = await bcrypt.hash(healthcarePassword, 12);
    
    // Check if healthcare_users table exists and if user exists
    try {
      const existingHealthcare = await prisma.$queryRaw`
        SELECT id, email, name, "facilityName", "userType" 
        FROM healthcare_users 
        WHERE email = ${healthcareEmail}
        LIMIT 1
      `;
      
      if (existingHealthcare && existingHealthcare.length > 0) {
        console.log('⚠️  Healthcare user already exists. Updating password...');
        await prisma.$executeRaw`
          UPDATE healthcare_users 
          SET password = ${healthcareHashedPassword}, "isActive" = true
          WHERE email = ${healthcareEmail}
        `;
        console.log('✅ Healthcare user password updated successfully!');
      } else {
        const userId = generateId();
        await prisma.$executeRaw`
          INSERT INTO healthcare_users (id, email, password, name, "facilityName", "facilityType", "userType", "isActive", "createdAt", "updatedAt")
          VALUES (${userId}, ${healthcareEmail}, ${healthcareHashedPassword}, ${'Test Healthcare User'}, ${'Test Healthcare Facility'}, ${'HOSPITAL'}, ${'HEALTHCARE'}, true, NOW(), NOW())
        `;
        
        console.log('✅ Healthcare user created successfully!');
        console.log(`   Email: ${healthcareEmail}`);
        console.log(`   Name: Test Healthcare User`);
        console.log(`   Facility: Test Healthcare Facility`);
        console.log(`   User Type: HEALTHCARE`);
      }
    } catch (error) {
      console.error('❌ Error with healthcare user:', error.message);
      throw error;
    }
    
    // EMS User - Check if ems_users table exists first
    const emsEmail = 'test-ems@tcc.com';
    const emsPassword = 'testpassword123';
    const emsHashedPassword = await bcrypt.hash(emsPassword, 12);
    
    try {
      // Check if ems_users table exists
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'ems_users'
        )
      `;
      
      if (!tableExists || !tableExists[0]?.exists) {
        console.log('⚠️  ems_users table does not exist in production database.');
        console.log('   Skipping EMS user creation. Please run Prisma migrations first.');
      } else {
        // Table exists, proceed with user creation
        const existingEMS = await prisma.$queryRaw`
          SELECT id, email, name, "agencyName", "userType" 
          FROM ems_users 
          WHERE email = ${emsEmail}
          LIMIT 1
        `;
        
        if (existingEMS && existingEMS.length > 0) {
          console.log('⚠️  EMS user already exists. Updating password...');
          // Try to update with available fields
          try {
            await prisma.$executeRaw`
              UPDATE ems_users 
              SET password = ${emsHashedPassword}, "isActive" = true
              WHERE email = ${emsEmail}
            `;
            console.log('✅ EMS user password updated successfully!');
          } catch (updateError) {
            // If update fails due to missing columns, try minimal update
            await prisma.$executeRaw`
              UPDATE ems_users 
              SET password = ${emsHashedPassword}
              WHERE email = ${emsEmail}
            `;
            console.log('✅ EMS user password updated successfully!');
          }
        } else {
          const userId = generateId();
          // Try to create with all fields, fallback to minimal if needed
          try {
            await prisma.$executeRaw`
              INSERT INTO ems_users (id, email, password, name, "agencyName", "userType", "isActive", "createdAt", "updatedAt")
              VALUES (${userId}, ${emsEmail}, ${emsHashedPassword}, ${'Test EMS User'}, ${'Test EMS Agency'}, ${'EMS'}, true, NOW(), NOW())
            `;
          } catch (createError) {
            // Fallback: try without isActive if column doesn't exist
            await prisma.$executeRaw`
              INSERT INTO ems_users (id, email, password, name, "agencyName", "userType", "createdAt", "updatedAt")
              VALUES (${userId}, ${emsEmail}, ${emsHashedPassword}, ${'Test EMS User'}, ${'Test EMS Agency'}, ${'EMS'}, NOW(), NOW())
            `;
          }
          
          console.log('✅ EMS user created successfully!');
          console.log(`   Email: ${emsEmail}`);
          console.log(`   Name: Test EMS User`);
          console.log(`   Agency: Test EMS Agency`);
          console.log(`   User Type: EMS`);
        }
      }
    } catch (error) {
      console.error('❌ Error with EMS user:', error.message);
      console.log('   This may be expected if ems_users table does not exist yet.');
    }
    
    console.log('\n🔐 Test User Credentials:');
    console.log('\n📋 Healthcare User:');
    console.log(`   Email: ${healthcareEmail}`);
    console.log(`   Password: ${healthcarePassword}`);
    console.log('\n🚑 EMS User:');
    console.log(`   Email: ${emsEmail}`);
    console.log(`   Password: ${emsPassword}`);
    console.log('\n✅ Test users are ready for login testing!');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    console.error('   Full error:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();

