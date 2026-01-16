# pgAdmin Password Authentication Troubleshooting
**Date:** January 7, 2026  
**Issue:** Password authentication failed for `traccems_admin`  
**Error:** `FATAL: password authentication failed for user "traccems_admin"`

---

## Possible Causes

### 1. Password Changed or Incorrect
**Most Likely:** The password may have been changed in Azure Portal, or there's a typo.

**Documented Password:** `TVmedic429!`

**Check:**
- Verify password in Azure Portal (see steps below)
- Check for typos (especially special characters)
- Ensure no extra spaces

### 2. Azure AD Authentication Enabled
**Possible:** Azure PostgreSQL might be configured for Azure AD authentication instead of password authentication.

**Check:**
- Azure Portal → `traccems-prod-pgsql` → **Authentication**
- See if Azure AD authentication is enabled
- If enabled, you may need to use Azure AD authentication instead

### 3. Special Characters in Password
**Possible:** The exclamation mark `!` might need escaping in pgAdmin.

**Try:**
- Copy password directly from Azure Portal (don't type it)
- Ensure no extra spaces before/after password

### 4. Wrong Username
**Possible:** Username might be different.

**Documented Username:** `traccems_admin`

**Check:**
- Azure Portal → `traccems-prod-pgsql` → **Overview**
- Verify admin username

---

## Solution Steps

### Step 1: Verify Password in Azure Portal

1. **Go to Azure Portal:**
   - Navigate to: `traccems-prod-pgsql` PostgreSQL server
   - URL: https://portal.azure.com → Search "traccems-prod-pgsql"

2. **Check Admin Username:**
   - Click: **"Overview"** tab
   - Look for: **"Admin username"** field
   - Should be: `traccems_admin`

3. **Reset Password (if needed):**
   - Click: **"Reset password"** button (in Overview or Settings)
   - Set new password (remember it!)
   - Click: **"Save"**
   - Wait 1-2 minutes for password to propagate

### Step 2: Check Authentication Method

1. **Go to Authentication Settings:**
   - Azure Portal → `traccems-prod-pgsql` → **"Authentication"** (left menu)

2. **Check Settings:**
   - **PostgreSQL authentication:** Should be enabled
   - **Azure Active Directory authentication:** May or may not be enabled
   - **Microsoft Entra admin:** Should show `chuck@traccems.com`

3. **If Azure AD is Enabled:**
   - You may need to use Azure AD authentication instead
   - OR disable Azure AD authentication (if not needed)

### Step 3: Try Connection Again

**After verifying/resetting password:**

1. **In pgAdmin:**
   - Right-click on server → **"Properties"**
   - Go to **"Connection"** tab
   - **Password:** Enter password (copy from Azure Portal if you reset it)
   - ✅ **Save password** (check box)
   - Click: **"Save"**

2. **Test Connection:**
   - Right-click server → **"Connect Server"**
   - Should connect successfully

### Step 4: Alternative - Use Azure AD Authentication

**If password authentication doesn't work, try Azure AD:**

1. **In pgAdmin:**
   - Right-click server → **"Properties"**
   - Go to **"Advanced"** tab
   - **Authentication:** Select **"Azure Active Directory"** (if available)

2. **Or Use Azure CLI:**
   ```bash
   az login
   az postgres flexible-server connect \
     --name traccems-prod-pgsql \
     --admin-user traccems_admin \
     --admin-password TVmedic429!
   ```

---

## Quick Verification: Test Connection with psql

**Test connection from command line to verify credentials:**

```bash
# Test connection (will prompt for password)
psql "host=traccems-prod-pgsql.postgres.database.azure.com port=5432 dbname=postgres user=traccems_admin sslmode=require"

# Or with password in connection string
psql "postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require"
```

**If this works:** Credentials are correct, issue is with pgAdmin configuration.  
**If this fails:** Password is incorrect or changed, reset it in Azure Portal.

---

## Common Issues

### Issue: Password Has Special Characters
**Solution:** Copy password directly from Azure Portal, don't type it manually.

### Issue: Password Changed Recently
**Solution:** Reset password in Azure Portal and use new password.

### Issue: Azure AD Authentication Required
**Solution:** Use Azure AD authentication in pgAdmin, or disable Azure AD in Azure Portal.

### Issue: Firewall Blocking Connection
**Solution:** Add your IP to Azure firewall rules (Networking → Firewall rules).

---

## Next Steps

1. ✅ **Verify password in Azure Portal** - Check/reset if needed
2. ✅ **Test connection with psql** - Verify credentials work
3. ✅ **Update pgAdmin connection** - Use verified password
4. ✅ **Connect and verify** - Should work now

---

**Last Updated:** January 7, 2026  
**Status:** Troubleshooting guide created

