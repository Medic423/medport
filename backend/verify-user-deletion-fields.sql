-- Verify User Deletion Fields Exist
-- Run this to check if deletedAt and isDeleted columns exist

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
-- center_users: deletedAt (timestamp), isDeleted (boolean)
-- healthcare_users: deletedAt (timestamp), isDeleted (boolean)
-- ems_users: deletedAt (timestamp), isDeleted (boolean)

-- If you see 6 rows, all columns exist ✅
-- If you see fewer than 6 rows, some columns are missing ❌

