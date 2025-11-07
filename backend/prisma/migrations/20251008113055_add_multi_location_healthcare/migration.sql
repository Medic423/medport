-- AlterTable: Add manageMultipleLocations field to healthcare_users
ALTER TABLE "healthcare_users" ADD COLUMN "manageMultipleLocations" BOOLEAN NOT NULL DEFAULT false;

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

-- AlterTable: Add multi-location fields to transport_requests
ALTER TABLE "transport_requests" ADD COLUMN "fromLocationId" TEXT;
ALTER TABLE "transport_requests" ADD COLUMN "isMultiLocationFacility" BOOLEAN NOT NULL DEFAULT false;

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


