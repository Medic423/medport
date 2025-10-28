# Handoff: Dropdown Options Sync Issue - dev vs production

**Date:** October 28, 2025  
**Issue:** Production dropdown options don't match dev database  
**Status:** In progress - needs data sync completion

---

## Context

We successfully fixed the "To Locations" dropdown issue where trip creation was failing. Now working on syncing dropdown option values between dev and production databases.

### What We Accomplished

✅ **Fixed "To Locations" dropdown**
- Added 4 hospitals to production database (Children's Hospital, Allegheny General, Cleveland Clinic, Johns Hopkins)
- Backend API now returns hospitals correctly
- CORS configured for traccems.com

✅ **Added dropdown options to production**
- Created sync scripts for hospitals and dropdown options
- Added 22 dropdown options initially
- Removed duplicate uppercase categories (TRANSPORT_LEVEL, etc.), keeping lowercase versions

✅ **Production database has:**
- `transport-level`: ALS, BLS, ILS
- `urgency`: Emergency, Emergent, Routine, Stat, Urgent
- Other categories partially synced

---

## Current Problem

Production dropdown values still don't match dev. After hard refresh, production shows different values than what exists in dev database.

### Comparison

**DEV values (what should be in production):**
- Transport Level: ALS, BLS, ILS
- Urgency: Routine, Stat, Emergency, Urgent
- Diagnosis: None, Pneumothorax, COPD, Cancer
- Mobility: Stretcher
- Insurance: Atena, Medicare, Medicade, UPMC

**PRODUCTION values (currently showing):**
- Need verification after cleanup

---

## Database Locations

**Dev database:**
```
postgresql://scooper@localhost:5432/medport_ems?schema=public
```

**Production database (Vercel Postgres):**
```
DATABASE_URL from Vercel environment variables
(postgres://83b6f3a648992f0d604de269444988ad1248aa92f5ea7b85b794af2bc447f869:sk_53MYkpIqmD_l7bf7ex3lw@db.prisma.io:5432/postgres)
```

**Production URL:** https://traccems.com

---

## Files Created

1. `backend/add-real-hospitals.js` - Adds hospitals to production
2. `backend/sync-dropdown-options.js` - Generic dropdown sync (had wrong schema)
3. `backend/sync-exact-dev-options.js` - Script to sync exact dev data (already created, may need modification)

---

## Next Steps

1. **Verify current production state:**
   ```bash
   cd backend
   node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.dropdownOption.findMany().then(o => {console.log('Count:', o.length); o.forEach(opt => console.log(opt.category, ':', opt.value)); p.\$disconnect();});"
   ```

2. **Compare with dev database:**
   ```bash
   # Need to query dev database and get exact list of dropdown options
   ```

3. **Fix the sync script (`sync-exact-dev-options.js`) if needed:**
   - Make sure it queries both databases correctly
   - Ensure it's using the right DATABASE_URL for each

4. **Run the sync:**
   ```bash
   cd backend
   node sync-exact-dev-options.js
   ```

5. **Verify the production API returns correct data:**
   - Test with authenticated request to `/api/dropdown-options/transport-level`
   - Check all categories

6. **Test in browser:**
   - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
   - Create new trip
   - Verify all dropdowns show dev values

---

## Important Notes

- **Always use lowercase category names:** `transport-level`, `urgency`, etc.
- **Browser caching:** Users may need hard refresh to see changes
- **Authentication required:** `/api/dropdown-options/:category` endpoints require auth token
- **Both databases exist:** Don't confuse Vercel Postgres with the old Render database

---

## Testing URLs

- **Production:** https://traccems.com
- **Backend API:** https://backend-i8skd8g0y-chuck-ferrells-projects.vercel.app
- **Test hospitals endpoint:** `curl https://backend-i8skd8g0y-chuck-ferrells-projects.vercel.app/api/public/hospitals`

---

## Goal

Production dropdowns should have EXACTLY the same values as dev so users can create trips without "Invalid transport level" or other validation errors.

