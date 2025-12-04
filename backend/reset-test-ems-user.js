#!/usr/bin/env node
/**
 * Create or reset test@ems.com user with password: testpassword
 * Usage: node backend/reset-test-ems-user.js
 */

const { databaseManager } = require('./dist/services/databaseManager');
const bcrypt = require('bcryptjs');

async function resetTestEMSUser() {
  let prisma;
  try {
    console.log('🔧 Creating/Resetting test@ems.com user...\n');
    
    prisma = databaseManager.getPrismaClient();
    
    // Find an existing agency to link to
    const agency = await prisma.eMSAgency.findFirst({
      orderBy: { createdAt: 'asc' }
    });
    
    let agencyId = null;
    let agencyName = 'Test EMS Agency';
    
    if (agency) {
      agencyId = agency.id;
      agencyName = agency.name;
      console.log(`   Found agency: ${agencyName} (${agencyId})`);
    } else {
      console.log('   ⚠️  No agencies found - user will be created without agency link');
    }
    
    // Hash the password
    const password = 'testpassword';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create or update the user
    const emsUser = await prisma.eMSUser.upsert({
      where: { email: 'test@ems.com' },
      update: {
        password: hashedPassword,
        name: 'Test EMS User',
        agencyId: agencyId,
        agencyName: agencyName,
        userType: 'EMS',
        isActive: true
      },
      create: {
        email: 'test@ems.com',
        password: hashedPassword,
        name: 'Test EMS User',
        agencyId: agencyId,
        agencyName: agencyName,
        userType: 'EMS',
        isActive: true
      }
    });

    console.log('\n✅ User created/updated successfully!');
    console.log('═══════════════════════════════════════════════');
    console.log('📋 Login Credentials:');
    console.log('   Email: test@ems.com');
    console.log('   Password: testpassword');
    console.log('   Name:', emsUser.name);
    console.log('   Agency:', emsUser.agencyName || 'None');
    console.log('   Active:', emsUser.isActive);
    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error creating/resetting user:', error);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

resetTestEMSUser();



