const { PrismaClient } = require('@prisma/client');

const emsPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.EMS_DATABASE_URL || "postgresql://postgres:password@localhost:5432/tcc_ems?schema=public"
    }
  }
});

async function createTestAgencies() {
  try {
    console.log('Creating test agencies...');
    
    // Create test agencies
    const agencies = [
      {
        name: 'Altoona Regional EMS',
        contactPerson: 'John Smith',
        phone: '814-555-0101',
        email: 'contact@altoonaems.com',
        address: '123 Main St, Altoona, PA 16601',
        serviceArea: 'Altoona and surrounding areas',
        capabilities: ['ALS', 'BLS', 'CCT'],
        isActive: true,
        latitude: 40.5187,
        longitude: -78.3947,
        maxResponseRadius: 50
      },
      {
        name: 'Blair County EMS',
        contactPerson: 'Sarah Johnson',
        phone: '814-555-0102',
        email: 'dispatch@blaircountyems.com',
        address: '456 Oak Ave, Hollidaysburg, PA 16648',
        serviceArea: 'Blair County',
        capabilities: ['ALS', 'BLS'],
        isActive: true,
        latitude: 40.4270,
        longitude: -78.3889,
        maxResponseRadius: 75
      },
      {
        name: 'Mountain View EMS',
        contactPerson: 'Mike Wilson',
        phone: '814-555-0103',
        email: 'info@mountainviewems.com',
        address: '789 Pine St, Tyrone, PA 16686',
        serviceArea: 'Tyrone and surrounding areas',
        capabilities: ['BLS'],
        isActive: true,
        latitude: 40.6706,
        longitude: -78.2386,
        maxResponseRadius: 40
      },
      {
        name: 'Central PA Medical Transport',
        contactPerson: 'Lisa Brown',
        phone: '814-555-0104',
        email: 'contact@centralpamedical.com',
        address: '321 Elm St, State College, PA 16801',
        serviceArea: 'Central Pennsylvania',
        capabilities: ['CCT', 'ALS'],
        isActive: true,
        latitude: 40.7934,
        longitude: -77.8600,
        maxResponseRadius: 100
      }
    ];

    for (const agencyData of agencies) {
      const agency = await emsPrisma.agency.create({
        data: agencyData
      });
      console.log(`Created agency: ${agency.name} (ID: ${agency.id})`);
    }

    console.log('Test agencies created successfully!');
  } catch (error) {
    console.error('Error creating test agencies:', error);
  } finally {
    await emsPrisma.$disconnect();
  }
}

createTestAgencies();
