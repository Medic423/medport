-- Migration: Add lastLogin field to user tables
-- Date: January 20, 2026
-- Purpose: Enable accurate idle account detection based on actual login activity
-- Phase: Phase 2 - Login Tracking

-- Add lastLogin field to healthcare_users table
ALTER TABLE healthcare_users 
ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP(3);

-- Add lastLogin field to ems_users table
ALTER TABLE ems_users 
ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP(3);

-- Add lastLogin field to center_users table
ALTER TABLE center_users 
ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP(3);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "healthcare_users_lastLogin_idx" ON healthcare_users("lastLogin");
CREATE INDEX IF NOT EXISTS "ems_users_lastLogin_idx" ON ems_users("lastLogin");
CREATE INDEX IF NOT EXISTS "center_users_lastLogin_idx" ON center_users("lastLogin");

-- Verify columns were added
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('healthcare_users', 'ems_users', 'center_users')
AND column_name = 'lastLogin'
ORDER BY table_name;

-- Rollback SQL (if needed):
-- ALTER TABLE healthcare_users DROP COLUMN IF EXISTS "lastLogin";
-- ALTER TABLE ems_users DROP COLUMN IF EXISTS "lastLogin";
-- ALTER TABLE center_users DROP COLUMN IF EXISTS "lastLogin";
-- DROP INDEX IF EXISTS "healthcare_users_lastLogin_idx";
-- DROP INDEX IF EXISTS "ems_users_lastLogin_idx";
-- DROP INDEX IF EXISTS "center_users_lastLogin_idx";
