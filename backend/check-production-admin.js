#!/usr/bin/env node
/**
 * Check and verify admin@tcc.com credentials in production
 * Tests both password123 and admin123 to see which one works
 * 
 * Usage:
 *   DATABASE_URL_PROD="postgresql://..." node check-production-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = 'admin@tcc.com';
const PASSWORD_OPTIONS = ['password123', 'admin123'];

const prisma = new PrismaClient();

async function checkProductionAdmin() {
  try {
    console.log('🔐 Checking admin@tcc.com credentials in production...\n');
    
    // Find the admin user
    const adminUser = await prisma.centerUser.findUnique({
      where: { email: ADMIN_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        isActive: true,
        isDeleted: true,
        password: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      console.log('\n💡 To create admin user, run:');
      console.log('   DATABASE_URL_PROD="..." node ensure-admin-exists.js');
      return;
    }

    console.log('✅ Admin user found:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name || 'Not set'}`);
    console.log(`   User Type: ${adminUser.userType}`);
    console.log(`   Active: ${adminUser.isActive}`);
    console.log(`   Deleted: ${adminUser.isDeleted}`);
    console.log(`   Created: ${adminUser.createdAt}`);
    console.log(`   Last Updated: ${adminUser.updatedAt}`);
    console.log(`   Password Hash: ${adminUser.password.substring(0, 30)}...`);

    // Test both password options
    console.log('\n🔐 Testing passwords:');
    let workingPassword = null;
    
    for (const password of PASSWORD_OPTIONS) {
      const matches = await bcrypt.compare(password, adminUser.password);
      const status = matches ? '✅ WORKS' : '❌ NO';
      console.log(`   ${password}: ${status}`);
      if (matches) {
        workingPassword = password;
      }
    }

    if (workingPassword) {
      console.log(`\n✅ Working password found: ${workingPassword}`);
      console.log('\n🔐 Login Credentials:');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${workingPassword}`);
    } else {
      console.log('\n❌ Neither password works!');
      console.log('   The password has been changed from both defaults.');
      console.log('\n💡 To reset password to password123, run:');
      console.log('   DATABASE_URL_PROD="..." node ensure-admin-exists.js');
    }

    // Check if user is active and not deleted
    if (!adminUser.isActive) {
      console.log('\n⚠️  WARNING: User is INACTIVE - login will fail!');
    }
    if (adminUser.isDeleted) {
      console.log('\n⚠️  WARNING: User is DELETED - login will fail!');
    }

  } catch (error) {
    console.error('❌ Error checking admin credentials:', error);
    console.error('   Error details:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if DATABASE_URL_PROD is set, fallback to DATABASE_URL
const dbUrl = process.env.DATABASE_URL_PROD || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL_PROD or DATABASE_URL environment variable is required');
  console.error('\nUsage:');
  console.error('  DATABASE_URL_PROD="postgresql://..." node check-production-admin.js');
  process.exit(1);
}

// Set DATABASE_URL for Prisma
process.env.DATABASE_URL = dbUrl;

checkProductionAdmin();
