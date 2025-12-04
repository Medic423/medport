# Route Optimization Testing Plan - November 16, 2025

## Context
This session will focus on comprehensive testing of the Route Optimization module that was enhanced with:
- Agency selection for TCC/Admin users
- Automatic home base detection
- Current trip detection and auto-selection
- Return trip opportunity finding (single-leg and multi-leg)
- Proximity settings configuration
- Revenue & savings calculations
- Trip selection and metrics

## Pre-Testing Setup

### 1. Verify Environment
- [ ] Backend server is running on port 5001
- [ ] Frontend server is running on port 3000
- [ ] Database is accessible and contains test data
- [ ] At least one EMS agency has coordinates set (latitude/longitude)
- [ ] There are active trips in the system (PENDING, PENDING_DISPATCH, or ACCEPTED status)
- [ ] Some trips have facilities with coordinates set

### 2. Test Data Requirements
- [ ] At least 2-3 EMS agencies in the system
- [ ] At least one agency (e.g., "Altoona EMS") has home base coordinates configured
- [ ] Multiple trips with various statuses:
  - PENDING trips (for return opportunities)
  - PENDING_DISPATCH trips
  - ACCEPTED trips
  - At least one trip where an agency has ACCEPTED and isSelected=true (for current trips)
- [ ] Trips should have origin and destination facilities with coordinates
- [ ] Mix of transport levels (BLS, ALS, CCT) for revenue calculation testing

## Testing Procedure

### Test 1: Agency Selection (TCC/Admin Users)

**Objective**: Verify TCC/Admin users can select an EMS agency for optimization

**Steps**:
1. Log in as TCC/Admin user
2. Navigate to Transport Command → Route Optimization
3. Verify "Step 0: Select EMS Agency" dropdown is visible
4. Verify dropdown is populated with EMS agencies
5. Verify agencies show visual indicators (✓ for coordinates set, ⚠ for missing)
6. Select an agency (e.g., "Altoona EMS")
7. Verify agency name and coordinate status display below dropdown

**Expected Results**:
- Dropdown shows all active EMS agencies
- Agencies with coordinates show ✓ indicator
- Agencies without coordinates show ⚠ indicator
- Selecting an agency triggers loading of home base and current trips
- Selected agency info displays correctly

**Pass Criteria**: Agency can be selected, and selection triggers context loading

---

### Test 2: Home Base Loading

**Objective**: Verify home base coordinates load correctly for selected agency

**Steps**:
1. Select an EMS agency that has coordinates configured
2. Wait for "Loading agency context..." to complete
3. Check browser console for debug logs
4. Verify no error messages appear

**Expected Results**:
- Home base loads successfully
- No "Home base coordinates not available" error
- Console shows successful API call to `/api/optimize/agency/home-base`
- Backend logs show agency found with coordinates

**Pass Criteria**: Home base loads without errors, coordinates are available

**If Fails**: 
- Check Agency Settings → Agency Info to verify coordinates are set
- Check backend logs for API errors
- Verify agencyId is being passed correctly

---

### Test 3: Current Trips Detection

**Objective**: Verify system detects and displays current trips for selected agency

**Steps**:
1. Select an EMS agency
2. Wait for current trips to load
3. Check if "Current Outbound Trip" section appears OR "No Active Trips" message appears
4. If trips are found, verify trip details display correctly

**Expected Results**:
- If agency has active trips (ACCEPTED, IN_PROGRESS, COMPLETED with isSelected=true):
  - "Current Outbound Trip" section displays
  - Shows patient ID, origin, destination, status
  - Most recent trip is auto-selected
  - Starting location auto-sets to trip destination
- If no active trips:
  - "No Active Trips for Selected Agency" message appears
  - Message clarifies it's agency-specific
  - Message indicates manual location setting is still possible

**Pass Criteria**: Current trips are detected correctly OR appropriate message displays

**If Fails**:
- Check backend logs for `/api/optimize/agency/current-trips` endpoint
- Verify agency has trips with ACCEPTED response and isSelected=true
- Check trip statuses match filter criteria

---

### Test 4: Starting Location Setting

**Objective**: Verify starting location can be set manually or auto-set from trip

**Test 4A: Auto-set from Current Trip**
1. Select agency with active trip
2. Verify starting location auto-sets to trip destination
3. Verify "Step 1: Starting Location (Auto-set from Trip)" header appears
4. Verify coordinates display correctly

**Test 4B: Manual GPS Location**
1. Click "Get Current Location" button
2. Grant location permission if prompted
3. Verify location is captured and displayed
4. Verify coordinates are accurate

