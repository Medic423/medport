#!/bin/bash

# TCC Project Enhanced Backup Script
# Backs up the project AND databases to external drive

PROJECT_DIR="/Users/scooper/Code/tcc-new-project"
BACKUP_DIR="${1:-/Volumes/Acasis}/tcc-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="tcc-backup-$TIMESTAMP"

echo "🔄 Starting TCC project enhanced backup..."
echo "Project: $PROJECT_DIR"
echo "Backup to: $BACKUP_DIR/$BACKUP_NAME"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

# 1. Organize documents before backup (if script exists)
if [ -f "$PROJECT_DIR/scripts/organize-documents.sh" ]; then
    echo "📁 Organizing documents before backup..."
    "$PROJECT_DIR/scripts/organize-documents.sh" --force || echo "⚠️ Document organization skipped"
fi

# 2. Backup project files
echo "📦 Creating project backup..."
cp -r "$PROJECT_DIR" "$BACKUP_DIR/$BACKUP_NAME/project"

# 3. Backup external documentation
DOCS_DIR="$HOME/Documents/tcc-project-docs"
if [ -d "$DOCS_DIR" ]; then
    echo "📚 Backing up external documentation..."
    cp -r "$DOCS_DIR" "$BACKUP_DIR/$BACKUP_NAME/documentation"
    echo "✅ Documentation backed up: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/documentation" | cut -f1)"
else
    echo "⚠️ External documentation directory not found: $DOCS_DIR"
fi

# 4. Remove node_modules to save space
echo "🧹 Cleaning up node_modules..."
rm -rf "$BACKUP_DIR/$BACKUP_NAME/project/backend/node_modules"
rm -rf "$BACKUP_DIR/$BACKUP_NAME/project/frontend/node_modules"
rm -rf "$BACKUP_DIR/$BACKUP_NAME/project/node_modules"

# 5. Backup PostgreSQL databases
echo "🗄️ Backing up PostgreSQL databases..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 5
fi

# Create database backup directory
mkdir -p "$BACKUP_DIR/$BACKUP_NAME/databases"

# Backup the single consolidated database
echo "📊 Backing up medport_ems database (consolidated TCC database)..."
pg_dump -h localhost -U scooper -d medport_ems > "$BACKUP_DIR/$BACKUP_NAME/databases/medport_ems.sql"

# 6. Create database restore script
echo "📝 Creating database restore script..."
cat > "$BACKUP_DIR/$BACKUP_NAME/restore-databases.sh" << 'EOF'
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

chmod +x "$BACKUP_DIR/$BACKUP_NAME/restore-databases.sh"

# 7. Create comprehensive restore script
echo "📝 Creating comprehensive restore script..."
cat > "$BACKUP_DIR/$BACKUP_NAME/restore-complete.sh" << 'EOF'
#!/bin/bash

# TCC Complete Restore Script
# Restores project, documentation, and databases from backup

echo "🔄 Starting TCC complete restoration..."

# 1. Restore external documentation FIRST (before project files)
DOCS_DIR="$HOME/Documents/tcc-project-docs"
if [ -d "documentation" ]; then
    echo "📚 Restoring external documentation..."
    mkdir -p "$DOCS_DIR"
    cp -r documentation/* "$DOCS_DIR/"
    echo "✅ Documentation restored to $DOCS_DIR"
else
    echo "⚠️ Documentation directory not found in backup"
fi

# 2. Restore project files
echo "📦 Restoring project files..."
if [ -d "project" ]; then
    # Remove old docs directory if it exists (to allow symlink)
    if [ -d "/Users/scooper/Code/tcc-new-project/docs" ] && [ ! -L "/Users/scooper/Code/tcc-new-project/docs" ]; then
        echo "🗑️ Removing old docs directory to make room for symlink..."
        rm -rf "/Users/scooper/Code/tcc-new-project/docs"
    fi
    
    cp -r project/* /Users/scooper/Code/tcc-new-project/
    
    # Ensure docs symlink is created
    if [ ! -L "/Users/scooper/Code/tcc-new-project/docs" ]; then
        echo "🔗 Creating docs symlink..."
        ln -s "$DOCS_DIR" "/Users/scooper/Code/tcc-new-project/docs"
    fi
    
    echo "✅ Project files restored"
else
    echo "❌ Project directory not found"
    exit 1
fi

# 3. Install dependencies
echo "📦 Installing dependencies..."
cd /Users/scooper/Code/tcc-new-project
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 4. Restore databases
echo "🗄️ Restoring databases..."
./restore-databases.sh

# 5. Generate Prisma clients
echo "🔧 Generating Prisma clients..."
cd backend
npx prisma generate
cd ..

echo "✅ Complete restoration finished!"
echo "📚 Documentation: $DOCS_DIR"
echo "📁 Project: /Users/scooper/Code/tcc-new-project"
echo "🚀 You can now run: npm run dev"
EOF

chmod +x "$BACKUP_DIR/$BACKUP_NAME/restore-complete.sh"

# 8. Create backup info file
echo "📝 Creating backup info..."
cat > "$BACKUP_DIR/$BACKUP_NAME/backup-info.txt" << EOF
TCC Project Enhanced Backup
===========================
Date: $(date)
Project: tcc-new-project
Phase: 3 Complete - Revenue Optimization & EMS Management
Status: Full CRUD functionality with optimization algorithms

Contents:
- Complete project files (source code, configs, docs)
- External documentation directory (rollback-safe)
- PostgreSQL database dump (medport_ems - consolidated TCC database)
- Database restore scripts
- Complete restoration script

Documentation:
✅ External docs directory backed up: $HOME/Documents/tcc-project-docs
✅ Rollback-safe: Documents preserved separately from code
✅ Symlinked from project: docs/ → external directory

Database Included:
✅ medport_ems.sql - Consolidated TCC database (all tables in single database)

Features Working:
✅ TCC Admin Dashboard (Hospitals, Agencies, Facilities)
✅ Healthcare Portal (Trip creation)
✅ EMS Dashboard (Trip management + Optimization)
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

Database Backup Size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/databases" | cut -f1)
Total Backup Size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
EOF

echo "✅ Enhanced backup completed: $BACKUP_DIR/$BACKUP_NAME"
echo "📊 Project size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/project" | cut -f1)"
if [ -d "$BACKUP_DIR/$BACKUP_NAME/documentation" ]; then
    echo "📊 Documentation size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/documentation" | cut -f1)"
fi
echo "📊 Database size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/databases" | cut -f1)"
echo "📊 Total size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)"
echo "📁 Backup location: $BACKUP_DIR/$BACKUP_NAME"
echo ""
echo "🔧 To restore: cd $BACKUP_DIR/$BACKUP_NAME && ./restore-complete.sh"
echo "📚 Documentation backed up separately (rollback-safe)"
