-- Apply EMS Agency Availability Status Migration
-- This migration adds availabilityStatus JSONB field to ems_agencies
-- Run this in Azure database via pgAdmin

-- Add availabilityStatus column to ems_agencies
ALTER TABLE "ems_agencies" 
ADD COLUMN IF NOT EXISTS "availabilityStatus" JSONB DEFAULT '{"isAvailable":false,"availableLevels":[]}';

-- Add comment to document the field purpose
COMMENT ON COLUMN "ems_agencies"."availabilityStatus" IS 'Agency-level availability status for EMS agencies. Stores isAvailable boolean and availableLevels array (BLS/ALS). Completely isolated from HealthcareAgencyPreference and Unit models.';

-- Verify column was added
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'ems_agencies'
  AND column_name = 'availabilityStatus';

