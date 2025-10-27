const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkCenterUser() {
  try {
    // Check if the EMS user exists in CenterUser table
    const centerUser = await prisma.centerUser.findFirst({
      where: {
        email: 'fferguson@movalleyems.com'
      }
    });
    
    console.log('Center User found:', centerUser);
    
  } catch (error) {
    console.error('Error checking center user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCenterUser();
