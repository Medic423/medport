-- AlterTable
ALTER TABLE "ems_users" ADD COLUMN     "agencyId" TEXT;

-- Update existing EMS user to reference the correct agency
UPDATE "ems_users" 
SET "agencyId" = (SELECT id FROM "ems_agencies" WHERE name = 'Mountain Valley EMS' LIMIT 1)
WHERE email = 'fferguson@movalleyems.com';

-- AddForeignKey
ALTER TABLE "ems_users" ADD CONSTRAINT "ems_users_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "ems_agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
