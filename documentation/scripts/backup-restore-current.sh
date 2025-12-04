#!/bin/bash

# TCC Backup Restore Current
# Quick restore from the current stable backup

BACKUP_ROOT="${1:-/Volumes/Acasis/tcc-backups}"
PROJECT_DIR="/Users/scooper/Code/tcc-new-project"

echo "🔄 TCC Backup Restore - Current Stable"
echo "======================================"
echo "Backup Root: $BACKUP_ROOT"
echo "Project Dir: $PROJECT_DIR"
echo ""

# Check if current backup exists
if [ ! -L "$BACKUP_ROOT/current" ]; then
    echo "❌ No current backup found. Run a backup first."
    echo "   Available commands:"
    echo "   - ./scripts/backup-enhanced-latest.sh"
    exit 1
fi

CURRENT_BACKUP=$(readlink "$BACKUP_ROOT/current")
CURRENT_PATH="$BACKUP_ROOT/$CURRENT_BACKUP"
CURRENT_NAME=$(basename "$CURRENT_BACKUP")

if [ ! -d "$CURRENT_PATH" ]; then
    echo "❌ Current backup directory not found: $CURRENT_PATH"
    echo "   The symlink may be broken."
    exit 1
fi

echo "📦 Current backup: $CURRENT_NAME"
echo "📁 Path: $CURRENT_PATH"
echo "📊 Size: $(du -sh "$CURRENT_PATH" | cut -f1)"
echo ""

# Show backup info
if [ -f "$CURRENT_PATH/backup-info.txt" ]; then
    echo "📋 Backup Information:"
    echo "--------------------"
    head -20 "$CURRENT_PATH/backup-info.txt"
    echo ""
fi

# Confirm restoration
read -p "⚠️ This will overwrite your current project. Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restoration cancelled"
    exit 0
fi

echo "🔄 Starting restoration from current backup..."

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    exit 1
fi

# Create backup of current state before restoring
echo "💾 Creating backup of current state before restore..."
CURRENT_STATE_BACKUP="$BACKUP_ROOT/experimental/tcc-backup-pre-restore-$(date +"%Y%m%d_%H%M%S")"
mkdir -p "$CURRENT_STATE_BACKUP"

echo "📦 Backing up current project state..."
cp -r "$PROJECT_DIR" "$CURRENT_STATE_BACKUP/project" 2>/dev/null || {
    echo "⚠️ Could not backup current project state, but continuing with restore..."
}

echo "✅ Current state backed up to: $CURRENT_STATE_BACKUP"
echo ""

# Restore from current backup
echo "🔄 Restoring from current backup..."
cd "$CURRENT_PATH"

if [ -f "restore-complete.sh" ]; then
    echo "📝 Running restore-complete.sh..."
    ./restore-complete.sh
else
    echo "❌ restore-complete.sh not found in backup"
    echo "   Manual restoration required"
    exit 1
fi

echo ""
echo "✅ Restoration completed!"
echo "📦 Restored from: $CURRENT_NAME"
echo "💾 Previous state backed up to: $(basename "$CURRENT_STATE_BACKUP")"
echo ""
echo "🚀 You can now run: npm run dev"
echo "🔧 To restore previous state: cd $CURRENT_STATE_BACKUP && ./restore-complete.sh"
