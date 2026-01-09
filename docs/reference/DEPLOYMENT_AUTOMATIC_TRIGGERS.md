# Automatic Deployment Triggers - Known Issue
**Last Updated:** January 9, 2026  
**Status:** ⚠️ **KNOWN ISSUE** - Multiple deployments can trigger automatically

---

## ⚠️ Critical Issue: Automatic Deployments Triggering Multiple Times

### Problem
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
**Issue:** Multiple workflows can trigger on the same push event.

**Current Workflows:**
- `dev-be.yaml` - Triggers on push to `develop` ✅ (intended)
- `dev-fe.yaml` - Triggers on push to `develop` ✅ (intended)
- `azure-static-web-apps-*.yml` - Triggers on push to `develop` ✅ (intended)
- `main_traccems-prod-backend.yml` - Triggers on push to `main` ⚠️ (old workflow, should not affect develop)

**Solution:**
- Concurrency control is already in place (see below)
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

---

## Solutions

### Solution 1: Wait for Deployments to Complete (Recommended)
**Action:** After pushing, wait for all deployments to complete before pushing again.

**Pros:**
- No code changes needed
- Prevents conflicts
- Ensures stable deployments

**Cons:**
- Slower development cadence
- Requires discipline

### Solution 2: Cancel Queued Deployments
**Action:** Manually cancel older queued deployments in GitHub Actions if newer commit is more important.

**Steps:**
1. Go to: https://github.com/Medic423/medport/actions
2. Find queued deployments
3. Click on deployment → "Cancel workflow run"
4. Newer deployment will then run

**Pros:**
- Faster deployment of latest code
- More control

**Cons:**
- Manual intervention required
- Risk of canceling important deployment

### Solution 3: Batch Commits (Best Practice)
**Action:** Make multiple changes locally, then push once with all changes.

**Pros:**
- Reduces number of deployments
- More efficient
- Better git history

**Cons:**
- Requires planning ahead
- Larger commits

### Solution 4: Disable Deployment Center (If Enabled)
**Action:** If Azure Deployment Center has automatic deployments enabled, disable it.

**Steps:**
1. Azure Portal → TraccEms-Dev-Backend
2. Deployment Center → Settings
3. Disconnect or disable continuous deployment
4. Use only GitHub Actions for deployments

**Pros:**
- Eliminates duplicate triggers
- Single source of truth

**Cons:**
- Need to verify Deployment Center is actually the issue

---

## How to Identify the Issue

### Symptoms
- ✅ Multiple GitHub Actions workflows running for same service
- ✅ Backend restarts multiple times in quick succession
- ✅ Log stream shows repeated startup sequences
- ✅ "No new trace" messages appearing frequently

### Check GitHub Actions
1. Go to: https://github.com/Medic423/medport/actions
2. Filter by workflow: "develop - Deploy Dev Backend"
3. Look for:
   - Multiple workflows with status "In progress" or "Queued"
   - Same commit triggering multiple workflows
   - Different commits queued up

### Check Azure Deployment Center
1. Azure Portal → TraccEms-Dev-Backend
2. Deployment Center
3. Check "Continuous deployment" status
4. Check deployment history for duplicate deployments

---

## Prevention

### Best Practices
1. **Wait for deployments** - Don't push multiple commits in quick succession
2. **Batch changes** - Combine related changes into single commit
3. **Monitor deployments** - Check GitHub Actions before pushing again
4. **Use concurrency control** - Already implemented, but understand its behavior

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

---

## Critical Issue: Deployments on Top of Deployments

### Problem
When deployments trigger while another deployment is already in progress, the new deployment can:
- **Interrupt the in-progress deployment** - Causing it to fail or hang
- **Deploy incomplete code** - Files may be partially deployed
- **Cause backend crashes** - Backend may start with incomplete/mixed code
- **Create inconsistent state** - Some files from old deployment, some from new

### Symptoms
- ✅ Deployment #126 running for 15+ minutes (should take ~5-10 minutes)
- ✅ `npm start` produces no output (deployment may be interrupted)
- ✅ Backend not responding (incomplete deployment)
- ✅ Multiple deployments queued (concurrency control working, but deployments still interfere)

### Root Cause
**Azure Web App Deployment Behavior:**
- Azure can only handle **one deployment at a time** to the same App Service
- When a new deployment starts while another is in progress:
  - Azure may **cancel** the in-progress deployment
  - OR Azure may **queue** the new deployment (but files may be partially overwritten)
  - OR Azure may **merge** deployments (causing inconsistent state)

**GitHub Actions Concurrency Control:**
- Prevents multiple workflows from running simultaneously ✅
- BUT: If you push while deployment is in progress, the new workflow waits
- When it starts, it may deploy **on top of** a partially completed deployment
- Result: Mixed/incomplete code deployed

### Example Scenario (What's Happening Now)
1. **19:25 UTC** - Push commit `4a6aabe` → Backend deployment #126 starts
2. **19:26 UTC** - Deployment #126 deploying files to Azure (takes ~5-10 minutes)
3. **19:40 UTC** - Push commit `c29b76c` → Backend deployment #127 queued
4. **19:41 UTC** - Deployment #126 still running (15+ minutes - unusual)
5. **Problem:** Deployment #127 waiting, but when it starts, it may interfere with #126

### Why Deployment #126 Taking So Long
Possible reasons:
1. **Large node_modules** - Deploying 184MB takes time
2. **Azure slow** - Azure deployment service may be slow
3. **Interrupted** - Previous deployment may have left it in bad state
4. **Network issues** - Slow upload to Azure

### Solution: Wait for Deployments to Complete

**CRITICAL RULE:** ⚠️ **NEVER push while a deployment is in progress**

**How to Check:**
1. Go to: https://github.com/Medic423/medport/actions
2. Filter: "develop - Deploy Dev Backend"
3. Check status:
   - ✅ "Completed" (green) - Safe to push
   - ⚠️ "In progress" (orange) - **WAIT**
   - ⚠️ "Queued" (yellow) - **WAIT**

**Best Practice:**
- ✅ Wait for deployment to show "Completed" before pushing again
- ✅ Check deployment status before every push
- ✅ If deployment is taking >15 minutes, investigate before pushing

### If Deployment Is Stuck

**Symptoms:**
- Deployment running >15 minutes
- No output in Azure logs
- Backend not responding

**Actions:**
1. **Check GitHub Actions logs** - See which step is stuck
2. **Check Azure Portal** - See if deployment actually completed
3. **DO NOT push new commit** - This will make it worse
4. **Cancel stuck deployment** - If confirmed stuck, cancel it
5. **Then push again** - After canceling, push to trigger fresh deployment

---

## Status

**Current State:** ⚠️ Known issue, deployments interfering with each other  
**Last Occurrence:** January 9, 2026  
**Frequency:** Occurs when pushing while deployment in progress  
**Impact:** Incomplete deployments, backend crashes, service interruption

**Current Situation:**
- ⚠️ Backend deployment #126 running 15+ minutes (stuck or slow)
- ⚠️ Backend deployment #127 queued (will interfere when it starts)
- ⚠️ Backend not responding (likely incomplete deployment)

**Action Required:** 
1. ⚠️ **DO NOT push more commits** until #126 completes
2. ⚠️ **Investigate why #126 is taking so long**
3. ⚠️ **Consider canceling #126 if confirmed stuck, then push again**
