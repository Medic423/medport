-- Check lastLogin values RIGHT NOW after recent logins
-- Run this immediately after logging in to see if values were updated

SELECT 
    'center_users' as table_name,
    email,
    name,
    "lastLogin",
    CASE 
        WHEN "lastLogin" IS NULL THEN '❌ NULL - NOT UPDATED'
        WHEN "lastLogin" > NOW() - INTERVAL '5 minutes' THEN '✅ RECENT (last 5 min)'
        WHEN "lastLogin" > NOW() - INTERVAL '1 hour' THEN '✅ TODAY (last hour)'
        ELSE '⚠️ OLDER'
    END as status,
    NOW() - "lastLogin" as time_ago
FROM center_users
WHERE email = 'admin@tcc.com'

UNION ALL

SELECT 
    'ems_users' as table_name,
    email,
    name,
    "lastLogin",
    CASE 
        WHEN "lastLogin" IS NULL THEN '❌ NULL - NOT UPDATED'
        WHEN "lastLogin" > NOW() - INTERVAL '5 minutes' THEN '✅ RECENT (last 5 min)'
        WHEN "lastLogin" > NOW() - INTERVAL '1 hour' THEN '✅ TODAY (last hour)'
        ELSE '⚠️ OLDER'
    END as status,
    NOW() - "lastLogin" as time_ago
FROM ems_users
WHERE email = 'chuck@chuckambulance.com'

UNION ALL

SELECT 
    'healthcare_users' as table_name,
    email,
    name,
    "lastLogin",
    CASE 
        WHEN "lastLogin" IS NULL THEN '❌ NULL - NOT UPDATED'
        WHEN "lastLogin" > NOW() - INTERVAL '5 minutes' THEN '✅ RECENT (last 5 min)'
        WHEN "lastLogin" > NOW() - INTERVAL '1 hour' THEN '✅ TODAY (last hour)'
        ELSE '⚠️ OLDER'
    END as status,
    NOW() - "lastLogin" as time_ago
FROM healthcare_users
WHERE email = 'chuck@ferrellhospitals.com'

ORDER BY table_name;
