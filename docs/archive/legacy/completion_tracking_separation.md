# Completion Tracking Separation Implementation Plan

**Date Created:** November 16, 2025  
**Status:** In Progress  
**Purpose:** Separate Healthcare and EMS completion timestamps to track independent completion events

---

## Problem Statement

Currently, both Healthcare and EMS use the same `completionTimestamp` field, causing conflicts:
- Healthcare completion (patient leaves hospital) overwrites EMS completion (arrives at destination), or vice versa
- Both dashboards show the same timestamp, causing confusion
- Healthcare tracks completion time as a key metric, which is almost always shorter than EMS completion time

**Example Issue:** Trip with Patient PROL134Y1 shows completion time as 12:36:50 for both Healthcare and EMS, when they should be different times.

---

## Requirements Summary

1. **Migration:** Existing `completionTimestamp` → migrate to `healthcareCompletionTimestamp`
2. **Status Logic:**
   - Healthcare marks completed → sets `healthcareCompletionTimestamp` + status = `HEALTHCARE_COMPLETED`
   - EMS marks completed → sets `emsCompletionTimestamp` + status = `COMPLETED` (final state)
3. **Display:** Each dashboard shows only their own completion timestamp
4. **Backward Compatibility:** Keep `completionTimestamp` field
5. **New Status:** Add `HEALTHCARE_COMPLETED` status
6. **Completed Trips Filter:** Healthcare sees trips they've completed even if EMS hasn't completed yet
7. **Display Notes:** No "Awaiting EMS completion" message needed

---

## Implementation Phases

### Phase 1: Database Schema Changes

#### 1.1 Update Prisma Schema

**File:** `backend/prisma/schema.prisma`

Add new fields to `TransportRequest` model:
```prisma
model TransportRequest {
  // ... existing fields ...
  completionTimestamp            DateTime?  // Keep for backward compatibility
  healthcareCompletionTimestamp  DateTime?  // NEW: Healthcare completion (patient leaves hospital)
  emsCompletionTimestamp         DateTime?  // NEW: EMS completion (arrives at destination)
  // ... rest of fields ...
}
```

#### 1.2 Update Status Validation

Add `HEALTHCARE_COMPLETED` to valid status values:
- Valid statuses: `PENDING`, `PENDING_DISPATCH`, `ACCEPTED`, `DECLINED`, `IN_PROGRESS`, `HEALTHCARE_COMPLETED`, `COMPLETED`, `CANCELLED`

**Files to update:**
- `backend/src/routes/trips.ts` - Status validation
- `backend/src/services/tripService.ts` - Status handling

#### 1.3 Create Migration

**Steps:**
1. Add new fields (`healthcareCompletionTimestamp`, `emsCompletionTimestamp`)
2. Migrate existing `completionTimestamp` → `healthcareCompletionTimestamp`
3. Update status validation to include `HEALTHCARE_COMPLETED`
4. Run migration: `npx prisma migrate dev --name add_separate_completion_timestamps`

**Migration SQL (example):**
```sql
-- Add new fields
ALTER TABLE transport_requests 
ADD COLUMN healthcare_completion_timestamp TIMESTAMP,
ADD COLUMN ems_completion_timestamp TIMESTAMP;

-- Migrate existing data
UPDATE transport_requests 
SET healthcare_completion_timestamp = completion_timestamp 
WHERE completion_timestamp IS NOT NULL;
```

---

### Phase 2: Backend Changes

#### 2.1 Update TypeScript Interfaces

**File:** `backend/src/services/tripService.ts`

Update `UpdateTripStatusRequest` interface:
```typescript
export interface UpdateTripStatusRequest {
  // ... existing fields ...
  completionTimestamp?: string;  // Keep for backward compatibility
  healthcareCompletionTimestamp?: string;  // NEW
  emsCompletionTimestamp?: string;  // NEW
  // ... rest of fields ...
}
```

#### 2.2 Update Route Handler

**File:** `backend/src/routes/trips.ts`

Update status validation:
```typescript
const validStatuses = [
  'PENDING', 
  'PENDING_DISPATCH', 
  'ACCEPTED', 
  'DECLINED', 
  'IN_PROGRESS', 
  'HEALTHCARE_COMPLETED',  // NEW
  'COMPLETED', 
  'CANCELLED'
];
```

