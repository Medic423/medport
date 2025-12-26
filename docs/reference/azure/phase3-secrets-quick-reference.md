# Phase 3: GitHub Secrets Quick Reference
**Created:** December 26, 2025  
**Purpose:** Quick reference for adding production secrets to GitHub

## All Three Secrets Ready to Copy

### 1. DATABASE_URL_PROD

**Secret Name:** `DATABASE_URL_PROD`

**Value:**
```
postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require
```

---

### 2. AZURE_FRONTEND_PROD_API_TOKEN

**Secret Name:** `AZURE_FRONTEND_PROD_API_TOKEN`

**Value:**
```
6e26f747b51cd74712e27aef71bd61ae7688b0da517168d085166b4c8f9ec3e806-82126f99-98e0-4168-ad63-4aa620c8cc9a0102920033c02b10
```

---

### 3. AZURE_WEBAPP_PROD_PUBLISH_PROFILE

**Secret Name:** `AZURE_WEBAPP_PROD_PUBLISH_PROFILE`

**Value:** See `TraccEms-Prod-Backend.publishsettings` file in project root
- Open the file and copy the ENTIRE XML content
- Include all tags from `<publishData>` to `</publishData>`

---

## Steps to Add Secrets

1. Go to: `https://github.com/[YOUR_USERNAME]/[YOUR_REPO]/settings/secrets/actions`
2. Click "New repository secret" for each secret above
3. Use exact names (case-sensitive)
4. Paste values exactly as shown
5. Click "Add secret"

---

## After Adding Secrets

Test the workflows:
1. Go to: GitHub → Actions → Workflows
2. Select: "production - Deploy Prod Frontend"
3. Click: "Run workflow"
4. Select: `develop` branch
5. Click: "Run workflow"

Repeat for "production - Deploy Prod Backend" workflow.

---

**Last Updated:** December 26, 2025

