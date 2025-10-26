# Session Handoff: Unit Scope Isolation Problems

**Date**: 2025-10-26  
**Branch**: `feature/restore-agency-bidding`  
**Status**: ✅ Simplified flow implemented - unit assignment moved to post-selection

---

## FIXES APPLIED (2025-10-26 Session)

### ✅ Fixed: Simplified Unit Assignment Flow
**Problem**: Unit assignment happening during bid acceptance created complex multi-agency unit isolation issues.  
**Solution**: Implemented simplified flow:
1. Healthcare creates trip → Status = PENDING
2. Agency accepts trip → No unit assignment yet
3. Healthcare selects agency → Trip status = ACCEPTED
4. Selected agency assigns unit → After healthcare makes selection

**Changes Made**:
- Removed UnitSelectionModal from EMS accept flow (`EMSDashboard.tsx`)
- Removed unit assignment from unit selection modal (`UnitSelectionModal.tsx`)
- Removed `assignedAgencyId` from trip update during unit assignment
- Accept button now only creates AgencyResponse record

### ✅ Fixed: Duplicate PUT Route Handlers
**File**: `backend/src/routes/units.ts`  
**Problem**: Had two handlers for `PUT /:id` - line 224 (no agencyId) and line 295 (with agencyId). Second handler was overriding first but not being called properly.  
**Solution**: Removed the first handler (lines 224-252), keeping only the one that passes `agencyId` to `updateUnit()`.  
**Result**: Unit updates now properly verify agency ownership before allowing changes.

### ✅ Fixed: Missing Agency Check in deleteUnit
**File**: `backend/src/services/unitService.ts`  
**Problem**: `deleteUnit()` method was deleting units without verifying they belong to the requesting agency.  
**Solution**: Added agency ownership verification (mirrors the logic in `updateUnit()`).  
**Result**: Deleting a unit now throws error "Unit does not belong to your agency" if attempting to delete another agency's unit.

### Testing Status
- ✅ Backend server restarted with fixes
- ⏳ Need to test: Simplified accept flow
- ⏳ Need to test: Unit assignment after healthcare selects agency
- ⏳ Need to test: Verify units are properly assigned to selected agency only

---

## Problem Statement

### Core Issue
When an EMS agency accepts a trip and assigns a unit, the **assigned unit name displays for all agencies** in the healthcare dashboard, not just the agency that assigned it. Additionally, **editing a unit name in one agency affects all agencies**, suggesting units aren't properly scoped to agencies.

### User Observations
- ✅ Unit names remain unique after browser reset (unit editing works for unique agencies)
- ✅ Backend has `assignedUnitId` field added to `AgencyResponse` table
- ❌ Healthcare dashboard shows same unit for both agencies (e.g., both show "Elk - 420")
- ❌ Unit assignment appears to be globally shared rather than per-agency

---

## Technical Context

### Database Schema Changes (COMPLETED)
```sql
-- Added to agency_responses table
ALTER TABLE agency_responses ADD COLUMN "assignedUnitId" TEXT REFERENCES units(id);

-- Schema changes in backend/prisma/schema.prisma
model AgencyResponse {
  ...
  assignedUnitId    String?   // Unit assigned by THIS agency
  assignedUnit      Unit?     @relation(fields: [assignedUnitId], references: [id])
}
```

### Key Architecture
- **Multi-Agency Bidding**: Multiple EMS agencies can accept the same trip
- **Agency Responses**: Each agency creates an `AgencyResponse` record when accepting
- **Unit Assignment**: Should be stored per `AgencyResponse`, not on the trip
- **Current Problem**: Units are either being shared or not properly scoped to agencies

---

## What We've Fixed So Far (All Verified Working)

### 1. ❌ Unit Editing Agency Isolation (NOT WORKING)
**Files**: `backend/src/routes/units.ts`  
**Attempted Fix**: Updated all unit routes (GET, POST, PUT, DELETE) to use `user.agencyId` instead of `user.id` for filtering  
**Status**: Still NOT working - editing a unit in one agency still updates it globally for all agencies

