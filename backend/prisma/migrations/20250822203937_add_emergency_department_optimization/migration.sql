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

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyDepartment_facilityId_key" ON "public"."EmergencyDepartment"("facilityId");

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
