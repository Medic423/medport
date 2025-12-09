# Fix Missing Columns Error in Azure Database
**Last Updated:** December 8, 2025

## Problem

**Error:** `The column 'center_users.deletedAt' does not exist in the current database.`

**Root Cause:**
- Migration `20251204101500_add_user_deletion_fields` was baselined (marked as applied)
- But the actual SQL was never executed on Azure database
- Database schema doesn't match Prisma schema
- Prisma expects columns that don't exist

## Solution: Apply Missing Migrations

We need to actually run the migration SQL to add the missing columns.

### Step 1: Apply User Deletion Fields Migration

1. **Open pgAdmin** (already connected to Azure database)

2. **Open Query Tool:**
   - Right-click **postgres** database → **Query Tool**

3. **Open SQL file:**
   - File → Open
   - Navigate to: `backend/apply-user-deletion-fields-migration.sql`
   - Or copy/paste the SQL

4. **Execute (F5)**

5. **Verify:**
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name IN ('center_users', 'healthcare_users', 'ems_users')
     AND column_name IN ('deletedAt', 'isDeleted');
   ```
   Should show 6 rows (2 columns × 3 tables)

### Step 2: Apply Availability Status Migration

1. **In same Query Tool** (or new one)

2. **Open SQL file:**
   - File → Open
   - Navigate to: `backend/apply-availability-status-migration.sql`
   - Or copy/paste the SQL

3. **Execute (F5)**

4. **Verify:**
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'ems_agencies'
     AND column_name = 'availabilityStatus';
   ```
   Should show 1 row

### Step 3: Verify All Columns Exist

Run this comprehensive check:

```sql
-- Check all user deletion fields
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('center_users', 'healthcare_users', 'ems_users')
  AND column_name IN ('deletedAt', 'isDeleted')
ORDER BY table_name, column_name;

-- Check availability status field
SELECT 
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'ems_agencies'
  AND column_name = 'availabilityStatus';
```

**Expected Results:**
- `center_users`: `deletedAt` (timestamp, nullable), `isDeleted` (boolean, default false)
- `healthcare_users`: `deletedAt` (timestamp, nullable), `isDeleted` (boolean, default false)
- `ems_users`: `deletedAt` (timestamp, nullable), `isDeleted` (boolean, default false)
- `ems_agencies`: `availabilityStatus` (jsonb, default '{"isAvailable":false,"availableLevels":[]}')

### Step 4: Restart Azure App Service

After applying migrations:

1. **Azure Portal** → **TraccEms-Dev-Backend**
2. **Overview** → **Restart** (or **Stop** then **Start**)
3. Wait for restart to complete
4. Try accessing https://dev-swa.traccems.com/ again

## SQL Files Created

1. **`backend/apply-user-deletion-fields-migration.sql`**
   - Adds `deletedAt` and `isDeleted` to all user tables
   - Creates indexes

2. **`backend/apply-availability-status-migration.sql`**
   - Adds `availabilityStatus` to `ems_agencies`

## Why This Happened

When we baselined migrations, we:
- ✅ Created `_prisma_migrations` table
- ✅ Inserted migration records (marked as applied)
- ❌ But didn't actually run the migration SQL

This is why:
- Prisma thinks migrations are applied
- But database schema doesn't match
- Application fails when trying to use missing columns

## After Fixing

1. ✅ Columns will exist in database
2. ✅ Schema will match Prisma schema
3. ✅ Application should start successfully
4. ✅ Login should work
5. ✅ Site should be accessible

## Quick Checklist

- [ ] Run `apply-user-deletion-fields-migration.sql` in pgAdmin
- [ ] Run `apply-availability-status-migration.sql` in pgAdmin
- [ ] Verify columns exist with SELECT queries
- [ ] Restart Azure App Service
- [ ] Test https://dev-swa.traccems.com/
- [ ] Verify login works

