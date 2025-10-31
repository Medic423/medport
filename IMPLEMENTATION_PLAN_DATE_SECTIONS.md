# Phased Implementation Plan: Date-Based Trip Sections

## Requirements Summary

**Sections to Create:**
1. **"Today's Trips - [Date]"** - Trips with Requested Pickup Time on current date
2. **"Future Trips - [Date Range or 'Future']"** - Trips with Requested Pickup Time after today
3. **"Unscheduled Trips"** - Trips without scheduledTime
4. **"Past Trips - [Date Range or 'Past']"** - Trips with Requested Pickup Time before today that are NOT completed/cancelled (delayed/overdue active trips)

**Note:** "Completed Trips" is a separate existing section (status = COMPLETED/CANCELLED) and is not part of this change.

### ✅ CONFIRMED: Past Trips Definition

**Past Trips** = Active trips that:
- **Have** a `scheduledTime` that exists
- **Have** a `scheduledTime` that is in the past (before today)
- Status is NOT COMPLETED/CANCELLED (still active: PENDING, ACCEPTED, IN_PROGRESS, etc.)
- These are trips that were scheduled but **never activated/authorized** by healthcare user in time
- They're now overdue/delayed beyond their scheduled pickup time
- Auto-delete after 36 hours old to prevent list from growing too large

**Example Scenario:**
1. Healthcare user creates trip with scheduledTime = tomorrow → Appears in "Future Trips"
2. Healthcare user forgets to activate/authorize it before the scheduled time
3. Scheduled time passes (now in past) → Trip automatically moves to "Past Trips"
4. Trip remains active (PENDING/ACCEPTED) but is now delayed
5. After 36 hours in Past Trips → Auto-deleted by cleanup job

**Key Features:**
- Date comparison uses facility timezone (Pennsylvania - Eastern Time)
- Status filters apply to each section independently
- Future trips have "Authorize/Make Active" button (Healthcare) that moves trip to Today's
- Future trips show "Awaiting Authorization" or hide Accept/Decline (EMS)
- Section headers include date in format: "Today's Trips - October 31, 2025"
- Show placeholders when sections are empty

---

## Phase 1: Backend - Date Utilities & Authorization Endpoint

### Step 1.1: Create Date Utility Functions
**File:** `backend/src/utils/dateUtils.ts`

**Tasks:**
- [ ] Create `isToday(date: Date, timezone?: string)` - Check if date is today in ET timezone
- [ ] Create `isFuture(date: Date, timezone?: string)` - Check if date is after today in ET
- [ ] Create `isPast(date: Date, timezone?: string)` - Check if date is before today in ET
- [ ] Create `getDateCategory(scheduledTime: Date | null)` - Returns 'today' | 'future' | 'past' | 'unscheduled'
- [ ] Create `formatSectionDate(date: Date)` - Returns "October 31, 2025" format
- [ ] Handle timezone conversion (Pennsylvania = America/New_York = Eastern Time)

**Testing:**
- Unit tests for all date utility functions
- Test edge cases: midnight boundaries, DST transitions, null values

### Step 1.2: Create Trip Authorization Endpoint
**File:** `backend/src/routes/trips.ts`

**Tasks:**
- [ ] Add `POST /api/trips/:id/authorize` endpoint
- [ ] Validate trip exists and is in 'future' category
- [ ] Update `scheduledTime` to current date/time (or specific time if needed)
- [ ] Log authorization action for audit trail
- [ ] Return updated trip data
- [ ] Add authentication middleware

**Logic:**
```typescript
// Pseudo-code
1. Verify trip exists and user has permission
2. Check if trip.scheduledTime is in future
3. Update scheduledTime to today (keep same time portion, or use current time)
4. Optionally: Change status if needed (e.g., PENDING → READY)
5. Save and return updated trip
```

**Testing:**
- Test authorization endpoint with valid future trip
- Test authorization fails for past/today trips
- Test authorization fails without proper permissions

---

## Phase 2: Frontend - Date Utilities & State Management

### Step 2.1: Create Frontend Date Utilities
**File:** `frontend/src/utils/dateUtils.ts`

**Tasks:**
- [ ] Port backend date utilities to frontend (or call API)
- [ ] Create `categorizeTripByDate(trip)` helper
- [ ] Create `formatSectionHeader(category, date)` helper
- [ ] Handle timezone consistently (browser will need to convert to ET)

**Testing:**
- Unit tests for date categorization
- Test with various date scenarios

### Step 2.2: Update Trip Data Transformation
**Files:** 
- `frontend/src/components/HealthcareDashboard.tsx`
- `frontend/src/components/EMSDashboard.tsx`

