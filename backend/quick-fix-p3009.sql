-- Quick Fix for P3009 Failed Migration
-- Run this in pgAdmin connected to Azure database

-- This will rollback the failed migration, allowing Prisma to retry
UPDATE _prisma_migrations 
SET rolled_back_at = NOW()
WHERE migration_name = '20251209140000_add_dropdown_categories'
AND finished_at IS NULL;

-- Verify it worked
SELECT 
    migration_name, 
    started_at, 
    finished_at, 
    rolled_back_at
FROM _prisma_migrations 
WHERE migration_name = '20251209140000_add_dropdown_categories';

-- After running this, re-run GitHub Actions workflow
-- If it fails again, apply migration manually using:
-- backend/apply-dropdown-categories-migration.sql

