# Phase 1: Azure Resource Creation - Implementation Guide
**Created:** December 12, 2025  
**Status:** In Progress  
**Goal:** Create production Azure resources for traccems.com

## Prerequisites

- ✅ Azure Portal access confirmed
- ✅ Subscription: TraccEmsSubscription (fb5dde6b-779f-4ef5-b457-4b4d087a48ee)
- ✅ DNS records documented
- ✅ Dev resource details documented

---

## Task 1.1: Create Production Resource Group

### Step-by-Step Instructions

1. **Navigate to Azure Portal:**
   - Go to https://portal.azure.com
   - Sign in with your Azure account

2. **Create Resource Group:**
   - Click **"Create a resource"** (or search for "Resource groups")
   - Select **"Resource groups"**
   - Click **"Create"**

3. **Configure Resource Group:**
   - **Subscription:** TraccEmsSubscription
   - **Resource group name:** `TraccEms-Prod-USCentral`
   - **Region:** `Central US` (matching dev)
   - Click **"Review + create"**
   - Click **"Create"**

4. **Wait for Creation:**
   - Wait for resource group to be created (usually < 1 minute)
   - Click **"Go to resource group"** when done

### Verification
- [ ] Resource group `TraccEms-Prod-USCentral` created
- [ ] Region is `Central US`
- [ ] Subscription is `TraccEmsSubscription`

**Notes:** Document any issues or observations:
```
_________________________________________________________________
TraccEms-Prod-USCentral • TraccEmsSubscription Central US____________________________________________________
```

---

## Task 1.2: Create Production Azure Static Web App

### Step-by-Step Instructions

1. **Navigate to Create Static Web App:**
   - In Azure Portal, click **"Create a resource"**
   - Search for **"Static Web App"**
   - Click **"Static Web App"** → **"Create"**

2. **Basics Tab:**
   - **Subscription:** TraccEmsSubscription
   - **Resource Group:** `TraccEms-Prod-USCentral` (select from dropdown)
   - **Name:** `TraccEms-Prod-Frontend`
   - **Plan type:** `Standard` (required for custom domain)
   - **Region:** `Central US`
   - Click **"Next: Deployment >"**

3. **Deployment Tab:**
   - **Deployment authorization policy:** `Deployment token` ✅ (IMPORTANT: Use this for GitHub Actions)
   - **Note:** We're using Deployment token because we'll deploy via GitHub Actions workflows (manual trigger), not direct GitHub integration
   - **Build Presets:** `Custom`
   - **App location:** `/frontend`
   - **Api location:** (leave empty)
   - **Output location:** `dist`
   - Click **"Next: Review and create >"**

4. **Review and Create:**
   - Review all settings
   - Click **"Create"**

5. **Wait for Creation:**
   - Wait for Static Web App to be created (usually 2-3 minutes)
   - Click **"Go to resource"** when done

