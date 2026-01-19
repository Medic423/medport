# Category Options Fix - Implementation Plan
**Date:** January 16, 2026  
**Status:** ✅ **PHASE 2 COMPLETE** - Local Dev Testing Passed  
**Branch:** `fix/category-options-hardcoded-slugs`

---

## Executive Summary

**Problem:** Current category management system allows users to add/delete/rename categories, but the trip creation form hardcodes exactly 7 category slugs. This creates a critical failure risk if users modify categories.

**Solution:** Lock down to exactly 7 categories with fixed slugs (`dropdown-1` through `dropdown-7`), remove ability to add categories, only allow display name editing. The 7th category (`special-needs` / `dropdown-7`) is used for checkboxes that users configure for patient needs and requirements.

**Approach:** Implement in git branch, test locally first, then migrate to dev-swa, finally production.

---

## Database Migration Strategy Analysis

### Option A: Prisma Migrations (Standard Approach)

**Pros:**
- ✅ Version controlled (migration files in git)
- ✅ Reproducible across environments
- ✅ Tracks migration history in `_prisma_migrations` table
- ✅ Can rollback if needed
- ✅ Standard Prisma workflow

**Cons:**
- ❌ Past issues with dev-swa and production migrations
- ❌ Can fail silently or partially apply
- ❌ Harder to debug when things go wrong
- ❌ Requires deployment to run migrations

**Past Problems:**
- Migrations have failed on Azure databases
- Some migrations partially applied, leaving inconsistent state
- Required manual pgAdmin fixes after migration failures
- Production has had schema drift issues

### Option B: pgAdmin Direct SQL Execution (Recommended for This Change)

**Pros:**
- ✅ Can execute directly on all three databases simultaneously
- ✅ Immediate feedback (see results instantly)
- ✅ Can verify each step before proceeding
- ✅ No deployment dependency
- ✅ Can test SQL in local dev first, then copy to dev-swa/production
- ✅ Easy to rollback if something goes wrong (just run reverse SQL)
- ✅ Can verify data integrity at each step

**Cons:**
- ❌ Not version controlled (but we can save SQL scripts)
- ❌ Manual process (but safer for critical changes)
- ❌ Need to document what was done

**Why pgAdmin is Better for This Change:**
1. **Critical Data Migration:** We're renaming slugs that are referenced throughout the codebase
2. **Multi-Environment:** Need to apply to 3 environments (local, dev-swa, production)
3. **Data Integrity:** Need to verify category-to-option relationships are preserved
4. **Past Migration Issues:** Team has had problems with Prisma migrations on Azure
5. **Safety:** Can test SQL locally first, verify results, then apply to other environments
6. **Rollback:** Easy to reverse if needed (just rename slugs back)

**Recommendation:** ✅ **Use pgAdmin for database changes**

**Workflow:**
1. Write SQL migration script
2. Test on local dev database via pgAdmin
3. Verify results
4. Apply to dev-swa via pgAdmin
5. Verify results
6. Apply to production via pgAdmin
7. Verify results
8. Save SQL script in git for documentation

---

## Implementation Plan

### Phase 1: Preparation & Branch Setup

#### Task 1.1: Create Git Branch
- [x] Create branch: `fix/category-options-hardcoded-slugs`
- [x] Branch from: `develop`
- [x] Verify branch is clean and up to date

#### Task 1.2: Document Current State
- [x] Query all categories from local dev database (SQL script created: `backend/migrations/01-document-current-state.sql`)
- [x] Document current slugs and their mappings:
  - `transport-level` → Form Field: Transport Level
  - `urgency` → Form Field: Urgency Level
  - `diagnosis` → Form Field: Diagnosis
  - `mobility` → Form Field: Mobility Level
  - `insurance` → Form Field: Insurance Company
  - `secondary-insurance` → Form Field: Secondary Insurance (in notes)
  - `special-needs` → Form Field: Special Needs (checkboxes) - Users configure checkbox options via Category Options
- [x] Count total options per category (SQL script includes this query)
- [x] Verify no orphaned options (options without categories) (SQL script includes this verification)

