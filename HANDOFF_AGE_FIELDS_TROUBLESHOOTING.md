# Handoff: Healthcare Create Request - Age Fields & Urgency Level Troubleshooting

## Current Branch
`feature/healthcare-create-request-age-secondary-insurance`

## What We've Accomplished

### ✅ Completed Changes

1. **UI Changes to Create Request Form** (`frontend/src/components/EnhancedTripForm.tsx`):
   - Removed blue "Patient Information" helper panel
   - Added three checkboxes: Newborn, Infant, Toddler
   - Added Age (years) field - positioned directly under Patient Weight
   - Changed "Special Needs" label to "Secondary Insurance" on Create Request screen
   - Age field disabled when any pediatric checkbox is checked
   - Age validation: 1-110 years required when none of the checkboxes are checked

2. **Backend/Database Changes**:
   - Added `patientAgeYears Int?` and `patientAgeCategory String?` to `TransportRequest` and `Trip` models in Prisma schemas
   - Created and successfully applied migration: `20251031133000_add_patient_age_fields`
   - Updated `EnhancedCreateTripRequest` interface to accept age fields
   - Updated `/api/trips/enhanced` route to accept and pass through `patientAgeYears` and `patientAgeCategory`
   - Updated `tripService.createEnhancedTrip` to persist age fields (only sets `patientAgeYears` when category is 'ADULT')

3. **Frontend API Integration**:
   - Updated `tripsAPI.createEnhanced` to use correct endpoint: `/api/trips/enhanced` (was incorrectly using `/api/trips/with-responses`)
   - Frontend calculates `patientAgeCategory` from checkboxes: 'NEWBORN' | 'INFANT' | 'TODDLER' | 'ADULT'
   - Frontend calculates `patientAgeYears` only when category is 'ADULT'
   - Added debug logging for payload inspection

4. **Settings Screen Updates**:
   - Changed "Special Needs" to "Secondary Insurance" in Hospital Settings dropdown category display (`HospitalSettings.tsx`)
   - Changed label in Healthcare Dashboard edit modal

5. **Database Migration History Fixes**:
   - Reconciled Prisma migration history by marking pre-existing migrations as applied
   - All migrations now deploy cleanly

### ⚠️ Current Issue Being Troubleshot

**Problem**: Trip creation fails with `400 Bad Request` - error: `"Invalid urgency level"`

**Root Cause Identified**: 
- Console logs show payload contains `urgencyLevel: "Critical"`
- Backend validation only accepts: 'Routine', 'Urgent', 'Emergent'
- The "Critical" value is being loaded from Hospital Settings default urgency option (set via `/api/dropdown-options/urgency/default`)
- Even though "Critical" is filtered out of the dropdown UI, it's still being set as the form's default value when loaded from backend

**Fixes Applied (Not Yet Committed)**:
1. Filtered "Critical" out of urgency dropdown options (even if backend returns it)
2. Updated client-side validation to only accept Routine/Urgent/Emergent
3. Updated priority mapping to remove "Critical" reference
4. **NEW**: Added filter in backend default loading to reject "Critical" and keep existing value instead

**Current Status**: 
- Latest fix (line 551-567 in `EnhancedTripForm.tsx`) should prevent "Critical" from being set as default urgency when loaded from Hospital Settings
- Needs testing to verify it resolves the 400 error

## Next Steps

1. **Test the Current Fix**:
   - Hard refresh browser (or restart dev servers if needed)
   - Create a new transport request
   - Verify urgency level is NOT "Critical" (should be Routine/Urgent/Emergent)
   - Confirm trip creation succeeds

2. **If Still Failing**:
   - Check console for `TCC_DEBUG: Enhanced payload being sent:` log
   - Verify `urgencyLevel` field shows Routine/Urgent/Emergent (not Critical)
   - Check `TCC_DEBUG: Error response data:` for exact backend error message
   - May need to remove "Critical" from Hospital Settings database if it's set as default

3. **If Successful**:
   - Commit the urgency level fixes
   - Test age fields: verify Newborn/Infant/Toddler checkboxes work, age field disabled when checked, adult age saves correctly
   - Verify Secondary Insurance label appears correctly throughout

4. **Optional Cleanup**:
   - Remove any "Critical" urgency entries from Hospital Settings dropdown options (via UI or direct DB cleanup)

## Key Files Modified (Uncommitted)

- `frontend/src/components/EnhancedTripForm.tsx` - Main form component with all changes
- `frontend/src/components/HealthcareDashboard.tsx` - Secondary Insurance label
- `frontend/src/components/HospitalSettings.tsx` - Secondary Insurance category name
- `frontend/src/services/api.ts` - Endpoint fix for createEnhanced
- `backend/prisma/schema.prisma` - Added age fields
- `backend/prisma/schema-production.prisma` - Added age fields (if needed)
- `backend/src/routes/trips.ts` - Accept age fields in enhanced endpoint
- `backend/src/services/tripService.ts` - Persist age fields

## Database Migration Applied

- Migration: `backend/prisma/migrations/20251031133000_add_patient_age_fields/migration.sql`
- Status: ✅ Successfully applied
- Columns added: `patientAgeYears INTEGER`, `patientAgeCategory TEXT` to both `transport_requests` and `trips` tables

## Testing Checklist

- [ ] Urgency level no longer defaults to "Critical"
- [ ] Trip creation succeeds with valid urgency level
- [ ] Age fields work: Newborn/Infant/Toddler checkboxes disable age field
- [ ] Adult age (1-110 years) saves correctly
- [ ] Secondary Insurance label appears correctly
- [ ] Age fields persist to database correctly

## Notes

- User prefers not to commit fixes until verified working
- All changes are on feature branch: `feature/healthcare-create-request-age-secondary-insurance`
- Migration history is healthy (all migrations applied successfully)
- Age field approach is simple: three checkboxes + direct entry years field (no months complexity)

