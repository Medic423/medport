-- Verify that indexes were created successfully
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('healthcare_users', 'ems_users', 'center_users')
AND indexname LIKE '%lastLogin%'
ORDER BY tablename;

-- Expected: Should return 3 rows showing the indexes on lastLogin columns
