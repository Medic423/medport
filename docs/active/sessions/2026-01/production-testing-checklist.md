# Production EMS Module Testing Checklist
**Date:** January 6, 2026  
**Purpose:** Test production functionality before applying Phase 1 migrations  
**Status:** 📋 **READY FOR TESTING**

---

## Why Test First?

Before applying Phase 1 migrations, we need to understand:
- What's currently working in production
- What's broken or missing
- What data exists in tables that would be affected
- What features depend on which tables/columns

This will help us:
- Avoid breaking working features
- Prioritize fixes
- Make informed decisions about migration approach

---

## Pre-Testing Setup

### Access Production
- **Frontend:** https://traccems.com
- **Backend API:** https://api.traccems.com
- **Admin Login:** (use existing production credentials)

### Test Accounts Needed
- [ ] EMS user account (if exists)
- [ ] Healthcare user account (if exists)
- [ ] Admin account

---

## EMS Module Testing Checklist

### 1. EMS User Management ⚠️ **HIGH PRIORITY** (3 users exist in database)

#### EMS Registration
- [ ] Can access EMS registration page
- [ ] Can fill out registration form
- [ ] Can submit registration
- [ ] Registration succeeds or fails (note result)
- [ ] Error messages (if any) - document exact messages

#### EMS Login ⚠️ **CRITICAL TEST**
- [ ] Can access EMS login page
- [ ] Can log in with existing EMS user (3 users exist - test all if possible)
- [ ] Login succeeds or fails (note result)
- [ ] Error messages (if any) - document exact messages
- [ ] After login, redirected to correct page
- [ ] **SPECIFIC:** Verify the 3 existing EMS users can log in

#### EMS User Profile
- [ ] Can view EMS user profile
- [ ] Can edit EMS user profile
- [ ] Profile data displays correctly
- [ ] Changes save successfully
- [ ] **SPECIFIC:** Verify the 3 existing EMS users' profiles are accessible

### 2. Transport Request Management ⚠️ **HIGH PRIORITY** (1 request exists in database)

#### Create Transport Request
- [ ] Can access transport request creation page
- [ ] Can fill out transport request form
- [ ] Form fields available:
  - [ ] Patient information
  - [ ] Pickup location
  - [ ] Destination
  - [ ] Transport level
  - [ ] Urgency level
  - [ ] Other required fields
- [ ] Can submit transport request
- [ ] Request creation succeeds or fails (note result)
- [ ] Error messages (if any) - document exact messages
- [ ] Request appears in list after creation

#### View Transport Requests ⚠️ **CRITICAL TEST**
- [ ] Can view list of transport requests
- [ ] **SPECIFIC:** Can see the 1 existing transport request in the list
- [ ] Can view individual transport request details
- [ ] **SPECIFIC:** Can view details of the existing transport request
- [ ] Request data displays correctly
- [ ] Status updates correctly

#### Edit Transport Requests
- [ ] Can edit existing transport request
- [ ] **SPECIFIC:** Can edit the existing transport request
- [ ] Changes save successfully
- [ ] Status can be updated

### 3. Agency Responses

#### View Agency Responses
- [ ] Can view agency responses to transport requests
- [ ] Response data displays correctly
- [ ] Response status updates correctly

#### Accept/Reject Responses
- [ ] Can accept agency response
- [ ] Can reject agency response
- [ ] Status updates correctly after action

### 4. Trip Management

#### View Trips
- [ ] Can view list of trips
- [ ] Can view individual trip details
- [ ] Trip data displays correctly
- [ ] Trip status displays correctly

#### Trip Status Updates
- [ ] Can update trip status
- [ ] Status changes save successfully
- [ ] Timestamps update correctly

### 5. Unit Management

#### View Units
- [ ] Can view list of units
- [ ] Unit data displays correctly
- [ ] Unit status displays correctly

#### Unit Assignment
- [ ] Can assign unit to trip
- [ ] Assignment saves successfully
- [ ] Unit status updates correctly

### 6. EMS Agency Management

