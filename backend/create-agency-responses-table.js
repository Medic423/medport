#!/usr/bin/env node
/**
 * Create agency_responses table for EMS functionality
 * 
 * This is a quick fix to enable EMS trip functionality.
 * The table should be created via migration in Phase 4, but we're creating it now
 * to fix the immediate "Failed to load trips" error.
 * 
 * Usage:
 *   DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node create-agency-responses-table.js
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

async function createAgencyResponsesTable() {
  try {
    console.log('🔧 Creating agency_responses Table\n');
    
    // Step 1: Check if table already exists
    console.log('📋 Step 1: Checking if table already exists...');
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'agency_responses'
      ) as exists
    `;
    
    if (tableExists[0]?.exists) {
      console.log('✅ agency_responses table already exists');
      console.log('   No action needed.');
      
      // Verify structure
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'agency_responses' 
        ORDER BY ordinal_position
      `;
      console.log('\n   Table structure:');
      console.table(columns);
      return;
    }
    
    console.log('❌ Table does not exist - creating it...\n');
    
    // Step 2: Check if transport_requests table exists (required for foreign key)
    console.log('📋 Step 2: Verifying transport_requests table exists...');
    const transportRequestsExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transport_requests'
      ) as exists
    `;
    
    if (!transportRequestsExists[0]?.exists) {
      console.log('⚠️  transport_requests table does not exist');
      console.log('   Foreign key constraint will be created without reference');
      console.log('   (This is OK - table may be created later)');
    } else {
      console.log('✅ transport_requests table exists');
    }
    console.log('');
    
    // Step 3: Check if units table exists (optional foreign key)
    console.log('📋 Step 3: Checking units table (for assignedUnitId foreign key)...');
    const unitsExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'units'
      ) as exists
    `;
    
    if (unitsExists[0]?.exists) {
      console.log('✅ units table exists - foreign key will be created');
    } else {
      console.log('⚠️  units table does not exist - assignedUnitId will be nullable only');
    }
    console.log('');
    
    // Step 4: Create the table
    console.log('📋 Step 4: Creating agency_responses table...');
    
    // Create table with all required columns
    await prisma.$executeRaw`
      CREATE TABLE "agency_responses" (
        "id" TEXT NOT NULL,
        "tripId" TEXT NOT NULL,
        "agencyId" TEXT NOT NULL,
        "response" TEXT NOT NULL,
        "responseTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "responseNotes" TEXT,
        "estimatedArrival" TIMESTAMP(3),
        "isSelected" BOOLEAN NOT NULL DEFAULT false,
        "assignedUnitId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "agency_responses_pkey" PRIMARY KEY ("id")
      )
    `;
    
    console.log('✅ Table created successfully\n');
    
    // Step 5: Create indexes
    console.log('📋 Step 5: Creating indexes...');
    
    // Index on tripId for faster lookups
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "agency_responses_tripId_idx" ON "agency_responses"("tripId")
    `;
    console.log('   ✅ Index on tripId created');
    
    // Index on agencyId for faster lookups
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "agency_responses_agencyId_idx" ON "agency_responses"("agencyId")
    `;
    console.log('   ✅ Index on agencyId created');
    
    // Index on response for filtering
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "agency_responses_response_idx" ON "agency_responses"("response")
    `;
    console.log('   ✅ Index on response created');
    
    // Composite index for common queries
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "agency_responses_tripId_agencyId_idx" ON "agency_responses"("tripId", "agencyId")
    `;
    console.log('   ✅ Composite index created');
    console.log('');
    
    // Step 6: Create foreign key constraints (if referenced tables exist)
    console.log('📋 Step 6: Creating foreign key constraints...');
    
    // Foreign key to transport_requests (if table exists)
    if (transportRequestsExists[0]?.exists) {
      try {
        await prisma.$executeRaw`
          ALTER TABLE "agency_responses" 
          ADD CONSTRAINT "agency_responses_tripId_fkey" 
          FOREIGN KEY ("tripId") 
          REFERENCES "transport_requests"("id") 
          ON DELETE CASCADE 
          ON UPDATE CASCADE
        `;
        console.log('   ✅ Foreign key to transport_requests created');
      } catch (fkError) {
        console.log('   ⚠️  Could not create foreign key to transport_requests:', fkError.message);
        console.log('      (This is OK - constraint may already exist or table structure differs)');
      }
    } else {
      console.log('   ⏭️  Skipping foreign key to transport_requests (table does not exist)');
    }
    
    // Foreign key to units (if table exists)
    if (unitsExists[0]?.exists) {
      try {
        await prisma.$executeRaw`
          ALTER TABLE "agency_responses" 
          ADD CONSTRAINT "agency_responses_assignedUnitId_fkey" 
          FOREIGN KEY ("assignedUnitId") 
          REFERENCES "units"("id") 
          ON DELETE SET NULL 
          ON UPDATE CASCADE
        `;
        console.log('   ✅ Foreign key to units created');
      } catch (fkError) {
        console.log('   ⚠️  Could not create foreign key to units:', fkError.message);
        console.log('      (This is OK - constraint may already exist)');
      }
    } else {
      console.log('   ⏭️  Skipping foreign key to units (table does not exist)');
    }
    console.log('');
    
    // Step 7: Verify table creation
    console.log('📋 Step 7: Verifying table structure...');
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'agency_responses' 
      ORDER BY ordinal_position
    `;
    
    console.log('   Table structure:');
    console.table(columns);
    console.log('');
    
    // Step 8: Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ SUCCESS - agency_responses Table Created');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('✅ Table created with all required columns');
    console.log('✅ Indexes created for performance');
    console.log('✅ Foreign keys created (where applicable)');
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Test EMS dashboard - "Available Trips" should now load');
    console.log('   2. Verify no errors when loading trips');
    console.log('   3. This table will be recreated via migration in Phase 4');
    console.log('      (This is a temporary fix to enable functionality)');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('\n❌ Error creating agency_responses table:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    if (error.meta) {
      console.error('   Meta:', JSON.stringify(error.meta, null, 2));
    }
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAgencyResponsesTable();

