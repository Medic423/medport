-- Seed Subscription Plans Data
-- Run this script in pgAdmin 4 after creating the subscription_plans table
-- This seeds Healthcare and EMS plans with different pricing structures

-- Healthcare Plans
INSERT INTO "subscription_plans" (
    "id", 
    "name", 
    "displayName", 
    "description", 
    "userType", 
    "monthlyPrice", 
    "annualPrice", 
    "features", 
    "trialDays", 
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES
-- Healthcare FREE Plan
(
    'healthcare-free-plan',
    'FREE',
    'Free Trial',
    '7-day free trial to explore TRACC features',
    'HEALTHCARE',
    0.00,
    0.00,
    '["Create transport requests", "View available EMS providers", "Track transport status", "Basic analytics", "Email notifications"]'::jsonb,
    7,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Healthcare REGULAR Plan
(
    'healthcare-regular-plan',
    'REGULAR',
    'Regular Plan',
    'Full access to TRACC for small to medium healthcare facilities',
    'HEALTHCARE',
    99.00,
    990.00,
    '["All Free Trial features", "Unlimited transport requests", "Advanced analytics and reporting", "Priority support", "SMS notifications", "Multi-location management", "Custom integrations"]'::jsonb,
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- Healthcare PREMIUM Plan
(
    'healthcare-premium-plan',
    'PREMIUM',
    'Premium Plan',
    'Enterprise features for large healthcare systems',
    'HEALTHCARE',
    299.00,
    2990.00,
    '["All Regular Plan features", "Dedicated account manager", "Custom API access", "Advanced route optimization", "White-label options", "24/7 phone support", "Custom training sessions"]'::jsonb,
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- EMS FREE Plan
(
    'ems-free-plan',
    'FREE',
    'Free Trial',
    '7-day free trial to explore TRACC features',
    'EMS',
    0.00,
    0.00,
    '["Receive trip notifications", "View available trips", "Accept/decline requests", "Track completed transports", "Basic analytics"]'::jsonb,
    7,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- EMS REGULAR Plan
(
    'ems-regular-plan',
    'REGULAR',
    'Regular Plan',
    'Full access to TRACC for small to medium EMS agencies',
    'EMS',
    79.00,
    790.00,
    '["All Free Trial features", "Unlimited trip responses", "Advanced analytics and reporting", "Priority trip notifications", "SMS notifications", "Multi-unit management", "Route optimization"]'::jsonb,
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- EMS PREMIUM Plan
(
    'ems-premium-plan',
    'PREMIUM',
    'Premium Plan',
    'Enterprise features for large EMS operations',
    'EMS',
    199.00,
    1990.00,
    '["All Regular Plan features", "Dedicated account manager", "Custom API access", "Advanced route optimization", "Revenue analytics", "24/7 phone support", "Custom training sessions"]'::jsonb,
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("name", "userType") DO NOTHING;

-- Verify plans were inserted
SELECT 
    "id",
    "name",
    "displayName",
    "userType",
    "monthlyPrice",
    "annualPrice",
    "trialDays",
    "isActive"
FROM "subscription_plans"
ORDER BY "userType", "name";
