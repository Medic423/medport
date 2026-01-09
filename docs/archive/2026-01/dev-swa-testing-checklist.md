# Dev-SWA Testing Checklist - January 5, 2026
**Status:** ⏳ Testing in progress  
**Deployment:** ✅ Successful  
**Backend Status:** ⚠️ Timeout on health check (needs investigation)

---

## Backend Status Check

### ⚠️ Current Issue: Backend 503 with CORS Errors

**Observation:**
- Backend health endpoint returning 503: `https://dev-api.traccems.com/health`
- CORS errors: "CORS header 'Access-Control-Allow-Origin' missing"
- Login attempts timing out or failing with CORS errors
- Root cause: Database connection failing, causing 503 responses without CORS headers

**Fix Applied:**
- ✅ Added explicit CORS headers to health check endpoint (even on 503)
- ✅ Added explicit CORS headers to error handler
- ✅ Ensures CORS headers present even when backend is unhealthy
- ⏳ **Deployed** - Waiting for deployment to complete

**Remaining Issue:**
- ⏳ Database connection needs to be fixed (causing 503 responses)
- ⏳ Check Azure Portal logs for database connection errors
- ⏳ Verify DATABASE_URL environment variable is set correctly

**Next Steps:**
1. ⏳ Check Azure Portal logs for backend startup errors
2. ⏳ Verify App Service is running (Azure Portal → TraccEms-Dev-Backend → Overview)
3. ⏳ Check Log Stream for error messages
4. ⏳ Verify environment variables are set correctly

---

## Testing Checklist

### Backend API Testing (Programmatic)

#### ✅ Routes Added During Unification

**Core Functionality Routes:**
- [ ] `/api/agency-responses` - **CRITICAL** for dispatch
- [ ] `/api/dropdown-options` - **CRITICAL** for forms
- [ ] `/api/dropdown-categories` - **CRITICAL** for forms
- [ ] `/api/tcc/pickup-locations` - **CRITICAL** for trip creation

**Healthcare Routes:**
- [ ] `/api/healthcare/locations` - Healthcare locations
- [ ] `/api/healthcare/agencies` - Healthcare agencies
- [ ] `/api/healthcare/destinations` - Healthcare destinations
- [ ] `/api/healthcare/sub-users` - Healthcare sub-users

**EMS Routes:**
- [ ] `/api/ems/sub-users` - EMS sub-users
- [ ] `/api/ems/analytics` - EMS analytics

**Other Routes:**
- [ ] `/api/agency` - Agency transport features
- [ ] `/api/public` - Public endpoints
- [ ] `/api/backup` - Backup utility
- [ ] `/api/maintenance` - Maintenance utility

**Existing Routes (Should Still Work):**
- [ ] `/api/auth` - Authentication
- [ ] `/api/trips` - Trip management
- [ ] `/api/notifications` - Notifications
- [ ] `/api/tcc/hospitals` - Hospitals
- [ ] `/api/tcc/agencies` - Agencies
- [ ] `/api/tcc/facilities` - Facilities
- [ ] `/api/tcc/analytics` - Analytics

---

### Frontend UI Testing (Manual)

#### Core Functionality Tests

**1. Trip Creation:**
- [ ] Navigate to TCC Command → Operations → Trip Management → Create Trip
- [ ] Verify form loads correctly
- [ ] Verify dropdown options populate (transport level, urgency, etc.)
- [ ] Verify pickup locations dropdown works
- [ ] Create a new transport request
- [ ] Verify trip is created successfully
- [ ] Verify trip appears in trip list
- [ ] Verify no console errors
- [ ] Verify no 500 errors

**2. Dispatch:**
- [ ] Verify dispatch functionality works
- [ ] Verify agencies receive trip notifications
- [ ] Verify trip assignment works at agency level
- [ ] Verify agency responses are recorded
- [ ] Verify no unit-related errors

**3. EMS Acceptance:**
- [ ] Verify EMS agencies can accept trips
- [ ] Verify trip acceptance works without unit assignment
- [ ] Verify trip status updates correctly
- [ ] Verify acceptance flow completes successfully

