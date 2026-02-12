# Check Azure Logs - Diagnostic Messages

**Date:** January 21, 2026  
**Status:** Build verification passed ✅ - Now checking execution

## ✅ Build Verification Results
- `dist/index.js` exists (16K) ✅
- File contains valid JavaScript ✅
- Build verification step passed ✅

## 🔍 What to Check Now

### Step 1: Check Azure Logs for Diagnostic Messages

After the restart, check Azure logs for these diagnostic messages:

**Expected Messages (if file is executing):**
```
🔍 [STARTUP] Starting backend application...
🔍 [STARTUP] Node version: v24.x.x
🔍 [STARTUP] Working directory: /home/site/wwwroot
🔍 [STARTUP] Environment: production
🔍 [STARTUP] Loading dependencies...
🔍 [STARTUP] Dependencies imported successfully
🚀 TCC Backend server running on port 8080
```

### Step 2: How to Check Logs

#### Option A: Azure Portal (Easiest)
1. Go to: https://portal.azure.com
2. Navigate to: **TraccEms-Dev-Backend** → **Log stream** (left sidebar, under Monitoring)
3. Look for the `🔍 [STARTUP]` messages
4. If you see them → File is executing, check for errors after
5. If you DON'T see them → File isn't being executed (startup issue)

#### Option B: Azure CLI
```bash
# Stream logs (press Ctrl+C to stop)
az webapp log tail \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral
```

#### Option C: Download Logs
```bash
# Download recent logs
az webapp log download \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --log-file backend-logs.zip

# Extract and check
unzip backend-logs.zip
cat LogFiles/Application/*.log | grep -E "STARTUP|Error|Failed" | tail -50
```

## 🔍 Diagnostic Scenarios

### Scenario 1: No `🔍 [STARTUP]` Messages
**Meaning:** `dist/index.js` exists but isn't being executed  
**Possible Causes:**
- Startup command not working correctly
- File permissions issue
- Azure startup script interfering

**Next Steps:**
1. Verify startup command: `npm start` ✅ (already verified)
2. Check if `startup.sh` exists and is being used instead
3. Run diagnostic script via Kudu/SSH

### Scenario 2: `🔍 [STARTUP]` Messages Appear But Stop Early
**Meaning:** File is executing but crashes during import/startup  
**Look for:**
- Error messages after the startup logs
- Import errors
- Missing module errors
- Prisma Client errors

**Next Steps:**
- Check error messages that appear
- Verify Prisma Client was generated correctly
- Check for missing dependencies

### Scenario 3: All `🔍 [STARTUP]` Messages Appear
**Meaning:** File is executing successfully  
**Look for:**
- `🚀 TCC Backend server running on port...` message
- If this appears → Backend started successfully! ✅
- If this doesn't appear → Check for errors after startup logs

## 🛠️ If Still Failing: Run Diagnostic Script

If logs show nothing or errors, run the diagnostic script:

1. **Access Kudu/SSH:**
   - URL: https://traccems-dev-backend-h4add2fpcegrc2bz.scm.centralus-01.azurewebsites.net
   - Or: Azure Portal → TraccEms-Dev-Backend → Advanced Tools → Go → Debug Console → Bash

2. **Run Diagnostic:**
   ```bash
   cd /home/site/wwwroot
   bash check-azure-deployment.sh
   ```

3. **Try Manual Start:**
   ```bash
   cd /home/site/wwwroot
   npm start
   ```
   This will show the actual error if there is one.

## 📋 Quick Checklist

- [ ] Check Azure Log Stream for `🔍 [STARTUP]` messages
- [ ] If messages appear, note where they stop
- [ ] If no messages, run diagnostic script
- [ ] Check for any error messages
- [ ] Verify backend responds: `curl https://dev-api.traccems.com/health`

---

**Next Action:** Check Azure logs and report what you see (or don't see)
