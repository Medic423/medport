#!/usr/bin/env node
/**
 * Test if assignedUnit relation is causing the error
 * 
 * Usage:
 *   DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node test-assignedunit-relation.js
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

async function testRelation() {
  try {
    console.log('🔍 Testing assignedUnit Relation\n');
    
    // Check if units table exists
    const unitsExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'units'
      ) as exists
    `;
    
    console.log(`units table exists: ${unitsExists[0]?.exists}`);
    console.log('');
    
    // Try query with assignedUnit include
    console.log('📋 Testing query WITH assignedUnit include...');
    try {
      const tripsWithUnit = await prisma.transportRequest.findMany({
        where: { status: 'PENDING' },
        include: {
          assignedUnit: {
            select: {
              id: true,
              unitNumber: true,
              type: true,
              agency: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        take: 1
      });
      console.log('✅ Query with assignedUnit succeeded');
      console.log(`   Found ${tripsWithUnit.length} trip(s)`);
    } catch (error) {
      console.log('❌ Query with assignedUnit FAILED:');
      console.log('   Error:', error.message);
      console.log('   Code:', error.code);
      if (error.meta) {
        console.log('   Meta:', JSON.stringify(error.meta, null, 2));
      }
      console.log('\n   💡 This is likely the issue!');
    }
    
    console.log('');
    
    // Try query WITHOUT assignedUnit include
    console.log('📋 Testing query WITHOUT assignedUnit include...');
    try {
      const tripsWithoutUnit = await prisma.transportRequest.findMany({
        where: { status: 'PENDING' },
        take: 1
      });
      console.log('✅ Query without assignedUnit succeeded');
      console.log(`   Found ${tripsWithoutUnit.length} trip(s)`);
    } catch (error) {
      console.log('❌ Query without assignedUnit also failed:');
      console.log('   Error:', error.message);
    }
    
  } catch (error) {
    console.error('\n❌ Unexpected error:');
    console.error('   Message:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testRelation();