Add new fields to request body destructuring:
```typescript
const {
  status,
  // ... existing fields ...
  completionTimestamp,
  healthcareCompletionTimestamp,  // NEW
  emsCompletionTimestamp,  // NEW
  // ... rest of fields ...
} = req.body;
```

#### 2.3 Update `tripService.updateTripStatus()`

**File:** `backend/src/services/tripService.ts`

**User Type Detection Options:**
1. Pass user type from frontend in request body
2. Detect from JWT token/user object in backend (recommended)
3. Check user type from authenticated request context

**Implementation Logic:**
```typescript
async updateTripStatus(id: string, data: UpdateTripStatusRequest, userType?: string) {
  // Detect user type from request context or pass as parameter
  // If not provided, try to infer from user object in request
  
  const updateData: any = {
    updatedAt: new Date()
  };

  // Handle completion based on user type
  if (userType === 'HEALTHCARE' && data.status === 'HEALTHCARE_COMPLETED') {
    // Healthcare completion
    updateData.healthcareCompletionTimestamp = new Date();
    updateData.status = 'HEALTHCARE_COMPLETED';
  } else if (userType === 'EMS' && data.status === 'COMPLETED') {
    // EMS completion (final state)
    updateData.emsCompletionTimestamp = new Date();
    updateData.status = 'COMPLETED';
  } else {
    // Other status updates
    updateData.status = data.status;
  }

  // Handle other timestamp fields (pickupTimestamp, etc.)
  if (data.pickupTimestamp) {
    updateData.pickupTimestamp = new Date(data.pickupTimestamp);
  }
  // ... other timestamp handling ...

  // Handle new completion timestamp fields
  if (data.healthcareCompletionTimestamp) {
    updateData.healthcareCompletionTimestamp = new Date(data.healthcareCompletionTimestamp);
  }
  if (data.emsCompletionTimestamp) {
    updateData.emsCompletionTimestamp = new Date(data.emsCompletionTimestamp);
  }

  // Update the trip
  const trip = await prisma.transportRequest.update({
    where: { id },
    data: updateData,
    include: {
      assignedUnit: true,
      pickupLocation: true,
      originFacility: true,
      destinationFacility: true
    }
  });

  return { success: true, data: trip };
}
```

**Note:** Need to determine how to pass `userType` to this function. Check how authentication middleware works.

#### 2.4 Update Trip Retrieval

Ensure both completion timestamps are returned in API responses:
- Include `healthcareCompletionTimestamp` and `emsCompletionTimestamp` in all trip queries
- Frontend will filter/display based on user type

**Files to check:**
- `backend/src/services/tripService.ts` - `getTripById()`, `getTrips()`
- `backend/src/routes/trips.ts` - GET endpoints

---

### Phase 3: Frontend Changes - Healthcare Dashboard

#### 3.1 Update `handleCompleteTrip()` Function

**File:** `frontend/src/components/HealthcareDashboard.tsx`

**Current Code (line ~574-596):**
```typescript
const handleCompleteTrip = async (tripId: string) => {
  if (!confirm('Are you sure you want to mark this trip as completed?')) return;
  
  setUpdating(true);
  try {
    const response = await tripsAPI.updateStatus(tripId, {
      status: 'COMPLETED',
      completionTimestamp: new Date().toISOString()
    });
    // ... rest of function ...
  }
};
```

**Updated Code:**
```typescript
const handleCompleteTrip = async (tripId: string) => {
  if (!confirm('Are you sure you want to mark this trip as completed?')) return;
  
  setUpdating(true);
  try {
    const response = await tripsAPI.updateStatus(tripId, {
      status: 'HEALTHCARE_COMPLETED',
      healthcareCompletionTimestamp: new Date().toISOString()
    });
    // ... rest of function ...
  }
};
```

#### 3.2 Update Completed Trips Filter

**File:** `frontend/src/components/HealthcareDashboard.tsx`

**Current Code (line ~321-327):**
```typescript
const completed = transformedTrips
  .filter(trip => trip.status === 'COMPLETED' || trip.status === 'CANCELLED')
  .map(trip => ({
    ...trip,
    waitTime: calculateWaitTime(trip.requestTimeISO, trip.pickupTimeISO),
    acceptanceTime: acceptanceTime
  }));
```

