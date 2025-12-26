# Phase 4: Environment Variables Configuration - Implementation Guide
**Created:** December 26, 2025  
**Status:** Ready to Begin  
**Goal:** Configure production environment variables for backend and frontend

## Overview

Phase 4 involves setting up all environment variables needed for production. This includes database connection, SMS configuration, API URLs, and other application settings.

**Key Principle:** Production uses separate environment variables from dev, ensuring complete isolation.

---

## Prerequisites

- ✅ Phase 1 Complete: All Azure resources created
- ✅ Phase 2 Complete: Database schema initialized
- ✅ Phase 3 Complete: GitHub workflows and secrets configured
- ✅ Backend deployed successfully (at least once)
- ✅ Frontend deployed successfully (at least once)

---

## Task 4.1: Configure Production Backend Environment Variables

### Step 1: Navigate to App Service Configuration

1. **Go to Azure Portal:**
   - https://portal.azure.com
   - Find: `TraccEms-Prod-Backend` App Service

2. **Open Configuration:**
   - Click: **"Configuration"** in the left menu
   - Click: **"Application settings"** tab (default)

### Step 2: Add Required Environment Variables

Click **"+ New application setting"** for each variable below:

#### 1. DATABASE_URL (Critical)

- **Name:** `DATABASE_URL`
- **Value:** `postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require`
- **Purpose:** Production database connection string
- **Source:** Same as `DATABASE_URL_PROD` GitHub secret
- **Note:** ⚠️ **CRITICAL** - Backend cannot connect to database without this

#### 2. NODE_ENV

- **Name:** `NODE_ENV`
- **Value:** `production`
- **Purpose:** Sets Node.js environment to production mode
- **Note:** Enables production optimizations and error handling

#### 3. PORT (Optional - Usually Auto-Set)

- **Name:** `PORT`
- **Value:** `8080` (or leave Azure default)
- **Purpose:** Port for the application to listen on
- **Note:** Azure usually sets this automatically, but can be explicitly set

#### 4. AZURE_SMS_ENABLED

- **Name:** `AZURE_SMS_ENABLED`
- **Value:** `true`
- **Purpose:** Feature flag to enable SMS sending
- **Note:** Required for SMS notifications to work

#### 5. AZURE_COMMUNICATION_CONNECTION_STRING

- **Name:** `AZURE_COMMUNICATION_CONNECTION_STRING`
- **Value:** `endpoint=https://tracccomms.unitedstates.communication.azure.com/;accesskey=[YOUR_ACCESS_KEY]`
- **Purpose:** Azure Communication Services connection string
- **Source:** Azure Portal → `TraccComms` resource → Keys
- **How to Get:**
  1. Go to Azure Portal → Communication Services → `TraccComms`
  2. Click: **"Keys"** in the left menu
  3. Copy: **"Connection string"** (Primary or Secondary)
  4. Format: `endpoint=https://tracccomms.unitedstates.communication.azure.com/;accesskey=...`
- **Note:** Same resource as dev (`TraccComms`)

#### 6. AZURE_COMMUNICATION_PHONE_NUMBER

- **Name:** `AZURE_COMMUNICATION_PHONE_NUMBER`
- **Value:** `+18339675959`
- **Purpose:** Sender phone number for SMS
- **Note:** Same phone number as dev

#### 7. FRONTEND_URL (Optional - For CORS)

- **Name:** `FRONTEND_URL`
- **Value:** `https://traccems.com` (or Azure Static Web App URL until custom domain is configured)
- **Purpose:** Frontend URL for CORS configuration
- **Note:** Will be updated when custom domain is configured in Phase 5

#### 8. CORS_ORIGIN (Optional - For CORS)

- **Name:** `CORS_ORIGIN`
- **Value:** `https://traccems.com` (or Azure Static Web App URL until custom domain is configured)
- **Purpose:** Allowed CORS origin
- **Note:** Will be updated when custom domain is configured in Phase 5

### Step 3: Save Configuration

1. **Click:** **"Save"** button (top of page)
2. **Wait:** Azure will restart the App Service automatically
3. **Verify:** Status shows "Running" after restart

### Step 4: Verify Environment Variables

1. **Check Log Stream:**
   - Go to: **"Log stream"** in the left menu
   - Look for: Application startup messages
   - Verify: No database connection errors
   - Verify: SMS service initialized (if SMS vars set)

2. **Test Health Endpoint:**
   - URL: `https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net/health`
   - Should return: `{"status":"ok"}`
   - If database connected: Should show database status

---

## Task 4.2: Configure Production Frontend Environment Variables

### Step 1: Navigate to Static Web App Configuration

1. **Go to Azure Portal:**
   - https://portal.azure.com
   - Find: `TraccEms-Prod-Frontend` Static Web App

2. **Open Configuration:**
   - Click: **"Configuration"** in the left menu
   - Click: **"Application settings"** tab

### Step 2: Add Required Environment Variables

Click **"+ New application setting"** for each variable:

#### 1. VITE_API_URL (Critical)

