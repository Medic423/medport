#!/usr/bin/env node
/**
 * Check EMS user issue: chuck@chuckambulance.com appears in list but login fails
 * 
 * Usage:
 *   DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node check-ems-user-issue.js
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

async function checkEMSUserIssue() {
  const email = 'chuck@chuckambulance.com';
  
  try {
    console.log(`🔍 Checking EMS user issue for: ${email}\n`);
    
    // Check if user exists in ems_users table
    console.log('📋 Checking ems_users table:');
    try {
      const emsUsers = await prisma.$queryRaw`
        SELECT id, email, name, "agencyId", "isActive", "createdAt"
        FROM ems_users
        WHERE email = ${email}
      `;
      
      if (emsUsers.length > 0) {
        console.log('✅ User found in ems_users table:');
        console.table(emsUsers);
      } else {
        console.log('❌ User NOT found in ems_users table');
      }
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('⚠️  ems_users table does not exist');
      } else {
        console.log('❌ Error checking ems_users:', error.message);
      }
    }
    
    // Check if user exists in center_users table
    console.log('\n📋 Checking center_users table:');
    try {
      const centerUsers = await prisma.$queryRaw`
        SELECT id, email, name, "userType", "isActive", "createdAt"
        FROM center_users
        WHERE email = ${email}
      `;
      
      if (centerUsers.length > 0) {
        console.log('✅ User found in center_users table:');
        console.table(centerUsers);
      } else {
        console.log('❌ User NOT found in center_users table');
      }
    } catch (error) {
      console.log('❌ Error checking center_users:', error.message);
    }
    
    // Check if user exists in healthcare_users table
    console.log('\n📋 Checking healthcare_users table:');
    try {
      const healthcareUsers = await prisma.$queryRaw`
        SELECT id, email, name, "userType", "isActive", "createdAt"
        FROM healthcare_users
        WHERE email = ${email}
      `;
      
      if (healthcareUsers.length > 0) {
        console.log('✅ User found in healthcare_users table:');
        console.table(healthcareUsers);
      } else {
        console.log('❌ User NOT found in healthcare_users table');
      }
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('⚠️  healthcare_users table does not exist');
      } else {
        console.log('❌ Error checking healthcare_users:', error.message);
      }
    }
    
    // Check EMS agencies table for this email
    console.log('\n📋 Checking ems_agencies table:');
    try {
      const agencies = await prisma.$queryRaw`
        SELECT id, name, "contactInfo", "addedBy", "addedAt"
        FROM ems_agencies
        WHERE "contactInfo"::text LIKE ${'%' + email + '%'}
           OR "addedBy" = ${email}
      `;
      
      if (agencies.length > 0) {
        console.log('✅ Found in ems_agencies table:');
        console.table(agencies);
      } else {
        console.log('❌ Not found in ems_agencies table');
      }
    } catch (error) {
      console.log('❌ Error checking ems_agencies:', error.message);
    }
    
    // Check all EMS users
    console.log('\n📋 All EMS users in database:');
    try {
      const allEMSUsers = await prisma.$queryRaw`
        SELECT id, email, name, "agencyId", "isActive", "createdAt"
        FROM ems_users
        ORDER BY "createdAt" DESC
      `;
      
      if (allEMSUsers.length > 0) {
        console.log(`Found ${allEMSUsers.length} EMS user(s):`);
        console.table(allEMSUsers);
      } else {
        console.log('No EMS users found');
      }
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('⚠️  ems_users table does not exist');
      } else {
        console.log('❌ Error:', error.message);
      }
    }
    
    // Check what tables exist that might contain user data
    console.log('\n📋 Checking user-related tables:');
    const userTables = ['ems_users', 'center_users', 'healthcare_users'];
    
    for (const table of userTables) {
      try {
        const exists = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          ) as exists
        `;
        
        if (exists[0]?.exists) {
          const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`  ${table}: ✅ Exists (${count[0]?.count} rows)`);
        } else {
          console.log(`  ${table}: ❌ Does not exist`);
        }
      } catch (error) {
        console.log(`  ${table}: ❌ Error checking - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEMSUserIssue();

