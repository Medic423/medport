# Azure SMS Opt-In Screenshot Guide
**Last Updated:** December 8, 2025

## Azure Requirement

Azure requires a screenshot showing where subscribers can opt-in to SMS messaging campaigns.

## Current Opt-In Location

**Location:** EMS Agency Settings Page
- **URL Path:** `/ems-dashboard` → Settings tab
- **Component:** `AgencySettings.tsx`
- **Field:** `acceptsNotifications` checkbox

## How to Create Screenshot

### Step 1: Access the Opt-In Page

1. **Log in to production site:** https://traccems.com/
   - ⚠️ **IMPORTANT:** Use production site (`traccems.com`), NOT dev site
2. **Log in as EMS user** (e.g., `test@ems.com`)
3. **Navigate to:** EMS Dashboard → **Settings** tab
4. **Scroll to:** "SMS Notifications" section

### Step 2: Take Screenshot

**What to include in screenshot:**
- ✅ "SMS Notifications" section header
- ✅ Checkbox: "Receive SMS notifications for new trip requests"
- ✅ Description text explaining what SMS notifications are for
- ✅ Phone number field (if visible)
- ✅ Save button (to show users can save preferences)

**Screenshot should show:**
```
┌─────────────────────────────────────┐
│ SMS Notifications                    │
│                                      │
│ ☑ Receive SMS notifications for     │
│   new trip requests                  │
│                                      │
│ When enabled, you will receive SMS  │
│ notifications when healthcare       │
│ facilities create trips within      │
│ your service area.                   │
│                                      │
│ [Save Settings] [Cancel]            │
└─────────────────────────────────────┘
```

### Step 3: Upload Screenshot

1. **Save screenshot** (PNG or JPG format)
2. **Upload to cloud storage:**
   - OneDrive
   - Google Drive
   - Dropbox
   - Or any file sharing service
3. **Get shareable link:**
   - Make sure link is viewable by everyone (public)
   - Copy the shareable link
4. **Paste link** in Azure verification form

## Alternative: Enhanced Opt-In Page

If Azure needs a more explicit opt-in page, we can create a dedicated opt-in page with:

1. **Clear opt-in checkbox**
2. **Phone number input field**
3. **Terms and conditions**
4. **Opt-out instructions**

## Current Implementation Details

**File:** `frontend/src/components/AgencySettings.tsx`
**Lines:** 691-713

```tsx
{/* SMS Notification Preference */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    SMS Notifications
  </label>
  <div className="flex items-center space-x-2">
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        name="acceptsNotifications"
        checked={agencyInfo.acceptsNotifications}
        onChange={handleInputChange}
        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
      />
      <span className="text-sm text-gray-700">
        Receive SMS notifications for new trip requests
      </span>
    </label>
  </div>
  <p className="mt-1 text-xs text-gray-500">
    When enabled, you will receive SMS notifications when healthcare facilities create trips within your service area.
  </p>
</div>
```

## Opt-Out Instructions

**Current:** Users can opt-out by unchecking the box and saving settings.

**For Azure compliance, add:**
- Clear opt-out instructions
- "Reply STOP to opt-out" message in SMS (if applicable)
- Link to settings page in SMS messages

## Quick Steps for Screenshot

1. ✅ Go to https://traccems.com/ (⚠️ Use PRODUCTION site, not dev)
2. ✅ Log in as EMS user
3. ✅ Go to Settings tab
4. ✅ Scroll to "SMS Notifications" section
5. ✅ Take screenshot (include checkbox, description, save button)
6. ✅ Upload to OneDrive/Google Drive/Dropbox
7. ✅ Get public shareable link
8. ✅ Paste link in Azure form

**⚠️ CRITICAL:** Screenshot must be from production site (`traccems.com`), NOT dev site (`dev-swa.traccems.com`)

## What Azure Needs

Azure wants to see:
- ✅ Where users can opt-in to SMS
- ✅ Clear consent mechanism (checkbox)
- ✅ Ability to opt-out
- ✅ Phone number collection (if applicable)

**Note:** For transactional SMS (trip notifications), opt-in via account settings is acceptable. Keyword texting is typically for marketing campaigns.

## After Screenshot

Once you have the screenshot link:
1. Paste it in the Azure verification form
2. Complete the rest of the application
3. Submit for approval
4. Wait 1-3 business days for approval

