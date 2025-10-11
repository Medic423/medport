#!/bin/bash

# TCC Project Enhanced Backup Script - Organized Structure
# Backs up the project AND databases to organized external drive structure

PROJECT_DIR="/Users/scooper/Code/tcc-new-project"
BACKUP_ROOT="${1:-/Volumes/Acasis}/tcc-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_TYPE="${2:-stable}"  # stable, dev, experimental, milestone
BACKUP_NAME="tcc-backup-$TIMESTAMP"

echo "🔄 Starting TCC project enhanced backup (organized structure)..."
echo "Project: $PROJECT_DIR"
echo "Backup type: $BACKUP_TYPE"
echo "Backup to: $BACKUP_ROOT/$BACKUP_TYPE/$BACKUP_NAME"

# Ensure organized directory structure exists
mkdir -p "$BACKUP_ROOT"/{current,recent,archive,milestones,experimental}

# Determine backup destination based on type
if [ "$BACKUP_TYPE" = "milestone" ]; then
    BACKUP_DEST="$BACKUP_ROOT/milestones/$BACKUP_NAME"
elif [ "$BACKUP_TYPE" = "experimental" ]; then
    BACKUP_DEST="$BACKUP_ROOT/experimental/$BACKUP_NAME"
else
    BACKUP_DEST="$BACKUP_ROOT/recent/$BACKUP_NAME"
fi

# Create backup directory
mkdir -p "$BACKUP_DEST"

echo "📁 Backup destination: $BACKUP_DEST"

# 1. Backup project files
echo "📦 Creating project backup..."
cp -r "$PROJECT_DIR" "$BACKUP_DEST/project"

# Remove node_modules to save space
echo "🧹 Cleaning up node_modules..."
rm -rf "$BACKUP_DEST/project/backend/node_modules"
rm -rf "$BACKUP_DEST/project/frontend/node_modules"
rm -rf "$BACKUP_DEST/project/node_modules"

# 2. Backup PostgreSQL databases
echo "🗄️ Backing up PostgreSQL databases..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 5
fi

# Create database backup directory
mkdir -p "$BACKUP_DEST/databases"

# Backup the single consolidated database
echo "📊 Backing up medport_ems database (consolidated TCC database)..."
pg_dump -h localhost -U scooper -d medport_ems > "$BACKUP_DEST/databases/medport_ems.sql"

# 3. Create database restore script
echo "📝 Creating database restore script..."
cat > "$BACKUP_DEST/restore-databases.sh" << 'EOF'
#!/bin/bash

# TCC Database Restore Script
# Restores PostgreSQL databases from backup

echo "🔄 Restoring TCC databases..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 5
fi

# Create the single consolidated database if it doesn't exist
echo "📊 Creating consolidated TCC database..."
createdb -h localhost -U scooper medport_ems 2>/dev/null || true

# Restore the consolidated database
echo "📊 Restoring medport_ems database (consolidated TCC database)..."
psql -h localhost -U scooper -d medport_ems < databases/medport_ems.sql

echo "✅ Database restoration completed!"
EOF

chmod +x "$BACKUP_DEST/restore-databases.sh"

# 4. Create comprehensive restore script
echo "📝 Creating comprehensive restore script..."
cat > "$BACKUP_DEST/restore-complete.sh" << 'EOF'
#!/bin/bash

# TCC Complete Restore Script
# Restores project and databases from backup

echo "🔄 Starting TCC complete restoration..."

