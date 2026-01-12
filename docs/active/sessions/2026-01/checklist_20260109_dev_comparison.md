# Dev-SWA vs Local Dev Functionality Comparison Checklist
**Created:** January 9, 2026  
**Purpose:** Verify dev-swa has the same functionality as local dev  
**Status:** ✅ Healthcare Module Complete - ⏳ EMS Module Testing Next

---

## Overview

This checklist helps verify that dev-swa (`https://dev-swa.traccems.com`) has the same functionality as local dev (`http://localhost:3000`). Use this to systematically test all features and identify any discrepancies.

**Key Differences to Expect:**
- ✅ Different data (dev-swa uses Azure dev database, local uses local database)
- ✅ Different URLs (localhost vs dev-swa.traccems.com)
- ✅ Same functionality should be **identical**

---

## 1. Authentication & Login

- [ ] Login as `admin@tcc.com` ✅ (Already confirmed)
- [ ] Login as Healthcare user (test@hospital.com or similar)
- [ ] Login as EMS user (test@ems.com or similar)
- [ ] Logout works correctly
- [ ] Session persistence (refresh page, still logged in)
- [ ] Redirects work correctly after login
- [ ] Password change functionality (if applicable)
- [ ] Error handling for invalid credentials

---

## 2. TCC Dashboard (Admin) - Core Features

### Navigation & Menu
- [ ] Top menu bar loads correctly
- [ ] All menu items accessible:
  - [ ] Home/Overview
  - [ ] Healthcare → Facilities
  - [ ] EMS → Agencies
  - [ ] Operations → Trips
  - [ ] Operations → Create Trip
  - [ ] Operations → Route Optimization
  - [ ] Operations → Analytics
  - [ ] Admin → Users

### Overview Page
- [ ] System overview stats load (trips, facilities, agencies)
- [ ] Quick action buttons work:
  - [ ] Create Trip
  - [ ] Add Healthcare Facility
  - [ ] Add EMS Agency
  - [ ] Existing Trip Management
- [ ] Charts/graphs display correctly (if applicable)
- [ ] Real-time updates (if applicable)

### Trip Management
- [ ] Trips list displays correctly
- [ ] Filtering/search works
- [ ] Sorting works
- [ ] Pagination works (if applicable)
- [ ] Create Trip form loads
- [ ] All dropdowns populate:
  - [ ] Transport level
  - [ ] Urgency
  - [ ] Pickup locations
  - [ ] Destinations
  - [ ] Agencies
  - [ ] Other form fields
- [ ] Can create a new trip
- [ ] Trip appears in list after creation
- [ ] Trip details view works
- [ ] Trip status updates work
- [ ] Trip editing works (if applicable)
- [ ] Trip deletion works (if applicable)

### Healthcare Facilities
- [ ] Facilities list loads
- [ ] Can view facility details
- [ ] Facility settings page works
- [ ] Can add facilities (if permissions allow)
- [ ] Can edit facilities (if permissions allow)
- [ ] Can delete facilities (if permissions allow)
- [ ] Facility search/filter works

### EMS Agencies
- [ ] Agencies list loads
- [ ] Can view agency details
- [ ] Agency management works
- [ ] Can add agencies (if permissions allow)
- [ ] Can edit agencies (if permissions allow)
- [ ] Can delete agencies (if permissions allow)
- [ ] Agency search/filter works

### Analytics
- [ ] Analytics dashboard loads
- [ ] Charts/graphs display correctly
- [ ] Data filters work
- [ ] Date range selection works
- [ ] Export functionality works (if applicable)

### Route Optimization
- [ ] Route optimizer loads
- [ ] Can input routes/trips
- [ ] Optimization algorithm runs
- [ ] Results display correctly

### Admin Users
- [ ] User list loads
- [ ] Can view user details
- [ ] Can add users (if permissions allow)
- [ ] Can edit users (if permissions allow)
- [ ] Can delete users (if permissions allow)
- [ ] User roles/permissions work correctly

---

## 3. Healthcare Dashboard Features

