-- Create Subscription Plans Table
-- Run this script in pgAdmin 4
-- This creates the subscription_plans table with support for different user types

CREATE TABLE IF NOT EXISTS "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userType" TEXT NOT NULL CHECK ("userType" IN ('HEALTHCARE', 'EMS', 'ALL')),
    "monthlyPrice" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "annualPrice" DECIMAL(10, 2),
    "features" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on (name, userType) to ensure unique plan names per user type
CREATE UNIQUE INDEX IF NOT EXISTS "subscription_plans_name_userType_key" 
    ON "subscription_plans"("name", "userType");

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS "subscription_plans_userType_idx" 
    ON "subscription_plans"("userType");

CREATE INDEX IF NOT EXISTS "subscription_plans_isActive_idx" 
    ON "subscription_plans"("isActive");

-- Verify table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'subscription_plans'
ORDER BY ordinal_position;
