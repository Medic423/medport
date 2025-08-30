-- AlterTable
ALTER TABLE "public"."TransportRequest" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "estimatedArrivalTime" TIMESTAMP(3),
ADD COLUMN     "estimatedPickupTime" TIMESTAMP(3),
ADD COLUMN     "etaUpdates" JSONB;
