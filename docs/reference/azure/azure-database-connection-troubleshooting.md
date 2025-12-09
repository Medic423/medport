# Azure Database Connection Troubleshooting
**Last Updated:** December 8, 2025

## Problem: Connection Timeout

Both `psql` and pgAdmin are timing out when connecting to:
- `traccems-dev-pgsql.postgres.database.azure.com:5432`

## Root Cause: Azure Firewall

Azure PostgreSQL requires your IP address to be whitelisted in the firewall rules.

## Solution: Add Your IP to Azure Firewall

### Option 1: Via Azure Portal (Recommended)

1. **Go to Azure Portal:**
   - Navigate to your PostgreSQL server: `traccems-dev-pgsql`
   - Or search for: "traccems-dev-pgsql"

2. **Open Firewall Settings:**
   - Click on **"Networking"** or **"Connection security"** in the left menu
   - Or go to **Settings** → **Connection security**

3. **Add Your IP Address:**
   - Find your current IP address:
     ```bash
     curl ifconfig.me
     # Or visit: https://whatismyipaddress.com/
     ```
   - Click **"Add client IP"** or manually add your IP
   - Click **"Save"**

4. **Allow Azure Services (Optional but Recommended):**
   - Enable **"Allow Azure services and resources to access this server"**
   - This allows GitHub Actions to connect

5. **Wait 1-2 minutes** for firewall rules to propagate

6. **Try connecting again** in pgAdmin

### Option 2: Allow All IPs (Temporary - Less Secure)

⚠️ **Only for testing - not recommended for production**

1. In Azure Portal → Networking
2. Add rule: `0.0.0.0 - 255.255.255.255` (allows all IPs)
3. Save
4. Connect
5. **Remove this rule after testing!**

### Option 3: Use Azure Cloud Shell

If direct connection isn't possible, use Azure Cloud Shell:

1. Go to Azure Portal
2. Click **Cloud Shell** icon (top right)
3. Select **Bash**
4. Run:
   ```bash
   psql "host=traccems-dev-pgsql.postgres.database.azure.com port=5432 dbname=postgres user=traccems_admin@traccems-dev-pgsql password=password1! sslmode=require"
   ```

### Option 4: Use Azure Portal Query Editor

Some Azure PostgreSQL servers have a built-in query editor:

1. Go to Azure Portal → Your PostgreSQL server
2. Look for **"Query editor"** or **"Query"** in the left menu
3. Use the built-in SQL editor to run the baseline SQL

## Find Your IP Address

```bash
# Get your public IP
curl ifconfig.me

# Or
curl ipinfo.io/ip

# Or visit in browser
# https://whatismyipaddress.com/
```

## Verify Connection After Adding IP

```bash
# Test connection (should work after firewall update)
PGPASSWORD='password1!' psql \
  "postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" \
  -c "SELECT version();"
```

## Alternative: Run Baseline via GitHub Actions

Since GitHub Actions might have different firewall rules, we could:

1. Create a GitHub Actions workflow that runs the baseline SQL
2. This would use Azure's service-to-service connection
3. More complex but might work if direct connection doesn't

## Quick Checklist

- [ ] Check Azure Portal → Networking → Firewall rules
- [ ] Add your current IP address
- [ ] Enable "Allow Azure services" (for GitHub Actions)
- [ ] Wait 1-2 minutes for propagation
- [ ] Try connecting again
- [ ] If still failing, check Azure service status

## After Connection Works

Once you can connect:
1. Run `backend/baseline-migrations-complete.sql` in pgAdmin
2. Verify: `SELECT COUNT(*) FROM "_prisma_migrations";` (should be 29)
3. Re-run GitHub Actions workflow

