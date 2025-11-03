-- Phase 2: Sub-User fields for HealthcareUser and EMSUser

-- HealthcareUser: add isSubUser, parentUserId, mustChangePassword
ALTER TABLE "healthcare_users"
  ADD COLUMN IF NOT EXISTS "isSubUser" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "parentUserId" TEXT NULL,
  ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- Add FK for parentUserId self-reference
DO $$ BEGIN
  ALTER TABLE "healthcare_users"
    ADD CONSTRAINT "healthcare_users_parent_fk" FOREIGN KEY ("parentUserId")
    REFERENCES "healthcare_users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- EMSUser: add isSubUser, parentUserId, mustChangePassword
ALTER TABLE "ems_users"
  ADD COLUMN IF NOT EXISTS "isSubUser" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "parentUserId" TEXT NULL,
  ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- Add FK for parentUserId self-reference
DO $$ BEGIN
  ALTER TABLE "ems_users"
    ADD CONSTRAINT "ems_users_parent_fk" FOREIGN KEY ("parentUserId")
    REFERENCES "ems_users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


