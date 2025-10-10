# Text and Email Notification System - New Chat Prompt

## Context
I'm working on the TCC (Transport Control Center) application, a multi-agency medical transport coordination system. We've completed the core accept/deny functionality and UI cleanup, but need to implement and test the text and email notification system.

## Current Status
- **Backend**: Node.js/Express with TypeScript, PostgreSQL with Prisma
- **Frontend**: React with TypeScript, running on port 3000
- **Database**: Multiple schemas (center, ems, hospital)
- **Authentication**: JWT-based with role-based access
- **Current Features**: Trip management, agency responses, user dashboards

## What Needs to Be Done

### 1. Assess Current Notification Infrastructure
- Check if email/SMS services are already implemented
- Review existing notification triggers in the codebase
- Identify what's working and what needs to be built

### 2. Implement Missing Components
- Set up email service (SMTP/SendGrid)
- Integrate SMS service (Twilio recommended)
- Create notification preference management
- Add notification logging and tracking

### 3. Test Notification System
- Send test emails and SMS messages
- Verify notification triggers work correctly
- Test user preference management
- Validate error handling and retry logic

### 4. Frontend Integration
- Add notification preferences to user settings
- Create admin notification management interface
- Add test notification features

## Key Files to Focus On
- `backend/src/services/` - Look for existing email/SMS services
- `backend/src/routes/` - Check for notification endpoints
- `frontend/src/components/` - User settings and admin interfaces
- Database schemas for user contact information

## Success Criteria
- All notification types can be sent successfully
- Users can manage their notification preferences
- Admin can send system-wide notifications
- Notifications are delivered reliably
- Error handling prevents system failures

## Reference Document
See `/docs/notes/txt_email.md` for detailed implementation plan and testing checklist.

## Current Working Directory
`/Users/scooper/Code/tcc-new-project`

## Next Steps
1. Start by examining the current notification infrastructure
2. Identify what's already implemented vs. what needs to be built
3. Set up development email/SMS services
4. Implement and test the notification system
5. Add frontend interfaces for management

Please begin by assessing the current state of the notification system and then proceed with implementation and testing.
