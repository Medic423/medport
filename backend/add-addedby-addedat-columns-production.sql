-- Migration: Add addedBy and addedAt columns to ems_agencies table
-- Purpose: Align production database schema with Dev-SWA and Prisma schema
-- Date: January 4, 2026
-- 
-- This migration adds the missing columns that Prisma schema expects.
-- Dev-SWA has these columns, which is why EMS registration works there.
-- Production is missing these columns, causing Prisma validation errors.

-- Add addedBy column (nullable TEXT)
ALTER TABLE "ems_agencies" 
ADD COLUMN IF NOT EXISTS "addedBy" TEXT;

-- Add addedAt column (TIMESTAMP with default)
ALTER TABLE "ems_agencies" 
ADD COLUMN IF NOT EXISTS "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows to have addedAt = createdAt if they don't have it
UPDATE "ems_agencies" 
SET "addedAt" = "createdAt" 
WHERE "addedAt" IS NULL;

-- Verify columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'ems_agencies' 
  AND column_name IN ('addedBy', 'addedAt')
ORDER BY column_name;

