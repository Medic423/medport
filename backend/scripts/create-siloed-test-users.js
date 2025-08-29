const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('Creating test users for siloed login system...');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Transport Center user (COORDINATOR role)
    const centerUser = await prisma.user.upsert({
      where: { email: 'center@medport.com' },
      update: {},
      create: {
        email: 'center@medport.com',
        password: hashedPassword,
        name: 'Transport Center User',
        role: 'COORDINATOR',
        isActive: true
      }
    });
    console.log('✅ Created center user:', centerUser.email);

    // Create Hospital user (ADMIN role)
    const hospitalUser = await prisma.user.upsert({
      where: { email: 'hospital@medport.com' },
      update: {},
      create: {
        email: 'hospital@medport.com',
        password: hashedPassword,
        name: 'Hospital User',
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('✅ Created hospital user:', hospitalUser.email);

    // Create EMS Agency user (TRANSPORT_AGENCY role)
    const agencyUser = await prisma.user.upsert({
      where: { email: 'agency@medport.com' },
      update: {},
      create: {
        email: 'agency@medport.com',
        password: hashedPassword,
        name: 'EMS Agency User',
        role: 'TRANSPORT_AGENCY',
        isActive: true
      }
    });
    console.log('✅ Created agency user:', agencyUser.email);

    console.log('\n🎉 All test users created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('┌─────────────────────┬─────────────────────┬─────────────────┐');
    console.log('│ Login Type          │ Email               │ Password        │');
    console.log('├─────────────────────┼─────────────────────┼─────────────────┤');
    console.log('│ Transport Center    │ center@medport.com  │ password123     │');
    console.log('│ Hospital            │ hospital@medport.com│ password123     │');
    console.log('│ EMS Agency          │ agency@medport.com  │ password123     │');
    console.log('└─────────────────────┴─────────────────────┴─────────────────┘');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
