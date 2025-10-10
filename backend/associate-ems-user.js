const { PrismaClient } = require('@prisma/client');

const centerPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_CENTER
    }
  }
});

const emsPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_EMS
    }
  }
});

async function associateEMSUser() {
  try {
    // Get the EMS user
    const emsUser = await centerPrisma.centerUser.findFirst({
      where: {
        email: 'fferguson@movalleyems.com'
      }
    });
    
    console.log('EMS User:', emsUser);
    
    // Get the test agency
    const agency = await emsPrisma.eMSAgency.findFirst();
    console.log('Agency:', agency);
    
    if (emsUser && agency) {
      // Update the user to have the agencyId
      const updatedUser = await centerPrisma.centerUser.update({
        where: { id: emsUser.id },
        data: { 
          // Add agencyId field if it exists in the schema
          // For now, we'll store it in a custom field or use the existing structure
        }
      });
      
      console.log('User updated:', updatedUser);
    }
    
  } catch (error) {
    console.error('Error associating EMS user:', error);
  } finally {
    await centerPrisma.$disconnect();
    await emsPrisma.$disconnect();
  }
}

associateEMSUser();
