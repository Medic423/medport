const { PrismaClient } = require('@prisma/hospital');

const prisma = new PrismaClient();

async function seedDropdownOptions() {
  try {
    console.log('🌱 Seeding dropdown options...');

    // Insurance companies
    const insuranceOptions = [
      'Aetna',
      'Anthem Blue Cross Blue Shield',
      'Blue Cross Blue Shield',
      'Cigna',
      'Humana',
      'Kaiser Permanente',
      'Medicare',
      'Medicaid',
      'UnitedHealthcare',
      'AARP',
      'Tricare',
      'Other'
    ];

    // Primary diagnosis options
    const diagnosisOptions = [
      'Acute Myocardial Infarction',
      'Stroke/CVA',
      'Pneumonia',
      'Congestive Heart Failure',
      'COPD Exacerbation',
      'Sepsis',
      'Trauma',
      'Surgical Recovery',
      'Dialysis',
      'Oncology',
      'Psychiatric Emergency',
      'Other'
    ];

    // Mobility levels
    const mobilityOptions = [
      'Independent',
      'Assistive Device Required',
      'Wheelchair Bound',
      'Bed Bound',
      'Stretcher Required',
      'Bariatric Equipment Required'
    ];

    // Transport levels
    const transportLevelOptions = [
      'BLS - Basic Life Support',
      'ALS - Advanced Life Support',
      'Critical Care',
      'Neonatal',
      'Bariatric',
      'Non-Emergency'
    ];

    // Urgency levels
    const urgencyOptions = [
      'Emergency',
      'Urgent',
      'Routine',
      'Scheduled',
      'Discharge'
    ];

    // Create all options
    const allOptions = [
      ...insuranceOptions.map(value => ({ category: 'insurance', value })),
      ...diagnosisOptions.map(value => ({ category: 'diagnosis', value })),
      ...mobilityOptions.map(value => ({ category: 'mobility', value })),
      ...transportLevelOptions.map(value => ({ category: 'transport-level', value })),
      ...urgencyOptions.map(value => ({ category: 'urgency', value }))
    ];

    // Insert options
    for (const option of allOptions) {
      await prisma.dropdownOption.upsert({
        where: {
          category_value: {
            category: option.category,
            value: option.value
          }
        },
        update: {
          isActive: true
        },
        create: {
          category: option.category,
          value: option.value,
          isActive: true
        }
      });
    }

    console.log('✅ Dropdown options seeded successfully!');
    console.log(`   - Insurance: ${insuranceOptions.length} options`);
    console.log(`   - Diagnosis: ${diagnosisOptions.length} options`);
    console.log(`   - Mobility: ${mobilityOptions.length} options`);
    console.log(`   - Transport Level: ${transportLevelOptions.length} options`);
    console.log(`   - Urgency: ${urgencyOptions.length} options`);

  } catch (error) {
    console.error('❌ Error seeding dropdown options:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDropdownOptions();