**Updated Code:**
```typescript
const completed = transformedTrips
  .filter(trip => trip.healthcareCompletionTimestampISO !== null || trip.status === 'CANCELLED')
  .map(trip => {
    // ... existing logic ...
    return {
      ...trip,
      waitTime: calculateWaitTime(trip.requestTimeISO, trip.pickupTimeISO),
      acceptanceTime: acceptanceTime
    };
  });
```

#### 3.3 Update Completed Trips Display

**File:** `frontend/src/components/HealthcareDashboard.tsx`

**Current Code (line ~1356-1361):**
```typescript
<div>
  <div className="font-bold text-gray-800">Completion Time:</div>
  <div className="text-gray-500">
    {trip.status === 'CANCELLED' ? 'Cancelled' : (trip.completionTime || 'N/A')}
  </div>
</div>
```

**Updated Code:**
```typescript
<div>
  <div className="font-bold text-gray-800">Completion Time:</div>
  <div className="text-gray-500">
    {trip.status === 'CANCELLED' ? 'Cancelled' : (trip.healthcareCompletionTime || 'N/A')}
  </div>
</div>
```

#### 3.4 Update Trip Transformation

**File:** `frontend/src/components/HealthcareDashboard.tsx`

**Location:** In `loadTrips()` function, around line ~208-224

**Add to transformedTrips mapping:**
```typescript
const transformedTrips = data.data.map((trip: any) => ({
  // ... existing fields ...
  completionTime: trip.completionTimestamp ? new Date(trip.completionTimestamp).toLocaleString() : null,
  completionTimestampISO: trip.completionTimestamp || null,
  // ADD THESE:
  healthcareCompletionTime: trip.healthcareCompletionTimestamp 
    ? new Date(trip.healthcareCompletionTimestamp).toLocaleString() 
    : null,
  healthcareCompletionTimestampISO: trip.healthcareCompletionTimestamp || null,
  emsCompletionTime: trip.emsCompletionTimestamp 
    ? new Date(trip.emsCompletionTimestamp).toLocaleString() 
    : null,
  emsCompletionTimestampISO: trip.emsCompletionTimestamp || null
}));
```

---

### Phase 4: Frontend Changes - EMS Dashboard

#### 4.1 Update `handleUpdateTripStatus()` Function

**File:** `frontend/src/components/EMSDashboard.tsx`

**Current Code (line ~666-690):**
```typescript
const handleUpdateTripStatus = async (tripId: string, newStatus: string) => {
  try {
    const payload = {
      status: newStatus,
      ...(newStatus === 'IN_PROGRESS' && { pickupTimestamp: new Date().toISOString() }),
      ...(newStatus === 'COMPLETED' && { completionTimestamp: new Date().toISOString() })
    };
    // ... rest of function ...
  }
};
```

**Updated Code:**
```typescript
const handleUpdateTripStatus = async (tripId: string, newStatus: string) => {
  try {
    const payload = {
      status: newStatus,
      ...(newStatus === 'IN_PROGRESS' && { pickupTimestamp: new Date().toISOString() }),
      ...(newStatus === 'COMPLETED' && { emsCompletionTimestamp: new Date().toISOString() })
    };
    // ... rest of function ...
  }
};
```

#### 4.2 Update Completed Trips Filter

**File:** `frontend/src/components/EMSDashboard.tsx`

**Current Code (line ~375-393):**
```typescript
const completedResponse = await api.get('/api/trips?status=COMPLETED');
if (completedResponse.data) {
  const completedData = completedResponse.data;
  if (completedData.success && completedData.data) {
    const transformedCompleted = completedData.data.map((trip: any) => ({
      // ... trip mapping ...
    }));
    setCompletedTrips(transformedCompleted);
  }
}
```

**Updated Code:**
```typescript
// Filter by EMS completion timestamp instead of status
const completedResponse = await api.get('/api/trips');
if (completedResponse.data) {
  const completedData = completedResponse.data;
  if (completedData.success && completedData.data) {
    const transformedCompleted = completedData.data
      .filter((trip: any) => trip.emsCompletionTimestamp !== null)
      .map((trip: any) => ({
        // ... trip mapping ...
        emsCompletionTime: trip.emsCompletionTimestamp 
          ? new Date(trip.emsCompletionTimestamp).toLocaleString() 
          : null,
        // ... rest of mapping ...
      }));
    setCompletedTrips(transformedCompleted);
  }
}
```

