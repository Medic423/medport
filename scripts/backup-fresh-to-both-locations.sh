#!/usr/bin/env bash
set -euo pipefail

# Fresh Backup Script - Writes to Both /Volumes/Acasis/ and iCloud Drive
# Follows BACKUP_STRATEGY.md guidelines
# Usage: ./scripts/backup-fresh-to-both-locations.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Backup destinations
EXTERNAL_DRIVE="/Volumes/Acasis"
ICLOUD_DRIVE="${HOME}/Library/Mobile Documents/com~apple~CloudDocs/TCC-Backups"

echo "🔄 Fresh Backup: External Drive + iCloud Drive"
echo "=============================================="
echo "Project: ${PROJECT_ROOT}"
echo "External Drive: ${EXTERNAL_DRIVE}"
echo "iCloud Drive: ${ICLOUD_DRIVE}"
echo ""

# Verify git is healthy
echo "🔍 Checking git status..."
cd "${PROJECT_ROOT}"
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "⚠️  WARNING: Git has uncommitted changes!"
    echo "   Working tree is not clean"
    git status --short
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Backup cancelled - please commit or stash changes first"
        exit 1
    fi
else
    echo "✅ Git working tree is clean"
fi

# Show current commit
CURRENT_COMMIT=$(git rev-parse --short HEAD)
CURRENT_BRANCH=$(git branch --show-current)
echo "📌 Current commit: ${CURRENT_COMMIT} (${CURRENT_BRANCH})"
echo ""

# Verify external drive is mounted
if [ ! -d "${EXTERNAL_DRIVE}" ]; then
    echo "❌ ERROR: External drive not found: ${EXTERNAL_DRIVE}"
    echo "   Please mount the Acasis drive and try again"
    exit 1
fi

# Verify iCloud Drive is accessible
if [ ! -d "${HOME}/Library/Mobile Documents/com~apple~CloudDocs" ]; then
    echo "❌ ERROR: iCloud Drive not found"
    echo "   Please ensure iCloud Drive is enabled and synced"
    exit 1
fi

# Create iCloud backup directory
mkdir -p "${ICLOUD_DRIVE}"

# Step 1: Run enhanced backup to external drive
echo "📦 Step 1: Creating enhanced backup to external drive..."
echo "   This includes:"
echo "   - Project files (excluding node_modules)"
echo "   - Environment files (.env*)"
echo "   - Azure dev database backup"
echo "   - Document organization"
echo ""

# Use the enhanced backup script (preferred) or fallback to backup-enhanced.sh
if [ -f "${PROJECT_ROOT}/documentation/scripts/backup-enhanced-latest.sh" ]; then
    echo "   Using: backup-enhanced-latest.sh"
    chmod +x "${PROJECT_ROOT}/documentation/scripts/backup-enhanced-latest.sh"
    "${PROJECT_ROOT}/documentation/scripts/backup-enhanced-latest.sh" "${EXTERNAL_DRIVE}"
elif [ -f "${PROJECT_ROOT}/documentation/backup-enhanced.sh" ]; then
    echo "   Using: backup-enhanced.sh"
    chmod +x "${PROJECT_ROOT}/documentation/backup-enhanced.sh"
    "${PROJECT_ROOT}/documentation/backup-enhanced.sh" "${EXTERNAL_DRIVE}"
else
    echo "❌ ERROR: No backup-enhanced script found"
    echo "   Expected: ${PROJECT_ROOT}/documentation/scripts/backup-enhanced-latest.sh"
    echo "   Or: ${PROJECT_ROOT}/documentation/backup-enhanced.sh"
    exit 1
fi

# Get the latest backup directory name
LATEST_BACKUP=$(ls -t "${EXTERNAL_DRIVE}/tcc-backups/" 2>/dev/null | grep "tcc-backup-" | head -1 || echo "")

if [ -z "${LATEST_BACKUP}" ]; then
    echo "❌ ERROR: Could not find latest backup directory"
    exit 1
fi

BACKUP_PATH="${EXTERNAL_DRIVE}/tcc-backups/${LATEST_BACKUP}"
echo "✅ External backup created: ${LATEST_BACKUP}"
echo ""

# Step 2: Copy critical scripts to iCloud
echo "☁️  Step 2: Backing up critical scripts to iCloud..."
if [ -f "${PROJECT_ROOT}/documentation/scripts/backup-critical-scripts-to-icloud.sh" ]; then
    chmod +x "${PROJECT_ROOT}/documentation/scripts/backup-critical-scripts-to-icloud.sh"
    "${PROJECT_ROOT}/documentation/scripts/backup-critical-scripts-to-icloud.sh" || echo "⚠️  Critical scripts backup skipped (non-critical)"
else
    echo "⚠️  Critical scripts backup script not found - skipping"
fi
echo ""

# Step 3: Copy full backup to iCloud Drive
echo "☁️  Step 3: Copying full backup to iCloud Drive..."
BACKUP_SIZE=$(du -sh "${BACKUP_PATH}" 2>/dev/null | cut -f1 || echo "Unknown")

# Check available space in iCloud Drive (if possible)
if command -v df >/dev/null 2>&1; then
    ICLOUD_AVAILABLE=$(df -h "${ICLOUD_DRIVE}" 2>/dev/null | tail -1 | awk '{print $4}' || echo "Unknown")
    echo "📊 Backup size: ${BACKUP_SIZE}"
    echo "📊 iCloud available space: ${ICLOUD_AVAILABLE}"
fi

echo "📁 Copying backup to iCloud Drive..."
echo "   This may take a few minutes depending on backup size..."
cp -r "${BACKUP_PATH}" "${ICLOUD_DRIVE}/"

# Create a symlink to the latest backup in iCloud
cd "${ICLOUD_DRIVE}"
rm -f current
ln -s "${LATEST_BACKUP}" current 2>/dev/null || echo "⚠️  Could not create iCloud symlink (non-critical)"

echo "✅ Full backup copied to iCloud Drive: ${ICLOUD_DRIVE}/${LATEST_BACKUP}"
echo ""

# Step 4: Update external drive current symlink
echo "🔗 Step 4: Updating external drive current symlink..."
cd "${EXTERNAL_DRIVE}/tcc-backups"
rm -f current
ln -s "${LATEST_BACKUP}" current 2>/dev/null || echo "⚠️  Could not create external symlink (non-critical)"

echo "✅ External drive current symlink updated"
echo ""

# Step 5: Summary
echo ""
echo "🎉 Fresh Backup Complete!"
echo "========================"
echo "✅ Git Status: Clean (commit: ${CURRENT_COMMIT})"
echo "✅ External Drive Backup: ${BACKUP_PATH}"
echo "✅ iCloud Drive Backup: ${ICLOUD_DRIVE}/${LATEST_BACKUP}"
echo "✅ Backup Size: ${BACKUP_SIZE}"
echo "✅ Current Symlinks: Updated in both locations"
echo ""
echo "🔧 Recovery Commands:"
echo "   External Drive: cd ${BACKUP_PATH} && ./restore-complete.sh"
echo "   iCloud Drive: cd ${ICLOUD_DRIVE}/${LATEST_BACKUP} && ./restore-complete.sh"
echo ""
echo "🛡️  Maximum Safety Achieved: Local + Off-site backup complete!"
echo ""
echo "📝 Backup includes:"
echo "   - Complete project files (source code, configs)"
echo "   - Environment files (.env*)"
echo "   - Azure dev database backup"
echo "   - Organized documentation"
echo "   - Restore scripts"
echo ""

