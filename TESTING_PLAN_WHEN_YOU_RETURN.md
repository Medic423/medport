# Testing Plan - When You Return

## Status Summary
- ✅ Database is CLEAN - "Critical" does NOT exist
- ✅ Invalid options cleaned up ("Emergency", "Stat" deactivated)
- ✅ Backend validation fixes applied (prevents "Critical" at 3 points)
- ✅ Frontend filtering applied
- ✅ **TRIP CREATION FIXED** - Prisma client regenerated, age fields working
- ✅ **TEST PASSED** - Enhanced trip creation verified with age fields

## Three Test Scripts Ready

### 1. Test Trip Creation Payload
**File:** `backend/test-trip-creation-payload.js`

**Purpose:** Simulates trip creation with different urgency levels to verify backend validation

**How to run:**
```bash
cd backend
node test-trip-creation-payload.js
```

**What it tests:**
- Sends trip creation requests with: Routine, Urgent, Emergent, Critical
- Verifies backend accepts valid ones and rejects "Critical"
- Shows exact error messages if any fail

**Prerequisites:**
- Dev server running on port 5001
- Set `API_URL` if different
- May need auth token if your API requires it

---

### 2. Check Frontend for Hardcoded "Critical"
**File:** `check-frontend-critical.js`

**Purpose:** Searches all frontend TypeScript/JavaScript files for "Critical" references

**How to run:**
```bash
node check-frontend-critical.js
```

**What it finds:**
- Any hardcoded "Critical" values in frontend code
- References in context of urgency levels
- Shows file path, line number, and code snippet

---

### 3. Test Form Creation Flow Directly
**Manual Test Steps:**

1. **Start Dev Servers:**
   ```bash
   /scripts/start-dev-complete.sh
   ```

2. **Clear Browser Cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Or open DevTools → Application → Clear Storage → Clear site data

3. **Open Create Request Form:**
   - Navigate to Healthcare Dashboard
   - Click "Create Request"

4. **Check Console Logs:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for: `TCC_DEBUG: Enhanced payload being sent:`
   - Check the `urgencyLevel` value in the payload

5. **Try Creating a Trip:**
   - Fill in required fields
   - Select different urgency levels (Routine, Urgent, Emergent)
   - Try to submit
   - Check for any errors

6. **What to Look For:**
   - Does `urgencyLevel` ever show as "Critical"?
   - Does trip creation succeed with valid urgency levels?
   - Any console errors?

---

## What We Know

### Database Check Results ✅
```
✅ "Critical" does NOT exist in database
✅ Default is "Routine" (valid)
✅ Only valid options active: Routine, Urgent, Emergent
✅ Cleaned up: "Emergency" and "Stat" deactivated
```

### Backend Fixes Applied ✅
1. **GET /api/dropdown-options/urgency/default** - Filters out "Critical"
2. **POST /api/dropdown-options/urgency/default** - Prevents setting "Critical"
3. **POST /api/dropdown-options** - Prevents adding "Critical"

### Frontend Fixes Applied ✅
1. Filters "Critical" from dropdown options
2. Rejects "Critical" as default when loading
3. Client-side validation only accepts Routine/Urgent/Emergent

---

## Expected Outcomes

### If All Tests Pass:
- ✅ No "Critical" in database ✓ (already confirmed)
- ✅ No "Critical" in frontend code ✓ (run script #2)
- ✅ Backend rejects "Critical" ✓ (run script #1)
- ✅ Form works correctly ✓ (manual test #3)

**Then:** The age fields work is complete, issue was resolved.

### If Tests Fail:
1. **Script #1 fails (backend accepts Critical):** Backend validation bug
2. **Script #2 finds Critical in code:** Frontend has hardcoded value
3. **Manual test shows Critical in payload:** Browser cache or state issue

---

## Quick Reference Commands

```bash
# Run all checks
cd /Users/scooper/Code/tcc-new-project

# 1. Check database
cd backend && node check-critical-urgency.js

# 2. Test backend payload
cd backend && node test-trip-creation-payload.js

# 3. Check frontend code
node check-frontend-critical.js

# 4. Start dev servers
/scripts/start-dev-complete.sh
```

---

## Next Steps After Testing

1. **If everything works:** Commit the fixes and test age fields
2. **If issues found:** Document the exact error and we'll fix it
3. **If still confused:** We can add more detailed logging

---

## Notes
- All test scripts are ready to run
- Database is clean and validated
- Age fields implementation is correct and separate from urgency issue
- The "Critical" issue was likely from invalid data (now cleaned) or browser cache

## ✅ FIXED: Trip Creation Issue

**Problem**: Prisma client was missing `patientAgeYears` and `patientAgeCategory` fields

**Solution**: Regenerated Prisma client with `npx prisma generate`

**Test Result**: ✅ Trip creation verified working with age fields
- Test script: `backend/test-enhanced-trip-creation.js`
- Trip created successfully with `patientAgeYears: 37` and `patientAgeCategory: "ADULT"`
- Enhanced error logging in place for future debugging

