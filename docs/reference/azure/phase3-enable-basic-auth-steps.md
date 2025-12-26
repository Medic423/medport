# Phase 3: Enable Basic Authentication - Step by Step
**Created:** December 26, 2025  
**Issue:** Cannot download publish profile because "Basic authentication is disabled"

## Solution: Enable Basic Authentication

### Step 1: Navigate to Configuration

1. **Go to Azure Portal:**
   - https://portal.azure.com
   - Find: `TraccEms-Prod-Backend` App Service

2. **Open Configuration:**
   - In the left menu, click: **"Configuration"** (under Settings)

3. **Go to General Settings:**
   - Click: **"General settings"** tab (at the top)

### Step 2: Enable Basic Authentication

In the **General settings** tab, find these two settings:

1. **SCM Basic Auth Publishing Credentials:**
   - Toggle: **"On"** ✅

2. **FTP Basic Auth Publishing Credentials:**
   - Toggle: **"On"** ✅

3. **Save Changes:**
   - Click: **"Save"** button (top of page)
   - Wait for confirmation: "Configuration updated successfully"

### Step 3: Restart App Service

1. **Go to Overview:**
   - Click: **"Overview"** in the left menu

2. **Restart App Service:**
   - Click: **"Restart"** button (top menu)
   - Confirm restart
   - Wait for restart to complete (status shows "Running")

### Step 4: Download Publish Profile

After restart:

1. **Stay on Overview page** (or refresh if needed)

2. **Click "Get publish profile":**
   - Button is in the top menu bar
   - File should download: `TraccEms-Prod-Backend.PublishSettings`

3. **Verify Download:**
   - Open the downloaded file
   - Should contain actual credentials (NOT `REDACTED`)
   - Should have `userName="[actual-value]"` and `userPWD="[actual-value]"`

### Step 5: Update GitHub Secret

1. **Open the `.PublishSettings` file:**
   - Copy ALL content (from `<publishData>` to `</publishData>`)

2. **Update GitHub Secret:**
   - Go to: `https://github.com/Medic423/medport/settings/secrets/actions`
   - Find: `AZURE_WEBAPP_PROD_PUBLISH_PROFILE`
   - Click: **Update**
   - Paste: Entire XML content
   - Click: **Update secret**

### Step 6: Test Deployment

After updating the secret:

1. Go to: GitHub → Actions
2. Find: "production - Deploy Prod Backend"
3. Click: "Run workflow"
4. Select: `develop` branch
5. Click: "Run workflow"

---

## Quick Summary

1. Portal → App Service → **Configuration** → **General settings**
2. Enable: **SCM Basic Auth** ✅ and **FTP Basic Auth** ✅
3. **Save** changes
4. **Restart** App Service
5. **Download** publish profile
6. **Update** GitHub secret
7. **Test** workflow

---

**Last Updated:** December 26, 2025

