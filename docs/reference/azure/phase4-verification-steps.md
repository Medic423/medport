# Phase 4: Environment Variables Verification Steps
**Created:** December 26, 2025  
**Purpose:** Verify environment variables are working correctly

## Backend Verification

### Step 1: Check App Service Status

1. **Go to Azure Portal:**
   - Navigate to: `TraccEms-Prod-Backend` App Service
   - Check: **Overview** → Status should show "Running"

### Step 2: Check Log Stream

1. **Open Log Stream:**
   - Go to: **"Log stream"** in the left menu
   - Look for startup messages:
     - ✅ "TCC Backend server running on port..."
     - ✅ "Database connection successful" (if DATABASE_URL is set)
     - ✅ "Azure Communication Services SMS service initialized" (if SMS vars set)

### Step 3: Test Health Endpoint

**Note:** The `/health` endpoint may return 401 if routes are protected or code isn't deployed yet. This is expected if no code has been deployed.

**After deploying backend code:**
- URL: `https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net/health`
- Expected: `{"status":"ok"}` or similar

### Step 4: Verify Environment Variables

**Check via Azure Portal:**
1. Go to: **Configuration** → **Application settings**
2. Verify all variables are listed:
   - ✅ `DATABASE_URL`
   - ✅ `NODE_ENV` = `production`
   - ✅ `AZURE_SMS_ENABLED` = `true`
   - ✅ `AZURE_COMMUNICATION_CONNECTION_STRING`
   - ✅ `AZURE_COMMUNICATION_PHONE_NUMBER` = `+18339675959`
   - ✅ `PORT` = `8080`

---

## Frontend Verification

### Step 1: Verify Environment Variables

**Check via Azure Portal:**
1. Go to: `TraccEms-Prod-Frontend` → **Settings** → **Environment Variables**
2. Verify:
   - ✅ `VITE_API_URL` = `https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net`
   - ✅ `NODE_ENV` = `production`

### Step 2: Redeploy Frontend

**Important:** Static Web Apps require redeployment for environment variables to take effect.

1. **Go to GitHub Actions:**
   - Navigate to: GitHub → Actions
   - Find: "production - Deploy Prod Frontend"
   - Click: "Run workflow"
   - Select: `develop` branch
   - Click: "Run workflow"

2. **Wait for Deployment:**
   - Watch workflow complete
   - Verify deployment succeeds

### Step 3: Test Frontend

**After deploying frontend code:**
1. Navigate to: Static Web App URL (or custom domain if configured)
   - Default URL: `https://witty-smoke-033c02b10.6.azurestaticapps.net`
2. Open browser DevTools → Console
3. Look for: `TCC_DEBUG: API_BASE_URL is set to: [backend URL]`
4. Verify: API calls go to production backend (`https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net`)
5. Test: Try logging in or making an API call to verify backend connectivity

---

## Expected Results

### Backend
- ✅ All environment variables configured
- ✅ App Service running
- ✅ Log stream shows startup messages (after code deployment)
- ✅ Health endpoint responds (after code deployment)

### Frontend
- ✅ Environment variables configured
- ✅ Frontend redeployed with new variables
- ✅ Browser console shows correct API URL
- ✅ Frontend can connect to backend

---

## Troubleshooting

### Backend Returns 401 on /health

**Possible Causes:**
- Code not deployed yet (expected - will work after deployment)
- Routes are protected (check if /health requires authentication)
- App Service needs restart

**Solution:**
- Deploy backend code via GitHub Actions workflow
- Check log stream for startup messages
- Verify environment variables are set

### Frontend Still Using Old API URL

**Cause:** Environment variables require redeployment to take effect.

**Solution:**
- Redeploy frontend via GitHub Actions workflow
- Verify `VITE_API_URL` is set correctly
- Check browser console after redeployment

---

**Last Updated:** December 26, 2025

