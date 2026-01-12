# EMS Completed Trips Display Fix
**Date:** January 10, 2026  
**Issue:** Completed trips export to CSV but don't display in the "Completed Trips" UI list  
**Status:** ✅ **FIXED**

---

## Problem Description

When an EMS user completes a trip (e.g., trip 'PPWBCFYJI'), the trip:
- ✅ Exports to CSV correctly
- ❌ Does NOT appear in the "Completed Trips" list in the UI

**User Report:**
> "I'm logged into the EMS Module Elk County EMS on local dev. I completed a trip 'PPWBCFYJI' and it exports to a CSV file but it doesn't display in the UI 'Completed Trips' list."

---

## Root Cause Analysis

### Backend Issue
The `tripService.getTrips()` method filters trips for EMS users by agency, but the filter only includes:
1. PENDING trips (available for acceptance)
2. Trips accepted by the agency (via AgencyResponse)

**Missing:** Completed trips with `emsCompletionTimestamp` set and `assignedAgencyId` matching the agency were NOT included in the filter.

**Location:** `backend/src/services/tripService.ts` lines 248-293

### Frontend Issue
The frontend was filtering completed trips by `emsCompletionTimestamp !== null`, but wasn't verifying that the trip was assigned to the current agency. This could potentially show trips from other agencies if the backend filter wasn't working correctly.

**Location:** `frontend/src/components/EMSDashboard.tsx` lines 402-431

---

## Solution

### 1. Backend Fix (`backend/src/services/tripService.ts`)

**Updated the agency filter to include completed trips:**

```typescript
// Build agency filter - don't override existing OR from healthcare user filter
// EMS users should see:
// 1. PENDING trips (available for acceptance)
// 2. Trips they've accepted (via AgencyResponse)
// 3. Completed trips assigned to this agency (have emsCompletionTimestamp and assignedAgencyId matches)
const agencyFilter: any[] = [{ status: 'PENDING' }];
if (acceptedTripIds.length > 0) {
  agencyFilter.push({ id: { in: acceptedTripIds } });
}
// Include completed trips assigned to this agency
agencyFilter.push({ 
  AND: [
    { emsCompletionTimestamp: { not: null } },
    { assignedAgencyId: filters.agencyId }
  ]
});
```

**What this does:**
- Adds completed trips (with `emsCompletionTimestamp` set) that are assigned to the current EMS agency to the filter
- Ensures EMS users see all their completed trips when querying `/api/trips`

### 2. Frontend Fix (`frontend/src/components/EMSDashboard.tsx`)

**Enhanced filtering and added debug logging:**

```typescript
const currentAgencyId = user.agencyId || user.id;
const transformedCompleted = completedData.data
  .filter((trip: any) => {
    // Filter for trips completed by this EMS agency
    // Must have emsCompletionTimestamp AND be assigned to this agency
    return trip.emsCompletionTimestamp !== null && 
           trip.assignedAgencyId === currentAgencyId;
  })
  .map((trip: any) => ({
    // ... transformation logic
  }));

console.log('TCC_DEBUG: Completed trips filtered:', {
  totalTrips: completedData.data.length,
  withEmsCompletion: completedData.data.filter((t: any) => t.emsCompletionTimestamp !== null).length,
  assignedToAgency: completedData.data.filter((t: any) => t.assignedAgencyId === currentAgencyId).length,
  finalCompletedTrips: transformedCompleted.length,
  agencyId: currentAgencyId
});
```

**Added auto-reload when switching to Completed tab:**

```typescript
onClick={() => {
  console.log('🔍 EMSDashboard: Tab clicked:', tab.id);
  setActiveTab(tab.id);
  // Reload trips when switching to completed tab to ensure fresh data
  if (tab.id === 'completed') {
    console.log('TCC_DEBUG: Switching to completed tab, reloading trips...');
    loadTrips();
  }
}}
```

**What this does:**
- Adds an additional safety check to filter by `assignedAgencyId` on the frontend
- Provides debug logging to help diagnose any future issues
- Automatically reloads trips when switching to the "Completed" tab to ensure fresh data

---

## Testing Checklist

- [ ] Complete a trip as an EMS user
- [ ] Verify the trip appears in the "Completed Trips" list immediately
- [ ] Verify the trip can be exported to CSV
- [ ] Switch to another tab and back to "Completed Trips" - trip should still appear
- [ ] Verify only trips completed by the current agency appear (not other agencies' trips)
- [ ] Check browser console for debug logs showing filtering results

---

## Files Changed

1. `backend/src/services/tripService.ts` - Added completed trips to agency filter
2. `frontend/src/components/EMSDashboard.tsx` - Enhanced filtering and added auto-reload

---

## Notes

- The backend server should auto-reload with `nodemon` - no manual restart needed
- The fix ensures that completed trips are included in the backend query results
- The frontend provides an additional safety filter and better UX with auto-reload
- Debug logging will help diagnose any future issues with trip filtering

---

## Status

✅ **FIXED** - Ready for testing

The changes ensure that:
1. Backend includes completed trips in the agency filter
2. Frontend properly filters and displays completed trips
3. UI automatically refreshes when switching to the Completed tab
4. Debug logging helps diagnose any issues
