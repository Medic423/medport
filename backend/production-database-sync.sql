-- ============================================================================
-- Production Database Sync SQL
-- Generated: January 14, 2026
-- Purpose: Sync production database schema to match dev-swa and schema.prisma
-- 
-- ⚠️  WARNING: Review this SQL carefully before executing!
-- ⚠️  This will modify production database structure
-- ⚠️  Ensure you have a backup before proceeding
-- ============================================================================

-- NOTE: This SQL was generated using:
--   npx prisma migrate diff --from-schema-datasource --to-schema-datamodel
--
-- It will:
--   1. Create missing tables: backhaul_opportunities, pricing_models, units, 
--      unit_analytics, notification_preferences, notification_logs
--   2. Add missing columns to existing tables
--   3. Fix column naming (snake_case → camelCase in healthcare_destinations)
--   4. Remove columns that exist in production but not in schema
--   5. DROP the "agencies" table (exists in prod but not in dev-swa/schema)
--      ⚠️  REVIEW: Check if agencies table has data before dropping!

-- ============================================================================
-- STEP 1: Drop Foreign Keys (required before altering tables)
-- ============================================================================

ALTER TABLE "healthcare_destinations" DROP CONSTRAINT IF EXISTS "healthcare_destinations_healthcare_user_id_fkey";

ALTER TABLE "transport_requests" DROP CONSTRAINT IF EXISTS "transport_requests_healthcareCreatedById_fkey";

-- ============================================================================
-- STEP 2: Drop Indexes (required before altering tables)
-- ============================================================================

DROP INDEX IF EXISTS "agency_responses_agencyId_idx";
DROP INDEX IF EXISTS "agency_responses_response_idx";
DROP INDEX IF EXISTS "agency_responses_tripId_agencyId_idx";
DROP INDEX IF EXISTS "agency_responses_tripId_idx";
DROP INDEX IF EXISTS "healthcare_destinations_healthcare_user_id_idx";
DROP INDEX IF EXISTS "healthcare_destinations_is_active_idx";
DROP INDEX IF EXISTS "route_optimization_settings_agencyId_idx";
DROP INDEX IF EXISTS "route_optimization_settings_isActive_idx";
DROP INDEX IF EXISTS "transport_requests_healthcareCreatedById_idx";
DROP INDEX IF EXISTS "transport_requests_pickupLocationId_idx";

-- ============================================================================
-- STEP 3: Alter Existing Tables (add missing columns, fix types)
-- ============================================================================

-- Fix center_users columns
ALTER TABLE "center_users" ALTER COLUMN "emailNotifications" SET NOT NULL,
ALTER COLUMN "smsNotifications" SET NOT NULL;

-- Fix dropdown tables
ALTER TABLE "dropdown_category_defaults" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "dropdown_options" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Add missing columns to facilities
ALTER TABLE "facilities" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "approvedBy" TEXT,
ADD COLUMN IF NOT EXISTS "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "coordinates" JSONB,
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "operatingHours" TEXT,
ADD COLUMN IF NOT EXISTS "requiresReview" BOOLEAN NOT NULL DEFAULT false;

-- Fix healthcare_destinations column naming (snake_case → camelCase)
-- This section is handled in the consolidated DO block below

-- Fix healthcare_destinations column naming (snake_case → camelCase)
-- Consolidated logic: check if old columns exist, migrate if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'healthcare_destinations' 
        AND column_name = 'contact_name'
    ) THEN
        -- Old columns exist - add new columns first (allow NULL initially)
        ALTER TABLE "healthcare_destinations" 
            ADD COLUMN IF NOT EXISTS "contactName" TEXT,
            ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3),
            ADD COLUMN IF NOT EXISTS "healthcareUserId" TEXT,
            ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN,
            ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3),
            ADD COLUMN IF NOT EXISTS "zipCode" TEXT;
        
        -- Now migrate data (columns exist, so WHERE clause will work)
        UPDATE "healthcare_destinations" 
        SET 
            "contactName" = "contact_name",
            "createdAt" = COALESCE("created_at", CURRENT_TIMESTAMP),
            "healthcareUserId" = "healthcare_user_id",
            "isActive" = COALESCE("is_active", true),
            "updatedAt" = COALESCE("updated_at", CURRENT_TIMESTAMP),
            "zipCode" = "zip_code"
        WHERE "contactName" IS NULL;
        
        -- Set NOT NULL constraints and defaults
        ALTER TABLE "healthcare_destinations" 
            ALTER COLUMN "createdAt" SET NOT NULL,
            ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
            ALTER COLUMN "healthcareUserId" SET NOT NULL,
            ALTER COLUMN "isActive" SET NOT NULL,
            ALTER COLUMN "isActive" SET DEFAULT true,
            ALTER COLUMN "updatedAt" SET NOT NULL,
            ALTER COLUMN "zipCode" SET NOT NULL;
        
        -- Drop old columns after migration
        ALTER TABLE "healthcare_destinations" 
            DROP COLUMN IF EXISTS "contact_name",
            DROP COLUMN IF EXISTS "created_at",
            DROP COLUMN IF EXISTS "healthcare_user_id",
            DROP COLUMN IF EXISTS "is_active",
            DROP COLUMN IF EXISTS "updated_at",
            DROP COLUMN IF EXISTS "zip_code";
    ELSE
        -- Old columns don't exist - just add new columns with proper constraints
        ALTER TABLE "healthcare_destinations" 
            ADD COLUMN IF NOT EXISTS "contactName" TEXT,
            ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN IF NOT EXISTS "healthcareUserId" TEXT NOT NULL,
            ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
            ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL,
            ADD COLUMN IF NOT EXISTS "zipCode" TEXT NOT NULL;
    END IF;
