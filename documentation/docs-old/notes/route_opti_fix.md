# Route Optimization Enhancement - Backhaul/Return Trip Optimization

## Overview
Enhance the Route Optimization module to help EMS agencies find revenue-generating return trips instead of deadheading back to their home base empty. The system will automatically detect the agency's current outbound trip destination and find available trips that:
- Have pickup locations within proximity of the current destination
- Have dropoff locations within proximity of the agency's home base
- Generate revenue while minimizing deadhead miles

## User Requirements Confirmed
1. **Trip Selection**: Option A - Auto-detect the most recent active/completed trip for the logged-in EMS agency
2. **Proximity Thresholds**: Configurable in settings (default: 25 miles)
3. **Multi-leg Options**: Show all available options (single-leg and multi-leg sequences)
4. **Scope**: System-wide (all available trips in the system)

## Phased Implementation Plan

### Phase 1: Backend - Agency Context & Trip Detection
**Goal**: Add backend endpoints to support EMS agency context and trip detection

**Tasks**:
1. Create endpoint to get EMS agency home base coordinates
   - Endpoint: `GET /api/optimize/agency/home-base`
   - Returns: `{ lat, lng, agencyName, address }`
   - Uses authenticated user's agencyId to fetch from `EMSAgency` table

2. Create endpoint to get agency's active/completed trips
   - Endpoint: `GET /api/optimize/agency/current-trips`
   - Returns: List of trips where agency has `ACCEPTED` response and `isSelected: true`
   - Filters: `status IN ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED']`
   - Includes: trip details, destination coordinates, status

3. Create endpoint to find return trip opportunities
   - Endpoint: `POST /api/optimize/return-opportunities`
   - Request body:
     ```typescript
     {
       currentLocation: { lat: number, lng: number },
       homeBase: { lat: number, lng: number },
       proximityRadius: number, // miles
       maxLegs?: number // for multi-leg optimization
     }
     ```
   - Returns: Array of potential return trips with:
     - Trip details
     - Pickup proximity to current location
     - Dropoff proximity to home base
     - Estimated revenue
     - Deadhead savings
     - Route efficiency score

**Files to Modify**:
- `backend/src/routes/optimization.ts` - Add new endpoints
- `backend/src/services/distanceService.ts` - Add proximity calculation helpers

**Testing**:
- Test with EMS user logged in
- Verify agency coordinates are retrieved correctly
- Verify active trips are detected
- Verify return trip opportunities are calculated correctly

---

### Phase 2: Backend - Multi-leg Optimization Logic
**Goal**: Implement algorithm to find multi-leg return trip sequences

**Tasks**:
1. Create multi-leg optimization service
   - Function: `findMultiLegReturnTrips(currentLocation, homeBase, proximityRadius, maxLegs)`
   - Algorithm:
     - Find all trips with pickup within proximity of current location
     - For each trip, calculate dropoff location
     - Find trips with pickup within proximity of previous dropoff
     - Continue until dropoff is within proximity of home base
     - Calculate total revenue, total distance, efficiency score
   - Return: Array of sequences, sorted by efficiency score

2. Add distance calculation utilities
   - Calculate distance between two coordinates (Haversine formula)
   - Calculate total route distance for multi-leg sequences
   - Calculate deadhead savings vs. direct return

3. Add revenue estimation
   - Use trip transport level (BLS/ALS/CCT) to estimate revenue
   - Calculate total revenue for multi-leg sequences
   - Factor in deadhead miles cost

**Files to Create**:
- `backend/src/services/returnTripOptimizer.ts` - New service for return trip logic

**Files to Modify**:
- `backend/src/services/distanceService.ts` - Add multi-leg distance calculations
- `backend/src/routes/optimization.ts` - Integrate multi-leg endpoint

**Testing**:
- Test single-leg optimization
- Test multi-leg sequences (2-3 legs)
- Verify distance calculations are accurate
- Verify revenue calculations are reasonable

---

### Phase 3: Frontend - Auto-detect Current Trip
**Goal**: Automatically detect and display the agency's current outbound trip

**Tasks**:
1. Add state management for agency context
   - `homeBase`: Agency home base coordinates
   - `currentTrip`: Most recent active/completed trip
   - `currentLocation`: Destination of current trip (starting point for return)

