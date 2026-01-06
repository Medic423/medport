# Database Catch-Up Plan: Resolving Environment Differences
**Date:** January 6, 2026  
**Purpose:** Systematically resolve database schema differences between Local Dev, Dev-SWA, and Production  
**Status:** 📋 **PLAN CREATED** - Ready for execution

---

## Executive Summary

**Problem:** Three environments (Local Dev, Dev-SWA, Production) have diverged database schemas, causing:
- Features working in dev/dev-swa but failing in production
- Missing tables causing 500 errors
- Schema validation errors
- Inconsistent functionality across environments

**Solution:** Apply migrations incrementally, one group at a time, testing after each group to avoid cascading failures.

**Approach:** Categorize migrations by dependency and impact, apply in logical groups, verify after each group.

---

## Current State Analysis

### Environment Status

**Local Dev (`medport_ems`):**
- ✅ Uses full `schema.prisma`
- ✅ All 30 migrations applied
- ✅ All tables exist
- ✅ All API routes available

**Dev-SWA (`traccems-dev-pgsql`):**
- ✅ Uses full `schema.prisma` (after unification)
- ✅ All 30 migrations applied
- ✅ All tables exist
- ✅ All API routes available (after code unification)

**Production (`traccems-prod-pgsql`):**
- ⚠️ Uses full `schema.prisma` (after code unification)
- ⚠️ **Partial migrations applied** (some tables missing)
- ⚠️ Some tables exist, many missing
- ✅ All API routes available (after code unification)

### Code Unification Status

**Completed (January 5, 2026):**
- ✅ `production-index.ts` updated with all 14 missing routes
- ✅ `package.json` updated to use `schema.prisma` instead of `schema-production.prisma`
- ✅ Middleware unified (cookieParser, CORS)
- ✅ Migration process unified (uses `prisma migrate deploy`)

**Remaining:**
- ⚠️ Database migrations need to be applied to production
- ⚠️ Missing tables need to be created
- ⚠️ Missing columns need to be added to existing tables

---

## Migration Inventory

### Total Migrations: 30

**Migration Timeline:**
1. `20250908204607_enhanced_trip_schema` - Enhanced trip schema
2. `20250908204620_enhanced_trip_schema` - Enhanced trip schema (continued)
3. `20250908204633_enhanced_trip_schema` - Enhanced trip schema (continued)
4. `20250909152957_enhance_unit_model` - Unit model enhancements
5. `20250909155719_q` - Quick fix
6. `20250909163838_replace_shift_times_with_onduty` - Shift times replacement
7. `20250909170057_add_agency_relationship_to_ems_user` - EMS user agency relationship
8. `20250909171727_remove_ison_duty_field` - Remove isOnDuty field
9. `20250910173907_add_insurance_field_to_trips` - Insurance field to trips
10. `20250910173915_add_dropdown_options_model` - Dropdown options model
11. `20250910191806_add_route_optimization_fields` - Route optimization fields
12. `20250910192847_add_insurance_pricing_fields` - Insurance pricing fields
13. `20250917132535_add_route_optimization_settings` - Route optimization settings table
14. `20250917160459_add_analytics_fields` - Analytics fields
15. `20250917160504_add_unit_analytics_fields` - Unit analytics fields
16. `20250917165001_add_crew_cost_management` - Crew cost management
17. `20250917165101_add_crew_cost_management_ems` - Crew cost management EMS
18. `20250917170653_add_center_tables` - Center tables (CenterUser, etc.)
19. `20250917170718_add_insurance_company_column` - Insurance company column
20. `20250917170740_add_pricing_models` - Pricing models table
21. `20250917180000_add_trip_cost_breakdown_and_cost_centers` - Trip cost breakdown and cost centers
22. `20251008113055_add_multi_location_healthcare` - Multi-location healthcare (HealthcareUser, HealthcareLocation)
23. `20251008124127_add_gps_coordinates_to_healthcare_locations` - GPS coordinates to healthcare locations
24. `20251031133000_add_patient_age_fields` - Patient age fields
25. `20251102101911_add_healthcare_destinations` - Healthcare destinations table
26. `20251102140000_add_healthcare_agency_preferences` - Healthcare agency preferences table
27. `20251116131400_add_separate_completion_timestamps` - Separate completion timestamps
28. `20251204101500_add_user_deletion_fields` - User deletion fields (deletedAt, isDeleted)
29. `20251204130000_add_ems_agency_availability_status` - EMS agency availability status (addedBy, addedAt)
30. `20251209140000_add_dropdown_categories` - Dropdown categories table

