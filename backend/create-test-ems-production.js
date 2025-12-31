#!/usr/bin/env node
/**
 * Create or verify test-ems@tcc.com user in production database
 * Usage: DATABASE_URL="production_connection_string" node create-test-ems-production.js
 * 
 * This script will:
 * 1. Check if test-ems@tcc.com exists
 * 2. Create the user if it doesn't exist
 * 3. Create/link an agency if needed
 * 4. Set password to: testpassword123
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');

const prisma = new PrismaClient();

// Generate a CUID-like ID
function generateId() {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(6).toString('hex').substring(0, 10);
  return `c${timestamp}${random}`;
}

async function createTestEMSUser() {
  try {
    console.log('🔐 Creating/Verifying test-ems@tcc.com user in production...\n');
    
    const email = 'test-ems@tcc.com';
    const password = 'testpassword123';
    const hashedPassword = await bcrypt.hash(password, 12);
    const agencyName = 'Test EMS Agency';
    
    // Check if user exists
    const existingUser = await prisma.$queryRaw`
      SELECT id, email, name, "agencyName", "agencyId", "isActive"
      FROM ems_users
      WHERE email = ${email}
      LIMIT 1
    `;
    
    if (existingUser && existingUser.length > 0) {
      console.log('✅ User already exists. Updating password and ensuring active...');
      const userId = existingUser[0].id;
      const currentAgencyId = existingUser[0].agencyId;
      
      // Update password and ensure active
      await prisma.$executeRaw`
        UPDATE ems_users
        SET password = ${hashedPassword}, "isActive" = true
        WHERE email = ${email}
      `;
      
      console.log('✅ Password updated and user activated!');
      console.log(`   User ID: ${userId}`);
      console.log(`   Agency ID: ${currentAgencyId || 'None (will create/link)'}`);
      
      // If no agencyId, create/link agency
      if (!currentAgencyId) {
        console.log('\n🔗 Creating/linking agency...');
        let agencyId;
        
        // Check if agency exists
        const existingAgency = await prisma.$queryRaw`
          SELECT id FROM ems_agencies WHERE name = ${agencyName} LIMIT 1
        `;
        
        if (existingAgency && existingAgency.length > 0) {
          agencyId = existingAgency[0].id;
          console.log('   Found existing agency, linking...');
        } else {
          // Create new agency
          agencyId = generateId();
          await prisma.$executeRaw`
            INSERT INTO ems_agencies (
              id, name, "contactName", phone, email, address, city, state, "zipCode", 
              "serviceArea", capabilities, "isActive", status, "createdAt", "updatedAt"
            )
            VALUES (
              ${agencyId}, 
              ${agencyName}, 
              ${'Test EMS User'}, 
              ${'555-0100'}, 
              ${email}, 
              ${'123 Test St'}, 
              ${'Test City'}, 
              ${'PA'}, 
              ${'12345'}, 
              ARRAY[]::text[], 
              ARRAY[]::text[], 
              true, 
              ${'ACTIVE'}, 
              NOW(), 
              NOW()
            )
          `;
          console.log('   Created new agency');
        }
        
        // Link user to agency
        await prisma.$executeRaw`
          UPDATE ems_users
          SET "agencyId" = ${agencyId}
          WHERE email = ${email}
        `;
        console.log('✅ User linked to agency!');
      }
    } else {
      console.log('📝 Creating new user...');
      
      // Create or find agency first
      let agencyId;
      const existingAgency = await prisma.$queryRaw`
        SELECT id FROM ems_agencies WHERE name = ${agencyName} LIMIT 1
      `;
      
      if (existingAgency && existingAgency.length > 0) {
        agencyId = existingAgency[0].id;
        console.log('   Found existing agency');
      } else {
        agencyId = generateId();
        await prisma.$executeRaw`
          INSERT INTO ems_agencies (
            id, name, "contactName", phone, email, address, city, state, "zipCode", 
            "serviceArea", capabilities, "isActive", status, "createdAt", "updatedAt"
          )
          VALUES (
            ${agencyId}, 
            ${agencyName}, 
            ${'Test EMS User'}, 
            ${'555-0100'}, 
            ${email}, 
            ${'123 Test St'}, 
            ${'Test City'}, 
            ${'PA'}, 
            ${'12345'}, 
            ARRAY[]::text[], 
            ARRAY[]::text[], 
            true, 
            ${'ACTIVE'}, 
            NOW(), 
            NOW()
          )
        `;
        console.log('   Created new agency');
      }
      
      // Create user
      const userId = generateId();
      try {
        await prisma.$executeRaw`
          INSERT INTO ems_users (
            id, email, password, name, "agencyName", "agencyId", "userType", "isActive", "orgAdmin", "createdAt", "updatedAt"
          )
          VALUES (
            ${userId}, ${email}, ${hashedPassword}, ${'Test EMS User'}, ${agencyName}, ${agencyId}, ${'EMS'}, true, true, NOW(), NOW()
          )
        `;
      } catch (createError) {
        // Fallback: try without orgAdmin if column doesn't exist
        await prisma.$executeRaw`
          INSERT INTO ems_users (
            id, email, password, name, "agencyName", "agencyId", "userType", "isActive", "createdAt", "updatedAt"
          )
          VALUES (
            ${userId}, ${email}, ${hashedPassword}, ${'Test EMS User'}, ${agencyName}, ${agencyId}, ${'EMS'}, true, NOW(), NOW()
          )
        `;
      }
      
      console.log('✅ User created successfully!');
    }
    
    console.log('\n═══════════════════════════════════════════════');
    console.log('📋 Login Credentials:');
    console.log('   Email: test-ems@tcc.com');
    console.log('   Password: testpassword123');
    console.log('═══════════════════════════════════════════════');
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestEMSUser();

