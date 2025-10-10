# TCC Phase 2 Implementation - Unit Assignment Frontend

## 🎯 **Current Status**
**Phase 1: Backend Foundation ✅ COMPLETED**
- Database schema updated with `arrivalTimestamp`, `departureTimestamp`, `assignedUnit` relations
- New `GET /api/units/on-duty` endpoint implemented and tested
- `PUT /api/trips/:id/status` extended with unit assignment validation
- Unit status management (AVAILABLE ↔ COMMITTED) working
- All backend APIs tested and functional

## 📋 **Phase 2: EMS Dashboard Updates - TO IMPLEMENT**

### **2.1 Unit Selection Modal**
Create a modal component that appears when EMS user clicks "Accept" on a trip:

**Location**: `frontend/src/components/UnitSelectionModal.tsx` (new file)
**Features**:
- Fetch available units from `GET /api/units/on-duty`
- Display unit list with: unit number, type, capabilities, current status
- Allow user to select one unit
- Show unit details (crew info, capabilities)
- Handle unit assignment via `PUT /api/trips/:id/status`

**API Integration**:
```typescript
// Fetch on-duty units
const response = await fetch('/api/units/on-duty', {
  headers: { Authorization: `Bearer ${token}` }
});

// Assign unit to trip
const assignResponse = await fetch(`/api/trips/${tripId}/status`, {
  method: 'PUT',
  headers: { 
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}` 
  },
  body: JSON.stringify({
    status: 'ACCEPTED',
    assignedUnitId: selectedUnitId,
    assignedAgencyId: user.id,
    acceptedTimestamp: new Date().toISOString()
  })
});
```

### **2.2 Enhanced Accept Trip Flow**
Modify the existing "Accept" button in EMS dashboard:

**File**: `frontend/src/components/EMSDashboard.tsx`
**Changes**:
- Replace direct accept with unit selection modal
- Update accept handler to open modal instead of direct API call
- Handle modal close/cancel scenarios
- Update trip status after successful unit assignment

**Current Accept Button Location**:
```typescript
// Find this in EMSDashboard.tsx around line 200-300
<button
  onClick={() => handleAcceptTrip(trip.id)}
  className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 hover:bg-green-200"
>
  Accept
</button>
```

### **2.3 My Trips Display Updates**
Enhance the "My Trips" tab to show assigned unit information:

**File**: `frontend/src/components/EMSDashboard.tsx`
**Updates**:
- Display assigned unit number in trip cards
- Show unit status (AVAILABLE, COMMITTED, etc.)
- Add unit details in trip information
- Update trip card layout to include unit info

**Trip Card Enhancement**:
```typescript
// Add to trip card display
{trip.assignedUnit && (
  <div className="text-sm text-blue-600">
    Assigned Unit: {trip.assignedUnit.unitNumber}
    <span className="ml-2 text-xs text-gray-500">
      ({trip.assignedUnit.type})
    </span>
  </div>
)}
```

### **2.4 Unit Status Management**
Add real-time unit status updates:

**Features**:
- Update unit status when accepting trips (AVAILABLE → COMMITTED)
- Update unit status when completing trips (COMMITTED → AVAILABLE)
- Show unit availability in units management tab
- Add unit status indicators in trip displays

### **2.5 Trip Status Flow Enhancement**
Update the trip status progression:

**New Flow**: `PENDING` → `ACCEPTED` → `IN_PROGRESS` → `COMPLETED`
**Implementation**:
- Add "Mark as In-Progress" button after unit assignment
- Add arrival/departure timestamp tracking
- Update trip status buttons and flow logic

## 🔧 **Technical Implementation Details**

### **New Components to Create**:
1. `UnitSelectionModal.tsx` - Unit selection interface
2. `UnitCard.tsx` - Individual unit display component
3. `TripStatusButtons.tsx` - Enhanced status button component

### **Files to Modify**:
1. `frontend/src/components/EMSDashboard.tsx` - Main dashboard updates
2. `frontend/src/services/api.ts` - Add unit-related API calls
3. `frontend/src/types/index.ts` - Add unit and trip interfaces

### **API Endpoints to Use**:
- `GET /api/units/on-duty` - Fetch available units (✅ implemented)
- `PUT /api/trips/:id/status` - Update trip with unit assignment (✅ implemented)
- `GET /api/units` - Get all units for management (✅ existing)

### **State Management**:
- Add unit selection state to EMSDashboard
- Add modal open/close state
- Add selected unit state
- Update trip state after assignment

## 🎯 **Success Criteria**
- [ ] EMS users can select units when accepting trips
- [ ] Unit assignment is properly validated and persisted
- [ ] My Trips shows assigned unit information
- [ ] Unit status updates in real-time
- [ ] Trip status flow works: PENDING → ACCEPTED → IN_PROGRESS → COMPLETED
- [ ] All existing functionality preserved

## 📁 **Project Structure**
```
/Users/scooper/Code/tcc-new-project/
├── frontend/src/components/
│   ├── EMSDashboard.tsx (modify)
│   ├── UnitSelectionModal.tsx (create)
│   ├── UnitCard.tsx (create)
│   └── TripStatusButtons.tsx (create)
├── frontend/src/services/
│   └── api.ts (modify)
├── frontend/src/types/
│   └── index.ts (modify)
└── docs/notes/
    └── trip_unit_enhancements.md (update progress)
```

## 🚀 **Implementation Order**
1. Create `UnitSelectionModal.tsx` component
2. Add unit API calls to `api.ts`
3. Modify `EMSDashboard.tsx` accept button flow
4. Update "My Trips" display with unit information
5. Add trip status progression buttons
6. Test complete unit assignment workflow
7. Update documentation with Phase 2 completion

## 📝 **Notes**
- Backend is fully ready and tested
- All API endpoints are functional
- Database schema supports all required operations
- Focus on frontend implementation and user experience
- Maintain existing UI/UX patterns and styling

## 🔗 **Git Branch**
Currently on: `feature/trip-unit-assignment`
Continue implementation on this branch, then merge to main when Phase 2 is complete.

---

**Ready to implement Phase 2: EMS Dashboard Updates!** 🎯