### Tabs (should match local dev exactly)
- [x] Available Agencies tab - **WORKING** ✅ (Tested and confirmed working - Jan 10, 2026)
- [ ] Create Request tab
- [ ] Transport Requests tab
- [ ] In-Progress tab
- [ ] Completed Trips tab
- [ ] Hospital Settings tab
- [ ] EMS Providers tab
- [x] Destinations tab - **WORKING** ✅ (GPS lookup and save verified - Jan 10, 2026)
- [ ] Team Members tab

### Core Functionality
- [ ] Create transport request form works
- [ ] All form fields populate correctly
- [ ] Form validation works
- [ ] Can submit transport request
- [ ] Request appears in Transport Requests tab
- [ ] In-Progress trips display correctly
- [ ] Completed trips display correctly
- [ ] Agency responses visible
- [ ] Dispatch functionality works
- [ ] Can view trip details
- [ ] Can cancel trips (if applicable)
- [ ] Can edit trips (if applicable)

### Settings & Configuration
- [ ] Hospital Settings page loads
- [ ] Can update hospital information
- [ ] EMS Providers list/management works
- [ ] Destinations list/management works
- [ ] Team Members management works
- [ ] Sub-users functionality works

---

## 4. EMS Dashboard Features ⏳ **IN PROGRESS**

### Core Functionality
- [ ] Dashboard loads correctly
- [ ] Available trips display
- [ ] Can accept trips
- [ ] Can decline trips
- [ ] Trip status updates work
- [ ] Unit assignment (if applicable)
- [x] Trip completion workflow ✅ **WORKING** (Completed trips display verified - Jan 10, 2026)
- [ ] Analytics/metrics display
- [ ] Can view trip details
- [ ] Can update trip status
- [ ] Mark arrival/departure works (if applicable)

### Trip Management
- [ ] Filtering/search works
- [ ] Status filtering works
- [ ] Date filtering works
- [ ] Real-time updates work
- [x] Completed trips display correctly ✅ **WORKING** (Matches dev-swa - Jan 10, 2026)

---

## 5. API Endpoints Verification

### Health Check
```bash
# Should return 200 OK with JSON response
curl https://dev-api.traccems.com/health
```

### Critical Endpoints (test via browser console or curl)
**Note:** These will return 401 without auth, but route should exist (not 404)

```bash
# Core endpoints
curl -I https://dev-api.traccems.com/api/trips
curl -I https://dev-api.traccems.com/api/agency-responses
curl -I https://dev-api.traccems.com/api/dropdown-options
curl -I https://dev-api.traccems.com/api/dropdown-categories
curl -I https://dev-api.traccems.com/api/tcc/pickup-locations

# Healthcare endpoints
curl -I https://dev-api.traccems.com/api/healthcare/locations
curl -I https://dev-api.traccems.com/api/healthcare/agencies
curl -I https://dev-api.traccems.com/api/healthcare/destinations
curl -I https://dev-api.traccems.com/api/healthcare/sub-users

# EMS endpoints
curl -I https://dev-api.traccems.com/api/ems/sub-users
curl -I https://dev-api.traccems.com/api/ems/analytics

# TCC endpoints
curl -I https://dev-api.traccems.com/api/tcc/hospitals
curl -I https://dev-api.traccems.com/api/tcc/agencies
curl -I https://dev-api.traccems.com/api/tcc/facilities
curl -I https://dev-api.traccems.com/api/tcc/analytics

# Authentication endpoints
curl -I https://dev-api.traccems.com/api/auth/login
curl -I https://dev-api.traccems.com/api/auth/healthcare/login
curl -I https://dev-api.traccems.com/api/auth/ems/login
```

