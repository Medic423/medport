# Phase 3: Dispatch Screen Implementation - Handoff

## Context & Current Status

**Project:** Healthcare Module - EMS Agencies & Destinations Management  
**Git Branch:** `feature/healthcare-ems-destinations-tabs`  
**Current Phase:** Phase 3 (Dispatch Screen Implementation)

### What's Been Completed

**Phase 1: EMS Agencies Tab** ✅ COMPLETE
- Backend: `healthcareAgencies.ts` routes and `healthcareAgencyService.ts`
- Frontend: `HealthcareEMSAgencies.tsx` component
- Features: Add/edit/delete agencies, mark as Preferred/Regular
- Commit: `e188c260 - feat: Phase 1 - Healthcare EMS Providers Management`

**Phase 2: Destinations Tab** ✅ COMPLETE
- Backend: `healthcareDestinations.ts` routes and `healthcareDestinationService.ts`
- Frontend: `HealthcareDestinations.tsx` component
- Database: `HealthcareDestination` model and migration
- Features: Add/edit/delete destinations, search, filter by type
- Backend commit: `4fef38d8 - feat: Phase 2 Backend - Healthcare Destinations Management`
- Frontend commit: `e56c7ead - feat: Phase 2 Frontend - Healthcare Destinations Management`
- All changes merged to `main` and pushed to remote

