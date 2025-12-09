# Database Migration Application Guide

**Migration:** `20251209140000_add_dropdown_categories`  
**Date:** December 9, 2025

## Migration Overview

This migration:
1. Creates `dropdown_categories` table
2. Adds `categoryId` column to `dropdown_options` table
3. Creates foreign key relationship
4. Seeds 6 initial categories
5. Links existing options to categories

## Pre-Migration Checklist

- [ ] Backup Azure database (recommended)
- [ ] Verify connection to Azure PostgreSQL
- [ ] Review migration SQL
- [ ] Ensure no active transactions on `dropdown_options` table

## Application Steps

### Step 1: Connect to Azure PostgreSQL

1. Open **pgAdmin 4**
2. Connect to Azure PostgreSQL server:
   - **Host:** `traccems-dev-pgsql.postgres.database.azure.com`
   - **Port:** `5432`
   - **Database:** `postgres`
   - **Username:** `traccems_admin`
   - **Password:** (your password)

### Step 2: Open Query Tool

1. Right-click on database `postgres`
2. Select **Query Tool**
3. Verify you're connected

### Step 3: Review Migration SQL

The migration SQL is located at:
```
backend/prisma/migrations/20251209140000_add_dropdown_categories/migration.sql
```

**Key Operations:**
- Creates `dropdown_categories` table
- Adds `categoryId` column (nullable)
- Creates foreign key
- Inserts 6 categories
- Updates existing options to link to categories

### Step 4: Apply Migration

1. **Copy** the entire contents of `migration.sql`
2. **Paste** into Query Tool
3. **Execute** (F5 or click Execute button)
4. **Verify** no errors

**Expected Output:**
- `CREATE TABLE` - Success
- `CREATE INDEX` - Success  
- `ALTER TABLE` - Success
- `ALTER TABLE ADD CONSTRAINT` - Success
- `INSERT` - 6 rows affected
- `UPDATE` - N rows affected (depends on existing options)

### Step 5: Verify Migration

Run verification queries from `backend/test-phase1-migration.sql`:

```sql
-- 1. Verify table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'dropdown_categories';
-- Expected: 1 row

-- 2. Verify 6 categories created
SELECT slug, "displayName", "displayOrder", "isActive"
FROM dropdown_categories
ORDER BY "displayOrder";
-- Expected: 6 rows

-- 3. Verify categoryId column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dropdown_options'
  AND column_name = 'categoryId';
-- Expected: categoryId column exists, nullable

-- 4. Verify foreign key exists
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'dropdown_options'
  AND kcu.column_name = 'categoryId';
-- Expected: Foreign key constraint exists

-- 5. Verify options are linked (if any exist)
SELECT 
    do.category,
    do.value,
    dc.slug,
    dc."displayName",
    do."categoryId"
FROM dropdown_options do
LEFT JOIN dropdown_categories dc ON do."categoryId" = dc.id
LIMIT 10;
-- Expected: Options should have categoryId populated
```

## Troubleshooting

### Error: Table already exists
- **Solution:** Migration may have been partially applied. Check if table exists and skip creation.

### Error: Column already exists
- **Solution:** `categoryId` column may already exist. Check and skip if present.

### Error: Foreign key constraint fails
- **Solution:** Ensure categories are created before foreign key constraint.

### Error: gen_random_uuid() not available
- **Solution:** PostgreSQL version issue. Use `uuid_generate_v4()` or manual UUIDs instead.

## Post-Migration

After successful migration:
1. ✅ Verify all 6 categories exist
2. ✅ Verify options are linked (if any)
3. ✅ Test backend endpoints
4. ✅ Test frontend UI
5. ✅ Run end-to-end tests

## Rollback (if needed)

If migration needs to be rolled back:

```sql
-- Remove foreign key
ALTER TABLE "dropdown_options" DROP CONSTRAINT IF EXISTS "dropdown_options_categoryId_fkey";

-- Remove categoryId column
ALTER TABLE "dropdown_options" DROP COLUMN IF EXISTS "categoryId";

-- Drop categories table
DROP TABLE IF EXISTS "dropdown_categories";
```

**Note:** This will remove all category data. Only use if migration was just applied and no data was added.

