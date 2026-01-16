# EMS User Login Issue Analysis
**Date:** January 6, 2026  
**Issue:** `chuck@chuckambulance.com` appears in EMS Agency list but login fails  
**Status:** 🔴 **ROOT CAUSE IDENTIFIED**

---

## Problem Summary

**User Report:**
- User `chuck@chuckambulance.com` appears in "TCC Command -> EMS Agency list"
- When attempting to use this account, error: "No account found with this email address. Please check your email or contact support."
- User was created via successful "Create Account" process

---

## Root Cause Analysis

### Database Check Results

**Agency Exists:**
- ✅ Agency "Chuck's Ambulance" exists in `ems_agencies` table
- ✅ Email: `chuck@chuckambulance.com`
- ✅ Agency ID: `cmjufqp5ycb9909abee`
- ✅ Created: December 31, 2025
- ✅ Status: Active

**User Does NOT Exist:**
- ❌ No user with email `chuck@chuckambulance.com` in `ems_users` table
- ❌ No user in `center_users` table
- ❌ No user in `healthcare_users` table

### Why This Happens

**The Issue:**
1. EMS registration process creates BOTH an agency AND a user in a transaction
2. The transaction partially failed - agency was created but user wasn't
3. Agency list shows agencies from `ems_agencies` table (agency exists)
4. Login looks for users in `ems_users` table (user doesn't exist)

**Code Flow:**
- **Agency List:** Reads from `ems_agencies` table → Shows "Chuck's Ambulance"
- **Login:** Looks in `ems_users` table → User not found → Error

**Registration Code Location:**
- `backend/src/routes/auth.ts` lines 970-1326
- Uses `db.$transaction()` to create agency and user atomically
- Transaction should ensure both are created or both fail

**Why Transaction May Have Failed:**
- Possible causes:
  1. User creation failed after agency creation (transaction rollback didn't work)
  2. User was created but later deleted
  3. Schema mismatch at time of registration
  4. Database constraint violation during user creation
  5. Migration state issue (tables may have been in inconsistent state)

---

## Current Database State

### EMS Agencies (3 total)
| Agency Name | Email | User Exists? | Status |
|------------|-------|-------------|--------|
| Southern Cove EMS | dave@scems.com | ✅ Yes | ✅ Working |
| Chuck's Ambulance | chuck@chuckambulance.com | ❌ **NO** | 🔴 **BROKEN** |
| Test EMS Agency | test-ems@tcc.com | ✅ Yes (2 users) | ✅ Working |

### EMS Users (3 total)
| Email | Name | Agency | Status |
|-------|------|---------|--------|
| dave@scems.com | Dave Salvati | Southern Cove EMS | ✅ Working |
| chuck41090@icloud.com | Test EMS User | Test EMS Agency | ✅ Working |
| chuck41090@mac.com | Test EMS User | Test EMS Agency | ✅ Working |

**Missing User:**
- ❌ `chuck@chuckambulance.com` - Agency exists but user doesn't

---

## Impact

**Affected Functionality:**
- ❌ User cannot log in
- ❌ User cannot access EMS features
- ⚠️ Agency appears in list but is unusable
- ⚠️ Data inconsistency between `ems_agencies` and `ems_users` tables

**This Is Why:**
- This issue led to the database catch-up plan
- Multiple orphaned agencies/users likely exist
- Schema inconsistencies causing partial registrations

---

## Solution Options

### Option 1: Create Missing User Account (Recommended)

**Action:** Create the missing user account for the existing agency

**Steps:**
1. Get agency details from `ems_agencies` table
2. Create corresponding user in `ems_users` table
3. Link user to agency via `agencyId`
4. Set password (user will need to reset or be given temp password)

**Pros:**
- Fixes the immediate issue
- Preserves agency data
- User can log in

**Cons:**
- Need to determine password (may need password reset flow)
- May need to contact user

### Option 2: Delete Orphaned Agency

**Action:** Delete the agency if it's not needed

**Steps:**
1. Delete agency from `ems_agencies` table
2. Verify no related data exists

**Pros:**
- Cleans up orphaned data
- Simple solution

**Cons:**
- Loses agency data
- User may have intended to use this account

### Option 3: Investigate and Fix Root Cause

**Action:** Understand why transaction partially failed and prevent future occurrences

**Steps:**
1. Check application logs from registration time
2. Identify why user creation failed
3. Fix underlying issue
4. Then fix orphaned data

**Pros:**
- Prevents future issues
- Fixes root cause

**Cons:**
- Takes longer
- May not be able to find root cause

---

## Recommended Approach

**Immediate Fix:**
1. Create missing user account for `chuck@chuckambulance.com`
2. Set temporary password
3. User can reset password on first login

**Long-term Fix:**
1. Investigate why registration transaction partially failed
2. Add better error handling and rollback
3. Add data consistency checks
4. Fix any other orphaned agencies/users

---

## Related Issues

**This Issue Is Related To:**
- Phase 1 migration findings (tables exist that migration would drop)
- Database schema inconsistencies
- Migration partial application issues

**Similar Issues May Exist:**
- Other orphaned agencies without users
- Other orphaned users without agencies
- Data inconsistencies from partial migrations

---

## Next Steps

1. ✅ **Root cause identified** - Agency exists, user doesn't
2. ⏭️ **Create missing user account** - Fix immediate issue
3. ⏭️ **Check for other orphaned data** - Find similar issues
4. ⏭️ **Investigate registration process** - Prevent future occurrences
5. ⏭️ **Update Phase 1 plan** - Include data consistency fixes

---

**Last Updated:** January 6, 2026  
**Status:** 🔴 Root cause identified, ready for fix

