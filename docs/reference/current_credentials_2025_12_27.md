# Current Credentials - December 27, 2025
**Source:** Dev Azure Database (`traccems-dev-pgsql`)  
**Last Updated:** December 27, 2025  
**Purpose:** Document all users across environments for credential synchronization

---

## Center Users (Admin/Regular Users)

### Admin Users

| Email | Name | User Type | Status | Created | Known Password |
|-------|------|-----------|--------|---------|----------------|
| `admin@tcc.com` | TCC Administrator | ADMIN | Active | 2025-11-02 | `admin123` (from seed) |
| `user@tcc.com` | TCC User | USER | Active | 2025-11-02 | `admin123` (from seed) |

**Note:** Default passwords from seed script. Users may have changed passwords.

---

## Healthcare Users

| Email | Name | Facility Name | Facility Type | Status | Created |
|-------|------|--------------|---------------|--------|---------|
| `ahazlett@pssolutions.net` | Allen Hazlett | Ferrell Hospitals | Healthcare | Active | 2025-11-07 |
| `chuck41090@mac.com` | Danny Ferrell | Ferrell Hospitals | Healthcare | Active | 2025-12-11 |
| `chuck@ferrellhospitals.com` | Chuck Ferrell | Ferrell Hospitals | HOSPITAL | Active | 2025-11-02 |
| `drew@phhealthcare.com` | Drew Hahn | Ferrell Hospitals | Healthcare | Active | 2025-11-03 |
| `nurse@altoonaregional.org` | Sarah Johnson | Altoona Regional Health System | HOSPITAL | Active | 2025-11-02 |
| `rick@ph.org` | Rick Summers | Ferrell Hospitals | Healthcare | Active | 2025-11-03 |

**Note:** Healthcare user passwords are not stored in seed script. These were likely created through registration or manual creation.

---

## EMS Users

| Email | Name | Agency Name | User Type | Status | Created |
|-------|------|-------------|-----------|--------|---------|
| `burt@movalley.com` | Brad Burt | Mountain Valley EMS | EMS | Active | 2025-11-03 |
| `doe@elkcoems.com` | John Doer | Elk County EMS | EMS | Active | 2025-11-02 |
| `fferguson@movalleyems.com` | Frank Ferguson | Mountain Valley EMS | EMS | Active | 2025-11-02 |
| `test@ems.com` | Test EMS User | Altoona EMS | EMS | Active | 2025-11-02 |

**Note:** EMS user passwords are not stored in seed script. These were likely created through registration or manual creation.

---

## Summary

- **Total Center Users:** 2 (1 Admin, 1 Regular User)
- **Total Healthcare Users:** 6
- **Total EMS Users:** 4
- **Grand Total:** 12 active users

---

## Known Passwords

### Verified Working Passwords (Tested December 28, 2025)
- `admin@tcc.com`: `admin123` ✅ Verified (Local Dev & Dev-SWA)
- `admin@tcc.com`: `password123` ⚠️ **Production Only** (different password!)
- `chuck@ferrellhospitals.com`: `testpassword` ✅ Verified
- `doe@elkcoems.com`: `password` ✅ Verified
- `test@ems.com`: `testpassword` ✅ Verified

**⚠️ IMPORTANT:** Production uses `password123` for `admin@tcc.com`, NOT `admin123`. Production password was set manually on December 28, 2025.

### Passwords from Seed Script (Not Yet Verified)
- `user@tcc.com`: `admin123` (from seed)
- `burt@movalley.com`: `movalley123` (from seed)
- `fferguson@movalleyems.com`: `movalley123` (from seed)

**⚠️ Important:** Other users' passwords are not documented. They may have been:
- Set during registration
- Changed by users
- Set manually

---

## Database Information

### Dev Azure Database
- **Host:** `traccems-dev-pgsql.postgres.database.azure.com`
- **Database:** `postgres`
- **Username:** `traccems_admin`
- **Connection String:** `postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require`

### Production Azure Database
- **Host:** `traccems-prod-pgsql.postgres.database.azure.com`
- **Database:** `postgres`
- **Username:** `traccems_admin`
- **Connection String:** `postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require`
- **Current Users:** Only `admin@tcc.com` (created manually on 2025-12-28 with password `password123`)

### Local Dev Database
- **Database:** `medport_ems` (localhost)
- **Connection:** `postgresql://scooper@localhost:5432/medport_ems?schema=public`
- **Status:** ✅ Active - Users synced December 28, 2025
- **Users:** 12 users synced (2 Center, 6 Healthcare, 4 EMS)
- **EMS Agencies:** 7 agencies synced

---

## Sync Status

| Environment | Users Count | Last Synced | Status |
|-------------|-------------|-------------|--------|
| Dev Azure | 12 | N/A | ✅ Source of truth |
| Production Azure | 1 | 2025-12-28 | ⏳ Needs sync |
| Local Dev | 12 | 2025-12-28 | ✅ Synced |

**Data Sync Status (Local Dev):**
- ✅ Users: 12 synced (December 28, 2025)
- ✅ EMS Agencies: 7 synced (December 28, 2025)
- ✅ Hospitals: 2 synced (December 28, 2025)
- ✅ Facilities: 2 synced (December 28, 2025)
- ✅ Healthcare Locations: 9 synced (December 28, 2025)

---

## Next Steps

1. ✅ Documented dev database users
2. ⏳ Restart local dev servers
3. ⏳ Verify local dev credentials
4. ⏳ Sync users from dev to production
5. ⏳ Sync users to local dev (if needed)

---

## Notes

- All passwords are hashed using bcrypt in the database
- The sync script (`backend/sync-users-across-environments.js`) preserves password hashes
- Users can be synced while preserving their current passwords
- Deleted users (`isDeleted = true`) are excluded from sync

