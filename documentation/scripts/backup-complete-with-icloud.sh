#!/usr/bin/env bash
set -euo pipefail

# Complete backup strategy: External drive + iCloud Drive
# This ensures maximum safety with both local and off-site copies
# Usage: scripts/backup-complete-with-icloud.sh [DESTINATION_DIR]
# Default DESTINATION_DIR: /Volumes/Acasis/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEST_ROOT="${1:-/Volumes/Acasis/}"

# iCloud Drive location
ICLOUD_DRIVE="${HOME}/Library/Mobile Documents/com~apple~CloudDocs/TCC-Backups"

echo "🔄 Complete Backup Strategy: External Drive + iCloud Drive"
echo "========================================================"
echo "External Drive: ${DEST_ROOT}"
echo "iCloud Drive: ${ICLOUD_DRIVE}"
echo ""

# Step 1: Create enhanced backup to external drive
echo "📦 Step 1: Creating enhanced backup to external drive..."
"${PROJECT_ROOT}/scripts/backup-enhanced-latest.sh" "${DEST_ROOT}"

# Get the latest backup directory name
LATEST_BACKUP=$(ls -t "${DEST_ROOT}/tcc-backups/" | grep "tcc-backup-" | head -1)
BACKUP_PATH="${DEST_ROOT}/tcc-backups/${LATEST_BACKUP}"

if [ -z "${LATEST_BACKUP}" ]; then
    echo "❌ Error: Could not find latest backup directory"
    exit 1
fi

echo "✅ External backup created: ${LATEST_BACKUP}"
echo ""

# Step 2: Copy critical scripts to iCloud
echo "☁️  Step 2: Backing up critical scripts to iCloud..."
"${PROJECT_ROOT}/scripts/backup-critical-scripts-to-icloud.sh"

# Step 3: Copy full backup to iCloud (if space allows)
echo "☁️  Step 3: Copying full backup to iCloud Drive..."
mkdir -p "${ICLOUD_DRIVE}"

# Check available space in iCloud Drive
ICLOUD_AVAILABLE=$(df -h "${ICLOUD_DRIVE}" 2>/dev/null | tail -1 | awk '{print $4}' || echo "Unknown")
BACKUP_SIZE=$(du -sh "${BACKUP_PATH}" | cut -f1)

echo "📊 Backup size: ${BACKUP_SIZE}"
echo "📊 iCloud available space: ${ICLOUD_AVAILABLE}"

# Copy the backup to iCloud
echo "📁 Copying backup to iCloud Drive..."
cp -r "${BACKUP_PATH}" "${ICLOUD_DRIVE}/"

# Create a symlink to the latest backup in iCloud
cd "${ICLOUD_DRIVE}"
rm -f current
ln -s "${LATEST_BACKUP}" current

echo "✅ Full backup copied to iCloud Drive: ${ICLOUD_DRIVE}/${LATEST_BACKUP}"
echo "✅ iCloud current symlink updated"

# Step 4: Update external drive current symlink
echo "🔗 Step 4: Updating external drive current symlink..."
cd "${DEST_ROOT}/tcc-backups"
rm -f current
ln -s "${LATEST_BACKUP}" current

echo "✅ External drive current symlink updated"

# Step 5: Summary
echo ""
echo "🎉 Complete Backup Summary"
echo "=========================="
echo "✅ External Drive Backup: ${BACKUP_PATH}"
echo "✅ iCloud Drive Backup: ${ICLOUD_DRIVE}/${LATEST_BACKUP}"
echo "✅ Critical Scripts: Updated in iCloud"
echo "✅ Current Symlinks: Updated in both locations"
echo ""
echo "🔧 Recovery Commands:"
echo "External Drive: cd ${BACKUP_PATH} && ./restore-complete.sh"
echo "iCloud Drive: cd ${ICLOUD_DRIVE}/${LATEST_BACKUP} && ./restore-complete.sh"
echo ""
echo "🛡️  Maximum Safety Achieved: Local + Off-site backup complete!"
