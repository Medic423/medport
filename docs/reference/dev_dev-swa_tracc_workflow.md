# Development, Testing, and Deployment Workflow

**Created:** December 29, 2025  
**Purpose:** Document the complete workflow for local development, dev-swa testing, and production deployment  
**Status:** Active Reference Document  
**Last Updated:** December 31, 2025 - Added branch sync process

---

## ⚠️ CRITICAL: Branch Synchronization

### The Problem
When fixes are made directly to `main` branch and deployed to production, `develop` branch doesn't automatically get those fixes. This causes:
- ❌ Dev-swa missing production fixes
- ❌ Having to fix the same issue twice
- ❌ Dev-swa and production getting out of sync

### The Solution: Always Sync After Production Fixes

**After deploying fixes to production from `main`, ALWAYS sync back to `develop`:**

```bash
# 1. Make sure main is up to date
git checkout main
git pull origin main

# 2. Merge main into develop to sync fixes
git checkout develop
git merge main --no-edit

# 3. Push develop to trigger dev-swa deployment
git push origin develop
```

This ensures dev-swa gets all production fixes automatically.

### Recommended Workflow (Prevents Sync Issues)

**Ideal Flow:**
1. **Develop on `develop` branch** (or feature branch → develop)
2. **Test on dev-swa** (auto-deploys from develop)
3. **After testing, merge to `main`**
4. **Deploy to production from `main`**
5. **Sync back: `develop` ← `main`** (keeps them in sync)

**Emergency Hotfix Flow (when fixing production directly):**
1. **Fix on `main` branch**
2. **Deploy to production**
3. **IMMEDIATELY sync: `develop` ← `main`**
4. **Push `develop`** (auto-deploys to dev-swa)

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
│  Feature Branch → develop → main                                  │
│                                                                   │
│  ┌────────────┐     ┌─────────┐     ┌──────┐                    │
│  │  Feature  │ --> │ develop │ --> │ main │                    │
│  │  Branch   │     └────┬────┘     └──────┘                    │
│  └────────────┘          │                                        │
│                         │                                         │
│                         │ SYNC: main → develop (after prod fixes)│
│                         │                                         │
└─────────────────────────┼─────────────────────────────────────────┘
                          │
         ┌────────────────┼──────────────────┐
         │                │                  │
         ▼                ▼                  ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  Local Dev   │  │  Dev-SWA     │  │  Production  │
  │  (localhost) │  │  (Azure Dev) │  │  (Azure Prod)│
  │              │  │              │  │              │
  │  Manual Start│  │  Auto Deploy │  │  Manual Deploy│
  │  npm run dev │  │  on develop  │  │  via GitHub  │
  │              │  │  push        │  │  Actions     │
  │              │  │              │  │              │
  │  ┌────────┐  │  │  ┌────────┐ │  │  ┌────────┐ │
  │  │Frontend│  │  │  │Frontend│ │  │  │Frontend│ │
  │  │ :3000  │  │  │  │dev-swa │ │  │  │traccems │ │
  │  └────┬───┘  │  │  │.com    │ │  │  │.com     │ │
  │       │      │  │  └────┬───┘ │  │  └────┬───┘ │
  │       │      │  │       │     │  │       │     │
  │  ┌────▼───┐  │  │  ┌────▼───┐ │  │  ┌────▼───┐ │
  │  │ Backend│  │  │  │ Backend │ │  │  │ Backend │ │
  │  │ :5001  │  │  │  │dev-api │ │  │  │api.    │ │
  │  └────┬───┘  │  │  │.com    │ │  │  │traccems │ │
  │       │      │  │  └────┬───┘ │  │  │.com     │ │
  │       │      │  │       │     │  │  └────┬───┘ │
  │  ┌────▼───┐  │  │  ┌────▼───┐ │  │  ┌────▼───┐ │
  │  │Postgres│  │  │  │Postgres│ │  │  │Postgres│ │
  │  │medport │  │  │  │traccems│ │  │  │traccems│ │
  │  │_ems    │  │  │  │-dev-   │ │  │  │-prod-  │ │
  │  │(local) │  │  │  │pgsql   │ │  │  │pgsql   │ │
  │  └────────┘  │  │  └────────┘ │  │  └────────┘ │
  │              │  │              │  │              │
  │  Test Data   │  │  Test Data   │  │  CLIENT DATA │
  │  (synced from│  │  (synced from│  │  (REAL)      │
  │   dev Azure) │  │   dev Azure) │  │              │
  └──────────────┘  └──────────────┘  └──────────────┘
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
   git checkout develop
   git merge feature/my-feature-name
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

2. **Merge to Main:**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

3. **Manual Production Deployment:**
   - Go to GitHub Actions: https://github.com/[your-repo]/actions
   - Select workflow: **"production - Deploy Prod Frontend"**
   - Click **"Run workflow"**
   - Choose branch: `main` (or `develop` if you prefer)
   - Click **"Run workflow"** button
   - Frontend deploys to `https://traccems.com`

4. **Backend Deployment (If Needed):**
   - Only deploy backend if:
     - Backend code changed
     - **Database schema changed** (Prisma migrations)
   - Go to GitHub Actions
   - Select workflow: **"production - Deploy Prod Backend"**
   - Click **"Run workflow"**
   - Choose branch: `main`
   - Backend deploys to `https://api.traccems.com`
   - **Important:** Backend deployment runs Prisma migrations automatically

5. **⚠️ CRITICAL: Sync Back to Develop:**
   ```bash
   # After production deployment, sync fixes back to develop
   git checkout develop
   git merge main --no-edit
   git push origin develop
   ```
   This ensures dev-swa gets all production fixes.

