# Production Database Backup Instructions
**Created:** January 5, 2026  
**Purpose:** Backup production database before environment unification  
**Status:** Ready to Execute

---

## Overview

Before proceeding with environment unification (updating production schema and code), we need to create a complete backup of the production database. This backup will allow us to restore production to its current state if anything goes wrong.

---

## Backup Options

### Option 1: Automated Script (Recommended) ✅

**Script:** `documentation/scripts/backup-production-database.sh`

**Steps:**
1. **Navigate to project root:**
   ```bash
   cd /Users/scooper/Code/tcc-new-project
   ```

2. **Run the backup script:**
   ```bash
   ./documentation/scripts/backup-production-database.sh
   ```
   
   Or specify a custom destination:
   ```bash
   ./documentation/scripts/backup-production-database.sh /path/to/backup/location
   ```

3. **Confirm production backup:**
   - Script will ask for confirmation (type "yes")
   - Script will backup the database (may take several minutes)
   - Script will verify backup contents
   - Script will create restore script

4. **Verify backup:**
   - Check backup file exists: `production_postgres_backup.sql`
   - Check backup size (should be > 0 bytes)
   - Review `backup-info.txt` for details

**Expected Output:**
```
🔄 Starting PRODUCTION Azure Database Backup...
================================================
⚠️  WARNING: This is PRODUCTION database backup!
Azure Host: traccems-prod-pgsql.postgres.database.azure.com
Database: postgres
Backup to: /Volumes/Acasis/tcc-backups/production-db-backup-20260105_HHMMSS

⚠️  Are you sure you want to backup PRODUCTION database? (yes/no): yes

📊 Backing up PRODUCTION Azure database...
   This may take several minutes depending on database size...
   ⏳ Please wait...

✅ PRODUCTION Azure database backup completed!
   File: /Volumes/Acasis/tcc-backups/production-db-backup-20260105_HHMMSS/production_postgres_backup.sql
   Size: XXX KB/MB
   Lines: XXXX

🔍 Verifying backup contents...
   ✅ Found table: _prisma_migrations
   ✅ Found table: transport_requests
   ...

📋 Backup Summary
==================
✅ Backup location: /Volumes/Acasis/tcc-backups/production-db-backup-20260105_HHMMSS
✅ Backup file: production_postgres_backup.sql
✅ Backup size: XXX KB/MB
✅ Tables verified: X/8
✅ Restore script created: restore-production-database.sh

🛡️  PRODUCTION database is now safely backed up!
```

---

### Option 2: Azure Portal Backup (Alternative)

**Steps:**
1. **Go to Azure Portal:**
   - Navigate to: https://portal.azure.com
   - Find resource: `traccems-prod-pgsql`

2. **Create Manual Backup:**
   - Click on "Backups" in the left menu
   - Click "Backup now" or "Create backup"
   - Wait for backup to complete

3. **Export Database (Optional):**
   - Use Azure Portal export feature
   - Download backup file to local machine
   - Store in secure location

**Note:** Azure Portal backups have 7-day retention and point-in-time restore capability.

---

### Option 3: pgAdmin Backup (Alternative)

**Steps:**
1. **Connect to Production Database in pgAdmin:**
   - Server: `traccems-prod-pgsql.postgres.database.azure.com`
   - Port: `5432`
   - Database: `postgres`
   - Username: `traccems_admin`
   - Password: `TVmedic429!`
   - SSL mode: `Require`

2. **Backup Database:**
   - Right-click database → **Backup...**
   - **Filename:** `/Volumes/Acasis/tcc-backups/production-pgadmin-backup-$(date +%Y%m%d_%H%M%S).backup`
   - **Format:** `Custom` or `Plain`
   - Click **Backup**

3. **Verify Backup:**
   - Check file exists and has reasonable size
   - Should be several MB for a populated database

---

## Prerequisites

### PostgreSQL Client Tools

The backup script requires PostgreSQL client tools (specifically `pg_dump`).

**Check if installed:**
```bash
which pg_dump
```

**Install PostgreSQL 17 (Required for Azure PostgreSQL 17):**
```bash
brew install postgresql@17
```

**Verify installation:**
```bash
/opt/homebrew/opt/postgresql@17/bin/pg_dump --version
```

### Azure Firewall Access

Your current IP address must be whitelisted in Azure PostgreSQL firewall.

**⚠️ Apple Private Relay Note:**
- If Apple Private Relay is enabled, you may see an IPv6 address when checking your IP
- Azure PostgreSQL firewall needs your **IPv4 address**
- Use `curl -4 ifconfig.me` to get your real IPv4 address
- Your current IPv4: `71.58.90.33` (as of January 5, 2026)

