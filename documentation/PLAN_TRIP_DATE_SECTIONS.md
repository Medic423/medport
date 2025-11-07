# Implementation Plan: Trip Date-Based Sections

## Requirement Summary

Split the Transport Requests list into two distinct sections based on the "Requested Pickup Time" (scheduledTime):

1. **"Today's Trips"** - Shows only trips where Requested Pickup Time is on the current date
2. **"Future Trips"** - Shows only trips where Requested Pickup Time is on a future date (after today)

## Clarifying Questions

### 1. Date Comparison Logic
- **Question:** How should we handle trips where Requested Pickup Time is in the past (before today)? Should these:
  - Be hidden entirely?
  - Go into "Today's Trips" if they're from today but time has passed?
  - Have a separate "Past Trips" section?
  - Be included based on status (e.g., if PENDING/IN_PROGRESS, show in Today's even if time passed)?

### 2. Time Zone Considerations
- **Question:** Should date comparison use:
  - Server time zone?
  - User's local browser time zone?
  - A specific time zone (e.g., facility time zone)?

### 3. Section Display Behavior
- **Question:** When a section has no trips, should we:
  - Show the section header with "No trips" message?
  - Hide the section entirely?
  - Show a placeholder message?

### 4. Status Filtering
- **Question:** Should the date-based sections respect the existing status filter (ALL, PENDING, ACCEPTED, etc.)?
  - For example: If user selects "PENDING" filter, should we show "Today's Trips (PENDING)" and "Future Trips (PENDING)"?

### 5. Edge Cases
- **Question:** How should we handle trips with `scheduledTime = null` or missing?
  - Exclude them from both sections?
  - Show them in a separate "Unscheduled" section?
  - Default to "Today's Trips"?

### 6. Both Dashboards
- **Question:** Should this change apply to:
  - ✅ Healthcare Dashboard "Transport Requests" section?
  - ✅ EMS Dashboard "Available Transport Requests" section?
  - ❌ Or both?

### 7. Section Ordering
- **Question:** Which section should appear first?
  - "Today's Trips" first (most urgent)?
  - "Future Trips" first (forward planning)?

### 8. Section Headers
- **Question:** Should section headers show:
  - Just the section name?
  - Section name + count? (e.g., "Today's Trips (5)")
  - Section name + date? (e.g., "Today's Trips - October 31, 2025")

## Implementation Plan

### Phase 1: Data Preparation
1. **Add date comparison utility function**
   - Function to check if a date is "today" (same calendar date)
   - Function to check if a date is "future" (after today)
   - Handle timezone considerations
   - Handle null/missing scheduledTime values

2. **Update trip data transformation**
   - Add a computed field `tripDateCategory: 'today' | 'future' | 'past' | 'unscheduled'`
   - This will be calculated when transforming trips from API response

### Phase 2: Component Updates - Healthcare Dashboard
1. **Modify `loadTrips()` function**
   - After transforming trips, categorize each trip by date
   - Group trips into: `todayTrips[]` and `futureTrips[]`

2. **Update `filteredTrips` logic**
   - Apply status filter to each section separately
   - Maintain separate filtered arrays for each section

3. **Update JSX rendering**
   - Replace single trip list with two sections:
     - Section 1: "Today's Trips" header + today's filtered trips
     - Section 2: "Future Trips" header + future filtered trips
   - Each section shows count (optional)
   - Each section handles empty state gracefully

### Phase 3: Component Updates - EMS Dashboard
1. **Modify `loadTrips()` function** (for available trips)
   - After transforming trips, categorize by date
   - Group into: `todayAvailableTrips[]` and `futureAvailableTrips[]`

2. **Update `filteredAvailableTrips` logic**
   - Filter each date section separately
   - Maintain separate filtered arrays

3. **Update JSX rendering**
   - Replace single trip list with two sections
   - Same structure as Healthcare Dashboard

### Phase 4: Edge Cases & Polish
1. **Handle null/missing scheduledTime**
   - Decide default behavior (likely exclude or show in "Today's")
   - Add user-friendly messaging if needed

2. **Empty state handling**
   - Create consistent empty state messages for each section
   - Consider hiding empty sections vs. showing message

3. **Performance considerations**
   - Ensure date comparisons are efficient
   - Consider memoization if needed

### Phase 5: Testing & Validation
1. **Test date boundary cases**
   - Trip exactly at midnight (today vs. tomorrow)
   - Trip in different time zones
   - Trips with missing scheduledTime

2. **Test filtering combinations**
   - Status filter + date sections
   - Multiple trips across different dates
   - Empty sections

## Technical Considerations

### Date Comparison Approach
```javascript
// Pseudo-code for date comparison
const isToday = (date: Date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isFuture = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tripDate = new Date(date);
  tripDate.setHours(0, 0, 0, 0);
  return tripDate > today;
};
```

### Component Structure (Conceptual)
```jsx
// Pseudo-code structure
<div>
  {/* Today's Trips Section */}
  <h3>Today's Trips ({todayTrips.length})</h3>
  {todayTrips.length > 0 ? (
    <div>{/* Render trips */}</div>
  ) : (
    <p>No trips scheduled for today</p>
  )}
  
  {/* Future Trips Section */}
  <h3>Future Trips ({futureTrips.length})</h3>
  {futureTrips.length > 0 ? (
    <div>{/* Render trips */}</div>
  ) : (
    <p>No future trips scheduled</p>
  )}
</div>
```

## Files to Modify

1. **Frontend Components:**
   - `frontend/src/components/HealthcareDashboard.tsx`
   - `frontend/src/components/EMSDashboard.tsx`

2. **Potential Utility File:**
   - `frontend/src/utils/dateUtils.ts` (if needed for reusable date functions)

## Questions for You

Please review the questions above and let me know your preferences. Once confirmed, I'll proceed with implementation based on your answers.

