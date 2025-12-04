#!/bin/bash

# TCC Backup Archive Cleanup
# Removes old archived backups to free up space

BACKUP_ROOT="${1:-/Volumes/Acasis/tcc-backups}"
DAYS_TO_KEEP=180  # 6 months

echo "🧹 TCC Backup Archive Cleanup"
echo "============================="
echo "Backup Root: $BACKUP_ROOT"
echo "Keeping archives newer than: $DAYS_TO_KEEP days"
echo ""

if [ ! -d "$BACKUP_ROOT/archive" ]; then
    echo "❌ Archive directory not found: $BACKUP_ROOT/archive"
    exit 1
fi

# Show what will be deleted
echo "📋 Archives to be cleaned up:"
DELETED_COUNT=0
DELETED_SIZE=0

find "$BACKUP_ROOT/archive" -maxdepth 2 -type d -name "tcc-backup-*" -mtime +$DAYS_TO_KEEP | while read -r backup_path; do
    backup_name=$(basename "$backup_path")
    backup_size=$(du -sk "$backup_path" | cut -f1)
    backup_date=$(stat -f "%Sm" -t "%Y-%m-%d" "$backup_path")
    
    echo "  🗑️ $backup_name"
    echo "     📅 Date: $backup_date"
    echo "     📊 Size: $(numfmt --to=iec --suffix=B $((backup_size * 1024)))"
done

echo ""
read -p "⚠️ Do you want to delete these old backups? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo "🗑️ Deleting old archived backups..."

# Delete old archives
DELETED_COUNT=0
DELETED_SIZE=0

find "$BACKUP_ROOT/archive" -maxdepth 2 -type d -name "tcc-backup-*" -mtime +$DAYS_TO_KEEP | while read -r backup_path; do
    backup_name=$(basename "$backup_path")
    backup_size=$(du -sk "$backup_path" | cut -f1)
    
    echo "  🗑️ Deleting: $backup_name"
    rm -rf "$backup_path"
    
    DELETED_COUNT=$((DELETED_COUNT + 1))
    DELETED_SIZE=$((DELETED_SIZE + backup_size))
done

# Clean up empty month directories
echo "🧹 Cleaning up empty month directories..."
find "$BACKUP_ROOT/archive" -maxdepth 1 -type d -name "20*" -empty -delete

echo ""
echo "✅ Archive cleanup completed!"
echo "📊 Deleted backups: $DELETED_COUNT"
echo "📊 Space freed: $(numfmt --to=iec --suffix=B $((DELETED_SIZE * 1024)))"

# Show remaining archives
echo ""
echo "📚 Remaining archives:"
if [ -d "$BACKUP_ROOT/archive" ]; then
    REMAINING_MONTHS=$(find "$BACKUP_ROOT/archive" -maxdepth 1 -type d -name "20*" | wc -l | tr -d ' ')
    if [ "$REMAINING_MONTHS" -gt 0 ]; then
        find "$BACKUP_ROOT/archive" -maxdepth 1 -type d -name "20*" | sort | while read -r month_path; do
            month_name=$(basename "$month_path")
            month_count=$(find "$month_path" -maxdepth 1 -type d -name "tcc-backup-*" | wc -l | tr -d ' ')
            month_size=$(du -sh "$month_path" | cut -f1)
            echo "  📅 $month_name: $month_count backups ($month_size)"
        done
    else
        echo "  No remaining archives"
    fi
fi