#### Task 1.3: Create SQL Migration Script
- [x] Create file: `backend/migrations/02-category-slugs-to-dropdown-n.sql`
- [x] Write SQL to:
  1. Rename slugs in `dropdown_categories` table:
     - `transport-level` → `dropdown-1`
     - `urgency` → `dropdown-2`
     - `diagnosis` → `dropdown-3`
     - `mobility` → `dropdown-4`
     - `insurance` → `dropdown-5`
     - `secondary-insurance` → `dropdown-6`
     - `special-needs` → `dropdown-7`
  2. Update `category` field in `dropdown_options` table to match new slugs
  3. Update `categoryId` foreign keys (if needed)
  4. Verify all options are linked correctly
- [x] Include rollback SQL (reverse the changes)
- [x] Add verification queries to check results

**SQL Script Structure:**
```sql
-- Category Options Fix: Rename slugs to dropdown-1 through dropdown-7
-- Date: 2026-01-16
-- Purpose: Lock down categories to fixed slugs to prevent form failures
-- Note: All 7 categories are kept, including special-needs (dropdown-7) for checkbox configuration

BEGIN;

-- Step 1: Update dropdown_categories slugs
UPDATE dropdown_categories SET slug = 'dropdown-1' WHERE slug = 'transport-level';
UPDATE dropdown_categories SET slug = 'dropdown-2' WHERE slug = 'urgency';
UPDATE dropdown_categories SET slug = 'dropdown-3' WHERE slug = 'diagnosis';
UPDATE dropdown_categories SET slug = 'dropdown-4' WHERE slug = 'mobility';
UPDATE dropdown_categories SET slug = 'dropdown-5' WHERE slug = 'insurance';
UPDATE dropdown_categories SET slug = 'dropdown-6' WHERE slug = 'secondary-insurance';
UPDATE dropdown_categories SET slug = 'dropdown-7' WHERE slug = 'special-needs';

-- Step 2: Update dropdown_options category field
UPDATE dropdown_options SET category = 'dropdown-1' WHERE category = 'transport-level';
UPDATE dropdown_options SET category = 'dropdown-2' WHERE category = 'urgency';
UPDATE dropdown_options SET category = 'dropdown-3' WHERE category = 'diagnosis';
UPDATE dropdown_options SET category = 'dropdown-4' WHERE category = 'mobility';
UPDATE dropdown_options SET category = 'dropdown-5' WHERE category = 'insurance';
UPDATE dropdown_options SET category = 'dropdown-6' WHERE category = 'secondary-insurance';
UPDATE dropdown_options SET category = 'dropdown-7' WHERE category = 'special-needs';

-- Step 3: Verify results
SELECT slug, "displayName", "displayOrder" FROM dropdown_categories ORDER BY "displayOrder";
SELECT category, COUNT(*) as option_count FROM dropdown_options GROUP BY category ORDER BY category;

-- ROLLBACK (if needed):
-- UPDATE dropdown_categories SET slug = 'transport-level' WHERE slug = 'dropdown-1';
-- UPDATE dropdown_categories SET slug = 'urgency' WHERE slug = 'dropdown-2';
-- UPDATE dropdown_categories SET slug = 'diagnosis' WHERE slug = 'dropdown-3';
-- UPDATE dropdown_categories SET slug = 'mobility' WHERE slug = 'dropdown-4';
-- UPDATE dropdown_categories SET slug = 'insurance' WHERE slug = 'dropdown-5';
-- UPDATE dropdown_categories SET slug = 'secondary-insurance' WHERE slug = 'dropdown-6';
-- UPDATE dropdown_categories SET slug = 'special-needs' WHERE slug = 'dropdown-7';
-- UPDATE dropdown_options SET category = 'transport-level' WHERE category = 'dropdown-1';
-- UPDATE dropdown_options SET category = 'urgency' WHERE category = 'dropdown-2';
-- UPDATE dropdown_options SET category = 'diagnosis' WHERE category = 'dropdown-3';
-- UPDATE dropdown_options SET category = 'mobility' WHERE category = 'dropdown-4';
-- UPDATE dropdown_options SET category = 'insurance' WHERE category = 'dropdown-5';
-- UPDATE dropdown_options SET category = 'secondary-insurance' WHERE category = 'dropdown-6';
-- UPDATE dropdown_options SET category = 'special-needs' WHERE category = 'dropdown-7';

COMMIT;
```

