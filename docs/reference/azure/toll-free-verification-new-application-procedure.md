# New Toll-Free Verification Application Procedure

**Created:** February 3, 2026  
**New Phone Number:** `+18663667374`  
**Status:** Ready to Submit  
**Previous Application:** Cancelled ✅

---

## Prerequisites Checklist

**Before starting the application, gather ALL of the following:**

### ✅ 1. Phone Number (Ready)
- [x] **New Phone Number:** `+18663667374` ✅
- [x] **Status:** Active and available in Azure Portal ✅
- [x] **Old Application:** Cancelled ✅

### ✅ 2. Company Information (Ready)

**Required Fields:**
- [x] **Company Name:** `Ferrell Creative, LLC` ✅
- [x] **Business Address:** `197 Fox Chase Drive, Duncansville, PA 16635` ✅
- [x] **Tax ID / Business Registration Number:** `81-3112142` ✅
- [x] **Contact Email:** `chuck41090@mac.com` ✅
  - *Email that will be monitored for status updates*
- [x] **Contact Phone:** `(814) 695-0813` ✅
  - *Format for form: +18146950813*

### ✅ 3. URLs (Verified and Ready)
- [x] **Website URL:** `https://traccems.com` ✅ (HTTP 200)
- [x] **Privacy Policy:** `https://traccems.com/privacy-policy` ✅ (HTTP 200)
- [x] **Terms:** `https://traccems.com/terms` ✅ (HTTP 200)
- [x] **Opt-in URL:** `https://traccems.com/ems-dashboard` (Settings tab)

**Verification:**
```bash
./scripts/verify-toll-free-urls.sh
```
**Status:** All URLs verified ✅

### ⏳ 4. Opt-in Screenshot (Need to Prepare)

**Steps to prepare:**
1. [ ] Go to `https://traccems.com` (login page - see image provided)
2. [ ] **Log in** using your credentials
3. [ ] Navigate to **EMS Dashboard** → **Settings** tab
4. [ ] Scroll to **"SMS Notifications"** section
5. [ ] Take screenshot showing:
   - "SMS Notifications" section header
   - Checkbox: "Receive SMS notifications for new trip requests"
   - Description text explaining what SMS notifications are for
   - Save button (to show users can save preferences)
6. [ ] Upload screenshot to cloud storage:
   - OneDrive / Google Drive / Dropbox
