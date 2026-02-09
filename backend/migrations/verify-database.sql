-- VERIFICATION QUERIES: Confirm you're in the correct database
-- Run these queries in pgAdmin Query Tool BEFORE running migration scripts

-- ============================================
-- STEP 1: Check Current Database Connection
-- ============================================
SELECT 
    current_database() AS "Current Database",
    current_user AS "Current User",
    version() AS "PostgreSQL Version";

-- Expected: Should show your database name (likely "postgres" or "medport_ems" or "tcc_ems")

-- ============================================
-- STEP 2: Verify This is the TRACC Application Database
-- ============================================
-- Check if key application tables exist
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'healthcare_users',
    'ems_users', 
    'center_users',
    'transport_requests',
    'ems_agencies',
    'hospitals'
  )
ORDER BY table_name;

-- Expected: Should see at least 4-6 of these tables
-- If you see healthcare_users, ems_users, and transport_requests → You're in the RIGHT database ✅
-- If you see 0 tables → Wrong database ❌

-- ============================================
-- STEP 3: Check if Subscription Plans Table Already Exists
-- ============================================
-- This will tell us if migrations have already been run
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'subscription_plans';

-- Expected: 
-- If 0 rows → Table doesn't exist yet, safe to run migrations ✅
-- If 1 row → Table already exists, migrations may have been run (check data)

-- ============================================
-- STEP 4: Check if Subscription Fields Exist on User Tables
-- ============================================
-- Check healthcare_users table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'healthcare_users'
  AND column_name IN ('subscriptionPlanId', 'subscriptionStatus', 'trialStartDate', 'trialEndDate')
ORDER BY column_name;

-- Expected:
-- If 0 rows → Fields don't exist yet, safe to run migrations ✅
-- If 4 rows → Fields already exist, migrations may have been run

-- ============================================
-- STEP 5: Sample Data Check (Optional)
-- ============================================
-- Check if there are any users in the database
SELECT 
    'healthcare_users' as table_name,
    COUNT(*) as user_count
FROM healthcare_users
UNION ALL
SELECT 
    'ems_users' as table_name,
    COUNT(*) as user_count
FROM ems_users;

-- Expected: Should show counts of existing users
-- If you see counts > 0 → This is likely your active database ✅

-- ============================================
-- SUMMARY CHECKLIST
-- ============================================
-- ✅ Current database name matches your DATABASE_URL
-- ✅ Application tables exist (healthcare_users, ems_users, etc.)
-- ✅ subscription_plans table does NOT exist (or exists but empty)
-- ✅ Subscription fields do NOT exist on user tables (or exist but need backfill)
-- ✅ User counts make sense for your environment

-- If ALL checks pass → You're in the RIGHT database! ✅
-- Proceed with running migration scripts in order (01, 02, 03, 04)
