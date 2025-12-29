# SSL Certificate Monitoring Guide

**Created:** December 29, 2025  
**Purpose:** Monitor SSL certificate provisioning status for `api.traccems.com`  
**Status:** Active Monitoring

---

## Overview

Azure automatically provisions SSL certificates for custom domains. For `api.traccems.com`, the certificate provisioning process can take anywhere from 15 minutes to 24 hours after domain configuration.

This guide provides scripts and commands to monitor the SSL certificate provisioning status.

---

## Quick Status Check

### Single Check

Run a one-time SSL status check:

**From project root:**
```bash
cd /Users/scooper/Code/tcc-new-project
./scripts/check-ssl-status.sh
```

**From scripts directory:**
```bash
cd scripts
./check-ssl-status.sh
```

**Output:**
- ✅ SSL certificate status (provisioned or still provisioning)
- ✅ HTTPS endpoint accessibility test
- ✅ HTTP redirect test
- ✅ Summary with next steps

### Periodic Monitoring

Run continuous monitoring (checks every N minutes):

**From project root:**
```bash
cd /Users/scooper/Code/tcc-new-project

# Check every 15 minutes (default)
./scripts/monitor-ssl-periodic.sh

# Check every 5 minutes
./scripts/monitor-ssl-periodic.sh 5

# Check every 30 minutes
./scripts/monitor-ssl-periodic.sh 30
```

**From scripts directory:**
```bash
cd scripts

# Check every 15 minutes (default)
./monitor-ssl-periodic.sh

# Check every 5 minutes
./monitor-ssl-periodic.sh 5

# Check every 30 minutes
./monitor-ssl-periodic.sh 30
```

**Features:**
- Runs checks periodically until certificate is ready
- Automatically exits when SSL is provisioned
- Shows check count and timestamps
- Press Ctrl+C to stop monitoring

**Note:** Scripts must be run from the project root or from within the `scripts` directory. If you're in the `scripts` directory, omit the `scripts/` prefix from the path.

---

## Manual Azure CLI Commands

### Check SSL State

```bash
az webapp config hostname list \
  --webapp-name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "[?name=='api.traccems.com'].{hostname:name,sslState:sslState}" \
  -o table
```

**Expected Values:**
- `null` = Still provisioning
- `SniEnabled` = Certificate provisioned and active

### Test HTTPS Endpoint

```bash
# Test HTTPS (will fail with SSL error until certificate is ready)
curl -I https://api.traccems.com/health

# Expected when ready:
# HTTP/2 200
# {"status":"healthy"}
```

### Test HTTP Redirect

```bash
# Test HTTP redirect (should work even before SSL is ready)
curl -I http://api.traccems.com/health

# Expected:
# HTTP/1.1 301 Moved Permanently
# Location: https://api.traccems.com/health
```

---

## Status Indicators

### SSL Certificate Status

| Status | Meaning | Action |
|--------|---------|--------|
| `null` | Still provisioning | Continue monitoring |
| `SniEnabled` | Certificate ready | Test HTTPS endpoint |
| Other values | Check Azure Portal | Investigate if unexpected |

### HTTPS Test Results

| Result | Meaning | Action |
|--------|---------|--------|
| HTTP 200 | ✅ Working | SSL certificate is ready! |
| SSL Error (60) | ⏳ Still provisioning | Continue monitoring |
| HTTP 000 | ⚠️ Connection issue | Check network/firewall |
| Other HTTP codes | ⚠️ May indicate issue | Check Azure Portal |

---

## Monitoring Schedule

### Recommended Monitoring Frequency

**First 2 hours:** Check every 15-30 minutes  
**Hours 2-12:** Check every 1-2 hours  
**Hours 12-24:** Check every 2-4 hours  

### Quick Check Commands

**From project root:**
```bash
# Quick one-time check
./scripts/check-ssl-status.sh

# Continuous monitoring (every 15 minutes)
./scripts/monitor-ssl-periodic.sh

# Background monitoring (runs in background)
nohup ./scripts/monitor-ssl-periodic.sh 30 > ssl-monitor.log 2>&1 &
```

**From scripts directory:**
```bash
# Quick one-time check
./check-ssl-status.sh

# Continuous monitoring (every 15 minutes)
./monitor-ssl-periodic.sh

# Background monitoring (runs in background)
nohup ./monitor-ssl-periodic.sh 30 > ../ssl-monitor.log 2>&1 &
```

---

## When SSL Certificate is Ready

### Verification Steps

