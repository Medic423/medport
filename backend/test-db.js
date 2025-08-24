const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database contents...\n');

    // Check transport requests
    const transportRequests = await prisma.transportRequest.findMany({
      include: {
        originFacility: true,
        destinationFacility: true
      }
    });
    
    console.log(`📋 Transport Requests (${transportRequests.length}):`);
    transportRequests.forEach(req => {
      console.log(`  - ${req.id}: ${req.transportLevel} (${req.status}) from ${req.originFacility?.name} to ${req.destinationFacility?.name}`);
      console.log(`    assignedUnitId: ${req.assignedUnitId || 'null'}`);
    });

    console.log('\n🚑 Units:');
    const units = await prisma.unit.findMany({
      include: {
        agency: true
      }
    });
    
    console.log(`  - Found ${units.length} units:`);
    units.forEach(unit => {
      console.log(`    - ${unit.unitNumber}: ${unit.type} (${unit.currentStatus}) - Agency: ${unit.agency?.name || 'None'}`);
    });

    console.log('\n🏢 Agencies:');
    const agencies = await prisma.transportAgency.findMany();
    console.log(`  - Found ${agencies.length} agencies:`);
    agencies.forEach(agency => {
      console.log(`    - ${agency.name}: ${agency.capabilities?.join(', ') || 'No capabilities'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();


