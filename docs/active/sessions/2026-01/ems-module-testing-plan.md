# EMS Module Testing Plan - January 10, 2026
**Status:** 📋 **READY FOR TESTING**

---

## Overview

**Previous:** ✅ Healthcare Module - Complete and verified working  
**Current:** ⏳ EMS Module - Ready for testing  
**Goal:** Verify EMS module functionality matches between local dev and dev-swa

---

## EMS Module Features to Test

### 1. Authentication & Login

**Test EMS User Login:**
- [ ] Login as EMS user (test@ems.com or similar)
- [ ] Verify login works on local dev
- [ ] Verify login works on dev-swa
- [ ] Verify redirect to EMS dashboard after login
- [ ] Verify session persistence

**Test EMS Registration (if applicable):**
- [ ] Access EMS registration page
- [ ] Fill out registration form
- [ ] Test GPS lookup (if available)
- [ ] Submit registration
- [ ] Verify registration success/failure handling

---

### 2. EMS Dashboard Navigation

**Dashboard Tabs/Features:**
- [ ] Dashboard overview/home
- [ ] Available Trips / Trip Requests
- [ ] Accepted Trips / My Trips
- [ ] Completed Trips
- [ ] Agency Information / Settings
- [ ] Unit Management (if applicable)
- [ ] Analytics / Reporting (if applicable)
- [ ] Sub-users Management (if applicable)

**Verify:**
- [ ] All tabs load without errors
- [ ] Navigation works correctly
- [ ] No console errors
- [ ] No 500 errors

---

### 3. Trip Management (Core EMS Functionality)

#### Available Trips / Trip Requests
- [ ] View available trips
- [ ] Trip details display correctly
- [ ] Accept trip functionality
- [ ] Decline trip functionality (if applicable)
- [ ] Trip status updates correctly

#### Accepted Trips / My Trips
- [ ] View accepted trips
- [ ] Trip details display correctly
- [ ] Update trip status
- [ ] Complete trip functionality
- [ ] Cancel trip functionality (if applicable)

#### Completed Trips
- [x] View completed trips ✅ **WORKING** (Verified Jan 10, 2026 - matches dev-swa)
- [x] Trip history displays correctly ✅ **WORKING**
- [ ] Can view trip details

---

### 4. Agency Information / Settings

**Agency Profile:**
- [ ] View agency information
- [ ] Edit agency information
- [ ] GPS lookup for address (if available)
- [ ] Save changes
- [ ] Verify changes persist

**Settings:**
- [ ] Update contact information
- [ ] Update service area
- [ ] Update capabilities
- [ ] Update operating hours
- [ ] Update pricing structure (if applicable)

---

### 5. GPS Lookup (If Available)

**Test GPS Lookup:**
- [ ] Navigate to agency information/settings
- [ ] Enter address fields
- [ ] Click "Lookup GPS" or similar
- [ ] Verify coordinates populate
- [ ] Test with invalid address (error handling)
- [ ] Verify coordinates save correctly

**Note:** Based on Healthcare module fixes, GPS lookup should work, but verify EMS-specific implementation.

---

### 6. Unit Management (If Applicable)

- [ ] View units list
- [ ] Add new unit
- [ ] Edit unit information
- [ ] Assign unit to trip
- [ ] Remove unit
- [ ] Unit status management

---

### 7. Sub-users Management (If Applicable)

- [ ] View sub-users list
- [ ] Add new sub-user
- [ ] Edit sub-user information
- [ ] Remove sub-user
- [ ] Manage sub-user permissions

---

### 8. Analytics / Reporting (If Applicable)

- [ ] View analytics dashboard
- [ ] Reports generate correctly
- [ ] Data displays accurately
- [ ] Date range filters work
- [ ] Export functionality (if available)

---

## Testing Approach

### Side-by-Side Comparison

**Method:**
1. Open local dev: `http://localhost:3000`
2. Open dev-swa: `https://dev.traccems.com`
3. Log into both with same EMS user credentials
4. Navigate through features in parallel
5. Compare:
   - Same menu items?
   - Same form fields?
   - Same data displayed?
   - Same behavior?
   - Same error handling?

---

## Known Issues to Watch For

### Based on Healthcare Module Experience:

1. **GPS Lookup Issues:**
   - May need same error handling fixes as Healthcare
   - Check if coordinates save correctly
   - Verify form data cleaning

2. **Database Schema Issues:**
   - Verify camelCase vs snake_case columns
   - Check for schema drift
   - Verify migrations applied

3. **Error Handling:**
   - Check for improved error messages
   - Verify error display in UI
   - Check console for errors

---

## Priority Testing Order

### High Priority (Core Functionality)
1. ✅ EMS user login
2. ✅ EMS dashboard loads
3. ✅ View available trips
4. ✅ Accept trip
5. ✅ View accepted trips
6. ✅ Complete trip

### Medium Priority (Important Features)
1. ⏳ Agency information/settings
2. ⏳ GPS lookup (if available)
3. ⏳ Edit agency information
4. ⏳ Sub-users management

### Low Priority (Nice to Have)
1. ⏳ Analytics/reporting
2. ⏳ Unit management (if applicable)
3. ⏳ Advanced features

---

## Success Criteria

### ✅ EMS Module Testing Successful When:

1. **Core Functionality:**
   - ✅ EMS login works on both environments
   - ✅ Dashboard loads without errors
   - ✅ Can view available trips
   - ✅ Can accept trips
   - ✅ Can complete trips
   - ✅ Trip status updates correctly

2. **Feature Parity:**
   - ✅ Local dev features match dev-swa features
   - ✅ Same menu items available
   - ✅ Same form fields available
   - ✅ Same behavior

3. **No Regressions:**
   - ✅ Healthcare module still works
   - ✅ No new errors introduced
   - ✅ Existing features unaffected

---

## Documentation

**Files to Update:**
- `checklist_20260109_dev_comparison.md` - Mark EMS items as tested
- Create EMS-specific testing results document
- Document any issues found

---

## Next Steps

1. ⏳ **Start Testing:** Begin with EMS login and dashboard
2. ⏳ **Test Core Features:** Trip acceptance and completion
3. ⏳ **Test Additional Features:** Agency settings, GPS lookup, etc.
4. ⏳ **Document Results:** Update checklist and create summary
5. ⏳ **Fix Issues:** If any issues found, fix and redeploy

---

**Status:** 📋 **READY FOR TESTING**  
**Date:** January 10, 2026  
**Previous:** ✅ Healthcare Module Complete  
**Current:** ⏳ EMS Module Testing
