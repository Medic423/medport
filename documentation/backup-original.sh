#!/bin/bash

# TCC Project Backup Script
# Backs up the project to external drive

PROJECT_DIR="/Users/scooper/Code/tcc-new-project"
BACKUP_DIR="${1:-/Volumes/Extreme SSD Two 2TB}/tcc-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="tcc-backup-$TIMESTAMP"

echo "🔄 Starting TCC project backup..."
echo "Project: $PROJECT_DIR"
echo "Backup to: $BACKUP_DIR/$BACKUP_NAME"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
echo "📦 Creating backup..."
cp -r "$PROJECT_DIR" "$BACKUP_DIR/$BACKUP_NAME"

# Remove node_modules to save space
echo "🧹 Cleaning up node_modules..."
rm -rf "$BACKUP_DIR/$BACKUP_NAME/backend/node_modules"
rm -rf "$BACKUP_DIR/$BACKUP_NAME/frontend/node_modules"

# Create backup info file
echo "📝 Creating backup info..."
cat > "$BACKUP_DIR/$BACKUP_NAME/backup-info.txt" << EOF
TCC Project Backup
==================
Date: $(date)
Project: tcc-new-project
Phase: 3 Complete - Revenue Optimization & EMS Management
Status: Full CRUD functionality with optimization algorithms

Contents:
- Complete backend API (Node.js + Express + TypeScript)
- Complete frontend dashboard (React + TypeScript)
- Revenue optimization engine with greedy scoring
- Backhaul detection system (90 min, 15 mi radius)
- EMS Agencies management (Add/Edit/Delete/Search)
- 3 PostgreSQL database schemas
- Comprehensive test suite
- Documentation and setup scripts
- Git repository with production branch

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
1. Copy this folder to your development machine
2. Run: cd backend && npm install
3. Run: cd frontend && npm install
4. Run: ./setup.sh
5. Run: cd backend && npm run build:prod
6. Run: cd backend && npm start
7. Run: cd frontend && npm run dev
EOF

echo "✅ Backup completed: $BACKUP_DIR/$BACKUP_NAME"
echo "📊 Backup size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)"
echo "📁 Backup location: $BACKUP_DIR/$BACKUP_NAME"
