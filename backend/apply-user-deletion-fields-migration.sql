-- Apply User Deletion Fields Migration
-- This migration adds deletedAt and isDeleted columns to user tables
-- Run this in Azure database via pgAdmin

-- Add columns to center_users
ALTER TABLE "center_users" 
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- Add columns to healthcare_users
ALTER TABLE "healthcare_users" 
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- Add columns to ems_users
ALTER TABLE "ems_users" 
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- Create indexes
CREATE INDEX IF NOT EXISTS "center_users_isDeleted_idx" ON "center_users"("isDeleted");
CREATE INDEX IF NOT EXISTS "healthcare_users_isDeleted_idx" ON "healthcare_users"("isDeleted");
CREATE INDEX IF NOT EXISTS "ems_users_isDeleted_idx" ON "ems_users"("isDeleted");

-- Verify columns were added
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('center_users', 'healthcare_users', 'ems_users')
  AND column_name IN ('deletedAt', 'isDeleted')
ORDER BY table_name, column_name;

