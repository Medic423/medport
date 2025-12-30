#!/usr/bin/env node
/**
 * Create test users (Healthcare and EMS) in production database
 * Usage: DATABASE_URL="..." node create-prod-test-users.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('🔐 Creating production test users...\n');
    
    // Healthcare User
    const healthcareEmail = 'test-healthcare@tcc.com';
    const healthcarePassword = 'testpassword123';
    const healthcareHashedPassword = await bcrypt.hash(healthcarePassword, 12);
    
    // Check if healthcare user already exists
    const existingHealthcare = await prisma.healthcareUser.findUnique({
      where: { email: healthcareEmail }
    });
    
    if (existingHealthcare) {
      console.log('⚠️  Healthcare user already exists. Updating password...');
      await prisma.healthcareUser.update({
        where: { email: healthcareEmail },
        data: {
          password: healthcareHashedPassword,
          isActive: true,
          isDeleted: false
        }
      });
      console.log('✅ Healthcare user password updated successfully!');
    } else {
      const healthcareUser = await prisma.healthcareUser.create({
        data: {
          email: healthcareEmail,
          password: healthcareHashedPassword,
          name: 'Test Healthcare User',
          facilityName: 'Test Healthcare Facility',
          facilityType: 'HOSPITAL',
          userType: 'HEALTHCARE',
          isActive: true,
          isDeleted: false,
          orgAdmin: true
        },
        select: {
          email: true,
          name: true,
          facilityName: true,
          userType: true,
          createdAt: true
        }
      });
      
      console.log('✅ Healthcare user created successfully!');
      console.log(`   Email: ${healthcareUser.email}`);
      console.log(`   Name: ${healthcareUser.name}`);
      console.log(`   Facility: ${healthcareUser.facilityName}`);
      console.log(`   User Type: ${healthcareUser.userType}`);
      console.log(`   Created: ${healthcareUser.createdAt}`);
    }
    
    // EMS User
    const emsEmail = 'test-ems@tcc.com';
    const emsPassword = 'testpassword123';
    const emsHashedPassword = await bcrypt.hash(emsPassword, 12);
    
    // Check if EMS user already exists
    const existingEMS = await prisma.eMSUser.findUnique({
      where: { email: emsEmail }
    });
    
    if (existingEMS) {
      console.log('⚠️  EMS user already exists. Updating password...');
      await prisma.eMSUser.update({
        where: { email: emsEmail },
        data: {
          password: emsHashedPassword,
          isActive: true,
          isDeleted: false
        }
      });
      console.log('✅ EMS user password updated successfully!');
    } else {
      const emsUser = await prisma.eMSUser.create({
        data: {
          email: emsEmail,
          password: emsHashedPassword,
          name: 'Test EMS User',
          agencyName: 'Test EMS Agency',
          userType: 'EMS',
          isActive: true,
          isDeleted: false,
          orgAdmin: true
        },
        select: {
          email: true,
          name: true,
          agencyName: true,
          userType: true,
          createdAt: true
        }
      });
      
      console.log('✅ EMS user created successfully!');
      console.log(`   Email: ${emsUser.email}`);
      console.log(`   Name: ${emsUser.name}`);
      console.log(`   Agency: ${emsUser.agencyName}`);
      console.log(`   User Type: ${emsUser.userType}`);
      console.log(`   Created: ${emsUser.createdAt}`);
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
    if (error.code === 'P2002') {
      console.error('   This email already exists. The script will update the password instead.');
    } else if (error.code === 'P2025') {
      console.error('   Table does not exist. Please run migrations first.');
    } else {
      console.error('   Full error:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();

