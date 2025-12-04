### Git PR and Merge Guide (tcc)

## 🚀 Quick Reference: Common Git Commands

```bash
# Check current status
git status

# See what branch you're on
git branch

# Push current branch to origin
git push origin <branch-name>

# Example: Push hotfix branch
git push origin hotfix/facilities-fallback

# Switch to main branch
git checkout main

# Pull latest from origin
git pull origin main

# See recent commits
git log --oneline -10
```

**⚠️ Remember:** Per user preference, git push must be done manually in your terminal (AI can't push due to credential restrictions)

---

## Full PR and Merge Guide

Use this to merge feature branches into `main` safely.

1) Ensure all work is pushed
- Current working branch: `feature/trip-unit-assignment`
- Push: `git push origin feature/trip-unit-assignment`

2) Create a Pull Request (PR)
- Open: https://github.com/Medic423/tcc
- Click “Compare & pull request” for `feature/trip-unit-assignment` → `main`
- Title: “Phase 2: EMS Dashboard + Unit Assignment + Healthcare delete/cancel UX”
- Description: Brief summary, link to `FINAL_TEST_RESULTS.md` and `docs/notes/trip_unit_enhancements.md`
- Create PR

Why a PR now?
- Remote `main` and local history diverged. A PR lets GitHub show all conflicts clearly and guide safe resolution without risking local files.

3) Resolve merge conflicts in the PR UI (Recommended)
- Conflicts are mostly “add/add” (same files added in both histories).
- For each conflict:
  - Prefer the current Phase 2 implementation when files represent the same module (e.g., `frontend/src/components/*`, `backend/src/routes/*`).
  - Keep any new files that only exist on one side.
  - For env files (e.g., `backend/.env`), keep both by committing the repo-safe sample (e.g., `env.example`) and exclude secrets.
- Commit the resolutions in the PR.

4) Merge the PR
- Choose “Create a merge commit” (do NOT squash if you want to preserve branch history).
- After merge, delete the source branch in GitHub if desired.

5) Update local clones
- On your machine: `git checkout main && git pull origin main`
- Optionally: `git branch -d feature/trip-unit-assignment`

Rollback plan
- If anything looks wrong post-merge, revert the merge commit in GitHub: “Revert” action on the PR’s merge commit.

Notes
- Do not force-push `main`.
- The backup at `/Volumes/Acasis/tcc-backups/` is current and restorable if needed.
