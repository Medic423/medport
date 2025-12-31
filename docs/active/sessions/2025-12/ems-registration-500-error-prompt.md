# EMS Registration 500 Error - Production Database Schema Mismatch

## Current Problem

EMS registration on production (`traccems.com`) is failing with a **500 Internal Server Error**. The error response shows:

```json
{
  "success": false,
  "error": "Invalid `prisma.eMSAgency.create()` invocation:\n\nThe column `addedAt` does not exist in the current database.",
  "code": "P2022",
  "meta": {
    "modelName": "EMSAgency",
    "column": "addedAt"
  },
  "prismaError": true,
  "prismaCode": "P2022"
}
```

**Error Code**: P2022 (Prisma error: Column does not exist)

## What Has Been Tried

### ✅ Fixes Already Deployed

1. **Fixed `addedBy` column access** (commit `323daafc`)
   - Modified `findFirst` query to use `select: { id: true }` to avoid accessing non-existent `addedBy` column
   - This fixed the initial error when checking for existing agencies

2. **Removed `addedAt` from create operation** (commit `fc82d1e2`)
   - Removed `addedAt: new Date()` from the `agencyData` object
   - Added comment noting we're not setting `addedBy` or `addedAt` as they may not exist

3. **Added extensive error logging** (commits `f03e3b93`, `955703b5`)
   - Backend logs detailed error information
   - Frontend logs full error response details
   - This helped identify the exact error

### ⚠️ Current Status

- **GPS Lookup**: ✅ Working (may be slow due to Nominatim rate limiting)
- **EMS Registration**: ❌ Still failing with 500 error - `addedAt` column error persists
- **Backend Logs**: Show detailed error messages (see below for how to access)

## Root Cause Analysis

The Prisma schema (`backend/prisma/schema.prisma`) defines:
```prisma
model EMSAgency {
  // ...
  addedBy  String?
  addedAt  DateTime @default(now())
  // ...
}
```

However, the production database doesn't have these columns. Even though we removed `addedAt` from the create operation, Prisma may still be trying to use the `@default(now())` value, which requires the column to exist.

## Files Involved

- **Backend Registration Endpoint**: `backend/src/routes/auth.ts` (lines ~745-780)
- **Prisma Schema**: `backend/prisma/schema.prisma` (lines ~175-212)
- **Frontend Registration Form**: `frontend/src/components/EMSRegistration.tsx`

## Possible Solutions

### Option 1: Add Missing Columns to Production Database (Recommended)
Create a migration to add the missing columns:
```sql
ALTER TABLE ems_agencies 
ADD COLUMN IF NOT EXISTS "addedBy" TEXT,
ADD COLUMN IF NOT EXISTS "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
```

**Pros**: Keeps Prisma schema and database in sync
**Cons**: Requires database migration

### Option 2: Update Prisma Schema to Match Production
Remove `addedBy` and `addedAt` from Prisma schema if they're not needed:
```prisma
model EMSAgency {
  // Remove these lines:
  // addedBy  String?
  // addedAt  DateTime @default(now())
}
```

**Pros**: Quick fix, no database changes
**Cons**: Schema drift between dev and production

### Option 3: Make Fields Truly Optional in Create
Use Prisma's `omit` or explicitly exclude fields that don't exist:
```typescript
const agency = await centerDB.eMSAgency.create({
  data: {
    // ... other fields
  },
  // Explicitly omit fields that don't exist
});
```

**Note**: This may not work if Prisma tries to use defaults.

## How to Access Backend Logs

```bash
az webapp log tail \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral
```

Look for messages starting with `TCC_DEBUG:` to see detailed error information.

## Testing Steps

1. **Check Production Database Schema**
   - Connect to production database
   - Run: `\d ems_agencies` (in psql) or check columns via Azure Portal
   - Document which columns actually exist

2. **Compare with Prisma Schema**
   - Review `backend/prisma/schema.prisma` EMSAgency model
   - Identify all fields that don't exist in production

3. **Choose Solution**
   - If columns are needed: Create migration to add them
   - If columns aren't needed: Remove from Prisma schema
   - Regenerate Prisma client: `npx prisma generate`

4. **Test Registration**
   - Navigate to `https://traccems.com/ems-register`
   - Fill out form and test GPS lookup
   - Submit registration
   - Verify success

## Related Issues

- **TCC Admin Dashboard**: Shows 0 agencies (should show actual count) - analytics endpoint may have similar schema issues
- **GPS Lookup**: Working but slow (due to Nominatim rate limiting - acceptable)

## Context Documents

- **Plan Document**: `docs/active/sessions/2025-12/plan_for_20251231.md` - Full session context and progress
- **Testing Checklist**: `docs/active/sessions/2025-12/testing_checklist_20251231.md` - Complete testing steps
- **Backup Strategy**: `docs/reference/backup/BACKUP_STRATEGY.md` - How to restore if needed

## Git Status

- **Main Branch**: All fixes committed (commit `f58bde3a`)
- **Develop Branch**: Synced with main
- **Backup Created**: `/Volumes/Acasis/tcc-backups/tcc-backup-20251231_122924`

## Next Steps

1. **Immediate**: Check production database schema to confirm which columns exist
2. **Fix**: Either add missing columns OR update Prisma schema to match production
3. **Test**: Verify EMS registration works after fix
4. **Continue**: Complete GPS functionality testing across all 7 forms
5. **Verify**: Test agency data persistence after navigation

---

**Created**: December 31, 2025  
**Status**: Blocking issue - needs resolution before continuing testing

