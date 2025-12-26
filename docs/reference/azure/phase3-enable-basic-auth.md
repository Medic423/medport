# Phase 3: Enable Basic Authentication for Publish Profile Download
**Created:** December 26, 2025  
**Issue:** "Basic authentication is disabled" preventing publish profile download

## Solution: Enable Basic Authentication

### Step 1: Enable Basic Authentication in Azure Portal

1. **Go to Azure Portal:**
   - Navigate to: https://portal.azure.com
   - Find: `TraccEms-Prod-Backend` App Service

2. **Navigate to Authentication Settings:**
   - In the left menu, click: **"Authentication"** (under Settings)
   - Or: Go to **"Configuration"** → **"General settings"** → Scroll to **"Authentication"**

3. **Enable Basic Authentication:**
   - Find: **"Basic authentication"** setting
   - Toggle: **"On"** or **"Enabled"**
   - Click: **"Save"** (top of page)

4. **Alternative Path (if above doesn't work):**
   - Go to: **"Configuration"** → **"General settings"**
   - Find: **"Always On"** or **"Basic authentication"**
   - Enable it
   - Click: **"Save"**

### Step 2: Download Publish Profile

After enabling basic authentication:

1. **Refresh the page** (or navigate back to Overview)
2. **Click: "Get publish profile"** button
3. **File should download** with actual credentials

### Step 3: Alternative - Use Azure CLI with Proper Format

If Portal still doesn't work, we can extract credentials via Azure CLI:

```bash
# Get publish profile (will show REDACTED, but we can extract what we need)
az webapp deployment list-publishing-profiles \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --xml

# Or get just the Web Deploy profile
az webapp deployment list-publishing-profiles \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "[?publishMethod=='MSDeploy']" \
  --xml
```

However, Azure CLI will still show REDACTED values. The best solution is to enable basic authentication in Portal.

---

**Last Updated:** December 26, 2025

