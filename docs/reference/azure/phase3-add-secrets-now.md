# Phase 3: Add GitHub Secrets - Step-by-Step
**Created:** December 26, 2025  
**Action Required:** Add three production secrets to GitHub

## Quick Start

1. **Go to GitHub Secrets:** `https://github.com/[YOUR_USERNAME]/[YOUR_REPO]/settings/secrets/actions`
2. **Add each secret below** (click "New repository secret" for each)
3. **Test workflows** after adding all secrets

---

## Secret 1: DATABASE_URL_PROD

**Name:** `DATABASE_URL_PROD` (exact, case-sensitive)

**Value:**
```
postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require
```

**Steps:**
1. Click "New repository secret"
2. Name: `DATABASE_URL_PROD`
3. Value: Paste the connection string above
4. Click "Add secret"

---

## Secret 2: AZURE_FRONTEND_PROD_API_TOKEN

**Name:** `AZURE_FRONTEND_PROD_API_TOKEN` (exact, case-sensitive)

**Value:**
```
6e26f747b51cd74712e27aef71bd61ae7688b0da517168d085166b4c8f9ec3e806-82126f99-98e0-4168-ad63-4aa620c8cc9a0102920033c02b10
```

**Steps:**
1. Click "New repository secret"
2. Name: `AZURE_FRONTEND_PROD_API_TOKEN`
3. Value: Paste the token above (entire string)
4. Click "Add secret"

---

## Secret 3: AZURE_WEBAPP_PROD_PUBLISH_PROFILE

**Name:** `AZURE_WEBAPP_PROD_PUBLISH_PROFILE` (exact, case-sensitive)

**Value:** Copy from file `TraccEms-Prod-Backend.publishsettings` in project root

**Steps:**
1. Open file: `TraccEms-Prod-Backend.publishsettings` (in project root)
2. Select ALL content (Ctrl+A / Cmd+A)
3. Copy entire XML content
4. Click "New repository secret"
5. Name: `AZURE_WEBAPP_PROD_PUBLISH_PROFILE`
6. Value: Paste entire XML content
7. Click "Add secret"

**Note:** The file contains XML with `<publishData>` tags. Copy everything.

---

## Verification

After adding all three secrets, verify they exist:

- [ ] `DATABASE_URL_PROD` ✅
- [ ] `AZURE_FRONTEND_PROD_API_TOKEN` ✅
- [ ] `AZURE_WEBAPP_PROD_PUBLISH_PROFILE` ✅

---

## Test Workflows

After adding secrets, test both workflows:

### Test Frontend Workflow

1. Go to: GitHub → Actions
2. Click: "production - Deploy Prod Frontend" workflow
3. Click: "Run workflow" button (right side)
4. Select: `develop` branch
5. Click: "Run workflow" (green button)
6. Watch the workflow run
7. Check for errors - if secrets are correct, it should proceed

### Test Backend Workflow

1. Go to: GitHub → Actions
2. Click: "production - Deploy Prod Backend" workflow
3. Click: "Run workflow" button (right side)
4. Select: `develop` branch
5. Click: "Run workflow" (green button)
6. Watch the workflow run
7. Check for errors - if secrets are correct, it should proceed

---

## Expected Results

**If secrets are correct:**
- ✅ Workflows will start running
- ✅ Frontend workflow will build and deploy
- ✅ Backend workflow will build, run migrations, and deploy

**If secrets are incorrect:**
- ❌ Workflow will fail with "Secret not found" error
- ❌ Check secret names (case-sensitive)
- ❌ Verify values were copied correctly

---

## Troubleshooting

**Secret not found:**
- Verify exact name (case-sensitive)
- Check you're in the correct repository
- Re-run workflow after adding secret

**Invalid publish profile:**
- Ensure entire XML was copied
- Check for extra spaces
- Re-copy from file

**Invalid token:**
- Ensure entire token string was copied
- Check for extra spaces or line breaks

---

**Ready to add secrets?** Follow the steps above, then test the workflows!

