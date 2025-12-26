-- CreateTable: Create healthcare_users table if it doesn't exist (it was dropped in migration 20250910191806)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'healthcare_users') THEN
        CREATE TABLE "healthcare_users" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "password" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "facilityName" TEXT NOT NULL,
            "facilityType" TEXT NOT NULL,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "userType" TEXT NOT NULL DEFAULT 'HEALTHCARE',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "healthcare_users_pkey" PRIMARY KEY ("id")
        );
        
        CREATE UNIQUE INDEX "healthcare_users_email_key" ON "healthcare_users"("email");
    END IF;
END $$;

-- AlterTable: Add manageMultipleLocations field to healthcare_users
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'healthcare_users' AND column_name = 'manageMultipleLocations') THEN
        ALTER TABLE "healthcare_users" ADD COLUMN "manageMultipleLocations" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- CreateTable: Create healthcare_locations table
CREATE TABLE "healthcare_locations" (
    "id" TEXT NOT NULL,
    "healthcareUserId" TEXT NOT NULL,
    "locationName" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "zipCode" VARCHAR(10) NOT NULL,
    "phone" VARCHAR(20),
    "facilityType" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "healthcare_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Create transport_requests table if it doesn't exist (it may have been dropped in a previous migration)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transport_requests') THEN
        CREATE TABLE "transport_requests" (
            "id" TEXT NOT NULL,
            "tripNumber" TEXT,
            "patientId" TEXT NOT NULL,
            "patientWeight" TEXT,
            "specialNeeds" TEXT,
            "originFacilityId" TEXT,
            "destinationFacilityId" TEXT,
            "fromLocation" TEXT,
            "toLocation" TEXT,
            "scheduledTime" TIMESTAMP(3),
            "transportLevel" TEXT NOT NULL,
            "urgencyLevel" TEXT,
            "priority" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'PENDING',
            "specialRequirements" TEXT,
            "diagnosis" TEXT,
            "mobilityLevel" TEXT,
            "oxygenRequired" BOOLEAN NOT NULL DEFAULT false,
            "monitoringRequired" BOOLEAN NOT NULL DEFAULT false,
            "generateQRCode" BOOLEAN NOT NULL DEFAULT false,
            "qrCodeData" TEXT,
            "selectedAgencies" TEXT[],
            "notificationRadius" INTEGER,
            "transferRequestTime" TIMESTAMP(3),
            "transferAcceptedTime" TIMESTAMP(3),
            "emsArrivalTime" TIMESTAMP(3),
            "emsDepartureTime" TIMESTAMP(3),
            "requestTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "acceptedTimestamp" TIMESTAMP(3),
            "pickupTimestamp" TIMESTAMP(3),
            "completionTimestamp" TIMESTAMP(3),
            "assignedAgencyId" TEXT,
            "assignedUnitId" TEXT,
            "createdById" TEXT,
            "readyStart" TIMESTAMP(3),
            "readyEnd" TIMESTAMP(3),
            "isolation" BOOLEAN NOT NULL DEFAULT false,
            "bariatric" BOOLEAN NOT NULL DEFAULT false,
            "notes" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "transport_requests_pkey" PRIMARY KEY ("id")
        );
        
        CREATE UNIQUE INDEX IF NOT EXISTS "transport_requests_tripNumber_key" ON "transport_requests"("tripNumber");
    END IF;
END $$;

-- AlterTable: Add multi-location fields to transport_requests
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transport_requests' AND column_name = 'fromLocationId') THEN
        ALTER TABLE "transport_requests" ADD COLUMN "fromLocationId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transport_requests' AND column_name = 'isMultiLocationFacility') THEN
        ALTER TABLE "transport_requests" ADD COLUMN "isMultiLocationFacility" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- CreateIndex: Add indexes for healthcare_locations
CREATE INDEX "healthcare_locations_healthcareUserId_idx" ON "healthcare_locations"("healthcareUserId");
CREATE INDEX "healthcare_locations_isActive_idx" ON "healthcare_locations"("isActive");

-- CreateIndex: Add indexes for transport_requests
CREATE INDEX "transport_requests_fromLocationId_idx" ON "transport_requests"("fromLocationId");
CREATE INDEX "transport_requests_isMultiLocationFacility_idx" ON "transport_requests"("isMultiLocationFacility");

-- AddForeignKey: Link healthcare_locations to healthcare_users
ALTER TABLE "healthcare_locations" ADD CONSTRAINT "healthcare_locations_healthcareUserId_fkey" 
    FOREIGN KEY ("healthcareUserId") REFERENCES "healthcare_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Link transport_requests to healthcare_locations
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_fromLocationId_fkey" 
    FOREIGN KEY ("fromLocationId") REFERENCES "healthcare_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;


