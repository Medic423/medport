/*
  Warnings:

  - You are about to drop the `_HospitalAgencyPreferenceToTransportRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `facilities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hospital_agency_preferences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hospital_facilities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hospital_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transport_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."UnitType" AS ENUM ('BLS', 'ALS', 'CCT', 'WHEELCHAIR', 'MEDICAL_TAXI');

-- CreateEnum
CREATE TYPE "public"."UnitStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'OUT_OF_SERVICE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."AvailabilityStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'ON_BREAK', 'OFF_DUTY');

-- CreateEnum
CREATE TYPE "public"."BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."RouteType" AS ENUM ('OPTIMIZED', 'STANDARD', 'EMERGENCY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."RouteStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "public"."_HospitalAgencyPreferenceToTransportRequest" DROP CONSTRAINT "_HospitalAgencyPreferenceToTransportRequest_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_HospitalAgencyPreferenceToTransportRequest" DROP CONSTRAINT "_HospitalAgencyPreferenceToTransportRequest_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."hospital_agency_preferences" DROP CONSTRAINT "hospital_agency_preferences_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."hospital_facilities" DROP CONSTRAINT "hospital_facilities_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."transport_requests" DROP CONSTRAINT "transport_requests_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."transport_requests" DROP CONSTRAINT "transport_requests_destinationFacilityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."transport_requests" DROP CONSTRAINT "transport_requests_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."transport_requests" DROP CONSTRAINT "transport_requests_originFacilityId_fkey";

-- DropTable
DROP TABLE "public"."_HospitalAgencyPreferenceToTransportRequest";

-- DropTable
DROP TABLE "public"."facilities";

-- DropTable
DROP TABLE "public"."hospital_agency_preferences";

-- DropTable
DROP TABLE "public"."hospital_facilities";

-- DropTable
DROP TABLE "public"."hospital_users";

-- DropTable
DROP TABLE "public"."transport_requests";

-- DropEnum
DROP TYPE "public"."FacilityType";

-- DropEnum
DROP TYPE "public"."Priority";

-- DropEnum
DROP TYPE "public"."RequestStatus";

-- DropEnum
DROP TYPE "public"."TransportLevel";

-- DropEnum
DROP TYPE "public"."UserRole";

-- CreateTable
CREATE TABLE "public"."ems_agencies" (
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
    "operatingHours" TEXT NOT NULL,
    "capabilities" TEXT[],
    "pricingStructure" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "public"."ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "addedBy" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ems_agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."units" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "type" "public"."UnitType" NOT NULL,
    "capabilities" TEXT[],
    "currentStatus" "public"."UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "currentLocation" JSONB,
    "shiftStart" TIMESTAMP(3),
    "shiftEnd" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unit_availability" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "status" "public"."AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transport_bids" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "transportRequestId" TEXT NOT NULL,
    "bidAmount" DECIMAL(65,30),
    "estimatedArrival" TIMESTAMP(3),
    "estimatedPickup" TIMESTAMP(3),
    "specialNotes" TEXT,
    "status" "public"."BidStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ems_routes" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "routeType" "public"."RouteType" NOT NULL,
    "waypoints" JSONB NOT NULL,
    "distance" DECIMAL(65,30),
    "estimatedTime" INTEGER,
    "status" "public"."RouteStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ems_routes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."units" ADD CONSTRAINT "units_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."ems_agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unit_availability" ADD CONSTRAINT "unit_availability_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transport_bids" ADD CONSTRAINT "transport_bids_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."ems_agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ems_routes" ADD CONSTRAINT "ems_routes_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."ems_agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
