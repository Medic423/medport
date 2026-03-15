/*
  Warnings:

  - You are about to drop the column `type` on the `facilities` table. All the data in the column will be lost.
  - You are about to drop the column `hospitalId` on the `pickup_locations` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `transport_requests` table. All the data in the column will be lost.
  - You are about to drop the column `healthcareCreatedById` on the `transport_requests` table. All the data in the column will be lost.
  - You are about to drop the `center_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ems_agencies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ems_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `healthcare_agency_preferences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `healthcare_destinations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `healthcare_locations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `healthcare_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hospitals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification_preferences` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `facilityType` to the `facilities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `facilities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facilityId` to the `pickup_locations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('SYSTEM_ADMIN', 'ORGANIZATION_USER', 'FACILITY_USER');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('HEALTHCARE', 'EMS');

-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('HOSPITAL', 'CLINIC', 'NURSING_HOME', 'REHAB_FACILITY', 'URGENT_CARE', 'OTHER');

-- CreateEnum
CREATE TYPE "OrganizationPreferenceType" AS ENUM ('PREFERRED_EMS_AGENCY');

-- CreateEnum
CREATE TYPE "UserPreferenceType" AS ENUM ('NOTIFICATION_EMAIL', 'NOTIFICATION_SMS', 'NOTIFICATION_PUSH');

-- DropForeignKey
ALTER TABLE "ems_users" DROP CONSTRAINT "ems_users_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "ems_users" DROP CONSTRAINT "ems_users_parentUserId_fkey";

-- DropForeignKey
ALTER TABLE "healthcare_agency_preferences" DROP CONSTRAINT "healthcare_agency_preferences_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "healthcare_agency_preferences" DROP CONSTRAINT "healthcare_agency_preferences_healthcareUserId_fkey";

-- DropForeignKey
ALTER TABLE "healthcare_destinations" DROP CONSTRAINT "healthcare_destinations_healthcareUserId_fkey";

-- DropForeignKey
ALTER TABLE "healthcare_locations" DROP CONSTRAINT "healthcare_locations_healthcareUserId_fkey";

-- DropForeignKey
ALTER TABLE "healthcare_locations" DROP CONSTRAINT "healthcare_locations_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "healthcare_users" DROP CONSTRAINT "healthcare_users_parentUserId_fkey";

-- DropForeignKey
ALTER TABLE "notification_logs" DROP CONSTRAINT "notification_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "notification_preferences" DROP CONSTRAINT "notification_preferences_userId_fkey";

-- DropForeignKey
ALTER TABLE "pickup_locations" DROP CONSTRAINT "pickup_locations_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "transport_requests" DROP CONSTRAINT "transport_requests_fromLocationId_fkey";

-- DropForeignKey
ALTER TABLE "units" DROP CONSTRAINT "units_agencyId_fkey";

-- AlterTable
ALTER TABLE "facilities" DROP COLUMN "type",
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "facilityType" "FacilityType" NOT NULL,
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ALTER COLUMN "region" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pickup_locations" DROP COLUMN "hospitalId",
ADD COLUMN     "facilityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "transport_requests" DROP COLUMN "createdById",
DROP COLUMN "healthcareCreatedById",
ADD COLUMN     "createdByUserId" TEXT;

-- DropTable
DROP TABLE "center_users";

-- DropTable
DROP TABLE "ems_agencies";

-- DropTable
DROP TABLE "ems_users";

-- DropTable
DROP TABLE "healthcare_agency_preferences";

-- DropTable
DROP TABLE "healthcare_destinations";

-- DropTable
DROP TABLE "healthcare_locations";

-- DropTable
DROP TABLE "healthcare_users";

-- DropTable
DROP TABLE "hospitals";

-- DropTable
DROP TABLE "notification_preferences";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "organizationId" TEXT,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "lastActivity" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferenceType" "UserPreferenceType" NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationType" "OrganizationType" NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "serviceArea" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "operatingHours" JSONB,
    "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pricingStructure" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "addedBy" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptsNotifications" BOOLEAN NOT NULL DEFAULT true,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "availableUnits" INTEGER NOT NULL DEFAULT 0,
    "totalUnits" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "coordinates" JSONB,
    "notificationMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiresReview" BOOLEAN NOT NULL DEFAULT false,
    "serviceRadius" INTEGER,
    "availabilityStatus" JSONB DEFAULT '{"isAvailable":false,"availableLevels":[]}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_preferences" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "preferenceType" "OrganizationPreferenceType" NOT NULL,
    "targetOrganizationId" TEXT,
    "value" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "users_isDeleted_idx" ON "users"("isDeleted");

-- CreateIndex
CREATE INDEX "users_lastLogin_idx" ON "users"("lastLogin");

-- CreateIndex
CREATE INDEX "users_lastActivity_idx" ON "users"("lastActivity");

-- CreateIndex
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_preferenceType_key" ON "user_preferences"("userId", "preferenceType");

-- CreateIndex
CREATE INDEX "organizations_organizationType_idx" ON "organizations"("organizationType");

-- CreateIndex
CREATE INDEX "organizations_isActive_idx" ON "organizations"("isActive");

-- CreateIndex
CREATE INDEX "organization_preferences_organizationId_idx" ON "organization_preferences"("organizationId");

-- CreateIndex
CREATE INDEX "organization_preferences_targetOrganizationId_idx" ON "organization_preferences"("targetOrganizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_preferences_organizationId_preferenceType_targ_key" ON "organization_preferences"("organizationId", "preferenceType", "targetOrganizationId");

-- CreateIndex
CREATE INDEX "facilities_organizationId_idx" ON "facilities"("organizationId");

-- CreateIndex
CREATE INDEX "facilities_facilityType_idx" ON "facilities"("facilityType");

-- CreateIndex
CREATE INDEX "facilities_isActive_idx" ON "facilities"("isActive");

-- CreateIndex
CREATE INDEX "notification_logs_userId_idx" ON "notification_logs"("userId");

-- CreateIndex
CREATE INDEX "pickup_locations_facilityId_idx" ON "pickup_locations"("facilityId");

-- CreateIndex
CREATE INDEX "pickup_locations_isActive_idx" ON "pickup_locations"("isActive");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_preferences" ADD CONSTRAINT "organization_preferences_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_preferences" ADD CONSTRAINT "organization_preferences_targetOrganizationId_fkey" FOREIGN KEY ("targetOrganizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_locations" ADD CONSTRAINT "pickup_locations_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
