# Azure App Service Backend Startup Issue - npm install Hanging

## Problem Summary

Azure App Service backend (`TraccEms-Dev-Backend`) is failing to start because `npm install` hangs during dependency installation. The process starts installing packages but then stalls with no output for extended periods (15+ minutes observed).

**Current State:**
- Backend deployment succeeds (ZIP Deploy works)
- Azure startup script executes
- Custom `startup.sh` script runs and detects missing `node_modules`
- `npm install` starts but hangs after ~2 minutes of package installation
- No error messages, just stops outputting logs
- Backend never starts because dependencies aren't installed

**Last Log Entry:**
```
2026-01-06T18:00:56.3616602Z npm http cache ms@https://registry.npmjs.org/ms/-/ms-2.1.3.tgz 0ms (cache hit)
```
Then nothing for 15+ minutes.

## Environment Details

- **App Service:** TraccEms-Dev-Backend (Linux, Node.js 24-lts)
- **Resource Group:** TraccEms-Dev-USCentral
- **Region:** Central US
- **Deployment Method:** GitHub Actions → Azure Web Apps Deploy (ZIP Deploy)
- **Startup Command:** `./startup.sh` (custom script)

## What We've Tried

### 1. Initial Problem: ZIP Deploy Size Limit
- **Issue:** `node_modules` (184MB) exceeded Azure ZIP Deploy size limits (~100MB)
- **Fix:** Remove `node_modules` before deployment, install in startup script
- **Result:** ✅ Deployment now succeeds

### 2. Azure Startup Script Interference
- **Issue:** Azure's built-in script removes `/node_modules` and tries to extract `node_modules.tar.gz`
- **Fix:** Custom `startup.sh` removes tar.gz and installs dependencies if needed
- **Result:** ✅ Script runs correctly, detects missing dependencies

### 3. npm ci Hanging
- **Issue:** `npm ci` consistently hangs after ~2 minutes
- **Attempts:**
  - Added timeout command (not available in Azure environment)
  - Background process with manual kill (didn't work)
  - Fallback to `npm install` (also hangs)
- **Result:** ❌ Both `npm ci` and `npm install` hang

### 4. Simplified npm install
- **Current Approach:** Simplified startup script to use `npm install` with optimized flags
- **Flags Used:** `--omit=dev --prefer-offline --no-audit --loglevel=error`
- **Result:** ❌ Still hangs after ~2 minutes

### 5. App Service Restart Attempts
- **Tried:** `az webapp restart`, `az webapp stop/start`
- **Result:** Process appears to restart but `npm install` still hangs

## Current Startup Script

```bash
#!/bin/bash
cd /home/site/wwwroot

# Remove tar.gz if it exists
if [ -f node_modules.tar.gz ]; then
    echo "Removing node_modules.tar.gz..."
    rm -f node_modules.tar.gz
fi

# Check if /node_modules is empty or missing
if [ ! -d /node_modules ] || [ -z "$(ls -A /node_modules 2>/dev/null)" ]; then
    echo "node_modules is missing or empty. Installing dependencies..."
    echo "Using npm install with optimized flags (npm ci hangs in Azure)..."
    
    npm install --omit=dev --prefer-offline --no-audit --loglevel=error
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully."
    else
        echo "⚠️ npm install exited with error code $?. Continuing anyway..."
    fi
else
    echo "node_modules already exists, skipping install."
fi

# Start the application
echo "Starting application..."
npm start
```

## Key Observations

1. **npm install starts successfully** - We see package cache hits and installation progress
2. **Hangs after ~2 minutes** - Process stops outputting but doesn't exit
3. **No error messages** - Process doesn't crash, just stops responding
4. **Cache hits work** - Many packages install from cache successfully before hang
5. **Happens consistently** - Both `npm ci` and `npm install` exhibit same behavior
6. **App Service state:** Running, but backend never starts

## Possible Root Causes

1. **Network/Registry Issue:** npm registry connection timeout or rate limiting
2. **Azure Environment Issue:** Resource constraints or process limits
3. **Specific Package Issue:** A particular package causing the hang
4. **npm Cache Issue:** Corrupted npm cache in Azure environment
5. **Process Signal Handling:** npm not responding to signals properly
6. **File System Issue:** Permissions or I/O problems with `/node_modules`

## Logical Next Steps

### Option 1: Investigate npm Process State
- Check if npm process is actually running or hung
- Use Kudu SSH to inspect running processes: `ps aux | grep npm`
- Check npm process state and resource usage
- Verify if process is waiting on I/O or network

### Option 2: Try Alternative Installation Methods
- Use `yarn` instead of npm (if available)
- Install dependencies in GitHub Actions and include in deployment (but size limit issue)
- Use Azure's Oryx build system properly (but we disabled it due to hangs)
- Pre-build a `node_modules.tar.gz` and extract it (but Azure script interferes)

### Option 3: Debug npm Installation
- Add verbose logging: `npm install --loglevel=verbose` or `--loglevel=silly`
- Check npm cache: `npm cache verify`
- Clear npm cache: `npm cache clean --force`
- Try installing without cache: `npm install --no-cache`
- Check network connectivity: `curl https://registry.npmjs.org`

### Option 4: Check Azure Environment
- Verify App Service plan resources (CPU, memory limits)
- Check if there are process/kill limits
- Review Azure App Service logs for system-level issues
- Check if other App Services have similar issues

### Option 5: Pre-install Dependencies
- Install dependencies in GitHub Actions workflow
- Create a compressed `node_modules` archive
- Upload separately or use deployment slot
- Extract in startup script (but need to handle Azure's script interference)

### Option 6: Use Azure Container Instances or Different Service
- Consider if App Service is the right fit
- May need different deployment strategy
- Could use Azure Container Instances with Docker

## Files to Review

- `backend/startup.sh` - Current startup script
- `.github/workflows/dev-be.yaml` - GitHub Actions deployment workflow
- `backend/package.json` - Dependencies list
- Azure App Service configuration (startup command, environment variables)

## Questions to Answer

1. Is the npm process actually running or completely hung?
2. What is the last package npm was trying to install before hanging?
3. Are there any system-level logs showing resource exhaustion?
4. Can we install dependencies differently (pre-build, use different tool)?
5. Is this an Azure App Service limitation we need to work around?

## Request

Please help investigate why `npm install` hangs in Azure App Service and suggest a working solution. The backend needs to start successfully so the application can run.

