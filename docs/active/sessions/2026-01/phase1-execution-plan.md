# Phase 1 Execution Plan: Foundation Tables
**Date:** January 6, 2026  
**Status:** 📋 **READY FOR REVIEW** - Awaiting approval

---

## Overview

**Goal:** Apply Phase 1 migrations to production database to create foundation tables and add user deletion fields.

**Migrations to Apply:**
1. `20250917170653_add_center_tables` - Creates `center_users` table and other foundation tables
2. `20251204101500_add_user_deletion_fields` - Adds `deletedAt` and `isDeleted` columns to user tables

**Risk Level:** 🟢 **LOW** - Adding nullable columns and creating new tables, no data loss expected

---

## Pre-Execution Steps

### Step 1: Check Current Production State

**Action:** Run the Phase 1 state checker script to understand current database state.

```bash
cd backend
node check-phase1-state.js
```

**Expected Output:**
- Migration history for Phase 1 migrations
- `center_users` table existence check
- Deletion fields status for all user tables
- Summary of what needs to be applied

**Decision Point:** Based on output, determine if migrations need to be applied or if they're already partially applied.

### Step 2: Backup Production Database

**Action:** Create a full backup of production database before making changes.

**Location:** `/Volumes/Acasis/tcc-backups/`

**Script:** `documentation/scripts/backup-production-database.sh` (if exists)

**Alternative:** Manual backup via Azure Portal or pgAdmin

**Critical:** ⚠️ **DO NOT PROCEED** without a verified backup.

### Step 3: Verify Migration Files

**Action:** Confirm migration files exist and are correct.

**Files to Verify:**
- `backend/prisma/migrations/20250917170653_add_center_tables/migration.sql`
- `backend/prisma/migrations/20251204101500_add_user_deletion_fields/migration.sql`

**Check:** Review migration SQL to understand what changes will be made.

---

## Execution Options

### Option A: Apply via GitHub Actions (Recommended)

**Method:** Use existing GitHub Actions workflow that runs `prisma migrate deploy`

**Steps:**
1. Ensure code is committed to repository
2. Trigger GitHub Actions workflow (if automatic on push) or manually trigger
3. Monitor workflow logs for migration execution
4. Verify migrations applied successfully

**Pros:**
- Uses existing deployment infrastructure
- Automatic rollback if deployment fails
- Logs are tracked in GitHub

**Cons:**
- Requires code commit
- May trigger full deployment (not just migrations)

### Option B: Apply via Azure CLI (Direct)

**Method:** Run migrations directly against production database using Prisma CLI

**Prerequisites:**
- Azure CLI installed and authenticated
- Production DATABASE_URL available
- Local access to migration files

**Steps:**
1. Set production DATABASE_URL:
   ```bash
   export DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require"
   ```

2. Navigate to backend directory:
   ```bash
   cd backend
   ```

3. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

4. Apply migrations:
   ```bash
   npx prisma migrate deploy
   ```

**Pros:**
- Direct control over migration execution
- Can apply specific migrations
- Immediate feedback

**Cons:**
- Requires local access to production credentials
- Manual process
- No automatic rollback

### Option C: Apply via pgAdmin (Manual SQL)

**Method:** Connect to production database via pgAdmin and run migration SQL manually

**Steps:**
1. Connect to production database via pgAdmin
2. Open Query Tool
3. Copy migration SQL from files
4. Execute SQL statements
5. Update `_prisma_migrations` table manually

**Pros:**
- Full control over execution
- Can review SQL before execution
- Can execute step-by-step

**Cons:**
- Most manual process
- Requires careful tracking of migration history
- Higher risk of errors

---

## Recommended Approach

**Recommended:** Option A (GitHub Actions) if workflow exists, otherwise Option B (Azure CLI)

**Reasoning:**
- GitHub Actions provides automated, tracked execution
- Azure CLI provides direct control if needed
- Both methods use Prisma's migration system

---

## Migration Details

### Migration 1: `20250917170653_add_center_tables`

