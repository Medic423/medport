# Azure Deployment Guide
**Last Updated:** January 9, 2026  
**Status:** ✅ **COMPREHENSIVE REFERENCE** - All deployment knowledge in one place

---

## Table of Contents

1. [Critical Rules](#critical-rules)
2. [Node Modules Deployment Strategy](#node-modules-deployment-strategy)
3. [Automatic Deployment Triggers](#automatic-deployment-triggers)
4. [Deployment Workflow](#deployment-workflow)
5. [Troubleshooting](#troubleshooting)
6. [Quick Reference](#quick-reference)

---

## ⚠️ CRITICAL RULES

### Rule 0: Documentation Changes Don't Trigger Deployments
**Note:** Workflows are configured with path filters to only trigger on code changes:
- **Backend deployments:** Only trigger on `backend/**` changes
- **Frontend deployments:** Only trigger on `frontend/**` changes
- **Workflow changes:** Changes to `.github/workflows/dev-be.yaml` or `dev-fe.yaml` will trigger deployments
- **Documentation changes (`docs/**`):** Will NOT trigger deployments ✅
- This prevents unnecessary deployments for documentation-only commits

**Implementation:**
```yaml
on:
  push:
    branches:
      - develop
    paths:
      - 'backend/**'           # Backend code changes
      - '.github/workflows/dev-be.yaml'  # Workflow changes
```

**Benefits:**
- ✅ Documentation commits don't trigger 5-10 minute deployments
- ✅ Reduces deployment queue buildup
- ✅ Faster development workflow for documentation
- ✅ Deployment time is primarily due to 184MB node_modules, not docs

**If you need to skip deployment for any commit (including code changes):**
- Add `[skip ci]` or `[ci skip]` to commit message
- Useful for temporary commits or testing

### Rule 1: Never Push While Deployment Is In Progress
**Why:** Deployments on top of deployments cause incomplete/mixed code, backend crashes, and service interruption.

**How to Check:**
1. Go to: https://github.com/Medic423/medport/actions
2. Filter by workflow: "develop - Deploy Dev Backend"
3. Check status:
   - ✅ **"Completed"** (green) → Safe to push
   - ⚠️ **"In progress"** (orange) → **WAIT - DO NOT PUSH**
   - ⚠️ **"Queued"** (yellow) → **WAIT - DO NOT PUSH**

**What Happens If You Push Anyway:**
- New deployment queues up
- When it starts, it may interrupt/deploy on top of in-progress deployment
- Result: Incomplete code, backend crashes, service down

### Rule 2: Wait for Deployments to Complete
**Standard Deployment Time:**
- Backend: ~5-10 minutes
- Frontend: ~3-5 minutes
- Static Web Apps: ~2-4 minutes

**If Deployment Takes >15 Minutes:**
- ⚠️ Something is wrong
- Check GitHub Actions logs
- Check Azure Portal
- **DO NOT push new commit** (makes it worse)
- Consider canceling if confirmed stuck

### Rule 3: Batch Commits When Possible
**Best Practice:**
- Make multiple changes locally
- Test locally
- Push once with all changes
- Wait for deployment to complete

**Why:**
- Reduces number of deployments
- More efficient
- Better git history
- Less chance of deployment conflicts

### Rule 4: Check Deployment Status Before Pushing
**Always Check:**
1. GitHub Actions - Are any deployments running?
2. Azure Portal - Is backend stable?
3. Logs - Any errors in recent deployments?

**If Unsure:**
- Wait 5 minutes
- Check again
- Better to wait than cause issues

---

## Node Modules Deployment Strategy

### ⚠️ CRITICAL: Do Not Use Archive Approach

**DO NOT** attempt to use `node_modules.tar.gz` archive extraction for Azure deployments. This approach has been tried multiple times and consistently fails.

### Current Strategy: Direct Deployment

**Approach:**
- **Deploy `node_modules` directory directly** in the deployment package
- No compression, no extraction, no archive creation
- Package size: ~184MB (uncompressed)
- Deployment time: Standard (no extraction delays)

**Why This Works:**
- ✅ **Reliable** - No extraction step that can hang/timeout
- ✅ **Fast startup** - Backend starts immediately
- ✅ **Simple** - No complex extraction logic needed
- ✅ **Proven** - This approach was successful in the past (January 6, 2026)

**Implementation:**
- GitHub Actions workflow installs dependencies with `npm install`
- `node_modules` directory is **included** in deployment package
- Azure App Service receives complete package with dependencies
- Backend starts with `npm start` → `node dist/index.js`
- No extraction scripts or startup delays

### Failed Approaches (DO NOT USE)

#### ❌ Archive Extraction Approach
**What was tried:**
- Create `node_modules.tar.gz` archive (~50MB compressed)
- Remove `node_modules` before deployment
- Extract archive on Azure startup

**Why it failed:**
- Archive extraction consistently hangs/times out
- Extraction takes 4+ minutes and often fails
- Backend crashes with "Cannot find module 'express'"
- Multiple attempts (January 6, 2026 and January 9, 2026) both failed

**Commits that implemented this (REVERTED):**
- `8ccd155f` - Archive creation
- `46f4b1b0` - Production workflow archive
- `97f18594` - Archive timeout/logging
- `9ca138ed` - Prestart hook extraction
- `7b239df5` - Inline extraction in start script

**Final revert commit:**
- `174c97ea` - Deploy node_modules directly instead of using archive

### Workflow Configuration

**Dev-SWA Workflow (`.github/workflows/dev-be.yaml`):**
```yaml
- name: Install dependencies
  run: npm install
  working-directory: './backend'

- name: Build application
  run: npm run build
  working-directory: './backend'

# NO archive creation step
# NO node_modules removal step

- name: Deploy to Azure Web App
  uses: azure/webapps-deploy@v2
  with:
    package: './backend'  # Includes node_modules directory
```

**Package.json Start Scripts:**

✅ **Current (Simple):**
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "start:prod": "node dist/production-index.js"
  }
}
```

❌ **Do NOT Use (Archive Extraction):**
```json
{
  "scripts": {
    "prestart": "extract archive...",
    "start": "extract && node dist/index.js"
  }
}
```

---

## Automatic Deployment Triggers

### Problem: Multiple Deployments Triggering Automatically

When pushing to `develop` branch, **multiple deployments can trigger automatically**, causing:
- Multiple GitHub Actions workflows running simultaneously
- Deployment conflicts (409 errors)
- Confusion about which deployment is actually deploying
- Backend restarts interrupting each other

### Root Causes

#### 1. Azure App Service Deployment Center
**Issue:** Azure App Service may have automatic deployments enabled via Deployment Center, which triggers deployments independently of GitHub Actions.

**How to Check:**
1. Azure Portal → TraccEms-Dev-Backend
2. Deployment Center (left sidebar)
3. Check if "Continuous deployment" is enabled
4. If enabled, it may trigger deployments on every push

**Solution:**
- Disable Deployment Center automatic deployments if using GitHub Actions
- OR use Deployment Center exclusively (not both)

#### 2. Multiple Workflows Triggering
**Current Workflows:**
- `dev-be.yaml` - Triggers on push to `develop` ✅ (intended)
- `dev-fe.yaml` - Triggers on push to `develop` ✅ (intended)
- `azure-static-web-apps-*.yml` - Triggers on push to `develop` ✅ (intended)
- `main_traccems-prod-backend.yml` - Triggers on push to `main` ⚠️ (old workflow, should not affect develop)

**Solution:**
- Concurrency control is already in place
- Multiple workflows for different services (backend/frontend) is normal
- Issue is when SAME service gets multiple deployments

#### 3. Concurrency Control Behavior
**Current Configuration:**
```yaml
concurrency:
  group: deploy-dev-backend
  cancel-in-progress: false
```

**What Happens:**
- ✅ Prevents multiple deployments from running simultaneously
- ✅ Queues new deployments if one is already running
- ⚠️ **BUT:** If you push multiple commits quickly, each push triggers a new deployment
- ⚠️ **RESULT:** Multiple deployments queue up, causing confusion

**Example Scenario:**
1. Push commit A → Deployment 1 starts
2. Push commit B (while Deployment 1 running) → Deployment 2 queued
3. Push commit C (while Deployment 1 running) → Deployment 3 queued
4. Deployment 1 completes → Deployment 2 starts
5. Deployment 2 completes → Deployment 3 starts
6. **Problem:** Backend restarts multiple times, interrupting service

### Critical Issue: Deployments on Top of Deployments

**Problem:**
When deployments trigger while another deployment is already in progress, the new deployment can:
- **Interrupt the in-progress deployment** - Causing it to fail or hang
- **Deploy incomplete code** - Files may be partially deployed
- **Cause backend crashes** - Backend may start with incomplete/mixed code
- **Create inconsistent state** - Some files from old deployment, some from new

**Symptoms:**
- ✅ Deployment running for 15+ minutes (should take ~5-10 minutes)
- ✅ `npm start` produces no output (deployment may be interrupted)
- ✅ Backend not responding (incomplete deployment)
- ✅ Multiple deployments queued (concurrency control working, but deployments still interfere)

**Root Cause:**
- Azure can only handle **one deployment at a time** to the same App Service
- When a new deployment starts while another is in progress:
  - Azure may **cancel** the in-progress deployment
  - OR Azure may **queue** the new deployment (but files may be partially overwritten)
  - OR Azure may **merge** deployments (causing inconsistent state)

**Solution:**
- ⚠️ **NEVER push while a deployment is in progress**
- Wait for deployment to show "Completed" before pushing again
- Check deployment status before every push
- If deployment is taking >15 minutes, investigate before pushing

---

## Deployment Workflow

### Standard Workflow
```
1. Make changes locally
2. Test locally
3. Commit changes
4. Check GitHub Actions - Any deployments running?
   → If YES: Wait for completion
   → If NO: Continue
5. Push to develop
6. Monitor GitHub Actions
7. Wait for deployment to complete (5-10 minutes)
8. Test deployed code
9. Make next changes (repeat from step 1)
```

### If Deployment Fails
```
1. Check GitHub Actions logs
2. Identify error
3. Fix issue locally
4. Test fix locally
5. Commit fix
6. Check GitHub Actions - Any deployments running?
   → If YES: Wait
   → If NO: Continue
7. Push fix
8. Monitor deployment
```

### If Deployment Is Stuck (>15 minutes)
```
1. Check GitHub Actions logs - Which step is stuck?
2. Check Azure Portal - Is deployment actually running?
3. Check Azure logs - Any errors?
4. If confirmed stuck:
   a. Cancel stuck deployment in GitHub Actions
   b. Wait 2 minutes
   c. Push again to trigger fresh deployment
5. If not stuck, just slow:
   a. Wait - Don't interrupt
   b. Monitor logs
```

---

## Troubleshooting

### Common Mistakes

#### ❌ Mistake 1: Rapid-Fire Pushes
**What:** Pushing multiple commits in quick succession  
**Result:** Multiple deployments queue up, interfere with each other  
**Fix:** Batch commits, wait between pushes

#### ❌ Mistake 2: Pushing While Deployment Running
**What:** Pushing new commit while deployment is in progress  
**Result:** New deployment queues, may interfere with in-progress deployment  
**Fix:** Always check GitHub Actions before pushing

#### ❌ Mistake 3: Pushing to Fix Deployment Issue
**What:** Deployment stuck, push new commit to "fix" it  
**Result:** Makes problem worse, adds more deployments  
**Fix:** Investigate first, cancel if needed, then push

#### ❌ Mistake 4: Not Monitoring Deployments
**What:** Push and forget, don't check if deployment succeeded  
**Result:** Deployments fail silently, issues discovered later  
**Fix:** Always monitor GitHub Actions after pushing

### Monitoring Deployments

#### GitHub Actions
**URL:** https://github.com/Medic423/medport/actions

**What to Check:**
- ✅ Deployment status (Completed/In progress/Failed)
- ✅ Which step failed (if failed)
- ✅ How long deployment is taking
- ✅ If multiple deployments are queued

#### Azure Portal
**URL:** https://portal.azure.com → TraccEms-Dev-Backend

**What to Check:**
- ✅ App Service status (Running/Stopped)
- ✅ Deployment Center → Recent deployments
- ✅ Log stream → Backend startup messages
- ✅ Health endpoint → Is backend responding?

### How to Identify Issues

#### Symptoms of Deployment Problems
- ✅ Multiple GitHub Actions workflows running for same service
- ✅ Backend restarts multiple times in quick succession
- ✅ Log stream shows repeated startup sequences
- ✅ "No new trace" messages appearing frequently
- ✅ Deployment running >15 minutes
- ✅ Backend not responding after deployment

#### Check GitHub Actions
1. Go to: https://github.com/Medic423/medport/actions
2. Filter by workflow: "develop - Deploy Dev Backend"
3. Look for:
   - Multiple workflows with status "In progress" or "Queued"
   - Same commit triggering multiple workflows
   - Different commits queued up

#### Check Azure Deployment Center
1. Azure Portal → TraccEms-Dev-Backend
2. Deployment Center
3. Check "Continuous deployment" status
4. Check deployment history for duplicate deployments

---

## Quick Reference

### Before Every Push
1. ✅ Check GitHub Actions - Any deployments running?
2. ✅ If YES → Wait
3. ✅ If NO → Push

### After Every Push
1. ✅ Monitor GitHub Actions
2. ✅ Wait for deployment to complete
3. ✅ Test deployed code
4. ✅ Check Azure logs if issues

### If Deployment Stuck
1. ✅ Check logs
2. ✅ Investigate cause
3. ✅ Cancel if confirmed stuck
4. ✅ Wait 2 minutes
5. ✅ Push again

### When to Push
- ✅ After previous deployment completes
- ✅ When you have a complete set of changes
- ✅ When backend is stable

### When NOT to Push
- ❌ While deployment is in progress
- ❌ Multiple times in quick succession
- ❌ When debugging deployment issues

---

## Database Migrations: When to Use pgAdmin

### ⚠️ CRITICAL: Consider pgAdmin for Complex Migrations

**Key Insight:** When automated Prisma migrations fail during deployment, pgAdmin can be a more reliable approach, especially for production database synchronization and resolving database drift.

---

### What is Database Drift?

**Database Drift** occurs when the actual database schema doesn't match what Prisma's migration tracking system thinks it should be. This happens when:

1. **Manual Changes:** Database changes made directly via SQL (pgAdmin, psql, etc.) bypass Prisma's migration tracking
2. **Partial Migrations:** Migrations that partially apply (some changes succeed, others fail)
3. **Migration State Conflicts:** The `_prisma_migrations` table gets out of sync with actual schema
4. **Failed Deployments:** Migration failures leave database in inconsistent state

**Symptoms of Database Drift:**
- ✅ "Column already exists" errors during migration
- ✅ "Migration already applied" errors (but schema doesn't match)
- ✅ Features work in dev/dev-swa but fail in production
- ✅ Missing tables/columns in production that exist in dev
- ✅ Prisma migration tracking shows migrations applied, but schema doesn't match

---

### Pre-Testing Drift Check: Do This First

**⚠️ CRITICAL:** Before starting comprehensive testing, perform a quick drift assessment to identify any obvious schema differences. This prevents wasting time testing features that will fail due to missing database structures.

#### Quick Pre-Testing Checklist

**1. Check Critical Tables Exist:**
```sql
-- Run in pgAdmin for dev-swa database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Compare with expected tables from Prisma schema
-- Key tables to verify:
-- - trips
-- - agency_responses
-- - dropdown_options
-- - dropdown_categories
-- - healthcare_locations
-- - ems_agencies
```

**2. Check Critical Columns Exist:**
```sql
-- Example: Check trips table has essential columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'trips'
ORDER BY column_name;

-- Verify key columns exist (compare with local dev)
```

**3. Quick Functionality Test:**
- ✅ Can login (already confirmed)
- ✅ Can navigate to main pages
- ✅ No immediate 500 errors on page load

**If Pre-Testing Check Reveals Issues:**
- ⚠️ **Missing critical tables/columns** → Fix drift BEFORE testing
- ⚠️ **Obvious schema mismatches** → Fix drift BEFORE testing
- ✅ **Minor differences** → Can proceed with testing, note for later

**Time Investment:** 5-10 minutes for quick check vs. hours of testing that might fail due to drift.

---

### What to Do If Drift Symptoms Appear During Testing

**Key Principle:** Not all drift symptoms require immediate stopping. It depends on the severity and impact.

#### 🛑 STOP Testing and Fix Immediately If:

1. **Critical Functionality Broken:**
   - ✅ Cannot create trips (missing `trips` table or critical columns)
   - ✅ Cannot dispatch (missing `agency_responses` table)
   - ✅ Cannot login (missing user tables)
   - ✅ 500 errors on core features
   - **Reason:** Testing is meaningless if core features don't work

2. **Widespread Schema Mismatches:**
   - ✅ Multiple tables missing
   - ✅ Many columns missing across multiple tables
   - ✅ Database structure fundamentally different
   - **Reason:** Fixing drift will likely resolve multiple test failures

3. **Migration Errors During Deployment:**
   - ✅ "Column already exists" errors
   - ✅ "Migration already applied" errors
   - ✅ Deployment failing due to migration conflicts
   - **Reason:** This indicates active drift that will block future deployments

#### ⚠️ Continue Testing But Document If:

1. **Non-Critical Features Affected:**
   - ✅ Advanced features not working (analytics, reporting)
   - ✅ Optional features missing (notifications, preferences)
   - ✅ Features that aren't part of core workflow
   - **Action:** Continue testing core functionality, document issues for later fix

2. **Minor Column Differences:**
   - ✅ Missing optional columns (timestamps, metadata)
   - ✅ Extra columns that don't break functionality
   - ✅ Naming convention differences (if handled by Prisma @map)
   - **Action:** Continue testing, note differences for later alignment

3. **Isolated Issues:**
   - ✅ One specific feature not working
   - ✅ One table missing (non-critical)
   - ✅ Can test other features successfully
   - **Action:** Continue testing other features, fix isolated issue after testing

#### ✅ Continue Testing If:

1. **Symptoms Are Expected:**
   - ✅ Different data (dev-swa has different test data than local)
   - ✅ Different behavior due to data differences (not schema)
   - ✅ UI differences (not database-related)
   - **Action:** These aren't drift - continue testing

2. **Symptoms Are Cosmetic:**
   - ✅ Missing optional display fields
   - ✅ Different default values
   - ✅ UI layout differences
   - **Action:** Not drift-related, continue testing

---

### Decision Tree: Stop Testing or Continue?

```
During Testing → Encounter Issue
│
├─ Is it a 500 error on core feature?
│  ├─ YES → 🛑 STOP, check database schema
│  └─ NO → Continue
│
├─ Is it "Column already exists" or migration error?
│  ├─ YES → 🛑 STOP, fix drift immediately
│  └─ NO → Continue
│
├─ Is it missing critical table/column?
│  ├─ YES → 🛑 STOP, fix drift before continuing
│  └─ NO → Continue
│
├─ Is it non-critical feature not working?
│  ├─ YES → ⚠️ Document, continue testing core features
│  └─ NO → Continue
│
└─ Is it data difference (not schema)?
   ├─ YES → ✅ Continue (expected)
   └─ NO → Investigate further
```

---

### Recommended Workflow

#### Before Testing:
1. ✅ **Quick Pre-Testing Check** (5-10 minutes)
   - Verify critical tables exist
   - Verify critical columns exist
   - Quick smoke test (login, navigate)

2. ✅ **If Issues Found:**
   - Fix critical drift issues first
   - Then proceed with testing

3. ✅ **If No Issues Found:**
   - Proceed with comprehensive testing

#### During Testing:
1. ✅ **If Core Feature Fails:**
   - Stop testing that feature
   - Check if it's drift-related
   - Fix drift if needed
   - Resume testing

2. ✅ **If Non-Critical Feature Fails:**
   - Document the issue
   - Continue testing other features
   - Fix after testing complete

3. ✅ **If Uncertain:**
   - Check browser console for errors
   - Check network tab for API errors
   - Check Azure logs for backend errors
   - Determine if drift-related or code issue

#### After Testing:
1. ✅ **Document All Drift Issues Found**
2. ✅ **Prioritize Fixes:**
   - Critical (blocks core functionality) → Fix immediately
   - High (affects important features) → Fix soon
   - Medium (affects optional features) → Fix when convenient
   - Low (cosmetic/minor) → Fix if time permits

3. ✅ **Fix Drift Issues:**
   - Use pgAdmin for complex fixes
   - Apply migrations incrementally
   - Verify fixes
   - Re-test affected features

---

### Why Fix Drift Before Testing?

**Benefits:**
- ✅ **Accurate Testing:** Tests reflect actual functionality, not drift issues
- ✅ **Time Savings:** Don't waste time debugging drift-related failures
- ✅ **Clear Results:** Test results show real issues vs. drift issues
- ✅ **Efficient Workflow:** Fix once, test once

**Cost of Not Fixing First:**
- ❌ **Wasted Time:** Testing features that fail due to drift
- ❌ **Confusion:** Unclear if failures are drift or code issues
- ❌ **Re-testing:** May need to re-test after fixing drift
- ❌ **Frustration:** Multiple failures that could be prevented

**Exception:** If drift check reveals only minor, non-critical differences, it's acceptable to proceed with testing and fix drift issues afterward. The key is identifying critical drift before testing.

---

### Why pgAdmin Works When Automated Migrations Fail

**The Problem with Automated Migrations:**

1. **Migration State Tracking:**
   - Prisma tracks migration state in `_prisma_migrations` table
   - If migration partially applies, state gets out of sync
   - Next deployment: "Column already exists" error → Deployment fails

2. **Dual Management Conflicts:**
   - GitHub Actions runs `prisma migrate deploy` (migration-based)
   - If conflicts occur, entire deployment fails
   - Backend doesn't start, service is down

3. **Deployment Workflow Complexity:**
   - Each failed migration requires:
     - Debug in Azure logs (30-60 minutes)
     - Fix manually in pgAdmin
     - Retry deployment (5-10 minutes)
     - **Total: 1-2 hours per issue**

**Why pgAdmin Works:**

- ✅ **Bypasses Migration Tracking:** Manual SQL execution doesn't update `_prisma_migrations` table
- ✅ **Direct Schema Changes:** Apply changes directly without state conflicts
- ✅ **Incremental Approach:** Apply changes one at a time, verify after each
- ✅ **No Deployment Failures:** Database changes don't block code deployments
- ✅ **Full Control:** See exactly what SQL is being executed
- ✅ **Easier Debugging:** Can test queries before applying changes

---

### When to Use pgAdmin

#### ✅ Use pgAdmin When:

1. **Automated Migrations Fail:**
   - `prisma migrate deploy` fails during deployment
   - "Column already exists" or "Migration already applied" errors
   - Deployment blocked by migration failures

2. **Database Drift Exists:**
   - Production schema doesn't match dev/dev-swa
   - Missing tables/columns in production
   - Need to "catch up" production with dev-swa

3. **Complex Schema Changes:**
   - Large migrations that might timeout
   - Migrations with data transformations
   - Migrations affecting multiple tables

4. **Production Synchronization:**
   - Bringing production database in sync with dev-swa
   - Applying multiple migrations at once
   - Verifying changes incrementally

5. **Migration State Conflicts:**
   - `_prisma_migrations` table out of sync
   - Need to resolve migration tracking issues
   - Manual fixes required

#### ❌ Don't Use pgAdmin When:

1. **Standard Deployments:**
   - Automated migrations work correctly
   - No database drift issues
   - Standard schema changes

2. **Simple Changes:**
   - Single column additions
   - Non-breaking schema changes
   - Migrations that apply cleanly

3. **First-Time Migrations:**
   - New migrations that haven't been applied yet
   - Migrations that should work automatically

**Best Practice:** Always try automated migrations first. Use pgAdmin as a fallback when automated migrations fail or when dealing with database drift.

---

### pgAdmin Migration Process

#### Step 1: Connect to Azure Database

1. **Get Connection Details:**
   - Azure Portal → PostgreSQL server → Connection strings
   - Or from GitHub Secrets: `DATABASE_URL` or `DATABASE_URL_PROD`

2. **Connect in pgAdmin:**
   - Open pgAdmin 4
   - Register new server
   - **Host:** `your-server.postgres.database.azure.com`
   - **Port:** `5432`
   - **Username:** `username@server-name` (Azure format)
   - **Password:** Database password
   - **SSL Mode:** `Require` (Azure requires SSL)

**Reference:** See `docs/reference/database/pgadmin/azure-database-migration-pgadmin.md` for detailed connection guide.

#### Step 2: Assess Current State

**Check Migration Status:**
```sql
SELECT migration_name, finished_at, applied_steps_count
FROM _prisma_migrations
ORDER BY finished_at DESC
LIMIT 20;
```

**Check Schema:**
```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check specific table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'your_table_name'
ORDER BY ordinal_position;
```

**Compare with Dev-SWA:**
- Compare table lists between production and dev-swa
- Identify missing tables/columns
- Document differences

#### Step 3: Apply Migrations Incrementally

**Best Practice: Apply One Migration at a Time**

1. **Open Migration File:**
   - Navigate to `backend/prisma/migrations/[migration-name]/migration.sql`
   - Review the SQL to understand what it does

2. **Execute in pgAdmin:**
   - Right-click database → Query Tool
   - Open migration file (File → Open)
   - Review SQL carefully
   - Execute (F5)

3. **Verify Success:**
   - Check for errors in Messages tab
   - Verify schema changes applied
   - Test related functionality if possible

4. **Update Migration Tracking (Optional):**
   ```sql
   -- If you want Prisma to recognize the migration as applied:
   INSERT INTO _prisma_migrations (migration_name, checksum, finished_at, applied_steps_count)
   VALUES ('20250109120000_migration_name', 'checksum', NOW(), 1);
   ```
   **Note:** Only do this if you're certain the migration matches exactly what Prisma expects.

5. **Move to Next Migration:**
   - Apply migrations in chronological order
   - Verify each before moving to next
   - Document any manual modifications

#### Step 4: Verify Final State

**Check All Tables Exist:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Compare with Dev-SWA:**
- Verify production has same tables as dev-swa
- Verify column structures match
- Test critical functionality

**Check Migration Status:**
```sql
SELECT COUNT(*) as total_migrations
FROM _prisma_migrations;
```

---

### Best Practices for pgAdmin Migrations

#### 1. Always Backup First
- **Before making ANY changes:** Backup production database
- Azure Portal → PostgreSQL server → Backups
- Or use pgAdmin → Backup tool
- **Critical:** Never apply migrations without backup

#### 2. Test Locally First
- Apply migrations to local dev database first
- Verify SQL works correctly
- Identify potential issues before production

#### 3. Apply Incrementally
- **One migration at a time**
- Verify each migration before moving to next
- Don't apply multiple migrations in one batch
- Test functionality after each migration

#### 4. Document Manual Changes
- If you modify migration SQL, document why
- Keep notes of what was changed
- Update migration files if needed (for future reference)

#### 5. Verify After Each Step
- Check schema changes applied correctly
- Verify no errors occurred
- Test related functionality if possible
- Check application logs for issues

#### 6. Update Migration Tracking Carefully
- Only update `_prisma_migrations` if migration matches exactly
- If you modified SQL, consider not updating tracking
- Document any tracking updates

#### 7. Coordinate with Code Deployments
- Apply database changes BEFORE code deployment
- Or apply during maintenance window
- Ensure code and database are compatible

---

### Common pgAdmin Migration Scenarios

#### Scenario 1: Catching Up Production with Dev-SWA

**Problem:** Production database missing tables/columns that exist in dev-swa.

**Solution:**
1. Compare schemas between production and dev-swa
2. Identify missing migrations
3. Apply missing migrations via pgAdmin (in order)
4. Verify schema matches dev-swa
5. Deploy code (should now work)

**Example:**
```sql
-- Production missing 'agency_responses' table
-- Apply migration: 20250106120000_create_agency_responses
-- Copy SQL from: backend/prisma/migrations/20250106120000_create_agency_responses/migration.sql
-- Execute in pgAdmin
-- Verify table created
```

#### Scenario 2: Failed Migration During Deployment

**Problem:** `prisma migrate deploy` fails with "Column already exists" error.

**Solution:**
1. Check what actually exists in database
2. If column exists, migration partially applied
3. Apply remaining changes manually via pgAdmin
4. Update `_prisma_migrations` table to mark migration as complete
5. Retry deployment (should now succeed)

**Example:**
```sql
-- Migration failed: Column 'status' already exists in 'trips' table
-- Check current schema:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'trips' AND column_name = 'status';

-- If exists, migration partially applied
-- Apply remaining changes from migration.sql manually
-- Mark migration as complete:
INSERT INTO _prisma_migrations (migration_name, checksum, finished_at, applied_steps_count)
VALUES ('20250109120000_add_status_column', 'checksum', NOW(), 1);
```

#### Scenario 3: Resolving Database Drift

**Problem:** `_prisma_migrations` table shows migrations applied, but schema doesn't match.

**Solution:**
1. Compare actual schema with expected schema (from Prisma schema)
2. Identify differences
3. Apply missing changes via pgAdmin
4. Optionally: Reset `_prisma_migrations` table and re-apply all migrations
5. Verify schema matches expected state

---

### Migration Tracking and Prisma

**Important:** When using pgAdmin, you have two options:

#### Option 1: Don't Update Migration Tracking
- Apply changes via pgAdmin
- Don't update `_prisma_migrations` table
- Prisma will think migrations aren't applied
- **Benefit:** No tracking conflicts
- **Drawback:** Prisma may try to apply migrations again (will fail if changes already exist)

#### Option 2: Update Migration Tracking
- Apply changes via pgAdmin
- Manually insert into `_prisma_migrations` table
- Prisma will recognize migrations as applied
- **Benefit:** Prisma knows migrations are applied
- **Drawback:** Must match exact migration name and checksum

**Recommendation:** For one-time "catch up" scenarios, Option 1 is safer. For ongoing maintenance, Option 2 may be better, but requires careful tracking.

---

### Troubleshooting pgAdmin Migrations

#### Issue: "SSL connection required"
**Solution:** Ensure SSL mode is set to `Require` in pgAdmin connection settings

#### Issue: "Permission denied"
**Solution:** Ensure Azure database user has proper permissions (usually needs to be database owner)

#### Issue: "Column already exists"
**Solution:** Migration partially applied. Check what exists, apply remaining changes manually

#### Issue: "Table doesn't exist"
**Solution:** Check if table name is correct, verify you're connected to correct database

#### Issue: "Migration already applied"
**Solution:** Check `_prisma_migrations` table. If migration exists but schema doesn't match, you have drift - fix schema manually

---

### Summary: pgAdmin vs Automated Migrations

| Aspect | Automated Migrations | pgAdmin |
|--------|---------------------|---------|
| **When to Use** | Standard deployments, new migrations | Failed migrations, database drift, production sync |
| **Speed** | Fast (if successful) | Slower (manual process) |
| **Reliability** | Can fail due to state conflicts | More reliable for complex scenarios |
| **Deployment Blocking** | Yes (fails entire deployment) | No (applied separately) |
| **Error Recovery** | Difficult (requires manual fixes) | Easier (incremental approach) |
| **Best For** | Routine schema changes | Complex migrations, drift resolution |

**Key Takeaway:** Use automated migrations when possible, but don't hesitate to use pgAdmin when automated migrations fail or when dealing with database drift. pgAdmin has proven to be the most reliable method for "catching up" production databases with dev-swa.

---

## Related Documentation

- `docs/reference/database/pgadmin/azure-database-migration-pgadmin.md` - Detailed pgAdmin connection and usage guide
- `docs/active/sessions/2026-01/BACKEND_DEPLOYMENT_FAILURE_ANALYSIS.md` - Comprehensive analysis of migration failures
- `docs/active/sessions/2026-01/catchingup_dbs.md` - Database catch-up plan and strategy
- `docs/reference/database/migrations/migration-troubleshooting.md` - Common migration issues and solutions
- `docs/active/sessions/2026-01/concurrency-deployment-issue.md` - Concurrency control details
- `docs/active/sessions/2026-01/production-deployment-conflict-20260104.md` - Production conflict example
- `.github/workflows/dev-be.yaml` - Current workflow configuration

---

**Status:** ✅ Comprehensive reference - All deployment knowledge in one place  
**Last Updated:** January 9, 2026  
**Location:** `docs/reference/azure/deployment-guide.md`
