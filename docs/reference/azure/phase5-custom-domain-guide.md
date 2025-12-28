# Phase 5: Custom Domain Configuration - Implementation Guide
**Created:** December 26, 2025  
**Status:** Ready to Begin  
**Goal:** Configure custom domains for production frontend and backend

## Overview

Phase 5 involves configuring custom domains (`traccems.com` and `api.traccems.com`) for the production Azure resources. This includes:

1. Adding custom domains to Azure resources
2. Configuring DNS records on Namecheap
3. Waiting for SSL certificate provisioning
4. Updating frontend to use custom domain API URL

**Key Principle:** Azure automatically provisions free SSL certificates for custom domains. DNS propagation and certificate provisioning can take 1-24 hours.

---

## Prerequisites

- ✅ Phase 1 Complete: All Azure resources created
- ✅ Phase 2 Complete: Database schema initialized
- ✅ Phase 3 Complete: GitHub workflows and secrets configured
- ✅ Phase 4 Complete: Environment variables configured
- ✅ Backend deployed successfully (at least once)
- ✅ Frontend deployed successfully (at least once)
- ✅ Domain ownership verified (`traccems.com` on Namecheap)
- ✅ DNS access confirmed (Namecheap Advanced DNS)

---

## Current DNS Configuration (Namecheap)

**Current Records (December 12, 2025):**
```
A Record:        @ → 216.198.79.1 (TTL: Automatic) [UPDATE]
CNAME Record:    api → 492395b7c4732f5e.vercel-dns-017.com (TTL: Automatic) [UPDATE - OLD Vercel]
CNAME Record:    autodiscover → autodiscover.outlook.com (TTL: 60 min) [PRESERVE - Email]
CNAME Record:    dev → jolly-plant-07b71a110.3.azurestaticapps.net (TTL: Automatic) [KEEP - Dev]
CNAME Record:    dev-api → traccems-dev-backend-h4add2fpcegrc2bz.centralus-01.azurewebsites.net (TTL: Automatic) [KEEP - Dev]
MX Record:       @ → com.mail.protection.outlook.com (Priority: 0) (TTL: 60 min) [PRESERVE - Email]
```

**⚠️ CRITICAL - Records to Preserve:**
- ✅ `autodiscover` CNAME → autodiscover.outlook.com (Email autodiscover)
- ✅ `MX` record → com.mail.protection.outlook.com (Email hosting)
- ✅ `dev` CNAME → jolly-plant-07b71a110.3.azurestaticapps.net (Dev frontend)
- ✅ `dev-api` CNAME → traccems-dev-backend-h4add2fpcegrc2bz.centralus-01.azurewebsites.net (Dev backend)

**Records to Update:**
- ⚠️ `@` A Record → 216.198.79.1 (Replace with Azure Static Web App CNAME or A records)
- ⚠️ `api` CNAME → 492395b7c4732f5e.vercel-dns-017.com (Replace with Azure App Service CNAME)

---

## Task 5.1: Configure Custom Domain for Frontend (traccems.com)

**Status:** ✅ **COMPLETED** - December 28, 2025

### Step 1: Add Custom Domain in Azure Portal

**✅ COMPLETED** - Used Azure CLI instead of Portal

**Azure CLI Method:**
```bash
az staticwebapp hostname set --name TraccEms-Prod-Frontend \
  --resource-group TraccEms-Prod-USCentral \
  --hostname traccems.com \
  --validation-method dns-txt-token
```

**Result:**
- Domain added successfully
- Validation token generated: `_9g1yvvv79c834hco7rcljc0ldfm1okp`
- Status: `Validating` → `Ready`

**Technical Notes:**
- Azure CLI command: `az staticwebapp hostname set` with `--validation-method dns-txt-token` for root domains
- Default hostname: `witty-smoke-033c02b10.6.azurestaticapps.net`
- Validation token retrieved via: `az staticwebapp hostname show --hostname traccems.com --query "validationToken"`

