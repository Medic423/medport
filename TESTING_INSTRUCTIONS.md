# Testing Instructions - Healthcare Trip List and Edit Fix

## Summary of Changes
1. **Backend**: Added logging and empty-string filtering in `tripService.ts` update logic
2. **Frontend**: Sanitized payload in `HealthcareDashboard.tsx` to strip empty strings before sending
3. **Test Script**: Created integration test to verify end-to-end flow

## Prerequisites
- Backend running on http://localhost:5001
- Frontend running on http://localhost:3000
- Test healthcare user: `test@hospital.com` / `password123`

---

## Test Sequence (Follow in Order)

### ✅ Test 1: Edit → Save (Fix for 400 Error)

**Expected Behavior**: Edit and save a trip without getting a 400 error

**Steps**:
1. Login to frontend as `test@hospital.com` / `password123`
2. Go to **Transport Requests** tab
3. If no trips exist, create one first:
   - Click **Create Request** tab
   - Fill in minimal required fields (Patient ID, Weight, From/To Location, Pickup Location)
   - Click through steps and submit
   - Return to **Transport Requests** tab
4. Click **Edit** button (pencil icon) on any trip
5. Make changes:
   - Change **Urgency Level** to "Urgent"
   - Change **Transport Level** to "ALS"
   - Add a **Primary Diagnosis** (select "Cardiac")
   - Check **Oxygen Required**
6. Click **Update Trip**

**Success Criteria**:
- ✓ No 400 error appears
- ✓ Modal closes
- ✓ Trip list refreshes
- ✓ Changes are visible in the trip card

**Backend Logs to Check**:
```bash
# In backend terminal, look for:
TCC_EDIT_DEBUG: Incoming update payload: {...}
TCC_EDIT_DEBUG: Setting urgencyLevel: Urgent
TCC_EDIT_DEBUG: Setting transportLevel: ALS
TCC_EDIT_DEBUG: Final updateData to be sent to Prisma: {...}
TCC_DEBUG: Trip status updated successfully: <trip-id>
```

**If it fails**:
- Check backend terminal for `TCC_EDIT_DEBUG` logs showing rejected fields
- Check browser console for the outgoing payload
- Share the error message and logs

---

### ✅ Test 2: Single-Location User - Create and See Trip Immediately

**Expected Behavior**: Created trip appears in Transport Requests list immediately

**Steps**:
1. Still logged in as `test@hospital.com`
2. Click **Create Request** tab
3. Fill in required fields:
   - **Patient ID**: Click "Generate ID" or type `TEST-001`
   - **Patient Weight**: `75`
   - **From Location**: Should be pre-filled with "Test Hospital" (disabled)
   - **Pickup Location**: Select any available location
   - **To Location**: Select "Destination Hospital" or any facility
   - **Transport Level**: BLS
   - **Urgency Level**: Routine
4. Click **Next** through all steps
5. Click **Create Request**
6. **Immediately** switch to **Transport Requests** tab (should auto-switch)

**Success Criteria**:
- ✓ Success message appears
- ✓ Auto-redirected to Transport Requests tab
- ✓ **NEW TRIP APPEARS IN THE LIST** within 1 second
- ✓ Trip shows correct Patient ID, status PENDING

**Backend Logs to Check**:
```bash
# At trip creation:
TCC_CREATE_DEBUG: healthcareUserId will be used for healthcareCreatedById: <user-id>
TCC_CREATE_DEBUG: Trip data healthcareCreatedById before create: <user-id>
TCC_CREATE_DEBUG: Created trip healthcareCreatedById: <user-id>

# At trip list fetch:
TCC_FILTER_DEBUG: Filtering trips for healthcareUserId: <user-id>
TCC_FILTER_DEBUG: Found 0 locations for user
SINGLE_LOC: Filtering by created user ID: <user-id>
TCC_FILTER_DEBUG: Trips healthcareCreatedById sample → [{id: '...', healthcareCreatedById: '<user-id>'}]
```

**If it fails**:
- Check if trip was created at all (check backend logs for "Created trip healthcareCreatedById")
- Check if filtering is working (look for "SINGLE_LOC: Filtering by created user ID")
- If healthcareCreatedById is null, the enhanced endpoint didn't receive the user ID correctly

