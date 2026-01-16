# Post-Rollback Verification Guide
**Date:** January 7, 2026  
**Status:** ✅ **DEPLOYMENT SUCCESSFUL** - Backend starting

---

## Current Status

**Deployment:** ✅ **SUCCESSFUL** (GitHub Actions #51)  
**Backend Health:** ⏳ **Still starting** (not responding yet)

---

## What to Check Now

### 1. Azure Log Stream (Most Important)

**In Azure Portal:**
1. Go to: `TraccEms-Prod-Backend` → **Log Stream**
2. **Look for these messages:**

**✅ Good Signs (Backend Starting):**
```
🔧 Production mode: Starting TCC Backend...
✅ Database connection successful
🚀 TCC Backend server running on port 8080
📊 Health check: http://localhost:8080/health
```

**❌ Bad Signs (Backend Failing):**
```
❌ Failed to start server: [error message]
Database connection failed
Missing file: dist/production-index.js
```

### 2. Wait for Startup

**Timeline:**
- Deployment completes: ✅ Done
- Container initializes: ~30 seconds
- Certificate updates: ~1-2 minutes
- Application starts: ~30-60 seconds
- **Total:** ~2-4 minutes after deployment

**If > 5 minutes with no logs:** Backend may not be starting

### 3. Test Health Endpoint

**After seeing startup logs:**
```bash
curl https://api.traccems.com/health
```

**Expected:** `200 OK` or JSON response  
**If timeout:** Backend still starting or not started

### 4. Test Login

**After health endpoint works:**
- Go to: `https://traccems.com`
- Try logging in
- Should work without timeout

---

## Common Issues After Rollback

### Issue 1: Backend Still Not Starting
**Symptoms:** No application logs in Log Stream  
**Possible causes:**
- Startup command not set
- Missing `dist/production-index.js`
- Database connection failing
- Missing environment variables

**Fix:** Check Log Stream for specific error

### Issue 2: Database Connection Failing
**Symptoms:** Logs show database connection errors  
**Possible causes:**
- `DATABASE_URL` not set
- Database firewall blocking
- Wrong credentials

**Fix:** Verify `DATABASE_URL` environment variable

### Issue 3: Missing Files
**Symptoms:** Logs show "file not found" errors  
**Possible causes:**
- Build didn't complete
- Files not deployed
- Wrong startup command

**Fix:** Check deployment package contents

---

## Expected Timeline

**Now:** Deployment successful ✅  
**Next 2-4 minutes:** Backend should start  
**After startup:** Health endpoint should work  
**Then:** Login should work

---

## What to Report

**Please check Log Stream and report:**
1. Do you see application startup logs?
2. Do you see any error messages?
3. How long has it been since deployment completed?

**This will help diagnose if backend is:**
- ✅ Starting normally (just needs time)
- ⚠️ Starting but slow (wait longer)
- ❌ Not starting (need to investigate)

---

**Last Updated:** January 7, 2026  
**Status:** ✅ Deployment successful - Monitoring backend startup

