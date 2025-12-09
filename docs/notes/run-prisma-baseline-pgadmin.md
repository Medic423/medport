# Run Prisma Baseline SQL via pgAdmin
**Last Updated:** December 8, 2025

## Quick Steps

1. **Open pgAdmin 4**

2. **Connect to Azure Database:**
   - Right-click **Servers** → **Register** → **Server**
   - **General Tab:**
     - Name: `Azure TCC Database`
   - **Connection Tab:**
     - Host: `traccems-dev-pgsql.postgres.database.azure.com`
     - Port: `5432`
     - Database: `postgres`
     - Username: `traccems_admin`
     - Password: `password1!`
     - ✅ Save password
   - **SSL Tab:**
     - SSL mode: `Require` ⚠️ **IMPORTANT - Azure requires SSL**
   - Click **Save**

3. **Open Query Tool:**
   - Expand **Servers** → **Azure TCC Database** → **Databases** → **postgres**
   - Right-click **postgres** → **Query Tool**

4. **Open Baseline SQL File:**
   - In pgAdmin: **File** → **Open**
   - Navigate to: `backend/baseline-migrations-complete.sql`
   - Or copy/paste the SQL from the file

5. **Execute SQL:**
   - Click **Execute** (F5) or press **F5**
   - Check **Messages** tab for success/errors

6. **Verify Baseline:**
   ```sql
   SELECT COUNT(*) FROM "_prisma_migrations";
   ```
   Should return `29`

## SQL File Location

The baseline SQL is at:
```
backend/baseline-migrations-complete.sql
```

## What This Does

1. Creates `_prisma_migrations` table (if it doesn't exist)
2. Creates unique index on `migration_name`
3. Inserts all 29 migration records
4. Marks all migrations as applied

## Expected Results

After running:
- ✅ `_prisma_migrations` table created
- ✅ 29 migrations inserted
- ✅ Prisma will recognize all migrations as applied
- ✅ GitHub Actions workflow should succeed

## Troubleshooting

### Error: "relation _prisma_migrations already exists"
- This is OK - the table already exists
- The INSERT will still work (ON CONFLICT handles duplicates)

### Error: "permission denied"
- Ensure you're connected as `traccems_admin`
- Check Azure database user permissions

### Error: "SSL connection required"
- Ensure SSL mode is set to `Require` in pgAdmin connection settings

## After Baseline

1. ✅ Verify migrations: `SELECT COUNT(*) FROM "_prisma_migrations";` (should be 29)
2. ✅ Re-run GitHub Actions workflow
3. ✅ Deployment should succeed

