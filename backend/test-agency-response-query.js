#!/usr/bin/env node
/**
 * Test agencyResponse query to see what error occurs
 * 
 * Usage:
 *   DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node test-agency-response-query.js
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

async function testQuery() {
  const agencyId = 'cmjufqp5ycb9909abee'; // Chuck's Ambulance
  
  try {
    console.log('🔍 Testing agencyResponse Query\n');
    console.log(`Agency ID: ${agencyId}\n`);
    
    // Test 1: Try using Prisma model (what the code does)
    console.log('📋 Test 1: Using Prisma model (prisma.agencyResponse)...');
    try {
      const agencyResponses = await prisma.agencyResponse.findMany({
        where: {
          agencyId: agencyId
        },
        select: {
          tripId: true
        }
      });
      console.log('✅ Prisma model query succeeded!');
      console.log(`   Found ${agencyResponses.length} response(s)`);
      console.table(agencyResponses);
    } catch (prismaError) {
      console.log('❌ Prisma model query failed:');
      console.log('   Error:', prismaError.message);
      console.log('   Code:', prismaError.code);
      if (prismaError.meta) {
        console.log('   Meta:', JSON.stringify(prismaError.meta, null, 2));
      }
      console.log('');
      
      // Test 2: Try using raw SQL instead
      console.log('📋 Test 2: Using raw SQL query...');
      try {
        const rawResponses = await prisma.$queryRaw`
          SELECT "tripId"
          FROM agency_responses
          WHERE "agencyId" = ${agencyId}
        `;
        console.log('✅ Raw SQL query succeeded!');
        console.log(`   Found ${rawResponses.length} response(s)`);
        console.table(rawResponses);
      } catch (rawError) {
        console.log('❌ Raw SQL query also failed:');
        console.log('   Error:', rawError.message);
        console.log('   Code:', rawError.code);
      }
    }
    
    console.log('');
    
    // Test 3: Check if model exists in Prisma Client
    console.log('📋 Test 3: Checking Prisma Client models...');
    const models = Object.keys(prisma).filter(key => 
      !key.startsWith('$') && 
      !key.startsWith('_') &&
      typeof prisma[key] === 'object' &&
      prisma[key] !== null &&
      typeof prisma[key].findMany === 'function'
    );
    console.log('   Available Prisma models:', models.join(', '));
    
    if (models.includes('agencyResponse')) {
      console.log('   ✅ agencyResponse model exists in Prisma Client');
    } else {
      console.log('   ❌ agencyResponse model NOT found in Prisma Client');
      console.log('   💡 Prisma Client needs to be regenerated!');
    }
    
  } catch (error) {
    console.error('\n❌ Unexpected error:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();

