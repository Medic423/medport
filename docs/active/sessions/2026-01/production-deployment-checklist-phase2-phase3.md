# Production Deployment Checklist - Phase 2 & Phase 3
**Date:** January 20, 2026  
**Branch:** `develop`  
**Features:** Phase 2 (Login Tracking) + Phase 3 (Show List Functionality)

---

## Pre-Deployment Checklist

### ✅ Code Status
- [x] All Phase 2 code committed
- [x] All Phase 3 code committed
- [x] Dev-SWA testing passed
- [x] All changes verified working in dev-swa
- [x] Fresh backup created (both locations)

### 📋 Database Migration Required
- [ ] **CRITICAL:** Phase 2 requires database migration (`lastLogin` fields)
- [ ] **CRITICAL:** Category slugs migration required
- [ ] Migration scripts ready:
  - `backend/migrations/01-document-current-state.sql`
  - `backend/migrations/02-category-slugs-to-dropdown-n.sql`
  - `backend/migrations/03-add-lastlogin-to-user-tables.sql`
- [ ] Backup script ready: `documentation/scripts/backup-to-both-locations.sh`

---

## Step 1: Create Production Database Backup

**Action:** Run backup script to backup production database before migration

```bash
./documentation/scripts/backup-to-both-locations.sh
```

**Verify:**
- [ ] Backup completed successfully
- [ ] Backup includes production database (`traccems-prod-pgsql.sql`)
- [ ] Backup saved to both locations

**Note:** Backup was already created before dev-swa deployment, but verify it includes production database.

---

## Step 2: Database Migrations (pgAdmin)

### Connection Details
- **Host:** `traccems-prod-pgsql.postgres.database.azure.com`
- **Database:** `postgres`
- **User:** `traccems_admin`
- **Password:** `TVmedic429!`
- **Port:** `5432`
- **SSL:** Required

### Migration Order (CRITICAL - Run in this exact order)

#### Migration 2A: Category Slugs Fix (CRITICAL - Run First)
**Purpose:** Fix potentially fatal flaw in Healthcare Setting Options by migrating category slugs to fixed format

1. [ ] Open pgAdmin
2. [ ] Connect to production database (`traccems-prod-pgsql`)
3. [ ] **VERIFY:** Double-check you're connected to PRODUCTION (not dev-swa!)
4. [ ] Open Query Tool
5. [ ] **Step 2A.1:** Load and run `backend/migrations/01-document-current-state.sql`
   - **IMPORTANT:** Use the execute button WITHOUT the '1' icon (or press F5)
   - This documents the current state before migration
   - Review the output to understand current category mappings
6. [ ] **Step 2A.2:** Load and run `backend/migrations/02-category-slugs-to-dropdown-n.sql`
   - **IMPORTANT:** Use the execute button WITHOUT the '1' icon (or press F5)
   - This migrates category slugs: `transport-level` → `dropdown-1`, `urgency` → `dropdown-2`, etc.
   - Script includes verification queries at the end
7. [ ] Verify migration 2A results:
   - [ ] All 7 categories show new slugs (`dropdown-1` through `dropdown-7`)
   - [ ] Option counts per category are preserved
   - [ ] No orphaned options (verification query should return 0 rows)

#### Migration 2B: Add lastLogin Fields (Run After Category Migration)
**Purpose:** Add login tracking for idle account detection (Phase 2)

1. [ ] **Step 2B.1:** Load migration script: `backend/migrations/03-add-lastlogin-to-user-tables.sql`
2. [ ] **IMPORTANT:** Use the execute button WITHOUT the '1' icon (or press F5) to execute full script
3. [ ] Execute migration script
4. [ ] Verify results:
   - [ ] 3 rows returned (one for each table)
   - [ ] All show `lastLogin` column with type `timestamp without time zone`
5. [ ] Run verification query to check indexes were created

### Verification Queries

**For Category Migration:**
```sql
-- Verify category slugs were updated
SELECT slug, "displayName", "displayOrder" 
FROM dropdown_categories 
ORDER BY "displayOrder";

-- Verify no orphaned options
SELECT 
    opt.id,
    opt.category,
    opt.value,
    CASE 
        WHEN dc.id IS NULL THEN 'ORPHANED'
        ELSE 'OK'
    END as status
FROM dropdown_options opt
LEFT JOIN dropdown_categories dc ON opt.category = dc.slug OR opt."categoryId" = dc.id
WHERE dc.id IS NULL;
```

**For lastLogin Migration:**
```sql
-- Verify columns and indexes
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('healthcare_users', 'ems_users', 'center_users')
AND indexname LIKE '%lastLogin%'
ORDER BY tablename;
```

**Expected Results:**
- Category migration: 7 categories with slugs `dropdown-1` through `dropdown-7`, 0 orphaned options
- lastLogin migration: 3 rows showing indexes on `lastLogin` columns

---

## Step 3: Code Deployment

### Backend Deployment (GitHub Actions)

1. [ ] Go to GitHub Actions: https://github.com/Medic423/medport/actions
2. [ ] Find workflow: **"production - Deploy Prod Backend"**
3. [ ] Click **"Run workflow"** button (top right)
4. [ ] Select branch: `develop` (or `main` if preferred)
5. [ ] Click **"Run workflow"** button
6. [ ] Monitor deployment progress
7. [ ] Verify deployment completes successfully
8. [ ] Check backend logs for any errors

