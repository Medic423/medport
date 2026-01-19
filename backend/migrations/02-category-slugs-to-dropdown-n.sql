-- Category Options Fix: Rename slugs to dropdown-1 through dropdown-7
-- Date: 2026-01-16
-- Purpose: Lock down categories to fixed slugs to prevent form failures
-- Note: All 7 categories are kept, including special-needs (dropdown-7) for checkbox configuration
--
-- IMPORTANT: Run 01-document-current-state.sql FIRST to document current state
-- IMPORTANT: Create full database backup before running this script
--
-- Migration Mapping:
-- transport-level → dropdown-1 (Transport Level)
-- urgency → dropdown-2 (Urgency Level)
-- diagnosis → dropdown-3 (Diagnosis)
-- mobility → dropdown-4 (Mobility Level)
-- insurance → dropdown-5 (Insurance Company)
-- secondary-insurance → dropdown-6 (Secondary Insurance)
-- special-needs → dropdown-7 (Special Needs - checkboxes)

BEGIN;

-- Step 1: Update dropdown_categories slugs
UPDATE dropdown_categories SET slug = 'dropdown-1' WHERE slug = 'transport-level';
UPDATE dropdown_categories SET slug = 'dropdown-2' WHERE slug = 'urgency';
UPDATE dropdown_categories SET slug = 'dropdown-3' WHERE slug = 'diagnosis';
UPDATE dropdown_categories SET slug = 'dropdown-4' WHERE slug = 'mobility';
UPDATE dropdown_categories SET slug = 'dropdown-5' WHERE slug = 'insurance';
UPDATE dropdown_categories SET slug = 'dropdown-6' WHERE slug = 'secondary-insurance';
UPDATE dropdown_categories SET slug = 'dropdown-7' WHERE slug = 'special-needs';

-- Step 2: Update dropdown_options category field (string field)
UPDATE dropdown_options SET category = 'dropdown-1' WHERE category = 'transport-level';
UPDATE dropdown_options SET category = 'dropdown-2' WHERE category = 'urgency';
UPDATE dropdown_options SET category = 'dropdown-3' WHERE category = 'diagnosis';
UPDATE dropdown_options SET category = 'dropdown-4' WHERE category = 'mobility';
UPDATE dropdown_options SET category = 'dropdown-5' WHERE category = 'insurance';
UPDATE dropdown_options SET category = 'dropdown-6' WHERE category = 'secondary-insurance';
UPDATE dropdown_options SET category = 'dropdown-7' WHERE category = 'special-needs';

-- Step 3: Update dropdown_options categoryId field (foreign key field)
-- First, get the new category IDs
DO $$
DECLARE
    cat1_id TEXT;
    cat2_id TEXT;
    cat3_id TEXT;
    cat4_id TEXT;
    cat5_id TEXT;
    cat6_id TEXT;
    cat7_id TEXT;
BEGIN
    -- Get category IDs after slug update
    SELECT id INTO cat1_id FROM dropdown_categories WHERE slug = 'dropdown-1';
    SELECT id INTO cat2_id FROM dropdown_categories WHERE slug = 'dropdown-2';
    SELECT id INTO cat3_id FROM dropdown_categories WHERE slug = 'dropdown-3';
    SELECT id INTO cat4_id FROM dropdown_categories WHERE slug = 'dropdown-4';
    SELECT id INTO cat5_id FROM dropdown_categories WHERE slug = 'dropdown-5';
    SELECT id INTO cat6_id FROM dropdown_categories WHERE slug = 'dropdown-6';
    SELECT id INTO cat7_id FROM dropdown_categories WHERE slug = 'dropdown-7';
    
    -- Update categoryId for options that were linked via categoryId
    UPDATE dropdown_options SET "categoryId" = cat1_id WHERE category = 'dropdown-1' AND "categoryId" IS NOT NULL;
    UPDATE dropdown_options SET "categoryId" = cat2_id WHERE category = 'dropdown-2' AND "categoryId" IS NOT NULL;
    UPDATE dropdown_options SET "categoryId" = cat3_id WHERE category = 'dropdown-3' AND "categoryId" IS NOT NULL;
    UPDATE dropdown_options SET "categoryId" = cat4_id WHERE category = 'dropdown-4' AND "categoryId" IS NOT NULL;
    UPDATE dropdown_options SET "categoryId" = cat5_id WHERE category = 'dropdown-5' AND "categoryId" IS NOT NULL;
    UPDATE dropdown_options SET "categoryId" = cat6_id WHERE category = 'dropdown-6' AND "categoryId" IS NOT NULL;
    UPDATE dropdown_options SET "categoryId" = cat7_id WHERE category = 'dropdown-7' AND "categoryId" IS NOT NULL;
