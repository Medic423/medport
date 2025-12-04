# Disaster Recovery Plan - December 4, 2024

## Overview

**Issue**: Failed attempt at creating EMS Module "Status" feature corrupted the system on December 3, 2024.

**Recovery Strategy**: Option A - Full Database Restore from known-good backup (December 3, 2024)

**Backup Location**: `/Volumes/Extreme SSD Two 2TB/tcc-backups/tcc-backup-20251203_193354`

**Backup Status**: Phase 3 Complete - All major functionality working, fully functional database

**Key Decision**: Do NOT apply git commits from December 3rd that corrupted the system. Once restored, develop safer strategy for implementing status feature.

---

## Phase 1: Pre-Restoration Assessment & Safety Backup ✅ COMPLETED

### 1.1 Document Current State ✅
- [x] List all database tables and record counts
- [x] Export current database schema
- [x] Document any critical data that exists now but not in backup
- [x] Verify git status (ensure all changes are committed)

### 1.2 Create Safety Backup ✅
- [x] Create backup of current database: `pg_dump medport_ems > current-state-backup-$(date +%Y%m%d_%H%M%S).sql`
- [x] Verify backup file was created successfully
- [x] Document backup location and timestamp

### 1.3 Git Status Verification ✅
- [x] Check current git branch
- [x] Verify all uncommitted changes are saved/stashed
- [x] Document current commit hash: `git rev-parse HEAD`
- [x] Note: Do NOT apply commits from December 3rd that corrupted system

**Phase 1 Completion Details:**
- **Completed**: December 4, 2024 09:36:15 EST
- **Current Branch**: `develop`
- **Current Commit**: `d31c0053` - "feat: Implement Help System with markdown support and context-aware help"
- **Safety Backup Created**: `current-state-backup-20251204_093615.sql` (91K)
- **Schema Backup Created**: `current-schema-backup-20251204_093613.sql` (39K)

**Database Current State:**
- **Total Tables**: 26 tables
- **Key Tables & Record Counts**:
  - `transport_requests`: 35 records (112 kB)
  - `trips`: 0 records (24 kB)
  - `ems_agencies`: 4 records (32 kB)
  - `healthcare_users`: 2 records (48 kB)
  - `ems_users`: 4 records (48 kB)
  - `center_users`: 2 records (48 kB)
- **Completion Timestamp Fields**: All three fields present:
  - `completionTimestamp` (backward compatibility)
  - `healthcareCompletionTimestamp` ✅
  - `emsCompletionTimestamp` ✅

**Git Status:**
- **Uncommitted Files**: 
  - `docs/notes/disaster_recovery_plan_251204.md` (new)
  - `current-schema-backup-20251204_093613.sql` (backup)
  - `current-state-backup-20251204_093615.sql` (backup)
  - `docs/tcc-project-docs` (untracked directory)
  - `frontend/src/help/IMAGE_SIZING_GUIDE.md` (untracked)
- **December 3rd Commits**: No commits found on December 3rd in current branch (good - corrupted commits not present)

**Technical Notes:**
- Current database has `healthcareCompletionTimestamp` and `emsCompletionTimestamp` fields (added Nov 16, 2024)
- Backup database may not have these fields - will need to verify and potentially re-apply migration
- Recent code changes are mostly UI/UX improvements (Help System, Trip Management cleanup) - these should be preserved
- Current database has 35 transport requests that will be lost in restoration (acceptable - backup has known-good data)

**Phase 1 Verification Tests - COMPLETED:**
- ✅ **Current Backup File**: Valid SQL dump (1,683 lines, proper PostgreSQL format)
- ✅ **Backup Location**: Accessible at `/Volumes/Extreme SSD Two 2TB/tcc-backups/tcc-backup-20251203_193354/`
- ✅ **Backup Database File**: Exists and readable (`databases/medport_ems.sql` - 80K, matches expected size)
- ✅ **Restore Script**: Executable and readable (`restore-databases.sh`)
- ⚠️ **Running Processes**: Backend server detected (PID 10804, 10775) - **MUST BE STOPPED before Phase 2**
- ✅ **PostgreSQL**: Running and accepting connections (localhost:5432)
- ✅ **Database Connection**: Test successful (connection_test = 1)

**Action Required Before Phase 2:**
- [ ] Stop backend server before proceeding with database restoration

---

## Phase 2: Database Restoration

### 2.1 Stop Running Services
- [ ] Stop backend server (if running) ⚠️ **REQUIRED** - Backend detected running (PID 10804, 10775)
- [ ] Stop frontend server (if running)
- [ ] Stop any monitoring processes
- [ ] Verify no processes are accessing the database

**Note**: Backend server is currently running and MUST be stopped before database restoration to prevent connection conflicts.

### 2.2 Database Restoration
- [ ] Navigate to backup location: `cd "/Volumes/Extreme SSD Two 2TB/tcc-backups/tcc-backup-20251203_193354"`
- [ ] Verify backup files exist (check `databases/medport_ems.sql`)
- [ ] Run database restore script: `./restore-databases.sh`
- [ ] Verify restoration completed without errors

