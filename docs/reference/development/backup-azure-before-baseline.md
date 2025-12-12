# Backup Azure Database Before Prisma Baseline
**Last Updated:** December 8, 2025

## Situation

Before running Prisma baseline SQL, we should backup the Azure database. However, direct `pg_dump` from command line is blocked by Azure firewall.

## Good News: Baseline Changes Are Safe

The Prisma baseline SQL we're running is **NON-DESTRUCTIVE**:
- ✅ Only creates/updates `_prisma_migrations` table
- ✅ Does NOT modify existing data
- ✅ Does NOT drop tables
- ✅ Does NOT alter table structures
- ✅ Only adds migration history records

**Risk Level:** Very Low - Worst case, we can manually remove the `_prisma_migrations` table if needed.

## Backup Options

### Option 1: Use pgAdmin to Backup (Recommended)

1. **Connect to Azure database in pgAdmin:**
   - Server: `traccems-dev-pgsql.postgres.database.azure.com`
   - Port: `5432`
   - Database: `postgres`
   - Username: `traccems_admin`
   - Password: `password1!`
   - SSL mode: `Require`

2. **Backup the database:**
   - Right-click database → **Backup...**
   - **Filename:** `/Volumes/Acasis/tcc-backups/azure-db-backup-$(date +%Y%m%d_%H%M%S).backup`
   - **Format:** `Custom` or `Plain`
   - Click **Backup**

3. **Verify backup:**
   - Check file exists and has reasonable size
   - Should be several MB for a populated database

### Option 2: Use Azure Portal Export

1. Go to Azure Portal → Your PostgreSQL server
2. Navigate to **Backup** or **Export** options
3. Create a backup/export
4. Download the backup file

### Option 3: Proceed Without Backup (Low Risk)

Since baseline changes are non-destructive, you can proceed without backup. The changes only:
- Create `_prisma_migrations` table (if missing)
- Insert migration records

**If something goes wrong:**
- Simply drop the `_prisma_migrations` table: `DROP TABLE "_prisma_migrations";`
- Database will be back to original state

## Recommended Approach

**For maximum safety:**
1. ✅ Use pgAdmin to backup Azure database (Option 1)
2. ✅ Run Prisma baseline SQL
3. ✅ Verify migrations are applied
4. ✅ Re-run GitHub Actions workflow

**If pgAdmin backup fails:**
- Proceed with baseline (changes are safe)
- Note: Baseline only adds migration history, doesn't change data

## Verification After Baseline

After running baseline SQL, verify:

```sql
-- Check migration table exists
SELECT COUNT(*) FROM "_prisma_migrations";
-- Should return 29

-- Verify existing data is intact
SELECT COUNT(*) FROM "transport_requests";
SELECT COUNT(*) FROM "ems_users";
SELECT COUNT(*) FROM "ems_agencies";
-- Should match pre-baseline counts
```

## Rollback Plan (If Needed)

If baseline causes issues (unlikely):

```sql
-- Remove migration history (reverts baseline)
DROP TABLE IF EXISTS "_prisma_migrations";
```

This will restore database to pre-baseline state. No data loss.

## Summary

- **Backup Recommended:** Yes (use pgAdmin)
- **Baseline Risk:** Very Low (non-destructive)
- **Rollback:** Simple (drop `_prisma_migrations` table)
- **Data Safety:** High (no data modifications)

