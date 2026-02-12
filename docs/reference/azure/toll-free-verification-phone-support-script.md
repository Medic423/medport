# Phone Support Script: Cancel Toll-Free Verification Application

**Created:** February 3, 2026  
**Issue:** Cannot create new application - phone number attached to existing application  
**Action:** Call Azure Support to cancel existing application

---

## Confirmed Issue

**Finding:** Azure does NOT allow multiple applications for the same phone number.

**Evidence:**
- Tried creating new application
- Cannot select phone number `+18339675959`
- Phone number is attached to existing application: `513670f8-6b42-4ead-8973-ae2a58ba7096`

**Conclusion:** Must cancel existing application before creating new one.

---

## Phone Support Information

**Azure Support Phone:** 1-800-867-1389  
**Hours:** Monday-Friday, 6:00 AM - 6:00 PM PST

**Call Time:** Allow 30-60 minutes for call and resolution

---

## Information to Have Ready

**Before calling, have this information ready:**

- **Application ID:** `513670f8-6b42-4ead-8973-ae2a58ba7096`
- **Subscription ID:** `fb5dde6b-779f-4ef5-b457-4b4d087a48ee`
- **Resource Group:** `DefaultResourceGroup-EUS2`
- **Resource Name:** `TraccComms`
- **Phone Number:** `+18339675959`
- **Your Azure account email/ID:** _______________________
- **Portal URL:** https://portal.azure.com/#@traccems.com/resource/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourceGroups/DefaultResourceGroup-EUS2/providers/Microsoft.Communication/CommunicationServices/TraccComms/regulatory_documents

---

## Phone Call Script

### Opening

**You:** "Hello, I need help canceling a toll-free verification application in Azure Communication Services. The application has been stuck in 'Submitted' status for over 6 weeks and I cannot cancel it through the portal."

**Support:** [Will ask for details]

### Provide Details

**You:** "Here are the details:

- **Application ID:** 513670f8-6b42-4ead-8973-ae2a58ba7096
- **Subscription ID:** fb5dde6b-779f-4ef5-b457-4b4d087a48ee
- **Resource:** TraccComms
- **Phone Number:** +18339675959

The application was submitted with development URLs (dev-swa.traccems.com) but our production domain (traccems.com) is now live. I need to cancel this application and resubmit with the correct production URLs."

### Explain the Problem

**You:** "I've tried multiple ways to cancel:

1. **Email:** Tried emailing acstnrequest@microsoft.com but received 'Access denied' error (550 5.4.1)
2. **Portal Support:** Cannot submit support ticket due to subscription limitations
3. **New Application:** Tried creating a new application but cannot select the phone number because it's already attached to the existing application
4. **Edit:** Cannot edit the application - no Edit button available

The application has been in 'Submitted' status for 6+ weeks, which is unusually long. Normal review time is 1-3 business days."

### Request

**You:** "I need you to cancel application 513670f8-6b42-4ead-8973-ae2a58ba7096 so I can create a new application with the correct production URLs (traccems.com). Can you help me cancel it?"

### If Support Asks Why

**You:** "The original application was submitted with development URLs that Azure's verification system cannot access. Our production domain is now live and accessible. I've verified all URLs are working:
- Website: https://traccems.com (HTTP 200)
- Privacy Policy: https://traccems.com/privacy-policy (HTTP 200)
- Terms: https://traccems.com/terms (HTTP 200)

I need to resubmit with these correct URLs."

### If Support Says They Can't Cancel

**You:** "Is there another way to proceed? The application has been stuck for 6+ weeks and I cannot use the phone number for a new application. What are my options?"

**Possible responses:**
- They may escalate to a specialist
- They may provide an alternative email address
- They may suggest waiting longer (not ideal after 6+ weeks)
- They may provide a workaround

### If Support Confirms Cancellation

**You:** "Thank you. How long will the cancellation take? When can I create a new application?"

**Expected:** Usually 1-2 business days, but ask for confirmation.

**You:** "After cancellation is confirmed, I'll create a new application immediately with the correct production URLs. Thank you for your help."

---

## After the Call

### If Cancellation Confirmed

1. **Record confirmation:**
   - [ ] Support agent name: _______________________
   - [ ] Ticket/reference number: _______________________
   - [ ] Expected cancellation date: _______________________
   - [ ] Confirmation method: Email / Portal update / Other

2. **Set reminders:**
   - [ ] Check Azure Portal in 1 business day
   - [ ] Check email for cancellation confirmation
   - [ ] Set reminder to create new application after cancellation

3. **Prepare for resubmission:**
   - [ ] URLs already verified ✅
   - [ ] Prepare opt-in screenshot (if not done)
   - [ ] Review message templates
   - [ ] Have company information ready

### If Cancellation Not Possible

1. **Ask for alternatives:**
   - Can they update the URLs directly?
   - Is there another support channel?
   - Can they escalate to a specialist?

2. **Document the response:**
   - Record what support said
   - Note any alternative options provided
   - Consider next steps (see below)

---

## Alternative: Delete Application (Last Resort)

**⚠️ WARNING:** Only try this if phone support cannot help.

### Check Delete Option

1. **In Azure Portal:**
   - Go to: Regulatory Documents
   - Find application: `513670f8-6b42-4ead-8973-ae2a58ba7096`
   - Look for **"Delete"** button (may be in Actions menu or right-click)

2. **If Delete button exists:**
   - Click Delete
   - Confirm deletion
   - **Note:** This may permanently remove the application
   - After deletion, try creating new application

3. **If Delete doesn't work or doesn't exist:**
   - This confirms you need support to cancel
   - Document this for support call

### Risks of Deleting

- ⚠️ May permanently remove application history
- ⚠️ May not free up phone number immediately
- ⚠️ May require support intervention anyway
- ✅ But might work if portal allows it

**Recommendation:** Try phone support first, then delete only if support cannot help.

---

## Next Steps Summary

### Step 1: Call Support ⭐ (Do This First)

- [ ] Call 1-800-867-1389
- [ ] Use script above
- [ ] Request cancellation
- [ ] Record confirmation details
- [ ] Wait for cancellation (1-2 business days)

### Step 2: After Cancellation Confirmed

- [ ] Verify cancellation in Azure Portal
- [ ] Create new application with production URLs
- [ ] Submit new application
- [ ] Monitor status

### Step 3: If Support Cannot Help

- [ ] Try Delete button in portal (if available)
- [ ] If Delete works, create new application
- [ ] If Delete doesn't work, escalate with support

---

## Quick Reference

**Phone:** 1-800-867-1389  
**Hours:** Monday-Friday, 6:00 AM - 6:00 PM PST

**Application ID:** `513670f8-6b42-4ead-8973-ae2a58ba7096`  
**Phone Number:** `+18339675959`  
**Subscription ID:** `fb5dde6b-779f-4ef5-b457-4b4d087a48ee`

**Production URLs (Ready):**
- Website: `https://traccems.com` ✅
- Privacy Policy: `https://traccems.com/privacy-policy` ✅
- Terms: `https://traccems.com/terms` ✅

---

**Last Updated:** February 3, 2026  
**Status:** Ready to Call Support
