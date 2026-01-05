#!/usr/bin/env bash
set -euo pipefail

# Backup Production Azure PostgreSQL Database
# This backs up the PRODUCTION Azure database before making schema changes
# Usage: ./backup-production-database.sh [DESTINATION_DIR]
# Default DESTINATION_DIR: /Volumes/Acasis/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEST_ROOT="${1:-/Volumes/Acasis/}"

# Production Azure database connection details
AZURE_DB_HOST="traccems-prod-pgsql.postgres.database.azure.com"
AZURE_DB_PORT="5432"
AZURE_DB_NAME="postgres"
AZURE_DB_USER="traccems_admin"
AZURE_DB_PASSWORD="TVmedic429!"

# Connection string with SSL
AZURE_DATABASE_URL="postgresql://${AZURE_DB_USER}:${AZURE_DB_PASSWORD}@${AZURE_DB_HOST}:${AZURE_DB_PORT}/${AZURE_DB_NAME}?sslmode=require"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${DEST_ROOT}/tcc-backups/production-db-backup-${TIMESTAMP}"

echo "🔄 Starting PRODUCTION Azure Database Backup..."
echo "================================================"
echo "⚠️  WARNING: This is PRODUCTION database backup!"
echo "Azure Host: ${AZURE_DB_HOST}"
echo "Database: ${AZURE_DB_NAME}"
echo "Backup to: ${BACKUP_DIR}"
echo ""

# Confirm this is production
read -p "⚠️  Are you sure you want to backup PRODUCTION database? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Backup cancelled."
    exit 1
fi

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo "❌ Error: pg_dump not found. Please install PostgreSQL client tools."
    echo "   Install: brew install postgresql@17"
    exit 1
fi

# Check for PostgreSQL 17 (required for Azure PostgreSQL 17)
PG_DUMP_CMD="pg_dump"
if [ -f "/opt/homebrew/opt/postgresql@17/bin/pg_dump" ]; then
    PG_DUMP_CMD="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
    echo "✅ Using PostgreSQL 17 pg_dump: ${PG_DUMP_CMD}"
elif [ -f "/usr/local/opt/postgresql@17/bin/pg_dump" ]; then
    PG_DUMP_CMD="/usr/local/opt/postgresql@17/bin/pg_dump"
    echo "✅ Using PostgreSQL 17 pg_dump: ${PG_DUMP_CMD}"
else
    echo "⚠️  Warning: PostgreSQL 17 not found. Using system pg_dump."
    echo "   If you get version mismatch errors, install: brew install postgresql@17"
fi

# Backup Production Azure database
echo ""
echo "📊 Backing up PRODUCTION Azure database..."
echo "   This may take several minutes depending on database size..."
echo "   ⏳ Please wait..."

if ! PGPASSWORD="${AZURE_DB_PASSWORD}" "${PG_DUMP_CMD}" \
    -h "${AZURE_DB_HOST}" \
    -p "${AZURE_DB_PORT}" \
    -U "${AZURE_DB_USER}" \
    -d "${AZURE_DB_NAME}" \
    --no-owner \
    --no-acl \
    -F p \
    > "${BACKUP_DIR}/production_postgres_backup.sql" 2>&1; then
    echo ""
    echo "❌ ERROR: Backup failed!"
    echo "   Check firewall rules in Azure Portal"
    echo "   Ensure your IP is whitelisted in Azure PostgreSQL firewall"
    exit 1
fi

# Verify backup
if [ ! -s "${BACKUP_DIR}/production_postgres_backup.sql" ]; then
    echo "❌ ERROR: Backup file is empty or doesn't exist!"
    exit 1
fi

BACKUP_SIZE=$(wc -l < "${BACKUP_DIR}/production_postgres_backup.sql")
BACKUP_FILE_SIZE=$(ls -lh "${BACKUP_DIR}/production_postgres_backup.sql" | awk '{print $5}')

echo ""
echo "✅ PRODUCTION Azure database backup completed!"
echo "   File: ${BACKUP_DIR}/production_postgres_backup.sql"
echo "   Size: ${BACKUP_FILE_SIZE}"
echo "   Lines: ${BACKUP_SIZE}"

# Check for critical tables
echo ""
echo "🔍 Verifying backup contents..."
TABLES_FOUND=0
TABLES_TO_CHECK=("_prisma_migrations" "transport_requests" "trips" "ems_users" "ems_agencies" "center_users" "hospitals" "facilities")

for table in "${TABLES_TO_CHECK[@]}"; do
    if grep -q "CREATE TABLE.*${table}" "${BACKUP_DIR}/production_postgres_backup.sql" || \
       grep -q "COPY public.${table}" "${BACKUP_DIR}/production_postgres_backup.sql" || \
       grep -q "CREATE TABLE.*\"${table}\"" "${BACKUP_DIR}/production_postgres_backup.sql" || \
       grep -q "COPY public.\"${table}\"" "${BACKUP_DIR}/production_postgres_backup.sql"; then
        echo "   ✅ Found table: ${table}"
        TABLES_FOUND=$((TABLES_FOUND + 1))
    else
        echo "   ⚠️  Table not found: ${table}"
    fi
