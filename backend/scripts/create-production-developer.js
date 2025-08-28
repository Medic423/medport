const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createProductionDeveloper() {
  try {
    console.log('🔐 Creating production developer user...');
    
    // Hash the developer password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('dev123', saltRounds);
    
    console.log('✅ Password hashed successfully');
    
    // Create or update developer user
    const developerUser = await prisma.user.upsert({
      where: { email: 'developer@medport-transport.com' },
      update: {
        password: hashedPassword,
        name: 'System Developer',
        role: 'ADMIN',
        isActive: true
      },
      create: {
        email: 'developer@medport-transport.com',
        password: hashedPassword,
        name: 'System Developer',
        role: 'ADMIN',
        isActive: true
      }
    });
    
    console.log(`✅ Developer user created/updated: ${developerUser.name} (${developerUser.email})`);
    console.log(`   User ID: ${developerUser.id}`);
    console.log(`   Role: ${developerUser.role}`);
    console.log(`   Active: ${developerUser.isActive}`);
    console.log('\n🔑 Developer credentials:');
    console.log('   Email: developer@medport-transport.com');
    console.log('   Password: dev123');
    console.log('\n🚀 This user has FULL ADMIN ACCESS to the entire system!');
    
    return developerUser;
  } catch (error) {
    console.error('❌ Error creating developer user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
if (require.main === module) {
  createProductionDeveloper()
    .then(() => {
      console.log('\n🎉 Developer user setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createProductionDeveloper };
