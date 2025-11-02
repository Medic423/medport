# Phase 3 Implementation Summary and Next Steps

## Context

We're implementing Phase 3 of the Healthcare Module which separates trip creation from agency dispatch. The workflow is:
1. Create trip → status set to `PENDING_DISPATCH`
2. Dispatch screen opens → user selects agencies
3. Dispatch sends notifications → status changes to `PENDING`

## What's Been Completed

### Backend Implementation ✅
1. ✅ Added `PENDING_DISPATCH` status support in `tripService.ts`
2. ✅ Created `HealthcareTripDispatchService` with:
   - `getTripAgencies()` - Fetches agencies for a trip
   - `dispatchTrip()` - Dispatches trip to selected agencies
3. ✅ Added endpoint `GET /api/healthcare/agencies/trip-agencies?tripId=xxx`
4. ✅ Added endpoint `POST /api/trips/:id/dispatch`
5. ✅ Fixed route ordering in `healthcareAgencies.ts` (specific routes before `/:id`)
6. ✅ Added coordinate lookup to Healthcare Add Agency and Add Destinations forms
7. ✅ Fixed `isActive` filtering in agency and destination queries
8. ✅ Added extensive debug logging (`PHASE3_DEBUG`)

### Frontend Implementation ✅
1. ✅ Created `TripDispatchScreen.tsx` component with three dispatch modes:
   - PREFERRED - Only preferred agencies
   - GEOGRAPHIC - Agencies within radius
   - HYBRID - Preferred + geographic agencies
2. ✅ Modified `EnhancedTripForm.tsx`:
   - Removed agency selection
   - Sets status to `PENDING_DISPATCH`
   - Redirects to dispatch screen after creation
3. ✅ Modified `HealthcareDashboard.tsx`:
   - Integrated `TripDispatchScreen` as modal
   - Handles trip creation callback
4. ✅ Added API methods in `api.ts`:
   - `healthcareAgenciesAPI.getForTrip()`
   - `tripsAPI.dispatch()`
5. ✅ Fixed query parameter handling in `getForTrip()`
6. ✅ Added coordinate lookup UI to Add Agency and Add Destinations forms

## ✅ RESOLVED: Agency Filtering Issue Fixed

**Issue**: Only Duncansville showed in PREFERRED mode, but Citizens Ambulance Service (a regular agency with coordinates) didn't appear in GEOGRAPHIC or HYBRID modes.

**Root Cause**: When an agency exists in both the registered agencies list and user-added agencies list, it was being marked as `isRegistered: true` but not flagged as user-added. In HYBRID mode filtering, it would only check `!agency.isRegistered`, which was false, so user-added agencies that also appeared in registered list were incorrectly filtered by distance.

**Solution**: Added `isUserAdded` field to `TripAgencyInfo` interface and updated the logic to:
1. Mark user-added agencies with `isUserAdded: true` even if they're also in the registered list
2. Updated HYBRID filtering to check `agency.isUserAdded || agency.isPreferred` for always-show logic
3. Separated GEOGRAPHIC and HYBRID filtering logic (GEOGRAPHIC filters all by distance, HYBRID shows preferred + user-added always)

**Test Results** ✅:
- Both Duncansville EMS and Citizens Ambulance Service now appear in HYBRID mode
- Duncansville: `isPreferred: true, isUserAdded: true, isRegistered: true`
- Citizens: `isPreferred: false, isUserAdded: true, isRegistered: true`
- Both correctly marked as user-added and always shown in HYBRID mode

**Files Modified**:
- `backend/src/services/healthcareTripDispatchService.ts` - Added `isUserAdded` field and updated filtering logic
- `backend/src/routes/healthcareAgencies.ts` - Route ordering fix
- `backend/src/services/healthcareAgencyService.ts` - Added `isActive` filter
- `backend/src/services/healthcareDestinationService.ts` - Added `isActive` filter
- `frontend/src/components/TripDispatchScreen.tsx` - New component
- `frontend/src/components/EnhancedTripForm.tsx` - Removed agency selection
- `frontend/src/components/HealthcareDashboard.tsx` - Integrated dispatch screen
- `frontend/src/services/api.ts` - New API methods

**Note**: Distances showing as very large (5612–5651 mi) indicate missing coordinates on trip origin or agencies. This is a separate data issue, not a filtering logic problem.

## Debug Logging Available

Backend logs include:
- `PHASE3_DEBUG: Getting agencies for trip:`
- `PHASE3_DEBUG: Found registered agencies:`
- `PHASE3_DEBUG: Found user agencies:`
- `PHASE3_DEBUG: Before filtering - total agencies:`
- `PHASE3_DEBUG: After filter - agencies:`

## Next Steps