**Tasks:**
- [ ] Add `dateCategory` field during trip transformation
- [ ] Group trips into: `todayTrips[]`, `futureTrips[]`, `pastTrips[]`, `unscheduledTrips[]`
- [ ] **IMPORTANT:** Exclude COMPLETED/CANCELLED trips from date categorization (they go to existing "Completed Trips" section)
- [ ] **IMPORTANT:** Only include active trips (PENDING, ACCEPTED, IN_PROGRESS, DECLINED) in date sections
- [ ] **Past Trips Logic:** 
  - Must have `scheduledTime` that exists
  - `scheduledTime` must be before today (in past)
  - Status must be active (not COMPLETED/CANCELLED)
- [ ] **Unscheduled Trips Logic:**
  - `scheduledTime` is null or undefined
  - Status must be active (not COMPLETED/CANCELLED)
- [ ] Maintain existing fields and structure

**Testing:**
- Verify trips are correctly categorized
- Test with trips across different dates
- Verify COMPLETED trips don't appear in date sections
- Verify only active trips are categorized

---

## Phase 3: Healthcare Dashboard - Section Rendering & Authorization

### Step 3.1: Update Filtering Logic
**File:** `frontend/src/components/HealthcareDashboard.tsx`

**Tasks:**
- [ ] Modify `filteredTrips` to create separate filtered arrays for each section:
  - `filteredTodayTrips`
  - `filteredFutureTrips`
  - `filteredPastTrips`
  - `filteredUnscheduledTrips`
- [ ] Apply status filter to each section independently
- [ ] Update `useEffect` dependencies for filtering

**Testing:**
- Test filtering with status dropdown (ALL, PENDING, ACCEPTED, etc.)
- Verify each section filters independently

### Step 3.2: Add Authorization Handler
**File:** `frontend/src/components/HealthcareDashboard.tsx`

**Tasks:**
- [ ] Create `handleAuthorizeTrip(tripId)` function
- [ ] Call `POST /api/trips/:id/authorize` endpoint
- [ ] Update local state to move trip from Future to Today's section
- [ ] Show success/error feedback
- [ ] Refresh trip list after authorization

**Testing:**
- Test authorization button click
- Verify trip moves from Future to Today's section
- Test error handling (network errors, permission errors)

### Step 3.3: Update JSX - Section Rendering
**File:** `frontend/src/components/HealthcareDashboard.tsx`

**Tasks:**
- [ ] Replace single trip list with four sections:
  1. Today's Trips - [Current Date]
  2. Future Trips - "Future" or date range
  3. Unscheduled Trips
  4. Past Trips - "Past" or date range (at bottom)
- [ ] Add trip count to each section header
- [ ] Add "Authorize" or "Make Active" button to Future trips (replace Edit button or add new button)
- [ ] Hide/disable Edit button in Future trips (or keep it?)
- [ ] Add placeholder messages for empty sections
- [ ] Maintain existing Edit/Cancel functionality for Today's and Past trips

**Button Logic:**
```jsx
// Future Trips Section
{trip.dateCategory === 'future' && (
  <button onClick={() => handleAuthorizeTrip(trip.id)}>
    Make Active / Authorize
  </button>
)}
```

**Testing:**
- Visual test: All four sections render correctly
- Test empty sections show placeholders
- Test button appears only in Future trips section
- Test authorization flow end-to-end

---

## Phase 4: EMS Dashboard - Section Rendering & Button Logic

### Step 4.1: Update Filtering Logic
**File:** `frontend/src/components/EMSDashboard.tsx`

**Tasks:**
- [ ] Modify `filteredAvailableTrips` to create separate filtered arrays
- [ ] Apply status filter to each section independently
- [ ] Same structure as Healthcare Dashboard

**Testing:**
- Test filtering works for each section independently

### Step 4.2: Update Button Logic for Future Trips
**File:** `frontend/src/components/EMSDashboard.tsx`

**Tasks:**
- [ ] In Future Trips section: Hide Accept/Decline buttons
- [ ] Show "Awaiting Authorization" message or badge instead
- [ ] When trip moves to Today's (via Healthcare authorization), buttons reappear
- [ ] Handle real-time updates (polling or WebSocket if available)

**Button Logic:**
```jsx
// Future Trips - Hide buttons
{trip.dateCategory !== 'future' && (
  <>
    <button onClick={() => handleAcceptTrip(trip.id)}>Accept</button>
    <button onClick={() => handleDeclineTrip(trip.id)}>Decline</button>
  </>
)}

// Future Trips - Show message
{trip.dateCategory === 'future' && (
  <span className="text-yellow-600">Awaiting Authorization</span>
)}
```

**Testing:**
- Verify Accept/Decline buttons hidden in Future section
- Verify buttons visible in Today's section
- Test trip automatically appears in Today's after authorization

