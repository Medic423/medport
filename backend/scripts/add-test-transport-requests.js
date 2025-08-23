const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestTransportRequests() {
  try {
    console.log('Adding test transport requests...');

    // First, let's check if we have any facilities
    const facilities = await prisma.facility.findMany();
    if (facilities.length === 0) {
      console.log('No facilities found. Please run add-test-facility.js first.');
      return;
    }

    // Create test transport requests with different time windows and locations
    const testRequests = [
      {
        patientId: 'demo-patient-1',
        originFacilityId: facilities[0].id,
        destinationFacilityId: facilities[1]?.id || facilities[0].id,
        transportLevel: 'BLS',
        priority: 'MEDIUM',
        status: 'PENDING',
        specialRequirements: 'Test request for route optimization',
        pickupTimestamp: new Date('2025-01-23T10:00:00Z'),
        completionTimestamp: new Date('2025-01-23T11:00:00Z'),
        routeOptimizationScore: 75,
        chainingOpportunities: ['TEMPORAL', 'SPATIAL'],
        timeFlexibility: 30,
        revenuePotential: 150.00
      },
      {
        patientId: 'demo-patient-2',
        originFacilityId: facilities[1]?.id || facilities[0].id,
        destinationFacilityId: facilities[0].id,
        transportLevel: 'BLS',
        priority: 'MEDIUM',
        status: 'PENDING',
        specialRequirements: 'Test request for route optimization - return trip',
        pickupTimestamp: new Date('2025-01-23T11:30:00Z'),
        completionTimestamp: new Date('2025-01-23T12:30:00Z'),
        routeOptimizationScore: 80,
        chainingOpportunities: ['RETURN_TRIP', 'TEMPORAL'],
        timeFlexibility: 45,
        revenuePotential: 160.00
      },
      {
        patientId: 'demo-patient-3',
        originFacilityId: facilities[0].id,
        destinationFacilityId: facilities[2]?.id || facilities[1]?.id || facilities[0].id,
        transportLevel: 'BLS',
        priority: 'MEDIUM',
        status: 'PENDING',
        specialRequirements: 'Test request for route optimization - multi-stop',
        pickupTimestamp: new Date('2025-01-23T14:00:00Z'),
        completionTimestamp: new Date('2025-01-23T15:00:00Z'),
        routeOptimizationScore: 70,
        chainingOpportunities: ['MULTI_STOP', 'SPATIAL'],
        timeFlexibility: 60,
        revenuePotential: 180.00
      }
    ];

    for (const requestData of testRequests) {
      const request = await prisma.transportRequest.create({
        data: requestData
      });
      console.log(`Created transport request: ${request.id} for ${request.patientName}`);
    }

    console.log('Test transport requests added successfully!');
    console.log('You can now test the route optimization system.');

  } catch (error) {
    console.error('Error adding test transport requests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestTransportRequests();
