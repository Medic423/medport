# TCC Development Workflow Guide

## 🎯 **Best Practice Development Process**

### **1. Feature Development Workflow**

```bash
# 1. Start new feature
./workflow.sh start-feature feature-name

# 2. Develop and test your feature
# ... make changes, test locally ...

# 3. Finish feature (automatically tests, merges, and backs up)
./workflow.sh finish-feature
```

### **2. Manual Git Workflow (Alternative)**

```bash
# 1. Create feature branch
git checkout -b feature/new-feature-name

# 2. Develop and commit frequently
git add .
git commit -m "feat: add new dashboard widget"

# 3. Test thoroughly
npm run dev
npm test

# 4. Merge to main when complete
git checkout main
git merge feature/new-feature-name
git push origin main

# 5. Create backup
./backup.sh

# 6. Clean up
git branch -d feature/new-feature-name
```

## 🔄 **Why This Workflow is Best Practice**

### **Git Branching Benefits:**
- ✅ **Safe experimentation** - Can't break main branch
- ✅ **Easy rollback** - Can abandon feature if needed  
- ✅ **Clean history** - Main branch stays stable
- ✅ **Collaboration** - Others can review changes
- ✅ **Parallel development** - Work on multiple features

### **External Backup Benefits:**
- ✅ **Complete state capture** - Code + database + config
- ✅ **Disaster recovery** - Can restore entire environment
- ✅ **Version history** - Multiple restore points
- ✅ **Offsite protection** - External drive safety

## 🛠️ **Workflow Script Commands**

### **Start New Feature**
```bash
./workflow.sh start-feature user-authentication
```
- Creates feature branch from main
- Ensures clean working directory
- Pulls latest changes

### **Finish Feature**
```bash
./workflow.sh finish-feature
```
- Tests feature automatically
- Merges to main branch
- Creates external backup
- Cleans up feature branch

### **Create Backup**
```bash
./workflow.sh backup
```
- Backs up project files
- Backs up all databases
- Creates restore scripts

### **Restore from Backup**
```bash
./workflow.sh restore /path/to/backup
```
- Restores complete environment
- Includes project files and databases

### **List Available Backups**
```bash
./workflow.sh list-backups
```

## 📋 **Development Checklist**

### **Before Starting Feature:**
- [ ] Pull latest changes from main
- [ ] Create feature branch
- [ ] Ensure clean working directory

### **During Development:**
- [ ] Commit frequently with descriptive messages
- [ ] Test changes locally
- [ ] Keep feature branch up to date with main

### **Before Finishing Feature:**
- [ ] Test all functionality thoroughly
- [ ] Ensure no breaking changes
- [ ] Update documentation if needed
- [ ] Commit all changes

### **After Finishing Feature:**
- [ ] Feature merged to main
- [ ] External backup created
- [ ] Feature branch deleted
- [ ] Changes pushed to remote

## 🚨 **Emergency Procedures**

### **If Feature Breaks Main:**
```bash
# Rollback to last working commit
git reset --hard HEAD~1
git push --force-with-lease origin main

# Or restore from backup
./workflow.sh restore /path/to/last-working-backup
```

### **If Database Gets Corrupted:**
```bash
# Restore from backup
./workflow.sh restore /path/to/backup

# Or restore just databases
cd /path/to/backup
./restore-databases.sh
```

### **If Local Environment Breaks:**
```bash
# Nuclear reset
pkill -f 'node|npm|vite|nodemon|ts-node'
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
npm run dev
```

## 📊 **Backup Strategy**

### **Automatic Backups:**
- Created when finishing features
- Stored on external drive
- Include complete project + databases

### **Manual Backups:**
- Run `./backup.sh` before major changes
- Run `./backup.sh` before experimenting
- Run `./backup.sh` before system updates

### **Backup Locations:**
- **Primary**: `/Volumes/Acasis/tcc-backups/`
- **Naming**: `tcc-backup-YYYYMMDD_HHMMSS`
- **Retention**: Keep last 10 backups

## 🔧 **Environment Management**

### **Development Environment:**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5001
- **Database**: PostgreSQL (3 databases)
- **Start**: `npm run dev`

### **Production Environment:**
- **Frontend**: https://traccems.com
- **Backend**: https://api.traccems.com
- **Database**: PostgreSQL (production)
- **Deploy**: `./deploy-to-production.sh`

## 📝 **Commit Message Convention**

```bash
# Format: type(scope): description
git commit -m "feat(auth): add user login functionality"
git commit -m "fix(dashboard): resolve data loading issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(api): simplify trip creation logic"
```

### **Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes

## 🎯 **Best Practices Summary**

1. **Always use feature branches** for new development
2. **Test thoroughly** before merging to main
3. **Create backups** after each completed feature
4. **Commit frequently** with descriptive messages
5. **Keep main branch stable** and deployable
6. **Document changes** and update README
7. **Use the workflow script** for consistency
8. **Regular backups** prevent data loss

This workflow ensures you never lose work and can always recover from any issues!
