-- Quick Verification: Check if lastLogin columns exist
-- Run this after the migration to verify success

-- Check 1: Verify columns exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('healthcare_users', 'ems_users', 'center_users')
AND column_name = 'lastLogin'
ORDER BY table_name;

-- Expected: Should return 3 rows showing the lastLogin column in each table

-- Check 2: Verify indexes exist
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE tablename IN ('healthcare_users', 'ems_users', 'center_users')
AND indexname LIKE '%lastLogin%'
ORDER BY tablename;

-- Expected: Should return 3 rows showing indexes on lastLogin

-- Check 3: Sample data - show a few users with their lastLogin status
SELECT 
    'healthcare_users' as table_name,
    id,
    email,
    name,
    "lastLogin",
    isActive,
    isDeleted
FROM healthcare_users
WHERE isActive = true AND isDeleted = false
LIMIT 5

UNION ALL

SELECT 
    'ems_users' as table_name,
    id,
    email,
    name,
    "lastLogin",
    isActive,
    isDeleted
FROM ems_users
WHERE isActive = true AND isDeleted = false
LIMIT 5

UNION ALL

SELECT 
    'center_users' as table_name,
    id,
    email,
    name,
    "lastLogin",
    isActive,
    isDeleted
FROM center_users
WHERE isActive = true AND isDeleted = false
LIMIT 5;

-- Expected: Should show users with NULL lastLogin (will be populated on next login)
