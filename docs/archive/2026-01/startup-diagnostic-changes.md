# Startup Diagnostic Changes - January 21, 2026

## Problem
Backend deployment to Azure succeeds, but `npm start` produces no output - no errors, no logs, just silence.

## Changes Made

### 1. Added Diagnostic Logging to `backend/src/index.ts`
- Added console.log statements at the very top of the file to catch startup attempts
- Logs Node version, working directory, and environment variables
- Logs when dependencies are imported successfully
- Added error handlers for unhandled promise rejections and uncaught exceptions
- Wrapped `startServer()` call in try-catch to catch async errors

**Expected Output:**
```
🔍 [STARTUP] Starting backend application...
🔍 [STARTUP] Node version: v24.x.x
🔍 [STARTUP] Working directory: /home/site/wwwroot
🔍 [STARTUP] Environment: production
🔍 [STARTUP] Loading dependencies...
🔍 [STARTUP] Dependencies imported successfully
```

### 2. Added Build Verification to GitHub Actions
- Added a new step in `.github/workflows/dev-be.yaml` that verifies `dist/index.js` exists after build
- If `dist/index.js` is missing, the workflow will fail with a clear error message
- Shows file size and first 5 lines of the built file

**This will catch:** Build failures that don't produce `dist/index.js`

### 3. Created Diagnostic Script
- Created `backend/check-azure-deployment.sh` for manual diagnosis
- Checks if `dist/index.js` exists
- Checks if `node_modules` exists
- Checks environment variables
- Attempts to run `npm start` manually to see errors
- Checks for running Node.js processes

**Usage:**
```bash
# Via Azure Portal → Kudu → Debug Console → Bash
cd /home/site/wwwroot
bash check-azure-deployment.sh
```

## Next Steps

### Step 1: Commit and Push Changes
```bash
git add backend/src/index.ts .github/workflows/dev-be.yaml backend/check-azure-deployment.sh
git commit -m "fix: Add diagnostic logging and build verification for Azure deployment"
git push origin develop
```

### Step 2: Monitor GitHub Actions
- Watch the GitHub Actions workflow run
- Check if the "Verify build output" step passes
- If it fails, the error message will show what's wrong

### Step 3: Check Azure Logs After Deployment
After deployment completes, check Azure logs for:
- `🔍 [STARTUP]` messages - confirms the file is being executed
- Any error messages that appear before or after startup logs
- If no `🔍 [STARTUP]` messages appear, `dist/index.js` likely doesn't exist or isn't being executed

### Step 4: Run Diagnostic Script (if needed)
If logs still show nothing:
1. Access Azure Kudu/SSH: https://traccems-dev-backend-h4add2fpcegrc2bz.scm.centralus-01.azurewebsites.net
2. Navigate to `/home/site/wwwroot`
3. Run: `bash check-azure-deployment.sh`
4. This will show exactly what files exist and what errors occur

## What These Changes Will Reveal

### Scenario 1: dist/index.js Doesn't Exist
**Symptom:** GitHub Actions "Verify build output" step fails  
**Fix:** Check why build isn't creating `dist/index.js` (TypeScript compilation issue)

### Scenario 2: dist/index.js Exists But Not Executed
**Symptom:** No `🔍 [STARTUP]` messages in logs  
**Fix:** Check Azure startup command configuration

### Scenario 3: Silent Import Error
**Symptom:** `🔍 [STARTUP] Starting backend application...` appears but nothing after  
**Fix:** Check for missing dependencies or Prisma Client generation issues

### Scenario 4: Runtime Error After Startup
**Symptom:** `🔍 [STARTUP]` messages appear but server doesn't start  
**Fix:** Check error messages that appear after startup logs

## Files Changed
- `backend/src/index.ts` - Added diagnostic logging
- `.github/workflows/dev-be.yaml` - Added build verification step
- `backend/check-azure-deployment.sh` - New diagnostic script

## Testing
✅ Local build verified - `dist/index.js` created successfully  
✅ Diagnostic logging included in compiled output  
✅ No TypeScript compilation errors

---

**Status:** Ready to deploy and diagnose  
**Next Action:** Commit, push, and monitor GitHub Actions + Azure logs
