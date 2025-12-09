# Azure Communication Services Notification Implementation Plan

**Date:** January 2025  
**Status:** Planning Phase  
**Goal:** Migrate from Twilio to Azure Communication Services and implement comprehensive notification system for trip dispatch and acceptance workflows

---

## Executive Summary

This document outlines the plan to:
1. Remove Twilio configurations from the codebase
2. Implement Azure Communication Services (ACS) for SMS and email
3. Enable trip acceptance via SMS/email (if possible)
4. Implement browser-based real-time notifications for both Healthcare and EMS users

---

## Current State Analysis

### Twilio Integration Points Found

#### 1. **Backend Dependencies**
- **File:** `backend/package.json`
  - Twilio SDK: `"twilio": "^5.10.0"` (line 45)
  - **Action Required:** Remove dependency

#### 2. **SMS Service Implementation**
- **File:** `backend/src/services/twilioSMSService.ts` (188 lines)
  - Complete Twilio SMS service implementation
  - Methods: `sendSMS()`, `getDeliveryStatus()`, `testConnection()`
  - Environment variables: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
  - **Action Required:** Replace with Azure Communication Services SMS service

#### 3. **Email Service Integration**
- **File:** `backend/src/services/enhancedEmailService.ts`
  - Line 4: Imports `twilioSMSService`
  - Lines 259-261: Uses Twilio for SMS delivery as primary method
  - Lines 263-268: Falls back to email-to-SMS gateway if Twilio not configured
  - **Action Required:** Replace Twilio calls with Azure Communication Services

#### 4. **Notification Routes**
- **File:** `backend/src/routes/notifications.ts`
  - Line 6: Imports `twilioSMSService`
  - Lines 503-518: Test SMS endpoint uses Twilio directly
  - **Action Required:** Update to use Azure Communication Services

#### 5. **Documentation References**
- Multiple documentation files reference Twilio:
  - `documentation/docs-old/notes/txt_email.md`
  - `documentation/docs-old/notes/notification_system_recovery.md`
  - `documentation/docs-old/notes/plan_for_100425.md`
  - `documentation/docs-old/notes/chat_prompt_txt_email.md`
  - **Action Required:** Update documentation to reflect Azure Communication Services

#### 6. **Environment Variables**
- Expected Twilio environment variables (to be removed):
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`

### Current Notification Flow

#### Trip Dispatch Flow (Healthcare → EMS)
1. **Location:** `backend/src/services/healthcareTripDispatchService.ts`
   - Method: `sendDispatchNotifications()` (lines 433-499)
   - **Current Status:** PLACEHOLDER - No actual notifications sent
   - **Intended Behavior:** Send email/SMS to EMS agencies when trip is dispatched

#### Trip Acceptance Flow (EMS → Healthcare)
1. **Location:** `frontend/src/components/EMSDashboard.tsx`
   - Method: `handleAcceptTrip()` (lines 647-672)
   - **Current Status:** Creates agency response in database
   - **Missing:** No notification sent back to healthcare provider

#### Notification Infrastructure
- **Notification Manager:** `backend/src/services/notificationManager.ts`
  - Has `sendTripAssignmentNotification()` method (lines 153-246)
  - Currently not integrated into dispatch flow
- **Email Service:** `backend/src/services/enhancedEmailService.ts`
  - Supports email templates and SMS via Twilio/email gateway
- **Notification Routes:** `backend/src/routes/notifications.ts`
  - Full CRUD API for notifications
  - Test endpoints for email/SMS

### Real-Time Notification Infrastructure

#### Current State
- **Server-Sent Events (SSE):** 
  - **Location:** `backend/src/routes/optimization.ts` (lines 689-748)
  - **Status:** Implemented for optimization metrics only
  - **Usage:** Frontend uses `EventSource` for optimization stream
- **WebSocket:** 
  - **Status:** Not implemented
  - **Need:** Real-time trip status updates and notifications

---

## Azure Communication Services Implementation Plan

### Phase 1: Azure Communication Services Setup

#### 1.1 Azure Resource Configuration
- [ ] Create Azure Communication Services resource in Azure Portal
- [ ] Obtain connection string and endpoint
- [ ] Configure phone number for SMS (if using SMS)
- [ ] Set up email domain (if using Azure Communication Services Email)
- [ ] Configure authentication/authorization

#### 1.2 SDK Installation
- [ ] Install Azure Communication Services SDK:
  ```bash
  npm install @azure/communication-sms
  npm install @azure/communication-email
  ```
- [ ] Remove Twilio SDK:
  ```bash
  npm uninstall twilio
  ```

#### 1.3 Environment Variables
- [ ] Add new environment variables:
  - `AZURE_COMMUNICATION_CONNECTION_STRING`
  - `AZURE_COMMUNICATION_ENDPOINT`
  - `AZURE_COMMUNICATION_PHONE_NUMBER` (for SMS)
  - `AZURE_COMMUNICATION_EMAIL_FROM` (for email)
- [ ] Remove Twilio environment variables:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`

