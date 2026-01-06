# Check Logs After Restart - January 6, 2026

## ✅ Status Check Results

- **App Service State:** Running ✅
- **App Service Enabled:** True ✅
- **Startup Command:** `./startup.sh` ✅ (configured correctly)
- **Backend Response:** Not responding yet (may still be starting)

---

## Next Steps: Check Logs

The backend is restarted but not responding. We need to check the logs to see what's happening.

### Option 1: Azure Portal Log Stream (Recommended)

1. Go to: https://portal.azure.com
2. Navigate to: **TraccEms-Dev-Backend** → **Log stream**
3. Look for these messages:

**✅ Good Signs (Solution Working):**
```
STARTUP SCRIPT STARTING - [timestamp]
=== Azure App Service Startup Script ===
Current directory: /home/site/wwwroot
⚠️ node_modules is missing or empty (only .gitkeep found).
Found deps.tar.gz archive. Extracting...
✅ Successfully extracted node_modules from archive.
node_modules size: 184M
=== Starting Application ===
🚀 TCC Backend server running on port...
```

**❌ Bad Signs (Still Broken):**
```
Using npm ci (requires package-lock.json)...
npm http fetch GET...
```
(If you see this, Azure is still trying to install dependencies)

```
No new trace in the past X min(s).
```
(If this continues, the startup script isn't running or is hanging)

---

### Option 2: Azure CLI Log Tail

```bash
# Stream logs in real-time
az webapp log tail \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral

# Press Ctrl+C to stop
```

---

### Option 3: Download Recent Logs

```bash
# Download logs
az webapp log download \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --log-file backend-logs.zip

# Extract and check
unzip backend-logs.zip
cat LogFiles/Application/*.log | tail -100
```

---

## What to Look For

### If You See Archive Extraction:
- ✅ Archive is being extracted
- ⏳ Wait 30-60 seconds for extraction to complete
- Then backend should start

### If You See npm install:
- ❌ Azure is still trying to install dependencies
- The dummy node_modules fix didn't work
- Need to investigate further

### If You See Nothing:
- ❌ Startup script may not be running
- Check if `startup.sh` exists and is executable
- May need to SSH in and check manually

---

## Manual Check via SSH

If logs aren't showing anything, check manually:

```bash
# SSH into App Service
az webapp ssh --name TraccEms-Dev-Backend --resource-group TraccEms-Dev-USCentral

# Check if files exist
cd /home/site/wwwroot
ls -lah | grep -E "(startup.sh|deps.tar.gz|node_modules)"

# Check startup script
head -20 startup.sh

# Check if node_modules exists
ls -la node_modules | head -10

# Check if backend process is running
ps aux | grep node
```

---

## Expected Timeline

After restart:
- **0-30 seconds:** Azure initializes, startup script begins
- **30-90 seconds:** Archive extraction (if deps.tar.gz exists)
- **90-120 seconds:** Backend starts, begins listening on port
- **120+ seconds:** Backend should be responding to requests

If it takes longer than 2-3 minutes, something is likely hanging.

---

## Quick Test Commands

```bash
# Test health endpoint
curl -v https://dev-api.traccems.com/health --max-time 10

# Test root endpoint
curl -v https://dev-api.traccems.com/ --max-time 10

# Check App Service status
az webapp show \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --query "{state:state, enabled:enabled}"
```

---

**Last Updated:** January 6, 2026  
**Status:** Waiting for logs to verify startup script execution

