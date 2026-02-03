# Azure Toll-Free Verification Troubleshooting Guide

**Created:** February 3, 2026  
**Purpose:** Comprehensive guide for troubleshooting stalled toll-free verification applications  
**Status:** Active

---

## Current Application Status

**Application Details:**
- **Application ID:** `513670f8-6b42-4ead-8973-ae2a58ba7096`
- **Phone Number:** `+18339675959`
- **Original Submission:** December 9, 2025
- **Rejection Date:** December 12, 2025 (reason: "invalid or inaccessible website url")
- **Resubmission:** ~6 weeks ago (mid-December 2025)
- **Current Status:** Unknown - appears stalled

**Azure Resource:**
- **Subscription ID:** `fb5dde6b-779f-4ef5-b457-4b4d087a48ee`
- **Resource Group:** `DefaultResourceGroup-EUS2`
- **Resource Name:** `TraccComms`

**Direct Portal URL:**
```
https://portal.azure.com/#@traccems.com/resource/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourceGroups/DefaultResourceGroup-EUS2/providers/Microsoft.Communication/CommunicationServices/TraccComms/regulatory_documents
```

---

## Phase 1: Check Current Application Status

### Step 1.1: Access Azure Portal Regulatory Documents

1. Navigate to Azure Portal: https://portal.azure.com
2. Go to: **Communication Services** → **TraccComms**
3. In the left menu, find **"Regulatory Documents"** blade
4. Click on **"Regulatory Documents"** to view all applications

**OR** use the direct URL above to access regulatory documents directly.

### Step 1.2: Check Application Status

Look for application with ID `513670f8-6b42-4ead-8973-ae2a58ba7096` and note:

- **Current Status:** (Pending, Under Review, Update Requested, Rejected, Approved, Draft)
- **Last Updated Date:** When was it last modified?
- **Comments/Notes:** Any new comments from Azure reviewers?
- **Available Actions:** What buttons are available? (Edit, Update, Resubmit, New Application)

### Step 1.3: Status Interpretation Guide

**Status Meanings:**

| Status | Meaning | Action Required |
|--------|---------|----------------|
| **"Update Requested"** | Azure needs changes but portal editing disabled | Must contact Azure Support (cannot edit in portal) |
| **"Rejected"** | Application was rejected | May be able to edit and resubmit if Edit button available |
| **"Pending"** | Application submitted, awaiting review | Wait or contact support if > 1 week |
| **"Under Review"** | Currently being reviewed by Azure | Wait for review completion (1-3 business days) |
| **"Draft"** | Application not yet submitted | Can edit and submit |
| **"Approved"** | Application approved | ✅ SMS should be working |

### Step 1.4: Document Current State

Before proceeding, record:

- [ ] Exact status message
- [ ] Date of last status change
- [ ] Any error messages or warnings displayed
- [ ] Available action buttons (Edit, Update, Resubmit, New Application, etc.)
- [ ] Any comments or notes from Azure reviewers
- [ ] Email notifications received (check spam folder)

---

## Phase 2: Determine Resubmission Path

### Scenario A: Application Can Be Edited/Resubmitted

**If status is "Rejected" or "Draft" and Edit/Update button is available:**

1. Click **"Edit"** or **"Update"** button on the application
2. Follow the detailed resubmission guide: [`toll-free-verification-resubmission.md`](toll-free-verification-resubmission.md)
3. **Critical Updates Required:**
   - **Website URL:** Change to `https://traccems.com` (from `dev-swa.traccems.com`)
   - **Privacy Policy URL:** `https://traccems.com/privacy-policy`
   - **Terms URL:** `https://traccems.com/terms`
   - **Opt-in Screenshot:** Update if needed (from production site)
4. Review all 5 sections:
   - Application Type
   - Company Details
   - Program Details
   - Volume
   - Templates
5. Submit the updated application

**Verification Script:**
Before submitting, run the URL verification script:
```bash
./scripts/verify-toll-free-urls.sh
```

### Scenario B: Application Status is "Update Requested"

**If status shows "Update Requested":**

⚠️ **CRITICAL:** According to Azure documentation, you **cannot edit directly in the portal** when status is "Update Requested". You must contact Azure Support.

#### Step 1: Raise Azure Support Ticket

1. Go to Azure Portal → **Help + Support** → **New support request**
2. **Issue type:** Technical
3. **Service:** Communication Services
4. **Problem type:** SMS / Toll-free verification
5. **Problem subtype:** Application update/status

#### Step 2: Provide Support Ticket Details

Copy and paste this information into your support ticket:

