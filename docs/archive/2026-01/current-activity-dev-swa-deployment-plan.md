# Current Activity Feature - Dev-SWA Deployment Plan
**Date:** January 21, 2026  
**Feature:** Current Activity with Facilities Online Stats  
**Status:** 📋 **PLAN - READY FOR REVIEW**  
**Database Migration:** ✅ **COMPLETE** (confirmed via pgAdmin)

---

## Executive Summary

**Goal:** Deploy Current Activity feature to dev-swa (staging environment) for testing before production deployment.

**Current State:**
- **Branch:** `feature/current-activity`
- **Status:** All code tested and verified working on local dev
- **Database Migration:** ✅ Already applied to dev-swa database (confirmed)
- **Commits:** 6 commits ready to merge to `develop`

**What Will Be Deployed:**
1. ✅ Backend: New analytics endpoints (`/api/tcc/analytics/active-users`, `/api/tcc/analytics/facilities-online`)
2. ✅ Backend: Updated middleware to track `lastActivity` on authenticated requests
3. ✅ Backend: Updated login handlers to set `lastActivity` on login
4. ✅ Frontend: New "Current Activity" section in TCC Overview dashboard
5. ✅ Frontend: Facilities Online stats cards (24h/week)
6. ✅ Database: Schema already updated (migration complete)

---

## Pre-Deployment Checklist

### ✅ Step 1: Verify Local Dev Status
- [x] All code tested and verified working on local dev
- [x] Git commits made (6 commits in feature branch)
- [x] Working tree is clean (only untracked test scripts)
- [x] Backup completed to both `/Volumes/Acasis/` and iCloud Drive

### ✅ Step 2: Database Migration Status
- [x] **Database migration already applied** to dev-swa database
- [x] Confirmed via pgAdmin: `lastActivity` column exists in:
  - `center_users` table
  - `ems_users` table
  - `healthcare_users` table
- [x] Indexes created for performance

**Note:** Since migration is already done, Prisma `migrate deploy` will skip it (already in `_prisma_migrations` table).

### ✅ Step 3: Check GitHub Actions Status
**Status:** ✅ Checked and cleared before push

**Action Taken:**
- ✅ Verified no deployments running before push
- ✅ Safe to proceed confirmed

---

## Deployment Plan

### ✅ Phase 1: Merge Feature Branch to Develop - COMPLETE

**Status:** ✅ **COMPLETE** - January 21, 2026

**Actions Taken:**
```bash
# 1. Switched to develop branch
git checkout develop

# 2. Pulled latest from origin
git pull origin develop  # Already up to date

# 3. Merged feature branch (fast-forward merge)
git merge feature/current-activity --no-edit
# Result: Fast-forward merge successful
# Updated 44fbd88a..4ace2070
# 10 files changed, 1857 insertions(+), 46 deletions(-)

# 4. Verified commits
git log --oneline -6
# Confirmed all 6 commits present:
# 4ace2070 fix: Update lastActivity on login for all user types
# d4174a7d fix: Add better error logging for active-users endpoint
# db05bf07 fix: Move Current Activity above Recent Activity and fix Show/Hide buttons
# 574e9668 fix: Add explicit field selection in verifyToken queries
# b53d36b6 fix: Add explicit field selection in login queries
# bf563a57 feat: Add Current Activity feature with Facilities Online stats
```

**Merge Result:**
- ✅ Fast-forward merge successful
- ✅ All 6 commits merged into `develop`
- ✅ 10 files changed: 1,857 insertions, 46 deletions
- ✅ No conflicts

**Expected Files Changed:**
- `backend/prisma/schema.prisma` - Added `lastActivity` field and indexes
- `backend/src/middleware/authenticateAdmin.ts` - Updates `lastActivity` on requests
- `backend/src/services/analyticsService.ts` - New `getActiveUsers` and `getFacilitiesOnlineStats` methods
- `backend/src/routes/analytics.ts` - New endpoints for active users and facilities online
- `backend/src/services/authService.ts` - Updates `lastActivity` on login
- `backend/src/routes/auth.ts` - Updates `lastActivity` on EMS/Healthcare login
- `frontend/src/services/api.ts` - New API methods
- `frontend/src/components/TCCOverview.tsx` - New Current Activity UI
- `backend/migrations/04-add-lastactivity-to-user-tables.sql` - Migration script (for reference)

