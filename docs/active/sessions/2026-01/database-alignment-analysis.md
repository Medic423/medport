# Database Alignment Analysis - All Environments
**Date:** January 7, 2026  
**Status:** ⚠️ **DIFFERENCES FOUND** - Production missing tables and columns

---

## Executive Summary

**Database Comparison Results:**
- **Local Dev:** 27 tables ✅
- **Dev-SWA:** 27 tables ✅  
- **Production:** 22 tables ⚠️ (missing 6 tables)

**Key Finding:** Production database is **missing 6 tables** and has **significant column differences** in several tables, particularly the `trips` table which is missing 25 columns.

---

## Missing Tables in Production

### Critical Missing Tables (6)

1. ❌ **`backhaul_opportunities`** - Backhaul opportunity tracking
2. ❌ **`notification_logs`** - Notification logging
3. ❌ **`notification_preferences`** - User notification preferences
4. ❌ **`pricing_models`** - Pricing model configuration
5. ❌ **`unit_analytics`** - Unit analytics tracking
6. ❌ **`units`** - EMS units management

**Impact:**
- **High Impact:** `units` table - Required for EMS unit management
- **Medium Impact:** `notification_logs`, `notification_preferences` - Required for notification system
- **Low Impact:** `backhaul_opportunities`, `pricing_models`, `unit_analytics` - Advanced features

### Extra Table in Production

- ✅ **`agencies`** - Exists in Production but NOT in Local Dev or Dev-SWA
  - **Note:** This might be an old/legacy table. Check if it's still used.

---

## Column Structure Differences

### 1. `facilities` Table - Missing 8 Columns in Production

**Missing Columns:**
- `approvedAt` - Approval timestamp
- `approvedBy` - Who approved the facility
- `capabilities` - Facility capabilities
- `coordinates` - Geographic coordinates
- `latitude` - Latitude coordinate
- `longitude` - Longitude coordinate
- `operatingHours` - Operating hours
- `requiresReview` - Review requirement flag

**Impact:** Medium - Facility management features may be limited

### 2. `healthcare_destinations` Table - Naming Convention Mismatch

**Production uses snake_case:**
- `healthcare_user_id` (vs `healthcareUserId`)
- `zip_code` (vs `zipCode`)
- `contact_name` (vs `contactName`)
- `is_active` (vs `isActive`)
- `created_at` (vs `createdAt`)
- `updated_at` (vs `updatedAt`)

**Local Dev/Dev-SWA use camelCase:**
- `healthcareUserId`
- `zipCode`
- `contactName`
- `isActive`
- `createdAt`
- `updatedAt`

**Impact:** High - Prisma queries will fail if using camelCase names

### 3. `system_analytics` Table - Missing 1 Column

**Missing Column:**
- `createdAt` - Creation timestamp

**Impact:** Low - Minor tracking issue

### 4. `transport_requests` Table - Extra Columns in Production

**Production has 6 columns that Local Dev/Dev-SWA don't have:**
- `transferRequestTime`
- `transferAcceptedTime`
- `emsArrivalTime`
- `emsDepartureTime`
- `readyStart`
- `readyEnd`

**Impact:** Low - These might be legacy columns or production-specific tracking

### 5. `trips` Table - Missing 25 Columns in Production ⚠️ **CRITICAL**

**Missing Columns (25 total):**
- `actualTripTimeMinutes` - Actual trip duration
- `backhaulOpportunity` - Backhaul opportunity flag
- `completionTimeMinutes` - Completion time
- `customerSatisfaction` - Customer satisfaction rating
- `deadheadMiles` - Deadhead miles
- `destinationLatitude` - Destination latitude
- `destinationLongitude` - Destination longitude
- `distanceMiles` - Trip distance
- `efficiency` - Trip efficiency metric
- `estimatedTripTimeMinutes` - Estimated trip time
- `insuranceCompany` - Insurance company
- `insurancePayRate` - Insurance pay rate
- `loadedMiles` - Loaded miles
- `maxResponses` - Maximum responses
- `originLatitude` - Origin latitude
- `originLongitude` - Origin longitude
- `perMileRate` - Per mile rate
- `performanceScore` - Performance score
- `pickupLocationId` - Pickup location reference
- `requestTimestamp` - Request timestamp
- `responseDeadline` - Response deadline
- `responseStatus` - Response status
- `responseTimeMinutes` - Response time
- `revenuePerHour` - Revenue per hour
- `selectionMode` - Selection mode
- `tripCost` - Trip cost

