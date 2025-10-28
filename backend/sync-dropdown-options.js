/**
 * Sync dropdown options from dev to production database
 */

const { PrismaClient } = require('@prisma/client');

// Connect to production database using DATABASE_URL
const prisma = new PrismaClient();

const commonOptions = [
  // Transport Levels
  { category: 'TRANSPORT_LEVEL', value: 'Basic Life Support (BLS)', isActive: true },
  { category: 'TRANSPORT_LEVEL', value: 'Advanced Life Support (ALS)', isActive: true },
  { category: 'TRANSPORT_LEVEL', value: 'Critical Care (CC)', isActive: true },
  { category: 'TRANSPORT_LEVEL', value: 'Aircraft Transport', isActive: true },
  
  // Diagnosis categories
  { category: 'DIAGNOSIS', value: 'General Medical', isActive: true },
  { category: 'DIAGNOSIS', value: 'Surgical', isActive: true },
  { category: 'DIAGNOSIS', value: 'Cardiac', isActive: true },
  { category: 'DIAGNOSIS', value: 'Neurological', isActive: true },
  { category: 'DIAGNOSIS', value: 'Respiratory', isActive: true },
  { category: 'DIAGNOSIS', value: 'Trauma', isActive: true },
  
  // Mobility
  { category: 'MOBILITY', value: 'Ambulatory', isActive: true },
  { category: 'MOBILITY', value: 'Wheelchair', isActive: true },
  { category: 'MOBILITY', value: 'Stretcher', isActive: true },
  { category: 'MOBILITY', value: 'Critical Care Stretcher', isActive: true },
  
  // Urgency
  { category: 'URGENCY', value: 'Routine', isActive: true },
  { category: 'URGENCY', value: 'Urgent', isActive: true },
  { category: 'URGENCY', value: 'Emergency', isActive: true },
  { category: 'URGENCY', value: 'Stat', isActive: true },
  
  // Insurance
  { category: 'INSURANCE', value: 'Medicare', isActive: true },
  { category: 'INSURANCE', value: 'Medicaid', isActive: true },
  { category: 'INSURANCE', value: 'Private Insurance', isActive: true },
  { category: 'INSURANCE', value: 'Self-Pay', isActive: true },
];

async function syncDropdownOptions() {
  console.log('🔄 Syncing dropdown options to production database...\n');
  
  let synced = 0;
  for (const option of commonOptions) {
    try {
      const existing = await prisma.dropdownOption.findFirst({
        where: {
          category: option.category,
          value: option.value
        }
      });
      
      if (!existing) {
        await prisma.dropdownOption.create({ data: option });
        console.log(`✅ Added: ${option.category} - ${option.value}`);
        synced++;
      } else {
        console.log(`⏭️  Exists: ${option.category} - ${option.value}`);
      }
    } catch (error) {
      console.error(`❌ Error adding ${option.category} - ${option.value}:`, error.message);
    }
  }
  
  console.log(`\n✅ Synced ${synced} new options`);
}

syncDropdownOptions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