**Alternative Manual Restoration Steps (if script fails):**
- [ ] Drop existing database: `dropdb -h localhost -U scooper medport_ems`
- [ ] Create fresh database: `createdb -h localhost -U scooper medport_ems`
- [ ] Restore from SQL dump: `psql -h localhost -U scooper -d medport_ems < databases/medport_ems.sql`
- [ ] Verify database was restored successfully

**Technical Notes:**
- Backup database is from December 3, 2024 19:34:33 EST
- Database size: 84K SQL dump
- Database name: `medport_ems` (consolidated TCC database)
- All tables should be in single database

---

## Phase 3: Schema Migration & Verification

### 3.1 Verify Database Schema
- [ ] Connect to restored database: `psql -h localhost -U scooper -d medport_ems`
- [ ] List all tables: `\dt`
- [ ] Check `transport_requests` table structure: `\d transport_requests`
- [ ] Verify key tables exist (trips, ems_agencies, healthcare_users, etc.)

### 3.2 Check for Completion Timestamp Fields
- [ ] Check if `healthcareCompletionTimestamp` exists in `transport_requests` table
- [ ] Check if `emsCompletionTimestamp` exists in `transport_requests` table
- [ ] Check if `completionTimestamp` exists (should be present for backward compatibility)

**If completion timestamp fields are missing:**
- [ ] Navigate to backend: `cd /Users/scooper/Code/tcc-new-project/backend`
- [ ] Check migration exists: `ls prisma/migrations/20251116131400_add_separate_completion_timestamps/`
- [ ] Apply migration manually or via Prisma: `npx prisma migrate deploy`
- [ ] Verify fields were added successfully

**Technical Notes:**
- Migration file: `20251116131400_add_separate_completion_timestamps/migration.sql`
- This migration adds `healthcareCompletionTimestamp` and `emsCompletionTimestamp` fields
- Migration also migrates existing `completionTimestamp` data to `healthcareCompletionTimestamp`
- This is safe to apply even if backup doesn't have these fields

---

## Phase 4: Prisma Client & Dependencies

### 4.1 Regenerate Prisma Client
- [ ] Navigate to backend: `cd /Users/scooper/Code/tcc-new-project/backend`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Verify no errors during generation
- [ ] Check that Prisma client files were updated

### 4.2 Install Dependencies
- [ ] Root directory: `cd /Users/scooper/Code/tcc-new-project && npm install`
- [ ] Backend: `cd backend && npm install`
- [ ] Frontend: `cd ../frontend && npm install`
- [ ] Verify all dependencies installed successfully

**Technical Notes:**
- Prisma client must be regenerated after database restoration to sync with new schema
- Dependencies should match package.json files (no changes expected)

---

## Phase 5: Code Compatibility Check

### 5.1 Verify Code Compatibility
- [ ] Check that current code doesn't depend on features added after Dec 3
- [ ] Review git commits since backup to identify potential issues
- [ ] Check for any database queries that might fail with restored schema
- [ ] Verify API endpoints are compatible with restored database structure

### 5.2 Handle December 3rd Commits
- [ ] Identify commits from December 3rd that corrupted system
- [ ] Document which commits to avoid applying
- [ ] Ensure these commits are NOT in current working branch
- [ ] If needed, create a branch without problematic commits

