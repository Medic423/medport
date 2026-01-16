-- Add Missing Columns to trips Table in Production (Fixed Version)
-- Date: January 7, 2026
-- Purpose: Add 25 missing columns to trips table to align with schema.prisma
-- 
-- Note: PostgreSQL 17 supports IF NOT EXISTS, but using DO block for compatibility
-- Run this script in pgAdmin Query Tool connected to production database

-- Step 1: Add route optimization fields (from migration 20250910191806)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'originLatitude') THEN
        ALTER TABLE "trips" ADD COLUMN "originLatitude" DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'originLongitude') THEN
        ALTER TABLE "trips" ADD COLUMN "originLongitude" DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'destinationLatitude') THEN
        ALTER TABLE "trips" ADD COLUMN "destinationLatitude" DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'destinationLongitude') THEN
        ALTER TABLE "trips" ADD COLUMN "destinationLongitude" DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'tripCost') THEN
        ALTER TABLE "trips" ADD COLUMN "tripCost" DECIMAL(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'distanceMiles') THEN
        ALTER TABLE "trips" ADD COLUMN "distanceMiles" DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'responseTimeMinutes') THEN
        ALTER TABLE "trips" ADD COLUMN "responseTimeMinutes" INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'deadheadMiles') THEN
        ALTER TABLE "trips" ADD COLUMN "deadheadMiles" DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'requestTimestamp') THEN
        ALTER TABLE "trips" ADD COLUMN "requestTimestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'estimatedTripTimeMinutes') THEN
        ALTER TABLE "trips" ADD COLUMN "estimatedTripTimeMinutes" INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'actualTripTimeMinutes') THEN
        ALTER TABLE "trips" ADD COLUMN "actualTripTimeMinutes" INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'completionTimeMinutes') THEN
        ALTER TABLE "trips" ADD COLUMN "completionTimeMinutes" INTEGER;
    END IF;
END $$;

-- Step 2: Add insurance pricing fields (from migration 20250910192847)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'insuranceCompany') THEN
        ALTER TABLE "trips" ADD COLUMN "insuranceCompany" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'insurancePayRate') THEN
        ALTER TABLE "trips" ADD COLUMN "insurancePayRate" DECIMAL(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'perMileRate') THEN
        ALTER TABLE "trips" ADD COLUMN "perMileRate" DECIMAL(8,2);
    END IF;
END $$;

-- Step 3: Add analytics fields (from migration 20250917160459)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'backhaulOpportunity') THEN
        ALTER TABLE "trips" ADD COLUMN "backhaulOpportunity" BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'customerSatisfaction') THEN
        ALTER TABLE "trips" ADD COLUMN "customerSatisfaction" INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'efficiency') THEN
        ALTER TABLE "trips" ADD COLUMN "efficiency" DECIMAL(5,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'loadedMiles') THEN
        ALTER TABLE "trips" ADD COLUMN "loadedMiles" DECIMAL(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'performanceScore') THEN
        ALTER TABLE "trips" ADD COLUMN "performanceScore" DECIMAL(5,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'revenuePerHour') THEN
        ALTER TABLE "trips" ADD COLUMN "revenuePerHour" DECIMAL(10,2);
    END IF;
END $$;

-- Step 4: Add response management fields (from schema.prisma)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'maxResponses') THEN
        ALTER TABLE "trips" ADD COLUMN "maxResponses" INTEGER NOT NULL DEFAULT 5;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'responseDeadline') THEN
        ALTER TABLE "trips" ADD COLUMN "responseDeadline" TIMESTAMP(3);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'responseStatus') THEN
        ALTER TABLE "trips" ADD COLUMN "responseStatus" TEXT NOT NULL DEFAULT 'PENDING';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'selectionMode') THEN
        ALTER TABLE "trips" ADD COLUMN "selectionMode" TEXT NOT NULL DEFAULT 'SPECIFIC_AGENCIES';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'pickupLocationId') THEN
        ALTER TABLE "trips" ADD COLUMN "pickupLocationId" TEXT;
    END IF;
END $$;

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

-- Count total columns in trips table (should be ~63 after adding these)
SELECT COUNT(*) AS total_columns
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'trips';

