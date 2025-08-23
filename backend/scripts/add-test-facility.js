const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestFacility() {
  try {
    console.log('Adding test facility...');
    
    const facility = await prisma.facility.create({
      data: {
        name: 'Penn Highlands Dubois',
        type: 'HOSPITAL',
        address: '100 Hospital Ave',
        city: 'Dubois',
        state: 'PA',
        zipCode: '15801',
        coordinates: { lat: 41.1198, lng: -78.7603 },
        phone: '814-371-2200',
        email: 'info@phhealthcare.org',
        operatingHours: { open: '24/7' },
        capabilities: ['EMERGENCY', 'ICU', 'SURGERY'],
        isActive: true
      }
    });
    
    console.log('Test facility created:', facility);
    
    // Also add a test unit to the existing agency
    const unit = await prisma.unit.create({
      data: {
        agencyId: 'cmeo6eodq0000ccpwaosx7w0r', // Use the existing agency ID
        unitNumber: 'TEST-001',
        type: 'BLS',
        capabilities: ['BASIC_LIFE_SUPPORT'],
        currentStatus: 'AVAILABLE',
        currentLocation: { lat: 40.5187, lng: -78.3947 },
        isActive: true
      }
    });
    
    console.log('Test unit created:', unit);
    
    // Add unit availability
    const unitAvailability = await prisma.unitAvailability.create({
      data: {
        unitId: unit.id,
        status: 'AVAILABLE',
        location: { lat: 40.5187, lng: -78.3947 },
        lastUpdated: new Date()
      }
    });
    
    console.log('Unit availability created:', unitAvailability);
    
  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestFacility();
