# Dev-SWA Backend Restart Instructions
**Date:** January 12, 2026  
**Issue:** Backend stuck - login returning 503, need to restart

---

## Problem

- Backend appears stuck - login requests return 503
- No "Restart" button visible in Azure Portal
- Authenticated requests work, but login endpoint fails

---

## Solution: Restart via Azure CLI

### Step 1: Check Current Status

```bash
az webapp show \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --query "{state:state, defaultHostName:defaultHostName}" \
  --output table
```

**Expected:** `state: Running`

### Step 2: Restart Backend

```bash
az webapp restart \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral
```

**Wait:** 2-3 minutes for restart to complete

### Step 3: Monitor Restart

```bash
az webapp log tail \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral
```

**Look for:**
- `🚀 TCC Backend server running on port...`
- `📊 Health check: http://...`
- Any error messages

**Press `Ctrl+C` to stop log stream**

### Step 4: Test Health Endpoint

```bash
curl https://dev-api.traccems.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "...",
  "server": "running"
}
```

### Step 5: Test Login

Try logging in on dev-swa frontend and check if it works.

---

## Alternative: Azure Portal Restart

If Azure CLI doesn't work:

1. **Azure Portal:** https://portal.azure.com
2. **Navigate to:** App Services → **TraccEms-Dev-Backend**
3. **Look for:** "Restart" button in the top toolbar
   - If not visible, try refreshing the page
   - Or check if you have the right permissions
4. **Click Restart** and wait 2-3 minutes

---

## If Restart Doesn't Work

### Check for Stuck Deployment

1. **GitHub Actions:** https://github.com/Medic423/medport/actions
2. **Look for:** Any deployments still "In progress" or "Queued"
3. **If found:** Wait for them to complete or cancel if stuck

### Force Stop and Start

```bash
# Stop the app service
az webapp stop \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral

# Wait 30 seconds
sleep 30

# Start the app service
az webapp start \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral
```

---

## After Restart

1. **Wait 2-3 minutes** for backend to fully start
2. **Test health endpoint:** `curl https://dev-api.traccems.com/health`
3. **Try login** on dev-swa frontend
4. **Check logs** for any errors

---

## Status

⏳ **WAITING FOR RESTART** - Backend needs restart to fix 503 login issue
