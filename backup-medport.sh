#!/bin/bash
# MedPort Project Backup Script
# Run this before starting database siloing process

echo "🚀 Starting MedPort backup process..."
echo "📅 Date: $(date)"
echo ""

# Get current directory
PROJECT_DIR="/Users/scooper/Code/medport"
BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Ask user for backup location
echo "📁 Where would you like to save the backup?"
echo "1. Desktop"
echo "2. External drive (you'll need to specify path)"
echo "3. Current directory"
read -p "Choose option (1-3): " backup_option

case $backup_option in
    1)
        BACKUP_BASE="/Users/scooper/Desktop"
        ;;
    2)
        read -p "Enter full path to external drive: " BACKUP_BASE
        ;;
    3)
        BACKUP_BASE="/Users/scooper/Code"
        ;;
    *)
        echo "❌ Invalid option. Using current directory."
        BACKUP_BASE="/Users/scooper/Code"
        ;;
esac

BACKUP_DIR="$BACKUP_BASE/medport-backup-$BACKUP_TIMESTAMP"

echo ""
echo "📦 Creating backup in: $BACKUP_DIR"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Copy project files
echo "📁 Copying project files..."
cp -r "$PROJECT_DIR" "$BACKUP_DIR/"

# Database backup
echo "🗄️ Backing up database..."
cd "$PROJECT_DIR"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Loading from .env file..."
    if [ -f "backend/.env" ]; then
        export $(grep -v '^#' backend/.env | xargs)
    else
        echo "❌ No .env file found. Skipping database backup."
        echo "   You may need to manually backup the database."
    fi
fi

if [ ! -z "$DATABASE_URL" ]; then
    pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database-backup.sql"
    echo "✅ Database backup complete"
else
    echo "⚠️  Database backup skipped - no DATABASE_URL available"
fi

# Environment files backup
echo "🔐 Backing up environment files..."
tar -czf "$BACKUP_DIR/env-backup.tar.gz" backend/.env* frontend/.env* *.env* 2>/dev/null || true

# Create backup info file
echo "📝 Creating backup information..."
cat > "$BACKUP_DIR/backup-info.txt" << EOF
MedPort Project Backup
=====================
Date: $(date)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "Not a git repository")
Git Branch: $(git branch --show-current 2>/dev/null || echo "Not a git repository")
Project Size: $(du -sh "$PROJECT_DIR" | cut -f1)
Backup Size: $(du -sh "$BACKUP_DIR" | cut -f1)
Backup Purpose: Pre-database siloing safety backup

Files Included:
- Full project directory
- Database dump (if available)
- Environment files
- This information file

Restore Instructions:
1. Copy the medport directory back to /Users/scooper/Code/
2. Restore database: psql \$DATABASE_URL < database-backup.sql
3. Extract environment files: tar -xzf env-backup.tar.gz
4. Run npm install in backend and frontend directories
5. Start services using your start script

Emergency:
- GitHub Repository: https://github.com/Medic423/medport.git
- Current working state is committed to main branch
EOF

# Verify backup
echo ""
echo "🔍 Verifying backup..."
PROJECT_FILES=$(find "$PROJECT_DIR" -type f | wc -l | tr -d ' ')
BACKUP_FILES=$(find "$BACKUP_DIR" -type f | wc -l | tr -d ' ')

echo "📊 Project files: $PROJECT_FILES"
echo "📊 Backup files: $BACKUP_FILES"

if [ "$PROJECT_FILES" -le "$BACKUP_FILES" ]; then
    echo "✅ Backup verification passed"
else
    echo "⚠️  Backup verification warning - file count mismatch"
fi

echo ""
echo "🎉 Backup complete!"
echo "📁 Location: $BACKUP_DIR"
echo "📊 Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo ""
echo "🚨 IMPORTANT: Verify this backup before proceeding with database siloing!"
echo "   You can test by copying the backup to a different location and checking if it works."
echo ""
echo "📋 Next steps:"
echo "   1. Verify backup integrity"
echo "   2. Store backup in safe location (external drive, cloud storage)"
echo "   3. Proceed with database siloing strategy"
echo ""
