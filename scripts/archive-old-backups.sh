#!/bin/bash

# Archive Old TCC Backups Script
# Purpose: Organize old backup files from /Volumes/Acasis/ root into an archive directory
# Date: January 20, 2026

set -e

ACASIS_ROOT="/Volumes/Acasis"
ARCHIVE_ROOT="${ACASIS_ROOT}/tcc-backups-archive"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MANIFEST_FILE="${ARCHIVE_ROOT}/ARCHIVE_MANIFEST_${TIMESTAMP}.md"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TCC Backup Archive Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Acasis drive is mounted
if [ ! -d "$ACASIS_ROOT" ]; then
    echo "❌ Error: External drive not mounted at $ACASIS_ROOT"
    echo "   Please mount the drive and try again."
    exit 1
fi

echo "✅ External drive found: $ACASIS_ROOT"
echo ""

# Create archive directory structure
echo "📁 Creating archive directory structure..."
mkdir -p "${ARCHIVE_ROOT}/2025-09/tar-gz"
mkdir -p "${ARCHIVE_ROOT}/2025-09/directories"
mkdir -p "${ARCHIVE_ROOT}/2025-09/other"
mkdir -p "${ARCHIVE_ROOT}/2025-10/tar-gz"
mkdir -p "${ARCHIVE_ROOT}/2025-10/other"
echo "✅ Archive directories created"
echo ""

# Initialize manifest
cat > "$MANIFEST_FILE" << 'MANIFEST_HEADER'
# TCC Backup Archive Manifest
**Archive Date:** $(date)
**Archive Location:** /Volumes/Acasis/tcc-backups-archive/

## Archive Contents

### September 2025 Backups

MANIFEST_HEADER

# Function to move file and log to manifest
move_and_log() {
    local SOURCE="$1"
    local DEST="$2"
    local CATEGORY="$3"
    local DATE="$4"
    
    if [ -e "$SOURCE" ]; then
        local SIZE=$(du -sh "$SOURCE" | cut -f1)
        local FILENAME=$(basename "$SOURCE")
        
        echo "  📦 Moving: $FILENAME ($SIZE)"
        mv "$SOURCE" "$DEST"
        
        # Add to manifest
        echo "- **$FILENAME**" >> "$MANIFEST_FILE"
        echo "  - Original Location: \`$SOURCE\`" >> "$MANIFEST_FILE"
        echo "  - Archive Location: \`$DEST\`" >> "$MANIFEST_FILE"
        echo "  - Size: $SIZE" >> "$MANIFEST_FILE"
        echo "  - Category: $CATEGORY" >> "$MANIFEST_FILE"
        echo "  - Date: $DATE" >> "$MANIFEST_FILE"
        echo "" >> "$MANIFEST_FILE"
        
        return 0
    else
        echo "  ⚠️  File not found: $SOURCE"
        return 1
    fi
}

# Archive September 2025 tar.gz files
echo "📦 Archiving September 2025 tar.gz files..."
SEP_TAR_FILES=(
    "tcc-backup-20250906-163331.tar.gz"
    "tcc-backup-20250907_141335.tar.gz"
    "tcc-milestone-login-system-20250907_150447.tar.gz"
    "tcc-phase3-complete-20250908_113813.tar.gz"
    "tcc-phase3-complete-20250908_174937.tar.gz"
    "tcc-milestone-login-system-20250907_150439.tar.gz"
    "tcc-phase5-complete-20250909_163218.tar.gz"
    "tcc-phase5-complete-20250909_163237.tar.gz"
    "tcc-api-fixes-complete-20250910_170355.tar.gz"
    "tcc-complete-restore-20250910_170426.tar.gz"
    "tcc-full-backup-20250910_170405.tar.gz"
    "tcc-backup-20250913_132605.tar.gz"
    "tcc-backup-20250913_135650.tar.gz"
    "tcc-backup-20250913_140500-VICTORY.tar.gz"
    "tcc-broken-state-20250915_152642.tar.gz"
    "tcc-new-project-phase4-backup-20250917_141643.tar.gz"
)

MOVED_COUNT=0
for file in "${SEP_TAR_FILES[@]}"; do
    if move_and_log "${ACASIS_ROOT}/$file" "${ARCHIVE_ROOT}/2025-09/tar-gz/$file" "tar.gz" "September 2025"; then
        ((MOVED_COUNT++))
    fi
done
echo "✅ Moved $MOVED_COUNT September tar.gz files"
echo ""

# Archive September 2025 directories
echo "📁 Archiving September 2025 directories..."
SEP_DIRS=(
    "tcc-backup-20250909-105101"
    "current-state-backup-20250915_121514"
    "tcc-v1.1-stable-backup-20250920-135815"
    "production-config-backup-20250915_121323"
    "production-config-backup-20250915_121315"
)

MOVED_DIR_COUNT=0
for dir in "${SEP_DIRS[@]}"; do
    if move_and_log "${ACASIS_ROOT}/$dir" "${ARCHIVE_ROOT}/2025-09/directories/$dir" "directory" "September 2025"; then
        ((MOVED_DIR_COUNT++))
    fi
done
echo "✅ Moved $MOVED_DIR_COUNT September directories"
echo ""

# Archive September 2025 other files
echo "📄 Archiving September 2025 other files..."
if move_and_log "${ACASIS_ROOT}/production-config-backup-20250915_121323.zip" "${ARCHIVE_ROOT}/2025-09/other/production-config-backup-20250915_121323.zip" "zip" "September 2025"; then
    echo "✅ Moved production config zip"
fi

if move_and_log "${ACASIS_ROOT}/BACKUP_MANIFEST_20250910.md" "${ARCHIVE_ROOT}/2025-09/other/BACKUP_MANIFEST_20250910.md" "manifest" "September 2025"; then
    echo "✅ Moved backup manifest"
fi
echo ""

# Archive October 2025 files
echo "📦 Archiving October 2025 files..."
if move_and_log "${ACASIS_ROOT}/tcc-backup-20251009-163401.tar.gz" "${ARCHIVE_ROOT}/2025-10/tar-gz/tcc-backup-20251009-163401.tar.gz" "tar.gz" "October 2025"; then
    echo "✅ Moved October tar.gz file"
fi
echo ""

# Archive tcc-database-backups directory (small, but old)
if [ -d "${ACASIS_ROOT}/tcc-database-backups" ]; then
    echo "📁 Archiving tcc-database-backups directory..."
    if move_and_log "${ACASIS_ROOT}/tcc-database-backups" "${ARCHIVE_ROOT}/2025-09/other/tcc-database-backups" "directory" "September 2025"; then
        echo "✅ Moved tcc-database-backups"
    fi
fi
echo ""

# Calculate total archive size
ARCHIVE_SIZE=$(du -sh "$ARCHIVE_ROOT" | cut -f1)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Archive Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "   Archive Location: $ARCHIVE_ROOT"
echo "   Total Archive Size: $ARCHIVE_SIZE"
echo "   Manifest File: $MANIFEST_FILE"
echo ""
echo "📋 Files Archived:"
echo "   - September 2025: $MOVED_COUNT tar.gz files, $MOVED_DIR_COUNT directories"
echo "   - October 2025: 1 tar.gz file"
echo ""
echo "💡 Next Steps:"
echo "   1. Review the manifest: $MANIFEST_FILE"
echo "   2. Verify files are in archive: $ARCHIVE_ROOT"
echo "   3. If satisfied, you can delete the archive directory later if needed"
echo ""
