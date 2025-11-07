# TCC Phase 1: Database Migration Implementation Plan

**Created:** October 4, 2025  
**Purpose:** Detailed step-by-step implementation plan for Phase 1 database migration from multi-database to single-database architecture  
**Status:** Ready for Implementation  

## Pre-Implementation Status ✅

- ✅ **Git Status**: All changes committed and pushed
- ✅ **Backup Created**: Enhanced backup saved to `/Volumes/Acasis/tcc-backups/tcc-backup-20251004_114130`
- ✅ **Current State Documented**: All debugging progress preserved
- ✅ **Rollback Plan**: Can restore from backup if needed

## Implementation Overview

**Goal**: Migrate from complex multi-database architecture to simplified single-database architecture for development environment.

**Current Issues to Resolve**:
1. TypeScript compilation errors in `databaseManager.ts`
2. Schema mismatches between separate schemas and unified schema
3. EMS authentication failures due to database switching logic
4. Complex database connection management

## Phase 1: Development Environment Migration

### Step 1: Backup and Preparation ✅ COMPLETED
- [x] Create enhanced backup
- [x] Commit all current changes to git
- [x] Document current state

### Step 2: Schema Consolidation

#### 2.1: Remove Separate Schema Files
- [ ] **File**: `backend/prisma/schema-center.prisma`
  - [ ] Delete file
  - [ ] Update any references in documentation

- [ ] **File**: `backend/prisma/schema-hospital.prisma`
  - [ ] Delete file
  - [ ] Update any references in documentation

- [ ] **File**: `backend/prisma/schema-ems.prisma`
  - [ ] Delete file
  - [ ] Update any references in documentation

#### 2.2: Verify Main Schema Completeness
- [ ] **File**: `backend/prisma/schema.prisma`
  - [ ] Verify all models are present:
    - [ ] `CenterUser` model
    - [ ] `HealthcareUser` model
    - [ ] `EMSUser` model
    - [ ] `EMSAgency` model
    - [ ] `Unit` model
    - [ ] `Trip` model
    - [ ] All other required models
  - [ ] Verify all required fields are present:
    - [ ] `addedBy` field in `EMSAgency`
    - [ ] `addedAt` field in `EMSAgency`
    - [ ] All user model fields
    - [ ] All relation fields
  - [ ] Verify relation definitions are correct:
    - [ ] `Unit.analytics` relation to `unit_analytics`
    - [ ] `EMSUser.agencyId` relation to `EMSAgency`
    - [ ] All other relations

#### 2.3: Regenerate Prisma Client
- [ ] Run `cd backend && npx prisma generate`
- [ ] Verify no compilation errors
- [ ] Test Prisma client functionality

### Step 3: Database Manager Simplification

#### 3.1: Create New Simplified Database Manager
- [ ] **File**: `backend/src/services/databaseManager.ts`
  - [ ] Replace multi-database logic with single database
  - [ ] Remove separate Prisma client instances
  - [ ] Implement single `PrismaClient` instance
  - [ ] Update all method signatures
  - [ ] Remove database switching logic

**Target Implementation**:
```typescript
import { PrismaClient } from '@prisma/client';

class DatabaseManager {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }

  getCenterDB() {
    return this.prisma;
  }

  getHospitalDB() {
    return this.prisma;
  }

  getEMSDB() {
    return this.prisma;
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export const databaseManager = new DatabaseManager();
```

#### 3.2: Update Environment Configuration
- [ ] **File**: `backend/.env`
  - [ ] Ensure `DATABASE_URL` points to main database
  - [ ] Remove or comment out separate database URLs:
    - [ ] `DATABASE_URL_CENTER`
    - [ ] `DATABASE_URL_HOSPITAL`
    - [ ] `DATABASE_URL_EMS`

### Step 4: Authentication Service Updates

#### 4.1: Simplify Authentication Logic
- [ ] **File**: `backend/src/services/authService.ts`
  - [ ] Remove database switching logic
  - [ ] Simplify user lookup to single database
  - [ ] Update user type detection logic
  - [ ] Fix all TypeScript compilation errors
  - [ ] Ensure EMS user lookup works correctly

