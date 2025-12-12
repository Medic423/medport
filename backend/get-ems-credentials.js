#!/usr/bin/env node
/**
 * Get EMS user credentials for dispatch-eligible agencies
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getEMSCredentials() {
  try {
    console.log('=== EMS Users Eligible for Dispatch ===\n');

    // Get all active EMS users with their agency info
    const users = await prisma.eMSUser.findMany({
      where: {
        isDeleted: false,
        isActive: true
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            isActive: true,
            acceptsNotifications: true,
            phone: true
          }
        }
      },
      orderBy: {
        agencyName: 'asc'
      }
    });

    // Filter for dispatch-eligible agencies (active, accepts notifications)
    const dispatchEligible = users.filter(u => 
      u.agency && 
      u.agency.isActive && 
      u.agency.acceptsNotifications !== false
    );

    console.log(`Found ${dispatchEligible.length} EMS users from dispatch-eligible agencies:\n`);

    dispatchEligible.forEach((user, index) => {
      console.log(`${index + 1}. ${user.agencyName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Agency Phone: ${user.agency?.phone || 'N/A'}`);
      console.log(`   Accepts Notifications: ${user.agency?.acceptsNotifications ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Show specific agencies requested
    const requestedAgencies = ['Duncansville EMS', 'Citizens Ambulance Service', 'Elk County EMS'];
    console.log('\n=== Requested Agencies ===\n');
    
    requestedAgencies.forEach(agencyName => {
      const user = dispatchEligible.find(u => u.agencyName === agencyName);
      if (user) {
        console.log(`${agencyName}:`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Password: [Check seed file - passwords are hashed]`);
        console.log(`  Agency Phone: ${user.agency?.phone || 'N/A'}`);
        console.log('');
      } else {
        console.log(`${agencyName}: NOT FOUND`);
        console.log('');
      }
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

getEMSCredentials();