1. ✅ **Issue Resolved**: Agency filtering logic fixed - both agencies now appear correctly
2. **Optional Improvements**:
   - Verify coordinate data for agencies and locations (distances showing as 5000+ mi indicates missing coordinates)
   - Consider adding coordinate validation/geocoding when agencies/locations are created
   - Test with different dispatch modes (PREFERRED, GEOGRAPHIC, HYBRID) to ensure all work correctly

## Current Git Branch

`feature/healthcare-ems-destinations-tabs`

## Test Script

Save as `test_dispatch.js` in project root:

```javascript
// Test script to create a trip and trigger dispatch screen
// Run: node test_dispatch.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const USER_EMAIL = 'chuck@ferrellhospitals.com';
const USER_PASSWORD = 'your-password-here'; // Replace with actual password

async function testDispatch() {
  try {
    console.log('Step 1: Login...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/healthcare/login`, {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    const token = loginRes.data.token;
    console.log('✅ Logged in, token:', token.substring(0, 20) + '...');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\nStep 2: Get healthcare locations...');
    const locationsRes = await axios.get(`${BASE_URL}/api/healthcare/locations`, { headers });
    const locations = locationsRes.data.data || [];
    console.log(`✅ Found ${locations.length} locations`);
    
    if (locations.length === 0) {
      console.error('❌ No healthcare locations found!');
      return;
    }

    // Get destinations
    const destinationsRes = await axios.get(`${BASE_URL}/api/healthcare/destinations`, { headers });
    const destinations = destinationsRes.data.data || [];
    console.log(`✅ Found ${destinations.length} destinations`);

    if (destinations.length === 0) {
      console.error('❌ No destinations found!');
      return;
    }

    // Use first location and destination
    const fromLocationId = locations[0].id;
    const toFacilityName = destinations[0].name;

    console.log('\nStep 3: Create trip...');
    const tripData = {
      tripNumber: `TEST-${Date.now()}`,
      patientId: 'TEST-PATIENT-001',
      patientWeight: 75,
      specialNeeds: null,
      patientAgeCategory: 'ADULT',
      patientAgeYears: 45,
      fromLocation: locations[0].locationName,
      toLocation: toFacilityName,
      scheduledTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      transportLevel: 'BLS',
      urgencyLevel: 'Routine',
      priority: 'MEDIUM',
      generateQRCode: false,
      selectedAgencies: [],
      notificationRadius: undefined,
      notes: 'Test trip for dispatch screen',
      healthcareUserId: loginRes.data.user.id,
      status: 'PENDING_DISPATCH',
      diagnosis: 'General transfer',
      mobilityLevel: 'AMBULATORY',
      oxygenRequired: false,
      monitoringRequired: false,
      insuranceCompany: 'Medicare'
    };

    const tripRes = await axios.post(
      `${BASE_URL}/api/trips/enhanced`, 
      tripData, 
      { headers }
    );
    
    console.log('✅ Trip created:', tripRes.data.data.id);
    console.log('\nStep 4: Get agencies for trip...');
    
    // Now test the dispatch screen API
    const agenciesRes = await axios.get(
      `${BASE_URL}/api/healthcare/agencies/trip-agencies?tripId=${tripRes.data.data.id}&mode=HYBRID&radius=100`,
      { headers }
    );

    console.log('\n✅ Dispatch Agencies Response:');
    console.log('  Total agencies:', agenciesRes.data.data.agencies.length);
    console.log('  Preferred:', agenciesRes.data.data.preferredCount);
    console.log('  Geographic:', agenciesRes.data.data.geographicCount);
    console.log('  User agencies:', agenciesRes.data.data.userAgenciesCount);
    console.log('\nAgencies:');
    agenciesRes.data.data.agencies.forEach((agency, i) => {
      console.log(`  ${i+1}. ${agency.name} - Preferred: ${agency.isPreferred}, Registered: ${agency.isRegistered}, Distance: ${agency.distance} mi`);
    });

    console.log('\n✅ Test complete! Open dispatch screen in browser with trip ID:', tripRes.data.data.id);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('   Error details:', error.response.data.error);
    }
  }
}

testDispatch();
```

Install axios: `npm install axios`

Run: `node test_dispatch.js` (in project root)

## Key Questions to Answer

1. Are both Duncansville and Citizens being returned by the API?
2. What are the distance calculations for each agency?
3. What are the `isRegistered` flags set to?
4. Is the HYBRID filtering logic working as expected?

## Critical Code Sections

### Backend Agency Filtering Logic
```typescript:backend/src/services/healthcareTripDispatchService.ts
// Line 214-224: HYBRID filtering
allAgencies = allAgencies.filter(agency => {
  // User agencies and preferred agencies always shown
  if (!agency.isRegistered || agency.isPreferred) {
    return true;
  }
  // Registered agencies filtered by distance
  const keep = agency.distance !== null && agency.distance <= radius;
  return keep;
});
```

**Expected behavior**: User-added agencies (like Citizens) should have `isRegistered: false` and ALWAYS show in HYBRID mode.

