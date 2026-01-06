# Backend Crashed Investigation - January 6, 2026

## Issue
Backend started but died immediately after restart. Need to see full logs to diagnose.

---

## What We Need to See

The logs you shared only show:
- App Service initialization ✅
- Then "No new trace" ❌

**Missing:** What happened between initialization and crash?

---

## Check Full Logs

### Option 1: Azure Portal Log Stream
1. Go to Azure Portal → TraccEms-Dev-Backend → **Log stream**
2. Scroll up to see messages BEFORE "No new trace"
3. Look for:
   - Startup script messages
   - Extraction messages
   - Error messages
   - Crash logs

### Option 2: Download Recent Logs
```bash
az webapp log download \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --log-file backend-logs.zip

# Extract and check
unzip backend-logs.zip
cat LogFiles/Application/*.log | tail -200
```

### Option 3: Check Application Logs
```bash
az webapp log tail \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --filter Error
```

---

## What to Look For

### If Extraction Worked:
```
✅ Extraction to /tmp completed in XX seconds
✅ Move completed. Total time: XX seconds
✅ Successfully extracted node_modules from archive.
=== Starting Application ===
```

### If Extraction Failed:
```
❌ Extraction failed or timed out
⚠️ Extraction failed or incomplete. Falling back to npm install...
```

### If Backend Crashed:
```
Error: Cannot find module '...'
Error: ENOENT: no such file or directory
SyntaxError: ...
TypeError: ...
```

### If Database Connection Failed:
```
Error: connect ETIMEDOUT
Error: P1001: Can't reach database server
```

---

## Possible Causes

1. **Extraction didn't complete** - node_modules missing/incomplete
2. **Missing dependencies** - Critical packages not extracted
3. **Database connection** - Backend crashes on startup
4. **Code error** - Syntax or runtime error in application
5. **Port binding issue** - Can't bind to port
6. **Memory issue** - Out of memory during startup

---

## Quick Diagnostic Commands

### Check if node_modules exists:
```bash
az webapp ssh --name TraccEms-Dev-Backend --resource-group TraccEms-Dev-USCentral
cd /home/site/wwwroot
ls -la node_modules | head -10
du -sh node_modules
```

### Check if backend process is running:
```bash
ps aux | grep node
ps aux | grep "npm start"
```

### Check recent errors:
```bash
tail -100 /home/LogFiles/Application/*.log
```

---

## Next Steps

1. **Get full logs** - See what happened between start and crash
2. **Check extraction** - Verify node_modules was extracted correctly
3. **Check errors** - Look for specific error messages
4. **Fix issue** - Based on what we find

---

**Last Updated:** January 6, 2026  
**Status:** Need full logs to diagnose crash