### Phase 2: Backend Service Implementation

#### 2.1 Create Azure Communication Services SMS Service
- [ ] **New File:** `backend/src/services/azureSMSService.ts`
  - Implement SMS sending using Azure Communication Services
  - Match interface of `twilioSMSService.ts` for easy replacement
  - Methods:
    - `sendSMS(to: string, message: string): Promise<SMSResult>`
    - `getDeliveryStatus(messageId: string): Promise<DeliveryStatus>`
    - `testConnection(): Promise<{ success: boolean; error?: string }>`
    - `isServiceConfigured(): boolean`
    - `getConfigurationStatus(): { configured: boolean; missing: string[] }`

#### 2.2 Create Azure Communication Services Email Service
- [ ] **New File:** `backend/src/services/azureEmailService.ts`
  - Implement email sending using Azure Communication Services
  - Support HTML and plain text emails
  - Support email templates
  - Methods:
    - `sendEmail(emailData: EmailData): Promise<boolean>`
    - `testConnection(): Promise<boolean>`

#### 2.3 Update Enhanced Email Service
- [ ] **File:** `backend/src/services/enhancedEmailService.ts`
  - Replace Twilio import with Azure Communication Services SMS service
  - Update `sendSMSWithLogging()` to use Azure Communication Services
  - Keep fallback to email-to-SMS gateway if Azure not configured

#### 2.4 Update Notification Routes
- [ ] **File:** `backend/src/routes/notifications.ts`
  - Replace Twilio import with Azure Communication Services SMS service
  - Update test SMS endpoint to use Azure Communication Services

#### 2.5 Remove Twilio Service
- [ ] **File:** `backend/src/services/twilioSMSService.ts`
  - Delete file after migration complete

### Phase 3: Trip Dispatch Notification Integration

#### 3.1 Implement Dispatch Notifications
- [ ] **File:** `backend/src/services/healthcareTripDispatchService.ts`
  - Update `sendDispatchNotifications()` method (currently placeholder)
  - Integrate with `notificationManager.sendTripAssignmentNotification()`
  - Send notifications to all selected EMS agencies
  - Include trip details in notification

#### 3.2 Notification Content
**Important:** Only use generated PatientID (no other patient identifiers per HIPAA compliance)

- [ ] **SMS Message Format (use URL shortener to fit 160 chars):**
  ```
  🚑 NEW TRANSPORT REQUEST
  Trip #{tripNumber}
  PatientID: {patientId}
  Level: {transportLevel}
  Priority: {priority}
  From: {fromLocation}
  To: {toLocation}
  Ready: {scheduledTime}
  
  Accept: {shortAcceptUrl}
  View: {shortDashboardUrl}
  ```
- [ ] **Email Template:**
  - Use existing `newTripRequest` template in `enhancedEmailService.ts`
  - Add accept/decline buttons/links
  - Include all trip details
  - Only include PatientID (no other patient identifiers)

### Phase 4: Trip Acceptance via SMS/Email