**Decision:** Keep all 7 categories. The 7th category (`special-needs` / `dropdown-7`) is used for configuring checkbox options that appear in the trip creation form. Users manage these checkbox options via Hospital Settings → Category Options → special-needs.

---

### Phase 2: Local Dev Implementation

#### Task 2.1: Database Changes (pgAdmin)
- [ ] **Create full database backup** using backup script before proceeding
- [ ] Open pgAdmin
- [ ] Connect to local dev database (`medport_ems`)
- [ ] Open Query Tool
- [ ] Execute SQL migration script
- [ ] Verify results:
  - [ ] 7 categories exist with slugs `dropdown-1` through `dropdown-7`
  - [ ] All options are linked to correct categories
  - [ ] No orphaned options
  - [ ] Category counts match expected values
  - [ ] `special-needs` (dropdown-7) has options configured

#### Task 2.2: Backend Code Changes

**File: `backend/prisma/seed.ts`**
- [x] Update category seeds to use new slugs (dropdown-1 through dropdown-7)
- [x] Update all dropdown option category references to use new slugs

**File: `backend/src/routes/dropdownCategories.ts`**
- [x] Remove `POST /api/dropdown-categories` endpoint (create category) - Returns 403 Forbidden
- [x] Update `PUT /api/dropdown-categories/:id` endpoint:
  - [x] Remove `slug` from allowed update fields
  - [x] Only allow: `displayName`, `displayOrder`, `isActive`
  - [x] Add validation to prevent slug changes
- [x] Delete endpoint already prevents deletion if category has options (existing behavior maintained)

**File: `backend/src/routes/dropdownOptions.ts`**
- [x] Update urgency category references from 'urgency' to 'dropdown-2'
- [x] Category validation uses database lookup (will work with new slugs after migration)

#### Task 2.3: Frontend Code Changes

**File: `frontend/src/components/HospitalSettings.tsx`**
- [x] Remove "Add Category" button from Category Options tab
- [x] Remove slug input field from category form (replaced with read-only display)
- [x] Update form to only allow editing:
  - Display Name
  - Display Order
  - Active/Inactive status
- [x] Update `handleCategorySubmit` to prevent category creation
- [x] Add UI message explaining categories are fixed (7 predefined slugs)
- [x] Update information box to reflect fixed categories

**File: `frontend/src/components/EnhancedTripForm.tsx`**
- [x] Update hardcoded category slugs to dropdown-1 through dropdown-7
- [x] Update default option loading to use new slugs
- [x] Keep `special-needs` category loading (dropdown-7) for checkbox configuration

**File: `frontend/src/services/api.ts`**
- [x] Add documentation comment that `dropdownCategoriesAPI.create` is disabled

#### Task 2.4: Local Dev Testing
- [x] Start local backend
- [x] Start local frontend
- [x] Test Category Options tab:
  - [x] Verify 7 categories display correctly (including special-needs)
  - [x] Verify can edit display names
  - [x] Verify can edit display order
  - [x] Verify cannot add new category (button removed)
  - [x] Verify cannot edit slugs (field removed)
  - [x] Verify special-needs category can be managed (for checkbox options)
- [x] **Primary Test: Trip Creation Form**
  - [x] Verify all 6 dropdowns load options correctly:
    - [x] Transport Level (dropdown-1)
    - [x] Urgency Level (dropdown-2)
    - [x] Diagnosis (dropdown-3)
    - [x] Mobility Level (dropdown-4)
    - [x] Insurance Company (dropdown-5)
    - [x] Secondary Insurance (dropdown-6)
  - [x] Verify special-needs checkboxes load from dropdown-7
  - [x] Verify options display in correct order
  - [x] Create a test trip with all fields populated (Patient P5H1DQKRU)
  - [x] Verify trip saves successfully
  - [x] Verify trip dispatch works correctly
- [x] Test dropdown options management:
  - [x] Verify can add/edit/delete options within categories
  - [x] Verify options link to correct categories

---

### Phase 3: Dev-SWA Migration & Testing

