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

### Step 1: Add Custom Domain in Azure Portal

1. **Navigate to Static Web App:**
   - Go to: Azure Portal → `TraccEms-Prod-Frontend` Static Web App
   - Click: **"Custom domains"** in the left menu

2. **Add Custom Domain:**
   - Click: **"+ Add"** button
   - Enter domain: `traccems.com`
   - Click: **"Next"**

3. **Choose Validation Method:**
   - **Recommended:** DNS validation (most reliable)
   - Azure will provide a TXT record to add to Namecheap DNS
   - Copy the TXT record value (you'll need it in Step 2)

4. **Review and Add:**
   - Review the domain configuration
   - Click: **"Add"** to start the validation process

### Step 2: Add DNS Validation Record (Temporary)

**Note:** This TXT record is only needed for domain validation. You can remove it after validation completes.

1. **Go to Namecheap:**
   - Navigate to: https://ap.www.namecheap.com
   - Domain List → `traccems.com` → Advanced DNS

2. **Add TXT Record:**
   - Click: **"+ Add New Record"**
   - **Type:** `TXT Record`
   - **Host:** `@` (or leave blank for root domain)
   - **Value:** [Paste the TXT record value from Azure]
   - **TTL:** Automatic (or 60 min)
   - Click: **"Save"** (checkmark icon)

3. **Wait for Validation:**
   - Return to Azure Portal → Custom domains
   - Status should change from "Pending" to "Validated" (may take 5-15 minutes)
   - **Do not proceed until validation is complete**

### Step 3: Configure DNS Record for Frontend

**After validation completes**, Azure will provide DNS configuration instructions:

1. **Check Azure Portal:**
   - Go to: Custom domains → `traccems.com`
   - Look for: **"DNS Configuration"** section
   - Azure will show one of:
     - **CNAME record** (if supported by your DNS provider)
     - **A records** (if CNAME not supported on root domain)

2. **Update Namecheap DNS:**

   **Option A: If Azure provides CNAME (preferred):**
   ```
   Type: CNAME
   Host: @
   Value: [Azure Static Web App hostname, e.g., witty-smoke-033c02b10.6.azurestaticapps.net]
   TTL: Automatic
   ```
   - **Action:** Delete existing `@` A record (216.198.79.1)
   - **Action:** Add new CNAME record with Azure hostname

   **Option B: If Azure provides A records (if CNAME not supported):**
   ```
   Type: A
   Host: @
   Value: [IP Address 1]
   TTL: Automatic
   
   Type: A
   Host: @
   Value: [IP Address 2]
   TTL: Automatic
   
   (Azure may provide 2-4 A records)
   ```
   - **Action:** Delete existing `@` A record (216.198.79.1)
   - **Action:** Add new A records with Azure IP addresses

3. **Save DNS Changes:**
   - Click: **"Save"** (checkmark icon) in Namecheap
   - Wait for DNS propagation (typically 1-24 hours, usually faster)

### Step 4: Wait for SSL Certificate Provisioning

1. **Monitor Certificate Status:**
   - Go to: Azure Portal → Custom domains → `traccems.com`
   - Status will show: "Certificate provisioning..." → "Ready"
   - **This can take 1-24 hours** (usually completes within a few hours)

2. **Verify SSL Certificate:**
   - Once status shows "Ready", test: `https://traccems.com`
   - Browser should show valid SSL certificate
   - Certificate is automatically renewed by Azure

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

### Step 1: Add Custom Domain in Azure Portal

1. **Navigate to App Service:**
   - Go to: Azure Portal → `TraccEms-Prod-Backend` App Service
   - Click: **"Custom domains"** in the left menu

2. **Add Custom Domain:**
   - Click: **"+ Add custom domain"** button
   - Enter domain: `api.traccems.com`
   - Click: **"Validate"**

3. **Domain Validation:**
   - Azure will validate domain ownership
   - If validation fails, you may need to add a TXT record (similar to frontend)
   - **Note:** Subdomains usually validate faster than root domains

### Step 2: Configure DNS Record for Backend

**After validation**, Azure will provide DNS configuration:

1. **Check Azure Portal:**
   - Go to: Custom domains → `api.traccems.com`
   - Look for: **"DNS Configuration"** section
   - Azure will provide a **CNAME record** (subdomains always use CNAME)

2. **Update Namecheap DNS:**
   ```
   Type: CNAME
   Host: api
   Value: [Azure App Service hostname, e.g., traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net]
   TTL: Automatic
   ```

3. **Update Existing Record:**
   - **Current:** `api` CNAME → `492395b7c4732f5e.vercel-dns-017.com` (OLD - Vercel)
   - **Action:** Edit the existing `api` CNAME record
   - **Change value to:** Azure App Service hostname
   - Click: **"Save"** (checkmark icon)

4. **Wait for DNS Propagation:**
   - DNS changes typically propagate within 1-24 hours
   - Can check propagation using: `dig api.traccems.com` or online DNS checker

### Step 3: Wait for SSL Certificate Provisioning

1. **Monitor Certificate Status:**
   - Go to: Azure Portal → Custom domains → `api.traccems.com`
   - Status will show: "Certificate provisioning..." → "Ready"
   - **Usually completes faster than root domain** (15 minutes - 2 hours)

2. **Verify SSL Certificate:**
   - Once status shows "Ready", test: `https://api.traccems.com/health`
   - Browser/curl should show valid SSL certificate
   - Certificate is automatically renewed by Azure

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

- [ ] `traccems.com` resolves to Azure Static Web App
- [ ] `https://traccems.com` loads correctly
- [ ] SSL certificate is valid (green lock icon)
- [ ] `www.traccems.com` works (if configured)
- [ ] Frontend console shows: `API_BASE_URL is set to: https://api.traccems.com`

### Backend Domain Verification

- [ ] `api.traccems.com` resolves to Azure App Service
- [ ] `https://api.traccems.com/health` returns `{"status":"ok"}`
- [ ] SSL certificate is valid
- [ ] Frontend can make API calls to `https://api.traccems.com`

### DNS Verification

- [ ] Root domain (`@`) points to Azure Static Web App
- [ ] `api` subdomain points to Azure App Service
- [ ] Email records (MX, autodiscover) still work
- [ ] Dev records (dev, dev-api) still work

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

**Last Updated:** December 26, 2025  
**Status:** Ready for Implementation

