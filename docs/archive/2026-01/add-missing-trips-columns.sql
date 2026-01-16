-- Add Missing Columns to trips Table in Production
-- Date: January 7, 2026
-- Purpose: Add 25 missing columns to trips table to align with schema.prisma
-- 
-- Run this script in pgAdmin Query Tool connected to production database

-- Step 1: Add route optimization fields (from migration 20250910191806)
ALTER TABLE "trips" 
  ADD COLUMN IF NOT EXISTS "originLatitude" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "originLongitude" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "destinationLatitude" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "destinationLongitude" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "tripCost" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "distanceMiles" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "responseTimeMinutes" INTEGER,
  ADD COLUMN IF NOT EXISTS "deadheadMiles" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "requestTimestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "estimatedTripTimeMinutes" INTEGER,
  ADD COLUMN IF NOT EXISTS "actualTripTimeMinutes" INTEGER,
  ADD COLUMN IF NOT EXISTS "completionTimeMinutes" INTEGER;

-- Step 2: Add insurance pricing fields (from migration 20250910192847)
ALTER TABLE "trips"
  ADD COLUMN IF NOT EXISTS "insuranceCompany" TEXT,
  ADD COLUMN IF NOT EXISTS "insurancePayRate" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "perMileRate" DECIMAL(8,2);

-- Step 3: Add analytics fields (from migration 20250917160459)
ALTER TABLE "trips"
  ADD COLUMN IF NOT EXISTS "backhaulOpportunity" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "customerSatisfaction" INTEGER,
  ADD COLUMN IF NOT EXISTS "efficiency" DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS "loadedMiles" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "performanceScore" DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS "revenuePerHour" DECIMAL(10,2);

-- Step 4: Add response management fields (from schema.prisma)
ALTER TABLE "trips"
  ADD COLUMN IF NOT EXISTS "maxResponses" INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS "responseDeadline" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "responseStatus" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "selectionMode" TEXT NOT NULL DEFAULT 'SPECIFIC_AGENCIES',
  ADD COLUMN IF NOT EXISTS "pickupLocationId" TEXT;

-- Verify columns were added (should return 25 rows)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'trips'
AND column_name IN (
    'originLatitude', 'originLongitude', 'destinationLatitude', 'destinationLongitude',
    'tripCost', 'distanceMiles', 'responseTimeMinutes', 'deadheadMiles',
    'requestTimestamp', 'estimatedTripTimeMinutes', 'actualTripTimeMinutes',
    'completionTimeMinutes', 'insuranceCompany', 'insurancePayRate', 'perMileRate',
    'backhaulOpportunity', 'customerSatisfaction', 'efficiency', 'loadedMiles',
    'performanceScore', 'revenuePerHour', 'maxResponses', 'responseDeadline',
    'responseStatus', 'selectionMode', 'pickupLocationId'
)
ORDER BY column_name;

-- Count total columns in trips table (should be ~50+ after adding these)
SELECT COUNT(*) AS total_columns
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'trips';