#### View Agencies
- [ ] Can view list of EMS agencies
- [ ] Agency data displays correctly
- [ ] Agency availability status displays correctly

#### Agency Details
- [ ] Can view agency details
- [ ] Agency information displays correctly
- [ ] Agency contact information displays correctly

---

## API Endpoint Testing

### Test Key Endpoints

#### EMS Endpoints
- [ ] `GET /api/ems/agencies` - List agencies
- [ ] `GET /api/ems/users` - List EMS users (if accessible)
- [ ] `POST /api/ems/register` - Register EMS user
- [ ] `POST /api/ems/login` - Login EMS user

#### Transport Request Endpoints
- [ ] `GET /api/transport-requests` - List transport requests
- [ ] `POST /api/transport-requests` - Create transport request
- [ ] `GET /api/transport-requests/:id` - Get transport request
- [ ] `PUT /api/transport-requests/:id` - Update transport request

#### Trip Endpoints
- [ ] `GET /api/trips` - List trips
- [ ] `GET /api/trips/:id` - Get trip
- [ ] `PUT /api/trips/:id` - Update trip

#### Unit Endpoints
- [ ] `GET /api/units` - List units
- [ ] `GET /api/units/:id` - Get unit

**Note:** Test endpoints via browser dev tools Network tab or Postman/curl

---

## Error Documentation

### Document All Errors

For each error encountered:
- [ ] Error message (exact text)
- [ ] When it occurs (what action triggers it)
- [ ] HTTP status code (if API error)
- [ ] Browser console errors (if frontend error)
- [ ] Network request details (if API error)
- [ ] Screenshot (if visual error)

### Common Error Patterns to Look For
- [ ] "Table does not exist" errors
- [ ] "Column does not exist" errors
- [ ] "Foreign key constraint" errors
- [ ] "500 Internal Server Error"
- [ ] "404 Not Found" errors
- [ ] Authentication/authorization errors

---

## Database State Notes

### While Testing, Note:
- [ ] Which features work completely
- [ ] Which features partially work
- [ ] Which features are completely broken
- [ ] Any missing data or features
- [ ] Any unexpected behavior

---

## Post-Testing Actions

### After Testing:
1. **Document Results**
   - What works
   - What's broken
   - Error messages
   - Missing features

2. **Share Results**
   - Update this checklist with results
   - Share findings with team

3. **Decide Next Steps**
   - Based on test results, decide migration approach
   - Prioritize fixes
   - Plan Phase 1 execution

---

## Database Check Results Summary

**Date:** January 6, 2026

### Key Findings:
- ✅ Phase 1 migrations are already applied
- ✅ `center_users` table exists with all columns
- ✅ All user tables have deletion fields
- ⚠️ **3 EMS users exist** in database - **TEST THESE**
- ⚠️ **1 transport request exists** in database - **TEST THIS**
- ⚠️ `ems_users` and `transport_requests` tables exist (migration would drop them, but they still exist)

### Priority Testing Areas:
1. **EMS User Functionality** - 3 users exist, verify they work
2. **Transport Request Functionality** - 1 request exists, verify it works
3. **EMS Agency Functionality** - Verify `addedAt`/`addedBy` fields work

---

## Testing Scripts

### Quick API Health Check

```bash
# Test API health
curl https://api.traccems.com/api/health

# Test EMS agencies endpoint
curl https://api.traccems.com/api/ems/agencies

# Test transport requests endpoint (may require auth)
curl https://api.traccems.com/api/transport-requests

# Test EMS users endpoint (may require auth)
curl https://api.traccems.com/api/ems/users
```

### Database State Check (Already Completed)

```bash
# Check Phase 1 migration state
DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node backend/check-phase1-state.js

# Check tables that will be affected
DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node backend/check-production-tables.js
```

**Status:** ✅ Already completed - See `phase1-database-check-results.md` for full results

---

## Notes Section

**Use this section to document findings:**

### Test Results:
- Date: ___________
- Tester: ___________
- Findings: ___________

---

**Last Updated:** January 6, 2026  
**Status:** 📋 Ready for testing

