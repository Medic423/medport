# Database Migration Troubleshooting
**Last Updated:** December 8, 2025

## GitHub Actions Migration Failure

### Workflow Step That Failed:
```yaml
- name: Run Database Migrations
  run: npx prisma migrate deploy
  working-directory: '${{ env.FOLDER_PATH }}'
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  continue-on-error: false
```

## Common Migration Errors

### 1. "Migration Already Applied" Error
**Symptom:** Migration fails saying migration already exists in `_prisma_migrations` table

**Cause:** Migration was partially applied or applied manually

**Solution:**
```sql
-- Check migration status
SELECT migration_name, finished_at, applied_steps_count
FROM _prisma_migrations
ORDER BY finished_at DESC;

-- If migration exists but failed, you may need to:
-- 1. Mark it as completed manually, OR
-- 2. Rollback and reapply
```

### 2. "Column Already Exists" Error
**Symptom:** `ERROR: column "isDeleted" already exists in table "ems_users"`

**Cause:** Migration partially applied - columns created but migration not marked complete

**Solution:**
- Check if columns exist: `\d ems_users` (in psql) or check table structure in pgAdmin
- If columns exist, manually mark migration as complete:
```sql
INSERT INTO _prisma_migrations (migration_name, finished_at, started_at, applied_steps_count)
VALUES ('20251204101500_add_user_deletion_fields', NOW(), NOW(), 1)
ON CONFLICT DO NOTHING;
```

### 3. "Permission Denied" Error
**Symptom:** `ERROR: permission denied for table...`

**Cause:** Database user doesn't have ALTER TABLE permissions

**Solution:**
- Ensure Azure database user has proper permissions
- May need to grant permissions:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### 4. "Connection Timeout" Error
**Symptom:** Migration step times out

**Cause:** Network issues, firewall, or database overload

**Solution:**
- Check Azure firewall rules
- Verify DATABASE_URL is correct
- Check Azure service status

### 5. "Migration Lock" Error
**Symptom:** `Migration lock could not be acquired`

**Cause:** Another migration process is running

**Solution:**
- Wait for other processes to complete
- Check for stuck connections
- May need to manually release lock

## How to Check Migration Status

### Via pgAdmin:
1. Connect to Azure database
2. Open Query Tool
3. Run:
```sql
SELECT migration_name, finished_at, applied_steps_count, logs
FROM _prisma_migrations
ORDER BY finished_at DESC
LIMIT 10;
```

### Via psql:
```bash
psql "your-azure-connection-string" -c "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC;"
```

## Manual Migration Application

### Step 1: Check Current State
```sql
-- List all migrations applied
SELECT migration_name FROM _prisma_migrations ORDER BY migration_name;

-- Check if columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'ems_users' 
AND column_name IN ('isDeleted', 'deletedAt');
```

### Step 2: Apply Missing Migrations

**Migration 1: User Deletion Fields**
```sql
-- Check if columns exist first
SELECT column_name 
FROM information_schema.columns 
WHERE table_name IN ('center_users', 'healthcare_users', 'ems_users')
AND column_name IN ('isDeleted', 'deletedAt');

-- If columns don't exist, apply migration:
ALTER TABLE "center_users" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "healthcare_users" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "ems_users" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "center_users_isDeleted_idx" ON "center_users"("isDeleted");
CREATE INDEX "healthcare_users_isDeleted_idx" ON "healthcare_users"("isDeleted");
CREATE INDEX "ems_users_isDeleted_idx" ON "ems_users"("isDeleted");

-- Mark migration as complete
INSERT INTO _prisma_migrations (migration_name, finished_at, started_at, applied_steps_count)
VALUES ('20251204101500_add_user_deletion_fields', NOW(), NOW(), 1);
```

**Migration 2: EMS Agency Availability Status**
```sql
-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'ems_agencies' 
AND column_name = 'availabilityStatus';

-- If column doesn't exist, apply migration:
ALTER TABLE "ems_agencies" 
ADD COLUMN "availabilityStatus" JSONB DEFAULT '{"isAvailable":false,"availableLevels":[]}';

COMMENT ON COLUMN "ems_agencies"."availabilityStatus" IS 'Agency-level availability status for EMS agencies. Stores isAvailable boolean and availableLevels array (BLS/ALS). Completely isolated from HealthcareAgencyPreference and Unit models.';

-- Mark migration as complete
INSERT INTO _prisma_migrations (migration_name, finished_at, started_at, applied_steps_count)
VALUES ('20251204130000_add_ems_agency_availability_status', NOW(), NOW(), 1);
```

## After Fixing Migrations

1. **Verify migrations are applied:**
```sql
SELECT migration_name, finished_at 
FROM _prisma_migrations 
WHERE migration_name IN (
  '20251204101500_add_user_deletion_fields',
  '20251204130000_add_ems_agency_availability_status'
);
```

2. **Redeploy backend:**
   - Push a new commit to `develop` branch, OR
   - Re-run the failed GitHub Actions workflow

3. **Verify deployment succeeds:**
   - Check GitHub Actions logs
   - Verify backend starts successfully
   - Test functionality

## Getting Actual Error Logs

To see the exact error from GitHub Actions:

1. Go to: https://github.com/Medic423/medport/actions
2. Click on the most recent failed workflow run
3. Expand the **"Run Database Migrations"** step
4. Look for error messages (usually in red)
5. Copy the error message for troubleshooting

Common error patterns to look for:
- `ERROR:` - PostgreSQL errors
- `Migration ... failed` - Prisma migration errors
- `Connection refused` - Database connection issues
- `Permission denied` - Access issues

## Quick Fix Checklist

- [ ] Check GitHub Actions logs for exact error
- [ ] Connect to Azure database via pgAdmin
- [ ] Check `_prisma_migrations` table for applied migrations
- [ ] Check if columns/tables already exist
- [ ] Apply missing migrations manually if needed
- [ ] Mark migrations as complete in `_prisma_migrations` table
- [ ] Redeploy backend
- [ ] Verify deployment succeeds

