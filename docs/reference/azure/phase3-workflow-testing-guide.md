# Phase 3: Workflow Testing Guide
**Created:** December 26, 2025  
**Purpose:** Test production workflows after adding GitHub secrets

## Prerequisites

- ✅ All three GitHub secrets added:
  - `DATABASE_URL_PROD`
  - `AZURE_WEBAPP_PROD_PUBLISH_PROFILE`
  - `AZURE_FRONTEND_PROD_API_TOKEN`

---

## Test 1: Frontend Workflow

### Steps

1. **Navigate to GitHub Actions:**
   - Go to: `https://github.com/[YOUR_USERNAME]/[YOUR_REPO]/actions`

2. **Find Production Frontend Workflow:**
   - Look for: "production - Deploy Prod Frontend"
   - Click on the workflow name

3. **Trigger Workflow:**
   - Click: "Run workflow" button (top right)
   - Select: `develop` branch
   - Click: "Run workflow" (green button)

4. **Monitor Execution:**
   - Watch the workflow run in real-time
   - Expand each step to see detailed logs
   - Look for any errors

### Expected Results

✅ **Success Indicators:**
- Workflow starts immediately
- "Checkout repository" step completes
- "Setup Node.js environment" completes
- "Install dependencies" completes
- "Build React App" completes
- "Deploy to Azure Static Web Apps" completes
- Workflow shows green checkmark ✅

❌ **Failure Indicators:**
- Red X mark ❌
- Error message about missing secrets
- Build failures
- Deployment failures

### What to Check

- **Secret Errors:** If you see "Secret not found" → Check secret names
- **Build Errors:** If build fails → Check workflow logs for specific errors
- **Deployment Errors:** If deployment fails → Check token validity

---

## Test 2: Backend Workflow

### Steps

1. **Navigate to GitHub Actions:**
   - Go to: `https://github.com/[YOUR_USERNAME]/[YOUR_REPO]/actions`

2. **Find Production Backend Workflow:**
   - Look for: "production - Deploy Prod Backend"
   - Click on the workflow name

3. **Trigger Workflow:**
   - Click: "Run workflow" button (top right)
   - Select: `develop` branch
   - Click: "Run workflow" (green button)

4. **Monitor Execution:**
   - Watch the workflow run in real-time
   - Expand each step to see detailed logs
   - **Pay special attention to:**
     - Database migrations step
     - Deployment step

### Expected Results

✅ **Success Indicators:**
- Workflow starts immediately
- "Checkout repository" step completes
- "Setup Node.js environment" completes
- "Install dependencies" completes
- "Generate Prisma Models" completes
- "Run Database Migrations" completes (may take a minute)
- "Build application" completes
- "Deploy to Azure Web App" completes
- Workflow shows green checkmark ✅

❌ **Failure Indicators:**
- Red X mark ❌
- Error message about missing secrets
- Database connection errors
- Migration failures
- Build failures
- Deployment failures

### What to Check

- **Secret Errors:** If you see "Secret not found" → Check secret names
- **Database Errors:** If migrations fail → Check `DATABASE_URL_PROD` format
- **Build Errors:** If build fails → Check workflow logs for specific errors
- **Deployment Errors:** If deployment fails → Check publish profile validity

---

## Troubleshooting

### Issue: Secret Not Found

**Error:**
```
Error: Input required and not supplied: DATABASE_URL_PROD
```

**Solution:**
1. Verify secret name is exactly correct (case-sensitive)
2. Check you're in the correct repository
3. Re-run workflow after verifying secret exists

### Issue: Database Connection Failed

**Error:**
```
Error: Can't reach database server
```

**Solution:**
1. Verify `DATABASE_URL_PROD` format is correct
2. Check database firewall allows Azure services
3. Verify database server is running

### Issue: Invalid Publish Profile

**Error:**
```
Error: Invalid publish profile
```

**Solution:**
1. Verify entire XML was copied (including tags)
2. Check for extra spaces or line breaks
3. Re-copy from `TraccEms-Prod-Backend.publishsettings` file

### Issue: Invalid Deployment Token

**Error:**
```
Error: Invalid deployment token
```

**Solution:**
1. Verify entire token string was copied
2. Check for extra spaces or line breaks
3. Regenerate token in Azure Portal if needed

---

## Verification After Successful Deployment

### Frontend Verification

After frontend workflow succeeds:

1. **Check Azure Portal:**
   - Go to: Azure Portal → Static Web App → `TraccEms-Prod-Frontend`
   - Check: Deployment history shows new deployment
   - Check: Status shows "Running"

2. **Check Deployment URL:**
   - Default URL: `https://[app-name].azurestaticapps.net`
   - Should be accessible (may show default page if no custom domain)

### Backend Verification

After backend workflow succeeds:

1. **Check Azure Portal:**
   - Go to: Azure Portal → App Service → `TraccEms-Prod-Backend`
   - Check: Deployment Center shows new deployment
   - Check: Status shows "Running"

2. **Check Deployment URL:**
   - URL: `https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net`
   - Test: `https://traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net/health`
   - Should return health check response

3. **Check Database Migrations:**
   - Verify migrations ran successfully in workflow logs
   - Check for "All migrations have been successfully applied" message

---

## Next Steps After Testing

Once both workflows succeed:

1. ✅ Workflows are configured correctly
2. ✅ Secrets are working
3. ✅ Ready for Phase 4: Environment Variables Configuration
4. ✅ Ready for Phase 5: Custom Domain Configuration

---

**Last Updated:** December 26, 2025  
**Status:** Ready for Testing

