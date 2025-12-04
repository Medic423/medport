#!/bin/bash

# TCC Backup History Organization Script
# Moves old backups from recent/ to archive/ based on age

BACKUP_ROOT="${1:-/Volumes/Acasis/tcc-backups}"
DAYS_TO_KEEP_RECENT=7
DAYS_TO_KEEP_EXPERIMENTAL=3

echo "🧹 Organizing backup history..."

if [ ! -d "$BACKUP_ROOT/recent" ]; then
    echo "❌ Recent backup directory not found: $BACKUP_ROOT/recent"
    exit 1
fi

# Ensure archive directory structure exists
mkdir -p "$BACKUP_ROOT/archive"

# Function to get year-month from backup name
get_year_month() {
    local backup_name="$1"
    # Extract YYYYMM from backup name like tcc-backup-20251010_094705
    echo "$backup_name" | sed -n 's/.*tcc-backup-\([0-9]\{4\}\)\([0-9]\{2\}\).*/\1-\2/p'
}

# Move old recent backups to archive
echo "📦 Moving old recent backups to archive..."
find "$BACKUP_ROOT/recent" -maxdepth 1 -type d -name "tcc-backup-*" -mtime +$DAYS_TO_KEEP_RECENT | while read -r backup_path; do
    backup_name=$(basename "$backup_path")
    year_month=$(get_year_month "$backup_name")
    
    if [ -n "$year_month" ]; then
        archive_dir="$BACKUP_ROOT/archive/$year_month"
        mkdir -p "$archive_dir"
        
        echo "  📁 Moving $backup_name to archive/$year_month/"
        mv "$backup_path" "$archive_dir/"
    else
        echo "  ⚠️ Could not determine date for $backup_name"
    fi
done

# Move old experimental backups to archive
echo "📦 Moving old experimental backups to archive..."
find "$BACKUP_ROOT/experimental" -maxdepth 1 -type d -name "tcc-backup-*" -mtime +$DAYS_TO_KEEP_EXPERIMENTAL | while read -r backup_path; do
    backup_name=$(basename "$backup_path")
    year_month=$(get_year_month "$backup_name")
    
    if [ -n "$year_month" ]; then
        archive_dir="$BACKUP_ROOT/archive/$year_month"
        mkdir -p "$archive_dir"
        
        echo "  📁 Moving $backup_name to archive/$year_month/"
        mv "$backup_path" "$archive_dir/"
    else
        echo "  ⚠️ Could not determine date for $backup_name"
    fi
done

# Clean up very old archives (older than 6 months)
echo "🗑️ Cleaning up very old archives..."
find "$BACKUP_ROOT/archive" -maxdepth 1 -type d -name "20*" -mtime +180 | while read -r archive_path; do
    archive_name=$(basename "$archive_path")
    echo "  🗑️ Removing old archive: $archive_name"
    rm -rf "$archive_path"
done

echo "✅ Backup history organization completed"