7. [ ] Get **public shareable link** (viewable without login)
8. [ ] Test link (open in incognito/private window to verify it's public)
9. [ ] **Screenshot Link:** _______________________

**Reference:** [`azure-sms-opt-in-screenshot-guide.md`](azure-sms-opt-in-screenshot-guide.md)

**⚠️ IMPORTANT:** 
- Use production site (`traccems.com`), NOT dev site
- Screenshot must be taken AFTER logging in (not just the login page)
- Screenshot must show the actual SMS Notifications settings section

### ✅ 5. Message Templates (Ready)

**All templates start with "TraccEMS:"**

**Template 1 (Primary - Copy this):**
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

**Template 2 (Short Format - Copy this):**
```
TraccEMS: New trip #{tripNumber} - {transportLevel} {priority} priority. From: {fromLocation}. Ready: {scheduledTime}
```

**Template 3 (Opt-out - Copy this):**
```
TraccEMS: You have been unsubscribed from trip notifications. Reply START to resubscribe or visit your account settings.
```

**Template 4 (Opt-in - Copy this):**
```
TraccEMS: You are subscribed to trip notifications. Reply STOP to unsubscribe. Message and data rates may apply.
```

**Reference:** [`azure-sms-message-templates.md`](azure-sms-message-templates.md)

### ✅ 6. Volume Estimates (Ready)

**Required:**
- [x] **Message Volume:** `2,500 messages/month` ✅
  - *Current: One beta test site*
  - *Will grow as more clients are added*
- [x] **Peak Volume:** `~200-250 messages/day` ✅
  - *Peak times: Monday-Friday, 7AM-7PM business hours*
  - *24/7 application, but peak during business hours*
- [x] **Message Frequency:** Transactional (sent as trips are created, not scheduled) ✅

**Notes:**
- Application operates 24/7
- Peak messaging during business hours (7AM-7PM, Mon-Fri)
- Volume will increase as more healthcare facilities/clients are added

---

## Step-by-Step Application Procedure

### Step 1: Access Regulatory Documents

1. **Go to Azure Portal:**
   - Navigate to: https://portal.azure.com
   - Go to: **Communication Services** → **TraccComms**

2. **Open Regulatory Documents:**
   - Click: **Regulatory Documents** (in left menu)
   - Or use direct URL:
   ```
   https://portal.azure.com/#@traccems.com/resource/subscriptions/fb5dde6b-779f-4ef5-b457-4b4d087a48ee/resourceGroups/DefaultResourceGroup-EUS2/providers/Microsoft.Communication/CommunicationServices/TraccComms/regulatory_documents
   ```

3. **Verify old application is cancelled:**
   - [ ] Check that old application (`513670f8-6b42-4ead-8973-ae2a58ba7096`) shows "Cancelled" status
   - [ ] If not cancelled, do not proceed - contact support first

4. **Start new application:**
   - [ ] Click **"+ Add"** button
   - [ ] Toll-free verification wizard should launch

---

### Step 2: Section 1 - Application Type

**Fill in:**
- [ ] **Country/Region:** Select **"United States of America"**
- [ ] **Toll-free Numbers:** Select **`+18663667374`**
  - *Verify the new number appears and is selected*
- [ ] **Verify number is correct:** `+18663667374` ✅

**Click:** **Next** or **Continue**

---

### Step 3: Section 2 - Company Details

**⚠️ Have all company information ready before starting this section**

**Fill in all required fields:**

- [ ] **Company Name:** Enter: `Ferrell Creative, LLC`
- [ ] **Business Address:** Enter: `197 Fox Chase Drive, Duncansville, PA 16635`
  - *Full address including street, city, state, ZIP*
- [ ] **Tax ID / Business Registration:** Enter: `81-3112142`
  - *EIN number*
- [ ] **Contact Email:** Enter: `chuck41090@mac.com`
  - *Email for status updates (must be monitored)*
- [ ] **Contact Phone:** Enter: `+18146950813`
  - *Format: +1XXXXXXXXXX (remove parentheses and spaces)*
  - *Original: (814) 695-0813 → Formatted: +18146950813*

**Review:**
- [ ] All fields filled
- [ ] Information is accurate
- [ ] Contact email is monitored

**Click:** **Next** or **Continue**

---

### Step 4: Section 3 - Program Details (CRITICAL)

**⚠️ THIS IS THE MOST IMPORTANT SECTION - USE PRODUCTION URLs ONLY**

**Purpose and Use Case:**
- [ ] **Purpose of SMS:** Enter: `"Trip notifications for EMS dispatch"`
- [ ] **Message Types:** Select: **"Transactional notifications"**
- [ ] **Description:** Describe your SMS use case
  - *Example: "Send SMS notifications to EMS agencies when healthcare facilities create new transport requests within their service area"*

**Opt-in Information:**
- [ ] **Opt-in Method:** Select: **"Account settings"** or **"Website"**
- [ ] **Opt-in URL:** Enter: `https://traccems.com/ems-dashboard`
  - *Note: Settings tab in EMS dashboard*
- [ ] **Opt-in Screenshot Link:** Paste: `https://1drv.ms/i/c/817a4f10428e6e00/IQBCumKqyUyMQJD11npJO0o9AVt8iTE4_Eb9xv2jA16EXIE?e=OXedq6`
  - *Verify link is public and accessible (test in incognito window)*

**Website Information (CRITICAL - MUST USE PRODUCTION):**
- [ ] **Website URL:** Enter: `https://traccems.com`
  - ⚠️ **DO NOT use:** `dev-swa.traccems.com`
  - ✅ **MUST use:** `traccems.com`
- [ ] **Privacy Policy URL:** Enter: `https://traccems.com/privacy-policy`
  - ⚠️ **DO NOT use:** `dev-swa.traccems.com/privacy-policy`
- [ ] **Terms and Conditions URL:** Enter: `https://traccems.com/terms`
  - ⚠️ **DO NOT use:** `dev-swa.traccems.com/terms`

**Double-Check URLs:**
- [ ] All three URLs use `traccems.com` (NOT dev-swa)
- [ ] All URLs start with `https://`
- [ ] No typos in URLs

**Review:**
- [ ] All fields completed
- [ ] URLs verified correct
- [ ] Opt-in screenshot link is public and accessible

**Click:** **Next** or **Continue**

---

### Step 5: Section 4 - Volume

**Fill in volume estimates:**

- [ ] **Message Volume:** Enter: `2,500 messages/month`
  - *Current volume with one beta test site*
  - *Will grow as more clients are added*
- [ ] **Peak Volume:** Enter: `200-250 messages/day`
  - *Peak times: Monday-Friday, 7AM-7PM business hours*
  - *24/7 application, but peak during business hours*
- [ ] **Message Frequency:** Select: **"Transactional"** or **"As needed"**
  - *Note: Messages sent as trips are created, not scheduled*

**Review:**
- [ ] Estimates are reasonable
- [ ] Frequency is transactional

**Click:** **Next** or **Continue**

---

### Step 6: Section 5 - Templates

**⚠️ All templates MUST start with "TraccEMS:"**

**Template 1 (Primary):**
- [ ] **Program Name:** Enter: `TraccEMS`
- [ ] **Template Text:** Copy/paste:
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
- [ ] **Use Case:** Enter: `"Trip creation notification sent to EMS agencies"`
- [ ] **Variables:** List: `tripNumber, patientId, transportLevel, priority, fromLocation, toLocation, scheduledTime`

**Template 2 (Short Format):**
- [ ] **Program Name:** Enter: `TraccEMS`
- [ ] **Template Text:** Copy/paste:
```
TraccEMS: New trip #{tripNumber} - {transportLevel} {priority} priority. From: {fromLocation}. Ready: {scheduledTime}
```
- [ ] **Use Case:** Enter: `"Short format trip notification"`
- [ ] **Variables:** List: `tripNumber, transportLevel, priority, fromLocation, scheduledTime`

**Template 3 (Opt-out):**
- [ ] **Program Name:** Enter: `TraccEMS`
- [ ] **Template Text:** Copy/paste:
```
TraccEMS: You have been unsubscribed from trip notifications. Reply START to resubscribe or visit your account settings.
```
- [ ] **Use Case:** Enter: `"Opt-out confirmation message"`

**Template 4 (Opt-in):**
- [ ] **Program Name:** Enter: `TraccEMS`
- [ ] **Template Text:** Copy/paste:
```
TraccEMS: You are subscribed to trip notifications. Reply STOP to unsubscribe. Message and data rates may apply.
```
- [ ] **Use Case:** Enter: `"Opt-in confirmation message"`

**Review:**
- [ ] All 4 templates provided
- [ ] All templates start with "TraccEMS:"
- [ ] Variables are documented
- [ ] Use cases are clear

**Click:** **Next** or **Continue**

---

### Step 7: Review and Submit

**Before submitting, verify EVERYTHING:**

**Critical Checks:**
- [ ] **Phone Number:** `+18663667374` ✅ (NEW number)
- [ ] **Website URL:** `https://traccems.com` ✅ (NOT dev-swa)
- [ ] **Privacy Policy:** `https://traccems.com/privacy-policy` ✅
- [ ] **Terms:** `https://traccems.com/terms` ✅
- [ ] **Opt-in URL:** `https://traccems.com/ems-dashboard` ✅
- [ ] **Opt-in Screenshot:** Link is public and accessible ✅

**All Sections:**
- [ ] Section 1: Application Type ✅
- [ ] Section 2: Company Details ✅
- [ ] Section 3: Program Details ✅
- [ ] Section 4: Volume ✅
- [ ] Section 5: Templates ✅

**Information:**
- [ ] All company information is accurate
- [ ] Contact email is monitored
- [ ] All URLs use production domain
- [ ] All templates start with "TraccEMS:"

**Submit:**
- [ ] Click **"Submit"** button
- [ ] Wait for confirmation
- [ ] Record new Application ID: _______________________
- [ ] Record submission date: _______________________

---

## Step 8: Post-Submission

### Record Application Details

- [ ] **New Application ID:** _______________________
- [ ] **Phone Number:** `+18663667374`
- [ ] **Submission Date:** _______________________
- [ ] **Initial Status:** _______________________
- [ ] **Expected Review Date:** _______________________ (3 business days from submission)

### Update Configuration

**⚠️ IMPORTANT: Update phone number in all configurations**

**Locations to update:**

1. **Backend Environment Variables:**
   - [ ] `backend/.env` (if exists locally)
   - [ ] `backend/.env.production` (if exists)
   - [ ] Update: `AZURE_COMMUNICATION_PHONE_NUMBER=+18663667374`

2. **GitHub Secrets:**
   - [ ] Go to: GitHub → Repository → Settings → Secrets and variables → Actions
   - [ ] Update secret: `AZURE_COMMUNICATION_PHONE_NUMBER`
   - [ ] New value: `+18663667374`
   - [ ] Update for all environments (dev, prod)

3. **Azure App Services:**
   - [ ] **TraccEms-Dev-Backend:**
     - Azure Portal → TraccEms-Dev-Backend → Configuration → Application settings
     - Find: `AZURE_COMMUNICATION_PHONE_NUMBER`
     - Update to: `+18663667374`
     - Click **Save**
   - [ ] **TraccEms-Prod-Backend:**
     - Azure Portal → TraccEms-Prod-Backend → Configuration → Application settings
     - Find: `AZURE_COMMUNICATION_PHONE_NUMBER`
     - Update to: `+18663667374`
     - Click **Save**

4. **Restart Services (if needed):**
   - [ ] Restart TraccEms-Dev-Backend (if configuration requires restart)
   - [ ] Restart TraccEms-Prod-Backend (if configuration requires restart)

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

## Step 9: If Approved

✅ **SMS will start delivering automatically**

**Verification Steps:**
1. [ ] Test by creating a trip with `notificationRadius` set
2. [ ] Check Azure Portal → SMS logs for delivery status
3. [ ] Verify EMS agencies receive SMS messages
4. [ ] Monitor SMS delivery success rate
5. [ ] Verify messages are sent from new number: `+18663667374`

---

## Step 10: If Rejected

1. **Review Rejection Comments:**
   - [ ] Read all comments carefully
   - [ ] Note specific issues mentioned
   - [ ] Address each issue systematically

2. **Update Application:**
   - [ ] If status allows editing, click Edit
   - [ ] Fix all issues mentioned in rejection
   - [ ] Update URLs if needed
   - [ ] Resubmit with corrections

3. **Document Rejection Reasons:**
   - [ ] Keep record of rejection reasons
   - [ ] Update documentation with lessons learned

---

## Quick Reference

**New Phone Number:** `+18663667374`  
**Old Phone Number:** `+18339675959` (released)  
**Old Application:** `513670f8-6b42-4ead-8973-ae2a58ba7096` (cancelled)

**Production URLs (MUST USE):**
- Website: `https://traccems.com`
- Privacy Policy: `https://traccems.com/privacy-policy`
- Terms: `https://traccems.com/terms`
- Opt-in: `https://traccems.com/ems-dashboard` (Settings tab)

**Configuration to Update:**
- `AZURE_COMMUNICATION_PHONE_NUMBER` → `+18663667374`
- GitHub Secrets
- Azure App Service configs

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

❌ **DO NOT use old phone number:**
- `+18339675959` - Old number (released)

✅ **DO use new phone number:**
- `+18663667374` - New number ✅

❌ **DO NOT forget to update configuration:**
- Must update `AZURE_COMMUNICATION_PHONE_NUMBER` everywhere

✅ **DO update all configurations:**
- Backend env files
- GitHub Secrets
- Azure App Services

---

**Last Updated:** February 3, 2026  
**Status:** Ready to Submit - Gather Prerequisites First
