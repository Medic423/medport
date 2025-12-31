#!/usr/bin/env node
/**
 * Fix Jet Response user: Link agencyId and optionally sync to production
 * Usage: node backend/fix-jet-response-user.js
 */

const { databaseManager } = require('./dist/services/databaseManager');
const bcrypt = require('bcryptjs');

async function fixJetResponseUser() {
  let prisma;
  try {
    console.log('🔧 Fixing Jet Response user...\n');
    
    prisma = databaseManager.getPrismaClient();
    
    // Find the user
    const user = await prisma.eMSUser.findFirst({
      where: { email: 'chuck@traccems.com' }
    });
    
    if (!user) {
      console.log('❌ User not found: chuck@traccems.com');
      return;
    }
    
    console.log('✅ Found user:', user.name, user.email);
    console.log('   Current agencyId:', user.agencyId || 'NULL');
    
    // Find the agency
    const agency = await prisma.eMSAgency.findFirst({
      where: { 
        name: 'Jet Response',
        email: 'chuck@traccems.com'
      }
    });
    
    if (!agency) {
      console.log('❌ Agency not found: Jet Response');
      return;
    }
    
    console.log('✅ Found agency:', agency.name, '(ID:', agency.id + ')');
    
    // Update user to link to agency
    if (user.agencyId !== agency.id) {
      await prisma.eMSUser.update({
        where: { id: user.id },
        data: { agencyId: agency.id }
      });
      console.log('✅ Linked user to agency');
    } else {
      console.log('✅ User already linked to agency');
    }
    
    // Verify the link
    const updatedUser = await prisma.eMSUser.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, agencyName: true, agencyId: true, isActive: true }
    });
    
    console.log('\n✅ User updated successfully!');
    console.log('═══════════════════════════════════════════════');
    console.log('📋 User Details:');
    console.log('   Email:', updatedUser.email);
    console.log('   Name:', updatedUser.name);
    console.log('   Agency:', updatedUser.agencyName);
    console.log('   Agency ID:', updatedUser.agencyId);
    console.log('   Active:', updatedUser.isActive);
    console.log('═══════════════════════════════════════════════\n');
    
    console.log('⚠️  NOTE: This user exists in LOCAL database only.');
    console.log('   To use on traccems.com (production), you need to:');
    console.log('   1. Register again on https://traccems.com');
    console.log('   2. OR sync this user/agency to production database');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

fixJetResponseUser();