2. Create API service methods
   - `getAgencyHomeBase()` - Fetch home base coordinates
   - `getCurrentTrips()` - Fetch agency's active trips
   - `findReturnOpportunities()` - Find return trip options

3. Update component initialization
   - On load, fetch agency home base
   - Fetch current active/completed trips
   - Auto-select most recent trip
   - Set starting location to trip destination

4. Add UI for current trip display
   - Show current outbound trip details
   - Display destination as starting point
   - Allow manual override if needed

**Files to Modify**:
- `frontend/src/components/TCCRouteOptimizer.tsx` - Add auto-detection logic
- `frontend/src/services/optimizationApi.ts` - Add new API methods

**Testing**:
- Verify auto-detection works for EMS users
- Verify fallback if no active trips
- Verify manual override works

---

### Phase 4: Frontend - Proximity Settings & Filtering
**Goal**: Add configurable proximity settings and filter trips by proximity

**Tasks**:
1. Add proximity settings to optimization settings
   - `pickupProximityRadius`: Default 25 miles
   - `dropoffProximityRadius`: Default 25 miles
   - `maxReturnLegs`: Default 3
   - Add to settings panel UI

2. Update trip filtering logic
   - Filter available trips by:
     - Pickup within `pickupProximityRadius` of current location
     - Dropoff within `dropoffProximityRadius` of home base
   - Display proximity distances in trip list
   - Sort by efficiency score

3. Add proximity indicators in UI
   - Show distance badges for each trip
   - Color code by proximity (green = close, yellow = medium, red = far)
   - Display "Within X miles" labels

**Files to Modify**:
- `frontend/src/components/TCCRouteOptimizer.tsx` - Add proximity filtering
- `frontend/src/types/optimization.ts` - Add proximity settings to `OptimizationSettings`

**Testing**:
- Test with different proximity settings
- Verify trips are filtered correctly
- Verify proximity distances are displayed accurately

---

### Phase 5: Frontend - Multi-leg Display & Selection
**Goal**: Display and allow selection of multi-leg return trip sequences

**Tasks**:
1. Update return trip results display
   - Show single-leg options
   - Show multi-leg sequences (2+ legs)
   - Display for each option:
     - Total revenue
     - Total distance
     - Deadhead savings
     - Efficiency score
     - Route visualization (text-based)

2. Add route visualization component
   - Display route as: `Current → Trip A → Trip B → Home Base`
   - Show distances between legs
   - Show revenue for each leg
   - Highlight best option

3. Add selection and optimization
   - Allow selecting single-leg or multi-leg option
   - Calculate optimized route order
   - Display final route with timing estimates

**Files to Modify**:
- `frontend/src/components/TCCRouteOptimizer.tsx` - Add multi-leg display
- `frontend/src/types/optimization.ts` - Add multi-leg result types

**Files to Create**:
- `frontend/src/components/ReturnTripCard.tsx` - Component for displaying return trip options

**Testing**:
- Verify single-leg options display correctly
- Verify multi-leg sequences display correctly
- Verify route visualization is clear
- Verify selection and optimization work

---

### Phase 6: Frontend - Revenue & Savings Calculations
**Goal**: Display revenue potential and deadhead savings for return trips

**Tasks**:
1. Add revenue calculation display
   - Show estimated revenue for selected return trip(s)
   - Compare to deadhead cost (empty return)
   - Show net benefit

2. Add savings calculator
   - Calculate deadhead miles saved
   - Calculate fuel cost savings
   - Calculate revenue generated
   - Display total benefit

3. Add comparison view
   - Show: "Empty Return" vs "Revenue Return"
   - Side-by-side comparison
   - Highlight savings

**Files to Modify**:
- `frontend/src/components/TCCRouteOptimizer.tsx` - Add revenue/savings display
- `frontend/src/components/ReturnTripCard.tsx` - Add savings calculations

**Testing**:
- Verify revenue calculations are accurate
- Verify savings calculations are reasonable
- Verify comparison view is clear

---

### Phase 7: Integration & Polish
**Goal**: Integrate all features and polish the UI

**Tasks**:
1. Update main optimization flow
   - Replace manual location selection with auto-detection
   - Update "Step 1" to show current trip
   - Update "Step 2" to show filtered return trips
   - Update optimization button to work with new flow

