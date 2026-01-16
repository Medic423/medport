# Backend Stalled on Certificate Update
**Date:** January 7, 2026  
**Status:** ⚠️ **STALLED** - Backend not starting after container init

---

## Symptoms

- ✅ Container initializes successfully
- ✅ Node.js v24.11.0 detected
- ✅ SSH server starts
- ⚠️ Stuck on "Updating certificates in /etc/ssl/certs..."
- ❌ No application startup logs appearing
- ❌ "No new trace" messages (nothing happening)

---

## Analysis

**Certificate Update:**
- Can take 1-5 minutes normally
- Should complete and then application should start
- If stuck > 5 minutes, something is wrong

**Application Not Starting:**
- After certificate update, Node.js app should start
- Should see: `🔧 Production mode: Starting TCC Backend...`
- If no logs appear, application isn't starting

---

## Possible Causes

### 1. Application Startup Command Not Executing
- **Check:** `AppCommandLine` setting
- **Expected:** `npm run start:prod`
- **Issue:** Command might not be executing

### 2. Application Crashing Silently
- **Check:** Log Stream for any errors
- **Issue:** App might crash before logging anything

### 3. Missing Dependencies
- **Check:** `node_modules` in deployment
- **Issue:** Dependencies might not be installed

### 4. Build Files Missing
- **Check:** `dist/production-index.js` exists
- **Issue:** Build might not have completed

### 5. Environment Variables Missing
- **Check:** `DATABASE_URL` is set
- **Issue:** App might fail silently if env vars missing

---

## Immediate Actions

### Option 1: Wait Longer (5-10 minutes)
Sometimes certificate updates take longer. Wait up to 10 minutes total.

### Option 2: Check Application Logs via SSH
If SSH is enabled, you can connect and check:
```bash
# Check if Node.js process is running
ps aux | grep node

# Check if application started
tail -f /home/LogFiles/Application/*.log
```

### Option 3: Check Deployment Files
Verify the deployment has:
- `dist/production-index.js` file
- `node_modules` directory
- `package.json` with `start:prod` script

### Option 4: Check Startup Command
```bash
az webapp config show \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "appCommandLine"
```

Should show: `npm run start:prod`

---

## Expected Behavior

**Normal Startup Sequence:**
1. Container initializes (~30 sec)
2. Certificate update (~1-5 min)
3. **Application starts** ← Should happen here
4. Logs appear: `🚀 TCC Backend server running...`

**Current Issue:**
- Steps 1-2 complete
- Step 3 not happening
- No application logs

---

## Next Steps

1. ⏭️ **Wait 5-10 minutes total** - Certificate update might still be running
2. ⏭️ **Check Log Stream** - Look for any error messages
3. ⏭️ **Verify startup command** - Ensure `npm run start:prod` is set
4. ⏭️ **Check deployment** - Verify files exist in deployment
5. ⏭️ **Consider rollback** - If this persists, rollback to last working deployment

---

**Last Updated:** January 7, 2026  
**Status:** ⚠️ Stalled - Waiting for application to start

