# Twilio Setup Guide for MedPort Notifications

## 🚀 Getting Started with Twilio

### 1. Create Twilio Account
1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up with your email: `chuck41090@mac.com`
3. Complete the verification process

### 2. Get Your Credentials
After signing up, you'll find your credentials in the Twilio Console:

1. **Account SID**: Found on the main dashboard
2. **Auth Token**: Click "Show" to reveal your auth token
3. **Phone Number**: Get a Twilio phone number for SMS

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory with your Twilio credentials:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID="AC1234567890abcdef1234567890abcdef"
TWILIO_AUTH_TOKEN="your-actual-auth-token-here"
TWILIO_PHONE_NUMBER="+15551234567"
TWILIO_EMAIL="noreply@medport.com"
```

### 4. Verify Your Phone Number
1. In Twilio Console, go to "Phone Numbers" → "Manage" → "Active numbers"
2. Click on your number to configure it
3. Enable SMS capabilities
4. Set webhook URLs if needed (optional for now)

### 5. Test the Integration
1. Start your backend server: `npm run dev`
2. Go to the Notifications dashboard in MedPort
3. Send a test SMS notification
4. Check the console for demo mode vs. real Twilio responses

## 📱 SMS Features Available

### Urgent Transport Notifications
- High-priority SMS alerts for critical transport requests
- Automatic escalation system
- Facility and transport level details

### Status Update Notifications
- Real-time transport status updates
- ETA information and tracking links
- Professional message formatting

### Agency Assignment Notifications
- New transport request assignments
- Service area and capability matching
- Confirmation request workflow

### Route Optimization Alerts
- Revenue optimization opportunities
- Miles saved calculations
- Direct links to review opportunities

## 🔧 Configuration Options

### Message Templates
The system includes pre-configured templates for:
- `urgent_transport` - Critical transport requests
- `status_update` - Transport status changes
- `agency_assignment` - New assignments
- `route_optimization` - Revenue opportunities

### Priority Levels
- **Low**: Routine updates
- **Normal**: Standard notifications
- **High**: Important alerts
- **Urgent**: Critical emergencies

### Demo Mode
When Twilio credentials are not configured, the system runs in demo mode:
- All notifications are logged to the console
- No actual SMS/email messages are sent
- Perfect for testing and development

## 🧪 Testing Your Setup

### 1. Test SMS
```bash
curl -X POST http://localhost:5001/api/notifications/sms \
  -H "Authorization: Bearer demo-token" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+15551234567",
    "message": "Test message from MedPort",
    "priority": "normal"
  }'
```

### 2. Test Urgent Transport
```bash
curl -X POST http://localhost:5001/api/notifications/urgent-transport \
  -H "Authorization: Bearer demo-token" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+15551234567",
    "facilityName": "UPMC Altoona",
    "transportLevel": "CCT",
    "priority": "Critical"
  }'
```

### 3. Check Service Status
```bash
curl -X GET http://localhost:5001/api/notifications/status \
  -H "Authorization: Bearer demo-token"
```

## 🚨 Troubleshooting

### Common Issues

1. **"Twilio credentials not found"**
   - Check your `.env` file exists
   - Verify environment variable names
   - Restart your server after changes

2. **"Invalid phone number"**
   - Ensure phone numbers include country code (+1 for US)
   - Verify the number is in E.164 format

3. **"Authentication failed"**
   - Double-check your Account SID and Auth Token
   - Ensure no extra spaces or characters

4. **"Phone number not verified"**
   - In trial accounts, you can only send to verified numbers
   - Verify your phone number in Twilio Console

### Getting Help

- **Twilio Documentation**: [https://www.twilio.com/docs](https://www.twilio.com/docs)
- **Twilio Support**: Available in your Twilio Console
- **MedPort Issues**: Check the backend console for detailed error logs

## 💰 Pricing Information

### Trial Account
- Free trial credits available
- Limited to verified phone numbers
- Perfect for development and testing

### Production Account
- Pay-as-you-go pricing
- SMS: ~$0.0075 per message (US)
- Email: Varies by provider
- Volume discounts available

## 🔒 Security Considerations

1. **Never commit your `.env` file to version control**
2. **Keep your Auth Token secure**
3. **Use environment variables in production**
4. **Implement rate limiting for production use**
5. **Monitor usage and costs**

## 🎯 Next Steps

After setting up Twilio:

1. **Test all notification types** in the dashboard
2. **Configure production environment** variables
3. **Set up monitoring** and alerting
4. **Implement rate limiting** and error handling
5. **Add notification preferences** for users
6. **Create notification history** and analytics

---

**Happy coding! 🚀**