#### Task 3.1: Database Migration (pgAdmin)
- [ ] **Create full database backup** using backup script before proceeding
- [ ] Open pgAdmin
- [ ] Connect to dev-swa database (`traccems-dev-pgsql`)
- [ ] Open Query Tool
- [ ] Execute same SQL migration script
- [ ] Verify results (same checks as local dev):
  - [ ] 7 categories exist with slugs `dropdown-1` through `dropdown-7`
  - [ ] All options are linked to correct categories
  - [ ] No orphaned options
  - [ ] Category counts match expected values
- [ ] Test that existing trips still work (verify data integrity)

#### Task 3.2: Code Deployment
- [ ] Commit all changes to branch
- [ ] Push branch to GitHub
- [ ] Merge branch to `develop` (or create PR)
- [ ] Trigger dev-swa backend deployment
- [ ] Wait for deployment to complete
- [ ] Trigger dev-swa frontend deployment
- [ ] Wait for deployment to complete

#### Task 3.3: Dev-SWA Testing
- [ ] Test Category Options tab (same tests as local dev)
- [ ] **Primary Test: Trip Creation Form**
  - [ ] Verify all 6 dropdowns load options correctly
  - [ ] Verify special-needs checkboxes load
  - [ ] Create new trip with all fields populated
  - [ ] Verify trip saves successfully
- [ ] **Spot Check: EMS Providers**
  - [ ] Verify EMS Providers list loads
  - [ ] Verify no errors in console
- [ ] **Spot Check: Destinations**
  - [ ] Verify destination selection works
  - [ ] Verify no errors in console
- [ ] Test with existing data:
  - [ ] Verify existing trips display correctly
  - [ ] Verify existing options still work
- [ ] Check backend logs for any errors
- [ ] Verify no 500 errors in browser console

**If Issues Found:**
- [ ] Document the issue
- [ ] Fix in local dev first
- [ ] Re-test locally
- [ ] Re-deploy to dev-swa
- [ ] Re-test dev-swa

---

### Phase 4: Production Migration & Deployment

#### Task 4.1: Pre-Production Checklist
- [ ] Verify dev-swa is stable (no errors for 24+ hours, or proceed if local dev went smoothly)
- [ ] **Create full production database backup** using backup script
- [ ] Document rollback plan
- [ ] Schedule maintenance window (if needed)

#### Task 4.2: Database Migration (pgAdmin)
- [ ] **CRITICAL: Full production database backup already created** (from Task 4.1)
- [ ] Open pgAdmin
- [ ] Connect to production database (`traccems-prod-pgsql`)
- [ ] Open Query Tool
- [ ] Execute SQL migration script
- [ ] Verify results (same checks as local dev):
  - [ ] 7 categories exist with slugs `dropdown-1` through `dropdown-7`
  - [ ] All options are linked to correct categories
  - [ ] No orphaned options
  - [ ] Category counts match expected values
- [ ] Test that existing production trips still work

#### Task 4.3: Code Deployment
- [ ] Merge `develop` to `main` branch
- [ ] Trigger production backend deployment via GitHub Actions
- [ ] Monitor deployment logs
- [ ] Wait for deployment to complete
- [ ] Trigger production frontend deployment
- [ ] Monitor deployment logs
- [ ] Wait for deployment to complete

#### Task 4.4: Production Verification
- [ ] Test Category Options tab (verify 7 categories display)
- [ ] **Primary Test: Trip Creation Form**
  - [ ] Verify all 6 dropdowns load options correctly
  - [ ] Verify special-needs checkboxes load
  - [ ] Create test trip with all fields populated
  - [ ] Verify trip saves successfully
- [ ] **Spot Check: EMS Providers**
  - [ ] Verify EMS Providers list loads
  - [ ] Verify no errors in console
- [ ] **Spot Check: Destinations**
  - [ ] Verify destination selection works
  - [ ] Verify no errors in console
- [ ] Test with existing production data (verify existing trips display correctly)
- [ ] Monitor backend logs for errors
- [ ] Check Azure Portal for any alerts
- [ ] Verify no user-reported issues

**If Production Issues:**
- [ ] Immediately assess severity
- [ ] If critical: Execute rollback SQL
- [ ] If minor: Fix and redeploy
- [ ] Document incident

---

### Phase 5: Cleanup & Documentation

#### Task 5.1: Code Cleanup
- [ ] Remove any commented-out code
- [ ] Remove unused imports
- [ ] Update TypeScript types if needed
- [ ] Run linter and fix any issues