**Database Considerations:**
- Production database (`traccems-prod-pgsql`) contains **REAL CLIENT DATA**
- **Never sync production data to dev environments** (privacy/security)
- Production data is different from dev data (by design)
- Production database is backed up automatically by Azure

---

## Branch Synchronization Process

### When to Sync

**Always sync `main` → `develop` after:**
- ✅ Deploying fixes to production
- ✅ Making hotfixes directly on `main`
- ✅ Any production deployment
- ✅ Before starting new development work

### Sync Command

```bash
# Quick sync script
git checkout develop
git merge main --no-edit
git push origin develop
```

This will:
- Merge all production fixes into develop
- Trigger automatic dev-swa deployment
- Keep both environments in sync

### Preventing Sync Issues

**Best Practice:**
1. **Develop on `develop` branch first**
2. **Test on dev-swa** (auto-deploys)
3. **Merge to `main`** after testing
4. **Deploy to production**
5. **Sync back: `develop` ← `main`**

This prevents the need for emergency syncs.

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

# 4. After testing, merge to main and deploy to production via GitHub Actions

# 5. ⚠️ CRITICAL: Sync back to develop
git checkout develop
git merge main --no-edit
git push origin develop
```

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
   - Merge to `main`
   - Deploy frontend only via GitHub Actions
   - **No backend deployment needed**
   - Test at `https://traccems.com`

4. **Sync Back:**
   - Merge `main` → `develop`
   - Push `develop` (keeps dev-swa in sync)

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
   - Merge to `main`
   - Deploy backend via GitHub Actions
   - **Frontend deployment not required** (unless frontend calls new endpoint)
   - Test at `https://api.traccems.com/api/reports`

4. **Sync Back:**
   - Merge `main` → `develop`
   - Push `develop` (keeps dev-swa in sync)

**Backend Deployment:** ✅ Required

---

### Scenario 3: Database Schema Change

**Example:** Adding new column to `transport_requests` table

1. **Local Development:**
   - Edit `backend/prisma/schema.prisma`
   - Create migration: `npx prisma migrate dev --name add-new-column`
   - Test locally
   - Commit migration files and push to `develop`

2. **Dev-SWA Testing:**
   - Automatic backend deployment on `develop` push
   - Migration runs automatically (`npx prisma migrate deploy`)
   - Test at `https://dev-swa.traccems.com`
   - Verify database changes work correctly

3. **Production Deployment:**
   - Merge to `main`
   - Deploy backend via GitHub Actions
   - Migration runs automatically in production
   - Test at `https://traccems.com`

4. **Sync Back:**
   - Merge `main` → `develop`
   - Push `develop` (keeps dev-swa in sync)

**Backend Deployment:** ✅ Required (migrations must run)

---

### Scenario 4: Emergency Production Hotfix

**Example:** Critical bug found in production, needs immediate fix

1. **Fix on Main Branch:**
   ```bash
   git checkout main
   git pull origin main
   # Make fix
   git add .
   git commit -m "hotfix: critical bug fix"
   git push origin main
   ```

2. **Deploy to Production:**
   - Deploy via GitHub Actions immediately
   - Test fix on production

3. **⚠️ CRITICAL: Sync to Develop:**
   ```bash
   git checkout develop
   git merge main --no-edit
   git push origin develop
   ```
   - This ensures dev-swa gets the fix
   - Prevents having to fix the same issue twice

---

## Testing Workflow

### Local Testing Checklist

Before pushing to `develop`, verify locally:
- [ ] Frontend builds without errors
- [ ] Backend starts without errors
- [ ] Database migrations run successfully (if schema changed)
- [ ] All new features work as expected
- [ ] No console errors in browser
- [ ] API endpoints return correct responses

### Dev-SWA Testing Checklist

After automatic deployment, verify on dev-swa:
- [ ] Site loads correctly (`https://dev-swa.traccems.com`)
- [ ] All features work as expected
- [ ] No console errors
- [ ] Database changes applied (if any)
- [ ] Backend API responds correctly (`https://dev-api.traccems.com`)

### Production Testing Checklist

After manual deployment, verify on production:
- [ ] Site loads correctly (`https://traccems.com`)
- [ ] All features work as expected
- [ ] No console errors
- [ ] Database migrations completed (if any)
- [ ] Backend API responds correctly (`https://api.traccems.com`)
- [ ] **Sync back to develop** (don't forget!)

---

## Quick Reference Commands

### Sync Main → Develop (After Production Fixes)

```bash
# After deploying fixes to production, sync back to develop
git checkout develop
git merge main --no-edit
git push origin develop
```

### Standard Development Flow

```bash
# 1. Develop on develop branch
git checkout develop
# ... make changes ...
git add .
git commit -m "feat: new feature"
git push origin develop
# → Auto-deploys to dev-swa

# 2. After testing, merge to main
git checkout main
git merge develop
git push origin main
# → Deploy to production via GitHub Actions

# 3. Sync back (keeps dev-swa in sync)
git checkout develop
git merge main --no-edit
git push origin develop
```

### Emergency Hotfix Flow

```bash
# 1. Fix on main
git checkout main
# ... make fix ...
git add .
git commit -m "hotfix: critical fix"
git push origin main
# → Deploy to production

# 2. IMMEDIATELY sync to develop
git checkout develop
git merge main --no-edit
git push origin develop
# → Auto-deploys fix to dev-swa
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

7. **✅ Branch Synchronization:**
   - **NEW:** Always sync `main` → `develop` after production fixes
   - Prevents dev-swa and production from getting out of sync
   - Ensures fixes are available in both environments

---

**Updated:** December 31, 2025 - Added branch synchronization process to prevent dev-swa and production from getting out of sync
