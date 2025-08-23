-- CreateEnum
CREATE TYPE "public"."AgencyUserRole" AS ENUM ('ADMIN', 'STAFF', 'BILLING_STAFF');

-- CreateEnum
CREATE TYPE "public"."AssignmentType" AS ENUM ('PRIMARY', 'SECONDARY', 'SUPPLEMENTAL');

-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "public"."AgencyUser" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."AgencyUserRole" NOT NULL DEFAULT 'STAFF',
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgencyProfile" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "licenseNumber" TEXT,
    "insuranceInfo" JSONB,
    "certifications" JSONB,
    "specializations" JSONB,
    "emergencyProcedures" JSONB,
    "contactPerson" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "serviceAreaNotes" TEXT,
    "operatingNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UnitAvailability" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "status" "public"."UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "location" JSONB,
    "shiftStart" TIMESTAMP(3),
    "shiftEnd" TIMESTAMP(3),
    "crewMembers" JSONB,
    "currentAssignment" TEXT,
    "notes" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UnitAssignment" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "unitAvailabilityId" TEXT NOT NULL,
    "transportRequestId" TEXT,
    "assignmentType" "public"."AssignmentType" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "assignedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransportBid" (
    "id" TEXT NOT NULL,
    "transportRequestId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "agencyUserId" TEXT NOT NULL,
    "bidAmount" DOUBLE PRECISION,
    "estimatedArrival" TIMESTAMP(3),
    "unitType" "public"."TransportLevel" NOT NULL,
    "specialCapabilities" JSONB,
    "notes" TEXT,
    "status" "public"."BidStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportBid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceArea" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "geographicBoundaries" JSONB NOT NULL,
    "coverageRadius" DOUBLE PRECISION,
    "primaryServiceArea" BOOLEAN NOT NULL DEFAULT false,
    "operatingHours" JSONB,
    "specialRestrictions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgencyPerformance" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalTransports" INTEGER NOT NULL DEFAULT 0,
    "completedTransports" INTEGER NOT NULL DEFAULT 0,
    "cancelledTransports" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" INTEGER,
    "totalMiles" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenueGenerated" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerSatisfaction" DOUBLE PRECISION,
    "onTimePercentage" DOUBLE PRECISION,
    "safetyIncidents" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgencyUser_email_key" ON "public"."AgencyUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AgencyProfile_agencyId_key" ON "public"."AgencyProfile"("agencyId");

-- AddForeignKey
ALTER TABLE "public"."AgencyUser" ADD CONSTRAINT "AgencyUser_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."TransportAgency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgencyProfile" ADD CONSTRAINT "AgencyProfile_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."TransportAgency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnitAvailability" ADD CONSTRAINT "UnitAvailability_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnitAssignment" ADD CONSTRAINT "UnitAssignment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnitAssignment" ADD CONSTRAINT "UnitAssignment_unitAvailabilityId_fkey" FOREIGN KEY ("unitAvailabilityId") REFERENCES "public"."UnitAvailability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnitAssignment" ADD CONSTRAINT "UnitAssignment_transportRequestId_fkey" FOREIGN KEY ("transportRequestId") REFERENCES "public"."TransportRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnitAssignment" ADD CONSTRAINT "UnitAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "public"."AgencyUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportBid" ADD CONSTRAINT "TransportBid_transportRequestId_fkey" FOREIGN KEY ("transportRequestId") REFERENCES "public"."TransportRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportBid" ADD CONSTRAINT "TransportBid_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."TransportAgency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportBid" ADD CONSTRAINT "TransportBid_agencyUserId_fkey" FOREIGN KEY ("agencyUserId") REFERENCES "public"."AgencyUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceArea" ADD CONSTRAINT "ServiceArea_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."TransportAgency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgencyPerformance" ADD CONSTRAINT "AgencyPerformance_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."TransportAgency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
