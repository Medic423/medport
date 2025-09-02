const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestTransportRequests() {
  try {
    console.log('Adding test transport requests...');

    // First, let's check if we have any users
    const users = await prisma.user.findMany();
    console.log('Found users:', users.length);

    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      return;
    }

    // Find a hospital user
    const hospitalUser = users.find(user => user.userType === 'hospital' || user.role === 'ADMIN');
    if (!hospitalUser) {
      console.log('No hospital user found. Please create a hospital user first.');
      return;
    }

    console.log('Using hospital user:', hospitalUser.email);

    // Create test transport requests
    const testRequests = [
      {
        id: '1',
        origin: 'City General Hospital',
        destination: 'Regional Medical Center',
        transportLevel: 'BLS',
        status: 'pending',
        requestTime: new Date('2025-08-29T14:00:00Z'),
        patientName: 'John Doe',
        patientAge: 45,
        patientCondition: 'Stable for transport',
        contactPhone: '(555) 123-4567',
        specialRequirements: 'Wheelchair accessible',
        notes: 'Patient prefers morning transport'
      },
      {
        id: '2',
        origin: 'City General Hospital',
        destination: 'Rehabilitation Center',
        transportLevel: 'BLS',
        status: 'pending',
        requestTime: new Date('2025-08-29T14:00:00Z'),
        patientName: 'Jane Smith',
        patientAge: 67,
        patientCondition: 'Post-surgical recovery',
        contactPhone: '(555) 987-6543',
        specialRequirements: 'Stretcher required',
        notes: 'Patient has mobility restrictions'
      },
      {
        id: '3',
        origin: 'Regional Medical Center',
        destination: 'City General Hospital',
        transportLevel: 'ALS',
        status: 'pending',
        requestTime: new Date('2025-08-29T15:30:00Z'),
        patientName: 'Bob Johnson',
        patientAge: 52,
        patientCondition: 'Cardiac monitoring required',
        contactPhone: '(555) 456-7890',
        specialRequirements: 'Cardiac monitor, oxygen',
        notes: 'High priority transport'
      }
    ];

    // Delete existing test requests first
    await prisma.transportRequest.deleteMany({
      where: {
        id: {
          in: testRequests.map(req => req.id)
        }
      }
    });

    // Create new test requests
    for (const request of testRequests) {
      const createdRequest = await prisma.transportRequest.create({
        data: {
          id: request.id,
          origin: request.origin,
          destination: request.destination,
          transportLevel: request.transportLevel,
          status: request.status,
          requestTime: request.requestTime,
          patientName: request.patientName,
          patientAge: request.patientAge,
          patientCondition: request.patientCondition,
          contactPhone: request.contactPhone,
          specialRequirements: request.specialRequirements,
          notes: request.notes,
          hospitalId: hospitalUser.id
        }
      });
      console.log('Created transport request:', createdRequest.id, createdRequest.origin, '→', createdRequest.destination);
    }

    console.log('✅ Test transport requests created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating test transport requests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestTransportRequests();