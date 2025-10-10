# TCC Developer Quick Start Guide

## 🚀 **Quick Start Commands**

### **Start Development Environment**
```bash
# Recommended: Use the unified startup wrapper
./scripts/start-dev-complete.sh

# Alternative: Direct enhanced script
./start-dev.sh

# Alternative: Manual start with health checks
cd backend && npm run dev:safe
cd frontend && npm run dev
```

### **Health Check & Troubleshooting**
```bash
# Check if everything is working
cd backend && npm run dev:health

# Clean restart if issues occur
cd backend && npm run dev:clean

# Full health check + clean restart
cd backend && npm run dev:safe
```

## 🔧 **Common Issues & Solutions**

### **"Port 5001 already in use" Error**
```bash
# Quick fix
cd backend && npm run dev:clean

# Manual cleanup
pkill -f nodemon
pkill -f "ts-node src/index.ts"
lsof -ti:5001 | xargs kill -9
```

### **APIs Not Working (Route not found)**
```bash
# Check server health
./scripts/check-server-health.sh

# If unhealthy, clean restart
./scripts/clean-restart.sh
```

### **Frontend Can't Connect to Backend**
1. Verify backend is running: `curl http://localhost:5001/health`
2. Check if APIs work: `./scripts/check-server-health.sh`
3. If issues persist: `./scripts/clean-restart.sh`

## 📋 **Development Workflow**

### **Before Starting Work**
1. Run `./scripts/check-server-health.sh` to verify system status
2. If unhealthy, run `./scripts/clean-restart.sh`
3. Start development with `./scripts/start-dev-complete.sh`

### **When Switching Branches**
1. Stop servers (`Ctrl+C`)
2. Run `cd backend && npm run dev:clean`
3. Start fresh with `./scripts/start-dev-complete.sh`

### **When APIs Stop Working**
1. Check health: `cd backend && npm run dev:health`
2. If unhealthy: `cd backend && npm run dev:clean`
3. Verify fix: `./scripts/check-server-health.sh`

## 🎯 **Key Endpoints**

- **Frontend**: http://localhost:3000
- **Backend Health**: http://localhost:5001/health
- **Units API**: http://localhost:5001/api/tcc/units
- **Dropdown Options**: http://localhost:5001/api/dropdown-options/insurance

## 📚 **Documentation**

- **Full Troubleshooting Guide**: `docs/reference/server-process-conflicts.md`
- **API Documentation**: Check individual route files in `backend/src/routes/`
- **Database Schemas**: Check `backend/prisma/` directory

## ⚡ **Pro Tips**

1. **Always use the health check** before starting development
2. **Use the unified startup script** (`./scripts/start-dev-complete.sh`) for a consistent environment
3. **Keep the troubleshooting guide handy** for quick reference
4. **Check the logs** if APIs aren't working as expected

---

**Need Help?** Check `docs/reference/server-process-conflicts.md` for detailed troubleshooting steps.
