# Development, Testing, and Deployment Workflow

**Created:** December 29, 2025  
**Purpose:** Document the complete workflow for local development, dev-swa testing, and production deployment  
**Status:** Active Reference Document

---

## Overview

This document explains the three-environment development workflow: **Local Development**, **Dev-SWA (Azure Dev)**, and **Production (traccems.com)**. Each environment serves a distinct purpose and maintains separate databases with different data.

---

## Three-Environment Architecture

### Environment Summary

| Environment | Frontend URL | Backend URL | Database | Purpose | Data Type |
|------------|--------------|-------------|----------|---------|-----------|
| **Local Dev** | `http://localhost:3000` | `http://localhost:5001` | `medport_ems` (local PostgreSQL) | Development & Testing | Test/Reference Data |
| **Dev-SWA** | `https://dev-swa.traccems.com` | `https://dev-api.traccems.com` | `traccems-dev-pgsql` (Azure Dev) | Staging/Testing | Test/Reference Data |
| **Production** | `https://traccems.com` | `https://api.traccems.com` | `traccems-prod-pgsql` (Azure Prod) | Live Client Use | **Real Client Data** |

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT WORKFLOW                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│ Local Drive  │  ← You develop here
│  (macOS)     │
└──────┬───────┘
       │
       │ 1. Code Changes
       │    - Frontend (React/TypeScript)
       │    - Backend (Node.js/Express)
       │    - Database Schema (Prisma)
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    GIT REPOSITORY (GitHub)                        │
│                                                                   │
│  Feature Branch → main → develop                                  │
│                                                                   │
│  ┌────────────┐     ┌──────┐     ┌─────────┐                    │
│  │  Feature  │ --> │ main │ --> │ develop │                    │
│  │  Branch   │     └──────┘     └────┬────┘                    │
│  └────────────┘                      │                           │
│                                      │                           │
└──────────────────────────────────────┼───────────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
         ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
         │  Local Dev       │  │  Dev-SWA     │  │  Production  │
         │  (localhost)     │  │  (Azure Dev) │  │  (Azure Prod)│
         │                  │  │              │  │              │
         │  Manual Start    │  │  Auto Deploy │  │  Manual Deploy│
         │  npm run dev     │  │  on develop  │  │  via GitHub  │
         │                  │  │  push        │  │  Actions     │
         │                  │  │              │  │              │
         │  ┌────────────┐  │  │  ┌────────┐ │  │  ┌────────┐ │
         │  │ Frontend   │  │  │  │Frontend│ │  │  │Frontend│ │
         │  │ :3000      │  │  │  │dev-swa │ │  │  │traccems │ │
         │  └─────┬──────┘  │  │  │.com    │ │  │  │.com     │ │
         │        │         │  │  └────┬───┘ │  │  └────┬───┘ │
         │        │         │  │       │     │  │       │     │
         │  ┌─────▼──────┐  │  │  ┌────▼───┐ │  │  ┌────▼───┐ │
         │  │ Backend    │  │  │  │Backend │ │  │  │Backend │ │
         │  │ :5001      │  │  │  │dev-api │ │  │  │api.    │ │
         │  └─────┬──────┘  │  │  │.com    │ │  │  │traccems │ │
         │        │         │  │  └────┬───┘ │  │  │.com     │ │
         │        │         │  │       │     │  │  └────┬───┘ │
         │  ┌─────▼──────┐  │  │  ┌────▼───┐ │  │  ┌────▼───┐ │
         │  │ PostgreSQL │  │  │  │Postgres│ │  │  │Postgres│ │
         │  │ medport_ems│  │  │  │traccems│ │  │  │traccems│ │
         │  │ (local)    │  │  │  │-dev-   │ │  │  │-prod-  │ │
         │  │            │  │  │  │pgsql   │ │  │  │pgsql   │ │
         │  └────────────┘  │  │  └────────┘ │  │  └────────┘ │
         │                  │  │              │  │              │
         │  Test Data       │  │  Test Data   │  │  CLIENT DATA │
         │  (synced from    │  │  (synced from│  │  (REAL)      │
         │   dev Azure)     │  │   dev Azure) │  │              │
         └──────────────────┘  └──────────────┘  └──────────────┘
