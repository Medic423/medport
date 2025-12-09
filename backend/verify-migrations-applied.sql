-- Verify Migrations Were Applied Successfully
-- Run this in pgAdmin to check if columns exist

-- Check user deletion fields
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('center_users', 'healthcare_users', 'ems_users')
  AND column_name IN ('deletedAt', 'isDeleted')
ORDER BY table_name, column_name;

-- Expected: 6 rows
-- center_users: deletedAt, isDeleted
-- healthcare_users: deletedAt, isDeleted  
-- ems_users: deletedAt, isDeleted

-- Check availability status field
SELECT 
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'ems_agencies'
  AND column_name = 'availabilityStatus';

-- Expected: 1 row
-- ems_agencies: availabilityStatus (jsonb)

-- Summary check
SELECT 
    'User Deletion Fields' as migration_type,
    COUNT(*) as columns_found,
    CASE 
        WHEN COUNT(*) = 6 THEN '✅ All columns exist'
        ELSE '❌ Missing columns'
    END as status
FROM information_schema.columns
WHERE table_name IN ('center_users', 'healthcare_users', 'ems_users')
  AND column_name IN ('deletedAt', 'isDeleted')

UNION ALL

SELECT 
    'Availability Status' as migration_type,
    COUNT(*) as columns_found,
    CASE 
        WHEN COUNT(*) = 1 THEN '✅ Column exists'
        ELSE '❌ Column missing'
    END as status
FROM information_schema.columns
WHERE table_name = 'ems_agencies'
  AND column_name = 'availabilityStatus';

