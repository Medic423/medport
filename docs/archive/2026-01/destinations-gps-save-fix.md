# Healthcare Destinations GPS Lookup & Save Fix

**Date:** January 10, 2026  
**Issue:** GPS lookup fails and save fails when adding destinations  
**Status:** ✅ **FIXED** - Code improvements applied

---

## Problem Summary

When adding a new Healthcare Destination:
1. **GPS Lookup Fails:** Clicking "GPS Lookup" button fails
2. **Save Fails:** Attempting to save destination fails (even without GPS lookup)

**Affected Environments:** Both local dev and dev-swa

---

## Root Cause Analysis

### Issue #1: Empty String Coordinates
**Problem:** When GPS lookup fails, frontend sets `latitude` and `longitude` to empty strings `""`. Backend code:
```typescript
let latitude = data.latitude ? parseFloat(String(data.latitude)) : null;
```
- Empty string `""` is truthy in JavaScript
- `parseFloat("")` returns `NaN`
- `NaN` is falsy, so condition `if (!latitude || !longitude)` triggers geocoding
- If geocoding also fails, `latitude` and `longitude` remain `NaN`
- Database rejects `NaN` values → Save fails

### Issue #2: Frontend Sending Empty Strings
**Problem:** Frontend sends empty strings for optional fields instead of omitting them or using `null`.

### Issue #3: Poor Error Handling
**Problem:** Generic error messages don't help diagnose issues.

---

## Fixes Applied

### Fix #1: Backend Coordinate Parsing
**File:** `backend/src/services/healthcareDestinationService.ts`

**Changes:**
- ✅ Properly handle empty strings (treat as null)
- ✅ Check for `NaN` values explicitly
- ✅ Only geocode if both coordinates are missing
- ✅ Set coordinates to `null` (not `NaN`) if geocoding fails

**Before:**
```typescript
let latitude = data.latitude ? parseFloat(String(data.latitude)) : null;
let longitude = data.longitude ? parseFloat(String(data.longitude)) : null;
```

**After:**
```typescript
let latitude: number | null = null;
let longitude: number | null = null;

if (data.latitude) {
  const parsedLat = parseFloat(String(data.latitude));
  if (!isNaN(parsedLat) && parsedLat !== 0) {
    latitude = parsedLat;
  }
}

if (data.longitude) {
  const parsedLng = parseFloat(String(data.longitude));
  if (!isNaN(parsedLng) && parsedLng !== 0) {
    longitude = parsedLng;
  }
}
```

### Fix #2: Frontend Data Cleaning
**File:** `frontend/src/components/HealthcareDestinations.tsx`

**Changes:**
- ✅ Clean up form data before sending to API
- ✅ Omit empty strings for optional fields
- ✅ Omit empty coordinate strings (let backend handle null)
- ✅ Reset form after successful save
- ✅ Better error message handling

**Before:**
```typescript
const response = await healthcareDestinationsAPI.create({
  ...addFormData,  // Includes empty strings
});
```

**After:**
```typescript
const cleanedData: any = {
  name: addFormData.name,
  type: addFormData.type,
  address: addFormData.address,
  city: addFormData.city,
  state: addFormData.state,
  zipCode: addFormData.zipCode,
  // Only include optional fields if they have values
  ...(addFormData.contactName && { contactName: addFormData.contactName }),
  ...(addFormData.phone && { phone: addFormData.phone }),
  ...(addFormData.email && { email: addFormData.email }),
  ...(addFormData.notes && { notes: addFormData.notes }),
  // Omit empty coordinate strings
  ...(addFormData.latitude && addFormData.latitude.trim() !== '' 
    ? { latitude: addFormData.latitude } 
    : {}),
  ...(addFormData.longitude && addFormData.longitude.trim() !== '' 
    ? { longitude: addFormData.longitude } 
    : {}),
};
```

### Fix #3: Improved Error Handling
**Files:** 
- `backend/src/routes/public.ts` (geocode endpoint)
- `backend/src/routes/healthcareDestinations.ts` (create endpoint)

**Changes:**
- ✅ More detailed error logging
- ✅ Better error messages for common issues (duplicate, invalid reference)
- ✅ Return 200 with `success: false` for geocoding errors (better frontend handling)
- ✅ Include error details in development mode

---

## Files Modified

1. **`backend/src/services/healthcareDestinationService.ts`**
   - Fixed coordinate parsing to handle empty strings and NaN
   - Improved geocoding fallback logic

2. **`frontend/src/components/HealthcareDestinations.tsx`**
   - Clean up form data before sending to API
   - Omit empty strings for optional fields
   - Reset form after successful save

3. **`backend/src/routes/public.ts`**
   - Improved error handling in geocode endpoint
   - Better error messages

4. **`backend/src/routes/healthcareDestinations.ts`**
   - Enhanced error handling with detailed messages
   - Better logging for debugging

---

## Testing Checklist

### GPS Lookup
- [ ] Fill in address, city, state, ZIP code
- [ ] Click "GPS Lookup" button
- [ ] Should either:
  - ✅ Successfully find coordinates and populate lat/lng fields
  - ✅ Show helpful error message (can still save without coordinates)

### Save Destination
- [ ] Fill in required fields (name, type, address, city, state, ZIP)
- [ ] Optionally fill optional fields (contact, phone, email, notes)
- [ ] With GPS coordinates:
  - [ ] Save should succeed
- [ ] Without GPS coordinates:
  - [ ] Save should succeed (backend will attempt geocoding)
  - [ ] If geocoding fails, destination still saves (coordinates remain null)

### Error Handling
- [ ] Invalid address → Should show helpful error message
- [ ] Missing required fields → Should show validation error
- [ ] Network error → Should show user-friendly error

---

## Expected Behavior After Fix

### GPS Lookup
- ✅ If address found: Coordinates populated, no error
- ✅ If address not found: Error message shown, can still save
- ✅ If service unavailable: Error message shown, can still save
- ✅ If timeout: Error message shown, can still save

### Save Destination
- ✅ With coordinates: Saves successfully
- ✅ Without coordinates: Backend attempts geocoding, saves with or without coordinates
- ✅ Empty coordinate strings: Treated as null, doesn't cause errors
- ✅ Form resets after successful save

---

## Next Steps

1. ✅ **Code Changes Applied** - All fixes implemented
2. ⏳ **Backend Restart** - Nodemon should auto-reload, but verify
3. ⏳ **Test GPS Lookup** - Verify lookup works or shows helpful errors
4. ⏳ **Test Save** - Verify save works with and without coordinates
5. ⏳ **Test on Dev-SWA** - Verify fixes work in production-like environment

---

**Status:** ✅ Ready for testing  
**Backend Auto-Reload:** Should auto-reload with nodemon (verify logs)
