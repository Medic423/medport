# Text and Email Notification System Implementation Plan

## Overview
This document outlines the implementation and testing plan for the text and email notification system in the TCC application. This is a critical feature for real-time communication between healthcare facilities, EMS agencies, and the TCC control center.

## Current Status
- **Backend**: Basic notification infrastructure exists but needs enhancement
- **Frontend**: No text/email management interface
- **Integration**: Limited testing of notification delivery

## Phase 1: Backend Infrastructure Assessment

### 1.1 Email Service Implementation
- **Check existing email service**: Review `backend/src/services/emailService.ts`
- **SMTP Configuration**: Verify email provider setup (SendGrid, AWS SES, etc.)
- **Email Templates**: Create templates for different notification types
- **Email Queue**: Implement queue system for reliable delivery

### 1.2 SMS/Text Service Implementation
- **SMS Provider Integration**: Set up Twilio, AWS SNS, or similar service
- **Phone Number Validation**: Ensure proper phone number formatting
- **SMS Templates**: Create concise templates for different scenarios
- **Rate Limiting**: Implement to prevent spam and manage costs

### 1.3 Notification Types to Implement
1. **Trip Assignment Notifications**
   - Healthcare → EMS: "New transport request assigned"
   - EMS → Healthcare: "Trip accepted/declined"
   - TCC → Both: "Trip status updates"

2. **Emergency Alerts**
   - System-wide alerts
   - Critical trip updates
   - System maintenance notifications

3. **Agency Response Notifications**
   - New agency responses received
   - Agency selection confirmations
   - Response deadline reminders

## Phase 2: Database Schema Updates

### 2.1 User Contact Information
```sql
-- Add to existing user tables
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN sms_notifications BOOLEAN DEFAULT false;
```

### 2.2 Notification Preferences
```sql
-- New table for notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.3 Notification Log
```sql
-- Track sent notifications
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  channel VARCHAR(10) NOT NULL, -- 'email' or 'sms'
  status VARCHAR(20) NOT NULL, -- 'sent', 'delivered', 'failed'
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  error_message TEXT
);
```

## Phase 3: API Endpoints

### 3.1 Notification Management
- `POST /api/notifications/send` - Send notification to user
- `GET /api/notifications/preferences` - Get user preferences
- `PUT /api/notifications/preferences` - Update user preferences
- `GET /api/notifications/log` - Get notification history

### 3.2 Test Endpoints
- `POST /api/notifications/test-email` - Send test email
- `POST /api/notifications/test-sms` - Send test SMS
- `GET /api/notifications/status` - Check service status

## Phase 4: Frontend Implementation

### 4.1 User Settings Interface
- **Location**: Add to existing user settings/profile pages
- **Features**:
  - Email notification toggles by type
  - SMS notification toggles by type
  - Phone number management
  - Test notification buttons
  - Notification history view

### 4.2 Admin Interface
- **Location**: TCC Admin dashboard
- **Features**:
  - Send system-wide notifications
  - View notification logs
  - Manage notification templates
  - Monitor delivery rates

## Phase 5: Testing Strategy

### 5.1 Unit Tests
- Email service functionality
- SMS service functionality
- Notification preference management
- Template rendering

### 5.2 Integration Tests
- End-to-end notification flow
- Error handling and retry logic
- Rate limiting verification
- Database transaction integrity

### 5.3 User Acceptance Testing
- Test with real phone numbers and email addresses
- Verify notification delivery timing
- Test notification preferences
- Validate template formatting

## Phase 6: Implementation Steps

### Step 1: Backend Foundation
1. Set up email service with proper SMTP configuration
2. Integrate SMS service (Twilio recommended)
3. Create notification service that handles both channels
4. Implement notification preferences in database

### Step 2: API Development
1. Create notification management endpoints
2. Add notification triggers to existing workflows
3. Implement test endpoints for validation
4. Add proper error handling and logging

### Step 3: Frontend Integration
1. Add notification preferences to user settings
2. Create admin notification management interface
3. Add notification status indicators
4. Implement test notification features

### Step 4: Testing and Validation
1. Test with development email/SMS accounts
2. Validate with real user accounts
3. Performance testing with high volume
4. Security testing for sensitive data

## Phase 7: Production Considerations

### 7.1 Security
- Encrypt sensitive contact information
- Implement rate limiting
- Validate phone numbers and email addresses
- Secure API endpoints

### 7.2 Performance
- Implement notification queuing
- Use background job processing
- Monitor delivery rates
- Set up alerting for failures

### 7.3 Compliance
- Follow CAN-SPAM Act for emails
- Comply with TCPA for SMS
- Implement opt-out mechanisms
- Maintain audit logs

## Testing Checklist

### Email Notifications
- [ ] Email service configuration
- [ ] Template rendering
- [ ] HTML and text versions
- [ ] Attachment support (if needed)
- [ ] Bounce handling
- [ ] Unsubscribe functionality

### SMS Notifications
- [ ] SMS service configuration
- [ ] Phone number validation
- [ ] Message length limits
- [ ] Delivery confirmation
- [ ] Opt-out handling
- [ ] Cost monitoring

### Integration
- [ ] Trip assignment notifications
- [ ] Status update notifications
- [ ] Emergency alerts
- [ ] User preference management
- [ ] Admin notification tools
- [ ] Error handling and retry logic

## Success Criteria
1. All notification types can be sent successfully
2. User preferences are respected
3. Notifications are delivered within 30 seconds
4. Error handling prevents system failures
5. Admin can manage notifications effectively
6. Users can control their notification preferences
7. System handles high volume without issues

## Next Steps
1. Review existing notification infrastructure
2. Set up development email/SMS services
3. Implement basic notification sending
4. Create user preference management
5. Add frontend interfaces
6. Conduct comprehensive testing
7. Deploy to production with monitoring

## Addendum: Feed Failure Alerts (UI + Email)

- As part of the broader text/email implementation, we will add an automatic alerting path for backend feed health failures detected by the UI.
- The TCC module System Overview now displays a banner when critical feeds fail (analytics overview, agencies, dropdown categories, hospitals). Once email is configured, the same detection will trigger an email (and optional SMS) to the site administrator.
- Delivery flow:
  - UI detects failing feed(s) → calls new backend endpoint `POST /api/notifications/alerts/feed-failure` with details.
  - Backend sends email (and optionally SMS) to configured admin recipients using the notification service.
  - Alerts are rate-limited (e.g., 1 per feed per hour) and logged to `notification_log`.
- Environments:
  - Dev: alerts can be routed to a sandbox mailbox/number.
  - Prod: real admin recipients; follow escalation rules if failures persist.
- This alerting work is included in the text/email feature scope and will be enabled after email configuration is complete.
