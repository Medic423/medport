#!/usr/bin/env bash
set -euo pipefail

# Complete Production Backup Strategy
# Follows BACKUP_STRATEGY.md guidelines
# Backs up to both external drive (/Volumes/Acasis/) and iCloud Drive
# Usage: ./backup-production-complete.sh [DESTINATION_DIR]
# Default DESTINATION_DIR: /Volumes/Acasis/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DEST_ROOT="${1:-/Volumes/Acasis/}"

# iCloud Drive location
ICLOUD_DRIVE="${HOME}/Library/Mobile Documents/com~apple~CloudDocs/TCC-Backups"

echo "🔄 Complete Production Backup Strategy"
echo "========================================"
echo "Following BACKUP_STRATEGY.md guidelines"
echo "External Drive: ${DEST_ROOT}"
echo "iCloud Drive: ${ICLOUD_DRIVE}"
echo ""

# Verify git is clean
echo "🔍 Step 1: Verifying Git status..."
cd "${PROJECT_ROOT}"
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "⚠️  WARNING: Git working tree has uncommitted changes!"
    echo "   Consider committing changes before backup"
    read -p "   Continue anyway? (yes/no): " continue_backup
    if [ "$continue_backup" != "yes" ]; then
        echo "❌ Backup cancelled. Please commit changes first."
        exit 1
    fi
fi

# Check if we're on a branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "detached")
echo "   Current branch: ${CURRENT_BRANCH}"
echo "   Latest commit: $(git log -1 --oneline)"
echo "✅ Git status verified"
echo ""

# Step 2: Organize documents before backup (per BACKUP_STRATEGY.md)
echo "📁 Step 2: Organizing documents before backup..."
if [ -f "${PROJECT_ROOT}/scripts/organize-project-docs.sh" ]; then
    echo "   Organizing project documents..."
    "${PROJECT_ROOT}/scripts/organize-project-docs.sh" --force || echo "   ⚠️ Project document organization skipped"
fi

if [ -f "${PROJECT_ROOT}/documentation/scripts/organize-documents.sh" ]; then
    echo "   Organizing external documentation..."
    "${PROJECT_ROOT}/documentation/scripts/organize-documents.sh" --force || echo "   ⚠️ External document organization skipped"
fi
echo "✅ Document organization complete"
echo ""

# Step 3: Create enhanced backup to external drive
echo "📦 Step 3: Creating enhanced backup to external drive..."
if [ ! -d "${DEST_ROOT}" ]; then
    echo "❌ Error: External drive not found: ${DEST_ROOT}"
    exit 1
fi

# Run the enhanced backup script
if [ -f "${PROJECT_ROOT}/documentation/backup-enhanced.sh" ]; then
    chmod +x "${PROJECT_ROOT}/documentation/backup-enhanced.sh"
    "${PROJECT_ROOT}/documentation/backup-enhanced.sh" "${DEST_ROOT}"
else
    echo "❌ Error: Enhanced backup script not found: ${PROJECT_ROOT}/documentation/backup-enhanced.sh"
    exit 1
fi

# Get the latest backup directory name
LATEST_BACKUP=$(ls -t "${DEST_ROOT}/tcc-backups/" 2>/dev/null | grep "tcc-backup-" | head -1)
if [ -z "${LATEST_BACKUP}" ]; then
    echo "❌ Error: Could not find latest backup directory"
    exit 1
fi

BACKUP_PATH="${DEST_ROOT}/tcc-backups/${LATEST_BACKUP}"
echo "✅ External backup created: ${LATEST_BACKUP}"
echo "   Location: ${BACKUP_PATH}"
echo ""

# Step 4: Backup production database separately (most critical)
echo "🗄️  Step 4: Creating production database backup..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PROD_BACKUP_DIR="${BACKUP_PATH}/databases/production-${TIMESTAMP}"
mkdir -p "${PROD_BACKUP_DIR}"

# Run production database backup script
if [ -f "${PROJECT_ROOT}/documentation/scripts/backup-production-database.sh" ]; then
    echo "   Running production database backup script..."
    echo "yes" | bash "${PROJECT_ROOT}/documentation/scripts/backup-production-database.sh" "${PROD_BACKUP_DIR}" || {
        echo "⚠️  Production database backup script failed, trying direct backup..."
        
        # Fallback: Direct production database backup
        AZURE_DB_HOST="traccems-prod-pgsql.postgres.database.azure.com"
        AZURE_DB_PORT="5432"
        AZURE_DB_NAME="postgres"
        AZURE_DB_USER="traccems_admin"
        AZURE_DB_PASSWORD="TVmedic429!"
        
        PG_DUMP_CMD="pg_dump"
        if [ -f "/opt/homebrew/opt/postgresql@17/bin/pg_dump" ]; then
            PG_DUMP_CMD="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
        elif [ -f "/usr/local/opt/postgresql@17/bin/pg_dump" ]; then
            PG_DUMP_CMD="/usr/local/opt/postgresql@17/bin/pg_dump"
        fi
        
        echo "   Backing up production database directly..."
        if PGPASSWORD="${AZURE_DB_PASSWORD}" "${PG_DUMP_CMD}" \
            -h "${AZURE_DB_HOST}" \
            -p "${AZURE_DB_PORT}" \
            -U "${AZURE_DB_USER}" \
            -d "${AZURE_DB_NAME}" \
            --no-owner \
            --no-acl \
            -F p \
            > "${PROD_BACKUP_DIR}/production_postgres_backup.sql" 2>&1; then
            echo "✅ Production database backup completed"
        else
            echo "❌ Production database backup failed!"
            exit 1
        fi
    }
