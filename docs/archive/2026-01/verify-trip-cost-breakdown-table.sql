-- Verify trip_cost_breakdowns table exists and check its structure
-- Run these queries in pgAdmin to verify the table was created correctly

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'trip_cost_breakdowns'
) AS table_exists;

-- 2. List all columns in the table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'trip_cost_breakdowns'
ORDER BY ordinal_position;

-- 3. Count columns (should be 29)
SELECT COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'trip_cost_breakdowns';

-- 4. Check primary key constraint
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public' 
AND table_name = 'trip_cost_breakdowns'
AND constraint_type = 'PRIMARY KEY';

-- 5. Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
AND tablename = 'trip_cost_breakdowns';

