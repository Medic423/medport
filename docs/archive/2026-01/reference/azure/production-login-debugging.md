# Production Login Debugging Steps

**Created:** December 30, 2025  
**Issue:** Login still failing after SSL certificate is bound  
**Status:** Active Debugging

---

## Current Status

- ✅ SSL Certificate: Bound (`SniEnabled`)
- ✅ HTTPS Access: Working (API responds)
- ✅ Domain Verified: `api.traccems.com`
- ✅ Password Hash: Exists in database
- ❌ Login: Still failing (HTTP 401 with empty body)

---

## Debugging Steps

### Step 1: Check Browser Console

**Open browser developer tools (F12) and check:**

1. **Network Tab:**
   - Look for the login request to `https://api.traccems.com/api/auth/login`
   - Check request headers (should include `Content-Type: application/json`)
   - Check response status and body
   - Look for CORS errors

2. **Console Tab:**
   - Look for JavaScript errors
   - Check for `TCC_DEBUG` messages showing API URL
   - Look for CORS or network errors

**Expected Console Output:**
```
TCC_DEBUG: API_BASE_URL is set to: https://api.traccems.com
TCC_DEBUG: API login called with URL: https://api.traccems.com/api/auth/login
```

### Step 2: Verify Frontend API Configuration

**Check what API URL the frontend is using:**

1. Open browser console on `https://traccems.com`
2. Run: `window.__TCC_CONFIG__`
3. Should show: `{ apiBaseUrl: "https://api.traccems.com" }`

**If incorrect:**
- Frontend needs redeployment
- Go to GitHub Actions → "production - Deploy Prod Frontend"
- Run workflow from `main` branch

### Step 3: Test API Directly

**From browser console on `https://traccems.com`:**

```javascript
fetch('https://api.traccems.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@tcc.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": { ... },
  "token": "..."
}
```

**If Error:**
- Check error message
- Look for CORS errors
- Check if response is empty

### Step 4: Check Backend Logs

**View production backend logs:**

```bash
az webapp log tail \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --filter "login OR auth OR error"
```

**Look for:**
- `TCC_DEBUG: Login request received`
- `TCC_DEBUG: User found in database`
- `TCC_DEBUG: Password match result`
- Any error messages

### Step 5: Verify CORS Configuration

**Check CORS settings:**

```bash
az webapp config appsettings list \
  --name TraccEms-Prod-Backend \
  --resource-group TraccEms-Prod-USCentral \
  --query "[?name=='CORS_ORIGIN' || name=='FRONTEND_URL']" \
  -o table
```

**Expected:**
- `CORS_ORIGIN`: `https://traccems.com`
- `FRONTEND_URL`: `https://traccems.com`

**If incorrect:**
- Update via Azure Portal or CLI
- Restart App Service

### Step 6: Check Production Backend Deployment

**Verify backend has latest code:**

1. Check GitHub Actions: https://github.com/Medic423/medport/actions/workflows/prod-be.yaml
2. Verify last deployment was recent
3. If old, redeploy backend

**Redeploy Backend:**
1. Go to GitHub Actions → "production - Deploy Prod Backend"
2. Click "Run workflow"
3. Select branch: `main`
4. Wait for deployment

---

## Common Issues

### Issue: CORS Error in Browser

**Symptoms:**
- Browser console shows CORS error
- Network tab shows preflight OPTIONS request failed

**Solution:**
- Verify `CORS_ORIGIN` is set to `https://traccems.com`
- Restart App Service after updating CORS settings

### Issue: Empty Response Body

**Symptoms:**
- HTTP 401 but no JSON body
- Response shows `Content-Length: 0`

**Possible Causes:**
1. Backend middleware intercepting request
2. Backend error before response sent
3. CORS blocking response

**Solution:**
- Check backend logs for errors
- Verify backend code is deployed
- Check CORS configuration

### Issue: Wrong API URL

**Symptoms:**
- Frontend calling wrong API URL
- Network tab shows request to wrong domain

**Solution:**
- Verify `config.js` is correct on production
- Redeploy frontend if needed
- Check browser console for `TCC_DEBUG` messages

---

## Next Steps

1. **Check browser console** for errors and API URL
2. **Test API directly** from browser console
3. **Check backend logs** for login attempts
4. **Verify CORS** configuration
5. **Redeploy backend** if needed

---

**Last Updated:** December 30, 2025  
**Status:** Active Debugging

