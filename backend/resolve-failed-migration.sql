-- Resolve Failed Migration: 20251209140000_add_dropdown_categories
-- Run this in pgAdmin connected to Azure database

-- Step 1: Check current migration status
SELECT 
    migration_name, 
    started_at, 
    finished_at, 
    rolled_back_at,
    logs
FROM _prisma_migrations 
WHERE migration_name = '20251209140000_add_dropdown_categories';

-- Step 2: Check if table exists (migration might have partially succeeded)
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dropdown_categories') 
        THEN 'Table EXISTS' 
        ELSE 'Table DOES NOT EXIST' 
    END as table_status;

-- Step 3: Check if categoryId column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'dropdown_options' AND column_name = 'categoryId'
        ) 
        THEN 'Column EXISTS' 
        ELSE 'Column DOES NOT EXIST' 
    END as column_status;

-- Step 4: Based on results above, choose ONE of the following:

-- OPTION A: If table/column DON'T exist - Rollback to allow retry
-- Uncomment the line below if nothing was created:
-- UPDATE _prisma_migrations 
-- SET rolled_back_at = NOW()
-- WHERE migration_name = '20251209140000_add_dropdown_categories'
-- AND finished_at IS NULL;

-- OPTION B: If table/column EXISTS - Mark as completed
-- Uncomment the lines below if migration was actually applied:
-- UPDATE _prisma_migrations 
-- SET finished_at = NOW(),
--     applied_steps_count = 1
-- WHERE migration_name = '20251209140000_add_dropdown_categories'
-- AND finished_at IS NULL;

-- Step 5: Verify resolution
SELECT 
    migration_name, 
    started_at, 
    finished_at, 
    rolled_back_at
FROM _prisma_migrations 
WHERE migration_name = '20251209140000_add_dropdown_categories';

-- After running this, re-run GitHub Actions workflow

