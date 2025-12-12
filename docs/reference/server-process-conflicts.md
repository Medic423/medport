# Server Process Conflicts - Troubleshooting Guide

## 🚨 **PROBLEM DESCRIPTION**

A recurring issue where the TCC backend server fails to start or API routes become unresponsive due to multiple conflicting Node.js processes running simultaneously on port 5001.

### **Symptoms:**
- `Error: listen EADDRINUSE: address already in use :::5001`
- API routes return "Route not found" or generic error messages
- Server appears to start but routes don't work properly
- Multiple nodemon/ts-node processes visible in `ps aux`

### **Impact:**
- Units API (`/api/tcc/units`) fails to load EMS units
- Dropdown Options API (`/api/dropdown-options/insurance`) fails to load options
- Frontend modules become non-functional
- Development workflow is disrupted

## 🔍 **ROOT CAUSE ANALYSIS**

### **Primary Cause:**
Multiple Node.js processes (nodemon, ts-node) running simultaneously, competing for port 5001.

### **Contributing Factors:**
1. **Incomplete process cleanup** - Previous server instances not properly terminated
2. **IDE/terminal restarts** - New processes started without killing old ones
3. **File watching conflicts** - Multiple nodemon instances watching same files
4. **Development workflow** - Switching between different development modes

### **Technical Details:**
- Express server fails to bind to port 5001 (already in use)
- Route registration may fail silently due to compilation errors
- TypeScript compilation errors prevent proper module loading
- Database connections may be held by zombie processes

## 🛠️ **IMMEDIATE RESOLUTION STEPS**

### **Step 1: Kill All Conflicting Processes**
```bash
# Kill all nodemon processes
pkill -f nodemon

# Kill all ts-node processes  
pkill -f "ts-node src/index.ts"

# Kill any process using port 5001
lsof -ti:5001 | xargs kill -9

# Verify no processes are running
ps aux | grep -E "(nodemon|ts-node)" | grep -v grep
```

### **Step 2: Clean Restart**
```bash
cd /Users/scooper/Code/tcc-new-project/backend
npm run dev
```

### **Step 3: Verify Fix**
```bash
# Test health endpoint
curl -s http://localhost:5001/health | jq .

# Test units API
curl -s http://localhost:5001/api/tcc/units \
  -H "Authorization: Bearer $TOKEN" | jq '.success'

# Test dropdown options API
curl -s http://localhost:5001/api/dropdown-options/insurance \
  -H "Authorization: Bearer $TOKEN" | jq '.success'
```

## 🚫 **PREVENTION STRATEGIES**

### **1. Improved Startup Scripts**

#### **Enhanced start-dev.sh:**
```bash
#!/bin/bash
# Enhanced development startup script with process cleanup

echo "🧹 Cleaning up existing processes..."

# Kill existing processes
pkill -f nodemon 2>/dev/null || true
pkill -f "ts-node src/index.ts" 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

echo "⏳ Waiting for port to be released..."
sleep 2

echo "🚀 Starting TCC Backend server..."
cd backend && npm run dev
```

#### **Health Check Script (scripts/check-server-health.sh):**
```bash
#!/bin/bash
# Server health check and process management

PORT=5001
HEALTH_URL="http://localhost:$PORT/health"

echo "🔍 Checking server health..."

# Check if port is in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null; then
    echo "✅ Port $PORT is in use"
    
    # Test health endpoint
    if curl -s $HEALTH_URL > /dev/null; then
        echo "✅ Server is healthy"
        exit 0
    else
        echo "❌ Server is not responding"
        echo "🧹 Cleaning up processes..."
        pkill -f nodemon
        pkill -f "ts-node src/index.ts"
        lsof -ti:$PORT | xargs kill -9
        exit 1
    fi
else
    echo "❌ Port $PORT is not in use"
    exit 1
fi
```

### **2. Package.json Scripts Enhancement**

Add to `backend/package.json`:
```json
{
  "scripts": {
    "dev:clean": "pkill -f nodemon; pkill -f 'ts-node src/index.ts'; lsof -ti:5001 | xargs kill -9; sleep 2; npm run dev",
    "dev:health": "node scripts/check-server-health.js",
    "dev:safe": "npm run dev:health && npm run dev:clean"
  }
}
```

### **3. Development Workflow Guidelines**

#### **Before Starting Development:**
1. Always run `npm run dev:health` to check server status
2. If unhealthy, run `npm run dev:clean` to clean restart
3. Verify APIs are working before continuing development

#### **When Switching Branches:**
1. Stop the server (`Ctrl+C`)
2. Run cleanup script
3. Start fresh with `npm run dev`

#### **IDE/Editor Integration:**
- Configure VS Code tasks to run cleanup before starting server
- Use terminal profiles that include process cleanup
- Set up workspace settings for consistent development environment

## 📋 **TROUBLESHOOTING CHECKLIST**

### **When APIs Stop Working:**
- [ ] Check if server is running: `curl http://localhost:5001/health`
- [ ] Check for multiple processes: `ps aux | grep nodemon`
- [ ] Check port usage: `lsof -i :5001`
- [ ] Kill conflicting processes
- [ ] Restart server cleanly
- [ ] Test all critical APIs

### **When Server Won't Start:**
- [ ] Check port availability: `lsof -i :5001`
- [ ] Kill all Node processes: `pkill -f node`
- [ ] Check for TypeScript errors: `npm run build`
- [ ] Verify environment variables
- [ ] Check database connections

## 🔧 **MONITORING & ALERTING**

### **Process Monitoring Script:**
```bash
#!/bin/bash
# Monitor for multiple server processes

while true; do
    PROCESS_COUNT=$(ps aux | grep -c "nodemon src/index.ts")
    if [ $PROCESS_COUNT -gt 1 ]; then
        echo "⚠️  WARNING: Multiple server processes detected ($PROCESS_COUNT)"
        echo "Run: pkill -f nodemon && npm run dev"
    fi
    sleep 30
done
```

## 📚 **HISTORICAL CONTEXT**

### **Incidents:**
1. **2025-09-10 18:30Z** - Dropdown options API failing
2. **2025-09-10 20:44Z** - Units API failing, both APIs down
3. **2025-09-10 20:52Z** - Resolved by process cleanup

### **Pattern:**
- Issue occurs when switching between development modes
- Multiple terminal sessions running simultaneously
- Incomplete process cleanup during development

## 🎯 **LONG-TERM SOLUTIONS**

### **1. Process Management**
- Implement proper process lifecycle management
- Add process monitoring and auto-cleanup
- Use PM2 for production-like process management in development

### **2. Development Environment**
- Containerize development environment (Docker)
- Use development-specific port allocation
- Implement proper workspace isolation

### **3. CI/CD Integration**
- Add health checks to deployment pipeline
- Implement automated testing for API endpoints
- Add process monitoring to development workflow

## 📞 **ESCALATION**

If this issue persists after following all steps:
1. Document the exact error messages and process list
2. Check for system-level port conflicts
3. Consider restarting the development machine
4. Review recent changes to development environment

---

**Last Updated:** 2025-09-10 20:52Z  
**Author:** AI Assistant  
**Status:** Resolved - Prevention measures implemented
