#!/usr/bin/env node
/**
 * Check if healthcare_destinations table exists and has correct columns
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

async function checkTable() {
  let prisma;
  
  try {
    console.log('🔍 Checking healthcare_destinations table...\n');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not set');
      process.exit(1);
    }
    
    prisma = new PrismaClient();
    
    // Check if table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'healthcare_destinations'
      ) as table_exists
    `;
    
    if (!tableCheck[0].table_exists) {
      console.log('❌ Table does NOT exist: healthcare_destinations\n');
      console.log('📝 Action Required:');
      console.log('   Run migration: npx prisma migrate deploy');
      console.log('   Or manually create table using migration SQL');
      process.exit(1);
    }
    
    console.log('✅ Table EXISTS: healthcare_destinations\n');
    
    // Check columns
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'healthcare_destinations'
      ORDER BY ordinal_position
    `;
    
    console.log('📊 Columns:');
    columns.forEach((col: any) => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
    // Check specifically for healthcare_user_id
    const hasUserId = columns.some((col: any) => col.column_name === 'healthcare_user_id');
    
    if (!hasUserId) {
      console.log('\n❌ Column MISSING: healthcare_user_id');
      console.log('📝 Action Required:');
      console.log('   Apply migration: npx prisma migrate deploy');
      console.log('   Or manually add column');
      process.exit(1);
    } else {
      console.log('\n✅ Column EXISTS: healthcare_user_id');
    }
    
    // Check for other required columns
    const requiredColumns = ['id', 'name', 'type', 'address', 'city', 'state', 'zip_code'];
    const missingColumns = requiredColumns.filter(col => 
      !columns.some((c: any) => c.column_name === col)
    );
    
    if (missingColumns.length > 0) {
      console.log(`\n⚠️  Missing columns: ${missingColumns.join(', ')}`);
    } else {
      console.log('\n✅ All required columns exist');
    }
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P1001') {
      console.error('   Database connection failed');
    }
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

checkTable();
