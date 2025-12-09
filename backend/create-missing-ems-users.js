#!/usr/bin/env node
/**
 * Create EMS user accounts for Bedford Ambulance Service and Citizens Ambulance Service
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createMissingUsers() {
  try {
    console.log('=== Creating Missing EMS User Accounts ===\n');

    // Find Bedford Ambulance Service agency
    const bedfordAgency = await prisma.eMSAgency.findFirst({
      where: { name: 'Bedford Ambulance Service' }
    });

    if (!bedfordAgency) {
      console.error('❌ Bedford Ambulance Service agency not found');
    } else {
      console.log('✅ Found Bedford Ambulance Service agency:', bedfordAgency.id);
      
      // Check if user already exists
      const existingBedford = await prisma.eMSUser.findFirst({
        where: { email: 'bedford@bedfordambulance.com' }
      });

      if (existingBedford) {
        console.log('⚠️  Bedford user already exists:', existingBedford.email);
      } else {
        const bedfordPassword = await bcrypt.hash('bedford123', 12);
        const bedfordUser = await prisma.eMSUser.create({
          data: {
            email: 'bedford@bedfordambulance.com',
            password: bedfordPassword,
            name: 'Bedford Ambulance User',
            agencyName: 'Bedford Ambulance Service',
            agencyId: bedfordAgency.id,
            isActive: true,
            userType: 'EMS'
          }
        });
        console.log('✅ Created Bedford user:', bedfordUser.email, '(password: bedford123)');
      }
    }

    // Find Citizens Ambulance Service agency
    const citizensAgency = await prisma.eMSAgency.findFirst({
      where: { name: 'Citizens Ambulance Service' }
    });

    if (!citizensAgency) {
      console.error('❌ Citizens Ambulance Service agency not found');
    } else {
      console.log('✅ Found Citizens Ambulance Service agency:', citizensAgency.id);
      
      // Check if user already exists
      const existingCitizens = await prisma.eMSUser.findFirst({
        where: { email: 'citizens@citizensambulance.com' }
      });

      if (existingCitizens) {
        console.log('⚠️  Citizens user already exists:', existingCitizens.email);
      } else {
        const citizensPassword = await bcrypt.hash('citizens123', 12);
        const citizensUser = await prisma.eMSUser.create({
          data: {
            email: 'citizens@citizensambulance.com',
            password: citizensPassword,
            name: 'Citizens Ambulance User',
            agencyName: 'Citizens Ambulance Service',
            agencyId: citizensAgency.id,
            isActive: true,
            userType: 'EMS'
          }
        });
        console.log('✅ Created Citizens user:', citizensUser.email, '(password: citizens123)');
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

createMissingUsers();

