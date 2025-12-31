#!/usr/bin/env node
/**
 * Verify and fix test-ems@tcc.com user in production
 * Usage: DATABASE_URL="..." node verify-test-ems-user.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function verifyTestEMSUser() {
  try {
    console.log('🔍 Verifying test-ems@tcc.com user...\n');
    
    const email = 'test-ems@tcc.com';
    const password = 'testpassword123';
    
    // Check if user exists
    const user = await prisma.$queryRaw`
      SELECT id, email, name, "agencyName", "agencyId", "userType", "isActive"
      FROM ems_users
      WHERE email = ${email}
      LIMIT 1
    `;
    
    if (!user || user.length === 0) {
      console.log('❌ User does not exist!');
      console.log('   Run: node create-prod-test-users.js to create the user');
      return;
    }
    
    const userData = user[0];
    console.log('✅ User exists:');
    console.log('   ID:', userData.id);
    console.log('   Email:', userData.email);
    console.log('   Name:', userData.name);
    console.log('   Agency Name:', userData.agencyName || 'None');
    console.log('   Agency ID:', userData.agencyId || 'None');
    console.log('   User Type:', userData.userType);
    console.log('   Is Active:', userData.isActive);
    
    // Check if agency exists
    if (userData.agencyId) {
      const agency = await prisma.$queryRaw`
        SELECT id, name, "isActive", status
        FROM ems_agencies
        WHERE id = ${userData.agencyId}
        LIMIT 1
      `;
      
      if (agency && agency.length > 0) {
        console.log('\n✅ Agency linked:');
        console.log('   Agency ID:', agency[0].id);
        console.log('   Agency Name:', agency[0].name);
        console.log('   Is Active:', agency[0].isActive);
        console.log('   Status:', agency[0].status);
      } else {
        console.log('\n⚠️  Agency ID exists but agency not found in database!');
      }
    } else {
      console.log('\n⚠️  User has no agencyId - user may not be fully functional');
    }
    
    // Test password hash
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('\n📋 Credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Hashed:', hashedPassword.substring(0, 20) + '...');
    
    // Verify password works
    const dbPassword = await prisma.$queryRaw`
      SELECT password FROM ems_users WHERE email = ${email} LIMIT 1
    `;
    
    if (dbPassword && dbPassword.length > 0) {
      const passwordMatch = await bcrypt.compare(password, dbPassword[0].password);
      console.log('   Password Match:', passwordMatch ? '✅ YES' : '❌ NO');
      
      if (!passwordMatch) {
        console.log('\n⚠️  Password mismatch! Updating password...');
        await prisma.$executeRaw`
          UPDATE ems_users
          SET password = ${hashedPassword}, "isActive" = true
          WHERE email = ${email}
        `;
        console.log('✅ Password updated!');
      }
    }
    
    console.log('\n✅ Verification complete!');
    console.log('═══════════════════════════════════════════════');
    console.log('📋 Login Credentials:');
    console.log('   Email: test-ems@tcc.com');
    console.log('   Password: testpassword123');
    console.log('═══════════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTestEMSUser();

