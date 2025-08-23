const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    console.log('👤 Creating demo user...');
    
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@medport.com' },
      update: {},
      create: {
        email: 'demo@medport.com',
        password: 'demo-password-hash',
        name: 'Demo User',
        role: 'COORDINATOR',
        isActive: true
      }
    });
    
    console.log(`✅ Demo user created: ${demoUser.name} (${demoUser.email})`);
    console.log(`   User ID: ${demoUser.id}`);
    
    return demoUser;
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
