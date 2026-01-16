# Deployment Process Documentation
**Date:** January 8, 2026  
**Status:** Active  
**Last Updated:** January 8, 2026

---

## Overview

This document outlines the deployment process for the TCC application across two environments:
- **dev-swa** (staging environment)
- **production** (production environment)

---

## Environment Terminology

### dev-swa (Staging Environment)
- **Purpose:** Testing and validation before production
- **Azure App Service:** `TraccEms-Dev-Backend` (backend), `TraccEms-Dev-Frontend` (frontend)
- **Database:** Development database (`DATABASE_URL` secret)
- **Deployment Type:** **Automatic** on push to `develop` branch
- **URL:** `https://dev-swa.traccems.com`

### Production Environment
- **Purpose:** Live production environment
- **Azure App Service:** `TraccEms-Prod-Backend` (backend), `TraccEms-Prod-Frontend` (frontend)
- **Database:** Production database (`DATABASE_URL_PROD` secret)
- **Deployment Type:** **Manual only** (workflow_dispatch)
- **URL:** `https://traccems.com`

---

## Branch Strategy

### `develop` Branch
- **Purpose:** Staging/development work
- **Deployment:** Automatically deploys to **dev-swa** on push
- **Workflow:** `develop - Deploy Dev Backend` / `develop - Deploy Dev Frontend`
- **Trigger:** Push to `develop` branch

### `main` Branch
- **Purpose:** Production-ready code
- **Deployment:** **Manual trigger required** for production
- **Workflow:** `production - Deploy Prod Backend` / `production - Deploy Prod Frontend`
- **Trigger:** Manual workflow_dispatch (GitHub Actions UI)

---

## Deployment Workflows

### dev-swa (Automatic Deployment)

**Backend Workflow:** `.github/workflows/dev-be.yaml`
- **Name:** `develop - Deploy Dev Backend`
- **Trigger:** Push to `develop` branch
- **Steps:**
  1. Checkout `develop` branch
  2. Install dependencies
  3. Generate Prisma models
  4. Run database migrations (`prisma migrate deploy`)
  5. Build application
  6. Deploy to `TraccEms-Dev-Backend`

**Frontend Workflow:** `.github/workflows/dev-fe.yaml`
- **Name:** `develop - Deploy Dev Frontend`
- **Trigger:** Push to `develop` branch
- **Steps:**
  1. Checkout `develop` branch
  2. Install dependencies
  3. Build React app
  4. Deploy to `TraccEms-Dev-Frontend`

**Concurrency:** Uses concurrency groups to prevent conflicts
- `deploy-dev-backend` - Queues deployments, doesn't cancel in-progress
- `deploy-dev-frontend` - Queues deployments, doesn't cancel in-progress

### Production (Manual Deployment)

**Backend Workflow:** `.github/workflows/prod-be.yaml`
- **Name:** `production - Deploy Prod Backend`
- **Trigger:** Manual `workflow_dispatch` only
- **Inputs:**
  - `branch`: Choice between `develop` or `main` (default: `develop`)
- **Steps:**
  1. Checkout selected branch
  2. Install dependencies
  3. Generate Prisma models
  4. Run database migrations (`prisma migrate deploy`) using `DATABASE_URL_PROD`
  5. Build application
  6. Deploy to `TraccEms-Prod-Backend`

**Frontend Workflow:** `.github/workflows/prod-fe.yaml`
- **Name:** `production - Deploy Prod Frontend`
- **Trigger:** Manual `workflow_dispatch` only
- **Inputs:**
  - `branch`: Choice between `develop` or `main` (default: `develop`)
- **Steps:**
  1. Checkout selected branch
  2. Install dependencies
  3. Verify environment variables
  4. Build React app
  5. Deploy to `TraccEms-Prod-Frontend`

---

## Deployment Process

### Standard Workflow: Fix → Test → Deploy

#### Step 1: Develop and Test Locally
```bash
# Make changes locally
# Test in local dev environment
npm run dev  # Backend
npm run dev  # Frontend
```

#### Step 2: Deploy to dev-swa (Staging)
```bash
# Commit changes to develop branch
git checkout develop
git merge <feature-branch>  # or commit directly
git push origin develop
```

**What Happens:**
- GitHub Actions automatically triggers deployment workflows
- Backend and frontend deploy to dev-swa
- Monitor GitHub Actions for completion (typically 5-10 minutes)

**Verify:**
- Check `https://dev-swa.traccems.com`
- Test functionality in staging environment
- Review Azure Log Stream for any errors

