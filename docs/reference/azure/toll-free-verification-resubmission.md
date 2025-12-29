# Toll-Free Verification Resubmission Guide

**Created:** December 29, 2025  
**Purpose:** Guide for resubmitting rejected toll-free verification application  
**Status:** Ready to Resubmit

---

## Background

**Original Application:**
- **Application ID:** `513670f8-6b42-4ead-8973-ae2a58ba7096`
- **Submission Date:** December 9, 2025
- **Rejection Date:** December 12, 2025
- **Rejection Reason:** "invalid or inaccessible website url"
- **Phone Number:** `+18339675959`

**Issue:**
- Application was submitted with `dev-swa.traccems.com` URL
- Azure's verification system considered this URL invalid or inaccessible
- Production domain (`traccems.com`) is now live and accessible

---

## Resubmission Process

### Step 1: Access the Application

1. **Go to Azure Portal:**
   - Navigate to: **Communication Services** → **TraccComms**
   - Go to: **Phone numbers** → **Toll-free verification**
   - Find the rejected application (Application ID: `513670f8-6b42-4ead-8973-ae2a58ba7096`)

2. **Click "Update" or "Edit"** to modify the application

### Step 2: Review and Update Each Screen

**Important:** Go through each screen/section and verify/update the following:

#### Screen 1: Business Information
- ✅ **Company Name:** Verify it's correct
- ✅ **Business Address:** Verify it's correct
- ✅ **Tax ID / Business Registration:** Verify it's correct
- ✅ **Contact Information:** Verify it's correct

**Action:** Review all fields, update if needed, then **Save/Continue**

#### Screen 2: Website Information (CRITICAL - MUST UPDATE)
- ⚠️ **Website URL:** **CHANGE FROM** `dev-swa.traccems.com` **TO** `https://traccems.com`
- ⚠️ **Privacy Policy URL:** **CHANGE FROM** `https://dev-swa.traccems.com/privacy-policy` **TO** `https://traccems.com/privacy-policy` ✅ (Page exists and is accessible)
- ⚠️ **Terms and Conditions URL:** **CHANGE FROM** `https://dev-swa.traccems.com/terms` **TO** `https://traccems.com/terms` ✅ (Page exists and is accessible)
- ✅ **Website Accessibility:** Verify `https://traccems.com` is accessible (it is!)
- ✅ **Privacy Policy Page:** Verify `https://traccems.com/privacy-policy` is accessible (it is!)
- ✅ **Terms Page:** Verify `https://traccems.com/terms` is accessible (it is!)

**Action:** **MUST UPDATE** all three URLs to use `traccems.com` instead of `dev-swa.traccems.com`, then **Save/Continue**

#### Screen 3: Use Case Information
- ✅ **Purpose of SMS:** Verify it's correct (e.g., "Trip notifications for EMS dispatch")
- ✅ **Message Types:** Verify it's correct (transactional notifications)
- ✅ **Sample Messages:** Verify they're correct
- ✅ **Message Volume:** Verify it's accurate

**Action:** Review all fields, update if needed, then **Save/Continue**

#### Screen 4: Compliance & Opt-In
- ✅ **TCPA Compliance:** Verify acknowledgment is checked
- ✅ **Opt-in Procedures:** Verify they're documented
- ⚠️ **Opt-in Screenshot:** Update with screenshot from `https://traccems.com` (if applicable)
- ✅ **Opt-out Procedures:** Verify they're documented

**Action:** Review all fields, update opt-in screenshot if needed, then **Save/Continue**

#### Screen 5: Review & Submit
- ✅ **Review all information** one more time
- ✅ **Verify website URL is** `https://traccems.com` (not dev-swa)
- ✅ **Click "Submit" or "Resubmit"**

---

## Key Changes Required

### Critical Updates

1. **Website URL:**
   - **Old:** `dev-swa.traccems.com` (or similar dev URL)
   - **New:** `https://traccems.com` ✅

2. **Privacy Policy URL:**
   - **Old:** `https://dev-swa.traccems.com/privacy-policy`
   - **New:** `https://traccems.com/privacy-policy` ✅ (Page exists and is accessible)

3. **Terms and Conditions URL:**
   - **Old:** `https://dev-swa.traccems.com/terms` (or `/privacy-policy` if incorrectly set)
   - **New:** `https://traccems.com/terms` ✅ (Page exists and is accessible)
   - **Alternative:** `https://traccems.com/terms-and-conditions` (also works)

4. **Opt-in Screenshot (if applicable):**
   - **Update:** Screenshot should be from `https://traccems.com`

### Information That Should Stay the Same