END $$;

-- Step 4: Verify results
-- Check categories
SELECT slug, "displayName", "displayOrder" 
FROM dropdown_categories 
ORDER BY "displayOrder";

-- Check option counts per category
SELECT category, COUNT(*) as option_count 
FROM dropdown_options 
GROUP BY category 
ORDER BY category;

-- Check for any orphaned options (should return 0 rows)
SELECT 
    opt.id,
    opt.category,
    opt.value,
    CASE 
        WHEN dc.id IS NULL THEN 'ORPHANED'
        ELSE 'OK'
    END as status
FROM dropdown_options opt
LEFT JOIN dropdown_categories dc ON opt.category = dc.slug OR opt."categoryId" = dc.id
WHERE dc.id IS NULL;

COMMIT;

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================
-- Uncomment and run this section if you need to rollback the changes
--
-- BEGIN;
--
-- -- Rollback dropdown_categories slugs
-- UPDATE dropdown_categories SET slug = 'transport-level' WHERE slug = 'dropdown-1';
-- UPDATE dropdown_categories SET slug = 'urgency' WHERE slug = 'dropdown-2';
-- UPDATE dropdown_categories SET slug = 'diagnosis' WHERE slug = 'dropdown-3';
-- UPDATE dropdown_categories SET slug = 'mobility' WHERE slug = 'dropdown-4';
-- UPDATE dropdown_categories SET slug = 'insurance' WHERE slug = 'dropdown-5';
-- UPDATE dropdown_categories SET slug = 'secondary-insurance' WHERE slug = 'dropdown-6';
-- UPDATE dropdown_categories SET slug = 'special-needs' WHERE slug = 'dropdown-7';
--
-- -- Rollback dropdown_options category field
-- UPDATE dropdown_options SET category = 'transport-level' WHERE category = 'dropdown-1';
-- UPDATE dropdown_options SET category = 'urgency' WHERE category = 'dropdown-2';
-- UPDATE dropdown_options SET category = 'diagnosis' WHERE category = 'dropdown-3';
-- UPDATE dropdown_options SET category = 'mobility' WHERE category = 'dropdown-4';
-- UPDATE dropdown_options SET category = 'insurance' WHERE category = 'dropdown-5';
-- UPDATE dropdown_options SET category = 'secondary-insurance' WHERE category = 'dropdown-6';
-- UPDATE dropdown_options SET category = 'special-needs' WHERE category = 'dropdown-7';
--
-- -- Rollback dropdown_options categoryId field
-- DO $$
-- DECLARE
--     cat1_id TEXT;
--     cat2_id TEXT;
--     cat3_id TEXT;
--     cat4_id TEXT;
--     cat5_id TEXT;
--     cat6_id TEXT;
--     cat7_id TEXT;
-- BEGIN
--     SELECT id INTO cat1_id FROM dropdown_categories WHERE slug = 'transport-level';
--     SELECT id INTO cat2_id FROM dropdown_categories WHERE slug = 'urgency';
--     SELECT id INTO cat3_id FROM dropdown_categories WHERE slug = 'diagnosis';
--     SELECT id INTO cat4_id FROM dropdown_categories WHERE slug = 'mobility';
--     SELECT id INTO cat5_id FROM dropdown_categories WHERE slug = 'insurance';
--     SELECT id INTO cat6_id FROM dropdown_categories WHERE slug = 'secondary-insurance';
--     SELECT id INTO cat7_id FROM dropdown_categories WHERE slug = 'special-needs';
--     
--     UPDATE dropdown_options SET "categoryId" = cat1_id WHERE category = 'transport-level' AND "categoryId" IS NOT NULL;
--     UPDATE dropdown_options SET "categoryId" = cat2_id WHERE category = 'urgency' AND "categoryId" IS NOT NULL;
--     UPDATE dropdown_options SET "categoryId" = cat3_id WHERE category = 'diagnosis' AND "categoryId" IS NOT NULL;
--     UPDATE dropdown_options SET "categoryId" = cat4_id WHERE category = 'mobility' AND "categoryId" IS NOT NULL;
--     UPDATE dropdown_options SET "categoryId" = cat5_id WHERE category = 'insurance' AND "categoryId" IS NOT NULL;
--     UPDATE dropdown_options SET "categoryId" = cat6_id WHERE category = 'secondary-insurance' AND "categoryId" IS NOT NULL;
--     UPDATE dropdown_options SET "categoryId" = cat7_id WHERE category = 'special-needs' AND "categoryId" IS NOT NULL;
-- END $$;
--
-- COMMIT;
