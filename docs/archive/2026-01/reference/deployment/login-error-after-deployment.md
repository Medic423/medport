# Login Error After Deployment - Troubleshooting
**Last Updated:** December 9, 2025

## Problem

Getting internal server error when trying to log in after successful deployment.

## Previous Fix

We already fixed this by:
- ✅ Adding `deletedAt` and `isDeleted` columns to user tables
- ✅ Adding `availabilityStatus` to `ems_agencies`
- ✅ Restarting Azure App Service

## Possible Causes

### 1. App Service Needs Restart

After new deployment, the app might need a manual restart:

1. **Azure Portal** → **TraccEms-Dev-Backend**
2. **Overview** → **Restart**
3. Wait for restart to complete
4. Try login again

### 2. Prisma Client Not Regenerated

The deployment might not have regenerated Prisma client:

1. Check GitHub Actions logs for "Generate Prisma Models" step
2. Verify it completed successfully
3. If failed, Prisma client might be out of sync

### 3. Database Columns Missing (Unlikely)

We already verified columns exist, but double-check:

**In pgAdmin, run:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name IN ('center_users', 'healthcare_users', 'ems_users')
  AND column_name IN ('deletedAt', 'isDeleted')
ORDER BY table_name, column_name;
```

Should return 6 rows.

### 4. New Code Issue

Recent changes:
- SMS template update (shouldn't affect login)
- Privacy Policy/Terms pages (shouldn't affect login)
- Documentation files (shouldn't affect login)

But check if there's a syntax error or import issue.

## How to Diagnose

### Step 1: Check Azure Log Stream

1. **Azure Portal** → **TraccEms-Dev-Backend**
2. **Log stream** (left menu)
3. Try to log in
4. Watch for error messages in real-time
5. Look for:
   - Database errors
   - Column missing errors
   - Prisma errors
   - Stack traces

### Step 2: Check Application Logs

1. **Azure Portal** → **TraccEms-Dev-Backend**
2. **Advanced Tools (Kudu)** → **Go**
3. **Debug console** → **CMD**
4. Navigate to: `LogFiles/Application/`
5. Download recent log files
6. Look for error messages around login time

### Step 3: Verify Database Columns

Run verification query in pgAdmin:

```sql
-- Verify user deletion fields
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('center_users', 'healthcare_users', 'ems_users')
  AND column_name IN ('deletedAt', 'isDeleted')
ORDER BY table_name, column_name;

-- Should show 6 rows
```

## Quick Fixes

### Fix 1: Restart App Service

```bash
# Via Azure Portal
Azure Portal → TraccEms-Dev-Backend → Restart
```

### Fix 2: Verify Columns Exist

```sql
-- In pgAdmin
SELECT COUNT(*) FROM information_schema.columns
WHERE table_name IN ('center_users', 'healthcare_users', 'ems_users')
  AND column_name IN ('deletedAt', 'isDeleted');
-- Should return: 6
```

### Fix 3: Check Prisma Client Generation

Check GitHub Actions logs:
- Step: "Generate Prisma Models"
- Should complete successfully
- If failed, Prisma client might be outdated

## Common Errors

### Error: "Column deletedAt does not exist"
**Solution:** Columns missing - run migration SQL again

### Error: "Cannot read property 'isDeleted'"
**Solution:** Prisma client outdated - regenerate

### Error: "Database connection failed"
**Solution:** Check DATABASE_URL in Azure App Settings

### Error: "PrismaClientKnownRequestError"
**Solution:** Check specific error code and message

## Next Steps

1. ✅ Check Azure Portal → Log stream for actual error
2. ✅ Share error message for targeted fix
3. ✅ Try restarting App Service
4. ✅ Verify database columns still exist
5. ✅ Check Prisma client generation in deployment logs

## Most Likely Cause

**App Service needs restart** after new deployment. The new code was deployed but the app might not have restarted automatically.

Try restarting the App Service first, then check logs if error persists.

