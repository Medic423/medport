# Dev-SWA Backend Down - Troubleshooting
**Date:** January 10, 2026  
**Status:** 🔴 **INVESTIGATING** - Backend not responding on dev-swa

---

## Problem

Backend is not running on dev-swa - cannot login to test SMS notifications fix.

---

## Investigation Steps

### Step 1: Check GitHub Actions Deployment Status

**Check:** https://github.com/Medic423/medport/actions

**Look for:**
- ✅ **"develop - Deploy Dev Backend"** workflow
- Check status:
  - ✅ **Completed** (green) → Deployment finished, check logs for errors
  - ⏳ **In progress** (orange) → Still deploying, wait for completion
  - ❌ **Failed** (red) → Check logs for error details
  - ⏸️ **Queued** (yellow) → Waiting to start

**If deployment failed:**
1. Click on the failed workflow
2. Check which step failed:
   - `Install dependencies` → npm install issue
   - `Generate Prisma Models` → Prisma issue
   - `Run Database Migrations` → Database migration issue
   - `Build application` → Build error
   - `Deploy to Azure Web App` → Azure deployment issue

### Step 2: Check Azure App Service Status

**Azure Portal:** https://portal.azure.com

**Navigate to:**
- App Services → **TraccEms-Dev-Backend**

**Check:**
1. **Status** (top of Overview page)
   - Should be "Running" ✅
   - If "Stopped" → Click "Start" button
   - If "Stopped" → Check why it stopped

2. **Overview → Status**
   - Should show green checkmark ✅
   - If red X → Service is down

### Step 3: Check Azure Logs

**Option A: Log Stream (Real-time)**
1. Azure Portal → TraccEms-Dev-Backend
2. **Log stream** (left menu)
3. Look for:
   - ✅ `🚀 TCC Backend server running on port...`
   - ❌ Error messages
   - ❌ Stack traces
   - ❌ "Cannot find module" errors
   - ❌ Database connection errors

**Option B: Application Logs**
1. Azure Portal → TraccEms-Dev-Backend
2. **Advanced Tools (Kudu)** → **Go**
3. **Debug console** → **CMD**
4. Navigate to: `LogFiles/Application/`
5. Download recent log files
6. Check for errors

**Option C: Azure CLI**
```bash
# Check recent logs
az webapp log tail \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral

# Check errors only
az webapp log tail \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --filter Error
```

### Step 4: Test Health Endpoint

**Try accessing:**
- `https://dev-api.traccems.com/health`

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-10T...",
  "server": "running"
}
```

**If it times out or returns error:**
- Backend is not running or not responding
- Check Azure logs for startup errors

---

## Common Issues & Solutions

### Issue 1: Deployment Failed - Code Error

**Symptoms:**
- GitHub Actions shows failed deployment
- Error in "Build application" or "Generate Prisma Models" step

**Possible Causes:**
- Syntax error in code
- TypeScript compilation error
- Missing dependency

**Solution:**
1. Check GitHub Actions logs for specific error
2. Fix error locally
3. Test locally
4. Commit and push fix

### Issue 2: Backend Crashed After Deployment

**Symptoms:**
- Deployment completed successfully
- Backend started but crashed immediately
- Logs show error messages

**Possible Causes:**
- Runtime error in code
- Missing environment variable
- Database connection failure
- Port binding issue

**Solution:**
1. Check Azure logs for crash error
2. Fix the issue
3. Redeploy

### Issue 3: Database Migration Failed

**Symptoms:**
- Deployment failed at "Run Database Migrations" step
- Error about database schema

**Possible Causes:**
- Migration conflict
- Database connection issue
- Schema mismatch

**Solution:**
1. Check migration logs
2. May need to run migrations manually via pgAdmin
3. Or fix migration script

### Issue 4: Environment Variables Missing

**Symptoms:**
- Backend starts but crashes immediately
- Logs show "DATABASE_URL is not set" or similar

**Solution:**
1. Azure Portal → TraccEms-Dev-Backend → **Configuration**
2. Check **Application settings**
3. Verify required variables are set:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `CORS_ORIGIN`

### Issue 5: Backend Hung/Frozen

**Symptoms:**
- Health endpoint times out
- No error in logs
- Backend appears to be running but not responding

**Solution:**
1. Restart App Service:
   - Azure Portal → TraccEms-Dev-Backend
   - Click **Restart** button
   - Wait 2-3 minutes
   - Test again

---

## Quick Fixes

### Fix 1: Restart Backend
1. Azure Portal → TraccEms-Dev-Backend
2. Click **Restart** button
3. Wait 2-3 minutes
4. Test health endpoint

### Fix 2: Check Recent Code Changes
**Last commit:** `3d3d1b7a` - SMS Notifications persistence fix

**Files changed:**
- `backend/src/routes/auth.ts` - Added SMS notifications handling
- `frontend/src/components/AgencySettings.tsx` - Added SMS to payload

**Check if:**
- Syntax error in `auth.ts`
- Missing import
- Type error

### Fix 3: Rollback to Previous Working Version
If recent deployment broke backend:
1. Find last working commit
2. Revert to that commit
3. Push to trigger deployment

---

## Next Steps

1. **Check GitHub Actions** - Is deployment completed or failed?
2. **Check Azure Portal** - Is App Service running?
3. **Check Azure Logs** - What errors are showing?
4. **Test Health Endpoint** - Is backend responding?
5. **Report findings** - Share logs/errors for further diagnosis

---

## Current Status

🔴 **BACKEND RETURNING 503** - Service Unavailable error

**Findings:**
- ✅ Backend deployment completed successfully
- ✅ Some API requests are working (trips queries, agency responses in logs)
- ❌ Login endpoint returning **503 Service Unavailable**
- ❌ CORS error is a symptom - backend not responding properly
- ⚠️ Backend may be crashing on login requests or not fully started

**Error Details:**
- Status Code: **503 Service Unavailable**
- CORS header missing (because backend returns 503 before CORS middleware)
- Frontend correctly configured to use `https://dev-api.traccems.com`
- This is **NOT a frontend code issue** - it's a backend issue

**Log Evidence:**
- Multiple successful API calls in logs
- Authentication working: `Token decoded successfully`
- Trips queries working: `TCC_DEBUG: Returning 0 trips`
- Agency responses working: `TCC_DEBUG: Returning 1 agency responses`

**Issue:**
- Health endpoint (`/health`) returns Application Error page
- This suggests backend is running but may have routing issues
- Or backend crashes on certain requests

## Next Steps

1. **Check if login actually works:**
   - Try logging in on dev-swa frontend
   - Check browser console for errors
   - Check network tab for failed requests

2. **If login fails:**
   - Check browser console for CORS errors
   - Check network tab for 401/403/500 errors
   - Verify frontend is pointing to correct backend URL

3. **If login works but other features fail:**
   - Check which specific API calls are failing
   - Check Azure logs for those specific endpoints
   - May be a routing issue for specific endpoints

4. **Test SMS Notifications fix:**
   - If you can login, try testing the SMS notifications checkbox
   - Check if the save works
   - Check if it persists after refresh
