const { PrismaClient } = require('@prisma/client');

const emsPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_EMS
    }
  }
});

async function testEMSConnection() {
  try {
    console.log('Testing EMS database connection...');
    
    // Test basic connection
    await emsPrisma.$connect();
    console.log('✅ EMS database connected successfully');
    
    // Test EMS user query
    const emsUser = await emsPrisma.eMSUser.findUnique({
      where: { email: 'fferguson@movalleyems.com' }
    });
    
    console.log('EMS User found:', emsUser ? 'YES' : 'NO');
    if (emsUser) {
      console.log('User details:', {
        id: emsUser.id,
        email: emsUser.email,
        name: emsUser.name,
        agencyId: emsUser.agencyId,
        isActive: emsUser.isActive
      });
    }
    
    // Test agency query
    const agency = await emsPrisma.eMSAgency.findFirst({
      where: { email: 'fferguson@movalleyems.com' }
    });
    
    console.log('Agency found:', agency ? 'YES' : 'NO');
    if (agency) {
      console.log('Agency details:', {
        id: agency.id,
        name: agency.name,
        email: agency.email
      });
    }
    
  } catch (error) {
    console.error('❌ EMS database connection error:', error);
  } finally {
    await emsPrisma.$disconnect();
  }
}

testEMSConnection();
