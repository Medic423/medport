-- Check what tables exist in the database
-- This will help us verify the actual table names

-- Check 1: List all tables in the public schema
SELECT 
    table_schema,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check 2: Specifically look for user-related tables (case-insensitive search)
SELECT 
    table_schema,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND (
    LOWER(table_name) LIKE '%user%' 
    OR LOWER(table_name) LIKE '%healthcare%'
    OR LOWER(table_name) LIKE '%ems%'
    OR LOWER(table_name) LIKE '%center%'
)
ORDER BY table_name;

-- Check 3: Check if the tables exist with exact names (case-sensitive)
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('healthcare_users', 'ems_users', 'center_users')
ORDER BY table_name;
