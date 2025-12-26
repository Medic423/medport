# Phase 3: Get Fresh Publish Profile via Azure CLI
**Created:** December 26, 2025  
**Issue:** Publish profile has REDACTED values and needs to be refreshed

## Problem

The current publish profile file (`TraccEms-Prod-Backend.publishsettings`) contains `REDACTED` values instead of actual credentials, causing deployment failures.

## Solution: Download Fresh Publish Profile

### Option 1: Azure Portal (Recommended)

1. **Go to Azure Portal:**
   - Navigate to: https://portal.azure.com
   - Find: `TraccEms-Prod-Backend` App Service

2. **Download Publish Profile:**
   - Click: **"Get publish profile"** button (top menu bar)
   - Or: Go to **Overview** → Click **"Get publish profile"**
   - File will download automatically

3. **Copy Content:**
   - Open the downloaded `.PublishSettings` file
   - Select ALL content (Ctrl+A / Cmd+A)
   - Copy entire XML content

4. **Update GitHub Secret:**
   - Go to: `https://github.com/Medic423/medport/settings/secrets/actions`
   - Find: `AZURE_WEBAPP_PROD_PUBLISH_PROFILE`
   - Click: **Update** (pencil icon)
   - Delete old content
   - Paste: Entire XML content from fresh download
   - Click: **Update secret**

### Option 2: Azure CLI (If Portal Doesn't Work)

If the portal download doesn't work, use Azure CLI:

```bash
# Authenticate (if needed)
az login --tenant "935047c0-e002-469e-933b-79d6958e01db"

# Download fresh publish profile
az webapp deployment list-publishing-profiles \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --xml > TraccEms-Prod-Backend.publishsettings
```

Then:
1. Open the file: `TraccEms-Prod-Backend.publishsettings`
2. Copy entire XML content
3. Update GitHub secret as described above

## Verify Publish Profile Format

The publish profile should:
- ✅ Start with `<publishData>`
- ✅ End with `</publishData>`
- ✅ Contain actual credentials (NOT `REDACTED`)
- ✅ Have `userName` and `userPWD` attributes with real values
- ✅ Include `msdeploySite="TraccEms-Prod-Backend"`

## After Updating Secret

1. **Test Workflow:**
   - Go to: GitHub → Actions
   - Find: "production - Deploy Prod Backend"
   - Click: "Run workflow"
   - Select: `develop` branch
   - Click: "Run workflow"

2. **Expected Result:**
   - ✅ Deployment succeeds
   - ✅ No "publish profile is invalid" errors

---

**Last Updated:** December 26, 2025

