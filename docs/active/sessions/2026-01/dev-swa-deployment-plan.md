# Dev-SWA Deployment Plan
**Date:** January 10, 2026  
**Purpose:** Deploy healthcare destinations and available agencies fixes to dev-swa  
**Status:** 📋 **PLAN - READY FOR REVIEW**

---

## Executive Summary

**Goal:** Deploy all fixes to dev-swa while ensuring:
1. ✅ **No changes to local dev** (local dev remains unchanged)
2. ✅ **Code sync:** dev-swa code matches local dev code
3. ✅ **Database sync:** dev-swa database matches local dev database schema
4. ✅ **Both environments identical** after deployment

**Current State:**
- **Branch:** `fix/healthcare-destinations-available-agencies`
- **Status:** All fixes verified working on local dev
- **Commits:** 2 commits ready to merge to `develop`

---

## Pre-Deployment Checklist

### ✅ Step 1: Verify Local Dev Status
- [x] All fixes tested and verified working on local dev
- [x] Git commits made with "USER VERIFIED WORKING"
- [x] Working tree is clean (test scripts remain untracked - intentional)
- [x] Backup completed to both locations

### ✅ Step 2: Check GitHub Actions Status
- [x] Confirmed no deployments running
- [x] Safe to proceed with push

### ✅ Step 3: Phase 1 Complete - Merge to Develop
- [x] Switched to develop branch
- [x] Pulled latest from origin/develop
- [x] Merged feature branch (fast-forward merge)
- [x] Merge successful: 30 files changed, 3,563 insertions, 1,505 deletions

### ✅ Step 4: Phase 2 Complete - Push to Develop
- [x] Pushed to origin/develop
- [x] GitHub Actions workflows triggered
- [x] Backend deployment completed
- [x] Frontend deployment completed
**CRITICAL:** Must check before pushing!

**Action Required:**
1. Go to: https://github.com/Medic423/medport/actions
2. Filter by workflow: "develop - Deploy Dev Backend"
3. Check status:
   - ✅ **"Completed"** (green) → Safe to proceed
   - ⚠️ **"In progress"** (orange) → **WAIT - DO NOT PUSH**
   - ⚠️ **"Queued"** (yellow) → **WAIT - DO NOT PUSH**

**If deployment is running:**
- Wait for completion (5-10 minutes)
- Do NOT push until status is "Completed"

**If no deployments running:**
- ✅ Safe to proceed with merge and push

---

## Deployment Plan

### Phase 1: Merge Feature Branch to Develop

**Current Branch:** `fix/healthcare-destinations-available-agencies`  
**Target Branch:** `develop`

**Commands:**
```bash
# 1. Ensure we're on feature branch
git checkout fix/healthcare-destinations-available-agencies

# 2. Ensure local develop is up to date
git checkout develop
git pull origin develop

# 3. Merge feature branch into develop
git merge fix/healthcare-destinations-available-agencies --no-edit

# 4. Verify merge
git log --oneline -5
```