### Step 2: Add DNS Validation Record (Temporary)

**✅ COMPLETED** - December 28, 2025

**Note:** This TXT record is only needed for domain validation. You can remove it after validation completes.

**Actual Values Used:**
- **Host:** `@` (root domain)
- **Value:** `_9g1yvvv79c834hco7rcljc0ldfm1okp`
- **TTL:** Automatic

**Verification:**
- TXT record verified via: `dig +short TXT traccems.com`
- DNS propagation: ~30 seconds
- Azure validation: ~5 minutes (status changed from "Validating" to "Ready")

**Technical Notes:**
- DNS validation completed successfully
- Azure automatically detected TXT record after DNS propagation
- Status monitored via: `az staticwebapp hostname list --query "[?domainName=='traccems.com']"`

### Step 3: Configure DNS Record for Frontend

**✅ COMPLETED** - December 28, 2025

**After validation completes**, Azure will provide DNS configuration instructions:

**Actual Configuration Used:**
- **Type:** CNAME Record
- **Host:** `@` (root domain)
- **Value:** `witty-smoke-033c02b10.6.azurestaticapps.net`
- **TTL:** Automatic

**Actions Taken:**
1. ✅ Deleted existing `@` A record (216.198.79.1)
2. ✅ Added new CNAME record pointing to Azure Static Web App hostname
3. ✅ Verified DNS propagation: `dig +short traccems.com CNAME`

**DNS Verification:**
- CNAME record visible in DNS: ~30 seconds after save
- DNS propagation confirmed via `dig` command
- Domain resolves correctly to Azure infrastructure

**Technical Notes:**
- Namecheap supports CNAME on root domain (uses ALIAS record internally)
- Azure provided CNAME option (not A records)
- DNS changes propagated quickly (~30 seconds)
- Dev environment (`dev.traccems.com`) unaffected by root domain changes

### Step 4: Wait for SSL Certificate Provisioning

**✅ COMPLETED** - December 28, 2025

**Certificate Details:**
- **Status:** Provisioned and valid
- **Subject:** `CN=traccems.com`
- **Issuer:** DigiCert (via Azure)
- **Valid From:** December 28, 2025
- **Valid Until:** April 14, 2026
- **Certificate Type:** Let's Encrypt (managed by Azure)

**Verification:**
- ✅ Domain accessible: `https://traccems.com` returns HTTP 200
- ✅ SSL certificate valid: Verified via `openssl s_client`
- ✅ Certificate automatically provisioned by Azure
- ✅ Status in Azure: `Ready`

**Technical Notes:**
- SSL certificate provisioned automatically after DNS configuration
- Certificate provisioning time: ~1 hour (faster than expected)
- Certificate verified via: `openssl s_client -connect traccems.com:443`
- Azure automatically renews certificates before expiration

### Step 5: Configure WWW Subdomain (Optional)

If you want `www.traccems.com` to also work:

1. **Add WWW Domain in Azure:**
   - Go to: Custom domains → **"+ Add"**
   - Enter: `www.traccems.com`
   - Validate using DNS TXT record (same process as root domain)

2. **Add DNS Record:**
   ```
   Type: CNAME
   Host: www
   Value: [Same Azure Static Web App hostname as root domain]
   TTL: Automatic
   ```

3. **Wait for SSL Certificate:**
   - Azure will provision SSL certificate for www subdomain
   - Usually faster than root domain (15 minutes - 2 hours)

---

## Task 5.2: Configure Custom Domain for Backend API (api.traccems.com)

**Status:** ⏳ **IN PROGRESS** - December 28, 2025
- ✅ Domain added and validated
- ✅ DNS configured
- ⏳ SSL certificate provisioning in progress

### Step 1: Add Custom Domain in Azure Portal

**✅ COMPLETED** - December 28, 2025

**Azure CLI Method:**
```bash
az webapp config hostname add --webapp-name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --hostname api.traccems.com
```

