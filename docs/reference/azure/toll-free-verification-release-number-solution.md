# Solution: Release Phone Number and Start Fresh

**Created:** February 3, 2026  
**Proposed Solution:** Release toll-free number to free it from stuck application, then acquire new number  
**Status:** Under Evaluation

---

## Proposed Solution

**Current Situation:**
- Phone number `+18339675959` is attached to stuck application `513670f8-6b42-4ead-8973-ae2a58ba7096`
- Cannot cancel application via email or portal support
- Cannot create new application (phone number already in use)
- Number is not actively being used for SMS (only listed in application)

**Proposed Approach:**
1. Release phone number `+18339675959` from Communication Services resource
2. This should free the number from the regulatory documents application
3. Acquire a new toll-free number
4. Create fresh application with new number and correct production URLs

---

## Evaluation

### ✅ Advantages

1. **Bypasses cancellation issues:**
   - No need to cancel stuck application
   - No need for support intervention
   - No email/portal support limitations

2. **Clean start:**
   - Fresh application with correct URLs from the beginning
   - No legacy issues from old application
   - New Application ID (clean record)

3. **Faster resolution:**
   - Can be done immediately in portal
   - No waiting for support response
   - No waiting for cancellation confirmation

4. **Number not in use:**
   - Number is only listed in application, not actively used
   - No impact on current SMS functionality (not verified yet)
   - Safe to release

### ⚠️ Considerations

1. **Will releasing number remove application?**
   - **Unknown:** Need to verify if releasing number automatically cancels/removes application
   - **Risk:** Application might remain stuck even after number released
   - **Mitigation:** Check portal after release to confirm application status

2. **New number acquisition:**
   - **Question:** Can you easily acquire a new toll-free number?
   - **Cost:** May have number acquisition fees
   - **Availability:** Toll-free numbers may have limited availability
   - **Time:** May take time to provision new number

3. **Application history:**
   - **Loss:** Old application history will be lost
   - **Impact:** Minimal - application was stuck anyway
   - **Benefit:** Clean slate

4. **Configuration updates:**
   - **Required:** Will need to update environment variables with new number
   - **Files:** Backend `.env` files, GitHub Secrets, Azure App Service config
   - **Impact:** Moderate - need to update in multiple places

---

## Step-by-Step Process

### Step 1: Release Current Phone Number

1. **Navigate to Phone Numbers:**
   - Go to: https://portal.azure.com/#@traccems.com/resource/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourceGroups/DefaultResourceGroup-EUS2/providers/Microsoft.Communication/CommunicationServices/TraccComms/tools_phonenumbers
   - Or: Communication Services → TraccComms → Phone numbers

2. **Find the number:**
   - Look for `+18339675959`
   - Check current status

3. **Release the number:**
   - Click on the number
   - Look for **"Release"** or **"Delete"** button
   - Confirm release
   - **Note:** This may take a few minutes to process

4. **Verify release:**
   - Confirm number is removed from your resource
   - Check Regulatory Documents to see if application is affected

### Step 2: Verify Application Status

1. **Check Regulatory Documents:**
   - Go to: Regulatory Documents blade
   - Check status of application `513670f8-6b42-4ead-8973-ae2a58ba7096`
   - **Expected:** Application may be removed or show error (number not found)

2. **If application still exists:**
   - May need to manually delete/remove it
   - Or it may be automatically cleaned up
   - Document what happens

### Step 3: Acquire New Toll-Free Number

1. **Go to Phone Numbers:**
   - Communication Services → TraccComms → Phone numbers
   - Click **"Get phone number"** or **"Acquire"**

2. **Select number type:**
   - Choose **Toll-free** number
   - Select country: **United States**

3. **Search and select:**
   - Browse available toll-free numbers
   - Select a number
   - Complete acquisition process

4. **Record new number:**
   - **New Phone Number:** _______________________
   - **Acquisition Date:** _______________________

### Step 4: Update Configuration

**⚠️ IMPORTANT:** Update all references to old number with new number.

#### Backend Environment Variables

**Files to update:**
- `backend/.env` (if exists)
- `backend/.env.production` (if exists)
- GitHub Secrets (for deployments)
- Azure App Service configuration

**Variable to update:**
```bash
AZURE_COMMUNICATION_PHONE_NUMBER=<new-number>
```

**Example:**
```bash
# Old
AZURE_COMMUNICATION_PHONE_NUMBER=+18339675959

# New
AZURE_COMMUNICATION_PHONE_NUMBER=+1XXXXXXXXXX
```

#### Update Locations

1. **Local development:**
   - [ ] `backend/.env` file
   - [ ] Any local config files

