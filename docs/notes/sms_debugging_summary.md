# SMS Integration Debugging Summary

**Last Updated:** December 8, 2025  
**Status:** ✅ Backend SMS Trigger Working | ⚠️ Azure Delivery Status Unknown

## Current Status

### 📊 Diagnostics Results (December 8, 2025)

**Configuration Check:**
- ✅ **AZURE_SMS_ENABLED:** `true` (correctly set as string)
- ✅ **Connection String:** SET
- ✅ **Service Files:** All exist (azureSMSService.ts, smsMessageComposer.ts, tripSMSService.ts)
- ⚠️ **Phone Number:** NOT SET (may use Azure default)

**Diagnostic Tools Added:**
- ✅ Global request logger (logs all POST requests to `/trips`)
- ✅ Startup SMS configuration logging
- ✅ SMS diagnostics endpoint (`GET /api/trips/sms-diagnostics`)
- ✅ Standalone diagnostic script (`backend/check-sms-diagnostics.js`)

**Result:** SMS configuration is properly set up. The issue is likely in the request flow or SMS trigger logic.

### ✅ What's Working
1. **Azure Communication Services Setup**: Fully configured and tested
   - Connection string: Configured in `.env.local`
   - Phone number: `+18339675959` (sender)
   - Feature flag: `AZURE_SMS_ENABLED=true`
   - Manual SMS test: **SUCCESSFUL** - SMS sent to Elk County EMS (`+18146950813`)

2. **Backend Services**: All created and functional
   - `azureSMSService.ts` - Azure SMS client wrapper
   - `smsMessageComposer.ts` - Message composition with HIPAA-compliant templates
   - `tripSMSService.ts` - Orchestrates SMS sending for trip creation
   - Manual test confirms SMS service works perfectly

3. **Database Schema**: Ready
   - `EMSAgency.acceptsNotifications` - Boolean field (default: true)
   - `EMSAgency.phone` - Phone number field
   - `TransportRequest.notificationRadius` - Radius in miles
   - `HealthcareLocation.latitude/longitude` - For distance calculations

4. **Frontend UI**: Updated
   - SMS Notification Radius field added to Step 2 (Trip Details)
   - Field is visible and required
   - Agency Settings: Email notification removed, SMS toggle wired to `acceptsNotifications`

5. **Trip Creation**: Working
   - POST `/api/trips/enhanced` returns 201 (success)
   - Trip is created successfully in database
   - `notificationRadius` is being sent in request payload (needs verification)

### ✅ RESOLVED: Backend SMS Trigger

**SMS notifications ARE being triggered during trip creation!**

**Confirmed Working (Trip PCLSZ9YS4):**
- ✅ POST request received with `notificationRadius: 150`
- ✅ Trip created successfully
- ✅ SMS trigger check executed
- ✅ SMS conditions met (`AZURE_SMS_ENABLED=true`, `notificationRadius=150`)
- ✅ Found 5 agencies within 150-mile radius
- ✅ Azure SMS API called successfully
- ✅ Azure returned HTTP 202 (Accepted) with message IDs for all 5 agencies

**Test Results:**
- Altoona EMS: Message ID `c40f54af-fabe-4c81-af54-0fc4befa816c`
- Duncansville EMS: Message ID `4d6cb3eb-9a3d-438f-abb3-6c4d3d9a8fd3`
- Bedford Ambulance Service: Message ID `50032123-ef07-41a8-a321-035007efa881`
- Citizens Ambulance Service: Message ID `9bdf85d7-9434-4e8b-9785-df9b34948bee`
- Elk County EMS: Message ID `056ce591-6e2c-427a-91e5-6c052c6e7af2` (Phone: `+18146950813`)

### ⚠️ Current Issue: Azure Delivery Status Unknown

**Problem:** Backend shows SMS "sent successfully" but no SMS received on test phone.

**Root Cause:** Azure Communication Services returns HTTP 202 (Accepted) when it accepts the request, but:
- HTTP 202 does NOT guarantee delivery
- Messages may be queued for processing
- Delivery can fail later (invalid number, carrier rejection, etc.)
- Azure doesn't provide real-time delivery status via API

**Symptoms:**
- Backend logs show: `Azure SMS sent successfully` with HTTP 202
- Azure returns message IDs
- But no SMS received on test phone (`+18146950813`)

## What We've Tried

### 1. Code Integration
- ✅ Added SMS trigger code in `tripService.ts` after trip creation
- ✅ Added comprehensive logging at multiple levels:
  - Route level (`trips.ts`)
  - Service level (`tripService.ts`)
  - SMS service level (`tripSMSService.ts`)
- ✅ Verified code exists in files

### 2. Backend Debugging
- ✅ Added logging before authentication middleware
- ✅ Added `🔍 TCC_DEBUG` messages to catch requests
- ✅ Verified backend is running and healthy
- ✅ Restarted backend multiple times
- ❌ **Still not seeing POST request logs in terminal**