**Initial Result:**
- Command failed initially (TXT record not found)
- Required TXT record for validation: `asuid.api.traccems.com`

**TXT Record Added:**
- **Host:** `asuid.api` (creates `asuid.api.traccems.com`)
- **Value:** `f6a67d820a423c7ddc2cec1c3753ef1a620ebe5504b2a37a0a853451440769b7`
- **TTL:** Automatic

**After TXT Record Added:**
- ✅ Domain added successfully
- ✅ Status: `Verified`
- ✅ Default hostname: `traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net`

**Technical Notes:**
- App Service uses `asuid.[subdomain]` format for TXT validation
- Subdomain validation requires TXT record before adding custom domain
- Validation token retrieved from error message on first attempt

### Step 2: Configure DNS Record for Backend

**✅ COMPLETED** - December 28, 2025

**After validation**, Azure will provide DNS configuration:

**Actual Configuration Used:**
- **Type:** CNAME Record
- **Host:** `api`
- **Value:** `traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net`
- **TTL:** Automatic

**Actions Taken:**
1. ✅ Updated existing `api` CNAME record (was pointing to old Vercel DNS)
2. ✅ Changed value from `492395b7c4732f5e.vercel-dns-017.com` to Azure App Service hostname
3. ✅ Verified DNS propagation: `dig +short api.traccems.com CNAME`

**DNS Verification:**
- CNAME record updated successfully
- DNS propagation: ~30 seconds after save
- Domain resolves correctly to Azure App Service
- HTTP redirects to HTTPS (301 redirect)

**Technical Notes:**
- Updated existing CNAME record (did not delete/create new)
- Old Vercel CNAME: `492395b7c4732f5e.vercel-dns-017.com`
- New Azure CNAME: `traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net`
- DNS changes propagated quickly (~30 seconds)

### Step 3: Wait for SSL Certificate Provisioning

**⏳ IN PROGRESS** - December 28, 2025

**Current Status:**
- **SSL State:** `null` (provisioning in progress)
- **Domain Status:** `Verified`
- **DNS:** Configured and propagating correctly
- **HTTP Access:** Working (redirects to HTTPS)

**Monitoring:**
```bash
# Check SSL certificate status
az webapp config hostname list --webapp-name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "[?name=='api.traccems.com'].{hostname:name,sslState:sslState}" -o table

# Test domain accessibility
curl -I http://api.traccems.com/health
```

**Expected Timeline:**
- **Typical:** 15 minutes - 2 hours (subdomains usually faster than root domains)
- **Maximum:** Up to 24 hours (rare)
- **Current:** Provisioning started December 28, 2025 ~22:50 UTC

**Technical Notes:**
- Azure automatically provisions SSL certificates for custom domains
- Certificate provisioning requires:
  1. Domain validated (✅ Complete)
  2. DNS configured correctly (✅ Complete)
  3. Domain accessible via HTTP (✅ Complete - redirects to HTTPS)
- SSL certificate will be automatically renewed by Azure
- Once `sslState` changes from `null` to `SniEnabled`, certificate is ready

---

## Task 5.3: Update Frontend API Configuration

### Step 1: Update GitHub Actions Workflow

**Method 1: Update Workflow Environment Variable (Recommended)**

1. **Edit Workflow File:**
   - File: `.github/workflows/prod-fe.yaml`
   - Find: `Build React App` step
   - Update: `VITE_API_URL` environment variable

2. **Change:**
   ```yaml
   env:
     VITE_API_URL: 'https://api.traccems.com'  # Updated to custom domain
     NODE_ENV: 'production'
   ```

3. **Commit and Push:**
   ```bash
   git add .github/workflows/prod-fe.yaml
   git commit -m "feat: Update production frontend to use custom domain API URL"
   git push origin main
   ```

### Step 2: Update Code Fallback (Optional but Recommended)

