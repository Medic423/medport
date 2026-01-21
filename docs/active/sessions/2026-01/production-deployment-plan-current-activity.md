# Production Deployment Plan - Current Activity Feature
**Date:** January 21, 2026  
**Status:** 📋 **READY FOR DEPLOYMENT**  
**Feature:** Current Activity with Facilities Online Stats

---

## ✅ Pre-Deployment Checklist

### Code Status
- ✅ **Feature Complete:** Current Activity feature implemented and tested
- ✅ **Dev-SWA Verified:** Feature working correctly in dev environment
- ✅ **Database Migration:** Migration script ready (`04-add-lastactivity-to-user-tables.sql`)
- ✅ **Workflow Updated:** Production workflow includes build verification and cleanup

### Database Migration Status
- ✅ **Dev-SWA:** Migration applied and verified
- ⚠️ **Production:** Migration needs to be applied

### Workflow Improvements
- ✅ **Build Verification:** Added to production workflow
- ✅ **Cleanup Steps:** Added tar.gz and oryx-manifest.toml cleanup
- ✅ **Diagnostic Logging:** Included in code (will help troubleshoot if needed)

---

## Deployment Steps

### Step 1: Apply Database Migration to Production

**⚠️ IMPORTANT:** Database migration must be applied BEFORE deploying code.

1. **Connect to Production Database:**
   - Use pgAdmin or Azure Portal → PostgreSQL → Query Editor
   - Database: `traccems-prod-pgsql`
   - Connection: Use `DATABASE_URL_PROD` connection string

2. **Run Migration Script:**
   ```sql
   -- Run: backend/migrations/04-add-lastactivity-to-user-tables.sql
   ```
   
   Or execute via pgAdmin:
   - Open `backend/migrations/04-add-lastactivity-to-user-tables.sql`
   - Execute against production database

3. **Verify Migration:**
   ```sql
   -- Check columns exist
   SELECT 
       table_name,
       column_name,
       data_type,
       is_nullable
   FROM information_schema.columns
   WHERE table_name IN ('center_users', 'ems_users', 'healthcare_users')
     AND column_name = 'lastActivity'
   ORDER BY table_name;
   
   -- Should return 3 rows
   
   -- Check indexes exist
   SELECT 
       tablename,
       indexname
   FROM pg_indexes
   WHERE tablename IN ('center_users', 'ems_users', 'healthcare_users')
     AND indexname LIKE '%lastActivity%'
   ORDER BY tablename;
   
   -- Should return 3 rows
   ```

### Step 2: Verify Production App Service Configuration

1. **Check Oryx Settings:**
   ```bash
   az webapp config appsettings list \
     --name TraccEms-Prod-Backend \
     --resource-group TraccEms-Prod-USCentral \
     --query "[?name=='SCM_DO_BUILD_DURING_DEPLOYMENT' || name=='ENABLE_ORYX_BUILD'].{Name:name, Value:value}" \
     --output table
   ```
   
   **Expected:**
   - `SCM_DO_BUILD_DURING_DEPLOYMENT = false`
   - `ENABLE_ORYX_BUILD = false`
   
   **If not set:**
   ```bash
   az webapp config appsettings set \
     --name TraccEms-Prod-Backend \
     --resource-group TraccEms-Prod-USCentral \
     --settings SCM_DO_BUILD_DURING_DEPLOYMENT=false ENABLE_ORYX_BUILD=false
   ```

2. **Check Startup Command:**
   ```bash
   az webapp config show \
     --name TraccEms-Prod-Backend \
     --resource-group TraccEms-Prod-USCentral \
     --query "appCommandLine" \
     --output tsv
   ```
   
   **Expected:** `npm start`
   
   **If not set:**
   ```bash
   az webapp config set \
     --name TraccEms-Prod-Backend \
     --resource-group TraccEms-Prod-USCentral \
     --startup-file "npm start"
   ```

### Step 3: Deploy Backend to Production

1. **Go to GitHub Actions:**
   - Navigate to: https://github.com/Medic423/medport/actions
   - Find workflow: **"production - Deploy Prod Backend"**

2. **Trigger Deployment:**
   - Click **"Run workflow"**
   - Select branch: **`develop`** (or `main` if you prefer)
   - Click **"Run workflow"**

3. **Monitor Deployment:**
   - Watch for build verification step to pass
   - Check that migration runs successfully
   - Monitor deployment completion

4. **Check Azure Logs:**
   - After deployment, check Azure Portal → TraccEms-Prod-Backend → Log stream
   - Look for `🔍 [STARTUP]` messages
   - Verify: `🚀 TCC Backend server running on port 8080`

### Step 4: Deploy Frontend to Production

1. **Go to GitHub Actions:**
   - Navigate to: https://github.com/Medic423/medport/actions
   - Find workflow: **"production - Deploy Prod Frontend"**

