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

## Status

**Current State:** ⚠️ Known issue, concurrency control helps but doesn't prevent multiple triggers  
**Last Occurrence:** January 9, 2026  
**Frequency:** Occurs when pushing multiple commits quickly  
**Impact:** Backend restarts multiple times, service interruption

---

**Action Required:** Be aware of this issue and wait for deployments to complete before pushing again.
