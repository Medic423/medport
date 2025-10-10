const { PrismaClient } = require('@prisma/client');

const emsPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_EMS
    }
  }
});

async function checkEMSUser() {
  try {
    console.log('Checking EMS user...');
    
    // Check EMS user
    const emsUser = await emsPrisma.eMSUser.findUnique({
      where: { email: 'fferguson@movalleyems.com' }
    });
    
    console.log('EMS User:', emsUser);
    
    // Check agency
    const agency = await emsPrisma.eMSAgency.findFirst({
      where: { email: 'fferguson@movalleyems.com' }
    });
    
    console.log('Agency:', agency);
    
    // Update EMS user with agency ID if needed
    if (emsUser && agency && !emsUser.agencyId) {
      console.log('Updating EMS user with agency ID...');
      const updatedUser = await emsPrisma.eMSUser.update({
        where: { id: emsUser.id },
        data: { agencyId: agency.id }
      });
      console.log('Updated EMS User:', updatedUser);
    }
    
  } catch (error) {
    console.error('Error checking EMS user:', error);
  } finally {
    await emsPrisma.$disconnect();
  }
}

checkEMSUser();