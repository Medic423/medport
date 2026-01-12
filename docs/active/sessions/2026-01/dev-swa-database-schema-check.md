# Dev-SWA Database Schema Check - acceptsNotifications Column
**Date:** January 10, 2026  
**Status:** 🔴 **INVESTIGATING** - Possible database schema mismatch

---

## Problem

Backend is returning 503 errors after SMS notifications fix deployment. The code changes reference `acceptsNotifications` column, but this column may not exist in the dev-swa database.

---

## Root Cause Analysis

### What Changed

**Code Changes (No Schema Changes):**
- `backend/src/routes/auth.ts` - Added code to read/write `acceptsNotifications` field
- `frontend/src/components/AgencySettings.tsx` - Added SMS notifications to payload

**Database Schema:**
- `backend/prisma/schema.prisma` shows `acceptsNotifications Boolean @default(true)` exists
- **BUT:** The column may not exist in the actual dev-swa database

### Why This Could Cause 503 Errors

If the `acceptsNotifications` column doesn't exist in the database:

1. **Prisma queries fail** when trying to read/write this field
2. **Backend crashes** on requests that touch this field (login, agency info, agency update)
3. **503 Service Unavailable** is returned because the backend crashes before responding

### Migration History

Looking at migration files, `acceptsNotifications` has been:
- Added in multiple migrations
- Removed in some migrations
- Added back in later migrations

This suggests the migration state might be inconsistent.

---

## Diagnostic Steps

### Step 1: Check if Column Exists in Dev-SWA Database

**Using pgAdmin:**

1. Connect to dev-swa database (`traccems-dev-pgsql`)
2. Navigate to: `Databases` → `traccems-dev` → `Schemas` → `public` → `Tables` → `ems_agencies` → `Columns`
3. Look for column named: `acceptsNotifications`
4. Check:
   - ✅ **Column exists** → Problem is elsewhere (code error, connection issue)
   - ❌ **Column missing** → This is the problem! Continue to Step 2

**Using SQL Query:**

```sql
-- Check if column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ems_agencies'
  AND column_name = 'acceptsNotifications';
```

**Expected Result if Column Exists:**
```
column_name          | data_type | column_default
---------------------|-----------|---------------
acceptsNotifications | boolean   | true
```

**If Column Missing:**
- Result will be empty (0 rows)
- This confirms the schema mismatch

---

### Step 2: Check Migration Status

**Using pgAdmin:**

1. Navigate to: `Databases` → `traccems-dev` → `Schemas` → `public` → `Tables` → `_prisma_migrations`
2. Query recent migrations:

```sql
SELECT migration_name, finished_at, applied_steps_count
FROM _prisma_migrations
ORDER BY finished_at DESC
LIMIT 10;
```

**Look for:**
- Migrations that mention `acceptsNotifications`
- Check if they were applied successfully
- Check if any migrations failed partially

---

### Step 3: Check Backend Logs for Database Errors

**Azure Portal → TraccEms-Dev-Backend → Log Stream**

**Look for errors like:**
- `column "acceptsNotifications" does not exist`
- `relation "ems_agencies" does not exist`
- `PrismaClientKnownRequestError`
- `P2002` (unique constraint) or `P2025` (record not found) errors related to `acceptsNotifications`

---

## Solution: Add Missing Column (If Column Doesn't Exist)

### Option A: Manual SQL Fix (Recommended for Quick Fix)

**If `acceptsNotifications` column is missing, add it manually:**

```sql
-- Connect to dev-swa database in pgAdmin
-- Run this SQL:

ALTER TABLE "ems_agencies"
ADD COLUMN IF NOT EXISTS "acceptsNotifications" BOOLEAN NOT NULL DEFAULT true;

-- Verify it was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ems_agencies'
  AND column_name = 'acceptsNotifications';
```

**After adding column:**
1. Restart Azure App Service (TraccEms-Dev-Backend)
2. Test login again
3. Test SMS notifications checkbox

### Option B: Run Prisma Migration (If Migration State is Correct)

**If migration state is correct but column is missing:**

```bash
# This should be run during deployment, but if it failed:
npx prisma migrate deploy
```

**However:** This requires:
- Access to dev-swa database from local machine
- Correct `DATABASE_URL` environment variable
- May not work if migration state is inconsistent

### Option C: Create New Migration (If Migration State is Wrong)

**If migration state shows column was added but it doesn't exist:**

1. Create a new migration locally:
```bash
cd backend
npx prisma migrate dev --name add_accepts_notifications_if_missing --create-only
```

2. Edit the migration SQL to use `IF NOT EXISTS`:
```sql
ALTER TABLE "ems_agencies"
ADD COLUMN IF NOT EXISTS "acceptsNotifications" BOOLEAN NOT NULL DEFAULT true;
```

3. Commit and push to trigger deployment
4. Deployment will run the migration automatically

---

## Verification After Fix

### Test 1: Health Endpoint
```bash
curl https://dev-api.traccems.com/health
```

**Expected:** `{"status":"healthy",...}`

### Test 2: Login
- Try logging in on dev-swa frontend
- Should work without 503 error

### Test 3: Agency Info
- Navigate to Agency Info in EMS Module
- Check if SMS Notifications checkbox loads correctly
- Check if it saves correctly

### Test 4: Database Query
```sql
-- Verify column exists and has data
SELECT id, name, "acceptsNotifications"
FROM ems_agencies
LIMIT 5;
```

**Expected:** All rows should have `acceptsNotifications` column with boolean values

---

## Why Previous Deployment Worked

**Previous deployment worked because:**
- The code didn't reference `acceptsNotifications` yet
- Backend didn't try to read/write this field
- No database queries touched this column

**Current deployment fails because:**
- Code now tries to read `agency.acceptsNotifications` (line 551 in auth.ts)
- Code now tries to write `acceptsNotifications` (lines 694, 715 in auth.ts)
- If column doesn't exist → Prisma throws error → Backend crashes → 503 error

---

## Next Steps

1. **Check if column exists** (Step 1 above)
2. **If missing:** Add column manually via pgAdmin (Option A)
3. **Restart backend** in Azure Portal
4. **Test login and SMS notifications**
5. **Report results**

---

## Prevention

**For future deployments:**
1. Always verify schema changes are applied before deploying code that uses them
2. Check migration status in `_prisma_migrations` table
3. Test database queries locally against dev-swa database before deploying
4. Consider adding database health checks that verify schema matches code expectations
