/*
  Warnings:

  - You are about to drop the column `coordinates` on the `facilities` table. All the data in the column will be lost.
  - You are about to drop the `healthcare_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hospital_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transport_requests` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `region` to the `facilities` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "transport_requests" DROP CONSTRAINT "transport_requests_createdById_fkey";

-- DropForeignKey
ALTER TABLE "transport_requests" DROP CONSTRAINT "transport_requests_destinationFacilityId_fkey";

-- DropForeignKey
ALTER TABLE "transport_requests" DROP CONSTRAINT "transport_requests_healthcareCreatedById_fkey";

-- DropForeignKey
ALTER TABLE "transport_requests" DROP CONSTRAINT "transport_requests_originFacilityId_fkey";

-- AlterTable
ALTER TABLE "facilities" DROP COLUMN "coordinates",
ADD COLUMN     "region" TEXT NOT NULL;

-- DropTable
DROP TABLE "healthcare_users";

-- DropTable
DROP TABLE "hospital_users";

-- DropTable
DROP TABLE "transport_requests";

-- CreateTable
CREATE TABLE "center_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "center_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "type" TEXT NOT NULL,
    "capabilities" TEXT[],
    "region" TEXT NOT NULL,
    "coordinates" JSONB,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "operatingHours" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresReview" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "contactInfo" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems_agencies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "serviceArea" TEXT[],
    "operatingHours" JSONB,
    "capabilities" TEXT[],
    "pricingStructure" JSONB,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "serviceRadius" INTEGER,
    "totalUnits" INTEGER NOT NULL DEFAULT 0,
    "availableUnits" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptsNotifications" BOOLEAN NOT NULL DEFAULT true,
    "notificationMethods" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "requiresReview" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ems_agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "tripNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientWeight" TEXT,
    "specialNeeds" TEXT,
    "fromLocation" TEXT NOT NULL,
    "toLocation" TEXT NOT NULL,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "transportLevel" TEXT NOT NULL,
    "urgencyLevel" TEXT NOT NULL,
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
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "notes" TEXT,
    "assignedTo" TEXT,
    "assignedAgencyId" TEXT,
    "assignedUnitId" TEXT,
    "acceptedTimestamp" TIMESTAMP(3),
    "pickupTimestamp" TIMESTAMP(3),
    "completionTimestamp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_analytics" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "system_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "center_users_email_key" ON "center_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "trips_tripNumber_key" ON "trips"("tripNumber");
