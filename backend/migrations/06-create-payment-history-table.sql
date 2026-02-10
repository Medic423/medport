-- Migration: Create payment_history table for audit trail
-- Purpose: Track all payment transactions for HIPAA compliance and audit purposes
-- Execute in pgAdmin 4

CREATE TABLE IF NOT EXISTS "payment_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL CHECK ("userType" IN ('HEALTHCARE', 'EMS', 'ADMIN', 'USER')),
    "amount" DECIMAL(10, 2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL CHECK ("status" IN ('succeeded', 'failed', 'pending', 'refunded')),
    "stripePaymentIntentId" TEXT,
    "stripeInvoiceId" TEXT,
    "stripeSubscriptionId" TEXT,
    "billingCycle" TEXT CHECK ("billingCycle" IN ('MONTHLY', 'ANNUAL')),
    "planName" TEXT,
    "planId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "payment_history_pkey" PRIMARY KEY ("id")
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS "payment_history_userId_idx" ON "payment_history"("userId");
CREATE INDEX IF NOT EXISTS "payment_history_userType_idx" ON "payment_history"("userType");
CREATE INDEX IF NOT EXISTS "payment_history_status_idx" ON "payment_history"("status");
CREATE INDEX IF NOT EXISTS "payment_history_createdAt_idx" ON "payment_history"("createdAt");
CREATE INDEX IF NOT EXISTS "payment_history_stripePaymentIntentId_idx" ON "payment_history"("stripePaymentIntentId");
CREATE INDEX IF NOT EXISTS "payment_history_stripeInvoiceId_idx" ON "payment_history"("stripeInvoiceId");
CREATE INDEX IF NOT EXISTS "payment_history_stripeSubscriptionId_idx" ON "payment_history"("stripeSubscriptionId");

-- Note: This table does NOT store PHI (Protected Health Information) per HIPAA compliance
-- Only payment transaction data is stored

-- Verification query
SELECT 
    COUNT(*) as total_payments,
    COUNT(DISTINCT "userId") as unique_users,
    SUM(CASE WHEN "status" = 'succeeded' THEN "amount" ELSE 0 END) as total_revenue
FROM "payment_history";
