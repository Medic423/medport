# Azure SMS Toll-Free Number Verification
**Last Updated:** December 8, 2025

## Problem

**Warning in Azure Portal:**
> "SMS verification for toll-free is now mandatory in United States and Canada. To send an SMS, submit application."

## What This Means

- ✅ Your Azure Communication Services resource is set up correctly
- ✅ Code is working correctly
- ❌ **SMS sending is blocked** until toll-free number is verified
- ⚠️ Azure requires verification application for toll-free numbers in US/Canada

## Impact

**Current Status:**
- SMS code is deployed and working
- Backend can trigger SMS sending
- Azure accepts SMS requests (HTTP 202)
- **But SMS messages are not delivered** until verification is complete

## Solution: Submit Verification Application

### Step 1: Access Verification Portal

1. **Go to Azure Portal:**
   - Navigate to: **Communication Services** → **TraccComms** (your resource)

2. **Find SMS Section:**
   - Look for **"Phone numbers"** or **"SMS"** in the left menu
   - Or go to **"Phone numbers"** → **"Toll-free numbers"**

3. **Submit Application:**
   - Look for **"Submit application"** or **"Verify"** button
   - Click to start verification process

### Step 2: Complete Verification Form

You'll need to provide:

1. **Business Information:**
   - Company name
   - Business address
   - Tax ID or business registration number

2. **Use Case Information:**
   - Purpose of SMS (e.g., "Trip notifications for EMS dispatch")
   - Message types (transactional notifications)
   - Sample messages

3. **Compliance:**
   - TCPA compliance acknowledgment
   - Opt-in/opt-out procedures
   - Privacy policy

### Step 3: Wait for Approval

- **Processing Time:** Usually 1-3 business days
- **Status:** Check Azure Portal for approval status
- **Notification:** Azure will notify you when approved

## Alternative: Use Short Code (Faster)

If you need SMS working immediately:

1. **Request Short Code:**
   - Short codes are pre-verified
   - Faster approval (usually same day)
   - Better for high-volume messaging

2. **Use Case:**
   - Short codes: Better for high-volume, marketing
   - Toll-free: Better for customer service, notifications

## Current Workaround

**Until verification is approved:**

1. ✅ Code is ready and deployed
2. ✅ Backend will attempt to send SMS
3. ✅ Azure will accept requests (HTTP 202)
4. ⚠️ Messages won't be delivered until verified
5. ✅ Check Azure Portal → SMS logs for status

## Verification Checklist

- [ ] Go to Azure Portal → Communication Services → TraccComms
- [ ] Navigate to Phone numbers / SMS section
- [ ] Find "Submit application" or verification option
- [ ] Complete verification form with business details
- [ ] Submit application
- [ ] Wait for approval (1-3 business days)
- [ ] Check status in Azure Portal
- [ ] Test SMS after approval

## After Verification

Once approved:
1. ✅ SMS will start delivering
2. ✅ Test by creating a trip with `notificationRadius`
3. ✅ Check Azure Portal → SMS logs for delivery status
4. ✅ Verify agencies receive SMS messages

## Documentation

Azure Documentation:
- [Azure Communication Services SMS Verification](https://learn.microsoft.com/azure/communication-services/concepts/sms/sms-faq#toll-free-verification)

## Summary

**Current Status:**
- ✅ Code deployed and working
- ✅ Backend ready to send SMS
- ⚠️ Waiting for Azure toll-free verification approval
- ⏭️ SMS will work after verification is approved

**Action Required:**
- Submit verification application in Azure Portal
- Wait for approval (1-3 business days)
- Test SMS after approval