---

## Missing Tables in Production (Based on Documentation)

### Critical Tables (Core Functionality)
1. ❌ `healthcare_users` - Healthcare user accounts
2. ❌ `healthcare_locations` - Healthcare facility locations
3. ❌ `healthcare_agency_preferences` - Healthcare agency preferences
4. ❌ `healthcare_destinations` - Healthcare destinations
5. ❌ `transport_requests` - Transport requests (trip creation)
6. ❌ `agency_responses` - Agency responses (dispatch/acceptance)
7. ❌ `ems_users` - EMS user accounts
8. ❌ `ems_agencies` - EMS agencies (may exist but missing columns)
9. ❌ `dropdown_categories` - Dropdown categories
10. ❌ `dropdown_options` - Dropdown options
11. ❌ `pickup_locations` - Pickup locations

### Supporting Tables (Features)
12. ❌ `pricing_models` - Pricing models
13. ❌ `route_optimization_settings` - Route optimization settings
14. ❌ `trip_cost_breakdown` - Trip cost breakdown
15. ❌ `cost_centers` - Cost centers
16. ❌ `backhaul_opportunities` - Backhaul opportunities
17. ❌ `unit_analytics` - Unit analytics
18. ❌ `notification_preferences` - Notification preferences
19. ❌ `notification_logs` - Notification logs

### Existing Tables (May Need Column Updates)
20. ⚠️ `center_users` - May be missing notification fields, deletion fields
21. ⚠️ `hospitals` - May be simplified
22. ⚠️ `trips` - May be missing many fields
23. ⚠️ `units` - May be missing analytics fields
24. ⚠️ `facilities` - May be simplified
25. ⚠️ `system_analytics` - May be simplified

---

## Migration Strategy: Incremental Application

### Principle: Apply in Logical Groups

**Why Incremental:**
- Avoids cascading failures
- Allows testing after each group
- Easier to identify issues
- Can rollback individual groups if needed
- Less risk to production data

**Groups Defined By:**
- Dependencies (tables that other tables reference)
- Functionality (related features)
- Risk level (low-risk vs high-risk changes)

---

## Phase 1: Foundation Tables (Low Risk, High Dependency)

**Goal:** Create base tables that other tables depend on

**Migrations:**
- `20250917170653_add_center_tables` - CenterUser (if missing columns)
- `20251204101500_add_user_deletion_fields` - Add deletion fields to existing user tables

**Tables Created/Updated:**
- `center_users` - Ensure has all columns (notification fields, deletion fields)
- Update existing user tables with `deletedAt`, `isDeleted` columns

**Dependencies:** None (foundation)

**Risk Level:** 🟢 **LOW** - Adding nullable columns, no data loss

**Testing After Phase 1:**
- [ ] Verify `center_users` table has all columns
- [ ] Verify user deletion fields exist
- [ ] Test user login (should still work)
- [ ] Test user queries (should still work)

**Rollback Plan:**
- Columns can be dropped if needed
- No data loss (nullable columns)

---

## Phase 2: EMS Foundation (Medium Risk, Core Functionality)

**Goal:** Create EMS-related tables needed for dispatch/acceptance

