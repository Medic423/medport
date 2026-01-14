#!/usr/bin/env node
/**
 * Check if production database has any data that needs to be preserved
 * This helps decide between migration vs full database copy approach
 */

const { PrismaClient } = require('@prisma/client');

const DATABASE_URL_PROD = process.env.DATABASE_URL_PROD || 
  'postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: { url: DATABASE_URL_PROD }
  }
});

async function checkProductionData() {
  console.log('🔍 Checking Production Database for Existing Data...\n');
  console.log('='.repeat(80));
  
  try {
    // Get all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name != '_prisma_migrations'
      ORDER BY table_name
    `;
    
    const tableNames = tables.map(t => t.table_name);
    console.log(`📊 Found ${tableNames.length} tables in production\n`);
    
    let totalRows = 0;
    let tablesWithData = [];
    let tablesEmpty = [];
    
    for (const tableName of tableNames) {
      try {
        const result = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM "${tableName}"`
        );
        const count = parseInt(result[0]?.count || '0');
        totalRows += count;
        
        if (count > 0) {
          tablesWithData.push({ table: tableName, count });
          console.log(`  🔴 ${tableName.padEnd(40)} ${count.toString().padStart(6)} rows`);
        } else {
          tablesEmpty.push(tableName);
        }
      } catch (error) {
        console.log(`  ⚠️  ${tableName.padEnd(40)} Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 SUMMARY:\n');
    console.log(`Total Tables: ${tableNames.length}`);
    console.log(`Tables with Data: ${tablesWithData.length}`);
    console.log(`Tables Empty: ${tablesEmpty.length}`);
    console.log(`Total Rows: ${totalRows.toLocaleString()}`);
    
    if (tablesWithData.length > 0) {
      console.log('\n⚠️  TABLES WITH DATA (MUST PRESERVE):');
      console.log('-'.repeat(80));
      tablesWithData.forEach(({ table, count }) => {
        console.log(`  ${table.padEnd(40)} ${count.toLocaleString().padStart(10)} rows`);
      });
      
      console.log('\n🔴 RECOMMENDATION: USE MIGRATIONS');
      console.log('   Reason: Production has data that must be preserved');
      console.log('   Migrations will:');
      console.log('     ✅ Add missing tables/columns');
      console.log('     ✅ Preserve existing data');
      console.log('     ✅ Maintain migration history');
      console.log('     ✅ Allow rollback if needed');
      console.log('\n   ⚠️  DO NOT copy entire database - would overwrite production data!');
    } else {
      console.log('\n✅ PRODUCTION DATABASE IS EMPTY');
      console.log('\n💡 RECOMMENDATION: Either approach works');
      console.log('   Option 1: Use Migrations (Recommended)');
      console.log('     ✅ Follows proper workflow');
      console.log('     ✅ Maintains migration history');
      console.log('     ✅ Production workflow already uses this');
      console.log('\n   Option 2: Copy Database Schema (Faster but riskier)');
      console.log('     ⚠️  Would need to manually sync migration history');
      console.log('     ⚠️  Could cause issues with Prisma tracking');
      console.log('     ⚠️  No audit trail');
    }
    
    // Check migration history
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 MIGRATION HISTORY:\n');
    try {
      const migrations = await prisma.$queryRaw`
        SELECT migration_name, finished_at
        FROM _prisma_migrations
        ORDER BY finished_at DESC
        LIMIT 10
      `;
      
      if (migrations.length > 0) {
        console.log('Recent Migrations:');
        migrations.forEach(m => {
          const date = m.finished_at ? new Date(m.finished_at).toLocaleString() : 'Pending';
          console.log(`  ${m.migration_name.padEnd(50)} ${date}`);
        });
      } else {
        console.log('  ⚠️  No migrations found in _prisma_migrations table');
      }
    } catch (error) {
      console.log(`  ⚠️  Could not check migration history: ${error.message}`);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('relation') || error.message.includes('does not exist')) {
      console.log('\n💡 Database might be empty or not initialized');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionData()
  .then(() => {
    console.log('\n✅ Check complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
