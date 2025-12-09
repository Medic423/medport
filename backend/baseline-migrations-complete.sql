-- Complete Prisma Baseline SQL
-- This creates the _prisma_migrations table if it doesn't exist, then baselines all migrations
-- Run this in Azure database via pgAdmin

-- Step 1: Ensure _prisma_migrations table exists with correct structure
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create unique index on migration_name if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS "_prisma_migrations_migration_name_key" ON "_prisma_migrations"("migration_name");

-- Step 3: Baseline all 29 migrations
-- Using ON CONFLICT to avoid errors if migrations already exist
INSERT INTO "_prisma_migrations" (
    "id",
    "checksum",
    "migration_name",
    "started_at",
    "finished_at",
    "applied_steps_count"
)
VALUES
  (gen_random_uuid()::text, '', '20250908204607_enhanced_trip_schema', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250908204620_enhanced_trip_schema', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250908204633_enhanced_trip_schema', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250909152957_enhance_unit_model', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250909155719_q', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250909163838_replace_shift_times_with_onduty', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250909170057_add_agency_relationship_to_ems_user', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250909171727_remove_ison_duty_field', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250910173907_add_insurance_field_to_trips', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250910173915_add_dropdown_options_model', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250910191806_add_route_optimization_fields', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250910192847_add_insurance_pricing_fields', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250917132535_add_route_optimization_settings', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250917160459_add_analytics_fields', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250917160504_add_unit_analytics_fields', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250917165001_add_crew_cost_management', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250917165101_add_crew_cost_management_ems', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250917170653_add_center_tables', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250917170718_add_insurance_company_column', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250917170740_add_pricing_models', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20250917180000_add_trip_cost_breakdown_and_cost_centers', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20251008113055_add_multi_location_healthcare', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20251008124127_add_gps_coordinates_to_healthcare_locations', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20251031133000_add_patient_age_fields', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20251102101911_add_healthcare_destinations', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20251102140000_add_healthcare_agency_preferences', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20251116131400_add_separate_completion_timestamps', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20251204101500_add_user_deletion_fields', NOW(), NOW(), 1),
  (gen_random_uuid()::text, '', '20251204130000_add_ems_agency_availability_status', NOW(), NOW(), 1)
ON CONFLICT ("migration_name") DO NOTHING;

-- Step 4: Verify baseline worked
SELECT COUNT(*) as migration_count FROM "_prisma_migrations";
-- Should return 29

-- Step 5: List all migrations to verify
SELECT migration_name, finished_at 
FROM "_prisma_migrations" 
ORDER BY migration_name;

