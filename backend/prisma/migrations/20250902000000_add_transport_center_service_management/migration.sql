-- Add Transport Center service management fields to TransportAgency table
-- Migration: 20250902000000_add_transport_center_service_management

-- Create ServiceStatus enum
CREATE TYPE "public"."ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- Add new fields to TransportAgency table
ALTER TABLE "public"."TransportAgency" 
ADD COLUMN "addedBy" TEXT,
ADD COLUMN "status" "public"."ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "addedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Create index for status field for better query performance
CREATE INDEX "TransportAgency_status_idx" ON "public"."TransportAgency"("status");

-- Create index for addedBy field for Transport Center queries
CREATE INDEX "TransportAgency_addedBy_idx" ON "public"."TransportAgency"("addedBy");

-- Create index for addedAt field for chronological queries
CREATE INDEX "TransportAgency_addedAt_idx" ON "public"."TransportAgency"("addedAt");

-- Add foreign key constraint for addedBy field (references User table)
ALTER TABLE "public"."TransportAgency" 
ADD CONSTRAINT "TransportAgency_addedBy_fkey" 
FOREIGN KEY ("addedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update existing records to have ACTIVE status
UPDATE "public"."TransportAgency" 
SET "status" = 'ACTIVE', "addedAt" = "createdAt" 
WHERE "status" IS NULL;