**Migrations:**
- `20250909170057_add_agency_relationship_to_ems_user` - EMS user agency relationship
- `20251204130000_add_ems_agency_availability_status` - EMS agency availability (addedBy, addedAt) - **Already Applied**
- Create `ems_users` table (if missing)
- Create `ems_agencies` table (if missing, or update if exists)

**Tables Created/Updated:**
- `ems_users` - EMS user accounts
- `ems_agencies` - EMS agencies (ensure has addedBy, addedAt columns)

**Dependencies:** None (standalone)

**Risk Level:** 🟡 **MEDIUM** - Core functionality depends on this

**Testing After Phase 2:**
- [ ] Verify `ems_users` table exists
- [ ] Verify `ems_agencies` table exists with all columns
- [ ] Test EMS registration (should work)
- [ ] Test EMS login (should work)
- [ ] Verify agency list endpoint works

**Rollback Plan:**
- Tables can be dropped if needed
- Data can be recreated

**Note:** `addedBy`/`addedAt` columns already added to production (January 4, 2026)

---

## Phase 3: Healthcare Foundation (Medium Risk, Core Functionality)

**Goal:** Create healthcare-related tables needed for trip creation

**Migrations:**
- `20251008113055_add_multi_location_healthcare` - HealthcareUser, HealthcareLocation
- `20251008124127_add_gps_coordinates_to_healthcare_locations` - GPS coordinates
- `20251102101911_add_healthcare_destinations` - Healthcare destinations
- `20251102140000_add_healthcare_agency_preferences` - Healthcare agency preferences

**Tables Created:**
- `healthcare_users` - Healthcare user accounts
- `healthcare_locations` - Healthcare facility locations
- `healthcare_destinations` - Healthcare destinations
- `healthcare_agency_preferences` - Healthcare agency preferences

**Dependencies:** `ems_agencies` (for agency preferences)

**Risk Level:** 🟡 **MEDIUM** - Core functionality depends on this

**Testing After Phase 3:**
- [ ] Verify all healthcare tables exist
- [ ] Test healthcare registration (should work)
- [ ] Test healthcare login (should work)
- [ ] Test location management (should work)
- [ ] Test destination management (should work)

**Rollback Plan:**
- Tables can be dropped if needed
- Data can be recreated

---

## Phase 4: Transport & Trip Tables (High Risk, Core Functionality)

**Goal:** Create transport request and trip-related tables

**Migrations:**
- `20250908204607_enhanced_trip_schema` - Enhanced trip schema
- `20250908204620_enhanced_trip_schema` - Enhanced trip schema (continued)
- `20250908204633_enhanced_trip_schema` - Enhanced trip schema (continued)
- `20250910173907_add_insurance_field_to_trips` - Insurance field
- `20250910192847_add_insurance_pricing_fields` - Insurance pricing fields
- `20250917170718_add_insurance_company_column` - Insurance company column
- `20251031133000_add_patient_age_fields` - Patient age fields
- `20251116131400_add_separate_completion_timestamps` - Completion timestamps

**Tables Created/Updated:**
- `transport_requests` - Transport requests (trip creation)
- `trips` - Update with all missing fields
- `agency_responses` - Agency responses (dispatch/acceptance)

**Dependencies:** 
- `healthcare_locations` (for transport requests)
- `ems_agencies` (for agency responses)
- `healthcare_users` (for transport requests)

**Risk Level:** 🔴 **HIGH** - Core trip creation/dispatch functionality

**Testing After Phase 4:**
- [ ] Verify `transport_requests` table exists
- [ ] Verify `agency_responses` table exists
- [ ] Verify `trips` table has all columns
- [ ] Test trip creation (should work)
- [ ] Test dispatch (should work)
- [ ] Test EMS acceptance (should work)

**Rollback Plan:**
- Tables can be dropped if needed
- **WARNING:** May affect existing trips data

---

## Phase 5: Dropdown & Reference Data (Low Risk, Supporting Features)

**Goal:** Create dropdown and reference data tables

