# Production Deployment Analysis & Plan
**Date:** January 16, 2026  
**Status:** 📋 **COMPREHENSIVE ANALYSIS** - Ready for Review  
**Goal:** Assess readiness to deploy dev-swa to production and create deployment plan

---

## Executive Summary

**Current State:**
- ✅ **Local Dev:** Fully functional, matches dev-swa functionality
- ✅ **Dev-SWA:** Fully functional, successfully deployed, Agencies feature working
- ⚠️ **Production:** Code deployed but database schema may be out of sync

**Key Findings:**
1. **Code Alignment:** Local dev and dev-swa code are aligned (same `develop` branch)
2. **Database Drift:** Production database likely has schema differences from dev-swa
3. **Deployment Script:** Production workflow exists and can be used (similar to dev-swa)
4. **Oryx Fix:** Production App Service needs same Oryx build detection fix as dev-swa

**Recommendation:** 
- **Step 1:** Verify database alignment between dev-swa and production
- **Step 2:** Sync production database with dev-swa if drift exists
- **Step 3:** Apply Oryx fix to production App Service
- **Step 4:** Deploy code using existing production workflow

---

## Table of Contents

1. [Current Environment Analysis](#current-environment-analysis)
2. [Database Comparison & Drift Assessment](#database-comparison--drift-assessment)
3. [Code Comparison: Local Dev vs Dev-SWA](#code-comparison-local-dev-vs-dev-swa)
4. [Production Deployment Readiness](#production-deployment-readiness)
5. [Database Synchronization Procedure](#database-synchronization-procedure)
6. [Production Deployment Procedure](#production-deployment-procedure)
7. [Risk Assessment](#risk-assessment)
8. [Step-by-Step Deployment Plan](#step-by-step-deployment-plan)
9. [Verification & Testing](#verification--testing)
10. [Rollback Procedures](#rollback-procedures)

---

## Current Environment Analysis

### Environment Overview

| Environment | Backend App Service | Database | Status | URL |
|------------|---------------------|----------|--------|-----|
| **Local Dev** | N/A (local) | `medport_ems` (local PostgreSQL) | ✅ Running | `http://localhost:5001` |
| **Dev-SWA** | `TraccEms-Dev-Backend` | `traccems-dev-pgsql` (Azure) | ✅ Running | `https://dev-be.traccems.com` |
| **Production** | `TraccEms-Prod-Backend` | `traccems-prod-pgsql` (Azure) | ⚠️ Unknown | `https://api.traccems.com` |

### Azure Resources Status

**Verified via Azure CLI:**
- ✅ `TraccEms-Dev-Backend` - **Running** (Resource Group: `TraccEms-Dev-USCentral`)
- ✅ `TraccEms-Prod-Backend` - **Running** (Resource Group: `TraccEms-Prod-USCentral`)
- ✅ `traccems-dev-pgsql` - **Ready** (Resource Group: `TraccEms-Dev-USCentral`)
- ✅ `traccems-prod-pgsql` - **Ready** (Resource Group: `TraccEms-Prod-USCentral`)

### Code Deployment Status

**Dev-SWA:**
- ✅ **Workflow:** `.github/workflows/dev-be.yaml`
- ✅ **Trigger:** Automatic on push to `develop` branch
- ✅ **Status:** Successfully deploying
- ✅ **Recent Fix:** Oryx build detection disabled (January 13, 2026)
- ✅ **Backend Status:** Running successfully, Agencies feature working

**Production:**
- ✅ **Workflow:** `.github/workflows/prod-be.yaml`
- ✅ **Trigger:** Manual (`workflow_dispatch`)
- ✅ **Status:** Workflow exists, ready to use
- ⚠️ **Oryx Fix:** Not yet applied (needs same fix as dev-swa)
- ⚠️ **Last Deployment:** Unknown (needs verification)

---

## Database Comparison & Drift Assessment

### Database Comparison Tool

**Tool Available:** `backend/compare-database-structures.js`

**Purpose:** Compares database schemas across all three environments:
- Local Dev (`medport_ems`)
- Dev-SWA (`traccems-dev-pgsql`)
- Production (`traccems-prod-pgsql`)

**Usage:**
```bash
cd backend
node compare-database-structures.js
```

**What It Checks:**
1. **Tables:** Lists all tables in each database, identifies missing tables
2. **Columns:** Compares column names, types, and nullability for each table
3. **Summary:** Provides alignment status across all environments

### Expected Database State

**Based on Documentation (`catchingup_dbs.md`):**

**Local Dev & Dev-SWA (Expected to Match):**
- ✅ All 30 migrations applied
- ✅ All tables exist
- ✅ All columns exist
- ✅ Schema matches `schema.prisma`

**Production (May Have Drift):**
- ⚠️ **Partial migrations applied** (some tables missing)
- ⚠️ Some tables exist, many may be missing
- ⚠️ Missing columns in existing tables
- ⚠️ Schema may not match `schema.prisma`

### Critical Tables to Verify

**Core Functionality Tables:**
1. `transport_requests` - Trip creation
2. `agency_responses` - Dispatch/acceptance
3. `trips` - Trip management
4. `ems_users` - EMS user accounts
5. `ems_agencies` - EMS agencies
6. `healthcare_users` - Healthcare user accounts
7. `healthcare_locations` - Healthcare facility locations
8. `healthcare_destinations` - Healthcare destinations
9. `dropdown_categories` - Dropdown categories
10. `dropdown_options` - Dropdown options

**Supporting Tables:**
- `pickup_locations` - Pickup locations
- `pricing_models` - Pricing models
- `route_optimization_settings` - Route optimization
- `notification_preferences` - Notification preferences
- `notification_logs` - Notification logs

### Database Drift Assessment Procedure

**Step 1: Run Database Comparison**
```bash
cd /Users/scooper/Code/tcc-new-project/backend
node compare-database-structures.js
```

**Step 2: Analyze Results**
- Check for missing tables in production
- Check for missing columns in production
- Document all differences

**Step 3: Determine Sync Strategy**
- **If databases match:** Proceed with code deployment
- **If databases differ:** Sync production database first (see Database Synchronization Procedure)

---

## Code Comparison: Local Dev vs Dev-SWA

### Code Alignment Status

**Current State:**
- ✅ **Both environments:** Deploy from `develop` branch
- ✅ **Code source:** Same repository, same branch
- ✅ **Functionality:** User confirmed "functionality of local dev and dev-swa seems to match"

### Verification Method

**Git Branch Status:**
```bash
# Check current branch
git branch

# Verify both environments use develop branch
git log --oneline -5
```

**Expected Result:**
- Both local dev and dev-swa should be on `develop` branch
- Latest commits should match
- No uncommitted changes affecting functionality

### Code Differences (If Any)

**Potential Differences:**
1. **Environment Variables:** Different `.env` files (expected)
2. **Database Connections:** Different `DATABASE_URL` (expected)
3. **Feature Flags:** May differ (check `AZURE_SMS_ENABLED`, etc.)
4. **Configuration:** Azure App Service settings may differ

**Notable Difference:**
- ⚠️ **Oryx Fix:** Dev-SWA has `SCM_DO_BUILD_DURING_DEPLOYMENT=false` and `ENABLE_ORYX_BUILD=false`
- ⚠️ **Production:** May not have these settings (needs verification)

---

## Production Deployment Readiness

### Readiness Checklist

#### Code Readiness ✅
- [x] **Production workflow exists:** `.github/workflows/prod-be.yaml`
- [x] **Workflow structure:** Matches dev-swa workflow
- [x] **GitHub secrets:** `DATABASE_URL_PROD` and `AZURE_WEBAPP_PROD_PUBLISH_PROFILE` configured
- [x] **Code source:** `develop` branch (same as dev-swa)
- [x] **Build process:** Same as dev-swa (npm install, prisma generate, build)

#### Database Readiness ⚠️
- [ ] **Database comparison:** Need to run `compare-database-structures.js`
- [ ] **Schema alignment:** Verify production matches dev-swa
- [ ] **Migration status:** Check `_prisma_migrations` table in production
- [ ] **Data integrity:** Verify production data is safe to migrate

#### Infrastructure Readiness ✅
- [x] **Azure resources:** Production App Service and Database exist
- [x] **Resource status:** Both are "Running" and "Ready"
- [ ] **App Service settings:** Oryx fix needs to be applied
- [ ] **Environment variables:** Need verification

#### Deployment Process Readiness ✅
- [x] **Workflow exists:** Production workflow ready
- [x] **Manual trigger:** `workflow_dispatch` provides safety
- [x] **Migration support:** Workflow includes `prisma migrate deploy`
- [x] **Build support:** Same build process as dev-swa

### Missing from Production Workflow

**Comparison: Dev-SWA vs Production Workflows**

**Dev-SWA Workflow Has:**
- ✅ Cleanup step (removes tar.gz files and oryx-manifest.toml)
- ✅ Oryx fix documentation comments
- ✅ Post-deployment cleanup step (informational)

**Production Workflow Missing:**
- ❌ Cleanup step (should be added)
- ❌ Oryx fix documentation comments (should be added)
- ❌ Post-deployment cleanup step (optional, but recommended)

**Note:** These are workflow improvements, not blockers. Production workflow will work without them, but adding them provides consistency and prevents future issues.

---

## Database Synchronization Procedure

### When Database Drift is Detected

**If production database has missing tables/columns:**

### Option 1: Automated Migration (Recommended)

**Use GitHub Actions Workflow:**
1. Production workflow includes `prisma migrate deploy` step
2. This will automatically apply missing migrations
3. **Risk:** May fail if migrations conflict with existing data

**Procedure:**
```bash
# Trigger production deployment workflow
# GitHub Actions → Workflows → "production - Deploy Prod Backend"
# Select "develop" branch
# Click "Run workflow"
```

**What Happens:**
- Workflow runs `prisma migrate deploy` against production database
- Prisma checks `_prisma_migrations` table
- Applies only migrations that haven't been applied
- Creates missing tables and columns

**Advantages:**
- ✅ Automated
- ✅ Uses Prisma's migration tracking
- ✅ Handles dependencies automatically
- ✅ Can be rolled back if needed

**Disadvantages:**
- ⚠️ May fail if migrations conflict with existing data
- ⚠️ Requires database connection during deployment
- ⚠️ May take time for large migrations

### Option 2: Manual Migration via pgAdmin (If Automated Fails)

**Use pgAdmin 4 for Incremental Migration:**

**Step 1: Connect to Production Database**
- Host: `traccems-prod-pgsql.postgres.database.azure.com`
- Port: `5432`
- Database: `postgres`
- Username: `traccems_admin@traccems-prod-pgsql`
- Password: From `DATABASE_URL_PROD` secret
- SSL Mode: `Require`

**Step 2: Check Current Migration Status**
```sql
-- Check which migrations have been applied
SELECT migration_name, finished_at, applied_steps_count
FROM _prisma_migrations
ORDER BY finished_at DESC;
```

**Step 3: Compare with Dev-SWA**
```sql
-- Run same query on dev-swa database
-- Compare migration lists
-- Identify missing migrations
```

**Step 4: Apply Missing Migrations Incrementally**
1. Open migration file: `backend/prisma/migrations/[migration-name]/migration.sql`
2. Review SQL carefully
3. Execute in pgAdmin Query Tool
4. Verify success
5. Update migration tracking (optional):
   ```sql
   INSERT INTO _prisma_migrations (migration_name, checksum, finished_at, applied_steps_count)
   VALUES ('20250109120000_migration_name', 'checksum', NOW(), 1);
   ```
6. Move to next migration

**Step 5: Verify Schema Alignment**
```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'table_name'
ORDER BY ordinal_position;
```

**Reference:** See `docs/reference/azure/deployment-guide.md` section "Database Migrations: When to Use pgAdmin" for detailed procedures.

### Option 3: Full Schema Sync (Last Resort)

**If migrations are too complex or conflicting:**

**Step 1: Backup Production Database**
```bash
# Use backup script
bash documentation/scripts/backup-production-database.sh
```

**Step 2: Generate Fresh Schema**
```bash
cd backend
npx prisma migrate dev --create-only --name sync_production_schema
```

**Step 3: Review Generated Migration**
- Check `backend/prisma/migrations/[timestamp]_sync_production_schema/migration.sql`
- Review all changes carefully
- Ensure no data loss

**Step 4: Apply via pgAdmin**
- Execute migration SQL in pgAdmin
- Verify all changes applied
- Test functionality

**Step 5: Update Migration Tracking**
- Mark migration as applied in `_prisma_migrations` table

---

## Production Deployment Procedure

### Pre-Deployment Checklist

**Before deploying to production:**

- [ ] **1. Database Comparison Complete**
  - Run `compare-database-structures.js`
  - Document all differences
  - Plan sync strategy

- [ ] **2. Database Sync Complete** (if drift detected)
  - Apply missing migrations
  - Verify schema alignment
  - Test database connectivity

- [ ] **3. Production App Service Configuration**
  - Apply Oryx fix: `SCM_DO_BUILD_DURING_DEPLOYMENT=false` and `ENABLE_ORYX_BUILD=false`
  - Verify environment variables are set
  - Check `DATABASE_URL` points to production database

- [ ] **4. Code Verification**
  - Verify `develop` branch is ready
  - Check for uncommitted changes
  - Review recent commits

- [ ] **5. Backup Production Database**
  - Create full backup before deployment
  - Store backup in `/Volumes/Acasis/tcc-backups/`
  - Verify backup is restorable

- [ ] **6. Dev-SWA Testing Complete**
  - Verify all features work on dev-swa
  - Test Agencies feature (already confirmed working)
  - Test other critical features
  - No known issues

### Deployment Steps

**Step 1: Apply Oryx Fix to Production App Service**

**Via Azure CLI:**
```bash
az webapp config appsettings set \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --settings \
    SCM_DO_BUILD_DURING_DEPLOYMENT=false \
    ENABLE_ORYX_BUILD=false
```

**Via Azure Portal:**
1. Navigate to: Azure Portal → TraccEms-Prod-Backend → Settings → Environment Variables
2. Add/Update:
   - `SCM_DO_BUILD_DURING_DEPLOYMENT` = `false`
   - `ENABLE_ORYX_BUILD` = `false`
3. Save and restart App Service

**Step 2: Verify Production Workflow**

**Check workflow file:**
- File: `.github/workflows/prod-be.yaml`
- Verify it includes:
  - `prisma migrate deploy` step
  - `npm run build` step
  - Deployment step

**Step 3: Trigger Production Deployment**

**Via GitHub Actions UI:**
1. Go to: https://github.com/Medic423/medport/actions
2. Select workflow: "production - Deploy Prod Backend"
3. Click "Run workflow" button
4. Select branch: `develop`
5. Click "Run workflow" to start

**What Happens:**
1. Workflow checks out `develop` branch
2. Installs dependencies (`npm install`)
3. Generates Prisma models (`npx prisma generate`)
4. **Runs migrations** (`prisma migrate deploy` with `DATABASE_URL_PROD`)
5. Builds application (`npm run build`)
6. Deploys to `TraccEms-Prod-Backend`
7. Backend starts with production database

**Step 4: Monitor Deployment**

**GitHub Actions:**
- Watch workflow logs for errors
- Check migration step for success/failure
- Verify build completes
- Verify deployment completes

**Azure Log Stream:**
- Monitor backend startup logs
- Verify no Oryx manifest detection
- Verify backend starts successfully
- Check for database connection errors

**Step 5: Verify Deployment**

**Backend Health Check:**
```bash
curl https://api.traccems.com/health
```

**Expected Response:**
- Status: 200 OK
- Response: Health check data

**Test Critical Endpoints:**
- Login endpoint
- Agencies endpoint
- Trips endpoint
- Other critical features

---

## Risk Assessment

### Low Risk Items ✅

**Code Deployment:**
- ✅ Production workflow exists and is tested (similar to dev-swa)
- ✅ Same code source (`develop` branch)
- ✅ Same build process as dev-swa
- ✅ Manual trigger provides safety

**Infrastructure:**
- ✅ Azure resources exist and are running
- ✅ GitHub secrets configured
- ✅ Database exists and is accessible

### Medium Risk Items ⚠️

**Database Migrations:**
- ⚠️ **Risk:** Migrations may fail if schema conflicts exist
- **Mitigation:** 
  - Run database comparison first
  - Apply migrations incrementally if needed
  - Use pgAdmin for manual fixes if automated fails
  - Have rollback plan ready

**Oryx Build Detection:**
- ⚠️ **Risk:** Production may have same Oryx issues as dev-swa had
- **Mitigation:**
  - Apply Oryx fix BEFORE deployment
  - Verify settings are saved
  - Restart App Service after applying

**Data Integrity:**
- ⚠️ **Risk:** Migrations may affect existing production data
- **Mitigation:**
  - Backup production database first
  - Review migration SQL before applying
  - Test migrations on dev-swa first (already done)

### High Risk Items 🔴

**Production Data Loss:**
- 🔴 **Risk:** Incorrect migrations could corrupt or delete data
- **Mitigation:**
  - **CRITICAL:** Backup production database before any changes
  - Review all migration SQL carefully
  - Apply migrations incrementally
  - Test on dev-swa first (already done)
  - Have rollback plan ready

**Service Downtime:**
- 🔴 **Risk:** Deployment or migration failures could cause downtime
- **Mitigation:**
  - Deploy during low-traffic period
  - Monitor deployment closely
  - Have rollback procedure ready
  - Test rollback procedure beforehand

---

## Step-by-Step Deployment Plan

### Phase 1: Pre-Deployment Assessment (30-60 minutes)

**1.1: Run Database Comparison**
```bash
cd /Users/scooper/Code/tcc-new-project/backend
node compare-database-structures.js
```

**1.2: Analyze Results**
- Document missing tables in production
- Document missing columns in production
- Determine sync strategy

**1.3: Backup Production Database**
```bash
# Use backup script
bash documentation/scripts/backup-production-database.sh
# Or use Azure CLI
az postgres flexible-server backup list \
  --resource-group TraccEms-Prod-USCentral \
  --server-name traccems-prod-pgsql
```

**1.4: Verify Production App Service Status**
```bash
az webapp show \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "{state:state, httpsOnly:httpsOnly, defaultHostName:defaultHostName}"
```

**1.5: Check Current App Service Settings**
```bash
az webapp config appsettings list \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "[?name=='SCM_DO_BUILD_DURING_DEPLOYMENT' || name=='ENABLE_ORYX_BUILD']"
```

### Phase 2: Database Synchronization (1-4 hours, depending on drift)

**2.1: If Databases Match**
- ✅ Skip to Phase 3

**2.2: If Databases Differ - Automated Migration**
- Trigger production deployment workflow
- Monitor migration step
- Verify migrations applied successfully
- If successful: ✅ Proceed to Phase 3
- If failed: ⚠️ Proceed to Phase 2.3

**2.3: If Automated Migration Fails - Manual Migration**
- Connect to production database via pgAdmin
- Check migration status
- Apply missing migrations incrementally
- Verify schema alignment
- Update migration tracking if needed

**2.4: Verify Database Sync**
- Run `compare-database-structures.js` again
- Verify production matches dev-swa
- Document any remaining differences

### Phase 3: Production App Service Configuration (15 minutes)

**3.1: Apply Oryx Fix**
```bash
az webapp config appsettings set \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --settings \
    SCM_DO_BUILD_DURING_DEPLOYMENT=false \
    ENABLE_ORYX_BUILD=false
```

**3.2: Verify Settings Applied**
```bash
az webapp config appsettings list \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "[?name=='SCM_DO_BUILD_DURING_DEPLOYMENT' || name=='ENABLE_ORYX_BUILD']"
```

**3.3: Restart App Service**
```bash
az webapp restart \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral
```

**3.4: Verify App Service Settings**
- Check Azure Portal → Configuration → Application settings
- Verify both settings are `false`
- Verify App Service restarted successfully

### Phase 4: Code Deployment (10-15 minutes)

**4.1: Verify Develop Branch**
```bash
cd /Users/scooper/Code/tcc-new-project
git status
git log --oneline -5
```

**4.2: Trigger Production Deployment**
- Go to: https://github.com/Medic423/medport/actions
- Select: "production - Deploy Prod Backend"
- Click: "Run workflow"
- Branch: `develop`
- Click: "Run workflow"

**4.3: Monitor Deployment**
- Watch GitHub Actions logs
- Monitor migration step
- Monitor build step
- Monitor deployment step

**4.4: Monitor Backend Startup**
- Check Azure Log Stream
- Verify no Oryx manifest detection
- Verify backend starts successfully
- Check for database connection errors

### Phase 5: Verification & Testing (30-60 minutes)

**5.1: Health Check**
```bash
curl https://api.traccems.com/health
```

**5.2: Test Critical Features**
- Login functionality
- Agencies list (if applicable)
- Trip creation (if applicable)
- Other critical endpoints

**5.3: Verify Database Connectivity**
- Check backend logs for database connection
- Verify no database errors
- Test database queries if possible

**5.4: Performance Check**
- Check response times
- Monitor for errors
- Check Azure metrics

---

## Verification & Testing

### Database Verification

**After Database Sync:**

**1. Schema Comparison**
```bash
cd backend
node compare-database-structures.js
```

**Expected Result:**
- ✅ All tables exist in production
- ✅ All columns match dev-swa
- ✅ No missing tables or columns

**2. Migration Status Check**
```sql
-- Run in pgAdmin for production database
SELECT migration_name, finished_at, applied_steps_count
FROM _prisma_migrations
ORDER BY finished_at DESC
LIMIT 30;
```

**Expected Result:**
- ✅ All 30 migrations listed
- ✅ Migration dates match dev-swa (approximately)
- ✅ No missing migrations

**3. Critical Tables Verification**
```sql
-- Run in pgAdmin for production database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN (
    'transport_requests',
    'agency_responses',
    'trips',
    'ems_users',
    'ems_agencies',
    'healthcare_users',
    'healthcare_locations',
    'dropdown_categories',
    'dropdown_options'
  )
ORDER BY table_name;
```

**Expected Result:**
- ✅ All critical tables exist
- ✅ Table names match dev-swa exactly

### Code Verification

**After Code Deployment:**

**1. Backend Health Check**
```bash
curl https://api.traccems.com/health
```

**Expected Response:**
- Status: 200 OK
- JSON response with health status

**2. Backend Logs Check**
- Check Azure Log Stream
- Verify: "🚀 TCC Backend server running on port..."
- Verify: No Oryx manifest detection
- Verify: Database connection successful

**3. API Endpoint Testing**
```bash
# Test login endpoint (if public)
curl https://api.traccems.com/api/auth/login

# Test agencies endpoint (requires auth)
curl -H "Authorization: Bearer <token>" https://api.traccems.com/api/tcc/agencies
```

### Functional Testing

**Critical Features to Test:**

1. **User Authentication**
   - [ ] Login works
   - [ ] JWT tokens issued correctly
   - [ ] Protected routes require auth

2. **Agencies Feature** (if applicable)
   - [ ] Agencies list loads
   - [ ] Agency details display
   - [ ] No "Failed to load agencies" errors

3. **Trip Management** (if applicable)
   - [ ] Trip creation works
   - [ ] Trip list displays
   - [ ] Trip details display

4. **Database Operations**
   - [ ] Queries execute successfully
   - [ ] No database connection errors
   - [ ] No schema validation errors

---

## Rollback Procedures

### If Database Migration Fails

**Step 1: Stop Deployment**
- Cancel GitHub Actions workflow if still running
- Do not proceed with code deployment

**Step 2: Assess Damage**
- Check what migrations were applied
- Check what tables/columns were created
- Document current state

**Step 3: Rollback Options**

**Option A: Rollback Specific Migrations**
```sql
-- In pgAdmin, drop tables/columns created by failed migration
DROP TABLE IF EXISTS table_name CASCADE;

-- Remove migration from tracking
DELETE FROM _prisma_migrations 
WHERE migration_name = 'failed_migration_name';
```

**Option B: Restore from Backup**
```bash
# Restore production database from backup
# Use pgAdmin to restore SQL backup file
# Or use Azure Portal restore feature
```

**Step 4: Fix Migration Issues**
- Review migration SQL
- Fix conflicts manually
- Re-apply migration via pgAdmin
- Update migration tracking

**Step 5: Retry Deployment**
- After fixing issues, retry deployment
- Monitor closely
- Verify success

### If Code Deployment Fails

**Step 1: Check Deployment Status**
- Review GitHub Actions logs
- Identify failure point
- Document error

**Step 2: Fix Issues**
- Fix code issues if needed
- Fix configuration issues if needed
- Fix environment variable issues if needed

**Step 3: Retry Deployment**
- Trigger workflow again
- Monitor closely
- Verify success

**Step 4: If Backend Won't Start**
- Check Azure Log Stream for errors
- Verify App Service settings
- Verify environment variables
- Check database connectivity
- Restart App Service if needed

### If Production Data is Affected

**Step 1: Stop All Operations**
- Do not make more changes
- Document what happened
- Assess data impact

**Step 2: Restore from Backup**
```bash
# Use latest production backup
cd /Volumes/Acasis/tcc-backups/production-db-backup-YYYYMMDD_HHMMSS
# Restore using pgAdmin or Azure Portal
```

**Step 3: Verify Restoration**
- Check database state
- Verify data integrity
- Test critical functionality

**Step 4: Investigate Root Cause**
- Review what went wrong
- Document lessons learned
- Update procedures

---

## Can Dev-SWA Deployment Script Be Used for Production?

### Analysis: Dev-SWA vs Production Workflows

**Similarities:**
- ✅ Both use same build process (`npm install`, `prisma generate`, `npm run build`)
- ✅ Both deploy `node_modules` directly (no archive extraction)
- ✅ Both use `prisma migrate deploy` for migrations
- ✅ Both deploy to Azure App Service
- ✅ Both use same deployment action (`azure/webapps-deploy@v2`)

**Differences:**
- ⚠️ **Trigger:** Dev-SWA is automatic, Production is manual
- ⚠️ **Database:** Dev-SWA uses `DATABASE_URL`, Production uses `DATABASE_URL_PROD`
- ⚠️ **App Service:** Dev-SWA deploys to `TraccEms-Dev-Backend`, Production to `TraccEms-Prod-Backend`
- ⚠️ **Cleanup Steps:** Dev-SWA has cleanup steps, Production workflow missing them (but not critical)

### Answer: YES, Production Workflow Can Be Used

**The production workflow (`.github/workflows/prod-be.yaml`) is:**
- ✅ **Functionally equivalent** to dev-swa workflow
- ✅ **Ready to use** for production deployment
- ✅ **Safe** because it uses manual trigger
- ✅ **Includes migrations** automatically

**Minor Improvements Recommended (Not Required):**
- Add cleanup steps (like dev-swa has) for consistency
- Add Oryx fix documentation comments
- These are improvements, not blockers

### Why It Will Work

1. **Same Infrastructure:** Both dev-swa and production are Azure App Services
2. **Same Code:** Both deploy from `develop` branch
3. **Same Process:** Both use same build and deployment steps
4. **Proven:** Dev-swa workflow is working successfully
5. **Safe:** Production workflow uses manual trigger for safety

---

## Summary & Recommendations

### Current Readiness Status

**Code:** ✅ **READY**
- Production workflow exists and is ready
- Code is aligned between local dev and dev-swa
- Same code source (`develop` branch)

**Database:** ⚠️ **NEEDS VERIFICATION**
- Database comparison tool available
- Need to run comparison to check for drift
- Sync procedure available if drift detected

**Infrastructure:** ✅ **READY**
- Azure resources exist and are running
- GitHub secrets configured
- App Service needs Oryx fix (quick fix)

**Deployment Process:** ✅ **READY**
- Production workflow ready to use
- Manual trigger provides safety
- Migration support included

### Recommended Next Steps

**1. Immediate: Database Comparison**
- Run `backend/compare-database-structures.js`
- Document any differences
- Determine sync strategy

**2. If Drift Detected: Database Sync**
- Use automated migration (production workflow)
- Or use pgAdmin for manual migration if needed
- Verify sync completion

**3. Before Deployment: Apply Oryx Fix**
- Configure production App Service settings
- Prevent Oryx build detection issues
- Restart App Service

**4. Deployment: Use Production Workflow**
- Trigger via GitHub Actions UI
- Monitor deployment closely
- Verify backend starts successfully

**5. After Deployment: Verification**
- Test critical features
- Verify database connectivity
- Monitor for errors

### Final Recommendation

**✅ PROCEED WITH PRODUCTION DEPLOYMENT** after:
1. ✅ Database comparison confirms alignment (or sync completes)
2. ✅ Oryx fix applied to production App Service
3. ✅ Production database backup created
4. ✅ Dev-swa testing confirms everything works

**The production deployment workflow is ready and can be used. It's functionally equivalent to the successful dev-swa workflow, with the added safety of manual triggering.**

---

## Appendix: Useful Commands

### Azure CLI Commands

**Check App Service Status:**
```bash
az webapp show \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "{state:state, defaultHostName:defaultHostName}"
```

**List App Service Settings:**
```bash
az webapp config appsettings list \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral
```

**Apply Oryx Fix:**
```bash
az webapp config appsettings set \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --settings \
    SCM_DO_BUILD_DURING_DEPLOYMENT=false \
    ENABLE_ORYX_BUILD=false
```

**Restart App Service:**
```bash
az webapp restart \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral
```

**Check Database Status:**
```bash
az postgres flexible-server show \
  --resource-group TraccEms-Prod-USCentral \
  --name traccems-prod-pgsql \
  --query "{state:state, version:version}"
```

### Database Comparison

**Run Comparison:**
```bash
cd /Users/scooper/Code/tcc-new-project/backend
node compare-database-structures.js
```

**Check Migration Status (pgAdmin):**
```sql
SELECT migration_name, finished_at, applied_steps_count
FROM _prisma_migrations
ORDER BY finished_at DESC;
```

### Backup Commands

**Backup Production Database:**
```bash
bash documentation/scripts/backup-production-database.sh
```

**Or via Azure CLI:**
```bash
az postgres flexible-server backup create \
  --resource-group TraccEms-Prod-USCentral \
  --server-name traccems-prod-pgsql \
  --backup-name production-backup-$(date +%Y%m%d-%H%M%S)
```

---

**Document Status:** ✅ **COMPREHENSIVE ANALYSIS COMPLETE**  
**Last Updated:** January 16, 2026  
**Next Action:** Run database comparison to verify alignment
