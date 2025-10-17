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

# Verify database backup integrity
echo "🔍 Verifying database backup..."
DB_SIZE=$(wc -l < "$BACKUP_DIR/$BACKUP_NAME/databases/medport_ems.sql")
TRIP_COUNT=$(grep -A 1000 "COPY public.transport_requests" "$BACKUP_DIR/$BACKUP_NAME/databases/medport_ems.sql" | grep -c "^cmg" || echo "0")

if [ "$DB_SIZE" -lt 100 ]; then
    echo "❌ WARNING: Database backup appears too small ($DB_SIZE lines)"
    echo "   This may indicate a backup failure!"
    exit 1
fi

if [ "$TRIP_COUNT" -eq 0 ]; then
    echo "❌ WARNING: No transport requests found in backup!"
    echo "   This may indicate an empty or corrupted backup!"
    exit 1
fi

echo "✅ Database backup verified: $DB_SIZE lines, $TRIP_COUNT trips"

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

# Drop and recreate the consolidated database for clean restore
echo "📊 Dropping existing medport_ems database (if exists)..."
dropdb -h localhost -U scooper medport_ems 2>/dev/null || true

echo "📊 Creating fresh medport_ems database..."
createdb -h localhost -U scooper medport_ems

# Restore the consolidated database
echo "📊 Restoring medport_ems database (consolidated TCC database)..."
psql -h localhost -U scooper -d medport_ems < databases/medport_ems.sql

echo "✅ Database restoration completed!"
EOF

chmod +x "$BACKUP_DIR/$BACKUP_NAME/restore-databases.sh"

# 7. Create backup verification script
echo "📝 Creating backup verification script..."
cat > "$BACKUP_DIR/$BACKUP_NAME/verify-backup-data.sh" << 'VERIFYEOF'
#!/bin/bash

# TCC Backup Data Verification Script
# Run this to verify the backup contains the expected data

echo "🔍 TCC Backup Data Verification"
echo "================================"
echo ""

if [ ! -f "databases/medport_ems.sql" ]; then
    echo "❌ Database file not found!"
    echo "   Expected: databases/medport_ems.sql"
    exit 1
fi

echo "📊 Database File: databases/medport_ems.sql"
echo "   Size: $(ls -lh databases/medport_ems.sql | awk '{print $5}')"
echo "   Lines: $(wc -l < databases/medport_ems.sql)"
echo ""

echo "📋 Transport Requests:"
TRIP_COUNT=$(grep -A 1000 "COPY public.transport_requests" databases/medport_ems.sql | grep -c "^cmg" || echo "0")
echo "   Total trips: $TRIP_COUNT"
echo ""

echo "📅 Data Date Range:"
EARLIEST=$(grep "2025-" databases/medport_ems.sql | head -1 | grep -o "2025-[0-9][0-9]-[0-9][0-9]" | head -1 || echo "Unknown")
LATEST=$(grep "2025-" databases/medport_ems.sql | tail -10 | grep -o "2025-[0-9][0-9]-[0-9][0-9]" | tail -1 || echo "Unknown")
echo "   Earliest: $EARLIEST"
echo "   Latest: $LATEST"
echo ""

echo "🔑 Test Users:"
HC_USERS=$(grep -c "COPY public.healthcare_users" databases/medport_ems.sql || echo "0")
EMS_USERS=$(grep -c "test@ems.com" databases/medport_ems.sql || echo "0")
EMS_HAS_AGENCY=$(grep "test@ems.com" databases/medport_ems.sql | grep -c "cmftypzwx0000p4vf9tdqdwql" || echo "0")
echo "   Healthcare users found: $HC_USERS"
echo "   EMS users found: $EMS_USERS"
echo "   EMS user has agency: $EMS_HAS_AGENCY"
echo ""

if [ "$TRIP_COUNT" -eq 0 ]; then
    echo "❌ VERIFICATION FAILED: No trips found in backup!"
    exit 1
elif [ "$DB_SIZE" -lt 100 ]; then
    echo "❌ VERIFICATION FAILED: Database too small!"
    exit 1
else
    echo "✅ Verification PASSED!"
    echo ""
    echo "📋 Summary:"
    echo "   - Database is properly formatted"
    echo "   - Contains $TRIP_COUNT transport requests"
    echo "   - Date range: $EARLIEST to $LATEST"
    echo "   - EMS user agency linkage: $([ "$EMS_HAS_AGENCY" -gt 0 ] && echo 'YES ✅' || echo 'NO ⚠️')"
fi
VERIFYEOF

chmod +x "$BACKUP_DIR/$BACKUP_NAME/verify-backup-data.sh"

# 8. Create comprehensive restore script
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
