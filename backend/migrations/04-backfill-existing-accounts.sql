-- Backfill Existing Accounts with Subscription Plan Assignments
-- Run this script in pgAdmin 4 after adding subscription fields
-- This assigns FREE plans to existing accounts and sets trial dates

-- Update healthcare_users
UPDATE "healthcare_users"
SET 
    "subscriptionPlanId" = (
        SELECT "id" FROM "subscription_plans" 
        WHERE "name" = 'FREE' AND "userType" = 'HEALTHCARE' 
        LIMIT 1
    ),
    "subscriptionStatus" = CASE 
        WHEN "createdAt" > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 'TRIAL'
        ELSE 'EXPIRED'
    END,
    "trialStartDate" = "createdAt",
    "trialEndDate" = "createdAt" + INTERVAL '7 days'
WHERE "subscriptionPlanId" IS NULL;

-- Update ems_users
UPDATE "ems_users"
SET 
    "subscriptionPlanId" = (
        SELECT "id" FROM "subscription_plans" 
        WHERE "name" = 'FREE' AND "userType" = 'EMS' 
        LIMIT 1
    ),
    "subscriptionStatus" = CASE 
        WHEN "createdAt" > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 'TRIAL'
        ELSE 'EXPIRED'
    END,
    "trialStartDate" = "createdAt",
    "trialEndDate" = "createdAt" + INTERVAL '7 days'
WHERE "subscriptionPlanId" IS NULL;

-- Update center_users (determine userType from userType column)
-- For center_users, we'll assign based on their userType field
UPDATE "center_users"
SET 
    "subscriptionPlanId" = CASE 
        WHEN "userType" = 'HEALTHCARE' THEN (
            SELECT "id" FROM "subscription_plans" 
            WHERE "name" = 'FREE' AND "userType" = 'HEALTHCARE' 
            LIMIT 1
        )
        WHEN "userType" = 'EMS' THEN (
            SELECT "id" FROM "subscription_plans" 
            WHERE "name" = 'FREE' AND "userType" = 'EMS' 
            LIMIT 1
        )
        ELSE NULL -- Unknown userType, leave NULL
    END,
    "subscriptionStatus" = CASE 
        WHEN "createdAt" > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 'TRIAL'
        ELSE 'EXPIRED'
    END,
    "trialStartDate" = "createdAt",
    "trialEndDate" = "createdAt" + INTERVAL '7 days'
WHERE "subscriptionPlanId" IS NULL 
  AND "userType" IN ('HEALTHCARE', 'EMS');

-- Verify updates
SELECT 
    'healthcare_users' as table_name,
    COUNT(*) as total_users,
    COUNT("subscriptionPlanId") as users_with_plan,
    COUNT(CASE WHEN "subscriptionStatus" = 'TRIAL' THEN 1 END) as trial_users,
    COUNT(CASE WHEN "subscriptionStatus" = 'EXPIRED' THEN 1 END) as expired_users
FROM "healthcare_users"
UNION ALL
SELECT 
    'ems_users' as table_name,
    COUNT(*) as total_users,
    COUNT("subscriptionPlanId") as users_with_plan,
    COUNT(CASE WHEN "subscriptionStatus" = 'TRIAL' THEN 1 END) as trial_users,
    COUNT(CASE WHEN "subscriptionStatus" = 'EXPIRED' THEN 1 END) as expired_users
FROM "ems_users"
UNION ALL
SELECT 
    'center_users' as table_name,
    COUNT(*) as total_users,
    COUNT("subscriptionPlanId") as users_with_plan,
    COUNT(CASE WHEN "subscriptionStatus" = 'TRIAL' THEN 1 END) as trial_users,
    COUNT(CASE WHEN "subscriptionStatus" = 'EXPIRED' THEN 1 END) as expired_users
FROM "center_users"
WHERE "userType" IN ('HEALTHCARE', 'EMS');

-- Show sample of updated records (separate queries for each table)
-- Healthcare users sample
SELECT 
    'healthcare_users' as table_name,
    "id",
    "email",
    "subscriptionPlanId",
    "subscriptionStatus",
    "trialStartDate",
    "trialEndDate"
FROM "healthcare_users"
LIMIT 5;

-- EMS users sample
SELECT 
    'ems_users' as table_name,
    "id",
    "email",
    "subscriptionPlanId",
    "subscriptionStatus",
    "trialStartDate",
    "trialEndDate"
FROM "ems_users"
LIMIT 5;
