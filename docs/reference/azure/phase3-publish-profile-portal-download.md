# Phase 3: Download Publish Profile from Azure Portal
**Created:** December 26, 2025  
**Critical:** Must download from Portal, not CLI (CLI shows REDACTED values)

## Why Portal Download?

Azure CLI redacts sensitive values for security, showing `REDACTED` instead of actual credentials. The Portal download contains the real credentials needed for deployment.

## Step-by-Step Instructions

### Step 1: Navigate to App Service

1. **Go to Azure Portal:**
   - https://portal.azure.com

2. **Find Your App Service:**
   - Search for: `TraccEms-Prod-Backend`
   - Or navigate: Resource Groups → `TraccEms-Prod-USCentral` → `TraccEms-Prod-Backend`

### Step 2: Download Publish Profile

1. **Click "Get publish profile" button:**
   - Located in the top menu bar (next to "Stop", "Restart", etc.)
   - Or: Go to **Overview** section → Click **"Get publish profile"** button

2. **File Downloads:**
   - File name: `TraccEms-Prod-Backend.PublishSettings`
   - This is an XML file with actual credentials

### Step 3: Verify Publish Profile

**Open the downloaded file and verify:**

✅ **Should have:**
- Starts with `<publishData>`
- Contains `userName="[actual-username]"` (NOT `REDACTED`)
- Contains `userPWD="[actual-password]"` (NOT `REDACTED`)
- Includes `msdeploySite="TraccEms-Prod-Backend"`
- Ends with `</publishData>`

❌ **Should NOT have:**
- `REDACTED` values (if you see these, the file is wrong)
- Missing opening/closing tags
- Truncated content

### Step 4: Copy to GitHub Secret

1. **Open the `.PublishSettings` file:**
   - Use a text editor (VS Code, TextEdit, etc.)

2. **Select ALL content:**
   - Press: `Ctrl+A` (Windows/Linux) or `Cmd+A` (Mac)
   - Make sure you get everything from `<publishData>` to `</publishData>`

3. **Copy:**
   - Press: `Ctrl+C` (Windows/Linux) or `Cmd+C` (Mac)

4. **Go to GitHub Secrets:**
   - Navigate to: `https://github.com/Medic423/medport/settings/secrets/actions`

5. **Update Secret:**
   - Find: `AZURE_WEBAPP_PROD_PUBLISH_PROFILE`
   - Click: **Update** (pencil icon)
   - **Delete** all old content
   - **Paste** the entire XML content from Portal download
   - Click: **Update secret**

### Step 5: Test Deployment

After updating the secret:

1. Go to: GitHub → Actions
2. Find: "production - Deploy Prod Backend"
3. Click: "Run workflow"
4. Select: `develop` branch
5. Click: "Run workflow"

## Troubleshooting

### Still Getting "Publish profile is invalid"?

1. **Verify secret was updated:**
   - Check GitHub secret shows updated timestamp
   - Re-run workflow after updating

2. **Check for extra spaces:**
   - Make sure no extra spaces before `<publishData>` or after `</publishData>`
   - No line breaks at the beginning/end

3. **Verify app-name matches:**
   - Workflow uses: `TraccEms-Prod-Backend`
   - Publish profile should have: `msdeploySite="TraccEms-Prod-Backend"`

4. **Try downloading again:**
   - Sometimes publish profiles expire
   - Download a fresh one from Portal

### Portal Shows "Basic authentication is disabled"?

This is **normal and expected**. You can still download the publish profile - Azure uses deployment credentials instead of basic auth.

---

**Last Updated:** December 26, 2025

