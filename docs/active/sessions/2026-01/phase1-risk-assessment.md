# Phase 1 Risk Assessment: Critical Migration Issue
**Date:** January 6, 2026  
**Status:** ⚠️ **BLOCKED** - Migration cannot proceed as-is

---

## Critical Finding

**Migration `20250917170653_add_center_tables` will DROP tables that contain data:**

### Tables That Will Be Dropped:
1. ❌ **`ems_users`** - **HAS DATA** (cannot be dropped)
2. ❌ **`transport_requests`** - **HAS DATA** (cannot be dropped)
3. ⚠️ **`units`** - May be dropped (user confirmed)
4. ⚠️ **`crew_roles`** - May be dropped (user confirmed)

### Additional Impact:
- **`ems_agencies`** table will have `addedAt` and `addedBy` columns DROPPED
  - These columns were added in a later migration (`20251204130000_add_ems_agency_availability_status`)
  - **CONFLICT:** Migration drops columns that were added later!

---

## Problem Analysis

### Why This Is A Problem

1. **Data Loss Risk:** 
   - `ems_users` table contains EMS user accounts
   - `transport_requests` table contains transport request data
   - Dropping these tables will cause **permanent data loss**

2. **Migration Order Issue:**
   - Migration `20250917170653_add_center_tables` (Sept 17, 2025) drops `addedAt`/`addedBy` from `ems_agencies`
   - Migration `20251204130000_add_ems_agency_availability_status` (Dec 4, 2025) adds `addedAt`/`addedBy` back
   - **This migration was written for an empty database, not production with data**

3. **Schema Evolution:**
   - The migration represents an early schema that was later evolved
   - Production database has evolved beyond this migration's assumptions

---

## Recommended Approach

### Option 1: Skip Problematic Migration (Recommended)

**Strategy:** Mark migration as applied without running it, then apply only the safe parts.

**Steps:**
1. Check current production state
2. If `center_users` table doesn't exist, create it manually (without dropping other tables)
3. Mark migration `20250917170653_add_center_tables` as applied in migration history
4. Apply migration `20251204101500_add_user_deletion_fields` normally
5. Verify results

**Pros:**
- No data loss
- Can proceed with Phase 1
- Safe approach

**Cons:**
- Requires manual intervention
- Need to ensure `center_users` table matches expected schema

### Option 2: Modify Migration (Complex)

**Strategy:** Create a modified version of the migration that:
- Creates `center_users` table
- Does NOT drop `ems_users`, `transport_requests`
- Does NOT drop `addedAt`/`addedBy` from `ems_agencies`
- Only drops `crew_roles` and `units` if they exist and are empty

**Pros:**
- Uses Prisma migration system properly
- Can be tracked in migration history

**Cons:**
- Requires creating new migration file
- More complex
- Need to ensure compatibility

### Option 3: Test Production First (User's Suggestion)

**Strategy:** Test all production functionality first to understand:
- What's currently working
- What's broken
- What tables/columns are actually needed

**Then:** Decide on migration approach based on findings

**Pros:**
- Better understanding of current state
- Can prioritize fixes
- Less risk of breaking working features

**Cons:**
- Delays migration execution
- May reveal more issues

---

## Recommended Next Steps

### Step 1: Test Production Functionality (User's Suggestion) ✅

**Action:** Test all EMS module functionality in production

**What to Test:**
- [ ] EMS user registration
- [ ] EMS user login
- [ ] Transport request creation
- [ ] Transport request viewing
- [ ] Agency responses
- [ ] Trip management
- [ ] Unit management
- [ ] Any other EMS-related features

**Document:**
- What works
- What's broken
- Error messages
- Missing features

**Purpose:** Understand current state before making changes

### Step 2: Check Current Production State

**Action:** Run assessment scripts

```bash
# Check Phase 1 migration state
DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node backend/check-phase1-state.js

# Check tables that will be affected
DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node backend/check-production-tables.js
```

**Purpose:** Get exact state of production database

### Step 3: Decide on Migration Approach

**Based on:**
- Production functionality test results
- Current database state
- Data preservation requirements

**Options:**
- Skip problematic migration (Option 1)
- Modify migration (Option 2)
- Alternative approach

### Step 4: Execute Safe Parts of Phase 1

**Safe Migration:** `20251204101500_add_user_deletion_fields`
- Only adds nullable columns
- No data loss risk
- Can be applied safely

**Action:** Apply this migration regardless of other issues

---

## Questions to Answer

1. **What data exists in `ems_users`?**
   - How many users?
   - Are they active?
   - Can they be recreated if needed?

2. **What data exists in `transport_requests`?**
   - How many requests?
   - Are they active/in-progress?
   - Historical data or active operations?

3. **Does `center_users` table already exist?**
   - If yes, what's its current schema?
   - Does it match expected schema?

4. **What's the priority?**
   - Fix production issues quickly?
   - Preserve all data?
   - Get schema aligned with dev?

---

## Updated Phase 1 Plan

### Revised Phase 1: Safe Foundation (No Data Loss)

**Goal:** Apply only safe migrations that don't drop tables or data

**Migrations:**
- ✅ `20251204101500_add_user_deletion_fields` - Safe (adds nullable columns)
- ⚠️ `20250917170653_add_center_tables` - **BLOCKED** (drops tables with data)

**Action Plan:**
1. Test production functionality (user's suggestion)
2. Check current database state
3. Apply safe migration (`20251204101500_add_user_deletion_fields`)
4. Handle `center_users` table separately (create manually if needed)
5. Mark problematic migration as applied (if `center_users` already exists)

---

## Risk Level Update

**Original Assessment:** 🟢 **LOW RISK**

**Updated Assessment:** 🔴 **HIGH RISK** - Migration will cause data loss

**Mitigation:** Skip problematic migration, apply only safe parts

---

**Last Updated:** January 6, 2026  
**Status:** ⚠️ **BLOCKED** - Awaiting production testing and state assessment

