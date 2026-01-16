# EMS Registration Transaction Abort Bug - Production

**Date:** January 3, 2026  
**Severity:** Critical  
**Status:** ✅ **FIXED, TESTED, AND DEPLOYED TO PRODUCTION** - Using SAVEPOINT for transaction recovery  
**Environment:** Production (`traccems.com`)  
**Fix Tested:** Dev-SWA (January 4, 2026) - ✅ PASSED  
**Production Deployed:** January 4, 2026 - ✅ DEPLOYED (commit `fda3ec5d`)

---

## Issue Summary

EMS registration in production is failing with a database transaction abort error. The error prevents new EMS agencies from registering, blocking a critical user flow.

**Error Message:**
```
ERROR: current transaction is aborted, commands ignored until end of transaction block
```

**Error Code:** `P2010` / `25P02`

---

## Error Details

### Error Response
```json
{
  "success": false,
  "error": "Invalid `prisma.$executeRaw()` invocation:\n\n\nRaw query failed. Code: `25P02`. Message: `ERROR: current transaction is aborted, commands ignored until end of transaction block`",
  "code": "P2010",
  "meta": {
    "code": "25P02",
    "message": "ERROR: current transaction is aborted, commands ignored until end of transaction block"
  },
  "prismaError": true,
  "prismaCode": "P2010"
}
```

### HTTP Status
- **Status Code:** 500 Internal Server Error
- **Endpoint:** `POST /api/auth/ems/register`

---

## Reproduction Steps

1. Navigate to `https://traccems.com/ems-register`
2. Fill in all required fields:
   - Agency Name: "Production Test EMS Agency"
   - Contact Person Name: "Test EMS Contact"
   - Email: `prod-test-ems-20260103@test.tcc.com`
   - Phone: "555-0200"
   - Address: "456 Oak Avenue"
   - City: "Johnstown"
   - State: "PA"
   - ZIP Code: "15901"
3. Click "Lookup Coordinates" (works successfully)
4. Fill in password fields
5. Click "Create Account"
6. **Result:** 500 error with transaction abort message

---

## Root Cause Analysis

### Code Location
`backend/src/routes/auth.ts` - Lines 1079-1198 (EMS registration transaction)

### Problem Identified

The EMS registration uses a database transaction (`db.$transaction`) to ensure atomic creation of both the agency and user records. Inside the transaction:

1. **First attempt:** Try to create agency using Prisma (`tx.eMSAgency.create`)
2. **Fallback:** If column error (like missing `addedAt`), use raw SQL (`tx.$executeRaw`)
3. **Fetch:** After raw SQL, try to fetch the created agency (`tx.eMSAgency.findUnique`)

**The Issue:**
- If an error occurs during the raw SQL execution (or before it), PostgreSQL aborts the transaction
- Once aborted, all subsequent commands in the transaction are ignored
- The `tx.eMSAgency.findUnique` call (line 1161) fails because the transaction is already aborted
- The error handling doesn't properly catch and handle transaction abort scenarios

### Comparison with Healthcare Registration

Healthcare registration (lines 201-259) works correctly because:
- It doesn't use raw SQL fallback
- All Prisma operations succeed without column errors
- Transaction completes successfully

### Potential Causes

1. **Raw SQL Column Mismatch:** The raw SQL INSERT might reference columns that don't exist in production
2. **Transaction Error Handling:** Errors in raw SQL aren't being caught properly, causing transaction abort
3. **Missing Column:** Production database might be missing columns referenced in the raw SQL
4. **Data Type Mismatch:** Array/JSON casting in raw SQL might be failing

---

## Code Analysis

### Current Implementation (Lines 1108-1168)

```typescript
try {
  agency = await tx.eMSAgency.create({
    data: agencyData
  });
} catch (createError: any) {
  // If error is due to missing column (addedAt/addedBy), use raw SQL
  const isColumnError = createError.code === 'P2022' || 
                        (createError.message && createError.message.includes('addedAt')) ||
                        (createError.meta && createError.meta.column && createError.meta.column.includes('addedAt'));
  
  if (isColumnError) {
    // Use raw SQL fallback
    await tx.$executeRaw`
      INSERT INTO ems_agencies (
        id, name, "contactName", phone, email, address, city, state, "zipCode",
        "serviceArea", capabilities, "isActive", status, "createdAt", "updatedAt",
        latitude, longitude, "operatingHours", "requiresReview"
      )
      VALUES (...)
    `;
    
    // Fetch the created agency
    agency = await tx.eMSAgency.findUnique({
      where: { id: agencyId }
    });
  } else {
    throw createError;
  }
}
```

### Problem Areas

1. **No error handling around raw SQL:** If `$executeRaw` fails, transaction aborts
2. **No error handling around findUnique:** If transaction is aborted, this call fails
3. **Transaction state not checked:** Code doesn't verify transaction is still valid before proceeding

---

