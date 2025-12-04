#!/bin/bash

# TCC Backup Milestone Marker
# Creates a milestone backup from an existing backup

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_ROOT="${1:-/Volumes/Acasis/tcc-backups}"
MILESTONE_NAME="${2}"

if [ -z "$MILESTONE_NAME" ]; then
    echo "Usage: $0 [BACKUP_ROOT] MILESTONE_NAME"
    echo ""
    echo "Examples:"
    echo "  $0 /Volumes/Acasis/tcc-backups production-deploy-20251010"
    echo "  $0 /Volumes/Acasis/tcc-backups multi-location-feature-complete"
    echo "  $0 /Volumes/Acasis/tcc-backups stable-october9"
    echo ""
    echo "Current backup structure:"
    echo "  current/ -> Latest stable backup"
    echo "  recent/ -> Last 7 days"
    echo "  milestones/ -> Special milestone backups"
    echo "  archive/ -> Organized by month"
    echo "  experimental/ -> Development backups"
    exit 1
fi

echo "🏆 Creating milestone backup: $MILESTONE_NAME"

# Check if current backup exists
if [ ! -L "$BACKUP_ROOT/current" ]; then
    echo "❌ No current backup found. Run a backup first."
    exit 1
fi

# Get the current backup path
CURRENT_BACKUP=$(readlink "$BACKUP_ROOT/current")
CURRENT_BACKUP_NAME=$(basename "$CURRENT_BACKUP")
MILESTONE_BACKUP_NAME="tcc-backup-milestone-$MILESTONE_NAME-$(date +"%Y%m%d")"

echo "📦 Current backup: $CURRENT_BACKUP_NAME"
echo "🏆 Milestone backup: $MILESTONE_BACKUP_NAME"

# Copy current backup to milestones
MILESTONE_PATH="$BACKUP_ROOT/milestones/$MILESTONE_BACKUP_NAME"
echo "📁 Copying to: $MILESTONE_PATH"

cp -r "$BACKUP_ROOT/$CURRENT_BACKUP" "$MILESTONE_PATH"

# Update milestone metadata
cat > "$MILESTONE_PATH/backup-metadata.json" << EOF
{
  "backupName": "$MILESTONE_BACKUP_NAME",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "type": "milestone",
  "milestoneName": "$MILESTONE_NAME",
  "originalBackup": "$CURRENT_BACKUP_NAME",
  "projectVersion": "Phase 3 - Production Ready",
  "description": "Milestone backup: $MILESTONE_NAME",
  "milestone": true,
  "size": {
    "project": "$(du -sh "$MILESTONE_PATH/project" | cut -f1)",
    "databases": "$(du -sh "$MILESTONE_PATH/databases" | cut -f1)",
    "total": "$(du -sh "$MILESTONE_PATH" | cut -f1)"
  }
}
EOF

# Update backup info
cat >> "$MILESTONE_PATH/backup-info.txt" << EOF

MILESTONE INFORMATION
====================
Milestone Name: $MILESTONE_NAME
Created: $(date)
Original Backup: $CURRENT_BACKUP_NAME
Milestone Backup: $MILESTONE_BACKUP_NAME

This is a milestone backup representing a significant achievement
or stable state in the TCC project development.
EOF

echo "✅ Milestone backup created successfully!"
echo "🏆 Milestone: $MILESTONE_BACKUP_NAME"
echo "📁 Location: $MILESTONE_PATH"
echo "📊 Size: $(du -sh "$MILESTONE_PATH" | cut -f1)"
echo ""
echo "🔧 To restore from milestone: cd $MILESTONE_PATH && ./restore-complete.sh"
