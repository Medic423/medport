-- AlterTable
ALTER TABLE "center_users" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "healthcare_users" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ems_users" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "center_users_isDeleted_idx" ON "center_users"("isDeleted");

-- CreateIndex
CREATE INDEX "healthcare_users_isDeleted_idx" ON "healthcare_users"("isDeleted");

-- CreateIndex
CREATE INDEX "ems_users_isDeleted_idx" ON "ems_users"("isDeleted");