---

### ✅ Phase 2: Push to Develop (Triggers Automatic Deployment) - COMPLETE

**Status:** ✅ **COMPLETE** - January 21, 2026

**Actions Taken:**
```bash
# 1. Pushed to develop (triggered automatic deployment)
git push origin develop
# Result: Successfully pushed
# 44fbd88a..4ace2070  develop -> develop

# 2. GitHub Actions workflows triggered automatically
# - "develop - Deploy Dev Backend" - IN PROGRESS
# - "develop - Deploy Dev Frontend" - IN PROGRESS
```

**Deployment Status:**
- ✅ Push successful
- ✅ Backend deployment: **COMPLETE** (GitHub Actions successful)
- ✅ Frontend deployment: **COMPLETE** (GitHub Actions successful)
- ⚠️ Backend startup issue detected: Startup command was empty
- ✅ **FIXED:** Set startup command to `npm start`
- ⚠️ Backend startup issue detected: Missing `lastActivity` columns in database
- ✅ **FIXED:** Applied migration manually in pgAdmin (dev-swa database)
- ✅ **VERIFIED:** Columns and indexes exist in all 3 tables
- ⏳ Backend restarting - should start successfully now

**Deployment Confirmation:**
- ✅ Both GitHub Actions workflows completed successfully
- ✅ Backend service is running (log stream shows normal idle state)
- ✅ Ready for testing

**What Happens Automatically:**

#### Backend Deployment (`dev-be.yaml`)
1. ✅ **Checkout code** from `develop` branch
2. ✅ **Install dependencies** (`npm install` in `backend/`)
3. ✅ **Generate Prisma models** (`npx prisma generate`)
   - This regenerates Prisma client with `lastActivity` field
4. ✅ **Run database migrations** (`npx prisma migrate deploy`)
   - **Note:** Migration already applied manually, so this will skip it
   - Verifies migration is in `_prisma_migrations` table
   - Ensures schema matches code
5. ✅ **Build application** (`npm run build`)
6. ✅ **Deploy to Azure** (`TraccEms-Dev-Backend`)

**Expected Behavior:**
- Migration step will show: "No pending migrations to apply" (or similar)
- This is **expected** since migration was already applied manually
- Prisma will verify the migration exists and skip it

#### Frontend Deployment (`dev-fe.yaml`)
1. ✅ **Checkout code** from `develop` branch
2. ✅ **Install dependencies** (`npm install` in `frontend/`)
3. ✅ **Build React app** (`npm run build`)
   - Uses `VITE_API_URL: 'https://dev-api.traccems.com'`
4. ✅ **Deploy to Azure Static Web Apps** (`TraccEms-Dev-Frontend`)

**Timeline:**
- Backend: ~5-10 minutes
- Frontend: ~3-5 minutes
- **Total: ~8-15 minutes**

---

### Phase 3: Verify Deployment Success

**After pushing, monitor:**

#### GitHub Actions
1. Go to: https://github.com/Medic423/medport/actions
2. Watch for:
   - ✅ "develop - Deploy Dev Backend" → Should complete successfully
   - ✅ "develop - Deploy Dev Frontend" → Should complete successfully
3. Check logs if any step fails:
   - **Migration step:** Should show "No pending migrations" (expected)
   - **Build step:** Should complete without errors
   - **Deploy step:** Should show "Deployment successful"

#### Azure Portal
1. Go to: https://portal.azure.com
2. Check:
   - ✅ `TraccEms-Dev-Backend` → Status: Running
   - ✅ `TraccEms-Dev-Frontend` → Status: Running
   - ✅ Deployment Center → Recent deployments show success

#### Database Verification
**CRITICAL:** Verify database schema matches code

**Check via pgAdmin:**
```sql
-- Verify lastActivity column exists and has data
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('healthcare_users', 'ems_users', 'center_users')
AND column_name = 'lastActivity'
ORDER BY table_name;

-- Should return 3 rows showing:
-- healthcare_users | lastActivity | timestamp without time zone | YES
-- ems_users | lastActivity | timestamp without time zone | YES
-- center_users | lastActivity | timestamp without time zone | YES

-- Verify indexes exist
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE tablename IN ('healthcare_users', 'ems_users', 'center_users')
AND indexname LIKE '%lastActivity%';

-- Should return 3 indexes:
-- healthcare_users_lastActivity_idx
-- ems_users_lastActivity_idx
-- center_users_lastActivity_idx
```

