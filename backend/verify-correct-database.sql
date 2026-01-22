-- VERIFICATION QUERIES: Confirm you're in the correct database
-- Run these queries in pgAdmin Query Tool to verify you're connected to dev-swa

-- ============================================
-- STEP 1: Verify Server Connection
-- ============================================
-- Check the current database connection info
SELECT 
    current_database() AS "Current Database",
    current_user AS "Current User",
    inet_server_addr() AS "Server IP",
    inet_server_port() AS "Server Port";

-- Expected for Dev-SWA:
-- Current Database: postgres
-- Current User: traccems_admin
-- Server IP: (will show Azure IP)
-- Server Port: 5432

-- ============================================
-- STEP 2: Verify Database Name Matches Connection String
-- ============================================
-- The connection string should show: dbname=postgres
-- This query confirms you're in that database
SELECT current_database();

-- Expected: "postgres"

-- ============================================
-- STEP 3: Verify Table Exists (Application Tables)
-- ============================================
-- Check if ems_agencies table exists (this confirms it's the app database)
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('ems_agencies', 'transport_request', 'agency_response', 'center_users')
ORDER BY table_name;

-- Expected: Should see all 4 tables listed above
-- If you see these tables, you're in the correct application database

-- ============================================
-- STEP 4: Verify acceptsNotifications Column Exists
-- ============================================
-- This is the column we're checking for
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ems_agencies'
  AND column_name = 'acceptsNotifications';

-- Expected: 1 row showing:
-- column_name: acceptsNotifications
-- data_type: boolean
-- column_default: true
-- is_nullable: NO

-- ============================================
-- STEP 5: Verify Sample Data (Optional)
-- ============================================
-- Check if there's actual data in the table
SELECT 
    id, 
    name, 
    "acceptsNotifications",
    "isActive"
FROM ems_agencies
LIMIT 5;

-- Expected: Should see 1-5 rows with agency data
-- All rows should have acceptsNotifications = true (or false)

-- ============================================
-- VERIFICATION CHECKLIST
-- ============================================
-- ✅ Current Database = "postgres"
-- ✅ Current User = "traccems_admin"  
-- ✅ Server hostname contains "traccems-dev-pgsql" (check pgAdmin connection properties)
-- ✅ Tables exist: ems_agencies, transport_request, agency_response, center_users
-- ✅ Column exists: acceptsNotifications in ems_agencies table
-- ✅ Sample data shows agencies with acceptsNotifications values

-- If ALL of the above are true, you're in the CORRECT dev-swa database!
