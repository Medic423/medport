-- Debug: Check if the users exist and their current state
-- This will help us understand why lastLogin isn't being updated

-- Check admin@tcc.com
SELECT 
    'center_users' as table_name,
    id,
    email,
    name,
    "lastLogin",
    isActive,
    isDeleted,
    "createdAt",
    "updatedAt"
FROM center_users
WHERE email = 'admin@tcc.com';

-- Check chuck@chuckambulance.com
SELECT 
    'ems_users' as table_name,
    id,
    email,
    name,
    "lastLogin",
    isActive,
    isDeleted,
    "createdAt",
    "updatedAt"
FROM ems_users
WHERE email = 'chuck@chuckambulance.com';

-- Check chuck@ferrellhospitals.com (this one is working)
SELECT 
    'healthcare_users' as table_name,
    id,
    email,
    name,
    "lastLogin",
    isActive,
    isDeleted,
    "createdAt",
    "updatedAt"
FROM healthcare_users
WHERE email = 'chuck@ferrellhospitals.com';
