# Toll-Free Verification Application - Submitted

**Created:** February 3, 2026  
**Status:** Submitted - Awaiting Review  
**Application ID:** `35e65296-1dee-4d7d-970b-43d4dac831e3`

---

## Application Details

**Application ID:** `35e65296-1dee-4d7d-970b-43d4dac831e3`  
**Submission Date:** February 3, 2026  
**Application Type:** United States of America, Toll-free verification  
**Phone Number:** `+18663667374`  
**Status:** Submitted

---

## Application Information

### Company Information
- **Company Name:** Ferrell Creative, LLC
- **Company URL:** `https://traccems.com`
- **Address:** 197 Fox Chase Drive, Duncansville, PA 16635
- **Tax ID:** 81-3112142
- **Contact:** Chuck (chuck41090@mac.com)

### Program Details
- **Program Content-Type:** Healthcare alerts
- **Opt-in Type:** Website
- **Opt-in URL:** `https://traccems.com/ems-dashboard`
- **Opt-in Screenshot:** `https://1drv.ms/i/c/817a4f10428e6e00/IQBCumKqyUyMQJD11npJO0o9AVt8iTE4_Eb9xv2jA16EXIE?e=OXedq6`

### URLs (All Production)
- **Website:** `https://traccems.com`
- **Privacy Policy:** `https://traccems.com/privacy-policy`
- **Terms:** `https://traccems.com/terms`

### Volume
- **Expected Total Messages Sent:** 10,000
- **Current Monthly:** ~2,500 messages/month
- **Peak Times:** Monday-Friday, 7AM-7PM business hours

---

## Previous Application (Cancelled)

**Old Application ID:** `513670f8-6b42-4ead-8973-ae2a58ba7096`  
**Old Phone Number:** `+18339675959` (released)  
**Status:** Cancelled ✅

---

## Post-Submission Actions

### ✅ Configuration Updates

**Update phone number in all locations:**

1. **Backend Environment Variables:**
   - [x] `backend/.env.local` → `AZURE_COMMUNICATION_PHONE_NUMBER=+18663667374` ✅
   - [ ] `backend/.env.production` → `AZURE_COMMUNICATION_PHONE_NUMBER=+18663667374` (if exists)

2. **GitHub Secrets:** ⏳ Manual Update Required
   - [ ] Update `AZURE_COMMUNICATION_PHONE_NUMBER` secret
   - [ ] New value: `+18663667374`
   - [ ] Update for dev and prod environments
   - **See:** [`phone-number-configuration-update-summary.md`](phone-number-configuration-update-summary.md)

3. **Azure App Services:** ⏳ Manual Update Required
   - [ ] TraccEms-Dev-Backend → Configuration → `AZURE_COMMUNICATION_PHONE_NUMBER=+18663667374`
   - [ ] TraccEms-Prod-Backend → Configuration → `AZURE_COMMUNICATION_PHONE_NUMBER=+18663667374`
   - [ ] Save and restart if needed
   - **See:** [`phone-number-configuration-update-summary.md`](phone-number-configuration-update-summary.md) for detailed steps

### Monitoring Schedule

**Daily Checks (First Week):**
- [ ] Azure Portal → Communication Services → TraccComms → Regulatory Documents
- [ ] Check application status
- [ ] Look for status updates or comments
- [ ] Monitor email: `chuck41090@mac.com` (including spam)

**Expected Timeline:**
- **Normal Processing:** 1-3 business days
- **Azure Warning:** Up to 5 weeks (but typically faster)
- **If longer than 1 week:** Unusual, may need to contact support

---

## Status Tracking

### Current Status
- **Status:** Submitted
- **Date:** February 3, 2026
- **Next Check:** February 6, 2026 (3 business days)

### Status History
- **February 3, 2026:** Application submitted
- **Status:** Submitted

---

## Quick Reference

**Application ID:** `35e65296-1dee-4d7d-970b-43d4dac831e3`  
**Phone Number:** `+18663667374`  
**Submission Date:** February 3, 2026

**Direct Portal URL:**
```
https://portal.azure.com/#@traccems.com/resource/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourceGroups/DefaultResourceGroup-EUS2/providers/Microsoft.Communication/CommunicationServices/TraccComms/regulatory_documents
```

**Contact Email:** chuck41090@mac.com

---

## If Approved

✅ **SMS will start delivering automatically**

**Verification Steps:**
1. Test by creating a trip with `notificationRadius` set
2. Check Azure Portal → SMS logs for delivery status
3. Verify EMS agencies receive SMS messages
4. Verify messages are sent from new number: `+18663667374`
5. Monitor SMS delivery success rate

---

## If Rejected

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

**Last Updated:** February 3, 2026  
**Status:** Submitted - Monitoring for Approval
