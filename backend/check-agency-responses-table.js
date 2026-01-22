#!/usr/bin/env node
/**
 * Check agency_responses table structure and data
 * 
 * Usage:
 *   DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node check-agency-responses-table.js
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

async function checkAgencyResponses() {
  try {
    console.log('🔍 Checking agency_responses Table\n');
    
    // Check if table exists
    console.log('📋 Step 1: Checking if agency_responses table exists...');
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'agency_responses'
      ) as exists
    `;
    
    if (!tableExists[0]?.exists) {
      console.log('❌ agency_responses table does NOT exist');
      console.log('');
      console.log('⚠️  This is likely causing the "Failed to load trips" error!');
      console.log('   The backend tries to query this table when filtering trips for EMS users.');
      console.log('   If the table doesn\'t exist, the query fails.');
      console.log('');
      console.log('💡 Solution: This table needs to be created via migration.');
      console.log('   It should be created in Phase 4 of the catch-up plan.');
      return;
    }
    
    console.log('✅ agency_responses table exists\n');
    
    // Check table structure
    console.log('📋 Step 2: Checking table structure...');
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'agency_responses' 
      ORDER BY ordinal_position
    `;
    console.log('   Columns:');
    console.table(columns);
    console.log('');
    
    // Check row count
    console.log('📋 Step 3: Checking row count...');
    const count = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM agency_responses
    `;
    const rowCount = parseInt(count[0]?.count || '0');
    console.log(`   Total responses: ${rowCount}`);
    console.log('');
    
    if (rowCount > 0) {
      // Show sample data
      console.log('📋 Step 4: Sample data (first 5 rows)...');
      const sample = await prisma.$queryRaw`
        SELECT id, "tripId", "agencyId", response, "isSelected", "createdAt"
        FROM agency_responses
        ORDER BY "createdAt" DESC
        LIMIT 5
      `;
      console.table(sample);
      console.log('');
    }
    
    // Check for responses for Chuck's Ambulance agency
    console.log('📋 Step 5: Checking responses for Chuck\'s Ambulance...');
    const agencyId = 'cmjufqp5ycb9909abee'; // Chuck's Ambulance agency ID
    const agencyResponses = await prisma.$queryRaw`
      SELECT id, "tripId", "agencyId", response, "isSelected", "createdAt"
      FROM agency_responses
      WHERE "agencyId" = ${agencyId}
      ORDER BY "createdAt" DESC
    `;
    
    if (agencyResponses.length > 0) {
      console.log(`   Found ${agencyResponses.length} response(s) for this agency:`);
      console.table(agencyResponses);
    } else {
      console.log('   No responses found for this agency (expected if no trips accepted yet)');
    }
    console.log('');
    
    console.log('✅ Table check complete');
    
  } catch (error) {
    console.error('\n❌ Error checking agency_responses:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    if (error.meta) {
      console.error('   Meta:', JSON.stringify(error.meta, null, 2));
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkAgencyResponses();

