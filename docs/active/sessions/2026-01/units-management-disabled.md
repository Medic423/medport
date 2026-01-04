# Units Management Feature - Disabled

**Date:** January 4, 2026  
**Status:** ✅ **DISABLED** - Feature hidden from UI, backend endpoints preserved  
**Reason:** Schema mismatch between dev and production, not core functionality

---

## Executive Summary

The Units Management feature has been disabled in the UI across all environments (local dev, dev-swa, and production). The backend endpoints remain intact but are not accessible through the user interface. This feature was disabled because:

1. **Not Core Functionality:** Units are not required for trip creation, dispatch, or trip acceptance
2. **Schema Mismatch:** Production database schema differs significantly from dev schema
3. **High Implementation Complexity:** Fixing would require significant effort with risk of side effects
4. **No Current Demand:** No EMS agencies currently rely on this feature

---

## What Was Disabled

### Frontend Components (Commented Out)

1. **TCC Admin Dashboard:**
   - Menu item: "Units Management" in EMS dropdown (TopMenuBar.tsx)
   - Route: `/dashboard/ems/units` (TCCDashboard.tsx)
   - Component: `TCCUnitsManagement.tsx` (import commented out)

2. **EMS Dashboard:**
   - Tab: "Units" tab in navigation (EMSDashboard.tsx)
   - Component: `UnitsManagement.tsx` (import commented out)
   - Route handling for units tab

### Backend Endpoints (Preserved)

All backend endpoints remain intact and functional, but are not accessible through the UI:

- `GET /api/units` - Get units for authenticated agency
- `POST /api/units` - Create new unit
- `GET /api/units/:id` - Get unit by ID
- `PUT /api/units/:id` - Update unit
- `DELETE /api/units/:id` - Delete unit
- `GET /api/tcc/units` - Get all units (TCC admin)
- `GET /api/tcc/units/:agencyId` - Get units for specific agency

**Files:**
- `backend/src/routes/units.ts` - Main units routes
- `backend/src/routes/tccUnits.ts` - TCC admin units routes
- `backend/src/services/unitService.ts` - Unit service implementation

---

## Why It Was Disabled

### 1. Schema Mismatch Between Environments

**Dev Schema (`schema.prisma`):**
- Full Unit model with analytics relation
- Fields: `status`, `lastMaintenance`, `nextMaintenance`, `lastStatusUpdate`, `crewSize`, `equipment`, `location`, `latitude`, `longitude`
- `unit_analytics` table with performance metrics
- Relations to `TransportRequest` and `AgencyResponse`

**Production Schema (`schema-production.prisma`):**
- Simplified Unit model without analytics
- Missing fields: `status`, `lastMaintenance`, `nextMaintenance`, `lastStatusUpdate`, `crewSize`, `equipment`, `location`, `latitude`, `longitude`
- No `unit_analytics` table
- No relations to trips or responses

**Impact:** Unit creation code tries to create fields and analytics records that don't exist in production, causing failures.

### 2. Not Core Functionality

Units are **not required** for any core system operations:

- ✅ **Trip Creation:** Works without units (agency-level)
- ✅ **Dispatch:** Works at agency level
- ✅ **Trip Acceptance:** Works at agency level
- ✅ **Trip Completion:** Works without unit tracking

**Evidence:** Comment in `tripService.ts` line 105:
```typescript
// assignedUnitId removed from default; units are not used in trip lifecycle
```

### 3. Business Value Assessment

**Healthcare Facility Perspective:**
- Healthcare facilities only care that an EMS agency is coming with appropriately equipped and staffed units
- Healthcare facilities are agnostic to specific unit numbers
- Agency-level tracking is sufficient

**EMS Agency Perspective:**
- Units Management was intended as an inventory/tracking feature
- Not essential for day-to-day operations
- No current customer demand for this feature

### 4. Previous Implementation Issues

Previous attempts to implement unit creation caused side effects and required significant debugging. The complexity-to-value ratio was not favorable.

---

## What Would Be Needed to Re-Enable

If future customer demand requires this feature, the following would need to be implemented:

### Option 1: Align Production Schema with Dev Schema (Recommended)

**Steps:**
1. Add missing fields to production Unit model:
   - `status` (String, default "AVAILABLE")
   - `lastMaintenance` (DateTime, nullable)
   - `nextMaintenance` (DateTime, nullable)
   - `lastStatusUpdate` (DateTime, default now)
   - `crewSize` (Int, default 2)
   - `equipment` (String[])
   - `location` (Json, nullable)
   - `latitude` (Float, nullable)
   - `longitude` (Float, nullable)

