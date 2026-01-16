# CORS and 503 Error Analysis - January 5, 2026
**Status:** 🔴 **CRITICAL ISSUE** - Backend returning 503 with missing CORS headers

---

## Problem Summary

**Symptoms:**
- Login attempts timing out (30 second timeout)
- CORS errors: "CORS header 'Access-Control-Allow-Origin' missing"
- Backend returning HTTP 503 (Service Unavailable)
- Network errors after CORS failures

**Root Cause Analysis:**
The backend is responding (503 status), but CORS headers are missing. This suggests:
1. Backend is running but unhealthy (database connection failing)
2. Error responses may be bypassing CORS middleware
3. Or error handling is preventing CORS headers from being added

---

## Technical Analysis

### Health Check Endpoint Behavior

**Code Location:** `backend/src/index.ts` lines 91-115

**Current Behavior:**
```typescript
app.get('/health', async (req, res) => {
  try {
    const isHealthy = await databaseManager.healthCheck();
    
    if (isHealthy) {
      res.json({ status: 'healthy', ... });
    } else {
      res.status(503).json({ status: 'unhealthy', ... });
    }
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: ... });
  }
});
```

**Issue:**
- When database connection fails, health check returns 503
- CORS middleware should still add headers, but they're missing
- This suggests the error might be happening before CORS middleware runs
- Or there's an unhandled error preventing CORS headers

### CORS Configuration

**Code Location:** `backend/src/index.ts` lines 53-75

**Current Configuration:**
- CORS middleware is applied before routes (correct order)
- Includes `https://dev-swa.traccems.com` in allowed origins
- Should add headers to all responses, including errors

**Potential Issue:**
- If an error occurs during request processing before reaching CORS middleware
- Or if error handler doesn't preserve CORS headers
- Or if there's an unhandled exception

---

## Possible Causes

### 1. Database Connection Failure ⚠️ **MOST LIKELY**

**Symptom:** Health check returns 503
**Cause:** Database connection failing
**Impact:** Backend is unhealthy but still running
**Fix:** Check DATABASE_URL and database connectivity

### 2. Error Handler Bypassing CORS ⚠️ **POSSIBLE**

**Symptom:** 503 responses missing CORS headers
**Cause:** Error handler might not preserve CORS headers
**Impact:** Frontend can't read error responses
**Fix:** Ensure error handler runs after CORS middleware

### 3. Unhandled Exception ⚠️ **POSSIBLE**

**Symptom:** Server crashes or errors before CORS headers added
**Cause:** Unhandled error in route handler or middleware
**Impact:** No response headers at all
**Fix:** Check Azure logs for unhandled exceptions

### 4. Helmet Blocking CORS ⚠️ **UNLIKELY**

**Symptom:** CORS headers not being sent
**Cause:** Helmet security headers conflicting with CORS
**Impact:** CORS headers blocked by security policy
**Fix:** Configure Helmet to allow CORS headers

---

## Investigation Steps

### Step 1: Check Azure Portal Logs

**Location:** Azure Portal → TraccEms-Dev-Backend → Log stream

**Look for:**
- ✅ `TCC Backend server running on port...` (server started)
- ❌ `Database connection failed` (database issue)
- ❌ `Error:` (any errors)
- ❌ Stack traces (unhandled exceptions)
- ❌ `Failed to start server` (startup failure)

### Step 2: Check Environment Variables

**Location:** Azure Portal → TraccEms-Dev-Backend → Configuration → Application settings

**Verify:**
- ✅ `DATABASE_URL` is set correctly
- ✅ `NODE_ENV` is set
- ✅ `FRONTEND_URL` includes `https://dev-swa.traccems.com`
- ✅ `CORS_ORIGIN` includes `https://dev-swa.traccems.com` (if set)

### Step 3: Check Database Connectivity

**Test Database Connection:**
```bash
# From Azure Portal → TraccEms-Dev-Backend → Console
# Or use Azure CLI
az webapp log tail --name TraccEms-Dev-Backend --resource-group TraccEms-Dev-USCentral
```

**Look for:**
- Database connection errors
- Connection timeout errors
- Authentication failures

---

## Potential Fixes

### Fix 1: Ensure CORS Headers on Error Responses

**Issue:** Error responses might not include CORS headers
**Solution:** Ensure error handler runs after CORS middleware

**Code Change Needed:**
- Verify error handler order in `index.ts`
- Ensure CORS middleware is before error handler
- Test that error responses include CORS headers

### Fix 2: Fix Database Connection

**Issue:** Database connection failing, causing 503
**Solution:** Fix DATABASE_URL or database connectivity

**Steps:**
1. Verify DATABASE_URL in Azure Portal
2. Check database firewall rules
3. Verify database is running
4. Test database connection

### Fix 3: Add CORS to Error Handler

**Issue:** Error handler might not preserve CORS headers
**Solution:** Explicitly add CORS headers in error handler

**Code Change:**
```typescript
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Ensure CORS headers are set even on errors
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});
```

### Fix 4: Configure Helmet for CORS

**Issue:** Helmet might be blocking CORS headers
**Solution:** Configure Helmet to allow CORS

**Code Change:**
```typescript
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
```

---

## Immediate Actions

1. ⏳ **Check Azure Logs** - Identify root cause
2. ⏳ **Verify DATABASE_URL** - Ensure database connection string is correct
3. ⏳ **Check Database Status** - Verify database is running and accessible
4. ⏳ **Test Database Connection** - Verify connectivity from Azure
5. ⏳ **Fix CORS if needed** - Add explicit CORS headers to error handler

---

## Testing After Fix

**Once backend is responding:**
1. Test health endpoint: `https://dev-api.traccems.com/health`
2. Test login endpoint: `https://dev-api.traccems.com/api/auth/login`
3. Verify CORS headers are present in responses
4. Test login from frontend: `https://dev-swa.traccems.com`

---

**Last Updated:** January 5, 2026  
**Status:** 🔴 **CRITICAL** - Backend unhealthy, CORS headers missing

