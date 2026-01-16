# Rollback Point Identification & pgAdmin Production Setup
**Date:** January 7, 2026  
**Status:** 📋 **ROLLBACK POINT IDENTIFIED** - pgAdmin setup ready

---

## Rollback Point Identification

### Last Successful Backend Deployment

**Deployment ID:** `20786289246`  
**Commit:** `6cbad8c2bb55d58165063d031ccabf57e2d2db61`  
**Time:** `2026-01-07T15:18:08Z` (15:18 UTC / ~10:18 AM Central)  
**Status:** ✅ **SUCCESS**  
**Duration:** 15m25s

**This was BEFORE today's EMS fixes were deployed (before commit `185dd689`).**

### What This Means

**Safe Rollback Target:**
- Backend was working before EMS trips query fix
- Backend was working before deployment optimization attempts
- Backend was responding to requests
- Login was working

**What to Keep:**
- ✅ `agency_responses` table (created today, safe)
- ✅ Orphaned user fix (`chuck@chuckambulance.com` user account)

**What to Revert:**
- ❌ Code changes (EMS trips query fix - can re-apply later)
- ❌ Backend deployment optimization attempts
- ❌ Any startup command changes

### Rollback Steps

1. **In Azure Portal:**
   - Go to: `TraccEms-Prod-Backend` App Service
   - Click: **"Deployment Center"** → **"Logs"** tab
   - Find deployment `20786289246` (Jan 7, 15:18 UTC)
   - Click: **"Redeploy"** (if available)
   - OR manually trigger deployment from that commit

2. **Alternative: Revert Code and Redeploy**
   - Revert to commit before `185dd689` (EMS trips query fix)
   - Push to `main` branch
   - Trigger deployment

3. **Verify Rollback:**
   - Check backend health: `https://api.traccems.com/health`
   - Test login in production
   - Verify backend responds

---

## pgAdmin Production Database Configuration

### Production Database Connection Details

**Server:** `traccems-prod-pgsql.postgres.database.azure.com`  
**Port:** `5432`  
**Database:** `postgres`  
**Username:** `traccems_admin`  
**Password:** `TVmedic429!`  
**SSL Mode:** `require`

**Connection String Format:**
```
postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require
```

---

## pgAdmin Setup Instructions

### Step 1: Add Production Server in pgAdmin

1. **Open pgAdmin**
   - Launch pgAdmin application

2. **Create New Server Connection:**
   - Right-click on **"Servers"** in the left panel
   - Select: **"Create"** → **"Server..."**

3. **General Tab:**
   - **Name:** `TraccEms Production` (or any name you prefer)
   - **Server Group:** `Servers` (default)
   - **Comments:** `Production database for TraccEms`

4. **Connection Tab:**
   - **Host name/address:** `traccems-prod-pgsql.postgres.database.azure.com`
   - **Port:** `5432`
   - **Maintenance database:** `postgres`
   - **Username:** `traccems_admin`
   - **Password:** `TVmedic429!`
   - ✅ **Save password** (check this box)

5. **SSL Tab:**
   - **SSL mode:** `Require` (important for Azure PostgreSQL)
   - Leave other SSL settings as default

6. **Advanced Tab:**
   - **DB restriction:** Leave empty (to see all databases)
   - Other settings: Leave as default

7. **Click:** **"Save"**

### Step 2: Test Connection

1. **Connect to Server:**
   - Expand **"Servers"** → **"TraccEms Production"**
   - Expand **"Databases"** → **"postgres"**
   - Expand **"Schemas"** → **"public"**
   - Expand **"Tables"**

2. **Verify Connection:**
   - You should see a list of tables
   - If you see tables, connection is successful ✅

3. **Test Query:**
   - Right-click on **"postgres"** database
   - Select: **"Query Tool"**
   - Run: `SELECT version();`
   - Should return PostgreSQL version information

### Step 3: Firewall Configuration (If Connection Fails)

**If you get a connection error, you may need to add your IP to Azure firewall:**

1. **Get Your IP Address:**
   - Visit: https://whatismyipaddress.com/
   - Note your public IP address

