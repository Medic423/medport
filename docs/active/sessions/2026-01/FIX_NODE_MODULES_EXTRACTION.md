# Fix: node_modules.tar.gz Extraction Issue
**Date:** January 9, 2026  
**Issue:** Dev-SWA backend crashing with "Cannot find module 'express'"  
**Root Cause:** Azure not automatically extracting node_modules.tar.gz archive

---

## Problem Identified

### Symptoms
- Dev-SWA backend not responding (timeout on health check)
- Azure logs show: `Error: Cannot find module 'express'`
- Backend crashes immediately on startup
- Backend restarts in a loop

### Root Cause
The GitHub Actions workflow creates `node_modules.tar.gz` and removes `node_modules` before deployment to reduce package size. However, **Azure App Service does NOT automatically extract the archive**. When the backend tries to start with `npm start`, Node.js can't find the dependencies because `node_modules` doesn't exist.

### Evidence from Logs
```
2026-01-09T18:40:43.7058686Z Error: Cannot find module 'express'
2026-01-09T18:40:43.7059942Z Require stack:
2026-01-09T18:40:43.7059999Z - /home/site/wwwroot/dist/index.js
```

---

## Solution Applied

### Fix: Prestart Script in package.json
Added `prestart` and `prestart:prod` scripts to `backend/package.json` that automatically extract `node_modules.tar.gz` if:
1. The archive exists (`node_modules.tar.gz`)
2. The directory doesn't exist (`node_modules`)

### How It Works
- npm automatically runs `prestart` before `start` command
- The script checks if extraction is needed
- If needed, extracts the archive using `tar -xzf`
- Then `npm start` proceeds normally

### Code Added
```json
"prestart": "node -e \"const fs=require('fs'); const {execSync}=require('child_process'); if(fs.existsSync('node_modules.tar.gz')&&!fs.existsSync('node_modules')){console.log('Extracting node_modules.tar.gz...'); execSync('tar -xzf node_modules.tar.gz',{stdio:'inherit'}); console.log('Extraction complete');}\"",
"prestart:prod": "node -e \"const fs=require('fs'); const {execSync}=require('child_process'); if(fs.existsSync('node_modules.tar.gz')&&!fs.existsSync('node_modules')){console.log('Extracting node_modules.tar.gz...'); execSync('tar -xzf node_modules.tar.gz',{stdio:'inherit'}); console.log('Extraction complete');}\"",
```

### Files Modified
1. ✅ `backend/package.json` - Added prestart scripts
2. ✅ `.github/workflows/dev-be.yaml` - Updated comment
3. ✅ `.github/workflows/prod-be.yaml` - Updated comment (for future reference)

---

## Why This Approach

### Benefits
- ✅ Works automatically - no Azure configuration needed
- ✅ Uses npm lifecycle hooks - standard Node.js pattern
- ✅ Safe - only extracts if archive exists and directory doesn't
- ✅ Applies to both dev-swa and production (same package.json)
- ✅ No changes needed to Azure Portal or App Service settings

### Alternative Considered
- Startup script (`startup.sh`) - Would require Azure CLI configuration
- Azure App Service startup command - Would require Azure Portal changes
- **Chosen:** npm prestart hook - Simplest, most portable solution

---

## Next Steps

1. ✅ **Fix Applied** - Code changes complete
2. ⏳ **Commit and Push** - Push to develop branch
3. ⏳ **Wait for Deployment** - GitHub Actions will auto-deploy to dev-swa
4. ⏳ **Verify Fix** - Check Azure logs for extraction message
5. ⏳ **Test Backend** - Verify health endpoint responds
6. ⏳ **Test Login** - Verify full functionality

---

## Expected Behavior After Fix

### Azure Logs Should Show:
```
Extracting node_modules.tar.gz...
Extraction complete
> tcc-backend@1.0.0 start
> node dist/index.js
[Backend starts successfully]
```

### Health Check Should Return:
```json
{"status":"healthy","timestamp":"...","database":"connected"}
```

---

**Status:** Fix ready, awaiting commit and deployment  
**Branch:** develop (dev-swa)  
**Impact:** Dev-SWA backend will start successfully after deployment
