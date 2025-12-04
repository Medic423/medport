#!/usr/bin/env node

const { databaseManager } = require('./backend/dist/services/databaseManager');

async function createTestAgencies() {
  let emsPrisma;
  try {
    console.log('Creating test EMS agencies...');

    emsPrisma = databaseManager.getEMSDB();
    console.log('EMS Prisma client:', emsPrisma);

    // Create test EMS agencies
    const agencies = [
      {
        id: 'ems-agency-1',
        name: 'Test EMS Agency 1',
        contactName: 'John Smith',
        phone: '555-0001',
        email: 'agency1@test.com',
        address: '123 Main St',
        city: 'Test City',
        state: 'PA',
        zipCode: '12345',
        serviceArea: ['Test City', 'Nearby Area'],
        capabilities: ['BLS', 'ALS'],
        isActive: true
      },
      {
        id: 'ems-agency-2',
        name: 'Test EMS Agency 2',
        contactName: 'Jane Doe',
        phone: '555-0002',
        email: 'agency2@test.com',
        address: '456 Oak Ave',
        city: 'Test City',
        state: 'PA',
        zipCode: '12345',
        serviceArea: ['Test City', 'Nearby Area'],
        capabilities: ['BLS', 'ALS'],
        isActive: true
      },
      {
        id: 'ems-agency-3',
        name: 'Test EMS Agency 3',
        contactName: 'Bob Johnson',
        phone: '555-0003',
        email: 'agency3@test.com',
        address: '789 Pine St',
        city: 'Test City',
        state: 'PA',
        zipCode: '12345',
        serviceArea: ['Test City', 'Nearby Area'],
        capabilities: ['BLS', 'ALS'],
        isActive: true
      }
    ];

    for (const agency of agencies) {
      const createdAgency = await emsPrisma.eMSAgency.upsert({
        where: { id: agency.id },
        update: agency,
        create: agency
      });
      console.log('✅ Agency created/updated:', createdAgency.name);
    }

    console.log('✅ All test agencies created successfully');

  } catch (error) {
    console.error('Error creating test agencies:', error);
  } finally {
    if (emsPrisma) {
      await emsPrisma.$disconnect();
    }
  }
}

createTestAgencies();
