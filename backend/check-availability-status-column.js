#!/usr/bin/env node
/**
 * Check if availabilityStatus column exists in local database
 * Usage: node check-availability-status-column.js
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

async function checkAvailabilityStatusColumn() {
  let prisma;
  
  try {
    console.log('🔍 Checking availabilityStatus column in local database...\n');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.log('   Please set DATABASE_URL in .env or .env.local file');
      process.exit(1);
    }
    
    console.log('📋 Database URL:', process.env.DATABASE_URL.substring(0, 50) + '...');
    
    // Create Prisma client
    prisma = new PrismaClient();
    
    // Check if column exists
    const columnCheck = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        column_default
      FROM information_schema.columns
      WHERE table_name = 'ems_agencies'
        AND column_name = 'availabilityStatus'
    `;
    
    if (columnCheck.length === 0) {
      console.log('❌ Column NOT FOUND: availabilityStatus column is missing from ems_agencies table\n');
      console.log('📝 Action Required:');
      console.log('   1. Run: npx prisma migrate deploy');
      console.log('   2. Or manually apply the migration SQL');
      console.log('   3. Migration file: prisma/migrations/20251204130000_add_ems_agency_availability_status/migration.sql\n');
      
      // Check migration status
      try {
        const migrationCheck = await prisma.$queryRaw`
          SELECT migration_name, finished_at
          FROM _prisma_migrations
          WHERE migration_name = '20251204130000_add_ems_agency_availability_status'
        `;
        
        if (migrationCheck.length === 0) {
          console.log('⚠️  Migration record not found in _prisma_migrations table');
          console.log('   This means the migration was never applied\n');
        } else {
          console.log('⚠️  Migration record exists but column is missing');
          console.log('   This means migration was marked as applied but SQL was not executed\n');
        }
      } catch (err) {
        console.log('⚠️  Could not check migration status:', err.message);
      }
      
      process.exit(1);
    } else {
      const column = columnCheck[0];
      console.log('✅ Column EXISTS: availabilityStatus');
      console.log('   Data Type:', column.data_type);
      console.log('   Default:', column.column_default);
      
      // Check a few sample agencies to verify default values
      const sampleAgencies = await prisma.eMSAgency.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          availabilityStatus: true
        }
      });
      
      console.log('\n📊 Sample agencies with availabilityStatus:');
      sampleAgencies.forEach(agency => {
        const status = agency.availabilityStatus 
          ? (typeof agency.availabilityStatus === 'string' 
              ? JSON.parse(agency.availabilityStatus) 
              : agency.availabilityStatus)
          : null;
        console.log(`   - ${agency.name}:`, status || 'NULL');
      });
      
      // Count agencies with isAvailable = true
      const availableCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM ems_agencies
        WHERE "availabilityStatus"->>'isAvailable' = 'true'
      `;
      
      console.log(`\n📈 Statistics:`);
      console.log(`   Total agencies: ${sampleAgencies.length} (showing first 5)`);
      console.log(`   Available agencies: ${availableCount[0].count}`);
      
      console.log('\n✅ Database schema is correct - column exists and has default values');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Error checking column:', error.message);
    if (error.code === 'P1001') {
      console.error('   Database connection failed - check DATABASE_URL');
    }
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

checkAvailabilityStatusColumn();