**What This Does:**
- Merges all fixes from feature branch into `develop`
- Triggers automatic deployment to dev-swa (via GitHub Actions)
- **Does NOT change local dev** (we're just merging branches)

**Expected Commits in `develop`:**
1. `b3e27fb7` - fix: Healthcare destinations and available agencies - USER VERIFIED WORKING
2. `55155947` - chore: Clean up documentation and add backup script

---

### Phase 2: Push to Develop (Triggers Automatic Deployment)

**CRITICAL:** Only push if GitHub Actions shows no deployments running!

**Commands:**
```bash
# 1. Push to develop (triggers automatic deployment)
git push origin develop

# 2. Monitor GitHub Actions immediately
# Go to: https://github.com/Medic423/medport/actions
```

**What Happens Automatically:**

#### Backend Deployment (`dev-be.yaml`)
1. ✅ **Checkout code** from `develop` branch
2. ✅ **Install dependencies** (`npm install` in `backend/`)
3. ✅ **Generate Prisma models** (`npx prisma generate`)
4. ✅ **Run database migrations** (`npx prisma migrate deploy`)
   - **CRITICAL:** This ensures dev-swa database matches schema
   - Uses `DATABASE_URL` secret (points to dev-swa database)
   - Applies any pending migrations automatically
5. ✅ **Build application** (`npm run build`)
6. ✅ **Deploy to Azure** (`TraccEms-Dev-Backend`)

**Expected Migration:**
- If `availabilityStatus` column doesn't exist in dev-swa, migration will add it
- If schema changes exist, they'll be applied automatically

#### Frontend Deployment (`dev-fe.yaml`)
1. ✅ **Checkout code** from `develop` branch
2. ✅ **Install dependencies** (`npm install` in `frontend/`)
3. ✅ **Build React app** (`npm run build`)
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
3. Check logs if any step fails

#### Azure Portal
1. Go to: https://portal.azure.com
2. Check:
   - ✅ `TraccEms-Dev-Backend` → Status: Running
   - ✅ `TraccEms-Dev-Frontend` → Status: Running
   - ✅ Deployment Center → Recent deployments show success

#### Database Verification
**CRITICAL:** Verify database schema matches local dev

**Check via pgAdmin or Azure Portal:**
```sql
-- Verify availabilityStatus column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ems_agencies' 
  AND column_name = 'availabilityStatus';

-- Should return:
-- availabilityStatus | jsonb

-- Verify HealthcareDestination table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'healthcare_destinations'
ORDER BY ordinal_position;

-- Should match local dev structure (camelCase columns)
```

**Expected Result:**
- ✅ `availabilityStatus` column exists in `ems_agencies`
- ✅ `healthcare_destinations` table has camelCase columns (not snake_case)
- ✅ Schema matches local dev exactly

---

### Phase 4: Test on Dev-SWA

**After deployment completes, test:**

#### Available Agencies Tab
1. Login to dev-swa: https://dev.traccems.com
2. Navigate to: Healthcare → Available Agencies
3. **Expected:** Should load without "Failed to load available agencies" error
4. **Verify:** Agencies display correctly
5. **Status:** ✅ **VERIFIED WORKING** - January 10, 2026

#### Destinations Tab
1. Navigate to: Healthcare → Destinations
2. Click "Add Destination"
3. **Test GPS Lookup:**
   - Enter address
   - Click "Lookup GPS"
   - **Expected:** GPS coordinates populate correctly
   - **Status:** ✅ **VERIFIED WORKING** - January 10, 2026
4. **Test Save:**
   - Fill in required fields
   - Click "Add Destination"
   - **Expected:** Destination saves successfully (no database errors)
   - **Status:** ✅ **VERIFIED WORKING** - January 10, 2026

---

## Database Synchronization

### How Database Sync Works

**Automatic Migration Process:**
1. When backend deploys, GitHub Actions runs: `npx prisma migrate deploy`
2. This command:
   - Reads `backend/prisma/migrations/` directory
   - Checks `_prisma_migrations` table in dev-swa database
   - Applies any migrations that haven't been applied yet
   - Updates `_prisma_migrations` table to track applied migrations

**What Gets Synced:**
- ✅ **Schema changes** (new tables, columns, indexes)
- ✅ **Data structure** (column types, constraints)
- ✅ **Migration history** (tracked in `_prisma_migrations` table)

**What Does NOT Get Synced:**
- ❌ **Data content** (dev-swa keeps its own test data)
- ❌ **Local dev data** (local dev keeps its own data)

**Result:**
- ✅ **Schema:** dev-swa database schema matches local dev schema
- ✅ **Code:** dev-swa code matches local dev code
- ✅ **Data:** Each environment keeps its own data (by design)

---

## Post-Deployment Verification

### Code Sync Verification

**Verify code matches:**
```bash
# On local dev, compare with develop branch
git checkout develop
git pull origin develop

# Compare with feature branch (should be identical now)
git diff fix/healthcare-destinations-available-agencies develop
# Should show no differences (or only expected differences)
```

**Expected Result:**
- ✅ All fixes from feature branch are in `develop`
- ✅ `develop` branch matches what's deployed to dev-swa
- ✅ Local dev code matches dev-swa code

### Database Sync Verification

**Compare schemas:**

**Local Dev:**
```bash
# Connect to local database
psql -d medport_ems

# Check availabilityStatus column
\d ems_agencies
# Should show: availabilityStatus | jsonb

# Check healthcare_destinations structure
\d healthcare_destinations
# Should show camelCase columns
```

**Dev-SWA (via pgAdmin or Azure Portal):**
```sql
-- Same checks as above
-- Should match local dev exactly
```

**Expected Result:**
- ✅ Schema structures match exactly
- ✅ Column names match (camelCase)
- ✅ Column types match
- ✅ Constraints match

---

## What Happens to Local Dev?

### ✅ Local Dev Remains Unchanged

**After deployment:**
- ✅ **Local dev code:** Unchanged (still on feature branch or can switch to develop)
- ✅ **Local dev database:** Unchanged (still has local test data)
- ✅ **Local dev environment:** Still works exactly as before

**Why:**
- Deployment only affects dev-swa (Azure environment)
- Local dev is completely separate
- Merging to `develop` doesn't change local files
- Pushing to `develop` doesn't change local files

**If you want local dev to match develop:**
```bash
# Option 1: Switch to develop branch
git checkout develop
git pull origin develop

# Option 2: Keep feature branch (for continued work)
git checkout fix/healthcare-destinations-available-agencies
```

---

## Risk Assessment

### Low Risk Items ✅
- ✅ **Code deployment:** Standard GitHub Actions workflow
- ✅ **Frontend deployment:** Standard Static Web Apps deployment
- ✅ **Database migrations:** Automatic via `prisma migrate deploy`
- ✅ **Local dev impact:** None (completely separate)

### Medium Risk Items ⚠️
- ⚠️ **Database migration failures:** If migration fails, deployment stops
  - **Mitigation:** Check logs, fix manually via pgAdmin if needed
  - **Recovery:** Follow deployment guide troubleshooting section
- ⚠️ **Concurrent deployments:** If deployment already running
  - **Mitigation:** Check GitHub Actions before pushing
  - **Recovery:** Wait for completion, then push

### High Risk Items ❌
- ❌ **None identified** - Standard deployment process

---

## Rollback Plan

### If Deployment Fails

**Scenario 1: Migration Failure**
```bash
# 1. Check GitHub Actions logs
# 2. Identify failed migration
# 3. Apply migration manually via pgAdmin (see deployment guide)
# 4. Retry deployment (or push fix)
```

**Scenario 2: Code Deployment Failure**
```bash
# 1. Check GitHub Actions logs
# 2. Identify error
# 3. Fix locally
# 4. Commit fix
# 5. Push again (after checking no deployments running)
```

**Scenario 3: Need to Revert**
```bash
# 1. Revert commit in develop branch
git checkout develop
git revert <commit-hash>

# 2. Push revert
git push origin develop

# 3. This triggers new deployment with reverted code
```

---

## Success Criteria

### ✅ Deployment Successful When:

1. **GitHub Actions:**
   - ✅ Backend deployment: "Completed" (green)
   - ✅ Frontend deployment: "Completed" (green)
   - ✅ No errors in logs

2. **Azure Portal:**
   - ✅ Backend: Status "Running"
   - ✅ Frontend: Status "Running"
   - ✅ Recent deployments show success

3. **Database:**
   - ✅ Schema matches local dev
   - ✅ Migrations applied successfully
   - ✅ No drift issues

4. **Functionality:**
   - ✅ Available Agencies tab works
   - ✅ Destinations GPS lookup works
   - ✅ Destinations save works
   - ✅ No 500 errors

5. **Code Sync:**
   - ✅ `develop` branch contains all fixes
   - ✅ dev-swa code matches `develop` branch
   - ✅ Local dev code matches `develop` branch (if switched)

---

## Timeline Estimate

**Total Time: ~15-20 minutes**

- Pre-deployment checks: 2-3 minutes
- Merge and push: 1 minute
- Backend deployment: 5-10 minutes
- Frontend deployment: 3-5 minutes
- Verification: 3-5 minutes

---

## Next Steps After Deployment

1. ✅ **Test on dev-swa:** COMPLETE
   - ✅ Available Agencies tab - VERIFIED WORKING (Jan 10, 2026)
   - ✅ Destinations GPS lookup - VERIFIED WORKING (Jan 10, 2026)
   - ✅ Destinations save - VERIFIED WORKING (Jan 10, 2026)

2. ✅ **Verify database sync:** COMPLETE
   - ✅ Schema matches local dev (confirmed via functionality)
   - ✅ Migrations applied successfully
   - ✅ No schema drift detected

3. ✅ **Document results:** COMPLETE
   - ✅ Updated checklist
   - ✅ All features verified working
   - ✅ No issues found

4. ⏳ **Future:**
   - Create PR to merge `develop` → `main` (for production)
   - Or continue development on feature branch

---

## Questions to Answer Before Proceeding

1. ✅ **GitHub Actions status:** Are any deployments currently running?
2. ✅ **Ready to merge:** Are all fixes tested and verified?
3. ✅ **Database concerns:** Any known schema differences?
4. ✅ **Rollback plan:** Understand how to revert if needed?

---

**Status:** ✅ **DEPLOYMENT COMPLETE AND SUCCESSFUL**  
**Completion Date:** January 10, 2026  
**Result:** All features verified working on dev-swa - Code and database in sync with local dev
