# Units Management 500 Error - Production

**Date:** January 4, 2026  
**Severity:** High  
**Status:** ✅ **FIXED** - Root cause identified and fix implemented  
**Environment:** Production (`traccems.com`)  
**Branch:** `bugfix/units-management-500-error`

---

## Issue Summary

Units Management page in TCC Command → EMS → Units Management is failing with a 500 Internal Server Error in production. The same page works correctly in local dev and dev-swa environments.

**Error Message:**
```
Request failed with status code 500
```

**Location:**
- Frontend: `TCCUnitsManagement.tsx` component
- Backend: `/api/tcc/units` endpoint

---

## Reproduction Steps

1. Navigate to `https://traccems.com`
2. Login as TCC Admin user
3. Navigate to: TCC Command → EMS → Units Management
4. **Result:** 500 error displayed, page fails to load

**Expected Behavior:**
- Page should load and display all EMS units across agencies
- Should show statistics (Total Units, Available, Committed, Out of Service)
- Should show filters and units table

---

## API Calls Made

The `TCCUnitsManagement` component makes two API calls:

1. **GET `/api/tcc/agencies`**
   - Fetches all EMS agencies for the filter dropdown
   - Route: `backend/src/routes/agencies.ts` (line 36)
   - Authentication: Currently disabled (line 30 commented out)

2. **GET `/api/tcc/units`**
   - Fetches all units from all agencies
   - Route: `backend/src/routes/tccUnits.ts` (line 12)
   - Authentication: Required (`authenticateAdmin` middleware)

---

## Code Analysis

### Frontend Component
**File:** `frontend/src/components/TCCUnitsManagement.tsx`

```typescript
// Line 93: Fetch agencies
const agenciesResponse = await api.get('/api/tcc/agencies');

// Line 107: Fetch units
const unitsResponse = await api.get('/api/tcc/units');
```

### Backend Endpoint
**File:** `backend/src/routes/tccUnits.ts`

```typescript
router.get('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const emsDB = databaseManager.getPrismaClient();
    
    const units = await emsDB.unit.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: units
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve units',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
```

---

## Root Cause Identified ✅

**Issue:** Production backend (`production-index.ts`) was using `productionUnitRoutes` from `productionUnits.ts`, which is an incomplete/stub implementation that just returns empty arrays. The dev/dev-swa environments use `tccUnitRoutes` from `tccUnits.ts`, which has the full implementation.

**Fix Applied:**
- Updated `production-index.ts` to use `tccUnitRoutes` instead of `productionUnitRoutes`
- Added missing `unitRoutes` import for `/api/units` endpoint
- Production now uses the same route handlers as dev/dev-swa

**Files Changed:**
- `backend/src/production-index.ts`:
  - Changed import from `productionUnitRoutes` to `tccUnitRoutes`
  - Added `unitRoutes` import
  - Updated route registration to use `tccUnitRoutes` for `/api/tcc/units`

## Potential Root Causes (Historical - Before Fix)

### 1. Authentication Middleware Issue
- **Hypothesis:** `authenticateAdmin` middleware might be failing in production
- **Evidence:** Works in dev/dev-swa, fails in production
- **Check:** Verify JWT token validation, user session, admin permissions

### 2. Database Schema Mismatch
- **Hypothesis:** Production database might have different schema than dev/dev-swa
- **Evidence:** Prisma query might be failing due to missing columns or different structure
- **Check:** Compare production schema with dev-swa schema for `units` table

### 3. Database Connection Issue
- **Hypothesis:** Database connection might be failing or timing out in production
- **Evidence:** 500 error suggests server-side failure
- **Check:** Verify database connection health in production

### 4. Missing Columns or Relations
- **Hypothesis:** Production database might be missing columns that Prisma expects
- **Evidence:** Similar to EMS registration `addedBy`/`addedAt` issue
- **Check:** Verify all columns exist in production `units` table

### 5. Error in Error Handling
- **Hypothesis:** The error handling itself might be throwing an error
- **Evidence:** 500 error but no specific error message visible
- **Check:** Review error handling code, ensure proper error serialization

---

## Investigation Steps

### Step 1: Check Production Backend Logs
- [ ] Access Azure App Service logs for production backend
- [ ] Look for error messages around `/api/tcc/units` endpoint
- [ ] Check for Prisma errors, database connection errors, authentication errors

### Step 2: Compare Database Schemas
- [ ] Check production database schema for `units` table
- [ ] Compare with dev-swa database schema
- [ ] Verify all columns match Prisma schema definition

### Step 3: Test Authentication
- [ ] Verify admin user authentication works in production
- [ ] Check if JWT token is valid
- [ ] Verify `authenticateAdmin` middleware is working

### Step 4: Add Enhanced Error Logging
- [ ] Add more detailed error logging to the endpoint
- [ ] Log authentication status, database connection status
- [ ] Log Prisma query details

---

## Comparison with Working Endpoints

### Agencies Endpoint (Works)
- **Route:** `/api/tcc/agencies`
- **Authentication:** Disabled (commented out)
- **Status:** ✅ Working in production

### Units Endpoint (Fails)
- **Route:** `/api/tcc/units`
- **Authentication:** Required (`authenticateAdmin`)
- **Status:** ❌ Failing in production

**Key Difference:** Authentication requirement

---

## Files Involved

- `frontend/src/components/TCCUnitsManagement.tsx` - Frontend component
- `backend/src/routes/tccUnits.ts` - Backend endpoint
- `backend/src/middleware/authenticateAdmin.ts` - Authentication middleware
- `backend/src/services/databaseManager.ts` - Database connection manager
- `backend/prisma/schema.prisma` - Database schema (Unit model)

---

## Next Steps

1. ✅ Created bugfix branch: `bugfix/units-management-500-error`
2. ⏳ Investigate production backend logs
3. ⏳ Compare production vs dev-swa database schemas
4. ⏳ Add enhanced error logging if needed
5. ⏳ Implement fix
6. ⏳ Test fix locally
7. ⏳ Test fix in dev-swa
8. ⏳ Deploy to production

---

**Reported By:** Production Testing - January 4, 2026  
**Priority:** High - Blocks Units Management functionality  
**Assigned To:** Bugfix branch

