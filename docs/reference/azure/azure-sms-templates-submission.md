# Azure SMS Message Templates - Submission Guide
**Last Updated:** December 8, 2025

## Quick Reference for Azure Form

### Program Name
```
TraccEMS
```

### Primary Template (Trip Creation Notification)

**Template:**
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

**Example:**
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

**Use Case:** Transactional notification sent to EMS agencies when healthcare facilities create transport requests within their service area.

**Variables:**
- `{tripNumber}` - Unique trip identifier
- `{patientId}` - Patient identifier
- `{transportLevel}` - Transport level (BLS/ALS/CCT)
- `{priority}` - Priority level (HIGH/MEDIUM/LOW)
- `{fromLocation}` - Origin facility name
- `{toLocation}` - Destination facility name
- `{scheduledTime}` - Scheduled pickup time

---

### Short Template (Alternative)

**Template:**
```
TraccEMS: New trip #{tripNumber} - {transportLevel} {priority} priority. From: {fromLocation}. Ready: {scheduledTime}
```

**Example:**
```
TraccEMS: New trip #TRP-1234567890 - ALS HIGH priority. From: General Hospital. Ready: 2:30 PM
```

---

### Opt-Out Confirmation Template

**Template:**
```
TraccEMS: You have been unsubscribed from trip notifications. Reply START to resubscribe or visit your account settings.
```

---

### Opt-In Confirmation Template

**Template:**
```
TraccEMS: You are subscribed to trip notifications. Reply STOP to unsubscribe. Message and data rates may apply.
```

---

## How to Submit in Azure Portal

1. **Go to Azure Portal:**
   - Communication Services → TraccComms → SMS

2. **Find Message Templates Section:**
   - Look for "Message Templates" or "Template Management"
   - Click "Add Template" or "Submit Template"

3. **Fill Out Template Form:**
   - **Program Name:** TraccEMS
   - **Template Text:** Copy from above
   - **Use Case:** Transactional trip notifications
   - **Message Type:** Transactional
   - **Variables:** List all {variable} placeholders

4. **Submit Each Template:**
   - Submit primary template first
   - Submit additional templates if needed
   - Wait for approval

## Template Guidelines Compliance

✅ Program name at start: "TraccEMS:"
✅ Clear purpose: Trip notification system
✅ Variable placeholders: {variable} format
✅ HIPAA considerations: PatientID included
✅ Opt-out instructions: Included
✅ Character limits: Under 160 chars (single SMS)

## Notes for Azure Review

- **Message Type:** Transactional (not marketing)
- **Opt-In Method:** Account settings checkbox
- **Opt-Out Method:** Settings or reply STOP
- **Frequency:** Varies based on trip activity
- **Purpose:** Coordinate patient transport between healthcare facilities and EMS agencies

