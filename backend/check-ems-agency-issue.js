#!/usr/bin/env node
/**
 * Check EMS agency issue: chuck@chuckambulance.com appears in agency list but user doesn't exist
 * 
 * Usage:
 *   DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node check-ems-agency-issue.js
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

async function checkEMSAgencyIssue() {
  const email = 'chuck@chuckambulance.com';
  
  try {
    console.log(`🔍 Checking EMS agency issue for: ${email}\n`);
    
    // Check ems_agencies table structure first
    console.log('📋 Checking ems_agencies table structure:');
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'ems_agencies' 
        ORDER BY ordinal_position
      `;
      console.log('ems_agencies columns:');
      console.table(columns);
    } catch (error) {
      console.log('❌ Error checking table structure:', error.message);
    }
    
    // Check all EMS agencies
    console.log('\n📋 All EMS agencies in database:');
    try {
      const allAgencies = await prisma.$queryRaw`
        SELECT id, name, email, phone, "isActive", "addedBy", "addedAt", "createdAt"
        FROM ems_agencies
        ORDER BY "createdAt" DESC
      `;
      
      if (allAgencies.length > 0) {
        console.log(`Found ${allAgencies.length} EMS agency/agencies:`);
        console.table(allAgencies);
        
        // Check if email matches any agency
        const matchingAgency = allAgencies.find(a => a.email === email || a.addedBy === email);
        if (matchingAgency) {
          console.log(`\n✅ Found agency with matching email:`);
          console.table([matchingAgency]);
        } else {
          console.log(`\n❌ No agency found with email: ${email}`);
        }
      } else {
        console.log('No EMS agencies found');
      }
    } catch (error) {
      console.log('❌ Error checking agencies:', error.message);
    }
    
    // Check if there's an agency with "chuckambulance" in the name
    console.log('\n📋 Checking for agencies with "chuck" or "ambulance" in name:');
    try {
      const matchingAgencies = await prisma.$queryRaw`
        SELECT id, name, email, phone, "isActive", "addedBy", "addedAt"
        FROM ems_agencies
        WHERE LOWER(name) LIKE ${'%chuck%'}
           OR LOWER(name) LIKE ${'%ambulance%'}
           OR LOWER(email) LIKE ${'%chuck%'}
        ORDER BY name
      `;
      
      if (matchingAgencies.length > 0) {
        console.log(`Found ${matchingAgencies.length} matching agency/agencies:`);
        console.table(matchingAgencies);
      } else {
        console.log('No matching agencies found');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    // Check relationship between agencies and users
    console.log('\n📋 Checking EMS users and their agencies:');
    try {
      const usersWithAgencies = await prisma.$queryRaw`
        SELECT 
          u.id as user_id,
          u.email as user_email,
          u.name as user_name,
          u."agencyName" as user_agency_name,
          u."agencyId" as user_agency_id,
          a.id as agency_id,
          a.name as agency_name,
          a.email as agency_email
        FROM ems_users u
        LEFT JOIN ems_agencies a ON u."agencyId" = a.id
        ORDER BY u."createdAt" DESC
      `;
      
      if (usersWithAgencies.length > 0) {
        console.log(`Found ${usersWithAgencies.length} EMS user(s) with agency relationships:`);
        console.table(usersWithAgencies);
      } else {
        console.log('No EMS users found');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEMSAgencyIssue();

