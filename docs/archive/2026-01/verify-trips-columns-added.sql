-- Verify the new columns exist in trips table
-- Run this in pgAdmin to confirm all 25 columns were added

-- Check for new columns (should return 25 rows)
SELECT 
    column_name,
    data_type,
    is_nullable
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

-- Total column count (should be 63)
SELECT COUNT(*) AS total_columns
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'trips';

