# Azure SMS Message Templates for Verification
**Last Updated:** December 8, 2025

## Azure Requirement

Azure requires message templates to start with the program name. Templates must be submitted for all steps of the message program.

## Program Name

**TraccEMS** - Transportation Coordination and Communication System

## Message Templates

### Template 1: Trip Creation Notification (Primary Template)

**Program Name:** TraccEMS

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

**Example Message:**
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

**Use Case:** Sent to EMS agencies when a healthcare facility creates a new transport request within their service area.

**Variables:**
- `{tripNumber}` - Unique trip identifier
- `{patientId}` - Patient identifier (HIPAA compliant)
- `{transportLevel}` - BLS, ALS, CCT, etc.
- `{priority}` - HIGH, MEDIUM, LOW
- `{fromLocation}` - Origin healthcare facility name
- `{toLocation}` - Destination facility name
- `{scheduledTime}` - Scheduled pickup time

**Message Type:** Transactional Notification
**Opt-In Required:** Yes (via account settings)
**Opt-Out:** Reply STOP or uncheck in settings

---

### Template 2: Trip Creation Notification (Short Format)

**Program Name:** TraccEMS

**Template:**
```
TraccEMS: New trip #{tripNumber} - {transportLevel} {priority} priority. From: {fromLocation}. Ready: {scheduledTime}
```

**Example Message:**
```
TraccEMS: New trip #TRP-1234567890 - ALS HIGH priority. From: General Hospital. Ready: 2:30 PM
```

**Use Case:** Shorter version for quick notifications (under 160 characters)

---

### Template 3: Opt-Out Confirmation

**Program Name:** TraccEMS

**Template:**
```
TraccEMS: You have been unsubscribed from trip notifications. Reply START to resubscribe or visit your account settings.
```

**Use Case:** Sent when user opts out via STOP command

---

### Template 4: Opt-In Confirmation

**Program Name:** TraccEMS

**Template:**
```
TraccEMS: You are subscribed to trip notifications. Reply STOP to unsubscribe. Message and data rates may apply.
```

**Use Case:** Sent when user opts in or replies START

---

## Template Guidelines Compliance

✅ **Program name at start:** All templates start with "TraccEMS:"
✅ **Clear purpose:** Templates clearly indicate trip notification purpose
✅ **Variable placeholders:** Uses {variable} format for dynamic content
✅ **HIPAA compliant:** PatientID included (required for medical context)
✅ **Opt-out instructions:** Included in confirmation messages
✅ **Character limits:** Templates designed to stay within SMS limits

## Message Flow

1. **User Opts-In:**
   - User enables SMS notifications in account settings
   - Confirmation message sent (Template 4)

2. **Trip Created:**
   - Healthcare facility creates transport request
   - SMS sent to EMS agencies within radius (Template 1 or 2)

3. **User Opts-Out:**
   - User replies STOP or disables in settings
   - Confirmation message sent (Template 3)

## For Azure Submission

Submit these templates in Azure Portal:
1. Go to Communication Services → TraccComms → SMS → Message Templates
2. Add each template with:
   - Program name: TraccEMS
   - Template text (as shown above)
   - Use case description
   - Variable definitions

## Sample Messages for Azure

### Sample 1: Standard Trip Notification
```
TraccEMS: 🚑 NEW TRIP CREATED
Trip #TRP-20251208-001
PatientID: PAT-12345
Level: ALS
Priority: HIGH
From: General Hospital
To: Regional Medical Center
Ready: 2:30 PM
```

### Sample 2: Short Trip Notification
```
TraccEMS: New trip #TRP-20251208-001 - ALS HIGH priority. From: General Hospital. Ready: 2:30 PM
```

### Sample 3: Opt-Out Confirmation
```
TraccEMS: You have been unsubscribed from trip notifications. Reply START to resubscribe or visit your account settings.
```

### Sample 4: Opt-In Confirmation
```
TraccEMS: You are subscribed to trip notifications. Reply STOP to unsubscribe. Message and data rates may apply.
```

## Template Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `{tripNumber}` | Unique trip identifier | TRP-1234567890 |
| `{patientId}` | Patient identifier | PAT-ABC123 |
| `{transportLevel}` | Transport level | BLS, ALS, CCT |
| `{priority}` | Priority level | HIGH, MEDIUM, LOW |
| `{fromLocation}` | Origin facility | General Hospital |
| `{toLocation}` | Destination facility | Regional Medical Center |
| `{scheduledTime}` | Pickup time | 2:30 PM or Dec 8, 2:30 PM |

## Compliance Notes

- ✅ All messages start with program name "TraccEMS"
- ✅ Clear transactional purpose (trip notifications)
- ✅ Opt-in/opt-out mechanisms documented
- ✅ HIPAA considerations addressed (PatientID included)
- ✅ Character limits respected (160 chars for single SMS)

