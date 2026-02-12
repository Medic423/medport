-- Check lastLogin values for the specific users that just logged in
-- This will help us verify if the updates are working

-- Check admin@tcc.com (center_users)
SELECT 
    'center_users' as table_name,
    id,
    email,
    name,
    "lastLogin",
    isActive,
    isDeleted,
    CASE 
        WHEN "lastLogin" IS NULL THEN 'NULL (never logged in)'
        WHEN "lastLogin" > NOW() - INTERVAL '1 hour' THEN 'Recent (last hour)'
        WHEN "lastLogin" > NOW() - INTERVAL '1 day' THEN 'Today'
        WHEN "lastLogin" > NOW() - INTERVAL '7 days' THEN 'This week'
        ELSE 'Older'
    END as login_status
FROM center_users
WHERE email = 'admin@tcc.com'

UNION ALL

-- Check chuck@chuckambulance.com (ems_users)
SELECT 
    'ems_users' as table_name,
    id,
    email,
    name,
    "lastLogin",
    isActive,
    isDeleted,
    CASE 
        WHEN "lastLogin" IS NULL THEN 'NULL (never logged in)'
        WHEN "lastLogin" > NOW() - INTERVAL '1 hour' THEN 'Recent (last hour)'
        WHEN "lastLogin" > NOW() - INTERVAL '1 day' THEN 'Today'
        WHEN "lastLogin" > NOW() - INTERVAL '7 days' THEN 'This week'
        ELSE 'Older'
    END as login_status
FROM ems_users
WHERE email = 'chuck@chuckambulance.com'

UNION ALL

-- Check chuck@ferrellhospitals.com (healthcare_users)
SELECT 
    'healthcare_users' as table_name,
    id,
    email,
    name,
    "lastLogin",
    isActive,
    isDeleted,
    CASE 
        WHEN "lastLogin" IS NULL THEN 'NULL (never logged in)'
        WHEN "lastLogin" > NOW() - INTERVAL '1 hour' THEN 'Recent (last hour)'
        WHEN "lastLogin" > NOW() - INTERVAL '1 day' THEN 'Today'
        WHEN "lastLogin" > NOW() - INTERVAL '7 days' THEN 'This week'
        ELSE 'Older'
    END as login_status
FROM healthcare_users
WHERE email = 'chuck@ferrellhospitals.com';

-- Also check the idle account query logic
-- This should show how many accounts are idle (should exclude the 3 we just logged in with)
SELECT 
    'Idle Accounts (30 days)' as period,
    COUNT(*) FILTER (WHERE table_name = 'healthcare_users') as healthcare,
    COUNT(*) FILTER (WHERE table_name = 'ems_users') as ems,
    COUNT(*) FILTER (WHERE table_name = 'center_users') as admin,
    COUNT(*) as total
FROM (
    SELECT 'healthcare_users' as table_name, id, "lastLogin", isActive, isDeleted
    FROM healthcare_users
    WHERE isActive = true AND isDeleted = false
    AND ("lastLogin" IS NULL OR "lastLogin" < NOW() - INTERVAL '30 days')
    
    UNION ALL
    
    SELECT 'ems_users' as table_name, id, "lastLogin", isActive, isDeleted
    FROM ems_users
    WHERE isActive = true AND isDeleted = false
    AND ("lastLogin" IS NULL OR "lastLogin" < NOW() - INTERVAL '30 days')
    
    UNION ALL
    
    SELECT 'center_users' as table_name, id, "lastLogin", isActive, isDeleted
    FROM center_users
    WHERE isActive = true AND isDeleted = false
    AND ("lastLogin" IS NULL OR "lastLogin" < NOW() - INTERVAL '30 days')
) idle_accounts;
