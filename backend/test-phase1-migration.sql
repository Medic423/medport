-- Test script for Phase 1 migration
-- Run this in pgAdmin or psql to verify the migration worked correctly

-- 1. Verify dropdown_categories table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'dropdown_categories';

-- 2. Verify all 6 categories were created
SELECT slug, "displayName", "displayOrder", "isActive"
FROM dropdown_categories
ORDER BY "displayOrder";

-- Expected: 6 rows
-- transport-level, urgency, diagnosis, mobility, insurance, special-needs

-- 3. Verify categoryId column was added to dropdown_options
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dropdown_options'
  AND column_name = 'categoryId';

-- Expected: categoryId column exists, nullable

-- 4. Verify foreign key constraint exists
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'dropdown_options'
  AND kcu.column_name = 'categoryId';

-- Expected: Foreign key from dropdown_options.categoryId to dropdown_categories.id

-- 5. Verify options are linked to categories (if any exist)
SELECT 
    do.category,
    do.value,
    dc.slug,
    dc."displayName",
    do."categoryId"
FROM dropdown_options do
LEFT JOIN dropdown_categories dc ON do."categoryId" = dc.id
LIMIT 10;

-- Expected: Options should have categoryId populated if migration ran correctly

-- 6. Count categories
SELECT COUNT(*) as category_count FROM dropdown_categories;
-- Expected: 6

-- 7. Verify unique constraint on slug
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'dropdown_categories'
  AND constraint_type = 'UNIQUE';
-- Expected: Unique constraint on slug