```
Application ID: 513670f8-6b42-4ead-8973-ae2a58ba7096
Subscription ID: fb5dde6b-779f-4ef5-b457-4b4d087a48ee
Resource Group: DefaultResourceGroup-EUS2
Resource Name: TraccComms
Phone Number: +18339675959

Issue Description:
Our toll-free verification application (ID: 513670f8-6b42-4ead-8973-ae2a58ba7096) 
was submitted approximately 6 weeks ago and appears to be stalled. The application 
status shows "Update Requested" but we cannot edit it directly in the portal.

Requested Changes:
- Update website URL from dev-swa.traccems.com to https://traccems.com
- Update privacy policy URL to https://traccems.com/privacy-policy
- Update terms URL to https://traccems.com/terms

The production domain (traccems.com) is now live and accessible. We need to 
update the application with the correct production URLs to proceed with verification.

Request:
1. Please update the application with the production URLs listed above, OR
2. Enable editing capability in the portal so we can update it ourselves, OR
3. Provide guidance on how to proceed with resubmission
```

#### Step 3: Wait for Support Response

- **Expected Response Time:** 24-48 hours
- **Follow-up:** If no response in 48 hours, escalate the ticket

### Scenario C: Create New Application

**If existing application cannot be edited and status is NOT "Update Requested":**

1. In **Regulatory Documents** blade, click **"Add"** or **"New Application"**
2. This launches the toll-free verification wizard
3. Follow the original submission guide: [`azure-sms-toll-free-verification.md`](azure-sms-toll-free-verification.md)
4. **Use production URLs from the start:**
   - **Website URL:** `https://traccems.com`
   - **Privacy Policy:** `https://traccems.com/privacy-policy`
   - **Terms:** `https://traccems.com/terms`

**Note:** Before creating a new application, check with Azure Support if the old application needs to be withdrawn/cancelled first.

---

## Phase 3: Complete Application Form (New or Updated)

### Section 1: Application Type

- **Country/Region:** United States of America
- **Toll-free Numbers:** `+18339675959`
- Verify number is selected correctly

### Section 2: Company Details

- **Company Name:** [Verify from previous submission or enter]
- **Business Address:** [Verify from previous submission or enter]
- **Tax ID / Business Registration:** [Verify from previous submission or enter]
- **Contact Email:** [Point of contact for status updates - must be monitored]
- **Contact Phone:** [Verify from previous submission or enter]

### Section 3: Program Details (CRITICAL)

- **Purpose of SMS:** "Trip notifications for EMS dispatch"
- **Message Types:** Transactional notifications
- **Opt-in Method:** Account settings (EMS agency settings page)
- **Opt-in URL:** `https://traccems.com/ems-dashboard` (Settings tab)
- **Opt-in Screenshot:** 
  - Take screenshot from `https://traccems.com/ems-dashboard` → Settings tab
  - Show "SMS Notifications" section with checkbox
  - Upload to cloud storage (OneDrive/Google Drive/Dropbox)
  - Provide public shareable link
  - Reference: [`azure-sms-opt-in-screenshot-guide.md`](azure-sms-opt-in-screenshot-guide.md)

### Section 4: Volume

- **Message Volume:** [Estimate based on trip frequency - e.g., 100-500 messages/month]
- **Peak Volume:** [Estimate peak messaging needs - e.g., 50-100 messages/day]
- **Message Frequency:** Transactional (sent as trips are created, not scheduled)

### Section 5: Templates

- **Sample Messages:** Provide examples of trip notification SMS messages
- Reference existing templates: [`azure-sms-message-templates.md`](azure-sms-message-templates.md)

**Sample Template:**
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

### Critical URLs (MUST USE PRODUCTION)

✅ **Website URL:** `https://traccems.com`  
✅ **Privacy Policy:** `https://traccems.com/privacy-policy`  
✅ **Terms:** `https://traccems.com/terms`

**Verify URLs are accessible before submitting:**
```bash
curl -I https://traccems.com
curl -I https://traccems.com/privacy-policy
curl -I https://traccems.com/terms
```

All should return HTTP 200. Use the verification script: `./scripts/verify-toll-free-urls.sh`

---

## Phase 4: Submit and Monitor

### After Submission

1. **Record Application Details:**
   - [ ] New Application ID (if creating new application)
   - [ ] Submission Date
   - [ ] Initial Status
   - [ ] Expected Review Date (3 business days from submission)

2. **Set Reminders:**
   - [ ] Check status in 3 business days
   - [ ] Monitor email for notifications
   - [ ] Check Azure Portal daily for status updates

### Monitoring Checklist

