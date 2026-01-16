# Dev-SWA Backend Crash Loop - Troubleshooting
**Date:** January 12, 2026  
**Status:** 🔴 **INVESTIGATING** - Backend crashing on startup, restart loop

---

## Problem

Backend is in a restart loop - Azure keeps restarting it, but it crashes before we see the startup message (`🚀 TCC Backend server running`).

---

## Symptoms

- ✅ GitHub Actions deployment completed successfully
- ✅ Azure restart initiated
- ✅ Node modules extracted successfully
- ❌ Backend never shows startup message
- ❌ Backend crashes and restarts repeatedly
- ❌ Cannot login (503 errors)

---

## Possible Causes

### 1. Syntax Error in Code (Unlikely - Linter Passed)
- Code was checked and linter shows no errors
- But runtime errors can still occur

### 2. Null/Undefined Access Error
**Most Likely:** Accessing `agency.acceptsNotifications` when `agency` is null/undefined

**Location:** `backend/src/routes/auth.ts` line 551
```typescript
smsNotifications: agency.acceptsNotifications !== undefined ? agency.acceptsNotifications : true
```

**If `agency` is null, this will crash!**

### 3. Build Issue
- TypeScript compilation might have failed
- Old code might be running

### 4. Database Connection Issue
- Backend crashes when trying to connect to database
- But this usually logs an error first

### 5. Missing Environment Variable
- `DATABASE_URL` not set
- But this would log an error

---

## Investigation Steps

### Step 1: Check Azure Log Stream for Errors

**Look for:**
- `❌ Failed to start server`
- `❌ DatabaseManager initialization failed`
- `Error: Cannot read property 'acceptsNotifications' of null`
- `TypeError: Cannot read property...`
- Any red error messages

### Step 2: Check if Agency Can Be Null

**In `auth.ts` GET `/api/auth/ems/agency/info`:**
- Check if `agency` can be null/undefined before accessing `agency.acceptsNotifications`
- Add null check if needed

### Step 3: Check Build Logs

**GitHub Actions:**
- Check if `npm run build` completed successfully
- Look for TypeScript compilation errors

### Step 4: Test Locally

**Try building and running locally:**
```bash
cd backend
npm run build
npm start
```

**If it crashes locally, check the error message.**

---

## Quick Fix: Add Null Check

**If the issue is accessing `agency.acceptsNotifications` when `agency` is null:**

**Current code (line 551):**
```typescript
smsNotifications: agency.acceptsNotifications !== undefined ? agency.acceptsNotifications : true
```

**Fixed code:**
```typescript
smsNotifications: agency && agency.acceptsNotifications !== undefined ? agency.acceptsNotifications : true
```

**Or safer:**
```typescript
smsNotifications: agency?.acceptsNotifications ?? true
```

---

## Next Steps

1. **Check Azure Log Stream** for specific error messages
2. **If error shows null access:** Add null check and redeploy
3. **If no clear error:** Check GitHub Actions build logs
4. **Test locally** to reproduce the error

---

## Rollback Option

**If we can't fix quickly:**
- Revert commit `a9cc7305`
- Deploy previous working version
- Investigate issue locally
- Re-deploy fix after testing

---

## Notes

- The crash happens before startup logs, suggesting a module loading or initialization error
- Most likely: Null/undefined access when `agency` doesn't exist
- Need to see actual error message from Azure Log Stream to confirm
