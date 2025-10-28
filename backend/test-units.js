const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkUnitB201() {
  try {
    console.log('Checking unit B-201...');
    
    // Find unit by unit number - simplified query
    const unit = await prisma.unit.findFirst({
      where: { 
        unitNumber: 'B-201'
      }
    });
    
    if (!unit) {
      console.log('❌ Unit B-201 not found');
      return;
    }
    
    console.log('✅ Unit found:', {
      id: unit.id,
      unitNumber: unit.unitNumber,
      status: unit.status,
      currentStatus: unit.currentStatus,
      isActive: unit.isActive,
      agencyId: unit.agencyId,
      capabilities: unit.capabilities
    });
    
    // Check if there are any trips assigned to this unit
    const assignedTrips = await prisma.transportRequest.findMany({
      where: {
        assignedUnitId: unit.id,
        status: {
          in: ['ACCEPTED', 'IN_PROGRESS']
        }
      }
    });
    
    console.log('Assigned trips:', assignedTrips.length);
    if (assignedTrips.length > 0) {
      console.log('Trip details:', assignedTrips.map(t => ({
        id: t.id,
        patientId: t.patientId,
        status: t.status,
        assignedUnitId: t.assignedUnitId
      })));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUnitB201();
