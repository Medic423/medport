/*
  Warnings:

  - You are about to drop the `ems_agencies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ems_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `units` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "transport_requests" DROP CONSTRAINT "transport_requests_createdById_fkey";

-- DropForeignKey
ALTER TABLE "units" DROP CONSTRAINT "units_agencyId_fkey";

-- AlterTable
ALTER TABLE "transport_requests" ADD COLUMN     "healthcareCreatedById" TEXT;

-- DropTable
DROP TABLE "ems_agencies";

-- DropTable
DROP TABLE "ems_users";

-- DropTable
DROP TABLE "units";

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
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "coordinates" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hospital_users_email_key" ON "hospital_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "healthcare_users_email_key" ON "healthcare_users"("email");

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_originFacilityId_fkey" FOREIGN KEY ("originFacilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_destinationFacilityId_fkey" FOREIGN KEY ("destinationFacilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "hospital_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_healthcareCreatedById_fkey" FOREIGN KEY ("healthcareCreatedById") REFERENCES "healthcare_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