END $$;

-- Now set NOT NULL constraints and defaults (after data migration)
ALTER TABLE "healthcare_destinations" 
    ALTER COLUMN "createdAt" SET NOT NULL,
    ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN "healthcareUserId" SET NOT NULL,
    ALTER COLUMN "isActive" SET NOT NULL,
    ALTER COLUMN "isActive" SET DEFAULT true,
    ALTER COLUMN "updatedAt" SET NOT NULL,
    ALTER COLUMN "zipCode" SET NOT NULL;

-- Drop old columns after migration is complete
ALTER TABLE "healthcare_destinations" 
    DROP COLUMN IF EXISTS "contact_name",
    DROP COLUMN IF EXISTS "created_at",
    DROP COLUMN IF EXISTS "healthcare_user_id",
    DROP COLUMN IF EXISTS "is_active",
    DROP COLUMN IF EXISTS "updated_at",
    DROP COLUMN IF EXISTS "zip_code";

-- Fix healthcare_locations column types
ALTER TABLE "healthcare_locations" ALTER COLUMN "locationName" SET DATA TYPE TEXT,
ALTER COLUMN "address" SET DATA TYPE TEXT,
ALTER COLUMN "city" SET DATA TYPE TEXT,
ALTER COLUMN "state" SET DATA TYPE TEXT,
ALTER COLUMN "zipCode" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "facilityType" SET DATA TYPE TEXT;

-- Fix pickup_locations
ALTER TABLE "pickup_locations" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Add createdAt to system_analytics
ALTER TABLE "system_analytics" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Remove old columns from transport_requests (these exist in prod but not dev-swa)
-- ⚠️  REVIEW: These columns may have data - verify before dropping!
ALTER TABLE "transport_requests" 
    DROP COLUMN IF EXISTS "emsArrivalTime",
    DROP COLUMN IF EXISTS "emsDepartureTime",
    DROP COLUMN IF EXISTS "readyEnd",
    DROP COLUMN IF EXISTS "readyStart",
    DROP COLUMN IF EXISTS "transferAcceptedTime",
    DROP COLUMN IF EXISTS "transferRequestTime";

-- Add missing columns to trips
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "actualTripTimeMinutes" INTEGER,
ADD COLUMN IF NOT EXISTS "backhaulOpportunity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "completionTimeMinutes" INTEGER,
ADD COLUMN IF NOT EXISTS "customerSatisfaction" INTEGER,
ADD COLUMN IF NOT EXISTS "deadheadMiles" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "destinationLatitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "destinationLongitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "distanceMiles" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "efficiency" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS "estimatedTripTimeMinutes" INTEGER,
ADD COLUMN IF NOT EXISTS "insuranceCompany" TEXT,
ADD COLUMN IF NOT EXISTS "insurancePayRate" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "loadedMiles" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "maxResponses" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS "originLatitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "originLongitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "perMileRate" DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS "performanceScore" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS "pickupLocationId" TEXT,
ADD COLUMN IF NOT EXISTS "requestTimestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "responseDeadline" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "responseStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "responseTimeMinutes" INTEGER,
ADD COLUMN IF NOT EXISTS "revenuePerHour" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "selectionMode" TEXT NOT NULL DEFAULT 'SPECIFIC_AGENCIES',
ADD COLUMN IF NOT EXISTS "tripCost" DECIMAL(10,2);

-- ============================================================================
-- STEP 4: Drop agencies table (legacy table - not in schema)
-- NOTE: This is a legacy table. The main agency table is "ems_agencies" 
--       which already exists and contains the real agency data.
-- ============================================================================

DROP TABLE IF EXISTS "agencies";

-- ============================================================================
-- STEP 5: Create Missing Tables
-- ============================================================================

-- Create backhaul_opportunities table
CREATE TABLE IF NOT EXISTS "backhaul_opportunities" (
    "id" TEXT NOT NULL,
    "tripId1" TEXT NOT NULL,
    "tripId2" TEXT NOT NULL,
    "revenueBonus" DECIMAL(10,2),
    "efficiency" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "backhaul_opportunities_pkey" PRIMARY KEY ("id")
);

