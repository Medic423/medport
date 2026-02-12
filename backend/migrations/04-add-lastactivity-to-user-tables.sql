-- Migration: Add lastActivity field to user tables
-- Date: January 20, 2026
-- Purpose: Track user activity for "Current Activity" feature
-- Phase: Current Activity Implementation

-- Add lastActivity field to healthcare_users table
ALTER TABLE healthcare_users 
ADD COLUMN IF NOT EXISTS "lastActivity" TIMESTAMP(3);

-- Add lastActivity field to ems_users table
ALTER TABLE ems_users 
ADD COLUMN IF NOT EXISTS "lastActivity" TIMESTAMP(3);

-- Add lastActivity field to center_users table
ALTER TABLE center_users 
ADD COLUMN IF NOT EXISTS "lastActivity" TIMESTAMP(3);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "healthcare_users_lastActivity_idx" ON healthcare_users("lastActivity");
CREATE INDEX IF NOT EXISTS "ems_users_lastActivity_idx" ON ems_users("lastActivity");
CREATE INDEX IF NOT EXISTS "center_users_lastActivity_idx" ON center_users("lastActivity");

-- Initialize lastActivity with lastLogin for existing users (if lastLogin exists)
UPDATE healthcare_users 
SET "lastActivity" = "lastLogin" 
WHERE "lastActivity" IS NULL AND "lastLogin" IS NOT NULL;

UPDATE ems_users 
SET "lastActivity" = "lastLogin" 
WHERE "lastActivity" IS NULL AND "lastLogin" IS NOT NULL;

UPDATE center_users 
SET "lastActivity" = "lastLogin" 
WHERE "lastActivity" IS NULL AND "lastLogin" IS NOT NULL;

-- Verify columns were added
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('healthcare_users', 'ems_users', 'center_users')
AND column_name = 'lastActivity'
ORDER BY table_name;

-- Rollback SQL (if needed):
-- ALTER TABLE healthcare_users DROP COLUMN IF EXISTS "lastActivity";
-- ALTER TABLE ems_users DROP COLUMN IF EXISTS "lastActivity";
-- ALTER TABLE center_users DROP COLUMN IF EXISTS "lastActivity";
-- DROP INDEX IF EXISTS "healthcare_users_lastActivity_idx";
-- DROP INDEX IF EXISTS "ems_users_lastActivity_idx";
-- DROP INDEX IF EXISTS "center_users_lastActivity_idx";
