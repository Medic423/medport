-- Fix Category Mapping Issue
-- Date: December 10, 2025
-- Problem: 'special-needs' category has wrong displayName ('Secondary Insurance' instead of 'Special Needs')
--          Missing 'secondary-insurance' category for insurance companies
-- Solution: Fix displayName and create missing category

-- Step 1: Fix the displayName of 'special-needs' category
UPDATE "dropdown_categories"
SET "displayName" = 'Special Needs',
    "updatedAt" = NOW()
WHERE "slug" = 'special-needs';

-- Step 2: Create 'secondary-insurance' category if it doesn't exist
INSERT INTO "dropdown_categories" ("id", "slug", "displayName", "displayOrder", "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    'secondary-insurance',
    'Secondary Insurance',
    7, -- After special-needs (6)
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM "dropdown_categories" WHERE slug = 'secondary-insurance'
);

-- Step 3: Move insurance items from 'special-needs' to 'secondary-insurance' if they exist
-- First, get the category IDs
DO $$
DECLARE
    secondary_insurance_id TEXT;
    special_needs_id TEXT;
BEGIN
    -- Get category IDs
    SELECT id INTO secondary_insurance_id FROM "dropdown_categories" WHERE slug = 'secondary-insurance';
    SELECT id INTO special_needs_id FROM "dropdown_categories" WHERE slug = 'special-needs';
    
    -- Move insurance-related options from special-needs to secondary-insurance
    -- These are insurance companies that might have been incorrectly placed
    UPDATE "dropdown_options"
    SET 
        "category" = 'secondary-insurance',
        "categoryId" = secondary_insurance_id,
        "updatedAt" = NOW()
    WHERE "category" = 'special-needs'
      AND "value" IN ('Medicare', 'Private', 'Medicaid', 'Aetna', 'Blue Cross Blue Shield', 'Cigna', 'Humana', 'UnitedHealthcare', 'Self-pay', 'Other')
      AND secondary_insurance_id IS NOT NULL;
END $$;

-- Step 4: Verify the changes
SELECT 
    slug,
    "displayName",
    "displayOrder",
    (SELECT COUNT(*) FROM "dropdown_options" WHERE "category" = dc.slug AND "isActive" = true) as option_count
FROM "dropdown_categories" dc
WHERE slug IN ('special-needs', 'secondary-insurance')
ORDER BY "displayOrder";