### 3. Frontend Verification
- ✅ Verified `notificationRadius` is included in form submission
- ✅ Field is visible in UI (Step 2)
- ✅ Form submission code includes `notificationRadius: formData.notificationRadius ? Number(formData.notificationRadius) : 100`
- ⚠️ **Need to verify**: Is `notificationRadius` actually in the Network request payload?

### 4. Manual Testing
- ✅ Manual SMS test: **WORKED** - Sent SMS to 5 agencies successfully
- ✅ Distance calculation: Elk County EMS is 26.16 miles from trip origin (within 150 mile radius)
- ✅ Phone number formatting: Working correctly (`+18146950813`)

## Current Investigation Points

### Issue 1: Backend Logs Not Appearing
- POST request returns 201 (success)
- But no backend logs appear for POST `/api/trips/enhanced`
- Possible causes:
  - Backend hasn't reloaded new logging code (nodemon issue?)
  - Logs going to different terminal/window
  - Request being handled by different route

### Issue 2: SMS Not Triggering
- Even if request reaches backend, SMS code might not execute
- Need to verify:
  - Is `notificationRadius` in request payload?
  - Is `data.notificationRadius` truthy when SMS check runs?
  - Is `AZURE_SMS_ENABLED` being read correctly at runtime?

## Next Steps to Debug

### ✅ New Diagnostic Tools Added:

1. **Global Request Logger** (in `backend/src/index.ts`)
   - Catches ALL POST requests to `/trips` routes before routing
   - Logs: path, URL, method, body keys, and `notificationRadius` value
   - Should appear even if route handler doesn't execute

2. **Startup SMS Configuration Logging**
   - Logs SMS environment variables when backend starts
   - Shows: `AZURE_SMS_ENABLED`, connection string status, phone number
   - Check backend startup logs for SMS configuration status

3. **SMS Diagnostic Endpoint** (`GET /api/trips/sms-diagnostics`)
   - Returns complete SMS configuration status
   - Shows feature flag value, Azure config, service availability
   - Accessible via: `http://localhost:5001/api/trips/sms-diagnostics`

4. **Enhanced SMS Trigger Logging**
   - More detailed logging in `tripService.ts` before SMS check
   - Shows: raw env value, notificationRadius type, truthy check
   - Helps identify type coercion issues

### Immediate Actions Needed:

1. **Restart Backend and Check Startup Logs**
   - Stop backend completely (Ctrl+C)
   - Restart: `cd backend && npm run dev`
   - **Look for SMS CONFIGURATION STATUS section** in startup logs
   - Verify `AZURE_SMS_ENABLED` shows as `true`

2. **Check SMS Diagnostics Endpoint**
   - Open browser: `http://localhost:5001/api/trips/sms-diagnostics`
   - Or use curl: `curl http://localhost:5001/api/trips/sms-diagnostics`
   - Verify feature flag is enabled and services are available

3. **Create Trip and Watch Logs**
   - Create a trip with `notificationRadius` set (e.g., 150)
   - Watch terminal for:
     - `🌐 GLOBAL REQUEST LOGGER: POST to trips` (should appear first)
     - `🔍 TCC_DEBUG: POST /enhanced route handler called`
     - `🚨 TCC_DEBUG: CREATE ENHANCED TRIP REQUEST RECEIVED`
     - `📱 SMS TRIGGER CHECK` section with detailed values

4. **Verify Request Payload**
   - In browser Network tab, click POST `enhanced` request
   - Check "Payload" or "Request" tab
   - Confirm `notificationRadius` is present in JSON body
   - Verify it's a number (not string or null)

5. **Check Environment Variables**
   - Verify `.env.local` exists in `backend/` directory
   - Confirm `AZURE_SMS_ENABLED=true` (exactly "true" as string)
   - Check for any whitespace or quotes around the value

### Code Locations to Check:

- **Global Request Logger**: `backend/src/index.ts` line 58-68 (catches all POST requests)
- **Backend Route**: `backend/src/routes/trips.ts` line 110-238 (enhanced trip creation)
- **Backend Service**: `backend/src/services/tripService.ts` line 874-898 (SMS trigger)
- **SMS Service**: `backend/src/services/tripSMSService.ts` line 26-96 (SMS sending)
- **Frontend Form**: `frontend/src/components/EnhancedTripForm.tsx` line 1126 (notificationRadius)
- **SMS Diagnostics**: `backend/src/routes/trips.ts` line 1182-1220 (diagnostic endpoint)

### Key Files Modified:

1. `backend/src/services/azureSMSService.ts` - Azure SMS client
2. `backend/src/services/smsMessageComposer.ts` - Message composition
3. `backend/src/services/tripSMSService.ts` - SMS orchestration
4. `backend/src/services/tripService.ts` - Trip creation with SMS trigger (enhanced logging)
5. `backend/src/routes/trips.ts` - Route handler with logging + SMS diagnostics endpoint
6. `backend/src/index.ts` - Global request logger + startup SMS config logging
7. `frontend/src/components/EnhancedTripForm.tsx` - Form with notification radius field
8. `frontend/src/components/AgencySettings.tsx` - SMS toggle
9. `backend/src/routes/auth.ts` - Agency update endpoint