**Technical Notes:**
- Recent code changes are mostly UI/UX improvements (Help System, Trip Management)
- These should be compatible with restored database
- Failed "Agency transport status" feature was stashed - should remain stashed
- Code from git commits after Dec 3 should be preserved (they're UI improvements)

---

## Phase 6: Application Startup & Testing

### 6.1 Start Development Environment
- [ ] Use start script: `/scripts/start-dev-complete.sh`
- [ ] Verify backend server starts without errors
- [ ] Verify frontend server starts without errors
- [ ] Check for any console errors or warnings

### 6.2 Authentication Testing
- [ ] Test Admin login
- [ ] Test Healthcare user login
- [ ] Test EMS user login
- [ ] Verify user sessions work correctly

### 6.3 Core Functionality Testing
- [ ] **Trip Creation Workflow**
  - [ ] Healthcare user can create trip request
  - [ ] Trip appears in Healthcare dashboard
  - [ ] Trip appears in EMS dashboard (if applicable)
  - [ ] Trip data is saved correctly in database

- [ ] **EMS Dashboard Functionality**
  - [ ] EMS dashboard loads without errors
  - [ ] Available trips are displayed
  - [ ] Accept/Decline buttons work
  - [ ] Trip status updates work correctly
  - [ ] Unit assignment works (if applicable)

- [ ] **Healthcare Dashboard Functionality**
  - [ ] Healthcare dashboard loads without errors
  - [ ] Created trips are displayed
  - [ ] Trip status updates are visible
  - [ ] Trip completion workflow works

- [ ] **Route Optimization**
  - [ ] Route Optimization module loads
  - [ ] Optimization calculations work
  - [ ] Results display correctly

### 6.4 Data Integrity Verification
- [ ] Verify user accounts exist and can log in
- [ ] Check that agencies and facilities are present
- [ ] Verify trip data structure matches expectations
- [ ] Check that foreign key relationships are intact

**Technical Notes:**
- Test each user type separately
- Pay special attention to trip status workflows
- Verify completion timestamp fields work correctly (if migration was applied)
- Check for any console errors or database connection issues

---

## Phase 7: Post-Restoration Documentation

### 7.1 Document Restoration Results
- [ ] Document any issues encountered during restoration
- [ ] Note any manual fixes that were required
- [ ] Document database schema differences (if any)
- [ ] Update this plan with completion status

### 7.2 Create New Backup
- [ ] Once system is verified working, create new backup
- [ ] Document backup location and timestamp
- [ ] Verify backup includes all necessary files

### 7.3 Plan Future Status Feature Implementation
- [ ] Review what went wrong with December 3rd attempt
- [ ] Develop safer implementation strategy
- [ ] Create implementation plan document
- [ ] Ensure proper testing strategy is in place

**Technical Notes:**
- Keep notes about what worked and what didn't
- Document any schema differences between backup and current state
- Plan for safer feature implementation going forward

---

## Restoration Checklist Summary

### Pre-Restoration
- [x] Safety backup created ✅
- [x] Current state documented ✅
- [x] Git status verified ✅

### Restoration
- [ ] Services stopped
- [ ] Database restored from backup
- [ ] Schema verified
- [ ] Migrations applied (if needed)

### Post-Restoration
- [ ] Prisma client regenerated
- [ ] Dependencies installed
- [ ] Application started successfully
- [ ] All tests passed
- [ ] System verified working

---

## Technical Notes Section

### Backup Information
- **Location**: `/Volumes/Extreme SSD Two 2TB/tcc-backups/tcc-backup-20251203_193354`
- **Date**: December 3, 2024 19:34:33 EST
- **Database**: `medport_ems` (consolidated TCC database)
- **Database Size**: 84K SQL dump
- **Status**: Phase 3 Complete - All major functionality working

### Current System State
- **Database**: Has `healthcareCompletionTimestamp` and `emsCompletionTimestamp` fields
- **Code**: Recent UI/UX improvements (Help System, Trip Management cleanup)
- **Git**: Changes since backup are well-documented and mostly UI-focused
- **Failed Feature**: "Agency transport status" feature was stashed

### Key Decisions
- **Restoration Strategy**: Option A - Full Database Restore
- **Code Preservation**: Keep current codebase (UI improvements)
- **Git Commits**: Do NOT apply December 3rd commits that corrupted system
- **Future Feature**: Develop safer strategy for status feature implementation

### Migration Notes
- Migration `20251116131400_add_separate_completion_timestamps` may need to be applied
- This migration adds separate completion timestamp fields
- Safe to apply even if backup doesn't have these fields
- Migration migrates existing `completionTimestamp` data

### Testing Priorities
1. Authentication (all user types)
2. Trip creation workflow
3. EMS dashboard functionality
4. Healthcare dashboard functionality
5. Route Optimization features
6. Completion timestamp workflows (if migration applied)

---

## Issues Encountered

_Use this section to document any problems encountered during restoration and their solutions._

### Issue 1: [Title]
- **Date**: 
- **Description**: 
- **Solution**: 
- **Status**: 

---

## Restoration Progress

**Started**: December 4, 2024 09:36:15 EST  
**Completed**: [Date/Time]  
**Status**: In Progress - Phase 1 Complete

**Last Updated**: December 4, 2024 09:36:15 EST

**Phase Status:**
- ✅ Phase 1: Pre-Restoration Assessment & Safety Backup - COMPLETED
- ⏸️ Phase 2: Database Restoration - READY TO START (awaiting testing/approval)
- ⏸️ Phase 3: Schema Migration & Verification - PENDING
- ⏸️ Phase 4: Prisma Client & Dependencies - PENDING
- ⏸️ Phase 5: Code Compatibility Check - PENDING
- ⏸️ Phase 6: Application Startup & Testing - PENDING
- ⏸️ Phase 7: Post-Restoration Documentation - PENDING

---

## Next Steps After Restoration

1. Verify all functionality is working
2. Create new backup of restored system
3. Review December 3rd commits to understand what went wrong
4. Develop safer implementation strategy for status feature
5. Document lessons learned

---

## References

- Backup restore script: `/Volumes/Extreme SSD Two 2TB/tcc-backups/tcc-backup-20251203_193354/restore-complete.sh`
- Database restore script: `/Volumes/Extreme SSD Two 2TB/tcc-backups/tcc-backup-20251203_193354/restore-databases.sh`
- Start script: `/scripts/start-dev-complete.sh`
- Migration: `backend/prisma/migrations/20251116131400_add_separate_completion_timestamps/`

