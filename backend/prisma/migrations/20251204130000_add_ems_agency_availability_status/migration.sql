-- AlterTable: Add availabilityStatus JSON field to ems_agencies
-- This field stores agency-level availability status (not tied to units)
-- Structure: {"isAvailable": boolean, "availableLevels": string[]}
-- Default: {"isAvailable": false, "availableLevels": []}
ALTER TABLE "ems_agencies" 
ADD COLUMN "availabilityStatus" JSONB DEFAULT '{"isAvailable":false,"availableLevels":[]}';

-- Add comment to document the field purpose
COMMENT ON COLUMN "ems_agencies"."availabilityStatus" IS 'Agency-level availability status for EMS agencies. Stores isAvailable boolean and availableLevels array (BLS/ALS). Completely isolated from HealthcareAgencyPreference and Unit models.';

