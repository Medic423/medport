# Local Dev Available Agencies Fix Plan

**Date:** January 10, 2026  
**Issue:** Local dev shows "Failed to load available agencies" error in Healthcare → Available Agencies tab  
**Status:** 🔍 Diagnosis Complete - Ready for Fix

---

## Problem Summary

The Healthcare Dashboard → Available Agencies tab works correctly on dev-swa (`https://dev-swa.traccems.com`) but fails on local dev (`http://localhost:3000`) with error: **"Failed to load available agencies"**.

---

## Root Cause Analysis

### Code Flow
1. **Frontend:** `AvailableAgencies.tsx` calls `healthcareAgenciesAPI.getAvailable(params)`
2. **API:** Makes GET request to `/api/healthcare/agencies/available`
3. **Backend Route:** `backend/src/routes/healthcareAgencies.ts` → `/available` endpoint
4. **Service:** Calls `healthcareAgencyService.getAvailableAgenciesForHealthcareUser()`

### Potential Issues Identified

#### ✅ Issue #1: Missing Database Migration (MOST LIKELY)
**Location:** `backend/src/services/healthcareAgencyService.ts:412`
- The service filters agencies by `availabilityStatus.isAvailable === true`
- If the `availabilityStatus` column doesn't exist in local database, Prisma will return `null` for all agencies
- All agencies get filtered out → empty array returned → no error, but shows "No Available Agencies"

**Check:**
```sql
-- Run in local database
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ems_agencies' 
  AND column_name = 'availabilityStatus';
```

**Expected:** Column should exist with type `jsonb`  
**If Missing:** Migration `20251204130000_add_ems_agency_availability_status` not applied

---

#### ✅ Issue #2: Dynamic Import Failure
**Location:** `backend/src/services/healthcareAgencyService.ts:367`
```typescript
const { DistanceService } = await import('./distanceService');
```
- If this import fails, the entire method throws an error
- Error gets caught by route handler → returns 500 with "Failed to retrieve available agencies"

**Check:** Backend logs should show import errors if this is the issue

---

#### ✅ Issue #3: No Healthcare Location
**Location:** `backend/src/services/healthcareAgencyService.ts:370-383`
- Method tries to find healthcare user's primary location
- If no location exists, `primaryLocation` is `null`
- Distance calculation is skipped (distance = null for all agencies)
- **This is OK** - agencies still returned, just without distance

**Impact:** Low - doesn't cause failure, just no distance shown

---

#### ✅ Issue #4: No Agencies Marked as Available
**Location:** `backend/src/services/healthcareAgencyService.ts:410-425`
- Service filters to only agencies where `availabilityStatus.isAvailable === true`
- If no agencies have this set to `true`, empty array returned
- **This is expected behavior** - should show "No Available Agencies" message, not error

**Check:**
```sql
-- Check if any agencies have isAvailable = true
SELECT id, name, "availabilityStatus"
FROM ems_agencies
WHERE "availabilityStatus"->>'isAvailable' = 'true';
```

---

#### ✅ Issue #5: Error in Route Handler
**Location:** `backend/src/routes/healthcareAgencies.ts:52-58`
- If service method throws error, route handler catches it and returns 500
- Frontend receives `{ success: false, error: "Failed to retrieve available agencies" }`
- Frontend displays this error message

**Check:** Backend console logs should show the actual error

---

## Diagnostic Steps

### Step 1: Check Backend Logs
```bash
# Check backend console for errors when loading Available Agencies
# Look for:
# - "Get available healthcare agencies error:"
# - "Error parsing availabilityStatus:"
# - "Error calculating distance:"
# - Module import errors
```

### Step 2: Verify Database Migration
```bash
cd backend
npx prisma migrate status
# Should show migration 20251204130000_add_ems_agency_availability_status as applied
```

### Step 3: Check Database Schema
```sql
-- Connect to local database and run:
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ems_agencies'
  AND column_name = 'availabilityStatus';
```

