const { databaseManager } = require('./dist/services/databaseManager');

async function createTestAgencies() {
  let emsPrisma;
  try {
    console.log('Creating test agencies...');
    
    emsPrisma = databaseManager.getEMSDB();
    console.log('EMS Prisma client:', emsPrisma);
    console.log('Agency model available:', !!emsPrisma?.agency);
    
    // Create test agencies
    const agencies = [
      {
        name: 'Altoona Regional EMS',
        contactName: 'John Smith',
        phone: '814-555-0101',
        email: 'contact@altoonaems.com',
        address: '123 Main St',
        city: 'Altoona',
        state: 'PA',
        zipCode: '16601',
        serviceArea: ['Altoona', 'surrounding areas'],
        capabilities: ['ALS', 'BLS', 'CCT'],
        isActive: true
      },
      {
        name: 'Blair County EMS',
        contactName: 'Sarah Johnson',
        phone: '814-555-0102',
        email: 'dispatch@blaircountyems.com',
        address: '456 Oak Ave',
        city: 'Hollidaysburg',
        state: 'PA',
        zipCode: '16648',
        serviceArea: ['Blair County'],
        capabilities: ['ALS', 'BLS'],
        isActive: true
      },
      {
        name: 'Mountain View EMS',
        contactName: 'Mike Wilson',
        phone: '814-555-0103',
        email: 'info@mountainviewems.com',
        address: '789 Pine St',
        city: 'Tyrone',
        state: 'PA',
        zipCode: '16686',
        serviceArea: ['Tyrone', 'surrounding areas'],
        capabilities: ['BLS'],
        isActive: true
      },
      {
        name: 'Central PA Medical Transport',
        contactName: 'Lisa Brown',
        phone: '814-555-0104',
        email: 'contact@centralpamedical.com',
        address: '321 Elm St',
        city: 'State College',
        state: 'PA',
        zipCode: '16801',
        serviceArea: ['Central Pennsylvania'],
        capabilities: ['CCT', 'ALS'],
        isActive: true
      }
    ];

    for (const agencyData of agencies) {
      const agency = await emsPrisma.eMSAgency.create({
        data: agencyData
      });
      console.log(`Created agency: ${agency.name} (ID: ${agency.id})`);
    }

    console.log('Test agencies created successfully!');
  } catch (error) {
    console.error('Error creating test agencies:', error);
  } finally {
    if (emsPrisma) {
      await emsPrisma.$disconnect();
    }
  }
}

createTestAgencies();
