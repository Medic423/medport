# Production Troubleshooting Session Prompt

I'm experiencing errors on the production site (`https://traccems.com`) after successfully logging in as `admin@tcc.com` with password `password123`. I need help troubleshooting these issues and setting up test users for Healthcare and EMS login types.

## Current Issues

### 1. Admin Users Page - Internal Server Error
- **Location:** After logging in as admin, navigating to the Admin Users page
- **Error:** "Internal server error"
- **Expected Behavior:** Should display a list of all users (Center, Healthcare, EMS) with their details
- **API Endpoint:** The page calls `GET /api/auth/users` (requires ADMIN authentication)
- **Backend Route:** `backend/src/routes/auth.ts` line 1047 - uses `authenticateAdmin` middleware

### 2. EMS Tab - Authentication Token Error
- **Location:** In the Admin dashboard, there's an EMS tab
- **Error:** "Error No authentication token found"
- **Expected Behavior:** Should display EMS-related data or functionality
- **API Endpoint:** Likely calls `/api/ems/sub-users` or similar EMS endpoints
- **Note:** This might be a permissions issue - the admin user may not have the correct userType or the endpoint may require EMS-specific authentication

## Production Database Status

Based on my checks:
- **Center Users:** 1 user exists (`admin@tcc.com`)
- **Healthcare Users:** 0 users exist (table `healthcare_users` exists but is empty)
- **EMS Users:** 0 users exist (table `ems_users` does not exist in production - this may be a schema mismatch issue)

## Test Users Needed

I need to create test users in production for:
1. **Healthcare User** - To test Healthcare login and dashboard functionality
2. **EMS User** - To test EMS login and dashboard functionality

Please check if there are any existing Healthcare or EMS users in the production database that I can use for testing. If not, help me create test users with known credentials.

## Git Branch Strategy

Should I create a new git branch for production troubleshooting? I want to ensure that any fixes or debugging code doesn't affect the main branch until tested. Please advise on the best approach:
- Create a new branch (e.g., `fix/production-errors`)?
- Work directly on main branch?
- Use a different strategy?

## Outstanding Issues Review

Please review the documentation in `/docs` to see if there are any other outstanding issues from bringing production online. Specifically check:
- `docs/active/sessions/2025-12/plan_for_20251229.md` - Session plan
- `docs/reference/azure/phase5-custom-domain-guide.md` - Custom domain configuration status
- Any other relevant documentation

## Production Environment Details

- **Frontend:** `https://traccems.com`
- **Backend API:** `https://api.traccems.com`
- **Database:** `traccems-prod-pgsql.postgres.database.azure.com`
- **Admin Credentials:** `admin@tcc.com` / `password123` (confirmed working for login)

## What I Need

1. **Fix the Admin Users page error** - Investigate why `/api/auth/users` is returning an internal server error
2. **Fix the EMS tab authentication error** - Determine why the EMS tab shows "No authentication token found"
3. **Create or identify test users** - Set up Healthcare and EMS test users in production with known credentials
4. **Review outstanding issues** - Check documentation for any remaining tasks from production setup
5. **Git branch guidance** - Advise on whether to use a separate branch for troubleshooting

Please start by investigating the Admin Users page error and the EMS tab error, then help me set up test users for Healthcare and EMS login types.

