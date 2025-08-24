const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDemoData() {
  try {
    console.log('🔄 Resetting demo data to unassigned state...');

    // Reset all transport requests to PENDING and unassigned
    console.log('\n📋 Resetting transport requests...');
    const resetRequests = await prisma.transportRequest.updateMany({
      where: {},
      data: {
        status: 'PENDING',
        assignedUnitId: null,
        assignedAgencyId: null
      }
    });
    console.log(`✅ Reset ${resetRequests.count} transport requests to PENDING status`);

    // Reset all units to AVAILABLE status
    console.log('\n🚑 Resetting units...');
    const resetUnits = await prisma.unit.updateMany({
      where: {},
      data: {
        currentStatus: 'AVAILABLE'
      }
    });
    console.log(`✅ Reset ${resetUnits.count} units to AVAILABLE status`);

    // Clear all unit assignments
    console.log('\n🗑️ Clearing unit assignments...');
    const deletedAssignments = await prisma.unitAssignment.deleteMany({});
    console.log(`✅ Deleted ${deletedAssignments.count} unit assignments`);

    // Clear all unit availability records
    console.log('\n🗑️ Clearing unit availability records...');
    const deletedAvailability = await prisma.unitAvailability.deleteMany({});
    console.log(`✅ Deleted ${deletedAvailability.count} unit availability records`);

    console.log('\n🎉 Demo data reset completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Transport Requests: Reset to PENDING (unassigned)`);
    console.log(`   - Units: Reset to AVAILABLE status`);
    console.log(`   - Unit Assignments: Cleared`);
    console.log(`   - Unit Availability: Cleared`);
    console.log('\n🔗 You can now test the optimization button again!');

  } catch (error) {
    console.error('❌ Error resetting demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDemoData();


