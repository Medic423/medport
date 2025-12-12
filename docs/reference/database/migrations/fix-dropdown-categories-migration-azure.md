# Fix Dropdown Categories Migration in Azure
**Date:** December 9, 2025

## Problem

Backend deployment failed during `npx prisma migrate deploy` step.

## Most Likely Causes

1. **Migration not in `_prisma_migrations` table** - Prisma doesn't know about the new migration
2. **Migration SQL needs to be applied manually** - Table doesn't exist yet
3. **Migration already partially applied** - Table exists but migration not recorded

## Solution: Apply Migration Manually

### Step 1: Check Current State

Connect to Azure database via pgAdmin and check:

```sql
-- Check if migration is recorded
SELECT migration_name, finished_at 
FROM _prisma_migrations 
WHERE migration_name = '20251209140000_add_dropdown_categories';

-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'dropdown_categories';
```

### Step 2: Apply Migration SQL

1. **Open pgAdmin** → Connect to Azure database
2. **Open Query Tool** → Right-click database → Query Tool
3. **Open SQL file**: `backend/apply-dropdown-categories-migration.sql`
4. **Execute (F5)**

This will:
- Create `dropdown_categories` table
- Add `categoryId` column to `dropdown_options`
- Create foreign key constraint
- Seed initial 6 categories
- Link existing options to categories

### Step 3: Record Migration in History

After SQL executes successfully, mark migration as applied:

```sql
-- Mark migration as applied
INSERT INTO _prisma_migrations (
    id,
    checksum,
    migration_name,
    started_at,
    finished_at,
    applied_steps_count
)
VALUES (
    gen_random_uuid()::text,
    '',
    '20251209140000_add_dropdown_categories',
    NOW(),
    NOW(),
    1
)
ON CONFLICT (migration_name) DO NOTHING;
```

### Step 4: Verify

```sql
-- Check migration is recorded
SELECT migration_name, finished_at 
FROM _prisma_migrations 
WHERE migration_name = '20251209140000_add_dropdown_categories';

-- Check table exists
SELECT COUNT(*) FROM dropdown_categories;
-- Should return 6 (or more if you added categories)

-- Check categories are linked
SELECT COUNT(*) FROM dropdown_options WHERE "categoryId" IS NOT NULL;
-- Should return number of linked options
```

### Step 5: Re-run Deployment

After applying migration manually:
1. Go to GitHub Actions
2. Re-run the failed workflow
3. Migration step should now pass (migration already applied)

## Alternative: If Migration Already Exists

If the migration is already in `_prisma_migrations` but deployment still fails:

1. Check if table actually exists
2. If table doesn't exist, run `backend/apply-dropdown-categories-migration.sql`
3. If table exists, verify structure matches schema

## Troubleshooting

### Error: "relation dropdown_categories already exists"
- Table already exists - that's OK
- Just mark migration as applied (Step 3)

### Error: "column categoryId already exists"
- Column already exists - that's OK
- Migration SQL uses `IF NOT EXISTS` checks
- Just mark migration as applied (Step 3)

### Error: "foreign key constraint already exists"
- Constraint already exists - that's OK
- Just mark migration as applied (Step 3)

## Quick Fix Script

If you want to do everything at once:

```sql
-- Run the migration SQL
\i /path/to/backend/apply-dropdown-categories-migration.sql

-- Mark as applied
INSERT INTO _prisma_migrations (
    id, checksum, migration_name, started_at, finished_at, applied_steps_count
)
VALUES (
    gen_random_uuid()::text, '', '20251209140000_add_dropdown_categories', NOW(), NOW(), 1
)
ON CONFLICT (migration_name) DO NOTHING;
```