**Update DEFAULT_PROD_URL in code as backup:**

1. **Edit File:**
   - File: `frontend/src/services/api.ts`
   - Find: `const DEFAULT_PROD_URL = ...`
   - Update to: `const DEFAULT_PROD_URL = 'https://api.traccems.com';`

2. **Commit:**
   ```bash
   git add frontend/src/services/api.ts
   git commit -m "feat: Update DEFAULT_PROD_URL to use custom domain"
   git push origin main
   ```

### Step 3: Redeploy Frontend

1. **Trigger Deployment:**
   - Go to: GitHub Actions → "production - Deploy Prod Frontend"
   - Click: **"Run workflow"**
   - Select: `main` branch (or `develop` if you merged there)
   - Click: **"Run workflow"**

2. **Wait for Deployment:**
   - Monitor workflow completion
   - Verify deployment succeeds

### Step 4: Verify Frontend Uses Custom Domain

1. **Test Frontend:**
   - Navigate to: `https://traccems.com`
   - Open browser DevTools → Console
   - Look for: `TCC_DEBUG: API_BASE_URL is set to: https://api.traccems.com`

2. **Test API Connection:**
   - Try logging in or making an API call
   - Verify requests go to `https://api.traccems.com`
   - Check Network tab to confirm API calls use custom domain

---

## Task 5.4: Update Backend CORS Configuration (If Needed)

If backend has CORS restrictions, update them to allow the custom domain:

1. **Check Backend CORS Settings:**
   - Go to: Azure Portal → `TraccEms-Prod-Backend` → Configuration
   - Look for: `CORS_ORIGIN` or `FRONTEND_URL` environment variables

2. **Update if Needed:**
   - **CORS_ORIGIN:** `https://traccems.com`
   - **FRONTEND_URL:** `https://traccems.com`
   - Save and restart App Service

---

## Verification Checklist

### Frontend Domain Verification

- [x] `traccems.com` resolves to Azure Static Web App ✅
- [x] `https://traccems.com` loads correctly ✅
- [x] SSL certificate is valid (green lock icon) ✅
- [ ] `www.traccems.com` works (if configured) - Not configured
- [ ] Frontend console shows: `API_BASE_URL is set to: https://api.traccems.com` - Pending Phase 5.3

### Backend Domain Verification

- [x] `api.traccems.com` resolves to Azure App Service ✅
- [ ] `https://api.traccems.com/health` returns `{"status":"ok"}` - Pending SSL certificate
- [ ] SSL certificate is valid - ⏳ Provisioning in progress
- [ ] Frontend can make API calls to `https://api.traccems.com` - Pending Phase 5.3

### DNS Verification

- [x] Root domain (`@`) points to Azure Static Web App ✅
- [x] `api` subdomain points to Azure App Service ✅
- [x] Email records (MX, autodiscover) still work ✅ (Preserved)
- [x] Dev records (dev, dev-api) still work ✅ (Preserved)

---

## Troubleshooting

### Issue: Domain Validation Fails

**Symptoms:**
- Azure shows "Validation failed" or "Pending" status
- TXT record not found

**Solution:**
1. Verify TXT record was added correctly in Namecheap
2. Check TTL - use lower TTL (60 min) for faster propagation
3. Wait 15-30 minutes for DNS propagation
4. Use online DNS checker to verify TXT record is visible
5. Try removing and re-adding the domain in Azure

### Issue: SSL Certificate Not Provisioning

**Symptoms:**
- Domain validated but certificate stuck on "Provisioning..."
- Certificate status shows error

**Solution:**
1. Verify DNS records are correct and propagated
2. Check domain is accessible via HTTP (certificate provisioning requires HTTP access)
3. Wait longer (can take up to 24 hours)
4. Try removing and re-adding the domain
5. Check Azure Portal → Static Web App/App Service → Custom domains for error messages

### Issue: DNS Propagation Slow

