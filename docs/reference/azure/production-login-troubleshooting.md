# Production Login Troubleshooting Guide

**Created:** December 30, 2025  
**Purpose:** Troubleshoot login issues on traccems.com (production)  
**Status:** ✅ **RESOLVED** - December 30, 2025

---

## ✅ Production Login Status - RESOLVED

**Status:** ✅ **WORKING** - Login successful on `https://traccems.com`

**Credentials:**
- Email: `admin@tcc.com`
- Password: `password123` ⚠️ (NOT `admin123`)

**Issues Fixed:**
1. ✅ **CORS Error** - Fixed by disabling Azure App Service Authentication (Easy Auth)
2. ✅ **SSL Certificate** - Bound and working (`SniEnabled`)
3. ✅ **JWT_SECRET** - Set in production environment variables
4. ✅ **Database Schema Mismatch** - Added missing columns (`phone`, `emailNotifications`, `smsNotifications`)

---

## Historical Issues (Now Resolved)

**Original Issues:**
1. ⚠️ **SSL Certificate Not Ready** - `api.traccems.com` SSL certificate still provisioning
2. ⚠️ **Wrong Password** - Production uses `password123`, not `admin123`
3. ⚠️ **Frontend Not Deployed** - Updated `config.js` needs to be deployed to production
4. ⚠️ **CORS Error** - OPTIONS preflight requests blocked
5. ⚠️ **JWT_SECRET Missing** - Environment variable not set
6. ⚠️ **Database Schema Mismatch** - Missing columns in production database

---

## Issue 1: SSL Certificate Not Ready

### Status
- **SSL State:** `null` (still provisioning)
- **Domain:** `api.traccems.com`
- **Expected Completion:** Within 24 hours of December 28, 2025

### Impact
- Backend API (`https://api.traccems.com`) is not accessible via HTTPS
- Frontend cannot make API calls to backend
- Login will fail even with correct credentials

### Solution
- **Wait for SSL certificate to provision** (monitoring script running)
- Check status: `./scripts/check-ssl-status.sh`
- Once SSL is ready, API calls will work

---

## Issue 2: Wrong Password

### Correct Production Credentials

**Email:** `admin@tcc.com`  
**Password:** `password123` ⚠️ **NOT** `admin123`

### Why Different Password?

- Production admin user was created manually on December 28, 2025
- Password set to `password123` during manual creation
- Dev environments use `admin123` (from seed script)
- **Production password is different by design**

### Verification

```bash
# Check production database
psql "postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" \
  -c "SELECT email, name FROM center_users WHERE email = 'admin@tcc.com';"
```

---

## Issue 3: Frontend Not Deployed

### Current Status

**Production frontend needs redeployment** to include:
- Updated `config.js` with hostname-based API URL logic
- Correct API URL configuration

### What Was Fixed

1. **`config.js` updated** (December 29, 2025):
   - Added hostname-based API URL detection
   - `traccems.com` → `https://api.traccems.com`
   - `dev-swa.traccems.com` → `https://dev-api.traccems.com`

2. **Production workflow** already has `VITE_API_URL` set correctly

### Deployment Required

**Production frontend must be redeployed** to get the updated `config.js`:

1. Go to GitHub Actions: https://github.com/Medic423/medport/actions/workflows/prod-fe.yaml
2. Click **"Run workflow"**
3. Select branch: `develop` (or `main` if that's where the fix is)
4. Click **"Run workflow"**
5. Wait for deployment to complete (~2-3 minutes)

---

## Complete Fix Checklist

### Step 1: Wait for SSL Certificate ⏳
- [ ] Check SSL status: `./scripts/check-ssl-status.sh`
- [ ] Wait until SSL certificate is provisioned
- [ ] Verify: `curl -I https://api.traccems.com/health` returns HTTP 200

### Step 2: Redeploy Production Frontend ⏳
- [ ] Go to GitHub Actions → "production - Deploy Prod Frontend"
- [ ] Run workflow from `develop` branch
- [ ] Wait for deployment to complete
- [ ] Verify `config.js` is updated on `https://traccems.com/config.js`

### Step 3: Test Login ✅
- [ ] Use correct password: `password123` (not `admin123`)
- [ ] Login at `https://traccems.com`
- [ ] Verify login succeeds

---

## Expected Behavior After Fix

### Once SSL Certificate is Ready AND Frontend is Redeployed:

1. **Frontend Configuration:**
   - `config.js` detects `traccems.com` hostname
   - Sets `apiBaseUrl` to `https://api.traccems.com`
   - Frontend makes API calls to correct backend

2. **Backend API:**
   - SSL certificate allows HTTPS connections
   - API endpoints respond correctly
   - Authentication works

3. **Login Flow:**
   - User enters: `admin@tcc.com` / `password123`
   - Frontend calls: `https://api.traccems.com/api/auth/login`
   - Backend authenticates successfully
   - User logged in

---

## Quick Reference

### Production Credentials
- **Email:** `admin@tcc.com`
- **Password:** `password123` ⚠️
- **Note:** Different from dev password (`admin123`)

### SSL Certificate Status
- **Check:** `./scripts/check-ssl-status.sh`
- **Monitor:** `./scripts/monitor-ssl-periodic.sh 30`
- **Expected:** Ready within 24 hours of December 28, 2025

### Production Deployment
- **Workflow:** "production - Deploy Prod Frontend"
- **Branch:** `develop` (or `main`)
- **Manual:** Yes (workflow_dispatch)

### API URLs
- **Production Frontend:** `https://traccems.com`
- **Production Backend:** `https://api.traccems.com` (pending SSL)
- **Dev Frontend:** `https://dev-swa.traccems.com`
- **Dev Backend:** `https://dev-api.traccems.com`

---

## Summary

**Current Blockers:**
1. ⏳ SSL certificate not ready (waiting)
2. ⏳ Production frontend needs redeployment (manual action required)
3. ✅ Use correct password: `password123`

**Action Items:**
1. Monitor SSL certificate status
2. Redeploy production frontend when SSL is ready
3. Use correct password: `password123`

**Once SSL is ready and frontend is redeployed, login should work with:**
- Email: `admin@tcc.com`
- Password: `password123`

---

**Last Updated:** December 30, 2025  
**Status:** Active Troubleshooting

