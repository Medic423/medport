# Final Submission Checklist - Toll-Free Verification Application

**Created:** February 3, 2026  
**Status:** Ready to Submit ✅  
**New Phone Number:** `+18663667374`

---

## ✅ All Prerequisites Complete

- [x] **New Phone Number:** `+18663667374` ✅
- [x] **Old Application:** Cancelled ✅
- [x] **Company Name:** Ferrell Creative, LLC ✅
- [x] **Business Address:** 197 Fox Chase Drive, Duncansville, PA 16635 ✅
- [x] **Tax ID:** 81-3112142 ✅
- [x] **Contact Email:** chuck41090@mac.com ✅
- [x] **Contact Phone:** +18146950813 ✅
- [x] **URLs Verified:** All production URLs working ✅
- [x] **Opt-in Screenshot:** Taken ✅ (shows SMS Notifications checkbox enabled)
- [x] **Screenshot Link:** `https://1drv.ms/i/c/817a4f10428e6e00/IQBCumKqyUyMQJD11npJO0o9AVt8iTE4_Eb9xv2jA16EXIE?e=OXedq6` ✅
- [x] **Message Templates:** All 4 templates ready ✅
- [x] **Volume Estimates:** Ready ✅

---

## Final Steps Before Submission

### 1. Opt-in Screenshot ✅

- [x] Screenshot uploaded to OneDrive ✅
- [x] **Screenshot Link:** `https://1drv.ms/i/c/817a4f10428e6e00/IQBCumKqyUyMQJD11npJO0o9AVt8iTE4_Eb9xv2jA16EXIE?e=OXedq6` ✅
- [ ] **VERIFY:** Test link in incognito/private window to ensure it's publicly accessible
  - If link requires login, update OneDrive sharing settings to "Anyone with the link"

**Screenshot shows:**
- ✅ "Notification Preferences" header
- ✅ "SMS Notifications" checkbox (enabled/checked)
- ✅ "Save All Settings" button

### 2. Review All Information

**Company Information:**
- [ ] Company Name: `Ferrell Creative, LLC`
- [ ] Address: `197 Fox Chase Drive, Duncansville, PA 16635`
- [ ] Tax ID: `81-3112142`
- [ ] Email: `chuck41090@mac.com`
- [ ] Phone: `+18146950813`

**URLs (CRITICAL - MUST BE PRODUCTION):**
- [ ] Website: `https://traccems.com` ✅
- [ ] Privacy Policy: `https://traccems.com/privacy-policy` ✅
- [ ] Terms: `https://traccems.com/terms` ✅
- [ ] Opt-in URL: `https://traccems.com/ems-dashboard`

**Volume:**
- [ ] Monthly: `2,500 messages/month`
- [ ] Peak: `200-250 messages/day` (Mon-Fri, 7AM-7PM)
- [ ] Frequency: Transactional (24/7 application)

---

## Application Form - Copy/Paste Ready

### Section 1: Application Type

- **Country/Region:** United States of America
- **Toll-free Number:** `+18663667374`

### Section 2: Company Details

- **Company Name:** `Ferrell Creative, LLC`
- **Business Address:** `197 Fox Chase Drive, Duncansville, PA 16635`
- **Tax ID:** `81-3112142`
- **Contact Email:** `chuck41090@mac.com`
- **Contact Phone:** `+18146950813`

### Section 3: Program Details

- **Purpose of SMS:** `Trip notifications for EMS dispatch`
- **Message Types:** Transactional notifications
- **Opt-in Method:** Account settings (EMS agency settings page)
- **Opt-in URL:** `https://traccems.com/ems-dashboard`
- **Opt-in Screenshot Link:** `https://1drv.ms/i/c/817a4f10428e6e00/IQBCumKqyUyMQJD11npJO0o9AVt8iTE4_Eb9xv2jA16EXIE?e=OXedq6`
- **Website URL:** `https://traccems.com` ✅
- **Privacy Policy URL:** `https://traccems.com/privacy-policy` ✅
- **Terms URL:** `https://traccems.com/terms` ✅

### Section 4: Volume

- **Message Volume:** `2,500 messages/month`
- **Peak Volume:** `200-250 messages/day`
- **Peak Times:** Monday-Friday, 7AM-7PM business hours
- **Message Frequency:** Transactional (sent as trips are created, 24/7 application)
- **Growth:** Volume will increase as more healthcare facilities/clients are added

