-- Migration: Add Stripe payment fields to user tables
-- Purpose: Support payment processing and subscription management
-- Execute in pgAdmin 4

-- Add payment fields to center_users
ALTER TABLE "center_users"
ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT,
ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
ADD COLUMN IF NOT EXISTS "paymentMethodId" TEXT,
ADD COLUMN IF NOT EXISTS "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "gracePeriodEndDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT CHECK ("paymentStatus" IN ('active', 'past_due', 'cancelled', 'unpaid'));

-- Update subscriptionStatus to include PAST_DUE
ALTER TABLE "center_users"
DROP CONSTRAINT IF EXISTS "center_users_subscriptionStatus_check";

ALTER TABLE "center_users"
ADD CONSTRAINT "center_users_subscriptionStatus_check" 
CHECK ("subscriptionStatus" IN ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PAST_DUE'));

-- Create indexes for payment fields
CREATE INDEX IF NOT EXISTS "center_users_stripeCustomerId_idx" ON "center_users"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "center_users_stripeSubscriptionId_idx" ON "center_users"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "center_users_gracePeriodEndDate_idx" ON "center_users"("gracePeriodEndDate");

-- Add payment fields to healthcare_users
ALTER TABLE "healthcare_users"
ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT,
ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
ADD COLUMN IF NOT EXISTS "paymentMethodId" TEXT,
ADD COLUMN IF NOT EXISTS "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "gracePeriodEndDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT CHECK ("paymentStatus" IN ('active', 'past_due', 'cancelled', 'unpaid'));

-- Update subscriptionStatus to include PAST_DUE
ALTER TABLE "healthcare_users"
DROP CONSTRAINT IF EXISTS "healthcare_users_subscriptionStatus_check";

ALTER TABLE "healthcare_users"
ADD CONSTRAINT "healthcare_users_subscriptionStatus_check" 
CHECK ("subscriptionStatus" IN ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PAST_DUE'));

-- Create indexes for payment fields
CREATE INDEX IF NOT EXISTS "healthcare_users_stripeCustomerId_idx" ON "healthcare_users"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "healthcare_users_stripeSubscriptionId_idx" ON "healthcare_users"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "healthcare_users_gracePeriodEndDate_idx" ON "healthcare_users"("gracePeriodEndDate");

-- Add payment fields to ems_users
ALTER TABLE "ems_users"
ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT,
ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
ADD COLUMN IF NOT EXISTS "paymentMethodId" TEXT,
ADD COLUMN IF NOT EXISTS "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "gracePeriodEndDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT CHECK ("paymentStatus" IN ('active', 'past_due', 'cancelled', 'unpaid'));

-- Update subscriptionStatus to include PAST_DUE
ALTER TABLE "ems_users"
DROP CONSTRAINT IF EXISTS "ems_users_subscriptionStatus_check";

ALTER TABLE "ems_users"
ADD CONSTRAINT "ems_users_subscriptionStatus_check" 
CHECK ("subscriptionStatus" IN ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PAST_DUE'));

-- Create indexes for payment fields
CREATE INDEX IF NOT EXISTS "ems_users_stripeCustomerId_idx" ON "ems_users"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "ems_users_stripeSubscriptionId_idx" ON "ems_users"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "ems_users_gracePeriodEndDate_idx" ON "ems_users"("gracePeriodEndDate");

-- Verification queries
SELECT 
    'center_users' as table_name,
    COUNT(*) as total_users,
    COUNT("stripeCustomerId") as users_with_stripe_customer,
    COUNT("stripeSubscriptionId") as users_with_subscription
FROM "center_users"
UNION ALL
SELECT 
    'healthcare_users' as table_name,
    COUNT(*) as total_users,
    COUNT("stripeCustomerId") as users_with_stripe_customer,
    COUNT("stripeSubscriptionId") as users_with_subscription
FROM "healthcare_users"
UNION ALL
SELECT 
    'ems_users' as table_name,
    COUNT(*) as total_users,
    COUNT("stripeCustomerId") as users_with_stripe_customer,
    COUNT("stripeSubscriptionId") as users_with_subscription
FROM "ems_users";
