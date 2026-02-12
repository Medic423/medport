-- Fix: Add acceptsNotifications column if it's missing
-- Run this in pgAdmin connected to traccems-dev database (dev-swa)

-- Step 1: Add the column (safe to run even if it exists)
ALTER TABLE "ems_agencies"
ADD COLUMN IF NOT EXISTS "acceptsNotifications" BOOLEAN NOT NULL DEFAULT true;

-- Step 2: Verify it was added
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ems_agencies'
  AND column_name = 'acceptsNotifications';

-- Step 3: Check existing data (should all be true by default)
SELECT 
    id, 
    name, 
    "acceptsNotifications"
FROM ems_agencies
LIMIT 10;

-- After running this:
-- 1. Restart Azure App Service (TraccEms-Dev-Backend)
-- 2. Test login on dev-swa
-- 3. Test SMS notifications checkbox
