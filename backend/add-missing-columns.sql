-- Add missing columns to match Prisma schema

-- Add manageMultipleLocations to healthcare_users
ALTER TABLE healthcare_users ADD COLUMN IF NOT EXISTS "manageMultipleLocations" BOOLEAN DEFAULT false;
