-- Migration script to create pickup_locations table in production
-- This script is idempotent - it can be run multiple times safely

-- Create pickup_locations table if it doesn't exist
CREATE TABLE IF NOT EXISTS "pickup_locations" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "floor" TEXT,
    "room" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pickup_locations_pkey" PRIMARY KEY ("id")
);

-- Add trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_pickup_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pickup_locations_updated_at_trigger ON "pickup_locations";
CREATE TRIGGER update_pickup_locations_updated_at_trigger
    BEFORE UPDATE ON "pickup_locations"
    FOR EACH ROW
    EXECUTE FUNCTION update_pickup_locations_updated_at();

