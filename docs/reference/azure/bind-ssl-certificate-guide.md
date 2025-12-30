# Bind SSL Certificate to api.traccems.com

**Created:** December 30, 2025  
**Issue:** Custom domain shows "No binding" - SSL certificate not bound  
**Status:** Active Guide

---

## Current Status

- **Domain:** `api.traccems.com`
- **Status:** ✅ Verified
- **SSL Binding:** ❌ No binding
- **Issue:** Azure didn't automatically provision/bind SSL certificate

---

## Solution: Create and Bind App Service Managed Certificate

### Step 1: Create App Service Managed Certificate

**Via Azure Portal:**

1. **Navigate to TLS/SSL Settings:**
   - Go to: `TraccEms-Prod-Backend` → **Settings** → **TLS/SSL settings**
   - Or direct link: [TLS/SSL settings](https://portal.azure.com/#view/WebsitesExtension/WebsiteMenuBlade/~/tls/resourceId/%2Fsubscriptions%2Ffb5dde6b-779f-4ef5-b457-4b4d087a48ee%2FresourceGroups%2FTraccEms-Prod-USCentral%2Fproviders%2FMicrosoft.Web%2Fsites%2FTraccEms-Prod-Backend)

2. **Create Managed Certificate:**
   - Click on **"Private Key Certificates (.pfx)"** tab
   - Click **"+ Create App Service Managed Certificate"** button
   - In the dialog:
     - **Domain:** Select `api.traccems.com` from dropdown
     - **Certificate name:** Leave default or enter `api-traccems-com-cert`
     - Click **"Create"**

3. **Wait for Provisioning:**
   - Certificate creation usually takes **5-15 minutes**
   - Status will show "Creating..." then "Ready"
   - You'll see a notification when complete

### Step 2: Bind Certificate to Domain

**Via Azure Portal:**

1. **Navigate to Custom Domains:**
   - Go to: `TraccEms-Prod-Backend` → **Settings** → **Custom domains**
   - Or direct link: [Custom domains](https://portal.azure.com/#view/WebsitesExtension/WebsiteMenuBlade/~/customDomains/resourceId/%2Fsubscriptions%2Ffb5dde6b-779f-4ef5-b457-4b4d087a48ee%2FresourceGroups%2FTraccEms-Prod-USCentral%2Fproviders%2FMicrosoft.Web%2Fsites%2FTraccEms-Prod-Backend)

2. **Add SSL Binding:**
   - Find `api.traccems.com` in the list
   - Click on `api.traccems.com` (or click **"Add binding"** next to it)
   - In the **"Add SSL binding"** dialog:
     - **Hostname:** `api.traccems.com` (should be pre-selected)
     - **Certificate:** Select the certificate you just created (should show `api.traccems.com` or similar)
     - **SSL type:** Select **"SNI SSL"** (recommended - free)
     - Click **"Add binding"**

3. **Verify Binding:**
   - Status should change from "No binding" to "SNI SSL"
   - Certificate thumbprint should be displayed
   - Domain should now be accessible via HTTPS

### Step 3: Verify SSL Certificate

**Test HTTPS Endpoint:**
```bash
# Check SSL certificate status
./scripts/check-ssl-status.sh

# Test HTTPS endpoint
curl -I https://api.traccems.com/health

# Expected: HTTP 200 (not SSL errors)
```

**Expected Results:**
- ✅ `sslState` changes from `null` to `SniEnabled`
- ✅ HTTPS endpoint returns HTTP 200
- ✅ Browser shows valid SSL certificate
- ✅ No SSL certificate errors

---

## Alternative: Azure CLI Method

If you prefer command line:

### Create Certificate (if CLI supports it)

**Note:** Azure CLI may not support creating App Service Managed Certificates directly. Use Portal method above.

### Bind Certificate via CLI

Once certificate is created via Portal:

```bash
# List available certificates
az webapp config ssl list \
  --resource-group TraccEms-Prod-USCentral \
  --query "[].{name:name,thumbprint:thumbprint}" -o table

# Bind certificate (replace THUMBPRINT with actual thumbprint)
az webapp config ssl bind \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --certificate-thumbprint THUMBPRINT \
  --ssl-type SNI \
  --hostname api.traccems.com
```

---

## Troubleshooting

### Issue: Certificate Creation Fails

**Possible Causes:**
- Domain not fully verified
- DNS not propagating correctly
- Azure service issue

**Solutions:**
1. Verify domain status: Should show "Verified" in Custom domains
2. Check DNS: `dig +short api.traccems.com CNAME`
3. Wait 5 minutes and try again
4. Contact Azure support if issue persists

### Issue: Certificate Created But Can't Bind

**Possible Causes:**
- Certificate not ready yet (wait a few minutes)
- Domain binding conflict

**Solutions:**
1. Wait 5-10 minutes after certificate creation
2. Refresh the Custom domains page
3. Try binding again
4. If still fails, remove and re-add domain

### Issue: Binding Shows But HTTPS Still Fails

**Possible Causes:**
- Certificate not fully propagated
- DNS caching
- Browser cache

**Solutions:**
1. Wait 5-10 minutes after binding
2. Clear browser cache
3. Test from different network/browser
4. Check certificate status: `./scripts/check-ssl-status.sh`

---

## Verification Commands

### Check Certificate Status

```bash
# Check hostname binding
az webapp config hostname list \
  --webapp-name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "[?name=='api.traccems.com'].{hostname:name,sslState:sslState}" \
  -o table

# Expected output:
# hostname           sslState
# -----------------  ----------
# api.traccems.com   SniEnabled
```

### Test HTTPS

```bash
# Test HTTPS endpoint
curl -I https://api.traccems.com/health

# Expected: HTTP/1.1 200 OK (not SSL errors)
```

---

## Expected Timeline

- **Certificate Creation:** 5-15 minutes
- **Binding:** Immediate (after certificate is ready)
- **Propagation:** 5-10 minutes
- **Total:** ~15-30 minutes

---

## Summary

**Current Issue:** Domain shows "No binding" - SSL certificate not bound

**Solution:**
1. Create App Service Managed Certificate via Portal (TLS/SSL settings)
2. Bind certificate to domain (Custom domains → Add binding)
3. Wait 5-15 minutes for provisioning
4. Verify HTTPS works

**Once Complete:**
- Login to `https://traccems.com` should work
- Use password: `password123` (not `admin123`)
- Frontend will connect to `https://api.traccems.com` successfully

---

**Last Updated:** December 30, 2025  
**Status:** Active Guide