**Symptoms:**
- DNS changes not visible after several hours
- Domain still resolves to old location

**Solution:**
1. Check DNS propagation using multiple tools:
   - `dig traccems.com`
   - `nslookup traccems.com`
   - Online DNS checker (whatsmydns.net)
2. Verify DNS records are correct in Namecheap
3. Lower TTL temporarily (60 min) for faster updates
4. Some DNS changes can take up to 24 hours

### Issue: Frontend Still Using Old API URL

**Symptoms:**
- Browser console shows old Azure URL instead of `api.traccems.com`

**Solution:**
1. Verify workflow was updated with new `VITE_API_URL`
2. Verify frontend was redeployed after workflow update
3. Clear browser cache and hard refresh (Cmd+Shift+R)
4. Check browser console for actual API calls (Network tab)

### Issue: CORS Errors After Custom Domain

**Symptoms:**
- Browser shows CORS errors when frontend tries to call backend
- API calls fail with CORS policy errors

**Solution:**
1. Update backend `CORS_ORIGIN` or `FRONTEND_URL` environment variable
2. Set to: `https://traccems.com`
3. Restart App Service after updating environment variables
4. Verify CORS headers in browser Network tab

---

## Important Notes

### DNS Record Types

- **Root Domain (`@`):** Some DNS providers don't support CNAME on root domain
  - Azure will provide A records if CNAME not supported
  - Namecheap supports CNAME on root domain (ALIAS record)
  
- **Subdomains (`api`, `www`):** Always use CNAME records
  - Simpler configuration
  - Easier to update if Azure hostname changes

### SSL Certificates

- **Automatic Provisioning:** Azure automatically provisions free SSL certificates
- **Auto-Renewal:** Certificates are automatically renewed by Azure
- **No Manual Action Required:** Once configured, SSL is fully managed
- **Certificate Type:** Azure uses Let's Encrypt certificates (free, trusted)

### DNS Propagation Times

- **Typical:** 1-4 hours
- **Maximum:** Up to 24 hours (rare)
- **Faster Updates:** Lower TTL (60 min) helps, but doesn't guarantee faster propagation
- **Check Propagation:** Use multiple DNS checkers to verify

### Email Records

**⚠️ CRITICAL:** Do NOT modify or delete:
- `MX` record → com.mail.protection.outlook.com (Email hosting)
- `autodiscover` CNAME → autodiscover.outlook.com (Email autodiscover)

These must remain unchanged for email functionality.

### Dev Environment Isolation

**✅ Preserved:** Dev environment DNS records remain unchanged:
- `dev` CNAME → jolly-plant-07b71a110.3.azurestaticapps.net
- `dev-api` CNAME → traccems-dev-backend-h4add2fpcegrc2bz.centralus-01.azurewebsites.net

Production custom domain configuration does NOT affect dev environment.

---

## Expected Timeline

1. **Domain Validation:** 5-15 minutes (after adding TXT record)
2. **DNS Propagation:** 1-24 hours (usually 1-4 hours)
3. **SSL Certificate Provisioning:** 15 minutes - 24 hours (usually 1-4 hours)
4. **Total Time:** Plan for 2-4 hours, but allow up to 24 hours for full completion

---

## Next Steps After Phase 5

Once custom domains are configured and verified:

1. ✅ **Phase 6:** DNS Configuration (already done as part of Phase 5)
2. ✅ **Phase 7:** SSL Certificate Configuration (automatic, just verify)
3. **Phase 8:** Testing and Verification
4. **Phase 9:** Monitoring and Logging
5. **Phase 10:** Documentation and Handoff

---

## Quick Reference

### Azure Resources

- **Frontend:** `TraccEms-Prod-Frontend` (Static Web App)
- **Backend:** `TraccEms-Prod-Backend` (App Service)
- **Resource Group:** `TraccEms-Prod-USCentral`

### Custom Domains

