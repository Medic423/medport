/*
  Warnings:

  - You are about to drop the column `region` on the `facilities` table. All the data in the column will be lost.
  - You are about to drop the `agencies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `center_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ems_agencies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hospitals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trips` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "facilities" DROP COLUMN "region",
ADD COLUMN     "coordinates" JSONB;

-- DropTable
DROP TABLE "agencies";

-- DropTable
DROP TABLE "center_users";

-- DropTable
DROP TABLE "ems_agencies";

-- DropTable
DROP TABLE "hospitals";

-- DropTable
DROP TABLE "system_analytics";

-- DropTable
DROP TABLE "trips";

-- CreateTable
CREATE TABLE "hospital_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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
    "healthcareCreatedById" TEXT,
    "readyStart" TIMESTAMP(3),
    "readyEnd" TIMESTAMP(3),
    "isolation" BOOLEAN NOT NULL DEFAULT false,
    "bariatric" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dropdown_options" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dropdown_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hospital_users_email_key" ON "hospital_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "healthcare_users_email_key" ON "healthcare_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "transport_requests_tripNumber_key" ON "transport_requests"("tripNumber");

-- CreateIndex
CREATE UNIQUE INDEX "dropdown_options_category_value_key" ON "dropdown_options"("category", "value");

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_originFacilityId_fkey" FOREIGN KEY ("originFacilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_destinationFacilityId_fkey" FOREIGN KEY ("destinationFacilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "hospital_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_healthcareCreatedById_fkey" FOREIGN KEY ("healthcareCreatedById") REFERENCES "healthcare_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