#### Task 5.2: Documentation Updates
- [ ] Update `docs/reference/help_system_workflow.md` if category options are mentioned
- [ ] Update any admin documentation about category management
- [ ] Document the 6 fixed categories and their purposes
- [ ] Add note about why categories are locked down

#### Task 5.3: Git Cleanup
- [ ] Ensure all changes are committed
- [ ] Create merge commit or squash commits (as preferred)
- [ ] Tag release if appropriate
- [ ] Update CHANGELOG if you maintain one

---

## Risk Assessment & Mitigation

### High Risk: Data Loss During Slug Rename
**Mitigation:**
- **Create full database backup before each migration** (using backup script)
- Test SQL script on local dev first
- Verify option counts before and after migration
- Have rollback SQL ready

### Medium Risk: Form Breaks if Mapping Wrong
**Mitigation:**
- Test trip creation thoroughly in each environment
- Verify all 6 dropdowns load options
- Test creating trips with all field combinations
- Monitor error logs

### Low Risk: User Confusion
**Mitigation:**
- Add UI message explaining categories are fixed
- Update help documentation
- Provide clear admin guidance

---

## Decisions Made

1. **Special Needs Category:** ✅ **Keep all 7 categories**
   - `special-needs` becomes `dropdown-7`
   - Used for configuring checkbox options that appear in trip creation form
   - Users manage these checkbox options via Hospital Settings → Category Options → special-needs
   - This allows users to customize what patient needs/requirements appear as checkboxes

2. **Display Order:** Keep current `displayOrder` values (no changes needed)

3. **Category Deletion:** Allow soft delete but prevent if category has options (current behavior maintained)

4. **Migration Timing:** ✅ **Space out environments**
   - Typically one environment per day
   - If local dev goes smoothly, may proceed to dev-swa same day
   - Production always separate session after dev-swa is stable

5. **Backup Strategy:** ✅ **Full database backup before each migration**
   - Use backup script to create complete backup
   - Backup before local dev migration
   - Backup before dev-swa migration
   - Backup before production migration

6. **Testing Focus:** ✅ **Primary focus on trip creation**
   - Thoroughly test trip creation form (all 6 dropdowns + special-needs checkboxes)
   - Spot check EMS Providers functionality
   - Spot check Destinations functionality
   - Verify existing trips still work

---

## Estimated Timeline

- **Phase 1 (Preparation):** 1-2 hours
- **Phase 2 (Local Dev):** 3-4 hours
- **Phase 3 (Dev-SWA):** 2-3 hours (including testing)
- **Phase 4 (Production):** 2-3 hours (including verification)
- **Phase 5 (Cleanup):** 1 hour

**Total:** 9-13 hours

---

## Success Criteria

✅ All 7 categories use fixed slugs (`dropdown-1` through `dropdown-7`)  
✅ Users cannot add new categories  
✅ Users cannot change category slugs  
✅ Users can only edit display names and order  
✅ Trip creation form loads all 6 dropdowns correctly  
✅ Special-needs checkboxes load from `dropdown-7` correctly  
✅ Trip creation process works end-to-end  
✅ EMS Providers functionality unaffected (spot check)  
✅ Destinations functionality unaffected (spot check)  
✅ Existing trips continue to work  
✅ No data loss during migration  
✅ All three environments (local, dev-swa, production) are in sync  

---

## Notes

- This plan assumes we're working in a git branch and will merge to `develop` after testing
- Azure CLI is available for checking deployment status if needed
- pgAdmin can be used to connect to all three databases simultaneously
- Past migration issues suggest pgAdmin is safer than Prisma migrations for this change
- All SQL scripts should be saved in git for documentation and rollback purposes

---

**Last Updated:** January 16, 2026  
**Status:** ✅ **UPDATED WITH DECISIONS** - Ready for Implementation

---

## Implementation Notes

- **All 7 categories will be kept** - including `special-needs` as `dropdown-7` for checkbox configuration
- **Full database backups required** before each environment migration
- **Testing focus:** Trip creation is primary, EMS Providers and Destinations are spot checks
- **Timing:** Space out environments (typically one per day, but flexible based on local dev results)
- **Backup script:** Use `documentation/scripts/backup-production-complete.sh` or similar for full backups
