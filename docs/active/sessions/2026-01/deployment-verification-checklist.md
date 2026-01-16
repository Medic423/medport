# Deployment Verification Checklist - January 10, 2026
**Status:** ✅ **DEPLOYMENT COMPLETE** - Ready for verification

---

## Deployment Summary

**Deployed Commits:**
- `b3e27fb7` - fix: Healthcare destinations and available agencies - USER VERIFIED WORKING
- `55155947` - chore: Clean up documentation and add backup script

**Deployment Time:** January 10, 2026  
**Target Environment:** dev-swa (`https://dev.traccems.com`)

---

## Critical Verification Steps

### ✅ Step 1: Verify Database Migrations Applied

**CRITICAL:** Since migrations have failed in the past, verify schema matches local dev.

#### Check via pgAdmin (Recommended)

**Connect to Dev-SWA Database:**
- **Host:** `traccems-dev-pgsql.postgres.database.azure.com`
- **Port:** `5432`
- **Database:** `postgres`
- **Username:** `traccems_admin@traccems-dev-pgsql`
- **SSL Mode:** `Require`

#### Verification Queries

**1. Check `availabilityStatus` column exists:**
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'ems_agencies' 
  AND column_name = 'availabilityStatus';

-- Expected Result:
-- availabilityStatus | jsonb | '{"isAvailable":false,"availableLevels":[]}'::jsonb
```

**2. Check `healthcare_destinations` table structure:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'healthcare_destinations'
ORDER BY ordinal_position;

-- Expected: camelCase columns (not snake_case)
-- Key columns to verify:
-- - healthcareUserId (not healthcare_user_id)
-- - zipCode (not zip_code)
-- - contactName (not contact_name)
-- - isActive (not is_active)
-- - createdAt (not created_at)
-- - updatedAt (not updated_at)
```

**3. Check migration status:**
```sql
SELECT migration_name, finished_at, applied_steps_count
FROM _prisma_migrations
WHERE migration_name LIKE '%availability%' 
   OR migration_name LIKE '%healthcare%'
ORDER BY finished_at DESC;

-- Should show recent migrations applied
```

**4. Compare with local dev:**
```sql
-- Run same queries on local dev database
-- Compare results - should match exactly
```

---

### ✅ Step 2: Test Available Agencies Tab

**URL:** https://dev.traccems.com → Healthcare → Available Agencies

**Expected Behavior:**
- ✅ Tab loads without "Failed to load available agencies" error
- ✅ Agencies display correctly
- ✅ No console errors
- ✅ No 500 errors in network tab

**Status:** ✅ **VERIFIED WORKING** - January 10, 2026

**If Error Occurs:**
- Check browser console for errors
- Check network tab for failed API calls
- Check Azure logs for backend errors
- Verify `availabilityStatus` column exists (Step 1)

---

### ✅ Step 3: Test Destinations GPS Lookup

**URL:** https://dev.traccems.com → Healthcare → Destinations → Add Destination

**Test GPS Lookup:**
1. Enter an address (e.g., "123 Main St, City, State")
2. Click "Lookup GPS"
3. **Expected:** GPS coordinates populate correctly
4. **Expected:** No errors in console

**Status:** ✅ **VERIFIED WORKING** - January 10, 2026

**If GPS Lookup Fails:**
- Check browser console for errors
- Check network tab for `/api/public/geocode` response
- Check Azure logs for backend errors
- Verify geocoding service is accessible

---

### ✅ Step 4: Test Destinations Save

**After GPS Lookup (or without):**
1. Fill in required fields:
   - Name (required)
   - Address (required)
   - City (required)
   - State (required)
   - Zip Code (required)
2. Optional fields:
   - GPS coordinates (if lookup worked)
   - Contact Name
   - Contact Phone
   - Contact Email
3. Click "Add Destination"
4. **Expected:** Destination saves successfully
5. **Expected:** No database errors
6. **Expected:** Destination appears in list

**Status:** ✅ **VERIFIED WORKING** - January 10, 2026

**If Save Fails:**
- Check error message (should be specific, not generic)
- Check browser console for errors
- Check network tab for `/api/healthcare/destinations` response
- Check Azure logs for backend errors
- **CRITICAL:** Verify database schema matches (Step 1)
  - If schema mismatch → Use pgAdmin to fix

---

### ✅ Step 5: Verify Code Sync

