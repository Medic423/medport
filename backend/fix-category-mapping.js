// Fix Category Mapping Issue
// Run with: node backend/fix-category-mapping.js
// This script fixes the category displayName and creates the missing secondary-insurance category

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

const prisma = new PrismaClient();

async function fixCategoryMapping() {
  console.log('🔧 Fixing Category Mapping Issue...\n');

  try {
    // Step 1: Fix the displayName of 'special-needs' category
    console.log('Step 1: Fixing special-needs displayName...');
    const updateResult = await prisma.$executeRaw`
      UPDATE "dropdown_categories"
      SET "displayName" = 'Special Needs',
          "updatedAt" = NOW()
      WHERE "slug" = 'special-needs'
    `;
    console.log(`✅ Updated ${updateResult} category record(s)\n`);

    // Step 2: Create 'secondary-insurance' category if it doesn't exist
    console.log('Step 2: Creating secondary-insurance category...');
    const insertResult = await prisma.$executeRaw`
      INSERT INTO "dropdown_categories" ("id", "slug", "displayName", "displayOrder", "isActive", "createdAt", "updatedAt")
      SELECT 
          gen_random_uuid()::text,
          'secondary-insurance',
          'Secondary Insurance',
          7,
          true,
          NOW(),
          NOW()
      WHERE NOT EXISTS (
          SELECT 1 FROM "dropdown_categories" WHERE slug = 'secondary-insurance'
      )
    `;
    console.log(`✅ Created ${insertResult} category record(s)\n`);

    // Step 3: Move insurance items from 'special-needs' to 'secondary-insurance'
    console.log('Step 3: Moving insurance items to secondary-insurance category...');
    
    // Get category IDs
    const secondaryInsurance = await prisma.dropdownCategory.findUnique({
      where: { slug: 'secondary-insurance' }
    });
    
    const specialNeeds = await prisma.dropdownCategory.findUnique({
      where: { slug: 'special-needs' }
    });

    if (!secondaryInsurance) {
      throw new Error('secondary-insurance category not found after creation');
    }

    if (!specialNeeds) {
      throw new Error('special-needs category not found');
    }

    // Move insurance-related options
    const insuranceValues = ['Medicare', 'Private', 'Medicaid', 'Aetna', 'Blue Cross Blue Shield', 'Cigna', 'Humana', 'UnitedHealthcare', 'Self-pay', 'Other'];
    
    const moveResult = await prisma.$executeRaw`
      UPDATE "dropdown_options"
      SET 
          "category" = 'secondary-insurance',
          "categoryId" = ${secondaryInsurance.id},
          "updatedAt" = NOW()
      WHERE "category" = 'special-needs'
        AND "value" = ANY(${insuranceValues})
    `;
    console.log(`✅ Moved ${moveResult} option record(s)\n`);

    // Step 4: Verify the changes
    console.log('Step 4: Verifying changes...\n');
    const categories = await prisma.$queryRaw`
      SELECT 
          slug,
          "displayName",
          "displayOrder",
          (SELECT COUNT(*) FROM "dropdown_options" WHERE "category" = dc.slug AND "isActive" = true) as option_count
      FROM "dropdown_categories" dc
      WHERE slug IN ('special-needs', 'secondary-insurance')
      ORDER BY "displayOrder"
    `;

    console.log('📊 Category Status:');
    console.table(categories);

    console.log('\n✅ Category mapping fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing category mapping:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixCategoryMapping()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error.message);
    process.exit(1);
  });

