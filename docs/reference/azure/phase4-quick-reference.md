# Phase 4: Environment Variables Quick Reference
**Created:** December 26, 2025  
**Purpose:** Quick copy-paste reference for Phase 4 environment variables

## Backend Environment Variables (App Service)

### Critical Variables (Required)

1. **DATABASE_URL**
   ```
   postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require
   ```

2. **NODE_ENV**
   ```
   production
   ```

3. **AZURE_SMS_ENABLED**
   ```
   true
   ```

4. **AZURE_COMMUNICATION_CONNECTION_STRING**
   ```
   [Get from Azure Portal → TraccComms → Keys → Connection string]
   Format: endpoint=https://tracccomms.unitedstates.communication.azure.com/;accesskey=...
   ```

5. **AZURE_COMMUNICATION_PHONE_NUMBER**
   ```
   +18339675959
   ```

### Optional Variables

6. **PORT** (Azure usually sets this automatically)
   ```
   8080
   ```

7. **FRONTEND_URL** (Will update in Phase 5)
   ```
   https://traccems.com
   ```
   Or use Azure Static Web App URL until custom domain is configured

8. **CORS_ORIGIN** (Will update in Phase 5)
   ```
   https://traccems.com
   ```
   Or use Azure Static Web App URL until custom domain is configured

---

## Frontend Environment Variables (Static Web App)

### Critical Variables (Required)

1. **VITE_API_URL**
   ```
   https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net
   ```
   **Note:** Will be updated to `https://api.traccems.com` in Phase 5

### Optional Variables

2. **NODE_ENV**
   ```
   production
   ```

---

## Steps to Configure

### Backend (App Service)

1. Azure Portal → `TraccEms-Prod-Backend` → **Configuration** → **Application settings**
2. Click **"+ New application setting"** for each variable above
3. Copy-paste name and value exactly as shown
4. Click **"Save"** (restarts App Service automatically)

### Frontend (Static Web App)

1. Azure Portal → `TraccEms-Prod-Frontend` → **Configuration** → **Application settings**
2. Click **"+ New application setting"** for each variable above
3. Copy-paste name and value exactly as shown
4. Click **"Save"**
5. **Redeploy frontend** via GitHub Actions workflow for changes to take effect

---

**Last Updated:** December 26, 2025

