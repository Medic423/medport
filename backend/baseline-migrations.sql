-- Prisma Baseline SQL
-- Run this in Azure database to mark all migrations as applied
-- This fixes the P3005 error: "The database schema is not empty"

-- Connect to Azure database via pgAdmin or psql, then run this SQL

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

-- Verify the baseline worked:
-- SELECT COUNT(*) FROM _prisma_migrations;
-- Should return 29

-- List all migrations:
-- SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY migration_name;

