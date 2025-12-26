# Phase 3: Fix Publish Profile Issue
**Created:** December 26, 2025  
**Issue:** Backend deployment failing with "Publish profile is invalid"

## Problem

The backend workflow is failing with:
```
Deployment Failed, Error: Publish profile is invalid for app-name and slot-name provided.
Failed to set resource details: Failed to get app runtime OS {}
```

## Root Causes

1. **Publish Profile Has REDACTED Values:** The current publish profile file shows `REDACTED` instead of actual credentials
2. **Slot Name Issue:** For default production slot, we should omit `slot-name` parameter

## Solution

### Step 1: Download Fresh Publish Profile

1. **Go to Azure Portal:**
   - Navigate to: https://portal.azure.com
   - Find: `TraccEms-Prod-Backend` App Service

2. **Download Publish Profile:**
   - Click: **"Get publish profile"** button (top menu)
   - Or: Go to **Overview** → Click **"Get publish profile"**
   - File will download as: `TraccEms-Prod-Backend.PublishSettings`

3. **Copy Publish Profile Content:**
   - Open the downloaded `.PublishSettings` file
   - Select ALL content (Ctrl+A / Cmd+A)
   - Copy entire XML content

4. **Update GitHub Secret:**
   - Go to: `https://github.com/Medic423/medport/settings/secrets/actions`
   - Find: `AZURE_WEBAPP_PROD_PUBLISH_PROFILE`
   - Click: **Update** (pencil icon)
   - Paste: Entire XML content from fresh publish profile
   - Click: **Update secret**

### Step 2: Workflow Already Fixed

✅ The workflow has been updated to remove `slot-name` parameter for default production slot.

### Step 3: Test Deployment

After updating the secret:

1. Go to: GitHub → Actions
2. Find: "production - Deploy Prod Backend"
3. Click: "Run workflow"
4. Select: `develop` branch
5. Click: "Run workflow"

## Verification

**Success Indicators:**
- ✅ Workflow completes without errors
- ✅ Deployment step succeeds
- ✅ App Service shows new deployment in Azure Portal

**If Still Failing:**
- Verify publish profile XML is complete (includes `<publishData>` tags)
- Check for extra spaces or line breaks
- Ensure app-name matches exactly: `TraccEms-Prod-Backend`

---

**Last Updated:** December 26, 2025