## Expected Behavior

When a trip is created with `notificationRadius` set:

1. **Backend receives POST** `/api/trips/enhanced` with `notificationRadius` in payload
2. **Trip is created** in database
3. **SMS trigger check runs**: `if (AZURE_SMS_ENABLED === 'true' && data.notificationRadius)`
4. **Agencies filtered** by distance within radius
5. **SMS sent** to each agency with `acceptsNotifications: true` and valid phone number
6. **Logs show**: SMS sending progress and results

## Test Data

- **Test Agency**: Elk County EMS
  - Phone: `(814) 6950813` → formats to `+18146950813`
  - Location: `41.4208193, -78.7329344`
  - `acceptsNotifications`: true
  - `isActive`: true

- **Test Trip Origin**: Penn Highlands Brookville
  - Location: `41.1563668, -79.0934389`
  - Distance to Elk County: 26.16 miles
  - Notification Radius: 150 miles (should include Elk County)

## Log Filtering Commands

To filter SMS-related logs from backend terminal output:

### Quick Filter Commands:
```bash
# Basic SMS filter
grep -i "SMS\|notification\|radius\|trigger\|📱\|🌐.*POST.*trips" <log_file>

# SMS trigger check (most important)
grep -E "SMS TRIGGER CHECK|notificationRadius|SMS conditions met|SMS not triggered" <log_file>

# Complete SMS flow
grep -E "GLOBAL REQUEST LOGGER|POST.*enhanced|SMS TRIGGER CHECK|SMS conditions|SMS notification|tripSMSService" <log_file>

# With context (shows surrounding lines)
grep -E -A 3 -B 3 "SMS TRIGGER CHECK|notificationRadius|SMS conditions" <log_file>
```

### Real-Time Filtering:
```bash
# Save logs to file first (in backend terminal):
npm run dev 2>&1 | tee backend.log

# Then filter in another terminal:
tail -f backend.log | grep -E "SMS|notification|radius|trigger|📱|🌐"
```

See `backend/SMS-LOG-FILTERING.md` for complete filtering guide.

## Questions to Answer

### ✅ RESOLVED:
1. ✅ Is `notificationRadius` in the Network request payload? **YES** (150)
2. ✅ Are backend logs appearing after restart? **YES**
3. ✅ Is `AZURE_SMS_ENABLED` being read as `'true'` at runtime? **YES**
4. ✅ Is `data.notificationRadius` truthy when SMS check runs? **YES** (Fixed condition check)
5. ✅ Is the dynamic import of `tripSMSService` succeeding? **YES**

### ⚠️ PENDING (Azure Side):
1. **Are messages actually delivered by Azure?** → Check Azure Portal SMS logs
2. **Is Azure in test mode?** → Check Azure Communication Services settings
3. **Are phone numbers verified?** → Azure test mode only allows verified numbers
4. **Are there carrier delivery issues?** → Check Azure delivery reports for errors
5. **Is the sender number (`+18339675959`) active?** → Verify in Azure Portal

## Success Criteria

- ✅ Backend logs show POST request received
- ✅ Backend logs show SMS trigger conditions met
- ✅ Backend logs show SMS being sent
- ✅ Azure returns HTTP 202 (Accepted) with message IDs
- ⚠️ **PENDING:** SMS received on test phone (needs Azure portal verification)
- ✅ No errors in backend console

## Azure Communication Services Verification Steps

### 1. Check Azure Portal SMS Logs
1. Go to Azure Portal → Your Communication Services resource
2. Navigate to **SMS** → **Delivery reports** or **Logs**
3. Look for message IDs from the trip:
   - `056ce591-6e2c-427a-91e5-6c052c6e7af2` (Elk County EMS)
   - Check delivery status: `Delivered`, `Failed`, `Pending`, etc.
   - Check error codes if failed

### 2. Verify Phone Number Format
- **Sent to:** `+18146950813` (formatted from `(814) 6950813`)
- **Sent from:** `+18339675959` (Azure phone number)
- Verify E.164 format is correct

### 3. Check Azure SMS Configuration
- **Test Mode:** Azure may be in "test mode" which only allows verified numbers
- **Phone Number Registration:** Verify `+18339675959` is registered and active
- **Geographic Restrictions:** Check if there are any geographic restrictions
- **Carrier Issues:** Some carriers may reject or delay SMS

### 4. Check Azure Service Health
- Azure Portal → Service Health
- Check for any SMS service outages or issues
- Review Azure Communication Services status page

### 5. Enhanced Logging Added
- Full Azure API response logging (shows complete result object)
- Phone number formatting details (original → formatted)
- Full message content logging
- HTTP status code details

**Next Steps:**
1. Check Azure Portal for delivery status
2. Verify phone number is correct and not blocked
3. Check if Azure is in test mode
4. Create another test trip to see enhanced logging