**Expected Results:**
- Health endpoint: `200 OK` with JSON response
- Other endpoints: `401 Unauthorized` (route exists, needs auth) or `404 Not Found` (route doesn't exist)
- **Red Flag:** If endpoints return `500 Internal Server Error` or `503 Service Unavailable`, backend may have issues

---

## 6. UI/UX Consistency

### Visual Comparison
- [ ] Page layouts match local dev
- [ ] Colors/styling consistent
- [ ] Fonts render correctly
- [ ] Icons display correctly
- [ ] Images load correctly
- [ ] Responsive design works (mobile/tablet)
- [ ] Loading states work correctly
- [ ] Error messages display properly
- [ ] Success messages display properly
- [ ] Form validation messages display correctly

### Browser Console Check
**Open browser DevTools (F12) → Console tab:**

- [ ] No JavaScript errors
- [ ] No 404 errors for assets (images, CSS, JS files)
- [ ] No CORS errors
- [ ] No API errors (500, 503, etc.)
- [ ] Network requests complete successfully
- [ ] No memory leaks warnings
- [ ] No deprecation warnings

### Network Tab Check
**Open browser DevTools (F12) → Network tab:**

- [ ] All API requests return 200 or expected status codes
- [ ] No failed requests (red entries)
- [ ] Response times are reasonable
- [ ] No CORS preflight failures

---

## 7. Database Functionality

### Data Consistency
- [ ] Same data structure as local dev
- [ ] Dropdowns populate with same options
- [ ] Relationships work correctly:
  - [ ] Trips → Agencies
  - [ ] Trips → Facilities
  - [ ] Agencies → Units (if applicable)
  - [ ] Facilities → Users
- [ ] Status transitions work correctly
- [ ] Foreign key constraints work correctly
- [ ] Data validation works correctly

### Data Integrity
- [ ] Can create records
- [ ] Can update records
- [ ] Can delete records (if applicable)
- [ ] Cascade deletes work correctly (if applicable)
- [ ] Unique constraints work correctly

---

## 8. Real-time Features

- [ ] Notifications work (if applicable)
- [ ] Real-time updates work (if applicable)
- [ ] WebSocket connections work (if applicable)
- [ ] Live status updates work (if applicable)

---

## 9. Performance

- [ ] Page load times are reasonable
- [ ] API response times are reasonable
- [ ] No significant lag in UI interactions
- [ ] Large lists render efficiently
- [ ] Search/filter operations are fast

---

## Quick Comparison Method

**Side-by-side testing:**
1. Open local dev: `http://localhost:3000`
2. Open dev-swa: `https://dev-swa.traccems.com`
3. Log into both with the same credentials
4. Navigate through the same features in parallel
5. Compare:
   - Same menu items?
   - Same form fields?
   - Same data displayed?
   - Same behavior?

---

## Red Flags to Watch For

If you see any of these, dev-swa may not match local dev:

- ❌ Missing menu items or tabs
- ❌ Forms missing fields
- ❌ Dropdowns not populating
- ❌ Features that work locally but not on dev-swa
- ❌ Different UI layouts or styling
- ❌ Console errors that don't appear locally
- ❌ API endpoints returning 404 or 500
- ❌ Different behavior for same actions
- ❌ Missing validation or error handling
- ❌ Performance issues not present locally

---

## Recommended Testing Order

1. ✅ **Authentication** (already done - admin@tcc.com login confirmed)
2. **TCC Dashboard navigation** - Verify all menu items work
3. **Create Trip workflow** - End-to-end trip creation
4. **Healthcare Dashboard tabs** - Verify all tabs load and function
5. **EMS Dashboard functionality** - Verify trip acceptance/completion
6. **Analytics/Reporting** - Verify data displays correctly
7. **Settings/Configuration pages** - Verify all settings work

---

## Test Results

### Date: _______________
### Tester: _______________

**Overall Status:** ⏳ In Progress / ✅ Pass / ❌ Fail

**Issues Found:**
1. 
2. 
3. 

**Notes:**

---

---

# Production Deployment Alignment with Dev-SWA

**Purpose:** Ensure production backend deploys and starts successfully using the same proven approach as dev-swa.

---

## Current Status

### Dev-SWA (Working ✅)
- **Backend URL:** `https://dev-api.traccems.com`
- **Status:** ✅ Running and responding
- **Deployment Strategy:** Direct `node_modules` deployment (no archive extraction)
- **Workflow:** `.github/workflows/dev-be.yaml`
- **Key Features:**
  - Path filters prevent documentation-only commits from triggering deployments
  - Concurrency control prevents multiple simultaneous deployments
  - Direct `node_modules` deployment (reliable, proven approach)
  - Non-blocking health check
  - Proper error handling

### Production (Needs Verification ⚠️)
- **Backend URL:** `https://api.traccems.com`
- **Status:** ⚠️ Needs verification
- **Deployment Strategy:** Should match dev-swa
- **Workflow:** `.github/workflows/prod-be.yaml`
- **Key Differences:**
  - Manual dispatch (workflow_dispatch) - no path filters needed
  - Should use same direct `node_modules` deployment approach ✅ (already configured)

---

## Production Alignment Checklist

### 1. Workflow Configuration Verification

**File:** `.github/workflows/prod-be.yaml`

**Current Status:**
- ✅ Uses direct `node_modules` deployment (comment confirms: "node_modules is deployed directly")
- ✅ Manual dispatch (workflow_dispatch) - appropriate for production
- ✅ Same Node.js version (24.x)
- ✅ Same build steps (install → generate → migrate → build → deploy)

**Verification Steps:**
- [ ] Review `.github/workflows/prod-be.yaml` matches dev-swa approach
- [ ] Confirm no archive extraction steps exist
- [ ] Confirm `package.json` start scripts are simple (no extraction logic)
- [ ] Verify environment variables are set correctly in Azure Portal

### 2. Backend Package.json Verification

**File:** `backend/package.json`

**Required Configuration:**
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "start:prod": "node dist/production-index.js"
  }
}
```

**Verification Steps:**
- [ ] Confirm `start` script is simple: `node dist/index.js`
- [ ] Confirm `start:prod` script is simple: `node dist/production-index.js`
- [ ] Verify NO extraction logic in start scripts
- [ ] Verify NO `prestart` hooks with extraction logic

### 3. Azure App Service Configuration

**Production App Service:** `TraccEms-Prod-Backend`

**Required Settings:**
- [ ] **Startup Command:** Should be empty or `npm start` (Azure will use package.json)
- [ ] **Node Version:** Should match workflow (24.x)
- [ ] **Environment Variables:**
  - [ ] `DATABASE_URL` - Production database connection string
  - [ ] `NODE_ENV` - Set to `production`
  - [ ] `FRONTEND_URL` - Production frontend URL
  - [ ] `PORT` - Usually 8080 for Azure (or let Azure set it)
  - [ ] Any other required environment variables

**Verification Steps:**
1. Azure Portal → `TraccEms-Prod-Backend` → Configuration → Application settings
2. Verify all required environment variables are set
3. Check General settings → Startup Command (should be empty or `npm start`)

### 4. Database Migration Verification

**Production Database:** Uses `DATABASE_URL_PROD` secret

**Verification Steps:**
- [ ] Confirm `DATABASE_URL_PROD` secret exists in GitHub repository secrets
- [ ] Verify production database is accessible from Azure App Service
- [ ] Confirm firewall rules allow Azure App Service IP ranges
- [ ] Test migration can run successfully (dry-run if possible)

### 5. Deployment Process

**Pre-Deployment Checklist:**
- [ ] Dev-swa is stable and tested ✅
- [ ] All changes committed to appropriate branch (main or develop)
- [ ] No deployments currently in progress
- [ ] Backup production database (if needed)
- [ ] Review deployment guide: `docs/reference/azure/deployment-guide.md`

**Deployment Steps:**
1. Go to: https://github.com/Medic423/medport/actions
2. Select workflow: "production - Deploy Prod Backend"
3. Click "Run workflow"
4. Select branch: `main` (or `develop` if testing)
5. Click "Run workflow"
6. Monitor deployment progress
7. Wait for completion (~5-10 minutes)

**Post-Deployment Verification:**
- [ ] Check GitHub Actions logs for errors
- [ ] Verify backend health endpoint: `curl https://api.traccems.com/health`
- [ ] Check Azure Portal → Log stream for startup messages
- [ ] Verify backend starts without errors
- [ ] Test login functionality
- [ ] Test critical API endpoints

