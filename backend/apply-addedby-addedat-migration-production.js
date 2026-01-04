#!/usr/bin/env node
/**
 * Apply migration to add addedBy and addedAt columns to ems_agencies table in production
 * 
 * Usage:
 *   DATABASE_URL="production_connection_string" node apply-addedby-addedat-migration-production.js
 * 
 * Or set DATABASE_URL in environment and run:
 *   node apply-addedby-addedat-migration-production.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  console.log('🔄 Applying migration: Add addedBy and addedAt columns to ems_agencies\n');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'add-addedby-addedat-columns-production.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Migration SQL:');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    console.log('');
    
    // Check current schema
    console.log('🔍 Checking current schema...');
    const currentColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'ems_agencies' 
        AND column_name IN ('addedBy', 'addedAt')
      ORDER BY column_name
    `;
    
    console.log('Current columns:', currentColumns);
    console.log('');
    
    if (currentColumns.length === 2) {
      console.log('✅ Columns already exist! Migration not needed.');
      return;
    }
    
    // Apply migration
    console.log('🚀 Applying migration...');
    
    // Add addedBy column
    console.log('  → Adding addedBy column...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ems_agencies" 
      ADD COLUMN IF NOT EXISTS "addedBy" TEXT
    `);
    
    // Add addedAt column
    console.log('  → Adding addedAt column...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ems_agencies" 
      ADD COLUMN IF NOT EXISTS "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);
    
    // Update existing rows
    console.log('  → Updating existing rows...');
    const updateResult = await prisma.$executeRawUnsafe(`
      UPDATE "ems_agencies" 
      SET "addedAt" = "createdAt" 
      WHERE "addedAt" IS NULL
    `);
    console.log(`     Updated ${updateResult} rows`);
    
    // Verify migration
    console.log('\n✅ Verifying migration...');
    const verifyColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'ems_agencies' 
        AND column_name IN ('addedBy', 'addedAt')
      ORDER BY column_name
    `;
    
    console.table(verifyColumns);
    
    if (verifyColumns.length === 2) {
      console.log('\n✅ Migration completed successfully!');
      console.log('   Columns added:');
      console.log('   - addedBy (TEXT, nullable)');
      console.log('   - addedAt (TIMESTAMP(3), NOT NULL, default CURRENT_TIMESTAMP)');
    } else {
      console.error('\n❌ Migration verification failed!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
applyMigration();

