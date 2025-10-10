/*
  Warnings:

  - You are about to drop the column `acceptsNotifications` on the `ems_agencies` table. All the data in the column will be lost.
  - You are about to drop the column `approvedAt` on the `ems_agencies` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `ems_agencies` table. All the data in the column will be lost.
  - You are about to drop the column `availableUnits` on the `ems_agencies` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `ems_agencies` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `ems_agencies` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `ems_agencies` table. All the data in the column will be lost.
  - You are about to drop the column `notificationMethods` on the `ems_agencies` table. All the data in the column will be lost.
  - You are about to drop the column `requiresReview` on the `ems_agencies` table. All the data in the column will be lost.
  - You are about to drop the column `serviceRadius` on the `ems_agencies` table. All the data in the column will be lost.
  - You are about to drop the column `totalUnits` on the `ems_agencies` table. All the data in the column will be lost.
  - You are about to drop the `agencies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `center_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `facilities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hospitals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trips` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "ems_agencies" DROP COLUMN "acceptsNotifications",
DROP COLUMN "approvedAt",
DROP COLUMN "approvedBy",
DROP COLUMN "availableUnits",
DROP COLUMN "lastUpdated",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "notificationMethods",
DROP COLUMN "requiresReview",
DROP COLUMN "serviceRadius",
DROP COLUMN "totalUnits",
ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "addedBy" TEXT;

-- DropTable
DROP TABLE "agencies";

-- DropTable
DROP TABLE "center_users";

-- DropTable
DROP TABLE "facilities";

-- DropTable
DROP TABLE "hospitals";

-- DropTable
DROP TABLE "system_analytics";

-- DropTable
DROP TABLE "trips";

-- CreateTable
CREATE TABLE "ems_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL,
    "agencyId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userType" TEXT NOT NULL DEFAULT 'EMS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ems_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "unitNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capabilities" TEXT[],
    "currentStatus" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "currentLocation" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedTripId" TEXT,
    "lastStatusUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusHistory" JSONB,
    "currentTripDetails" JSONB,
    "lastKnownLocation" JSONB,
    "locationUpdatedAt" TIMESTAMP(3),
    "totalTripsCompleted" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" DOUBLE PRECISION,
    "lastMaintenanceDate" TIMESTAMP(3),
    "maintenanceStatus" TEXT DEFAULT 'OPERATIONAL',
    "locationUpdateTimestamp" TIMESTAMP(3),
    "performanceScore" DECIMAL(5,2),
    "crewSize" INTEGER,
    "crewComposition" JSONB,
    "baseHourlyRate" DECIMAL(8,2),
    "overtimeMultiplier" DECIMAL(3,2),
    "shiftLengthHours" DECIMAL(4,2),
    "maxOvertimeHours" DECIMAL(4,2),
    "vehicleCostPerMile" DECIMAL(6,2),
    "fuelCostPerMile" DECIMAL(6,2),
    "maintenanceCostPerMile" DECIMAL(6,2),
    "homeBaseLocation" JSONB,
    "stagingLocations" JSONB,
    "maxServiceRadius" DECIMAL(6,2),
    "interceptCapability" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crew_roles" (
    "id" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "certificationLevel" TEXT NOT NULL,
    "hourlyRate" DECIMAL(8,2) NOT NULL,
    "overtimeMultiplier" DECIMAL(3,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crew_roles_pkey" PRIMARY KEY ("id")
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
    "readyStart" TIMESTAMP(3),
    "readyEnd" TIMESTAMP(3),
    "isolation" BOOLEAN NOT NULL DEFAULT false,
    "bariatric" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ems_users_email_key" ON "ems_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "transport_requests_tripNumber_key" ON "transport_requests"("tripNumber");

-- AddForeignKey
ALTER TABLE "ems_users" ADD CONSTRAINT "ems_users_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "ems_agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "ems_agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "ems_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
