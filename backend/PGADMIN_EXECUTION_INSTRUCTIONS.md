# pgAdmin 4 Execution Instructions
**File:** `production-database-sync.sql`  
**Purpose:** Sync production database schema to match dev-swa  
**Date:** January 14, 2026

---

## Prerequisites

✅ **Backup Completed:** Production database backup exists at `/Volumes/Acasis/tcc-backups/production-db-backup-20260114_112521`  
✅ **pgAdmin 4 Installed:** pgAdmin 4 is installed and running  
✅ **Database Connection:** You have production database connection configured in pgAdmin

---

## Step-by-Step Instructions

### Step 1: Connect to Production Database

1. **Open pgAdmin 4**
   - Launch pgAdmin 4 application

2. **Navigate to Production Server**
   - In the left sidebar, expand: **Servers**
   - Expand: **Your Azure PostgreSQL Server** (likely named something like `traccems-prod-pgsql`)
   - If not connected, right-click server → **Connect** → Enter password: `TVmedic429!`

3. **Navigate to Production Database**
   - Expand: **Databases**
   - Expand: **postgres** (this is the production database)
   - You should see: **Schemas** → **public** → **Tables**

4. **Verify Connection**
   - Right-click **postgres** database → **Properties**
   - Confirm you're connected to: `traccems-prod-pgsql.postgres.database.azure.com`
   - Click **Cancel** to close

---

### Step 2: Open Query Tool

1. **Open Query Tool**
   - Right-click on **postgres** database
   - Select: **Query Tool** (or press `Alt+Shift+Q`)

2. **Query Tool Opens**
   - A new tab/window opens with SQL editor
   - You'll see a blank SQL editor pane at the top
   - Results/output pane at the bottom

---

### Step 2.5: VERIFY You're Connected to Production ⚠️ CRITICAL!

**BEFORE executing any SQL, confirm you're connected to PRODUCTION:**

**Method 1: Check Query Tool Title Bar**
- Look at the Query Tool tab/window title
- Should show: `postgres@traccems-prod-pgsql` or similar
- If it shows `dev` or `traccems-dev-pgsql` → **STOP! Wrong database!**

**Method 2: Check Connection Info in Query Tool**
- Look at the bottom status bar of Query Tool
- Should show connection info with production server name
- Or check the toolbar - connection dropdown should show production server

**Method 3: Run Verification Query (RECOMMENDED)**
1. In the Query Tool, type this SQL:
   ```sql
   SELECT 
       current_database() as database_name,
       inet_server_addr() as server_ip,
       version() as postgres_version;
   ```