2. **GitHub Secrets:**
   - [ ] Go to GitHub → Repository → Settings → Secrets
   - [ ] Update `AZURE_COMMUNICATION_PHONE_NUMBER` secret
   - [ ] Update for all environments (dev, prod)

3. **Azure App Services:**
   - [ ] TraccEms-Dev-Backend → Configuration → Application settings
   - [ ] TraccEms-Prod-Backend → Configuration → Application settings
   - [ ] Update `AZURE_COMMUNICATION_PHONE_NUMBER` environment variable

4. **Documentation:**
   - [ ] Update any docs referencing the old number
   - [ ] Update this guide with new number

### Step 5: Create New Application

1. **Go to Regulatory Documents:**
   - Communication Services → TraccComms → Regulatory Documents
   - Click **"+ Add"**

2. **Select new phone number:**
   - Should now be able to select new number
   - Verify new number is available

3. **Complete application:**
   - Follow: [`toll-free-verification-cancel-and-resubmit.md`](toll-free-verification-cancel-and-resubmit.md)
   - **CRITICAL:** Use production URLs throughout:
     - Website: `https://traccems.com`
     - Privacy Policy: `https://traccems.com/privacy-policy`
     - Terms: `https://traccems.com/terms`

4. **Submit application:**
   - Record new Application ID: _______________________
   - Record submission date: _______________________

---

## Risk Assessment

### Low Risk ✅

- **Number not in use:** Currently not sending SMS (not verified)
- **Clean start:** Fresh application with correct URLs
- **No data loss:** No active SMS functionality to lose

### Medium Risk ⚠️

- **Configuration updates:** Need to update multiple places
- **New number availability:** May need to wait for number provisioning
- **Application status:** Unknown if releasing number removes application

### Mitigation Strategies

1. **Before releasing:**
   - Document current configuration
   - Note all places where number is referenced
   - Have new number acquisition process ready

2. **During release:**
   - Monitor portal for changes
   - Document what happens to application
   - Verify number is actually released

3. **After release:**
   - Immediately acquire new number
   - Update all configurations
   - Create new application promptly

---

## Comparison: Release Number vs. Cancel Application

| Aspect | Release Number | Cancel Application |
|--------|---------------|-------------------|
| **Speed** | ✅ Immediate (portal) | ⏳ 1-2 days (support) |
| **Reliability** | ⚠️ Unknown if removes app | ✅ Confirmed cancellation |
| **Complexity** | ⚠️ Need new number + config | ✅ Keep same number |
| **Cost** | ⚠️ May have number fees | ✅ No additional cost |
| **Configuration** | ⚠️ Update multiple places | ✅ No changes needed |
| **Risk** | ⚠️ Unknown behavior | ✅ Known process |

---

## Recommendation

### ✅ **This is a viable solution IF:**

1. **You can easily acquire a new toll-free number**
2. **You're comfortable updating configuration in multiple places**
3. **You want to avoid waiting for support**
4. **The number is truly not in use**

### ⚠️ **Consider phone support first IF:**

1. **You want to keep the same number**
2. **You want to avoid configuration changes**
3. **You prefer a known, documented process**

---

## Decision Matrix

**Choose Release Number if:**
- ✅ Support call doesn't work or takes too long
- ✅ You want immediate action
- ✅ New number acquisition is easy
- ✅ Configuration updates are manageable

**Choose Cancel Application if:**
- ✅ Support can help quickly
- ✅ You want to keep same number
- ✅ You want to avoid config changes
- ✅ You prefer documented process

---

## Action Plan

### Option A: Try Release Number First (Fast Track)

1. **Release number** (5 minutes)
2. **Verify application status** (2 minutes)
3. **Acquire new number** (5-15 minutes)
4. **Update configuration** (15-30 minutes)
5. **Create new application** (30 minutes)
6. **Total:** ~1-2 hours

### Option B: Try Support First (Safer)

1. **Call support** (30-60 minutes)
2. **Wait for cancellation** (1-2 business days)
3. **Create new application** (30 minutes)
4. **Total:** 1-3 business days

---

## Quick Reference

**Current Number:** `+18339675959`  
**Current Application:** `513670f8-6b42-4ead-8973-ae2a58ba7096`

**Phone Numbers Page:**
```
https://portal.azure.com/#@traccems.com/resource/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourceGroups/DefaultResourceGroup-EUS2/providers/Microsoft.Communication/CommunicationServices/TraccComms/tools_phonenumbers
```

**Configuration to Update:**
- `AZURE_COMMUNICATION_PHONE_NUMBER` environment variable
- GitHub Secrets
- Azure App Service configs
- Documentation

---

**Last Updated:** February 3, 2026  
**Status:** Viable Solution - Evaluate Based on Preferences