#### 4.1 Azure Communication Services SMS Capabilities (Confirmed)
**Confirmed Capabilities:**
- ✅ Azure Communication Services SMS supports standard clickable links in plain text
- ✅ URLs in SMS bodies are delivered as plain text; phones auto-link them
- ✅ Deep links (custom schemes or universal links) work but depend on device/OS configuration, not ACS
- ✅ Microsoft recommends using URL shorteners to fit links within 160-character SMS limit
- ✅ ACS does not validate or enforce deep links—it simply transports the text
- ✅ Must comply with Microsoft's messaging policies (no phishing, disallowed content, etc.)

#### 4.2 Implementation Strategy
**Both SMS and Email Acceptance Links:**
- [ ] Generate unique, secure acceptance tokens for each trip dispatch
- [ ] Implement URL shortener service (or use Azure-provided shortener if available):
  - Create shortened acceptance URLs: `https://{short-domain}/accept/{token}`
  - Short URL redirects to: `https://{domain}/api/trips/{tripId}/accept?token={token}`
  - Use URL shortener to fit links within 160-character SMS limit
  - Consider using Azure's URL shortener or third-party service (bit.ly, tinyurl, etc.)
- [ ] Include acceptance URL in both SMS and email messages
- [ ] Implement token validation endpoint
- [ ] Process acceptance via URL click (works for both SMS and email)
- [ ] Support both SMS and email acceptance based on user notification preferences

#### 4.3 URL Shortener Implementation
- [ ] **Option A: Azure Communication Services URL Shortener** (if available)
  - Use Azure's built-in URL shortening service
  - Integrate with Azure Communication Services SDK
  
- [ ] **Option B: Third-Party URL Shortener**
  - Use service like bit.ly, tinyurl, or similar
  - Store mapping of short URLs to full URLs in database
  - Implement redirect endpoint: `GET /api/redirect/:shortCode`
  
- [ ] **Option C: Custom URL Shortener**
  - Create custom short code generation (e.g., `/a/{6-char-code}`)
  - Store mappings in database
  - Implement redirect endpoint

#### 4.4 Acceptance Flow Implementation
- [ ] **New Endpoint:** `POST /api/trips/:id/accept-via-link`
  - Validates token
  - Creates agency response (ACCEPTED)
  - Sends confirmation notification back to healthcare provider
  - Returns success/failure

- [ ] **New Endpoint:** `POST /api/trips/:id/decline-via-link`
  - Similar to accept endpoint
  - Creates agency response (DECLINED)

#### 4.5 Security Considerations
- [ ] Generate cryptographically secure tokens
- [ ] Set token expiration (e.g., 24 hours)
- [ ] Validate token on acceptance
- [ ] Log all acceptance attempts
- [ ] Rate limit acceptance endpoints

### Phase 5: Trip Acceptance Notification (EMS → Healthcare)

#### 5.1 Implement Acceptance Notifications
- [ ] **File:** `backend/src/routes/agency-responses.ts` or `backend/src/routes/trips.ts`
  - Add notification trigger when agency response is created
  - Send notification to healthcare user who created the trip
  - Include agency name and response status

#### 5.2 Notification Content
**Important:** Only use generated PatientID (no other patient identifiers per HIPAA compliance)

- [ ] **SMS Message (use URL shortener to fit 160 chars):**
  ```
  ✅ TRIP ACCEPTED
  Trip #{tripNumber}
  PatientID: {patientId}
  Agency: {agencyName}
  Accepted: {timestamp}
  
  View: {shortDashboardUrl}
  ```
- [ ] **Email Template:**
  - Create `tripAccepted` template
  - Include trip details and agency information
  - Only include PatientID (no other patient identifiers)
  - Link to trip details in dashboard

### Phase 6: Browser-Based Real-Time Notifications

#### 6.1 Implementation Strategy: Hybrid Approach

**Strategy:** Use SSE/WebSocket for active users, fallback to SMS/email/push for inactive users

**Decision:** Use Server-Sent Events (SSE) - Recommended
- Simpler than WebSocket
- Built-in reconnection
- Already partially implemented for optimization metrics
- HTTP-based, easier to secure

#### 6.2 Backend Implementation

- [ ] **New Endpoint:** `GET /api/notifications/stream`
  - SSE endpoint for real-time notifications
  - Authenticate via token (similar to optimization stream)
  - Track active user connections
  - Send events when:
    - New trip dispatched (for EMS users)
    - Trip accepted/declined (for Healthcare users)
    - Trip status updated
    - New agency response received