### 2. ✅ JWT Token Enhancement
**Files**: `backend/src/routes/auth.ts:730`  
**Fix**: Added `agencyId` to JWT token payload for EMS users  
**Status**: JWT now includes `agencyId` for proper filtering

### 3. ✅ Frontend Accept Button Logic
**Files**: `frontend/src/components/EMSDashboard.tsx`  
**Fix**: Changed button logic to check `hasResponded` instead of `assignedUnitId`  
**Status**: Prevents duplicate accepts, checks if agency already responded

### 4. ✅ Unit Assignment Storage
**Files**: 
- `backend/prisma/schema.prisma` - Added `assignedUnitId` field
- `frontend/src/components/UnitSelectionModal.tsx` - Updates AgencyResponse
- `backend/src/services/tripService.ts` - Handles `assignedUnitId` in updates

**Status**: Unit assignments now stored per agency response (not yet verified working end-to-end)

### 5. ✅ Healthcare Dashboard Display
**Files**: `frontend/src/components/HealthcareDashboard.tsx:822`  
**Fix**: Changed from `response.trip?.assignedUnit` to `response.assignedUnit`  
**Status**: Should display each agency's own assigned unit

### 6. ✅ Loading State for Trip Form
**Files**: `frontend/src/components/EnhancedTripForm.tsx`  
**Fix**: Added `loadingFormData` state to prevent race conditions  
**Status**: Prevents validation errors when data still loading

---

## What's NOT Working (Needs Debugging)

### Issue 1: Unit Editing Affects All Agencies
**Symptom**: Editing a unit name in one agency updates it for ALL agencies globally  
**Expected**: Unit changes should only affect that specific agency  
**Where It Happens**: PUT `/api/units/:id` endpoint

### Issue 2: Units Display Not Filtered by Agency
**Symptom**: When selecting a unit in the UnitSelectionModal, agencies see units from OTHER agencies  
**Expected**: Each agency should only see their own units  
**Where It Happens**: `/api/units/on-duty` endpoint

**Debug Logs Added**:
- `backend/src/routes/units.ts:126` - Logs user agency info  
- `backend/src/routes/units.ts:137` - Logs units returned with agency info

### Issue 3: Unit Assignment Not Per Agency
**Symptom**: Healthcare dashboard shows same unit for both agencies  
**Expected**: Each agency should show their own assigned unit  
**Where It Happens**: AgencyResponse rendering in Healthcare Dashboard

**Debug Logs Added**:
- `frontend/src/components/HealthcareDashboard.tsx:813` - Logs each agency response with assigned unit  
- `backend/src/services/tripService.ts:1081` - Logs unit assignment to agency response

### Issue 4: Unit Assignment Flow
**Symptom**: Unclear if unit assignment is being saved to the correct AgencyResponse record  
**Where It Happens**: 
- `frontend/src/components/UnitSelectionModal.tsx:62-82` - Fetches agency responses and updates the correct one

**Debug Logs Added**:
- `frontend/src/components/UnitSelectionModal.tsx:63-82` - Logs response lookup and update  
- `backend/src/services/tripService.ts:1093` - Logs successful update with unit info

---

## Next Steps for Debugging

### 1. Test the Complete Flow with Debug Logs
**Browser Console (F12)**:
- Watch for `UnitSelectionModal - Units with agency info:` - should show only that agency's units
- Watch for `UnitSelectionModal - Found agency responses:` - should find the right response
- Watch for `UnitSelectionModal - Updating agency response:` - should use correct response ID
- Watch for `HealthcareDashboard - Rendering agency response:` - should show different units for each agency

**Backend Logs** (`tail -f backend-output.log`):
- Watch for `Get on-duty units for EMS agency:` - should filter by correct agencyId
- Watch for `Found X units for agency:` - should show only that agency's units
- Watch for `Setting assignedUnitId on agency response:` - should update the correct record