**What It Does:**
- Creates `center_users` table
- Creates `hospitals` table
- Creates `agencies` table
- Creates `facilities` table
- Creates `trips` table
- Creates `system_analytics` table
- **WARNING:** Drops some existing tables (`ems_users`, `transport_requests`, `units`, `crew_roles`)
- **WARNING:** Drops `addedAt` and `addedBy` columns from `ems_agencies`

**Impact:**
- ⚠️ **HIGH IMPACT** - This migration drops tables and columns
- May affect existing data if tables exist
- Creates foundation tables needed for system

**Risk Assessment:**
- If production database is empty or these tables don't exist: 🟢 **LOW RISK**
- If production database has data in these tables: 🔴 **HIGH RISK** (data loss)

**Action Required:**
- **CRITICAL:** Verify if `ems_users`, `transport_requests`, `units`, `crew_roles` tables exist in production
- **CRITICAL:** Verify if `ems_agencies` table has `addedAt`/`addedBy` columns
- If tables exist with data, we may need to modify migration or backup data first

### Migration 2: `20251204101500_add_user_deletion_fields`

**What It Does:**
- Adds `deletedAt` TIMESTAMP(3) column to `center_users` (nullable)
- Adds `isDeleted` BOOLEAN column to `center_users` (default false)
- Adds `deletedAt` TIMESTAMP(3) column to `healthcare_users` (nullable)
- Adds `isDeleted` BOOLEAN column to `healthcare_users` (default false)
- Conditionally adds deletion fields to `ems_users` if table exists
- Creates indexes on `isDeleted` columns

**Impact:**
- 🟢 **LOW IMPACT** - Only adds nullable columns
- No data loss
- Safe to apply

**Risk Assessment:**
- 🟢 **LOW RISK** - Adding nullable columns is safe

---

## Execution Steps (Detailed)

### Step 1: Pre-Flight Checks

```bash
# 1. Check current state
cd backend
node check-phase1-state.js

# 2. Verify migration files exist
ls -la prisma/migrations/20250917170653_add_center_tables/migration.sql
ls -la prisma/migrations/20251204101500_add_user_deletion_fields/migration.sql

# 3. Review migration SQL (optional but recommended)
cat prisma/migrations/20250917170653_add_center_tables/migration.sql | head -50
cat prisma/migrations/20251204101500_add_user_deletion_fields/migration.sql
```

### Step 2: Backup Production Database

**Action:** Create backup before proceeding

**Verification:** Confirm backup was created successfully

### Step 3: Check for Existing Tables (CRITICAL)

**Action:** Verify if tables that will be dropped exist in production

```sql
-- Run in pgAdmin or via Prisma
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('ems_users', 'transport_requests', 'units', 'crew_roles')
ORDER BY table_name;
```

**Decision:**
- If tables exist: **STOP** - Need to assess data and modify approach
- If tables don't exist: **PROCEED** - Safe to apply migration

### Step 4: Apply Migrations

**Choose execution method (A, B, or C) from above**

**Monitor:**
- Migration execution logs
- Any errors or warnings
- Migration history table updates

### Step 5: Verify Migrations Applied

```bash
# Check migration history
cd backend
node check-phase1-state.js

# Or via SQL
# SELECT * FROM "_prisma_migrations" 
# WHERE migration_name IN (
#   '20250917170653_add_center_tables',
#   '20251204101500_add_user_deletion_fields'
# );
```

**Expected Results:**
- Both migrations appear in `_prisma_migrations` table
- `center_users` table exists with all columns
- Deletion fields exist in user tables

### Step 6: Test Functionality

**Tests to Run:**
- [ ] Verify `center_users` table exists
- [ ] Verify `center_users` has `deletedAt` and `isDeleted` columns
- [ ] Verify `healthcare_users` has `deletedAt` and `isDeleted` columns
- [ ] Verify `ems_users` has `deletedAt` and `isDeleted` columns (if table exists)
- [ ] Test user login (should still work)
- [ ] Test user queries (should still work)
- [ ] Check application logs for errors

