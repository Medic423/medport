# Azure Deployment Guide
**Last Updated:** January 9, 2026  
**Status:** ✅ **COMPREHENSIVE REFERENCE** - All deployment knowledge in one place

---

## Table of Contents

1. [Critical Rules](#critical-rules)
2. [Node Modules Deployment Strategy](#node-modules-deployment-strategy)
3. [Automatic Deployment Triggers](#automatic-deployment-triggers)
4. [Deployment Workflow](#deployment-workflow)
5. [Troubleshooting](#troubleshooting)
6. [Quick Reference](#quick-reference)

---

## ⚠️ CRITICAL RULES

### Rule 1: Never Push While Deployment Is In Progress
**Why:** Deployments on top of deployments cause incomplete/mixed code, backend crashes, and service interruption.

**How to Check:**
1. Go to: https://github.com/Medic423/medport/actions
2. Filter by workflow: "develop - Deploy Dev Backend"
3. Check status:
   - ✅ **"Completed"** (green) → Safe to push
   - ⚠️ **"In progress"** (orange) → **WAIT - DO NOT PUSH**
   - ⚠️ **"Queued"** (yellow) → **WAIT - DO NOT PUSH**

**What Happens If You Push Anyway:**
- New deployment queues up
- When it starts, it may interrupt/deploy on top of in-progress deployment
- Result: Incomplete code, backend crashes, service down

### Rule 2: Wait for Deployments to Complete
**Standard Deployment Time:**
- Backend: ~5-10 minutes
- Frontend: ~3-5 minutes
- Static Web Apps: ~2-4 minutes

**If Deployment Takes >15 Minutes:**
- ⚠️ Something is wrong
- Check GitHub Actions logs
- Check Azure Portal
- **DO NOT push new commit** (makes it worse)
- Consider canceling if confirmed stuck

### Rule 3: Batch Commits When Possible
**Best Practice:**
- Make multiple changes locally
- Test locally
- Push once with all changes
- Wait for deployment to complete

**Why:**
- Reduces number of deployments
- More efficient
- Better git history
- Less chance of deployment conflicts

### Rule 4: Check Deployment Status Before Pushing
**Always Check:**
1. GitHub Actions - Are any deployments running?
2. Azure Portal - Is backend stable?
3. Logs - Any errors in recent deployments?

**If Unsure:**
- Wait 5 minutes
- Check again
- Better to wait than cause issues

---

## Node Modules Deployment Strategy

### ⚠️ CRITICAL: Do Not Use Archive Approach

**DO NOT** attempt to use `node_modules.tar.gz` archive extraction for Azure deployments. This approach has been tried multiple times and consistently fails.

### Current Strategy: Direct Deployment

**Approach:**
- **Deploy `node_modules` directory directly** in the deployment package
- No compression, no extraction, no archive creation
- Package size: ~184MB (uncompressed)
- Deployment time: Standard (no extraction delays)

**Why This Works:**
- ✅ **Reliable** - No extraction step that can hang/timeout
- ✅ **Fast startup** - Backend starts immediately
- ✅ **Simple** - No complex extraction logic needed
- ✅ **Proven** - This approach was successful in the past (January 6, 2026)

**Implementation:**
- GitHub Actions workflow installs dependencies with `npm install`
- `node_modules` directory is **included** in deployment package
- Azure App Service receives complete package with dependencies
- Backend starts with `npm start` → `node dist/index.js`
- No extraction scripts or startup delays

### Failed Approaches (DO NOT USE)

#### ❌ Archive Extraction Approach
**What was tried:**
- Create `node_modules.tar.gz` archive (~50MB compressed)
- Remove `node_modules` before deployment
- Extract archive on Azure startup

**Why it failed:**
- Archive extraction consistently hangs/times out
- Extraction takes 4+ minutes and often fails
- Backend crashes with "Cannot find module 'express'"
- Multiple attempts (January 6, 2026 and January 9, 2026) both failed

**Commits that implemented this (REVERTED):**
- `8ccd155f` - Archive creation
- `46f4b1b0` - Production workflow archive
- `97f18594` - Archive timeout/logging
- `9ca138ed` - Prestart hook extraction
- `7b239df5` - Inline extraction in start script

**Final revert commit:**
- `174c97ea` - Deploy node_modules directly instead of using archive

### Workflow Configuration

**Dev-SWA Workflow (`.github/workflows/dev-be.yaml`):**
```yaml
- name: Install dependencies
  run: npm install
  working-directory: './backend'

- name: Build application
  run: npm run build
  working-directory: './backend'

# NO archive creation step
# NO node_modules removal step

- name: Deploy to Azure Web App
  uses: azure/webapps-deploy@v2
  with:
    package: './backend'  # Includes node_modules directory
```

**Package.json Start Scripts:**

✅ **Current (Simple):**
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "start:prod": "node dist/production-index.js"
  }
}
```

❌ **Do NOT Use (Archive Extraction):**
```json
{
  "scripts": {
    "prestart": "extract archive...",
    "start": "extract && node dist/index.js"
  }
}
```

---

## Automatic Deployment Triggers

### Problem: Multiple Deployments Triggering Automatically

When pushing to `develop` branch, **multiple deployments can trigger automatically**, causing:
- Multiple GitHub Actions workflows running simultaneously
- Deployment conflicts (409 errors)
- Confusion about which deployment is actually deploying
- Backend restarts interrupting each other

### Root Causes

#### 1. Azure App Service Deployment Center
**Issue:** Azure App Service may have automatic deployments enabled via Deployment Center, which triggers deployments independently of GitHub Actions.

**How to Check:**
1. Azure Portal → TraccEms-Dev-Backend
2. Deployment Center (left sidebar)
3. Check if "Continuous deployment" is enabled
4. If enabled, it may trigger deployments on every push

**Solution:**
- Disable Deployment Center automatic deployments if using GitHub Actions
- OR use Deployment Center exclusively (not both)

#### 2. Multiple Workflows Triggering
**Current Workflows:**
- `dev-be.yaml` - Triggers on push to `develop` ✅ (intended)
- `dev-fe.yaml` - Triggers on push to `develop` ✅ (intended)
- `azure-static-web-apps-*.yml` - Triggers on push to `develop` ✅ (intended)
- `main_traccems-prod-backend.yml` - Triggers on push to `main` ⚠️ (old workflow, should not affect develop)

**Solution:**
- Concurrency control is already in place
- Multiple workflows for different services (backend/frontend) is normal
- Issue is when SAME service gets multiple deployments

#### 3. Concurrency Control Behavior
**Current Configuration:**
```yaml
concurrency:
  group: deploy-dev-backend
  cancel-in-progress: false
```

**What Happens:**
- ✅ Prevents multiple deployments from running simultaneously
- ✅ Queues new deployments if one is already running
- ⚠️ **BUT:** If you push multiple commits quickly, each push triggers a new deployment
- ⚠️ **RESULT:** Multiple deployments queue up, causing confusion

**Example Scenario:**
1. Push commit A → Deployment 1 starts
2. Push commit B (while Deployment 1 running) → Deployment 2 queued
3. Push commit C (while Deployment 1 running) → Deployment 3 queued
4. Deployment 1 completes → Deployment 2 starts
5. Deployment 2 completes → Deployment 3 starts
6. **Problem:** Backend restarts multiple times, interrupting service

### Critical Issue: Deployments on Top of Deployments

**Problem:**
When deployments trigger while another deployment is already in progress, the new deployment can:
- **Interrupt the in-progress deployment** - Causing it to fail or hang
- **Deploy incomplete code** - Files may be partially deployed
- **Cause backend crashes** - Backend may start with incomplete/mixed code
- **Create inconsistent state** - Some files from old deployment, some from new

**Symptoms:**
- ✅ Deployment running for 15+ minutes (should take ~5-10 minutes)
- ✅ `npm start` produces no output (deployment may be interrupted)
- ✅ Backend not responding (incomplete deployment)
- ✅ Multiple deployments queued (concurrency control working, but deployments still interfere)

**Root Cause:**
- Azure can only handle **one deployment at a time** to the same App Service
- When a new deployment starts while another is in progress:
  - Azure may **cancel** the in-progress deployment
  - OR Azure may **queue** the new deployment (but files may be partially overwritten)
  - OR Azure may **merge** deployments (causing inconsistent state)

**Solution:**
- ⚠️ **NEVER push while a deployment is in progress**
- Wait for deployment to show "Completed" before pushing again
- Check deployment status before every push
- If deployment is taking >15 minutes, investigate before pushing

---

## Deployment Workflow

### Standard Workflow
```
1. Make changes locally
2. Test locally
3. Commit changes
4. Check GitHub Actions - Any deployments running?
   → If YES: Wait for completion
   → If NO: Continue
5. Push to develop
6. Monitor GitHub Actions
7. Wait for deployment to complete (5-10 minutes)
8. Test deployed code
9. Make next changes (repeat from step 1)
```

### If Deployment Fails
```
1. Check GitHub Actions logs
2. Identify error
3. Fix issue locally
4. Test fix locally
5. Commit fix
6. Check GitHub Actions - Any deployments running?
   → If YES: Wait
   → If NO: Continue
7. Push fix
8. Monitor deployment
```

### If Deployment Is Stuck (>15 minutes)
```
1. Check GitHub Actions logs - Which step is stuck?
2. Check Azure Portal - Is deployment actually running?
3. Check Azure logs - Any errors?
4. If confirmed stuck:
   a. Cancel stuck deployment in GitHub Actions
   b. Wait 2 minutes
   c. Push again to trigger fresh deployment
5. If not stuck, just slow:
   a. Wait - Don't interrupt
   b. Monitor logs
```

---

## Troubleshooting

### Common Mistakes

#### ❌ Mistake 1: Rapid-Fire Pushes
**What:** Pushing multiple commits in quick succession  
**Result:** Multiple deployments queue up, interfere with each other  
**Fix:** Batch commits, wait between pushes

#### ❌ Mistake 2: Pushing While Deployment Running
**What:** Pushing new commit while deployment is in progress  
**Result:** New deployment queues, may interfere with in-progress deployment  
**Fix:** Always check GitHub Actions before pushing

#### ❌ Mistake 3: Pushing to Fix Deployment Issue
**What:** Deployment stuck, push new commit to "fix" it  
**Result:** Makes problem worse, adds more deployments  
**Fix:** Investigate first, cancel if needed, then push

#### ❌ Mistake 4: Not Monitoring Deployments
**What:** Push and forget, don't check if deployment succeeded  
**Result:** Deployments fail silently, issues discovered later  
**Fix:** Always monitor GitHub Actions after pushing

### Monitoring Deployments

#### GitHub Actions
**URL:** https://github.com/Medic423/medport/actions

**What to Check:**
- ✅ Deployment status (Completed/In progress/Failed)
- ✅ Which step failed (if failed)
- ✅ How long deployment is taking
- ✅ If multiple deployments are queued

#### Azure Portal
**URL:** https://portal.azure.com → TraccEms-Dev-Backend

**What to Check:**
- ✅ App Service status (Running/Stopped)
- ✅ Deployment Center → Recent deployments
- ✅ Log stream → Backend startup messages
- ✅ Health endpoint → Is backend responding?

### How to Identify Issues

#### Symptoms of Deployment Problems
- ✅ Multiple GitHub Actions workflows running for same service
- ✅ Backend restarts multiple times in quick succession
- ✅ Log stream shows repeated startup sequences
- ✅ "No new trace" messages appearing frequently
- ✅ Deployment running >15 minutes
- ✅ Backend not responding after deployment

#### Check GitHub Actions
1. Go to: https://github.com/Medic423/medport/actions
2. Filter by workflow: "develop - Deploy Dev Backend"
3. Look for:
   - Multiple workflows with status "In progress" or "Queued"
   - Same commit triggering multiple workflows
   - Different commits queued up

#### Check Azure Deployment Center
1. Azure Portal → TraccEms-Dev-Backend
2. Deployment Center
3. Check "Continuous deployment" status
4. Check deployment history for duplicate deployments

---

## Quick Reference

### Before Every Push
1. ✅ Check GitHub Actions - Any deployments running?
2. ✅ If YES → Wait
3. ✅ If NO → Push

### After Every Push
1. ✅ Monitor GitHub Actions
2. ✅ Wait for deployment to complete
3. ✅ Test deployed code
4. ✅ Check Azure logs if issues

### If Deployment Stuck
1. ✅ Check logs
2. ✅ Investigate cause
3. ✅ Cancel if confirmed stuck
4. ✅ Wait 2 minutes
5. ✅ Push again

### When to Push
- ✅ After previous deployment completes
- ✅ When you have a complete set of changes
- ✅ When backend is stable

### When NOT to Push
- ❌ While deployment is in progress
- ❌ Multiple times in quick succession
- ❌ When debugging deployment issues

---

## Related Documentation

- `docs/active/sessions/2026-01/concurrency-deployment-issue.md` - Concurrency control details
- `docs/active/sessions/2026-01/production-deployment-conflict-20260104.md` - Production conflict example
- `.github/workflows/dev-be.yaml` - Current workflow configuration
- `docs/active/sessions/2026-01/BACKEND_DEPLOYMENT_FAILURE_ANALYSIS.md` - Comprehensive failure analysis

---

**Status:** ✅ Comprehensive reference - All deployment knowledge in one place  
**Last Updated:** January 9, 2026  
**Location:** `docs/reference/azure/deployment-guide.md`
