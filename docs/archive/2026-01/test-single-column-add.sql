-- Test adding a single column to verify DO block works
-- Run this in pgAdmin to test

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'originLatitude') THEN
        ALTER TABLE "trips" ADD COLUMN "originLatitude" DOUBLE PRECISION;
        RAISE NOTICE 'Column originLatitude added successfully';
    ELSE
        RAISE NOTICE 'Column originLatitude already exists';
    END IF;
END $$;

-- Verify
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'trips'
AND column_name = 'originLatitude';