```

---

## Detailed Workflow Steps

### Phase 1: Local Development

**Location:** Your local machine (`/Users/scooper/Code/tcc-new-project/`)

**Process:**
1. **Start Development Environment:**
   ```bash
   ./scripts/start-dev-complete.sh
   # or
   npm run dev
   ```
   - Frontend starts on `http://localhost:3000`
   - Backend starts on `http://localhost:5001`
   - Connects to local PostgreSQL database (`medport_ems`)

2. **Make Code Changes:**
   - Edit frontend code in `frontend/src/`
   - Edit backend code in `backend/src/`
   - Update database schema in `backend/prisma/schema.prisma` (if needed)

3. **Test Locally:**
   - Test features in browser at `http://localhost:3000`
   - Verify API endpoints work correctly
   - Check database changes (if any)

4. **Commit Changes:**
   ```bash
   git checkout -b feature/my-feature-name
   git add .
   git commit -m "feat: description of changes"
   ```

**Database Considerations:**
- Local database (`medport_ems`) contains test/reference data
- Data is synced FROM dev Azure database for testing purposes
- You can modify data locally without affecting other environments
- **No need to push backend** unless you changed Prisma schema (database structure)

---

### Phase 2: Dev-SWA Testing (Staging)

**Location:** Azure Dev Environment (`https://dev-swa.traccems.com`)

**Process:**
1. **Merge to Develop Branch:**
   ```bash
   git checkout main
   git merge feature/my-feature-name
   git checkout develop
   git merge main
   git push origin develop
   ```

2. **Automatic Deployment:**
   - Pushing to `develop` branch triggers GitHub Actions workflow
   - `.github/workflows/dev-fe.yaml` deploys frontend automatically
   - `.github/workflows/dev-be.yaml` deploys backend automatically (if backend code changed)
   - Deployment happens automatically - no manual intervention needed

3. **Test on Dev-SWA:**
   - Access `https://dev-swa.traccems.com`
   - Test all functionality thoroughly
   - Verify features work as expected
   - Test with real-world scenarios

4. **Verify Backend Deployment:**
   - Backend only deploys if:
     - Backend code changed (`.ts` files in `backend/src/`)
     - Prisma schema changed (requires migration)
   - If only frontend changed, backend doesn't redeploy (saves time)

**Database Considerations:**
- Dev Azure database (`traccems-dev-pgsql`) contains test/reference data
- Same data structure as local dev (synced from dev Azure)
- Safe to test and experiment without affecting production
- Can add test healthcare/EMS organizations here

---

### Phase 3: Production Deployment

**Location:** Azure Production Environment (`https://traccems.com`)

**Process:**
1. **After Successful Dev-SWA Testing:**
   - Feature is confirmed working on dev-swa
   - All tests pass
   - Ready for production

2. **Manual Production Deployment:**
   - Go to GitHub Actions: https://github.com/[your-repo]/actions
   - Select workflow: **"production - Deploy Prod Frontend"**
   - Click **"Run workflow"**
   - Choose branch: `develop` or `main` (usually `develop` after testing)
   - Click **"Run workflow"** button
   - Frontend deploys to `https://traccems.com`

3. **Backend Deployment (If Needed):**
   - Only deploy backend if:
     - Backend code changed
     - **Database schema changed** (Prisma migrations)
   - Go to GitHub Actions
   - Select workflow: **"production - Deploy Prod Backend"**
   - Click **"Run workflow"**
   - Choose branch: `develop` or `main`
   - Backend deploys to `https://api.traccems.com`
   - **Important:** Backend deployment runs Prisma migrations automatically

**Database Considerations:**
- Production database (`traccems-prod-pgsql`) contains **REAL CLIENT DATA**
- **Never sync production data to dev environments** (privacy/security)
- Production data is different from dev data (by design)
- Production database is backed up automatically by Azure

---

## Database Strategy

### Why Three Separate Databases?

Each environment maintains its own database for important reasons:

1. **Local Dev Database (`medport_ems`):**
   - Purpose: Fast local development and testing
   - Data: Test/reference data synced from dev Azure
   - Can be reset/recreated without consequences
   - Allows experimentation without affecting other environments

2. **Dev Azure Database (`traccems-dev-pgsql`):**
   - Purpose: Staging environment for testing before production
   - Data: Test/reference data (same structure as production)
   - Safe to test new features
   - Can add test organizations (healthcare/EMS) for testing

