-- Add Subscription Fields to User Tables
-- Run this script in pgAdmin 4 after creating subscription_plans table
-- This adds subscription-related fields to center_users, healthcare_users, and ems_users

-- Add subscription fields to center_users
ALTER TABLE "center_users" 
ADD COLUMN IF NOT EXISTS "subscriptionPlanId" TEXT,
ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT CHECK ("subscriptionStatus" IN ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED')) DEFAULT 'TRIAL',
ADD COLUMN IF NOT EXISTS "trialStartDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "trialEndDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "billingCycle" TEXT CHECK ("billingCycle" IN ('MONTHLY', 'ANNUAL'));

-- Add subscription fields to healthcare_users
ALTER TABLE "healthcare_users" 
ADD COLUMN IF NOT EXISTS "subscriptionPlanId" TEXT,
ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT CHECK ("subscriptionStatus" IN ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED')) DEFAULT 'TRIAL',
ADD COLUMN IF NOT EXISTS "trialStartDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "trialEndDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "billingCycle" TEXT CHECK ("billingCycle" IN ('MONTHLY', 'ANNUAL'));

-- Add subscription fields to ems_users
ALTER TABLE "ems_users" 
ADD COLUMN IF NOT EXISTS "subscriptionPlanId" TEXT,
ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT CHECK ("subscriptionStatus" IN ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED')) DEFAULT 'TRIAL',
ADD COLUMN IF NOT EXISTS "trialStartDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "trialEndDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "billingCycle" TEXT CHECK ("billingCycle" IN ('MONTHLY', 'ANNUAL'));

-- Create foreign key constraints (optional - can be added if referential integrity is desired)
-- Note: These will fail if subscription_plans table doesn't exist or if there are orphaned references
-- ALTER TABLE "center_users" 
-- ADD CONSTRAINT "center_users_subscriptionPlanId_fkey" 
-- FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plans"("id") ON DELETE SET NULL;

-- ALTER TABLE "healthcare_users" 
-- ADD CONSTRAINT "healthcare_users_subscriptionPlanId_fkey" 
-- FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plans"("id") ON DELETE SET NULL;

-- ALTER TABLE "ems_users" 
-- ADD CONSTRAINT "ems_users_subscriptionPlanId_fkey" 
-- FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plans"("id") ON DELETE SET NULL;

-- Create indexes for subscription fields
CREATE INDEX IF NOT EXISTS "center_users_subscriptionPlanId_idx" ON "center_users"("subscriptionPlanId");
CREATE INDEX IF NOT EXISTS "center_users_subscriptionStatus_idx" ON "center_users"("subscriptionStatus");
CREATE INDEX IF NOT EXISTS "center_users_trialEndDate_idx" ON "center_users"("trialEndDate");

CREATE INDEX IF NOT EXISTS "healthcare_users_subscriptionPlanId_idx" ON "healthcare_users"("subscriptionPlanId");
CREATE INDEX IF NOT EXISTS "healthcare_users_subscriptionStatus_idx" ON "healthcare_users"("subscriptionStatus");
CREATE INDEX IF NOT EXISTS "healthcare_users_trialEndDate_idx" ON "healthcare_users"("trialEndDate");

CREATE INDEX IF NOT EXISTS "ems_users_subscriptionPlanId_idx" ON "ems_users"("subscriptionPlanId");
CREATE INDEX IF NOT EXISTS "ems_users_subscriptionStatus_idx" ON "ems_users"("subscriptionStatus");
CREATE INDEX IF NOT EXISTS "ems_users_trialEndDate_idx" ON "ems_users"("trialEndDate");

-- Verify columns were added
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('center_users', 'healthcare_users', 'ems_users')
  AND column_name IN ('subscriptionPlanId', 'subscriptionStatus', 'trialStartDate', 'trialEndDate', 'subscriptionStartDate', 'subscriptionEndDate', 'billingCycle')
ORDER BY table_name, column_name;