### Step 4.3: Update JSX - Section Rendering
**File:** `frontend/src/components/EMSDashboard.tsx`

**Tasks:**
- [ ] Replace single trip list with four sections (same as Healthcare)
- [ ] Add section headers with dates
- [ ] Add placeholder messages
- [ ] Add "Awaiting Authorization" indicator in Future section

**Testing:**
- Visual test: All sections render correctly
- Test button visibility per section

---

## Phase 5: Auto-Cleanup for Past Trips

### Step 5.1: Backend Cleanup Job/Endpoint
**File:** `backend/src/routes/trips.ts` or `backend/src/services/tripService.ts`

**Tasks:**
- [ ] Create endpoint or scheduled job to auto-delete Past Trips older than 36 hours
- [ ] Query trips where:
  - `scheduledTime` exists AND is before today (past scheduled time)
  - Status is NOT COMPLETED/CANCELLED (active trips only)
  - `scheduledTime` is more than 36 hours old (calculated from scheduledTime, not createdAt)
- [ ] Option 1: Soft delete (mark as deleted, archive) - **RECOMMENDED**
- [ ] Option 2: Hard delete (remove from database)
- [ ] Log cleanup actions for audit trail
- [ ] Add admin-only access or scheduled cron job

**Questions:**
- Should this be a scheduled cron job (runs automatically) or manual cleanup endpoint? → **RECOMMENDED: Cron job**
- Should we soft delete (archive) or hard delete? → **RECOMMENDED: Soft delete with archive flag**
- Should we notify users before deletion? → **RECOMMENDED: No notification (automatic cleanup)**

### Step 5.2: Frontend Cleanup Indicator
**Files:** Dashboard components

**Tasks:**
- [ ] Show warning badge/indicator on Past Trips section if trips are approaching 36 hours
- [ ] Display countdown or age indicator for past trips
- [ ] Optionally: Allow manual cleanup trigger (if manual endpoint)

**Testing:**
- Test cleanup job removes trips with past scheduledTime older than 36 hours
- Test cleanup does NOT remove completed/cancelled trips
- Test cleanup does NOT remove trips with scheduledTime less than 36 hours old
- Test cleanup does NOT remove trips with scheduledTime in future or today
- Test cleanup does NOT remove trips without scheduledTime (those stay in Unscheduled)

---

## Phase 6: Polish & Edge Cases

### Step 6.1: Empty State Handling
**Files:** Both dashboard components

**Tasks:**
- [ ] Create consistent placeholder component/message
- [ ] Style placeholders to be informative but not intrusive
- [ ] Consider hiding completely empty sections vs. showing placeholder

**Placeholder Examples:**
- "No trips scheduled for today"
- "No future trips scheduled"
- "No past trips"
- "No unscheduled trips"

### Step 6.2: Date Header Formatting
**Files:** Both dashboard components

**Tasks:**
- [ ] Format Today's section: "Today's Trips - October 31, 2025"
- [ ] Format Future section: "Future Trips" (or "Future Trips - Starting November 1, 2025")
- [ ] Format Past section: "Past Trips" (or "Past Trips - Before October 31, 2025")
- [ ] Format Unscheduled: "Unscheduled Trips"

### Step 6.3: Real-Time Updates
**Files:** Both dashboard components

**Tasks:**
- [ ] Ensure polling/refresh updates trip categories correctly
- [ ] Handle trip moving between sections after authorization
- [ ] Update counts in section headers dynamically

**Testing:**
- Test authorization triggers section update
- Test auto-refresh maintains correct categorization

### Step 6.4: Timezone Handling
**Files:** Date utilities (both frontend and backend)

**Tasks:**
- [ ] Verify timezone conversion works correctly
- [ ] Test with DST transitions
- [ ] Test with trips at midnight boundaries
- [ ] Document timezone assumptions

**Testing:**
- Test trips at 11:59 PM vs 12:00 AM
- Test trips on DST change dates
- Verify facility timezone is consistently applied

---

## Phase 7: Testing & Validation

### Step 7.1: Unit Tests
**Files:** Date utility functions

**Tests:**
- [ ] `isToday()` with various dates
- [ ] `isFuture()` with various dates
- [ ] `isPast()` with various dates
- [ ] `getDateCategory()` with null, today, future, past dates
- [ ] Timezone conversion accuracy

### Step 7.2: Integration Tests
**Files:** Backend authorization endpoint

**Tests:**
- [ ] Authorization endpoint accepts valid future trip
- [ ] Authorization updates scheduledTime correctly
- [ ] Authorization fails for non-future trips
- [ ] Authorization requires proper authentication

### Step 7.3: Component Tests
**Files:** Dashboard components