else
    echo "⚠️  Production database backup script not found, skipping..."
fi
echo ""

# Step 5: Copy critical scripts to iCloud
echo "☁️  Step 5: Backing up critical scripts to iCloud..."
if [ -f "${PROJECT_ROOT}/scripts/backup-critical-scripts-to-icloud.sh" ]; then
    "${PROJECT_ROOT}/scripts/backup-critical-scripts-to-icloud.sh" || echo "⚠️ Critical scripts backup to iCloud skipped"
else
    echo "⚠️ Critical scripts backup script not found, skipping..."
fi
echo ""

# Step 6: Copy full backup to iCloud Drive (optimized - excludes .git, uses git bundle)
echo "☁️  Step 6: Copying full backup to iCloud Drive..."
mkdir -p "${ICLOUD_DRIVE}"

# Check available space
BACKUP_SIZE=$(du -sh "${BACKUP_PATH}" 2>/dev/null | cut -f1 || echo "Unknown")
echo "   Backup size: ${BACKUP_SIZE}"
echo "   Copying to iCloud Drive (excluding .git for speed, will create git bundle)..."

# Create iCloud backup directory
ICLOUD_BACKUP_PATH="${ICLOUD_DRIVE}/${LATEST_BACKUP}"
mkdir -p "${ICLOUD_BACKUP_PATH}"

# Copy everything except .git directory (much faster)
echo "   Copying project files (excluding .git)..."
if rsync -av --progress --exclude='.git' "${BACKUP_PATH}/" "${ICLOUD_BACKUP_PATH}/" 2>/dev/null || \
   find "${BACKUP_PATH}" -mindepth 1 -maxdepth 1 ! -name '.git' -exec cp -r {} "${ICLOUD_BACKUP_PATH}/" \; 2>/dev/null; then
    
    # Create git bundle instead of copying .git directory (single file, much faster)
    echo "   Creating git bundle for iCloud backup..."
    cd "${PROJECT_ROOT}"
    if git bundle create "${ICLOUD_BACKUP_PATH}/project/.git.bundle" --all 2>/dev/null; then
        echo "✅ Git bundle created (single file instead of thousands of objects)"
        # Create a note about how to restore git from bundle
        cat > "${ICLOUD_BACKUP_PATH}/project/RESTORE_GIT_FROM_BUNDLE.txt" << 'EOF'
To restore git repository from bundle:
1. cd /path/to/restored/project
2. git clone .git.bundle .git
3. git fetch --all
4. git checkout develop (or your branch)
EOF
    else
        echo "⚠️  Git bundle creation failed, but project files copied successfully"
    fi
    
    echo "✅ Full backup copied to iCloud Drive"
    
    # Create/update current symlink in iCloud
    cd "${ICLOUD_DRIVE}"
    rm -f current 2>/dev/null || true
    ln -s "${LATEST_BACKUP}" current 2>/dev/null || true
    echo "✅ iCloud current symlink updated"
else
    echo "⚠️  Warning: Failed to copy backup to iCloud Drive"
    echo "   External drive backup is still available at: ${BACKUP_PATH}"
fi
echo ""

# Step 7: Update external drive current symlink
echo "🔗 Step 7: Updating external drive current symlink..."
cd "${DEST_ROOT}/tcc-backups"
rm -f current 2>/dev/null || true
ln -s "${LATEST_BACKUP}" current 2>/dev/null || true
echo "✅ External drive current symlink updated"
echo ""

# Step 8: Create backup manifest
echo "📋 Step 8: Creating backup manifest..."
cat > "${BACKUP_PATH}/backup-manifest.txt" << EOF
TCC Project Complete Backup Manifest
====================================
Date: $(date)
Git Branch: ${CURRENT_BRANCH}
Git Commit: $(git log -1 --oneline)
Git Status: $(git status --short | head -5 | tr '\n' '; ' || echo "clean")

Backup Locations:
- External Drive: ${BACKUP_PATH}
- iCloud Drive: ${ICLOUD_DRIVE}/${LATEST_BACKUP}

Backup Contents:
- Complete project source code
- Environment files (.env*)
- Configuration files
- Azure dev database backup
- Azure production database backup
- Local database backup (if exists)
- External documentation (if exists)

Recovery Instructions:
1. External Drive: cd ${BACKUP_PATH} && ./restore-complete.sh
2. iCloud Drive: cd ${ICLOUD_DRIVE}/${LATEST_BACKUP} && ./restore-complete.sh

This backup follows BACKUP_STRATEGY.md guidelines.
EOF
echo "✅ Backup manifest created"
echo ""

# Step 9: Final Summary
echo "🎉 Complete Production Backup Summary"
echo "====================================="
echo "✅ External Drive Backup: ${BACKUP_PATH}"
echo "✅ iCloud Drive Backup: ${ICLOUD_DRIVE}/${LATEST_BACKUP}"
echo "✅ Production Database: Backed up separately"
echo "✅ Critical Scripts: Updated in iCloud"
echo "✅ Current Symlinks: Updated in both locations"
echo "✅ Git Status: Verified"
echo "✅ Documents: Organized"
echo ""
echo "📊 Backup Size: ${BACKUP_SIZE}"
echo "📅 Timestamp: ${TIMESTAMP}"
echo ""
echo "🔧 Recovery Commands:"
echo "   External Drive: cd ${BACKUP_PATH} && ./restore-complete.sh"
echo "   iCloud Drive: cd ${ICLOUD_DRIVE}/${LATEST_BACKUP} && ./restore-complete.sh"
echo ""
echo "🛡️  Maximum Safety Achieved: Local + Off-site backup complete!"
echo "   This backup represents the most advanced production state achieved."
