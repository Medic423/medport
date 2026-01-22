-- ============================================
-- Production Database Verification Queries
-- Database: traccems-prod-pgsql (TracEms Production)
-- Purpose: Verify lastActivity migration is complete and database is ready
-- Date: January 21, 2026
-- ============================================

-- ============================================
-- 1. VERIFY COLUMNS EXIST (CRITICAL CHECK)
-- ============================================
-- This confirms the lastActivity column exists in all three user tables
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

-- ✅ EXPECTED RESULT: 3 rows
--    - center_users | lastActivity | timestamp without time zone | YES | NULL
--    - ems_users | lastActivity | timestamp without time zone | YES | NULL
--    - healthcare_users | lastActivity | timestamp without time zone | YES | NULL

-- ============================================
-- 2. VERIFY INDEXES EXIST (PERFORMANCE CHECK)
-- ============================================
-- This confirms indexes were created for query performance
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('center_users', 'ems_users', 'healthcare_users')
  AND indexname LIKE '%lastActivity%'
ORDER BY tablename, indexname;

-- ✅ EXPECTED RESULT: 3 indexes
--    - center_users | center_users_lastActivity_idx
--    - ems_users | ems_users_lastActivity_idx
--    - healthcare_users | healthcare_users_lastActivity_idx

-- ============================================
-- 3. VERIFY DATA TYPES MATCH PRISMA SCHEMA
-- ============================================
-- This ensures column types match what Prisma expects
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
  AND t.table_name IN ('center_users', 'ems_users', 'healthcare_users')
  AND c.column_name IN ('lastActivity', 'lastLogin')
ORDER BY t.table_name, c.column_name;

-- ✅ EXPECTED RESULT: 6 rows (3 tables × 2 columns)
--    Both lastActivity and lastLogin should be:
--    - data_type: timestamp without time zone
--    - is_nullable: YES
--    - column_default: NULL

-- ============================================
-- 4. CHECK USER COUNTS AND DATA INITIALIZATION
-- ============================================
-- This shows how many users have lastActivity set
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

-- ✅ EXPECTED: users_with_lastActivity should match users_with_lastLogin
--    (if migration UPDATE statements ran correctly)

-- ============================================
-- 5. CHECK FOR MIGRATION ISSUES
-- ============================================
-- This identifies any users with lastLogin but missing lastActivity
-- (should be 0 if migration ran correctly)
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

-- ✅ EXPECTED RESULT: All counts should be 0
--    If any count > 0, run the UPDATE statements from the migration again

-- ============================================
-- 6. SAMPLE DATA CHECK
-- ============================================
-- View a few sample records to verify data looks correct
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
ORDER BY "lastActivity" DESC NULLS LAST, "lastLogin" DESC NULLS LAST
LIMIT 5;

-- ============================================
-- 7. QUICK READINESS CHECK (ALL-IN-ONE)
-- ============================================
-- Run this single query to get a quick overview
SELECT 
    'Columns' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ PASS'
        ELSE '❌ FAIL - Expected 3 columns'
    END as status
FROM information_schema.columns
WHERE table_name IN ('center_users', 'ems_users', 'healthcare_users')
  AND column_name = 'lastActivity'
UNION ALL
SELECT 
    'Indexes' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ PASS'
        ELSE '❌ FAIL - Expected 3 indexes'
    END as status
FROM pg_indexes
WHERE tablename IN ('center_users', 'ems_users', 'healthcare_users')
  AND indexname LIKE '%lastActivity%'
UNION ALL
SELECT 
    'Data Issues' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS'
        ELSE '❌ FAIL - Found users with lastLogin but no lastActivity'
    END as status
FROM (
    SELECT 1 FROM center_users WHERE "lastLogin" IS NOT NULL AND "lastActivity" IS NULL
    UNION ALL
    SELECT 1 FROM ems_users WHERE "lastLogin" IS NOT NULL AND "lastActivity" IS NULL
    UNION ALL
    SELECT 1 FROM healthcare_users WHERE "lastLogin" IS NOT NULL AND "lastActivity" IS NULL
) as issues;

-- ✅ EXPECTED RESULT: All 3 checks should show ✅ PASS

-- ============================================
-- SUMMARY CHECKLIST
-- ============================================
-- ✅ Query #1: 3 columns exist (center_users, ems_users, healthcare_users)
-- ✅ Query #2: 3 indexes exist (one per table)
-- ✅ Query #3: Data types match Prisma schema (timestamp without time zone)
-- ✅ Query #4: User counts look reasonable
-- ✅ Query #5: No missing lastActivity (all counts = 0)
-- ✅ Query #7: All checks pass (3 ✅ PASS results)
--
-- If all checks pass, database is READY FOR PRODUCTION DEPLOYMENT ✅