**Current State:**
- Both tabs integrated into `HealthcareDashboard.tsx`
- All CRUD operations tested and working
- User scoping verified (only shows user's own data)
- Main branch is up to date with all Phase 1 & 2 work

---

## Phase 3: Dispatch Screen Implementation

### Overview

Phase 3 implements a **separate dispatch screen** that appears after trip creation. This is a critical architectural change that separates trip creation from agency selection, making the workflow cleaner and more flexible.

**Key Architectural Decision:**
- Dispatch is a **separate step after trip creation**, not integrated into the trip creation form
- Trip creation ends without agency selection
- Trip status is set to `PENDING_DISPATCH` after creation
- User is redirected to dispatch screen for agency selection

### Workflow

```
1. User completes trip creation form (Steps 1-3 or 1-4 with Review)
   ↓
2. Trip created with status `PENDING_DISPATCH`
   ↓
3. User redirected to dispatch screen
   ↓
4. User selects dispatch mode (Preferred/Geographic/Hybrid)
   ↓
5. User selects agencies from filtered list
   ↓
6. User clicks "Dispatch to Selected Agencies"
   ↓
7. Notifications sent to selected agencies
   ↓
8. Trip status updates to `PENDING` (awaiting agency response)
```

---

## Implementation Tasks

### 1. Database Schema Changes

**File:** `backend/prisma/schema.prisma`

**Add `PENDING_DISPATCH` status:**
```prisma
// In TransportRequest model, update status enum or validation
// Ensure PENDING_DISPATCH is accepted as a valid status
```

**Status Flow:**
- `PENDING_DISPATCH` → New status for trips awaiting dispatch
- `PENDING` → After dispatch, awaiting agency response
- `ACCEPTED` → Agency accepted the trip
- `IN_PROGRESS` → Trip in progress
- `COMPLETED` → Trip completed
- `CANCELLED` → Trip cancelled

**Migration Needed:**
- Create migration for status validation update (if enum-based)
- Or ensure backend accepts `PENDING_DISPATCH` as valid status

---

### 2. Backend Endpoints

#### 2.1 GET `/api/healthcare/trip-agencies?tripId=xxx`

**Purpose:** Get available agencies for a specific trip, combining registered agencies and user's added agencies

**File:** `backend/src/routes/healthcareAgencies.ts` (new endpoint) or create `healthcareTripDispatch.ts`

**Logic:**
1. Get trip details (especially origin location for geographic filtering)
2. Get registered agencies (from EMSAgency where account exists)
3. Get user's added agencies (from HealthcareAgency where healthcareUserId matches)
4. Deduplicate by agency ID
5. Apply geographic filtering for registered agencies (if in Geographic/Hybrid mode)
6. Show ALL user-added agencies regardless of distance
7. Return with flags: `isRegistered`, `isPreferred`, `distance`

**Response Format:**
```typescript
{
  success: true,
  data: {
    agencies: [
      {
        id: string,
        name: string,
        phone: string,
        email: string,
        address: string,
        city: string,
        state: string,
        capabilities: string[],
        isRegistered: boolean,  // Has account in system
        isPreferred: boolean,   // Marked as preferred by user
        distance: number | null, // Miles from origin (if calculated)
        unitType?: string,
        unitNumber?: string
      }
    ],
    preferredCount: number,
    geographicCount: number,
    userAgenciesCount: number
  }
}
```

#### 2.2 POST `/api/trips/:id/dispatch`

**Purpose:** Dispatch trip to selected agencies

**File:** `backend/src/routes/trips.ts` (new endpoint)

**Request Body:**
```typescript
{
  agencyIds: string[],        // Selected agency IDs
  dispatchMode: 'PREFERRED' | 'GEOGRAPHIC' | 'HYBRID',
  notificationRadius?: number // Only used in Geographic/Hybrid modes
}
```

**Logic:**
1. Validate trip exists and belongs to healthcare user
2. Validate trip status is `PENDING_DISPATCH`
3. Validate all selected agencies belong to user OR are registered
4. Create agency responses for each selected agency
5. Send notifications to selected agencies
6. Update trip status to `PENDING`
7. Return success

**Response:**
```typescript
{
  success: true,
  data: {
    tripId: string,
    dispatchedTo: number,
    responses: AgencyResponse[]
  }
}
```

#### 2.3 Update Trip Creation Service

**File:** `backend/src/services/tripService.ts`

**Changes:**
- Remove requirement for `selectedAgencies` during creation
- Set default status to `PENDING_DISPATCH` for healthcare users
- Allow trips to be created without agency selection

---

### 3. Frontend Component: TripDispatchScreen

**File:** `frontend/src/components/TripDispatchScreen.tsx`

**Props:**
```typescript
interface TripDispatchScreenProps {
  tripId: string;
  trip: TransportRequest; // Trip details
  user: HealthcareUser;
  onDispatchComplete: () => void; // Callback after successful dispatch
  onCancel: () => void; // Cancel dispatch, return to trip list
}
```

**Features:**

1. **Trip Summary Display:**
   - Patient ID
   - From/To locations
   - Scheduled time
   - Transport level
   - Urgency level
   - Clinical details summary (diagnosis, mobility, special needs)

2. **Dispatch Mode Selector:**
   - Radio buttons: Preferred Providers / Geographic Radius / Hybrid
   - **Default:** Preferred (if user has preferred agencies), else Geographic
   - Modes are **mutually exclusive**
   - Notification radius input (shown only in Geographic/Hybrid modes)

3. **Agency Selection:**
   - Load agencies based on selected dispatch mode
   - Display with badges:
     - 🏢 "Registered" (blue) - Has account in system
     - 🔶 "My Provider" (orange) - User-added agency
     - ⭐ "Preferred" (yellow) - Marked as preferred
   - Preferred agencies grouped at top
   - Checkboxes to select agencies
   - Show distance (for geographic context)
   - Show capabilities as badges

4. **Actions:**
   - "Dispatch to Selected Agencies" button (primary, green)
   - "Cancel" button (secondary) - returns to trip list, leaves trip in PENDING_DISPATCH

**State Management:**
```typescript
const [dispatchMode, setDispatchMode] = useState<'PREFERRED' | 'GEOGRAPHIC' | 'HYBRID'>('PREFERRED');
const [agencies, setAgencies] = useState<Agency[]>([]);
const [selectedAgencyIds, setSelectedAgencyIds] = useState<string[]>([]);
const [notificationRadius, setNotificationRadius] = useState<number>(100);
const [loading, setLoading] = useState(false);
```

**Default Mode Logic:**
```typescript
useEffect(() => {
  // Check if user has preferred agencies
  const hasPreferred = agencies.some(a => a.isPreferred);
  if (hasPreferred) {
    setDispatchMode('PREFERRED');
  } else {
    setDispatchMode('GEOGRAPHIC');
  }
}, [agencies]);
```

**Filtering Logic:**
```typescript
const getFilteredAgencies = () => {
  switch (dispatchMode) {
    case 'PREFERRED':
      return agencies.filter(a => a.isPreferred);
    case 'GEOGRAPHIC':
      return agencies.filter(a => 
        a.isRegistered ? a.distance <= notificationRadius : true // User agencies always shown
      );
    case 'HYBRID':
      const preferred = agencies.filter(a => a.isPreferred);
      const geographic = agencies.filter(a => 
        !a.isPreferred && (a.isRegistered ? a.distance <= notificationRadius : true)
      );
      return [...preferred, ...geographic];
    default:
      return agencies;
  }
};
```

**API Integration:**
- `healthcareTripAgenciesAPI.getForTrip(tripId, { mode, radius })` - Get agencies
- `tripsAPI.dispatch(tripId, { agencyIds, dispatchMode, notificationRadius })` - Dispatch

---

### 4. Modify Trip Creation Flow

**File:** `frontend/src/components/EnhancedTripForm.tsx`

**Changes Needed:**

1. **Remove Step 4 (Agency Selection):**
   - Remove agency selection UI from Step 4
   - Remove `selectedAgencies` from form submission (or make optional)
   - Trip creation now ends after Step 3 (Clinical Details) or Step 4 (Review)

2. **Update `handleSubmit`:**
   - Remove `selectedAgencies` requirement
   - Set status hint for backend to create with `PENDING_DISPATCH`

3. **Update `onTripCreated` callback:**
   - Navigate to dispatch screen instead of trip list
   - Pass trip ID to dispatch screen
   - Use navigation: `/healthcare/dispatch/:tripId` or pass via props

**File:** `frontend/src/components/HealthcareDashboard.tsx`

**Changes:**
- Add route/state for dispatch screen
- Handle navigation from trip creation to dispatch screen
- Optionally add "Dispatch" button for trips with status `PENDING_DISPATCH`

---

### 5. Navigation Integration

**Option A: Modal/Overlay Approach**
- Dispatch screen opens as modal/overlay in HealthcareDashboard
- User can cancel and return to trip list
- Cleaner UX, no URL routing needed

**Option B: Route-Based Approach**
- Add route: `/healthcare/dispatch/:tripId`
- Full page navigation
- Browser back button works

**Recommendation:** Option A (Modal) for simpler integration

---

## Implementation Order

1. **Database Schema** (if enum-based status)
   - Add `PENDING_DISPATCH` to status enum/validation
   - Run migration

2. **Backend Endpoints**
   - Create `GET /api/healthcare/trip-agencies`
   - Create `POST /api/trips/:id/dispatch`
   - Update trip creation service

3. **Frontend API Service**
   - Add `healthcareTripAgenciesAPI` methods
   - Add `tripsAPI.dispatch()` method

4. **Trip Creation Modification**
   - Remove agency selection from `EnhancedTripForm`
   - Update navigation to dispatch screen

5. **Dispatch Screen Component**
   - Create `TripDispatchScreen.tsx`
   - Implement all features
   - Integrate into HealthcareDashboard

6. **Testing**
   - Test all three dispatch modes
   - Test edge cases
   - Verify notifications sent correctly

---

## Critical Requirements

### Dispatch Mode Defaults
- **If user has preferred agencies:** Default to "Preferred" mode
- **If user has no preferred agencies:** Default to "Geographic" mode
- Modes are **mutually exclusive** - user selects one at a time

### Agency Display Rules
- **Preferred agencies:** Always shown at top, regardless of distance
- **User-added agencies:** Always shown regardless of distance
- **Registered agencies:** Filtered by geographic radius (in Geographic/Hybrid modes)
- **No warnings shown** - keep process simple

### Notification Logic
- **Preferred Mode:** Only notify selected preferred agencies
- **Geographic Mode:** Use automatic notification system for all selected agencies
- **Hybrid Mode:** Notify selected preferred agencies + selected geographic agencies (uses automatic system for geographic)

---

## Files to Create/Modify

### New Files:
- `frontend/src/components/TripDispatchScreen.tsx`
- `backend/src/routes/healthcareTripDispatch.ts` (optional, can add to existing routes)

### Modified Files:
- `frontend/src/components/EnhancedTripForm.tsx` - Remove Step 4 agency selection
- `frontend/src/components/HealthcareDashboard.tsx` - Add dispatch screen integration
- `frontend/src/services/api.ts` - Add dispatch API methods
- `backend/src/services/tripService.ts` - Update trip creation, add dispatch method
- `backend/src/routes/trips.ts` - Add dispatch endpoint
- `backend/src/routes/healthcareAgencies.ts` - Add trip-agencies endpoint (or new route file)
- `backend/prisma/schema.prisma` - Add PENDING_DISPATCH status (if enum-based)
- `backend/prisma/migrations/` - Migration for status (if needed)

---

## Testing Checklist

### Backend Testing
- [ ] GET `/api/healthcare/trip-agencies` returns correct agencies
- [ ] Preferred agencies included regardless of distance
- [ ] User agencies always included
- [ ] Geographic filtering works for registered agencies
- [ ] POST `/api/trips/:id/dispatch` creates responses
- [ ] Dispatch validates trip ownership
- [ ] Dispatch sends notifications
- [ ] Trip status updates to PENDING

### Frontend Testing
- [ ] Trip creation completes without agency selection
- [ ] Trip status is PENDING_DISPATCH after creation
- [ ] Navigation to dispatch screen works
- [ ] Trip summary displays correctly
- [ ] Dispatch mode selector works (mutually exclusive)
- [ ] Default mode: Preferred (if exist) or Geographic
- [ ] Preferred agencies shown at top
- [ ] Agency badges display correctly
- [ ] Geographic filtering works
- [ ] Hybrid mode shows both groups
- [ ] Dispatch button sends notifications
- [ ] Cancel button returns to trip list
- [ ] All three modes tested end-to-end

---

## Important Notes

1. **User's Added Agencies:**
   - Always shown regardless of geographic distance
   - This is intentional - healthcare users control their provider network

2. **Preferred Agencies:**
   - Shown at top of list, grouped separately
   - Always available in Hybrid mode regardless of distance
   - Visual distinction with star icon ⭐

3. **Registered Agencies:**
   - Only filtered by distance in Geographic/Hybrid modes
   - Use existing geographic filtering logic from trip creation

4. **Status Flow:**
   - `PENDING_DISPATCH` → New, awaiting dispatch
   - `PENDING` → Dispatched, awaiting agency response
   - User can cancel dispatch, trip remains in `PENDING_DISPATCH`

5. **Backward Compatibility:**
   - Ensure existing trips still work
   - TCC admin portal may still use old flow (if applicable)

---

## Success Criteria

✅ Trip creation completes without agency selection  
✅ Trip status is `PENDING_DISPATCH` after creation  
✅ Dispatch screen displays trip summary  
✅ Dispatch mode selector works (mutually exclusive)  
✅ Default mode: Preferred (if exist) or Geographic  
✅ Preferred agencies always shown at top  
✅ User agencies always shown regardless of distance  
✅ Geographic filtering works for registered agencies  
✅ Dispatch sends notifications correctly  
✅ Trip status updates to `PENDING` after dispatch  
✅ All three dispatch modes tested and working  

---

## Quick Reference

**Current Branch:** `feature/healthcare-ems-destinations-tabs`  
**Plan Document:** `docs/plans/healthcare_additions.md`  
**Phase 2 Handoff:** `PHASE_2_HANDOFF.md`

**Key Commits:**
- Phase 1: `e188c260 - feat: Phase 1 - Healthcare EMS Providers Management`
- Phase 2 Backend: `4fef38d8 - feat: Phase 2 Backend - Healthcare Destinations Management`
- Phase 2 Frontend: `e56c7ead - feat: Phase 2 Frontend - Healthcare Destinations Management`

**Related Components:**
- `HealthcareEMSAgencies.tsx` - Reference for UI patterns
- `HealthcareDestinations.tsx` - Reference for UI patterns
- `EnhancedTripForm.tsx` - Modify this for trip creation changes
- `HealthcareDashboard.tsx` - Integrate dispatch screen here

---

## Next Steps After Phase 3

- **Phase 4:** Trip Creation Simplification (mostly done in Phase 3)
- **Phase 5:** Trip Creation Integration - Destinations (show destinations in "To Location")
- **Phase 6:** Testing & Refinement

Good luck with Phase 3! 🚀

