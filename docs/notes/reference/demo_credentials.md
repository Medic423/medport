# MedPort Demo Credentials Guide

## Overview

This document provides demo credentials for testing the MedPort Transport Center system. These credentials allow you to access different user roles and test the system's functionality without setting up real accounts.

**⚠️ IMPORTANT**: Demo credentials are now integrated into the regular Sign In form. There is no separate "Demo Login" button.

## 🆕 **NEW: Siloed Login System Credentials**

The system now features a **siloed login system** where each user type has dedicated login components and endpoints. This provides better isolation and easier debugging of login issues.

### **Siloed Login System Overview**
- **Transport Center Login**: Dedicated component for center users
- **Hospital Login**: Dedicated component for hospital users  
- **EMS Agency Login**: Dedicated component for agency users
- **Each system is completely isolated** - issues in one won't affect others

### **Siloed System Test Credentials**

#### **🚀 Transport Center Login**
**Role**: System coordinator with full system access
**Access**: Complete system overview and management

**Credentials:**
- **Email**: `center@medport.com`
- **Password**: `password123`
- **Database Role**: `COORDINATOR`
- **User Type**: `center`
- **Landing Page**: `/overview` (StatusBoard)

**What You Can Test:**
- System overview dashboard
- All trips management
- Hospital and EMS agency oversight
- System settings and feature toggles
- Complete transport coordination

#### **🏥 Hospital Login**
**Role**: Hospital staff managing transport requests
**Access**: Hospital-specific transport operations

**Credentials:**
- **Email**: `hospital@medport.com`
- **Password**: `password123`
- **Database Role**: `ADMIN`
- **User Type**: `hospital`
- **Landing Page**: `/dashboard` (HospitalDashboard)

**What You Can Test:**
- Trip dashboard and management
- New trip request creation
- Trip status monitoring
- Hospital-specific analytics

#### **🚑 EMS Agency Login**
**Role**: Transport agency staff managing assignments
**Access**: Agency-specific transport operations

**Credentials:**
- **Email**: `agency@medport.com`
- **Password**: `password123`
- **Database Role**: `TRANSPORT_AGENCY`
- **User Type**: `ems`
- **Landing Page**: `/trips/available` (TransportRequests)

**What You Can Test:**
- Available trips viewing
- Trip acceptance and management
- Route optimization tools
- Agency performance tracking

### **Siloed System Benefits**
- **🔒 Complete Isolation**: Each login system is independent
- **🐛 Easier Debugging**: Issues in one system don't affect others
- **🧪 Independent Testing**: Test each user type separately
- **🛡️ Protected Systems**: Working logins remain untouched during debugging
- **📈 Scalable Architecture**: Easy to add new user types

### **Siloed System Quick Reference Table**
| Login Type | Email | Password | Database Role | User Type | Landing Page | Purpose |
|------------|-------|----------|---------------|-----------|--------------|---------|
| **Transport Center** | `center@medport.com` | `password123` | `COORDINATOR` | `center` | `/overview` | System management |
| **Hospital** | `hospital@medport.com` | `password123` | `ADMIN` | `hospital` | `/dashboard` | Trip management |
| **EMS Agency** | `agency@medport.com` | `password123` | `TRANSPORT_AGENCY` | `ems` | `/trips/available` | Trip acceptance |

### **How to Use Siloed Login System**
1. **Visit Login Page**: Navigate to http://localhost:3002
2. **See Login Selector**: Choose from 3 login options
3. **Select Login Type**: Click on your desired user type
4. **Enter Credentials**: Use the corresponding test credentials above
5. **Access System**: Each login routes to appropriate landing page

---

## Legacy Demo User Types

### 🚀 **Developer Account (Full Access)**
**Role**: System developer with complete access to all functions
**Access**: **FULL SYSTEM ACCESS** - All modules, settings, and administrative functions

**Demo Credentials:**
- **Email**: `developer@medport-transport.com`
- **Password**: `dev123`
- **Role**: `ADMIN`
- **Access Level**: **SUPER ADMIN** - Complete system control

**What You Can Test:**
- **ALL SYSTEM FUNCTIONS** - Complete access to every module
- System administration and user management
- Module visibility settings and role-based access control
- All transport coordination features
- Complete analytics and reporting
- Agency and hospital management
- Route optimization and real-time tracking
- Settings and configuration management
- **Development and testing of all features**

### 🏥 **Transport Center Coordinators**
**Role**: System administrators who manage the overall transport coordination
**Access**: Full system access, dispatch management, analytics, and coordination tools

**Demo Credentials:**
- **Email**: `coordinator@medport-transport.com`
- **Password**: `demo123`
- **Role**: `COORDINATOR`
- **Access Level**: High - Most system functions

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
- **Access Level**: Medium - Hospital operations focus

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
- **Email**: `demo@agency.com`
- **Password**: `demo123`
- **Role**: `ADMIN`
- **Agency**: Demo Transport Agency
- **Access Level**: High - Agency management focus

**What You Can Test:**
- Unit management and status updates
- Transport request bidding
- Route optimization
- Real-time tracking
- Agency performance analytics
- Unit assignment management

### 💰 **Billing Staff**
**Role**: Financial planning and analysis staff
**Access**: Billing, financial reports, cost analysis, and revenue tracking

**Demo Credentials:**
- **Email**: `billing@medport.com`
- **Password**: `demo123`
- **Role**: `BILLING_STAFF`
- **Access Level**: Medium - Financial operations focus