2. **Trigger Deployment:**
   - Click **"Run workflow"**
   - Select branch: **`develop`** (or `main` if you prefer)
   - Click **"Run workflow"**

3. **Monitor Deployment:**
   - Watch for build to complete
   - Verify deployment succeeds

### Step 5: Verify Deployment

1. **Backend Health Check:**
   ```bash
   curl https://api.traccems.com/health
   ```
   **Expected:** `{"status":"healthy",...}`

2. **Test Current Activity Endpoints:**
   ```bash
   # These require authentication, but should return proper error if working
   curl https://api.traccems.com/api/tcc/analytics/active-users
   curl https://api.traccems.com/api/tcc/analytics/facilities-online
   ```
   **Expected:** `{"success":false,"error":"Access token required"}` (confirms endpoints exist)

3. **Frontend Verification:**
   - Navigate to: https://traccems.com
   - Login to TCC Overview
   - Verify Current Activity section appears
   - Check Facilities Online stats display correctly
   - Verify active users list works

---

## Rollback Plan

If deployment fails or issues are discovered:

### Backend Rollback
1. **Revert to Previous Deployment:**
   - Azure Portal → TraccEms-Prod-Backend → Deployment Center
   - Select previous successful deployment
   - Click "Redeploy"

2. **Or Re-run Previous Workflow:**
   - GitHub Actions → Find previous successful workflow run
   - Click "Re-run all jobs"

### Database Rollback (if needed)
```sql
-- Remove lastActivity columns (only if absolutely necessary)
ALTER TABLE center_users DROP COLUMN IF EXISTS "lastActivity";
ALTER TABLE ems_users DROP COLUMN IF EXISTS "lastActivity";
ALTER TABLE healthcare_users DROP COLUMN IF EXISTS "lastActivity";

-- Remove indexes
DROP INDEX IF EXISTS center_users_lastActivity_idx;
DROP INDEX IF EXISTS ems_users_lastActivity_idx;
DROP INDEX IF EXISTS healthcare_users_lastActivity_idx;
```

**⚠️ Warning:** Only rollback database if absolutely necessary. This will cause backend errors if code still expects the columns.

---

## Troubleshooting

### If Backend Won't Start

1. **Check Azure Logs:**
   - Look for `🔍 [STARTUP]` messages
   - If missing, check if `dist/index.js` exists
   - Check for error messages

2. **Check for node_modules.tar.gz:**
   - If extraction hangs, delete via Kudu/SSH:
     ```bash
     cd /home/site/wwwroot
     rm -f node_modules.tar.gz
     ```
   - Restart App Service

3. **Check Oryx Manifest:**
   - If Oryx is interfering, delete `oryx-manifest.toml`:
     ```bash
     cd /home/site/wwwroot
     rm -f oryx-manifest.toml
     ```
   - Restart App Service

### If Database Migration Fails

1. **Check Migration Status:**
   ```bash
   # Via pgAdmin or Azure Portal
   SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;
   ```

2. **Manual Migration:**
   - Run migration SQL directly via pgAdmin
   - Verify columns and indexes exist

---

## Success Criteria

- ✅ Database migration applied successfully
- ✅ Backend deploys without errors
- ✅ Backend starts successfully (see `🔍 [STARTUP]` messages)
- ✅ Health endpoint responds: `https://api.traccems.com/health`
- ✅ Current Activity endpoints available
- ✅ Frontend deploys successfully
- ✅ Current Activity section appears in TCC Overview
- ✅ Facilities Online stats display correctly
- ✅ Active users list works

---

## Files Changed

### Backend
- `backend/src/index.ts` - Added diagnostic logging
- `backend/src/middleware/authenticateAdmin.ts` - Added `lastActivity` updates
- `backend/src/services/analyticsService.ts` - Added Current Activity methods
- `backend/src/routes/analytics.ts` - Added new endpoints
- `backend/prisma/schema.prisma` - Added `lastActivity` field and indexes

### Frontend
- `frontend/src/components/TCCOverview.tsx` - Added Current Activity UI
- `frontend/src/services/api.ts` - Added API methods

### Deployment
- `.github/workflows/prod-be.yaml` - Added build verification and cleanup
- `backend/migrations/04-add-lastactivity-to-user-tables.sql` - Migration script

---

## Commits to Deploy

All commits from `develop` branch, including:
- `15d4e8ae` - fix: Add diagnostic logging and build verification
- `4ace2070` - fix: Update lastActivity on login for all user types
- `bf563a57` - feat: Add Current Activity feature with Facilities Online stats

---

**Ready to Deploy:** ✅ Yes  
**Estimated Time:** 15-20 minutes  
**Risk Level:** Low (feature tested in dev, same deployment process)
