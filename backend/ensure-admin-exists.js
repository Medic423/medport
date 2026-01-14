#!/usr/bin/env node
/**
 * Ensure admin@tcc.com exists with consistent password across all environments
 * 
 * This script ensures admin@tcc.com exists with password: password123
 * in the specified database environment.
 * 
 * Usage:
 *   # For dev-swa (dev Azure database)
 *   DATABASE_URL="postgresql://..." node ensure-admin-exists.js
 * 
 *   # For production (production Azure database)
 *   DATABASE_URL="postgresql://..." node ensure-admin-exists.js
 * 
 *   # For local dev
 *   DATABASE_URL="postgresql://localhost:5432/medport_ems" node ensure-admin-exists.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Standard admin credentials across all environments
const ADMIN_EMAIL = 'admin@tcc.com';
const ADMIN_PASSWORD = 'password123'; // Standard password for all environments
const ADMIN_NAME = 'TCC Administrator';

const prisma = new PrismaClient();

async function ensureAdminExists() {
  try {
    console.log('🔐 Ensuring admin user exists with standard credentials...\n');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Database: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'Not set'}\n`);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    
    // Check if user already exists
    const existingUser = await prisma.centerUser.findUnique({
      where: { email: ADMIN_EMAIL }
    });
    
    if (existingUser) {
      console.log('⚠️  Admin user already exists. Updating to standard credentials...');
      
      // Update password and ensure user is active
      const updatedUser = await prisma.centerUser.update({
        where: { email: ADMIN_EMAIL },
        data: {
          password: hashedPassword,
          userType: 'ADMIN',
          isActive: true,
          isDeleted: false,
          name: ADMIN_NAME
        },
        select: {
          email: true,
          name: true,
          userType: true,
          isActive: true,
          isDeleted: true,
          updatedAt: true
        }
      });
      
      console.log('✅ Admin user updated successfully!');
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Name: ${updatedUser.name}`);
      console.log(`   User Type: ${updatedUser.userType}`);
      console.log(`   Active: ${updatedUser.isActive}`);
      console.log(`   Deleted: ${updatedUser.isDeleted}`);
      console.log(`   Updated: ${updatedUser.updatedAt}`);
    } else {
      // Create new admin user
      const adminUser = await prisma.centerUser.create({
        data: {
          email: ADMIN_EMAIL,
          password: hashedPassword,
          name: ADMIN_NAME,
          userType: 'ADMIN',
          isActive: true,
          isDeleted: false
        },
        select: {
          email: true,
          name: true,
          userType: true,
          isActive: true,
          createdAt: true
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   User Type: ${adminUser.userType}`);
      console.log(`   Active: ${adminUser.isActive}`);
      console.log(`   Created: ${adminUser.createdAt}`);
    }
    
    console.log('\n🔐 Standard Login Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('\n✅ Admin user is ready for login!');
    
  } catch (error) {
    console.error('❌ Error ensuring admin user exists:', error);
    console.error('   Error details:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('\nUsage:');
  console.error('  DATABASE_URL="postgresql://..." node ensure-admin-exists.js');
  process.exit(1);
}

ensureAdminExists();
