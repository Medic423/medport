# Fix P3009 Failed Migration Error
**Date:** December 9, 2025

## Error

```
Error: P3009
migrate found failed migrations in the target database, new migrations will not be applied.
The `20251209140000_add_dropdown_categories` migration started at 2025-12-09 18:52:09.532 UTC failed
```

## Problem

The migration was started but failed partway through. Prisma won't apply new migrations until this failed migration is resolved.

## Solution: Resolve the Failed Migration

### Step 1: Check Current State

Connect to Azure database via pgAdmin and check:

```sql
-- Check migration status
SELECT migration_name, started_at, finished_at, rolled_back_at, logs
FROM _prisma_migrations 
WHERE migration_name = '20251209140000_add_dropdown_categories';

-- Check if table exists (migration might have partially succeeded)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'dropdown_categories';

-- Check if categoryId column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'dropdown_options' 
AND column_name = 'categoryId';
```

### Step 2: Determine What Happened

**Scenario A: Migration Partially Applied (Table/Column Exists)**
- Table exists but migration failed → Mark as rolled back, then reapply

**Scenario B: Migration Not Applied (Nothing Exists)**
- Nothing was created → Mark as rolled back, then reapply

**Scenario C: Migration Fully Applied (Everything Exists)**
- Everything exists but migration marked as failed → Mark as completed

### Step 3: Resolve Based on Scenario

#### If Migration Partially Applied or Not Applied:

**Option 1: Rollback and Reapply (Recommended)**

```sql
-- Mark migration as rolled back
UPDATE _prisma_migrations 
SET rolled_back_at = NOW()
WHERE migration_name = '20251209140000_add_dropdown_categories';

-- Clean up any partial changes (if needed)
DROP TABLE IF EXISTS "dropdown_categories" CASCADE;
ALTER TABLE "dropdown_options" DROP COLUMN IF EXISTS "categoryId";
```

Then:
1. Re-run GitHub Actions workflow
2. If it fails again, apply migration manually via pgAdmin

**Option 2: Mark as Rolled Back (Let Prisma Retry)**

```sql
-- Mark migration as rolled back
UPDATE _prisma_migrations 
SET rolled_back_at = NOW()
WHERE migration_name = '20251209140000_add_dropdown_categories';
```

Then re-run GitHub Actions workflow.

#### If Migration Fully Applied:

```sql
-- Mark migration as completed
UPDATE _prisma_migrations 
SET finished_at = NOW(),
    applied_steps_count = 1
WHERE migration_name = '20251209140000_add_dropdown_categories'
AND finished_at IS NULL;
```

### Step 4: If Re-running Fails, Apply Manually

If the migration keeps failing, apply it manually:

1. **Open pgAdmin** → Connect to Azure database
2. **Open Query Tool**
3. **Run**: `backend/apply-dropdown-categories-migration.sql`
4. **Mark as completed**:

```sql
-- Delete the failed/rolled back record
DELETE FROM _prisma_migrations 
WHERE migration_name = '20251209140000_add_dropdown_categories';

-- Insert as completed
INSERT INTO _prisma_migrations (
    id, checksum, migration_name, started_at, finished_at, applied_steps_count
)
VALUES (
    gen_random_uuid()::text, 
    '', 
    '20251209140000_add_dropdown_categories', 
    NOW(), 
    NOW(), 
    1
);
```

### Step 5: Verify

```sql
-- Check migration status
SELECT migration_name, started_at, finished_at, rolled_back_at
FROM _prisma_migrations 
WHERE migration_name = '20251209140000_add_dropdown_categories';

-- Should show finished_at IS NOT NULL and rolled_back_at IS NULL

-- Verify table exists
SELECT COUNT(*) FROM dropdown_categories;
-- Should return 6 or more

-- Verify options are linked
SELECT COUNT(*) FROM dropdown_options WHERE "categoryId" IS NOT NULL;
```

## Quick Fix Script

If you want to do everything at once (rollback and mark for retry):

```sql
-- Rollback the failed migration
UPDATE _prisma_migrations 
SET rolled_back_at = NOW()
WHERE migration_name = '20251209140000_add_dropdown_categories'
AND finished_at IS NULL;

-- Verify
SELECT migration_name, started_at, finished_at, rolled_back_at
FROM _prisma_migrations 
WHERE migration_name = '20251209140000_add_dropdown_categories';
```

Then re-run GitHub Actions workflow.

## Alternative: Delete and Let Prisma Retry

If you want to completely remove the failed migration record:

```sql
-- Delete failed migration record
DELETE FROM _prisma_migrations 
WHERE migration_name = '20251209140000_add_dropdown_categories'
AND finished_at IS NULL;

-- Clean up any partial changes
DROP TABLE IF EXISTS "dropdown_categories" CASCADE;
ALTER TABLE "dropdown_options" DROP COLUMN IF EXISTS "categoryId";
```

Then re-run GitHub Actions workflow - Prisma will try again from scratch.

