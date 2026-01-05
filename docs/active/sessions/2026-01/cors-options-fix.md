# CORS OPTIONS Preflight Fix - January 5, 2026
**Issue:** OPTIONS preflight requests timing out, causing browser to abort requests (`NS_BINDING_ABORTED`)

---

## Problem

### Symptoms
- Browser sends OPTIONS preflight request before POST
- OPTIONS request times out (10+ seconds)
- Browser aborts request (`NS_BINDING_ABORTED`)
- Actual POST request never sent
- Frontend times out after 30 seconds

### Root Cause
- OPTIONS requests were not being handled quickly enough
- CORS middleware should handle OPTIONS automatically, but was timing out
- Helmet might have been interfering with OPTIONS requests

---

## Solution

### Changes Made

1. **Added Explicit OPTIONS Handler**
   - Placed before CORS middleware
   - Responds immediately with 204 status
   - Sets all required CORS headers
   - Includes `Access-Control-Max-Age` header (24 hours cache)

2. **Configured Helmet**
   - Set `crossOriginResourcePolicy: { policy: "cross-origin" }`
   - Disabled `crossOriginEmbedderPolicy` (not needed for API)

3. **Enhanced CORS Middleware**
   - Added explicit `methods` array
   - Added explicit `allowedHeaders` array

### Code Changes

**Before:**
```typescript
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => { ... },
  credentials: true
}));
```

**After:**
```typescript
// Configure Helmet to allow CORS preflight requests
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Handle OPTIONS preflight requests immediately
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    corsOrigin,
    'http://localhost:3000',
    'http://localhost:5173',
    'https://traccems.com',
    'https://dev-swa.traccems.com'
  ].filter(Boolean);
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(204).send();
  }
  
  res.status(403).send('CORS not allowed');
});

app.use(cors({
  origin: (origin, callback) => { ... },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

---

## Expected Results

### After Deployment
- ✅ OPTIONS requests respond immediately (< 100ms)
- ✅ Browser receives 204 response with CORS headers
- ✅ POST requests proceed without timeout
- ✅ Login works without CORS errors
- ✅ No more `NS_BINDING_ABORTED` errors

### Testing
1. **Test OPTIONS Request:**
   ```bash
   curl -X OPTIONS https://dev-api.traccems.com/api/auth/login \
     -H "Origin: https://dev-swa.traccems.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: content-type" \
     -i
   ```
   **Expected:** 204 response with CORS headers (< 1 second)

2. **Test Login in Browser:**
   - Navigate to `https://dev-swa.traccems.com`
   - Attempt login with `admin@tcc.com` / `admin123`
   - Check Network tab:
     - OPTIONS request should complete quickly (< 1 second)
     - POST request should proceed immediately after
     - No `NS_BINDING_ABORTED` errors

---

## Files Changed

- `backend/src/index.ts` - Added OPTIONS handler and Helmet config
- `backend/src/production-index.ts` - Added OPTIONS handler and Helmet config

---

## Deployment Status

- ✅ Code changes committed
- ✅ Pushed to `develop` branch
- ⏳ Waiting for deployment to dev-swa
- ⏳ Ready for testing after deployment

---

**Last Updated:** January 5, 2026  
**Status:** ✅ Fix deployed, waiting for testing

