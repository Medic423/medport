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

# 1. Backup project files
echo "📦 Creating project backup..."
cp -r "$PROJECT_DIR" "$BACKUP_DIR/$BACKUP_NAME/project"

# Remove node_modules to save space
echo "🧹 Cleaning up node_modules..."
rm -rf "$BACKUP_DIR/$BACKUP_NAME/project/backend/node_modules"
rm -rf "$BACKUP_DIR/$BACKUP_NAME/project/frontend/node_modules"
rm -rf "$BACKUP_DIR/$BACKUP_NAME/project/node_modules"

# 2. Backup PostgreSQL databases
echo "🗄️ Backing up PostgreSQL databases..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 5
fi

# Create database backup directory
mkdir -p "$BACKUP_DIR/$BACKUP_NAME/databases"

# Backup each database
echo "📊 Backing up medport_center database..."
pg_dump -h localhost -U scooper -d medport_center > "$BACKUP_DIR/$BACKUP_NAME/databases/medport_center.sql"

echo "📊 Backing up medport_hospital database..."
pg_dump -h localhost -U scooper -d medport_hospital > "$BACKUP_DIR/$BACKUP_NAME/databases/medport_hospital.sql"

echo "📊 Backing up medport_ems database..."
pg_dump -h localhost -U scooper -d medport_ems > "$BACKUP_DIR/$BACKUP_NAME/databases/medport_ems.sql"

# 3. Create database restore script
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

# Create databases if they don't exist
echo "📊 Creating databases..."
createdb -h localhost -U scooper medport_center 2>/dev/null || true
createdb -h localhost -U scooper medport_hospital 2>/dev/null || true
createdb -h localhost -U scooper medport_ems 2>/dev/null || true

# Restore databases
echo "📊 Restoring medport_center database..."
psql -h localhost -U scooper -d medport_center < databases/medport_center.sql

echo "📊 Restoring medport_hospital database..."
psql -h localhost -U scooper -d medport_hospital < databases/medport_hospital.sql

echo "📊 Restoring medport_ems database..."
psql -h localhost -U scooper -d medport_ems < databases/medport_ems.sql

echo "✅ Database restoration completed!"
EOF

chmod +x "$BACKUP_DIR/$BACKUP_NAME/restore-databases.sh"

# 4. Create comprehensive restore script
echo "📝 Creating comprehensive restore script..."
cat > "$BACKUP_DIR/$BACKUP_NAME/restore-complete.sh" << 'EOF'
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

chmod +x "$BACKUP_DIR/$BACKUP_NAME/restore-complete.sh"

# 5. Create backup info file
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
- PostgreSQL database dumps (medport_center, medport_hospital, medport_ems)
- Database restore scripts
- Complete restoration script

Databases Included:
✅ medport_center.sql - Main TCC database
✅ medport_hospital.sql - Hospital management database  
✅ medport_ems.sql - EMS agencies database

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
echo "📊 Database size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/databases" | cut -f1)"
echo "📊 Total size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)"
echo "📁 Backup location: $BACKUP_DIR/$BACKUP_NAME"
echo ""
echo "🔧 To restore: cd $BACKUP_DIR/$BACKUP_NAME && ./restore-complete.sh"
