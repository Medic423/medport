-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'COORDINATOR', 'BILLING_STAFF', 'TRANSPORT_AGENCY');

-- CreateEnum
CREATE TYPE "public"."FacilityType" AS ENUM ('HOSPITAL', 'NURSING_HOME', 'CANCER_CENTER', 'REHAB_FACILITY', 'URGENT_CARE', 'SPECIALTY_CLINIC');

-- CreateEnum
CREATE TYPE "public"."TransportLevel" AS ENUM ('BLS', 'ALS', 'CCT');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."UnitStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'OUT_OF_SERVICE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."RouteType" AS ENUM ('FASTEST', 'SHORTEST', 'MOST_EFFICIENT', 'LOWEST_COST', 'SCENIC');

-- CreateEnum
CREATE TYPE "public"."RouteStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OPTIMIZED', 'SUGGESTED');

-- CreateEnum
CREATE TYPE "public"."RouteOptimizationType" AS ENUM ('CHAINED_TRIPS', 'RETURN_TRIP', 'MULTI_STOP', 'GEOGRAPHIC', 'TEMPORAL', 'REVENUE_MAX');

-- CreateEnum
CREATE TYPE "public"."StopType" AS ENUM ('PICKUP', 'DROPOFF', 'REFUEL', 'REST', 'EQUIPMENT', 'TRANSFER');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'COORDINATOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Facility" (
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

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransportRequest" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "originFacilityId" TEXT NOT NULL,
    "destinationFacilityId" TEXT NOT NULL,
    "transportLevel" "public"."TransportLevel" NOT NULL,
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "specialRequirements" TEXT,
    "requestTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

    CONSTRAINT "TransportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransportAgency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "serviceArea" JSONB,
    "operatingHours" JSONB,
    "capabilities" JSONB,
    "pricingStructure" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportAgency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Unit" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "type" "public"."TransportLevel" NOT NULL,
    "capabilities" JSONB,
    "currentStatus" "public"."UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "currentLocation" JSONB,
    "shiftStart" TIMESTAMP(3),
    "shiftEnd" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DistanceMatrix" (
    "id" TEXT NOT NULL,
    "fromFacilityId" TEXT NOT NULL,
    "toFacilityId" TEXT NOT NULL,
    "distanceMiles" DOUBLE PRECISION NOT NULL,
    "estimatedTimeMinutes" INTEGER NOT NULL,
    "trafficFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "tolls" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "fuelEfficiency" DOUBLE PRECISION,
    "routeType" "public"."RouteType" NOT NULL DEFAULT 'FASTEST',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DistanceMatrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Route" (
    "id" TEXT NOT NULL,
    "routeNumber" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "assignedUnitId" TEXT,
    "status" "public"."RouteStatus" NOT NULL DEFAULT 'PLANNED',
    "totalDistanceMiles" DOUBLE PRECISION NOT NULL,
    "estimatedTimeMinutes" INTEGER NOT NULL,
    "emptyMilesReduction" DOUBLE PRECISION,
    "revenueOptimizationScore" DOUBLE PRECISION,
    "chainedTripCount" INTEGER NOT NULL DEFAULT 0,
    "estimatedRevenue" DOUBLE PRECISION,
    "plannedStartTime" TIMESTAMP(3),
    "actualStartTime" TIMESTAMP(3),
    "completionTime" TIMESTAMP(3),
    "timeWindowStart" TIMESTAMP(3),
    "timeWindowEnd" TIMESTAMP(3),
    "optimizationType" "public"."RouteOptimizationType",
    "milesSaved" DOUBLE PRECISION,
    "unitsSaved" INTEGER,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RouteStop" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "stopOrder" INTEGER NOT NULL,
    "facilityId" TEXT NOT NULL,
    "transportRequestId" TEXT,
    "stopType" "public"."StopType" NOT NULL,
    "estimatedArrival" TIMESTAMP(3),
    "actualArrival" TIMESTAMP(3),
    "estimatedDeparture" TIMESTAMP(3),
    "actualDeparture" TIMESTAMP(3),
    "stopDuration" INTEGER,
    "notes" TEXT,

    CONSTRAINT "RouteStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_RouteToTransportRequest" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RouteToTransportRequest_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DistanceMatrix_fromFacilityId_toFacilityId_key" ON "public"."DistanceMatrix"("fromFacilityId", "toFacilityId");

-- CreateIndex
CREATE UNIQUE INDEX "Route_routeNumber_key" ON "public"."Route"("routeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RouteStop_routeId_stopOrder_key" ON "public"."RouteStop"("routeId", "stopOrder");

-- CreateIndex
CREATE INDEX "_RouteToTransportRequest_B_index" ON "public"."_RouteToTransportRequest"("B");

-- AddForeignKey
ALTER TABLE "public"."TransportRequest" ADD CONSTRAINT "TransportRequest_originFacilityId_fkey" FOREIGN KEY ("originFacilityId") REFERENCES "public"."Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportRequest" ADD CONSTRAINT "TransportRequest_destinationFacilityId_fkey" FOREIGN KEY ("destinationFacilityId") REFERENCES "public"."Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportRequest" ADD CONSTRAINT "TransportRequest_assignedAgencyId_fkey" FOREIGN KEY ("assignedAgencyId") REFERENCES "public"."TransportAgency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportRequest" ADD CONSTRAINT "TransportRequest_assignedUnitId_fkey" FOREIGN KEY ("assignedUnitId") REFERENCES "public"."Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportRequest" ADD CONSTRAINT "TransportRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Unit" ADD CONSTRAINT "Unit_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."TransportAgency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DistanceMatrix" ADD CONSTRAINT "DistanceMatrix_fromFacilityId_fkey" FOREIGN KEY ("fromFacilityId") REFERENCES "public"."Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DistanceMatrix" ADD CONSTRAINT "DistanceMatrix_toFacilityId_fkey" FOREIGN KEY ("toFacilityId") REFERENCES "public"."Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Route" ADD CONSTRAINT "Route_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."TransportAgency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Route" ADD CONSTRAINT "Route_assignedUnitId_fkey" FOREIGN KEY ("assignedUnitId") REFERENCES "public"."Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Route" ADD CONSTRAINT "Route_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RouteStop" ADD CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "public"."Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RouteStop" ADD CONSTRAINT "RouteStop_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "public"."Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RouteStop" ADD CONSTRAINT "RouteStop_transportRequestId_fkey" FOREIGN KEY ("transportRequestId") REFERENCES "public"."TransportRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RouteToTransportRequest" ADD CONSTRAINT "_RouteToTransportRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RouteToTransportRequest" ADD CONSTRAINT "_RouteToTransportRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."TransportRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