- [ ] **User Activity Tracking:**
  - Track last activity timestamp for each user
  - Consider user "active" if:
    - Has open SSE connection, OR
    - Last activity within X minutes (configurable, default 5 minutes)
  - If user not active, enqueue SMS/email/push notification instead of/in addition to SSE

- [ ] **Notification Queue System:**
  - Queue notifications for inactive users
  - Send via SMS/email/push based on user preferences
  - Mark as sent when user becomes active and receives via SSE

#### 6.3 Frontend Implementation

- [ ] **Frontend Hook:** `frontend/src/hooks/useNotificationStream.ts`
  - Connect to SSE endpoint on component mount
  - Handle reconnection automatically
  - Track user activity (mouse/keyboard events)
  - Send heartbeat/ping to backend to maintain "active" status
  - Emit events to React context

- [ ] **React Context:** `frontend/src/contexts/NotificationContext.tsx`
  - Manage notification state
  - Provide notification methods to components
  - Display toast notifications
  - Update boards in-place (no full page reload)

- [ ] **Client Behavior:**
  - On event, update boards in-place (no full page reload)
  - Optionally play a sound for high-acuity runs
  - Show a "code/page" style banner for high-acuity runs
  - Update trip lists, dashboards, and status indicators without refresh

#### 6.4 Browser Notification API (Desktop Notifications) - CONFIRMED
- [ ] Request notification permission on login
- [ ] Show browser desktop notifications when:
  - User is not on the active tab
  - New trip dispatched/accepted
  - Important status updates
  - User is away from computer (no recent activity)
- [ ] Handle notification clicks to focus app
- [ ] Include only PatientID in notifications (no other patient identifiers)

#### 6.5 UI Components
- [ ] **Notification Bell:** Badge showing unread count
- [ ] **Notification Dropdown:** List of recent notifications
- [ ] **Toast Notifications:** Temporary popup notifications
- [ ] **In-App Alerts:** Persistent alerts for critical updates
- [ ] **High-Acuity Banner:** "Code/page" style banner for urgent trips
- [ ] **Sound Alerts:** Optional audio notification for high-acuity runs

### Phase 7: Notification Preferences

#### 7.1 User Preferences (Already Partially Implemented)
- [ ] Review existing preference system in `enhancedEmailService.ts`
- [ ] Ensure preferences work with Azure Communication Services
- [ ] **Build notification preferences into settings file for each user**
- [ ] Add preference for browser notifications
- [ ] Add preference for real-time updates (SSE)
- [ ] Add preference for SMS acceptance links
- [ ] Add preference for email acceptance links
- [ ] Add preference for desktop notifications
- [ ] Add preference for sound alerts
- [ ] Add preference for high-acuity alerts

#### 7.2 Notification Types
- [ ] `TRIP_DISPATCH` - New trip dispatched to agency
- [ ] `TRIP_ACCEPTED` - Agency accepted trip
- [ ] `TRIP_DECLINED` - Agency declined trip
- [ ] `TRIP_STATUS_UPDATE` - Trip status changed
- [ ] `AGENCY_RESPONSE` - New agency response received

#### 7.3 Settings File Structure
- [ ] **File:** User settings/preferences storage (database or config file)
- [ ] **Fields:**
  - `smsEnabled: boolean` - Enable SMS notifications
  - `emailEnabled: boolean` - Enable email notifications
  - `smsAcceptanceEnabled: boolean` - Enable SMS acceptance links
  - `emailAcceptanceEnabled: boolean` - Enable email acceptance links
  - `browserNotificationsEnabled: boolean` - Enable browser desktop notifications
  - `realTimeUpdatesEnabled: boolean` - Enable SSE real-time updates
  - `soundAlertsEnabled: boolean` - Enable sound alerts
  - `highAcuityAlertsEnabled: boolean` - Enable high-acuity alerts
  - `notificationTypes: object` - Per-type preferences (email/sms for each type)

---

## Stakeholder Decisions (Confirmed)

