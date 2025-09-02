/*
  Warnings:

  - You are about to drop the `agencies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `database_references` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ems_agencies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hospitals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `service_registry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_configurations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."TransportLevel" AS ENUM ('BLS', 'ALS', 'CCT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."FacilityType" AS ENUM ('HOSPITAL', 'NURSING_HOME', 'CANCER_CENTER', 'REHAB_FACILITY', 'URGENT_CARE');

-- DropForeignKey
ALTER TABLE "public"."audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_hospitalId_fkey";

-- DropTable
DROP TABLE "public"."agencies";

-- DropTable
DROP TABLE "public"."audit_logs";

-- DropTable
DROP TABLE "public"."database_references";

-- DropTable
DROP TABLE "public"."ems_agencies";

-- DropTable
DROP TABLE "public"."hospitals";

-- DropTable
DROP TABLE "public"."service_registry";

-- DropTable
DROP TABLE "public"."system_analytics";

-- DropTable
DROP TABLE "public"."system_configurations";

-- DropTable
DROP TABLE "public"."users";

-- DropEnum
DROP TYPE "public"."ServiceStatus";

-- DropEnum
DROP TYPE "public"."UserType";

-- CreateTable
CREATE TABLE "public"."hospital_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'COORDINATOR',
    "hospitalName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hospital_facilities" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "coordinates" JSONB,
    "phone" TEXT,
    "email" TEXT,
    "operatingHours" TEXT,
    "capabilities" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."facilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."FacilityType" NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "coordinates" JSONB,
    "phone" TEXT,
    "email" TEXT,
    "operatingHours" JSONB,
    "capabilities" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transport_requests" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "originFacilityId" TEXT NOT NULL,
    "destinationFacilityId" TEXT NOT NULL,
    "transportLevel" "public"."TransportLevel" NOT NULL,
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "specialRequirements" TEXT,
    "requestTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedTimestamp" TIMESTAMP(3),
    "pickupTimestamp" TIMESTAMP(3),
    "completionTimestamp" TIMESTAMP(3),
    "assignedAgencyId" TEXT,
    "assignedUnitId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "routeOptimizationScore" DOUBLE PRECISION,
    "chainingOpportunities" JSONB,
    "timeFlexibility" INTEGER,
    "revenuePotential" DOUBLE PRECISION,
    "estimatedArrivalTime" TIMESTAMP(3),
    "estimatedPickupTime" TIMESTAMP(3),
    "etaUpdates" JSONB,
    "cancellationReason" TEXT,

    CONSTRAINT "transport_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hospital_agency_preferences" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "preferenceOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_agency_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_HospitalAgencyPreferenceToTransportRequest" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_HospitalAgencyPreferenceToTransportRequest_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "hospital_users_email_key" ON "public"."hospital_users"("email");

-- CreateIndex
CREATE INDEX "_HospitalAgencyPreferenceToTransportRequest_B_index" ON "public"."_HospitalAgencyPreferenceToTransportRequest"("B");

-- AddForeignKey
ALTER TABLE "public"."hospital_facilities" ADD CONSTRAINT "hospital_facilities_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."hospital_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transport_requests" ADD CONSTRAINT "transport_requests_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."hospital_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transport_requests" ADD CONSTRAINT "transport_requests_originFacilityId_fkey" FOREIGN KEY ("originFacilityId") REFERENCES "public"."facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transport_requests" ADD CONSTRAINT "transport_requests_destinationFacilityId_fkey" FOREIGN KEY ("destinationFacilityId") REFERENCES "public"."facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transport_requests" ADD CONSTRAINT "transport_requests_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."hospital_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hospital_agency_preferences" ADD CONSTRAINT "hospital_agency_preferences_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."hospital_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_HospitalAgencyPreferenceToTransportRequest" ADD CONSTRAINT "_HospitalAgencyPreferenceToTransportRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."hospital_agency_preferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_HospitalAgencyPreferenceToTransportRequest" ADD CONSTRAINT "_HospitalAgencyPreferenceToTransportRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."transport_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