done

# Create restore script
cat > "${BACKUP_DIR}/restore-production-database.sh" << 'RESTOREEOF'
#!/usr/bin/env bash
set -euo pipefail

# Restore Production Azure Database from Backup
# ⚠️  WARNING: This will overwrite the PRODUCTION database!
# ⚠️  USE WITH EXTREME CAUTION!

AZURE_DB_HOST="traccems-prod-pgsql.postgres.database.azure.com"
AZURE_DB_PORT="5432"
AZURE_DB_NAME="postgres"
AZURE_DB_USER="traccems_admin"
AZURE_DB_PASSWORD="TVmedic429!"

echo "⚠️  ⚠️  ⚠️  CRITICAL WARNING ⚠️  ⚠️  ⚠️"
echo "======================================"
echo "This will RESTORE PRODUCTION database from backup!"
echo "This will OVERWRITE all current production data!"
echo ""
echo "Host: ${AZURE_DB_HOST}"
echo "Database: ${AZURE_DB_NAME}"
echo ""
read -p "Type 'RESTORE PRODUCTION' to confirm: " confirm

if [ "$confirm" != "RESTORE PRODUCTION" ]; then
    echo "❌ Restore cancelled."
    exit 1
fi

echo ""
read -p "Are you ABSOLUTELY SURE? This cannot be undone! (yes/no): " confirm2

if [ "$confirm2" != "yes" ]; then
    echo "❌ Restore cancelled."
    exit 1
fi

# Check for PostgreSQL 17
PSQL_CMD="psql"
if [ -f "/opt/homebrew/opt/postgresql@17/bin/psql" ]; then
    PSQL_CMD="/opt/homebrew/opt/postgresql@17/bin/psql"
elif [ -f "/usr/local/opt/postgresql@17/bin/psql" ]; then
    PSQL_CMD="/usr/local/opt/postgresql@17/bin/psql"
fi

echo "🔄 Restoring PRODUCTION Azure database..."
echo "   This may take several minutes..."

if ! PGPASSWORD="${AZURE_DB_PASSWORD}" "${PSQL_CMD}" \
    -h "${AZURE_DB_HOST}" \
    -p "${AZURE_DB_PORT}" \
    -U "${AZURE_DB_USER}" \
    -d "${AZURE_DB_NAME}" \
    -f production_postgres_backup.sql; then
    echo ""
    echo "❌ ERROR: Restore failed!"
    exit 1
fi

echo ""
echo "✅ PRODUCTION Azure database restored!"
echo "   ⚠️  Verify the application is working correctly!"
RESTOREEOF

chmod +x "${BACKUP_DIR}/restore-production-database.sh"

# Create backup info
cat > "${BACKUP_DIR}/backup-info.txt" << EOF
Production Azure Database Backup
=================================
Date: $(date)
Azure Host: ${AZURE_DB_HOST}
Database: ${AZURE_DB_NAME}
Backup File: production_postgres_backup.sql
Backup Size: ${BACKUP_FILE_SIZE} (${BACKUP_SIZE} lines)
Tables Verified: ${TABLES_FOUND}/${#TABLES_TO_CHECK[@]}

Purpose: Backup before environment unification (schema changes)

⚠️  CRITICAL: This is PRODUCTION database backup!
⚠️  Contains REAL CLIENT DATA - Handle with care!

To restore:
  cd ${BACKUP_DIR}
  ./restore-production-database.sh

⚠️  WARNING: Restore will overwrite current PRODUCTION database!
⚠️  This will cause DATA LOSS if production has new data since backup!

Alternative: Use Azure Portal to restore from automated backups
  (7-day retention, point-in-time restore available)
EOF

echo ""
echo "📋 Backup Summary"
echo "=================="
echo "✅ Backup location: ${BACKUP_DIR}"
echo "✅ Backup file: production_postgres_backup.sql"
echo "✅ Backup size: ${BACKUP_FILE_SIZE}"
echo "✅ Tables verified: ${TABLES_FOUND}/${#TABLES_TO_CHECK[@]}"
echo "✅ Restore script created: restore-production-database.sh"
echo ""
echo "🛡️  PRODUCTION database is now safely backed up!"
echo "   ⚠️  Keep this backup secure - it contains real client data"
echo "   ✅ You can proceed with environment unification changes"
echo ""
echo "💡 Tip: Azure Portal also provides automated backups (7-day retention)"
echo "   Location: Azure Portal → traccems-prod-pgsql → Backups"

