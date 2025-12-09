# Trip Management Enhancements - Implementation Plan

**Date:** November 16, 2025  
**Component:** Transport Command → Trip Management (`TripsView.tsx`)  
**Status:** Planning Phase

---

## Overview

This document outlines the phased implementation plan for three enhancements to the Trip Management screen:

1. **Healthcare Organization Identifier** - Display which healthcare facility created each trip
2. **Archive System** - Move completed/cancelled trips to an archive view
3. **Dispatch Functionality** - Add dispatch icon/button for PENDING_DISPATCH trips

---

## Feature 1: Healthcare Organization Identifier

### Goal
Display the healthcare facility/organization name for each trip in the listing to enable hospital activity metrics tracking.

### Current State
- Database schema already includes `healthcareCreatedById` field in `TransportRequest` model
- `healthcareLocation` relation exists linking trips to healthcare locations
- Healthcare users have `facilityName` field
- Backend already includes healthcare user/location data in trip queries (via `getTrips`)

### Implementation Phases

#### Phase 1.1: Backend - Ensure Healthcare Data in API Response
**Goal:** Verify and enhance backend to include healthcare facility name in trip responses

**Tasks:**
1. Review `backend/src/services/tripService.ts` → `getTrips()` method
2. Ensure `healthcareLocation` relation is included in Prisma query with:
   - `locationName` (primary identifier)
   - `healthcareUser` relation with `facilityName` (fallback)
3. Add healthcare facility name to trip transformation logic
4. Test API response includes `healthcareFacilityName` or `healthcareLocationName`

**Files to Modify:**
- `backend/src/services/tripService.ts` (if needed)

**Success Criteria:**
- API returns `healthcareFacilityName` or `healthcareLocationName` for all trips
- Field is populated even for trips created by TCC users (if they specify facility)

---

#### Phase 1.2: Frontend - Update Trip Interface
**Goal:** Add healthcare facility field to TypeScript interface

**Tasks:**
1. Update `Trip` interface in `TripsView.tsx` to include:
   ```typescript
   healthcareFacilityName?: string;
   healthcareLocation?: {
     id: string;
     locationName: string;
     facilityName?: string;
   };
   ```
2. Ensure trip data transformation maps backend field to frontend interface

**Files to Modify:**
- `frontend/src/components/TripsView.tsx`

**Success Criteria:**
- TypeScript interface includes healthcare facility fields
- No type errors in component

---

#### Phase 1.3: Frontend - Display Healthcare Facility in Trip Card
**Goal:** Show healthcare facility name in the trip listing UI

**Tasks:**
1. Add healthcare facility display to `TripCard` component
2. Position: After patient ID, before or alongside origin/destination
3. Format: "Facility: [Facility Name]" or "[Location Name]"
4. Handle cases where facility name is missing (show "Unknown Facility" or "TCC Created")
5. Add tooltip showing full facility details if available

**Files to Modify:**
- `frontend/src/components/TripsView.tsx` (TripCard component)

**Success Criteria:**
- Healthcare facility name visible in each trip card
- Graceful handling of missing data
- UI is clean and doesn't clutter the card

---

#### Phase 1.4: Frontend - Add Healthcare Facility Filter
**Goal:** Enable filtering trips by healthcare facility

**Tasks:**
1. Add "Healthcare Facility" dropdown filter to filter panel
2. Populate dropdown with unique facility names from current trips
3. Update filter logic to filter by `healthcareFacilityName`
4. Add facility filter to CSV export

**Files to Modify:**
- `frontend/src/components/TripsView.tsx`

**Success Criteria:**
- Filter dropdown shows all unique healthcare facilities
- Filtering works correctly
- CSV export includes facility column

---

## Feature 2: Archive System

### Goal
Create an archive system that automatically moves completed, cancelled, or deleted trips out of the active list into a separate archive view.

### Current State
- Trips have statuses: `COMPLETED`, `HEALTHCARE_COMPLETED`, `CANCELLED`
- All trips currently shown in single list with status filters
- No distinction between "active" and "archived" trips

### Implementation Phases

#### Phase 2.1: Backend - Archive Status Logic
**Goal:** Define what constitutes an "archived" trip

**Tasks:**
1. Define archive criteria:
   - Status: `COMPLETED`, `HEALTHCARE_COMPLETED`, `CANCELLED`
   - Optional: Age-based (e.g., completed > 30 days ago)
2. Create helper function `isArchivedTrip(trip)` in `tripService.ts`
3. Add optional `includeArchived` parameter to `getTrips()` method (default: `false`)
4. Update `getTrips()` to filter out archived trips by default

**Files to Modify:**
- `backend/src/services/tripService.ts`

**Success Criteria:**
- Backend can distinguish archived vs active trips
- API supports `?includeArchived=true` query parameter
- Default behavior excludes archived trips

---

#### Phase 2.2: Frontend - Archive View Tab/Page
**Goal:** Create UI for viewing archived trips

