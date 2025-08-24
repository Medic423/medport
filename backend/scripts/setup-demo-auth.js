const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupDemoAuth() {
  try {
    console.log('🔐 Setting up demo authentication...');
    
    // Hash the demo password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('demo123', saltRounds);
    
    console.log('✅ Password hashed successfully');
    
    // Create or update demo user
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@medport.com' },
      update: {
        password: hashedPassword,
        name: 'Demo Coordinator',
        role: 'COORDINATOR',
        isActive: true
      },
      create: {
        email: 'demo@medport.com',
        password: hashedPassword,
        name: 'Demo Coordinator',
        role: 'COORDINATOR',
        isActive: true
      }
    });
    
    console.log(`✅ Demo user created/updated: ${demoUser.name} (${demoUser.email})`);
    console.log(`   User ID: ${demoUser.id}`);
    console.log(`   Role: ${demoUser.role}`);
    console.log(`   Active: ${demoUser.isActive}`);
    console.log('\n🔑 Demo credentials:');
    console.log('   Email: demo@medport.com');
    console.log('   Password: demo123');
    
    return demoUser;
  } catch (error) {
    console.error('❌ Error setting up demo auth:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDemoAuth();