2. Create `unit_analytics` table in production:
   ```sql
   CREATE TABLE unit_analytics (
     id TEXT PRIMARY KEY,
     unitId TEXT UNIQUE NOT NULL,
     performanceScore DECIMAL(5,2),
     efficiency DECIMAL(5,2),
     totalTrips INT DEFAULT 0,
     totalTripsCompleted INT DEFAULT 0,
     averageResponseTime DECIMAL(5,2),
     lastUpdated TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. Add foreign key constraint:
   ```sql
   ALTER TABLE unit_analytics 
   ADD CONSTRAINT unit_analytics_unitId_fkey 
   FOREIGN KEY (unitId) REFERENCES units(id) ON DELETE CASCADE;
   ```

4. Update Prisma schema-production.prisma to match dev schema

5. Run migration on production database

**Estimated Effort:** 4-6 hours  
**Risk:** Medium - Schema changes require careful migration planning

### Option 2: Make Unit Creation Conditional

**Steps:**
1. Modify `unitService.createUnit()` to detect environment/schema
2. Conditionally create fields based on what exists
3. Skip `unit_analytics` creation if table doesn't exist
4. Handle missing fields gracefully

**Estimated Effort:** 2-3 hours  
**Risk:** Low - No schema changes required  
**Downside:** Feature would be limited in production

### Option 3: Simplify Unit Model for All Environments

**Steps:**
1. Remove analytics requirement from unit creation
2. Remove optional fields from unit creation
3. Use minimal unit model across all environments
4. Update dev schema to match production

**Estimated Effort:** 3-4 hours  
**Risk:** Medium - Requires updating dev schema and testing

---

## Re-Enabling Steps

If customer demand requires re-enabling:

1. **Uncomment Frontend Code:**
   - `frontend/src/components/TopMenuBar.tsx` - Uncomment menu item
   - `frontend/src/components/TCCDashboard.tsx` - Uncomment import and route
   - `frontend/src/components/EMSDashboard.tsx` - Uncomment import, tab, and component

2. **Choose Implementation Option:**
   - Option 1: Align schemas (recommended for full functionality)
   - Option 2: Conditional creation (quick fix, limited functionality)
   - Option 3: Simplify model (compromise solution)

3. **Test Thoroughly:**
   - Unit creation in all environments
   - Unit editing/deletion
   - Verify no regressions in trip creation/dispatch/acceptance
   - Test with existing units if any exist

4. **Update Documentation:**
   - Remove this disabled notice
   - Update feature documentation
   - Add to release notes

---

## Files Modified

### Frontend (Commented Out)
- `frontend/src/components/TopMenuBar.tsx` - Menu item commented
- `frontend/src/components/TCCDashboard.tsx` - Import and routes commented
- `frontend/src/components/EMSDashboard.tsx` - Import, tab, and component commented

### Backend (Preserved - No Changes)
- `backend/src/routes/units.ts` - Endpoints remain functional
- `backend/src/routes/tccUnits.ts` - Endpoints remain functional
- `backend/src/services/unitService.ts` - Service remains functional

### Components (Preserved - Not Deleted)
- `frontend/src/components/TCCUnitsManagement.tsx` - File preserved
- `frontend/src/components/UnitsManagement.tsx` - File preserved

---

## Impact Assessment

### ✅ No Impact on Core Functionality
- Trip creation: ✅ Works
- Dispatch: ✅ Works
- Trip acceptance: ✅ Works
- Trip completion: ✅ Works
- Agency management: ✅ Works

### ✅ No Data Loss
- Existing units (if any) remain in database
- Backend endpoints still functional
- Can be re-enabled without data migration

### ✅ Clean User Experience
- Feature removed from UI
- No broken links or error messages
- Clean navigation

---

## Future Considerations

### If Customer Demand Arises

**Questions to Ask:**
1. What specific use case requires unit-level tracking?
2. Is agency-level tracking insufficient?
3. What information needs to be tracked per unit?
4. Is this for compliance, reporting, or operational needs?

**Alternative Solutions:**
- Agency-level tracking (current approach)
- Custom reporting for specific agencies
- Third-party integration for unit tracking
- Simplified unit model without analytics

---

## Related Documentation

- `docs/active/sessions/2026-01/units-management-500-error.md` - Initial bug investigation
- `backend/prisma/schema.prisma` - Dev schema (full Unit model)
- `backend/prisma/schema-production.prisma` - Production schema (simplified Unit model)
- `backend/src/services/unitService.ts` - Unit service implementation

---

**Decision Date:** January 4, 2026  
**Decision Maker:** User  
**Status:** Disabled and documented for future reference

