# Testing Checklist - December 31, 2025
## Production Testing on traccems.com

---

## ✅ Quick Verification Tests (Do These First)

### 1. TCC Admin Dashboard - Agency Count
- [ ] Login as admin (`admin@tcc.com` / `password123`)
- [ ] Navigate to TCC Dashboard home screen
- [ ] **Verify**: Shows **11 EMS Agencies** (not 3)
- [ ] **Verify**: Shows **9 active** agencies
- [ ] Check other stats cards display correctly

### 2. EMS Registration Form - Production Fix
- [ ] Navigate to `https://traccems.com/ems-register` (or use "Add EMS Agency" button)
- [ ] Fill out registration form with test data:
  - Email: `test-ems-registration@example.com`
  - Password: `TestPassword123!`
  - Agency Name: `Test EMS Agency`
  - Contact Name: `Test Contact`
  - Address: `197 Fox Chase Drive, Duncansville, PA 16635`
  - Phone: `814-555-1234`
- [ ] Click "Lookup GPS Coordinates"
- [ ] **Verify**: Coordinates populate correctly
- [ ] Fill in required fields (service area, capabilities)
- [ ] Click "Register"
- [ ] **Verify**: Registration succeeds (no NetworkError or CORS errors)
- [ ] **Verify**: Success message appears
- [ ] Try logging in with the new account
- [ ] **Verify**: New agency appears in TCC Command -> EMS -> Agencies list

---

## 🔍 Priority 1: GPS Functionality Testing

### Test 1.1: EMS Agency Info GPS Lookup
**Location**: EMS Dashboard -> Agency Information

- [ ] Login as `test-ems@tcc.com` / `password123`
- [ ] Navigate to Agency Information
- [ ] Test GPS lookup with address: `197 Fox Chase Drive, Duncansville, PA 16635`
  - [ ] Click "Lookup GPS Coordinates"
  - [ ] **Verify**: Latitude and longitude populate
  - [ ] **Verify**: No console errors
- [ ] Test with another address: `212 S. Eighth St, Dubois, PA 15801`
  - [ ] **Verify**: Coordinates update correctly
- [ ] Test with well-known address: `1600 Pennsylvania Avenue NW, Washington, DC 20500`
  - [ ] **Verify**: Coordinates populate
- [ ] Click "Save All Settings"
- [ ] **Verify**: Coordinates save successfully
- [ ] Check browser console for any errors

### Test 1.2: Healthcare Agency Creation GPS Lookup
**Location**: Healthcare Dashboard -> Manage Agencies -> Add Agency

- [ ] Login as `test-healthcare@tcc.com` / `password123`
- [ ] Navigate to Healthcare -> Manage Agencies
- [ ] Click "Add Agency" button
- [ ] Fill in agency details:
  - Name: `Test EMS Agency`
  - Address: `197 Fox Chase Drive, Duncansville, PA 16635`
  - City: `Duncansville`
  - State: `PA`
  - ZIP: `16635`
- [ ] Click "Lookup GPS Coordinates"
- [ ] **Verify**: Coordinates populate correctly
- [ ] Click "Save" or "Create"
- [ ] **Verify**: Agency is created with coordinates saved
- [ ] Check browser console for any errors

### Test 1.3: Healthcare Registration GPS Lookup
**Location**: Public registration page or admin

- [ ] Navigate to `https://traccems.com/healthcare-register` (or use "Add Healthcare Facility" button)
- [ ] Fill in healthcare facility registration form:
  - Facility Name: `Test Healthcare Facility`
  - Address: `620 Howard Ave, Altoona, PA 16601`
  - City: `Altoona`
  - State: `PA`
  - ZIP: `16601`
