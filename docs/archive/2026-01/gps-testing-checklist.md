# GPS Lookup Testing Checklist - January 3, 2026

## Testing Overview
**Date:** January 3, 2026  
**Purpose:** Verify all GPS lookup improvements work correctly in local dev environment  
**Status:** In Progress

---

## Components Updated

### 1. HealthcareRegistration.tsx ✅
**Changes:**
- Removed coordinate requirement (allows account creation without GPS)
- Added `geocodingError` state for non-blocking GPS errors
- Added `showCoordinateWarning` state for missing coordinates
- Increased timeout to 30 seconds
- Improved error messages
- Added manual coordinate entry helper link

**Test Cases:**

#### Test 1.1: GPS Lookup Success
- [ ] Navigate to Healthcare Registration page
- [ ] Fill in all required fields (facility name, type, contact, email, phone, address, city, state, ZIP)
- [ ] Click "Lookup Coordinates"
- [ ] Verify coordinates populate automatically
- [ ] Verify no error messages appear
- [ ] Verify success indicator shows coordinates

#### Test 1.2: GPS Lookup Failure (Non-Blocking)
- [ ] Navigate to Healthcare Registration page
- [ ] Fill in all required fields
- [ ] Use an address that might not geocode (e.g., "Test Address, Test City, XX 00000")
- [ ] Click "Lookup Coordinates"
- [ ] Verify blue informational error message appears (not red blocking error)
- [ ] Verify error message says "You can still create the account and add coordinates later"
- [ ] Verify form can still be submitted without coordinates

#### Test 1.3: Account Creation Without Coordinates
- [ ] Navigate to Healthcare Registration page
- [ ] Fill in all required fields
- [ ] Skip GPS lookup or let it fail
- [ ] Click "Create Account"
- [ ] Verify yellow warning message appears: "This account will not have full functionality until GPS Coordinates are provided"
- [ ] Verify account creation succeeds
- [ ] Verify success message shows GPS coordinate status

#### Test 1.4: Timeout Handling
- [ ] Navigate to Healthcare Registration page
- [ ] Fill in all required fields
- [ ] Click "Lookup Coordinates"
- [ ] If request takes > 30 seconds, verify timeout error message appears
- [ ] Verify timeout error is non-blocking (blue informational)
- [ ] Verify form can still be submitted

#### Test 1.5: Manual Coordinate Entry
- [ ] Navigate to Healthcare Registration page
- [ ] Fill in all required fields
- [ ] Manually enter coordinates (skip GPS lookup)
- [ ] Verify coordinates are accepted
- [ ] Verify account creation succeeds with manual coordinates

---

### 2. HealthcareLocationSettings.tsx ✅
**Changes:**
- Added 30-second timeout wrapper
- Improved error handling with user-friendly messages
- Better error display (non-blocking, informational)

**Test Cases:**

#### Test 2.1: GPS Lookup Success
- [ ] Navigate to Healthcare Location Settings (as healthcare user)
- [ ] Click "Add Location" or edit existing location
- [ ] Fill in address fields
- [ ] Click GPS lookup button
- [ ] Verify coordinates populate automatically
- [ ] Verify location saves successfully

#### Test 2.2: GPS Lookup Failure (Non-Blocking)
- [ ] Navigate to Healthcare Location Settings
- [ ] Click "Add Location"
- [ ] Fill in address fields
- [ ] Use an address that might not geocode
- [ ] Click GPS lookup button
- [ ] Verify error message appears (informational, not blocking)
- [ ] Verify location can still be saved without coordinates
- [ ] Verify error message says "You can still save the location and add coordinates manually"

#### Test 2.3: Timeout Handling
- [ ] Navigate to Healthcare Location Settings
- [ ] Click "Add Location"
- [ ] Fill in address fields
- [ ] Click GPS lookup button
- [ ] If request takes > 30 seconds, verify timeout error appears
- [ ] Verify location can still be saved

---

### 3. HealthcareDestinations.tsx ✅
**Changes:**
- Added 30-second timeout wrapper
- Improved error handling with user-friendly messages
- Better error messages indicating users can still save

**Test Cases:**

#### Test 3.1: GPS Lookup Success
- [ ] Navigate to Healthcare Destinations (as healthcare user)
- [ ] Click "Add Destination"
- [ ] Fill in address fields
- [ ] Click GPS lookup button
- [ ] Verify coordinates populate automatically
- [ ] Verify destination saves successfully

