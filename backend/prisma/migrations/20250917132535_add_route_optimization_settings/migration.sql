-- CreateTable
CREATE TABLE "route_optimization_settings" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "deadheadMileWeight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "waitTimeWeight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "backhaulBonusWeight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "overtimeRiskWeight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "revenueWeight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "maxDeadheadMiles" DECIMAL(6,2) NOT NULL DEFAULT 50.0,
    "maxWaitTimeMinutes" INTEGER NOT NULL DEFAULT 30,
    "maxOvertimeHours" DECIMAL(4,2) NOT NULL DEFAULT 4.0,
    "maxResponseTimeMinutes" INTEGER NOT NULL DEFAULT 15,
    "maxServiceDistance" DECIMAL(6,2) NOT NULL DEFAULT 100.0,
    "backhaulTimeWindow" INTEGER NOT NULL DEFAULT 60,
    "backhaulDistanceLimit" DECIMAL(6,2) NOT NULL DEFAULT 25.0,
    "backhaulRevenueBonus" DECIMAL(8,2) NOT NULL DEFAULT 50.0,
    "enableBackhaulOptimization" BOOLEAN NOT NULL DEFAULT true,
    "targetLoadedMileRatio" DECIMAL(3,2) NOT NULL DEFAULT 0.75,
    "targetRevenuePerHour" DECIMAL(8,2) NOT NULL DEFAULT 200.0,
    "targetResponseTime" INTEGER NOT NULL DEFAULT 12,
    "targetEfficiency" DECIMAL(3,2) NOT NULL DEFAULT 0.85,
    "optimizationAlgorithm" TEXT NOT NULL DEFAULT 'HYBRID',
    "maxOptimizationTime" INTEGER NOT NULL DEFAULT 30,
    "enableRealTimeOptimization" BOOLEAN NOT NULL DEFAULT true,
    "crewAvailabilityWeight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "equipmentCompatibilityWeight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "patientPriorityWeight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_optimization_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "route_optimization_settings_agencyId_idx" ON "route_optimization_settings"("agencyId");

-- CreateIndex
CREATE INDEX "route_optimization_settings_isActive_idx" ON "route_optimization_settings"("isActive");
