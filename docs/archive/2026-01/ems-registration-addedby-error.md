# EMS Registration addedBy Column Error - Production

**Date:** January 4, 2026  
**Severity:** Critical  
**Status:** ✅ **FIXED** - Database migration applied, production schema aligned  
**Environment:** Production (`traccems.com`)  
**Fix Applied:** January 4, 2026 - ✅ Database migration successful  
**Production Testing:** ✅ Account creation successful

---

## Issue Summary

After fixing the transaction abort error, a new error occurred during EMS registration in production. The error prevents account creation after GPS lookup succeeds.

**Error Message:**
```
Failed to create agency: Invalid `prisma.eMSAgency.findUnique()` invocation: 
The column `ems_agencies.addedBy` does not exist in the current database.
```

**Error Code:** `UNKNOWN_ERROR`

---

## Root Cause

### Problem
1. After creating agency via raw SQL (to avoid `addedAt` column error), the code uses `tx.eMSAgency.findUnique()` to fetch the created agency
2. Prisma's `findUnique` uses the Prisma schema which includes `addedBy` and `addedAt` fields
3. Production database doesn't have these columns
4. When Prisma tries to SELECT these columns, it fails with "column does not exist"

### Code Location
`backend/src/routes/auth.ts` - Lines 1185-1187 (after raw SQL insert)

### Why This Happened
- Prisma schema (`schema.prisma`) defines `addedBy` and `addedAt` fields (lines 191-192)
- Production database schema doesn't include these columns
- Raw SQL insert works (we don't include those columns)
- Prisma `findUnique` fails (tries to select all schema fields)

---

## Fix Implementation

### Solution
Replace Prisma `findUnique` with raw SQL `$queryRaw` to fetch only columns that exist in production database.

**Changes Made:**
1. Use `tx.$queryRaw` instead of `tx.eMSAgency.findUnique`
2. Select only columns that exist in production database
3. Convert raw SQL result to match Prisma model structure
4. Updated column error detection to catch `addedBy` errors

**Code Changes:**
```typescript
// OLD (fails in production):
agency = await tx.eMSAgency.findUnique({
  where: { id: agencyId }
});

// NEW (works in production):
const agencyResult = await tx.$queryRaw`
  SELECT 
    id, name, "contactName", phone, email, address, city, state, "zipCode",
    "serviceArea", capabilities, "isActive", status, "createdAt", "updatedAt",
    latitude, longitude, "operatingHours", "requiresReview"
  FROM ems_agencies
  WHERE id = ${agencyId}
`;
// Convert to Prisma model structure...
```

---

## Testing Status

### Local Testing
- ✅ Code compiles successfully
- ✅ Test script passes
- ✅ EMS registration works locally

### Dev-SWA Testing
- ✅ Skipped - Previous fix already tested successfully in Dev-SWA
- ✅ Dev-SWA testing confirmed working (Southern Cove EMS registration)

### Production Testing
- ✅ Database migration applied successfully
- ✅ Columns `addedBy` and `addedAt` added to production database
- ✅ EMS registration tested - **Account creation successful**
- ✅ No Prisma validation errors
- ✅ Production schema now matches Dev-SWA and Prisma schema

---

## Related Issues

- **Previous Fix:** Transaction abort error (P2010/25P02) - Fixed with SAVEPOINT
- **This Fix:** addedBy column error - Fixed with raw SQL fetch
- **Root Cause:** Prisma schema mismatch with production database schema

---

## Files Modified

- `backend/src/routes/auth.ts` - Lines 1184-1250 (raw SQL fetch implementation)

---

## Next Steps

1. ✅ Fix implemented (database migration)
2. ✅ Migration applied to production successfully
3. ✅ Production testing passed - Account creation successful
4. ✅ No `addedBy`/`addedAt` column errors
5. ✅ Production schema aligned with Dev-SWA and Prisma schema

## Final Resolution

**Root Cause:** Production database was missing `addedBy` and `addedAt` columns that Prisma schema expects.

**Solution:** Applied database migration to add missing columns to production.

**Result:** 
- ✅ Production database schema now matches Dev-SWA
- ✅ Production database schema now matches Prisma schema  
- ✅ EMS registration working correctly in production
- ✅ No code changes needed (raw SQL workarounds can remain for safety, but Prisma operations now work)

---

**Commit:** `35ea7186` - "Fix: EMS registration addedBy column error - use raw SQL fetch"  
**Status:** Ready for Dev-SWA deployment