### Frontend Deployment (GitHub Actions)

1. [ ] Go to GitHub Actions: https://github.com/Medic423/medport/actions
2. [ ] Find workflow: **"production - Deploy Prod Frontend"**
3. [ ] Click **"Run workflow"** button (top right)
4. [ ] Select branch: `develop` (or `main` if preferred)
5. [ ] Click **"Run workflow"** button
6. [ ] Monitor deployment progress
7. [ ] Verify deployment completes successfully
8. [ ] Check for any build errors

**Note:** Production deployments are manual (`workflow_dispatch`) for safety.

---

## Step 4: Production Testing

### Database Verification
- [ ] Verify `lastLogin` columns exist in all three tables
- [ ] Verify indexes were created
- [ ] Test that existing data is intact

### Login Testing
- [ ] Test admin login (`admin@tcc.com` or production admin credentials)
- [ ] Test healthcare login (if test accounts exist)
- [ ] Test EMS login (if test accounts exist)
- [ ] Verify `lastLogin` is updated in database after each login

### UI Testing - Recent Activity
- [ ] Navigate to TCC Overview/Dashboard
- [ ] Verify Recent Activity section loads
- [ ] Verify account creation statistics display
- [ ] Verify idle account statistics display

### UI Testing - Show List Functionality
- [ ] Test "Show List" for New Healthcare Facilities (60 days)
- [ ] Test "Show List" for New EMS Agencies (60 days)
- [ ] Test "Show List" for New Registrations (90 days)
- [ ] Test "Show List" for Idle Accounts (30 days)
- [ ] Test "Show List" for Idle Accounts (60 days)
- [ ] Test "Show List" for Idle Accounts (90 days)
- [ ] Verify lists expand and collapse correctly
- [ ] Verify loading states work
- [ ] Verify data displays correctly (name, location, dates, status)

### Error Checking
- [ ] Check browser console for errors
- [ ] Check backend logs for errors
- [ ] Verify no 500 errors
- [ ] Verify API endpoints respond correctly

---

## Rollback Plan (If Needed)

### Database Rollback

**Category Migration Rollback:**
```sql
BEGIN;

-- Rollback dropdown_categories slugs
UPDATE dropdown_categories SET slug = 'transport-level' WHERE slug = 'dropdown-1';
UPDATE dropdown_categories SET slug = 'urgency' WHERE slug = 'dropdown-2';
UPDATE dropdown_categories SET slug = 'diagnosis' WHERE slug = 'dropdown-3';
UPDATE dropdown_categories SET slug = 'mobility' WHERE slug = 'dropdown-4';
UPDATE dropdown_categories SET slug = 'insurance' WHERE slug = 'dropdown-5';
UPDATE dropdown_categories SET slug = 'secondary-insurance' WHERE slug = 'dropdown-6';
UPDATE dropdown_categories SET slug = 'special-needs' WHERE slug = 'dropdown-7';

-- Rollback dropdown_options category field
UPDATE dropdown_options SET category = 'transport-level' WHERE category = 'dropdown-1';
UPDATE dropdown_options SET category = 'urgency' WHERE category = 'dropdown-2';
UPDATE dropdown_options SET category = 'diagnosis' WHERE category = 'dropdown-3';
UPDATE dropdown_options SET category = 'mobility' WHERE category = 'dropdown-4';
UPDATE dropdown_options SET category = 'insurance' WHERE category = 'dropdown-5';
UPDATE dropdown_options SET category = 'secondary-insurance' WHERE category = 'dropdown-6';
UPDATE dropdown_options SET category = 'special-needs' WHERE category = 'dropdown-7';

COMMIT;
```

**lastLogin Migration Rollback:**
```sql
-- Remove lastLogin columns
ALTER TABLE healthcare_users DROP COLUMN IF EXISTS "lastLogin";
ALTER TABLE ems_users DROP COLUMN IF EXISTS "lastLogin";
ALTER TABLE center_users DROP COLUMN IF EXISTS "lastLogin";

-- Remove indexes
DROP INDEX IF EXISTS "healthcare_users_lastLogin_idx";
DROP INDEX IF EXISTS "ems_users_lastLogin_idx";
DROP INDEX IF EXISTS "center_users_lastLogin_idx";
```

### Code Rollback
- Revert git commits
- Redeploy previous version via GitHub Actions

---

## Success Criteria

- ✅ Database migrations completed successfully
- ✅ All three user tables have `lastLogin` columns
- ✅ Category slugs migrated to dropdown-1 through dropdown-7
- ✅ Login updates `lastLogin` for all user types
- ✅ Idle account detection works correctly
- ✅ Show List functionality works for all Recent Activity items
- ✅ No errors in console or logs
- ✅ All features tested and verified in production

---

## Notes

- **Migration Scripts:** 
  - `backend/migrations/01-document-current-state.sql`
  - `backend/migrations/02-category-slugs-to-dropdown-n.sql`
  - `backend/migrations/03-add-lastlogin-to-user-tables.sql`
- **Backup Script:** `documentation/scripts/backup-to-both-locations.sh`
- **Important:** Use execute button WITHOUT '1' icon in pgAdmin (executes full script)
- **CRITICAL:** Always verify you're connected to PRODUCTION database before running migrations
- **Production URL:** https://traccems.com
- **Production API:** https://api.traccems.com
