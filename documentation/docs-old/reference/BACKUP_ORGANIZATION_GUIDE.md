# TCC Backup Organization Guide

This document describes the new organized backup system implemented to make it easier to find and manage TCC project backups.

## 🎯 **Overview**

The backup system has been reorganized from a flat directory structure to a hierarchical organization that makes it easy to:
- Find the latest stable backup
- Access recent backups quickly
- Preserve milestone backups
- Archive old backups by month
- Separate development backups

## 📁 **Directory Structure**

```
/Volumes/Acasis/tcc-backups/
├── current/                        ← Latest stable backup (symlink)
│   └── tcc-backup-20251010_094705/
├── recent/                         ← Last 7 days of backups
│   ├── tcc-backup-20251010_094705/
│   ├── tcc-backup-20251009_143747/
│   └── tcc-backup-20251009_134659/
├── archive/                        ← Older than 7 days
│   ├── 2025-10/
│   │   ├── tcc-backup-20251008_*.*
│   │   └── tcc-backup-20251007_*.*
│   └── 2025-09/
│       └── tcc-backup-20250930_*.*
├── milestones/                     ← Special milestone backups
│   ├── tcc-backup-milestone-production-multi-location-20251010/
│   └── tcc-backup-milestone-stable-october9-20251009/
└── experimental/                   ← Development/testing backups
    └── tcc-backup-dev-*
```

## 🚀 **Quick Start**

### **Find Latest Stable Backup**
```bash
# Always know where the latest stable backup is
cd /Volumes/Acasis/tcc-backups/current
./restore-complete.sh
```

### **List All Recent Backups**
```bash
./scripts/backup-list-recent.sh
```

### **Create New Backup**
```bash
# Create stable backup (default)
./scripts/backup-enhanced-latest.sh

# Create development backup
./scripts/backup-enhanced-latest.sh /Volumes/Acasis/ dev

# Create milestone backup
./scripts/backup-enhanced-latest.sh /Volumes/Acasis/ milestone
```

## 📋 **Backup Types**

### **1. Stable Backups**
- **Purpose**: Known good, production-ready states
- **Location**: `recent/` directory
- **Current**: Symlinked to `current/`
- **Retention**: 7 days in `recent/`, then moved to `archive/`

### **2. Milestone Backups**
- **Purpose**: Special achievements or major feature completions
- **Location**: `milestones/` directory
- **Retention**: Permanent (manually managed)
- **Examples**: Production deployments, major feature completions

### **3. Development Backups**
- **Purpose**: Development and testing states
- **Location**: `experimental/` directory
- **Retention**: 3 days, then moved to `archive/`
- **Usage**: Quick testing and development iterations

### **4. Archived Backups**
- **Purpose**: Historical backups organized by month
- **Location**: `archive/YYYY-MM/` directories
- **Retention**: 6 months, then deleted
- **Organization**: Automatically organized by month

## 🛠️ **Utility Commands**

### **List and Status**
```bash
# Show backup status and organization
./scripts/backup-list-recent.sh

# Show backup status for different location
./scripts/backup-list-recent.sh /path/to/backups
```

### **Create Backups**
```bash
# Create stable backup (default)
./scripts/backup-enhanced-latest.sh

# Create development backup
./scripts/backup-enhanced-latest.sh /Volumes/Acasis/ dev

# Create experimental backup
./scripts/backup-enhanced-latest.sh /Volumes/Acasis/ experimental

# Create milestone backup
./scripts/backup-enhanced-latest.sh /Volumes/Acasis/ milestone
```

### **Mark Milestones**
```bash
# Mark current backup as milestone
./scripts/backup-mark-milestone.sh production-deploy-20251010

# Mark with custom name
./scripts/backup-mark-milestone.sh multi-location-feature-complete
```

### **Restore Operations**
```bash
# Quick restore from current stable backup
./scripts/backup-restore-current.sh

# Manual restore from any backup
cd /Volumes/Acasis/tcc-backups/recent/tcc-backup-20251010_094705
./restore-complete.sh
```

### **Maintenance**
```bash
# Clean up old archives (removes backups older than 6 months)
./scripts/backup-cleanup-archive.sh

# Organize backup history (moves old backups to archive)
./scripts/backup-organize-history.sh
```

## 📊 **Backup Metadata**

Each backup now includes a `backup-metadata.json` file with:
```json
{
  "backupName": "tcc-backup-20251010_094705",
  "timestamp": "2025-10-10T13:47:00Z",
  "type": "stable",
  "projectVersion": "Phase 3 - Production Ready",
  "description": "Enhanced TCC backup with organized structure",
  "milestone": false,
  "size": {
    "project": "45M",
    "databases": "56M",
    "total": "101M"
  }
}
```

## 🔄 **Automatic Organization**

The backup system automatically:
1. **Creates backups** in the appropriate directory based on type
2. **Updates current symlink** for stable backups
3. **Moves old backups** from `recent/` to `archive/` after 7 days
4. **Cleans up experimental** backups after 3 days
5. **Organizes archives** by month (YYYY-MM format)
6. **Removes old archives** after 6 months

## 📈 **Usage Statistics**

Current backup organization (as of implementation):
- **Total Backups**: 81
- **Total Storage**: 9.0G
- **Recent Backups**: 4 (last 7 days)
- **Milestone Backups**: 2
- **Archived Months**: 2 (2025-09, 2025-10)
- **Experimental**: 0

## 🎯 **Best Practices**

### **For Daily Development**
```bash
# Create stable backup at end of day
./scripts/backup-enhanced-latest.sh

# Create dev backup during testing
./scripts/backup-enhanced-latest.sh /Volumes/Acasis/ dev
```

### **For Major Milestones**
```bash
# Mark current state as milestone
./scripts/backup-mark-milestone.sh production-deploy-20251010

# Or create milestone backup directly
./scripts/backup-enhanced-latest.sh /Volumes/Acasis/ milestone
```

### **For Quick Recovery**
```bash
# Always use current symlink for latest stable
cd /Volumes/Acasis/tcc-backups/current
./restore-complete.sh

# Or use the utility script
./scripts/backup-restore-current.sh
```

### **For Maintenance**
```bash
# Check backup status weekly
./scripts/backup-list-recent.sh

# Clean up old archives monthly
./scripts/backup-cleanup-archive.sh
```

## 🔧 **Migration from Old System**

The old flat backup structure has been automatically migrated:
- ✅ All existing backups moved to appropriate directories
- ✅ Current stable backup symlinked
- ✅ Milestone backups created for major achievements
- ✅ Archive structure organized by month
- ✅ New scripts use organized structure

## 🚨 **Important Notes**

1. **Current Symlink**: Always points to the latest stable backup
2. **Milestone Backups**: Are permanent and should be manually managed
3. **Archive Cleanup**: Runs automatically but can be triggered manually
4. **Experimental Backups**: Auto-deleted after 3 days to save space
5. **Backup Types**: Use appropriate type for your use case

## 📞 **Troubleshooting**

### **Broken Current Symlink**
```bash
# Find latest backup and recreate symlink
cd /Volumes/Acasis/tcc-backups
LATEST=$(ls -t recent/ | head -1)
rm -f current
ln -s "recent/$LATEST" current
```

### **Missing Backup Directories**
```bash
# Recreate directory structure
mkdir -p /Volumes/Acasis/tcc-backups/{current,recent,archive,milestones,experimental}
```

### **Archive Organization**
```bash
# Manually organize archives
./scripts/backup-organize-history.sh
```

---

**This organized backup system makes it much easier to find and manage your TCC project backups, ensuring you can quickly restore to any known good state.**