**Target Implementation**:
```typescript
async login(email: string, password: string) {
  const db = databaseManager.getCenterDB();
  
  // Try to find user in single database
  let user = await db.centerUser.findUnique({ where: { email } });
  let userType = 'ADMIN';
  
  if (!user) {
    user = await db.healthcareUser.findUnique({ where: { email } });
    userType = 'HEALTHCARE';
  }
  
  if (!user) {
    user = await db.eMSUser.findUnique({ where: { email } });
    userType = 'EMS';
  }
  
  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  // Rest of authentication logic...
}
```

#### 4.2: Update Token Verification
- [ ] **File**: `backend/src/services/authService.ts`
  - [ ] Simplify token verification logic
  - [ ] Remove database switching in verification
  - [ ] Ensure all user types work correctly

### Step 5: Service Layer Updates

#### 5.1: Update Agency Service
- [ ] **File**: `backend/src/services/agencyService.ts`
  - [ ] Update to use single database
  - [ ] Remove database switching logic
  - [ ] Test all CRUD operations

#### 5.2: Update Unit Service
- [ ] **File**: `backend/src/services/unitService.ts`
  - [ ] Update to use single database
  - [ ] Remove database switching logic
  - [ ] Test all CRUD operations

#### 5.3: Update Trip Service
- [ ] **File**: `backend/src/services/tripService.ts`
  - [ ] Update to use single database
  - [ ] Remove database switching logic
  - [ ] Test all CRUD operations

### Step 6: Route Updates

#### 6.1: Update Authentication Routes
- [ ] **File**: `backend/src/routes/auth.ts`
  - [ ] Test all authentication endpoints
  - [ ] Verify EMS login works
  - [ ] Verify Healthcare login works
  - [ ] Verify Admin login works

#### 6.2: Update API Routes
- [ ] **File**: `backend/src/routes/agencies.ts`
  - [ ] Test agencies API endpoints
  - [ ] Verify CRUD operations work

- [ ] **File**: `backend/src/routes/units.ts`
  - [ ] Test units API endpoints
  - [ ] Verify CRUD operations work

### Step 7: Database Synchronization

#### 7.1: Force Database Reset
- [ ] Run `cd backend && npx prisma db push --force-reset`
- [ ] Verify database is created with correct schema
- [ ] Check for any migration errors

#### 7.2: Recreate Test Data
- [ ] **File**: `backend/prisma/seed.ts`
  - [ ] Update seed script for single database
  - [ ] Run `cd backend && npx prisma db seed`
  - [ ] Verify all test data is created correctly

#### 7.3: Create EMS User
- [ ] **File**: `backend/create-ems-user.js`
  - [ ] Update script for single database
  - [ ] Run script to create EMS user
  - [ ] Verify EMS user is created correctly

### Step 8: Testing and Validation

#### 8.1: Backend Server Testing
- [ ] Start backend server: `cd backend && npm run dev`
- [ ] Verify server starts without errors
- [ ] Check all endpoints are accessible
- [ ] Test health check endpoint

#### 8.2: Authentication Testing
- [ ] **Admin Login Test**
  - [ ] Email: `admin@tcc.com`
  - [ ] Password: `admin123`
  - [ ] Verify login succeeds
  - [ ] Verify token is generated

- [ ] **Healthcare Login Test**
  - [ ] Email: `admin@altoonaregional.org`
  - [ ] Password: `upmc123`
  - [ ] Verify login succeeds
  - [ ] Verify token is generated

- [ ] **EMS Login Test**
  - [ ] Email: `fferguson@movalleyems.com`
  - [ ] Password: `movalley123`
  - [ ] Verify login succeeds
  - [ ] Verify token is generated

#### 8.3: API Endpoint Testing
- [ ] **Agencies API Test**
  - [ ] GET `/api/tcc/agencies`
  - [ ] Verify returns agencies data
  - [ ] Verify no 500 errors

- [ ] **Units API Test**
  - [ ] GET `/api/tcc/units`
  - [ ] Verify returns units data
  - [ ] Verify no 500 errors

