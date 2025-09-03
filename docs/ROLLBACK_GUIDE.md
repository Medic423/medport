# 🔄 MedPort Rollback Guide

## 🎯 **Quick Rollback Commands**

### **Rollback to Working Login System:**
```bash
# Method 1: Using the tag (RECOMMENDED)
git checkout working-login-system

# Method 2: Using commit hash
git checkout a31d69e

# Method 3: Reset main branch to working state
git reset --hard working-login-system
```

### **Verify Rollback Success:**
```bash
# Check you're on the right commit
git log --oneline -1

# Test the system
./scripts/test-rollback.sh
```

## 📋 **Rollback Checklist**

### **Before Rolling Back:**
- [ ] Save any uncommitted work: `git stash`
- [ ] Note current branch: `git branch`
- [ ] Check for uncommitted changes: `git status`

### **After Rolling Back:**
- [ ] Verify commit: `git log --oneline -1`
- [ ] Start backend: `npm run dev:backend`
- [ ] Start frontend: `npm run dev:frontend`
- [ ] Test login: `curl -X POST -H "Content-Type: application/json" -d '{"email": "hospital@medport.com", "password": "password123"}' http://localhost:5001/api/auth/login`

## 🏷️ **Available Rollback Points**

| Tag/Commit | Description | Status |
|------------|-------------|---------|
| `working-login-system` | ✅ Login system fixed and functional | **RECOMMENDED** |
| `a31d69e` | Frontend proxy fixed (port 5001) | Working |
| `b9ba96f` | JWT tokens include userType | Working |
| `ef8e9e2` | New Trip Request form functionality | Working |
| `89f2080` | Database schema cleanup | Stable |

## 🚨 **Emergency Rollback**

If everything is broken:
```bash
# Nuclear option - reset to last known good state
git fetch origin
git reset --hard origin/main
git clean -fd
```

## 🔧 **Common Rollback Issues & Solutions**

### **Issue: "Your branch is ahead of origin/main"**
**Solution:**
```bash
git push origin main  # Push your changes first
```

### **Issue: "Working tree has uncommitted changes"**
**Solution:**
```bash
git stash  # Save changes
git checkout working-login-system
# Later: git stash pop  # Restore changes
```

### **Issue: "Port already in use"**
**Solution:**
```bash
pkill -f "nodemon\|vite\|ts-node"
# Then restart services
```

## 📝 **Best Practices**

1. **Always push working commits** to origin before experimenting
2. **Use tags for stable points** instead of relying on commit hashes
3. **Test rollbacks regularly** to ensure they work
4. **Keep a backup** of your working directory before major changes
5. **Document what each commit does** in commit messages

## 🎯 **Current Working State**

**Tag:** `working-login-system`  
**Commit:** `a31d69e`  
**Status:** ✅ Fully functional login system

**What Works:**
- ✅ Backend runs on port 5001
- ✅ Frontend runs on port 3002 with correct proxy
- ✅ All three users can authenticate
- ✅ JWT tokens include userType
- ✅ Navigation system working
- ✅ No network errors

**Test Credentials:**
- `hospital@medport.com` / `password123` (HOSPITAL userType)
- `center@medport.com` / `password123` (CENTER userType)
- `ems@medport.com` / `password123` (EMS userType)
