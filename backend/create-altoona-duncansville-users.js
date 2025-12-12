#!/usr/bin/env node
/**
 * Create EMS user accounts for Altoona EMS and Duncansville EMS
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createUsers() {
  try {
    console.log('=== Creating Altoona EMS and Duncansville EMS User Accounts ===\n');

    // Find Altoona EMS agency
    const altoonaAgency = await prisma.eMSAgency.findFirst({
      where: { name: 'Altoona EMS' }
    });

    if (!altoonaAgency) {
      console.error('❌ Altoona EMS agency not found');
    } else {
      console.log('✅ Found Altoona EMS agency:', altoonaAgency.id);
      
      // Check if user already exists
      const existingAltoona = await prisma.eMSUser.findFirst({
        where: { email: 'test@ems.com' }
      });

      if (existingAltoona) {
        console.log('⚠️  Altoona user already exists:', existingAltoona.email);
        // Check if it's linked to the right agency
        if (existingAltoona.agencyId !== altoonaAgency.id) {
          console.log('   Updating agency link...');
          await prisma.eMSUser.update({
            where: { id: existingAltoona.id },
            data: { agencyId: altoonaAgency.id, agencyName: 'Altoona EMS' }
          });
          console.log('✅ Updated agency link');
        }
      } else {
        const altoonaPassword = await bcrypt.hash('testpassword', 12);
        const altoonaUser = await prisma.eMSUser.create({
          data: {
            email: 'test@ems.com',
            password: altoonaPassword,
            name: 'Test EMS User',
            agencyName: 'Altoona EMS',
            agencyId: altoonaAgency.id,
            isActive: true,
            userType: 'EMS'
          }
        });
        console.log('✅ Created Altoona user:', altoonaUser.email, '(password: testpassword)');
      }
    }

    // Find Duncansville EMS agency
    const duncansvilleAgency = await prisma.eMSAgency.findFirst({
      where: { name: 'Duncansville EMS' }
    });

    if (!duncansvilleAgency) {
      console.error('❌ Duncansville EMS agency not found');
    } else {
      console.log('✅ Found Duncansville EMS agency:', duncansvilleAgency.id);
      
      // Check if user already exists
      const existingDuncansville = await prisma.eMSUser.findFirst({
        where: { email: 'test@duncansvilleems.org' }
      });

      if (existingDuncansville) {
        console.log('⚠️  Duncansville user already exists:', existingDuncansville.email);
        // Check if it's linked to the right agency
        if (existingDuncansville.agencyId !== duncansvilleAgency.id) {
          console.log('   Updating agency link...');
          await prisma.eMSUser.update({
            where: { id: existingDuncansville.id },
            data: { agencyId: duncansvilleAgency.id, agencyName: 'Duncansville EMS' }
          });
          console.log('✅ Updated agency link');
        }
      } else {
        const duncansvillePassword = await bcrypt.hash('duncansville123', 12);
        const duncansvilleUser = await prisma.eMSUser.create({
          data: {
            email: 'test@duncansvilleems.org',
            password: duncansvillePassword,
            name: 'Test Duncansville User',
            agencyName: 'Duncansville EMS',
            agencyId: duncansvilleAgency.id,
            isActive: true,
            userType: 'EMS'
          }
        });
        console.log('✅ Created Duncansville user:', duncansvilleUser.email, '(password: duncansville123)');
      }
    }

    await prisma.$disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createUsers();

