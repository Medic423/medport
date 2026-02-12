#!/usr/bin/env node
/**
 * Check production trips data and available trips endpoint
 * 
 * Usage:
 *   DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node check-production-trips.js
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

async function checkTrips() {
  try {
    console.log('🔍 Checking Production Trips Data\n');
    
    // Check if trips table exists
    console.log('📋 Step 1: Checking trips table...');
    const tripsTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'trips'
      ) as exists
    `;
    
    if (!tripsTableExists[0]?.exists) {
      console.log('❌ trips table does not exist');
      console.log('   This is likely a schema issue');
      return;
    }
    
    console.log('✅ trips table exists\n');
    
    // Check total trips count
    console.log('📋 Step 2: Checking total trips count...');
    const totalTrips = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM trips
    `;
    const count = parseInt(totalTrips[0]?.count || '0');
    console.log(`   Total trips in database: ${count}`);
    
    if (count === 0) {
      console.log('   ⚠️  No trips found - this is expected if no trips have been created');
    }
    console.log('');
    
    // Check trips by status
    console.log('📋 Step 3: Checking trips by status...');
    const tripsByStatus = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count
      FROM trips
      GROUP BY status
      ORDER BY count DESC
    `;
    
    if (tripsByStatus.length > 0) {
      console.log('   Trips by status:');
      tripsByStatus.forEach(row => {
        console.log(`     - ${row.status}: ${row.count}`);
      });
    } else {
      console.log('   No trips found');
    }
    console.log('');
    
    // Check recent trips
    console.log('📋 Step 4: Checking recent trips (last 5)...');
    const recentTrips = await prisma.$queryRaw`
      SELECT id, "tripNumber", status, "scheduledTime", "createdAt", "assignedAgencyId"
      FROM trips
      ORDER BY "createdAt" DESC
      LIMIT 5
    `;
    
    if (recentTrips.length > 0) {
      console.log('   Recent trips:');
      console.table(recentTrips);
    } else {
      console.log('   No trips found');
    }
    console.log('');
    
    // Check transport_requests table
    console.log('📋 Step 5: Checking transport_requests table...');
    const transportRequestsExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transport_requests'
      ) as exists
    `;
    
    if (transportRequestsExists[0]?.exists) {
      const transportRequestsCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM transport_requests
      `;
      const trCount = parseInt(transportRequestsCount[0]?.count || '0');
      console.log(`   transport_requests table exists: ${trCount} request(s)`);
      
      if (trCount > 0) {
        const recentRequests = await prisma.$queryRaw`
          SELECT id, status, "createdAt", "healthcareLocationId"
          FROM transport_requests
          ORDER BY "createdAt" DESC
          LIMIT 5
        `;
        console.log('   Recent transport requests:');
        console.table(recentRequests);
      }
    } else {
      console.log('   ⚠️  transport_requests table does not exist');
    }
    console.log('');
    
    // Check agency_responses table
    console.log('📋 Step 6: Checking agency_responses table...');
    const agencyResponsesExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'agency_responses'
      ) as exists
    `;
    
    if (agencyResponsesExists[0]?.exists) {
      const responsesCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM agency_responses
      `;
      const arCount = parseInt(responsesCount[0]?.count || '0');
      console.log(`   agency_responses table exists: ${arCount} response(s)`);
    } else {
      console.log('   ⚠️  agency_responses table does not exist');
    }
    console.log('');
    
    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 Summary');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total trips: ${count}`);
    console.log(`transport_requests table: ${transportRequestsExists[0]?.exists ? 'Exists' : 'Missing'}`);
    console.log(`agency_responses table: ${agencyResponsesExists[0]?.exists ? 'Exists' : 'Missing'}`);
    console.log('');
    
    if (count === 0) {
      console.log('💡 Note: No trips found in database.');
      console.log('   This is normal if no trips have been created yet.');
      console.log('   The "Failed to load trips" error may be a UI issue');
      console.log('   when handling empty results, or an API error.');
    } else {
      console.log('✅ Trips exist in database.');
      console.log('   If "Failed to load trips" error persists,');
      console.log('   check API endpoint and frontend error handling.');
    }
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error checking trips:');
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

checkTrips();

