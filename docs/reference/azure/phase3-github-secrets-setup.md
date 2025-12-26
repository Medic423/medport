# Phase 3: GitHub Secrets Configuration Guide
**Created:** December 26, 2025  
**Purpose:** Step-by-step guide for adding production secrets to GitHub

## Overview

This guide walks you through adding the three required production secrets to your GitHub repository. These secrets are separate from your dev secrets and will be used exclusively by the production workflows.

---

## Prerequisites

- ✅ Phase 1 Complete: All Azure resources created
- ✅ Deployment credentials obtained:
  - Frontend deployment token
  - Backend publish profile
  - Database connection string

---

## Step 1: Access GitHub Secrets

1. **Navigate to GitHub Repository:**
   - Go to: `https://github.com/[YOUR_USERNAME]/[YOUR_REPO]`
   - Or use your repository URL

2. **Open Secrets Settings:**
   - Click: **Settings** (top menu)
   - Click: **Secrets and variables** → **Actions**
   - Or navigate directly to: `https://github.com/[YOUR_USERNAME]/[YOUR_REPO]/settings/secrets/actions`

---

## Step 2: Add Production Database Secret

### Secret Name: `DATABASE_URL_PROD`

1. **Click:** "New repository secret" button

2. **Name:** `DATABASE_URL_PROD`
   - ⚠️ **Important:** Use exact name (case-sensitive)

3. **Value:** Production database connection string
   ```
   postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require
   ```
   - **Source:** From Phase 1, Task 1.5
   - **Note:** This is the production database (different from dev `DATABASE_URL`)

4. **Click:** "Add secret"

---

## Step 3: Add Production Backend Publish Profile

### Secret Name: `AZURE_WEBAPP_PROD_PUBLISH_PROFILE`

1. **Click:** "New repository secret" button

2. **Name:** `AZURE_WEBAPP_PROD_PUBLISH_PROFILE`
   - ⚠️ **Important:** Use exact name (case-sensitive)

3. **Value:** XML content from publish profile file
   - **File Location:** `TraccEms-Prod-Backend.publishsettings` (in project root)
   - **How to Get Value:**
     ```bash
     # From project root, view the file:
     cat TraccEms-Prod-Backend.publishsettings
     ```
   - **Or:** Open the file in a text editor and copy entire XML content
   - **Note:** Copy the ENTIRE XML content, including `<publishData>` tags

4. **Click:** "Add secret"

---

## Step 4: Add Production Frontend Deployment Token

### Secret Name: `AZURE_FRONTEND_PROD_API_TOKEN`

1. **Click:** "New repository secret" button

2. **Name:** `AZURE_FRONTEND_PROD_API_TOKEN`
   - ⚠️ **Important:** Use exact name (case-sensitive)

3. **Value:** Deployment token string
   ```
   6e26f747b51cd74712e27aef71bd61ae7688b0da517168d085166b4c8f9ec3e806-82126f99-98e0-4168-ad63-4aa620c8cc9a0102920033c02b10
   ```
   - **Source:** From Phase 1, Task 1.2
   - **Note:** Token starts with `6e26f747b51cd74712e27aef71bd61ae...`
   - **Full Token:** Copy the complete token string (it's long)

4. **Click:** "Add secret"

---

## Verification Checklist

After adding all secrets, verify:

- [ ] `DATABASE_URL_PROD` - Production database connection string
- [ ] `AZURE_WEBAPP_PROD_PUBLISH_PROFILE` - Production backend publish profile (XML)
- [ ] `AZURE_FRONTEND_PROD_API_TOKEN` - Production frontend deployment token

**Note:** Your existing dev secrets should remain unchanged:
- `DATABASE_URL` (dev)
- `AZURE_WEBAPP_PUBLISH_PROFILE` (dev)
- `AZURE_FRONTEND_API_TOKEN` (dev)
- `PAT_TOKEN` (shared)

---

## Testing Secrets

After adding secrets, you can test them by:

1. **Trigger Production Workflow:**
   - Go to: GitHub → Actions → Workflows
   - Select: "production - Deploy Prod Frontend" or "production - Deploy Prod Backend"
   - Click: "Run workflow"
   - Select: `develop` branch
   - Click: "Run workflow"

2. **Check Workflow Logs:**
   - If secrets are correct, workflow will proceed
   - If secrets are missing/incorrect, workflow will fail with "Secret not found" error

---

## Troubleshooting

### Issue: Secret Not Found Error

**Error Message:**
```
Error: Input required and not supplied: DATABASE_URL_PROD
```

**Solution:**
1. Verify secret name is exactly correct (case-sensitive)
2. Check that secret was added to correct repository
3. Re-run workflow after adding/updating secret

### Issue: Invalid Publish Profile

**Error Message:**
```
Error: Invalid publish profile
```

**Solution:**
1. Verify entire XML content was copied (including opening/closing tags)
2. Check for extra spaces or line breaks
3. Re-download publish profile from Azure Portal if needed
4. Update secret with new publish profile

### Issue: Invalid Deployment Token

**Error Message:**
```
Error: Invalid deployment token
```

**Solution:**
1. Verify token was copied completely (it's a long string)
2. Check for extra spaces or line breaks
3. Regenerate token in Azure Portal if needed:
   - Azure Portal → Static Web App → Deployment → Manage deployment token
4. Update secret with new token

---

## Security Notes

⚠️ **Important:**
- Never commit secrets to git
- Never share secrets publicly
- Rotate secrets if compromised
- Use separate secrets for dev and production
- Keep production secrets secure

---

**Last Updated:** December 26, 2025  
**Status:** Ready for Configuration

