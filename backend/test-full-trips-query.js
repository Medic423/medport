#!/usr/bin/env node
/**
 * Test the full trips query with all includes (what the backend actually does)
 * 
 * Usage:
 *   DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node test-full-trips-query.js
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

async function testFullQuery() {
  const agencyId = 'cmjufqp5ycb9909abee';
  const status = 'PENDING';
  
  try {
    console.log('🔍 Testing Full Trips Query with All Includes\n');
    
    // Build where clause exactly as backend does
    const where = {};
    where.status = status;
    
    // Get agency responses
    const agencyResponses = await prisma.agencyResponse.findMany({
      where: { agencyId },
      select: { tripId: true }
    });
    
    const acceptedTripIds = agencyResponses.map(r => r.tripId);
    const agencyFilter = [{ status: 'PENDING' }];
    if (acceptedTripIds.length > 0) {
      agencyFilter.push({ id: { in: acceptedTripIds } });
    }
    where.OR = agencyFilter;
    
    console.log('Where clause:', JSON.stringify(where, null, 2));
    console.log('');
    
    // Build include exactly as backend does
    const include = {
      originFacility: {
        select: {
          id: true,
          name: true,
          type: true
        }
      },
      destinationFacility: {
        select: {
          id: true,
          name: true,
          type: true
        }
      },
      pickupLocation: {
        select: {
          id: true,
          name: true,
          floor: true,
          room: true,
          contactPhone: true,
          contactEmail: true
        }
      },
      healthcareLocation: {
        select: {
          id: true,
          locationName: true,
          city: true,
          state: true,
          facilityType: true
        }
      }
    };
    
    // Try to add assignedUnit (this might fail)
    try {
      include.assignedUnit = {
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
      };
      console.log('✅ assignedUnit include added');
    } catch (e) {
      console.log('⚠️  Could not add assignedUnit include:', e.message);
    }
    
    console.log('\n📋 Attempting full query...');
    
    try {
      const trips = await prisma.transportRequest.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        include,
        take: 10
      });
      
      console.log('✅ Query succeeded!');
      console.log(`   Found ${trips.length} trip(s)`);
      
      if (trips.length > 0) {
        console.log('\n   Sample trip structure:');
        const sample = trips[0];
        console.log('   - id:', sample.id);
        console.log('   - status:', sample.status);
        console.log('   - has originFacility:', !!sample.originFacility);
        console.log('   - has destinationFacility:', !!sample.destinationFacility);
        console.log('   - has pickupLocation:', !!sample.pickupLocation);
        console.log('   - has healthcareLocation:', !!sample.healthcareLocation);
        console.log('   - has assignedUnit:', !!sample.assignedUnit);
      }
      
    } catch (queryError) {
      console.log('❌ Query failed!');
      console.log('   Error:', queryError.message);
      console.log('   Code:', queryError.code);
      if (queryError.meta) {
        console.log('   Meta:', JSON.stringify(queryError.meta, null, 2));
      }
      console.log('\n   Stack:', queryError.stack);
    }
    
  } catch (error) {
    console.error('\n❌ Unexpected error:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testFullQuery();