#### 4.3 Update Completed Trips Display

**File:** `frontend/src/components/EMSDashboard.tsx`

Update display to use `emsCompletionTime` instead of `completionTime`.

#### 4.4 Update Trip Transformation

**File:** `frontend/src/components/EMSDashboard.tsx`

Add EMS completion timestamp fields to trip transformation (similar to Healthcare dashboard).

---

## Status Flow

```
PENDING → ACCEPTED → IN_PROGRESS → HEALTHCARE_COMPLETED → COMPLETED
                                              ↑                ↑
                                    (Healthcare marks)  (EMS marks - final)
```

**Key Points:**
- Healthcare can mark completion independently (status = `HEALTHCARE_COMPLETED`)
- EMS can mark completion independently (status = `COMPLETED` - final state)
- Healthcare completion does not prevent EMS from completing later
- EMS completion is the final state

---

## Completed Trips Filtering Logic

### Healthcare Dashboard
- **Filter:** `WHERE healthcareCompletionTimestamp IS NOT NULL`
- **Display:** Shows trips Healthcare has completed, regardless of EMS completion status
- **Completion Time:** Shows `healthcareCompletionTimestamp`

### EMS Dashboard
- **Filter:** `WHERE emsCompletionTimestamp IS NOT NULL`
- **Display:** Shows trips EMS has completed
- **Completion Time:** Shows `emsCompletionTimestamp`

---

## Testing Checklist

### Phase 1: Database & Migration
- [ ] Prisma schema updated with new fields
- [ ] Migration created successfully
- [ ] Migration runs without errors
- [ ] Existing `completionTimestamp` data migrated to `healthcareCompletionTimestamp`
- [ ] No data loss during migration

### Phase 2: Backend
- [ ] Status validation includes `HEALTHCARE_COMPLETED`
- [ ] `updateTripStatus` detects user type correctly
- [ ] Healthcare completion sets `healthcareCompletionTimestamp` and `HEALTHCARE_COMPLETED` status
- [ ] EMS completion sets `emsCompletionTimestamp` and `COMPLETED` status
- [ ] Both completion timestamps returned in API responses
- [ ] Backward compatibility maintained (`completionTimestamp` still works)

### Phase 3: Healthcare Frontend
- [ ] `handleCompleteTrip` sends `healthcareCompletionTimestamp` and `HEALTHCARE_COMPLETED` status
- [ ] Completed trips filter shows trips with `healthcareCompletionTimestamp`
- [ ] Completion time displays from `healthcareCompletionTimestamp`
- [ ] Trip appears in Completed Trips tab after Healthcare marks it complete
- [ ] Trip does NOT appear in EMS Completed Trips until EMS completes it

### Phase 4: EMS Frontend
- [ ] `handleUpdateTripStatus` sends `emsCompletionTimestamp` when marking COMPLETED
- [ ] Completed trips filter shows trips with `emsCompletionTimestamp`
- [ ] Completion time displays from `emsCompletionTimestamp`
- [ ] Trip appears in Completed Trips tab after EMS marks it complete

### Phase 5: Integration Testing
- [ ] Healthcare can complete trip independently
- [ ] EMS can complete trip independently
- [ ] Both completion times tracked separately
- [ ] Each dashboard shows only their own completion time
- [ ] No conflicts between the two completion timestamps
- [ ] Status transitions work correctly
- [ ] Completed trips appear in correct dashboards

---

## Technical Notes

### User Type Detection

**Option 1: From Request Context (Recommended)**
- Check authenticated user object in backend
- User object should have `userType` field (`HEALTHCARE` or `EMS`)
- Extract from JWT token or session

**Option 2: From Request Body**
- Frontend sends user type in request body
- Less secure, but simpler

**Option 3: From User ID Lookup**
- Look up user in database to determine type
- More database queries, but most reliable

**Implementation Location:**
- `backend/src/routes/trips.ts` - Extract user type from `req.user` or `req.user.userType`
- Pass to `tripService.updateTripStatus(id, data, userType)`

### Backward Compatibility

- Keep `completionTimestamp` field in schema
- Keep `completionTimestamp` in API interfaces
- Don't break existing code that uses `completionTimestamp`
- Gradually migrate to new fields