**Check deployed code matches local dev:**
```bash
# On local dev
git checkout develop
git pull origin develop

# Compare with feature branch (should be identical now)
git diff fix/healthcare-destinations-available-agencies develop
# Should show no differences (or only expected differences)
```

**Expected:**
- ✅ All fixes from feature branch are in `develop`
- ✅ `develop` branch matches what's deployed to dev-swa
- ✅ Local dev code matches dev-swa code

---

## Database Schema Verification (Detailed)

### Expected Schema Changes

#### 1. `ems_agencies` Table
**Column:** `availabilityStatus`  
**Type:** `jsonb`  
**Default:** `{"isAvailable":false,"availableLevels":[]}`  
**Comment:** "Agency-level availability status for EMS agencies..."

**Verification:**
```sql
-- Check column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'ems_agencies' 
  AND column_name = 'availabilityStatus';

-- Check comment
SELECT obj_description('ems_agencies'::regclass, 'pg_class')
UNION ALL
SELECT col_description('ems_agencies'::regclass::oid, 
  (SELECT ordinal_position FROM information_schema.columns 
   WHERE table_name = 'ems_agencies' AND column_name = 'availabilityStatus'));
```

#### 2. `healthcare_destinations` Table
**Expected Columns (camelCase):**
- `healthcareUserId` (not `healthcare_user_id`)
- `zipCode` (not `zip_code`)
- `contactName` (not `contact_name`)
- `isActive` (not `is_active`)
- `createdAt` (not `created_at`)
- `updatedAt` (not `updated_at`)

**Verification:**
```sql
-- Check all columns
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'healthcare_destinations'
ORDER BY ordinal_position;

-- Verify camelCase (should NOT see snake_case)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'healthcare_destinations'
  AND column_name LIKE '%\_%';  -- Should return empty (no snake_case)
```

---

## If Database Schema Mismatch Found

### Scenario 1: `availabilityStatus` Column Missing

**Fix via pgAdmin:**
```sql
ALTER TABLE "ems_agencies" 
ADD COLUMN "availabilityStatus" JSONB DEFAULT '{"isAvailable":false,"availableLevels":[]}';

COMMENT ON COLUMN "ems_agencies"."availabilityStatus" IS 'Agency-level availability status for EMS agencies. Stores isAvailable boolean and availableLevels array (BLS/ALS). Completely isolated from HealthcareAgencyPreference and Unit models.';
```

**Then mark migration as applied:**
```sql
-- Get checksum from migration file if needed
INSERT INTO _prisma_migrations (migration_name, checksum, finished_at, applied_steps_count)
VALUES ('20251204130000_add_ems_agency_availability_status', '', NOW(), 1)
ON CONFLICT (migration_name) DO NOTHING;
```

### Scenario 2: `healthcare_destinations` Has Snake_Case Columns

**This should NOT happen if migration ran correctly, but if it does:**

**Check current state:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'healthcare_destinations';
```

**If snake_case exists:**
- This indicates schema drift
- Prisma schema expects camelCase
- Code will fail with "column does not exist" errors
- **Solution:** This is a critical issue - schema needs to match Prisma model exactly

---

## Success Criteria

### ✅ Deployment Successful When:

1. **Database Schema:**
   - ✅ `availabilityStatus` column exists in `ems_agencies`
   - ✅ `healthcare_destinations` has camelCase columns
   - ✅ Schema matches local dev exactly

2. **Functionality:**
   - ✅ Available Agencies tab loads without errors (VERIFIED - Jan 10, 2026)
   - ✅ GPS lookup works (VERIFIED - Jan 10, 2026)
   - ✅ Destinations save successfully (VERIFIED - Jan 10, 2026)
   - ✅ No 500 errors

3. **Code Sync:**
   - ✅ dev-swa code matches `develop` branch
   - ✅ `develop` branch matches local dev code

---

## Next Steps

1. **Verify Database Schema** (via pgAdmin)
   - Check `availabilityStatus` column
   - Check `healthcare_destinations` structure
   - Compare with local dev

2. **Test Functionality**
   - Available Agencies tab
   - Destinations GPS lookup
   - Destinations save

3. **Document Results**
   - Update deployment plan
   - Note any issues found
   - Document pgAdmin fixes (if any)

4. **If Issues Found:**
   - Fix via pgAdmin
   - Re-test functionality
   - Update documentation

---

**Status:** ✅ Deployment Complete - Ready for Verification  
**Last Updated:** January 10, 2026
