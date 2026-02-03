# Azure Toll-Free Verification Application Checklist

**Created:** February 3, 2026  
**Purpose:** Step-by-step checklist for submitting/resubmitting toll-free verification application  
**Status:** Active

---

## Pre-Submission Checklist

### URL Verification

- [ ] Run URL verification script: `./scripts/verify-toll-free-urls.sh`
- [ ] All URLs return HTTP 200
- [ ] Website URL: `https://traccems.com` (accessible)
- [ ] Privacy Policy: `https://traccems.com/privacy-policy` (accessible)
- [ ] Terms: `https://traccems.com/terms` (accessible)

### Documentation Review

- [ ] Reviewed [`toll-free-verification-troubleshooting-guide.md`](toll-free-verification-troubleshooting-guide.md)
- [ ] Reviewed [`toll-free-verification-resubmission.md`](toll-free-verification-resubmission.md) (if resubmitting)
- [ ] Reviewed [`azure-sms-message-templates.md`](azure-sms-message-templates.md)
- [ ] Reviewed [`azure-sms-opt-in-screenshot-guide.md`](azure-sms-opt-in-screenshot-guide.md)

### Opt-in Screenshot Preparation

- [ ] Screenshot taken from `https://traccems.com/ems-dashboard` → Settings tab
- [ ] Screenshot shows "SMS Notifications" section with checkbox
- [ ] Screenshot uploaded to cloud storage (OneDrive/Google Drive/Dropbox)
- [ ] Public shareable link obtained
- [ ] Link tested (accessible without login)

---

## Phase 1: Check Current Application Status

### Step 1.1: Access Azure Portal

- [ ] Navigate to: https://portal.azure.com
- [ ] Go to: **Communication Services** → **TraccComms**
- [ ] Click: **Regulatory Documents** (in left menu)

**OR** use direct URL:
```
https://portal.azure.com/#@traccems.com/resource/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourceGroups/DefaultResourceGroup-EUS2/providers/Microsoft.Communication/CommunicationServices/TraccComms/regulatory_documents
```

### Step 1.2: Find Application

- [ ] Locate application with ID: `513670f8-6b42-4ead-8973-ae2a58ba7096`
- [ ] Note current status: _______________________
- [ ] Note last updated date: _______________________
- [ ] Check for comments/notes: _______________________

### Step 1.3: Document Available Actions

- [ ] Edit button available? Yes / No
- [ ] Update button available? Yes / No
- [ ] Resubmit button available? Yes / No
- [ ] New Application button available? Yes / No
- [ ] Other actions: _______________________

---

## Phase 2: Determine Path Forward

### Status: "Update Requested"

- [ ] Status is "Update Requested"
- [ ] Cannot edit in portal (expected)
- [ ] Go to Azure Portal → **Help + Support** → **New support request**
- [ ] Issue type: Technical
- [ ] Service: Communication Services
- [ ] Problem type: SMS / Toll-free verification
- [ ] Problem subtype: Application update/status
- [ ] Provided all required information (see troubleshooting guide)
- [ ] Support ticket submitted
- [ ] Ticket number recorded: _______________________
- [ ] Set reminder to check response in 24-48 hours

### Status: "Rejected" or "Draft" (Can Edit)

- [ ] Status allows editing
- [ ] Edit/Update button clicked
- [ ] Proceed to Phase 3: Update Application

### Status: Cannot Edit (Other)

- [ ] Status: _______________________
- [ ] No edit option available
- [ ] Consider creating new application (see Phase 3: New Application)
- [ ] OR contact Azure Support for guidance

---

## Phase 3: Update Existing Application

### Section 1: Application Type

- [ ] Country/Region: United States of America
- [ ] Toll-free Number: `+18339675959` selected
- [ ] Number verified correctly

### Section 2: Company Details

- [ ] Company Name: _______________________ (verified)
- [ ] Business Address: _______________________ (verified)
- [ ] Tax ID / Business Registration: _______________________ (verified)
- [ ] Contact Email: _______________________ (monitored email)
- [ ] Contact Phone: _______________________ (verified)
- [ ] All fields reviewed and correct
- [ ] Saved/Continued to next section

### Section 3: Program Details (CRITICAL)

