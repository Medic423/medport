# Fix Orphaned EMS Agency - Instructions
**Date:** January 6, 2026  
**Script:** `backend/fix-orphaned-ems-agency.js`  
**Issue:** Agency "Chuck's Ambulance" exists but user account doesn't

---

## Problem

- **Agency exists:** "Chuck's Ambulance" with email `chuck@chuckambulance.com` exists in `ems_agencies` table
- **User missing:** No user account exists in `ems_users` table for this email
- **Impact:** User appears in agency list but cannot log in

---

## Solution

The script creates the missing user account for the orphaned agency.

---

## Prerequisites

1. **Production DATABASE_URL** must be set or provided
2. **Database access** to production database
3. **Backup** should be created before running (recommended)

---

## Usage

### Option 1: Set DATABASE_URL Environment Variable

```bash
export DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require"
cd backend
node fix-orphaned-ems-agency.js
```

### Option 2: Provide DATABASE_URL Inline

```bash
cd backend
DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node fix-orphaned-ems-agency.js
```

---

## What The Script Does

1. **Checks if user already exists** - If user exists, script exits (safety check)
2. **Finds the orphaned agency** - Looks up agency by email `chuck@chuckambulance.com`
3. **Determines if first user** - Checks if this will be the first user for the agency (sets orgAdmin)
4. **Generates temporary password** - Creates a secure 12-character password
5. **Creates user account** - Creates user in `ems_users` table with:
   - Email from agency
   - Name from agency contactName
   - Agency name and ID linked
   - Temporary password (must be changed on first login)
   - orgAdmin = true if first user
6. **Verifies creation** - Confirms user was created successfully
7. **Displays credentials** - Shows email and temporary password

---

## Expected Output

```
🔧 Fixing Orphaned EMS Agency Issue

Target email: chuck@chuckambulance.com

📋 Step 1: Checking if user already exists...
❌ User does not exist - proceeding with fix...

📋 Step 2: Finding orphaned agency...
✅ Found agency:
   Agency ID: cmjufqp5ycb9909abee
   Agency Name: Chuck's Ambulance
   Contact Name: [contact name]
   Email: chuck@chuckambulance.com
   Phone: 8146950813
   Address: [address]

📋 Step 3: Checking if this is the first user for the agency...
   Existing users for agency: 0
   Is first user: Yes (will be orgAdmin)

📋 Step 4: Generating temporary password...
✅ Password generated and hashed

📋 Step 5: Creating user account...
   User data (password hidden):
   - Email: chuck@chuckambulance.com
   - Name: [contact name]
   - Agency: Chuck's Ambulance
   - Agency ID: cmjufqp5ycb9909abee
   - Org Admin: true
   - Must Change Password: true

✅ User account created successfully!
   User ID: [user id]

📋 Step 6: Verifying user creation...
✅ Verification successful!
   User: chuck@chuckambulance.com
   Name: [contact name]
   Agency: Chuck's Ambulance
   Linked to Agency ID: cmjufqp5ycb9909abee

═══════════════════════════════════════════════════════════
✅ FIX COMPLETE - User Account Created
═══════════════════════════════════════════════════════════

📧 Email: chuck@chuckambulance.com
🔑 Temporary Password: [12-character password]

⚠️  IMPORTANT:
   - User MUST change password on first login
   - Share these credentials securely with the user
   - User can now log in at: https://traccems.com

═══════════════════════════════════════════════════════════
```

---

## After Running The Script

### 1. Save Credentials Securely

- **Email:** `chuck@chuckambulance.com`
- **Temporary Password:** [shown in script output]
- Share these credentials securely with the user

### 2. User Actions Required

- User should log in at: https://traccems.com
- User will be prompted to change password on first login
- User can then access all EMS features

### 3. Verify Fix

- Test login with the temporary password
- Verify user can access EMS features
- Verify user is linked to correct agency

---

## Safety Features

### Built-in Safety Checks

1. **User Existence Check** - Script checks if user already exists before creating
2. **Agency Verification** - Script verifies agency exists before creating user
3. **Transaction Safety** - Uses Prisma's built-in transaction safety
4. **Error Handling** - Comprehensive error handling with detailed messages

### If User Already Exists

If the user already exists, the script will:
- Display existing user information
- Exit without making changes
- No data will be modified

---

## Troubleshooting

### Error: "Agency not found"

**Cause:** Agency doesn't exist with the expected email

**Solution:**
- Verify agency exists in database
- Check email spelling
- Run `check-ems-agency-issue.js` to see all agencies

### Error: "Email already exists"

**Cause:** User account already exists

**Solution:**
- This is actually good - means issue is already fixed
- Script will exit safely
- Verify user can log in

### Error: Database Connection Failed

**Cause:** DATABASE_URL incorrect or database unavailable

**Solution:**
- Verify DATABASE_URL is correct
- Check database is accessible
- Verify network connectivity

### Error: Foreign Key Constraint

**Cause:** Agency ID doesn't exist (shouldn't happen if agency was found)

**Solution:**
- Verify agency exists in database
- Check agency ID matches
- Run diagnostic scripts to check database state

---

## Related Scripts

- `backend/check-ems-user-issue.js` - Check if user exists
- `backend/check-ems-agency-issue.js` - Check agency details
- `backend/check-production-tables.js` - Check all orphaned data

---

## Next Steps After Fix

1. ✅ **Fix applied** - User account created
2. ⏭️ **Test login** - Verify user can log in
3. ⏭️ **Check for other orphaned data** - Run checks for similar issues
4. ⏭️ **Document results** - Update issue tracking

---

**Last Updated:** January 6, 2026  
**Status:** ✅ Script ready to run

