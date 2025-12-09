-- Migration: Add Dropdown Categories
-- Date: December 9, 2025
-- File: backend/prisma/migrations/20251209140000_add_dropdown_categories/migration.sql

-- CreateTable: Add dropdown_categories table
-- This table stores the category definitions (e.g., transport-level, urgency, etc.)
-- Categories can be managed through the UI, allowing users to add/edit/delete categories
CREATE TABLE IF NOT EXISTS "dropdown_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dropdown_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Ensure slug is unique
CREATE UNIQUE INDEX IF NOT EXISTS "dropdown_categories_slug_key" ON "dropdown_categories"("slug");

-- AlterTable: Add categoryId to dropdown_options (nullable for backward compatibility)
-- This allows linking options to categories while maintaining the existing category string field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dropdown_options' AND column_name = 'categoryId'
    ) THEN
        ALTER TABLE "dropdown_options" ADD COLUMN "categoryId" TEXT;
    END IF;
END $$;

-- AddForeignKey: Link dropdown_options to dropdown_categories
-- Using SET NULL on delete to preserve options if category is deleted (soft delete recommended instead)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'dropdown_options_categoryId_fkey'
    ) THEN
        ALTER TABLE "dropdown_options" ADD CONSTRAINT "dropdown_options_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "dropdown_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Seed initial categories (only if they don't exist)
-- These match the existing hardcoded categories in the application
INSERT INTO "dropdown_categories" ("id", "slug", "displayName", "displayOrder", "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'transport-level',
    'Transport Levels',
    1,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "dropdown_categories" WHERE slug = 'transport-level');

INSERT INTO "dropdown_categories" ("id", "slug", "displayName", "displayOrder", "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'urgency',
    'Urgency Levels',
    2,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "dropdown_categories" WHERE slug = 'urgency');

INSERT INTO "dropdown_categories" ("id", "slug", "displayName", "displayOrder", "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'diagnosis',
    'Primary Diagnosis',
    3,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "dropdown_categories" WHERE slug = 'diagnosis');

INSERT INTO "dropdown_categories" ("id", "slug", "displayName", "displayOrder", "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'mobility',
    'Mobility Levels',
    4,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "dropdown_categories" WHERE slug = 'mobility');

INSERT INTO "dropdown_categories" ("id", "slug", "displayName", "displayOrder", "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'insurance',
    'Insurance Companies',
    5,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "dropdown_categories" WHERE slug = 'insurance');

INSERT INTO "dropdown_categories" ("id", "slug", "displayName", "displayOrder", "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'special-needs',
    'Secondary Insurance',
    6,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "dropdown_categories" WHERE slug = 'special-needs');

-- Update existing dropdown_options to link to categories
-- Match options by category string to category slug
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
)
AND dopt."categoryId" IS NULL;

-- Verification query
SELECT 
    'Migration Complete' as status,
    (SELECT COUNT(*) FROM "dropdown_categories") as category_count,
    (SELECT COUNT(*) FROM "dropdown_options" WHERE "categoryId" IS NOT NULL) as linked_options_count;

