-- Migration script to create dropdown tables in production
-- This script is idempotent - it can be run multiple times safely

-- Create dropdown_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS "dropdown_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dropdown_categories_pkey" PRIMARY KEY ("id")
);

-- Create unique index on slug if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS "dropdown_categories_slug_key" ON "dropdown_categories"("slug");

-- Create dropdown_options table if it doesn't exist
CREATE TABLE IF NOT EXISTS "dropdown_options" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" TEXT,

    CONSTRAINT "dropdown_options_pkey" PRIMARY KEY ("id")
);

-- Create unique index on category+value if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS "dropdown_options_category_value_key" ON "dropdown_options"("category", "value");

-- Add categoryId column to dropdown_options if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'dropdown_options' 
        AND column_name = 'categoryId'
    ) THEN
        ALTER TABLE "dropdown_options" ADD COLUMN "categoryId" TEXT;
    END IF;
END $$;

-- Create dropdown_category_defaults table if it doesn't exist
CREATE TABLE IF NOT EXISTS "dropdown_category_defaults" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dropdown_category_defaults_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes on dropdown_category_defaults if they don't exist
CREATE UNIQUE INDEX IF NOT EXISTS "dropdown_category_defaults_category_key" ON "dropdown_category_defaults"("category");
CREATE UNIQUE INDEX IF NOT EXISTS "dropdown_category_defaults_optionId_key" ON "dropdown_category_defaults"("optionId");

-- Add foreign key constraint for categoryId if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'dropdown_options_categoryId_fkey'
    ) THEN
        ALTER TABLE "dropdown_options" 
        ADD CONSTRAINT "dropdown_options_categoryId_fkey" 
        FOREIGN KEY ("categoryId") 
        REFERENCES "dropdown_categories"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for optionId if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'dropdown_category_defaults_optionId_fkey'
    ) THEN
        ALTER TABLE "dropdown_category_defaults" 
        ADD CONSTRAINT "dropdown_category_defaults_optionId_fkey" 
        FOREIGN KEY ("optionId") 
        REFERENCES "dropdown_options"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Seed initial categories (idempotent - uses ON CONFLICT)
INSERT INTO "dropdown_categories" ("id", "slug", "displayName", "displayOrder", "isActive", "createdAt", "updatedAt")
VALUES
    (gen_random_uuid()::text, 'transport-level', 'Transport Levels', 1, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'urgency', 'Urgency Levels', 2, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'diagnosis', 'Primary Diagnosis', 3, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'mobility', 'Mobility Levels', 4, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'insurance', 'Insurance Companies', 5, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'special-needs', 'Special Needs', 6, true, NOW(), NOW()),
    (gen_random_uuid()::text, 'secondary-insurance', 'Secondary Insurance', 7, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- Seed baseline urgency options (required by the backend code)
-- These are created if they don't exist
INSERT INTO "dropdown_options" ("id", "category", "value", "isActive", "createdAt", "updatedAt", "categoryId")
SELECT 
    gen_random_uuid()::text,
    'urgency',
    val,
    true,
    NOW(),
    NOW(),
    (SELECT id FROM "dropdown_categories" WHERE slug = 'urgency' LIMIT 1)
FROM (VALUES ('Routine'), ('Urgent'), ('Emergent')) AS t(val)
WHERE NOT EXISTS (
    SELECT 1 FROM "dropdown_options" 
    WHERE "category" = 'urgency' AND "value" = val
)
ON CONFLICT ("category", "value") DO NOTHING;

-- Update existing dropdown_options to link to categories
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
) AND dopt."categoryId" IS NULL;

-- Add trigger to update updatedAt timestamp for dropdown_categories
CREATE OR REPLACE FUNCTION update_dropdown_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_dropdown_categories_updated_at_trigger ON "dropdown_categories";
CREATE TRIGGER update_dropdown_categories_updated_at_trigger
    BEFORE UPDATE ON "dropdown_categories"
    FOR EACH ROW
    EXECUTE FUNCTION update_dropdown_categories_updated_at();

-- Add trigger to update updatedAt timestamp for dropdown_options
CREATE OR REPLACE FUNCTION update_dropdown_options_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_dropdown_options_updated_at_trigger ON "dropdown_options";
CREATE TRIGGER update_dropdown_options_updated_at_trigger
    BEFORE UPDATE ON "dropdown_options"
    FOR EACH ROW
    EXECUTE FUNCTION update_dropdown_options_updated_at();

-- Add trigger to update updatedAt timestamp for dropdown_category_defaults
CREATE OR REPLACE FUNCTION update_dropdown_category_defaults_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_dropdown_category_defaults_updated_at_trigger ON "dropdown_category_defaults";
CREATE TRIGGER update_dropdown_category_defaults_updated_at_trigger
    BEFORE UPDATE ON "dropdown_category_defaults"
    FOR EACH ROW
    EXECUTE FUNCTION update_dropdown_category_defaults_updated_at();

