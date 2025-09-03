# 🚨 **NEW CHAT SESSION PROMPT - Database Schema Fixes**

## **Continue MedPort Database Architecture Cleanup - Priority 1.5 Schema Fixes**

I'm working on systematically cleaning up the MedPort codebase. We have successfully completed **Priority 1 Phase 1.1, 1.2, and 1.3** of the database architecture cleanup, but now need to address critical database schema mismatches.

## **Current Status:**
- ✅ **COMPLETED**: Priority 1 Phase 1.1 - Core Services (5 files)
- ✅ **COMPLETED**: Priority 1 Phase 1.2 - Management Services (5 files)  
- ✅ **COMPLETED**: Priority 1 Phase 1.3 - Real-time Services (5 files)
- ✅ **COMPLETED**: Priority 2 - Orphaned Frontend Components (6 files)
- 🚨 **CRITICAL**: Priority 1.5 - Database Schema Fixes (58+ compilation errors)

## **🚨 CRITICAL ISSUE: Database Schema Mismatches**

**Problem**: All services have been updated to use `DatabaseManager` pattern, but the database schemas don't match what the services expect.

**Impact**: 58+ TypeScript compilation errors preventing backend from starting

**Root Cause**: Services were written for a different database schema than what exists in the siloed databases

## **📋 DETAILED SCHEMA ISSUES TO FIX:**

### **Missing Tables in EMS Database:**
- `gPSTracking` - GPS tracking data for real-time location updates
- `locationHistory` - Historical location records
- `geofenceEvent` - Geofence entry/exit events
- `unitAssignment` - Unit assignment records for transport requests
- `route` - Route information and waypoints
- `routeDeviation` - Route deviation tracking and alerts
- `trafficCondition` - Real-time traffic conditions
- `weatherImpact` - Weather impact data for ETA calculations
- `eTAUpdate` - ETA update records

### **Missing Relations:**
- `Unit.unitAvailability` → should be `Unit.availability` (relation name mismatch)
- `TransportRequest.assignedUnit` → doesn't exist in Hospital DB schema
- `TransportRequest.createdBy` → should be `TransportRequest.createdById` (field name mismatch)

### **Schema Field Mismatches:**
- `UnitAvailability.lastUpdated` → should be `UnitAvailability.updatedAt`
- `UnitAvailability.status` → type mismatch (UnitStatus vs AvailabilityStatus)

### **Type Definition Issues:**
- Multiple `any` type parameters in service methods
- Missing type definitions for database models
- Enum mismatches between services and schemas

## **🎯 OBJECTIVES FOR THIS SESSION:**

### **Phase 1: Schema Analysis & Planning**
1. **Analyze current database schemas** in all three databases (Hospital, EMS, Center)
2. **Identify all missing tables** and their required fields
3. **Map service requirements** to database schema needs
4. **Create comprehensive schema update plan**

### **Phase 2: Database Schema Updates**
1. **Add missing tables** to appropriate database schemas
2. **Fix field name mismatches** between services and schemas
3. **Update type definitions** to match actual schema
4. **Add missing relations** and foreign key constraints

### **Phase 3: Service Code Fixes**
1. **Update service code** to match corrected schemas
2. **Fix type definitions** and remove `any` types
3. **Update field references** to match schema
4. **Re-enable disabled services**

### **Phase 4: Testing & Validation**
1. **Test TypeScript compilation** - should have 0 errors
2. **Test database connections** - all three databases should work
3. **Test service functionality** - verify services work correctly
4. **Test backend startup** - should start without errors

## **📁 KEY FILES TO EXAMINE:**

### **Database Schemas:**
- `backend/prisma/schema-hospital.prisma` - Hospital database schema
- `backend/prisma/schema-ems.prisma` - EMS database schema  
- `backend/prisma/schema-center.prisma` - Center database schema

### **Problematic Services (Updated but with schema issues):**
- `backend/src/services/webSocketService.ts` - Real-time communication
- `backend/src/services/realTimeTrackingService.ts` - GPS tracking
- `backend/src/services/qrCodeService.ts` - QR code generation
- `backend/src/services/unitAssignmentService.ts` - Unit assignments
- `backend/src/services/resourceManagementService.ts` - Resource management
- `backend/src/services/transportBiddingService.ts` - Transport bidding

### **Documentation:**
- `docs/notes/cleanup_strategy.md` - Current progress and next steps

## **🛡️ SAFETY MEASURES:**
- ✅ All work in feature branch: `feature/cleanup-database-architecture`
- ✅ Never commit to main until tested and confirmed by user
- ✅ Test compilation after each change
- ✅ User confirmation required before merging
- ✅ Backup current state before making schema changes

## **📊 SUCCESS CRITERIA:**
1. **Zero TypeScript compilation errors**
2. **All services compile successfully**
3. **Backend starts without errors**
4. **All database connections work**
5. **Services function correctly with real data**

## **🚀 IMMEDIATE NEXT STEPS:**
1. **Examine current database schemas** to understand what exists
2. **Identify all missing tables** and their required structure
3. **Create migration plan** for adding missing tables
4. **Start with most critical tables** (gPSTracking, unitAssignment, etc.)
5. **Test compilation after each schema update**

---

**Note**: This is a critical phase that will resolve the compilation errors and enable the backend to start successfully. The DatabaseManager pattern updates are complete - we just need to align the database schemas with the service expectations.

**Files to start with**: `backend/prisma/schema-ems.prisma` (most missing tables are in EMS database)
