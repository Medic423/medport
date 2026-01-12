# Git Workflow Clarification

**Date:** January 10, 2026

---

## Current Workflow Understanding

### Branch Structure
- **`main`**: Production branch (manual deployments only)
- **`develop`**: Dev-SWA branch (auto-deploys to dev-swa when pushed)
- **Feature branches**: For development work, then merged to develop

### Deployment Workflows

#### Dev-SWA (Automatic)
- **Trigger:** Push to `develop` branch
- **Workflows:** 
  - `.github/workflows/dev-be.yaml` - Deploys backend to dev-swa
  - `.github/workflows/dev-fe.yaml` - Deploys frontend to dev-swa
- **Path filters:** Only triggers on `backend/**` or `frontend/**` changes

#### Production (Manual)
- **Trigger:** Manual workflow dispatch
- **Workflow:** `.github/workflows/prod-be.yaml`
- **Options:** Can deploy from `main` or `develop` branch

---

## Current Status

### Where Are Our Fixes?
- **Current Branch:** `fix/healthcare-destinations-available-agencies` (just created)
- **Base Branch:** `develop`
- **On Main?** ❌ No - main doesn't have these changes yet
- **On Develop?** ✅ Yes - develop has the base commits, our fixes are uncommitted

### Changes Made (Uncommitted)
- Available Agencies fixes
- Destinations GPS lookup and save fixes
- Schema alignment fixes
- Error handling improvements

---

## Recommended Workflow Going Forward

1. **Create feature branch** from `develop` ✅ (Done: `fix/healthcare-destinations-available-agencies`)
2. **Make changes** on feature branch ✅ (Done)
3. **Test locally** ✅ (Done - verified working)
4. **Commit changes** to feature branch
5. **Push feature branch** to remote
6. **Create PR** to merge into `develop`
7. **Merge to develop** → Auto-deploys to dev-swa
8. **Test on dev-swa** → Verify fixes work there
9. **Merge to main** → When ready for production

---

## Next Steps

1. ✅ Created feature branch: `fix/healthcare-destinations-available-agencies`
2. ⏳ Commit changes to feature branch
3. ⏳ Push feature branch
4. ⏳ Create PR to develop
5. ⏳ Merge and test on dev-swa

---

**Note:** Local dev can run from any branch - it's just what's checked out locally. The branch determines what gets deployed when you push.
