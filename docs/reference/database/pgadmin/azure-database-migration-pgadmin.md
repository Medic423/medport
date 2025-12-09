# Azure Database Migration Using pgAdmin 4
**Last Updated:** December 8, 2025

## Overview

When Prisma migrations fail during Azure deployment, you can manually apply them using pgAdmin 4. This guide walks through connecting to Azure PostgreSQL and running migration SQL files.

## Prerequisites

1. **pgAdmin 4** installed on your local machine
2. **Azure PostgreSQL connection details** (from Azure Portal)
3. **Migration SQL files** from `backend/prisma/migrations/`

## Step 1: Get Azure Database Connection Details

### From Azure Portal:
1. Go to Azure Portal → Your PostgreSQL server resource
2. Navigate to **Connection strings** or **Settings** → **Connection security**
3. Note down:
   - **Server name**: `your-server.postgres.database.azure.com`
   - **Database name**: Usually `postgres` or your database name
   - **Username**: Format is usually `username@server-name`
   - **Password**: Your database password
   - **Port**: Usually `5432`

### From GitHub Secrets (if available):
- Check GitHub repository → Settings → Secrets → `DATABASE_URL`
- Parse the connection string: `postgresql://username:password@server:port/database`

## Step 2: Connect to Azure Database in pgAdmin 4

1. **Open pgAdmin 4**

2. **Add New Server:**
   - Right-click **Servers** → **Register** → **Server**

3. **General Tab:**
   - **Name**: `Azure TCC Database` (or any name you prefer)

4. **Connection Tab:**
   - **Host name/address**: `your-server.postgres.database.azure.com`
   - **Port**: `5432`
   - **Maintenance database**: `postgres` (or your database name)
   - **Username**: `username@server-name` (Azure format)
   - **Password**: Your database password
   - ✅ **Save password** (optional, for convenience)

5. **SSL Tab:**
   - **SSL mode**: `Require` (Azure requires SSL)
   - This is important - Azure PostgreSQL requires SSL connections

6. Click **Save**

## Step 3: Apply Migrations

### Option A: Run Individual Migration Files

1. **Navigate to your database:**
   - Expand **Servers** → **Azure TCC Database** → **Databases** → **Your Database Name**

2. **Open Query Tool:**
   - Right-click your database → **Query Tool**

3. **Open Migration File:**
   - In pgAdmin, go to **File** → **Open** → Navigate to migration file
   - Example: `backend/prisma/migrations/20251204101500_add_user_deletion_fields/migration.sql`

4. **Review the SQL:**
   - Check the migration SQL to understand what it does
   - Look for any potential conflicts or issues

5. **Execute:**
   - Click **Execute** (F5) or press **F5**
   - Check the **Messages** tab for any errors

6. **Verify:**
   - Check if tables/columns were created successfully
   - Use **Tools** → **Query Tool** to run: `SELECT * FROM _prisma_migrations;`
   - This shows which migrations have been applied

### Option B: Run All Pending Migrations

1. **Check Migration Status:**
   ```sql
   SELECT migration_name, finished_at 
   FROM _prisma_migrations 
   ORDER BY finished_at DESC;
   ```

2. **Identify Pending Migrations:**
   - Compare with files in `backend/prisma/migrations/`
   - Find migrations not in the `_prisma_migrations` table

3. **Apply Each Migration:**
   - Open each migration file in order
   - Execute them one by one
   - Verify each completes successfully before moving to next

## Step 4: Common Issues and Solutions

### Issue: "SSL connection required"
**Solution:** Ensure SSL mode is set to `Require` in pgAdmin connection settings

### Issue: "Migration already applied"
**Solution:** Check `_prisma_migrations` table. If migration exists, skip it.

### Issue: "Column already exists"
**Solution:** Migration may have partially applied. Check current schema and manually fix conflicts.

### Issue: "Permission denied"
**Solution:** Ensure your Azure database user has proper permissions (usually needs to be database owner)

### Issue: "Connection timeout"
**Solution:** 
- Check Azure firewall rules (allow your IP)
- Verify server name and credentials
- Check Azure service status

## Step 5: Verify Migration Success

### Check Migration Table:
```sql
SELECT migration_name, finished_at, applied_steps_count
FROM _prisma_migrations
ORDER BY finished_at DESC
LIMIT 10;
```

### Check Schema:
```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check specific table structure
\d table_name
```

### Verify New Fields:
```sql
-- Example: Check if user deletion fields exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ems_users' 
AND column_name IN ('isDeleted', 'deletedAt');
```

## Recent Migrations to Apply

Based on current migrations directory:

1. **20251204101500_add_user_deletion_fields**
   - Adds `isDeleted` and `deletedAt` fields to user tables

2. **20251204130000_add_ems_agency_availability_status**
   - Adds EMS agency availability status fields

## Quick Reference: Migration File Locations

```
backend/prisma/migrations/
├── 20251204101500_add_user_deletion_fields/
│   └── migration.sql
├── 20251204130000_add_ems_agency_availability_status/
│   └── migration.sql
└── [other migrations...]
```

## After Applying Migrations

1. **Verify in Azure:**
   - Check that migrations appear in `_prisma_migrations` table
   - Verify schema changes are present

2. **Redeploy Backend:**
   - After migrations are applied, redeploy backend
   - Deployment should now succeed

3. **Test:**
   - Verify backend connects successfully
   - Test functionality that depends on new schema

## Notes

- **Always backup** before applying migrations manually
- **Apply migrations in order** (by timestamp)
- **Test locally first** if possible
- **Keep migration files** for reference
- **Document any manual changes** made outside of Prisma

## Alternative: Using psql Command Line

If you prefer command line:

```bash
# Connect to Azure PostgreSQL
psql "postgresql://username@server-name:password@server.postgres.database.azure.com:5432/database?sslmode=require"

# Run migration
\i backend/prisma/migrations/20251204101500_add_user_deletion_fields/migration.sql
```

## Getting Azure Connection String

From Azure Portal:
1. Go to your PostgreSQL server
2. **Settings** → **Connection strings**
3. Copy the **PostgreSQL** connection string
4. Format: `postgresql://username@servername:password@servername.postgres.database.azure.com:5432/dbname?sslmode=require`

