-- Test idle account detection logic
-- This verifies that accounts with recent logins are NOT counted as idle

-- Check 30-day idle accounts (should NOT include the 3 users who just logged in)
SELECT 
    '30-day idle' as period,
    'healthcare_users' as table_name,
    COUNT(*) as idle_count
FROM healthcare_users
WHERE isActive = true 
AND isDeleted = false
AND ("lastLogin" IS NULL OR "lastLogin" < NOW() - INTERVAL '30 days')

UNION ALL

SELECT 
    '30-day idle' as period,
    'ems_users' as table_name,
    COUNT(*) as idle_count
FROM ems_users
WHERE isActive = true 
AND isDeleted = false
AND ("lastLogin" IS NULL OR "lastLogin" < NOW() - INTERVAL '30 days')

UNION ALL

SELECT 
    '30-day idle' as period,
    'center_users' as table_name,
    COUNT(*) as idle_count
FROM center_users
WHERE isActive = true 
AND isDeleted = false
AND ("lastLogin" IS NULL OR "lastLogin" < NOW() - INTERVAL '30 days')

ORDER BY table_name;

-- Verify the 3 users who just logged in are NOT in the idle list
SELECT 
    'Verification' as check_type,
    'admin@tcc.com' as email,
    CASE 
        WHEN "lastLogin" IS NULL THEN '❌ Should have lastLogin'
        WHEN "lastLogin" < NOW() - INTERVAL '30 days' THEN '❌ Should NOT be idle'
        ELSE '✅ Correctly excluded from idle'
    END as status
FROM center_users
WHERE email = 'admin@tcc.com'

UNION ALL

SELECT 
    'Verification' as check_type,
    'chuck@chuckambulance.com' as email,
    CASE 
        WHEN "lastLogin" IS NULL THEN '❌ Should have lastLogin'
        WHEN "lastLogin" < NOW() - INTERVAL '30 days' THEN '❌ Should NOT be idle'
        ELSE '✅ Correctly excluded from idle'
    END as status
FROM ems_users
WHERE email = 'chuck@chuckambulance.com'

UNION ALL

SELECT 
    'Verification' as check_type,
    'chuck@ferrellhospitals.com' as email,
    CASE 
        WHEN "lastLogin" IS NULL THEN '❌ Should have lastLogin'
        WHEN "lastLogin" < NOW() - INTERVAL '30 days' THEN '❌ Should NOT be idle'
        ELSE '✅ Correctly excluded from idle'
    END as status
FROM healthcare_users
WHERE email = 'chuck@ferrellhospitals.com';
