const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createEMSUser() {
  try {
    console.log('Creating EMS user...');
    
    // First, find an existing agency
    const agency = await prisma.eMSAgency.findFirst({
      where: { name: 'Altoona EMS' }
    });
    
    if (!agency) {
      console.error('Agency not found. Please run setup-test-data.js first.');
      return;
    }
    
    console.log('Found agency:', agency.id);
    
    // Create EMS user in EMS database
    const hashedPassword = await bcrypt.hash('movalley123', 10);
    const emsUser = await prisma.eMSUser.create({
      data: {
        email: 'fferguson@movalleyems.com',
        password: hashedPassword,
        name: 'Frank Ferguson',
        agencyName: agency.name,
        agencyId: agency.id,
        userType: 'EMS',
        isActive: true
      }
    });
    
    console.log('EMS User created in EMS database:', emsUser.id);
    console.log('EMS login credentials:');
    console.log('Email: fferguson@movalleyems.com');
    console.log('Password: movalley123');
    
  } catch (error) {
    console.error('Error creating EMS user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createEMSUser();