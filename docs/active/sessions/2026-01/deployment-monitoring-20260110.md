# Deployment Monitoring - January 10, 2026
**Status:** 🟡 **IN PROGRESS** - Monitoring deployment to dev-swa

---

## Deployment Details

**Pushed to:** `develop` branch  
**Time:** January 10, 2026  
**Commits Deployed:**
- `b3e27fb7` - fix: Healthcare destinations and available agencies - USER VERIFIED WORKING
- `55155947` - chore: Clean up documentation and add backup script

**Expected Workflows:**
1. `develop - Deploy Dev Backend` (includes database migrations)
2. `develop - Deploy Dev Frontend`

---

## Critical Monitoring Points

### ⚠️ Database Migration Step (HIGH PRIORITY)

**Step Name:** "Run Database Migrations"  
**Command:** `npx prisma migrate deploy`  
**Location:** `.github/workflows/dev-be.yaml` (line 52-57)

**What to Watch For:**
- ✅ **Success:** Migration completes without errors
- ❌ **Failure Indicators:**
  - "Column already exists" errors
  - "Migration already applied" errors
  - "Table doesn't exist" errors
  - "Migration state mismatch" errors
  - Any Prisma migration errors

**If Migration Fails:**
1. **Check GitHub Actions Logs:**
   - Go to: https://github.com/Medic423/medport/actions
   - Find the failed workflow run
   - Click on "Run Database Migrations" step
   - Copy the exact error message

2. **Common Failure Scenarios:**
   - **Scenario A:** Column already exists
     - **Cause:** Migration partially applied previously
     - **Solution:** Use pgAdmin to check what exists, apply remaining changes manually
   
   - **Scenario B:** Migration state mismatch
     - **Cause:** `_prisma_migrations` table out of sync with actual schema
     - **Solution:** Check migration status in pgAdmin, manually fix state
   
   - **Scenario C:** Missing migration file
     - **Cause:** Migration file not in repository
     - **Solution:** Verify migration file exists, re-run deployment

3. **pgAdmin Recovery Process:**
   - Connect to dev-swa database (`traccems-dev-pgsql`)
   - Check current schema state
   - Compare with expected schema (from Prisma schema)
   - Apply missing changes manually
   - Update `_prisma_migrations` table if needed

---

## Monitoring Checklist

### Backend Deployment (`develop - Deploy Dev Backend`)

- [ ] **Checkout repository** - Should complete quickly
- [ ] **Setup Node.js** - Should complete quickly
- [ ] **Install dependencies** - ~2-3 minutes
- [ ] **Generate Prisma Models** - ~30 seconds
- [ ] **⚠️ Run Database Migrations** - **CRITICAL STEP** - Monitor closely
  - [ ] Check for errors
  - [ ] Verify migration completes
  - [ ] Note any warnings
- [ ] **Build application** - ~1-2 minutes
- [ ] **Deploy to Azure Web App** - ~1-2 minutes

**Expected Total Time:** ~5-10 minutes

### Frontend Deployment (`develop - Deploy Dev Frontend`)

- [ ] **Checkout repository** - Should complete quickly
- [ ] **Setup Node.js** - Should complete quickly
- [ ] **Install dependencies** - ~2-3 minutes
- [ ] **Build React App** - ~1-2 minutes
- [ ] **Deploy to Azure Static Web Apps** - ~1-2 minutes

**Expected Total Time:** ~3-5 minutes

---

## Migration-Specific Checks

### Schema Changes Being Deployed

**From `backend/prisma/schema.prisma`:**
- `HealthcareDestination` model changes:
  - Removed `@map` directives for camelCase columns
  - Ensures columns match database structure

**Expected Migrations:**
- If `availabilityStatus` column doesn't exist in dev-swa:
  - Migration: `20251204130000_add_ems_agency_availability_status`
  - Should add `availabilityStatus` JSONB column to `ems_agencies` table

**Potential Issues:**
- ⚠️ If column already exists → Migration may fail
- ⚠️ If migration state is out of sync → May need manual fix
- ⚠️ If schema drift exists → May need pgAdmin intervention

---

## pgAdmin Recovery Plan (If Needed)

### Step 1: Connect to Dev-SWA Database

**Connection Details:**
- **Host:** `traccems-dev-pgsql.postgres.database.azure.com`
- **Port:** `5432`
- **Database:** `postgres`
- **Username:** `traccems_admin@traccems-dev-pgsql`
- **SSL Mode:** `Require`

### Step 2: Check Current Schema State

**Check `ems_agencies` table:**
```sql
-- Check if availabilityStatus column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ems_agencies' 
  AND column_name = 'availabilityStatus';

-- Expected: Should return availabilityStatus | jsonb
-- If empty: Column doesn't exist, needs to be added
```

**Check `healthcare_destinations` table:**
```sql
-- Check column names (should be camelCase)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'healthcare_destinations'
ORDER BY ordinal_position;

-- Expected: healthcareUserId, zipCode, contactName (camelCase)
-- If snake_case: Schema mismatch, needs fixing
```

**Check migration status:**
```sql
-- Check which migrations are applied
SELECT migration_name, finished_at, applied_steps_count
FROM _prisma_migrations
ORDER BY finished_at DESC
LIMIT 10;
```

### Step 3: Apply Missing Changes Manually

**If `availabilityStatus` column missing:**
```sql
-- Apply migration manually
ALTER TABLE "ems_agencies" 
ADD COLUMN "availabilityStatus" JSONB DEFAULT '{"isAvailable":false,"availableLevels":[]}';

COMMENT ON COLUMN "ems_agencies"."availabilityStatus" IS 'Agency-level availability status for EMS agencies. Stores isAvailable boolean and availableLevels array (BLS/ALS). Completely isolated from HealthcareAgencyPreference and Unit models.';
```

**If schema drift exists:**
- Compare actual schema with expected schema
- Apply missing changes incrementally
- Verify each change before moving to next

### Step 4: Update Migration Tracking (If Needed)

**Only if migration matches exactly:**
```sql
-- Mark migration as applied (use exact migration name and checksum)
INSERT INTO _prisma_migrations (migration_name, checksum, finished_at, applied_steps_count)
VALUES ('20251204130000_add_ems_agency_availability_status', 'checksum', NOW(), 1);
```

**⚠️ Warning:** Only update tracking if migration matches exactly. If you modified SQL, don't update tracking.

---

## Success Criteria

### ✅ Deployment Successful When:

1. **GitHub Actions:**
   - ✅ Backend workflow: "Completed" (green)
   - ✅ Frontend workflow: "Completed" (green)
   - ✅ No errors in logs
   - ✅ Migration step completed successfully

2. **Database:**
   - ✅ Schema matches local dev
   - ✅ `availabilityStatus` column exists in `ems_agencies`
   - ✅ `healthcare_destinations` has camelCase columns
   - ✅ No migration errors

3. **Azure Portal:**
   - ✅ Backend: Status "Running"
   - ✅ Frontend: Status "Running"
   - ✅ No errors in log stream

---

## Next Steps After Deployment

1. **Verify Database Schema:**
   - Connect via pgAdmin
   - Compare schema with local dev
   - Verify all expected columns exist

2. **Test Functionality:**
   - Available Agencies tab
   - Destinations GPS lookup
   - Destinations save

3. **Document Results:**
   - Update deployment plan
   - Note any issues found
   - Document pgAdmin fixes (if any)

---

**Status:** ✅ **DEPLOYMENT COMPLETE** - Ready for verification  
**Last Updated:** January 10, 2026