**Migrations:**
- `20250910173915_add_dropdown_options_model` - Dropdown options
- `20251209140000_add_dropdown_categories` - Dropdown categories
- Create `pickup_locations` table (if missing)

**Tables Created:**
- `dropdown_categories` - Dropdown categories
- `dropdown_options` - Dropdown options
- `pickup_locations` - Pickup locations

**Dependencies:** None (reference data)

**Risk Level:** 🟢 **LOW** - Reference data, no critical dependencies

**Testing After Phase 5:**
- [ ] Verify dropdown tables exist
- [ ] Verify pickup_locations table exists
- [ ] Test dropdown options endpoint (should work)
- [ ] Test pickup locations endpoint (should work)
- [ ] Test forms that use dropdowns (should work)

**Rollback Plan:**
- Tables can be dropped if needed
- Data can be reseeded

---

## Phase 6: Analytics & Optimization (Low Risk, Supporting Features)

**Goal:** Create analytics and optimization tables

**Migrations:**
- `20250917160459_add_analytics_fields` - Analytics fields
- `20250917160504_add_unit_analytics_fields` - Unit analytics fields
- `20250917132535_add_route_optimization_settings` - Route optimization settings
- `20250910191806_add_route_optimization_fields` - Route optimization fields

**Tables Created/Updated:**
- `unit_analytics` - Unit analytics
- `route_optimization_settings` - Route optimization settings
- `units` - Update with analytics fields

**Dependencies:** `units` table

**Risk Level:** 🟢 **LOW** - Analytics features, not critical

**Testing After Phase 6:**
- [ ] Verify analytics tables exist
- [ ] Verify units table has analytics fields
- [ ] Test analytics endpoints (should work)
- [ ] Test route optimization (should work)

**Rollback Plan:**
- Tables can be dropped if needed
- Analytics data can be regenerated

---

## Phase 7: Cost Management (Low Risk, Supporting Features)

**Goal:** Create cost management tables

**Migrations:**
- `20250917165001_add_crew_cost_management` - Crew cost management
- `20250917165101_add_crew_cost_management_ems` - Crew cost management EMS
- `20250917170740_add_pricing_models` - Pricing models
- `20250917180000_add_trip_cost_breakdown_and_cost_centers` - Trip cost breakdown and cost centers

**Tables Created:**
- `pricing_models` - Pricing models
- `trip_cost_breakdown` - Trip cost breakdown
- `cost_centers` - Cost centers
- `backhaul_opportunities` - Backhaul opportunities

**Dependencies:** `trips` table

**Risk Level:** 🟢 **LOW** - Cost features, not critical

**Testing After Phase 7:**
- [ ] Verify cost management tables exist
- [ ] Test pricing endpoints (should work)
- [ ] Test cost breakdown endpoints (should work)

**Rollback Plan:**
- Tables can be dropped if needed
- Cost data can be recalculated

---

## Phase 8: Notifications (Low Risk, Supporting Features)

**Goal:** Create notification tables

**Tables Created:**
- `notification_preferences` - Notification preferences
- `notification_logs` - Notification logs

**Dependencies:** `center_users` table

**Risk Level:** 🟢 **LOW** - Notification features, not critical

**Testing After Phase 8:**
- [ ] Verify notification tables exist
- [ ] Test notification endpoints (should work)
- [ ] Test notification preferences (should work)

**Rollback Plan:**
- Tables can be dropped if needed
- Notification data can be recreated

---

## Phase 9: Unit Enhancements (Low Risk, Supporting Features)

**Goal:** Update units table with all enhancements

**Migrations:**
- `20250909152957_enhance_unit_model` - Unit model enhancements
- `20250909155719_q` - Quick fix
- `20250909163838_replace_shift_times_with_onduty` - Shift times replacement
- `20250909171727_remove_ison_duty_field` - Remove isOnDuty field

**Tables Updated:**
- `units` - Ensure has all columns

**Dependencies:** `units` table (must exist)