### 1. Azure Communication Services Capabilities ✅ CONFIRMED
- ✅ Azure Communication Services SMS supports standard clickable links (plain text URLs)
- ✅ URLs are delivered as plain text; phones auto-link them
- ✅ Deep links work but depend on device/OS configuration
- ✅ Use URL shorteners to fit within 160-character SMS limit
- ✅ Must comply with Microsoft's messaging policies

### 2. Trip Acceptance via SMS/Email ✅ CONFIRMED
- ✅ Both SMS and email acceptance links will be supported
- ✅ Acceptance via clickable links (opens browser/app)
- ✅ Notification preferences will control which channels are used

### 3. Real-Time Notifications ✅ CONFIRMED
- ✅ Use Server-Sent Events (SSE) for active users
- ✅ Fallback to SMS/email/push if user not active (no open connection or last activity > X minutes)
- ✅ Client behavior: Update boards in-place (no full page reload)
- ✅ Optional sound or "code/page" style banner for high-acuity runs
- ✅ Browser desktop notifications: YES

### 4. Notification Content ✅ CONFIRMED
- ✅ Only use PatientID (generated on trip creation)
- ✅ No other patient identifiers in notifications (HIPAA compliance)
- ✅ Use URL shorteners for SMS to fit 160-character limit

### 5. Notification Preferences ✅ CONFIRMED
- ✅ Build notification preferences into settings file for each user
- ✅ Support both SMS and email acceptance links
- ✅ User-configurable preferences for all notification types

---

## Implementation Timeline

### Week 1: Azure Setup and Backend Migration
- Day 1-2: Azure Communication Services resource setup and SDK installation
- Day 3-4: Implement Azure SMS and Email services
- Day 5: Update existing services to use Azure Communication Services
- Day 6-7: Testing and validation

### Week 2: Notification Integration
- Day 1-2: Integrate dispatch notifications into trip dispatch flow
- Day 3-4: Implement trip acceptance notifications (EMS → Healthcare)
- Day 5: Implement acceptance via SMS/email (if feasible)
- Day 6-7: Testing and refinement

### Week 3: Real-Time Browser Notifications
- Day 1-2: Implement SSE endpoint for notifications
- Day 3-4: Create frontend notification system (hooks, context, components)
- Day 5: Add browser desktop notifications
- Day 6-7: Testing and polish

### Week 4: Testing and Documentation
- Day 1-2: End-to-end testing of all notification flows
- Day 3: User acceptance testing
- Day 4: Performance testing and optimization
- Day 5: Documentation updates
- Day 6-7: Deployment and monitoring

---

## Testing Plan

### Unit Tests
- [ ] Azure SMS service methods
- [ ] Azure Email service methods
- [ ] Notification manager
- [ ] Token generation and validation

### Integration Tests
- [ ] Trip dispatch → Notification sent
- [ ] Trip acceptance → Notification sent
- [ ] SMS delivery
- [ ] Email delivery
- [ ] Acceptance via link

### End-to-End Tests
- [ ] Complete flow: Create trip → Dispatch → Notification → Accept → Confirmation
- [ ] Multiple agencies notified
- [ ] Real-time browser updates
- [ ] Notification preferences

### Performance Tests
- [ ] Notification delivery latency
- [ ] SSE connection stability
- [ ] Concurrent notification handling
- [ ] Load testing

---

## Risk Assessment

### High Risk
1. **Real-Time Notification Scalability**
   - Risk: SSE connections may not scale well with many concurrent users
   - Mitigation: Implement connection pooling, consider Azure SignalR Service, monitor connection counts
   - Status: Mitigated by fallback to SMS/email for inactive users

2. **HIPAA Compliance**
   - Risk: Patient information in notifications may violate HIPAA
   - Mitigation: ✅ CONFIRMED - Only use generated PatientID, no other patient identifiers
   - Status: Compliance requirement confirmed and incorporated into plan

### Medium Risk
1. **Migration from Twilio**
   - Risk: Breaking existing functionality
   - Mitigation: Implement Azure services alongside Twilio initially, gradual migration

2. **User Experience**
   - Risk: Too many notifications may annoy users
   - Mitigation: Implement robust preference system, allow users to customize

