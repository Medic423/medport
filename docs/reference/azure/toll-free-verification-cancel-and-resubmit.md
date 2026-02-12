# Cancel and Resubmit Toll-Free Verification Application

**Created:** February 3, 2026  
**Purpose:** Step-by-step guide for canceling existing application and resubmitting with correct production URLs  
**Status:** Active

---

## Current Application to Cancel

- **Application ID:** `513670f8-6b42-4ead-8973-ae2a58ba7096`
- **Status:** Submitted (6+ weeks)
- **Phone Number:** `+18339675959`
- **Issue:** Cannot edit, cannot submit support ticket, needs to resubmit with production URLs

---

## Step 1: Cancel Existing Application

### In Azure Portal

1. **Navigate to Regulatory Documents:**
   - Go to: **Communication Services** → **TraccComms**
   - Click: **Regulatory Documents** (in left menu)

2. **Cancel the Application:**
   - Find application: `513670f8-6b42-4ead-8973-ae2a58ba7096`
   - Click **"Cancel"** button
   - In the dialog, click **"Send an email"** button

3. **Email to Cancel:**

**To:** `acstnrequest@microsoft.com`

**Subject:** Cancel Toll-Free Verification Application 513670f8-6b42-4ead-8973-ae2a58ba7096

**Body:**
```
Please cancel the following toll-free verification application:

Application ID: 513670f8-6b42-4ead-8973-ae2a58ba7096
Subscription ID: fb5dde6b-779f-4ef5-b457-4b4d087a48ee
Resource Group: DefaultResourceGroup-EUS2
Resource Name: TraccComms
Phone Number: +18339675959

Reason: Application has been in "Submitted" status for 6+ weeks and cannot be 
edited. We need to resubmit with correct production URLs (traccems.com) instead 
of development URLs that were used in the original submission.

We will submit a new application immediately after cancellation with the correct 
production URLs.

Thank you.
```

4. **Send the email and wait for confirmation** (usually 1-2 business days)

---

## Step 2: Verify URLs Before Resubmitting

**Before creating new application, verify all URLs are accessible:**

```bash
./scripts/verify-toll-free-urls.sh
```

**Required URLs (all must return HTTP 200):**
- ✅ Website: `https://traccems.com`
- ✅ Privacy Policy: `https://traccems.com/privacy-policy`
- ✅ Terms: `https://traccems.com/terms`

---

## Step 3: Create New Application

**Wait for cancellation confirmation, then immediately create new application:**

### Step 3.1: Start New Application

1. In **Regulatory Documents** blade, click **"+ Add"** button
2. This launches the toll-free verification wizard

### Step 3.2: Section 1 - Application Type

- [ ] **Country/Region:** United States of America
- [ ] **Toll-free Numbers:** Select `+18339675959`
- [ ] Verify number is selected correctly
- [ ] Click **Next** or **Continue**

### Step 3.3: Section 2 - Company Details

**Fill in all required fields:**

- [ ] **Company Name:** [Enter your company name]
- [ ] **Business Address:** [Enter full business address]
- [ ] **Tax ID / Business Registration:** [Enter tax ID or registration number]
- [ ] **Contact Email:** [Enter email that will be monitored for status updates]
- [ ] **Contact Phone:** [Enter contact phone number]

**Important:** Use the same information from your previous application (if it was correct) or update if needed.

- [ ] Review all fields
- [ ] Click **Next** or **Continue**

### Step 3.4: Section 3 - Program Details (CRITICAL)

**⚠️ THIS IS THE MOST IMPORTANT SECTION - USE PRODUCTION URLs ONLY**

- [ ] **Purpose of SMS:** "Trip notifications for EMS dispatch"
- [ ] **Message Types:** Transactional notifications
- [ ] **Opt-in Method:** Account settings (EMS agency settings page)
- [ ] **Opt-in URL:** `https://traccems.com/ems-dashboard` (Settings tab)

**Website Information (CRITICAL - MUST USE PRODUCTION):**
- [ ] **Website URL:** `https://traccems.com` ✅ (NOT dev-swa.traccems.com)
- [ ] **Privacy Policy URL:** `https://traccems.com/privacy-policy` ✅
- [ ] **Terms and Conditions URL:** `https://traccems.com/terms` ✅

**Opt-in Screenshot:**
- [ ] Take screenshot from `https://traccems.com/ems-dashboard` → Settings tab
- [ ] Screenshot shows "SMS Notifications" section with checkbox
- [ ] Upload to cloud storage (OneDrive/Google Drive/Dropbox)
- [ ] Get public shareable link
- [ ] Paste link in the form

**Reference:** [`azure-sms-opt-in-screenshot-guide.md`](azure-sms-opt-in-screenshot-guide.md)

- [ ] Review all fields carefully
- [ ] **Double-check all URLs use `traccems.com` (NOT dev-swa)**
- [ ] Click **Next** or **Continue**

### Step 3.5: Section 4 - Volume

- [ ] **Message Volume:** [Estimate - e.g., 100-500 messages/month]
- [ ] **Peak Volume:** [Estimate - e.g., 50-100 messages/day]
- [ ] **Message Frequency:** Transactional (sent as trips are created, not scheduled)

- [ ] Review and verify estimates are reasonable
- [ ] Click **Next** or **Continue**

### Step 3.6: Section 5 - Templates

**Provide sample SMS message templates:**

