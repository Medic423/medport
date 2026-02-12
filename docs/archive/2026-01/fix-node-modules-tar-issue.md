# Fix node_modules.tar.gz Extraction Issue - January 21, 2026

## Current Status

Azure is extracting `node_modules.tar.gz`:
```
Found tar.gz based node_modules.
Removing existing modules directory from root...
Extracting modules...
```

This extraction can:
- ✅ Complete successfully (wait 2-5 minutes)
- ❌ Hang/timeout (if it does, delete the tar.gz file)

## Problem

The GitHub Actions workflow is supposed to:
1. Deploy `node_modules` directly (not as archive)
2. Delete any `node_modules.tar.gz` files before deployment

But `node_modules.tar.gz` is still being deployed, causing Azure's Oryx system to try extracting it.

## Solution

### Option 1: Wait for Extraction (2-5 minutes)

If extraction completes, you should see:
```
Done.
🔍 [STARTUP] Starting backend application...
🚀 TCC Backend server running on port 8080
```

### Option 2: Delete node_modules.tar.gz (If Extraction Hangs)

If logs show "Extracting modules..." for more than 5 minutes:

1. **Access Kudu/SSH:**
   - URL: https://traccems-dev-backend-h4add2fpcegrc2bz.scm.centralus-01.azurewebsites.net
   - Or: Azure Portal → TraccEms-Dev-Backend → Advanced Tools → Go → Debug Console → Bash

2. **Delete the archive:**
   ```bash
   cd /home/site/wwwroot
   rm -f node_modules.tar.gz
   ls -la node_modules.tar.gz  # Should show "No such file"
   ```

3. **Verify node_modules exists:**
   ```bash
   ls -ld node_modules  # Should show directory exists
   du -sh node_modules  # Should show ~180MB+
   ```

4. **Restart App Service:**
   ```bash
   az webapp restart --name TraccEms-Dev-Backend --resource-group TraccEms-Dev-USCentral
   ```

## Expected Result After Fix

After deleting `node_modules.tar.gz` and restarting, logs should show:
```
🔍 [STARTUP] Starting backend application...
🔍 [STARTUP] Node version: v24.11.0
🔍 [STARTUP] Working directory: /home/site/wwwroot
🔍 [STARTUP] Dependencies imported successfully
🚀 TCC Backend server running on port 8080
```

## Long-term Fix

Update GitHub Actions workflow to ensure `node_modules.tar.gz` is never deployed. The workflow already tries to delete it, but we need to verify it's working correctly.

---

**Status:** Monitoring extraction - will delete tar.gz if it hangs  
**Priority:** High - This is blocking backend startup
