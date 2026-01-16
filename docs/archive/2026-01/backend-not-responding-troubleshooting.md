# Backend Not Responding - Troubleshooting
**Date:** January 7, 2026  
**Status:** 🔴 **CRITICAL** - Backend not responding to requests

---

## Symptoms

- ❌ Login requests timing out (30 second timeout)
- ❌ Health endpoint not responding
- ❌ All API requests failing with `ECONNABORTED`
- ✅ App Service shows "Running" state
- ❌ But backend is not actually responding

---

## Diagnosis

**App Service Status:** "Running" ✅  
**Health Endpoint:** Not responding ❌  
**Login Endpoint:** Timing out ❌

**This indicates:** Backend process is not starting or is crashing immediately.

---

## Possible Causes

### 1. Startup Command Missing/Incorrect
- **Check:** `AppCommandLine` setting in Azure
- **Expected:** `npm run start:prod`
- **Fix:** Set startup command if missing

### 2. Application Crashing on Startup
- **Check:** Application logs for crash errors
- **Common causes:**
  - Database connection failure
  - Missing environment variables
  - Prisma client generation failure
  - Missing dependencies

### 3. Port Configuration Issue
- **Check:** PORT environment variable
- **Expected:** Azure sets this automatically (usually 8080)

### 4. Build/Deployment Issue
- **Check:** `dist/production-index.js` exists
- **Check:** `node_modules` installed
- **Check:** Prisma client generated

---

## Immediate Actions

### Step 1: Check Startup Command

```bash
az webapp config show \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "appCommandLine"
```

**If empty or wrong:**
```bash
az webapp config set \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --startup-file "npm run start:prod"
```

### Step 2: Check Application Logs

```bash
az webapp log tail \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral
```

**Look for:**
- Startup errors
- Database connection errors
- Missing file errors
- Prisma errors

### Step 3: Restart App Service

```bash
az webapp restart \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral
```

### Step 4: Verify Environment Variables

```bash
az webapp config appsettings list \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "[?name=='DATABASE_URL' || name=='NODE_ENV' || name=='PORT']"
```

**Required:**
- `DATABASE_URL` - Production database connection
- `NODE_ENV` - Should be `production`
- `PORT` - Usually auto-set by Azure

---

## Quick Fix: Restart Backend

**In Azure Portal:**
1. Go to: `TraccEms-Prod-Backend` App Service
2. Click: **"Restart"** button
3. Wait 1-2 minutes
4. Check logs for startup messages

**Or via Azure CLI:**
```bash
az webapp restart \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral
```

---

## Expected Startup Logs

**If backend starts correctly, you should see:**
```
🔧 Production mode: Starting TCC Backend...
✅ Database connection successful
🚀 TCC Backend server running on port 8080
📊 Health check: http://localhost:8080/health
```

**If backend fails, you'll see:**
```
❌ Failed to start server: [error message]
```

---

## Next Steps

1. ✅ **Check startup command** - Verify `npm run start:prod` is set
2. ✅ **Check logs** - Look for startup errors
3. ✅ **Restart backend** - Try restarting App Service
4. ✅ **Verify environment variables** - Ensure DATABASE_URL is set
5. ✅ **Test health endpoint** - After restart, test `/health`

---

**Last Updated:** January 7, 2026  
**Status:** 🔴 Backend not responding - Troubleshooting in progress