### 2. Verify Database State
Check if units are actually being assigned per agency response:
```sql
SELECT ar.id, ar."agencyId", ar."assignedUnitId", e.name as agency_name, u."unitNumber" 
FROM agency_responses ar 
LEFT JOIN ems_agencies e ON ar."agencyId" = e.id 
LEFT JOIN units u ON ar."assignedUnitId" = u.id 
WHERE ar."tripId" = '<trip_id>' 
ORDER BY ar."responseTimestamp" DESC;
```

### 3. Verify JWT Token
Check if JWT includes agencyId:
```bash
# Decode JWT token (in browser console)
JSON.parse(atob(token.split('.')[1]))
# Should show: { id, email, userType, agencyId }
```

### 4. Check Unit Filtering
Verify units are filtered by agencyId:
```bash
# In browser console after login
const storedUser = JSON.parse(localStorage.getItem('user'));
console.log('My agencyId:', storedUser.agencyId);

# Should match the agency you're logged in as
```

### 5. Potential Issues to Check

**A. JWT Token Not Refreshing**
- User might be using old JWT without `agencyId`
- Solution: Log out and log back in to get fresh JWT

**B. Units Not Filtered in Database Query**
- `getOnDutyUnits()` might not be filtering by agencyId correctly
- Check: `backend/src/services/unitService.ts:440` - should filter by `agencyId`

**C. Agency Response Not Being Updated**
- The PUT request to `/api/agency-responses/:id` might be failing silently
- Check browser Network tab for request/response

**D. Unit Assignment Display Logic**
- Healthcare dashboard might not be reading the assignedUnit correctly
- Check: Is `response.assignedUnit` populated from backend?

---

## Files Modified

### Backend
- `backend/prisma/schema.prisma` - Added `assignedUnitId` to `AgencyResponse`
- `backend/src/routes/units.ts` - Use `user.agencyId` for all unit operations
- `backend/src/routes/auth.ts` - Include `agencyId` in JWT for EMS users
- `backend/src/services/tripService.ts` - Handle `assignedUnitId` in updates, include in queries

### Frontend  
- `frontend/src/components/EMSDashboard.tsx` - Check `hasResponded` instead of `assignedUnitId`
- `frontend/src/components/UnitSelectionModal.tsx` - Update AgencyResponse with unit, added debug logs
- `frontend/src/components/HealthcareDashboard.tsx` - Display `response.assignedUnit`, added debug logs
- `frontend/src/components/EnhancedTripForm.tsx` - Added loading state to prevent race conditions

---

## Current Workflow

1. **Healthcare creates trip** → Status = PENDING
2. **Agency A accepts** → Creates AgencyResponse with response = ACCEPTED, opens unit modal
3. **Agency A selects unit** → Updates AgencyResponse.assignedUnitId, trip stays PENDING
4. **Agency B accepts** → Creates separate AgencyResponse with response = ACCEPTED, opens unit modal  
5. **Agency B selects unit** → Updates their AgencyResponse.assignedUnitId, trip stays PENDING
6. **Healthcare selects agency** → Sets one AgencyResponse.isSelected = true, trip status = ACCEPTED

**Expected Behavior**: Each agency should see only their own units, and healthcare should see different units for each agency  
**Current Behavior**: Need to verify with debug logs

---

## Immediate Next Steps

1. **Test with fresh logins** to ensure JWT includes agencyId
2. **Monitor browser console** when selecting units
3. **Check backend logs** when units are fetched
4. **Verify database** to confirm units are being assigned per agency
5. **Identify exact point** where unit scoping breaks down

---

## Git Status

**Current Branch**: `feature/restore-agency-bidding`  
**Commits**: 10 commits ahead of origin  
**Status**: Partial fixes implemented, still debugging unit isolation

**What's Working**:
- Multi-agency bidding (agencies can accept same trip)
- JWT includes agencyId for filtering
- Accept button checks hasResponded
- Database schema supports per-agency unit assignment

**Still Broken**:
- Unit editing affects all agencies globally
- Units may appear in wrong agency's list
- Healthcare dashboard shows same unit for multiple agencies

**Recommended**: 
- Option A: Commit to branch and continue debugging (safer)
- Option B: Cherry-pick working features to main, continue debugging in branch (requires careful review)