## Impact

- **User Impact:** EMS agencies cannot register in production
- **Business Impact:** Blocks new EMS agency onboarding
- **Workaround:** None - registration is completely blocked

---

## Recommended Fixes

### Option 1: Fix Raw SQL Error Handling (Recommended)

Wrap the raw SQL execution in proper error handling and ensure transaction rollback on failure:

```typescript
if (isColumnError) {
  try {
    await tx.$executeRaw`...`;
    agency = await tx.eMSAgency.findUnique({ where: { id: agencyId } });
  } catch (rawSqlError: any) {
    console.error('TCC_DEBUG: Raw SQL execution failed:', rawSqlError);
    // Transaction will be rolled back automatically
    throw new Error(`Failed to create agency: ${rawSqlError.message}`);
  }
}
```

### Option 2: Verify Production Schema

Check production database schema to ensure all columns in raw SQL exist:
- Run: `SELECT column_name FROM information_schema.columns WHERE table_name = 'ems_agencies';`
- Compare with raw SQL column list
- Add missing columns or remove from raw SQL

### Option 3: Remove Raw SQL Fallback

If production database has the required columns, remove the raw SQL fallback entirely and fix the Prisma schema mismatch.

### Option 4: Use Separate Transaction for Raw SQL

If raw SQL is necessary, execute it outside the main transaction, then continue with Prisma operations.

---

## Testing Plan

After fix is implemented:

1. **Unit Test:** Test transaction error handling
2. **Integration Test:** Test EMS registration with various scenarios
3. **Production Test:** 
   - Register new EMS agency
   - Verify agency appears in list
   - Verify user can log in
   - Test Active/Inactive toggle

---

## Related Issues

- Similar issue was encountered with `addedAt` column in December 2025 (see `docs/active/sessions/2025-12/ems-registration-500-error-prompt.md`)
- Healthcare registration works correctly (can be used as reference)

---

## Fix Implemented

**Date:** January 3, 2026  
**Approach:** SAVEPOINT-based transaction recovery

### Solution

The fix uses PostgreSQL SAVEPOINT to create a sub-transaction before attempting Prisma create. If the Prisma operation fails, we rollback to the savepoint (restoring the transaction to a valid state) before attempting the raw SQL fallback.

**Key Changes:**
1. Create SAVEPOINT before Prisma `eMSAgency.create()`
2. If Prisma fails, rollback to savepoint (restores transaction state)
3. If column error detected, execute raw SQL (transaction is now valid)
4. Proper error handling around all operations

**Code Location:** `backend/src/routes/auth.ts` lines 1105-1217

### Implementation Details

```typescript
// Create savepoint before Prisma create
const savepointName = `sp_ems_agency_${Date.now()}`;
await tx.$executeRawUnsafe(`SAVEPOINT ${savepointName}`);

try {
  // Try Prisma create
  agency = await tx.eMSAgency.create({ data: agencyData });
  await tx.$executeRawUnsafe(`RELEASE SAVEPOINT ${savepointName}`);
} catch (createError: any) {
  // Rollback to savepoint to restore transaction state
  await tx.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT ${savepointName}`);
  
  if (isColumnError) {
    // Now transaction is valid - can execute raw SQL
    await tx.$executeRaw`INSERT INTO ems_agencies (...) VALUES (...)`;
    agency = await tx.eMSAgency.findUnique({ where: { id: agencyId } });
  }
}
```

## Next Steps

1. ✅ **Investigate:** Review transaction error handling in EMS registration
2. ✅ **Fix:** Implement SAVEPOINT-based transaction recovery
3. ✅ **Test:** Verified fix works in local dev environment
4. ✅ **Deploy:** Deployed to Dev-SWA
5. ✅ **Test:** Verified fix works in Dev-SWA (Southern Cove EMS registration successful)
6. ✅ **Deploy:** Deployed to Production (commit `fda3ec5d` - both workflows successful)
7. ⏳ **Test:** Verify fix works in production (ready for testing)
8. ⏳ **Monitor:** Watch for similar issues in other registration endpoints

## Testing Results

### Local Testing (January 4, 2026)
- ✅ EMS registration successful
- ✅ No transaction abort errors
- ✅ Test script passed

### Dev-SWA Testing (January 4, 2026)
- ✅ Account creation successful (Southern Cove EMS)
- ✅ GPS lookup successful
- ✅ No transaction abort errors
- ✅ Agency appears in Command list as Active
- ✅ All functionality working as expected

---

## Files Involved

- `backend/src/routes/auth.ts` (lines 970-1255) - EMS registration endpoint
- `backend/prisma/schema.prisma` (lines 175-212) - EMSAgency model definition
- `frontend/src/components/EMSRegistration.tsx` - Frontend registration form

---

**Reported By:** Production Testing - January 3, 2026  
**Priority:** Critical - Blocks user registration  
**Assigned To:** TBD