6. **Get Deployment Token:**
   - In the Static Web App resource, go to **"Manage deployment token"** (or **"Overview"** → **"Manage deployment token"**)
   - Click **"Copy token"** or **"Generate new token"**
   - Copy the deployment token (you'll need this for GitHub Secrets)
   - **Save this token securely:** This will be `AZURE_FRONTEND_PROD_API_TOKEN` in GitHub Secrets
   - **Important:** Keep this token secure - you'll need it in Phase 3 for GitHub Actions workflow

### Verification
- [x] Static Web App `TraccEms-Prod-Frontend` created ✅
- [x] Resource group: `TraccEms-Prod-USCentral` ✅
- [x] Region: `Central US` ✅
- [x] Plan type: `Standard` ✅
- [x] Deployment authorization policy: `Deployment token` ✅
- [x] Deployment token copied and saved securely ✅

**Resource ID:** `/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourcegroups/TraccEms-Prod-USCentral/providers/Microsoft.Web/staticSites/TraccEms-Prod-Frontend`

**Deployment Token:** ✅ **OBTAINED** (starts with: `6e26f747b51cd74712e27aef71bd61ae...`)

**Security Note:** Token obtained. Will be added to GitHub Secrets as `AZURE_FRONTEND_PROD_API_TOKEN` in Phase 3.

**Notes:** Document any issues or observations:
```
✅ Resource created successfully
✅ Configuration verified: Subscription, Resource Group, and Name all correct
⚠️ Remember to get deployment token before proceeding
```

---

## Task 1.3: Create Production App Service Plan

### Step-by-Step Instructions

1. **Navigate to Create App Service Plan:**
   - In Azure Portal, click **"Create a resource"**
   - Search for **"App Service Plan"**
   - Click **"App Service Plan"** → **"Create"**

2. **Basics Tab:**
   - **Subscription:** TraccEmsSubscription
   - **Resource Group:** `TraccEms-Prod-USCentral`
   - **Name:** `ASP-TraccEmsProdUSCentral` (or let Azure generate)
   - **Operating System:** `Linux`
   - **Region:** `Central US`
   - **Pricing tier:** 
     - **Recommended:** `Basic B1` or `Standard S1` (start with Basic, can scale up later)
     - **For production:** Consider `Standard S1` or higher
   - Click **"Review + create"**
   - Click **"Create"**

3. **Wait for Creation:**
   - Wait for App Service Plan to be created (usually < 1 minute)
   - Note the plan name for next step

### Verification
- [x] App Service Plan created ✅
- [x] Resource group: `TraccEms-Prod-USCentral` ✅
- [x] Region: `Central US` ✅
- [x] Operating System: `Linux` ✅
- [ ] Pricing tier selected: `_________________` (verify in Azure Portal)

**App Service Plan Name:** `ASP-TraccEmsProdUSCentral` ✅

**Resource ID:** `/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourcegroups/TraccEms-Prod-USCentral/providers/Microsoft.Web/serverFarms/ASP-TraccEmsProdUSCentral` ✅

**Notes:** Document any issues or observations:
```
✅ App Service Plan created successfully
✅ Resource ID verified - all components correct
✅ Ready for App Service creation (Task 1.4)
```

---

## Task 1.4: Create Production Azure App Service (Backend)

### Step-by-Step Instructions

1. **Navigate to Create Web App:**
   - In Azure Portal, click **"Create a resource"**
   - Search for **"Web App"**
   - Click **"Web App"** → **"Create"**

2. **Basics Tab:**
   - **Subscription:** TraccEmsSubscription
   - **Resource Group:** `TraccEms-Prod-USCentral`
   - **Name:** `TraccEms-Prod-Backend` (must be globally unique)
   - **Publish:** `Code`
   - **Runtime stack:** `Node 24 LTS` (or latest Node.js LTS)
   - **Operating System:** `Linux`
   - **Region:** `Central US`
   - **App Service Plan:** Select the plan created in Task 1.3
   - Click **"Next: Deployment >"**

3. **Deployment Tab:**
   - **Continuous deployment:** `Enable` (optional, we'll use GitHub Actions)
   - **GitHub Actions:** Can be configured later
   - Click **"Next: Networking >"**

4. **Networking Tab:**
   - Leave defaults for now (can configure later)
   - Click **"Next: Monitoring >"**

5. **Monitoring Tab:**
   - **Enable Application Insights:** `Yes` (recommended for production)
   - **Application Insights:** Create new or use existing
   - Click **"Next: Tags >"**

6. **Tags Tab (Optional):**
   - Add tags if desired (e.g., Environment: Production)
   - Click **"Review + create"**

7. **Review and Create:**
   - Review all settings
   - Click **"Create"**

8. **Wait for Creation:**
   - Wait for App Service to be created (usually 2-3 minutes)
   - Click **"Go to resource"** when done

9. **Get Publish Profile:**
   - **Option 1 (Portal - Try First):**
     - In the App Service resource, go to **"Get publish profile"** (or **"Overview"** → **"Get publish profile"**)
     - **Note:** You may see a message "Basic authentication is disabled" - this is fine and expected
     - Click **"Download publish profile"** button
     - The `.PublishSettings` file should download (it's an XML file)
   
   - **Option 2 (Azure CLI - If Portal Doesn't Work):**
     - Open your terminal
     - Authenticate if needed: `az login --tenant "935047c0-e002-469e-933b-79d6958e01db"`
     - Run: `az webapp deployment list-publishing-profiles --name TraccEms-Prod-Backend --resource-group TraccEms-Prod-USCentral --xml > TraccEms-Prod-Backend.publishsettings`
     - This will save the publish profile to a file
   
   - **Save this file securely:** You'll need to copy its contents to GitHub Secrets as `AZURE_WEBAPP_PROD_PUBLISH_PROFILE`

### Verification
- [x] App Service `TraccEms-Prod-Backend` created ✅
- [x] Resource group: `TraccEms-Prod-USCentral` ✅
- [x] Region: `Central US` ✅
- [x] Runtime: Node.js 24 LTS ✅
- [x] App Service Plan selected ✅
- [x] Publish profile downloaded ✅

**Resource ID:** `/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourcegroups/TraccEms-Prod-USCentral/providers/Microsoft.Web/sites/TraccEms-Prod-Backend`

**Publish Profile File:** `TraccEms-Prod-Backend.publishsettings` ✅ (saved in project root)

**App Service URL:** `https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net`

**Application Insights Warning:** ⚠️ Code-less monitoring not supported with current configuration. This is expected and not a blocker. Application Insights can be configured later using the SDK if needed.

**Publish Profile Note:** If you see "Basic authentication is disabled" message, this is expected. The publish profile can still be downloaded - Azure uses deployment credentials instead of basic auth.

**Notes:** Document any issues or observations:
```
✅ App Service created successfully
⚠️ Application Insights code-less monitoring warning received (expected, not a blocker)
⚠️ "Basic authentication is disabled" message when downloading publish profile (expected, not a blocker)
⚠️ Need to download publish profile from "Get publish profile" in Azure Portal
```

---

## Task 1.5: Create Production PostgreSQL Database

### Step-by-Step Instructions

1. **Navigate to Create PostgreSQL:**
   - In Azure Portal, click **"Create a resource"**
   - Search for **"Azure Database for PostgreSQL flexible server"**
   - Click **"Azure Database for PostgreSQL flexible server"** → **"Create"**

2. **Basics Tab:**
   - **Subscription:** TraccEmsSubscription
   - **Resource Group:** `TraccEms-Prod-USCentral`
   - **Server name:** `traccems-prod-pgsql` (must be globally unique)
   - **Region:** `Central US`
   - **PostgreSQL version:** `17` ✅ (match dev version: traccems-dev-pgsql is running PostgreSQL 17)
   - **Workload type:** `Development` or `Production` (select Production)
   - **Compute + storage:** 
     - **Recommended:** `Burstable B1ms` (1 vCore, 2GB RAM) for starting
     - **For production:** Consider `General Purpose` tier if higher performance needed
   - Click **"Next: Networking >"**

3. **Networking Tab:**
   - **Connectivity method:** `Public access (allowed IP addresses)`
   - **Firewall rules:**
     - **Allow Azure services and resources to access this server:** `Yes` ✅ (IMPORTANT)
     - **Add current client IP address:** Click this button
     - We'll add production App Service IP later
   - Click **"Next: Security >"**

4. **Security Tab:**
   - **Admin username:** `traccems_admin` (or your preferred admin username)
   - **Password:** Create a strong password (save this securely!)
   - **Confirm password:** Re-enter password
   - **PostgreSQL authentication:** Leave default
   - **Data encryption:** `Service-managed key` ✅ (Recommended - Azure manages keys automatically)
   - **Note:** Customer-managed key can be configured later if specific compliance requirements arise
   - Click **"Next: Additional settings >"**

5. **Additional Settings Tab:**
   - **Backup retention:** `7 days` (default, can increase later)
   - **Geo-redundant backup:** `No` (can enable later if needed)
   - **High availability:** `Disabled` (can enable later if needed)
   - Click **"Next: Tags >"**

6. **Tags Tab (Optional):**
   - Add tags if desired
   - Click **"Review + create"**

7. **Review and Create:**
   - Review all settings, especially:
     - Server name: `traccems-prod-pgsql`
     - Admin username and password (save these!)
     - Firewall: Allow Azure services enabled
   - Click **"Create"**

8. **Wait for Creation:**
   - Wait for database to be created (usually 3-5 minutes)
   - Click **"Go to resource"** when done

9. **Get Connection String:**
   - In the database resource, go to **"Connection strings"**
   - Copy the PostgreSQL connection string
   - Format: `postgresql://traccems_admin:[password]@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require`
   - **Save this connection string:** You'll need it for GitHub Secrets as `DATABASE_URL_PROD`

### Verification
- [x] Configuration reviewed ✅
- [x] PostgreSQL server `traccems-prod-pgsql` created ✅
- [x] Resource group: `TraccEms-Prod-USCentral` ✅
- [x] Region: `Central US` ✅
- [x] PostgreSQL version: `17` ✅ (matches dev)
- [x] Admin username: `traccems_admin` ✅
- [x] High availability: `Enabled` ✅ (Zone redundant - excellent for production!)
- [x] Compute tier: `General Purpose D4ds_v5` ✅ (4 vCores, 16 GiB RAM - good for production)
- [x] Storage: `128 GiB, P10 (500 IOPS)` ✅
- [x] Backup retention: `7 days` ✅
- [x] Microsoft Entra authentication: `chuck@traccems.com` ✅
- [x] Networking: Public access + Azure services allowed ✅ (Critical for App Service connection!)
- [x] Firewall rules: `1` ✅
- [x] Data encryption: `Service-managed key` ✅
- [ ] Password saved securely ⚠️ **IMPORTANT**
- [ ] Connection string copied (after creation)

**Configuration Summary:**
- **High Availability:** Enabled (Zone redundant) ✅ Excellent for production!
- **Compute:** General Purpose D4ds_v5 (4 vCores, 16 GiB RAM) ✅ Good production tier
- **Storage:** 128 GiB, P10 (500 IOPS) ✅
- **Storage Autogrow:** Not enabled (consider enabling for automatic growth)
- **Microsoft Entra Admin:** chuck@traccems.com ✅

**Admin Username:** `traccems_admin` ✅

**Resource ID:** `/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourceGroups/TraccEms-Prod-USCentral/providers/Microsoft.DBforPostgreSQL/flexibleServers/traccems-prod-pgsql` ✅

**Endpoint (FQDN):** `traccems-prod-pgsql.postgres.database.azure.com` ✅

**Connection String:** ✅ **CONFIGURED**

**Corrected Connection String (no spaces):**
```
postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require
```

**Important:** 
- ⚠️ **No space** between colon and password: `traccems_admin:TVmedic429!` ✅
- ✅ Connection string configured and ready
- 🔒 **Save this securely** - you'll need it for GitHub Secrets as `DATABASE_URL_PROD` in Phase 3

**Next Steps:**
- [x] Connection string configured ✅
- [ ] Proceed to Task 1.6: Configure Database Firewall

**Notes:** Document any issues or observations:
```
✅ Database created successfully!
✅ High availability enabled (zone redundant)
✅ Microsoft Entra authentication configured
✅ Azure services access enabled (critical for App Service)
✅ Resource ID confirmed
⚠️ Need to get connection string and configure firewall (Task 1.6)
```

---

## Task 1.6: Configure Database Firewall for Production App Service

### Step-by-Step Instructions

1. **Get Production App Service Outbound IPs:**
   - Navigate to `TraccEms-Prod-Backend` App Service
   - Go to **"Properties"** section
   - Find **"Outbound IP addresses"**
   - Copy all IP addresses listed (there may be multiple)

2. **Verify Firewall Rules (Already Configured):**
   - ✅ **"Allow Azure services"** is already enabled (Rule: `AllowAllAzureServicesAndResourcesWithinAzureIps` - 0.0.0.0)
   - ✅ This allows the App Service to connect automatically
   - ✅ Client IP rule exists for manual access

3. **Optional: Add Specific App Service IPs (For Explicit Control):**
   - **Note:** Not required since "Allow Azure services" covers this, but can be added for more explicit control
   - Navigate to `traccems-prod-pgsql` PostgreSQL server → **"Networking"** section
   - Click **"Add firewall rule"**
   - For each outbound IP (7 IPs listed above):
     - **Rule name:** `TraccEms-Prod-Backend-IP-[number]` (e.g., `TraccEms-Prod-Backend-IP-1`)
     - **Start IP address:** [IP address]
     - **End IP address:** [same IP address]
     - Click **"OK"**
   - Click **"Save"**
   - **Recommendation:** Skip this step - the current configuration is sufficient and more flexible

### Verification
- [x] Production App Service outbound IPs identified ✅ (7 current IPs listed above)
- [x] "Allow Azure services" enabled ✅ (Rule: AllowAllAzureServicesAndResourcesWithinAzureIps - 0.0.0.0)
- [x] Client IP rule exists ✅ (71.58.90.33 - for manual access)
- [ ] **Optional:** Add specific App Service outbound IPs for explicit control (not required since "Allow Azure services" covers this)

**Current Firewall Rules:**
- ✅ `AllowAllAzureServicesAndResourcesWithinAzureIps` (0.0.0.0) - Allows all Azure services ✅
- ✅ `ClientIPAddress_2025-12-26_12-36-46` (71.58.90.33) - Your current IP for manual access ✅

**Note:** The "Allow Azure services" rule (0.0.0.0) already allows the App Service to connect. Adding specific IPs is optional but provides more explicit control.

**Outbound IPs (Current - 7 IPs):** ✅
```
1. 20.106.6.62
2. 20.106.6.147
3. 20.106.6.148
4. 20.106.7.37
5. 20.109.192.161
6. 20.109.192.166
7. 20.118.48.0
```

**Note:** There are also "possible outbound IPs" (24 total), but the current 7 are sufficient. The "Allow Azure services" setting should cover most cases, but adding these specific IPs provides explicit control.

**Notes:** Document any issues or observations:
```
✅ Firewall already configured correctly
✅ "Allow Azure services" rule (0.0.0.0) enables App Service connection
✅ Client IP rule exists for manual database access
✅ No additional firewall rules needed - current configuration is sufficient
✅ Phase 1 complete!
```

---

## Phase 1 Summary Checklist

After completing all tasks, verify:

- [x] Resource Group `TraccEms-Prod-USCentral` created ✅
- [x] Static Web App `TraccEms-Prod-Frontend` created ✅
  - Resource ID: `/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourcegroups/TraccEms-Prod-USCentral/providers/Microsoft.Web/staticSites/TraccEms-Prod-Frontend`
- [x] App Service Plan created ✅
  - Name: `ASP-TraccEmsProdUSCentral`
  - Resource ID: `/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourcegroups/TraccEms-Prod-USCentral/providers/Microsoft.Web/serverFarms/ASP-TraccEmsProdUSCentral`
- [x] App Service `TraccEms-Prod-Backend` created ✅
  - Resource ID: `/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourcegroups/TraccEms-Prod-USCentral/providers/Microsoft.Web/sites/TraccEms-Prod-Backend`
  - URL: `https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net`
  - ⚠️ Application Insights code-less monitoring warning (expected, not a blocker)
  - ✅ Publish profile obtained: `TraccEms-Prod-Backend.publishsettings`
- [x] PostgreSQL Database `traccems-prod-pgsql` created ✅
  - Resource ID: `/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourceGroups/TraccEms-Prod-USCentral/providers/Microsoft.DBforPostgreSQL/flexibleServers/traccems-prod-pgsql`
  - High Availability: Enabled (Zone redundant)
  - Compute: General Purpose D4ds_v5 (4 vCores, 16 GiB RAM)
- [x] Database firewall configured ✅ (Task 1.6)
  - "Allow Azure services" enabled (0.0.0.0) - App Service can connect
  - Client IP rule exists for manual access
- [x] All deployment tokens/connection strings saved ✅
  - [x] Static Web App deployment token: ✅ **OBTAINED** (starts with: `6e26f747b51cd74712e27aef71bd61ae...`)
  - [x] App Service publish profile: ✅ **OBTAINED** (`TraccEms-Prod-Backend.publishsettings`)
  - [x] Database connection string: ✅ **CONFIGURED** (`postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require`)

---

## Next Steps

After Phase 1 is complete:
1. **Save all credentials securely:**
   - ✅ Deployment token for Static Web App
   - ✅ Publish profile for App Service
   - ✅ Database connection string
   - ✅ Database admin password

2. **Verify Database Connection Configuration (Before Phase 2):**
   - ✅ DATABASE_URL environment variable set in App Service ✅
   - ✅ Firewall configuration verified ✅
   - ⚠️ Full connection testing will be done after code deployment in Phase 3
   - See: `docs/reference/azure/phase1-database-connection-verification.md`

3. **Proceed to Phase 2:** Database Setup (after verification)
   - Initialize production database schema
   - Run Prisma migrations

4. **Proceed to Phase 3:** GitHub Actions Workflows
   - Create production workflows
   - Configure GitHub Secrets

---

## Troubleshooting

### Common Issues

**Issue:** Resource name already taken
- **Solution:** Add suffix like `-prod` or `-01` to make it unique

**Issue:** Cannot connect to database
- **Solution:** Verify firewall rules and "Allow Azure services" is enabled

**Issue:** Static Web App deployment fails
- **Solution:** Verify GitHub repository access and branch name (`develop`)

**Issue:** App Service creation fails
- **Solution:** Verify App Service Plan is created first and in same region

---

**Last Updated:** December 12, 2025  
**Status:** Ready for Implementation