2. **Add Firewall Rule in Azure:**
   - Go to Azure Portal: https://portal.azure.com
   - Navigate to: `traccems-prod-pgsql` PostgreSQL server
   - Click: **"Networking"** in left menu
   - Click: **"Add current client IP address"** (if available)
   - OR click: **"+ Add firewall rule"**
     - **Rule name:** `pgAdmin-YourName`
     - **Start IP address:** Your IP address
     - **End IP address:** Your IP address
   - Click: **"Save"**

3. **Retry Connection:**
   - Wait 1-2 minutes for firewall rule to propagate
   - Retry connection in pgAdmin

---

## Comparison: Dev-SWA vs Production

### Dev-SWA Connection (You Already Have This)

**Server:** `traccems-dev-pgsql.postgres.database.azure.com`  
**Port:** `5432`  
**Database:** `postgres`  
**Username:** `traccems_admin`  
**Password:** `password1!`  
**SSL Mode:** `require`

### Production Connection (New)

**Server:** `traccems-prod-pgsql.postgres.database.azure.com`  
**Port:** `5432`  
**Database:** `postgres`  
**Username:** `traccems_admin`  
**Password:** `TVmedic429!`  
**SSL Mode:** `require`

**Key Differences:**
- Different server hostname (`-prod-` vs `-dev-`)
- Different password (`TVmedic429!` vs `password1!`)
- Same username (`traccems_admin`)
- Same port and database name

---

## Quick Reference: pgAdmin Connection Settings

### Production Server Settings Summary

```
Name: TraccEms Production
Host: traccems-prod-pgsql.postgres.database.azure.com
Port: 5432
Database: postgres
Username: traccems_admin
Password: TVmedic429!
SSL Mode: Require
```

### Useful pgAdmin Queries for Assessment

**1. List All Tables:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**2. Check Table Exists:**
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'agency_responses'
);
```

**3. List Columns in a Table:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'agency_responses'
ORDER BY ordinal_position;
```

**4. Count Rows in Table:**
```sql
SELECT COUNT(*) FROM agency_responses;
```

**5. List All Schemas:**
```sql
SELECT schema_name 
FROM information_schema.schemata 
ORDER BY schema_name;
```

---

## Next Steps After pgAdmin Setup

1. **✅ Connect to Production** - Verify connection works
2. **📋 Create Assessment** - List all tables, compare to schema.prisma
3. **🎯 Prioritize Fixes** - What's blocking EMS? Healthcare?
4. **🔧 Fix Incrementally** - One table/column at a time
5. **✅ Test After Each Fix** - Verify functionality works

---

## Troubleshooting

### Connection Error: "could not connect to server"

**Possible Causes:**
1. **Firewall blocking your IP** - Add firewall rule in Azure
2. **Wrong hostname** - Verify `traccems-prod-pgsql.postgres.database.azure.com`
3. **Wrong port** - Should be `5432`
4. **SSL required** - Make sure SSL mode is set to `Require`

### Connection Error: "password authentication failed"

**Possible Causes:**
1. **Wrong password** - Verify `TVmedic429!` (may have been changed)
2. **Wrong username** - Verify `traccems_admin`
3. **Password changed** - Check Azure Portal for current password
4. **Azure AD authentication enabled** - May need to use Azure AD auth instead

**Solution:**
1. **Check Azure Portal:**
   - Go to: `traccems-prod-pgsql` → **Overview**
   - Verify admin username: `traccems_admin`
   - Click: **"Reset password"** if needed
   - Set new password and save

2. **Test with psql:**
   ```bash
   psql "postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require"
   ```
   If this works, credentials are correct. If not, password needs to be reset.

3. **Check Authentication Method:**
   - Azure Portal → `traccems-prod-pgsql` → **Authentication**
   - Verify PostgreSQL authentication is enabled
   - If Azure AD is enabled, you may need to use Azure AD auth

**See:** `docs/active/sessions/2026-01/pgadmin-password-troubleshooting.md` for detailed troubleshooting

### Connection Error: "SSL connection required"

**Fix:**
- In pgAdmin connection settings, set **SSL mode** to `Require`
- Azure PostgreSQL requires SSL connections

---

**Last Updated:** January 7, 2026  
**Status:** ✅ Rollback point identified, pgAdmin setup ready