### 6. Health Check Verification

**Test Production Health Endpoint:**
```bash
curl https://api.traccems.com/health
```

**Expected Response:**
- Status: `200 OK`
- Body: JSON with status information
- Response time: < 2 seconds

**If Health Check Fails:**
1. Check Azure Portal → Log stream for errors
2. Verify environment variables are set correctly
3. Check database connectivity
4. Verify `node_modules` exists (should be deployed directly)
5. Check for startup errors in logs

### 7. Startup Error Handling

**Common Issues and Solutions:**

**Issue: "Cannot find module 'express'"**
- **Cause:** Missing `node_modules` or extraction failed
- **Solution:** Verify direct `node_modules` deployment (no extraction)
- **Check:** Azure Portal → Log stream for extraction attempts

**Issue: Database connection failed**
- **Cause:** Incorrect `DATABASE_URL` or firewall rules
- **Solution:** Verify `DATABASE_URL_PROD` secret and firewall rules
- **Check:** Azure Portal → Configuration → Application settings

**Issue: Migration failed**
- **Cause:** Database schema mismatch or migration conflicts
- **Solution:** Review migration logs, verify database state
- **Check:** GitHub Actions logs for migration errors

**Issue: Port binding error**
- **Cause:** Incorrect PORT environment variable
- **Solution:** Let Azure set PORT automatically or set to 8080
- **Check:** Azure Portal → Configuration → Application settings

