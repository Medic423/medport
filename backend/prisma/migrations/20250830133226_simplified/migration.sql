-- CreateEnum
CREATE TYPE "public"."MultiPatientStatus" AS ENUM ('PLANNING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PatientTransportStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."LongDistanceStatus" AS ENUM ('PLANNING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'WEATHER_DELAYED');

-- CreateEnum
CREATE TYPE "public"."LegStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."WeatherConditions" AS ENUM ('CLEAR', 'PARTLY_CLOUDY', 'CLOUDY', 'RAIN', 'SNOW', 'FOG', 'THUNDERSTORMS', 'HIGH_WINDS', 'ICING', 'TURBULENCE');

-- CreateEnum
CREATE TYPE "public"."AirMedicalType" AS ENUM ('HELICOPTER', 'FIXED_WING', 'JET', 'TURBOPROP');

-- CreateEnum
CREATE TYPE "public"."AirMedicalStatus" AS ENUM ('PLANNING', 'SCHEDULED', 'IN_FLIGHT', 'LANDED', 'COMPLETED', 'CANCELLED', 'GROUNDED', 'WEATHER_DELAYED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."WeatherAlertType" AS ENUM ('TURBULENCE', 'LOW_VISIBILITY', 'HIGH_WINDS', 'ICING', 'THUNDERSTORMS', 'SNOW', 'FOG', 'VOLCANIC_ASH');

-- CreateEnum
CREATE TYPE "public"."CoordinationType" AS ENUM ('HANDOFF', 'ESCORT', 'BACKUP', 'RELAY', 'INTERCEPT');

-- CreateEnum
CREATE TYPE "public"."CoordinationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."BedUpdateType" AS ENUM ('BED_ADDED', 'BED_REMOVED', 'BED_OCCUPIED', 'BED_VACATED', 'HALLWAY_BED_ADDED', 'HALLWAY_BED_REMOVED', 'CRITICAL_BED_UPDATE');

-- CreateEnum
CREATE TYPE "public"."QueueStatus" AS ENUM ('WAITING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "public"."CapacityAlertType" AS ENUM ('BED_CAPACITY', 'HALLWAY_BED_THRESHOLD', 'TRANSPORT_QUEUE_LENGTH', 'WAIT_TIME_THRESHOLD', 'CRITICAL_BED_SHORTAGE');

-- CreateEnum
CREATE TYPE "public"."ForecastType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'SEASONAL', 'EVENT_BASED');

-- CreateEnum
CREATE TYPE "public"."PatternType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'SEASONAL', 'EVENT_DRIVEN');

-- CreateEnum
CREATE TYPE "public"."TrendDirection" AS ENUM ('INCREASING', 'DECREASING', 'STABLE', 'CYCLICAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."AgencyUserRole" AS ENUM ('ADMIN', 'STAFF', 'BILLING_STAFF');

-- CreateEnum
CREATE TYPE "public"."AssignmentType" AS ENUM ('PRIMARY', 'SECONDARY', 'SUPPLEMENTAL');

-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN');

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
    "location" TEXT NOT NULL,
    "weatherConditions" "public"."WeatherConditions" NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "windSpeed" DOUBLE PRECISION NOT NULL,
    "windDirection" TEXT NOT NULL,
    "visibility" DOUBLE PRECISION NOT NULL,
    "precipitation" DOUBLE PRECISION NOT NULL,
    "cloudCover" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "multiPatientTransportId" TEXT,
    "longDistanceTransportId" TEXT,

    CONSTRAINT "WeatherUpdate_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "public"."EmergencyDepartment" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalBeds" INTEGER NOT NULL,
    "availableBeds" INTEGER NOT NULL,
    "occupiedBeds" INTEGER NOT NULL,
    "hallwayBeds" INTEGER NOT NULL,
    "criticalBeds" INTEGER NOT NULL,
    "capacityThreshold" INTEGER NOT NULL DEFAULT 80,
    "currentCensus" INTEGER NOT NULL,
    "transportQueueLength" INTEGER NOT NULL DEFAULT 0,
    "averageWaitTime" INTEGER NOT NULL DEFAULT 0,
    "peakHours" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BedStatusUpdate" (
    "id" TEXT NOT NULL,
    "emergencyDepartmentId" TEXT NOT NULL,
    "updateType" "public"."BedUpdateType" NOT NULL,
    "bedCount" INTEGER NOT NULL,
    "updateReason" TEXT,
    "notes" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BedStatusUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransportQueue" (
    "id" TEXT NOT NULL,
    "emergencyDepartmentId" TEXT NOT NULL,
    "transportRequestId" TEXT NOT NULL,
    "queuePosition" INTEGER NOT NULL,
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "waitTime" INTEGER NOT NULL DEFAULT 0,
    "estimatedWaitTime" INTEGER,
    "status" "public"."QueueStatus" NOT NULL DEFAULT 'WAITING',
    "assignedProviderId" TEXT,
    "assignedUnitId" TEXT,
    "queueTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedTimestamp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CapacityAlert" (
    "id" TEXT NOT NULL,
    "emergencyDepartmentId" TEXT NOT NULL,
    "alertType" "public"."CapacityAlertType" NOT NULL,
    "severity" "public"."AlertSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CapacityAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProviderForecast" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "forecastDate" TIMESTAMP(3) NOT NULL,
    "forecastType" "public"."ForecastType" NOT NULL,
    "predictedDemand" INTEGER NOT NULL,
    "availableCapacity" INTEGER NOT NULL,
    "capacityUtilization" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "factors" JSONB,
    "recommendations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderForecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DemandPattern" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "patternType" "public"."PatternType" NOT NULL,
    "dayOfWeek" INTEGER,
    "hourOfDay" INTEGER,
    "averageDemand" DOUBLE PRECISION NOT NULL,
    "peakDemand" DOUBLE PRECISION NOT NULL,
    "seasonalFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "trendDirection" "public"."TrendDirection" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "dataPoints" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandPattern_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "MultiPatientTransport_batchNumber_key" ON "public"."MultiPatientTransport"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LongDistanceTransport_transportNumber_key" ON "public"."LongDistanceTransport"("transportNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AirMedicalResource_identifier_key" ON "public"."AirMedicalResource"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyDepartment_facilityId_key" ON "public"."EmergencyDepartment"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "AgencyUser_email_key" ON "public"."AgencyUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AgencyProfile_agencyId_key" ON "public"."AgencyProfile"("agencyId");

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
ALTER TABLE "public"."EmergencyDepartment" ADD CONSTRAINT "EmergencyDepartment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "public"."Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BedStatusUpdate" ADD CONSTRAINT "BedStatusUpdate_emergencyDepartmentId_fkey" FOREIGN KEY ("emergencyDepartmentId") REFERENCES "public"."EmergencyDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportQueue" ADD CONSTRAINT "TransportQueue_emergencyDepartmentId_fkey" FOREIGN KEY ("emergencyDepartmentId") REFERENCES "public"."EmergencyDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportQueue" ADD CONSTRAINT "TransportQueue_transportRequestId_fkey" FOREIGN KEY ("transportRequestId") REFERENCES "public"."TransportRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportQueue" ADD CONSTRAINT "TransportQueue_assignedProviderId_fkey" FOREIGN KEY ("assignedProviderId") REFERENCES "public"."TransportAgency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportQueue" ADD CONSTRAINT "TransportQueue_assignedUnitId_fkey" FOREIGN KEY ("assignedUnitId") REFERENCES "public"."Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CapacityAlert" ADD CONSTRAINT "CapacityAlert_emergencyDepartmentId_fkey" FOREIGN KEY ("emergencyDepartmentId") REFERENCES "public"."EmergencyDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProviderForecast" ADD CONSTRAINT "ProviderForecast_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."TransportAgency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DemandPattern" ADD CONSTRAINT "DemandPattern_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "public"."Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "public"."_AirMedicalResourceToWeatherAlert" ADD CONSTRAINT "_AirMedicalResourceToWeatherAlert_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."AirMedicalResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AirMedicalResourceToWeatherAlert" ADD CONSTRAINT "_AirMedicalResourceToWeatherAlert_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."WeatherAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AirMedicalTransportToWeatherAlert" ADD CONSTRAINT "_AirMedicalTransportToWeatherAlert_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."AirMedicalTransport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AirMedicalTransportToWeatherAlert" ADD CONSTRAINT "_AirMedicalTransportToWeatherAlert_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."WeatherAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;
