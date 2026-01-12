# Azure Internal Server Error Troubleshooting
**Last Updated:** December 8, 2025

## Problem

Getting internal server error when accessing: https://dev-swa.traccems.com/

## Common Causes

1. **Backend Application Error**
   - Application failing to start
   - Runtime error in code
   - Missing dependencies

2. **Missing Environment Variables**
   - `DATABASE_URL` not set in Azure
   - `AZURE_SMS_ENABLED` not set
   - Other required env vars missing

3. **Database Connection Issue**
   - Can't connect to Azure PostgreSQL
   - Connection string incorrect
   - Firewall blocking Azure App Service

4. **Application Startup Failure**
   - Prisma client generation issue
   - Port binding issue
   - Missing build artifacts

## How to Check Azure Logs

### Option 1: Azure Portal Log Stream

1. **Go to Azure Portal:**
   - Navigate to: **App Services** → **TraccEms-Dev-Backend**

2. **View Logs:**
   - Click **Log stream** in the left menu
   - Or go to **Monitoring** → **Log stream**
   - This shows real-time application logs

3. **Check Application Logs:**
   - Look for error messages
   - Check startup logs
   - Look for stack traces

### Option 2: Azure Portal Log Files

1. **Go to Azure Portal:**
   - Navigate to: **App Services** → **TraccEms-Dev-Backend**

2. **View Log Files:**
   - Go to **Advanced Tools (Kudu)** → **Go**
   - Or go to **Development Tools** → **Advanced Tools** → **Go**
   - Navigate to: **Debug console** → **CMD**
   - Go to: `LogFiles/Application/`
   - Download recent log files

### Option 3: Check Application Insights (if enabled)

1. **Azure Portal:**
   - Navigate to your App Service
   - Go to **Application Insights**
   - Check for exceptions and errors

## Quick Checks

### 1. Verify Backend is Running

Check if the backend service is actually running:
- Azure Portal → App Services → TraccEms-Dev-Backend
- Check **Status** (should be "Running")
- Check **Overview** → **Status** (should be green)

### 2. Check Environment Variables

Azure Portal → App Services → TraccEms-Dev-Backend → **Configuration** → **Application settings**

Verify these are set:
- ✅ `DATABASE_URL` - Should be set (from GitHub Secrets)
- ✅ `AZURE_SMS_ENABLED` - Should be `true`
- ✅ `AZURE_COMMUNICATION_CONNECTION_STRING` - Should be set
- ✅ `NODE_ENV` - Should be `production` or `development`
- ✅ `PORT` - Usually set automatically by Azure

### 3. Check Database Connection

The backend might be failing to connect to the database:
- Verify `DATABASE_URL` is correct in Azure App Settings
- Check if Azure App Service IP is whitelisted in PostgreSQL firewall
- Enable "Allow Azure services" in PostgreSQL firewall

### 4. Check Build/Deployment Logs

GitHub Actions → Latest workflow run → Check build and deployment steps for errors

## Common Fixes

### Fix 1: Add Missing Environment Variables

If env vars are missing:

1. **Azure Portal** → **App Services** → **TraccEms-Dev-Backend**
2. **Configuration** → **Application settings**
3. **Add** missing environment variables:
   - `DATABASE_URL` - From GitHub Secrets
   - `AZURE_SMS_ENABLED` - `true`
   - `AZURE_COMMUNICATION_CONNECTION_STRING` - From GitHub Secrets
   - `NODE_ENV` - `production`
4. **Save** (this will restart the app)

### Fix 2: Whitelist Azure App Service IP

Azure App Service needs to connect to PostgreSQL:

1. **Azure Portal** → **PostgreSQL Server** → **Networking**
2. **Enable:** "Allow Azure services and resources to access this server"
3. **Save**

### Fix 3: Check Application Startup

The app might be crashing on startup:

1. Check **Log stream** for startup errors
2. Look for:
   - Database connection errors
   - Missing module errors
   - Port binding errors
   - Prisma errors

### Fix 4: Verify Build Output

Check if the build created the necessary files:

1. **Azure Portal** → **Advanced Tools (Kudu)**
2. Navigate to: `site/wwwroot/`
3. Check if `dist/` folder exists
4. Check if `node_modules/` exists
5. Check if `package.json` exists

## Diagnostic Steps

1. ✅ Check Azure Portal → App Service Status
2. ✅ Check Log Stream for errors
3. ✅ Verify Environment Variables
4. ✅ Check Database Connection
5. ✅ Review GitHub Actions deployment logs
6. ✅ Check Application Insights (if enabled)

## Getting Specific Error Details

The most important thing is to see the actual error message:

1. **Azure Portal** → **TraccEms-Dev-Backend**
2. **Log stream** (real-time logs)
3. **Or** **Advanced Tools** → **Log Files** → **Application**

Look for:
- Stack traces
- Error messages
- "Cannot find module" errors
- Database connection errors
- Port binding errors

## Next Steps

1. Check Azure Portal logs to get the specific error
2. Share the error message for targeted fix
3. Verify environment variables are set
4. Check database connectivity
5. Review deployment logs

