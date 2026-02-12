#!/usr/bin/env node
/**
 * Verify EMS user fix: Check that chuck@chuckambulance.com user account exists and is properly configured
 * 
 * Usage:
 *   DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node verify-ems-user-fix.js
 */

const { PrismaClient } = require('@prisma/client');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function verifyFix() {
  const email = 'chuck@chuckambulance.com';
  
  try {
    console.log('🔍 Verifying EMS User Fix\n');
    console.log(`Target email: ${email}\n`);
    
    // Step 1: Verify user exists
    console.log('📋 Step 1: Verifying user exists in ems_users table...');
    const user = await prisma.eMSUser.findUnique({
      where: { email },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true
          }
        }
      }
    });
    
    if (!user) {
      console.log('❌ User NOT found in ems_users table');
      console.log('   Fix was not successful - user account does not exist');
      return;
    }
    
    console.log('✅ User found!');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Agency Name:', user.agencyName);
    console.log('   Agency ID:', user.agencyId);
    console.log('   User Type:', user.userType);
    console.log('   Is Active:', user.isActive);
    console.log('   Is Sub User:', user.isSubUser);
    console.log('   Org Admin:', user.orgAdmin);
    console.log('   Must Change Password:', user.mustChangePassword);
    console.log('   Is Deleted:', user.isDeleted);
    console.log('   Created At:', user.createdAt);
    console.log('');
    
    // Step 2: Verify user is linked to agency
    console.log('📋 Step 2: Verifying user-agency linkage...');
    if (!user.agencyId) {
      console.log('❌ User is not linked to an agency (agencyId is null)');
      return;
    }
    
    if (!user.agency) {
      console.log('❌ Agency relationship not found');
      console.log('   Agency ID exists but agency record not found');
      return;
    }
    
    console.log('✅ User is properly linked to agency!');
    console.log('   Agency ID:', user.agency.id);
    console.log('   Agency Name:', user.agency.name);
    console.log('   Agency Email:', user.agency.email);
    console.log('   Agency Is Active:', user.agency.isActive);
    console.log('');
    
    // Step 3: Verify email matches
    console.log('📋 Step 3: Verifying email consistency...');
    if (user.email !== user.agency.email) {
      console.log('⚠️  Warning: User email does not match agency email');
      console.log('   User email:', user.email);
      console.log('   Agency email:', user.agency.email);
    } else {
      console.log('✅ Email matches between user and agency');
    }
    console.log('');
    
    // Step 4: Verify user can be found by login query (simulating login endpoint)
    console.log('📋 Step 4: Verifying login query compatibility...');
    const loginQueryUser = await prisma.eMSUser.findFirst({
      where: {
        email,
        isActive: true
      }
    });
    
    if (!loginQueryUser) {
      console.log('❌ User NOT found by login query (isActive check)');
      console.log('   Login endpoint will fail to find this user');
      return;
    }
    
    console.log('✅ User found by login query!');
    console.log('   Login endpoint will successfully find this user');
    console.log('');
    
    // Step 5: Check password field exists
    console.log('📋 Step 5: Verifying password field...');
    if (!user.password) {
      console.log('❌ Password field is empty or null');
      console.log('   User cannot log in without password');
      return;
    }
    
    console.log('✅ Password field exists and is set');
    console.log('   Password hash length:', user.password.length);
    console.log('');
    
    // Step 6: Verify all required fields
    console.log('📋 Step 6: Verifying all required fields...');
    const requiredFields = {
      'id': user.id,
      'email': user.email,
      'password': user.password,
      'name': user.name,
      'agencyName': user.agencyName,
      'agencyId': user.agencyId,
      'userType': user.userType,
      'isActive': user.isActive
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => value === null || value === undefined || value === '')
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields.join(', '));
      return;
    }
    
    console.log('✅ All required fields are present');
    console.log('');
    
    // Step 7: Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ VERIFICATION COMPLETE - All Checks Passed');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('✅ User account exists');
    console.log('✅ User is linked to agency');
    console.log('✅ User is active');
    console.log('✅ User can be found by login query');
    console.log('✅ Password is set');
    console.log('✅ All required fields present');
    console.log('');
    console.log('🎉 Fix verified successfully!');
    console.log('   User should be able to log in at: https://traccems.com');
    console.log('   Email: chuck@chuckambulance.com');
    console.log('   Temporary Password: Tu5KwvCP7XYQ');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('\n❌ Error during verification:');
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

verifyFix();

