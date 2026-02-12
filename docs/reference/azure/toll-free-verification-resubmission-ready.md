# Toll-Free Verification Resubmission - Ready Status

**Created:** February 3, 2026  
**Status:** Cancellation Requested - Awaiting Confirmation  
**Next Action:** Resubmit after cancellation confirmed

---

## ✅ Completed Steps

### Step 1: Cancellation Email Sent ✅
- **Date:** February 3, 2026
- **Email To:** `acstnrequest@microsoft.com`
- **Application ID:** `513670f8-6b42-4ead-8973-ae2a58ba7096`
- **Status:** Email sent, awaiting confirmation

### Step 2: URL Verification ✅
- **Date:** February 3, 2026
- **Website:** `https://traccems.com` ✅ HTTP 200
- **Privacy Policy:** `https://traccems.com/privacy-policy` ✅ HTTP 200
- **Terms:** `https://traccems.com/terms` ✅ HTTP 200
- **SSL Certificate:** ✅ Valid
- **DNS Resolution:** ✅ Resolves correctly

**All URLs verified and ready for submission!**

---

## ⏳ Current Status: Waiting for Cancellation Confirmation

**Expected Timeline:** 1-2 business days

**What to do while waiting:**
1. ✅ URLs already verified - no action needed
2. ⏳ Prepare opt-in screenshot (if not already done)
3. ⏳ Review message templates
4. ⏳ Gather company information for new application

---

## 📋 Next Steps: After Cancellation Confirmed

### Step 1: Verify Cancellation

- [ ] Check email for cancellation confirmation from Microsoft
- [ ] Check Azure Portal → Regulatory Documents
- [ ] Confirm old application status shows "Canceled" or is removed
- [ ] Proceed to Step 2

### Step 2: Prepare Opt-in Screenshot

- [ ] Go to `https://traccems.com/ems-dashboard`
- [ ] Log in as EMS user
- [ ] Navigate to Settings tab
- [ ] Scroll to "SMS Notifications" section
- [ ] Take screenshot showing:
  - "SMS Notifications" section header
  - Checkbox: "Receive SMS notifications for new trip requests"
  - Description text
  - Save button
- [ ] Upload screenshot to cloud storage (OneDrive/Google Drive/Dropbox)
- [ ] Get public shareable link
- [ ] Test link (ensure accessible without login)

**Reference:** [`azure-sms-opt-in-screenshot-guide.md`](azure-sms-opt-in-screenshot-guide.md)

### Step 3: Review Message Templates

- [ ] Review templates in [`azure-sms-message-templates.md`](azure-sms-message-templates.md)
- [ ] Prepare to copy/paste templates into application form
- [ ] Ensure all templates start with "TraccEMS:"

**Quick Template Reference:**

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

**Template 2 (Short):**
```
TraccEMS: New trip #TRP-1234567890 - ALS HIGH priority. From: General Hospital. Ready: 2:30 PM
```

**Template 3 (Opt-out):**
```
TraccEMS: You have been unsubscribed from trip notifications. Reply START to resubscribe or visit your account settings.
```

**Template 4 (Opt-in):**
```
TraccEMS: You are subscribed to trip notifications. Reply STOP to unsubscribe. Message and data rates may apply.
```

### Step 4: Gather Company Information

- [ ] Company Name: _______________________
- [ ] Business Address: _______________________
- [ ] Tax ID / Business Registration: _______________________
- [ ] Contact Email: _______________________ (monitored email)
- [ ] Contact Phone: _______________________

**Note:** Use same information from previous application if it was correct.

### Step 5: Create New Application

**Follow complete guide:** [`toll-free-verification-cancel-and-resubmit.md`](toll-free-verification-cancel-and-resubmit.md)

**Quick Checklist:**
- [ ] Click "+ Add" in Regulatory Documents
- [ ] Section 1: Application Type (United States, +18339675959)
- [ ] Section 2: Company Details (all fields filled)
- [ ] Section 3: Program Details (CRITICAL - use production URLs)
  - [ ] Website: `https://traccems.com` ✅
  - [ ] Privacy Policy: `https://traccems.com/privacy-policy` ✅
  - [ ] Terms: `https://traccems.com/terms` ✅
  - [ ] Opt-in screenshot link provided
- [ ] Section 4: Volume (estimates provided)
- [ ] Section 5: Templates (all 4 templates provided)
- [ ] Review all sections
- [ ] **Double-check all URLs use `traccems.com` (NOT dev-swa)**
- [ ] Submit application
- [ ] Record new Application ID: _______________________

---

## 🎯 Critical Reminders

### ⚠️ MUST USE PRODUCTION URLs

**✅ CORRECT:**
- `https://traccems.com`
- `https://traccems.com/privacy-policy`
- `https://traccems.com/terms`

**❌ WRONG (Will cause rejection):**
- `dev-swa.traccems.com`
- `https://dev-swa.traccems.com/privacy-policy`
- Any URL with "dev" in it

### ⚠️ Before Submitting

- [ ] Run URL verification: `./scripts/verify-toll-free-urls.sh`
- [ ] All URLs return HTTP 200 ✅ (Already done!)
- [ ] Opt-in screenshot from production site
- [ ] All 5 sections completed
- [ ] All URLs double-checked

---

## 📞 Quick Reference

**Application to Cancel:**
- Application ID: `513670f8-6b42-4ead-8973-ae2a58ba7096`
- Status: Cancellation requested (awaiting confirmation)

**New Application:**
- Phone Number: `+18339675959`
- Production URLs: All verified ✅

**Direct Portal URL:**
```
https://portal.azure.com/#@traccems.com/resource/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourceGroups/DefaultResourceGroup-EUS2/providers/Microsoft.Communication/CommunicationServices/TraccComms/regulatory_documents
```

**Verification Script:**
```bash
./scripts/verify-toll-free-urls.sh
```

---

## 📅 Timeline

**Completed:**
- ✅ Cancellation email sent (Feb 3, 2026)
- ✅ URLs verified (Feb 3, 2026)

**Next:**
- ⏳ Wait for cancellation confirmation (1-2 business days)
- ⏳ Prepare opt-in screenshot
- ⏳ Create new application with production URLs
- ⏳ Submit new application
- ⏳ Wait for review (1-3 business days)

**Expected Total Time:**
- Cancellation: 1-2 business days
- New Application Review: 1-3 business days
- **Total: 2-5 business days**

---

## 📚 Documentation References

- **Complete Resubmission Guide:** [`toll-free-verification-cancel-and-resubmit.md`](toll-free-verification-cancel-and-resubmit.md)
- **Checklist:** [`toll-free-verification-checklist.md`](toll-free-verification-checklist.md)
- **Opt-in Screenshot:** [`azure-sms-opt-in-screenshot-guide.md`](azure-sms-opt-in-screenshot-guide.md)
- **Message Templates:** [`azure-sms-message-templates.md`](azure-sms-message-templates.md)
- **Troubleshooting:** [`toll-free-verification-troubleshooting-guide.md`](toll-free-verification-troubleshooting-guide.md)

---

**Last Updated:** February 3, 2026  
**Status:** Ready to Resubmit After Cancellation Confirmed
