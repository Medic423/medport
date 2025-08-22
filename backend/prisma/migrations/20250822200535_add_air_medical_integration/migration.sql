/*
  Warnings:

  - You are about to drop the column `conditions` on the `WeatherUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `impact` on the `WeatherUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `recommendations` on the `WeatherUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `WeatherUpdate` table. All the data in the column will be lost.
  - Added the required column `cloudCover` to the `WeatherUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `WeatherUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precipitation` to the `WeatherUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `temperature` to the `WeatherUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visibility` to the `WeatherUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weatherConditions` to the `WeatherUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `windDirection` to the `WeatherUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `windSpeed` to the `WeatherUpdate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."WeatherConditions" AS ENUM ('CLEAR', 'PARTLY_CLOUDY', 'CLOUDY', 'RAIN', 'SNOW', 'FOG', 'THUNDERSTORMS', 'HIGH_WINDS', 'ICING', 'TURBULENCE');

-- CreateEnum
CREATE TYPE "public"."AirMedicalType" AS ENUM ('HELICOPTER', 'FIXED_WING', 'JET', 'TURBOPROP');

-- CreateEnum
CREATE TYPE "public"."AirMedicalStatus" AS ENUM ('PLANNING', 'SCHEDULED', 'IN_FLIGHT', 'LANDED', 'COMPLETED', 'CANCELLED', 'GROUNDED', 'WEATHER_DELAYED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."WeatherAlertType" AS ENUM ('TURBULENCE', 'LOW_VISIBILITY', 'HIGH_WINDS', 'ICING', 'THUNDERSTORMS', 'SNOW', 'FOG', 'VOLCANIC_ASH');

-- CreateEnum
CREATE TYPE "public"."AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."CoordinationType" AS ENUM ('HANDOFF', 'ESCORT', 'BACKUP', 'RELAY', 'INTERCEPT');

-- CreateEnum
CREATE TYPE "public"."CoordinationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED');

-- DropForeignKey
ALTER TABLE "public"."WeatherUpdate" DROP CONSTRAINT "WeatherUpdate_longDistanceTransportId_fkey";

-- AlterTable
ALTER TABLE "public"."WeatherUpdate" DROP COLUMN "conditions",
DROP COLUMN "impact",
DROP COLUMN "recommendations",
DROP COLUMN "timestamp",
ADD COLUMN     "cloudCover" INTEGER NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "multiPatientTransportId" TEXT,
ADD COLUMN     "precipitation" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "temperature" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "visibility" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "weatherConditions" "public"."WeatherConditions" NOT NULL,
ADD COLUMN     "windDirection" TEXT NOT NULL,
ADD COLUMN     "windSpeed" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "longDistanceTransportId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."AirMedicalResource" (
    "id" TEXT NOT NULL,
    "resourceType" "public"."AirMedicalType" NOT NULL,
    "identifier" TEXT NOT NULL,
    "baseLocation" TEXT NOT NULL,
    "serviceArea" JSONB NOT NULL,
    "capabilities" JSONB NOT NULL,
    "crewSize" INTEGER NOT NULL,
    "maxRange" DOUBLE PRECISION NOT NULL,
    "maxPayload" DOUBLE PRECISION NOT NULL,
    "weatherMinimums" JSONB NOT NULL,
    "operatingHours" JSONB NOT NULL,
    "contactInfo" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AirMedicalResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AirMedicalTransport" (
    "id" TEXT NOT NULL,
    "transportRequestId" TEXT,
    "multiPatientTransportId" TEXT,
    "longDistanceTransportId" TEXT,
    "airMedicalResourceId" TEXT NOT NULL,
    "status" "public"."AirMedicalStatus" NOT NULL DEFAULT 'PLANNING',
    "flightPlan" JSONB NOT NULL,
    "weatherConditions" "public"."WeatherConditions" NOT NULL,
    "estimatedDeparture" TIMESTAMP(3) NOT NULL,
    "estimatedArrival" TIMESTAMP(3) NOT NULL,
    "actualDeparture" TIMESTAMP(3),
    "actualArrival" TIMESTAMP(3),
    "groundingReason" TEXT,
    "weatherDelay" BOOLEAN NOT NULL DEFAULT false,
    "crewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AirMedicalTransport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WeatherAlert" (
    "id" TEXT NOT NULL,
    "alertType" "public"."WeatherAlertType" NOT NULL,
    "severity" "public"."AlertSeverity" NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "impact" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GroundTransportCoordination" (
    "id" TEXT NOT NULL,
    "airMedicalTransportId" TEXT NOT NULL,
    "groundTransportId" TEXT,
    "coordinationType" "public"."CoordinationType" NOT NULL,
    "status" "public"."CoordinationStatus" NOT NULL DEFAULT 'PENDING',
    "handoffLocation" TEXT NOT NULL,
    "handoffTime" TIMESTAMP(3),
    "handoffNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroundTransportCoordination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_AirMedicalResourceToWeatherAlert" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AirMedicalResourceToWeatherAlert_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_AirMedicalTransportToWeatherAlert" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AirMedicalTransportToWeatherAlert_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "AirMedicalResource_identifier_key" ON "public"."AirMedicalResource"("identifier");

-- CreateIndex
CREATE INDEX "_AirMedicalResourceToWeatherAlert_B_index" ON "public"."_AirMedicalResourceToWeatherAlert"("B");

-- CreateIndex
CREATE INDEX "_AirMedicalTransportToWeatherAlert_B_index" ON "public"."_AirMedicalTransportToWeatherAlert"("B");

-- AddForeignKey
ALTER TABLE "public"."WeatherUpdate" ADD CONSTRAINT "WeatherUpdate_multiPatientTransportId_fkey" FOREIGN KEY ("multiPatientTransportId") REFERENCES "public"."MultiPatientTransport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeatherUpdate" ADD CONSTRAINT "WeatherUpdate_longDistanceTransportId_fkey" FOREIGN KEY ("longDistanceTransportId") REFERENCES "public"."LongDistanceTransport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AirMedicalTransport" ADD CONSTRAINT "AirMedicalTransport_transportRequestId_fkey" FOREIGN KEY ("transportRequestId") REFERENCES "public"."TransportRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AirMedicalTransport" ADD CONSTRAINT "AirMedicalTransport_multiPatientTransportId_fkey" FOREIGN KEY ("multiPatientTransportId") REFERENCES "public"."MultiPatientTransport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AirMedicalTransport" ADD CONSTRAINT "AirMedicalTransport_longDistanceTransportId_fkey" FOREIGN KEY ("longDistanceTransportId") REFERENCES "public"."LongDistanceTransport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AirMedicalTransport" ADD CONSTRAINT "AirMedicalTransport_airMedicalResourceId_fkey" FOREIGN KEY ("airMedicalResourceId") REFERENCES "public"."AirMedicalResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroundTransportCoordination" ADD CONSTRAINT "GroundTransportCoordination_airMedicalTransportId_fkey" FOREIGN KEY ("airMedicalTransportId") REFERENCES "public"."AirMedicalTransport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroundTransportCoordination" ADD CONSTRAINT "GroundTransportCoordination_groundTransportId_fkey" FOREIGN KEY ("groundTransportId") REFERENCES "public"."TransportRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AirMedicalResourceToWeatherAlert" ADD CONSTRAINT "_AirMedicalResourceToWeatherAlert_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."AirMedicalResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AirMedicalResourceToWeatherAlert" ADD CONSTRAINT "_AirMedicalResourceToWeatherAlert_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."WeatherAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AirMedicalTransportToWeatherAlert" ADD CONSTRAINT "_AirMedicalTransportToWeatherAlert_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."AirMedicalTransport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AirMedicalTransportToWeatherAlert" ADD CONSTRAINT "_AirMedicalTransportToWeatherAlert_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."WeatherAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;