# 1. Restore project files
echo "📦 Restoring project files..."
if [ -d "project" ]; then
    cp -r project/* /Users/scooper/Code/tcc-new-project/
    echo "✅ Project files restored"
else
    echo "❌ Project directory not found"
    exit 1
fi

# 2. Install dependencies
echo "📦 Installing dependencies..."
cd /Users/scooper/Code/tcc-new-project
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Restore databases
echo "🗄️ Restoring databases..."
./restore-databases.sh

# 4. Generate Prisma clients
echo "🔧 Generating Prisma clients..."
cd backend
npx prisma generate
cd ..

echo "✅ Complete restoration finished!"
echo "🚀 You can now run: npm run dev"
EOF

chmod +x "$BACKUP_DEST/restore-complete.sh"

# 5. Create backup metadata file
echo "📝 Creating backup metadata..."
cat > "$BACKUP_DEST/backup-metadata.json" << EOF
{
  "backupName": "$BACKUP_NAME",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "type": "$BACKUP_TYPE",
  "projectVersion": "Phase 3 - Production Ready",
  "description": "Enhanced TCC backup with organized structure",
  "milestone": "$([ "$BACKUP_TYPE" = "milestone" ] && echo "true" || echo "false")",
  "size": {
    "project": "$(du -sh "$BACKUP_DEST/project" | cut -f1)",
    "databases": "$(du -sh "$BACKUP_DEST/databases" | cut -f1)",
    "total": "$(du -sh "$BACKUP_DEST" | cut -f1)"
  }
}
EOF

# 6. Create backup info file
echo "📝 Creating backup info..."
cat > "$BACKUP_DEST/backup-info.txt" << EOF
TCC Project Enhanced Backup - Organized Structure
================================================
Date: $(date)
Project: tcc-new-project
Backup Type: $BACKUP_TYPE
Phase: 3 Complete - Production Deployment Ready
Status: Full CRUD functionality with production deployment

Contents:
- Complete project files (source code, configs, docs)
- PostgreSQL database dump (medport_ems - consolidated TCC database)
- Database restore scripts
- Complete restoration script
- Backup metadata (JSON)

Database Included:
✅ medport_ems.sql - Consolidated TCC database (all tables in single database)

Features Working:
✅ TCC Admin Dashboard (Hospitals, Agencies, Facilities)
✅ Healthcare Portal (Trip creation + Multi-location support)
✅ EMS Dashboard (Trip management + Optimization)
✅ Production Deployment (Vercel)
✅ Multi-location User Management
✅ JSON API Error Resolution
✅ Revenue Optimization Engine
✅ Backhaul Detection System
✅ Complete CRUD operations
✅ Search and filtering
✅ Authentication system

To restore:
1. Run: ./restore-complete.sh
2. Or manually:
   - Copy project files to /Users/scooper/Code/tcc-new-project/
   - Run: ./restore-databases.sh
   - Install dependencies: npm install
   - Start: npm run dev

Database Backup Size: $(du -sh "$BACKUP_DEST/databases" | cut -f1)
Total Backup Size: $(du -sh "$BACKUP_DEST" | cut -f1)
EOF

# 7. Update current symlink if this is a stable backup
if [ "$BACKUP_TYPE" = "stable" ]; then
    echo "🔗 Updating current symlink..."
    rm -f "$BACKUP_ROOT/current"
    ln -s "recent/$BACKUP_NAME" "$BACKUP_ROOT/current"
    echo "✅ Current symlink updated to: recent/$BACKUP_NAME"
fi

# 8. Clean up old backups (move to archive)
echo "🧹 Organizing backup history..."
"$(dirname "$0")/scripts/backup-organize-history.sh" "$BACKUP_ROOT"

echo "✅ Enhanced backup completed: $BACKUP_DEST"
echo "📊 Project size: $(du -sh "$BACKUP_DEST/project" | cut -f1)"
echo "📊 Database size: $(du -sh "$BACKUP_DEST/databases" | cut -f1)"
echo "📊 Total size: $(du -sh "$BACKUP_DEST" | cut -f1)"
echo "📁 Backup location: $BACKUP_DEST"
echo ""
if [ "$BACKUP_TYPE" = "stable" ]; then
    echo "🔗 Current stable backup: $BACKUP_ROOT/current"
fi
echo "🔧 To restore: cd $BACKUP_DEST && ./restore-complete.sh"