- **Name:** `VITE_API_URL`
- **Value:** `https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net`
- **Purpose:** Production backend API URL
- **Note:** ⚠️ **CRITICAL** - Frontend cannot connect to backend without this
- **Future:** Will be updated to `https://api.traccems.com` in Phase 5 (custom domain)

#### 2. NODE_ENV (Optional)

- **Name:** `NODE_ENV`
- **Value:** `production`
- **Purpose:** Sets build environment to production
- **Note:** Usually set automatically during build, but can be explicit

### Step 3: Save Configuration

1. **Click:** **"Save"** button (top of page)
2. **Note:** Static Web Apps may require redeployment for env vars to take effect
3. **Redeploy:** Trigger frontend workflow to apply changes

---

## Task 4.3: Verify Environment Variables

### Backend Verification

1. **Check Log Stream:**
   - Go to: App Service → **"Log stream"**
   - Look for:
     - ✅ "Database connection successful"
     - ✅ "TCC Backend server running on port..."
     - ✅ "Azure Communication Services SMS service initialized" (if SMS vars set)

2. **Test Health Endpoint:**
   ```bash
   curl https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net/health
   ```
   - Expected: `{"status":"ok"}`

3. **Test Database Endpoint:**
   ```bash
   curl https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net/api/test-db
   ```
   - Expected: Database connection status

### Frontend Verification

1. **Check Build Logs:**
   - Go to: GitHub Actions → Frontend workflow → Latest run
   - Verify: Build completes successfully
   - Check: Environment variables are used during build

2. **Test Frontend:**
   - Navigate to: Azure Static Web App URL (or custom domain if configured)
   - Open browser DevTools → Console
   - Check: `TCC_DEBUG: API_BASE_URL is set to: [correct URL]`
   - Verify: API calls go to production backend

---

## Environment Variables Checklist

### Backend (App Service)

- [ ] `DATABASE_URL` - Production database connection string
- [ ] `NODE_ENV` - Set to `production`
- [ ] `PORT` - Port number (optional, Azure usually sets)
- [ ] `AZURE_SMS_ENABLED` - Set to `true`
- [ ] `AZURE_COMMUNICATION_CONNECTION_STRING` - Communication Services connection string
- [ ] `AZURE_COMMUNICATION_PHONE_NUMBER` - Set to `+18339675959`
- [ ] `FRONTEND_URL` - Frontend URL for CORS (optional)
- [ ] `CORS_ORIGIN` - CORS origin (optional)

### Frontend (Static Web App)

- [ ] `VITE_API_URL` - Production backend API URL
- [ ] `NODE_ENV` - Set to `production` (optional)

---

## Troubleshooting

### Issue: Backend Cannot Connect to Database

**Symptoms:**
- Log stream shows database connection errors
- Health endpoint returns error

**Solution:**
1. Verify `DATABASE_URL` is set correctly
2. Check database firewall allows Azure services
3. Verify database server is running
4. Check connection string format (no spaces, correct password)

### Issue: SMS Not Working

**Symptoms:**
- SMS notifications not sending
- Log stream shows SMS initialization errors

**Solution:**
1. Verify `AZURE_SMS_ENABLED` is set to `true`
2. Check `AZURE_COMMUNICATION_CONNECTION_STRING` is correct
3. Verify `AZURE_COMMUNICATION_PHONE_NUMBER` is set
4. Check Communication Services resource is accessible
5. Verify SMS verification status in Azure Portal

### Issue: Frontend Cannot Connect to Backend

**Symptoms:**
- Frontend shows API errors
- Browser console shows CORS errors

**Solution:**
1. Verify `VITE_API_URL` is set correctly in Static Web App
2. Check backend CORS configuration
3. Verify backend `FRONTEND_URL` or `CORS_ORIGIN` matches frontend URL
4. Redeploy frontend after setting environment variables

### Issue: Environment Variables Not Applied

**Symptoms:**
- Changes saved but not taking effect

**Solution:**
1. **Backend:** Restart App Service manually
2. **Frontend:** Redeploy via GitHub Actions workflow
3. Verify variables are saved (check Configuration page)
4. Check for typos in variable names (case-sensitive)

---

## Important Notes

⚠️ **Security:**
- Never commit environment variables to git
- Use Azure Portal Configuration for sensitive values
- Rotate secrets regularly

⚠️ **Database Connection:**
- `DATABASE_URL` must match production database exactly
- Connection string format: `postgresql://user:password@host:port/database?sslmode=require`
- No spaces in connection string

⚠️ **SMS Configuration:**
- Uses same `TraccComms` resource as dev
- Phone number: `+18339675959`
- SMS verification will need to be resubmitted with production domain (Phase 8)

⚠️ **CORS Configuration:**
- Frontend and backend URLs must match for CORS to work
- Update `FRONTEND_URL` and `CORS_ORIGIN` when custom domain is configured

---

## Next Steps

After Phase 4 is complete:
1. ✅ Environment variables configured
2. ✅ Backend can connect to database
3. ✅ SMS service configured (if applicable)
4. ✅ Frontend can connect to backend
5. ✅ Ready for Phase 5: Custom Domain Configuration

---

**Last Updated:** December 26, 2025  
**Status:** Ready for Implementation