**Risk Level:** 🟢 **LOW** - Unit enhancements, not critical

**Testing After Phase 9:**
- [ ] Verify units table has all columns
- [ ] Test unit endpoints (should work)
- [ ] Test unit management (should work)

**Rollback Plan:**
- Columns can be dropped if needed
- No data loss (nullable columns)

---

## Execution Plan

### Pre-Execution Checklist

**Before Starting:**
- [ ] **CRITICAL:** Backup production database
  - Location: `/Volumes/Acasis/tcc-backups/`
  - Script: `documentation/scripts/backup-production-database.sh`
  - Verify backup is restorable
- [ ] Verify production code is unified (already done)
- [ ] Verify GitHub Actions workflow uses `prisma migrate deploy` (already done)
- [ ] Document current production database state
- [ ] Create rollback scripts for each phase

### Execution Steps

**For Each Phase:**

1. **Review Phase Plan**
   - Understand which migrations will run
   - Understand which tables will be created/updated
   - Understand dependencies

2. **Backup Current State** (if needed)
   - Create checkpoint backup
   - Document current schema state

3. **Apply Migrations**
   - Use GitHub Actions workflow (recommended)
   - Or apply manually via Azure Portal/CLI
   - Monitor for errors

4. **Verify Migrations Applied**
   - Check migration history table
   - Verify tables exist
   - Verify columns exist

5. **Test Functionality**
   - Run phase-specific tests
   - Verify endpoints work
   - Check for errors in logs

6. **Document Results**
   - Record what was applied
   - Record any issues encountered
   - Record test results

7. **Proceed to Next Phase** (if successful)
   - Or fix issues before proceeding

### Execution Order

**Recommended Sequence:**
1. Phase 1: Foundation Tables
2. Phase 2: EMS Foundation
3. Phase 3: Healthcare Foundation
4. Phase 4: Transport & Trip Tables ⚠️ **HIGH RISK**
5. Phase 5: Dropdown & Reference Data
6. Phase 6: Analytics & Optimization
7. Phase 7: Cost Management
8. Phase 8: Notifications
9. Phase 9: Unit Enhancements

**Alternative Sequence (If Phase 4 is too risky):**
- Apply Phases 1-3 first (foundation)
- Test core functionality
- Then apply Phase 4 (transport/trips) separately
- Then apply remaining phases

---

## Verification Steps

### After Each Phase

**Database Verification:**
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('table1', 'table2', ...)
ORDER BY table_name;

