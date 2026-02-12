#!/usr/bin/env node
/**
 * Check which tables exist in production that would be affected by Phase 1 migration
 * 
 * Usage:
 *   DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node check-production-tables.js
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

async function checkProductionTables() {
  try {
    console.log('🔍 Checking Production Database Tables...\n');
    console.log('⚠️  CRITICAL: Checking tables that would be DROPPED by migration 20250917170653_add_center_tables\n');
    
    // Tables that will be DROPPED by the migration
    const tablesToDrop = ['ems_users', 'transport_requests', 'units', 'crew_roles'];
    
    // Tables that will be CREATED by the migration
    const tablesToCreate = ['center_users', 'hospitals', 'agencies', 'facilities', 'trips', 'system_analytics'];
    
    // Check tables that will be dropped
    console.log('📋 Tables that migration will DROP:');
    for (const table of tablesToDrop) {
      const exists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        ) as exists
      `;
      
      const tableExists = exists[0]?.exists;
      
      if (tableExists) {
        // Check row count
        const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${table}`);
        const rowCount = parseInt(count[0]?.count || '0');
        
        console.log(`  ${table}: ${rowCount > 0 ? '🔴 EXISTS WITH DATA' : '🟡 EXISTS (empty)'} (${rowCount} rows)`);
        
        if (rowCount > 0) {
          console.log(`    ⚠️  WARNING: This table has ${rowCount} row(s) and will be DROPPED!`);
        }
      } else {
        console.log(`  ${table}: ✅ Does not exist (safe to drop)`);
      }
    }
    
    // Check tables that will be created
    console.log('\n📋 Tables that migration will CREATE:');
    for (const table of tablesToCreate) {
      const exists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        ) as exists
      `;
      
      const tableExists = exists[0]?.exists;
      console.log(`  ${table}: ${tableExists ? '✅ Already exists' : '❌ Does not exist (will be created)'}`);
    }
    
    // Check ems_agencies columns (will have addedAt/addedBy dropped)
    console.log('\n📋 ems_agencies table columns (addedAt/addedBy will be DROPPED):');
    const emsAgenciesExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ems_agencies'
      ) as exists
    `;
    
    if (emsAgenciesExists[0]?.exists) {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'ems_agencies' 
        AND column_name IN ('addedAt', 'addedBy')
        ORDER BY column_name
      `;
      
      if (columns.length > 0) {
        console.log('  ⚠️  Columns that will be DROPPED:');
        columns.forEach(col => {
          console.log(`    - ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.log('  ✅ addedAt/addedBy columns do not exist (safe to drop)');
      }
    } else {
      console.log('  ⚠️  ems_agencies table does not exist');
    }
    
    // Summary
    console.log('\n📊 Summary:');
    let hasDataToLose = false;
    
    for (const table of tablesToDrop) {
      const exists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        ) as exists
      `;
      
      if (exists[0]?.exists) {
        const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${table}`);
        const rowCount = parseInt(count[0]?.count || '0');
        
        if (rowCount > 0) {
          hasDataToLose = true;
          console.log(`  🔴 ${table}: HAS ${rowCount} ROW(S) - DATA WILL BE LOST IF MIGRATION RUNS!`);
        }
      }
    }
    
    if (hasDataToLose) {
      console.log('\n⚠️  CRITICAL: Migration cannot be run as-is!');
      console.log('   Tables with data will be dropped, causing data loss.');
      console.log('   Need to modify migration approach or migrate data first.');
    } else {
      console.log('\n✅ Safe to run migration - no data will be lost');
    }
    
  } catch (error) {
    console.error('❌ Error checking production tables:', error);
    if (error.message.includes('relation') || error.message.includes('does not exist')) {
      console.log('\n⚠️  Some tables may not exist yet (this is expected for a new database)');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionTables();

