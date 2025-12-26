-- CreateTable: Create healthcare_agency_preferences table
CREATE TABLE IF NOT EXISTS "healthcare_agency_preferences" (
    "id" TEXT NOT NULL,
    "healthcareUserId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "healthcare_agency_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Add indexes for healthcare_agency_preferences
CREATE INDEX IF NOT EXISTS "healthcare_agency_preferences_healthcareUserId_idx" ON "healthcare_agency_preferences"("healthcareUserId");
CREATE INDEX IF NOT EXISTS "healthcare_agency_preferences_agencyId_idx" ON "healthcare_agency_preferences"("agencyId");

-- AddForeignKey: Link healthcare_agency_preferences to healthcare_users
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'healthcare_agency_preferences_healthcareUserId_fkey'
    ) THEN
        ALTER TABLE "healthcare_agency_preferences" ADD CONSTRAINT "healthcare_agency_preferences_healthcareUserId_fkey" 
            FOREIGN KEY ("healthcareUserId") REFERENCES "healthcare_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: Link healthcare_agency_preferences to ems_agencies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'healthcare_agency_preferences_agencyId_fkey'
    ) THEN
        ALTER TABLE "healthcare_agency_preferences" ADD CONSTRAINT "healthcare_agency_preferences_agencyId_fkey" 
            FOREIGN KEY ("agencyId") REFERENCES "ems_agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateIndex: Add unique constraint for healthcare_agency_preferences
CREATE UNIQUE INDEX IF NOT EXISTS "healthcare_agency_preferences_healthcareUserId_agencyId_key" 
    ON "healthcare_agency_preferences"("healthcareUserId", "agencyId");