### Step 4: Test API Endpoint Directly
```bash
# With authentication token
curl -X GET "http://localhost:5001/api/healthcare/agencies/available" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Step 5: Check for Available Agencies
```sql
-- Check if any agencies exist and their availability status
SELECT 
  id, 
  name, 
  "isActive",
  "availabilityStatus",
  CASE 
    WHEN "availabilityStatus" IS NULL THEN 'NULL'
    WHEN ("availabilityStatus"->>'isAvailable')::boolean = true THEN 'AVAILABLE'
    ELSE 'NOT_AVAILABLE'
  END as availability_state
FROM ems_agencies
WHERE "isActive" = true
LIMIT 10;
```

---

## Fix Plan

### Fix #1: Apply Missing Migration (If Needed)

**If migration is missing:**

```bash
cd backend

# Option A: Apply specific migration
npx prisma migrate resolve --applied 20251204130000_add_ems_agency_availability_status

# Option B: Run all pending migrations
npx prisma migrate deploy

# Option C: Manually apply SQL (if migration file exists)
# Run the SQL from: backend/prisma/migrations/20251204130000_add_ems_agency_availability_status/migration.sql
```

**SQL to apply manually if needed:**
```sql
ALTER TABLE "ems_agencies" 
ADD COLUMN IF NOT EXISTS "availabilityStatus" JSONB DEFAULT '{"isAvailable":false,"availableLevels":[]}';

