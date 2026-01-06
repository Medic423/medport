# RESTART APP SERVICE - IMMEDIATE ACTION REQUIRED

**Date:** January 6, 2026  
**Issue:** Backend not starting after deployment - needs restart

---

## ⚡ IMMEDIATE ACTION: Restart App Service

After deploying new code, Azure App Service needs to be **explicitly restarted** to pick up changes, especially startup script changes.

---

## Method 1: Azure Portal (Easiest)

1. **Go to Azure Portal:**
   - Navigate to: https://portal.azure.com
   - Sign in

2. **Find the App Service:**
   - Search for: `TraccEms-Dev-Backend`
   - Or navigate: **Resource Groups** → **TraccEms-Dev-USCentral** → **TraccEms-Dev-Backend**

3. **Restart the App Service:**
   - Click **"Restart"** button in the top toolbar
   - Confirm restart if prompted
   - Wait 1-2 minutes for restart to complete

4. **Monitor Logs:**
   - Click **"Log stream"** in the left sidebar (under Monitoring)
   - Watch for startup messages
   - You should see:
     ```
     STARTUP SCRIPT STARTING - [timestamp]
     === Azure App Service Startup Script ===
     ```

---

## Method 2: Azure CLI (Command Line)

```bash
# Restart the App Service
az webapp restart \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral

# Wait 30 seconds, then check status
sleep 30
az webapp show \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --query "{state:state, defaultHostName:defaultHostName}" \
  --output table

# Monitor logs in real-time
az webapp log tail \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral
```

**Press `Ctrl+C` to stop log stream**

---

## What to Look For After Restart

### ✅ Good Signs (Solution Working):
```
STARTUP SCRIPT STARTING - [timestamp]
=== Azure App Service Startup Script ===
Current directory: /home/site/wwwroot
⚠️ node_modules is missing or empty (only .gitkeep found).
Found deps.tar.gz archive. Extracting...
✅ Successfully extracted node_modules from archive.
=== Starting Application ===
🚀 TCC Backend server running on port...
```

### ❌ Bad Signs (Still Broken):
```
Using npm ci (requires package-lock.json)...
npm http fetch GET...
```
(If you see this, Azure is still trying to install dependencies)

```
No new trace in the past X min(s).
```
(If this continues, the startup script isn't running)

---

## Verify Startup Command is Configured

After restart, verify the startup command is set correctly:

### Via Azure Portal:
1. Go to **Configuration** → **General settings**
2. Check **Startup Command** field
3. Should be: `./startup.sh` or empty (Azure will use default)

### Via Azure CLI:
```bash
az webapp config show \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --query "appCommandLine"
```

**Expected:** `./startup.sh` or empty string

**If empty or wrong:**
```bash
az webapp config set \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --startup-file "./startup.sh"
```

Then restart again.

---

## If Still Not Working After Restart

### Check 1: Verify Files Were Deployed
```bash
# SSH into App Service
az webapp ssh --name TraccEms-Dev-Backend --resource-group TraccEms-Dev-USCentral

# Check if files exist
cd /home/site/wwwroot
ls -lah | grep -E "(startup.sh|deps.tar.gz|node_modules)"
```

**Should see:**
- `startup.sh` (executable)
- `deps.tar.gz` (archive file)
- `node_modules/.gitkeep` (dummy directory)

### Check 2: Verify Startup Script Content
```bash
# In SSH session
head -20 startup.sh
```

**Should see:**
```bash
#!/bin/bash
# Custom startup script for Azure App Service
...
echo "STARTUP SCRIPT STARTING - $(date)"
```

### Check 3: Manual Test of Startup Script
```bash
# In SSH session
cd /home/site/wwwroot
bash -x ./startup.sh
```

This will show exactly what's happening (or failing).

---

## Quick Diagnostic Commands

### Check App Service Status:
```bash
az webapp show \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --query "{state:state, enabled:enabled, defaultHostName:defaultHostName}"
```

### Test Backend Endpoint:
```bash
curl -v https://dev-api.traccems.com/health --max-time 10
```

### Check Recent Logs:
```bash
az webapp log tail \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --filter Error
```

---

## Summary

1. ✅ **RESTART App Service** (required after deployment)
2. ✅ **Monitor Log Stream** for startup messages
3. ✅ **Verify startup command** is configured
4. ✅ **Test backend** endpoints after restart

**The restart is critical** - Azure doesn't automatically restart after ZIP deployments, especially when startup scripts change.

---

**Last Updated:** January 6, 2026  
**Status:** Action required - Restart App Service

