#!/usr/bin/env node
/**
 * Check production database schema
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
  try {
    console.log('Checking production database schema...\n');
    
    // Check healthcare_users columns
    console.log('📋 healthcare_users table columns:');
    const healthcareColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'healthcare_users' 
      ORDER BY ordinal_position
    `;
    console.table(healthcareColumns);
    
    // Check if ems_users table exists
    console.log('\n🚑 Checking ems_users table:');
    const emsTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ems_users'
      ) as exists
    `;
    console.log('ems_users table exists:', emsTableExists[0]?.exists);
    
    if (emsTableExists[0]?.exists) {
      console.log('\n📋 ems_users table columns:');
      const emsColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'ems_users' 
        ORDER BY ordinal_position
      `;
      console.table(emsColumns);
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();

