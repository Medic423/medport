/*
  Warnings:

  - You are about to drop the column `contact_name` on the `healthcare_destinations` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `healthcare_destinations` table. All the data in the column will be lost.
  - You are about to drop the column `healthcare_user_id` on the `healthcare_destinations` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `healthcare_destinations` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `healthcare_destinations` table. All the data in the column will be lost.
  - You are about to drop the column `zip_code` on the `healthcare_destinations` table. All the data in the column will be lost.
  - You are about to drop the column `emsArrivalTime` on the `transport_requests` table. All the data in the column will be lost.
  - You are about to drop the column `emsDepartureTime` on the `transport_requests` table. All the data in the column will be lost.
  - You are about to drop the column `readyEnd` on the `transport_requests` table. All the data in the column will be lost.
  - You are about to drop the column `readyStart` on the `transport_requests` table. All the data in the column will be lost.
  - You are about to drop the column `transferAcceptedTime` on the `transport_requests` table. All the data in the column will be lost.
  - You are about to drop the column `transferRequestTime` on the `transport_requests` table. All the data in the column will be lost.
  - You are about to drop the `agencies` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `healthcareUserId` to the `healthcare_destinations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `healthcare_destinations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `healthcare_destinations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "healthcare_destinations" DROP CONSTRAINT "healthcare_destinations_healthcare_user_id_fkey";

-- DropIndex
DROP INDEX "healthcare_destinations_healthcare_user_id_idx";

-- DropIndex
DROP INDEX "healthcare_destinations_is_active_idx";

-- DropIndex
DROP INDEX "route_optimization_settings_agencyId_idx";

-- DropIndex
DROP INDEX "route_optimization_settings_isActive_idx";

-- AlterTable
ALTER TABLE "center_users" ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastActivity" TIMESTAMP(3),
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "smsNotifications" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ems_agencies" ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "addedBy" TEXT;

-- AlterTable
ALTER TABLE "facilities" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "coordinates" JSONB,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "operatingHours" TEXT,
ADD COLUMN     "requiresReview" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "healthcare_destinations" DROP COLUMN "contact_name",
DROP COLUMN "created_at",
DROP COLUMN "healthcare_user_id",
DROP COLUMN "is_active",
DROP COLUMN "updated_at",
DROP COLUMN "zip_code",
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "healthcareUserId" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "healthcare_locations" ALTER COLUMN "locationName" SET DATA TYPE TEXT,
ALTER COLUMN "address" SET DATA TYPE TEXT,
ALTER COLUMN "city" SET DATA TYPE TEXT,
ALTER COLUMN "state" SET DATA TYPE TEXT,
ALTER COLUMN "zipCode" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "facilityType" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "healthcare_users" ADD COLUMN     "isSubUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastActivity" TIMESTAMP(3),
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orgAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentUserId" TEXT;

-- AlterTable
ALTER TABLE "system_analytics" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "transport_requests" DROP COLUMN "emsArrivalTime",
DROP COLUMN "emsDepartureTime",
DROP COLUMN "readyEnd",
DROP COLUMN "readyStart",
DROP COLUMN "transferAcceptedTime",
DROP COLUMN "transferRequestTime",
ADD COLUMN     "arrivalTimestamp" TIMESTAMP(3),
ADD COLUMN     "departureTimestamp" TIMESTAMP(3),
ADD COLUMN     "healthcareCreatedById" TEXT,
ADD COLUMN     "pickupLocationId" TEXT;

-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "actualTripTimeMinutes" INTEGER,
ADD COLUMN     "backhaulOpportunity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completionTimeMinutes" INTEGER,
ADD COLUMN     "customerSatisfaction" INTEGER,
ADD COLUMN     "deadheadMiles" DOUBLE PRECISION,
ADD COLUMN     "destinationLatitude" DOUBLE PRECISION,
ADD COLUMN     "destinationLongitude" DOUBLE PRECISION,
ADD COLUMN     "distanceMiles" DOUBLE PRECISION,
ADD COLUMN     "efficiency" DECIMAL(5,2),
ADD COLUMN     "estimatedTripTimeMinutes" INTEGER,
ADD COLUMN     "insuranceCompany" TEXT,
ADD COLUMN     "insurancePayRate" DECIMAL(10,2),
ADD COLUMN     "loadedMiles" DECIMAL(10,2),
ADD COLUMN     "maxResponses" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "originLatitude" DOUBLE PRECISION,
ADD COLUMN     "originLongitude" DOUBLE PRECISION,
ADD COLUMN     "perMileRate" DECIMAL(8,2),
ADD COLUMN     "performanceScore" DECIMAL(5,2),
ADD COLUMN     "pickupLocationId" TEXT,
ADD COLUMN     "requestTimestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "responseDeadline" TIMESTAMP(3),
ADD COLUMN     "responseStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "responseTimeMinutes" INTEGER,
ADD COLUMN     "revenuePerHour" DECIMAL(10,2),
ADD COLUMN     "selectionMode" TEXT NOT NULL DEFAULT 'SPECIFIC_AGENCIES',
ADD COLUMN     "tripCost" DECIMAL(10,2);

-- DropTable
DROP TABLE "agencies";

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
    "isSubUser" BOOLEAN NOT NULL DEFAULT false,
    "parentUserId" TEXT,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "orgAdmin" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "lastActivity" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ems_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency_responses" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "responseTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseNotes" TEXT,
    "estimatedArrival" TIMESTAMP(3),
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "assignedUnitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agency_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backhaul_opportunities" (
    "id" TEXT NOT NULL,
    "tripId1" TEXT NOT NULL,
    "tripId2" TEXT NOT NULL,
    "revenueBonus" DECIMAL(10,2),
    "efficiency" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "backhaul_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_locations" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "floor" TEXT,
    "room" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_models" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "baseRates" JSONB NOT NULL,
    "perMileRates" JSONB NOT NULL,
    "priorityMultipliers" JSONB NOT NULL,
    "peakHourMultipliers" JSONB NOT NULL,
    "weekendMultipliers" JSONB NOT NULL,
    "seasonalMultipliers" JSONB NOT NULL,
    "zoneMultipliers" JSONB NOT NULL,
    "distanceTiers" JSONB NOT NULL,
    "specialRequirements" JSONB NOT NULL,
    "isolationPricing" DECIMAL(8,2),
    "bariatricPricing" DECIMAL(8,2),
    "oxygenPricing" DECIMAL(8,2),
    "monitoringPricing" DECIMAL(8,2),
    "insuranceRates" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "currentStatus" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "currentLocation" TEXT,
    "capabilities" TEXT[],
    "crewSize" INTEGER NOT NULL DEFAULT 2,
    "equipment" TEXT[],
    "location" JSONB,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "lastMaintenance" TIMESTAMP(3),
    "nextMaintenance" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastStatusUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_analytics" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "performanceScore" DECIMAL(5,2),
    "efficiency" DECIMAL(5,2),
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "totalTripsCompleted" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" DECIMAL(5,2),
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "errorMessage" TEXT,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dropdown_options" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "categoryId" TEXT,
    "value" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dropdown_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dropdown_category_defaults" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dropdown_category_defaults_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ems_users_email_key" ON "ems_users"("email");

-- CreateIndex
CREATE INDEX "ems_users_isDeleted_idx" ON "ems_users"("isDeleted");

-- CreateIndex
CREATE INDEX "ems_users_lastLogin_idx" ON "ems_users"("lastLogin");

-- CreateIndex
CREATE INDEX "ems_users_lastActivity_idx" ON "ems_users"("lastActivity");

-- CreateIndex
CREATE UNIQUE INDEX "units_agencyId_unitNumber_key" ON "units"("agencyId", "unitNumber");

-- CreateIndex
CREATE UNIQUE INDEX "unit_analytics_unitId_key" ON "unit_analytics"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_notificationType_key" ON "notification_preferences"("userId", "notificationType");

-- CreateIndex
CREATE UNIQUE INDEX "dropdown_options_category_value_key" ON "dropdown_options"("category", "value");

-- CreateIndex
CREATE UNIQUE INDEX "dropdown_category_defaults_category_key" ON "dropdown_category_defaults"("category");

-- CreateIndex
CREATE UNIQUE INDEX "dropdown_category_defaults_optionId_key" ON "dropdown_category_defaults"("optionId");

-- CreateIndex
CREATE INDEX "center_users_lastLogin_idx" ON "center_users"("lastLogin");

-- CreateIndex
CREATE INDEX "center_users_lastActivity_idx" ON "center_users"("lastActivity");

-- CreateIndex
CREATE INDEX "healthcare_destinations_healthcareUserId_idx" ON "healthcare_destinations"("healthcareUserId");

-- CreateIndex
CREATE INDEX "healthcare_destinations_isActive_idx" ON "healthcare_destinations"("isActive");

-- CreateIndex
CREATE INDEX "healthcare_users_lastLogin_idx" ON "healthcare_users"("lastLogin");

-- CreateIndex
CREATE INDEX "healthcare_users_lastActivity_idx" ON "healthcare_users"("lastActivity");

-- AddForeignKey
ALTER TABLE "healthcare_users" ADD CONSTRAINT "healthcare_users_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "healthcare_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "healthcare_destinations" ADD CONSTRAINT "healthcare_destinations_healthcareUserId_fkey" FOREIGN KEY ("healthcareUserId") REFERENCES "healthcare_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems_users" ADD CONSTRAINT "ems_users_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "ems_agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems_users" ADD CONSTRAINT "ems_users_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "ems_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "pickup_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_responses" ADD CONSTRAINT "agency_responses_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "transport_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_responses" ADD CONSTRAINT "agency_responses_assignedUnitId_fkey" FOREIGN KEY ("assignedUnitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "ems_agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_analytics" ADD CONSTRAINT "unit_analytics_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "center_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "center_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dropdown_options" ADD CONSTRAINT "dropdown_options_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "dropdown_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dropdown_category_defaults" ADD CONSTRAINT "dropdown_category_defaults_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "dropdown_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_assignedUnitId_fkey" FOREIGN KEY ("assignedUnitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_destinationFacilityId_fkey" FOREIGN KEY ("destinationFacilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_originFacilityId_fkey" FOREIGN KEY ("originFacilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "pickup_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