**Template 1 (Primary):**
```
TraccEMS: 🚑 NEW TRIP CREATED
Trip #TRP-1234567890
PatientID: PAT-ABC123
Level: ALS
Priority: HIGH
From: General Hospital - Main Campus
To: Regional Medical Center
Ready: 2:30 PM
```

**Template 2 (Short Format):**
```
TraccEMS: New trip #TRP-1234567890 - ALS HIGH priority. From: General Hospital. Ready: 2:30 PM
```

**Template 3 (Opt-out Confirmation):**
```
TraccEMS: You have been unsubscribed from trip notifications. Reply START to resubscribe or visit your account settings.
```

**Template 4 (Opt-in Confirmation):**
```
TraccEMS: You are subscribed to trip notifications. Reply STOP to unsubscribe. Message and data rates may apply.
```

**Reference:** [`azure-sms-message-templates.md`](azure-sms-message-templates.md)

- [ ] All templates start with "TraccEMS:"
- [ ] Templates are clear and compliant
- [ ] Click **Next** or **Continue**

### Step 3.7: Review and Submit

**Before submitting, verify:**

- [ ] All 5 sections completed
- [ ] **Website URL is `https://traccems.com`** (critical check)
- [ ] **Privacy Policy URL is `https://traccems.com/privacy-policy`** (critical check)
- [ ] **Terms URL is `https://traccems.com/terms`** (critical check)
- [ ] All URLs verified accessible (ran verification script)
- [ ] Opt-in screenshot from production site
- [ ] All information accurate
- [ ] Contact email is monitored

**Submit the application:**
- [ ] Click **"Submit"** button
- [ ] Record new Application ID: _______________________
- [ ] Record submission date: _______________________

---

## Step 4: Post-Submission

### Record Details

- [ ] **New Application ID:** _______________________
- [ ] **Submission Date:** _______________________
- [ ] **Initial Status:** _______________________
- [ ] **Expected Review Date:** _______________________ (3 business days from submission)

### Set Reminders

- [ ] Reminder set to check status in 3 business days
- [ ] Email notifications enabled/monitored
- [ ] Daily check scheduled for first week

### Monitoring

**Check status daily (first week):**
- [ ] Azure Portal → Communication Services → TraccComms → Regulatory Documents
- [ ] Look for status updates or comments
- [ ] Monitor email (including spam) for Azure notifications
- [ ] Note any status changes with dates

**Expected Timeline:**
- **Processing Time:** Usually 1-3 business days
- **If longer than 1 week:** This is unusual, may need to contact support
- **If longer than 2 weeks:** Escalate or contact support

---

## Step 5: If Approved

✅ **SMS will start delivering automatically**

**Verification Steps:**
1. Test by creating a trip with `notificationRadius` set
2. Check Azure Portal → SMS logs for delivery status
3. Verify EMS agencies receive SMS messages
4. Monitor SMS delivery success rate

---

## Step 6: If Rejected

1. **Review Rejection Comments:**
   - Read all comments carefully
   - Note specific issues mentioned
   - Address each issue systematically

2. **Update Application:**
   - If status allows editing, click Edit
   - Fix all issues mentioned in rejection
   - Update URLs if needed
   - Resubmit with corrections

3. **Document Rejection Reasons:**
   - Keep record of rejection reasons
   - Update documentation with lessons learned

---

## Quick Reference

**Application to Cancel:**
- Application ID: `513670f8-6b42-4ead-8973-ae2a58ba7096`
- Cancel Email: `acstnrequest@microsoft.com`

**New Application:**
- Phone Number: `+18339675959`
- Use production URLs only: `traccems.com`

**Critical URLs (PRODUCTION ONLY):**
- Website: `https://traccems.com`
- Privacy Policy: `https://traccems.com/privacy-policy`
- Terms: `https://traccems.com/terms`

**Verification Script:**
```bash
./scripts/verify-toll-free-urls.sh
```

**Direct Portal URL:**
```
https://portal.azure.com/#@traccems.com/resource/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourceGroups/DefaultResourceGroup-EUS2/providers/Microsoft.Communication/CommunicationServices/TraccComms/regulatory_documents
```

---

## Common Mistakes to Avoid

❌ **DO NOT use development URLs:**
- `dev-swa.traccems.com` - Will cause rejection
- Any URL with "dev" in it

✅ **DO use production URLs:**
- `https://traccems.com` - Correct
- `https://traccems.com/privacy-policy` - Correct
- `https://traccems.com/terms` - Correct

❌ **DO NOT submit without verifying URLs:**
- Always run verification script first
- Test URLs in browser
- Ensure all return HTTP 200

✅ **DO verify before submitting:**
- Run `./scripts/verify-toll-free-urls.sh`
- Check all URLs return HTTP 200
- Verify opt-in screenshot is from production site

---

## Checklist Summary

**Before Canceling:**
- [ ] Prepare cancellation email
- [ ] Have all application details ready

**After Canceling:**
- [ ] Wait for cancellation confirmation (1-2 business days)
- [ ] Verify URLs are accessible
- [ ] Prepare opt-in screenshot from production site
- [ ] Review message templates

**When Creating New Application:**
- [ ] Use production URLs throughout
- [ ] Double-check all URLs before submitting
- [ ] Complete all 5 sections
- [ ] Review everything before submitting

**After Submitting:**
- [ ] Record new Application ID
- [ ] Set reminders to check status
- [ ] Monitor email for notifications
- [ ] Check status daily (first week)

---

**Last Updated:** February 3, 2026  
**Status:** Ready to Cancel and Resubmit