### Low Risk
1. **Documentation Updates**
   - Risk: Outdated documentation
   - Mitigation: Update documentation as part of implementation

---

## Success Criteria

### Phase 1: Azure Migration
- [ ] All Twilio code removed
- [ ] Azure Communication Services SMS working
- [ ] Azure Communication Services Email working
- [ ] All tests passing

### Phase 2: Notification Integration
- [ ] Dispatch notifications sent to EMS agencies
- [ ] Acceptance notifications sent to healthcare providers
- [ ] Notifications include correct trip information
- [ ] Delivery success rate > 95%

### Phase 3: Real-Time Browser Notifications
- [ ] SSE endpoint functional
- [ ] Frontend receives real-time updates
- [ ] Browser notifications working
- [ ] Notification latency < 5 seconds

### Phase 4: Trip Acceptance via SMS/Email
- [ ] Acceptance links functional (if implemented)
- [ ] Token validation working
- [ ] Security measures in place
- [ ] User testing successful

---

## Dependencies

### External
- Azure Communication Services account and resource
- Azure phone number (for SMS)
- Azure email domain (for email)

### Internal
- Existing notification infrastructure
- User preference system
- Trip dispatch system
- Agency response system

---

## Next Steps

1. **Immediate Actions:**
   - [x] Review this plan with stakeholders
   - [x] Answer questions in "Stakeholder Decisions" section
   - [x] Research Azure Communication Services capabilities for interactive SMS
   - [ ] Set up Azure Communication Services resource

2. **Before Implementation:**
   - [x] Get approval for implementation approach
   - [x] Confirm Azure Communication Services capabilities
   - [x] Finalize notification content and format
   - [ ] Set up development environment

3. **Implementation:**
   - [ ] Follow phases outlined above
   - [ ] Update this document as implementation progresses
   - [ ] Document any deviations from plan

---

## References

### Code Files Referenced
- `backend/src/services/twilioSMSService.ts` - To be replaced
- `backend/src/services/enhancedEmailService.ts` - To be updated
- `backend/src/services/healthcareTripDispatchService.ts` - To be updated
- `backend/src/services/notificationManager.ts` - To be updated
- `backend/src/routes/notifications.ts` - To be updated
- `backend/src/routes/optimization.ts` - SSE reference implementation
- `frontend/src/components/EMSDashboard.tsx` - Acceptance flow
- `frontend/src/components/HealthcareDashboard.tsx` - Dispatch flow

### Documentation
- Azure Communication Services Documentation: https://docs.microsoft.com/azure/communication-services/
- Azure Communication Services SMS: https://docs.microsoft.com/azure/communication-services/concepts/sms/sms-overview
- Azure Communication Services Email: https://docs.microsoft.com/azure/communication-services/concepts/email/email-overview

---

## Appendix: Current Notification Flow Diagrams

### Trip Dispatch Flow (Current - Not Implemented)
```
Healthcare User creates trip
  ↓
Trip saved to database
  ↓
Healthcare User dispatches trip to agencies
  ↓
Agency responses created (PENDING status)
  ↓
[PLACEHOLDER] sendDispatchNotifications() called
  ↓
[NOT IMPLEMENTED] Notifications should be sent to EMS agencies
```

### Trip Acceptance Flow (Current - Partial)
```
EMS User views available trips
  ↓
EMS User clicks "Accept"
  ↓
Agency response created (ACCEPTED status)
  ↓
Trip status updated
  ↓
[NOT IMPLEMENTED] Notification should be sent to Healthcare provider
```

### Desired Flow After Implementation
```
Healthcare User creates and dispatches trip
  ↓
Notifications sent via SMS/Email to EMS agencies
  ↓
EMS User receives notification (SMS/Email/Browser)
  ↓
EMS User accepts trip (via link, app, or keyword)
  ↓
Notification sent to Healthcare provider (SMS/Email/Browser)
  ↓
Both users see real-time updates in browser
```

---

**Document Status:** Approved - Stakeholder decisions confirmed, ready for implementation

**Last Updated:** January 2025
**Stakeholder Decisions:** All questions answered and incorporated into plan

