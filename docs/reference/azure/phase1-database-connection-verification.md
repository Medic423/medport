# Phase 1: Database Connection Verification
**Created:** December 26, 2025  
**Purpose:** Verify App Service can connect to production database before Phase 2

## Overview

Before proceeding to Phase 2 (Database Setup), we need to verify that the production App Service can successfully connect to the production database.

## Step 1: Set DATABASE_URL Environment Variable

### Via Azure Portal

1. **Navigate to App Service:**
   - Go to Azure Portal → `TraccEms-Prod-Backend` App Service

2. **Open Configuration:**
   - Click **"Configuration"** in the left menu
   - Or go to **Settings** → **Configuration**

3. **Add Application Setting:**
   - Click **"+ New application setting"**
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require`
   - Click **"OK"**

4. **Save Configuration:**
   - Click **"Save"** at the top
   - Azure will restart the app automatically
   - Wait for restart to complete (usually 1-2 minutes)

### Verification
- [ ] DATABASE_URL environment variable added
- [ ] App Service restarted
- [ ] Ready to test connection

---

## Step 2: Verify Configuration

**Note:** The App Service doesn't have code deployed yet, so we can't test the connection endpoint. However, we can verify the configuration is correct.

### Verify DATABASE_URL is Set

**Check via Azure CLI:**
```bash
az webapp config appsettings list --name TraccEms-Prod-Backend --resource-group TraccEms-Prod-USCentral --query "[?name=='DATABASE_URL']"
```

**Expected:** Should show the DATABASE_URL with correct connection string format.

### Verify Firewall Configuration

**Check via Azure CLI:**
```bash
az postgres flexible-server firewall-rule list --name traccems-prod-pgsql --resource-group TraccEms-Prod-USCentral
```

**Expected:** Should show "AllowAllAzureServicesAndResourcesWithinAzureIps" rule (0.0.0.0).

---

## Step 3: Test Database Connection (After Code Deployment)

**Note:** Full connection testing will be possible after deploying code in Phase 3. For now, we verify configuration is correct.

### Option 1: Health Check Endpoint (After Deployment)

**Endpoint:** `https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net/health`

**Expected Response (Success):**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-26T...",
  "databases": "connected"
}
```

### Option 2: Detailed Database Test Endpoint (After Deployment)

**Endpoint:** `https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net/api/test-db`

### Option 2: Detailed Database Test Endpoint

**Endpoint:** `https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net/api/test-db`

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": [...],
  "hospitalCount": 0,
  "sampleHospitals": []
}
```

### Testing Methods

**Method 1: Browser**
- Open: `https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net/health`
- Should show JSON response with `"status": "healthy"`

**Method 2: curl (Terminal)**
```bash
curl https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net/health
```

**Method 3: Azure CLI**
```bash
az webapp log tail --name TraccEms-Prod-Backend --resource-group TraccEms-Prod-USCentral
```
Then check logs for database connection messages.

---

## Step 3: Check App Service Logs

### Via Azure Portal

1. **Navigate to App Service:**
   - Go to `TraccEms-Prod-Backend` App Service

2. **View Logs:**
   - Click **"Log stream"** in the left menu
   - Or go to **Monitoring** → **Log stream**
   - Look for:
     - ✅ `Database connection successful`
     - ✅ `✅ Database connection successful` (from startup)
     - ❌ `Database connection failed` (if there's an issue)
     - ❌ `Database operation failed` (if there's an issue)

### What to Look For

**Success Indicators:**
- `✅ Database connection successful`
- `📊 Health check: http://...`
- No database connection errors

**Failure Indicators:**
- `Database connection failed`
- `Database operation failed`
- `ECONNREFUSED` errors
- `timeout` errors
- `authentication failed` errors

---

## Troubleshooting

### Issue: Health Check Returns "unhealthy"

**Possible Causes:**
1. DATABASE_URL not set correctly
2. Firewall blocking connection
3. Database credentials incorrect
4. Database server not accessible

**Solutions:**
1. Verify DATABASE_URL in App Service Configuration
2. Check firewall rules (should have "Allow Azure services" enabled)
3. Verify database credentials
4. Check database server status in Azure Portal

### Issue: Connection Timeout

**Possible Causes:**
1. Firewall not configured correctly
2. Database server not running
3. Network connectivity issues

**Solutions:**
1. Verify "Allow Azure services" is enabled in database firewall
2. Check database server status
3. Verify App Service outbound IPs are allowed (if using specific IP rules)

### Issue: Authentication Failed

**Possible Causes:**
1. Incorrect username or password
2. Connection string format incorrect

**Solutions:**
1. Verify username: `traccems_admin`
2. Verify password is correct (no spaces in connection string)
3. Check connection string format

---

## Verification Checklist

**Configuration Verification (Can Do Now):**
- [x] DATABASE_URL environment variable set in App Service ✅
- [x] DATABASE_URL format verified ✅
- [x] Firewall "Allow Azure services" enabled ✅
- [x] App Service is running ✅

**Connection Testing (After Code Deployment in Phase 3):**
- [ ] Health check endpoint returns `"status": "healthy"` (requires code deployment)
- [ ] App Service logs show successful database connection (requires code deployment)
- [ ] No database connection errors in logs (requires code deployment)

**Current Status:** ✅ Configuration verified. Connection testing will be done after code deployment in Phase 3.

---

## Next Steps

Once verification is complete:
- ✅ Proceed to Phase 2: Database Setup
- ✅ Run Prisma migrations on production database
- ✅ Initialize database schema

---

**Last Updated:** December 26, 2025  
**Status:** Ready for Verification

