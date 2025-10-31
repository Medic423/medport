# New Chat Prompt: Implement Date-Based Trip Sections

## Context Reference
See `IMPLEMENTATION_PLAN_DATE_SECTIONS.md` for the complete phased implementation plan.

## Current State Summary

### Completed Work
- ✅ Label updates: "Request Time" → "Ticket Created At", "Scheduled Time" → "Requested Pickup Time"
- ✅ Display formatting updated in HealthcareDashboard and EMSDashboard with proper format
- ✅ Priority pills/badges implemented in EMS Dashboard
- ✅ Past Trips definition confirmed: Active trips with `scheduledTime` in the past (overdue/delayed, never activated)

### Current Trip Data Structure
- **Backend:** `backend/src/services/tripService.ts` - `getTrips()` method returns trips with `scheduledTime` field
- **Frontend:** 
  - `HealthcareDashboard.tsx` - Fetches via `api.get('/api/trips')`, filters by status
  - `EMSDashboard.tsx` - Fetches via `api.get('/api/trips?status=PENDING')` for available trips
- **Trip Fields:** `scheduledTime`, `status`, `createdAt`, `patientId`, `origin`, `destination`, `pickupLocation`, `transportLevel`, `urgencyLevel`, `requestTime`

### Key Requirements (from Plan)
1. **Four Sections:** Today's Trips, Future Trips, Unscheduled Trips, Past Trips (at bottom)
2. **Timezone:** Pennsylvania = America/New_York (Eastern Time)
3. **Status Filtering:** Apply to each section independently
4. **Authorization Flow:** Healthcare "Make Active" button moves Future → Today's
5. **EMS Display:** Hide Accept/Decline in Future, show "Awaiting Authorization"
6. **Auto-Cleanup:** Past Trips older than 36 hours (based on `scheduledTime`)

## Implementation Start Point

### Phase 1: Backend - Date Utilities & Authorization Endpoint
**Start Here:**
1. Create `backend/src/utils/dateUtils.ts` with timezone-aware date functions
2. Add `POST /api/trips/:id/authorize` endpoint in `backend/src/routes/trips.ts`

### Important Reminders
- Use separate git branch (per user preferences/memories)
- Get explicit approval before making changes (per user preferences)
- Test each phase before proceeding
- Don't commit until user confirms testing
- Use `/scripts/start-dev-complete.sh` to restart services

## Files to Modify (In Order)

### Backend
1. `backend/src/utils/dateUtils.ts` (NEW - create)
2. `backend/src/routes/trips.ts` (ADD authorization endpoint)
3. `backend/src/services/tripService.ts` (OPTIONAL - add helper methods if needed)

### Frontend
4. `frontend/src/utils/dateUtils.ts` (NEW - create or port from backend)
5. `frontend/src/components/HealthcareDashboard.tsx` (MODIFY - add categorization, sections, authorization)
6. `frontend/src/components/EMSDashboard.tsx` (MODIFY - add categorization, sections, button logic)

### Testing
- Create test scripts to verify date categorization
- Manual test authorization flow end-to-end

## Critical Details

### Past Trips Logic
- Must have `scheduledTime` that exists AND is before today
- Status must be active (NOT COMPLETED/CANCELLED)
- Auto-delete based on `scheduledTime` age (not `createdAt`)

### Unscheduled Trips Logic
- `scheduledTime` is null or undefined
- Status must be active (NOT COMPLETED/CANCELLED)

### Section Order
1. Today's Trips
2. Future Trips
3. Unscheduled Trips
4. Past Trips (at bottom)

### Section Headers
Format: "Today's Trips - October 31, 2025" (include date)

## Questions to Clarify (If Needed)
- Should authorization endpoint update `scheduledTime` to current time, or keep same time portion but change date to today?
- Should Edit button be hidden or disabled in Future Trips section?
- Should auto-cleanup be a cron job or manual endpoint? (Plan recommends cron job with soft delete)

## Success Criteria
- ✅ Four sections display correctly with proper categorization
- ✅ Authorization moves trips between sections
- ✅ Status filtering works independently per section
- ✅ Buttons show/hide correctly (Future trips hide Accept/Decline in EMS)
- ✅ Timezone handling is consistent (Eastern Time)
- ✅ Empty sections show helpful placeholders

---

**Ready to start Phase 1? Begin with backend date utilities and authorization endpoint.**
