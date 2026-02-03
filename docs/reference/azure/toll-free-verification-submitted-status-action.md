# Action Plan: "Submitted" Status Application

**Created:** February 3, 2026  
**Status:** Submitted (6+ weeks)  
**Application ID:** `513670f8-6b42-4ead-8973-ae2a58ba7096`

---

## Current Situation

- **Status:** "Submitted" (in review queue)
- **Time in Status:** 6+ weeks (unusually long - normal is 1-3 business days)
- **Can Edit?** No
- **Can Cancel?** Yes (requires email to `acstnrequest@microsoft.com`)

## Recommendation: Try Support First, Then Cancel if Needed

### ⚠️ DO NOT CANCEL YET

**Reason:** Canceling loses your application history and requires starting completely over. Try updating via support first.

---

## Step 1: Contact Azure Support (Try This First)

### Option A: Azure Support Ticket (Recommended)

1. **Go to Azure Portal:**
   - Navigate to: **Help + Support** → **New support request**

2. **Fill out support ticket:**
   - **Issue type:** Technical
   - **Service:** Communication Services
   - **Problem type:** SMS / Toll-free verification
   - **Problem subtype:** Application update/status

3. **Provide this information:**

```
Application ID: 513670f8-6b42-4ead-8973-ae2a58ba7096
Subscription ID: fb5dde6b-779f-4ef5-b457-4b4d087a48ee
Resource Group: DefaultResourceGroup-EUS2
Resource Name: TraccComms
Phone Number: +18339675959

Issue Description:
Our toll-free verification application (ID: 513670f8-6b42-4ead-8973-ae2a58ba7096) 
has been in "Submitted" status for over 6 weeks, which is unusually long. The 
normal review time is 1-3 business days.

The application was originally submitted with development URLs (dev-swa.traccems.com) 
which may be causing delays or issues. Our production domain (traccems.com) is now 
live and accessible.

Request:
1. Please check the status of this application and provide an update
2. If possible, update the application URLs to production:
   - Website URL: https://traccems.com
   - Privacy Policy: https://traccems.com/privacy-policy
   - Terms: https://traccems.com/terms
3. If the application needs to be resubmitted, please provide guidance

We need to proceed with SMS verification as soon as possible.
```

4. **Submit ticket and wait 24-48 hours for response**

### Option B: Direct Email (Alternative)

**Email to:** `acstnrequest@microsoft.com`

**Subject:** Update Request for Toll-Free Verification Application 513670f8-6b42-4ead-8973-ae2a58ba7096

**Body:**
```
Application ID: 513670f8-6b42-4ead-8973-ae2a58ba7096
Subscription ID: fb5dde6b-779f-4ef5-b457-4b4d087a48ee
Resource Group: DefaultResourceGroup-EUS2
Resource Name: TraccComms
Phone Number: +18339675959

Issue:
Our toll-free verification application has been in "Submitted" status for over 
6 weeks. We would like to update the application URLs to our production domain 
before it's reviewed, as the original submission used development URLs.

Requested Updates:
- Website URL: Change to https://traccems.com
- Privacy Policy URL: Change to https://traccems.com/privacy-policy
- Terms URL: Change to https://traccems.com/terms

Please advise if these updates can be made or if we should cancel and resubmit 
with the correct URLs.

Thank you.
```

---

## Step 2: Wait for Response (24-48 hours)

- **If Support Can Update:** Great! They'll update the URLs and the application will continue in review
- **If Support Says to Cancel:** Proceed to Step 3
- **If No Response in 48 Hours:** Escalate or proceed to Step 3

---

## Step 3: Cancel and Resubmit (If Support Can't Help)

**Only do this if:**
- Support confirms they cannot update the application
- Support recommends canceling and resubmitting
- No response from support after 48 hours

### Cancel Process

1. **In Azure Portal:**
   - Go to: **Communication Services** → **TraccComms** → **Regulatory Documents**
   - Click **"Cancel"** button on the application
   - Click **"Send an email"** button in the dialog
   - This will open your email client with a message to `acstnrequest@microsoft.com`

2. **Email Template for Cancellation:**

**Subject:** Cancel Toll-Free Verification Application 513670f8-6b42-4ead-8973-ae2a58ba7096

**Body:**
```
Please cancel the following toll-free verification application:

Application ID: 513670f8-6b42-4ead-8973-ae2a58ba7096
Subscription ID: fb5dde6b-779f-4ef5-b457-4b4d087a48ee
Resource Group: DefaultResourceGroup-EUS2
Resource Name: TraccComms
Phone Number: +18339675959

Reason: Application has been in "Submitted" status for 6+ weeks. We need to 
resubmit with correct production URLs (traccems.com) instead of development URLs.

We will submit a new application immediately after cancellation with the correct URLs.

Thank you.
```

3. **Wait for Cancellation Confirmation** (usually 1-2 business days)

4. **Immediately Resubmit:**
   - Once canceled, click **"+ Add"** to create new application
   - Use production URLs from the start:
     - Website: `https://traccems.com`
     - Privacy Policy: `https://traccems.com/privacy-policy`
     - Terms: `https://traccems.com/terms`
   - Follow: [`toll-free-verification-checklist.md`](toll-free-verification-checklist.md)

---

## Decision Matrix

| Scenario | Action |
|----------|--------|
| Support can update URLs | ✅ **Best option** - Keep application, just update URLs |
| Support says to cancel | ⚠️ Cancel and resubmit with correct URLs |
| No response in 48 hours | ⚠️ Cancel and resubmit (don't wait longer) |
| Application gets rejected | ✅ Resubmit with correct URLs (can edit if rejected) |

---

## Why Try Support First?

**Advantages of Support Route:**
- ✅ Preserves application history
- ✅ Faster (if they can update directly)
- ✅ No need to recreate entire application
- ✅ Less disruptive

**Disadvantages of Canceling:**
- ❌ Lose application history
- ❌ Must recreate entire application
- ❌ Additional delay (cancellation + resubmission)
- ❌ More work required

---

## Timeline Comparison

### Option 1: Support Updates URLs
- **Time:** 24-48 hours for support response + update
- **Total:** 2-3 days
- **Result:** Application continues in review with correct URLs

### Option 2: Cancel and Resubmit
- **Time:** 1-2 days for cancellation + 1-3 days for new review
- **Total:** 2-5 days
- **Result:** Fresh application with correct URLs

**Both options take similar time, but Option 1 is less work.**

---

## Recommendation Summary

1. ✅ **Try Azure Support first** (24-48 hour wait)
2. ⚠️ **If support can't help, then cancel** and resubmit
3. ✅ **Don't cancel immediately** - you might lose time if support could have updated it

---

## Quick Reference

**Support Ticket:** Azure Portal → Help + Support → New support request  
**Cancel Email:** `acstnrequest@microsoft.com`  
**Application ID:** `513670f8-6b42-4ead-8973-ae2a58ba7096`  
**Production URLs:**
- Website: `https://traccems.com`
- Privacy Policy: `https://traccems.com/privacy-policy`
- Terms: `https://traccems.com/terms`

---

**Last Updated:** February 3, 2026  
**Status:** Action Required - Try Support First