**Tasks:**
1. Add "Archive" tab or toggle button in `TripsView.tsx`
2. Create archive state: `const [showArchive, setShowArchive] = useState(false)`
3. Add archive view that:
   - Shows only archived trips (COMPLETED, HEALTHCARE_COMPLETED, CANCELLED)
   - Uses same filter/search functionality
   - Displays archive date/time
   - Shows reason for archive (status)
4. Add "Restore" button for archived trips (changes status back to previous active status)
5. Add "View Archive" / "View Active" toggle button

**Files to Modify:**
- `frontend/src/components/TripsView.tsx`

**Success Criteria:**
- Archive tab/view is accessible
- Archived trips are separated from active trips
- Archive view has same filtering capabilities
- Restore functionality works (if implemented)

---

#### Phase 2.3: Frontend - Auto-Archive on Status Change
**Goal:** Automatically move trips to archive when they become archived

**Tasks:**
1. Update `fetchTrips()` to exclude archived trips by default
2. When trip status changes to archived status:
   - Remove from active list immediately
   - Show notification: "Trip archived"
   - Optionally auto-switch to archive view
3. Update status change handlers (Accept/Decline/Delete) to handle archive transition

**Files to Modify:**
- `frontend/src/components/TripsView.tsx`

**Success Criteria:**
- Trips disappear from active list when archived
- User receives feedback about archive action
- Archive view updates when trips are archived

---

#### Phase 2.4: Backend - Archive Endpoint (Optional)
**Goal:** Add explicit archive/unarchive endpoints for better control

**Tasks:**
1. Add `POST /api/trips/:id/archive` endpoint
2. Add `POST /api/trips/:id/unarchive` endpoint
3. Archive endpoint sets a flag or moves to archive status
4. Unarchive endpoint restores trip to previous status

**Files to Modify:**
- `backend/src/routes/trips.ts`
- `backend/src/services/tripService.ts`

**Success Criteria:**
- Explicit archive/unarchive API endpoints exist
- Archive status can be toggled via API

---

#### Phase 2.5: Database Schema Enhancement (Optional)
**Goal:** Add explicit archive tracking fields

**Tasks:**
1. Add migration to add `archivedAt: DateTime?` field to `TransportRequest`
2. Add `archivedBy: String?` field (user ID who archived)
3. Add `previousStatus: String?` field (for restore functionality)
4. Update archive logic to set these fields

**Files to Modify:**
- `backend/prisma/schema.prisma`
- Create migration file

**Success Criteria:**
- Database tracks archive date and user
- Restore can return trip to previous status

---

## Feature 3: Dispatch Functionality

### Goal
Add a dispatch icon/button for trips with `PENDING_DISPATCH` status that opens the dispatch screen to send trips to EMS agencies.

### Current State
- `TripDispatchScreen.tsx` component already exists and is functional
- Healthcare dashboard already has dispatch button for `PENDING_DISPATCH` trips
- Backend dispatch endpoint exists: `POST /api/trips/:id/dispatch`
- Dispatch functionality is fully implemented in Healthcare dashboard

### Implementation Phases

#### Phase 3.1: Frontend - Add Dispatch Button to Trip Card
**Goal:** Add dispatch icon/button for PENDING_DISPATCH trips

**Tasks:**
1. Import `TripDispatchScreen` component into `TripsView.tsx`
2. Add state for dispatch modal:
   ```typescript
   const [dispatchTrip, setDispatchTrip] = useState<Trip | null>(null);
   const [showDispatchScreen, setShowDispatchScreen] = useState(false);
   ```
3. Add dispatch button to `TripCard` component:
   - Only show when `trip.status === 'PENDING_DISPATCH'`
   - Use dispatch icon (e.g., `Send`, `Radio`, or `Truck` from lucide-react)
   - Position: In the action buttons area (with Accept/Decline/Edit/Delete)
   - Tooltip: "Dispatch to Agencies"
4. Button click handler:
   - Sets `dispatchTrip` state
   - Opens `showDispatchScreen` modal

**Files to Modify:**
- `frontend/src/components/TripsView.tsx`

**Success Criteria:**
- Dispatch button appears only for PENDING_DISPATCH trips
- Button opens dispatch screen modal
- Button is visually distinct and accessible

---

#### Phase 3.2: Frontend - Integrate Dispatch Screen Modal
**Goal:** Render TripDispatchScreen component in modal

**Tasks:**
1. Add modal wrapper for `TripDispatchScreen`:
   ```typescript
   {showDispatchScreen && dispatchTrip && (
     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
       <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
         <TripDispatchScreen
           tripId={dispatchTrip.id}
           trip={dispatchTrip}
           user={user}
           onDispatchComplete={() => {
             setShowDispatchScreen(false);
             setDispatchTrip(null);
             fetchTrips(); // Refresh list
           }}
           onCancel={() => {
             setShowDispatchScreen(false);
             setDispatchTrip(null);
           }}
         />
       </div>
     </div>
   )}
   ```
2. Ensure trip data format matches `TripDispatchScreen` expectations
3. Map `Trip` interface fields to `TransportRequest` interface expected by dispatch screen

**Files to Modify:**
- `frontend/src/components/TripsView.tsx`