3. **Production Database (`traccems-prod-pgsql`):**
   - Purpose: Live application serving real clients
   - Data: **REAL CLIENT DATA** (confidential)
   - **Never sync production data to dev** (privacy/security)
   - Must be backed up regularly (Azure automated backups)

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE DATA FLOW                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  Dev Azure Database  │  ← Source of Truth for Test Data
│  (traccems-dev-      │
│   pgsql)             │
└──────────┬───────────┘
           │
           │ Sync Scripts (one-way)
           │ - sync-users-across-environments.js
           │ - sync-reference-data.js
           │ - sync-dropdown-and-pickup-data.js
           │
           ▼
┌──────────────────────┐
│  Local Dev Database  │  ← Synced FROM dev Azure
│  (medport_ems)       │     (for local testing)
└──────────────────────┘

┌──────────────────────┐
│  Production Database │  ← Separate, Real Client Data
│  (traccems-prod-     │     (NEVER synced to dev)
│   pgsql)             │
└──────────────────────┘
```

### When to Sync Data

**Sync FROM Dev Azure TO Local Dev:**
- ✅ When you need test data for local development
- ✅ When reference data (hospitals, facilities, agencies) is updated
- ✅ When you want to test with realistic data locally
- ✅ After restoring dev Azure database from backup

**Sync FROM Dev Azure TO Production:**
- ✅ Initial setup (reference data, dropdowns, pickup locations)
- ✅ Adding new reference data types
- ⚠️ **Never sync user data or client-specific data**
- ⚠️ **Never sync trips or transport requests** (production has real data)

**Never Sync Production TO Dev:**
- ❌ **NEVER** sync production data to dev (privacy/security)
- ❌ Production contains real client data (confidential)
- ❌ Dev environments are for testing only

---

## Backend Deployment Rules

### When Backend MUST Be Deployed

Backend deployment is required when:

1. **Database Schema Changes:**
   - Prisma schema modified (`backend/prisma/schema.prisma`)
   - New tables added
   - Tables modified (columns added/removed/changed)
   - Migrations need to run in production

2. **Backend Code Changes:**
   - API endpoints modified (`backend/src/routes/`)
   - Business logic changed (`backend/src/services/`)
   - Middleware updated (`backend/src/middleware/`)
   - Environment variables changed (requires App Service restart)

### When Backend Does NOT Need Deployment

Backend deployment is NOT required when:

1. **Frontend-Only Changes:**
   - UI components modified
   - Frontend routing changed
   - Frontend styling updated
   - Frontend state management changed

2. **Documentation Changes:**
   - README updates
   - Code comments
   - Documentation files

3. **Configuration Changes:**
   - Environment variables updated (Azure Portal, no code deploy needed)
   - CORS settings changed (Azure Portal)

### Backend Deployment Process

```bash
# 1. Verify schema changes (if any)
cd backend
npx prisma migrate dev --name your-migration-name

# 2. Commit changes
git add .
git commit -m "feat: add new feature with schema changes"
git push origin develop

# 3. Test on dev-swa first (automatic deployment)

