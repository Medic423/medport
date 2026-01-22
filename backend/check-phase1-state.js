#!/usr/bin/env node
/**
 * Check Phase 1 migration state in production database
 * Phase 1: Foundation Tables (center_users, user deletion fields)
 * 
 * Usage:
 *   DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node check-phase1-state.js
 * 
 * Or set DATABASE_URL in environment and run:
 *   node check-phase1-state.js
 */

const { PrismaClient } = require('@prisma/client');

// Use production DATABASE_URL if not set
const databaseUrl = process.env.DATABASE_URL || 'postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function checkPhase1State() {
  try {
    console.log('🔍 Checking Phase 1 Migration State...\n');
    
    // Check migration history
    console.log('📋 Checking migration history:');
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at, started_at
      FROM "_prisma_migrations"
      WHERE migration_name IN (
        '20250917170653_add_center_tables',
        '20251204101500_add_user_deletion_fields'
      )
      ORDER BY migration_name
    `;
    
    if (migrations.length === 0) {
      console.log('❌ Neither Phase 1 migration has been applied\n');
    } else {
      console.table(migrations);
    }
    
    // Check if center_users table exists
    console.log('\n📋 Checking center_users table:');
    const centerUsersExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'center_users'
      ) as exists
    `;
    
    const exists = centerUsersExists[0]?.exists;
    console.log(`center_users table exists: ${exists ? '✅' : '❌'}`);
    
    if (exists) {
      // Check center_users columns
      console.log('\n📋 center_users table columns:');
      const centerUsersColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'center_users' 
        ORDER BY ordinal_position
      `;
      console.table(centerUsersColumns);
      
      // Check for deletion fields specifically
      const deletionFields = await prisma.$queryRaw`
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = 'center_users' 
        AND column_name IN ('deletedAt', 'isDeleted')
        ORDER BY column_name
      `;
      
      console.log('\n📋 Deletion fields in center_users:');
      if (deletionFields.length === 2) {
        console.log('✅ Both deletedAt and isDeleted exist');
      } else {
        console.log(`⚠️  Found ${deletionFields.length} deletion field(s):`, deletionFields.map(f => f.column_name));
      }
    }
    
    // Check deletion fields in other user tables
    console.log('\n📋 Checking deletion fields in user tables:');
    const userTables = ['center_users', 'healthcare_users', 'ems_users'];
    
    for (const table of userTables) {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        ) as exists
      `;
      
      if (tableExists[0]?.exists) {
        const deletionFields = await prisma.$queryRaw`
          SELECT column_name
          FROM information_schema.columns 
          WHERE table_name = ${table}
          AND column_name IN ('deletedAt', 'isDeleted')
          ORDER BY column_name
        `;
        
        const hasBoth = deletionFields.length === 2;
        console.log(`${table}: ${hasBoth ? '✅' : '❌'} ${deletionFields.length}/2 deletion fields`);
        if (!hasBoth) {
          console.log(`   Missing: ${['deletedAt', 'isDeleted'].filter(f => !deletionFields.some(df => df.column_name === f)).join(', ')}`);
        }
      } else {
        console.log(`${table}: ⚠️  Table does not exist`);
      }
    }
    
    // Summary
    console.log('\n📊 Phase 1 Status Summary:');
    const centerTablesApplied = migrations.some(m => m.migration_name === '20250917170653_add_center_tables');
    const deletionFieldsApplied = migrations.some(m => m.migration_name === '20251204101500_add_user_deletion_fields');
    
    console.log(`center_tables migration: ${centerTablesApplied ? '✅ Applied' : '❌ Not Applied'}`);
    console.log(`user_deletion_fields migration: ${deletionFieldsApplied ? '✅ Applied' : '❌ Not Applied'}`);
    
    if (!centerTablesApplied || !deletionFieldsApplied) {
      console.log('\n⚠️  Phase 1 migrations need to be applied');
    } else {
      console.log('\n✅ Phase 1 migrations appear to be applied');
    }
    
  } catch (error) {
    console.error('❌ Error checking Phase 1 state:', error);
    if (error.message.includes('relation "_prisma_migrations" does not exist')) {
      console.log('\n⚠️  Migration history table does not exist. Database may need baselining.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkPhase1State();