- [ ] Purpose of SMS: "Trip notifications for EMS dispatch"
- [ ] Message Types: Transactional notifications
- [ ] Opt-in Method: Account settings (EMS agency settings page)
- [ ] Opt-in URL: `https://traccems.com/ems-dashboard` (Settings tab)
- [ ] **Website URL:** `https://traccems.com` ✅ (NOT dev-swa)
- [ ] **Privacy Policy URL:** `https://traccems.com/privacy-policy` ✅ (NOT dev-swa)
- [ ] **Terms URL:** `https://traccems.com/terms` ✅ (NOT dev-swa)
- [ ] Opt-in Screenshot: Public shareable link provided
- [ ] All fields reviewed and correct
- [ ] Saved/Continued to next section

### Section 4: Volume

- [ ] Message Volume: _______________________ (estimated)
- [ ] Peak Volume: _______________________ (estimated)
- [ ] Message Frequency: Transactional (sent as trips are created)
- [ ] All fields reviewed and correct
- [ ] Saved/Continued to next section

### Section 5: Templates

- [ ] Sample messages provided
- [ ] Templates start with "TraccEMS:"
- [ ] Templates include required information
- [ ] Reference: [`azure-sms-message-templates.md`](azure-sms-message-templates.md)
- [ ] All fields reviewed and correct
- [ ] Saved/Continued to review

### Final Review

- [ ] All 5 sections completed
- [ ] **Website URL is `https://traccems.com`** (critical check)
- [ ] **Privacy Policy URL is `https://traccems.com/privacy-policy`** (critical check)
- [ ] **Terms URL is `https://traccems.com/terms`** (critical check)
- [ ] All URLs verified accessible
- [ ] Opt-in screenshot from production site
- [ ] All information accurate
- [ ] Application submitted

---

## Phase 3: Create New Application

**Use this section if creating a new application instead of updating existing one.**

### Initial Setup

- [ ] In Regulatory Documents blade, clicked "Add" or "New Application"
- [ ] Toll-free verification wizard launched
- [ ] Followed original submission guide: [`azure-sms-toll-free-verification.md`](azure-sms-toll-free-verification.md)

### Complete All Sections

- [ ] Section 1: Application Type completed
- [ ] Section 2: Company Details completed
- [ ] Section 3: Program Details completed (with production URLs)
- [ ] Section 4: Volume completed
- [ ] Section 5: Templates completed
- [ ] All URLs use production domain (`traccems.com`)
- [ ] Application submitted
- [ ] New Application ID recorded: _______________________

---

## Phase 4: Post-Submission

### Record Details

- [ ] Application ID: _______________________
- [ ] Submission Date: _______________________
- [ ] Initial Status: _______________________
- [ ] Expected Review Date: _______________________ (3 business days)

### Set Reminders

- [ ] Reminder set to check status in 3 business days
- [ ] Email notifications enabled/monitored
- [ ] Daily check scheduled for first week

### Monitoring Plan

- [ ] Check Azure Portal daily (first week)
- [ ] Monitor email for notifications (including spam)
- [ ] Note any status changes with dates
- [ ] Document any comments from Azure reviewers

---

## Phase 5: Follow-Up Actions

### If Approved

- [ ] Status changed to "Approved"
- [ ] SMS functionality verified
- [ ] Test trip created with `notificationRadius`
- [ ] SMS delivery checked in Azure Portal → SMS logs
- [ ] EMS agencies received SMS messages
- [ ] Success! ✅

### If Rejected

- [ ] Rejection comments reviewed
- [ ] All issues noted: _______________________
- [ ] Issues addressed systematically
- [ ] Application updated/resubmitted
- [ ] Return to Phase 3: Update Application

### If Stalled (> 1 week)

- [ ] Status still "Pending" or "Under Review" after 1 week
- [ ] Azure Support contacted
- [ ] Application ID provided: `513670f8-6b42-4ead-8973-ae2a58ba7096`
- [ ] Support ticket number: _______________________
- [ ] Follow-up scheduled

### If Stalled (> 2 weeks)

- [ ] Status still stalled after 2 weeks
- [ ] Support ticket escalated
- [ ] Consider creating new application (with support guidance)
- [ ] Old application may need withdrawal (check with support)

---

## Quick Reference

**Application ID:** `513670f8-6b42-4ead-8973-ae2a58ba7096`  
**Phone Number:** `+18339675959`  
**Subscription ID:** `fb5dde6b-779f-4ef5-b457-4b4d087a48ee`  
**Resource Group:** `DefaultResourceGroup-EUS2`  
**Resource Name:** `TraccComms`

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

**Last Updated:** February 3, 2026  
**Status:** Active Checklist