**To check/add firewall rule:**
1. Go to Azure Portal → `traccems-prod-pgsql` → Networking
2. Check if your IPv4 address (`71.58.90.33`) is in the firewall rules
3. If not, add your current IPv4 address
4. Or temporarily enable "Allow access to Azure services"

**If connection fails:**
- Disable Apple Private Relay temporarily (System Settings → iCloud → Private Relay)
- Or add both IPv4 and IPv6 addresses to Azure firewall
- Or use Azure Portal backup instead (doesn't require firewall access)

**Get your current IP:**
```bash
# Get IPv4 address (what Azure sees)
curl -4 ifconfig.me

# If you see an IPv6 address with %, that's Apple Private Relay
# Use the IPv4 address instead
```

**Note:** If Apple Private Relay is enabled, `curl ifconfig.me` may return an IPv6 address. Use `curl -4 ifconfig.me` to get your real IPv4 address that Azure will see.

---

## Backup Location

**Default Location:** `/Volumes/Acasis/tcc-backups/production-db-backup-YYYYMMDD_HHMMSS/`

**Contents:**
- `production_postgres_backup.sql` - Full database backup
- `restore-production-database.sh` - Restore script
- `backup-info.txt` - Backup metadata and instructions

---

## Verification

After backup completes, verify:

1. **Backup file exists and is not empty:**
   ```bash
   ls -lh /Volumes/Acasis/tcc-backups/production-db-backup-*/production_postgres_backup.sql
   ```

2. **Backup contains critical tables:**
   - Check `backup-info.txt` for table verification results
   - Or manually check:
     ```bash
     grep -i "CREATE TABLE" production_postgres_backup.sql | head -20
     ```

3. **Backup size is reasonable:**
   - Should be at least several KB (even for small databases)
   - Empty databases may be < 10KB
   - Production database should be several MB if it has data

---

## Restore Instructions

**⚠️ WARNING: Restore will overwrite current production database!**

**To restore from backup:**

1. **Navigate to backup directory:**
   ```bash
   cd /Volumes/Acasis/tcc-backups/production-db-backup-YYYYMMDD_HHMMSS
   ```

2. **Run restore script:**
   ```bash
   ./restore-production-database.sh
   ```

3. **Confirm restore:**
   - Type `RESTORE PRODUCTION` when prompted
   - Type `yes` to confirm again
   - Wait for restore to complete

**Manual restore (if script doesn't work):**
```bash
export PGPASSWORD='TVmedic429!'
psql -h traccems-prod-pgsql.postgres.database.azure.com \
     -p 5432 \
     -U traccems_admin \
     -d postgres \
     -f production_postgres_backup.sql
```

---

## Troubleshooting

### Error: "pg_dump: server version mismatch"

**Solution:** Install PostgreSQL 17 client tools:
```bash
brew install postgresql@17
```

The script will automatically use PostgreSQL 17 if installed.

### Error: "could not connect to server"

**Possible causes:**
1. **Firewall blocking connection:**
   - Add your IP to Azure PostgreSQL firewall rules
   - Or enable "Allow access to Azure services"

2. **Network connectivity:**
   - Check internet connection
   - Try pinging the Azure host

3. **SSL/TLS issues:**
   - Ensure `sslmode=require` is in connection string
   - Check SSL certificates

### Error: "Backup file is empty"

**Possible causes:**
1. **Database is empty** (unlikely for production)
2. **Backup failed silently** - Check error messages
3. **Permissions issue** - Check backup directory permissions

### Error: "Table not found" during verification

**This is OK if:**
- Table doesn't exist in production yet (expected for missing tables)
- Table name uses different casing or quotes

**This is a problem if:**
- Critical tables are missing and should exist
- Backup appears incomplete

---

## Security Notes

**⚠️ CRITICAL:**
- Production backup contains **REAL CLIENT DATA**
- Store backup securely
- Do not commit backup files to Git
- Do not share backup files
- Delete backups after successful migration (if desired)
- Consider encrypting backup files

**Backup Retention:**
- Keep backup until environment unification is complete and verified
- Azure Portal provides 7-day automated backups
- Consider keeping manual backup longer for safety

---

## Next Steps

After backup is complete:

1. ✅ **Verify backup** - Check backup file and contents
2. ✅ **Document backup location** - Note where backup is stored
3. ✅ **Proceed with unification** - Begin environment unification process
4. ✅ **Test after changes** - Verify production still works
5. ✅ **Keep backup** - Don't delete until changes are verified

---

## Backup Checklist

- [ ] PostgreSQL 17 client tools installed
- [ ] Azure firewall allows connection from current IP
- [ ] Backup script executed successfully
- [ ] Backup file exists and is not empty
- [ ] Backup contains expected tables
- [ ] Backup location documented
- [ ] Restore script created and tested (optional)
- [ ] Ready to proceed with unification

---

**Last Updated:** January 5, 2026  
**Status:** Ready to Execute