**Test 4C: Manual Facility Selection**
1. Select "Manual" location mode
2. Type facility name in search box
3. Select facility from dropdown
4. Verify location updates to facility coordinates

**Test 4D: Manual Address Entry**
1. Select "Manual" location mode
2. Enter address in text field
3. Click "Find Address"
4. Verify address is geocoded and location updates

**Expected Results**:
- All location setting methods work correctly
- Coordinates are displayed accurately
- Location updates trigger return opportunity search

**Pass Criteria**: All four location setting methods work without errors

---

### Test 5: Proximity Settings

**Objective**: Verify proximity radius and max legs settings work correctly

**Steps**:
1. Set a starting location
2. Locate "Proximity Settings" section
3. Adjust proximity radius slider (default: 25 miles)
4. Adjust max legs dropdown (default: 3)
5. Verify settings persist in localStorage
6. Refresh page and verify settings are restored

**Expected Results**:
- Slider adjusts proximity radius (10-100 miles)
- Dropdown adjusts max legs (1-5)
- Settings are saved to localStorage
- Settings persist across page refreshes
- Changing settings triggers new return opportunity search

**Pass Criteria**: Settings can be adjusted, saved, and restored

---

### Test 6: Return Trip Opportunities - Single-Leg

**Objective**: Verify single-leg return opportunities are found and displayed correctly

**Steps**:
1. Set starting location (e.g., destination of outbound trip)
2. Ensure home base is loaded
3. Wait for return opportunities to load
4. Check "Step 2: Select Return Trip Opportunities" section
5. Look for single-leg opportunities

**Expected Results**:
- Opportunities appear within proximity radius
- Each opportunity shows:
  - Patient ID
  - Transport level
  - Pickup location and distance from starting point
  - Dropoff location and distance to home base
  - Estimated revenue
  - Deadhead savings
  - Efficiency score
  - Visual route flow diagram
- Opportunities are sorted by efficiency/revenue
- "Top N" badges appear on best opportunities

**Pass Criteria**: Single-leg opportunities are found and displayed with all details

**If Fails**:
- Check backend logs for `/api/optimize/return-opportunities` endpoint
- Verify trips have coordinates set
- Check proximity radius isn't too small
- Verify trips are in PENDING, PENDING_DISPATCH, or ACCEPTED status

---

### Test 7: Return Trip Opportunities - Multi-Leg

**Objective**: Verify multi-leg sequences are found and displayed correctly

**Steps**:
1. Set starting location
2. Set proximity radius to 25+ miles
3. Set max legs to 3
4. Wait for opportunities to load
5. Look for multi-leg sequences (if available)

**Expected Results**:
- Multi-leg sequences appear if available
- Each sequence shows:
  - Expand/collapse functionality
  - Visual route flow (start → pickup → dropoff → ... → home)
  - Total revenue
  - Total deadhead savings
  - Efficiency score
  - Distance for each leg
  - "Best" or "High Value" badges
- Sequences are ranked by efficiency
- Detailed leg information when expanded

**Pass Criteria**: Multi-leg sequences are found and displayed correctly (if available)

**If No Multi-Leg Found**: This is expected if there aren't enough trips in proximity to form sequences

---

### Test 8: Opportunity Selection

**Objective**: Verify opportunities can be selected and metrics update

**Steps**:
1. Find return opportunities (single-leg or multi-leg)
2. Click checkbox to select an opportunity
3. Select multiple opportunities
4. Verify selection state persists
5. Check "Revenue & Savings Summary" section updates

**Expected Results**:
- Opportunities can be selected/deselected
- Selected opportunities are visually highlighted
- Revenue & Savings Summary shows:
  - Total Revenue
  - Deadhead Savings
  - Net Benefit
  - Total Savings
- Summary updates when selections change
- Comparison view toggle works (Empty Return vs Revenue Return)

**Pass Criteria**: Selection works, metrics update correctly

---

### Test 9: Revenue & Savings Calculations

**Objective**: Verify revenue and savings calculations are accurate

**Steps**:
1. Select one or more opportunities
2. Review "Revenue & Savings Summary" section
3. Toggle "Comparison View" to see detailed breakdown
4. Verify calculations:
   - Total Revenue = sum of selected trip revenues
   - Deadhead Savings = direct return distance - (pickup distance + dropoff distance)
   - Net Benefit = Total Revenue - Deadhead Cost
   - Fuel Savings = deadhead miles saved × fuel cost per mile

