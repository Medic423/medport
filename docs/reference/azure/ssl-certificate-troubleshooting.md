# SSL Certificate Troubleshooting - api.traccems.com

**Created:** December 30, 2025  
**Issue:** SSL certificate not provisioning after 36+ hours  
**Status:** Active Troubleshooting

---

## Current Status

- **Domain:** `api.traccems.com`
- **Domain Status:** ✅ Verified (`hostNameType: "Verified"`)
- **SSL State:** ❌ `null` (not provisioned)
- **Time Elapsed:** 36+ hours (exceeds typical 24-hour maximum)
- **DNS:** ✅ Correctly configured
- **HTTP Access:** ✅ Working (redirects to HTTPS)

---

## Problem Analysis

### Expected Behavior
- Azure App Service should automatically provision SSL certificates for custom domains
- Typical provisioning time: 15 minutes - 2 hours for subdomains
- Maximum expected time: Up to 24 hours

### Current Situation
- SSL certificate has not been provisioned after 36+ hours
- Domain is verified and DNS is correct
- HTTP redirects to HTTPS, but HTTPS connection fails (no certificate)

---

## Troubleshooting Steps

### Step 1: Verify DNS Configuration ✅

**CNAME Record:**
```bash
dig +short api.traccems.com CNAME
# Expected: traccems-prod-backend-ejb8awe3auh8bmeb.centralus-01.azurewebsites.net.
# Status: ✅ Correct
```

**TXT Validation Record:**
```bash
dig +short TXT asuid.api.traccems.com
# Expected: "f6a67d820a423c7ddc2cec1c3753ef1a620ebe5504b2a37a0a853451440769b7"
# Status: ✅ Present
```

### Step 2: Check Domain Status ✅

```bash
az webapp config hostname list --webapp-name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "[?name=='api.traccems.com']"
```

**Current Status:**
- `hostNameType`: `Verified` ✅
- `sslState`: `null` ❌

### Step 3: Attempt Manual Certificate Request

**Option A: Request Managed Certificate via Azure CLI**

```bash
az webapp config ssl create \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --hostname api.traccems.com \
  --validation-method DNS
```

**Option B: Request via Azure Portal**

1. Go to Azure Portal → `TraccEms-Prod-Backend` → **Custom domains**
2. Find `api.traccems.com` in the list
3. Click **"Add binding"** or **"Manage certificate"**
4. Select **"Create App Service Managed Certificate"**
5. Select `api.traccems.com` from the dropdown
6. Click **"Create"**

### Step 4: Remove and Re-add Domain (If Manual Request Fails)

**⚠️ WARNING:** This will temporarily break the domain until re-added.

```bash
# Remove custom domain
az webapp config hostname delete \
  --webapp-name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --hostname api.traccems.com

# Wait 5 minutes

# Re-add custom domain
az webapp config hostname add \
  --webapp-name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --hostname api.traccems.com
```

**After re-adding:**
- Azure should automatically start SSL certificate provisioning
- Monitor status: `./scripts/check-ssl-status.sh`

---

## Alternative Solutions

### Option 1: Use Azure Portal to Request Certificate

1. Navigate to: Azure Portal → `TraccEms-Prod-Backend` → **TLS/SSL settings**
2. Click **"Private Key Certificates (.pfx)"** tab
3. Click **"Create App Service Managed Certificate"**
4. Select `api.traccems.com` from domain dropdown
5. Click **"Create"**
6. Wait for certificate to be created (usually 5-15 minutes)
7. Go to **Custom domains** → Click on `api.traccems.com`
8. Under **SSL bindings**, select the newly created certificate
9. Click **"Add binding"**

### Option 2: Contact Azure Support

If manual certificate request fails:
- Open Azure support ticket
- Reference: Custom domain SSL certificate not provisioning after 36+ hours
- Provide domain: `api.traccems.com`
- Provide App Service: `TraccEms-Prod-Backend`
- Provide Resource Group: `TraccEms-Prod-USCentral`

---

## Verification Commands

### Check SSL Certificate Status

```bash
# Check hostname binding status
az webapp config hostname list \
  --webapp-name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "[?name=='api.traccems.com'].{hostname:name,sslState:sslState,hostNameType:hostNameType}" \
  -o table

# Check available certificates
az webapp config ssl list \
  --resource-group TraccEms-Prod-USCentral \
  --query "[].{name:name,thumbprint:thumbprint,expirationDate:expirationDate,state:state}" \
  -o table

# Test HTTPS endpoint
curl -I https://api.traccems.com/health
```

### Expected Success Indicators

- `sslState` changes from `null` to `SniEnabled`
- Certificate appears in SSL certificate list
- HTTPS endpoint returns HTTP 200 (not SSL errors)
- Browser shows valid SSL certificate

---

## Known Issues

### Issue: SSL Certificate Stuck in Provisioning

**Symptoms:**
- `sslState` remains `null` for extended period (>24 hours)
- Domain is verified and DNS is correct
- HTTP works but HTTPS fails

**Possible Causes:**
1. Azure certificate provisioning service issue
2. DNS propagation delay (unlikely after 36 hours)
3. Domain validation issue (but domain shows as verified)
4. App Service configuration issue

**Solutions:**
1. Try manual certificate request via Azure Portal
2. Remove and re-add custom domain
3. Contact Azure support if issue persists

---

## Next Steps

1. **Try Manual Certificate Request** (Azure Portal recommended)
   - Go to App Service → TLS/SSL settings → Create App Service Managed Certificate
   - Select `api.traccems.com`
   - Wait 5-15 minutes for provisioning

2. **If Manual Request Fails:**
   - Remove and re-add custom domain
   - Monitor SSL status: `./scripts/check-ssl-status.sh`

3. **If Still Failing:**
   - Contact Azure support
   - Provide all troubleshooting information from this document

---

## Timeline

- **December 28, 2025 ~22:50 UTC:** Custom domain added
- **December 28, 2025 ~23:00 UTC:** DNS configured
- **December 30, 2025 ~09:42 UTC:** SSL still `null` (36+ hours later)
- **Status:** ⏳ Troubleshooting in progress

---

**Last Updated:** December 30, 2025  
**Status:** Active Troubleshooting