COMMENT ON COLUMN "ems_agencies"."availabilityStatus" IS 'Agency-level availability status for EMS agencies. Stores isAvailable boolean and availableLevels array (BLS/ALS). Completely isolated from HealthcareAgencyPreference and Unit models.';
```

---

### Fix #2: Improve Error Handling (Recommended)

**File:** `backend/src/services/healthcareAgencyService.ts`

**Current Issue:** Dynamic import could fail silently or throw unclear errors

**Fix:** Add better error handling and logging

```typescript
async getAvailableAgenciesForHealthcareUser(
  healthcareUserId: string,
  radiusMiles?: number | null
): Promise<any[]> {
  const prisma = databaseManager.getPrismaClient();
  
  try {
    // Import DistanceService with better error handling
    let DistanceService;
    try {
      const distanceModule = await import('./distanceService');
      DistanceService = distanceModule.DistanceService;
    } catch (importError) {
      console.error('Failed to import DistanceService:', importError);
      throw new Error('Distance calculation service unavailable');
    }

    // Get healthcare user's primary location (or first active location)
    const primaryLocation = await prisma.healthcareLocation.findFirst({
      where: {
        healthcareUserId: healthcareUserId,
        isActive: true,
        OR: [
          { isPrimary: true },
          { isPrimary: false }
        ]
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    if (!primaryLocation) {
      console.warn(`No healthcare location found for user ${healthcareUserId} - distance calculation will be skipped`);
    }

    // Get all agencies: both registered agencies (with EMS accounts) and user-added agencies
    const agencies = await prisma.eMSAgency.findMany({
      where: {
        OR: [
          { addedBy: null }, // Registered agencies with EMS accounts
          { addedBy: healthcareUserId } // Agencies manually added by this healthcare user
        ],
        isActive: true,
      },
      include: {
        healthcarePreferences: {
          where: {
            healthcareUserId: healthcareUserId,
          },
          select: {
            isPreferred: true,
          },
        },
      },
    });

    console.log(`Found ${agencies.length} total agencies for healthcare user ${healthcareUserId}`);

    // Filter to only available agencies, calculate distances, and transform
    const availableAgenciesWithDistance = agencies
      .filter((agency: any) => {
        // Check if agency has availabilityStatus and isAvailable is true
        if (!agency.availabilityStatus) {
          console.debug(`Agency ${agency.id} (${agency.name}) has no availabilityStatus`);
          return false;
        }
        
        try {
          const status = typeof agency.availabilityStatus === 'string'
            ? JSON.parse(agency.availabilityStatus)
            : agency.availabilityStatus;
          
          const isAvailable = status.isAvailable === true;
          console.debug(`Agency ${agency.id} (${agency.name}) availability: ${isAvailable}`);
          return isAvailable;
        } catch (error) {
          console.error(`Error parsing availabilityStatus for agency ${agency.id}:`, error);
          return false;
        }
      })
      .map((agency: any) => {
        // ... rest of the mapping logic stays the same
      })
      // ... rest of the method stays the same

    console.log(`Returning ${availableAgenciesWithDistance.length} available agencies`);
    return availableAgenciesWithDistance;
    
  } catch (error) {
    console.error('Error in getAvailableAgenciesForHealthcareUser:', error);
    throw error; // Re-throw to be caught by route handler
  }
}
```

---

### Fix #3: Add Better Frontend Error Display

**File:** `frontend/src/components/AvailableAgencies.tsx`

**Current:** Generic error message "Failed to load available agencies"

**Fix:** Show more detailed error information for debugging

```typescript
const loadAvailableAgencies = async (radius?: number | null) => {
  try {
    setLoading(true);
    setError(null);
    const params = radius !== undefined ? { radius: radius === null ? 'all' : radius.toString() } : {};
    const response = await healthcareAgenciesAPI.getAvailable(params);
    
    if (response.data?.success && Array.isArray(response.data.data)) {
      setAgencies(response.data.data);
      setCurrentRadius(response.data.radiusMiles ?? radiusMiles);
    } else {
      throw new Error('Invalid response format');
    }
  } catch (err: any) {
    console.error('Error loading available agencies:', err);
    
    // More detailed error message
    let errorMessage = 'Failed to load available agencies';
    if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else if (err.response?.status === 500) {
      errorMessage = 'Server error: Please check backend logs';
    } else if (err.response?.status === 403) {
      errorMessage = 'Access denied: Healthcare users only';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    setAgencies([]);
  } finally {
    setLoading(false);
  }
};
```

---

## Testing Plan

### Test 1: Verify Migration Applied
- [ ] Check migration status
- [ ] Verify `availabilityStatus` column exists
- [ ] Verify default values are set

### Test 2: Test with No Available Agencies
- [ ] Ensure no agencies have `isAvailable: true`
- [ ] Load Available Agencies tab
- [ ] Should show "No Available Agencies" message (not error)

### Test 3: Test with Available Agencies
- [ ] Set at least one agency's `availabilityStatus.isAvailable = true`
- [ ] Load Available Agencies tab
- [ ] Should display the available agency(ies)

### Test 4: Test Distance Calculation
- [ ] Ensure healthcare user has a location with coordinates
- [ ] Ensure agency has coordinates
- [ ] Verify distance is calculated and displayed

### Test 5: Test Error Handling
- [ ] Check backend logs for any errors
- [ ] Verify frontend shows appropriate error messages
- [ ] Test with invalid radius parameter

---

## Comparison: Dev-SWA vs Local Dev

### Dev-SWA (Working ✅)
- Database has `availabilityStatus` column
- Migrations are applied
- Agencies can be marked as available
- Service method works correctly

### Local Dev (Broken ❌)
- **Likely Issue:** Migration not applied → `availabilityStatus` column missing
- **Result:** All agencies filtered out → empty array → error displayed

---

## Quick Fix Checklist

1. [ ] **Check backend logs** for actual error message
2. [ ] **Verify migration status:** `npx prisma migrate status`
3. [ ] **Apply migration if missing:** `npx prisma migrate deploy`
4. [ ] **Verify column exists:** Check database schema
5. [ ] **Test API endpoint:** Direct curl test
6. [ ] **Check for available agencies:** SQL query
7. [ ] **Apply code improvements:** Better error handling
8. [ ] **Test fix:** Load Available Agencies tab
9. [ ] **Verify matches dev-swa:** Compare behavior

---

## Expected Outcome

After fix:
- ✅ Available Agencies tab loads without error
- ✅ Shows "No Available Agencies" if none are marked available (expected behavior)
- ✅ Shows available agencies if any are marked as available
- ✅ Distance calculation works if healthcare location exists
- ✅ Error messages are clear and helpful

---

**Next Steps:**
1. Run diagnostic steps to identify exact issue
2. Apply appropriate fix
3. Test and verify
4. Update checklist document with results
