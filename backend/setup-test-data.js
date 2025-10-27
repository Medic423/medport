const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function setupTestData() {
  try {
    console.log('Setting up test data...');
    
    // 1. Create EMS Agency
    const agency = await prisma.eMSAgency.create({
      data: {
        name: 'Mountain Valley EMS',
        contactName: 'Frank Ferguson',
        phone: '555-0123',
        email: 'fferguson@movalleyems.com',
        address: '123 Main St',
        city: 'Mountain Valley',
        state: 'PA',
        zipCode: '12345',
        serviceArea: ['Mountain Valley', 'Valley View'],
        capabilities: ['BLS', 'ALS'],
        isActive: true,
        status: 'ACTIVE',
        acceptsNotifications: true,
        notificationMethods: ['email'],
        totalUnits: 0,
        availableUnits: 0
      }
    });
    console.log('Agency created:', agency.id);
    
    // 2. Create or find EMS User in CenterUser table
    let emsUser = await prisma.centerUser.findFirst({
      where: { email: 'fferguson@movalleyems.com' }
    });
    
    if (!emsUser) {
      const hashedPassword = await bcrypt.hash('movalley123', 10);
      emsUser = await prisma.centerUser.create({
        data: {
          email: 'fferguson@movalleyems.com',
          password: hashedPassword,
          name: 'Frank Ferguson',
          userType: 'EMS',
          phone: '555-0123',
          emailNotifications: true,
          smsNotifications: false,
          isActive: true
        }
      });
      console.log('EMS User created:', emsUser.id);
    } else {
      console.log('EMS User already exists:', emsUser.id);
    }
    
    // 3. Create test units
    const unit1 = await prisma.unit.create({
      data: {
        agencyId: agency.id,
        unitNumber: 'A-101',
        type: 'AMBULANCE',
        capabilities: ['BLS', 'ALS'],
        status: 'AVAILABLE',
        crewSize: 2,
        equipment: ['DEFIBRILLATOR', 'VENTILATOR'],
        isActive: true,
        lastMaintenance: new Date(),
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    
    const unit2 = await prisma.unit.create({
      data: {
        agencyId: agency.id,
        unitNumber: 'A-102',
        type: 'AMBULANCE',
        capabilities: ['BLS'],
        status: 'ON_CALL',
        crewSize: 2,
        equipment: ['DEFIBRILLATOR'],
        isActive: true,
        lastMaintenance: new Date(),
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    
    console.log('Units created:', unit1.id, unit2.id);
    
    // 4. Create analytics for units
    await prisma.unit_analytics.create({
      data: {
        id: `analytics-${unit1.id}`,
        unitId: unit1.id,
        totalTrips: 45,
        averageResponseTime: 8.5,
        performanceScore: 85.5,
        efficiency: 0.87
      }
    });
    
    await prisma.unit_analytics.create({
      data: {
        id: `analytics-${unit2.id}`,
        unitId: unit2.id,
        totalTrips: 32,
        averageResponseTime: 7.2,
        performanceScore: 92.1,
        efficiency: 0.91
      }
    });
    
    console.log('Analytics created for units');
    
    // 5. Update agency unit counts
    await prisma.eMSAgency.update({
      where: { id: agency.id },
      data: {
        totalUnits: 2,
        availableUnits: 1
      }
    });
    
    console.log('Test data setup complete!');
    
  } catch (error) {
    console.error('Error setting up test data:', error);
  } finally {
    await prisma.$disconnect();
    await prisma.$disconnect();
  }
}

setupTestData();
