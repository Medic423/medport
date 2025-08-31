const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSimpleTestRequest() {
  try {
    console.log('Creating simple test transport request...');

    // Find a hospital user
    const hospitalUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (!hospitalUser) {
      console.log('No hospital user found. Please create a hospital user first.');
      return;
    }

    console.log('Using hospital user:', hospitalUser.email);

    // Create a simple facility first
    const facility = await prisma.facility.upsert({
      where: { id: 'test-facility-1' },
      update: {},
      create: {
        id: 'test-facility-1',
        name: 'City General Hospital',
        type: 'HOSPITAL',
        address: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        phone: '(555) 123-4567',
        email: 'info@citygeneral.com',
        isActive: true
      }
    });

    console.log('Created/Found facility:', facility.name);

    // Create a simple transport request
    const transportRequest = await prisma.transportRequest.create({
      data: {
        id: '2', // Match the mock data ID
        patientId: 'test-patient-2',
        originFacilityId: facility.id,
        destinationFacilityId: facility.id, // Same facility for simplicity
        transportLevel: 'BLS',
        status: 'PENDING',
        specialRequirements: 'Wheelchair accessible',
        createdById: hospitalUser.id
      }
    });

    console.log('✅ Created transport request:', transportRequest.id);
    console.log('Status:', transportRequest.status);
    console.log('Transport Level:', transportRequest.transportLevel);
    
  } catch (error) {
    console.error('❌ Error creating test transport request:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleTestRequest();
