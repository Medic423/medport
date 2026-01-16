#!/usr/bin/env node
/**
 * Check if missing tables actually exist in production
 */

const { PrismaClient } = require('@prisma/client');

const DATABASE_URL_PROD = process.env.DATABASE_URL_PROD || 
  'postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: { url: DATABASE_URL_PROD }
  }
});

const missingTables = [
  'backhaul_opportunities',
  'notification_logs',
  'notification_preferences',
  'pricing_models',
  'unit_analytics',
  'units'
];

async function checkTables() {
  console.log('🔍 Checking if Missing Tables Exist in Production...\n');
  console.log('='.repeat(80));
  
  try {
    for (const tableName of missingTables) {
      try {
        const result = await prisma.$queryRawUnsafe(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          ) as exists`,
          tableName
        );
        
        const exists = result[0]?.exists || false;
        const status = exists ? '✅ EXISTS' : '❌ MISSING';
        console.log(`  ${status} - ${tableName}`);
        
        if (exists) {
          // Get row count
          const countResult = await prisma.$queryRawUnsafe(
            `SELECT COUNT(*) as count FROM "${tableName}"`
          );
          const count = parseInt(countResult[0]?.count || '0');
          console.log(`      Rows: ${count}`);
        }
      } catch (error) {
        console.log(`  ❌ ERROR checking ${tableName}: ${error.message}`);
      }
    }
    
    // Also check migration history for these tables
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 Checking Migration History:\n');
    
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at
      FROM _prisma_migrations
      WHERE migration_name LIKE '%analytics%' 
         OR migration_name LIKE '%pricing%'
         OR migration_name LIKE '%backhaul%'
         OR migration_name LIKE '%unit%'
         OR migration_name LIKE '%notification%'
      ORDER BY finished_at DESC
    `;
    
    migrations.forEach(m => {
      const date = m.finished_at ? new Date(m.finished_at).toLocaleString() : 'Pending';
      const status = m.finished_at ? '✅' : '⏳';
      console.log(`  ${status} ${m.migration_name.padEnd(50)} ${date}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables()
  .then(() => {
    console.log('\n✅ Check complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
