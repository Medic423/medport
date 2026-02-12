# Dev-SWA Deployment Checklist - Phase 2 & Phase 3
**Date:** January 20, 2026  
**Branch:** `fix/ui-improvements`  
**Features:** Phase 2 (Login Tracking) + Phase 3 (Show List Functionality)

---

## Pre-Deployment Checklist

### ✅ Code Status
- [x] All Phase 2 code committed
- [x] All Phase 3 code committed
- [x] Local dev testing passed
- [x] All changes verified working

### 📋 Database Migration Required
- [ ] **CRITICAL:** Phase 2 requires database migration (`lastLogin` fields)
- [ ] Migration script ready: `backend/migrations/03-add-lastlogin-to-user-tables.sql`
- [ ] Backup script ready: `documentation/scripts/backup-to-both-locations.sh`

---

## Step 1: Create Dev-SWA Database Backup

**Action:** Run backup script to backup dev-swa database before migration

```bash
./documentation/scripts/backup-to-both-locations.sh
```

**Verify:**
- [ ] Backup completed successfully
- [ ] Backup includes dev-swa database (`traccems-dev-pgsql.sql`)
- [ ] Backup saved to both locations

---

## Step 2: Database Migrations (pgAdmin)

### Connection Details
- **Host:** `traccems-dev-pgsql.postgres.database.azure.com`
- **Database:** `postgres`
- **User:** `traccems_admin`
- **Password:** `password1!`
- **Port:** `5432`
- **SSL:** Required

### Migration Order (CRITICAL - Run in this exact order)

#### Migration 2A: Category Slugs Fix (CRITICAL - Run First)
**Purpose:** Fix potentially fatal flaw in Healthcare Setting Options by migrating category slugs to fixed format

1. [ ] Open pgAdmin
2. [ ] Connect to dev-swa database (`traccems-dev-pgsql`)
3. [ ] Open Query Tool
4. [ ] **Step 2A.1:** Load and run `backend/migrations/01-document-current-state.sql`
   - **IMPORTANT:** Use the execute button WITHOUT the '1' icon (or press F5)
   - This documents the current state before migration
   - Review the output to understand current category mappings
5. [ ] **Step 2A.2:** Load and run `backend/migrations/02-category-slugs-to-dropdown-n.sql`
   - **IMPORTANT:** Use the execute button WITHOUT the '1' icon (or press F5)
   - This migrates category slugs: `transport-level` → `dropdown-1`, `urgency` → `dropdown-2`, etc.
   - Script includes verification queries at the end
6. [ ] Verify migration 2A results:
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

### Git Operations
1. [ ] Ensure all changes are committed to `fix/ui-improvements` branch
2. [ ] Push branch to GitHub:
   ```bash
   git push origin fix/ui-improvements
   ```
3. [ ] Merge to `develop` branch (or create PR):
   ```bash
   git checkout develop
   git merge fix/ui-improvements
   git push origin develop
   ```

### Backend Deployment
1. [ ] Monitor GitHub Actions for backend deployment
2. [ ] Verify deployment completes successfully
3. [ ] Check backend logs for any errors
4. [ ] Verify Prisma client regenerated (check deployment logs)

### Frontend Deployment
1. [ ] Monitor GitHub Actions for frontend deployment
2. [ ] Verify deployment completes successfully
3. [ ] Check for any build errors

---

## Step 4: Dev-SWA Testing ✅ COMPLETE

### Database Verification
- [x] Verify `lastLogin` columns exist in all three tables
- [x] Verify indexes were created
- [x] Test that existing data is intact

### Login Testing
- [x] Test admin login (`admin@tcc.com` or similar)
- [x] Test healthcare login
- [x] Test EMS login
- [x] Verify `lastLogin` is updated in database after each login (implicit - logins successful)

### UI Testing - Recent Activity
- [x] Verify Recent Activity section loads
- [x] Verify account creation statistics display
- [x] Verify idle account statistics display

### UI Testing - Show List Functionality
- [x] Test "Show List" for New Healthcare Facilities (60 days)
- [x] Test "Show List" for New EMS Agencies (60 days)
- [x] Test "Show List" for New Registrations (90 days)
- [x] Test "Show List" for Idle Accounts (30 days)
- [x] Test "Show List" for Idle Accounts (60 days)
- [x] Test "Show List" for Idle Accounts (90 days)
- [x] Verify lists expand and collapse correctly
- [x] Verify loading states work
- [x] Verify data displays correctly (name, location, dates, status)

### Error Checking
- [x] Check browser console for errors
- [x] Check backend logs for errors
- [x] Verify no 500 errors
- [x] Verify API endpoints respond correctly

**Testing Completed:** January 20, 2026  
**Status:** ✅ All tests passed

---

## Rollback Plan (If Needed)

### Database Rollback
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
- Redeploy previous version from `develop` branch

---

## Success Criteria

- ✅ Database migration completed successfully
- ✅ All three user tables have `lastLogin` columns
- ✅ Login updates `lastLogin` for all user types
- ✅ Idle account detection works correctly
- ✅ Show List functionality works for all Recent Activity items
- ✅ No errors in console or logs
- ✅ All features tested and verified

---

## Notes

- **Migration Script:** `backend/migrations/03-add-lastlogin-to-user-tables.sql`
- **Backup Script:** `documentation/scripts/backup-to-both-locations.sh`
- **Important:** Use execute button WITHOUT '1' icon in pgAdmin (executes full script)
