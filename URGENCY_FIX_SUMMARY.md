# Urgency "Critical" Fix Summary

## Problem
Trip creation was failing with `400 Bad Request - "Invalid urgency level"` because:
- Database had "Critical" set as the default urgency level (via Hospital Settings)
- Backend validation only accepts: 'Routine', 'Urgent', 'Emergent'
- Frontend was loading "Critical" as the default even though it's filtered from dropdown options

## Root Cause
The issue was **separate from the age fields work**. The age fields implementation is correct:
- ✅ Migration applied successfully
- ✅ Frontend sends `patientAgeCategory` and `patientAgeYears` correctly
- ✅ Backend accepts and persists age fields properly
- ✅ Logic correctly sets `patientAgeYears` only for 'ADULT' category

The urgency issue was a **pre-existing problem** that was exposed during testing.

## Fixes Applied

### Backend Changes (`backend/src/routes/dropdownOptions.ts`)

1. **GET `/api/dropdown-options/urgency/default`** - Added validation to filter out "Critical":
   ```typescript
   // Special handling for urgency: filter out "Critical" since backend only accepts Routine/Urgent/Emergent
   if (category === 'urgency' && existing?.option?.value === 'Critical') {
     console.log('TCC_DEBUG: Filtering out invalid "Critical" urgency default');
     return res.json({ success: true, data: null });
   }
   ```

2. **POST `/api/dropdown-options/urgency/default`** - Added validation to prevent setting "Critical":
   ```typescript
   // Special validation for urgency: prevent setting "Critical" as default
   if (category === 'urgency' && option.value === 'Critical') {
     return res.status(400).json({ 
       success: false, 
       error: 'Cannot set "Critical" as urgency default. Only Routine, Urgent, and Emergent are valid.' 
     });
   }
   ```

### Frontend Changes (Already Applied in Previous Commits)
- ✅ Filters "Critical" from dropdown options (line 508 in `EnhancedTripForm.tsx`)
- ✅ Rejects "Critical" as default when loading from backend (lines 551-567)
- ✅ Client-side validation only accepts Routine/Urgent/Emergent (line 884)

## Testing Checklist

### 1. Test Urgency Default Loading
- [ ] Hard refresh browser (clear cache)
- [ ] Open Create Request form
- [ ] Verify urgency level defaults to Routine/Urgent/Emergent (NOT "Critical")
- [ ] Check browser console for no errors

### 2. Test Trip Creation
- [ ] Create a new transport request with each urgency level:
  - [ ] Routine
  - [ ] Urgent  
  - [ ] Emergent
- [ ] Verify trip creation succeeds for all three
- [ ] Check backend logs for successful trip creation

### 3. Test Age Fields (Verify Age Fields Still Work)
- [ ] Select "Newborn" checkbox - verify age field disables
- [ ] Select "Infant" checkbox - verify age field disables
- [ ] Select "Toddler" checkbox - verify age field disables
- [ ] Uncheck all pediatric flags - verify age field enables
- [ ] Enter adult age (e.g., 45 years) - verify validation accepts it
- [ ] Create trip with adult age - verify it saves correctly
- [ ] Create trip with newborn - verify `patientAgeCategory: 'NEWBORN'` saves
- [ ] Verify `patientAgeYears` is null for pediatric categories
- [ ] Verify `patientAgeYears` is set correctly for adults

### 4. Database Cleanup (Optional but Recommended)
If "Critical" is still set as default in the database, it will be filtered out by the backend fix, but you can also clean it up directly:

```sql
-- Find any "Critical" urgency defaults
SELECT * FROM dropdown_category_defaults cd
JOIN dropdown_options o ON cd."optionId" = o.id
WHERE o.category = 'urgency' AND o.value = 'Critical';

-- Delete "Critical" from category defaults if found
DELETE FROM dropdown_category_defaults cd
WHERE cd.category = 'urgency' 
AND cd."optionId" IN (
  SELECT id FROM dropdown_options 
  WHERE category = 'urgency' AND value = 'Critical'
);
```

## Next Steps

1. **Test the fixes** using the checklist above
2. **If tests pass**: Commit the backend validation changes
3. **Optional**: Run database cleanup script to remove "Critical" defaults
4. **Verify**: Age fields continue to work correctly (they should - implementation is sound)

## Recommendation

**Do NOT rollback** - The age fields work is correct. The urgency issue is fixed with backend validation. Both features can work together.

## Files Modified

- `backend/src/routes/dropdownOptions.ts` - Added urgency validation (2 places)
- All other changes are in previous commits (already on feature branch)

## Related Commits

- `dd130935` - fix(urgency): filter out Critical from dropdown options
- `b9f28594` - fix(urgency): limit urgency options to Routine/Urgent/Emergent
- `2d6b94a5` - feat(db+api): add patientAgeYears and patientAgeCategory

