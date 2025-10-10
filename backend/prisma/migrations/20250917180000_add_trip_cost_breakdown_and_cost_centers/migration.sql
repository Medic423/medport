-- CreateTable
CREATE TABLE "trip_cost_breakdowns" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "baseRevenue" DECIMAL(10,2) NOT NULL,
    "mileageRevenue" DECIMAL(10,2) NOT NULL,
    "priorityRevenue" DECIMAL(10,2) NOT NULL,
    "specialRequirementsRevenue" DECIMAL(10,2) NOT NULL,
    "insuranceAdjustment" DECIMAL(10,2) NOT NULL,
    "totalRevenue" DECIMAL(10,2) NOT NULL,
    "crewLaborCost" DECIMAL(10,2) NOT NULL,
    "vehicleCost" DECIMAL(10,2) NOT NULL,
    "fuelCost" DECIMAL(10,2) NOT NULL,
    "maintenanceCost" DECIMAL(10,2) NOT NULL,
    "overheadCost" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "grossProfit" DECIMAL(10,2) NOT NULL,
    "profitMargin" DECIMAL(5,2) NOT NULL,
    "revenuePerMile" DECIMAL(8,2) NOT NULL,
    "costPerMile" DECIMAL(8,2) NOT NULL,
    "loadedMileRatio" DECIMAL(3,2) NOT NULL,
    "deadheadMileRatio" DECIMAL(3,2) NOT NULL,
    "utilizationRate" DECIMAL(3,2) NOT NULL,
    "tripDistance" DECIMAL(6,2) NOT NULL,
    "loadedMiles" DECIMAL(6,2) NOT NULL,
    "deadheadMiles" DECIMAL(6,2) NOT NULL,
    "tripDurationHours" DECIMAL(4,2) NOT NULL,
    "transportLevel" TEXT NOT NULL,
    "priorityLevel" TEXT NOT NULL,
    "costCenterId" TEXT,
    "costCenterName" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_cost_breakdowns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "overheadRate" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "fixedCosts" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    "variableCosts" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    "allocationMethod" TEXT NOT NULL DEFAULT 'TRIP_COUNT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_code_key" ON "cost_centers"("code");
