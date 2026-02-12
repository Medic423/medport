-- Quick check: Does acceptsNotifications column exist in dev-swa database?
-- Run this in pgAdmin connected to traccems-dev database

-- Check if column exists
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ems_agencies'
  AND column_name = 'acceptsNotifications';

-- If the above returns 0 rows, the column is MISSING
-- If it returns 1 row, the column EXISTS

-- Also check the table structure
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ems_agencies'
ORDER BY ordinal_position;
