# Monitor Startup Logs - What to Look For

**Date:** January 6, 2026  
**Status:** App Service restarted, monitoring logs

---

## ✅ What We've Seen So Far

- App Service initialization ✅
- SSH server starting ✅
- Certificate updates ✅

---

## 🔍 What to Look For Next

### Expected Sequence (If Solution Works):

1. **Azure's Startup Script:**
   ```
   Writing output script to '/opt/startup/startup.sh'
   Running #!/bin/sh
   cd "/home/site/wwwroot"
   PATH="$PATH:/home/site/wwwroot" ./startup.sh
   ```

2. **Our Custom Startup Script:**
   ```
   ==========================================
   STARTUP SCRIPT STARTING - [timestamp]
   ==========================================
   === Azure App Service Startup Script ===
   Current directory: /home/site/wwwroot
   Checking for node_modules...
   Listing files in current directory:
   ```

3. **Archive Detection:**
   ```
   ⚠️ node_modules is missing or empty (only .gitkeep found).
   Found deps.tar.gz archive. Extracting...
   Archive size: 50M
   Extracting archive (this may take 30-60 seconds)...
   ```

4. **Successful Extraction:**
   ```
   ✅ Successfully extracted node_modules from archive.
   node_modules size: 184M
   Removing archive...
   ```

5. **Application Start:**
   ```
   === Starting Application ===
   🚀 TCC Backend server running on port...
   ```

---

## ⚠️ Warning Signs

### If You See This (Azure Still Installing):
```
node_modules is missing or empty. Installing dependencies...
Using npm ci (requires package-lock.json)...
npm http fetch GET...
```
**Problem:** Dummy node_modules fix didn't work, Azure is still trying to install

### If You See This (Archive Missing):
```
⚠️ node_modules is missing or empty.
Installing dependencies via npm install (fallback method)...
```
**Problem:** `deps.tar.gz` wasn't deployed or doesn't exist

### If You See This (Nothing Happening):
```
No new trace in the past X min(s).
```
**Problem:** Startup script may not be running or is hanging

---

## Timeline Expectations

- **0-30 seconds:** Azure initialization (what you've seen)
- **30-60 seconds:** Startup script should begin
- **60-120 seconds:** Archive extraction (if deps.tar.gz exists)
- **120-180 seconds:** Backend should start
- **180+ seconds:** Backend should be responding

If nothing happens after 2-3 minutes, something is likely hanging.

---

## What to Share

Please share the **next 50-100 lines** of logs after what you've shown. Specifically look for:
1. Does the startup script run? (Look for "STARTUP SCRIPT STARTING")
2. Does it find the archive? (Look for "Found deps.tar.gz")
3. Does extraction happen? (Look for "Extracting archive")
4. Does the backend start? (Look for "Starting Application" or "server running")

---

**Last Updated:** January 6, 2026  
**Status:** Waiting for startup script execution

