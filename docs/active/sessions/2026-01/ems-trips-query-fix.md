# EMS Trips Query Fix
**Date:** January 7, 2026  
**Issue:** 400 Bad Request when loading trips for EMS users  
**Status:** 🔧 **FIX APPLIED**

---

## Problem

EMS users get "Failed to load trips" error (400 Bad Request) when accessing "Available Trips" tab.

**Error Details:**
- HTTP Status: 400 Bad Request
- Endpoint: `GET /api/trips?status=PENDING`
- User Type: EMS
- Error occurs even though `agency_responses` table exists

---

## Root Cause Analysis

### Issue Identified: Where Clause Conflict

**Problem in Code:**
- When `status=PENDING` is in query params, code sets `where.status = 'PENDING'` (line 172)
- When filtering for EMS users, code builds `agencyFilter` with `{ status: 'PENDING' }` (line 246)
- Code then sets `where.OR = agencyFilter` (line 260)
- **Result:** `where` clause has BOTH `where.status` AND `where.OR` with status
- This creates a logical conflict that may cause Prisma query issues

**Code Location:**
- `backend/src/services/tripService.ts` lines 224-269

---

## Fix Applied

**Change Made:**
- Remove `where.status` before setting `where.OR` when building agency filter
- This ensures status filter is only in the OR clause, not duplicated

**Code Change:**
```typescript
// Before setting where.OR, remove status from top level
delete where.status;
where.OR = agencyFilter;
```

**Also Applied:**
- When combining with existing OR (healthcare filter), remove status from top level

---

## Testing

### Local Testing ✅
- ✅ Query works with fix applied
- ✅ Query returns empty array when no trips exist (expected)
- ✅ No Prisma errors

### Production Testing ⏭️
- ⏭️ User needs to test after code deployment
- ⏭️ Verify "Available Trips" loads without error
- ⏭️ Verify empty state displays correctly when no trips

---

## Deployment Required

**Action:** Deploy updated `tripService.ts` to production

**Method:**
1. Commit code changes
2. Deploy via GitHub Actions workflow
3. Test in production

---

## Related Issues

- `agency_responses` table was missing (fixed separately)
- Where clause conflict (fixed in this change)

---

**Last Updated:** January 7, 2026  
**Status:** 🔧 Fix applied, ready for deployment and testing

