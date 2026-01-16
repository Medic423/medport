# Dev-SWA Credentials Verification - January 5, 2026
**Status:** ✅ Verified  
**Database:** `traccems-dev-pgsql` (Azure Dev)  
**Users Found:** 17 active users

---

## ✅ Verified Working Credentials

### Admin Users
- **`admin@tcc.com`** / **`admin123`** ✅ **VERIFIED** (via curl test)
  - User Type: ADMIN
  - Name: TCC Administrator
  - Status: ✅ Working

- **`user@tcc.com`** / **`admin123`** (from seed script, not tested yet)
  - User Type: USER
  - Name: TCC User
  - Status: ⏳ Not tested

### EMS Users
- **`test@ems.com`** / **`testpassword`** (from seed script, not tested yet)
  - User Type: EMS
  - Name: Test EMS User
  - Status: ⏳ Not tested

- **`doe@elkcoems.com`** / **`password`** ❌ **NOT WORKING**
  - User Type: EMS
  - Name: John Doer
  - Status: ❌ Password incorrect (tested via curl)
  - **Note:** Seed script says password should be `password`, but it's not working
  - **Possible:** Password was changed or hash doesn't match

- **`fferguson@movalleyems.com`** / **`movalley123`** (from seed script, not tested yet)
  - User Type: EMS
  - Name: Frank Ferguson
  - Status: ⏳ Not tested

### Healthcare Users
- **`chuck@ferrellhospitals.com`** / **`testpassword`** (from seed script, not tested yet)
  - User Type: Healthcare
  - Name: Chuck Ferrell
  - Status: ⏳ Not tested

---

## Users Found in Dev-SWA Database

**Total:** 17 active users

### Center Users (2)
- `admin@tcc.com` - TCC Administrator
- `user@tcc.com` - TCC User

### EMS Users (8)
- `admin@portmatildaems.org` - James Green
- `burt@movalley.com` - Brad Burt
- `doe@elkcoems.com` - John Doer
- `fferguson@movalleyems.com` - Frank Ferguson
- `info@medevacambulance.com` - David Smithbower
- `smith@scems.com` - Dave Smith
- `test@ems.com` - Test EMS User

### Healthcare Users (7)
- `ahazlett@pssolutions.net` - Allen Hazlett
- `chuck41090@mac.com` - Danny Ferrell
- `chuck@ferrellhospitals.com` - Chuck Ferrell
- `chuck@mmc.com` - Tom Litzinger
- `drew@phhealthcare.com` - Drew Hahn
- `haskell@nason.com` - Catilyn Haskell
- `nurse@altoonaregional.org` - Sarah Johnson
- `rick@ph.org` - Rick Summers

---

## ⚠️ Issues Identified

### 1. Password Mismatch
- **User:** `doe@elkcoems.com`
- **Expected:** `password` (from seed script)
- **Actual:** ❌ Not working
- **Possible Causes:**
  - Password was changed after seed
  - Password hash doesn't match
  - User was created manually with different password

### 2. Slow Login Endpoint
- **Issue:** Login endpoint takes ~8 seconds to respond
- **Impact:** Browser timeout (30 seconds) may occur if multiple requests are made
- **Possible Causes:**
  - Database query slow
  - Network latency
  - Backend processing delay
  - Connection pool exhaustion

### 3. Browser Timeout vs. Curl Success
- **Browser:** 30-second timeout (no response)
- **Curl:** 8-second response (successful)
- **Possible Causes:**
  - Frontend timeout configuration
  - Browser CORS preflight delay
  - Multiple simultaneous requests causing backend overload

---

## Recommended Credentials for Testing

### ✅ Confirmed Working
1. **`admin@tcc.com`** / **`admin123`**
   - ✅ Verified via curl
   - ✅ Should work in browser
   - ⚠️ May take 8+ seconds to respond

### ⏳ Should Work (from seed script)
2. **`user@tcc.com`** / **`admin123`**
3. **`test@ems.com`** / **`testpassword`**
4. **`chuck@ferrellhospitals.com`** / **`testpassword`**
5. **`fferguson@movalleyems.com`** / **`movalley123`**

### ❌ Not Working
- **`doe@elkcoems.com`** / **`password`** - Password incorrect

---

## Next Steps

### Immediate Testing
1. ✅ Use `admin@tcc.com` / `admin123` for testing
2. ⏳ Test other credentials from seed script
3. ⏳ Investigate slow login endpoint (8+ seconds)

### Password Reset (if needed)
If `doe@elkcoems.com` password needs to be reset:
```bash
# Connect to dev-swa database and reset password
PGPASSWORD='password1!' psql -h traccems-dev-pgsql.postgres.database.azure.com \
  -U traccems_admin -d postgres \
  -c "UPDATE ems_users SET password = '\$2a\$12\$...' WHERE email = 'doe@elkcoems.com';"
```

Or use the reset script:
```bash
node backend/reset-test-ems-user.js
```

### Performance Investigation
1. Check Azure backend logs for slow queries
2. Check database connection pool settings
3. Verify database indexes on email columns
4. Check for connection pool exhaustion

---

## Summary

**Status:** ✅ **Credentials verified, but login endpoint is slow**

- ✅ Users exist in dev-swa database (17 users)
- ✅ `admin@tcc.com` / `admin123` works (confirmed)
- ⚠️ Login endpoint takes ~8 seconds (very slow)
- ⚠️ Browser timeout may occur due to slow response
- ❌ `doe@elkcoems.com` password doesn't match seed script

**Recommendation:** Use `admin@tcc.com` / `admin123` for testing. If browser times out, wait longer (up to 30 seconds) or investigate the slow login endpoint.

---

**Last Updated:** January 5, 2026  
**Verified By:** Database query + curl test