-- Create pricing_models table
CREATE TABLE IF NOT EXISTS "pricing_models" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "baseRates" JSONB NOT NULL,
    "perMileRates" JSONB NOT NULL,
    "priorityMultipliers" JSONB NOT NULL,
    "peakHourMultipliers" JSONB NOT NULL,
    "weekendMultipliers" JSONB NOT NULL,
    "seasonalMultipliers" JSONB NOT NULL,
    "zoneMultipliers" JSONB NOT NULL,
    "distanceTiers" JSONB NOT NULL,
    "specialRequirements" JSONB NOT NULL,
    "isolationPricing" DECIMAL(8,2),
    "bariatricPricing" DECIMAL(8,2),
    "oxygenPricing" DECIMAL(8,2),
    "monitoringPricing" DECIMAL(8,2),
    "insuranceRates" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_models_pkey" PRIMARY KEY ("id")
);

-- Create units table
CREATE TABLE IF NOT EXISTS "units" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "currentStatus" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "currentLocation" TEXT,
    "capabilities" TEXT[],
    "crewSize" INTEGER NOT NULL DEFAULT 2,
    "equipment" TEXT[],
    "location" JSONB,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "lastMaintenance" TIMESTAMP(3),
    "nextMaintenance" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastStatusUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- Create unit_analytics table
CREATE TABLE IF NOT EXISTS "unit_analytics" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "performanceScore" DECIMAL(5,2),
    "efficiency" DECIMAL(5,2),
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "totalTripsCompleted" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" DECIMAL(5,2),
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_analytics_pkey" PRIMARY KEY ("id")
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS "notification_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "errorMessage" TEXT,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- STEP 6: Create Indexes
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS "units_agencyId_unitNumber_key" ON "units"("agencyId", "unitNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "unit_analytics_unitId_key" ON "unit_analytics"("unitId");
CREATE UNIQUE INDEX IF NOT EXISTS "notification_preferences_userId_notificationType_key" ON "notification_preferences"("userId", "notificationType");
CREATE INDEX IF NOT EXISTS "healthcare_destinations_healthcareUserId_idx" ON "healthcare_destinations"("healthcareUserId");
CREATE INDEX IF NOT EXISTS "healthcare_destinations_isActive_idx" ON "healthcare_destinations"("isActive");

-- ============================================================================
-- STEP 7: Add Foreign Keys
-- ============================================================================

ALTER TABLE "healthcare_destinations" 
    ADD CONSTRAINT "healthcare_destinations_healthcareUserId_fkey" 
    FOREIGN KEY ("healthcareUserId") 
    REFERENCES "healthcare_users"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ems_users" 
    ADD CONSTRAINT "ems_users_agencyId_fkey" 
    FOREIGN KEY ("agencyId") 
    REFERENCES "ems_agencies"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "trips" 
    ADD CONSTRAINT "trips_pickupLocationId_fkey" 
    FOREIGN KEY ("pickupLocationId") 
    REFERENCES "pickup_locations"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "agency_responses" 
    ADD CONSTRAINT "agency_responses_assignedUnitId_fkey" 
    FOREIGN KEY ("assignedUnitId") 
    REFERENCES "units"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "units" 
    ADD CONSTRAINT "units_agencyId_fkey" 
    FOREIGN KEY ("agencyId") 
    REFERENCES "ems_agencies"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "unit_analytics" 
    ADD CONSTRAINT "unit_analytics_unitId_fkey" 
    FOREIGN KEY ("unitId") 
    REFERENCES "units"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notification_preferences" 
    ADD CONSTRAINT "notification_preferences_userId_fkey" 
    FOREIGN KEY ("userId") 
    REFERENCES "center_users"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notification_logs" 
    ADD CONSTRAINT "notification_logs_userId_fkey" 
    FOREIGN KEY ("userId") 
    REFERENCES "center_users"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transport_requests" 
    ADD CONSTRAINT "transport_requests_assignedUnitId_fkey" 
    FOREIGN KEY ("assignedUnitId") 
    REFERENCES "units"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "transport_requests" 
    ADD CONSTRAINT "transport_requests_destinationFacilityId_fkey" 
    FOREIGN KEY ("destinationFacilityId") 
    REFERENCES "facilities"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "transport_requests" 
    ADD CONSTRAINT "transport_requests_originFacilityId_fkey" 
    FOREIGN KEY ("originFacilityId") 
    REFERENCES "facilities"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after executing the SQL)
-- ============================================================================

-- Check if all tables were created:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('backhaul_opportunities', 'pricing_models', 'units', 'unit_analytics', 'notification_preferences', 'notification_logs')
-- ORDER BY table_name;

-- Check if trips table has all columns:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'trips' 
-- AND column_name IN ('backhaulOpportunity', 'efficiency', 'revenuePerHour', 'tripCost')
-- ORDER BY column_name;

-- ============================================================================
-- END OF SQL SCRIPT
-- ============================================================================
