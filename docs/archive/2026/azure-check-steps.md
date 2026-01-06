# Steps to Check Azure App Service Status and Logs

## Method 1: Azure Portal (Web UI) - Recommended

### Step 1: Navigate to Azure Portal
1. Go to: https://portal.azure.com
2. Sign in with your Azure account

### Step 2: Find the App Service
1. In the search bar at the top, type: `TraccEms-Dev-Backend`
2. Click on **"TraccEms-Dev-Backend"** from the results
3. Or navigate: **Resource Groups** → **TraccEms-Dev-USCentral** → **TraccEms-Dev-Backend**

### Step 3: Check App Service Status
1. Look at the **Overview** page (default view)
2. Check **Status** - Should show "Running" (green)
3. Check **URL** - Should show `https://dev-api.traccems.com`
4. Check **State** - Should show "Running"

**If Status shows "Stopped" or "Stopped (deallocated)":**
- Click **"Start"** button at the top
- Wait 1-2 minutes for it to start

### Step 4: Check Log Stream (Real-time Logs)
1. In the left sidebar, click **"Log stream"** (under Monitoring)
2. This shows real-time logs from the backend
3. Look for:
   - Startup messages
   - Error messages
   - Crash logs
   - Any red error text

**What to look for:**
- `Server running on port...` - Backend started successfully
- `Error:` or `Exception:` - Backend crashed
- `Cannot connect to database` - Database connection issue
- `SyntaxError` or `TypeError` - Code error

### Step 5: Check Application Logs
1. In the left sidebar, click **"Logs"** (under Monitoring)
2. Click **"Application Logging"** tab
3. Check if logging is enabled
4. If enabled, you can download logs or view them

### Step 6: Check Deployment Center
1. In the left sidebar, click **"Deployment Center"**
2. Check **"Logs"** tab
3. See recent deployment history
4. Check if latest deployment succeeded or failed

### Step 7: Restart App Service (if needed)
1. Click **"Restart"** button at the top toolbar
2. Confirm restart
3. Wait 1-2 minutes for restart to complete
4. Check **Log stream** to see if backend starts successfully

---

## Method 2: Azure CLI (Command Line)

### Prerequisites
```bash
# Install Azure CLI if not already installed
brew install azure-cli

# Login to Azure
az login

# Set subscription (if you have multiple)
az account set --subscription "Your-Subscription-Name"
```

### Step 1: Check App Service Status
```bash
az webapp show \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --query "{state:state, defaultHostName:defaultHostName, enabled:enabled}" \
  --output table
```

**Expected Output:**
```
State    DefaultHostName              Enabled
-------  ---------------------------  --------
Running  dev-api.traccems.com         True
```

### Step 2: Check Recent Logs
```bash
# View real-time log stream
az webapp log tail \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral
```

**Press `Ctrl+C` to stop the log stream**

**What to look for:**
- `Server running on port...` - Backend started
- `Error:` - Backend crashed
- `Cannot connect to database` - Database issue
- `SyntaxError` - Code error

### Step 3: Download Logs (if needed)
```bash
# Download recent logs
az webapp log download \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --log-file backend-logs.zip
```

### Step 4: Restart App Service
```bash
# Restart the App Service
az webapp restart \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral

# Wait a moment, then check status
az webapp show \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --query "state"
```

### Step 5: Check Configuration
```bash
# Check environment variables
az webapp config appsettings list \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --query "[?name=='DATABASE_URL' || name=='CORS_ORIGIN' || name=='FRONTEND_URL']" \
  --output table
```

---

## Quick Diagnostic Commands

### Check if Backend is Responding
```bash
# Test health endpoint
curl -v https://dev-api.traccems.com/health --max-time 5

# Test root endpoint
curl -v https://dev-api.traccems.com/ --max-time 5

# Test OPTIONS request
curl -X OPTIONS https://dev-api.traccems.com/api/auth/login \
  -H "Origin: https://dev-swa.traccems.com" \
  -H "Access-Control-Request-Method: POST" \
  -i --max-time 5
```

### Check Deployment Status
```bash
# List recent deployments
az webapp deployment list \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --output table
```

---

## Common Issues and Solutions

### Issue: Backend Status is "Stopped"
**Solution:**
1. Azure Portal → Click **"Start"** button
2. Or CLI: `az webapp start --name TraccEms-Dev-Backend --resource-group TraccEms-Dev-USCentral`
3. Wait 1-2 minutes, then test again

### Issue: Backend Status is "Running" but Not Responding
**Solution:**
1. Check **Log stream** for error messages
2. Look for crash logs or startup errors
3. Restart the App Service
4. Check if database connection is working

### Issue: Backend Crashed on Startup
**Solution:**
1. Check **Log stream** for the error message
2. Common causes:
   - Syntax error in code
   - Missing environment variable
   - Database connection failure
   - Port already in use
3. Fix the issue and redeploy

### Issue: Database Connection Failed
**Solution:**
1. Check `DATABASE_URL` environment variable
2. Verify database firewall allows Azure App Service IP
3. Check database is running and accessible

---

## What to Check Right Now

### Priority 1: App Service Status
- Is it "Running" or "Stopped"?
- If stopped, start it

### Priority 2: Log Stream
- Are there any error messages?
- Did backend start successfully?
- Any crash logs?

### Priority 3: Recent Deployments
- Did deployment `edbaf11c` complete?
- Any deployment errors?

### Priority 4: Test Backend
- After checking above, test with curl commands
- See if backend responds

---

**Last Updated:** January 5, 2026  
**Status:** Diagnostic steps for checking Azure App Service

