#!/usr/bin/env node
/**
 * Create test users (Healthcare and EMS) in production database
 * Uses raw SQL to work with current production schema
 * Usage: DATABASE_URL="..." node create-prod-test-users.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');

const prisma = new PrismaClient();

// Generate a CUID-like ID
function generateId() {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(6).toString('hex');
  return `c${timestamp}${random}`;
}

async function createTestUsers() {
  try {
    console.log('🔐 Creating production test users...\n');
    
    // Healthcare User
    const healthcareEmail = 'test-healthcare@tcc.com';
    const healthcarePassword = 'testpassword123';
    const healthcareHashedPassword = await bcrypt.hash(healthcarePassword, 12);
    
    // Check if healthcare_users table exists and if user exists
    try {
      const existingHealthcare = await prisma.$queryRaw`
        SELECT id, email, name, "facilityName", "userType" 
        FROM healthcare_users 
        WHERE email = ${healthcareEmail}
        LIMIT 1
      `;
      
      if (existingHealthcare && existingHealthcare.length > 0) {
        console.log('⚠️  Healthcare user already exists. Updating password...');
        await prisma.$executeRaw`
          UPDATE healthcare_users 
          SET password = ${healthcareHashedPassword}, "isActive" = true
          WHERE email = ${healthcareEmail}
        `;
        console.log('✅ Healthcare user password updated successfully!');
      } else {
        const userId = generateId();
        await prisma.$executeRaw`
          INSERT INTO healthcare_users (id, email, password, name, "facilityName", "facilityType", "userType", "isActive", "createdAt", "updatedAt")
          VALUES (${userId}, ${healthcareEmail}, ${healthcareHashedPassword}, ${'Test Healthcare User'}, ${'Test Healthcare Facility'}, ${'HOSPITAL'}, ${'HEALTHCARE'}, true, NOW(), NOW())
        `;
        
        console.log('✅ Healthcare user created successfully!');
        console.log(`   Email: ${healthcareEmail}`);
        console.log(`   Name: Test Healthcare User`);
        console.log(`   Facility: Test Healthcare Facility`);
        console.log(`   User Type: HEALTHCARE`);
      }
    } catch (error) {
      console.error('❌ Error with healthcare user:', error.message);
      throw error;
    }
    
    // EMS User - Check if ems_users table exists first
    const emsEmail = 'test-ems@tcc.com';
    const emsPassword = 'testpassword123';
    const emsHashedPassword = await bcrypt.hash(emsPassword, 12);
    
    try {
      // Check if ems_users table exists
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'ems_users'
        )
      `;
      
      if (!tableExists || !tableExists[0]?.exists) {
        console.log('⚠️  ems_users table does not exist in production database.');
        console.log('   Skipping EMS user creation. Please run Prisma migrations first.');
      } else {
        // Table exists, proceed with user creation
        const existingEMS = await prisma.$queryRaw`
          SELECT id, email, name, "agencyName", "userType" 
          FROM ems_users 
          WHERE email = ${emsEmail}
          LIMIT 1
        `;
        
        if (existingEMS && existingEMS.length > 0) {
          console.log('⚠️  EMS user already exists. Checking agency link...');
          
          const userId = existingEMS[0].id;
          const currentAgencyId = existingEMS[0].agencyId;
          
          // Check if user has agencyId, if not, create/link agency
          if (!currentAgencyId) {
            const agencyName = existingEMS[0].agencyName || 'Test EMS Agency';
            console.log(`   User missing agencyId. Creating/linking agency: ${agencyName}`);
            
            try {
              // Check if agency exists
              const existingAgency = await prisma.$queryRaw`
                SELECT id FROM "ems_agencies" WHERE name = ${agencyName} LIMIT 1
              `;
              
              let agencyId;
              if (existingAgency && existingAgency.length > 0) {
                agencyId = existingAgency[0].id;
                console.log('   Found existing agency, linking user...');
              } else {
                // Create agency
                const newAgencyId = generateId();
                await prisma.$executeRaw`
                  INSERT INTO "ems_agencies" (
                    id, name, "contactName", phone, email, address, city, state, "zipCode", 
                    "serviceArea", capabilities, "isActive", status, "createdAt", "updatedAt"
                  )
                  VALUES (
                    ${newAgencyId}, 
                    ${agencyName}, 
                    ${existingEMS[0].name || 'Test EMS User'}, 
                    ${'555-0100'}, 
                    ${emsEmail}, 
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
                agencyId = newAgencyId;
                console.log('   Created new agency and linking user...');
              }
              
              // Update user with agencyId
              await prisma.$executeRaw`
                UPDATE ems_users 
                SET password = ${emsHashedPassword}, "isActive" = true, "agencyId" = ${agencyId}
                WHERE email = ${emsEmail}
              `;
              console.log('✅ EMS user updated with agency link!');
            } catch (linkError) {
              console.error('   Error linking agency:', linkError.message);
              // Fallback: just update password
              await prisma.$executeRaw`
                UPDATE ems_users 
                SET password = ${emsHashedPassword}, "isActive" = true
                WHERE email = ${emsEmail}
              `;
              console.log('✅ EMS user password updated (agency link failed)');
            }
          } else {
            // User already has agencyId, just update password
            try {
              await prisma.$executeRaw`
                UPDATE ems_users 
                SET password = ${emsHashedPassword}, "isActive" = true
                WHERE email = ${emsEmail}
              `;
              console.log('✅ EMS user password updated successfully!');
            } catch (updateError) {
              await prisma.$executeRaw`
                UPDATE ems_users 
                SET password = ${emsHashedPassword}
                WHERE email = ${emsEmail}
              `;
              console.log('✅ EMS user password updated successfully!');
            }
          }
        } else {
          // First, create or find the EMS agency
          const agencyName = 'Test EMS Agency';
          let agencyId;
          
          try {
            // Check if agency already exists
            const existingAgency = await prisma.$queryRaw`
              SELECT id FROM "ems_agencies" WHERE name = ${agencyName} LIMIT 1
            `;
            
            if (existingAgency && existingAgency.length > 0) {
              agencyId = existingAgency[0].id;
              console.log('✅ Found existing EMS agency:', agencyName);
            } else {
              // Create new agency
              const newAgencyId = generateId();
              await prisma.$executeRaw`
                INSERT INTO "ems_agencies" (
                  id, name, "contactName", phone, email, address, city, state, "zipCode", 
                  "serviceArea", capabilities, "isActive", status, "createdAt", "updatedAt"
                )
                VALUES (
                  ${newAgencyId}, 
                  ${agencyName}, 
                  ${'Test EMS User'}, 
                  ${'555-0100'}, 
                  ${emsEmail}, 
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
              agencyId = newAgencyId;
              console.log('✅ Created EMS agency:', agencyName);
            }
          } catch (agencyError) {
            console.error('⚠️  Error creating/finding EMS agency:', agencyError.message);
            console.log('   Continuing without agencyId - user may need manual linking');
            agencyId = null;
          }
          
          const userId = generateId();
          // Create user with agencyId if available
          try {
            if (agencyId) {
              await prisma.$executeRaw`
                INSERT INTO ems_users (id, email, password, name, "agencyName", "agencyId", "userType", "isActive", "orgAdmin", "createdAt", "updatedAt")
                VALUES (${userId}, ${emsEmail}, ${emsHashedPassword}, ${'Test EMS User'}, ${agencyName}, ${agencyId}, ${'EMS'}, true, true, NOW(), NOW())
              `;
            } else {
              await prisma.$executeRaw`
                INSERT INTO ems_users (id, email, password, name, "agencyName", "userType", "isActive", "orgAdmin", "createdAt", "updatedAt")
                VALUES (${userId}, ${emsEmail}, ${emsHashedPassword}, ${'Test EMS User'}, ${agencyName}, ${'EMS'}, true, true, NOW(), NOW())
              `;
            }
          } catch (createError) {
            // Fallback: try without orgAdmin if column doesn't exist
            if (agencyId) {
              await prisma.$executeRaw`
                INSERT INTO ems_users (id, email, password, name, "agencyName", "agencyId", "userType", "isActive", "createdAt", "updatedAt")
                VALUES (${userId}, ${emsEmail}, ${emsHashedPassword}, ${'Test EMS User'}, ${agencyName}, ${agencyId}, ${'EMS'}, true, NOW(), NOW())
              `;
            } else {
              await prisma.$executeRaw`
                INSERT INTO ems_users (id, email, password, name, "agencyName", "userType", "isActive", "createdAt", "updatedAt")
                VALUES (${userId}, ${emsEmail}, ${emsHashedPassword}, ${'Test EMS User'}, ${agencyName}, ${'EMS'}, true, NOW(), NOW())
              `;
            }
          }
          
          console.log('✅ EMS user created successfully!');
          console.log(`   Email: ${emsEmail}`);
          console.log(`   Name: Test EMS User`);
          console.log(`   Agency: ${agencyName}`);
          console.log(`   Agency ID: ${agencyId || 'Not linked (needs manual update)'}`);
          console.log(`   User Type: EMS`);
        }
      }
    } catch (error) {
      console.error('❌ Error with EMS user:', error.message);
      console.log('   This may be expected if ems_users table does not exist yet.');
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
    console.error('   Full error:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();

