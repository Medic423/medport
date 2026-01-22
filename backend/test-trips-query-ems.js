#!/usr/bin/env node
/**
 * Test the exact trips query that EMS users make
 * Simulates what happens in tripService.getTrips() for EMS users
 * 
 * Usage:
 *   DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node test-trips-query-ems.js
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

async function testEMSTripsQuery() {
  const agencyId = 'cmjufqp5ycb9909abee'; // Chuck's Ambulance
  const status = 'PENDING'; // What the frontend requests
  
  try {
    console.log('🔍 Testing EMS Trips Query (Simulating Backend Logic)\n');
    console.log(`Agency ID: ${agencyId}`);
    console.log(`Status Filter: ${status}\n`);
    
    // Step 1: Build where clause (simulating tripService.getTrips logic)
    console.log('📋 Step 1: Building where clause...');
    const where = {};
    
    // Set status filter (from query params)
    if (status) {
      where.status = status;
    }
    console.log('   Initial where clause:', JSON.stringify(where, null, 2));
    
    // Step 2: Get agency responses (simulating agency filter logic)
    console.log('\n📋 Step 2: Getting agency responses...');
    const agencyResponses = await prisma.agencyResponse.findMany({
      where: {
        agencyId: agencyId
      },
      select: {
        tripId: true
      }
    });
    
    const acceptedTripIds = agencyResponses.map(r => r.tripId);
    console.log(`   Found ${acceptedTripIds.length} trip(s) accepted by agency`);
    
    // Step 3: Build agency filter (THIS IS WHERE THE PROBLEM IS)
    console.log('\n📋 Step 3: Building agency filter...');
    const agencyFilter = [{ status: 'PENDING' }];
    if (acceptedTripIds.length > 0) {
      agencyFilter.push({ id: { in: acceptedTripIds } });
    }
    console.log('   Agency filter:', JSON.stringify(agencyFilter, null, 2));
    
    // Step 4: Apply agency filter (THIS CREATES THE CONFLICT)
    console.log('\n📋 Step 4: Applying agency filter to where clause...');
    console.log('   ⚠️  PROBLEM: where.status is already set to "PENDING"');
    console.log('   ⚠️  PROBLEM: agencyFilter also includes { status: "PENDING" }');
    console.log('   ⚠️  This creates a conflict!');
    
    // This is what the code does - it sets where.OR
    where.OR = agencyFilter;
    // But where.status is still set!
    
    console.log('\n   Final where clause:', JSON.stringify(where, null, 2));
    console.log('   ⚠️  This where clause has BOTH where.status AND where.OR with status');
    console.log('   ⚠️  Prisma may reject this or it may cause unexpected behavior\n');
    
    // Step 5: Try the query
    console.log('📋 Step 5: Attempting query with conflicted where clause...');
    try {
      const trips = await prisma.transportRequest.findMany({
        where,
        take: 5 // Limit to 5 for testing
      });
      console.log('   ✅ Query succeeded!');
      console.log(`   Found ${trips.length} trip(s)`);
    } catch (queryError) {
      console.log('   ❌ Query failed!');
      console.log('   Error:', queryError.message);
      console.log('   Code:', queryError.code);
      if (queryError.meta) {
        console.log('   Meta:', JSON.stringify(queryError.meta, null, 2));
      }
      console.log('\n   💡 This is likely the error causing the 400 Bad Request!');
    }
    
    // Step 6: Try with corrected where clause
    console.log('\n📋 Step 6: Testing with corrected where clause...');
    const correctedWhere = {};
    
    // Remove status from top level, put it in OR
    correctedWhere.OR = agencyFilter;
    
    console.log('   Corrected where clause:', JSON.stringify(correctedWhere, null, 2));
    
    try {
      const tripsCorrected = await prisma.transportRequest.findMany({
        where: correctedWhere,
        take: 5
      });
      console.log('   ✅ Corrected query succeeded!');
      console.log(`   Found ${tripsCorrected.length} trip(s)`);
      console.log('\n   💡 Solution: Remove where.status when building where.OR');
    } catch (correctedError) {
      console.log('   ❌ Corrected query also failed:');
      console.log('   Error:', correctedError.message);
    }
    
  } catch (error) {
    console.error('\n❌ Unexpected error:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testEMSTripsQuery();

