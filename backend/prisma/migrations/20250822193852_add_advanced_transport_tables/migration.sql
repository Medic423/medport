-- CreateEnum
CREATE TYPE "public"."MultiPatientStatus" AS ENUM ('PLANNING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PatientTransportStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."LongDistanceStatus" AS ENUM ('PLANNING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'WEATHER_DELAYED');

-- CreateEnum
CREATE TYPE "public"."LegStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."RouteStop" ADD COLUMN     "multiPatientTransportId" TEXT;

-- CreateTable
CREATE TABLE "public"."MultiPatientTransport" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "status" "public"."MultiPatientStatus" NOT NULL DEFAULT 'PLANNING',
    "totalPatients" INTEGER NOT NULL,
    "totalDistance" DOUBLE PRECISION NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,
    "plannedStartTime" TIMESTAMP(3) NOT NULL,
    "plannedEndTime" TIMESTAMP(3) NOT NULL,
    "assignedAgencyId" TEXT,
    "assignedUnitId" TEXT,
    "routeOptimizationScore" DOUBLE PRECISION,
    "costSavings" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MultiPatientTransport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PatientTransport" (
    "id" TEXT NOT NULL,
    "multiPatientTransportId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "originFacilityId" TEXT NOT NULL,
    "destinationFacilityId" TEXT NOT NULL,
    "transportLevel" "public"."TransportLevel" NOT NULL,
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "specialRequirements" TEXT,
    "sequenceOrder" INTEGER NOT NULL,
    "estimatedPickupTime" TIMESTAMP(3) NOT NULL,
    "estimatedDropoffTime" TIMESTAMP(3) NOT NULL,
    "actualPickupTime" TIMESTAMP(3),
    "actualDropoffTime" TIMESTAMP(3),
    "status" "public"."PatientTransportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientTransport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LongDistanceTransport" (
    "id" TEXT NOT NULL,
    "transportNumber" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "status" "public"."LongDistanceStatus" NOT NULL DEFAULT 'PLANNING',
    "totalDistance" DOUBLE PRECISION NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,
    "plannedStartTime" TIMESTAMP(3) NOT NULL,
    "plannedEndTime" TIMESTAMP(3) NOT NULL,
    "isMultiLeg" BOOLEAN NOT NULL DEFAULT false,
    "legCount" INTEGER NOT NULL,
    "assignedAgencyId" TEXT,
    "assignedUnitId" TEXT,
    "costEstimate" DOUBLE PRECISION NOT NULL,
    "revenuePotential" DOUBLE PRECISION NOT NULL,
    "weatherConditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LongDistanceTransport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransportLeg" (
    "id" TEXT NOT NULL,
    "longDistanceTransportId" TEXT NOT NULL,
    "legNumber" INTEGER NOT NULL,
    "originFacilityId" TEXT NOT NULL,
    "destinationFacilityId" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,
    "plannedStartTime" TIMESTAMP(3) NOT NULL,
    "plannedEndTime" TIMESTAMP(3) NOT NULL,
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "status" "public"."LegStatus" NOT NULL DEFAULT 'PLANNED',
    "patientId" TEXT,
    "transportLevel" "public"."TransportLevel" NOT NULL,
    "specialRequirements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportLeg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WeatherUpdate" (
    "id" TEXT NOT NULL,
    "longDistanceTransportId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conditions" JSONB NOT NULL,
    "impact" TEXT NOT NULL,
    "recommendations" TEXT[],

    CONSTRAINT "WeatherUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MultiPatientTransport_batchNumber_key" ON "public"."MultiPatientTransport"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LongDistanceTransport_transportNumber_key" ON "public"."LongDistanceTransport"("transportNumber");

-- AddForeignKey
ALTER TABLE "public"."RouteStop" ADD CONSTRAINT "RouteStop_multiPatientTransportId_fkey" FOREIGN KEY ("multiPatientTransportId") REFERENCES "public"."MultiPatientTransport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MultiPatientTransport" ADD CONSTRAINT "MultiPatientTransport_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MultiPatientTransport" ADD CONSTRAINT "MultiPatientTransport_assignedAgencyId_fkey" FOREIGN KEY ("assignedAgencyId") REFERENCES "public"."TransportAgency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MultiPatientTransport" ADD CONSTRAINT "MultiPatientTransport_assignedUnitId_fkey" FOREIGN KEY ("assignedUnitId") REFERENCES "public"."Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientTransport" ADD CONSTRAINT "PatientTransport_multiPatientTransportId_fkey" FOREIGN KEY ("multiPatientTransportId") REFERENCES "public"."MultiPatientTransport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientTransport" ADD CONSTRAINT "PatientTransport_originFacilityId_fkey" FOREIGN KEY ("originFacilityId") REFERENCES "public"."Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientTransport" ADD CONSTRAINT "PatientTransport_destinationFacilityId_fkey" FOREIGN KEY ("destinationFacilityId") REFERENCES "public"."Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LongDistanceTransport" ADD CONSTRAINT "LongDistanceTransport_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LongDistanceTransport" ADD CONSTRAINT "LongDistanceTransport_assignedAgencyId_fkey" FOREIGN KEY ("assignedAgencyId") REFERENCES "public"."TransportAgency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LongDistanceTransport" ADD CONSTRAINT "LongDistanceTransport_assignedUnitId_fkey" FOREIGN KEY ("assignedUnitId") REFERENCES "public"."Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportLeg" ADD CONSTRAINT "TransportLeg_longDistanceTransportId_fkey" FOREIGN KEY ("longDistanceTransportId") REFERENCES "public"."LongDistanceTransport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportLeg" ADD CONSTRAINT "TransportLeg_originFacilityId_fkey" FOREIGN KEY ("originFacilityId") REFERENCES "public"."Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportLeg" ADD CONSTRAINT "TransportLeg_destinationFacilityId_fkey" FOREIGN KEY ("destinationFacilityId") REFERENCES "public"."Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeatherUpdate" ADD CONSTRAINT "WeatherUpdate_longDistanceTransportId_fkey" FOREIGN KEY ("longDistanceTransportId") REFERENCES "public"."LongDistanceTransport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
