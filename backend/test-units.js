const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_EMS
    }
  }
});

async function createTestUnit() {
  try {
    // First, let's see if there are any agencies
    const agencies = await prisma.eMSAgency.findMany();
    console.log('Agencies found:', agencies.length);
    
    if (agencies.length === 0) {
      console.log('No agencies found. Creating a test agency first...');
      const testAgency = await prisma.eMSAgency.create({
        data: {
          name: 'Test EMS Agency',
          contactName: 'Test Contact',
          phone: '555-0123',
          email: 'test@ems.com',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          serviceArea: ['Test Area'],
          capabilities: ['BLS', 'ALS'],
          isActive: true,
          status: 'ACTIVE',
          acceptsNotifications: true,
          notificationMethods: ['email'],
          totalUnits: 0,
          availableUnits: 0
        }
      });
      console.log('Test agency created:', testAgency.id);
      
      // Now create a test unit
      const testUnit = await prisma.unit.create({
        data: {
          agencyId: testAgency.id,
          unitNumber: 'TEST-001',
          type: 'AMBULANCE',
          capabilities: ['BLS', 'ALS'],
          status: 'AVAILABLE',
          crewSize: 2,
          equipment: ['DEFIBRILLATOR'],
          isActive: true,
          lastMaintenance: new Date(),
          nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
      console.log('Test unit created:', testUnit.id);
      
      // Create analytics for the unit
      await prisma.unit_analytics.create({
        data: {
          id: `analytics-${testUnit.id}`,
          unitId: testUnit.id,
          totalTrips: 0,
          averageResponseTime: 0,
          performanceScore: 0,
          efficiency: 0
        }
      });
      console.log('Test unit analytics created');
      
    } else {
      console.log('Using existing agency:', agencies[0].name);
      const testUnit = await prisma.unit.create({
        data: {
          agencyId: agencies[0].id,
          unitNumber: 'TEST-002',
          type: 'AMBULANCE',
          capabilities: ['BLS'],
          status: 'AVAILABLE',
          crewSize: 2,
          equipment: ['DEFIBRILLATOR'],
          isActive: true,
          lastMaintenance: new Date(),
          nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
      console.log('Test unit created:', testUnit.id);
      
      // Create analytics for the unit
      await prisma.unit_analytics.create({
        data: {
          id: `analytics-${testUnit.id}`,
          unitId: testUnit.id,
          totalTrips: 0,
          averageResponseTime: 0,
          performanceScore: 0,
          efficiency: 0
        }
      });
      console.log('Test unit analytics created');
    }
    
    console.log('Test data created successfully!');
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUnit();