#### Test 3.2: GPS Lookup Failure (Non-Blocking)
- [ ] Navigate to Healthcare Destinations
- [ ] Click "Add Destination"
- [ ] Fill in address fields
- [ ] Use an address that might not geocode
- [ ] Click GPS lookup button
- [ ] Verify error message appears (informational, not blocking)
- [ ] Verify destination can still be saved without coordinates
- [ ] Verify error message says "You can still save the destination and add coordinates manually"

---

### 4. Hospitals.tsx ✅
**Changes:**
- Added 30-second timeout wrapper
- Improved error handling with user-friendly messages
- Better error messages indicating users can still save

**Test Cases:**

#### Test 4.1: GPS Lookup Success
- [ ] Navigate to Hospitals (as admin/command user)
- [ ] Edit an existing hospital or add new hospital
- [ ] Fill in address fields
- [ ] Click GPS lookup button
- [ ] Verify coordinates populate automatically
- [ ] Verify hospital saves successfully

#### Test 4.2: GPS Lookup Failure (Non-Blocking)
- [ ] Navigate to Hospitals
- [ ] Edit an existing hospital
- [ ] Use an address that might not geocode
- [ ] Click GPS lookup button
- [ ] Verify error message appears (informational, not blocking)
- [ ] Verify hospital can still be saved without coordinates
- [ ] Verify error message says "You can still save the hospital and add coordinates manually"

---

### 5. AgencySettings.tsx ✅
**Changes:**
- Added 30-second timeout wrapper
- Improved error handling with user-friendly messages
- Better error messages indicating users can still save

**Test Cases:**

#### Test 5.1: GPS Lookup Success
- [ ] Navigate to Agency Settings (as EMS user)
- [ ] Fill in address fields
- [ ] Click GPS lookup button
- [ ] Verify coordinates populate automatically
- [ ] Verify settings save successfully

#### Test 5.2: GPS Lookup Failure (Non-Blocking)
- [ ] Navigate to Agency Settings
- [ ] Use an address that might not geocode
- [ ] Click GPS lookup button
- [ ] Verify error message appears (informational, not blocking)
- [ ] Verify settings can still be saved without coordinates
- [ ] Verify error message says "You can still save settings and add coordinates manually"

---

### 6. HealthcareEMSAgencies.tsx ✅
**Changes:**
- Added 30-second timeout wrapper
- Improved error handling with user-friendly messages
- Better error messages indicating users can still save

**Test Cases:**

#### Test 6.1: GPS Lookup Success
- [ ] Navigate to Healthcare EMS Agencies (as healthcare user)
- [ ] Click "Add Agency"
- [ ] Fill in address fields
- [ ] Click GPS lookup button
- [ ] Verify coordinates populate automatically
- [ ] Verify agency saves successfully

#### Test 6.2: GPS Lookup Failure (Non-Blocking)
- [ ] Navigate to Healthcare EMS Agencies
- [ ] Click "Add Agency"
- [ ] Fill in address fields
- [ ] Use an address that might not geocode
- [ ] Click GPS lookup button
- [ ] Verify error message appears (informational, not blocking)
- [ ] Verify agency can still be saved without coordinates
- [ ] Verify error message says "You can still save the agency and add coordinates manually"

---

## General Testing Notes

### Error Message Colors
- **Red (Blocking):** Only for form validation errors (passwords don't match, invalid email, etc.)
- **Blue (Informational):** GPS lookup errors - non-blocking, user can proceed
- **Yellow (Warning):** Missing coordinates warning - non-blocking, user can proceed

### Timeout Behavior
- All GPS lookups should timeout after 30 seconds
- Timeout errors should be informational (blue), not blocking (red)
- Users should be able to proceed after timeout

### Coordinate Requirements
- **Registration components:** Can create accounts without coordinates (with warning)
- **Settings/Management components:** Can save without coordinates (coordinates optional)

---

## Test Results

### HealthcareRegistration
- [ ] All tests passed
- [ ] Issues found: _(document any issues)_

### HealthcareLocationSettings
- [ ] All tests passed
- [ ] Issues found: _(document any issues)_

### HealthcareDestinations
- [ ] All tests passed
- [ ] Issues found: _(document any issues)_

### Hospitals
- [ ] All tests passed
- [ ] Issues found: _(document any issues)_

### AgencySettings
- [ ] All tests passed
- [ ] Issues found: _(document any issues)_

### HealthcareEMSAgencies
- [ ] All tests passed
- [ ] Issues found: _(document any issues)_

---

## Issues Found

_(Document any issues encountered during testing)_

---

## Next Steps After Testing

1. ✅ Fix any issues found
2. ✅ Re-test fixed components
3. ✅ Get user confirmation
4. ✅ Commit changes to git
5. ✅ Prepare for Dev-SWA deployment

---

**Last Updated:** January 3, 2026

