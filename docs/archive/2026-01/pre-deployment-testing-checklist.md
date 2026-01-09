# Pre-Deployment Testing Checklist - January 3, 2026

## Status: Ready for Final Testing Before Dev-SWA Deployment

---

## ✅ Completed Changes

### GPS Lookup Improvements
1. ✅ **HealthcareRegistration.tsx** - Removed coordinate requirement, added non-blocking errors, improved timeout
2. ✅ **HealthcareLocationSettings.tsx** - Improved error handling, 30s timeout
3. ✅ **HealthcareDestinations.tsx** - Improved error handling, 30s timeout
4. ✅ **Hospitals.tsx** - Improved error handling, 30s timeout
5. ✅ **AgencySettings.tsx** - Improved error handling, 30s timeout
6. ✅ **HealthcareEMSAgencies.tsx** - Improved error handling, 30s timeout

### Active/Inactive Functionality
7. ✅ **Hospitals.tsx** - Added Active checkbox, fixed to update healthcareLocation records
8. ✅ **Agencies.tsx** - Added Active checkbox

### Backend Fixes
9. ✅ **Healthcare Registration** - Now creates healthcareLocation records
10. ✅ **Healthcare Locations Endpoint** - Returns all locations (not just active)
11. ✅ **Admin Update Endpoint** - Created `/api/healthcare/locations/:id/admin` for admin updates

---

## 🧪 Testing Checklist

### Priority 1: Healthcare Registration (Critical)

#### Test 1.1: GPS Lookup Success ✅
- [ ] Navigate to Healthcare Registration
- [ ] Fill in all required fields
- [ ] Use address: "123 Main St, Altoona, PA 16601"
- [ ] Click "Lookup Coordinates"
- [ ] Verify coordinates populate automatically
- [ ] Verify no error messages appear

#### Test 1.2: GPS Lookup Failure (Non-Blocking) ✅
- [ ] Navigate to Healthcare Registration
- [ ] Fill in all required fields
- [ ] Use address: "Test Address, Test City, XX 00000"
- [ ] Click "Lookup Coordinates"
- [ ] Verify BLUE informational error appears (not red blocking)
- [ ] Verify message says "You can still create the account and add coordinates later"
- [ ] Verify form can still be submitted

#### Test 1.3: Account Creation Without Coordinates ✅
- [ ] Navigate to Healthcare Registration
- [ ] Fill in all required fields
- [ ] Skip GPS lookup or let it fail
- [ ] Click "Create Account"
- [ ] Verify YELLOW warning appears
- [ ] Verify account creation succeeds
- [ ] Verify success message shows GPS coordinate status

#### Test 1.4: New Facility Appears in Facilities List ✅
- [ ] After creating a new healthcare facility
- [ ] Log in as Command user
- [ ] Navigate to Command → Healthcare → Facilities List
- [ ] Change Status filter to "All Status"
- [ ] Verify new facility appears in the list
- [ ] Verify it shows as "Inactive" status

---

### Priority 2: Active/Inactive Functionality

#### Test 2.1: Healthcare Facility Activation/Deactivation ✅
- [ ] Navigate to Command → Healthcare → Facilities List
- [ ] Click "Edit" on a facility (e.g., "Penn Highlands Mon Valley")
- [ ] Uncheck "Active Facility" checkbox
- [ ] Click "Update Facility"
- [ ] Verify facility shows as "Inactive" in the list
- [ ] Edit again and check "Active Facility"
- [ ] Verify facility shows as "Active" in the list

#### Test 2.2: EMS Agency Activation/Deactivation ✅
- [ ] Navigate to Command → EMS → Agencies List
- [ ] Click "Edit" on an agency
- [ ] Uncheck "Active Agency" checkbox
- [ ] Click "Save Changes"
- [ ] Verify agency shows as "Inactive" in the list
- [ ] Edit again and check "Active Agency"
- [ ] Verify agency shows as "Active" in the list

---

### Priority 3: GPS Lookup in Settings Components