-- Check if columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'table_name'
ORDER BY ordinal_position;
```

**Migration History Verification:**
```sql
-- Check migration history
SELECT * FROM "_prisma_migrations" 
ORDER BY finished_at DESC;
```

**API Endpoint Verification:**
```bash
# Test endpoints
curl https://api.traccems.com/api/health
curl https://api.traccems.com/api/dropdown-options
curl https://api.traccems.com/api/tcc/pickup-locations
# etc.
```

### Final Verification (After All Phases)

**Schema Comparison:**
- [ ] Compare production schema with dev-swa schema
- [ ] Verify all tables exist
- [ ] Verify all columns exist
- [ ] Verify all indexes exist

**Functionality Testing:**
- [ ] Test trip creation
- [ ] Test dispatch
- [ ] Test EMS acceptance
- [ ] Test healthcare features
- [ ] Test dropdown options
- [ ] Test all API endpoints

**Performance Testing:**
- [ ] Check query performance
- [ ] Check migration execution time
- [ ] Monitor for errors

---

## Risk Mitigation

### High-Risk Phases

**Phase 4 (Transport & Trip Tables):**
- ⚠️ **HIGH RISK** - Core functionality
- **Mitigation:**
  - Apply during low-traffic period
  - Have rollback plan ready
  - Test thoroughly before proceeding
  - Monitor closely after application

### Medium-Risk Phases

**Phase 2 (EMS Foundation):**
- 🟡 **MEDIUM RISK** - Core functionality
- **Mitigation:**
  - Test EMS registration after application
  - Verify agency endpoints work
  - Monitor for errors

**Phase 3 (Healthcare Foundation):**
- 🟡 **MEDIUM RISK** - Core functionality
- **Mitigation:**
  - Test healthcare registration after application
  - Verify location endpoints work
  - Monitor for errors

### Low-Risk Phases

**Phases 1, 5, 6, 7, 8, 9:**
- 🟢 **LOW RISK** - Supporting features
- **Mitigation:**
  - Standard testing after application
  - Can rollback if needed

---

## Rollback Procedures

### Per-Phase Rollback

**If a phase fails or causes issues:**

1. **Stop execution immediately**
2. **Assess impact**
   - What broke?
   - What data is affected?
   - Can we fix without rollback?

3. **Rollback if needed:**
   ```sql
   -- Drop tables created in this phase
   DROP TABLE IF EXISTS table_name CASCADE;
   
   -- Remove columns added in this phase
   ALTER TABLE table_name DROP COLUMN IF EXISTS column_name;
   
   -- Remove migration from history
   DELETE FROM "_prisma_migrations" WHERE migration_name = 'migration_name';
   ```

4. **Restore from backup if needed:**
   ```bash
   cd /Volumes/Acasis/tcc-backups/production-db-backup-YYYYMMDD_HHMMSS
   ./restore-production-database.sh
   ```

### Full Rollback

**If everything fails:**

1. **Restore from full backup:**
   ```bash
   cd /Volumes/Acasis/tcc-backups/production-db-backup-YYYYMMDD_HHMMSS
   ./restore-production-database.sh
   ```

2. **Verify restoration:**
   - Check database state
   - Test core functionality
   - Verify data integrity

---

## Success Criteria

### Phase Completion Criteria

**Each phase is considered complete when:**
- ✅ All migrations in phase applied successfully
- ✅ All tables/columns created/updated
- ✅ No migration errors
- ✅ Phase-specific tests pass
- ✅ No errors in application logs
- ✅ API endpoints respond correctly

### Overall Completion Criteria

**Overall plan is considered complete when:**
- ✅ All 9 phases completed successfully
- ✅ Production schema matches dev-swa schema
- ✅ Production schema matches Prisma schema
- ✅ All functionality tests pass
- ✅ No errors in production
- ✅ Performance is acceptable

---

## Timeline Estimate

**Conservative Estimate:**
- Phase 1: 30 minutes (foundation, low risk)
- Phase 2: 1 hour (EMS, medium risk, needs testing)
- Phase 3: 1 hour (Healthcare, medium risk, needs testing)
- Phase 4: 2 hours (Transport/Trips, high risk, extensive testing)
- Phase 5: 30 minutes (Dropdowns, low risk)
- Phase 6: 30 minutes (Analytics, low risk)
- Phase 7: 30 minutes (Cost, low risk)
- Phase 8: 30 minutes (Notifications, low risk)
- Phase 9: 30 minutes (Units, low risk)

**Total:** ~7-8 hours (including testing and verification)

**Realistic Estimate:** 1-2 days (allowing for issues, testing, and verification)

---

## Next Steps

1. **Review this plan** - Ensure it makes sense
2. **Create backup** - Backup production database before starting
3. **Start Phase 1** - Apply foundation migrations
4. **Test and verify** - Ensure Phase 1 works
5. **Proceed incrementally** - One phase at a time
6. **Document results** - Record what was done
7. **Celebrate success** - When all phases complete! 🎉

---

## Notes

- **Don't rush** - Take time to verify each phase
- **Test thoroughly** - Better to catch issues early
- **Document everything** - Future you will thank present you
- **Have backups ready** - Safety first
- **Ask for help** - If unsure, ask before proceeding

---

**Last Updated:** January 6, 2026  
**Status:** 📋 Plan created, ready for review and execution