2. Add error handling
   - Handle case where no active trips exist
   - Handle case where no return opportunities found
   - Handle case where agency has no home base coordinates

3. Add loading states
   - Show loading while fetching agency info
   - Show loading while calculating return opportunities
   - Show loading while optimizing routes

4. Update documentation
   - Update component comments
   - Add user-facing help text
   - Document settings options

**Files to Modify**:
- `frontend/src/components/TCCRouteOptimizer.tsx` - Final integration
- All related components - Error handling and loading states

**Testing**:
- End-to-end testing with real EMS user
- Test all error scenarios
- Verify UI is intuitive and clear
- Performance testing with many trips

---

## Technical Notes

### Data Flow
1. User logs in as EMS agency
2. System fetches agency home base coordinates (`EMSAgency.latitude`, `EMSAgency.longitude`)
3. System fetches agency's active/completed trips (via `agency_responses` table)
4. System uses most recent trip's destination as starting point
5. System searches all available trips for return opportunities
6. System filters by proximity to current location and home base
7. System calculates multi-leg sequences
8. System displays options sorted by efficiency

### Key Algorithms
- **Proximity Filtering**: Haversine formula for distance calculation
- **Multi-leg Optimization**: Recursive search with backtracking
- **Efficiency Scoring**: `(Total Revenue - Deadhead Cost) / Total Distance`

### Database Queries
- Get agency: `SELECT latitude, longitude FROM ems_agencies WHERE id = ?`
- Get current trips: Join `transport_requests` with `agency_responses` WHERE `agencyId = ? AND response = 'ACCEPTED' AND isSelected = true`
- Get available trips: `SELECT * FROM transport_requests WHERE status IN ('PENDING', 'PENDING_DISPATCH')`

### API Endpoints Summary
- `GET /api/optimize/agency/home-base` - Get agency home base
- `GET /api/optimize/agency/current-trips` - Get agency's active trips
- `POST /api/optimize/return-opportunities` - Find return trip opportunities

---

## Testing Checklist

### Phase 1 Testing
- [ ] Agency home base endpoint returns correct coordinates
- [ ] Current trips endpoint returns correct trips
- [ ] Return opportunities endpoint calculates correctly

### Phase 2 Testing
- [ ] Single-leg optimization works
- [ ] Multi-leg sequences are found correctly
- [ ] Distance calculations are accurate
- [ ] Revenue calculations are reasonable

### Phase 3 Testing
- [ ] Auto-detection works for EMS users
- [ ] Current trip is displayed correctly
- [ ] Manual override works if needed

### Phase 4 Testing
- [ ] Proximity settings are saved and applied
- [ ] Trips are filtered correctly by proximity
- [ ] Proximity distances are displayed accurately

### Phase 5 Testing
- [ ] Single-leg options display correctly
- [ ] Multi-leg sequences display correctly
- [ ] Route visualization is clear
- [ ] Selection works correctly

### Phase 6 Testing
- [ ] Revenue calculations are accurate
- [ ] Savings calculations are reasonable
- [ ] Comparison view is clear

### Phase 7 Testing
- [ ] End-to-end flow works smoothly
- [ ] Error handling works correctly
- [ ] Loading states display properly
- [ ] UI is intuitive and polished

---

## Future Enhancements (Out of Scope)
- Real-time trip updates
- Push notifications for new return opportunities
- Historical return trip analytics
- Integration with dispatch system
- Mobile app support

---

## Status Tracking

- [x] Phase 1: Backend - Agency Context & Trip Detection ✅ COMPLETED
- [x] Phase 2: Backend - Multi-leg Optimization Logic ✅ COMPLETED
- [x] Phase 3: Frontend - Auto-detect Current Trip ✅ COMPLETED
- [x] Phase 4: Frontend - Proximity Settings & Filtering ✅ COMPLETED
- [x] Phase 5: Frontend - Multi-leg Display & Selection ✅ COMPLETED
- [x] Phase 6: Frontend - Revenue & Savings Calculations ✅ COMPLETED
- [ ] Phase 7: Integration & Polish

---

## Notes
- All proximity distances are in miles
- Default proximity radius: 25 miles (configurable)
- Multi-leg sequences limited to 3 legs by default (configurable)
- Revenue estimation based on transport level (BLS/ALS/CCT)
- Deadhead cost calculated as: `deadheadMiles * costPerMile`

