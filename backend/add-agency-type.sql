-- Add missing agencyType column to ems_users table
ALTER TABLE ems_users ADD COLUMN IF NOT EXISTS "agencyType" TEXT DEFAULT 'AMBULANCE';
