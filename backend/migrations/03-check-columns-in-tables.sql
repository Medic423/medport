-- Check the actual columns in each user table
-- This will show us if lastLogin exists or not

-- Check healthcare_users columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'healthcare_users'
ORDER BY ordinal_position;

-- Check ems_users columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'ems_users'
ORDER BY ordinal_position;

-- Check center_users columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'center_users'
ORDER BY ordinal_position;