#### Test 3.1: HealthcareLocationSettings ✅
- [ ] Log in as Healthcare user
- [ ] Navigate to Settings → Locations
- [ ] Add or edit a location
- [ ] Test GPS lookup with valid address
- [ ] Test GPS lookup with invalid address
- [ ] Verify errors are informational (not blocking)
- [ ] Verify can save without coordinates

#### Test 3.2: HealthcareDestinations ✅
- [ ] Log in as Healthcare user
- [ ] Navigate to Destinations
- [ ] Add or edit a destination
- [ ] Test GPS lookup with valid address
- [ ] Test GPS lookup with invalid address
- [ ] Verify errors are informational (not blocking)
- [ ] Verify can save without coordinates

#### Test 3.3: Hospitals (Command) ✅
- [ ] Log in as Command user
- [ ] Navigate to Command → Healthcare → Facilities List
- [ ] Edit a facility
- [ ] Test GPS lookup with valid address
- [ ] Test GPS lookup with invalid address
- [ ] Verify errors are informational (not blocking)
- [ ] Verify can save without coordinates

#### Test 3.4: AgencySettings (EMS) ✅
- [ ] Log in as EMS user
- [ ] Navigate to Agency Info
- [ ] Test GPS lookup with valid address
- [ ] Test GPS lookup with invalid address
- [ ] Verify errors are informational (not blocking)
- [ ] Verify can save without coordinates

#### Test 3.5: HealthcareEMSAgencies ✅
- [ ] Log in as Healthcare user
- [ ] Navigate to EMS Agencies
- [ ] Add or edit an agency
- [ ] Test GPS lookup with valid address
- [ ] Test GPS lookup with invalid address
- [ ] Verify errors are informational (not blocking)
- [ ] Verify can save without coordinates

---

### Priority 4: Error Message Verification

#### Test 4.1: Error Message Colors ✅
- [ ] Verify GPS lookup errors are BLUE (informational)
- [ ] Verify form validation errors are RED (blocking)
- [ ] Verify missing coordinate warnings are YELLOW (informational)

#### Test 4.2: Error Message Content ✅
- [ ] Verify all GPS errors say "You can still save/create... and add coordinates manually"
- [ ] Verify timeout errors are clear and helpful
- [ ] Verify rate limiting errors are informative

---

### Priority 5: Timeout Handling

#### Test 5.1: GPS Lookup Timeout ✅
- [ ] Test GPS lookup (should timeout after 30 seconds if slow)
- [ ] Verify timeout error is informational (not blocking)
- [ ] Verify form remains usable after timeout

---

## 🐛 Known Issues Fixed

1. ✅ Healthcare registration not creating healthcareLocation records - FIXED
2. ✅ Healthcare facility edit updating wrong table - FIXED
3. ✅ Active/Inactive checkboxes missing - FIXED
4. ✅ Checkbox handler not reading checked property - FIXED

---

## 📋 Quick Test Summary

### Must Test Before Deployment:
- [ ] Healthcare Registration: Create account without coordinates
- [ ] Healthcare Registration: New facility appears in Facilities List
- [ ] Healthcare Facilities: Can activate/deactivate facilities
- [ ] EMS Agencies: Can activate/deactivate agencies
- [ ] GPS Lookup: Works in all components
- [ ] GPS Lookup: Errors are non-blocking (blue, not red)
- [ ] No JavaScript errors in browser console
- [ ] No backend errors in server logs

---

## 🚀 Ready for Dev-SWA Deployment?

**Prerequisites:**
- [ ] All Priority 1 tests pass
- [ ] All Priority 2 tests pass
- [ ] At least 3 Priority 3 tests pass (sample of settings components)
- [ ] No critical errors found
- [ ] User confirms everything works

**If Ready:**
1. Commit all changes to git
2. Merge main → develop
3. Push to develop (triggers Dev-SWA deployment)
4. Test on Dev-SWA
5. If successful, deploy to Production

---

**Last Updated:** January 3, 2026