**What You Can Test:**
- Financial planning and analysis
- Cost analysis and revenue tracking
- Agency financial management
- Billing and reporting
- Limited settings access

## How to Use Demo Credentials

### **1. Access the Login Screen**
1. Navigate to the MedPort application at http://localhost:3002
2. The login page is now the default landing page
3. You'll see three tabs: Transport Center, Hospital, and Agency

### **2. Select Your User Type**
- **Transport Center**: For system administrators and coordinators
- **Hospital**: For hospital staff and coordinators
- **Agency**: For transport agency staff

### **3. Use Demo Credentials in Sign In Form**
1. Select the appropriate tab for your user type
2. Enter the demo credentials from the table below
3. Click "Sign In" to log in
4. The system will automatically recognize demo credentials and create appropriate user sessions

### **4. Demo Credentials Table**
| User Type | Email | Password | Role | Access Level | Primary Use |
|-----------|-------|----------|------|--------------|-------------|
| **Developer** | `developer@medport-transport.com` | `dev123` | `ADMIN` | **SUPER ADMIN** | **Development & Testing** |
| Transport Center | `coordinator@medport-transport.com` | `demo123` | `COORDINATOR` | High | System coordination |
| Hospital | `coordinator@upmc-altoona.com` | `demo123` | `HOSPITAL_COORDINATOR` | Medium | Hospital operations |
| Agency | `demo@agency.com` | `demo123` | `ADMIN` | High | Agency management |
| Billing Staff | `billing@medport.com` | `demo123` | `BILLING_STAFF` | Medium | Financial operations |

## Current System Status

### **✅ Available Demo Endpoints:**
1. **Transport Center Demo**: `/api/transport-center/demo/login` - Creates COORDINATOR role
2. **Hospital Demo**: `/api/hospital/login` - Supports demo credentials for HOSPITAL_COORDINATOR role
3. **Agency Demo**: `/api/agency/demo/login` - Creates ADMIN role

### **🔧 Development Access:**
- **Developer Account**: `developer@medport-transport.com` / `dev123` provides **FULL ACCESS** to all system functions
- **Role**: ADMIN with complete system control
- **Purpose**: Development, testing, and system administration
- **Access**: All modules, settings, and administrative functions

### **📋 Module Access by Role:**
- **ADMIN**: Complete access to all modules and settings
- **COORDINATOR**: High-level access to most system functions
- **HOSPITAL_COORDINATOR**: Hospital-focused operations
- **BILLING_STAFF**: Financial and reporting functions
- **TRANSPORT_AGENCY**: Agency-specific operations

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

### **Developer Testing (Full Access)**
1. **Complete System Access**: Test all modules and functions
2. **Role-Based Access Control**: Verify module visibility settings
3. **System Administration**: Test user management and settings
4. **All Features**: Comprehensive testing of every system component
5. **Development Workflow**: Full access for continued development

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
- **Demo credentials are NOT displayed in the login interface** for security

### **Production Deployment**
- Demo credentials will be disabled
- Real authentication will be required
- HIPAA compliance measures will be active
- Secure data encryption will be enforced
- **No credential exposure** in the production interface

## Troubleshooting

### **Common Issues**
1. **Demo Credentials Not Working**: Ensure you're using the correct email/password combination from the table above
2. **Page Not Found**: Ensure all routes are properly configured
3. **Authentication Errors**: Verify JWT secret is set in environment variables
4. **Database Errors**: Check that the database is running and accessible
5. **Role Access Issues**: Verify that Module Visibility settings are configured in the Settings page

### **Getting Help**
- Check the browser console for error messages
- Verify backend server status
- Review the authentication logs
- Contact the development team for support

## Next Steps

### **Immediate Testing**
1. **Start with Developer Account**: Use `developer@medport-transport.com` / `dev123` for full access
2. Test all four user types with demo credentials from the table above
3. Verify navigation and routing between different sections
4. Test offline capabilities and data synchronization
5. Validate analytics and reporting functionality
6. Test role-based access control and Module Visibility settings

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

The demo credentials provide a comprehensive testing environment for the MedPort Transport Center system. The **Developer Account** (`developer@medport-transport.com` / `dev123`) provides **FULL ACCESS** to all system functions for development and testing purposes.

Use these credentials to explore all features, test different user roles, and validate the system's functionality before production deployment.

For questions or support, contact the development team or refer to the main documentation.

### **Siloed System Benefits**
- **🔒 Complete Isolation**: Each login system is independent
- **🐛 Easier Debugging**: Issues in one system don't affect others
- **🧪 Independent Testing**: Test each user type separately
- **🛡️ Protected Systems**: Working logins remain untouched during debugging
- **📈 Scalable Architecture**: Easy to add new user types

### **Siloed System Quick Reference Table**
| Login Type | Email | Password | Database Role | User Type | Landing Page | Purpose |
|------------|-------|----------|---------------|-----------|--------------|---------|
| **Transport Center** | `center@medport.com` | `password123` | `COORDINATOR` | `center` | `/overview` | System management |
| **Hospital** | `hospital@medport.com` | `password123` | `ADMIN` | `hospital` | `/dashboard` | Trip management |
| **EMS Agency** | `agency@medport.com` | `password123` | `TRANSPORT_AGENCY` | `ems` | `/trips/available` | Trip acceptance |

### **How to Use Siloed Login System**