- [ ] Click "Lookup GPS Coordinates"
- [ ] **Verify**: Coordinates populate correctly
- [ ] **Verify**: No console errors
- [ ] Complete registration (don't need to submit, just verify GPS works)

### Test 1.4: EMS Registration GPS Lookup
**Location**: Public registration page or admin

- [ ] Navigate to `https://traccems.com/ems-register` (or use "Add EMS Agency" button)
- [ ] Fill in EMS agency registration form:
  - Agency Name: `Test EMS Agency 2`
  - Address: `700 Ayers Ave, Lemoyne, PA 17043`
  - City: `Lemoyne`
  - State: `PA`
  - ZIP: `17043`
- [ ] Click "Lookup GPS Coordinates"
- [ ] **Verify**: Coordinates populate correctly
- [ ] **Verify**: No console errors
- [ ] **Verify**: Registration form uses correct API endpoint (check Network tab)

### Test 1.5: Hospital Management GPS Lookup
**Location**: TCC Dashboard -> Hospitals -> Edit Hospital

- [ ] Login as admin (`admin@tcc.com` / `password123`)
- [ ] Navigate to Hospitals
- [ ] Click "Edit" on an existing hospital
- [ ] Update address field (or use existing address)
- [ ] Click "Lookup GPS Coordinates"
- [ ] **Verify**: Coordinates populate correctly
- [ ] Click "Save"
- [ ] **Verify**: Coordinates save successfully
- [ ] Check browser console for any errors

### Test 1.6: Healthcare Locations GPS Lookup
**Location**: Healthcare Dashboard -> Manage Locations -> Add Location

- [ ] Login as `test-healthcare@tcc.com` / `password123`
- [ ] Navigate to Healthcare -> Manage Locations
- [ ] Click "Add Location" button
- [ ] Fill in location details:
  - Name: `Test Location`
  - Address: `212 S. Eighth St, Dubois, PA 15801`
  - City: `Dubois`
  - State: `PA`
  - ZIP: `15801`
- [ ] Click "Lookup GPS Coordinates"
- [ ] **Verify**: Coordinates populate correctly
- [ ] Click "Save"
- [ ] **Verify**: Location is created with coordinates saved
- [ ] Check browser console for any errors

### Test 1.7: Healthcare Destinations GPS Lookup
**Location**: Healthcare Dashboard -> Destinations -> Add Destination

- [ ] Login as `test-healthcare@tcc.com` / `password123`
- [ ] Navigate to Healthcare -> Destinations
- [ ] Click "Add Destination" button
- [ ] Fill in destination details:
  - Name: `Test Destination`
  - Address: `1600 Pennsylvania Avenue NW, Washington, DC 20500`
  - City: `Washington`
  - State: `DC`
  - ZIP: `20500`
- [ ] Click "Lookup GPS Coordinates"
- [ ] **Verify**: Coordinates populate correctly
- [ ] Click "Save"
- [ ] **Verify**: Destination is created with coordinates saved
- [ ] Check browser console for any errors

---

## 🔧 Priority 2: Agency Data Persistence Testing

### Test 2.1: Verify Backend API Response
- [ ] Login as `test-ems@tcc.com` / `password123`
- [ ] Open browser Developer Tools -> Network tab
- [ ] Navigate to Agency Information page
- [ ] Find the request to `/api/auth/ems/agency/info`
- [ ] **Verify**: Request returns 200 OK
- [ ] **Verify**: Response contains correct agency data
- [ ] **Verify**: Response includes `agencyId` field
- [ ] Check backend logs (if accessible) to confirm lookup by `agencyId`

### Test 2.2: Agency Info Persistence
- [ ] Login as `test-ems@tcc.com` / `password123`
- [ ] Navigate to Agency Information
- [ ] Note current values (address, phone, etc.)
- [ ] Update agency details:
  - [ ] Change address to: `212 S. Eighth St, Dubois, PA 15801`
  - [ ] Change city to: `Dubois`
  - [ ] Change state to: `PA`
  - [ ] Change ZIP to: `15801`
  - [ ] Update phone number
  - [ ] Update capabilities (add/remove some)
  - [ ] Update operating hours
  - [ ] Use GPS lookup to set coordinates
- [ ] Click "Save All Settings"
- [ ] **Verify**: Success message appears
- [ ] **Verify**: No console errors
- [ ] Navigate away from Agency Information page (go to Dashboard or another page)
- [ ] Navigate back to Agency Information page
- [ ] **Verify**: All changes persist:
  - [ ] Address is `212 S. Eighth St, Dubois, PA 15801`
  - [ ] City is `Dubois`
  - [ ] State is `PA`
  - [ ] ZIP is `15801`
  - [ ] Phone number matches what you set
  - [ ] Capabilities match what you selected
  - [ ] Operating hours match what you set
  - [ ] Coordinates match what you set
- [ ] If persistence fails, check:
  - [ ] Browser console for errors
  - [ ] Network tab for API call responses
  - [ ] Backend logs for save/load operations

---

## 📋 Priority 3: Additional Integration Testing

### Test 3.1: Complete Trip Creation Flow
- [ ] Login as `test-healthcare@tcc.com` / `password123`
- [ ] Navigate to Create Trip
- [ ] Fill in trip details:
  - [ ] Patient information
  - [ ] Pickup location (use GPS lookup)
  - [ ] Destination (use GPS lookup)
  - [ ] Transport level, urgency, etc.
- [ ] **Verify**: GPS lookup works for both pickup and destination
- [ ] **Verify**: Coordinates are included in trip data
- [ ] Submit trip
- [ ] **Verify**: Trip appears in trips list
- [ ] **Verify**: Trip has correct GPS coordinates

### Test 3.2: EMS Agency Dispatch (if applicable)
- [ ] Verify EMS agencies are properly configured with GPS coordinates
- [ ] Create a trip as healthcare user
- [ ] Test trip dispatch functionality
- [ ] **Verify**: Agencies receive notifications correctly
- [ ] **Verify**: GPS coordinates are used for dispatch calculations

---

## 🐛 Error Checking

For each test above, also verify:
- [ ] No CORS errors in browser console
- [ ] No NetworkError messages
- [ ] No 401/403/404/500 errors in Network tab
- [ ] API calls are going to `https://api.traccems.com` (not localhost)
- [ ] All API responses have `success: true` (or appropriate error messages)

---

## 📝 Test Results Summary

After completing tests, document:

### GPS Functionality Results
- [ ] All 7 GPS lookup locations working correctly
- [ ] Coordinates populate correctly in all forms
- [ ] Coordinates save correctly in all forms
- [ ] Any forms with GPS issues: ________________

### Agency Persistence Results
- [ ] Agency info saves successfully: Yes / No
- [ ] Agency info persists after navigation: Yes / No
- [ ] All fields persist correctly: Yes / No
- [ ] Issues found: ________________

### Registration Forms Results
- [ ] EMS registration works on production: Yes / No
- [ ] Healthcare registration works on production: Yes / No
- [ ] New agencies appear in admin lists: Yes / No
- [ ] Issues found: ________________

### Overall Status
- [ ] All critical fixes verified: Yes / No
- [ ] Ready for production use: Yes / No
- [ ] Remaining issues: ________________

---

**Testing Date**: December 31, 2025  
**Environment**: Production (traccems.com)  
**Tester**: ________________