**Expected Result:**
- ✅ `lastActivity` column exists in all three tables
- ✅ Indexes exist for performance
- ✅ Column type is `timestamp without time zone` (TIMESTAMP(3))

---

### Phase 4: Test Current Activity Feature on Dev-SWA

**After deployment completes, test:**

#### Test 1: Login and Verify Current Activity Section
1. **Login to dev-swa:** https://dev-swa.traccems.com
2. **Login as TCC Admin** (center user)
3. **Navigate to:** TCC Command dashboard
4. **Expected:** "Current Activity" section appears **above** "Recent Activity"
5. **Verify:**
   - ✅ Section header: "Current Activity"
   - ✅ Facilities Online stats cards visible:
     - "Facilities Online (24h): X"
     - "Facilities Online (Week): Y"
   - ✅ "Show List" / "Hide List" button works
   - ✅ List expands/collapses correctly

#### Test 2: Active Users List
1. **Prerequisites:** Have at least one Healthcare or EMS user logged in recently
2. **Click:** "Show List" button
3. **Expected:** List of active users displays
4. **Verify Display Order:**
   - ✅ Facility/Agency Name (first)
   - ✅ Location (city, state)
   - ✅ Last Activity Time ("Active X minutes ago")
   - ✅ Name (user's name)
5. **Verify Filtering:**
   - ✅ Current user (TCC Admin) NOT in list
   - ✅ Only Healthcare and EMS users shown
   - ✅ Only users active within last 15 minutes
   - ✅ One user per facility/agency (most recent)

#### Test 3: Facilities Online Stats
1. **Check stats cards:**
   - ✅ "Facilities Online (24h): X" shows correct count
   - ✅ "Facilities Online (Week): Y" shows correct count
   - ✅ Counts update when users log in/out
2. **Verify calculation:**
   - Counts distinct facilities/agencies (not individual users)
   - 24h: Users active in last 24 hours
   - Week: Users active in last 7 days

#### Test 4: Auto-Refresh
1. **Open:** Current Activity section
2. **Wait:** 60 seconds
3. **Expected:** List refreshes automatically
4. **Verify:** Newly active users appear, inactive users disappear

#### Test 5: Multiple User Types
1. **Login as Healthcare user** (different browser/incognito)
2. **Navigate around** their dashboard (triggers API calls)
3. **Login as EMS user** (different browser/incognito)
4. **Navigate around** their dashboard
5. **Back in TCC Admin view:**
   - ✅ Both Healthcare and EMS users appear in Current Activity
   - ✅ Each facility/agency shows only one user (most recent)
   - ✅ Location displays correctly for both types

#### Test 6: Edge Cases
1. **No active users:**
   - ✅ Shows "No current active users" message
   - ✅ Stats cards show 0
2. **User becomes inactive:**
   - ✅ Disappears from list after 15 minutes
   - ✅ Stats update accordingly
3. **Multiple users from same facility:**
   - ✅ Only most recent user shown
   - ✅ Facility name appears once

---

## Database Migration Notes

### Migration Already Applied ✅

**Status:** Migration `04-add-lastactivity-to-user-tables.sql` has already been applied to dev-swa database.

**What This Means:**
- ✅ `lastActivity` column exists in all three user tables
- ✅ Indexes created for performance
- ✅ Existing users have `lastActivity` initialized from `lastLogin`

**During Deployment:**
- Prisma `migrate deploy` will check `_prisma_migrations` table
- Will find migration already applied
- Will skip the migration (expected behavior)
- Will verify schema matches code

**If Migration Not Found:**
- If Prisma reports migration missing, it will apply it automatically
- This is safe - migration uses `IF NOT EXISTS` clauses
- No data loss or conflicts

---

## Rollback Plan

### If Deployment Fails

**Scenario 1: Backend Build Failure**
```bash
# 1. Check GitHub Actions logs
# 2. Identify build error
# 3. Fix locally on feature branch
# 4. Commit fix
# 5. Merge to develop again
# 6. Push (after checking no deployments running)
```

**Scenario 2: Frontend Build Failure**
```bash
# 1. Check GitHub Actions logs
# 2. Identify build error
# 3. Fix locally on feature branch
# 4. Commit fix
# 5. Merge to develop again
# 6. Push (after checking no deployments running)
```

**Scenario 3: Runtime Error After Deployment**
```bash
# 1. Check Azure Portal logs
# 2. Check browser console for errors
# 3. Identify issue
# 4. Fix locally on feature branch
# 5. Commit fix
# 6. Merge to develop again
# 7. Push (after checking no deployments running)
```

**Scenario 4: Need to Revert Entire Feature**
```bash
# 1. Revert commits in develop branch
git checkout develop
git revert <commit-range>  # Or revert individual commits

# 2. Push revert
git push origin develop

# 3. This triggers new deployment with reverted code
# Note: Database migration remains (harmless, column just unused)
```

**Database Rollback (If Needed):**
```sql
-- Only if absolutely necessary to remove feature
-- This will remove the lastActivity column and indexes

ALTER TABLE healthcare_users DROP COLUMN IF EXISTS "lastActivity";
ALTER TABLE ems_users DROP COLUMN IF EXISTS "lastActivity";
ALTER TABLE center_users DROP COLUMN IF EXISTS "lastActivity";

DROP INDEX IF EXISTS "healthcare_users_lastActivity_idx";
DROP INDEX IF EXISTS "ems_users_lastActivity_idx";
DROP INDEX IF EXISTS "center_users_lastActivity_idx";
```

**⚠️ Warning:** Database rollback should only be done if feature is completely removed. Otherwise, leaving the column is harmless.

---

## Success Criteria

### ✅ Deployment Successful When:

1. **GitHub Actions:**
   - ✅ Backend deployment: "Completed" (green)
   - ✅ Frontend deployment: "Completed" (green)
   - ✅ No errors in logs
   - ✅ Migration step shows "No pending migrations" (expected)

2. **Azure Portal:**
   - ✅ Backend: Status "Running"
   - ✅ Frontend: Status "Running"
   - ✅ Recent deployments show success

3. **Database:**
   - ✅ Schema matches code (verified via pgAdmin)
   - ✅ `lastActivity` column exists in all tables
   - ✅ Indexes exist
   - ✅ Migration recorded in `_prisma_migrations` table

4. **Functionality:**
   - ✅ Current Activity section displays correctly
   - ✅ Facilities Online stats show correct counts
   - ✅ Active users list displays with correct order
   - ✅ One user per facility/agency (most recent)
   - ✅ Current user excluded from list
   - ✅ Auto-refresh works (60 seconds)
   - ✅ No console errors
   - ✅ No 500 errors

5. **Code Sync:**
   - ✅ `develop` branch contains all Current Activity commits
   - ✅ dev-swa code matches `develop` branch
   - ✅ Local dev code matches `develop` branch (if switched)

---

## Timeline Estimate

**Total Time: ~20-25 minutes**

- Pre-deployment checks: 2-3 minutes
- Merge and push: 1-2 minutes
- Backend deployment: 5-10 minutes
- Frontend deployment: 3-5 minutes
- Verification: 3-5 minutes
- Testing: 5-10 minutes

---

## Next Steps After Successful Deployment

1. ✅ **Test thoroughly on dev-swa**
   - Verify all functionality works
   - Test with multiple user types
   - Verify edge cases

2. ⏳ **Document results**
   - Update this plan with test results
   - Note any issues found
   - Mark checklist items complete

3. ⏳ **Future: Production Deployment**
   - After dev-swa testing successful
   - Merge `develop` → `main`
   - Deploy to production via GitHub Actions (manual trigger)
   - Apply database migration to production database

---

## Questions to Answer Before Proceeding

1. ⏳ **GitHub Actions status:** Are any deployments currently running?
2. ✅ **Ready to merge:** All code tested and verified? ✅ YES
3. ✅ **Database concerns:** Migration already applied? ✅ YES
4. ✅ **Rollback plan:** Understand how to revert if needed? ✅ YES

---

**Status:** ✅ **DEPLOYMENT COMPLETE - READY FOR TESTING**  
**Completed:** Phase 1 (merge) ✅ | Phase 2 (push) ✅ | Phase 3 (deployment) ✅  
**Next:** Phase 4 (testing) - Ready to begin