- [ ] **Trips API Test**
  - [ ] GET `/api/trips`
  - [ ] Verify returns trips data
  - [ ] Verify no 500 errors

#### 8.4: Frontend Integration Testing
- [ ] Start frontend server: `cd frontend && npm run dev`
- [ ] Test all three login types in browser
- [ ] Verify TCC dashboard loads without errors
- [ ] Test all major functionality

### Step 9: Cleanup

#### 9.1: Remove Test Scripts
- [ ] **Files to Remove**:
  - [ ] `backend/test-auth-logic.js`
  - [ ] `backend/test-ems-api.js`
  - [ ] `backend/test-ems-auth-direct.js`
  - [ ] `backend/test-ems-connection.js`
  - [ ] `backend/check-center-user.js`
  - [ ] `backend/check-ems-user.js`
  - [ ] `backend/remove-center-ems-user.js`

#### 9.2: Update Documentation
- [ ] Update `README.md` with new architecture
- [ ] Update deployment documentation
- [ ] Document new database structure

### Step 10: Final Validation

#### 10.1: Complete System Test
- [ ] **Admin Workflow Test**
  - [ ] Login as admin
  - [ ] Create trip
  - [ ] View analytics
  - [ ] Manage users

- [ ] **Healthcare Workflow Test**
  - [ ] Login as healthcare user
  - [ ] Create trip request
  - [ ] View trip history
  - [ ] Manage facility

- [ ] **EMS Workflow Test**
  - [ ] Login as EMS user
  - [ ] View trip requests
  - [ ] Accept/decline trips
  - [ ] Manage units

#### 10.2: Performance Validation
- [ ] Check database query performance
- [ ] Verify no memory leaks
- [ ] Test concurrent user access
- [ ] Monitor server resources

## Success Criteria

### Technical Success Criteria:
- [ ] ✅ All TypeScript compilation errors resolved
- [ ] ✅ Backend server starts without errors
- [ ] ✅ All three authentication systems working
- [ ] ✅ All API endpoints returning data correctly
- [ ] ✅ Frontend integration working perfectly
- [ ] ✅ No database connection errors
- [ ] ✅ All CRUD operations functional

### Functional Success Criteria:
- [ ] ✅ Admin can login and manage system
- [ ] ✅ Healthcare users can create trip requests
- [ ] ✅ EMS users can view and respond to trips
- [ ] ✅ All dashboards load without errors
- [ ] ✅ Analytics and reporting functional
- [ ] ✅ Unit management working
- [ ] ✅ Agency management working

## Rollback Plan

If any step fails:

1. **Stop all servers**
2. **Restore from backup**: `cd /Volumes/Acasis/tcc-backups/tcc-backup-20251004_114130 && ./restore-complete.sh`
3. **Restart development environment**
4. **Analyze failure and adjust plan**

## Post-Implementation

### Immediate Actions:
- [ ] Commit all changes to git
- [ ] Create new backup
- [ ] Update team on new architecture
- [ ] Document any issues encountered

### Future Considerations:
- [ ] Plan Phase 2: Production architecture decision
- [ ] Consider EMS module simplification
- [ ] Evaluate performance improvements
- [ ] Plan for scaling requirements

## EMS Module Simplification (Future Phase)

### Current EMS Module Complexity:
- Financial calculations and reporting
- Complex unit management
- Advanced analytics
- Multi-agency coordination
- Detailed trip tracking

### Proposed Simplification:
- **Core Functions** (Keep):
  - Trip request viewing
  - Accept/decline functionality
  - Basic unit status
  - Simple trip management

- **Secondary Functions** (Simplify):
  - Basic financial reporting
  - Simplified unit management
  - Essential analytics only

- **Advanced Functions** (Remove/Defer):
  - Complex financial calculations
  - Advanced analytics
  - Multi-agency coordination
  - Detailed reporting

### Benefits:
- Faster development
- Easier maintenance
- Reduced complexity
- Better user experience
- Focus on core functionality

---

**Ready for Implementation**: This plan is ready for execution. Each step is clearly defined with specific files and actions to take.

**Estimated Time**: 4-6 hours for complete implementation and testing.

**Risk Level**: Low (with backup and rollback plan in place).