### Migration Strategy

1. Add new fields (nullable)
2. Migrate existing data: `completionTimestamp` → `healthcareCompletionTimestamp`
3. Update code to use new fields
4. Keep old field for backward compatibility
5. Eventually deprecate `completionTimestamp` (future work)

---

## Implementation Order

1. ✅ **Phase 1:** Update Prisma schema (add fields + new status)
2. ✅ **Phase 1:** Create and run migration
3. ✅ **Phase 2:** Update backend interfaces and validation
4. ✅ **Phase 2:** Update backend `updateTripStatus` logic (user type detection + separate timestamps)
5. ✅ **Phase 3:** Update Healthcare frontend (`handleCompleteTrip` + filtering + display)
6. ✅ **Phase 4:** Update EMS frontend (`handleUpdateTripStatus` + filtering + display)
7. ✅ **Phase 5:** Test both completion flows
8. ✅ **Phase 5:** Verify migration worked correctly

---

## Progress Tracking

- [x] Phase 1: Database Schema Changes ✅ **COMPLETED** (2025-11-16)
- [x] Phase 2: Backend Changes ✅ **COMPLETED** (2025-11-16)
- [x] Phase 3: Healthcare Frontend Changes ✅ **COMPLETED** (2025-11-16)
- [x] Phase 4: EMS Frontend Changes ✅ **COMPLETED** (2025-11-16)
- [ ] Phase 5: Testing & Verification

---

## Future Considerations

1. **Analytics:** Track Healthcare vs EMS completion time differences
2. **Reporting:** Generate reports showing completion time metrics separately
3. **Notifications:** Notify Healthcare when EMS completes (if needed)
4. **Deprecation:** Eventually remove `completionTimestamp` field (after full migration)

---

## Related Files

### Backend
- `backend/prisma/schema.prisma` - Schema definition
- `backend/src/services/tripService.ts` - Trip service logic
- `backend/src/routes/trips.ts` - Trip routes
- `backend/src/types/` - TypeScript interfaces

### Frontend
- `frontend/src/components/HealthcareDashboard.tsx` - Healthcare dashboard
- `frontend/src/components/EMSDashboard.tsx` - EMS dashboard
- `frontend/src/services/api.ts` - API service (check if needs updates)

---

## Questions & Answers

**Q1: What happens to trip status when Healthcare completes?**  
A: Status changes to `HEALTHCARE_COMPLETED`. Trip remains in this status until EMS completes it.

**Q2: Should Healthcare see trips they've completed even if EMS hasn't completed yet?**  
A: Yes. Healthcare should see trips they've completed in their Completed Trips tab.

**Q3: Should Healthcare see a note like "Awaiting EMS completion"?**  
A: No. Healthcare just sees their completion time. No cross-referencing needed.

**Q4: How do we detect user type in backend?**  
A: Extract from authenticated user object (`req.user.userType`). If not available, may need to add to authentication middleware.

---

## Change Log

- **2025-11-16:** Initial plan created
- **2025-11-16:** Updated with user answers to questions (status, filtering, display)
- **2025-11-16:** Phase 1 completed - Database schema updated, migration created and applied
- **2025-11-16:** Phase 2 completed - Backend interfaces updated, route handler updated, updateTripStatus logic implemented with user type detection
- **2025-11-16:** Phase 3 completed - Healthcare frontend updated: handleCompleteTrip uses healthcareCompletionTimestamp, completed trips filter updated, display shows healthcareCompletionTime, CSV export updated
- **2025-11-16:** Phase 4 completed - EMS frontend updated: handleUpdateTripStatus uses emsCompletionTimestamp, completed trips filter updated to use emsCompletionTimestamp, display shows EMS completion time
- **2025-11-16:** Code review completed - Added defensive logic for edge cases, verified all changes, created test results document
- **2025-11-16:** Testing completed - Fixed "My Trips" filtering for EMS (only show selected agencies), fixed Healthcare "In-Progress" tab to include COMPLETED trips, verified Healthcare and EMS show different completion times

---

## Notes

- Healthcare completion time is almost always shorter than EMS completion time
- Healthcare tracks completion time as a key metric
- Both completion events are independent and should be tracked separately
- Migration preserves historical Healthcare completion data

