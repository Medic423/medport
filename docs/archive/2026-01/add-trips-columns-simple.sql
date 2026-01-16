-- Simple version: Add columns directly (will error if column exists, but that's OK)
-- Run this in pgAdmin - if you get "column already exists" errors, that means they were added

-- Route optimization fields
ALTER TABLE "trips" ADD COLUMN "originLatitude" DOUBLE PRECISION;
ALTER TABLE "trips" ADD COLUMN "originLongitude" DOUBLE PRECISION;
ALTER TABLE "trips" ADD COLUMN "destinationLatitude" DOUBLE PRECISION;
ALTER TABLE "trips" ADD COLUMN "destinationLongitude" DOUBLE PRECISION;
ALTER TABLE "trips" ADD COLUMN "tripCost" DECIMAL(10,2);
ALTER TABLE "trips" ADD COLUMN "distanceMiles" DOUBLE PRECISION;
ALTER TABLE "trips" ADD COLUMN "responseTimeMinutes" INTEGER;
ALTER TABLE "trips" ADD COLUMN "deadheadMiles" DOUBLE PRECISION;
ALTER TABLE "trips" ADD COLUMN "requestTimestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "trips" ADD COLUMN "estimatedTripTimeMinutes" INTEGER;
ALTER TABLE "trips" ADD COLUMN "actualTripTimeMinutes" INTEGER;
ALTER TABLE "trips" ADD COLUMN "completionTimeMinutes" INTEGER;

-- Insurance & pricing fields
ALTER TABLE "trips" ADD COLUMN "insuranceCompany" TEXT;
ALTER TABLE "trips" ADD COLUMN "insurancePayRate" DECIMAL(10,2);
ALTER TABLE "trips" ADD COLUMN "perMileRate" DECIMAL(8,2);

-- Analytics fields
ALTER TABLE "trips" ADD COLUMN "backhaulOpportunity" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "trips" ADD COLUMN "customerSatisfaction" INTEGER;
ALTER TABLE "trips" ADD COLUMN "efficiency" DECIMAL(5,2);
ALTER TABLE "trips" ADD COLUMN "loadedMiles" DECIMAL(10,2);
ALTER TABLE "trips" ADD COLUMN "performanceScore" DECIMAL(5,2);
ALTER TABLE "trips" ADD COLUMN "revenuePerHour" DECIMAL(10,2);

-- Response management fields
ALTER TABLE "trips" ADD COLUMN "maxResponses" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "trips" ADD COLUMN "responseDeadline" TIMESTAMP(3);
ALTER TABLE "trips" ADD COLUMN "responseStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "trips" ADD COLUMN "selectionMode" TEXT NOT NULL DEFAULT 'SPECIFIC_AGENCIES';
ALTER TABLE "trips" ADD COLUMN "pickupLocationId" TEXT;

-- Verify
SELECT COUNT(*) AS total_columns
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'trips';

