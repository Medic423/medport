# 💾 MedPort Project Backup Strategy

## 🚨 **CRITICAL: Backup Before Database Siloing**

**Project Size**: ~917MB  
**Backup Date**: September 2, 2025  
**Purpose**: Safety backup before major database architecture changes

## 📋 **Backup Checklist**

### **1. Git Repository Backup**
- [x] **Remote Repository**: Already backed up to GitHub (https://github.com/Medic423/medport.git)
- [x] **Current Status**: All changes committed and pushed to main branch
- [x] **Last Commit**: `103952b` - "Add Database Siloing Strategy to prevent future system fragility"

### **2. Local Project Backup**
- [ ] **Full Project Copy**: Copy entire `/Users/scooper/Code/medport` directory
- [ ] **Database Dump**: Export current PostgreSQL database
- [ ] **Environment Files**: Backup all `.env` and configuration files
- [ ] **Node Modules**: Backup `node_modules` (optional - can be reinstalled)

### **3. Database Backup**
- [ ] **PostgreSQL Dump**: Full database export with schema and data
- [ ] **Migration Files**: Backup all Prisma migration files
- [ ] **Seed Data**: Backup any test/demo data

## 🛠️ **Backup Commands**

### **1. Full Project Backup**
```bash
# Navigate to parent directory
cd /Users/scooper/Code

# Create timestamped backup
cp -r medport medport-backup-$(date +%Y%m%d-%H%M%S)

# Verify backup
ls -la medport-backup-*
```

### **2. Database Backup**
```bash
# Navigate to project directory
cd /Users/scooper/Code/medport

# Create database dump
pg_dump $DATABASE_URL > backup-database-$(date +%Y%m%d-%H%M%S).sql

# Verify dump file
ls -la backup-database-*.sql
```

### **3. Environment Files Backup**
```bash
# Backup all environment files
cp backend/.env* ./
cp frontend/.env* ./
cp *.env* ./

# Create archive
tar -czf env-backup-$(date +%Y%m%d-%H%M%S).tar.gz *.env*
```

## 📦 **Recommended Backup Locations**

### **Primary Backup Locations**
1. **External Drive**: `/Volumes/[YourDriveName]/medport-backup-YYYYMMDD-HHMMSS/`
2. **Cloud Storage**: Google Drive, Dropbox, or iCloud
3. **GitHub**: Already backed up (remote repository)

### **Backup Structure**
```
medport-backup-20250902-143000/
├── medport/                    # Full project copy
├── database-backup.sql         # PostgreSQL dump
├── env-backup.tar.gz          # Environment files
└── backup-info.txt            # Backup metadata
```

## 🔍 **Backup Verification**

### **1. Project Integrity Check**
```bash
# Compare file counts
find medport -type f | wc -l
find medport-backup-* -type f | wc -l

# Compare total sizes
du -sh medport
du -sh medport-backup-*
```

### **2. Database Integrity Check**
```bash
# Test database dump
psql $DATABASE_URL < backup-database-*.sql

# Verify table counts
psql $DATABASE_URL -c "SELECT count(*) FROM \"User\";"
psql $DATABASE_URL -c "SELECT count(*) FROM \"TransportRequest\";"
```

### **3. Git Repository Check**
```bash
# Verify git status
git status
git log --oneline -5

# Check remote connection
git remote -v
git fetch origin
```

## 🚀 **Quick Backup Script**

Create this script for easy backup execution:

```bash
#!/bin/bash
# save as: backup-medport.sh

BACKUP_DIR="/Volumes/[YourDriveName]/medport-backup-$(date +%Y%m%d-%H%M%S)"
PROJECT_DIR="/Users/scooper/Code/medport"

echo "🚀 Starting MedPort backup..."
echo "📁 Backup directory: $BACKUP_DIR"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Copy project
echo "📦 Copying project files..."
cp -r "$PROJECT_DIR" "$BACKUP_DIR/"

# Database backup
echo "🗄️ Backing up database..."
cd "$PROJECT_DIR"
pg_dump $DATABASE_URL > "$BACKUP_DIR/database-backup.sql"

# Environment files
echo "🔐 Backing up environment files..."
tar -czf "$BACKUP_DIR/env-backup.tar.gz" backend/.env* frontend/.env* *.env* 2>/dev/null || true

# Create backup info
echo "📝 Creating backup info..."
cat > "$BACKUP_DIR/backup-info.txt" << EOF
MedPort Project Backup
Date: $(date)
Git Commit: $(git rev-parse HEAD)
Git Branch: $(git branch --show-current)
Project Size: $(du -sh "$PROJECT_DIR" | cut -f1)
Database URL: $DATABASE_URL
Backup Purpose: Pre-database siloing safety backup
EOF

echo "✅ Backup complete!"
echo "📁 Location: $BACKUP_DIR"
echo "📊 Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
```

## 🔄 **Restore Process**

### **If Something Goes Wrong During Database Siloing**

1. **Stop all services**
2. **Restore project files**: `cp -r medport-backup-*/medport .`
3. **Restore database**: `psql $DATABASE_URL < backup-database-*.sql`
4. **Restore environment**: `tar -xzf env-backup.tar.gz`
5. **Reinstall dependencies**: `npm install` in both backend and frontend
6. **Restart services**: Use your start script

## ⚠️ **Important Notes**

### **Before Starting Database Siloing**
- [ ] Complete all backups
- [ ] Verify backup integrity
- [ ] Test restore process (optional but recommended)
- [ ] Ensure all team members have access to backups

### **During Database Siloing**
- [ ] Keep backups accessible
- [ ] Document any issues encountered
- [ ] Have rollback plan ready

### **After Database Siloing**
- [ ] Create new backups of siloed system
- [ ] Update backup strategy for new architecture
- [ ] Archive old single-database backups

## 📞 **Emergency Contacts**

If you need help with backup/restore:
- **GitHub Repository**: https://github.com/Medic423/medport.git
- **Current Working State**: All changes committed to main branch
- **Last Stable Commit**: `103952b` - Database siloing strategy added

---

**🚨 CRITICAL: Do not proceed with database siloing until all backups are complete and verified!**

