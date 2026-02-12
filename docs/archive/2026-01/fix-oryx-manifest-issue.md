# Fix Oryx Manifest Issue - January 21, 2026

## Problem Identified

Azure is detecting `oryx-manifest.toml` and trying to process it, which is interfering with the startup process. The logs show:

```
Found build manifest file at '/home/site/wwwroot/oryx-manifest.toml'. Deserializing it...
Could not find operation ID in manifest. Generating an operation id...
Build Operation ID: 7bd2c07c-ca6c-4968-842e-57e90c0b475e
```

After this, nothing happens - no `npm start` execution, no diagnostic messages.

## Root Cause

Even though:
- `SCM_DO_BUILD_DURING_DEPLOYMENT = false` ✅
- `ENABLE_ORYX_BUILD = false` ✅
- GitHub Actions tries to delete `oryx-manifest.toml` ✅

Azure is still detecting and processing the manifest file during startup, which prevents `npm start` from running.

## Solution

### Option 1: Delete oryx-manifest.toml via Kudu/SSH (Immediate Fix)

1. **Access Kudu/SSH:**
   - URL: https://traccems-dev-backend-h4add2fpcegrc2bz.scm.centralus-01.azurewebsites.net
   - Or: Azure Portal → TraccEms-Dev-Backend → Advanced Tools → Go → Debug Console → Bash

2. **Delete the manifest:**
   ```bash
   cd /home/site/wwwroot
   rm -f oryx-manifest.toml
   ls -la oryx-manifest.toml  # Should show "No such file"
   ```

3. **Restart the App Service:**
   ```bash
   az webapp restart --name TraccEms-Dev-Backend --resource-group TraccEms-Dev-USCentral
   ```

### Option 2: Add Post-Deployment Cleanup Script

Add a step to the GitHub Actions workflow that deletes `oryx-manifest.toml` AFTER deployment completes, using Kudu API.

### Option 3: Use Startup Script Instead

Change the startup command to use `startup.sh` which explicitly runs `npm start` after any Oryx processing.

## Immediate Action Plan

1. **Delete oryx-manifest.toml via Kudu/SSH** (see commands above)
2. **Restart App Service**
3. **Monitor logs** for `🔍 [STARTUP]` messages
4. **If still failing**, check if `dist/index.js` exists and try running `npm start` manually

## Expected Result After Fix

After deleting `oryx-manifest.toml` and restarting, logs should show:
```
🔍 [STARTUP] Starting backend application...
🔍 [STARTUP] Node version: v24.11.0
🔍 [STARTUP] Working directory: /home/site/wwwroot
...
🚀 TCC Backend server running on port 8080
```

---

**Status:** Ready to fix  
**Priority:** High - This is blocking backend startup
