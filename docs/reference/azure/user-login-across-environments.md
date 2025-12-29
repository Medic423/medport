# User Login Across Environments Guide

**Created:** December 29, 2025  
**Purpose:** Understand why credentials work in some environments but not others  
**Status:** Active Reference

---

## Expected Behavior

### Should Credentials Work on All Three Sites?

**Short Answer:** It depends on which users are synced to which database.

**Detailed Answer:**

| Environment | Database | Users Available | Credentials Should Work? |
|------------|----------|----------------|--------------------------|
| **Local Dev** | `medport_ems` (local) | 12 users (synced Dec 28) | ✅ YES - If synced |
| **Dev-SWA** | `traccems-dev-pgsql` (Azure Dev) | 12 users (source) | ✅ YES - Should work |
| **Production** | `traccems-prod-pgsql` (Azure Prod) | 1 user (admin@tcc.com) | ⚠️ NO - Only admin works |

---

## Current Status

### Local Dev ✅
- **Database:** `medport_ems` (localhost)
- **Users:** 12 users synced (December 28, 2025)
- **Status:** ✅ Credentials work
- **Users Available:**
  - `admin@tcc.com` / `admin123`
  - `user@tcc.com` / `admin123`
  - `chuck@ferrellhospitals.com` / `testpassword`
  - `doe@elkcoems.com` / `TVmedic429!`
  - `fferguson@movalleyems.com` / `movalley123`
  - `test@ems.com` / `testpassword`
  - Plus 6 more users

### Dev-SWA ⚠️
- **Database:** `traccems-dev-pgsql` (Azure Dev)
- **Expected Users:** 12 users (source of truth)
- **Status:** ⚠️ Credentials NOT working
- **Backend:** `TraccEms-Dev-Backend`
- **Database URL:** `postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres`
- **Issue:** Users may not be in database, or connection issue

### Production ⚠️
- **Database:** `traccems-prod-pgsql` (Azure Prod)
- **Users:** Only 1 user (`admin@tcc.com`)
- **Status:** ⚠️ Only admin should work
- **Backend:** `TraccEms-Prod-Backend`
- **Database URL:** `postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require`
- **Issue:** Other users not synced (by design - production has minimal data)

---

## Troubleshooting Dev-SWA Login Issues

### Step 1: Verify Users Exist in Dev Azure Database

**Check if users are actually in the database:**

```bash
# Connect to dev Azure database and check user count
psql "postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" \
  -c "SELECT COUNT(*) FROM center_users WHERE \"isDeleted\" = false;"
  
psql "postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" \
  -c "SELECT COUNT(*) FROM healthcare_users WHERE \"isDeleted\" = false;"
  
psql "postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" \
  -c "SELECT COUNT(*) FROM ems_users WHERE \"isDeleted\" = false;"
```

**Expected:** Should show 2 center users, 6 healthcare users, 4 EMS users (total 12)

### Step 2: Verify Backend Database Connection

**Check if backend is connecting to correct database:**

```bash
# Check dev backend DATABASE_URL
az webapp config appsettings list \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral \
  --query "[?name=='DATABASE_URL']"
```

**Expected:** Should show dev Azure database connection string

### Step 3: Check Backend Logs

**Check dev backend logs for authentication errors:**

```bash
# View recent logs
az webapp log tail \
  --name TraccEms-Dev-Backend \
  --resource-group TraccEms-Dev-USCentral
```

**Look for:**
- Database connection errors
- Authentication errors
- User not found errors

### Step 4: Sync Users to Dev Azure (If Missing)

**If users are missing from dev Azure database, sync them:**

```bash
# Sync users from local dev to dev Azure
SOURCE_DB="postgresql://scooper@localhost:5432/medport_ems?schema=public" \
TARGET_DB="postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" \
node backend/sync-users-across-environments.js sync
```

**Note:** This syncs users FROM local dev TO dev Azure. Only do this if dev Azure is missing users.

---

## Fixing Dev-SWA Login Issues

### Option 1: Verify Users Are in Dev Azure Database

**If users are missing, sync them:**

1. **Sync from Local Dev to Dev Azure:**
   ```bash
   SOURCE_DB="postgresql://scooper@localhost:5432/medport_ems?schema=public" \
   TARGET_DB="postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" \
   node backend/sync-users-across-environments.js sync
   ```

2. **Or sync from Dev Azure to Dev Azure (if you have a backup):**
   ```bash
   # If dev Azure database was reset, you may need to restore from backup
   # Or manually create users via registration
   ```

### Option 2: Check Backend Configuration

**Verify backend is using correct database:**

1. **Check DATABASE_URL:**
   ```bash
   az webapp config appsettings list \
     --name TraccEms-Dev-Backend \
     --resource-group TraccEms-Dev-USCentral \
     --query "[?name=='DATABASE_URL']"
   ```

2. **Update if needed (add SSL mode):**
   ```bash
   az webapp config appsettings set \
     --name TraccEms-Dev-Backend \
     --resource-group TraccEms-Dev-USCentral \
     --settings DATABASE_URL="postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require"
   ```

3. **Restart backend:**
   ```bash
   az webapp restart \
     --name TraccEms-Dev-Backend \
     --resource-group TraccEms-Dev-USCentral
   ```

### Option 3: Test Login Directly

**Test login via API:**

```bash
# Test login on dev-swa
curl -X POST https://dev-api.traccems.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tcc.com","password":"admin123"}'
```

**Expected:** Should return user data and token

---

## Production Login Behavior

### Current Production Status

**Production database has only 1 user:**
- `admin@tcc.com` / `password123` (created manually December 28, 2025)

**Other users will NOT work on production** because they haven't been synced.

### Should You Sync Users to Production?

**Recommendation:** ⚠️ **NO** - Don't sync test users to production

**Reason:**
- Production is for real client data
- Test users should not be in production
- Only sync reference data (hospitals, agencies, etc.), not user accounts

**Exception:**
- If you need test users for production testing, create them manually via registration
- Or create a separate test account specifically for production testing

---

## Summary

### Expected Login Behavior

| Environment | Credentials Work? | Why |
|------------|-------------------|-----|
| **Local Dev** | ✅ YES | Users synced from dev Azure (12 users) |
| **Dev-SWA** | ✅ SHOULD WORK | Uses dev Azure database (12 users) - **Needs verification** |
| **Production** | ⚠️ ONLY ADMIN | Only 1 user synced (admin@tcc.com) - **By design** |

### Action Items

1. **Verify Dev-SWA:**
   - Check if users exist in dev Azure database
   - Verify backend DATABASE_URL is correct
   - Check backend logs for errors
   - Sync users if missing

2. **Production:**
   - Only `admin@tcc.com` should work (by design)
   - Don't sync test users to production
   - Create production-specific test accounts if needed

3. **Update Documentation:**
   - Document which users work in which environment
   - Update credentials document with environment-specific notes

---

## Quick Reference

### Test Credentials

**Local Dev & Dev-SWA (should work on both):**
- `admin@tcc.com` / `admin123`
- `user@tcc.com` / `admin123`
- `chuck@ferrellhospitals.com` / `testpassword`
- `doe@elkcoems.com` / `TVmedic429!`
- `test@ems.com` / `testpassword`

**Production (only this works):**
- `admin@tcc.com` / `password123`

### Database Connection Strings

**Dev Azure:**
```
postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require
```

**Production Azure:**
```
postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require
```

**Local Dev:**
```
postgresql://scooper@localhost:5432/medport_ems?schema=public
```

---

**Last Updated:** December 29, 2025  
**Status:** Active Reference

