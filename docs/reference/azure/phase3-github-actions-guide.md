# Phase 3: GitHub Actions Workflows - Implementation Guide
**Created:** December 26, 2025  
**Status:** Ready to Begin  
**Goal:** Create production deployment workflows for frontend and backend

## Overview

Phase 3 involves creating GitHub Actions workflows for production deployments. These workflows will be **separate** from the existing dev workflows, ensuring complete isolation between dev and production environments.

**Key Principle:** Production workflows use `workflow_dispatch` for manual triggering, providing maximum safety and control.

---

## Prerequisites

- ✅ Phase 1 Complete: All Azure resources created
- ✅ Phase 2 Complete: Database schema initialized
- ✅ Production resources ready:
  - `TraccEms-Prod-Frontend` (Static Web App)
  - `TraccEms-Prod-Backend` (App Service)
  - `traccems-prod-pgsql` (PostgreSQL)
- ✅ Deployment credentials obtained:
  - Frontend deployment token
  - Backend publish profile
  - Database connection string

---

## Task 3.1: Create Production Frontend Workflow

### File: `.github/workflows/prod-fe.yaml`

**Key Features:**
- Manual trigger via `workflow_dispatch`
- Deploys from `develop` branch
- Uses production Static Web App (`TraccEms-Prod-Frontend`)
- Uses production deployment token secret

**Trigger Strategy:**
- **Manual Only:** `workflow_dispatch` trigger
- **Branch:** `develop` (same source as dev, but separate pipeline)
- **Safety:** Production only deploys when explicitly triggered

**Workflow Steps:**
1. Checkout repository
2. Setup Node.js 24.x
3. Install dependencies
4. Build React app
5. Deploy to Azure Static Web Apps (production)

---

## Task 3.2: Create Production Backend Workflow

### File: `.github/workflows/prod-be.yaml`

**Key Features:**
- Manual trigger via `workflow_dispatch`
- Deploys from `develop` branch
- Uses production App Service (`TraccEms-Prod-Backend`)
- Uses production database (`DATABASE_URL_PROD`)
- Runs Prisma migrations automatically

**Trigger Strategy:**
- **Manual Only:** `workflow_dispatch` trigger
- **Branch:** `develop` (same source as dev, but separate pipeline)
- **Safety:** Production only deploys when explicitly triggered

**Workflow Steps:**
1. Checkout repository
2. Setup Node.js 24.x
3. Install dependencies
4. Generate Prisma models
5. Run database migrations (`prisma migrate deploy`)
6. Build application
7. Deploy to Azure App Service (production)

---

## Task 3.3: Configure GitHub Secrets

### Required Production Secrets

Add these secrets to GitHub repository (Settings → Secrets and variables → Actions):

#### 1. `DATABASE_URL_PROD`
- **Purpose:** Production database connection string
- **Format:** `postgresql://traccems_admin:[PASSWORD]@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require`
- **Source:** From Phase 1, Task 1.5
- **Note:** Replace `[PASSWORD]` with actual production database password

#### 2. `AZURE_WEBAPP_PROD_PUBLISH_PROFILE`
- **Purpose:** Production backend deployment credentials
- **Format:** XML publish profile content
- **Source:** From Phase 1, Task 1.4 (`TraccEms-Prod-Backend.publishsettings`)
- **Note:** Copy entire XML content from publish profile file

#### 3. `AZURE_FRONTEND_PROD_API_TOKEN`
- **Purpose:** Production frontend deployment token
- **Format:** Long token string
- **Source:** From Phase 1, Task 1.2 (deployment token)
- **Note:** Token starts with: `6e26f747b51cd74712e27aef71bd61ae...`

### Existing Secrets (Used by Dev Workflows)
- `DATABASE_URL` - Dev database (keep existing)
- `AZURE_WEBAPP_PUBLISH_PROFILE` - Dev backend (keep existing)
- `AZURE_FRONTEND_API_TOKEN` - Dev frontend (keep existing)
- `PAT_TOKEN` - GitHub Personal Access Token (shared)

---

## Task 3.4: Workflow Safety Configuration

### Manual Trigger Process

**How to Deploy to Production:**

1. **Test on Dev First:**
   - Push changes to `develop` branch
   - Verify deployment to `dev-swa.traccems.com`
   - Test all functionality thoroughly

2. **Trigger Production Deployment:**
   - Go to: GitHub → Actions → Workflows
   - Select: "production - Deploy Prod Frontend" or "production - Deploy Prod Backend"
   - Click: "Run workflow" button
   - Select: `develop` branch
   - Click: "Run workflow" to start deployment

3. **Monitor Deployment:**
   - Watch workflow logs in real-time
   - Verify successful deployment
   - Test production site after deployment

### Safety Benefits

✅ **Explicit Control:** Production only deploys when you manually trigger it  
✅ **Test First:** Always test on dev-swa.traccems.com before production  
✅ **Easy Rollback:** Can skip production deployment if issues found  
✅ **Isolation:** Production workflows completely separate from dev  
✅ **No Accidents:** Automatic deployments disabled for production  

---

## Verification Checklist

After completing Phase 3:

- [ ] Production frontend workflow created (`prod-fe.yaml`)
- [ ] Production backend workflow created (`prod-be.yaml`)
- [ ] `workflow_dispatch` trigger configured on both workflows
- [ ] GitHub secrets added:
  - [ ] `DATABASE_URL_PROD`
  - [ ] `AZURE_WEBAPP_PROD_PUBLISH_PROFILE`
  - [ ] `AZURE_FRONTEND_PROD_API_TOKEN`
- [ ] Workflows tested (can trigger manually from GitHub Actions UI)
- [ ] Workflow files committed to repository

---

## Troubleshooting

### Issue: Workflow Not Appearing in GitHub Actions

**Cause:** Workflow file not committed or incorrect location.

**Solution:**
1. Verify file is at `.github/workflows/prod-fe.yaml` or `.github/workflows/prod-be.yaml`
2. Commit and push workflow files
3. Refresh GitHub Actions page

### Issue: Secret Not Found Error

**Cause:** Secret not added to GitHub repository.

**Solution:**
1. Go to: Repository → Settings → Secrets and variables → Actions
2. Verify secret exists with exact name (case-sensitive)
3. Re-run workflow after adding secret

### Issue: Deployment Token Invalid

**Cause:** Token expired or incorrect.

**Solution:**
1. Regenerate deployment token in Azure Portal
2. Update `AZURE_FRONTEND_PROD_API_TOKEN` secret
3. Re-run workflow

### Issue: Publish Profile Invalid

**Cause:** Publish profile expired or incorrect.

**Solution:**
1. Download new publish profile from Azure Portal
2. Update `AZURE_WEBAPP_PROD_PUBLISH_PROFILE` secret
3. Re-run workflow

---

## Next Steps

After Phase 3 is complete:
1. ✅ Production workflows created
2. ✅ GitHub secrets configured
3. ✅ Ready for Phase 4: Environment Variables Configuration
4. ✅ Ready for Phase 5: Custom Domain Configuration

---

## Important Notes

⚠️ **Manual Deployment:** Production workflows use `workflow_dispatch` - they will NOT automatically deploy on push to `develop`. This is intentional for safety.

⚠️ **Dev Workflows Unchanged:** Existing `dev-fe.yaml` and `dev-be.yaml` workflows remain unchanged and continue to auto-deploy on `develop` push.

✅ **Isolation:** Production and dev workflows are completely separate - deploying to production does not affect dev environment.

---

**Last Updated:** December 26, 2025  
**Status:** Ready for Implementation

