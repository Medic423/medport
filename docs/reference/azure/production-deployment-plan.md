# Production Deployment Plan: traccems.com
**Created:** December 8, 2025  
**Status:** Planning Phase  
**Goal:** Bring traccems.com online with production Azure resources

## Overview

Currently, **dev-swa.traccems.com** is operational and deployed from the `develop` branch. This plan outlines the steps needed to create and configure production resources for **traccems.com**.

**Important:** Azure SMS toll-free verification was rejected because the dev-swa.traccems.com URL was considered "invalid or inaccessible" by Azure's verification system. The production domain (traccems.com) will be required for SMS verification approval, making this deployment critical for full SMS functionality.

## Current Dev Environment Summary

### Azure Resources (Dev)
- **Frontend:** Azure Static Web App - `TraccEms-Dev-Frontend`
- **Backend:** Azure App Service - `TraccEms-Dev-Backend`
- **Database:** Azure PostgreSQL - `traccems-dev-pgsql`
- **Communication Services:** `TraccComms`
- **URL:** https://dev-swa.traccems.com
- **Deployment:** GitHub Actions workflows triggered by `develop` branch pushes

### GitHub Workflows (Dev)
- `.github/workflows/dev-fe.yaml` - Deploys frontend from `develop` branch
- `.github/workflows/dev-be.yaml` - Deploys backend from `develop` branch

### GitHub Secrets (Current)
- `DATABASE_URL` - Dev database connection string
- `AZURE_WEBAPP_PUBLISH_PROFILE` - Dev backend publish profile
- `AZURE_FRONTEND_API_TOKEN` - Dev frontend deployment token
- `PAT_TOKEN` - GitHub Personal Access Token for deployments

---

## Pre-Implementation Questions - ANSWERED

### 1. Git Branch Strategy ✅ ANSWERED & CORRECTED

**Current Workflow (CORRECTED):**
- **Feature/Bugfix branches** → Merge to `main` (development)
- **`main`** → Merge to `develop` (staging)
- **`develop`** → Push triggers deployment to dev-swa.traccems.com (testing)
- **After testing on dev-swa.traccems.com** → Promote to production

**Corrected Staged Deployment Approach:**
- **Stage 1 (Development):** Feature branches → `main` → `develop`
- **Stage 2 (Staging/Testing):** `develop` branch → dev-swa.traccems.com
  - Test all changes here first
  - Verify functionality before production deployment
- **Stage 3 (Production):** `develop` branch → traccems.com (after successful dev testing)
  - Only deploy to production after successful testing on dev-swa.traccems.com
  - Manual promotion: Create production deployment from `develop` when ready

**Decision:** Use staged deployment workflow with safety net
- **Development:** Feature branches → `main` → `develop` (existing workflow)
- **Staging:** `develop` → dev-swa.traccems.com (existing - NO CHANGES)
- **Production:** `develop` → traccems.com (new - separate pipeline)
- **Safety:** Production only deploys from `develop` AFTER testing on dev-swa.traccems.com

**Key Point:** Production deployment will be a **separate pipeline** that also triggers from `develop` branch, but only after manual approval/verification that dev-swa.traccems.com testing is successful. This maintains the safety of your staging process.

### 2. Database Strategy ✅ ANSWERED

**Decision: Separate Production Database**

**Arguments FOR Separate Databases:**
- ✅ **Isolation:** Dev testing won't affect production data
- ✅ **Safety:** Prevents accidental data corruption in production
- ✅ **Performance:** Dev testing won't impact production performance
- ✅ **Security:** Different access controls and firewall rules
- ✅ **Backup Strategy:** Independent backup schedules and retention
- ✅ **Rollback:** Can rollback production without affecting dev
- ✅ **Compliance:** Easier to meet data protection requirements
- ✅ **Testing:** Can test migrations on dev before applying to production

**Arguments AGAINST Separate Databases (for reference):**
- ❌ **Cost:** Two databases cost more than one
- ❌ **Complexity:** More resources to manage and maintain
- ❌ **Data Sync:** Harder to sync test data between environments
- ❌ **Migration Overhead:** Must run migrations twice

**Recommendation:** Separate databases is the correct choice for production. The safety and isolation benefits far outweigh the additional cost.

### 3. Domain Ownership ✅ ANSWERED

