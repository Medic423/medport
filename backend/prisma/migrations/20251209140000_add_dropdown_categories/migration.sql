-- CreateTable: Add dropdown_categories table
-- This table stores the category definitions (e.g., transport-level, urgency, etc.)
-- Categories can be managed through the UI, allowing users to add/edit/delete categories
CREATE TABLE "dropdown_categories" (
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
CREATE UNIQUE INDEX "dropdown_categories_slug_key" ON "dropdown_categories"("slug");

-- AlterTable: Add categoryId to dropdown_options (nullable for backward compatibility)
-- This allows linking options to categories while maintaining the existing category string field
ALTER TABLE "dropdown_options" ADD COLUMN "categoryId" TEXT;

-- AddForeignKey: Link dropdown_options to dropdown_categories
-- Using SET NULL on delete to preserve options if category is deleted (soft delete recommended instead)
ALTER TABLE "dropdown_options" ADD CONSTRAINT "dropdown_options_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "dropdown_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed initial categories
-- These match the existing hardcoded categories in the application
INSERT INTO "dropdown_categories" ("id", "slug", "displayName", "displayOrder", "isActive", "createdAt", "updatedAt")
VALUES
    (gen_random_uuid()::text, 'transport-level', 'Transport Levels', 1, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'urgency', 'Urgency Levels', 2, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'diagnosis', 'Primary Diagnosis', 3, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'mobility', 'Mobility Levels', 4, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'insurance', 'Insurance Companies', 5, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'special-needs', 'Secondary Insurance', 6, true, NOW(), NOW());

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
);

