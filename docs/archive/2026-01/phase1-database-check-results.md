# Phase 1 Database Check Results
**Date:** January 6, 2026  
**Status:** ✅ **COMPLETE** - Results documented

---

## Executive Summary

**Phase 1 migrations are ALREADY APPLIED**, but with important findings:
- ✅ Foundation tables exist and are properly configured
- ⚠️ Tables that migration would drop still exist with data
- ⚠️ Migration appears to have partially succeeded (CREATE worked, DROP may have failed)

---

## Migration Status

### Migration History

| Migration Name | Status | Applied Date | Notes |
|---------------|--------|--------------|-------|
| `20250917170653_add_center_tables` | ✅ Applied | Dec 26, 2025 18:18:32 | Marked as applied |
| `20251204101500_add_user_deletion_fields` | ✅ Applied | Dec 26, 2025 18:20:14 | Marked as applied (appears twice in history) |

**Note:** The deletion fields migration appears twice in history - once with `finished_at: null` and once completed. This suggests it may have been retried.

---

## Table Status

### Tables Created by Migration (Should Exist)

| Table | Status | Notes |
|-------|--------|-------|
| `center_users` | ✅ Exists | Has all columns including deletion fields |
| `hospitals` | ✅ Exists | Created successfully |
| `agencies` | ✅ Exists | Created successfully |
| `facilities` | ✅ Exists | Created successfully |
| `trips` | ✅ Exists | Created successfully |
| `system_analytics` | ✅ Exists | Created successfully |

### Tables That Migration Would Drop (Still Exist!)

| Table | Status | Row Count | Risk Level |
|-------|--------|-----------|------------|
| `ems_users` | ⚠️ **EXISTS** | **3 rows** | 🔴 **HIGH** - Has data, should not exist per migration |
| `transport_requests` | ⚠️ **EXISTS** | **1 row** | 🔴 **HIGH** - Has data, should not exist per migration |
| `units` | ✅ Does not exist | 0 | ✅ Safe - Migration would drop, doesn't exist |
| `crew_roles` | ✅ Does not exist | 0 | ✅ Safe - Migration would drop, doesn't exist |

### Columns That Migration Would Drop (Still Exist!)

| Table | Column | Status | Notes |
|-------|--------|--------|-------|
| `ems_agencies` | `addedAt` | ⚠️ **EXISTS** | Migration would drop, but still exists |
| `ems_agencies` | `addedBy` | ⚠️ **EXISTS** | Migration would drop, but still exists |

---

## Detailed Findings

### center_users Table

**Status:** ✅ Fully configured

**Columns Present:**
- ✅ `id` (text, primary key)
- ✅ `email` (text, unique)
- ✅ `password` (text)
- ✅ `name` (text)
- ✅ `userType` (text)
- ✅ `isActive` (boolean, default true)
- ✅ `createdAt` (timestamp)
- ✅ `updatedAt` (timestamp)
- ✅ `deletedAt` (timestamp, nullable) ✅ **Deletion field**
- ✅ `isDeleted` (boolean, default false) ✅ **Deletion field**
- ✅ `phone` (text, nullable)
- ✅ `emailNotifications` (boolean, default true)
- ✅ `smsNotifications` (boolean, default false)

**Indexes:**
- ✅ Unique index on `email`
- ✅ Index on `isDeleted`

### User Deletion Fields

**Status:** ✅ All user tables have deletion fields

| Table | deletedAt | isDeleted | Index |
|-------|-----------|-----------|-------|
| `center_users` | ✅ | ✅ | ✅ |
| `healthcare_users` | ✅ | ✅ | ✅ |
| `ems_users` | ✅ | ✅ | ✅ |

---

## Critical Findings

### Finding 1: Migration Partially Applied

**Issue:** Migration `20250917170653_add_center_tables` was marked as applied, but:
- ✅ CREATE statements succeeded (tables created)
- ❓ DROP statements may have failed or been skipped (tables still exist)

**Evidence:**
- Migration history shows migration as "finished"
- But `ems_users` and `transport_requests` tables still exist with data
- `ems_agencies` still has `addedAt`/`addedBy` columns

**Possible Explanations:**
1. Migration failed on DROP statements (foreign key constraints, etc.)
2. Tables were recreated after migration
3. Migration was modified to skip DROP statements
4. Migration ran in a different environment/database

### Finding 2: Data Exists in Tables That Should Not Exist

**Issue:** Tables that migration would drop contain data:
- `ems_users`: 3 rows
- `transport_requests`: 1 row

**Impact:**
- These tables are being used in production
- Data would be lost if migration runs again
- Need to understand why they exist and if they're needed

### Finding 3: Column Conflict

**Issue:** `ems_agencies` table has `addedAt`/`addedBy` columns that:
- Migration `20250917170653_add_center_tables` would drop
- Migration `20251204130000_add_ems_agency_availability_status` would add
- Currently exist in production

**Analysis:**
- These columns were added by a later migration (Dec 4, 2025)
- The earlier migration (Sept 17, 2025) would drop them
- This suggests migrations were applied out of order or the drop was skipped

---

## What This Means for Phase 1

### Phase 1 Status: ✅ **COMPLETE**

**All Phase 1 objectives achieved:**
- ✅ `center_users` table exists with all columns
- ✅ User deletion fields exist in all user tables
- ✅ Foundation tables created

**However:**
- ⚠️ Schema state doesn't match migration expectations
- ⚠️ Tables exist that migration would drop
- ⚠️ Need to understand current production functionality

---

## Testing Recommendations

Based on these findings, production testing should focus on:

### 1. EMS User Functionality (HIGH PRIORITY)
- **Why:** 3 EMS users exist in database
- **Test:**
  - [ ] Can EMS users log in?
  - [ ] Can EMS users view their profile?
  - [ ] Can EMS users perform their functions?
  - [ ] Are EMS users properly associated with agencies?

### 2. Transport Request Functionality (HIGH PRIORITY)
- **Why:** 1 transport request exists in database
- **Test:**
  - [ ] Can transport requests be viewed?
  - [ ] Can new transport requests be created?
  - [ ] Can transport requests be edited?
  - [ ] Do transport requests link correctly to other tables?

### 3. EMS Agency Functionality
- **Why:** `addedAt`/`addedBy` columns exist and may be in use
- **Test:**
  - [ ] Can EMS agencies be viewed?
  - [ ] Can EMS agencies be created/edited?
  - [ ] Do `addedAt`/`addedBy` fields work correctly?

### 4. General Functionality
- **Test:**
  - [ ] User login works (all user types)
  - [ ] User queries work
  - [ ] No errors in application logs
  - [ ] API endpoints respond correctly

---

## Next Steps

### Immediate Actions:
1. ✅ **Database check complete** - Results documented
2. ⏭️ **Test production functionality** - User will test based on findings
3. ⏭️ **Document test results** - Update testing checklist
4. ⏭️ **Decide on Phase 2** - Based on test results

### Questions to Answer:
1. Why do `ems_users` and `transport_requests` tables exist if migration would drop them?
2. Are these tables being used in production?
3. Should these tables exist, or should they be dropped?
4. What's the correct schema state for production?

---

## GitHub Actions Workflow

**Found:** `.github/workflows/prod-be.yaml`

**Migration Execution:**
- ✅ Runs `npx prisma migrate deploy` (line 49)
- ✅ Uses `DATABASE_URL_PROD` secret
- ✅ Fails fast if migrations fail (`continue-on-error: false`)
- ✅ Runs automatically during deployment

**Status:** ✅ Workflow is properly configured

---

**Last Updated:** January 6, 2026  
**Status:** ✅ Database check complete, ready for production testing

