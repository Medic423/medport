-- CreateEnum
CREATE TYPE "public"."LocationType" AS ENUM ('GPS', 'CELLULAR', 'WIFI', 'MANUAL', 'ESTIMATED');

-- CreateEnum
CREATE TYPE "public"."LocationSource" AS ENUM ('UNIT_DEVICE', 'MOBILE_APP', 'CAD_SYSTEM', 'MANUAL_ENTRY', 'ESTIMATION');

-- CreateEnum
CREATE TYPE "public"."GeofenceType" AS ENUM ('FACILITY_ARRIVAL', 'FACILITY_DEPARTURE', 'SERVICE_AREA', 'RESTRICTED_AREA', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."GeofenceEventType" AS ENUM ('ENTERED', 'EXITED', 'APPROACHING', 'DEPARTING');

-- CreateEnum
CREATE TYPE "public"."DeviationType" AS ENUM ('ROUTE_DEVIATION', 'SPEED_VIOLATION', 'STOPPED_UNEXPECTEDLY', 'WRONG_DIRECTION', 'OFF_ROUTE');

-- CreateEnum
CREATE TYPE "public"."DestinationType" AS ENUM ('FACILITY', 'PICKUP_LOCATION', 'DROPOFF_LOCATION', 'WAYPOINT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."TrafficSeverity" AS ENUM ('NONE', 'LIGHT', 'MODERATE', 'HEAVY', 'SEVERE');

-- CreateEnum
CREATE TYPE "public"."WeatherImpactLevel" AS ENUM ('NONE', 'MINIMAL', 'MODERATE', 'SIGNIFICANT', 'SEVERE');

-- CreateEnum
CREATE TYPE "public"."GPSTrackingStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR', 'OFFLINE');

-- CreateEnum
CREATE TYPE "public"."ETAUpdateStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."RouteDeviationStatus" AS ENUM ('UNRESOLVED', 'RESOLVED', 'IGNORED');

-- CreateEnum
CREATE TYPE "public"."LocationHistorySource" AS ENUM ('UNIT_DEVICE', 'MOBILE_APP', 'CAD_SYSTEM', 'MANUAL_ENTRY');

-- CreateEnum
CREATE TYPE "public"."LocationHistoryType" AS ENUM ('GPS', 'CELLULAR', 'WIFI', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."GeofenceEventStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateTable
CREATE TABLE "public"."GPSTracking" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "altitude" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "batteryLevel" DOUBLE PRECISION,
    "signalStrength" DOUBLE PRECISION,
    "locationType" "public"."LocationType" NOT NULL DEFAULT 'GPS',
    "source" "public"."LocationSource" NOT NULL DEFAULT 'UNIT_DEVICE',

    CONSTRAINT "GPSTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LocationHistory" (
    "id" TEXT NOT NULL,
    "gpsTrackingId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "altitude" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationType" "public"."LocationType" NOT NULL DEFAULT 'GPS',
    "source" "public"."LocationSource" NOT NULL DEFAULT 'UNIT_DEVICE',

    CONSTRAINT "LocationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GeofenceEvent" (
    "id" TEXT NOT NULL,
    "gpsTrackingId" TEXT NOT NULL,
    "facilityId" TEXT,
    "geofenceType" "public"."GeofenceType" NOT NULL,
    "eventType" "public"."GeofenceEventType" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radius" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "GeofenceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RouteDeviation" (
    "id" TEXT NOT NULL,
    "gpsTrackingId" TEXT NOT NULL,
    "routeId" TEXT,
    "deviationType" "public"."DeviationType" NOT NULL,
    "severity" "public"."AlertSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "currentLatitude" DOUBLE PRECISION NOT NULL,
    "currentLongitude" DOUBLE PRECISION NOT NULL,
    "expectedLatitude" DOUBLE PRECISION NOT NULL,
    "expectedLongitude" DOUBLE PRECISION NOT NULL,
    "distanceOffRoute" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolutionNotes" TEXT,

    CONSTRAINT "RouteDeviation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ETAUpdate" (
    "id" TEXT NOT NULL,
    "gpsTrackingId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "destinationType" "public"."DestinationType" NOT NULL,
    "currentETA" TIMESTAMP(3) NOT NULL,
    "previousETA" TIMESTAMP(3),
    "trafficFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "weatherFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "routeConditions" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ETAUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrafficCondition" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "severity" "public"."TrafficSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "impactFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "affectedRoutes" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrafficCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WeatherImpact" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "weatherType" "public"."WeatherConditions" NOT NULL,
    "impactLevel" "public"."WeatherImpactLevel" NOT NULL,
    "description" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "travelDelayFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "affectedAreas" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherImpact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GPSTracking_unitId_timestamp_idx" ON "public"."GPSTracking"("unitId", "timestamp");

-- CreateIndex
CREATE INDEX "GPSTracking_timestamp_idx" ON "public"."GPSTracking"("timestamp");

-- CreateIndex
CREATE INDEX "LocationHistory_gpsTrackingId_timestamp_idx" ON "public"."LocationHistory"("gpsTrackingId", "timestamp");

-- CreateIndex
CREATE INDEX "LocationHistory_timestamp_idx" ON "public"."LocationHistory"("timestamp");

-- CreateIndex
CREATE INDEX "GeofenceEvent_gpsTrackingId_timestamp_idx" ON "public"."GeofenceEvent"("gpsTrackingId", "timestamp");

-- CreateIndex
CREATE INDEX "GeofenceEvent_facilityId_timestamp_idx" ON "public"."GeofenceEvent"("facilityId", "timestamp");

-- CreateIndex
CREATE INDEX "RouteDeviation_gpsTrackingId_timestamp_idx" ON "public"."RouteDeviation"("gpsTrackingId", "timestamp");

-- CreateIndex
CREATE INDEX "RouteDeviation_routeId_timestamp_idx" ON "public"."RouteDeviation"("routeId", "timestamp");

-- CreateIndex
CREATE INDEX "ETAUpdate_gpsTrackingId_timestamp_idx" ON "public"."ETAUpdate"("gpsTrackingId", "timestamp");

-- CreateIndex
CREATE INDEX "ETAUpdate_destinationId_timestamp_idx" ON "public"."ETAUpdate"("destinationId", "timestamp");

-- CreateIndex
CREATE INDEX "TrafficCondition_location_startTime_idx" ON "public"."TrafficCondition"("location", "startTime");

-- CreateIndex
CREATE INDEX "TrafficCondition_isActive_idx" ON "public"."TrafficCondition"("isActive");

-- CreateIndex
CREATE INDEX "WeatherImpact_location_startTime_idx" ON "public"."WeatherImpact"("location", "startTime");

-- CreateIndex
CREATE INDEX "WeatherImpact_isActive_idx" ON "public"."WeatherImpact"("isActive");

-- AddForeignKey
ALTER TABLE "public"."GPSTracking" ADD CONSTRAINT "GPSTracking_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LocationHistory" ADD CONSTRAINT "LocationHistory_gpsTrackingId_fkey" FOREIGN KEY ("gpsTrackingId") REFERENCES "public"."GPSTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GeofenceEvent" ADD CONSTRAINT "GeofenceEvent_gpsTrackingId_fkey" FOREIGN KEY ("gpsTrackingId") REFERENCES "public"."GPSTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GeofenceEvent" ADD CONSTRAINT "GeofenceEvent_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "public"."Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RouteDeviation" ADD CONSTRAINT "RouteDeviation_gpsTrackingId_fkey" FOREIGN KEY ("gpsTrackingId") REFERENCES "public"."GPSTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RouteDeviation" ADD CONSTRAINT "RouteDeviation_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "public"."Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ETAUpdate" ADD CONSTRAINT "ETAUpdate_gpsTrackingId_fkey" FOREIGN KEY ("gpsTrackingId") REFERENCES "public"."GPSTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
