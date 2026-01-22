#!/usr/bin/env node
/**
 * Fix orphaned EMS agency: Create missing user account for chuck@chuckambulance.com
 * 
 * This script fixes the issue where an EMS agency exists but the user account doesn't.
 * 
 * Usage:
 *   DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node fix-orphaned-ems-agency.js
 * 
 * Or set DATABASE_URL in environment and run:
 *   node fix-orphaned-ems-agency.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

/**
 * Generate temporary password (12 characters: 1 upper, 1 lower, 1 digit, 9 random)
 * Matches the function used in the application (excludes confusing characters)
 */
function generateTempPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes I, O
  const lower = 'abcdefghijkmnopqrstuvwxyz'; // Excludes l, o
  const digits = '23456789'; // Excludes 0, 1
  const all = upper + lower + digits;
  let out = '';
  out += upper[Math.floor(Math.random() * upper.length)];
  out += lower[Math.floor(Math.random() * lower.length)];
  out += digits[Math.floor(Math.random() * digits.length)];
  for (let i = 0; i < 9; i++) {
    out += all[Math.floor(Math.random() * all.length)];
  }
  return out;
}

async function fixOrphanedAgency() {
  const targetEmail = 'chuck@chuckambulance.com';
  
  try {
    console.log('🔧 Fixing Orphaned EMS Agency Issue\n');
    console.log(`Target email: ${targetEmail}\n`);
    
    // Step 1: Check if user already exists
    console.log('📋 Step 1: Checking if user already exists...');
    const existingUser = await prisma.eMSUser.findUnique({
      where: { email: targetEmail }
    });
    
    if (existingUser) {
      console.log('✅ User already exists!');
      console.log('   User ID:', existingUser.id);
      console.log('   Name:', existingUser.name);
      console.log('   Agency:', existingUser.agencyName);
      console.log('   Agency ID:', existingUser.agencyId);
      console.log('\n⚠️  No action needed - user account exists.');
      return;
    }
    
    console.log('❌ User does not exist - proceeding with fix...\n');
    
    // Step 2: Find the orphaned agency
    console.log('📋 Step 2: Finding orphaned agency...');
    const agency = await prisma.eMSAgency.findFirst({
      where: { email: targetEmail }
    });
    
    if (!agency) {
      console.error('❌ Agency not found with email:', targetEmail);
      console.error('   Cannot create user without agency information.');
      return;
    }
    
    console.log('✅ Found agency:');
    console.log('   Agency ID:', agency.id);
    console.log('   Agency Name:', agency.name);
    console.log('   Contact Name:', agency.contactName);
    console.log('   Email:', agency.email);
    console.log('   Phone:', agency.phone);
    console.log('   Address:', `${agency.address}, ${agency.city}, ${agency.state} ${agency.zipCode}`);
    console.log('');
    
    // Step 3: Check if this is the first user for this agency
    console.log('📋 Step 3: Checking if this is the first user for the agency...');
    const existingUsersForAgency = await prisma.eMSUser.count({
      where: { agencyName: agency.name }
    });
    
    const isFirstUser = existingUsersForAgency === 0;
    console.log(`   Existing users for agency: ${existingUsersForAgency}`);
    console.log(`   Is first user: ${isFirstUser ? 'Yes (will be orgAdmin)' : 'No'}`);
    console.log('');
    
    // Step 4: Generate temporary password
    console.log('📋 Step 4: Generating temporary password...');
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    console.log('✅ Password generated and hashed');
    console.log('');
    
    // Step 5: Create the user account
    console.log('📋 Step 5: Creating user account...');
    const userData = {
      email: agency.email,
      password: hashedPassword,
      name: agency.contactName || 'EMS User', // Use contactName from agency
      agencyName: agency.name,
      agencyId: agency.id, // Link to existing agency
      userType: 'EMS',
      isActive: true,
      isSubUser: false,
      orgAdmin: isFirstUser, // First user is org admin
      mustChangePassword: true, // Require password change on first login
      isDeleted: false
    };
    
    console.log('   User data (password hidden):');
    console.log('   - Email:', userData.email);
    console.log('   - Name:', userData.name);
    console.log('   - Agency:', userData.agencyName);
    console.log('   - Agency ID:', userData.agencyId);
    console.log('   - Org Admin:', userData.orgAdmin);
    console.log('   - Must Change Password:', userData.mustChangePassword);
    console.log('');
    
    const user = await prisma.eMSUser.create({
      data: userData
    });
    
    console.log('✅ User account created successfully!');
    console.log('   User ID:', user.id);
    console.log('');
    
    // Step 6: Verify the creation
    console.log('📋 Step 6: Verifying user creation...');
    const verifyUser = await prisma.eMSUser.findUnique({
      where: { email: targetEmail },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (verifyUser) {
      console.log('✅ Verification successful!');
      console.log('   User:', verifyUser.email);
      console.log('   Name:', verifyUser.name);
      console.log('   Agency:', verifyUser.agency?.name);
      console.log('   Linked to Agency ID:', verifyUser.agencyId);
      console.log('');
    } else {
      console.log('⚠️  Warning: Could not verify user creation');
      console.log('');
    }
    
    // Step 7: Display credentials
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ FIX COMPLETE - User Account Created');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📧 Email:', targetEmail);
    console.log('🔑 Temporary Password:', tempPassword);
    console.log('');
    console.log('⚠️  IMPORTANT:');
    console.log('   - User MUST change password on first login');
    console.log('   - Share these credentials securely with the user');
    console.log('   - User can now log in at: https://traccems.com');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('\n❌ Error fixing orphaned agency:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    if (error.meta) {
      console.error('   Meta:', JSON.stringify(error.meta, null, 2));
    }
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixOrphanedAgency();

