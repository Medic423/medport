const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAssignmentCreation() {
  try {
    console.log('🧪 Testing assignment creation process...\n');
    
    // Get one unassigned request and one available unit
    const request = await prisma.transportRequest.findFirst({
      where: {
        status: 'PENDING',
        assignedUnitId: null
      }
    });
    
    const unit = await prisma.unit.findFirst({
      where: {
        currentStatus: 'AVAILABLE',
        type: request.transportLevel
      }
    });
    
    console.log(`📋 Request: ${request.id} (${request.transportLevel})`);
    console.log(`🚑 Unit: ${unit.unitNumber} (${unit.type})`);
    
    // Try to create assignment step by step
    console.log('\n🔍 Step 1: Checking unit availability...');
    const availability = await prisma.unitAvailability.findFirst({
      where: { unitId: unit.id },
      orderBy: { lastUpdated: 'desc' }
    });
    
    if (!availability) {
      console.log('❌ No unit availability record found - this is the issue!');
      console.log('Creating new availability record...');
      
      const newAvailability = await prisma.unitAvailability.create({
        data: {
          unitId: unit.id,
          status: 'IN_USE',
          lastUpdated: new Date()
        }
      });
      console.log('✅ Created new availability record:', newAvailability.id);
    } else {
      console.log('✅ Found existing availability record:', availability.id);
    }
    
    console.log('\n🔍 Step 2: Creating unit assignment...');
    const assignment = await prisma.unitAssignment.create({
      data: {
        unitId: unit.id,
        unitAvailabilityId: availability ? availability.id : (await prisma.unitAvailability.findFirst({ where: { unitId: unit.id } })).id,
        transportRequestId: request.id,
        assignmentType: 'PRIMARY',
        startTime: new Date(),
        status: 'ACTIVE',
        assignedBy: 'cmeo6eojr0002ccpwrin40zz7'
      }
    });
    console.log('✅ Assignment created successfully:', assignment.id);
    
    console.log('\n🔍 Step 3: Updating unit status...');
    await prisma.unit.update({
      where: { id: unit.id },
      data: { currentStatus: 'IN_USE' }
    });
    console.log('✅ Unit status updated to IN_USE');
    
    console.log('\n🔍 Step 4: Updating transport request...');
    await prisma.transportRequest.update({
      where: { id: request.id },
      data: { 
        status: 'SCHEDULED',
        assignedUnitId: unit.id
      }
    });
    console.log('✅ Transport request updated to SCHEDULED');
    
    console.log('\n🎉 Assignment creation test completed successfully!');
    
    // Clean up - reset the test data
    console.log('\n🧹 Cleaning up test data...');
    await prisma.unitAssignment.delete({ where: { id: assignment.id } });
    await prisma.unit.update({ where: { id: unit.id }, data: { currentStatus: 'AVAILABLE' } });
    await prisma.transportRequest.update({ where: { id: request.id }, data: { status: 'PENDING', assignedUnitId: null } });
    console.log('✅ Test data cleaned up');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error during assignment creation test:', error);
    await prisma.$disconnect();
  }
}

testAssignmentCreation();
