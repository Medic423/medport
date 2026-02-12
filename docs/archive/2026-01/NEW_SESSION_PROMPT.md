# New Session Prompt - Current Activity Dev-SWA Deployment Issue

**Copy and paste this entire message to start a new chat session:**

---

I'm deploying the "Current Activity" feature to dev-swa (staging environment). The GitHub Actions deployment succeeded (build and deploy both completed), but the backend won't start. After Azure extracts `node_modules`, `npm start` produces no output - no errors, no logs, just silence.

## What's Been Done ✅

1. **Code Implementation:** Complete and tested locally ✅
2. **Git Deployment:** Merged to `develop`, pushed, GitHub Actions succeeded ✅
3. **Database Migration:** Applied manually to dev-swa database, verified columns and indexes exist ✅
4. **Startup Command:** Fixed (was empty, now set to `npm start`) ✅
5. **Multiple Restarts:** Tried 3+ times, restart succeeds but backend still won't start ❌

## Current Issue 🔴

**Symptom:** Backend extracts `node_modules` successfully ("Done."), but then `npm start` produces zero output. No error messages, no startup logs, just "No new trace" messages.

**What we see:**
```
Extracting modules...
Done.
No new trace in the past X min(s). [continues indefinitely]
```

**What we DON'T see:**
- No "🚀 TCC Backend server running" message
- No Node.js output at all
- No error messages

## Key Details

- **Azure App Service:** `TraccEms-Dev-Backend` (Resource Group: `TraccEms-Dev-USCentral`)
- **Database:** `traccems-dev-pgsql` (dev-swa) - Migration applied ✅
- **Latest Commit:** `4ace2070` on `develop` branch
- **GitHub Actions:** Build and deploy both succeeded ✅
- **Startup Command:** `npm start` (verified via Azure CLI) ✅
- **Database Migration:** Verified via pgAdmin - columns and indexes exist ✅

## What's Different from Yesterday

Yesterday's deployments worked flawlessly. Today we added:
- `lastActivity` field to Prisma schema (3 user models)
- Code that uses `lastActivity` in `authenticateAdmin.ts` middleware
- Prisma Client regenerated with new schema

The migration was applied manually (not via Prisma migrate), but columns and indexes are verified to exist.

## Next Steps Needed

Please help diagnose why `npm start` produces no output. Possible causes:
1. `dist/index.js` doesn't exist in deployment (despite build success)
2. Prisma Client mismatch or generation issue
3. Silent runtime crash (need to run manually to see error)
4. Environment variable issue (DATABASE_URL, etc.)
5. Azure startup script interference

**Full context document:** `docs/active/sessions/2026-01/current-activity-dev-swa-deployment-status.md`

Please start by checking if `dist/index.js` exists in the Azure deployment via Kudu/SSH, and try running `npm start` manually to see the actual error.

---
