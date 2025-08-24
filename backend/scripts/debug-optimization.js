const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Checking database state for optimization debugging...\n');
    
    // Check transport requests
    const requests = await prisma.transportRequest.findMany({
      where: { status: 'PENDING' },
      select: { id: true, status: true, assignedUnitId: true, transportLevel: true }
    });
    console.log('📋 Transport Requests (PENDING):', requests.length);
    console.log('Sample requests:', requests.slice(0, 3));
    
    // Check units
    const units = await prisma.unit.findMany({
      where: { currentStatus: 'AVAILABLE' },
      select: { id: true, currentStatus: true, type: true, unitNumber: true }
    });
    console.log('\n🚑 Available Units:', units.length);
    console.log('Sample units:', units.slice(0, 3));
    
    // Check for any existing assignments
    const assignments = await prisma.unitAssignment.count();
    console.log('\n🔗 Existing Unit Assignments:', assignments);
    
    // Check specific query that optimization uses
    const unassignedRequests = await prisma.transportRequest.findMany({
      where: {
        status: 'PENDING',
        assignedUnitId: null
      },
      select: { id: true, status: true, assignedUnitId: true, transportLevel: true }
    });
    console.log('\n🎯 Unassigned Requests (status=PENDING AND assignedUnitId=null):', unassignedRequests.length);
    
    // Check if there are any requests with assignedUnitId but still PENDING status
    const pendingAssigned = await prisma.transportRequest.findMany({
      where: {
        status: 'PENDING',
        assignedUnitId: { not: null }
      },
      select: { id: true, status: true, assignedUnitId: true, transportLevel: true }
    });
    console.log('\n⚠️  PENDING requests with assigned units:', pendingAssigned.length);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkData();
