# Dev-SWA Rollback Plan - SMS Notifications Fix
**Date:** January 12, 2026  
**Status:** ✅ **ROLLBACK COMPLETE** - Pushed to develop, deployment triggered

---

## Problem

Backend appears to be in a problematic state after SMS notifications fix deployment. User reports backend is "stuck" and repeating commands, despite logs showing some successful requests.

---

## Rollback Target

**Current Commit (to rollback):**
- `3d3d1b7a` - "fix: EMS Agency Info SMS Notifications persistence"

**Target Commit (rollback to):**
- `82713728` - "docs: Add deployment and testing documentation" (commit before SMS fix)

**Alternative (if 82713728 has issues):**
- `80d191d9` - "fix: EMS Providers GPS lookup - USER VERIFIED WORKING"

---

## What Will Be Reverted

### Code Changes (Will be removed):
- ❌ `backend/src/routes/auth.ts` - SMS notifications handling changes
- ❌ `frontend/src/components/AgencySettings.tsx` - SMS notifications payload changes

### Database Changes (Will remain):
- ✅ `acceptsNotifications` column in `ems_agencies` table - **PRESERVED**
- ✅ All other database schema - **PRESERVED**

**Important:** Rolling back code does NOT affect the database. The `acceptsNotifications` column will remain in the database, but the code won't try to use it.

---

## Rollback Executed

**Revert Commit:** `9bdb1592` - "Revert 'fix: EMS Agency Info SMS Notifications persistence'"  
**Pushed:** ✅ January 12, 2026 at 14:38 EST  
**Branch:** `develop`  
**Status:** ✅ Pushed successfully, deployment triggered

---

## Rollback Steps (COMPLETED)

### Step 1: Verify Current Branch ✅

```bash
cd /Users/scooper/Code/tcc-new-project
git status
# Should be on 'develop' branch
```

### Step 2: Create Rollback Branch ✅
**Skipped** - Reverted directly on `develop` branch

### Step 3: Revert the SMS Notifications Commit ✅
**Executed:** `git revert 3d3d1b7a --no-edit`
- Created commit `9bdb1592`
- Reverted changes to `backend/src/routes/auth.ts` and `frontend/src/components/AgencySettings.tsx`

### Step 4: Review Changes ✅
**Verified:**
- `backend/src/routes/auth.ts` - 8 lines removed (SMS notifications handling)
- `frontend/src/components/AgencySettings.tsx` - 7 lines removed (SMS notifications payload)

### Step 5: Push Rollback Branch ✅
**Skipped** - Pushed directly to `develop`

### Step 6: Push to Develop (Triggers Deployment) ✅
**Executed:** `git push origin develop`
- Pushed commit `9bdb1592` to `develop` branch
- GitHub Actions deployment triggered automatically

---

## Alternative: Reset to Previous Commit

**If revert doesn't work, use reset:**

```bash
# WARNING: This rewrites history
git checkout develop
git reset --hard 82713728
git push origin develop --force-with-lease
```

**⚠️ Only use this if revert fails!**

---

## Verification After Rollback

### 1. Check GitHub Actions

**After pushing to develop:**
- Go to: https://github.com/Medic423/medport/actions
- Watch: `develop - Deploy Dev Backend` workflow
- Should complete successfully

### 2. Check Backend Logs

**Azure Portal → TraccEms-Dev-Backend → Log Stream**

**Look for:**
- ✅ `🚀 TCC Backend server running on port...`
- ✅ No errors related to `acceptsNotifications`
- ✅ Successful API requests

### 3. Test Login

**Try logging in:**
- URL: `https://dev-swa.traccems.com`
- Should work without 503 errors

### 4. Test Agency Info (Without SMS Notifications)

**After rollback:**
- Navigate to EMS Module → Agency Info
- SMS Notifications checkbox may not work (expected - we rolled back the fix)
- Other fields should work normally

---

## What Happens to SMS Notifications Feature

**After rollback:**
- ❌ SMS Notifications checkbox will NOT persist (we rolled back the fix)
- ✅ Database column `acceptsNotifications` still exists
- ✅ Can re-implement the fix later with a better approach

---

## Next Steps After Rollback

1. **Verify backend is working** (login, basic functionality)
2. **Investigate root cause** of the original issue
3. **Re-implement SMS notifications fix** with proper testing
4. **Test thoroughly** before deploying again

---

## Notes

- **Database is safe:** Rolling back code does NOT affect database schema
- **Can re-implement:** The fix can be re-applied later after investigating the issue
- **No data loss:** All database data remains intact
