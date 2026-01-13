# New Chat Session Prompt - TCC Command Module Troubleshooting
**Date:** January 12, 2026  
**Focus:** TCC Command Module bugs and functionality improvements

---

## Copy and Paste This Prompt:

```
I'm starting a new session focused on troubleshooting bugs and improving functionality in the TCC Command module. 

**Context:**
- We'll follow the guidance in @docs/reference/azure/deployment-guide.md
- Our main goal is to bring local dev and dev-swa PostgreSQL databases into alignment
- We need to prevent database drift as we fix bugs and improve the UI
- Recent work completed: SMS notifications persistence fix (verified working on dev-swa)

**Current Problem:**
~~In dev-swa -> EMS -> Agency List the agencies don't display with the error 'Failed to load agencies'~~ ✅ **FIXED** (January 12, 2026)

**Environment Details:**
- Local Dev: PostgreSQL database `medport_ems` (local)
- Dev-SWA: Azure PostgreSQL `traccems-dev-pgsql` (staging)
- Backend: Node.js/Express with Prisma ORM
- Frontend: React/TypeScript

**TCC Command Module Components:**
- TCCDashboard: Main dashboard with routes for Overview, Trips, Hospitals, Agencies, Route Optimization, Analytics
- TCCOverview: System overview with quick actions
- TripsView: Trip management interface
- TCCCreateTrip: Create new transport requests
- Hospitals: Healthcare facility management
- Agencies: EMS agency management
- TCCRouteOptimizer: Route optimization tool
- Analytics: System-wide analytics
- AdminUsersPanel: User management

**Important Guidelines:**
1. Always verify database schema alignment between local dev and dev-swa before making changes
2. Use Prisma migrations for schema changes (never manual SQL unless absolutely necessary)
3. Test changes locally first, then deploy to dev-swa for verification
4. Document all database changes and ensure they're included in backups
5. Follow deployment-guide.md for deployment procedures (check GitHub Actions status before pushing)
6. Commit only user-verified working code
7. Never push while a deployment is in progress (check GitHub Actions first)

**Database Alignment Priority:**
- Verify schema.prisma matches between environments
- Check _prisma_migrations table status
- Ensure critical tables have matching columns
- Test with sample data in both environments

**First Issue to Address:**
✅ **COMPLETED** - Agencies loading issue fixed (see Recent Work Completed section below)
```

---

## Additional Context for Assistant

### Recent Work Completed (January 12, 2026)

**Agencies Loading Fix:**
- ✅ Fixed "Failed to load agencies" error in dev-swa TCC Command module
- ✅ Root cause: `agencyService` used `databaseManager` but dev-swa uses `productionDatabaseManager`
- ✅ Solution: Simplified to use `databaseManager` exclusively (both connect to same DATABASE_URL)
- ✅ Enhanced error logging throughout backend route and service
- ✅ Improved frontend error handling with detailed error messages
- ✅ Tested locally - working as expected
- ✅ Committed: `b52bd86f` - "fix: Fix agencies loading issue in dev-swa"
- ✅ **Status:** Backend deployed and started successfully (January 13, 2026)

**Azure Oryx Build Detection Issue:**
- ✅ **FIXED** (January 13, 2026) - Azure Oryx build system was creating `oryx-manifest.toml` during deployment
- ✅ **Root Cause:** Oryx detected node_modules and generated extraction scripts that tried to extract non-existent `node_modules.tar.gz`
- ✅ **Permanent Fix Applied:** Configured Azure App Service settings via Azure CLI:
  - `SCM_DO_BUILD_DURING_DEPLOYMENT=false`
  - `ENABLE_ORYX_BUILD=false`
- ✅ **Result:** Clean startup without Oryx manifest detection, backend initializes successfully
- ✅ **Verification:** Logs show "Could not find build manifest file" and clean `npm start` execution
- ✅ **Status:** Backend starting successfully (DatabaseManager, AuthService, SMS carriers initialized)

**SMS Notifications Fix:**
- ✅ Fixed SMS notifications checkbox persistence in EMS Agency Info
- ✅ Verified working locally and on dev-swa
- ✅ Backend crash resolved with optional chaining fix
- ✅ Commits: `a9cc7305`, `b0a4add5`, `50c87b16`

**Database Status:**
- ✅ `acceptsNotifications` column exists in `ems_agencies` table
- ✅ Database schema verified in dev-swa
- ✅ No migration needed for SMS notifications fix

**Backup Status:**
- ✅ Latest backup: `tcc-backup-20260112_180547` (276M)
- ✅ Backed up to: `/Volumes/Acasis/` and iCloud Drive
- ✅ Includes: Local dev, Azure dev, and Azure production databases

**Git Status:**
- ✅ Working tree clean
- ✅ Latest commit: `b52bd86f` - "fix: Fix agencies loading issue in dev-swa"
- ✅ Branch: `develop`
- ✅ Changes pushed to remote

---

## Key Files and Locations

**Deployment Guide:**
- `docs/reference/azure/deployment-guide.md`

**Database Schema:**
- `backend/prisma/schema.prisma`
- Local dev: `medport_ems`
- Dev-SWA: `traccems-dev-pgsql` (Azure)

**TCC Command Module:**
- Frontend: `frontend/src/components/TCCDashboard.tsx` (main component)
  - `TCCOverview.tsx` - Dashboard overview
  - `TripsView.tsx` - Trip management
  - `TCCCreateTrip.tsx` - Create trips
  - `Hospitals.tsx` - Healthcare facility management
  - `Agencies.tsx` - EMS agency management
  - `TCCRouteOptimizer.tsx` - Route optimization
  - `Analytics.tsx` - System analytics
  - `AdminUsersPanel.tsx` - User management
  - `TopMenuBar.tsx` - Navigation menu
- Backend: `backend/src/routes/` and `backend/src/services/`
  - Look for routes/services prefixed with `tcc`, `analytics`, `optimize`

**Backup Scripts:**
- `scripts/backup-fresh-to-both-locations.sh` - Creates backup to both locations
- `scripts/organize-project-docs.sh` - Organizes documents before backup

---

## Database Alignment Checklist

Before making changes, verify:
1. ✅ Schema files match (`backend/prisma/schema.prisma`)
2. ✅ Migration status matches (`_prisma_migrations` table)
3. ✅ Critical tables have same columns
4. ✅ Test data exists in both environments

---

## Notes

- User will complete the problem description after pasting
- Focus is on TCC Command module specifically
- Database alignment is critical - always check before/after changes
- Follow deployment-guide.md procedures