# 4. After testing, deploy to production via GitHub Actions
#    - Go to GitHub Actions
#    - Run "production - Deploy Prod Backend" workflow
#    - Select branch: develop
#    - Migrations run automatically during deployment
```

---

## Production Data Backup Strategy

### Azure Automated Backups

**Production database (`traccems-prod-pgsql`) is automatically backed up by Azure:**

1. **Automated Backups:**
   - Azure PostgreSQL Flexible Server provides automated backups
   - **Retention:** 7-35 days (configurable)
   - **Frequency:** Daily backups
   - **Point-in-Time Restore:** Available for last 7 days

2. **Backup Configuration:**
   - Configured in Azure Portal → `traccems-prod-pgsql` → Backup
   - Set retention period (recommended: 30 days)
   - Enable point-in-time restore

3. **Manual Backup (If Needed):**
   ```bash
   # Using Azure CLI
   az postgres flexible-server backup create \
     --resource-group TraccEms-Prod-USCentral \
     --server-name traccems-prod-pgsql \
     --backup-name manual-backup-$(date +%Y%m%d)
   ```

### Backup Verification

**Regular Backup Checks:**
- ✅ Verify automated backups are running (Azure Portal)
- ✅ Test restore process periodically (to test database)
- ✅ Monitor backup storage usage
- ✅ Verify backup retention settings

**Backup Monitoring:**
- Check Azure Portal → `traccems-prod-pgsql` → Backup
- Verify latest backup timestamp
- Check backup storage usage
- Review backup retention policy

### Disaster Recovery Plan

**If Production Database is Lost:**

1. **Restore from Azure Backup:**
   - Azure Portal → `traccems-prod-pgsql` → Backup
   - Select backup point
   - Restore to new server or existing server

2. **Point-in-Time Restore:**
   - Available for last 7 days
   - Select specific timestamp
   - Restore to that exact point

3. **Manual Backup Restore:**
   ```bash
   # Restore from backup
   az postgres flexible-server restore \
     --resource-group TraccEms-Prod-USCentral \
     --name traccems-prod-pgsql-restored \
     --source-server traccems-prod-pgsql \
     --restore-time "2025-12-29T10:00:00Z"
   ```

---

## Testing Workflow

### Testing Healthcare/EMS Organization Creation

**After syncing data to local dev, test organization creation:**

1. **Test on Local Dev:**
   ```bash
   # Start local dev environment
   ./scripts/start-dev-complete.sh
   
   # Test creating healthcare organization
   # - Login as healthcare user
   # - Create new healthcare location
   # - Verify it saves correctly
   ```

2. **Test on Dev-SWA:**
   ```bash
   # Deploy to dev-swa (push to develop branch)
   git push origin develop
   
   # Wait for deployment (check GitHub Actions)
   # Test at https://dev-swa.traccems.com
   # - Login as healthcare user
   # - Create new healthcare location
   # - Verify it saves correctly
   ```

3. **Test on Production:**
   ```bash
   # After successful dev-swa testing
   # Deploy to production via GitHub Actions
   # Test at https://traccems.com
   # - Login as healthcare user
   # - Create new healthcare location
   # - Verify it saves correctly
   ```

**Important:** Test in each environment to ensure:
- ✅ Database schema supports new organizations
- ✅ API endpoints work correctly
- ✅ Frontend forms submit successfully
- ✅ Data persists correctly
- ✅ No errors in console/logs

---

## Common Workflow Scenarios

### Scenario 1: Frontend Feature (No Database Changes)

**Example:** Adding a new dashboard widget

1. **Local Development:**
   - Edit `frontend/src/components/Dashboard.tsx`
   - Test locally at `http://localhost:3000`
   - Commit and push to `develop`

2. **Dev-SWA Testing:**
   - Automatic deployment on `develop` push
   - Test at `https://dev-swa.traccems.com`
   - Verify widget displays correctly

3. **Production Deployment:**
   - Deploy frontend only via GitHub Actions
   - **No backend deployment needed**
   - Test at `https://traccems.com`

**Backend Deployment:** ❌ Not required

---

### Scenario 2: Backend API Endpoint (No Database Changes)

**Example:** Adding new API endpoint for reporting

1. **Local Development:**
   - Edit `backend/src/routes/reports.ts`
   - Test locally at `http://localhost:5001/api/reports`
   - Commit and push to `develop`

2. **Dev-SWA Testing:**
   - Automatic backend deployment on `develop` push
   - Test API at `https://dev-api.traccems.com/api/reports`
   - Verify endpoint works correctly

3. **Production Deployment:**
   - Deploy backend via GitHub Actions
   - **Frontend deployment not required** (unless frontend calls new endpoint)
   - Test at `https://api.traccems.com/api/reports`

**Backend Deployment:** ✅ Required

---

### Scenario 3: Database Schema Change

**Example:** Adding new field to `transport_requests` table

1. **Local Development:**
   - Edit `backend/prisma/schema.prisma`
   - Add field: `priority String?`
   - Create migration: `npx prisma migrate dev --name add-priority-field`
   - Test locally
   - Commit and push to `develop`

2. **Dev-SWA Testing:**
   - Automatic backend deployment on `develop` push
   - Migration runs automatically during deployment
   - Test at `https://dev-swa.traccems.com`
   - Verify new field works correctly

3. **Production Deployment:**
   - Deploy backend via GitHub Actions
   - **Migration runs automatically** during deployment
   - Test at `https://traccems.com`
   - Verify new field works with production data

