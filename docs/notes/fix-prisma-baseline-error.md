# Fix Prisma P3005 Baseline Error
**Last Updated:** December 8, 2025

## Error

```
Error: P3005
The database schema is not empty. Read more about how to baseline an existing production database: https://pris.ly/d/migrate-baseline
```

## Problem

The Azure database already has tables/data, but Prisma doesn't have a migration history. Prisma can't determine which migrations have been applied.

## Solution: Baseline the Database

We need to tell Prisma that all existing migrations have already been applied to the current database state.

### Option 1: Use Prisma Migrate Resolve (Recommended)

This marks migrations as applied without running them:

```bash
# Connect to Azure database and mark migrations as applied
npx prisma migrate resolve --applied 20250908204607_enhanced_trip_schema
npx prisma migrate resolve --applied 20250908204620_enhanced_trip_schema
# ... repeat for all migrations
```

**But this is tedious for 29 migrations!**

### Option 2: Baseline All Migrations at Once (Better)

Use `prisma migrate resolve` with `--applied` flag for all migrations, or better yet:

**Create a script to mark all migrations as applied:**

```bash
cd backend

# Get list of all migrations
for migration in prisma/migrations/*/; do
  if [ -d "$migration" ]; then
    migration_name=$(basename "$migration")
    echo "Marking $migration_name as applied..."
    # This would need to be run against Azure database
  fi
done
```

### Option 3: Manual Baseline via SQL (Fastest)

Connect to Azure database and manually insert migration records:

```sql
-- Connect to Azure database via pgAdmin or psql
-- Then run this SQL to mark all migrations as applied

INSERT INTO _prisma_migrations (migration_name, finished_at, started_at, applied_steps_count)
VALUES 
  ('20250908204607_enhanced_trip_schema', NOW(), NOW(), 1),
  ('20250908204620_enhanced_trip_schema', NOW(), NOW(), 1),
  ('20250908204633_enhanced_trip_schema', NOW(), NOW(), 1),
  ('20250909152957_enhance_unit_model', NOW(), NOW(), 1),
  ('20250909155719_q', NOW(), NOW(), 1),
  ('20250909163838_replace_shift_times_with_onduty', NOW(), NOW(), 1),
  ('20250909170057_add_agency_relationship_to_ems_user', NOW(), NOW(), 1),
  ('20250909171727_remove_ison_duty_field', NOW(), NOW(), 1),
  ('20250910173907_add_insurance_field_to_trips', NOW(), NOW(), 1),
  ('20250910173915_add_dropdown_options_model', NOW(), NOW(), 1),
  ('20250910191806_add_route_optimization_fields', NOW(), NOW(), 1),
  ('20250910192847_add_insurance_pricing_fields', NOW(), NOW(), 1),
  ('20250917132535_add_route_optimization_settings', NOW(), NOW(), 1),
  ('20250917160459_add_analytics_fields', NOW(), NOW(), 1),
  ('20250917160504_add_unit_analytics_fields', NOW(), NOW(), 1),
  ('20250917165001_add_crew_cost_management', NOW(), NOW(), 1),
  ('20250917165101_add_crew_cost_management_ems', NOW(), NOW(), 1),
  ('20250917170653_add_center_tables', NOW(), NOW(), 1),
  ('20250917170718_add_insurance_company_column', NOW(), NOW(), 1),
  ('20250917170740_add_pricing_models', NOW(), NOW(), 1),
  ('20250917180000_add_trip_cost_breakdown_and_cost_centers', NOW(), NOW(), 1),
  ('20251008113055_add_multi_location_healthcare', NOW(), NOW(), 1),
  ('20251008124127_add_gps_coordinates_to_healthcare_locations', NOW(), NOW(), 1),
  ('20251031133000_add_patient_age_fields', NOW(), NOW(), 1),
  ('20251102101911_add_healthcare_destinations', NOW(), NOW(), 1),
  ('20251102140000_add_healthcare_agency_preferences', NOW(), NOW(), 1),
  ('20251116131400_add_separate_completion_timestamps', NOW(), NOW(), 1),
  ('20251204101500_add_user_deletion_fields', NOW(), NOW(), 1),
  ('20251204130000_add_ems_agency_availability_status', NOW(), NOW(), 1)
ON CONFLICT (migration_name) DO NOTHING;
```

## Step-by-Step: Baseline via pgAdmin

1. **Connect to Azure database** (see `docs/notes/azure-database-migration-pgadmin.md`)

2. **Check if `_prisma_migrations` table exists:**
   ```sql
   SELECT * FROM _prisma_migrations;
   ```

3. **If table doesn't exist, Prisma will create it. If it exists, check what's there:**
   ```sql
   SELECT migration_name FROM _prisma_migrations ORDER BY migration_name;
   ```

4. **Insert all migration records** using the SQL above

5. **Verify:**
   ```sql
   SELECT COUNT(*) FROM _prisma_migrations;
   -- Should show 29 migrations
   ```

6. **Re-run GitHub Actions workflow**

## Alternative: Use Prisma Migrate Deploy with Baseline Flag

If Prisma supports it, you might be able to use:

```bash
npx prisma migrate deploy --baseline
```

But this may not be available in all Prisma versions.

## Quick Fix Script

Create a script to generate the SQL:

```bash
cd backend
for dir in prisma/migrations/*/; do
  if [ -d "$dir" ]; then
    name=$(basename "$dir")
    echo "('$name', NOW(), NOW(), 1),"
  fi
done | grep -v "^(" | head -n -1
```

## After Baselines

1. ✅ All migrations marked as applied in `_prisma_migrations` table
2. ✅ Re-run GitHub Actions workflow
3. ✅ Prisma will see all migrations are applied
4. ✅ Future migrations will work normally

## Verification

After baselining, verify:

```sql
-- Check migration count
SELECT COUNT(*) FROM _prisma_migrations;

-- List all migrations
SELECT migration_name, finished_at 
FROM _prisma_migrations 
ORDER BY migration_name;
```

Should show all 29 migrations.

