# MedPort Demo Credentials Guide

## Overview

This document provides demo credentials for testing the MedPort Transport Center system. These credentials allow you to access different user roles and test the system's functionality without setting up real accounts.

## Demo User Types

### 🏥 **Transport Center Coordinators**
**Role**: System administrators who manage the overall transport coordination
**Access**: Full system access, dispatch management, analytics, and coordination tools

**Demo Credentials:**
- **Email**: `coordinator@medport-transport.com`
- **Password**: `demo123`
- **Role**: `TRANSPORT_COORDINATOR`

**What You Can Test:**
- System overview and dashboard
- Transport request management
- Unit assignment and optimization
- Analytics and reporting
- Agency and hospital management
- Route optimization
- Real-time tracking

### 🏥 **Hospital Users**
**Role**: Hospital staff who create transport requests and manage patient transfers
**Access**: Transport request creation, status tracking, and hospital-specific analytics

**Demo Credentials:**
- **Email**: `coordinator@upmc-altoona.com`
- **Password**: `demo123`
- **Role**: `HOSPITAL_COORDINATOR`
- **Hospital**: UPMC Altoona

**What You Can Test:**
- Create transport requests
- Track request status
- View hospital-specific analytics
- Manage patient transfers
- Coordinate with transport agencies
- Access offline capabilities

### 🚑 **Transport Agency Users**
**Role**: EMS and transport company staff who manage units and accept assignments
**Access**: Unit management, assignment acceptance, route optimization, and agency analytics

**Demo Credentials:**
- **Email**: `admin@demo-ems.com`
- **Password**: `demo123`
- **Role**: `AGENCY_ADMIN`
- **Agency**: Demo EMS

**What You Can Test:**
- Unit management and status updates
- Transport request bidding
- Route optimization
- Real-time tracking
- Agency performance analytics
- Unit assignment management

## How to Use Demo Credentials

### **1. Access the Login Screen**
1. Navigate to the MedPort application
2. Click the "Login" button in the header
3. You'll see three tabs: Transport Center, Hospital, and Agency

### **2. Select Your User Type**
- **Transport Center**: For system administrators and coordinators
- **Hospital**: For hospital staff and coordinators
- **Agency**: For transport agency staff

### **3. Use Demo Login**
1. Select the appropriate tab for your user type
2. Click the "Demo Login" button
3. The system will automatically log you in with demo credentials
4. You'll be redirected to the appropriate dashboard

### **4. Alternative: Manual Demo Login**
1. Select the appropriate tab for your user type
2. Click "Demo Credentials" to see the credentials
3. Click "Fill Demo Credentials" to populate the form
4. Click "Sign In" to log in manually

## Demo Data Available

### **Transport Requests**
- Sample patient transport requests
- Various statuses (Pending, In Progress, Completed)
- Different priority levels and transport types
- Realistic facility and patient information

### **Units and Agencies**
- Demo EMS units with realistic capabilities
- Unit status tracking and location data
- Agency performance metrics
- Historical assignment data

### **Facilities**
- UPMC Altoona (demo hospital)
- Penn State Health (demo destination)
- Various clinic and specialty center types
- Realistic address and contact information

### **Analytics Data**
- Performance metrics and trends
- Revenue and cost analysis
- Efficiency scores and optimization data
- Historical performance data

## Testing Scenarios

### **Transport Center Testing**
1. **System Overview**: View total transports, pending requests, and active units
2. **Request Management**: Monitor and assign transport requests
3. **Unit Assignment**: Use optimization algorithms to assign units
4. **Analytics**: Review system performance and efficiency metrics
5. **Real-time Tracking**: Monitor unit locations and status updates

### **Hospital Testing**
1. **Request Creation**: Create new transport requests
2. **Status Tracking**: Monitor request progress and completion
3. **Analytics**: View hospital-specific performance metrics
4. **Offline Mode**: Test offline capabilities and data synchronization
5. **Integration**: Test with transport agency coordination

### **Agency Testing**
1. **Unit Management**: Update unit status and availability
2. **Assignment Acceptance**: Accept and manage transport assignments
3. **Route Optimization**: Use route optimization tools
4. **Performance Tracking**: Monitor agency performance metrics
5. **Real-time Updates**: Test real-time tracking and status updates

## Demo Mode Features

### **Offline Capabilities**
- Test offline data storage and synchronization
- Verify background sync when connection is restored
- Test offline analytics and reporting
- Validate offline transport request management

### **Real-time Features**
- WebSocket connections for live updates
- Real-time unit tracking and status updates
- Live transport request status changes
- Real-time notifications and alerts

### **Analytics and Reporting**
- Comprehensive performance metrics
- Cost analysis and revenue tracking
- Efficiency optimization recommendations
- Historical data analysis and trends

## Security Notes

### **Demo Environment**
- Demo credentials are for testing only
- No real patient or medical data
- All data is simulated and anonymized
- Demo mode is clearly indicated in the interface

### **Production Deployment**
- Demo credentials will be disabled
- Real authentication will be required
- HIPAA compliance measures will be active
- Secure data encryption will be enforced

## Troubleshooting

### **Common Issues**
1. **Demo Login Fails**: Check that the backend is running and accessible
2. **Page Not Found**: Ensure all routes are properly configured
3. **Authentication Errors**: Verify JWT secret is set in environment variables
4. **Database Errors**: Check that the database is running and accessible

### **Getting Help**
- Check the browser console for error messages
- Verify backend server status
- Review the authentication logs
- Contact the development team for support

## Next Steps

### **Immediate Testing**
1. Test all three user types with demo credentials
2. Verify navigation and routing between different sections
3. Test offline capabilities and data synchronization
4. Validate analytics and reporting functionality

### **Production Preparation**
1. Set up real user authentication
2. Configure production database
3. Implement security measures
4. Set up monitoring and logging
5. Deploy to Render production environment

### **Beta Testing**
1. Invite beta testers with real accounts
2. Collect feedback on user experience
3. Test with real transport scenarios
4. Validate business logic and workflows
5. Performance testing and optimization

## Conclusion

The demo credentials provide a comprehensive testing environment for the MedPort Transport Center system. Use these credentials to explore all features, test different user roles, and validate the system's functionality before production deployment.

For questions or support, contact the development team or refer to the main documentation.
