#!/usr/bin/env node
/**
 * Create admin user in production database
 * Usage: DATABASE_URL="..." node create-prod-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createProdAdmin() {
  try {
    console.log('🔐 Creating production admin user...\n');
    
    const email = 'admin@tcc.com';
    const password = 'password123';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Check if user already exists
    const existingUser = await prisma.centerUser.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('⚠️  User already exists. Updating password...');
      const updatedUser = await prisma.centerUser.update({
        where: { email },
        data: {
          password: hashedPassword,
          userType: 'ADMIN',
          isActive: true,
          isDeleted: false
        },
        select: {
          email: true,
          name: true,
          userType: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      console.log('✅ Admin user password updated successfully!');
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Name: ${updatedUser.name || 'Not set'}`);
      console.log(`   User Type: ${updatedUser.userType}`);
      console.log(`   Updated: ${updatedUser.updatedAt}`);
    } else {
      // Create new admin user
      const adminUser = await prisma.centerUser.create({
        data: {
          email,
          password: hashedPassword,
          name: 'TCC Administrator',
          userType: 'ADMIN',
          isActive: true,
          isDeleted: false
        },
        select: {
          email: true,
          name: true,
          userType: true,
          createdAt: true
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   User Type: ${adminUser.userType}`);
      console.log(`   Created: ${adminUser.createdAt}`);
    }
    
    console.log('\n🔐 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n✅ You can now log in at https://traccems.com');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createProdAdmin();