**Success Criteria:**
- Dispatch screen opens in modal
- Trip data is correctly passed to dispatch screen
- Modal closes after successful dispatch
- Trip list refreshes after dispatch

---

#### Phase 3.3: Frontend - Handle Dispatch Success
**Goal:** Update trip status and UI after successful dispatch

**Tasks:**
1. After dispatch completes:
   - Trip status should change from `PENDING_DISPATCH` to `PENDING` (or `ACCEPTED` if auto-accept)
   - Dispatch button should disappear
   - Show success notification
2. Update `fetchTrips()` to refresh after dispatch
3. Handle dispatch errors gracefully

**Files to Modify:**
- `frontend/src/components/TripsView.tsx`

**Success Criteria:**
- Trip status updates after dispatch
- UI reflects new status immediately
- User receives feedback on dispatch success/failure

---

#### Phase 3.4: Frontend - Dispatch Button Styling & UX
**Goal:** Make dispatch button visually prominent and intuitive

**Tasks:**
1. Style dispatch button:
   - Use distinctive color (e.g., purple/blue for dispatch action)
   - Add icon (Send, Radio, or similar)
   - Add "Dispatch" text label
   - Hover effects
2. Add visual indicator for trips awaiting dispatch:
   - Badge/count showing number of PENDING_DISPATCH trips
   - Highlight PENDING_DISPATCH trips in list
3. Add keyboard shortcut (optional): `D` key to dispatch selected trip

**Files to Modify:**
- `frontend/src/components/TripsView.tsx`

**Success Criteria:**
- Dispatch button is visually distinct
- PENDING_DISPATCH trips are easy to identify
- UX is intuitive and efficient

---

## Testing Plan

### Feature 1: Healthcare Organization Identifier
1. **Test Data Setup:**
   - Create trips from different healthcare facilities
   - Create trips via TCC (should show TCC or facility name)
   - Create trips with missing healthcare data

2. **Test Cases:**
   - Verify facility name displays for all trips
   - Test filter by healthcare facility
   - Test CSV export includes facility column
   - Test with missing/null facility data

### Feature 2: Archive System
1. **Test Data Setup:**
   - Create trips with various statuses
   - Complete some trips
   - Cancel some trips

2. **Test Cases:**
   - Verify completed trips move to archive
   - Verify cancelled trips move to archive
   - Test archive view displays correctly
   - Test restore functionality (if implemented)
   - Test archive filter/search works
   - Test active list excludes archived trips

### Feature 3: Dispatch Functionality
1. **Test Data Setup:**
   - Create trips with PENDING_DISPATCH status
   - Ensure dispatch screen component is available

2. **Test Cases:**
   - Verify dispatch button appears only for PENDING_DISPATCH trips
   - Test opening dispatch screen modal
   - Test dispatching trip to agencies
   - Verify trip status updates after dispatch
   - Test error handling for dispatch failures
   - Test modal closes after dispatch

---

## Implementation Order Recommendation

**Recommended Sequence:**
1. **Feature 1** (Healthcare Organization Identifier) - Foundation for metrics
2. **Feature 3** (Dispatch Functionality) - High-value quick win, reuses existing component
3. **Feature 2** (Archive System) - More complex, requires careful planning

**Rationale:**
- Feature 1 is foundational and relatively simple
- Feature 3 leverages existing code, quick to implement
- Feature 2 requires more architectural decisions and testing

---

## Dependencies

### External Dependencies
- None (all functionality uses existing components and APIs)

### Internal Dependencies
- `TripDispatchScreen.tsx` component (already exists)
- `tripsAPI.dispatch()` method (already exists)
- Backend dispatch endpoint (already exists)
- Healthcare location/facility data in database (already exists)

---

## Risk Assessment

### Low Risk
- **Feature 1:** Simple display addition, data already exists
- **Feature 3:** Reuses existing, tested component

### Medium Risk
- **Feature 2:** Archive logic needs careful testing to avoid data loss
- Archive restore functionality requires status history tracking

### Mitigation Strategies
- Feature 2: Start with soft archive (status-based) before adding database fields
- Feature 2: Add restore functionality only after archive is stable
- All features: Implement in phases with testing after each phase

---

## Success Metrics

### Feature 1
- Healthcare facility name visible in 100% of trip listings
- Filter by facility works correctly
- CSV export includes facility data

### Feature 2
- Completed/cancelled trips automatically excluded from active list
- Archive view accessible and functional
- Archive/restore operations complete without errors

### Feature 3
- Dispatch button appears for all PENDING_DISPATCH trips
- Dispatch screen opens successfully
- Dispatch operations complete successfully
- Trip status updates correctly after dispatch

---

## Notes

- All three features can be implemented independently
- Feature 3 can leverage existing `TripDispatchScreen` component from Healthcare dashboard
- Archive system should be designed to scale (consider pagination for large archives)
- Healthcare facility identifier will enable future analytics features

---

## Next Steps

1. Review and approve this plan
2. Prioritize features based on business needs
3. Begin implementation with Feature 1 (Healthcare Organization Identifier)
4. Test each feature thoroughly before moving to next
5. Document any deviations from plan during implementation

