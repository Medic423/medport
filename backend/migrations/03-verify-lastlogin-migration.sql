-- Verification Script: Verify lastLogin Migration
-- Date: January 20, 2026
-- Purpose: Verify that lastLogin columns and indexes were created successfully

-- 1. Verify columns were added
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('healthcare_users', 'ems_users', 'center_users')
AND column_name = 'lastLogin'
ORDER BY table_name;

-- Expected output: 3 rows (one for each table)

-- 2. Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE tablename IN ('healthcare_users', 'ems_users', 'center_users')
AND indexname LIKE '%lastLogin%'
ORDER BY tablename, indexname;

-- Expected output: 3 rows (one index for each table)

-- 3. Check current lastLogin values (should all be NULL initially)
SELECT 
    'healthcare_users' as table_name,
    COUNT(*) as total_users,
    COUNT("lastLogin") as users_with_lastlogin,
    COUNT(*) - COUNT("lastLogin") as users_without_lastlogin
FROM healthcare_users
WHERE isActive = true AND isDeleted = false

UNION ALL

SELECT 
    'ems_users' as table_name,
    COUNT(*) as total_users,
    COUNT("lastLogin") as users_with_lastlogin,
    COUNT(*) - COUNT("lastLogin") as users_without_lastlogin
FROM ems_users
WHERE isActive = true AND isDeleted = false

UNION ALL

SELECT 
    'center_users' as table_name,
    COUNT(*) as total_users,
    COUNT("lastLogin") as users_with_lastlogin,
    COUNT(*) - COUNT("lastLogin") as users_without_lastlogin
FROM center_users
WHERE isActive = true AND isDeleted = false

ORDER BY table_name;

-- Expected: All users should have NULL lastLogin initially (users_with_lastlogin = 0)
