/*
  Warnings:

  - You are about to drop the `AgencyPerformance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AgencyProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AgencyUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AirMedicalResource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AirMedicalTransport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BedStatusUpdate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CapacityAlert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DemandPattern` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DistanceMatrix` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ETAUpdate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmergencyDepartment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Facility` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GPSTracking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GeofenceEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroundTransportCoordination` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HospitalAgencyPreference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LocationHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LongDistanceTransport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MultiPatientTransport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PatientTransport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProviderForecast` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Route` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RouteDeviation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RouteStop` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceArea` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrafficCondition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransportAgency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransportBid` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransportLeg` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransportQueue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransportRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Unit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UnitAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UnitAvailability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeatherAlert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeatherImpact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeatherUpdate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AirMedicalResourceToWeatherAlert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AirMedicalTransportToWeatherAlert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RouteToTransportRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('HOSPITAL', 'EMS', 'CENTER');

-- DropForeignKey
ALTER TABLE "public"."AgencyPerformance" DROP CONSTRAINT "AgencyPerformance_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AgencyProfile" DROP CONSTRAINT "AgencyProfile_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AgencyUser" DROP CONSTRAINT "AgencyUser_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AirMedicalTransport" DROP CONSTRAINT "AirMedicalTransport_airMedicalResourceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AirMedicalTransport" DROP CONSTRAINT "AirMedicalTransport_longDistanceTransportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AirMedicalTransport" DROP CONSTRAINT "AirMedicalTransport_multiPatientTransportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AirMedicalTransport" DROP CONSTRAINT "AirMedicalTransport_transportRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BedStatusUpdate" DROP CONSTRAINT "BedStatusUpdate_emergencyDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CapacityAlert" DROP CONSTRAINT "CapacityAlert_emergencyDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DemandPattern" DROP CONSTRAINT "DemandPattern_facilityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DistanceMatrix" DROP CONSTRAINT "DistanceMatrix_fromFacilityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DistanceMatrix" DROP CONSTRAINT "DistanceMatrix_toFacilityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ETAUpdate" DROP CONSTRAINT "ETAUpdate_gpsTrackingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EmergencyDepartment" DROP CONSTRAINT "EmergencyDepartment_facilityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GPSTracking" DROP CONSTRAINT "GPSTracking_unitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GeofenceEvent" DROP CONSTRAINT "GeofenceEvent_facilityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GeofenceEvent" DROP CONSTRAINT "GeofenceEvent_gpsTrackingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GroundTransportCoordination" DROP CONSTRAINT "GroundTransportCoordination_airMedicalTransportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GroundTransportCoordination" DROP CONSTRAINT "GroundTransportCoordination_groundTransportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HospitalAgencyPreference" DROP CONSTRAINT "HospitalAgencyPreference_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HospitalAgencyPreference" DROP CONSTRAINT "HospitalAgencyPreference_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LocationHistory" DROP CONSTRAINT "LocationHistory_gpsTrackingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LongDistanceTransport" DROP CONSTRAINT "LongDistanceTransport_assignedAgencyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LongDistanceTransport" DROP CONSTRAINT "LongDistanceTransport_assignedUnitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LongDistanceTransport" DROP CONSTRAINT "LongDistanceTransport_coordinatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MultiPatientTransport" DROP CONSTRAINT "MultiPatientTransport_assignedAgencyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MultiPatientTransport" DROP CONSTRAINT "MultiPatientTransport_assignedUnitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MultiPatientTransport" DROP CONSTRAINT "MultiPatientTransport_coordinatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PatientTransport" DROP CONSTRAINT "PatientTransport_destinationFacilityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PatientTransport" DROP CONSTRAINT "PatientTransport_multiPatientTransportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PatientTransport" DROP CONSTRAINT "PatientTransport_originFacilityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProviderForecast" DROP CONSTRAINT "ProviderForecast_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Route" DROP CONSTRAINT "Route_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Route" DROP CONSTRAINT "Route_assignedUnitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Route" DROP CONSTRAINT "Route_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."RouteDeviation" DROP CONSTRAINT "RouteDeviation_gpsTrackingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RouteDeviation" DROP CONSTRAINT "RouteDeviation_routeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RouteStop" DROP CONSTRAINT "RouteStop_facilityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RouteStop" DROP CONSTRAINT "RouteStop_multiPatientTransportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RouteStop" DROP CONSTRAINT "RouteStop_routeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RouteStop" DROP CONSTRAINT "RouteStop_transportRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ServiceArea" DROP CONSTRAINT "ServiceArea_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportAgency" DROP CONSTRAINT "TransportAgency_addedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportBid" DROP CONSTRAINT "TransportBid_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportBid" DROP CONSTRAINT "TransportBid_agencyUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportBid" DROP CONSTRAINT "TransportBid_transportRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportLeg" DROP CONSTRAINT "TransportLeg_destinationFacilityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportLeg" DROP CONSTRAINT "TransportLeg_longDistanceTransportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportLeg" DROP CONSTRAINT "TransportLeg_originFacilityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportQueue" DROP CONSTRAINT "TransportQueue_assignedProviderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportQueue" DROP CONSTRAINT "TransportQueue_assignedUnitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportQueue" DROP CONSTRAINT "TransportQueue_emergencyDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportQueue" DROP CONSTRAINT "TransportQueue_transportRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportRequest" DROP CONSTRAINT "TransportRequest_assignedAgencyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportRequest" DROP CONSTRAINT "TransportRequest_assignedUnitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportRequest" DROP CONSTRAINT "TransportRequest_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportRequest" DROP CONSTRAINT "TransportRequest_destinationFacilityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportRequest" DROP CONSTRAINT "TransportRequest_originFacilityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Unit" DROP CONSTRAINT "Unit_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UnitAssignment" DROP CONSTRAINT "UnitAssignment_assignedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."UnitAssignment" DROP CONSTRAINT "UnitAssignment_transportRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UnitAssignment" DROP CONSTRAINT "UnitAssignment_unitAvailabilityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UnitAssignment" DROP CONSTRAINT "UnitAssignment_unitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UnitAvailability" DROP CONSTRAINT "UnitAvailability_unitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WeatherUpdate" DROP CONSTRAINT "WeatherUpdate_longDistanceTransportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WeatherUpdate" DROP CONSTRAINT "WeatherUpdate_multiPatientTransportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AirMedicalResourceToWeatherAlert" DROP CONSTRAINT "_AirMedicalResourceToWeatherAlert_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AirMedicalResourceToWeatherAlert" DROP CONSTRAINT "_AirMedicalResourceToWeatherAlert_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AirMedicalTransportToWeatherAlert" DROP CONSTRAINT "_AirMedicalTransportToWeatherAlert_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AirMedicalTransportToWeatherAlert" DROP CONSTRAINT "_AirMedicalTransportToWeatherAlert_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_RouteToTransportRequest" DROP CONSTRAINT "_RouteToTransportRequest_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_RouteToTransportRequest" DROP CONSTRAINT "_RouteToTransportRequest_B_fkey";

-- DropTable
DROP TABLE "public"."AgencyPerformance";

-- DropTable
DROP TABLE "public"."AgencyProfile";

-- DropTable
DROP TABLE "public"."AgencyUser";

-- DropTable
DROP TABLE "public"."AirMedicalResource";

-- DropTable
DROP TABLE "public"."AirMedicalTransport";

-- DropTable
DROP TABLE "public"."BedStatusUpdate";

-- DropTable
DROP TABLE "public"."CapacityAlert";

-- DropTable
DROP TABLE "public"."DemandPattern";

-- DropTable
DROP TABLE "public"."DistanceMatrix";

-- DropTable
DROP TABLE "public"."ETAUpdate";

-- DropTable
DROP TABLE "public"."EmergencyDepartment";

-- DropTable
DROP TABLE "public"."Facility";

-- DropTable
DROP TABLE "public"."GPSTracking";

-- DropTable
DROP TABLE "public"."GeofenceEvent";

-- DropTable
DROP TABLE "public"."GroundTransportCoordination";

-- DropTable
DROP TABLE "public"."HospitalAgencyPreference";

-- DropTable
DROP TABLE "public"."LocationHistory";

-- DropTable
DROP TABLE "public"."LongDistanceTransport";

-- DropTable
DROP TABLE "public"."MultiPatientTransport";

-- DropTable
DROP TABLE "public"."PatientTransport";

-- DropTable
DROP TABLE "public"."ProviderForecast";

-- DropTable
DROP TABLE "public"."Route";

-- DropTable
DROP TABLE "public"."RouteDeviation";

-- DropTable
DROP TABLE "public"."RouteStop";

-- DropTable
DROP TABLE "public"."ServiceArea";

-- DropTable
DROP TABLE "public"."TrafficCondition";

-- DropTable
DROP TABLE "public"."TransportAgency";

-- DropTable
DROP TABLE "public"."TransportBid";

-- DropTable
DROP TABLE "public"."TransportLeg";

-- DropTable
DROP TABLE "public"."TransportQueue";

-- DropTable
DROP TABLE "public"."TransportRequest";

-- DropTable
DROP TABLE "public"."Unit";

-- DropTable
DROP TABLE "public"."UnitAssignment";

-- DropTable
DROP TABLE "public"."UnitAvailability";

-- DropTable
DROP TABLE "public"."User";

-- DropTable
DROP TABLE "public"."WeatherAlert";

-- DropTable
DROP TABLE "public"."WeatherImpact";

-- DropTable
DROP TABLE "public"."WeatherUpdate";

-- DropTable
DROP TABLE "public"."_AirMedicalResourceToWeatherAlert";

-- DropTable
DROP TABLE "public"."_AirMedicalTransportToWeatherAlert";

-- DropTable
DROP TABLE "public"."_RouteToTransportRequest";

-- DropEnum
DROP TYPE "public"."AgencyUserRole";

-- DropEnum
DROP TYPE "public"."AirMedicalStatus";

-- DropEnum
DROP TYPE "public"."AirMedicalType";

-- DropEnum
DROP TYPE "public"."AlertSeverity";

-- DropEnum
DROP TYPE "public"."AssignmentStatus";

-- DropEnum
DROP TYPE "public"."AssignmentType";

-- DropEnum
DROP TYPE "public"."BedUpdateType";

-- DropEnum
DROP TYPE "public"."BidStatus";

-- DropEnum
DROP TYPE "public"."CapacityAlertType";

-- DropEnum
DROP TYPE "public"."CoordinationStatus";

-- DropEnum
DROP TYPE "public"."CoordinationType";

-- DropEnum
DROP TYPE "public"."DestinationType";

-- DropEnum
DROP TYPE "public"."DeviationType";

-- DropEnum
DROP TYPE "public"."ETAUpdateStatus";

-- DropEnum
DROP TYPE "public"."FacilityType";

-- DropEnum
DROP TYPE "public"."ForecastType";

-- DropEnum
DROP TYPE "public"."GPSTrackingStatus";

-- DropEnum
DROP TYPE "public"."GeofenceEventStatus";

-- DropEnum
DROP TYPE "public"."GeofenceEventType";

-- DropEnum
DROP TYPE "public"."GeofenceType";

-- DropEnum
DROP TYPE "public"."LegStatus";

-- DropEnum
DROP TYPE "public"."LocationHistorySource";

-- DropEnum
DROP TYPE "public"."LocationHistoryType";

-- DropEnum
DROP TYPE "public"."LocationSource";

-- DropEnum
DROP TYPE "public"."LocationType";

-- DropEnum
DROP TYPE "public"."LongDistanceStatus";

-- DropEnum
DROP TYPE "public"."MultiPatientStatus";

-- DropEnum
DROP TYPE "public"."PatientTransportStatus";

-- DropEnum
DROP TYPE "public"."PatternType";

-- DropEnum
DROP TYPE "public"."Priority";

-- DropEnum
DROP TYPE "public"."QueueStatus";

-- DropEnum
DROP TYPE "public"."RequestStatus";

-- DropEnum
DROP TYPE "public"."RouteDeviationStatus";

-- DropEnum
DROP TYPE "public"."RouteOptimizationType";

-- DropEnum
DROP TYPE "public"."RouteStatus";

-- DropEnum
DROP TYPE "public"."RouteType";

-- DropEnum
DROP TYPE "public"."StopType";

-- DropEnum
DROP TYPE "public"."TrafficSeverity";

-- DropEnum
DROP TYPE "public"."TransportLevel";

-- DropEnum
DROP TYPE "public"."TrendDirection";

-- DropEnum
DROP TYPE "public"."UnitStatus";

-- DropEnum
DROP TYPE "public"."WeatherAlertType";

-- DropEnum
DROP TYPE "public"."WeatherConditions";

-- DropEnum
DROP TYPE "public"."WeatherImpactLevel";

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'COORDINATOR',
    "userType" "public"."UserType" NOT NULL,
    "hospitalId" TEXT,
    "agencyId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hospitals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agencies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_configurations" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_registry" (
    "id" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "status" "public"."ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "addedBy" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "configuration" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."database_references" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "sourceDatabase" TEXT NOT NULL,
    "targetDatabase" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "database_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_analytics" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" DECIMAL(65,30) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "system_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "system_configurations_key_key" ON "public"."system_configurations"("key");

-- CreateIndex
CREATE UNIQUE INDEX "service_registry_serviceName_key" ON "public"."service_registry"("serviceName");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
