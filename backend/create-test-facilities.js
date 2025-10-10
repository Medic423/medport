const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestFacilities() {
  try {
    console.log('Creating test facilities for Phase A geographic filtering...');

    // Test facilities in Pennsylvania
    const paFacilities = [
      {
        id: 'fac_pa_001',
        name: 'Penn Highlands DuBois',
        type: 'Hospital',
        address: '100 Hospital Avenue',
        city: 'DuBois',
        state: 'PA',
        zipCode: '15801',
        phone: '(814) 371-2200',
        latitude: 41.1234,
        longitude: -78.7654,
        region: 'PA',
        isActive: true
      },
      {
        id: 'fac_pa_002',
        name: 'Penn Highlands Brookville',
        type: 'Hospital',
        address: '100 Hospital Road',
        city: 'Brookville',
        state: 'PA',
        zipCode: '15825',
        phone: '(814) 849-1812',
        latitude: 41.1654,
        longitude: -79.0821,
        region: 'PA',
        isActive: true
      },
      {
        id: 'fac_pa_003',
        name: 'Penn Highlands Clearfield',
        type: 'Hospital',
        address: '809 Turnpike Avenue',
        city: 'Clearfield',
        state: 'PA',
        zipCode: '16830',
        phone: '(814) 765-5341',
        latitude: 41.0214,
        longitude: -78.4391,
        region: 'PA',
        isActive: true
      }
    ];

    // Test facilities in neighboring states
    const otherStateFacilities = [
      {
        id: 'fac_ny_001',
        name: 'Buffalo General Hospital',
        type: 'Hospital',
        address: '100 High Street',
        city: 'Buffalo',
        state: 'NY',
        zipCode: '14203',
        phone: '(716) 859-5600',
        latitude: 42.8864,
        longitude: -78.8784,
        region: 'NY',
        isActive: true
      },
      {
        id: 'fac_oh_001',
        name: 'Cleveland Clinic',
        type: 'Hospital',
        address: '9500 Euclid Avenue',
        city: 'Cleveland',
        state: 'OH',
        zipCode: '44195',
        phone: '(216) 444-2200',
        latitude: 41.5025,
        longitude: -81.6216,
        region: 'OH',
        isActive: true
      }
    ];

    // Create PA facilities
    for (const facility of paFacilities) {
      await prisma.facility.upsert({
        where: { id: facility.id },
        update: facility,
        create: facility
      });
      console.log(`Created/Updated PA facility: ${facility.name}`);
    }

    // Create other state facilities
    for (const facility of otherStateFacilities) {
      await prisma.facility.upsert({
        where: { id: facility.id },
        update: facility,
        create: facility
      });
      console.log(`Created/Updated facility: ${facility.name} in ${facility.state}`);
    }

    console.log('✅ Test facilities created successfully!');
    console.log('\nTest facilities:');
    console.log('- 3 PA facilities (should appear with PA filter)');
    console.log('- 2 facilities in other states (should appear with "Show All States")');
    console.log('\nGeographic filtering test coordinates:');
    console.log('- Origin: 41.1234, -78.7654 (Penn Highlands DuBois area)');
    console.log('- Radius: 100 miles should include all PA facilities');

  } catch (error) {
    console.error('Error creating test facilities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestFacilities();
