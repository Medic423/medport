-- AlterTable
ALTER TABLE "healthcare_locations" ADD COLUMN     "hospitalId" TEXT;

-- CreateIndex
CREATE INDEX "healthcare_locations_hospitalId_idx" ON "healthcare_locations"("hospitalId");

-- AddForeignKey
ALTER TABLE "healthcare_locations" ADD CONSTRAINT "healthcare_locations_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_locations" ADD CONSTRAINT "pickup_locations_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
