# Deployment Best Practices
**Last Updated:** January 9, 2026  
**Status:** ✅ **CRITICAL RULES** - Follow these to avoid deployment issues

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

---

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

---

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

---

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

## Common Mistakes

### ❌ Mistake 1: Rapid-Fire Pushes
**What:** Pushing multiple commits in quick succession  
**Result:** Multiple deployments queue up, interfere with each other  
**Fix:** Batch commits, wait between pushes

### ❌ Mistake 2: Pushing While Deployment Running
**What:** Pushing new commit while deployment #126 is in progress  
**Result:** Deployment #127 queues, may interfere with #126  
**Fix:** Always check GitHub Actions before pushing

### ❌ Mistake 3: Pushing to Fix Deployment Issue
**What:** Deployment stuck, push new commit to "fix" it  
**Result:** Makes problem worse, adds more deployments  
**Fix:** Investigate first, cancel if needed, then push

### ❌ Mistake 4: Not Monitoring Deployments
**What:** Push and forget, don't check if deployment succeeded  
**Result:** Deployments fail silently, issues discovered later  
**Fix:** Always monitor GitHub Actions after pushing

---

## Monitoring Deployments

### GitHub Actions
**URL:** https://github.com/Medic423/medport/actions

**What to Check:**
- ✅ Deployment status (Completed/In progress/Failed)
- ✅ Which step failed (if failed)
- ✅ How long deployment is taking
- ✅ If multiple deployments are queued

### Azure Portal
**URL:** https://portal.azure.com → TraccEms-Dev-Backend

**What to Check:**
- ✅ App Service status (Running/Stopped)
- ✅ Deployment Center → Recent deployments
- ✅ Log stream → Backend startup messages
- ✅ Health endpoint → Is backend responding?

---

## Related Documentation

- `docs/reference/DEPLOYMENT_AUTOMATIC_TRIGGERS.md` - Why multiple deployments trigger
- `docs/reference/DEPLOYMENT_NODE_MODULES_STRATEGY.md` - Node modules deployment approach
- `docs/active/sessions/2026-01/concurrency-deployment-issue.md` - Concurrency control details

---

## Quick Reference

**Before Every Push:**
1. ✅ Check GitHub Actions - Any deployments running?
2. ✅ If YES → Wait
3. ✅ If NO → Push

**After Every Push:**
1. ✅ Monitor GitHub Actions
2. ✅ Wait for deployment to complete
3. ✅ Test deployed code
4. ✅ Check Azure logs if issues

**If Deployment Stuck:**
1. ✅ Check logs
2. ✅ Investigate cause
3. ✅ Cancel if confirmed stuck
4. ✅ Wait 2 minutes
5. ✅ Push again

---

**Status:** ✅ Critical rules - Follow these to avoid deployment issues  
**Last Updated:** January 9, 2026