- ✅ Business information (company name, address, etc.)
- ✅ Use case information (purpose, message types, samples)
- ✅ Compliance acknowledgments
- ✅ Phone number (`+18339675959`)

---

## Verification Checklist

Before submitting, verify:

- [ ] Website URL is `https://traccems.com` (not dev-swa)
- [ ] `https://traccems.com` is accessible (test in browser)
- [ ] Privacy Policy URL is `https://traccems.com/privacy-policy` (not dev-swa)
- [ ] `https://traccems.com/privacy-policy` is accessible (test in browser)
- [ ] Terms and Conditions URL is `https://traccems.com/terms` (not dev-swa)
- [ ] `https://traccems.com/terms` is accessible (test in browser)
- [ ] Opt-in screenshot is from production site (if applicable)
- [ ] All business information is still correct
- [ ] Use case information is still accurate
- [ ] Compliance information is complete
- [ ] All required fields are filled

**Note:** Both Privacy Policy and Terms pages already exist on traccems.com and are accessible. No need to create placeholder documents.

---

## After Resubmission

### Expected Timeline

- **Processing Time:** Usually 1-3 business days
- **Status Updates:** Check Azure Portal for status
- **Notification:** Azure will notify you when approved/rejected

### Monitoring

1. **Check Status:**
   - Azure Portal → Communication Services → TraccComms
   - Go to: Phone numbers → Toll-free verification
   - Check application status

2. **If Approved:**
   - ✅ SMS will start delivering
   - ✅ Test by creating a trip with notifications
   - ✅ Check Azure Portal → SMS logs for delivery status

3. **If Rejected Again:**
   - Review rejection comments
   - Address any issues mentioned
   - Resubmit with corrections

---

## Troubleshooting

### Website URL Still Shows as Invalid

**If Azure still says URL is invalid after updating:**

1. **Verify DNS:**
   ```bash
   dig traccems.com
   ```
   Should resolve to Azure Static Web App

2. **Test HTTPS:**
   ```bash
   curl -I https://traccems.com
   ```
   Should return HTTP 200

3. **Check SSL Certificate:**
   - Verify SSL certificate is valid (green lock)
   - SSL should be provisioned (check via Azure Portal)

4. **Wait a Few Minutes:**
   - DNS changes can take time to propagate
   - Azure's verification system may need time to re-check

### Application Form Won't Save

**If you can't save changes:**

1. **Check Required Fields:**
   - Make sure all required fields are filled
   - Look for validation errors (red text)

2. **Try Refreshing:**
   - Refresh the page
   - Try again

3. **Clear Browser Cache:**
   - Clear cache and cookies
   - Try again

4. **Contact Azure Support:**
   - If issues persist, contact Azure Support
   - Reference Application ID: `513670f8-6b42-4ead-8973-ae2a58ba7096`

---

## Quick Reference

**Application ID:** `513670f8-6b42-4ead-8973-ae2a58ba7096`  
**Phone Number:** `+18339675959`  
**Old Website URL:** `dev-swa.traccems.com` (rejected)  
**New Website URL:** `https://traccems.com` ✅  
**Old Privacy Policy URL:** `https://dev-swa.traccems.com/privacy-policy`  
**New Privacy Policy URL:** `https://traccems.com/privacy-policy` ✅  
**Old Terms URL:** `https://dev-swa.traccems.com/privacy-policy` (incorrectly set)  
**New Terms URL:** `https://traccems.com/terms` ✅

**Azure Portal Path:**
- Communication Services → TraccComms → Phone numbers → Toll-free verification

**Azure Documentation:**
- [Toll-Free Verification Guidelines](https://learn.microsoft.com/en-us/azure/communication-services/concepts/sms/toll-free-verification-guidelines#opt-in)
- [Toll-Free Verification FAQs](https://aka.ms/TFV-FAQs)
- [High-Quality Application Guide](https://learn.microsoft.com/en-us/azure/communication-services/concepts/sms/sms-faq#what-is-considered-a-high-quality-toll-free-verification-application)

---

## Summary

**What to Do:**
1. ✅ Go through each screen of the application
2. ✅ **Update website URL to** `https://traccems.com` (critical!)
3. ✅ Update privacy/terms URLs if applicable
4. ✅ Update opt-in screenshot if applicable
5. ✅ Review all other information (should be correct)
6. ✅ Save each screen as you go
7. ✅ Submit the application

**What NOT to Change:**
- Business information (unless incorrect)
- Use case information (unless incorrect)
- Compliance information (unless incorrect)
- Phone number (stays the same)

**Expected Result:**
- Application resubmitted with correct production URL
- Approval within 1-3 business days
- SMS functionality enabled after approval

---

**Last Updated:** December 29, 2025  
**Status:** Ready to Resubmit