---

### ✅ Test 3: Complete Trip Button

**Expected Behavior**: Complete button works without error

**Steps**:
1. In **Transport Requests** tab
2. Click the **Complete** button (green checkmark icon) on any trip
3. Confirm the dialog

**Success Criteria**:
- ✓ No error
- ✓ Trip disappears from Transport Requests list
- ✓ Trip appears in **Completed Trips** tab with status COMPLETED

---

### ✅ Test 4: Delete/Cancel Trip Button

**Expected Behavior**: Delete button soft-deletes the trip (we already know this works, but verify regression didn't break it)

**Steps**:
1. In **Transport Requests** tab
2. Click the **Delete** button (red trash icon) on any trip
3. Confirm the dialog

**Success Criteria**:
- ✓ No error
- ✓ Trip disappears from Transport Requests list
- ✓ Trip appears in **Completed Trips** tab with status CANCELLED

---

### ✅ Test 5: Automated Integration Test (Optional but Recommended)

**Purpose**: Verify all changes work together in one automated flow

**Steps**:
```bash
cd /Users/scooper/Code/tcc-new-project
node test-healthcare-trip-flow.js
```

**Success Criteria**:
- ✓ All 5 test steps pass:
  1. Login
  2. Create Trip
  3. List Trip (trip appears)
  4. Update Trip (no 400 error)
  5. Cancel Trip
- ✓ Script exits with "✓ ALL TESTS PASSED"

**If it fails**:
- Script will show which step failed with detailed error messages
- Share the full output

---

## Verification Checklist

After all tests pass, verify in backend logs:

**For Edit/Save:**
- [ ] `TCC_EDIT_DEBUG: Incoming update payload` shows all fields
- [ ] `TCC_EDIT_DEBUG: Skipping empty <field>` for any empty fields
- [ ] `TCC_EDIT_DEBUG: Final updateData` contains only non-empty fields
- [ ] No Prisma validation errors

**For Create/List:**
- [ ] `TCC_CREATE_DEBUG: Created trip healthcareCreatedById: <user-id>` shows user ID
- [ ] `TCC_FILTER_DEBUG: Found 0 locations for user` (for single-location users)
- [ ] `SINGLE_LOC: Filtering by created user ID` is used (not multi-location OR clause)
- [ ] `TCC_FILTER_DEBUG: Trips healthcareCreatedById sample` shows created trips have the correct user ID

---

## What to Report After Testing

Please reply with:
1. **Which tests passed** (1, 2, 3, 4, 5)
2. **Which tests failed** (if any) with:
   - Error message from browser/terminal
   - Relevant backend logs (TCC_EDIT_DEBUG, TCC_CREATE_DEBUG, TCC_FILTER_DEBUG)
   - Screenshots if helpful
3. **Confirmation to commit** if all tests pass

---

## Incremental Commit Plan (After Testing)

Once you confirm everything works:

**Commit 1**: Backend logging and validation
```bash
git add backend/src/services/tripService.ts
git commit -m "fix(backend): Add logging and strip empty strings on trip update

- Add TCC_EDIT_DEBUG logging for payload validation
- Skip empty string fields to prevent Prisma errors
- Add TCC_CREATE_DEBUG for healthcareCreatedById tracking
- Add TCC_FILTER_DEBUG for single-location filtering verification

USER VERIFIED WORKING"
```

**Commit 2**: Frontend payload sanitization
```bash
git add frontend/src/components/HealthcareDashboard.tsx
git commit -m "fix(frontend): Sanitize edit-save payload to strip empty strings

- Build payload dynamically, only include non-empty fields
- Always include booleans (oxygenRequired, monitoringRequired)
- Add TCC_EDIT_DEBUG logging for outgoing payload
- Enhanced error logging with response data

USER VERIFIED WORKING"
```

**Commit 3**: Integration test
```bash
git add test-healthcare-trip-flow.js
git commit -m "test: Add healthcare trip flow integration test

- Test login, create, list, update, cancel flow
- Verify healthcareCreatedById is set correctly
- Verify trips appear in filtered list
- Verify edit-save works without 400 errors

USER VERIFIED WORKING"
```

Let me know the results!