**Expected Results**:
- All calculations are mathematically correct
- Comparison view shows:
  - Empty Return (Direct) costs
  - Revenue Return costs and benefits
  - Side-by-side comparison
- Detailed breakdown shows:
  - Total distance
  - Trip distance
  - Deadhead miles
  - Fuel savings

**Pass Criteria**: All calculations are accurate and display correctly

---

### Test 10: Refresh Functionality

**Objective**: Verify refresh button reloads all data correctly

**Steps**:
1. Set up a complete optimization scenario:
   - Agency selected
   - Starting location set
   - Opportunities displayed
   - Some opportunities selected
2. Click "Refresh" button in header
3. Verify all data reloads:
   - Agencies reload
   - Agency context reloads (home base, current trips)
   - Return opportunities reload
   - Selected state is preserved (if applicable)

**Expected Results**:
- Refresh button triggers reload of all data
- No errors occur during refresh
- Data updates correctly
- Console shows debug logs for each reload step

**Pass Criteria**: Refresh works without errors, all data reloads

---

### Test 11: Error Handling

**Objective**: Verify error messages display appropriately

**Test 11A: Missing Coordinates**
1. Select an agency without coordinates
2. Verify error message appears
3. Verify message suggests updating Agency Settings

**Test 11B: No Opportunities Found**
1. Set starting location far from any trips
2. Set small proximity radius (10 miles)
3. Verify "No return trip opportunities found" message
4. Verify message suggests adjusting proximity radius

**Test 11C: API Errors**
1. Stop backend server
2. Try to load agency context
3. Verify error message displays
4. Restart backend
5. Verify recovery works

**Expected Results**:
- Error messages are clear and actionable
- Errors don't crash the UI
- Recovery is possible after fixing issues

**Pass Criteria**: Error handling works gracefully

---

### Test 12: EMS User Flow (Non-TCC)

**Objective**: Verify EMS users see simplified flow without agency selection

**Steps**:
1. Log in as EMS user
2. Navigate to Route Optimization
3. Verify "Step 0: Select EMS Agency" does NOT appear
4. Verify home base loads automatically
5. Verify current trips load automatically
6. Continue with normal flow

**Expected Results**:
- No agency selection step
- Agency context loads automatically from logged-in user
- All other functionality works the same

**Pass Criteria**: EMS users have streamlined experience

---

## Test Data Checklist

Before starting tests, ensure you have:

- [ ] **Agencies**:
  - At least 2 EMS agencies
  - At least 1 with coordinates set (for testing)
  - At least 1 without coordinates (for error testing)

- [ ] **Trips**:
  - 5+ PENDING trips (for return opportunities)
  - 1+ trip where agency has ACCEPTED and isSelected=true (for current trips)
  - Trips with various transport levels (BLS, ALS, CCT)
  - Trips with origin/destination facilities that have coordinates

- [ ] **Facilities**:
  - Origin facilities with coordinates
  - Destination facilities with coordinates
  - Mix of locations to create realistic proximity scenarios

## Success Criteria

All tests pass if:
1. ✅ Agency selection works for TCC/Admin users
2. ✅ Home base loads correctly
3. ✅ Current trips are detected (or appropriate message shown)
4. ✅ Starting location can be set via all methods
5. ✅ Proximity settings work and persist
6. ✅ Return opportunities are found and displayed
7. ✅ Single-leg opportunities show all details
8. ✅ Multi-leg sequences work (if available)
9. ✅ Opportunity selection updates metrics
10. ✅ Revenue & savings calculations are accurate
11. ✅ Refresh button works correctly
12. ✅ Error handling is graceful
13. ✅ EMS user flow works without agency selection

## Known Issues to Verify Fixed

- [ ] "Home base coordinates not available" error resolved
- [ ] Refresh button now reloads all data
- [ ] Warning message clarifies agency-specific trips
- [ ] Redundant action buttons removed
- [ ] DistanceService import fixed
- [ ] Optimization routes enabled in backend

## Next Steps After Testing

1. Document any bugs found
2. Create fixes for any issues
3. Re-test fixes
4. Update documentation with any changes
5. Consider performance optimizations if needed
6. Plan any additional features based on testing feedback

## Notes

- All console logs prefixed with `TCC_DEBUG:` for easy filtering
- Backend logs show detailed API call information
- Test with both TCC/Admin and EMS user types
- Test with various proximity radius settings
- Test with different numbers of available trips

---

**Session Goal**: Complete comprehensive testing of Route Optimization module and document any issues or improvements needed.