**Tests:**
- [ ] Trips categorized correctly on load
- [ ] Status filter applies to each section
- [ ] Authorization button appears only in Future section
- [ ] Accept/Decline buttons hidden in Future (EMS)
- [ ] Empty sections show placeholders
- [ ] Section headers show correct dates

### Step 7.4: End-to-End Tests
**Scenario 1: Authorization Flow**
1. Healthcare user creates trip for future date
2. Trip appears in "Future Trips" section
3. Healthcare user clicks "Make Active" button
4. Trip moves to "Today's Trips" section
5. EMS Dashboard shows trip in "Today's Trips" with Accept/Decline buttons

**Scenario 2: Filtering**
1. Create trips across different dates and statuses
2. Apply status filter (e.g., PENDING)
3. Verify each section shows only matching trips

**Scenario 3: Edge Cases**
1. Trip with scheduledTime = null appears in Unscheduled
2. Past trip appears in Past section
3. Trip exactly at midnight categorized correctly

---

## Implementation Checklist

### Backend
- [ ] Create date utility functions with timezone support
- [ ] Create authorization endpoint
- [ ] Add authorization endpoint tests
- [ ] Document timezone handling

### Frontend - Utilities
- [ ] Create frontend date utilities
- [ ] Add date utility tests

### Frontend - Healthcare Dashboard
- [ ] Update trip categorization
- [ ] Update filtering logic
- [ ] Add authorization handler
- [ ] Update JSX with four sections
- [ ] Add "Make Active" button to Future trips
- [ ] Add placeholder messages
- [ ] Test authorization flow

### Frontend - EMS Dashboard
- [ ] Update trip categorization
- [ ] Update filtering logic
- [ ] Hide Accept/Decline in Future section
- [ ] Add "Awaiting Authorization" indicator
- [ ] Update JSX with four sections
- [ ] Add placeholder messages
- [ ] Test button visibility

### Testing
- [ ] Unit tests for date utilities
- [ ] Integration tests for authorization
- [ ] Component tests for sections
- [ ] E2E test for authorization flow
- [ ] E2E test for filtering
- [ ] Edge case testing

### Documentation
- [ ] Update component documentation
- [ ] Document authorization flow
- [ ] Document timezone assumptions

---

## Testing Strategy

### Manual Testing Checklist

**Healthcare Dashboard:**
- [ ] Create trip for today → Appears in "Today's Trips"
- [ ] Create trip for tomorrow → Appears in "Future Trips"
- [ ] Create trip with scheduledTime = yesterday (active, not completed) → Appears in "Past Trips" at bottom
- [ ] Create trip without scheduledTime → Appears in "Unscheduled" (not Past)
- [ ] Verify trip with past scheduledTime but COMPLETED status → Does NOT appear in Past (stays in Completed tab)
- [ ] Create trip without scheduledTime → Appears in "Unscheduled"
- [ ] Verify COMPLETED trips do NOT appear in date sections (stay in Completed tab)
- [ ] Click "Make Active" on Future trip → Moves to Today's
- [ ] Apply status filter → Each section filters independently
- [ ] Verify section headers show dates
- [ ] Verify empty sections show placeholders
- [ ] Verify section order: Today's → Future → Unscheduled → Past (at bottom)

**EMS Dashboard:**
- [ ] Future trip shows "Awaiting Authorization"
- [ ] Future trip hides Accept/Decline buttons
- [ ] Today's trip shows Accept/Decline buttons
- [ ] After authorization, trip appears in Today's with buttons
- [ ] Apply status filter → Each section filters independently

**Edge Cases:**
- [ ] Trip at 11:59 PM categorized correctly
- [ ] Trip at 12:00 AM categorized correctly
- [ ] Multiple trips across dates categorized correctly
- [ ] Null scheduledTime handled gracefully

---

## Success Criteria

✅ **Functional:**
- Four sections display correctly
- Date categorization works accurately
- Authorization moves trips between sections
- Status filtering works per section
- Buttons show/hide correctly based on section

✅ **User Experience:**
- Section headers are clear with dates
- Empty states are helpful
- Authorization flow is intuitive
- No performance degradation

✅ **Technical:**
- Timezone handling is consistent
- Date comparisons are accurate
- State management is clean
- Code is testable and maintainable

---

## Estimated Implementation Order

1. **Phase 1** - Backend utilities & endpoint (Foundation)
2. **Phase 2** - Frontend utilities (Foundation)
3. **Phase 3** - Healthcare Dashboard (Complete one dashboard first)
4. **Phase 4** - EMS Dashboard (Replicate pattern)
5. **Phase 5** - Polish & edge cases (Refinement)
6. **Phase 6** - Testing (Validation)

Each phase should be tested before moving to the next.