**Impact:** ⚠️ **CRITICAL** - Trip functionality will be severely limited without these columns

---

## Priority Assessment

### 🔴 Critical Priority (Blocks Core Functionality)

1. **`trips` table columns** - Missing 25 columns
   - **Action:** Add all missing columns to production
   - **Impact:** Trip creation, tracking, and analytics won't work properly

2. **`units` table** - Missing entirely
   - **Action:** Create table in production
   - **Impact:** EMS unit management won't work

3. **`healthcare_destinations` naming** - Column name mismatch
   - **Action:** Rename columns to match camelCase convention OR update Prisma schema
   - **Impact:** Prisma queries will fail

### 🟡 Medium Priority (Affects Features)

4. **`facilities` table columns** - Missing 8 columns
   - **Action:** Add missing columns
   - **Impact:** Facility management features limited

5. **`notification_logs` table** - Missing entirely
   - **Action:** Create table
   - **Impact:** Notification logging won't work

6. **`notification_preferences` table** - Missing entirely
   - **Action:** Create table
   - **Impact:** User notification preferences won't work

### 🟢 Low Priority (Nice-to-Have)

7. **`backhaul_opportunities` table** - Missing entirely
   - **Action:** Create table (if feature is used)
   - **Impact:** Backhaul optimization features won't work

8. **`pricing_models` table** - Missing entirely
   - **Action:** Create table (if feature is used)
   - **Impact:** Advanced pricing features won't work

9. **`unit_analytics` table** - Missing entirely
   - **Action:** Create table (if feature is used)
   - **Impact:** Unit analytics won't work

---

## Recommended Action Plan

### Phase 1: Critical Fixes (Do First)

1. **Fix `healthcare_destinations` column naming**
   - Rename snake_case columns to camelCase in production
   - OR update Prisma schema to use snake_case (less preferred)

2. **Add missing columns to `trips` table**
   - Add all 25 missing columns
   - Use migration SQL from Local Dev/Dev-SWA

3. **Create `units` table**
   - Copy table structure from Local Dev/Dev-SWA

### Phase 2: Important Fixes

4. **Add missing columns to `facilities` table**
   - Add 8 missing columns

5. **Create `notification_logs` table**
   - Copy table structure from Local Dev/Dev-SWA

6. **Create `notification_preferences` table**
   - Copy table structure from Local Dev/Dev-SWA

### Phase 3: Optional Fixes

7. **Create remaining missing tables** (if features are used)
   - `backhaul_opportunities`
   - `pricing_models`
   - `unit_analytics`

8. **Investigate `agencies` table**
   - Determine if it's still needed
   - Remove if legacy, or add to Local Dev/Dev-SWA if needed

---

## Next Steps

1. ✅ **Assessment Complete** - Differences identified
2. ⏭️ **Create SQL scripts** - Generate SQL to fix each issue
3. ⏭️ **Prioritize fixes** - Start with critical issues
4. ⏭️ **Apply fixes incrementally** - One fix at a time, test after each
5. ⏭️ **Re-run comparison** - Verify alignment after fixes

---

## Comparison Script

**Script Location:** `backend/compare-database-structures.js`

**Usage:**
```bash
cd backend
node compare-database-structures.js
```

**Output:** Detailed comparison saved to `docs/active/sessions/2026-01/database-structure-comparison-results.txt`

---

**Last Updated:** January 7, 2026  
**Status:** ⚠️ Differences found - Action plan created

