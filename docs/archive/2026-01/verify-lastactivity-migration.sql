-- Verification Queries for lastActivity Migration
-- Run these in pgAdmin to verify the migration was applied correctly
-- Database: traccems-dev-pgsql (dev-swa database)

-- ============================================
-- 1. Check if lastActivity column exists in all three tables
-- ============================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('center_users', 'ems_users', 'healthcare_users')
  AND column_name = 'lastActivity'
ORDER BY table_name;

-- Expected Result: 3 rows
-- - center_users | lastActivity | timestamp without time zone | YES | NULL
-- - ems_users | lastActivity | timestamp without time zone | YES | NULL
-- - healthcare_users | lastActivity | timestamp without time zone | YES | NULL

-- ============================================
-- 2. Verify indexes were created
-- ============================================
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('center_users', 'ems_users', 'healthcare_users')
  AND indexname LIKE '%lastActivity%'
ORDER BY tablename, indexname;

-- Expected Result: 3 indexes
-- - center_users | center_users_lastActivity_idx | CREATE INDEX ...
-- - ems_users | ems_users_lastActivity_idx | CREATE INDEX ...
-- - healthcare_users | healthcare_users_lastActivity_idx | CREATE INDEX ...

-- ============================================
-- 3. Check if lastActivity was initialized from lastLogin
-- ============================================
-- This shows how many users have lastActivity set (should match users with lastLogin)
SELECT 
    'center_users' as table_name,
    COUNT(*) as total_users,
    COUNT("lastLogin") as users_with_lastLogin,
    COUNT("lastActivity") as users_with_lastActivity,
    COUNT(CASE WHEN "lastActivity" IS NOT NULL AND "lastLogin" IS NOT NULL THEN 1 END) as users_with_both
FROM center_users
UNION ALL
SELECT 
    'ems_users' as table_name,
    COUNT(*) as total_users,
    COUNT("lastLogin") as users_with_lastLogin,
    COUNT("lastActivity") as users_with_lastActivity,
    COUNT(CASE WHEN "lastActivity" IS NOT NULL AND "lastLogin" IS NOT NULL THEN 1 END) as users_with_both
FROM ems_users
UNION ALL
SELECT 
    'healthcare_users' as table_name,
    COUNT(*) as total_users,
    COUNT("lastLogin") as users_with_lastLogin,
    COUNT("lastActivity") as users_with_lastActivity,
    COUNT(CASE WHEN "lastActivity" IS NOT NULL AND "lastLogin" IS NOT NULL THEN 1 END) as users_with_both
FROM healthcare_users;

-- Expected: users_with_lastActivity should match users_with_lastLogin (if migration ran correctly)

-- ============================================
-- 4. Check Prisma migrations table
-- ============================================
SELECT 
    migration_name,
    finished_at,
    applied_steps_count
FROM _prisma_migrations
WHERE migration_name LIKE '%lastActivity%' OR migration_name LIKE '%lastactivity%'
ORDER BY finished_at DESC;

-- Note: If migration was applied manually (not via Prisma migrate), this might be empty
-- That's OK - the important thing is that the columns exist (check #1)

-- ============================================
-- 5. Verify column constraints and types match Prisma schema
-- ============================================
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
  AND t.table_name IN ('center_users', 'ems_users', 'healthcare_users')
  AND c.column_name IN ('lastActivity', 'lastLogin')
ORDER BY t.table_name, c.column_name;

-- Expected: Both lastActivity and lastLogin should have:
-- - data_type: timestamp without time zone
-- - is_nullable: YES
-- - column_default: NULL

-- ============================================
-- 6. Sample data check (verify some users have lastActivity)
-- ============================================
-- Check a few sample records
SELECT 
    'center_users' as table_name,
    id,
    email,
    "lastLogin",
    "lastActivity",
    CASE 
        WHEN "lastActivity" IS NOT NULL THEN '✅ Has lastActivity'
        WHEN "lastLogin" IS NOT NULL THEN '⚠️ Has lastLogin but no lastActivity'
        ELSE '❌ No activity data'
    END as status
FROM center_users
WHERE "lastLogin" IS NOT NULL OR "lastActivity" IS NOT NULL
LIMIT 5;

-- ============================================
-- 7. Check for any NULL lastActivity where lastLogin exists (migration issue)
-- ============================================
SELECT 
    'center_users' as table_name,
    COUNT(*) as count_missing_lastActivity
FROM center_users
WHERE "lastLogin" IS NOT NULL AND "lastActivity" IS NULL
UNION ALL
SELECT 
    'ems_users' as table_name,
    COUNT(*) as count_missing_lastActivity
FROM ems_users
WHERE "lastLogin" IS NOT NULL AND "lastActivity" IS NULL
UNION ALL
SELECT 
    'healthcare_users' as table_name,
    COUNT(*) as count_missing_lastActivity
FROM healthcare_users
WHERE "lastLogin" IS NOT NULL AND "lastActivity" IS NULL;

-- Expected: Should be 0 for all tables (if migration UPDATE statement ran correctly)

-- ============================================
-- SUMMARY CHECKLIST
-- ============================================
-- ✅ Column exists in all 3 tables (Query #1 returns 3 rows)
-- ✅ Indexes created (Query #2 returns 3 indexes)
-- ✅ Data types match (timestamp without time zone, nullable)
-- ✅ lastActivity initialized from lastLogin (Query #3 shows matching counts)
-- ✅ No missing lastActivity where lastLogin exists (Query #7 returns 0)