1. **Check SSL State:**
   ```bash
   ./scripts/check-ssl-status.sh
   ```
   Should show: `✅ SSL State: SniEnabled`

2. **Test HTTPS Endpoint:**
   ```bash
   curl https://api.traccems.com/health
   ```
   Should return: `{"status":"healthy"}`

3. **Test from Frontend:**
   - Open `https://traccems.com` in browser
   - Check browser console for API calls
   - Verify no SSL/CORS errors

4. **End-to-End Test:**
   - Login to application
   - Make API calls
   - Verify full functionality works

### After SSL is Ready

1. ✅ Update Phase 5 documentation
2. ✅ Test end-to-end custom domain flow
3. ✅ Verify CORS configuration works
4. ✅ Proceed with data entry testing

---

## Troubleshooting

### SSL Certificate Taking Longer Than Expected

**If certificate hasn't provisioned after 24 hours:**

1. **Check Azure Portal:**
   - Go to: Azure Portal → `TraccEms-Prod-Backend` → Custom domains
   - Look for error messages or warnings
   - Check DNS configuration

2. **Verify DNS:**
   ```bash
   dig api.traccems.com CNAME
   ```
   Should resolve to Azure App Service hostname

3. **Check Domain Validation:**
   ```bash
   dig +short TXT asuid.api.traccems.com
   ```
   Should show validation token (if still validating)

4. **Contact Azure Support:**
   - If DNS is correct and no errors in portal
   - Certificate provisioning may need manual intervention

### HTTPS Test Fails After SSL Provisioned

**If `sslState` shows `SniEnabled` but HTTPS still fails:**

1. **Wait 5-10 minutes:** Certificate may need time to propagate
2. **Restart App Service:**
   ```bash
   az webapp restart \
     --name TraccEms-Prod-Backend \
     --resource-group TraccEms-Prod-USCentral
   ```
3. **Check App Service logs** for errors
4. **Verify DNS propagation** hasn't changed

---

## Scripts Reference

### `scripts/check-ssl-status.sh`

**Purpose:** Single SSL status check  
**Usage (from project root):**
```bash
./scripts/check-ssl-status.sh
```

**Usage (from scripts directory):**
```bash
./check-ssl-status.sh
```

**Output:**
- SSL certificate state
- HTTPS endpoint test
- HTTP redirect test
- Summary with status

**Exit Codes:**
- `0` = SSL certificate is ready
- `1` = SSL certificate still provisioning

### `scripts/monitor-ssl-periodic.sh`

**Purpose:** Continuous SSL monitoring  
**Usage (from project root):**
```bash
./scripts/monitor-ssl-periodic.sh [interval_minutes]
```

**Usage (from scripts directory):**
```bash
./monitor-ssl-periodic.sh [interval_minutes]
```

**Parameters:**
- `interval_minutes` (optional): Minutes between checks (default: 15)

**Features:**
- Runs checks periodically
- Exits automatically when SSL is ready
- Shows check count and timestamps
- Can be stopped with Ctrl+C

**Path Notes:**
- When in project root: Use `./scripts/script-name.sh`
- When in scripts directory: Use `./script-name.sh` (omit `scripts/` prefix)

---

## Current Status

**Last Checked:** December 29, 2025, 10:03 AM  
**SSL State:** `null` (still provisioning)  
**HTTPS Access:** Not yet available  
**Expected Completion:** Within 24 hours of December 28, 2025 (~9 hours remaining)

**Next Check:** Run `./scripts/check-ssl-status.sh` periodically

---

## Quick Reference

**From project root (`/Users/scooper/Code/tcc-new-project`):**
```bash
# Single check
./scripts/check-ssl-status.sh

# Continuous monitoring (15 min intervals)
./scripts/monitor-ssl-periodic.sh

# Continuous monitoring (custom interval)
./scripts/monitor-ssl-periodic.sh 30

# Manual Azure CLI check
az webapp config hostname list \
  --webapp-name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "[?name=='api.traccems.com'].sslState" -o tsv
```

**From scripts directory (`/Users/scooper/Code/tcc-new-project/scripts`):**
```bash
# Single check
./check-ssl-status.sh

# Continuous monitoring (15 min intervals)
./monitor-ssl-periodic.sh

# Continuous monitoring (custom interval)
./monitor-ssl-periodic.sh 30
```

**Important:** 
- Scripts must be run from the project root OR from within the `scripts` directory
- If you're in the `scripts` directory, omit the `scripts/` prefix
- The scripts use relative paths, so the working directory matters

---

**Last Updated:** December 29, 2025  
**Status:** Active Monitoring

