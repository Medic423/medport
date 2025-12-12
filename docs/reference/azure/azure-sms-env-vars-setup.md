# Azure SMS Environment Variables Setup
**Last Updated:** December 8, 2025

## Required Environment Variables for SMS

For SMS notifications to work on https://dev-swa.traccems.com/, these must be set in Azure App Service Configuration.

### Required Variables

1. **`AZURE_SMS_ENABLED`**
   - Value: `true`
   - Purpose: Feature flag to enable SMS sending

2. **`AZURE_COMMUNICATION_CONNECTION_STRING`**
   - Value: `endpoint=https://tracccomms.unitedstates.communication.azure.com/;accesskey=...`
   - Purpose: Azure Communication Services connection string

3. **`AZURE_COMMUNICATION_PHONE_NUMBER`** (Optional)
   - Value: `+18339675959`
   - Purpose: Sender phone number (may use Azure default if not set)

## How to Add to Azure App Service

1. **Go to Azure Portal:**
   - Navigate to: **App Services** → **TraccEms-Dev-Backend**

2. **Open Configuration:**
   - Click **Configuration** in the left menu
   - Or go to **Settings** → **Configuration**

3. **Add Application Settings:**
   - Click **+ New application setting**
   - Add each variable:
     - **Name:** `AZURE_SMS_ENABLED`
     - **Value:** `true`
     - Click **OK**
   
   - **Name:** `AZURE_COMMUNICATION_CONNECTION_STRING`
   - **Value:** `endpoint=https://tracccomms.unitedstates.communication.azure.com/;accesskey=YOUR_ACCESS_KEY_HERE`
   - Click **OK**

   - **Name:** `AZURE_COMMUNICATION_PHONE_NUMBER` (optional)
   - **Value:** `+18339675959`
   - Click **OK**

4. **Save Configuration:**
   - Click **Save** at the top
   - Azure will restart the app automatically

5. **Verify:**
   - Wait for restart to complete
   - Check Log stream for SMS initialization messages

## Connection String

**Note:** Connection string should be obtained from Azure Portal → Communication Services → Keys.
Format: `endpoint=https://[resource-name].unitedstates.communication.azure.com/;accesskey=[your-access-key]`

**Do not commit actual connection strings to git.**

## Phone Number

Sender phone number: `+18339675959`

## Verification

After adding variables and restarting, check logs for:
```
TCC_DEBUG: Azure Communication Services SMS service initialized successfully
```

Or test via API:
```
GET https://dev-swa.traccems.com/api/trips/sms-diagnostics
```

Should show SMS configuration status.

## Testing SMS

Once variables are set:

1. **Log in to:** https://dev-swa.traccems.com/
2. **Create a trip** with `notificationRadius` set (e.g., 150 miles)
3. **Check Azure Portal** → Communication Services → SMS logs
4. **Verify** agencies receive SMS messages

## Local Testing vs Azure Testing

**Azure (https://dev-swa.traccems.com/):**
- ✅ Backend deployed
- ✅ Database connected
- ⚠️ Need to configure SMS env vars in Azure
- ✅ Best for testing production-like SMS flow

**Local (localhost):**
- ✅ Uses `.env.local` for configuration
- ✅ Good for development/debugging
- ⚠️ May not have Azure SMS configured
- ⚠️ Would need to set up local Azure connection

**Recommendation:** Test SMS on Azure dev site after configuring environment variables.