#### Step 3: Merge to Main (When Ready for Production)
```bash
# After testing in dev-swa, merge to main
git checkout main
git merge develop
git push origin main
```

**Note:** This does NOT deploy to production automatically. Production requires manual trigger.

#### Step 4: Deploy to Production (Manual)

**⚠️ IMPORTANT: Wait for dev-swa deployments to complete before deploying production to avoid 409 conflicts.**

**Process:**
1. Go to GitHub Actions: https://github.com/Medic423/medport/actions
2. Select workflow: `production - Deploy Prod Backend`
3. Click "Run workflow"
4. Select branch: `main` (or `develop` if needed)
5. Click "Run workflow" button
6. Repeat for `production - Deploy Prod Frontend` if frontend changes were made

**Verify:**
- Monitor GitHub Actions workflow completion
- Check `https://traccems.com`
- Review Azure Log Stream for production backend
- Test login and critical functionality

---

## Common Issues and Solutions

### 409 Conflict Errors

**Problem:** Azure deployment returns 409 Conflict error

**Cause:** 
- Concurrent deployments to the same Azure App Service
- Previous deployment still in progress
- Azure App Service is in a transitional state

**Solution:**
1. **Wait for dev-swa deployments to complete** before deploying production
2. Check GitHub Actions for any in-progress deployments
3. Wait 2-3 minutes after dev-swa completes before starting production deployment
4. If error persists, wait 5 minutes and retry

**Prevention:**
- Always deploy dev-swa first
- Wait for dev-swa deployments to complete
- Check GitHub Actions status before starting production deployment

### Backend Not Starting

**Symptoms:**
- Can't log in
- Health endpoint returns 503
- Azure Log Stream shows no application logs

**Common Causes:**
1. Missing `DATABASE_URL` environment variable
2. Database connection failure
3. Code errors preventing startup
4. Migration conflicts

**Debugging Steps:**
1. Check Azure Log Stream for error messages
2. Verify environment variables in Azure Portal
3. Check GitHub Actions deployment logs
4. Review recent code changes
5. Test database connectivity

### Database Migration Failures

**Problem:** `prisma migrate deploy` fails during deployment

**Cause:**
- Migration state mismatch
- Database schema conflicts
- Missing migration files

**Solution:**
1. Check migration status in `_prisma_migrations` table
2. Review GitHub Actions logs for specific error
3. May need to manually resolve migration conflicts
4. Consider using `prisma db push` as emergency measure (not recommended for production)

---

## Best Practices

### 1. Always Test in dev-swa First
- Never deploy directly to production without testing in staging
- Use dev-swa to validate fixes before production deployment

### 2. Deploy Order
1. Deploy dev-swa (automatic)
2. Wait for completion
3. Test in dev-swa
4. Merge to main (if ready)
5. Deploy production (manual)

### 3. Monitor Deployments
- Watch GitHub Actions workflows for completion
- Check Azure Log Stream after deployment
- Verify functionality in target environment

### 4. Database Migrations
- Migrations run automatically during deployment
- Production uses `DATABASE_URL_PROD` secret
- dev-swa uses `DATABASE_URL` secret
- Never run migrations manually in production unless absolutely necessary

### 5. Rollback Strategy
- Keep restore points tagged in git
- Document known working commits
- Use `git reset --hard <restore-point>` if needed
- Force push only after careful consideration

---

## Quick Reference

### Deploy dev-swa (Staging)
```bash
git checkout develop
git push origin develop
# Automatic deployment triggered
```

### Deploy Production
1. GitHub Actions → `production - Deploy Prod Backend` → Run workflow → Select `main` branch
2. GitHub Actions → `production - Deploy Prod Frontend` → Run workflow → Select `main` branch (if needed)

### Check Deployment Status
- GitHub Actions: https://github.com/Medic423/medport/actions
- Azure Portal: https://portal.azure.com
- Log Stream: Azure Portal → App Service → Log Stream

### Environment URLs
- dev-swa: `https://dev-swa.traccems.com`
- Production: `https://traccems.com`
- Backend API (dev-swa): `https://api-dev-swa.traccems.com`
- Backend API (production): `https://api.traccems.com`

---

## Related Documentation

- `BACKEND_DEPLOYMENT_FAILURE_ANALYSIS.md` - Analysis of deployment issues
- `plan_for_20260108.md` - Session planning and workflow documentation

---

## Change Log

- **2026-01-08:** Initial documentation created
- Documented manual vs automatic deployment processes
- Added 409 conflict prevention guidance
- Clarified environment terminology (dev-swa = staging)