**Backend Deployment:** ✅ Required (migrations run automatically)

---

### Scenario 4: Data Sync (Restoring Test Data)

**Example:** Syncing reference data to local dev

1. **Sync from Dev Azure:**
   ```bash
   SOURCE_DB="postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" \
   TARGET_DB="postgresql://scooper@localhost:5432/medport_ems?schema=public" \
   node backend/sync-reference-data.js
   ```

2. **Verify Sync:**
   - Check local database has updated data
   - Test locally with synced data
   - Verify relationships are preserved

3. **No Deployment Needed:**
   - Data sync is local operation
   - No code changes
   - No deployment required

**Backend Deployment:** ❌ Not required (data-only operation)

---

## Key Principles

### 1. Environment Isolation

- ✅ Each environment has its own database
- ✅ Production data never syncs to dev
- ✅ Dev data can sync to local dev for testing
- ✅ Environments are completely isolated

### 2. Deployment Strategy

- ✅ Frontend deploys independently
- ✅ Backend deploys only when needed
- ✅ Database migrations run automatically
- ✅ Test on dev-swa before production

### 3. Data Management

- ✅ Production has real client data (confidential)
- ✅ Dev environments have test data
- ✅ Sync scripts handle reference data
- ✅ Production backups are automated (Azure)

### 4. Testing Workflow

- ✅ Test locally first
- ✅ Test on dev-swa before production
- ✅ Verify in production after deployment
- ✅ Test organization creation in each environment

---

## Quick Reference Commands

### Local Development
```bash
# Start local dev environment
./scripts/start-dev-complete.sh

# Or manually
npm run dev
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "feat: description"

# Merge to main
git checkout main
git merge feature/my-feature

# Merge to develop (triggers dev-swa deployment)
git checkout develop
git merge main
git push origin develop
```

### Data Sync
```bash
# Sync users
SOURCE_DB="postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" \
TARGET_DB="postgresql://scooper@localhost:5432/medport_ems?schema=public" \
node backend/sync-users-across-environments.js sync

# Sync reference data
SOURCE_DB="postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" \
TARGET_DB="postgresql://scooper@localhost:5432/medport_ems?schema=public" \
node backend/sync-reference-data.js
```

### Production Deployment
```bash
# Frontend: Via GitHub Actions UI
# - Go to GitHub Actions
# - Run "production - Deploy Prod Frontend"
# - Select branch: develop

# Backend: Via GitHub Actions UI
# - Go to GitHub Actions
# - Run "production - Deploy Prod Backend"
# - Select branch: develop
```

### Backup Verification
```bash
# Check Azure backup status (via Azure Portal)
# Azure Portal → traccems-prod-pgsql → Backup
```

---

## Summary

### Your Assumptions - Validated ✅

1. **✅ Development on Local Drive:**
   - Correct - all development happens locally
   - Code committed to git
   - Pushed to develop branch for dev-swa testing

2. **✅ Dev-SWA Testing:**
   - Correct - test on dev-swa before production
   - Automatic deployment on develop branch push
   - Confirms features work before production

3. **✅ Production Deployment:**
   - Correct - deploy from main/develop to production
   - Manual via GitHub Actions
   - Only after successful dev-swa testing

4. **✅ Database Differences:**
   - Correct - each environment has different data
   - Production has real client data
   - Dev environments have test data
   - This is by design (isolation)

5. **✅ Backend Deployment:**
   - Correct - only deploy backend when needed
   - Schema changes require backend deployment
   - Code-only changes may require backend deployment
   - Frontend-only changes don't need backend deployment

6. **✅ Production Backups:**
   - Correct - Azure automated backups handle production
   - 7-35 day retention (configurable)
   - Point-in-time restore available
   - Regular monitoring recommended

### Workflow Summary

```
Local Dev → Git Commit → Develop Branch → Dev-SWA (Auto Deploy) → Test → Production (Manual Deploy)
```

**Key Points:**
- ✅ Three separate databases (local, dev Azure, production)
- ✅ Production data is different (real client data)
- ✅ Backend deploys only when needed (schema/code changes)
- ✅ Production backups are automated (Azure)
- ✅ Test on dev-swa before production deployment

---

**Last Updated:** December 29, 2025  
**Status:** Active Reference Document