### 8. Monitoring and Logging

**Azure Portal Monitoring:**
- [ ] Set up Application Insights (if not already configured)
- [ ] Monitor Log stream during deployment
- [ ] Check for error patterns in logs
- [ ] Monitor performance metrics

**GitHub Actions Monitoring:**
- [ ] Review deployment logs for warnings
- [ ] Check deployment duration (should be ~5-10 minutes)
- [ ] Verify all steps completed successfully

---

## Production Deployment Verification Checklist

### After Deployment

- [ ] **Backend Health:** `curl https://api.traccems.com/health` returns 200
- [ ] **Backend Logs:** Azure Log stream shows successful startup
- [ ] **Database:** Migrations completed successfully
- [ ] **Login:** Can login as admin@tcc.com
- [ ] **API Endpoints:** Critical endpoints respond correctly
- [ ] **Frontend:** Can connect to backend API
- [ ] **No Errors:** No 500/503 errors in logs
- [ ] **Performance:** Response times are reasonable

### Critical Endpoints Test

```bash
# Health check
curl https://api.traccems.com/health

# Test endpoints (will return 401 without auth, but route should exist)
curl -I https://api.traccems.com/api/trips
curl -I https://api.traccems.com/api/agency-responses
curl -I https://api.traccems.com/api/dropdown-options
```

---

## Key Differences: Dev-SWA vs Production

| Aspect | Dev-SWA | Production |
|--------|---------|------------|
| **Trigger** | Automatic on `develop` branch push | Manual workflow dispatch |
| **Path Filters** | Yes (only backend/** changes) | N/A (manual trigger) |
| **Concurrency Control** | Yes (prevents conflicts) | N/A (manual trigger) |
| **Database** | Dev database (`DATABASE_URL`) | Production database (`DATABASE_URL_PROD`) |
| **URL** | `dev-api.traccems.com` | `api.traccems.com` |
| **Deployment Strategy** | Direct `node_modules` | Direct `node_modules` ✅ |
| **Start Scripts** | Simple (no extraction) | Simple (no extraction) ✅ |

**Both should use the same reliable deployment approach!**

---

## Summary

### Dev-SWA Status: ✅ Working
- Direct `node_modules` deployment
- Backend running and responding
- Health check working
- Login functional

### Production Alignment: ⚠️ Needs Verification
- Workflow already configured for direct `node_modules` deployment ✅
- Need to verify:
  - Azure App Service configuration
  - Environment variables
  - Database connectivity
  - Successful deployment and startup

### Next Steps:
1. ✅ Verify production workflow matches dev-swa approach (already confirmed)
2. ⏳ Verify Azure App Service configuration
3. ⏳ Perform test deployment to production
4. ⏳ Verify backend starts successfully
5. ⏳ Test production functionality

---

**Last Updated:** January 9, 2026  
**Status:** ⏳ Ready for testing