- **Frontend:** `traccems.com` (and `www.traccems.com` if configured)
- **Backend:** `api.traccems.com`

### DNS Provider

- **Provider:** Namecheap
- **URL:** https://ap.www.namecheap.com
- **Location:** Domain List → traccems.com → Advanced DNS

### Verification Commands

```bash
# Check DNS resolution
dig traccems.com
dig api.traccems.com

# Test SSL certificates
curl -I https://traccems.com
curl -I https://api.traccems.com/health

# Check DNS propagation (online)
# Use: https://www.whatsmydns.net/
```

---

**Last Updated:** December 28, 2025  
**Status:** In Progress - Phase 5.1 Complete, Phase 5.2 In Progress (SSL provisioning), Phase 5.3 Pending

## Implementation Progress Summary

### Phase 5.1: Frontend Domain (traccems.com) ✅ COMPLETE
- **Completed:** December 28, 2025
- Custom domain added via Azure CLI
- DNS validation TXT record added and verified
- CNAME record configured (replaced A record)
- SSL certificate provisioned and valid
- Domain accessible: `https://traccems.com`

### Phase 5.2: Backend Domain (api.traccems.com) ⏳ IN PROGRESS
- **Started:** December 28, 2025
- Custom domain added via Azure CLI
- DNS validation TXT record added (`asuid.api`)
- CNAME record updated (replaced Vercel DNS)
- SSL certificate provisioning in progress (expected completion: 15 min - 24 hours)

### Phase 5.3: Update Frontend API Configuration ⏳ PENDING
- Update GitHub Actions workflow (`VITE_API_URL`)
- Update frontend code (`DEFAULT_PROD_URL`)
- Redeploy frontend
- Verify frontend uses custom domain API URL

## Technical Notes

### Azure CLI Commands Used

**Frontend (Static Web App):**
```bash
# Add custom domain
az staticwebapp hostname set --name TraccEms-Prod-Frontend \
  --resource-group TraccEms-Prod-USCentral \
  --hostname traccems.com \
  --validation-method dns-txt-token

# Check status
az staticwebapp hostname list --name TraccEms-Prod-Frontend \
  --resource-group TraccEms-Prod-USCentral
```

**Backend (App Service):**
```bash
# Add custom domain
az webapp config hostname add --webapp-name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --hostname api.traccems.com

# Check status
az webapp config hostname list --webapp-name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral
```

### DNS Records Configured

**Namecheap DNS Records:**
- ✅ `@` CNAME → `witty-smoke-033c02b10.6.azurestaticapps.net` (Frontend)
- ✅ `api` CNAME → `traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net` (Backend)
- ✅ `asuid.api` TXT → `f6a67d820a423c7ddc2cec1c3753ef1a620ebe5504b2a37a0a853451440769b7` (Validation - can remove after SSL provisioned)
- ✅ `dev` CNAME → `jolly-plant-07b71a110.3.azurestaticapps.net` (Preserved - Dev)
- ✅ `dev-api` CNAME → `traccems-dev-backend-h4add2fpcegrc2bz.centralus-01.azurewebsites.net` (Preserved - Dev)
- ✅ `autodiscover` CNAME → `autodiscover.outlook.com` (Preserved - Email)
- ✅ `MX` → `com.mail.protection.outlook.com` (Preserved - Email)

### Key Learnings

1. **Azure CLI vs Portal:** Azure CLI works well for custom domain configuration, providing immediate feedback and easier automation
2. **Validation Methods:** 
   - Static Web Apps: Use `dns-txt-token` for root domains
   - App Services: Use `asuid.[subdomain]` TXT record format for subdomains
3. **DNS Propagation:** Changes propagated quickly (~30 seconds) in Namecheap
4. **SSL Provisioning:** 
   - Frontend: Provisioned quickly (~1 hour)
   - Backend: Still in progress (expected 15 min - 24 hours)
5. **Dev Environment:** Root domain changes did not affect dev subdomains (as expected)

