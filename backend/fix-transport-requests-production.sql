-- Migration script to fix transport_requests table in production
-- Adds missing columns and ensures schema matches Prisma expectations

-- Add healthcareCreatedById column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transport_requests' 
        AND column_name = 'healthcareCreatedById'
    ) THEN
        ALTER TABLE "transport_requests" ADD COLUMN "healthcareCreatedById" TEXT;
        
        -- Add foreign key constraint
        ALTER TABLE "transport_requests" 
        ADD CONSTRAINT "transport_requests_healthcareCreatedById_fkey" 
        FOREIGN KEY ("healthcareCreatedById") 
        REFERENCES "healthcare_users"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
        
        -- Add index for better query performance
        CREATE INDEX IF NOT EXISTS "transport_requests_healthcareCreatedById_idx" 
        ON "transport_requests"("healthcareCreatedById");
        
        RAISE NOTICE 'Added healthcareCreatedById column';
    ELSE
        RAISE NOTICE 'healthcareCreatedById column already exists';
    END IF;
END $$;

-- Add arrivalTimestamp column if it doesn't exist (maps to emsArrivalTime)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transport_requests' 
        AND column_name = 'arrivalTimestamp'
    ) THEN
        -- Use emsArrivalTime as the source if it exists
        ALTER TABLE "transport_requests" ADD COLUMN "arrivalTimestamp" TIMESTAMP(3);
        
        -- Copy data from emsArrivalTime if it exists
        UPDATE "transport_requests" 
        SET "arrivalTimestamp" = "emsArrivalTime" 
        WHERE "emsArrivalTime" IS NOT NULL AND "arrivalTimestamp" IS NULL;
        
        RAISE NOTICE 'Added arrivalTimestamp column';
    ELSE
        RAISE NOTICE 'arrivalTimestamp column already exists';
    END IF;
END $$;

-- Add departureTimestamp column if it doesn't exist (maps to emsDepartureTime)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transport_requests' 
        AND column_name = 'departureTimestamp'
    ) THEN
        -- Use emsDepartureTime as the source if it exists
        ALTER TABLE "transport_requests" ADD COLUMN "departureTimestamp" TIMESTAMP(3);
        
        -- Copy data from emsDepartureTime if it exists
        UPDATE "transport_requests" 
        SET "departureTimestamp" = "emsDepartureTime" 
        WHERE "emsDepartureTime" IS NOT NULL AND "departureTimestamp" IS NULL;
        
        RAISE NOTICE 'Added departureTimestamp column';
    ELSE
        RAISE NOTICE 'departureTimestamp column already exists';
    END IF;
END $$;

-- Add pickupLocationId column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transport_requests' 
        AND column_name = 'pickupLocationId'
    ) THEN
        ALTER TABLE "transport_requests" ADD COLUMN "pickupLocationId" TEXT;
        
        -- Add foreign key constraint
        ALTER TABLE "transport_requests" 
        ADD CONSTRAINT "transport_requests_pickupLocationId_fkey" 
        FOREIGN KEY ("pickupLocationId") 
        REFERENCES "pickup_locations"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
        
        -- Add index for better query performance
        CREATE INDEX IF NOT EXISTS "transport_requests_pickupLocationId_idx" 
        ON "transport_requests"("pickupLocationId");
        
        RAISE NOTICE 'Added pickupLocationId column';
    ELSE
        RAISE NOTICE 'pickupLocationId column already exists';
    END IF;
END $$;