---

## Rollback Plan

### If Migration 1 Fails

**Scenario:** `20250917170653_add_center_tables` fails or causes issues

**Rollback Steps:**
1. **If migration partially applied:**
   - Drop tables created: `DROP TABLE IF EXISTS center_users CASCADE;`
   - Restore dropped tables from backup if needed
   - Remove migration from history: `DELETE FROM "_prisma_migrations" WHERE migration_name = '20250917170653_add_center_tables';`

2. **If full rollback needed:**
   - Restore from backup: `/Volumes/Acasis/tcc-backups/production-db-backup-YYYYMMDD_HHMMSS`
   - Verify restoration successful

### If Migration 2 Fails

**Scenario:** `20251204101500_add_user_deletion_fields` fails or causes issues

**Rollback Steps:**
1. **Drop columns added:**
   ```sql
   ALTER TABLE center_users DROP COLUMN IF EXISTS deletedAt;
   ALTER TABLE center_users DROP COLUMN IF EXISTS isDeleted;
   ALTER TABLE healthcare_users DROP COLUMN IF EXISTS deletedAt;
   ALTER TABLE healthcare_users DROP COLUMN IF EXISTS isDeleted;
   ALTER TABLE ems_users DROP COLUMN IF EXISTS deletedAt;
   ALTER TABLE ems_users DROP COLUMN IF EXISTS isDeleted;
   ```

2. **Drop indexes:**
   ```sql
   DROP INDEX IF EXISTS center_users_isDeleted_idx;
   DROP INDEX IF EXISTS healthcare_users_isDeleted_idx;
   DROP INDEX IF EXISTS ems_users_isDeleted_idx;
   ```

3. **Remove migration from history:**
   ```sql
   DELETE FROM "_prisma_migrations" WHERE migration_name = '20251204101500_add_user_deletion_fields';
   ```

---

## Success Criteria

**Phase 1 is considered successful when:**

- ✅ Both migrations appear in `_prisma_migrations` table
- ✅ `center_users` table exists with all expected columns
- ✅ `center_users` has `deletedAt` and `isDeleted` columns
- ✅ `healthcare_users` has `deletedAt` and `isDeleted` columns
- ✅ `ems_users` has `deletedAt` and `isDeleted` columns (if table exists)
- ✅ Indexes on `isDeleted` columns exist
- ✅ User login functionality still works
- ✅ User queries still work
- ✅ No errors in application logs
- ✅ All tests pass

---

## Next Steps After Phase 1

**If Successful:**
1. Document results in `catchingup_dbs.md`
2. Mark Phase 1 testing checklist as complete
3. Proceed to Phase 2 (EMS Foundation)

**If Issues:**
1. Document issues encountered
2. Assess impact
3. Determine if rollback needed
4. Fix issues before proceeding

---

## Questions to Answer Before Execution

1. **Does production database have data in tables that will be dropped?**
   - `ems_users`
   - `transport_requests`
   - `units`
   - `crew_roles`

2. **Does `ems_agencies` table have `addedAt`/`addedBy` columns?**
   - If yes, are they being used?
   - Do we need to preserve this data?

3. **Which execution method should we use?**
   - GitHub Actions (Option A)
   - Azure CLI (Option B)
   - pgAdmin (Option C)

4. **Is backup location accessible?**
   - `/Volumes/Acasis/tcc-backups/`
   - Or alternative backup method?

---

## Approval Required

**Before proceeding with Phase 1 execution, please confirm:**

- [ ] Current production state has been checked
- [ ] Backup has been created and verified
- [ ] Tables that will be dropped have been checked (if they exist, data has been assessed)
- [ ] Execution method has been chosen
- [ ] Rollback plan is understood
- [ ] Ready to proceed with Phase 1

**Approved by:** _________________  
**Date:** _________________  
**Notes:** _________________

---

**Last Updated:** January 6, 2026  
**Status:** 📋 Ready for review and approval

