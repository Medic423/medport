# Dev-SWA Crash Investigation - Immediate Steps
**Date:** January 12, 2026  
**Status:** 🔴 **URGENT** - Need to see actual error message

---

## Critical: Get the Error Message

The backend is crashing, but we need to see **the actual error** to fix it.

### Step 1: Check Azure Log Stream for Error

**Azure Portal → TraccEms-Dev-Backend → Log Stream**

**Look for:**
- **Red error messages** (most important!)
- `Error:` or `TypeError:` or `SyntaxError:`
- Stack traces
- Any message that says "Failed" or "Error"

**Scroll up** in the log stream - the error might be right before the restart happens.

---

### Step 2: Check Application Logs (Alternative)

**Azure Portal → TraccEms-Dev-Backend → Advanced Tools (Kudu) → Go**

**Then:**
1. **Debug console** → **CMD**
2. Navigate to: `LogFiles/Application/`
3. Open the most recent log file
4. Look for error messages

---

### Step 3: Check GitHub Actions Build Logs

**GitHub Actions:** https://github.com/Medic423/medport/actions

**Find the latest workflow run:**
1. Click on the latest `develop - Deploy Dev Backend` workflow
2. Check the **"Build application"** step
3. Look for TypeScript compilation errors
4. Look for any warnings or errors

---

## Most Likely Issues

### Issue 1: Null Access (Less Likely - We Have Null Check)
- Accessing `agency.acceptsNotifications` when `agency` is null
- **But:** We have a null check at line 477, so this shouldn't happen

### Issue 2: Syntax Error (Possible)
- Missing comma, bracket, or parenthesis
- **Check:** Linter passed, but runtime might catch something different

### Issue 3: Module Import Error (Possible)
- Error importing a module
- **Check:** Look for "Cannot find module" errors

### Issue 4: Build Failed (Possible)
- TypeScript didn't compile correctly
- **Check:** GitHub Actions build logs

---

## Quick Fix: Add Defensive Code

**If we can't see the error, add defensive null checks:**

**Line 551 - Change from:**
```typescript
smsNotifications: agency.acceptsNotifications !== undefined ? agency.acceptsNotifications : true
```

**To (safer):**
```typescript
smsNotifications: agency?.acceptsNotifications ?? true
```

**This uses optional chaining and nullish coalescing - safer!**

---

## Next Action

**PRIORITY:** Get the actual error message from Azure Log Stream!

Once we see the error, we can fix it immediately.

---

## Rollback Plan (If Needed)

**If we can't fix quickly:**
1. Revert commit `a9cc7305`
2. Push to develop
3. Wait for deployment
4. Backend should work again
5. Fix the issue locally
6. Re-deploy after testing
