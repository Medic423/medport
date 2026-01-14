#!/usr/bin/env node
/**
 * Check migration history in production database
 */

const { PrismaClient } = require('@prisma/client');

const DATABASE_URL_PROD = process.env.DATABASE_URL_PROD || 
  'postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: { url: DATABASE_URL_PROD }
  }
});

async function checkMigrations() {
  console.log('🔍 Checking Production Migration History...\n');
  console.log('='.repeat(80));
  
  try {
    // Get all migrations
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at, started_at
      FROM _prisma_migrations
      ORDER BY finished_at DESC NULLS LAST, started_at DESC
    `;
    
    console.log(`\n📋 Total Migrations in Production: ${migrations.length}\n`);
    
    // Group by status
    const completed = migrations.filter(m => m.finished_at !== null);
    const pending = migrations.filter(m => m.finished_at === null);
    
    console.log(`✅ Completed: ${completed.length}`);
    console.log(`⏳ Pending: ${pending.length}\n`);
    
    if (completed.length > 0) {
      console.log('Recent Completed Migrations:');
      console.log('-'.repeat(80));
      completed.slice(0, 10).forEach(m => {
        const date = new Date(m.finished_at).toLocaleString();
        console.log(`  ✅ ${m.migration_name.padEnd(50)} ${date}`);
      });
    }
    
    if (pending.length > 0) {
      console.log('\n⚠️  Pending Migrations:');
      console.log('-'.repeat(80));
      pending.forEach(m => {
        const date = m.started_at ? new Date(m.started_at).toLocaleString() : 'Never started';
        console.log(`  ⏳ ${m.migration_name.padEnd(50)} ${date}`);
      });
    }
    
    // Check for specific migrations that should create missing tables
    const missingTableMigrations = [
      'backhaul_opportunities',
      'notification_logs',
      'notification_preferences',
      'pricing_models',
      'unit_analytics',
      'units'
    ];
    
    console.log('\n' + '='.repeat(80));
    console.log('\n🔍 Checking for Migrations Related to Missing Tables:\n');
    
    const migrationNames = migrations.map(m => m.migration_name.toLowerCase());
    missingTableMigrations.forEach(table => {
      const relatedMigrations = migrations.filter(m => 
        m.migration_name.toLowerCase().includes(table.replace('_', '')) ||
        m.migration_name.toLowerCase().includes(table)
      );
      
      if (relatedMigrations.length > 0) {
        console.log(`  📊 ${table}:`);
        relatedMigrations.forEach(m => {
          const status = m.finished_at ? '✅ Applied' : '⏳ Pending';
          console.log(`     ${status} - ${m.migration_name}`);
        });
      } else {
        console.log(`  ⚠️  ${table}: No migration found`);
      }
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrations()
  .then(() => {
    console.log('\n✅ Check complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
