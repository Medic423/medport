-- Check all users to see which ones have lastLogin set
-- This will help us understand the pattern

-- Check center_users (admin)
SELECT 
    'center_users' as table_name,
    email,
    name,
    "lastLogin",
    isActive,
    isDeleted
FROM center_users
WHERE email LIKE '%admin%' OR email LIKE '%tcc%'
ORDER BY email;

-- Check ems_users
SELECT 
    'ems_users' as table_name,
    email,
    name,
    "lastLogin",
    isActive,
    isDeleted
FROM ems_users
WHERE email LIKE '%chuck%' OR email LIKE '%ambulance%'
ORDER BY email;

-- Check healthcare_users
SELECT 
    'healthcare_users' as table_name,
    email,
    name,
    "lastLogin",
    isActive,
    isDeleted
FROM healthcare_users
WHERE email LIKE '%chuck%' OR email LIKE '%ferrell%'
ORDER BY email;
