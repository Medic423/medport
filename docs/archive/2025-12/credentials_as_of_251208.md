# EMS User Credentials
**Generated:** December 8, 2025

## Dispatch-Eligible EMS Agencies

These agencies are active, accept notifications, and have user accounts for login. These agencies receive SMS notifications when trips are created within their notification radius.

**Total Active Users:** 7 (as of December 8, 2025 - updated)

### 1. Altoona EMS

- **Email:** `test@ems.com`
- **Password:** `testpassword`
- **Name:** Test EMS User
- **Agency Phone:** `(814) 555-0101`
- **Accepts Notifications:** Yes
- **Login Endpoint:** `/api/auth/ems/login`
- **Status:** ✅ Active

### 2. Bedford Ambulance Service

- **Email:** `bedford@bedfordambulance.com`
- **Password:** `bedford123`
- **Name:** Bedford Ambulance User
- **Agency Phone:** `(814) 555-0202`
- **Accepts Notifications:** Yes
- **Login Endpoint:** `/api/auth/ems/login`
- **Status:** ✅ Active (created Dec 8, 2025)

### 3. Citizens Ambulance Service

- **Email:** `citizens@citizensambulance.com`
- **Password:** `citizens123`
- **Name:** Citizens Ambulance User
- **Agency Phone:** `8005551212`
- **Accepts Notifications:** Yes
- **Login Endpoint:** `/api/auth/ems/login`
- **Status:** ✅ Active (created Dec 8, 2025)

### 4. Duncansville EMS

- **Email:** `test@duncansvilleems.org`
- **Password:** `duncansville123`
- **Name:** Test Duncansville User
- **Agency Phone:** `8146963349`
- **Accepts Notifications:** Yes
- **Login Endpoint:** `/api/auth/ems/login`
- **Status:** ✅ Active (created Dec 8, 2025)

### 5. Elk County EMS

- **Email:** `doe@elkcoems.com`
- **Password:** `password`
- **Name:** John Doer
- **Agency Phone:** `(814) 6950813`
- **Accepts Notifications:** Yes
- **Login Endpoint:** `/api/auth/ems/login`
- **Status:** ✅ Active

### 6. Mountain Valley EMS (User 1)

- **Email:** `fferguson@movalleyems.com`
- **Password:** `movalley123`
- **Name:** Frank Ferguson
- **Agency Phone:** `(814) 555-0101`
- **Accepts Notifications:** Yes
- **Login Endpoint:** `/api/auth/ems/login`
- **Status:** ✅ Active

### 7. Mountain Valley EMS (User 2)

- **Email:** `burt@movalley.com`
- **Password:** Unknown (not in seed file, password needs to be reset)
- **Name:** Brad Burt
- **Agency Phone:** `(814) 555-0101`
- **Accepts Notifications:** Yes
- **Login Endpoint:** `/api/auth/ems/login`
- **Status:** ✅ Active

## Quick Reference Table

| Agency | Email | Password | Phone | Status |
|--------|-------|----------|-------|--------|
| Altoona EMS | `test@ems.com` | `testpassword` | (814) 555-0101 | ✅ Active |
| Bedford Ambulance Service | `bedford@bedfordambulance.com` | `bedford123` | (814) 555-0202 | ✅ Active |
| Citizens Ambulance Service | `citizens@citizensambulance.com` | `citizens123` | 8005551212 | ✅ Active |
| Duncansville EMS | `test@duncansvilleems.org` | `duncansville123` | 8146963349 | ✅ Active |
| Elk County EMS | `doe@elkcoems.com` | `password` | (814) 6950813 | ✅ Active |
| Mountain Valley EMS (Ferguson) | `fferguson@movalleyems.com` | `movalley123` | (814) 555-0101 | ✅ Active |
| Mountain Valley EMS (Burt) | `burt@movalley.com` | Unknown | (814) 555-0101 | ✅ Active* |

*Password needs to be set/reset

## Agencies That Received SMS (Trip PCLSZ9YS4)

These agencies received SMS notifications for trip PCLSZ9YS4:

1. ✅ **Altoona EMS** - Has login credentials
2. ✅ **Bedford Ambulance Service** - Has login credentials (created Dec 8, 2025)
3. ✅ **Citizens Ambulance Service** - Has login credentials (created Dec 8, 2025)
4. ✅ **Duncansville EMS** - Has login credentials
5. ✅ **Elk County EMS** - Has login credentials

## Notes

- **Passwords:** Passwords are hashed in the database using bcrypt. Plain text passwords shown above are from the seed file or newly created accounts.
- **SMS Notifications:** Only agencies with `acceptsNotifications: true` receive SMS notifications.
- **Login Requirements:** Users must have `isActive: true` and `isDeleted: false` to log in.
- **Login Endpoint:** All EMS users log in via `POST /api/auth/ems/login` with email and password.
- **New Accounts:** 
  - Bedford and Citizens accounts were created on December 8, 2025 to enable login for agencies that were receiving SMS but had no user accounts.
  - Duncansville EMS account was created on December 8, 2025 (user was missing). Agency was also activated.
  - Altoona EMS user already existed but was marked as deleted. Fixed on December 8, 2025 - unmarked as deleted and verified active.

## Testing SMS Notifications

To test SMS notifications:
1. Create a trip with `notificationRadius` set (e.g., 150 miles)
2. Agencies within the radius that have `acceptsNotifications: true` will receive SMS
3. Check Azure Portal → SMS logs for delivery status
4. Use these credentials to log in as EMS agencies to view/dispatch trips

## Security Notes

⚠️ **These are test/development credentials.**
- Do not use these passwords in production
- Change passwords before production deployment
- Consider implementing password reset functionality
- Store credentials securely (not in version control)

