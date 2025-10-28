/**
 * Sync exact dropdown options from dev to production
 */

const { PrismaClient } = require('@prisma/client');

// Dev database
const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://scooper@localhost:5432/medport_ems?schema=public'
    }
  }
});

// Production database
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function syncOptions() {
  console.log('🔄 Syncing dropdown options from dev to production...\n');
  
  try {
    // Get all options from dev
    const devOptions = await devPrisma.dropdownOption.findMany({
      orderBy: { category: 'asc' }
    });
    
    console.log(`Found ${devOptions.length} options in dev database\n`);
    
    let synced = 0;
    
    for (const option of devOptions) {
      try {
        // Check if it exists in production
        const existing = await prodPrisma.dropdownOption.findFirst({
          where: {
            category: option.category,
            value: option.value
          }
        });
        
        if (!existing) {
          // Create new option
          await prodPrisma.dropdownOption.create({
            data: {
              id: option.id,
              category: option.category,
              value: option.value,
              isActive: option.isActive
            }
          });
          console.log(`✅ Added: ${option.category} - ${option.value}`);
          synced++;
        } else {
          // Update existing option to match dev
          if (existing.isActive !== option.isActive) {
            await prodPrisma.dropdownOption.update({
              where: { id: existing.id },
              data: { isActive: option.isActive }
            });
            console.log(`🔄 Updated: ${option.category} - ${option.value}`);
            synced++;
          }
        }
      } catch (error) {
        console.error(`❌ Error with ${option.category} - ${option.value}:`, error.message);
      }
    }
    
    console.log(`\n✅ Synced ${synced} options`);
    
  } catch (error) {
    console.error('Error syncing options:', error);
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

syncOptions();