**Daily Checks (for first week):**
- [ ] Azure Portal → Communication Services → TraccComms → Regulatory Documents
- [ ] Check for status updates or comments
- [ ] Check email (including spam) for Azure notifications
- [ ] Note any status changes with dates

**Expected Timeline:**
- **Processing Time:** Usually 1-3 business days
- **If longer than 1 week:** Contact Azure Support
- **If longer than 2 weeks:** Escalate support ticket

### If Approved

✅ **SMS will start delivering automatically**

**Verification Steps:**
1. Test by creating a trip with `notificationRadius` set
2. Check Azure Portal → SMS logs for delivery status
3. Verify EMS agencies receive SMS messages
4. Monitor SMS delivery success rate

### If Rejected Again

1. **Review Rejection Comments:**
   - Read all comments carefully
   - Note specific issues mentioned
   - Address each issue systematically

2. **Update Application:**
   - Fix all issues mentioned in rejection
   - Update URLs if needed
   - Resubmit with corrections

3. **Document Rejection Reasons:**
   - Keep record of rejection reasons
   - Update this guide with lessons learned

---

## Phase 5: Troubleshooting Stalled Applications

### If Application is Stuck in "Pending" or "Under Review"

**After 1 Week:**
1. **Check for Comments:**
   - Look for any comments or notes from Azure reviewers
   - Check email associated with the application for notifications
   - Check spam folder

2. **Contact Azure Support:**
   - Reference Application ID: `513670f8-6b42-4ead-8973-ae2a58ba7096`
   - Explain: Application submitted 6+ weeks ago, no status update
   - Request: Status update or guidance on next steps

**After 2 Weeks:**
3. **Escalate Support Ticket:**
   - If no response, escalate the support ticket
   - Request manager review
   - Provide all application details

4. **Consider Creating New Application:**
   - If support confirms application is lost/stuck
   - Create fresh application with correct production URLs
   - **Note:** May need to cancel/withdraw old application first (check with support)

### Common Issues and Solutions

**Issue: URLs Not Accessible**
- **Solution:** Verify URLs are accessible via curl or browser
- **Check:** DNS propagation, SSL certificates, firewall rules

**Issue: Opt-in Screenshot Rejected**
- **Solution:** Ensure screenshot shows clear opt-in mechanism
- **Check:** Screenshot is from production site, shows checkbox, includes URL

**Issue: Application Form Won't Save**
- **Solution:** Check all required fields are filled
- **Check:** No validation errors (red text)
- **Try:** Refresh page, clear browser cache

**Issue: No Status Updates**
- **Solution:** Contact Azure Support with application ID
- **Check:** Email notifications are being received
- **Monitor:** Azure Portal daily for changes

---

## Azure Support Information

**When Contacting Support, Always Provide:**

- **Campaign/Application ID:** `513670f8-6b42-4ead-8973-ae2a58ba7096`
- **Subscription ID:** `fb5dde6b-779f-4ef5-b457-4b4d087a48ee`
- **Resource Group:** `DefaultResourceGroup-EUS2`
- **Resource Name:** `TraccComms`
- **Phone Number:** `+18339675959`
- **Issue Description:** Application stalled for 6+ weeks, need to update or resubmit

**Support Portal:**
- Azure Portal → Help + Support → New support request
- Or: https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade

---

## Documentation References

- **Resubmission Guide:** [`toll-free-verification-resubmission.md`](toll-free-verification-resubmission.md)
- **Original Submission Guide:** [`azure-sms-toll-free-verification.md`](azure-sms-toll-free-verification.md)
- **Opt-in Screenshot Guide:** [`azure-sms-opt-in-screenshot-guide.md`](azure-sms-opt-in-screenshot-guide.md)
- **Message Templates:** [`azure-sms-message-templates.md`](azure-sms-message-templates.md)
- **Privacy/Terms URLs:** [`azure-privacy-terms-urls.md`](azure-privacy-terms-urls.md)

---

## Quick Reference Checklist

**Before Submitting:**
- [ ] All URLs use production domain (`traccems.com`)
- [ ] URLs are accessible (run verification script)
- [ ] Opt-in screenshot is from production site
- [ ] All 5 sections completed
- [ ] Message templates provided
- [ ] Contact email is monitored

**After Submitting:**
- [ ] Application ID recorded
- [ ] Submission date noted
- [ ] Reminder set for 3 business days
- [ ] Email notifications enabled

**If Stalled:**
- [ ] Check status daily
- [ ] Contact support after 1 week
- [ ] Escalate after 2 weeks
- [ ] Consider new application if needed

---

**Last Updated:** February 3, 2026  
**Status:** Active Troubleshooting Guide
