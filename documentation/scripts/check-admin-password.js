#!/usr/bin/env node
/**
 * Check the current password for admin@tcc.com
 * This script will help verify if the password was changed
 */

const { databaseManager } = require('../backend/dist/services/databaseManager');
const bcrypt = require('bcryptjs');

async function checkAdminPassword() {
  let prisma;
  try {
    console.log('Checking admin@tcc.com credentials...\n');
    
    prisma = databaseManager.getPrismaClient();
    
    // Find the admin user
    const adminUser = await prisma.centerUser.findUnique({
      where: { email: 'admin@tcc.com' },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        password: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   User Type: ${adminUser.userType}`);
    console.log(`   Created: ${adminUser.createdAt}`);
    console.log(`   Last Updated: ${adminUser.updatedAt}`);
    console.log(`   Password Hash: ${adminUser.password.substring(0, 20)}...`);

    // Test if default password works
    const defaultPassword = 'admin123';
    const isDefaultPassword = await bcrypt.compare(defaultPassword, adminUser.password);
    
    console.log('\n🔐 Password Check:');
    console.log(`   Default password (admin123) works: ${isDefaultPassword ? '✅ YES' : '❌ NO'}`);
    
    if (!isDefaultPassword) {
      console.log('\n⚠️  WARNING: The password has been changed from the default!');
      console.log('   The password is NOT "admin123"');
      console.log('   If you need to reset it, you can use a script to set it back.');
    } else {
      console.log('   ✅ Password is still the default: admin123');
    }

  } catch (error) {
    console.error('❌ Error checking admin password:', error);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

checkAdminPassword();

