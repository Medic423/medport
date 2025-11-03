#!/usr/bin/env node
/**
 * Reset admin@tcc.com password back to default (admin123)
 * Usage: node scripts/reset-admin-password.js [new-password]
 */

const { databaseManager } = require('../backend/dist/services/databaseManager');
const bcrypt = require('bcryptjs');

async function resetAdminPassword(newPassword = 'admin123') {
  let prisma;
  try {
    console.log(`Resetting password for admin@tcc.com...\n`);
    
    prisma = databaseManager.getPrismaClient();
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update the admin user
    const updatedUser = await prisma.centerUser.update({
      where: { email: 'admin@tcc.com' },
      data: { password: hashedPassword },
      select: {
        email: true,
        name: true,
        updatedAt: true
      }
    });

    console.log('✅ Password reset successfully!');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Updated: ${updatedUser.updatedAt}`);
    console.log(`   New Password: ${newPassword}`);
    console.log('\n🔐 You can now log in with:');
    console.log(`   Email: admin@tcc.com`);
    console.log(`   Password: ${newPassword}`);

  } catch (error) {
    if (error.code === 'P2025') {
      console.error('❌ Admin user not found!');
    } else {
      console.error('❌ Error resetting password:', error);
    }
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Get password from command line or use default
const newPassword = process.argv[2] || 'admin123';
resetAdminPassword(newPassword);

