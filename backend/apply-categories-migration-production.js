#!/usr/bin/env node
/**
 * Apply dropdown_categories migration to production/dev-swa databases
 * This script is idempotent - safe to run multiple times
 * 
 * Usage:
 *   # Production
 *   DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node apply-categories-migration-production.js
 * 
 *   # Dev-SWA
 *   DATABASE_URL="postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node apply-categories-migration-production.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🔄 Applying dropdown_categories migration...\n');

    // Step 1: Create table if it doesn't exist
    console.log('Step 1: Creating dropdown_categories table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "dropdown_categories" (
          "id" TEXT NOT NULL,
          "slug" TEXT NOT NULL,
          "displayName" TEXT NOT NULL,
          "displayOrder" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "dropdown_categories_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ Table created or already exists\n');

    // Step 2: Create unique index on slug if it doesn't exist
    console.log('Step 2: Creating unique index on slug...');
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "dropdown_categories_slug_key" 
      ON "dropdown_categories"("slug")
    `;
    console.log('✅ Index created or already exists\n');

    // Step 3: Add categoryId column to dropdown_options if it doesn't exist
    console.log('Step 3: Adding categoryId column to dropdown_options...');
    const columnExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'dropdown_options' 
        AND column_name = 'categoryId'
      ) as exists
    `;
    
    if (!columnExists[0]?.exists) {
      await prisma.$executeRaw`
        ALTER TABLE "dropdown_options" ADD COLUMN "categoryId" TEXT
      `;
      console.log('✅ categoryId column added\n');
    } else {
      console.log('✅ categoryId column already exists\n');
    }

    // Step 4: Add foreign key constraint if it doesn't exist
    console.log('Step 4: Adding foreign key constraint...');
    const fkExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'dropdown_options_categoryId_fkey'
      ) as exists
    `;
    
    if (!fkExists[0]?.exists) {
      await prisma.$executeRaw`
        ALTER TABLE "dropdown_options" 
        ADD CONSTRAINT "dropdown_options_categoryId_fkey" 
        FOREIGN KEY ("categoryId") 
        REFERENCES "dropdown_categories"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
      `;
      console.log('✅ Foreign key constraint added\n');
    } else {
      console.log('✅ Foreign key constraint already exists\n');
    }

    // Step 5: Seed initial categories (idempotent - uses ON CONFLICT)
    console.log('Step 5: Seeding initial categories...');
    await prisma.$executeRaw`
      INSERT INTO "dropdown_categories" ("id", "slug", "displayName", "displayOrder", "isActive", "createdAt", "updatedAt")
      VALUES
          (gen_random_uuid()::text, 'transport-level', 'Transport Levels', 1, true, NOW(), NOW()),
          (gen_random_uuid()::text, 'urgency', 'Urgency Levels', 2, true, NOW(), NOW()),
          (gen_random_uuid()::text, 'diagnosis', 'Primary Diagnosis', 3, true, NOW(), NOW()),
          (gen_random_uuid()::text, 'mobility', 'Mobility Levels', 4, true, NOW(), NOW()),
          (gen_random_uuid()::text, 'insurance', 'Insurance Companies', 5, true, NOW(), NOW()),
          (gen_random_uuid()::text, 'special-needs', 'Special Needs', 6, true, NOW(), NOW())
      ON CONFLICT ("slug") DO NOTHING
    `;
    console.log('✅ Categories seeded\n');

    // Step 6: Link existing dropdown_options to categories
    console.log('Step 6: Linking existing options to categories...');
    const linkedCount = await prisma.$executeRaw`
      UPDATE "dropdown_options" dopt
      SET "categoryId" = (
          SELECT dc.id
          FROM "dropdown_categories" dc
          WHERE dc.slug = dopt.category
          LIMIT 1
      )
      WHERE EXISTS (
          SELECT 1
          FROM "dropdown_categories" dc
          WHERE dc.slug = dopt.category
      ) AND dopt."categoryId" IS NULL
    `;
    console.log(`✅ Linked ${linkedCount} option(s) to categories\n`);

    // Step 7: Verify
    console.log('Step 7: Verifying migration...');
    const categories = await prisma.$queryRaw`
      SELECT slug, "displayName", "displayOrder", "isActive"
      FROM "dropdown_categories"
      ORDER BY "displayOrder"
    `;
    
    console.log('\n📊 Categories in database:');
    console.table(categories);
    
    const categoryCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "dropdown_categories"
    `;
    console.log(`\n✅ Migration complete! Found ${categoryCount[0]?.count || 0} categories in database.`);

  } catch (error) {
    console.error('❌ Error applying migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

