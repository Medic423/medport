-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "backhaulOpportunity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customerSatisfaction" INTEGER,
ADD COLUMN     "efficiency" DECIMAL(5,2),
ADD COLUMN     "loadedMiles" DECIMAL(10,2),
ADD COLUMN     "performanceScore" DECIMAL(5,2),
ADD COLUMN     "revenuePerHour" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "backhaul_opportunities" (
    "id" TEXT NOT NULL,
    "tripId1" TEXT NOT NULL,
    "tripId2" TEXT NOT NULL,
    "revenueBonus" DECIMAL(10,2),
    "efficiency" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "backhaul_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_analytics" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "performanceScore" DECIMAL(5,2),
    "efficiency" DECIMAL(5,2),
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" DECIMAL(5,2),
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_analytics_pkey" PRIMARY KEY ("id")
);
