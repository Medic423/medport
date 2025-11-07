#!/bin/bash

# TCC Backup List Recent
# Lists recent backups in organized structure

BACKUP_ROOT="${1:-/Volumes/Acasis/tcc-backups}"

echo "📋 TCC Backup Status Report"
echo "=========================="
echo "Backup Root: $BACKUP_ROOT"
echo "Report Date: $(date)"
echo ""

# Current backup
echo "🔗 CURRENT STABLE BACKUP"
echo "----------------------"
if [ -L "$BACKUP_ROOT/current" ]; then
    CURRENT_BACKUP=$(readlink "$BACKUP_ROOT/current")
    CURRENT_NAME=$(basename "$CURRENT_BACKUP")
    CURRENT_PATH="$BACKUP_ROOT/$CURRENT_BACKUP"
    
    if [ -d "$CURRENT_PATH" ]; then
        CURRENT_SIZE=$(du -sh "$CURRENT_PATH" | cut -f1)
        CURRENT_DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$CURRENT_PATH")
        echo "✅ $CURRENT_NAME"
        echo "   📁 Path: $CURRENT_PATH"
        echo "   📊 Size: $CURRENT_SIZE"
        echo "   📅 Date: $CURRENT_DATE"
        
        # Show metadata if available
        if [ -f "$CURRENT_PATH/backup-metadata.json" ]; then
            echo "   📝 Metadata: Available"
        fi
    else
        echo "❌ Broken symlink: $CURRENT_BACKUP"
    fi
else
    echo "❌ No current backup symlink found"
fi

echo ""

# Recent backups
echo "📦 RECENT BACKUPS (Last 7 days)"
echo "-------------------------------"
if [ -d "$BACKUP_ROOT/recent" ]; then
    RECENT_COUNT=$(find "$BACKUP_ROOT/recent" -maxdepth 1 -type d -name "tcc-backup-*" | wc -l | tr -d ' ')
    if [ "$RECENT_COUNT" -gt 0 ]; then
        find "$BACKUP_ROOT/recent" -maxdepth 1 -type d -name "tcc-backup-*" | sort | while read -r backup_path; do
            backup_name=$(basename "$backup_path")
            backup_size=$(du -sh "$backup_path" | cut -f1)
            backup_date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$backup_path")
            is_current=""
            if [ "$backup_path" = "$CURRENT_PATH" ]; then
                is_current=" (CURRENT)"
            fi
            echo "  📁 $backup_name$is_current"
            echo "     📊 Size: $backup_size"
            echo "     📅 Date: $backup_date"
        done
    else
        echo "  No recent backups found"
    fi
else
    echo "❌ Recent directory not found"
fi

echo ""

# Milestone backups
echo "🏆 MILESTONE BACKUPS"
echo "--------------------"
if [ -d "$BACKUP_ROOT/milestones" ]; then
    MILESTONE_COUNT=$(find "$BACKUP_ROOT/milestones" -maxdepth 1 -type d -name "tcc-backup-milestone-*" | wc -l | tr -d ' ')
    if [ "$MILESTONE_COUNT" -gt 0 ]; then
        find "$BACKUP_ROOT/milestones" -maxdepth 1 -type d -name "tcc-backup-milestone-*" | sort | while read -r backup_path; do
            backup_name=$(basename "$backup_path")
            backup_size=$(du -sh "$backup_path" | cut -f1)
            backup_date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$backup_path")
            
            # Extract milestone name from backup name
            milestone_name=$(echo "$backup_name" | sed 's/tcc-backup-milestone-//' | sed 's/-[0-9]\{8\}$//')
            
            echo "  🏆 $milestone_name"
            echo "     📁 $backup_name"
            echo "     📊 Size: $backup_size"
            echo "     📅 Date: $backup_date"
        done
    else
        echo "  No milestone backups found"
    fi
else
    echo "❌ Milestones directory not found"
fi

echo ""

# Archive summary
echo "📚 ARCHIVE SUMMARY"
echo "------------------"
if [ -d "$BACKUP_ROOT/archive" ]; then
    ARCHIVE_MONTHS=$(find "$BACKUP_ROOT/archive" -maxdepth 1 -type d -name "20*" | wc -l | tr -d ' ')
    if [ "$ARCHIVE_MONTHS" -gt 0 ]; then
        echo "  Archived months: $ARCHIVE_MONTHS"
        find "$BACKUP_ROOT/archive" -maxdepth 1 -type d -name "20*" | sort | while read -r month_path; do
            month_name=$(basename "$month_path")
            month_count=$(find "$month_path" -maxdepth 1 -type d -name "tcc-backup-*" | wc -l | tr -d ' ')
            month_size=$(du -sh "$month_path" | cut -f1)
            echo "    📅 $month_name: $month_count backups ($month_size)"
        done
    else
        echo "  No archived backups found"
    fi
else
    echo "❌ Archive directory not found"
fi

echo ""

# Experimental backups
echo "🧪 EXPERIMENTAL BACKUPS"
echo "------------------------"
if [ -d "$BACKUP_ROOT/experimental" ]; then
    EXP_COUNT=$(find "$BACKUP_ROOT/experimental" -maxdepth 1 -type d -name "tcc-backup-*" | wc -l | tr -d ' ')
    if [ "$EXP_COUNT" -gt 0 ]; then
        echo "  Experimental backups: $EXP_COUNT"
        find "$BACKUP_ROOT/experimental" -maxdepth 1 -type d -name "tcc-backup-*" | sort | while read -r backup_path; do
            backup_name=$(basename "$backup_path")
            backup_size=$(du -sh "$backup_path" | cut -f1)
            backup_date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$backup_path")
            echo "    🧪 $backup_name"
            echo "       📊 Size: $backup_size"
            echo "       📅 Date: $backup_date"
        done
    else
        echo "  No experimental backups found"
    fi
else
    echo "❌ Experimental directory not found"
fi

echo ""

# Total usage
echo "💾 TOTAL USAGE"
echo "--------------"
if [ -d "$BACKUP_ROOT" ]; then
    TOTAL_SIZE=$(du -sh "$BACKUP_ROOT" | cut -f1)
    echo "  Total backup storage: $TOTAL_SIZE"
    
    # Count all backups
    TOTAL_BACKUPS=$(find "$BACKUP_ROOT" -type d -name "tcc-backup-*" | wc -l | tr -d ' ')
    echo "  Total backups: $TOTAL_BACKUPS"
else
    echo "❌ Backup root not found"
fi

echo ""
echo "🔧 Quick Commands:"
echo "  Create backup: ./scripts/backup-enhanced-latest.sh"
echo "  Mark milestone: ./scripts/backup-mark-milestone.sh [name]"
echo "  Clean archives: ./scripts/backup-cleanup-archive.sh"