**4. Healthcare Features:**
- [ ] Verify healthcare locations load
- [ ] Verify healthcare agencies load
- [ ] Verify healthcare destinations load
- [ ] Verify healthcare sub-users functionality

**5. General Functionality:**
- [ ] Verify TCC Home page loads correctly
- [ ] Verify all menu items work (except Units Management)
- [ ] Verify no console errors
- [ ] Verify no 500 errors
- [ ] Verify dropdown options work in all forms
- [ ] Verify pickup locations work in trip creation

---

## Backend Verification Steps

### Step 1: Check Azure Portal

**App Service Status:**
1. Go to Azure Portal → `TraccEms-Dev-Backend`
2. Check **Overview** → Status should be "Running"
3. Check **Overview** → **Status** (should be green)

**Log Stream:**
1. Go to **Log stream** in left menu
2. Look for:
   - ✅ `TCC Backend server running on port...`
   - ✅ `Database connection successful`
   - ❌ `Database connection failed` (if error)
   - ❌ `Error:` (any error messages)
   - ❌ Stack traces

**Environment Variables:**
1. Go to **Configuration** → **Application settings**
2. Verify:
   - ✅ `DATABASE_URL` is set
   - ✅ `NODE_ENV` is set
   - ✅ `FRONTEND_URL` is set
   - ✅ `PORT` is set (usually 8080 for Azure)

### Step 2: Test Backend Endpoints

**Once backend is responding:**

```bash
# Health check
curl https://dev-api.traccems.com/health

# Test new routes (should return 401 without auth, but route should exist)
curl -I https://dev-api.traccems.com/api/agency-responses
curl -I https://dev-api.traccems.com/api/dropdown-options
curl -I https://dev-api.traccems.com/api/dropdown-categories
curl -I https://dev-api.traccems.com/api/tcc/pickup-locations
curl -I https://dev-api.traccems.com/api/healthcare/locations
```

**Expected:**
- Health endpoint: `200 OK` with JSON response
- Other endpoints: `401 Unauthorized` (route exists, needs auth) or `404 Not Found` (route doesn't exist)

---

## Frontend Verification Steps

### Step 1: Check Frontend Deployment

**URL:** `https://dev-swa.traccems.com`

**Verify:**
- [ ] Frontend loads without errors
- [ ] No console errors in browser
- [ ] Login page works
- [ ] Can navigate to different pages

### Step 2: Test Core Features

**After Backend is Responding:**
- [ ] Login works
- [ ] Trip creation form loads
- [ ] Dropdown options populate
- [ ] Can create trips
- [ ] Dispatch works
- [ ] EMS acceptance works

---

## Troubleshooting

### If Backend is Not Responding

**Check Azure Logs:**
1. Azure Portal → TraccEms-Dev-Backend → Log stream
2. Look for startup errors
3. Check for database connection errors
4. Check for missing environment variables

**Common Issues:**
- **Database connection failed:** Check DATABASE_URL and firewall rules
- **Missing environment variables:** Check Configuration → Application settings
- **Application error:** Check Log stream for stack traces
- **Port binding issue:** Azure uses PORT environment variable (usually 8080)

**Restart App Service:**
1. Azure Portal → TraccEms-Dev-Backend
2. Click **Restart** button
3. Wait for restart to complete
4. Check Log stream for startup messages

---

## Test Results

### Backend API Tests
- **Status:** ⚠️ Backend timeout - needs investigation
- **Health Endpoint:** ⏳ Not responding
- **New Routes:** ⏳ Cannot test until backend responds

### Frontend UI Tests
- **Status:** ⏳ Awaiting user testing
- **Core Functionality:** ⏳ Pending

---

## Next Steps

1. ⏳ **Investigate backend timeout** - Check Azure Portal logs
2. ⏳ **Fix backend issue** if found
3. ⏳ **Retest backend endpoints** once responding
4. ⏳ **Complete UI testing** - User will test core functionality
5. ⏳ **Document test results** - Update this checklist

---

**Last Updated:** January 5, 2026  
**Status:** ⏳ Testing in progress - Backend timeout needs investigation

