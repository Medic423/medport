-- Fix EMS users table to match Prisma schema

-- Add missing agencyId column
ALTER TABLE ems_users ADD COLUMN IF NOT EXISTS "agencyId" TEXT;

-- Add foreign key constraint if agencies table exists
-- ALTER TABLE ems_users ADD CONSTRAINT fk_ems_users_agency FOREIGN KEY ("agencyId") REFERENCES agencies(id);