### Section 5: Templates

**Template 1 (Primary):**
```
TraccEMS: 🚑 NEW TRIP CREATED
Trip #{tripNumber}
PatientID: {patientId}
Level: {transportLevel}
Priority: {priority}
From: {fromLocation}
To: {toLocation}
Ready: {scheduledTime}
```

**Template 2 (Short Format):**
```
TraccEMS: New trip #{tripNumber} - {transportLevel} {priority} priority. From: {fromLocation}. Ready: {scheduledTime}
```

**Template 3 (Opt-out):**
```
TraccEMS: You have been unsubscribed from trip notifications. Reply START to resubscribe or visit your account settings.
```

**Template 4 (Opt-in):**
```
TraccEMS: You are subscribed to trip notifications. Reply STOP to unsubscribe. Message and data rates may apply.
```

---

## Critical Pre-Submission Checks

**Before clicking Submit, verify:**

- [ ] **Phone Number:** `+18663667374` (NEW number, not old one)
- [ ] **All URLs use `traccems.com`** (NOT dev-swa.traccems.com)
- [ ] **Website URL:** `https://traccems.com` ✅
- [ ] **Privacy Policy:** `https://traccems.com/privacy-policy` ✅
- [ ] **Terms:** `https://traccems.com/terms` ✅
- [x] **Opt-in Screenshot:** Link ready ✅
  - Link: `https://1drv.ms/i/c/817a4f10428e6e00/IQBCumKqyUyMQJD11npJO0o9AVt8iTE4_Eb9xv2jA16EXIE?e=OXedq6`
  - [ ] **VERIFY:** Test in incognito window to ensure publicly accessible
- [ ] **All templates start with "TraccEMS:"**
- [ ] **Company information is accurate**
- [ ] **Volume estimates are reasonable**

---

## After Submission

### Record Application Details

- [x] **New Application ID:** `35e65296-1dee-4d7d-970b-43d4dac831e3` ✅
- [x] **Submission Date:** February 3, 2026 ✅
- [x] **Initial Status:** Submitted ✅
- [x] **Application Type:** United States of America, Toll-free verification ✅
- [x] **Phone Number:** `+18663667374` ✅

### Update Configuration

**Update phone number in all locations:**

1. **Backend Environment Variables:**
   - [ ] `backend/.env` → `AZURE_COMMUNICATION_PHONE_NUMBER=+18663667374`
   - [ ] `backend/.env.production` → `AZURE_COMMUNICATION_PHONE_NUMBER=+18663667374`

2. **GitHub Secrets:**
   - [ ] Update `AZURE_COMMUNICATION_PHONE_NUMBER` secret
   - [ ] New value: `+18663667374`
   - [ ] Update for dev and prod environments

3. **Azure App Services:**
   - [ ] TraccEms-Dev-Backend → Configuration → `AZURE_COMMUNICATION_PHONE_NUMBER=+18663667374`
   - [ ] TraccEms-Prod-Backend → Configuration → `AZURE_COMMUNICATION_PHONE_NUMBER=+18663667374`
   - [ ] Save and restart if needed

### Set Monitoring

- [ ] Reminder set to check status in 3 business days
- [ ] Monitor email: `chuck41090@mac.com`
- [ ] Daily check scheduled for first week

---

## Expected Timeline

- **Processing Time:** 1-3 business days
- **If longer than 1 week:** Unusual, contact support
- **If longer than 2 weeks:** Escalate support ticket

---

## Quick Reference

**New Phone Number:** `+18663667374`  
**Old Phone Number:** `+18339675959` (released)

**Company:** Ferrell Creative, LLC  
**Tax ID:** 81-3112142  
**Email:** chuck41090@mac.com

**Production URLs:**
- Website: `https://traccems.com`
- Privacy Policy: `https://traccems.com/privacy-policy`
- Terms: `https://traccems.com/terms`

**Volume:**
- Monthly: 2,500 messages/month
- Peak: 200-250 messages/day (Mon-Fri, 7AM-7PM)

---

**Last Updated:** February 3, 2026  
**Status:** ✅ READY TO SUBMIT - All Prerequisites Complete
