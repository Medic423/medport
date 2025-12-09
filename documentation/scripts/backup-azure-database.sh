#!/usr/bin/env bash
set -euo pipefail

# Backup Azure PostgreSQL Database
# This backs up the Azure database before making Prisma baseline changes
# Usage: scripts/backup-azure-database.sh [DESTINATION_DIR]
# Default DESTINATION_DIR: /Volumes/Acasis/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEST_ROOT="${1:-/Volumes/Acasis/}"

# Azure database connection details
AZURE_DB_HOST="traccems-dev-pgsql.postgres.database.azure.com"
AZURE_DB_PORT="5432"
AZURE_DB_NAME="postgres"
AZURE_DB_USER="traccems_admin"
AZURE_DB_PASSWORD="password1!"

# Connection string with SSL
AZURE_DATABASE_URL="postgresql://${AZURE_DB_USER}:${AZURE_DB_PASSWORD}@${AZURE_DB_HOST}:${AZURE_DB_PORT}/${AZURE_DB_NAME}?sslmode=require"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${DEST_ROOT}/tcc-backups/azure-db-backup-${TIMESTAMP}"

echo "🔄 Starting Azure Database Backup..."
echo "====================================="
echo "Azure Host: ${AZURE_DB_HOST}"
echo "Database: ${AZURE_DB_NAME}"
echo "Backup to: ${BACKUP_DIR}"
echo ""

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo "❌ Error: pg_dump not found. Please install PostgreSQL client tools."
    exit 1
fi

# Backup Azure database
echo "📊 Backing up Azure database..."
echo "   This may take a few minutes..."

PGPASSWORD="${AZURE_DB_PASSWORD}" pg_dump \
    -h "${AZURE_DB_HOST}" \
    -p "${AZURE_DB_PORT}" \
    -U "${AZURE_DB_USER}" \
    -d "${AZURE_DB_NAME}" \
    --no-owner \
    --no-acl \
    -F p \
    > "${BACKUP_DIR}/azure_postgres_backup.sql"

# Verify backup
if [ ! -s "${BACKUP_DIR}/azure_postgres_backup.sql" ]; then
    echo "❌ ERROR: Backup file is empty or doesn't exist!"
    exit 1
fi

BACKUP_SIZE=$(wc -l < "${BACKUP_DIR}/azure_postgres_backup.sql")
BACKUP_FILE_SIZE=$(ls -lh "${BACKUP_DIR}/azure_postgres_backup.sql" | awk '{print $5}')

echo ""
echo "✅ Azure database backup completed!"
echo "   File: ${BACKUP_DIR}/azure_postgres_backup.sql"
echo "   Size: ${BACKUP_FILE_SIZE}"
echo "   Lines: ${BACKUP_SIZE}"

# Check for critical tables
echo ""
echo "🔍 Verifying backup contents..."
TABLES_FOUND=0

for table in "_prisma_migrations" "transport_requests" "trips" "ems_users" "ems_agencies"; do
    if grep -q "CREATE TABLE.*${table}" "${BACKUP_DIR}/azure_postgres_backup.sql" || \
       grep -q "COPY public.${table}" "${BACKUP_DIR}/azure_postgres_backup.sql"; then
        echo "   ✅ Found table: ${table}"
        TABLES_FOUND=$((TABLES_FOUND + 1))
    else
        echo "   ⚠️  Table not found: ${table}"
    fi
done

# Create restore script
cat > "${BACKUP_DIR}/restore-azure-database.sh" << 'RESTOREEOF'
#!/usr/bin/env bash
set -euo pipefail

# Restore Azure Database from Backup
# WARNING: This will overwrite the Azure database!

AZURE_DB_HOST="traccems-dev-pgsql.postgres.database.azure.com"
AZURE_DB_PORT="5432"
AZURE_DB_NAME="postgres"
AZURE_DB_USER="traccems_admin"
AZURE_DB_PASSWORD="password1!"

echo "⚠️  WARNING: This will restore Azure database from backup!"
echo "   Host: ${AZURE_DB_HOST}"
echo "   Database: ${AZURE_DB_NAME}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Restore cancelled."
    exit 1
fi

echo "🔄 Restoring Azure database..."
PGPASSWORD="${AZURE_DB_PASSWORD}" psql \
    -h "${AZURE_DB_HOST}" \
    -p "${AZURE_DB_PORT}" \
    -U "${AZURE_DB_USER}" \
    -d "${AZURE_DB_NAME}" \
    -f azure_postgres_backup.sql

echo "✅ Azure database restored!"
RESTOREEOF

chmod +x "${BACKUP_DIR}/restore-azure-database.sh"

# Create backup info
cat > "${BACKUP_DIR}/backup-info.txt" << EOF
Azure Database Backup
====================
Date: $(date)
Azure Host: ${AZURE_DB_HOST}
Database: ${AZURE_DB_NAME}
Backup File: azure_postgres_backup.sql
Backup Size: ${BACKUP_FILE_SIZE} (${BACKUP_SIZE} lines)

Purpose: Backup before Prisma baseline migration changes

To restore:
  cd ${BACKUP_DIR}
  ./restore-azure-database.sh

⚠️  WARNING: Restore will overwrite current Azure database!
EOF

echo ""
echo "📋 Backup Summary"
echo "=================="
echo "✅ Backup location: ${BACKUP_DIR}"
echo "✅ Backup file: azure_postgres_backup.sql"
echo "✅ Backup size: ${BACKUP_FILE_SIZE}"
echo "✅ Tables verified: ${TABLES_FOUND}/5"
echo "✅ Restore script created: restore-azure-database.sh"
echo ""
echo "🛡️  Azure database is now safely backed up!"
echo "   You can proceed with Prisma baseline changes."

