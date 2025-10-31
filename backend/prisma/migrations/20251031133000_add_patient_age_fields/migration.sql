-- Add patient age fields to transport_requests and trips
ALTER TABLE "transport_requests"
  ADD COLUMN IF NOT EXISTS "patientAgeYears" INTEGER,
  ADD COLUMN IF NOT EXISTS "patientAgeCategory" TEXT;

ALTER TABLE "trips"
  ADD COLUMN IF NOT EXISTS "patientAgeYears" INTEGER,
  ADD COLUMN IF NOT EXISTS "patientAgeCategory" TEXT;


