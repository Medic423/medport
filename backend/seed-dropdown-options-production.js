// Script to seed dropdown options in production database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.TARGET_DB
    }
  }
});

const dropdownOptions = [
  // Insurance
  { category: 'insurance', value: 'Medicare' },
  { category: 'insurance', value: 'Medicaid' },
  { category: 'insurance', value: 'Aetna' },
  { category: 'insurance', value: 'Anthem Blue Cross Blue Shield' },
  { category: 'insurance', value: 'Blue Cross Blue Shield' },
  { category: 'insurance', value: 'Cigna' },
  { category: 'insurance', value: 'Humana' },
  { category: 'insurance', value: 'UnitedHealthcare' },
  { category: 'insurance', value: 'Private' },
  { category: 'insurance', value: 'Self-pay' },
  { category: 'insurance', value: 'Other' },
  
  // Diagnosis
  { category: 'diagnosis', value: 'Cardiac' },
  { category: 'diagnosis', value: 'Respiratory' },
  { category: 'diagnosis', value: 'Neurological' },
  { category: 'diagnosis', value: 'Trauma' },
  { category: 'diagnosis', value: 'Acute Myocardial Infarction' },
  { category: 'diagnosis', value: 'Stroke/CVA' },
  { category: 'diagnosis', value: 'Pneumonia' },
  { category: 'diagnosis', value: 'Congestive Heart Failure' },
  { category: 'diagnosis', value: 'COPD Exacerbation' },
  { category: 'diagnosis', value: 'Sepsis' },
  { category: 'diagnosis', value: 'Surgical Recovery' },
  { category: 'diagnosis', value: 'Dialysis' },
  { category: 'diagnosis', value: 'Oncology' },
  { category: 'diagnosis', value: 'Psychiatric Emergency' },
  { category: 'diagnosis', value: 'Other' },
  
  // Mobility
  { category: 'mobility', value: 'Ambulatory' },
  { category: 'mobility', value: 'Wheelchair' },
  { category: 'mobility', value: 'Stretcher' },
  { category: 'mobility', value: 'Bed-bound' },
  { category: 'mobility', value: 'Independent' },
  { category: 'mobility', value: 'Assistive Device Required' },
  { category: 'mobility', value: 'Wheelchair Bound' },
  { category: 'mobility', value: 'Bed Bound' },
  { category: 'mobility', value: 'Stretcher Required' },
  { category: 'mobility', value: 'Bariatric Equipment Required' },
  
  // Transport Level
  { category: 'transport-level', value: 'BLS' },
  { category: 'transport-level', value: 'ALS' },
  { category: 'transport-level', value: 'CCT' },
  { category: 'transport-level', value: 'BLS - Basic Life Support' },
  { category: 'transport-level', value: 'ALS - Advanced Life Support' },
  { category: 'transport-level', value: 'Critical Care' },
  { category: 'transport-level', value: 'Neonatal' },
  { category: 'transport-level', value: 'Bariatric' },
  { category: 'transport-level', value: 'Non-Emergency' },
  { category: 'transport-level', value: 'Other' },
  
  // Special Needs
  { category: 'special-needs', value: 'Bariatric Stretcher' },
  { category: 'special-needs', value: 'Oxygen Required' },
  { category: 'special-needs', value: 'Monitoring Required' },
  { category: 'special-needs', value: 'Ventilator Required' },
];

async function seedDropdownOptions() {
  try {
    console.log('🌱 Seeding dropdown options...');
    
    let created = 0;
    let skipped = 0;
    
    for (const option of dropdownOptions) {
      // Get category ID for linking
      const category = await prisma.dropdownCategory.findUnique({
        where: { slug: option.category },
      });
      
      if (!category) {
        console.warn(`⚠️  Category "${option.category}" not found, skipping option "${option.value}"`);
        skipped++;
        continue;
      }
      
      try {
        // Use raw SQL to handle unique constraint properly
        const result = await prisma.$executeRaw`
          INSERT INTO dropdown_options (id, category, "categoryId", value, "isActive", "createdAt", "updatedAt")
          VALUES (
            gen_random_uuid()::text,
            ${option.category},
            ${category.id},
            ${option.value},
            true,
            NOW(),
            NOW()
          )
          ON CONFLICT (category, value) DO UPDATE SET
            "isActive" = true,
            "categoryId" = EXCLUDED."categoryId",
            "updatedAt" = NOW()
        `;
        
        if (result > 0) {
          created++;
          console.log(`✅ ${option.category}: ${option.value}`);
        } else {
          skipped++;
        }
      } catch (error) {
        if (error.code === 'P2002' || error.message?.includes('unique')) {
          // Already exists, skip
          skipped++;
        } else {
          console.error(`❌ Error creating ${option.category}: ${option.value}`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Seeding complete!`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped} (already exist)`);
    
    // Set default for urgency (Routine)
    const urgencyCategory = await prisma.dropdownCategory.findUnique({
      where: { slug: 'urgency' }
    });
    
    if (urgencyCategory) {
      const routineOption = await prisma.dropdownOption.findFirst({
        where: {
          category: 'urgency',
          value: 'Routine'
        }
      });
      
      if (routineOption) {
        try {
          await prisma.categoryDefault.upsert({
            where: { category: 'urgency' },
            update: { optionId: routineOption.id },
            create: {
              id: `default-urgency-${Date.now()}`,
              category: 'urgency',
              optionId: routineOption.id
            }
          });
          console.log(`✅ Set default for urgency: Routine`);
        } catch (error) {
          console.warn(`⚠️  Could not set urgency default:`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error seeding dropdown options:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDropdownOptions();