- ✅ **Domain:** `traccems.com` - Owned
- ✅ **DNS Provider:** Namecheap (https://ap.www.namecheap.com)
- ✅ **DNS Access:** Confirmed - Full access to DNS records

**Note:** DNS configuration will be done in Namecheap dashboard to point to Azure resources.

### 4. Resource Naming ✅ ANSWERED

**Decision: No specific preferences - Recommendations provided**

**Recommended Naming Convention:**
- **Production Frontend:** `TraccEms-Prod-Frontend` (clear distinction from dev)
- **Production Backend:** `TraccEms-Prod-Backend` (clear distinction from dev)
- **Production Database:** `traccems-prod-pgsql` (matches dev naming pattern)

**Rationale:**
- Consistent with existing dev naming (`TraccEms-Dev-*`)
- Clear distinction between dev and production resources
- Easy to identify in Azure Portal
- Follows Azure naming best practices

**Alternative (if preferred):**
- `TraccEms-Frontend`, `TraccEms-Backend`, `traccems-pgsql` (simpler, but less clear)

### 5. Communication Services Strategy ✅ ANSWERED

**Decision: Use Existing `TraccComms` Resource**

**Current Configuration:**
- **Resource Name:** `TraccComms`
- **Phone Number:** `+18339675959`
- **Status:** Configured and working on dev environment
- **Connection String:** Already set up in dev backend

**Strategy:**
- ✅ **Use same `TraccComms` resource** for both dev and production
- ✅ **No need for separate Communication Services resource**
- ✅ **Same phone number** (`+18339675959`) for both environments
- ✅ **Update SMS verification application** with production domain (traccems.com)

**Why Same Resource:**
- Communication Services can handle multiple applications
- Phone number can be used across environments
- Simpler configuration and management
- Lower cost (one resource instead of two)
- SMS verification needs production domain anyway

**Action Required:**
- Update Azure SMS toll-free verification application with traccems.com URL
- Current rejection reason: "invalid or inaccessible website url" (dev-swa.traccems.com)
- Production domain (traccems.com) should resolve this issue

---

## Answers to Key Questions

### Q1: Will production deployment be isolated from dev-swa.traccems.com?

**✅ YES - Complete Isolation**

Production deployment will be **completely isolated** from dev-swa.traccems.com:

- **Separate Azure Resources:**
  - Dev: `TraccEms-Dev-Frontend`, `TraccEms-Dev-Backend`, `traccems-dev-pgsql`
  - Prod: `TraccEms-Prod-Frontend`, `TraccEms-Prod-Backend`, `traccems-prod-pgsql`
  - No shared resources between dev and production

- **Separate GitHub Workflows:**
  - Dev workflows: `.github/workflows/dev-fe.yaml`, `.github/workflows/dev-be.yaml` (unchanged)
  - Prod workflows: `.github/workflows/prod-fe.yaml`, `.github/workflows/prod-be.yaml` (new, separate)
  - Each workflow deploys to different Azure resources

- **Separate Databases:**
  - Dev database: `traccems-dev-pgsql` (unchanged)
  - Prod database: `traccems-prod-pgsql` (new, separate)
  - No data sharing or cross-contamination

- **No Interruption:**
  - Dev-swa.traccems.com will continue to work exactly as it does now
  - Production deployment activities will not affect dev environment
  - You can deploy to production while dev continues running

**Result:** Zero impact on dev-swa.traccems.com availability or functionality.

### Q2: Is the workflow backwards? How does production deployment maintain staging safety?

**✅ CORRECTED - Workflow Now Matches Your Process**

**Your Current Workflow (CORRECT):**
```
Feature Branch → main → develop → dev-swa.traccems.com (test) → production
```

**How Production Deployment Maintains Safety:**

1. **Same Source, Different Destinations:**
   - Both dev and production workflows trigger from `develop` branch
   - Dev workflow deploys to dev-swa.traccems.com (existing, unchanged)
   - Production workflow deploys to traccems.com (new, separate)
   - **Key:** Same code source, but different deployment targets

2. **Staging Safety Preserved:**
   - Code flows: Feature → main → develop
   - `develop` branch deploys to dev-swa.traccems.com (staging)
   - You test on dev-swa.traccems.com
   - **Only after successful testing** do you trigger production deployment
   - Production deployment uses the same `develop` branch code that was tested

3. **Production Deployment Options:**
   - **Option A (Recommended):** Manual trigger (`workflow_dispatch`)
     - Production workflow has manual trigger button in GitHub Actions
     - You explicitly trigger production deployment after dev testing
     - Maximum safety and control
   
   - **Option B:** Automatic on `develop` push (with safeguards)
     - Production workflow triggers on `develop` push
     - But deploys to separate resources (isolated from dev)
     - Still maintains staging safety because you test on dev first

4. **Safety Net:**
   - Dev-swa.traccems.com remains your staging/testing environment
   - Production only gets code that was tested on dev-swa.traccems.com
   - Separate resources mean production issues don't affect dev
   - You can rollback production without affecting dev

**Result:** Your staging process remains intact, with production as a separate, isolated pipeline that uses the same tested code.

---

## Critical Issue: SMS Verification Rejection

### Current Status
- **Date:** December 12, 2025
- **Application ID:** `513670f8-6b42-4ead-8973-ae2a58ba7096`
- **Phone Number:** `+18339675959`
- **Status:** ❌ REJECTED

### Rejection Reason
Azure's toll-free verification application was rejected with the following reason:
> "invalid or inaccessible website url"

The application referenced **dev-swa.traccems.com**, which Azure's verification system considered invalid or inaccessible.

### Impact
- SMS functionality is currently blocked
- Toll-free number (`+18339675959`) has sending limits until verification is approved
- Production domain (traccems.com) is required for verification approval

### Solution
1. **Deploy production environment** (traccems.com) - This plan
2. **Resubmit SMS verification application** with traccems.com URL
3. **Update verification application** with:
   - Production domain: `https://traccems.com`
   - Privacy policy URL: `https://traccems.com/privacy-policy`
   - Terms URL: `https://traccems.com/terms`
   - Opt-in screenshot: From production site
4. **Wait for approval** (typically 1-3 business days)

### References
- [Azure Toll-Free Verification Guidelines](https://learn.microsoft.com/en-us/azure/communication-services/concepts/sms/toll-free-verification-guidelines#opt-in)
- [Azure SMS FAQ](https://learn.microsoft.com/en-us/azure/communication-services/concepts/sms/sms-faq#what-is-considered-a-high-quality-toll-free-verification-application)

---

## Staged Deployment Workflow

### Overview
This plan implements a **staged deployment strategy** that maintains your existing safety workflow:

```
Feature Branch → main → develop → dev-swa.traccems.com → traccems.com
     ↓            ↓        ↓            ↓ (test)            ↓ (production)
  Local Dev    Merge    Merge      Staging/Test        Production
```

### Workflow Steps

1. **Development Phase:**
   - Create feature/bugfix branches from `main`
   - Develop and test locally
   - Merge feature branch → `main`
   - Merge `main` → `develop`

2. **Staging Phase (EXISTING - NO CHANGES):**
   - `develop` branch automatically deploys to dev-swa.traccems.com
   - Test all functionality on dev environment
   - Verify SMS, database, API endpoints
   - Check for bugs or issues
   - **This process remains unchanged and isolated**

3. **Production Promotion (NEW - SEPARATE PIPELINE):**
   - After successful testing on dev-swa.traccems.com
   - Production deployment also triggers from `develop` branch
   - **Separate Azure resources** (isolated from dev)
   - **Manual approval** or **separate workflow** to deploy to production
   - Production deployment happens only after dev validation

### Benefits
- ✅ **Safety:** Test changes on dev-swa.traccems.com before production
- ✅ **Isolation:** Production resources completely separate from dev
- ✅ **No Interruption:** Dev environment remains untouched
- ✅ **Stability:** Production only gets code tested on dev-swa.traccems.com
- ✅ **Rollback:** Easy to revert production without affecting dev
- ✅ **Confidence:** Know changes work before production deployment

### Branch Mapping
- **`develop` branch** → dev-swa.traccems.com (existing workflow - UNCHANGED)
- **`develop` branch** → traccems.com (new production workflow - SEPARATE PIPELINE)

### Isolation Guarantee
- ✅ **Separate Azure Resources:** Production uses `TraccEms-Prod-*` resources
- ✅ **Separate Database:** Production uses `traccems-prod-pgsql`
- ✅ **Separate GitHub Workflows:** Production workflows are separate files
- ✅ **No Impact on Dev:** Dev-swa.traccems.com continues to work independently
- ✅ **Same Source:** Both deploy from `develop`, but to different resources

---

## Implementation Plan

### Phase 1: Azure Resource Creation

**Implementation Guide:** See `docs/reference/azure/phase1-implementation-guide.md` for detailed step-by-step instructions.

#### Task 1.1: Create Production Resource Group
- [ ] **Action:** Create new Azure Resource Group
- [ ] **Name:** `TraccEms-Prod-USCentral`
- [ ] **Region:** `Central US`
- [ ] **Subscription:** TraccEmsSubscription
- [ ] **Notes:** See Phase 1 Implementation Guide for detailed steps

#### Task 1.2: Create Production Azure Static Web App ✅ COMPLETED
- [x] **Action:** Create new Azure Static Web App resource ✅
- [x] **Name:** `TraccEms-Prod-Frontend` ✅
- [x] **Resource Group:** `TraccEms-Prod-USCentral` ✅
- [x] **Region:** `Central US` ✅
- [x] **SKU:** Standard ✅
- [x] **Deployment Authorization:** Deployment token (for GitHub Actions) ✅
- [x] **Subscription:** TraccEmsSubscription (fb5dde6b-779f-4ef5-b457-4b4d087a48ee) ✅
- [x] **Resource ID:** `/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourcegroups/TraccEms-Prod-USCentral/providers/Microsoft.Web/staticSites/TraccEms-Prod-Frontend` ✅
- [x] **Deployment Token:** ✅ **OBTAINED** (starts with: `6e26f747b51cd74712e27aef71bd61ae...`)
- [x] **Notes:** Deployment token obtained. Will be added to GitHub Secrets as `AZURE_FRONTEND_PROD_API_TOKEN` in Phase 3.

#### Task 1.3: Create Production App Service Plan ✅ COMPLETED
- [x] **Action:** Create new App Service Plan ✅
- [x] **Name:** `ASP-TraccEmsProdUSCentral` ✅
- [x] **Resource Group:** `TraccEms-Prod-USCentral` ✅
- [x] **Operating System:** Linux ✅
- [x] **Region:** `Central US` ✅
- [x] **Subscription:** TraccEmsSubscription (fb5dde6b-779f-4ef5-b457-4b4d087a48ee) ✅
- [x] **Resource ID:** `/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourcegroups/TraccEms-Prod-USCentral/providers/Microsoft.Web/serverFarms/ASP-TraccEmsProdUSCentral` ✅
- [ ] **Pricing Tier:** Verify in Azure Portal (should be Basic B1 or Standard S1)
- [x] **Notes:** App Service Plan ready for App Service creation

#### Task 1.4: Create Production Azure App Service (Backend) ✅ COMPLETED
- [x] **Action:** Create new Azure App Service (Web App) ✅
- [x] **Name:** `TraccEms-Prod-Backend` ✅
- [x] **Resource Group:** `TraccEms-Prod-USCentral` ✅
- [x] **Runtime Stack:** Node.js 24.x (matching dev) ✅
- [x] **Operating System:** Linux ✅
- [x] **Region:** `Central US` ✅
- [x] **App Service Plan:** `ASP-TraccEmsProdUSCentral` ✅
- [x] **Subscription:** TraccEmsSubscription (fb5dde6b-779f-4ef5-b457-4b4d087a48ee) ✅
- [x] **Publish Profile:** ✅ **OBTAINED** - File: `TraccEms-Prod-Backend.publishsettings` (saved in project root)
- [x] **Application Insights:** Code-less monitoring not supported (expected, can use SDK later if needed)
- [x] **App Service URL:** `https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net`
- [x] **Resource ID:** `/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourcegroups/TraccEms-Prod-USCentral/providers/Microsoft.Web/sites/TraccEms-Prod-Backend`
- [x] **Notes:** Publish profile obtained via Azure CLI. Contents will be added to GitHub Secrets as `AZURE_WEBAPP_PROD_PUBLISH_PROFILE` in Phase 3

#### Task 1.5: Create Production Database (Separate - CONFIRMED) ✅ COMPLETED
- [x] **Action:** Create new Azure PostgreSQL Flexible Server ✅
- [x] **Name:** `traccems-prod-pgsql` ✅
- [x] **Resource Group:** `TraccEms-Prod-USCentral` ✅
- [x] **Region:** `Central US` ✅
- [x] **Version:** PostgreSQL 17 ✅
- [x] **Compute:** General Purpose D4ds_v5 (4 vCores, 16 GiB RAM) ✅
- [x] **Storage:** 128 GiB, P10 (500 IOPS) ✅
- [x] **Backup:** 7 days retention ✅
- [x] **High Availability:** Enabled (Zone redundant) ✅
- [x] **Microsoft Entra Authentication:** chuck@traccems.com ✅
- [x] **Subscription:** TraccEmsSubscription (fb5dde6b-779f-4ef5-b457-4b4d087a48ee) ✅
- [x] **Resource ID:** `/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourceGroups/TraccEms-Prod-USCentral/providers/Microsoft.DBforPostgreSQL/flexibleServers/traccems-prod-pgsql` ✅
- [ ] **Connection String:** ⚠️ Get from Azure Portal → Connection strings
- [x] **Notes:** Database created successfully with high availability enabled

#### Task 1.6: Configure Database Firewall
- [ ] **Action:** Configure PostgreSQL firewall rules
- [ ] **Allow Azure Services:** Enable (for App Service access) ✅ CRITICAL
- [ ] **Get Production App Service Outbound IPs:** From App Service Properties
- [ ] **Add Production App Service IPs:** Add each outbound IP as firewall rule
- [ ] **Add Current Client IP:** For manual database access (optional)
- [ ] **Add GitHub Actions IPs:** If needed for migrations (optional, Azure services enabled should cover this)
- [ ] **Notes:** See Phase 1 Implementation Guide for detailed steps

---

### Phase 2: Database Setup

#### Task 2.1: Initialize Production Database Schema
- [ ] **Action:** Run Prisma migrations on production database
- [ ] **Method:** Via GitHub Actions workflow or manual connection
- [ ] **Baseline:** Apply all migrations from `backend/prisma/migrations/`
- [ ] **Verification:** Confirm `_prisma_migrations` table has all migrations
- [ ] **Notes:** Document migration status and any issues

#### Task 2.2: Seed Production Database (If Needed)
- [ ] **Action:** Decide if production needs seed data
- [ ] **Options:**
  - [ ] Start with empty database (users create accounts)
  - [ ] Seed with initial admin user
  - [ ] Seed with test agencies/facilities (if needed)
- [ ] **Notes:** Document seed strategy and any data loaded

#### Task 2.3: Configure Database Connection String
- [ ] **Action:** Create production `DATABASE_URL` connection string
- [ ] **Format:** `postgresql://[admin]:[password]@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require`
- [ ] **Storage:** Add to GitHub Secrets as `DATABASE_URL_PROD` (or update existing)
- [ ] **Notes:** Document connection string format (without password)

---

### Phase 3: GitHub Actions Workflows

#### Task 3.1: Create Production Frontend Workflow
- [ ] **Action:** Create `.github/workflows/prod-fe.yaml`
- [ ] **Trigger:** Push to `develop` branch (same source as dev, but separate pipeline)
- [ ] **App Name:** `TraccEms-Prod-Frontend` (match Azure resource name)
- [ ] **API Token Secret:** Create new secret `AZURE_FRONTEND_PROD_API_TOKEN`
- [ ] **Build:** Same as dev workflow
- [ ] **Deploy:** Use Azure Static Web Apps deploy action
- [ ] **Workflow Strategy:** 
  - **Existing:** Deploy to dev-swa.traccems.com from `develop` branch (UNCHANGED)
  - **New:** Deploy to traccems.com from `develop` branch (SEPARATE PIPELINE)
  - **Safety:** Both workflows trigger from `develop`, but deploy to different resources
  - **Manual Control:** Can add manual approval step or workflow_dispatch trigger for production
- [ ] **Isolation:** Production deployment completely separate from dev deployment
- [ ] **Notes:** Document workflow file location and trigger branch

#### Task 3.2: Create Production Backend Workflow
- [ ] **Action:** Create `.github/workflows/prod-be.yaml`
- [ ] **Trigger:** Push to `develop` branch (same source as dev, but separate pipeline)
- [ ] **App Name:** `TraccEms-Prod-Backend` (match Azure resource name)
- [ ] **Publish Profile Secret:** Create new secret `AZURE_WEBAPP_PROD_PUBLISH_PROFILE`
- [ ] **Database URL:** Use `DATABASE_URL_PROD` secret (production database connection string)
- [ ] **Migrations:** Run Prisma migrations as part of deployment
- [ ] **Build:** Same as dev workflow
- [ ] **Workflow Strategy:**
  - **Existing:** Deploy to dev backend from `develop` branch (UNCHANGED)
  - **New:** Deploy to production backend from `develop` branch (SEPARATE PIPELINE)
  - **Safety:** Both workflows trigger from `develop`, but deploy to different resources
  - **Manual Control:** Can add manual approval step or workflow_dispatch trigger for production
- [ ] **Isolation:** Production deployment completely separate from dev deployment
- [ ] **Notes:** Document workflow file location and trigger branch

#### Task 3.3: Configure Workflow Safety ✅ DECISION MADE
- [ ] **Action:** Configure `workflow_dispatch` trigger for manual production deployments
- [ ] **Chosen Approach:** Option A - Manual trigger (`workflow_dispatch`)
- [ ] **Implementation:**
  - Add `workflow_dispatch` trigger to both production workflows
  - Add optional `inputs` for deployment confirmation
  - Production only deploys when manually triggered from GitHub Actions UI
- [ ] **Benefits:**
  - Maximum safety and control
  - Production only deploys after explicit approval
  - Can review code on dev-swa.traccems.com before triggering production
  - Easy to skip production deployment if issues found on dev
- [ ] **How to Trigger:**
  - Go to GitHub Actions → Workflows → Select production workflow
  - Click "Run workflow" button
  - Select `develop` branch
  - Click "Run workflow" to start deployment
- [ ] **Notes:** Document workflow trigger process and add to production troubleshooting guide

#### Task 3.3: Configure GitHub Secrets
- [ ] **Action:** Add production secrets to GitHub repository
- [ ] **Secrets to Add:**
  - [ ] `DATABASE_URL_PROD` - Production database connection string
  - [ ] `AZURE_WEBAPP_PROD_PUBLISH_PROFILE` - Production backend publish profile
  - [ ] `AZURE_FRONTEND_PROD_API_TOKEN` - Production frontend deployment token
- [ ] **Notes:** Document which secrets are production-specific

---

### Phase 4: Environment Variables Configuration

#### Task 4.1: Configure Production Backend Environment Variables
- [ ] **Action:** Set application settings in Azure Portal for production backend
- [ ] **Variables to Set:**
  - [ ] `DATABASE_URL` - Production database connection string (from `DATABASE_URL_PROD` secret)
  - [ ] `NODE_ENV` - Set to `production`
  - [ ] `AZURE_SMS_ENABLED` - Set to `true`
  - [ ] `AZURE_COMMUNICATION_CONNECTION_STRING` - Same as dev (from `TraccComms` resource)
  - [ ] `AZURE_COMMUNICATION_PHONE_NUMBER` - Set to `+18339675959` (same as dev)
  - [ ] `PORT` - Usually auto-set by Azure
- [ ] **Note:** Using same Communication Services resource (`TraccComms`) as dev
- [ ] **Notes:** Document all environment variables set

#### Task 4.2: Configure Production Frontend Environment Variables
- [ ] **Action:** Set application settings in Azure Static Web App
- [ ] **Variables to Set:**
  - [ ] `VITE_API_URL` - Set to production backend URL (e.g., `https://api.traccems.com`)
  - [ ] Any other frontend-specific environment variables
- [ ] **Notes:** Document frontend environment variables

#### Task 4.3: Verify Environment Variables
- [ ] **Action:** Test that environment variables are accessible
- [ ] **Backend:** Check log stream for initialization messages
- [ ] **Frontend:** Verify API calls go to correct backend URL
- [ ] **Notes:** Document verification results

---

### Phase 5: Custom Domain Configuration

#### Task 5.1: Verify Domain Ownership ✅ COMPLETED
- [x] **Action:** Confirm `traccems.com` domain ownership
- [x] **DNS Provider:** Namecheap (https://ap.www.namecheap.com)
- [x] **Access:** Verified - Full access to DNS records
- [x] **Current DNS Records Documented:** See DNS Configuration section below
- [ ] **Notes:** DNS records documented and ready for production configuration

#### Task 5.2: Configure Custom Domain for Frontend
- [ ] **Action:** Add custom domain to Azure Static Web App
- [ ] **Domain:** `traccems.com` and `www.traccems.com` (if desired)
- [ ] **Method:** Azure Portal → Static Web App → Custom domains
- [ ] **DNS Records:** Follow Azure's DNS configuration instructions
- [ ] **SSL Certificate:** Azure will provision free SSL certificate
- [ ] **Verification:** Wait for DNS propagation and SSL certificate provisioning
- [ ] **Notes:** Document DNS records added and verification status

#### Task 5.3: Configure Custom Domain for Backend API
- [ ] **Action:** Add custom domain to Azure App Service
- [ ] **Domain:** `api.traccems.com` (recommended) or `backend.traccems.com`
- [ ] **Method:** Azure Portal → App Service → Custom domains
- [ ] **DNS Records:** Add CNAME or A record as instructed by Azure
- [ ] **SSL Certificate:** Azure will provision free SSL certificate
- [ ] **Verification:** Wait for DNS propagation and SSL certificate provisioning
- [ ] **Notes:** Document DNS records added and verification status

#### Task 5.4: Update Frontend API Configuration
- [ ] **Action:** Update frontend to use production API URL
- [ ] **File:** `frontend/src/services/api.ts`
- [ ] **Change:** Update `DEFAULT_PROD_URL` to production backend URL
- [ ] **Or:** Set `VITE_API_URL` environment variable in Azure Static Web App
- [ ] **Test:** Verify frontend connects to production backend
- [ ] **Notes:** Document API URL configuration method used

---

### Phase 6: DNS Configuration

#### Current DNS Records (Namecheap) ✅ DOCUMENTED

**Current Configuration (December 12, 2025):**
```
A Record:        @ → 216.198.79.1 (TTL: Automatic)
CNAME Record:    api → 492395b7c4732f5e.vercel-dns-017.com (TTL: Automatic) [OLD - Vercel]
CNAME Record:    autodiscover → autodiscover.outlook.com (TTL: 60 min) [PRESERVE - Email]
CNAME Record:    dev → jolly-plant-07b71a110.3.azurestaticapps.net (TTL: Automatic) [KEEP - Dev]
CNAME Record:    dev-api → traccems-dev-backend-h4add2fpcegrc2bz.centralus-01.azurewebsites.net (TTL: Automatic) [KEEP - Dev]
MX Record:       @ → com.mail.protection.outlook.com (Priority: 0) (TTL: 60 min) [PRESERVE - Email]
```

**Records to Preserve (DO NOT CHANGE):**
- ✅ `autodiscover` CNAME → autodiscover.outlook.com (Email autodiscover)
- ✅ `MX` record → com.mail.protection.outlook.com (Email hosting)
- ✅ `dev` CNAME → jolly-plant-07b71a110.3.azurestaticapps.net (Dev frontend)
- ✅ `dev-api` CNAME → traccems-dev-backend-h4add2fpcegrc2bz.centralus-01.azurewebsites.net (Dev backend)

**Records to Update:**
- ⚠️ `@` A Record → 216.198.79.1 (Replace with Azure Static Web App CNAME)
- ⚠️ `api` CNAME → 492395b7c4732f5e.vercel-dns-017.com (Replace with Azure App Service CNAME)

**Notes:**
- Email records (MX and autodiscover) must be preserved for email functionality
- Dev records (dev and dev-api) remain unchanged
- Root domain (@) and api subdomain will be updated to point to production Azure resources

#### Task 6.1: Configure Root Domain (traccems.com)
- [ ] **Action:** Update DNS record at Namecheap
- [ ] **Current:** A Record `@` → 216.198.79.1
- [ ] **New:** CNAME Record `@` → [Azure Static Web App hostname] (as specified by Azure)
- [ ] **Method:** Namecheap → Domain List → traccems.com → Advanced DNS
- [ ] **Action:** Delete existing A record, add CNAME record
- [ ] **TTL:** Automatic (or 3600 if manual)
- [ ] **Important:** Some DNS providers don't support CNAME on root domain - Azure will provide instructions
- [ ] **Alternative:** If CNAME not supported, Azure may provide A records or ALIAS record
- [ ] **Notes:** Document DNS record details and Azure-provided hostname

#### Task 6.2: Configure WWW Subdomain (Optional)
- [ ] **Action:** Add DNS record for `www.traccems.com` (if desired)
- [ ] **Record Type:** CNAME
- [ ] **Name:** `www`
- [ ] **Value:** Azure Static Web App hostname (same as root domain)
- [ ] **TTL:** Automatic (or 3600)
- [ ] **Notes:** Document DNS record details

#### Task 6.3: Configure API Subdomain
- [ ] **Action:** Update DNS record for `api.traccems.com`
- [ ] **Current:** CNAME `api` → 492395b7c4732f5e.vercel-dns-017.com (OLD - Vercel)
- [ ] **New:** CNAME `api` → [Azure App Service hostname] (provided by Azure)
- [ ] **Method:** Namecheap → Domain List → traccems.com → Advanced DNS
- [ ] **Action:** Update existing CNAME record with new Azure App Service hostname
- [ ] **TTL:** Automatic (or 3600)
- [ ] **Notes:** Document DNS record details and Azure-provided hostname

#### Task 6.4: Verify DNS Propagation
- [ ] **Action:** Wait for DNS propagation (typically 1-24 hours)
- [ ] **Tools:** Use `dig`, `nslookup`, or online DNS checker
- [ ] **Check:** Verify all domains resolve correctly
- [ ] **Notes:** Document propagation time and verification results

---

### Phase 7: SSL Certificate Configuration

#### Task 7.1: Verify Frontend SSL Certificate
- [ ] **Action:** Check SSL certificate status in Azure Portal
- [ ] **Location:** Static Web App → Custom domains
- [ ] **Status:** Should show "Certificate provisioned" or "Ready"
- [ ] **Test:** Access https://traccems.com and verify SSL works
- [ ] **Notes:** Document certificate status and expiration date

#### Task 7.2: Verify Backend SSL Certificate
- [ ] **Action:** Check SSL certificate status in Azure Portal
- [ ] **Location:** App Service → Custom domains
- [ ] **Status:** Should show "Certificate provisioned" or "Ready"
- [ ] **Test:** Access https://api.traccems.com and verify SSL works
- [ ] **Notes:** Document certificate status and expiration date

#### Task 7.3: Configure SSL Certificate Renewal
- [ ] **Action:** Verify auto-renewal is enabled (Azure handles this automatically)
- [ ] **Check:** Azure Portal → App Service → TLS/SSL settings
- [ ] **Notes:** Document renewal configuration

---

### Phase 8: Testing and Verification

#### Task 8.1: Test Production Frontend Deployment
- [ ] **Action:** Push to production branch and verify deployment
- [ ] **Check:** GitHub Actions workflow completes successfully
- [ ] **Verify:** Frontend is accessible at https://traccems.com
- [ ] **Test:** Basic page loads and navigation works
- [ ] **Notes:** Document deployment results and any issues

#### Task 8.2: Test Production Backend Deployment
- [ ] **Action:** Push to production branch and verify deployment
- [ ] **Check:** GitHub Actions workflow completes successfully
- [ ] **Verify:** Backend is accessible at https://api.traccems.com/health
- [ ] **Test:** API endpoints respond correctly
- [ ] **Notes:** Document deployment results and any issues

#### Task 8.3: Test Database Connectivity
- [ ] **Action:** Verify backend can connect to production database
- [ ] **Check:** Backend logs show successful database connection
- [ ] **Test:** Make API call that requires database (e.g., login)
- [ ] **Verify:** Data persists correctly
- [ ] **Notes:** Document connectivity test results

#### Task 8.4: Test SMS Functionality
- [ ] **Action:** Verify SMS service is configured correctly
- [ ] **Check:** Backend logs show SMS service initialized
- [ ] **Test:** Create a trip with notification radius (if possible)
- [ ] **Verify:** SMS configuration is correct
- [ ] **Update SMS Verification:** Resubmit Azure SMS toll-free verification with traccems.com URL
- [ ] **Current Issue:** Previous verification rejected because dev-swa.traccems.com was "invalid or inaccessible"
- [ ] **Solution:** Production domain (traccems.com) should resolve verification issue
- [ ] **Notes:** Document SMS configuration status and verification submission

#### Task 8.5: End-to-End Testing
- [ ] **Action:** Perform complete user workflow test
- [ ] **Tests:**
  - [ ] User registration/login
  - [ ] Create trip (healthcare user)
  - [ ] View trips (EMS user)
  - [ ] Accept trip
  - [ ] Complete trip
  - [ ] SMS notifications (if applicable)
- [ ] **Notes:** Document test results and any issues found

---

### Phase 9: Monitoring and Logging

#### Task 9.1: Configure Application Insights (Optional)
- [ ] **Action:** Set up Application Insights for production
- [ ] **Purpose:** Monitor application performance and errors
- [ ] **Location:** Azure Portal → App Service → Application Insights
- [ ] **Notes:** Document Application Insights configuration

#### Task 9.2: Set Up Log Alerts
- [ ] **Action:** Configure alerts for critical errors
- [ ] **Types:**
  - [ ] Application errors
  - [ ] Database connection failures
  - [ ] High response times
  - [ ] SSL certificate expiration warnings
- [ ] **Notes:** Document alert configuration

#### Task 9.3: Configure Backup Alerts
- [ ] **Action:** Set up alerts for database backups
- [ ] **Verify:** Backups are running successfully
- [ ] **Notes:** Document backup configuration

---

### Phase 10: Documentation and Handoff

#### Task 10.1: Document Production Configuration
- [ ] **Action:** Create production configuration document
- [ ] **Include:**
  - [ ] Resource names and resource groups
  - [ ] URLs and endpoints
  - [ ] Environment variables
  - [ ] DNS configuration
  - [ ] GitHub secrets used
- [ ] **Location:** `docs/reference/azure/production-configuration.md`
- [ ] **Notes:** Document location and update date

#### Task 10.2: Update Deployment Documentation
- [ ] **Action:** Update deployment guides with production information
- [ ] **Files to Update:**
  - [ ] `docs/reference/DEVELOPER_QUICK_START.md` (if needed)
  - [ ] Any deployment-related docs
- [ ] **Notes:** Document updates made

#### Task 10.3: Create Production Troubleshooting Guide
- [ ] **Action:** Create production-specific troubleshooting guide
- [ ] **Include:**
  - [ ] Common issues and solutions
  - [ ] How to check logs
  - [ ] How to rollback deployments
  - [ ] Emergency contacts
- [ ] **Location:** `docs/reference/azure/production-troubleshooting.md`
- [ ] **Notes:** Document location

---

## Technical Notes

### Resource Naming Convention
- **Dev:** `TraccEms-Dev-Frontend`, `TraccEms-Dev-Backend`, `traccems-dev-pgsql`
- **Prod:** `TraccEms-Prod-Frontend`, `TraccEms-Prod-Backend`, `traccems-prod-pgsql` (or without "Prod" suffix per preference)

### URL Structure
- **Dev Frontend:** https://dev-swa.traccems.com
- **Dev Backend:** https://dev-api.traccems.com (or similar)
- **Prod Frontend:** https://traccems.com
- **Prod Backend:** https://api.traccems.com (recommended)

### Branch Strategy (Staged Deployment - CORRECTED)
- **Development:** Feature branches → `main` → `develop`
- **Dev/Staging:** `develop` branch → dev-swa.traccems.com
  - Test all changes here first
  - Verify functionality before production
  - **This process remains unchanged and isolated**
- **Production:** `develop` branch → traccems.com (separate pipeline)
  - Deploy only after successful dev testing
  - Manual promotion: Trigger production deployment when ready
  - **Separate Azure resources** ensure no impact on dev environment
- **Workflow:** Feature → main → develop → Test on Dev → Promote to Production
- **Isolation:** Production resources completely separate from dev resources

### Database Considerations
- Production database should have:
  - Automated backups enabled
  - High availability (if critical)
  - Appropriate compute tier for production load
  - Firewall rules configured correctly
  - SSL connections required

### Security Considerations
- Use separate secrets for production
- Enable SSL/TLS for all connections
- Configure firewall rules appropriately
- Use managed identities where possible
- Rotate secrets regularly

---

## Open Questions

1. ~~**Branch Strategy:**~~ ✅ ANSWERED & CORRECTED - Staged deployment: Feature → main → develop → dev-swa (test) → production (separate pipeline)
2. ~~**Database:**~~ ✅ ANSWERED - Separate production database confirmed
3. ~~**Domain:**~~ ✅ ANSWERED - traccems.com owned, DNS managed on Namecheap
4. ~~**Resource Naming:**~~ ✅ ANSWERED - Using `TraccEms-Prod-*` naming convention
5. ~~**Communication Services:**~~ ✅ ANSWERED - Use same `TraccComms` resource, update verification with production domain
6. **Scaling:** What are the expected production load requirements? (Optional - can be determined later)
7. **Backup Strategy:** What backup retention period is needed for production? (Optional - can use Azure defaults initially)
8. ~~**Production Deployment Trigger:**~~ ✅ ANSWERED - Manual (`workflow_dispatch`) selected for maximum safety and control

---

## Pre-Implementation Checklist

Before starting implementation, gather the following information:

### Information Needed Before Starting

#### 1. Azure Account & Access ✅ COMPLETED
- [x] Azure Portal access confirmed ✅
- [x] Subscription ID: `fb5dde6b-779f-4ef5-b457-4b4d087a48ee` ✅
- [x] Subscription Name: `TraccEmsSubscription` ✅
- [x] Resource Group preference: Create new production resource group ✅
- [x] Production Resource Group: `TraccEms-Prod-USCentral` (to be created)

#### 2. DNS Information (Namecheap) ✅ COMPLETED
- [x] Current DNS records for traccems.com - Documented
- [x] Records to preserve identified (email MX/autodiscover, dev records)
- [x] Records to update identified (root domain, api subdomain)
- [x] **Action:** DNS records documented in Phase 6: DNS Configuration section

#### 3. GitHub Access ✅ (Assumed Available)
- [ ] GitHub repository access confirmed
- [ ] Ability to create GitHub Secrets confirmed
- [ ] GitHub Actions access confirmed

#### 4. Azure Communication Services
- [ ] `TraccComms` resource connection string (already have, but verify accessible)
- [ ] Phone number: `+18339675959` (confirmed)
- [ ] **Action:** Verify connection string is accessible in Azure Portal

#### 5. Current Dev Environment Details ✅ COMPLETED
- [x] Dev Resource Group: `TraccEms-Dev-USCentral` ✅
- [x] Dev Frontend: `TraccEms-Dev-Frontend` (Static Web App, Central US) ✅
- [x] Dev Backend: `TraccEms-Dev-Backend` (App Service, Central US) ✅
- [x] Dev Database: `traccems-dev-pgsql` (PostgreSQL Flexible Server, Central US) ✅
- [x] Dev App Service Plan: `ASP-TraccEmsDevUSCentral-aa72` (Central US) ✅
- [x] Communication Services: `TraccComms` (Global, DefaultResourceGroup-EUS2) ✅
- [x] **All production resources will use:** Central US region (matching dev) ✅

#### 6. Production Requirements (Optional - Can Determine Later)
- [ ] Expected production traffic/load (for database sizing)
- [ ] Backup retention requirements (Azure defaults are usually fine)
- [ ] High availability requirements (can start with standard, upgrade later)

### Information Gathering Steps

1. **Namecheap DNS Check:**
   ```
   - Log into https://ap.www.namecheap.com
   - Go to Domain List → traccems.com → Advanced DNS
   - Take screenshot or list current DNS records
   - Note any existing A/CNAME/MX records
   ```

2. **Azure Portal Check:**
   ```
   - Verify TraccComms resource exists and is accessible
   - Note the region of TraccEms-Dev-Frontend and TraccEms-Dev-Backend
   - Note the resource group name for dev resources
   - Verify you can create new resources in Azure
   ```

3. **GitHub Check:**
   ```
   - Verify you can access repository settings
   - Verify you can create secrets in Settings → Secrets and variables → Actions
   - Verify GitHub Actions are enabled
   ```

## Next Steps

1. ✅ **Review this plan** - Ready for your review
2. ✅ **Answer pre-implementation questions** - All answered
3. ✅ **Domain ownership confirmed** - traccems.com on Namecheap
4. ✅ **Database strategy decided** - Separate production database
5. ✅ **Resource naming confirmed** - `TraccEms-Prod-*` convention
6. ✅ **Communication Services strategy confirmed** - Use existing `TraccComms` resource
7. ✅ **Workflow clarified** - Production isolated, uses `develop` branch source
8. ✅ **Deployment trigger decided** - Manual (`workflow_dispatch`)
9. ⏸️ **Gather pre-implementation information** - See checklist above
10. ⏸️ **Final review** - Awaiting your OK to proceed
11. **Begin Phase 1** - Azure Resource Creation (after your approval)

### Ready to Start?
Once you've reviewed the plan and gathered the information above, give the OK and we'll begin Phase 1: Azure Resource Creation.

---

## Progress Tracking

**Last Updated:** December 12, 2025  
**Current Phase:** Planning - Questions Answered  
**Status:** Ready to proceed pending domain/DNS confirmation

### Decisions Made:
- ✅ Staged deployment workflow (Feature → main → develop → dev-swa → production)
- ✅ Separate production database
- ✅ Resource naming convention (`TraccEms-Prod-*`)
- ✅ Use existing `TraccComms` Communication Services resource
- ✅ Domain ownership confirmed (traccems.com on Namecheap)
- ✅ Production deployment isolated from dev-swa.traccems.com
- ✅ Production pipeline separate but uses same `develop` branch source

### Critical Note: SMS Verification
- Azure SMS toll-free verification was rejected (December 12, 2025)
- Reason: "invalid or inaccessible website url" (dev-swa.traccems.com)
- Solution: Production domain (traccems.com) required for SMS verification approval
- Action: Resubmit verification application with traccems.com URL after production deployment

---

## References

- [Azure Static Web Apps Documentation](https://learn.microsoft.com/azure/static-web-apps/)
- [Azure App Service Documentation](https://learn.microsoft.com/azure/app-service/)
- [Azure PostgreSQL Documentation](https://learn.microsoft.com/azure/postgresql/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- Existing dev deployment workflows: `.github/workflows/dev-fe.yaml`, `.github/workflows/dev-be.yaml`
- Azure reference docs: `docs/reference/azure/`

