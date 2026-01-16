# Post-Deployment Testing Guide - January 5, 2026
**Status:** ⏳ Waiting for CORS fix deployment to complete

---

## Deployment Status

### ✅ Completed
- Frontend: Deployed successfully
- Backend Deployment 1 (`d501a70`): Completed successfully

### ⏳ In Progress
- Backend Deployment 2 (`bfde175`): Running (contains CORS fix)

---

## Testing Plan (After Deployment 2 Completes)

### Phase 1: Backend Health Check

**1. Test Health Endpoint:**
```bash
curl https://dev-api.traccems.com/health
```

**Expected Results:**
- ✅ **If healthy:** `{"status":"healthy","database":"connected"}`
- ⚠️ **If unhealthy:** `{"status":"unhealthy","database":"disconnected"}` (but WITH CORS headers now)
- ✅ **CORS headers present:** `Access-Control-Allow-Origin` header should be present

**2. Test Root Endpoint:**
```bash
curl https://dev-api.traccems.com/
```

**Expected:** JSON response with API information

---

### Phase 2: CORS Verification

**Test CORS Headers:**
```bash
curl -I -H "Origin: https://dev-swa.traccems.com" https://dev-api.traccems.com/health
```

**Expected:**
- `Access-Control-Allow-Origin: https://dev-swa.traccems.com`
- `Access-Control-Allow-Credentials: true`

**If CORS headers are missing:**
- Check Azure logs for errors
- Verify CORS middleware is running
- Check if error handler is bypassing CORS

---

### Phase 3: Login Testing (UI)

**Test Login Flow:**
1. Navigate to: `https://dev-swa.traccems.com`
2. Attempt login with credentials:
   - `admin@tcc.com` / `admin123`
   - `chuck@ferrellhospitals.com` / `testpassword`

**Expected Results:**

**If Database Connection Fixed:**
- ✅ Login succeeds
- ✅ No CORS errors
- ✅ No 503 errors
- ✅ User redirected to dashboard

**If Database Connection Still Failing:**
- ⚠️ Login fails (expected)
- ✅ **BUT:** Should see actual error message (not CORS error)
- ✅ CORS headers present in error response
- ✅ Frontend can read error message

---

### Phase 4: Core Functionality Testing

**After Login Works:**

**1. Trip Creation:**
- Navigate to: TCC Command → Operations → Trip Management → Create Trip
- Verify form loads
- Verify dropdown options populate
- Verify pickup locations work
- Create a test trip
- Verify trip appears in list

**2. Dispatch:**
- Verify dispatch functionality
- Verify agencies receive notifications
- Verify agency responses work

**3. EMS Acceptance:**
- Verify EMS agencies can accept trips
- Verify trip status updates
- Verify acceptance flow works

---

## Troubleshooting

### If CORS Errors Persist

**Check:**
1. Verify deployment completed successfully
2. Check Azure logs for CORS middleware errors
3. Verify `https://dev-swa.traccems.com` is in allowed origins
4. Test with browser dev tools (Network tab → check response headers)

**Fix:**
- If CORS headers still missing, may need to restart Azure App Service
- Or check if error is happening before CORS middleware runs

### If 503 Errors Persist

**Check:**
1. Azure Portal → TraccEms-Dev-Backend → Log stream
2. Look for database connection errors
3. Verify DATABASE_URL is set correctly
4. Check database firewall rules

**Fix:**
- Fix DATABASE_URL if incorrect
- Add Azure App Service IP to database firewall
- Or enable "Allow Azure services" in database firewall

### If Login Still Fails

**Check:**
1. Verify error message (should be readable now with CORS fix)
2. Check if it's a database connection error
3. Check if it's an authentication error
4. Verify user exists in database

**Fix:**
- Fix database connection if that's the issue
- Verify user credentials
- Check if user exists in dev-swa database

---

## Success Criteria

### Backend Health:
- [ ] Health endpoint responds (even if 503, should have CORS headers)
- [ ] CORS headers present in all responses
- [ ] No CORS errors in browser console
- [ ] Error messages are readable (not blocked by CORS)

### Login:
- [ ] Login works (if database connection fixed)
- [ ] OR: Error message is readable (if database connection still failing)
- [ ] No CORS errors
- [ ] No 503 errors (or 503 errors have CORS headers)

### Core Functionality:
- [ ] Trip creation works
- [ ] Dispatch works
- [ ] EMS acceptance works
- [ ] All API routes accessible

---

**Last Updated:** January 5, 2026  
**Status:** ⏳ Waiting for CORS fix deployment to complete

