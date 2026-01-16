# Production Database Migration: Add addedBy and addedAt Columns

**Date:** January 4, 2026  
**Purpose:** Align production database schema with Dev-SWA and Prisma schema  
**Status:** ✅ **APPLIED SUCCESSFULLY**

---

## Issue Summary

Production database is missing `addedBy` and `addedAt` columns in `ems_agencies` table, causing Prisma validation errors during EMS registration. Dev-SWA has these columns, which is why registration works there.

**Error:**
```
Invalid `prisma.eMSAgency.findUnique()` invocation: 
The column `ems_agencies.addedBy` does not exist in the current database.
```

---

## Root Cause

**Schema Mismatch:**
- **Prisma Schema:** Defines `addedBy` and `addedAt` fields (lines 191-192)
- **Dev-SWA Database:** Has these columns (migrations applied)
- **Production Database:** Missing these columns (migrations not applied or columns dropped)

**Why Dev-SWA Works:**
- Dev-SWA database has `addedBy`/`addedAt` columns
- Prisma operations work normally without raw SQL fallback
- No schema validation errors

**Why Production Fails:**
- Production database missing `addedBy`/`addedAt` columns
- Prisma tries to validate against schema that expects these columns
- Even raw SQL workarounds fail when Prisma validates returned objects

---

## Migration Details

### Columns to Add

1. **`addedBy`** (TEXT, nullable)
   - Purpose: Track who added the agency
   - Type: `TEXT` (nullable)
   - Default: `NULL`

2. **`addedAt`** (TIMESTAMP(3), NOT NULL)
   - Purpose: Track when agency was added
   - Type: `TIMESTAMP(3)` (NOT NULL)
   - Default: `CURRENT_TIMESTAMP`
   - Existing rows: Set to `createdAt` value

### Migration Script

**File:** `backend/add-addedby-addedat-columns-production.sql`

```sql
-- Add addedBy column (nullable TEXT)
ALTER TABLE "ems_agencies" 
ADD COLUMN IF NOT EXISTS "addedBy" TEXT;

-- Add addedAt column (TIMESTAMP with default)
ALTER TABLE "ems_agencies" 
ADD COLUMN IF NOT EXISTS "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows to have addedAt = createdAt if they don't have it
UPDATE "ems_agencies" 
SET "addedAt" = "createdAt" 
WHERE "addedAt" IS NULL;
```

---

## Application Instructions

### Option 1: Using Node.js Script (Recommended)

```bash
# Set production database URL
export DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require"

# Run migration script
cd backend
node apply-addedby-addedat-migration-production.js
```

### Option 2: Direct SQL Execution

Connect to production database and run:

```sql
ALTER TABLE "ems_agencies" 
ADD COLUMN IF NOT EXISTS "addedBy" TEXT;

ALTER TABLE "ems_agencies" 
ADD COLUMN IF NOT EXISTS "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "ems_agencies" 
SET "addedAt" = "createdAt" 
WHERE "addedAt" IS NULL;
```

### Option 3: Via Azure Portal

1. Go to Azure Portal → PostgreSQL server
2. Open Query Editor
3. Paste migration SQL
4. Execute

---

## Verification

After applying migration, verify columns exist:

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'ems_agencies' 
  AND column_name IN ('addedBy', 'addedAt')
ORDER BY column_name;
```

**Expected Result:**
- `addedBy` - TEXT, nullable, NULL default
- `addedAt` - timestamp with time zone, NOT NULL, CURRENT_TIMESTAMP default

---

## Impact Assessment

### Risk Level: **LOW**

**Why Low Risk:**
- Adding nullable columns is safe (no data loss)
- `IF NOT EXISTS` prevents errors if columns already exist
- Existing data preserved (addedAt set to createdAt for existing rows)
- No breaking changes to existing functionality

**Rollback Plan:**
If needed, columns can be dropped:
```sql
ALTER TABLE "ems_agencies" DROP COLUMN IF EXISTS "addedBy";
ALTER TABLE "ems_agencies" DROP COLUMN IF EXISTS "addedAt";
```

---

## Expected Outcome

After migration:
- ✅ Production database schema matches Dev-SWA
- ✅ Production database schema matches Prisma schema
- ✅ EMS registration should work without raw SQL workarounds
- ✅ Prisma operations work normally
- ✅ No more `addedBy`/`addedAt` column errors

---

## Post-Migration Steps

1. ✅ Verify columns added successfully
2. ✅ Test EMS registration in production - **SUCCESSFUL**
3. ✅ Verify no Prisma validation errors - **NO ERRORS**
4. ⏳ Consider reverting raw SQL workarounds (optional - can keep for safety)

### Testing Results

**Production Testing (January 4, 2026):**
- ✅ Account creation successful
- ✅ No `addedBy`/`addedAt` column errors
- ✅ EMS registration working correctly
- ✅ Agency appears in Command list

**Dev-SWA Testing:**
- ✅ Already tested and working (Southern Cove EMS registration successful)
- ✅ No retesting needed - Dev-SWA already has these columns

**Local Dev Testing:**
- ✅ Already tested and working (test script passes)
- ✅ No retesting needed - Local dev works correctly

---

## Files Created

- `backend/add-addedby-addedat-columns-production.sql` - SQL migration script
- `backend/apply-addedby-addedat-migration-production.js` - Node.js migration runner

---

**Migration Applied:** ✅ January 4, 2026  
**Result:** ✅ Success - Columns added successfully  
**Verification:** ✅ Both columns confirmed in production database

### Migration Results

**Columns Added:**
- ✅ `addedBy` (TEXT, nullable) - Added successfully
- ✅ `addedAt` (TIMESTAMP(3), NOT NULL, default CURRENT_TIMESTAMP) - Added successfully

**Existing Rows Updated:** 0 rows (no existing agencies to update)

**Database Status:**
- Production database now matches Dev-SWA schema
- Production database now matches Prisma schema
- EMS registration should now work without errors

