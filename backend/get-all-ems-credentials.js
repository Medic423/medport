#!/usr/bin/env node
/**
 * Get all EMS user credentials for documentation
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllCredentials() {
  try {
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

    // Filter for dispatch-eligible (agencies that accept notifications)
    const dispatchEligible = users.filter(u => 
      u.agency && 
      u.agency.isActive && 
      u.agency.acceptsNotifications !== false
    );

    // Build markdown content
    let markdown = `# EMS User Credentials
**Generated:** December 8, 2025

## Dispatch-Eligible EMS Agencies

These agencies are active, accept notifications, and have user accounts for login.

`;

    dispatchEligible.forEach((user, index) => {
      markdown += `### ${index + 1}. ${user.agencyName}\n\n`;
      markdown += `- **Email:** \`${user.email}\`\n`;
      markdown += `- **Password:** See seed file or contact admin\n`;
      markdown += `- **Name:** ${user.name}\n`;
      markdown += `- **Agency Phone:** ${user.agency?.phone || 'N/A'}\n`;
      markdown += `- **Accepts Notifications:** ${user.agency?.acceptsNotifications !== false ? 'Yes' : 'No'}\n`;
      markdown += `- **Agency ID:** ${user.agencyId || 'N/A'}\n\n`;
    });

    markdown += `## All Active EMS Users\n\n`;
    markdown += `Total active EMS users: ${users.length}\n\n`;

    users.forEach((user, index) => {
      markdown += `${index + 1}. **${user.agencyName}**\n`;
      markdown += `   - Email: \`${user.email}\`\n`;
      markdown += `   - Name: ${user.name}\n`;
      markdown += `   - Agency Active: ${user.agency?.isActive ? 'Yes' : 'No'}\n`;
      markdown += `   - Accepts Notifications: ${user.agency?.acceptsNotifications !== false ? 'Yes' : 'No'}\n\n`;
    });

    markdown += `## Notes\n\n`;
    markdown += `- Passwords are hashed in the database using bcrypt\n`;
    markdown += `- Plain text passwords can be found in \`backend/prisma/seed.ts\`\n`;
    markdown += `- Only agencies with \`acceptsNotifications: true\` receive SMS notifications\n`;
    markdown += `- Users must have \`isActive: true\` and \`isDeleted: false\` to log in\n`;

    console.log(markdown);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getAllCredentials();

