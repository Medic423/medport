# Production Deployment - New Chat Session Prompt
**Date:** January 16, 2026  
**Purpose:** Copy-paste ready prompt for new chat session focused on production deployment

---

## Copy and Paste This Prompt:

```
I'm starting a new session focused on deploying dev-swa to production. 

**Context:**
- Local dev and dev-swa functionality matches and both are working correctly
- Dev-swa backend is successfully deployed and running (Agencies feature working)
- Production infrastructure exists (TraccEms-Prod-Backend, traccems-prod-pgsql)
- Production deployment workflow exists (.github/workflows/prod-be.yaml)

**Reference Documents:**
- @docs/active/sessions/2026-01/production_deployment_202501016.md - Comprehensive production deployment analysis and plan
- @docs/reference/azure/deployment-guide.md - Azure deployment guide with technical details

**Current Status:**
- ✅ Dev-swa deployment working successfully
- ✅ Oryx build detection fix applied to dev-swa (SCM_DO_BUILD_DURING_DEPLOYMENT=false, ENABLE_ORYX_BUILD=false)
- ⚠️ Need to verify database alignment between dev-swa and production
- ⚠️ Need to apply Oryx fix to production App Service
- ⚠️ Need to sync production database if drift exists

**First Steps to Take:**

1. **Run Database Comparison**
   - Execute: `cd backend && node compare-database-structures.js`
   - Analyze results to identify any schema differences between dev-swa and production
   - Document missing tables/columns in production if any

2. **If Database Drift Detected:**
   - Determine sync strategy (automated migration vs manual pgAdmin)
   - Backup production database before any changes
   - Apply missing migrations incrementally
   - Verify schema alignment after sync

3. **Apply Oryx Fix to Production**
   - Configure production App Service settings:
     - SCM_DO_BUILD_DURING_DEPLOYMENT=false
     - ENABLE_ORYX_BUILD=false
   - Restart App Service after configuration

4. **Deploy to Production**
   - Trigger production workflow via GitHub Actions UI
   - Monitor deployment and migration steps
   - Verify backend starts successfully

**Environment Details:**
- Local Dev: PostgreSQL `medport_ems` (local)
- Dev-SWA: Azure PostgreSQL `traccems-dev-pgsql` (staging)
- Production: Azure PostgreSQL `traccems-prod-pgsql` (production)
- Backend: Node.js/Express with Prisma ORM
- Frontend: React/TypeScript

**Azure Resources:**
- Dev-SWA Backend: `TraccEms-Dev-Backend` (Resource Group: `TraccEms-Dev-USCentral`)
- Production Backend: `TraccEms-Prod-Backend` (Resource Group: `TraccEms-Prod-USCentral`)
- Dev-SWA Database: `traccems-dev-pgsql` (Resource Group: `TraccEms-Dev-USCentral`)
- Production Database: `traccems-prod-pgsql` (Resource Group: `TraccEms-Prod-USCentral`)

**Important Guidelines:**
1. Always backup production database before making any changes
2. Use pgAdmin 4 for manual database work if automated migrations fail
3. Follow deployment-guide.md procedures for deployment safety
4. Test thoroughly after each step before proceeding
5. Have rollback plan ready at each step
6. Never skip database backup before production changes
7. Verify each step completes successfully before moving to next

**Tools Available:**
- Azure CLI (configured and working)
- pgAdmin 4 (available for database work)
- Database comparison script: `backend/compare-database-structures.js`
- Backup scripts: `documentation/scripts/backup-production-database.sh`

**Key Question:**
Are the databases (dev-swa and production) in sync, and if not, what's the safest way to sync them before deploying?
```

---

## Additional Context (For Reference)

### Quick Reference Commands

**Database Comparison:**
```bash
cd /Users/scooper/Code/tcc-new-project/backend
node compare-database-structures.js
```

**Apply Oryx Fix to Production:**
```bash
az webapp config appsettings set \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --settings \
    SCM_DO_BUILD_DURING_DEPLOYMENT=false \
    ENABLE_ORYX_BUILD=false

az webapp restart \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral
```

**Backup Production Database:**
```bash
bash /Users/scooper/Code/tcc-new-project/documentation/scripts/backup-production-database.sh
```

**Check Production App Service Status:**
```bash
az webapp show \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "{state:state, defaultHostName:defaultHostName}"
```

**Check Production App Service Settings:**
```bash
az webapp config appsettings list \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "[?name=='SCM_DO_BUILD_DURING_DEPLOYMENT' || name=='ENABLE_ORYX_BUILD']"
```

### Production Deployment Workflow

**Location:** `.github/workflows/prod-be.yaml`

**Trigger:** Manual via GitHub Actions UI
- Go to: https://github.com/Medic423/medport/actions
- Select: "production - Deploy Prod Backend"
- Click: "Run workflow"
- Branch: `develop`
- Click: "Run workflow"

**What It Does:**
1. Checks out `develop` branch
2. Installs dependencies (`npm install`)
3. Generates Prisma models (`npx prisma generate`)
4. Runs migrations (`prisma migrate deploy` with `DATABASE_URL_PROD`)
5. Builds application (`npm run build`)
6. Deploys to `TraccEms-Prod-Backend`

### Critical Pre-Deployment Checklist

Before deploying to production:

- [ ] **Database Comparison Complete**
  - Run `compare-database-structures.js`
  - Document all differences
  - Plan sync strategy

- [ ] **Database Sync Complete** (if drift detected)
  - Apply missing migrations
  - Verify schema alignment
  - Test database connectivity

- [ ] **Production App Service Configuration**
  - Apply Oryx fix: `SCM_DO_BUILD_DURING_DEPLOYMENT=false` and `ENABLE_ORYX_BUILD=false`
  - Verify environment variables are set
  - Check `DATABASE_URL` points to production database

- [ ] **Production Database Backup Created**
  - Full backup before any changes
  - Store in `/Volumes/Acasis/tcc-backups/`
  - Verify backup is restorable

- [ ] **Dev-SWA Testing Complete**
  - All features work on dev-swa
  - No known issues
  - Ready to promote to production

---

**Document Status:** ✅ **READY FOR COPY-PASTE**  
**Last Updated:** January 16, 2026