2. Click **Execute** (⚡) or press `F5`
3. Check the results:
   - **database_name** should be: `postgres`
   - **server_ip** should show Azure IP (or NULL - that's OK)
   - **postgres_version** should show PostgreSQL version

**Method 4: Check Server Name in Left Panel**
- Before opening Query Tool, verify in left sidebar:
  - Server name should include: `prod` or `traccems-prod-pgsql`
  - Database should be: `postgres`
  - **NOT** `traccems-dev-pgsql` (that's dev-swa!)

**Method 5: Quick Data Check (Safest)**
Run this query to check if you're in production:
```sql
SELECT 
    'PRODUCTION' as environment_check,
    COUNT(*) as ems_agencies_count
FROM ems_agencies;
```
- If this runs successfully and shows a count → You're in production ✅
- If you get an error or 0 rows → Double-check your connection

**Method 6: Check Connection String**
- Right-click the **postgres** database → **Properties**
- Look at **Definition** tab
- Should show connection to: `traccems-prod-pgsql.postgres.database.azure.com`
- Click **Cancel** to close

**⚠️ RED FLAGS - STOP IF YOU SEE:**
- ❌ Server name contains `dev` or `dev-swa`
- ❌ Database name is NOT `postgres`
- ❌ Connection shows `traccems-dev-pgsql`
- ❌ Query Tool title shows `dev` anywhere

**✅ GREEN FLAGS - SAFE TO PROCEED:**
- ✅ Server name contains `prod` or `traccems-prod-pgsql`
- ✅ Database name is `postgres`
- ✅ Connection shows production Azure hostname
- ✅ Verification queries return production data

---

### Step 3: Load SQL File

**Option A: Copy-Paste (Recommended)**
1. Open the SQL file in your text editor:
   - File: `/Users/scooper/Code/tcc-new-project/backend/production-database-sync.sql`
   - Select all (Cmd+A)
   - Copy (Cmd+C)

2. In pgAdmin Query Tool:
   - Click in the SQL editor pane
   - Paste (Cmd+V)
   - The entire SQL script should now be in the editor

**Option B: Open File Directly**
1. In pgAdmin Query Tool:
   - Click **File** menu → **Open File** (or press `Cmd+O`)
   - Navigate to: `/Users/scooper/Code/tcc-new-project/backend/`
   - Select: `production-database-sync.sql`
   - Click **Open**

---

### Step 4: Review SQL (Important!)

Before executing, quickly review:

1. **Check the SQL Structure**
   - Scroll through the SQL to see it's complete
   - Look for sections:
     - STEP 1: Drop Foreign Keys
     - STEP 2: Drop Indexes
     - STEP 3: Alter Existing Tables
     - STEP 4: Drop agencies table
     - STEP 5: Create Missing Tables
     - STEP 6: Create Indexes
     - STEP 7: Add Foreign Keys

2. **Verify Critical Operations**
   - Line ~122: `DROP TABLE IF EXISTS "agencies";` - This is safe, legacy table
   - Multiple `CREATE TABLE IF NOT EXISTS` statements - Safe, won't error if exists
   - Multiple `ADD COLUMN IF NOT EXISTS` statements - Safe, won't duplicate columns

---

### Step 5: Execute SQL Script

1. **Execute the Script**
   - Click the **Execute** button (⚡ lightning bolt icon) in the toolbar
   - OR press `F5` key
   - OR right-click in editor → **Execute/Refresh**

2. **Watch for Progress**
   - pgAdmin will show "Executing query..." in status bar
   - The script will run step by step
   - **Execution time:** Typically 30-60 seconds for this script

3. **Monitor Output**
   - Check the **Messages** tab at the bottom
   - You should see messages like:
     ```
     ALTER TABLE
     DROP INDEX
     CREATE TABLE
     ALTER TABLE
     ...
     ```

---

### Step 6: Check for Errors

1. **Review Messages Tab**
   - Scroll through the Messages tab
   - Look for any **ERROR** messages (red text)
   - **WARNING** messages are usually OK (e.g., "relation already exists")

2. **Common Non-Critical Messages**
   - ✅ `relation "xxx" does not exist, skipping` - OK, means it was already dropped
   - ✅ `relation "xxx" already exists` - OK, means table already exists
   - ✅ `column "xxx" of relation "yyy" already exists` - OK, means column already added

3. **Critical Errors to Watch For**
   - ❌ `ERROR: relation "xxx" does not exist` - Table/column referenced doesn't exist
   - ❌ `ERROR: constraint "xxx" does not exist` - Foreign key doesn't exist
   - ❌ `ERROR: syntax error` - SQL syntax issue

4. **If Errors Occur**
   - **STOP** - Don't continue if you see critical errors
   - Copy the error message
   - Check which step failed
   - Review the SQL around that line
   - Common fixes:
     - If foreign key error: The constraint might already be dropped, comment out that line
     - If table exists error: The table might already exist, that's OK

---

### Step 7: Verify Execution Success

1. **Check Tables Were Created**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
       'backhaul_opportunities', 
       'pricing_models', 
       'units', 
       'unit_analytics', 
       'notification_preferences', 
       'notification_logs'
   )
   ORDER BY table_name;
   ```
   - **Expected:** Should return 6 rows (one for each table)

2. **Check Columns Were Added**
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'trips' 
   AND column_name IN (
       'backhaulOpportunity', 
       'efficiency', 
       'revenuePerHour', 
       'tripCost'
   )
   ORDER BY column_name;
   ```
   - **Expected:** Should return 4 rows

3. **Check agencies Table Was Dropped**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'agencies';
   ```
   - **Expected:** Should return 0 rows (table doesn't exist)

4. **Verify ems_agencies Still Exists** (Main agency table)
   ```sql
   SELECT COUNT(*) as agency_count 
   FROM ems_agencies;
   ```
   - **Expected:** Should return a count (table exists and has data)

---

### Step 8: Run Database Comparison

After SQL execution, verify schema alignment:

1. **Open Terminal**
   - Open a new terminal window

2. **Run Comparison Script**
   ```bash
   cd /Users/scooper/Code/tcc-new-project/backend
   node compare-database-structures.js
   ```

3. **Check Results**
   - Look for: `✅ ALL DATABASES ARE ALIGNED!`
   - If not aligned, review differences
   - Most differences should be resolved

---

## Troubleshooting

### Issue: "Connection timeout" or "Could not connect"

**Solution:**
- Check Azure Portal → PostgreSQL firewall rules
- Ensure your IP is whitelisted
- Try reconnecting in pgAdmin

---

### Issue: "Permission denied" errors

**Solution:**
- Verify you're connected as `traccems_admin` user
- Check user has ALTER/CREATE permissions
- Contact Azure admin if needed

---

### Issue: Foreign key constraint errors

**Solution:**
- The SQL uses `IF EXISTS` checks, so this shouldn't happen
- If it does, the constraint might have a different name
- Check constraint names:
  ```sql
  SELECT constraint_name 
  FROM information_schema.table_constraints 
  WHERE table_name = 'your_table_name';
  ```

---

### Issue: Column already exists errors

**Solution:**
- These are warnings, not errors
- The SQL uses `IF NOT EXISTS`, so columns won't be duplicated
- Safe to ignore if you see "already exists" messages

---

### Issue: Table creation fails

**Solution:**
- Check if table already exists (might have been partially created)
- Drop and recreate:
  ```sql
  DROP TABLE IF EXISTS "table_name" CASCADE;
  -- Then re-run the CREATE TABLE statement
  ```

---

## Post-Execution Checklist

After successful execution:

- [ ] All 6 missing tables created
- [ ] All missing columns added to existing tables
- [ ] `agencies` table dropped
- [ ] `ems_agencies` table still exists (main agency table)
- [ ] Database comparison shows alignment
- [ ] Backend log stream shows application starting
- [ ] No critical errors in pgAdmin Messages tab

---

## Rollback Plan (If Needed)

If something goes wrong:

1. **Restore from Backup**
   ```bash
   cd /Volumes/Acasis/tcc-backups/production-db-backup-20260114_112521
   ./restore-production-database.sh
   ```
   - ⚠️ **WARNING:** This will overwrite all current production data!

2. **Or Use Azure Portal**
   - Azure Portal → traccems-prod-pgsql → Backups
   - Use point-in-time restore

---

## Next Steps After Successful Execution

1. **Check Backend Logs**
   - Azure Portal → TraccEms-Prod-Backend → Log stream
   - Should see application startup logs
   - Database connection should succeed

2. **Verify Backend Health**
   ```bash
   curl https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net/health
   ```

3. **Run Final Database Comparison**
   ```bash
   cd /Users/scooper/Code/tcc-new-project/backend
   node compare-database-structures.js
   ```

---

## Quick Reference

**SQL File Location:**
```
/Users/scooper/Code/tcc-new-project/backend/production-database-sync.sql
```

**Database Connection:**
- Host: `traccems-prod-pgsql.postgres.database.azure.com`
- Database: `postgres`
- User: `traccems_admin`
- Password: `TVmedic429!`

**pgAdmin Shortcuts:**
- Open Query Tool: `Alt+Shift+Q` or Right-click database → Query Tool
- Execute Query: `F5` or Click ⚡ button
- Open File: `Cmd+O` (Mac) or `Ctrl+O` (Windows)

---

**Ready to execute? Follow Steps 1-7 above, then verify with Step 8!**
