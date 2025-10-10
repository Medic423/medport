const { PrismaClient } = require('@prisma/client');

const centerPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_CENTER
    }
  }
});

async function removeCenterEMSUser() {
  try {
    console.log('Removing EMS user from Center database...');
    
    // Remove EMS user from Center database
    const deletedUser = await centerPrisma.centerUser.deleteMany({
      where: { 
        email: 'fferguson@movalleyems.com',
        userType: 'EMS'
      }
    });
    
    console.log('Removed EMS users from Center database:', deletedUser.count);
    
  } catch (error) {
    console.error('Error removing EMS user from Center database:', error);
  } finally {
    await centerPrisma.$disconnect();
  }
}

removeCenterEMSUser();
