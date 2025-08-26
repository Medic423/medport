# MedPort Module Mapping by User Credentials

## Overview

This document provides a comprehensive mapping of exactly what modules, tabs, and navigation elements are displayed for each user credential type in the MedPort system. This serves as a reference for understanding role-based access control and troubleshooting navigation issues.

**Last Updated**: August 26, 2025  
**System Version**: Phase 6.5 Phase 2 + Navigation Cleanup + Demo Mode Removal  
**Branch**: `feature/role-based-menu-configuration` (stable state committed to main)

---

## 🚀 **Developer Account (Full Access)**

**Credentials**: `developer@medport-transport.com` / `dev123`  
**Role**: `ADMIN`  
**Access Level**: **SUPER ADMIN** - Complete system control

### **Navigation Structure:**
```
MedPort Transport Center
├── Dispatch Operations ▼
│   ├── Status Board
│   ├── Transport Requests
│   ├── Route Optimization
│   └── Real-Time Tracking
├── Financial Planning ▼
│   ├── Analytics & Reporting
│   ├── Resource Management
│   ├── Revenue Tracking
│   └── Cost Analysis
└── Tools & Utilities ▼
    ├── QR Code System
    ├── Offline Capabilities
    └── Distance Matrix Management
```

### **Module Access Details:**

#### **Dispatch Operations Category:**
- **Status Board**: ✅ Full access - View all transport requests, unit status, system overview
- **Transport Requests**: ✅ Full access - Create, edit, manage all transport requests
- **Route Optimization**: ✅ Full access - Optimize routes, manage assignments
- **Real-Time Tracking**: ✅ Full access - Track units, monitor status updates

#### **Financial Planning Category:**
- **Analytics & Reporting**: ✅ Full access - View all system analytics and reports
- **Resource Management**: ✅ Full access - Manage units, crew, equipment
- **Revenue Tracking**: ✅ Full access - Monitor revenue, billing, financial metrics
- **Cost Analysis**: ✅ Full access - Analyze costs, optimize operations

#### **Tools & Utilities Category:**
- **QR Code System**: ✅ Full access - Generate, scan, manage QR codes
- **Offline Capabilities**: ✅ Full access - Test offline functionality, sync management
- **Distance Matrix Management**: ✅ Full access - Manage facility distances, route calculations

#### **Settings Access:**
- **Module Visibility**: ✅ Full control - Toggle visibility for all modules and categories
- **Role Permissions**: ✅ Full control - Manage role permissions and access levels
- **System Configuration**: ✅ Full control - Configure all system settings

---

## 🏥 **Transport Center Coordinators**

**Credentials**: `coordinator@medport-transport.com` / `demo123`  
**Role**: `COORDINATOR`  
**Access Level**: High - Most system functions

### **Navigation Structure:**
```
MedPort Transport Center
├── Dispatch Operations ▼
│   ├── Status Board
│   ├── Transport Requests
│   ├── Route Optimization
│   └── Real-Time Tracking
├── Financial Planning ▼
│   ├── Analytics & Reporting
│   ├── Resource Management
│   ├── Revenue Tracking
│   └── Cost Analysis
└── Tools & Utilities ▼
    ├── QR Code System
    ├── Offline Capabilities
    └── Distance Matrix Management
```

### **Module Access Details:**

#### **Dispatch Operations Category:**
- **Status Board**: ✅ Full access - View all transport requests, unit status
- **Transport Requests**: ✅ Full access - Create, edit, manage transport requests
- **Route Optimization**: ✅ Full access - Optimize routes, manage assignments
- **Real-Time Tracking**: ✅ Full access - Track units, monitor status

#### **Financial Planning Category:**
- **Analytics & Reporting**: ✅ Full access - View system analytics and reports
- **Resource Management**: ✅ Full access - Manage units, crew, equipment
- **Revenue Tracking**: ✅ Full access - Monitor revenue and financial metrics
- **Cost Analysis**: ✅ Full access - Analyze costs and operations

#### **Tools & Utilities Category:**
- **QR Code System**: ✅ Full access - Generate, scan, manage QR codes
- **Offline Capabilities**: ✅ Full access - Test offline functionality
- **Distance Matrix Management**: ✅ Full access - Manage facility distances

#### **Settings Access:**
- **Module Visibility**: ❌ No access - Cannot modify module visibility
- **Role Permissions**: ❌ No access - Cannot modify role permissions
- **System Configuration**: ✅ Limited access - Operational settings only

---

## 🏥 **Hospital Users**

**Credentials**: `coordinator@upmc-altoona.com` / `demo123`  
**Role**: `HOSPITAL_COORDINATOR`  
**Hospital**: UPMC Altoona  
**Access Level**: Medium - Hospital operations focus

### **Navigation Structure:**
```
MedPort Transport Center
├── Dispatch Operations ▼
│   ├── Transport Requests
│   └── Status Board
├── Financial Planning ▼
│   └── Analytics & Reporting
└── Tools & Utilities ▼
    └── Offline Capabilities
```

### **Module Access Details:**

#### **Dispatch Operations Category:**
- **Transport Requests**: ✅ Full access - Create, edit, manage hospital transport requests
- **Status Board**: ✅ View access - Monitor request status and progress
- **Route Optimization**: ❌ No access - Not available for hospital users
- **Real-Time Tracking**: ❌ No access - Not available for hospital users

#### **Financial Planning Category:**
- **Analytics & Reporting**: ✅ Limited access - Hospital-specific analytics only
- **Resource Management**: ❌ No access - Cannot manage transport resources
- **Revenue Tracking**: ❌ No access - Cannot access revenue data
- **Cost Analysis**: ❌ No access - Cannot access cost analysis

#### **Tools & Utilities Category:**
- **Offline Capabilities**: ✅ Full access - Test offline functionality for hospital operations
- **QR Code System**: ❌ No access - Not available for hospital users
- **Distance Matrix Management**: ❌ No access - Cannot manage distance matrix

#### **Settings Access:**
- **Module Visibility**: ❌ No access - Cannot modify any settings
- **Role Permissions**: ❌ No access - Cannot modify permissions
- **System Configuration**: ❌ No access - Cannot modify configuration

---

## 🚑 **Transport Agency Users**

**Credentials**: `demo@agency.com` / `demo123`  
**Role**: `ADMIN` (Agency context)  
**Agency**: Demo Transport Agency  
**Access Level**: High - Agency management focus

### **Navigation Structure:**
```
MedPort Transport Center
├── Dispatch Operations ▼
│   ├── Status Board
│   ├── Transport Requests
│   └── Real-Time Tracking
├── Financial Planning ▼
│   ├── Analytics & Reporting
│   └── Resource Management
└── Tools & Utilities ▼
    ├── Agency Portal
    ├── Unit Management
    ├── Bid Management
    ├── Matching System
    ├── QR Code System
    ├── Offline Capabilities
    └── Distance Matrix Management
```

### **Module Access Details:**

#### **Dispatch Operations Category:**
- **Status Board**: ✅ Full access - View transport requests and assignments
- **Transport Requests**: ✅ Full access - View and manage agency transport requests
- **Real-Time Tracking**: ✅ Full access - Track agency units and status
- **Route Optimization**: ❌ No access - Not available for agency users

#### **Financial Planning Category:**
- **Analytics & Reporting**: ✅ Full access - Agency-specific analytics and reports
- **Resource Management**: ✅ Full access - Manage agency units, crew, equipment
- **Revenue Tracking**: ❌ No access - Cannot access revenue data
- **Cost Analysis**: ❌ No access - Cannot access cost analysis

#### **Tools & Utilities Category:**
- **Agency Portal**: ✅ Full access - Agency dashboard and management
- **Unit Management**: ✅ Full access - Manage agency units and status
- **Bid Management**: ✅ Full access - Manage transport bids and assignments
- **Matching System**: ✅ Full access - Match units to transport requests
- **QR Code System**: ✅ Full access - Generate and manage QR codes
- **Offline Capabilities**: ✅ Full access - Test offline functionality
- **Distance Matrix Management**: ✅ Full access - Manage facility distances

#### **Settings Access:**
- **Module Visibility**: ❌ No access - Cannot modify module visibility
- **Role Permissions**: ❌ No access - Cannot modify role permissions
- **System Configuration**: ❌ No access - Cannot modify system configuration

---

## 💰 **Billing Staff**

**Credentials**: `billing@medport.com` / `demo123`  
**Role**: `BILLING_STAFF`  
**Access Level**: Medium - Financial operations focus

### **Navigation Structure:**
```
MedPort Transport Center
├── Financial Planning ▼
│   ├── Analytics & Reporting
│   ├── Revenue Tracking
│   └── Cost Analysis
└── Tools & Utilities ▼
    └── Offline Capabilities
```

### **Module Access Details:**

#### **Dispatch Operations Category:**
- **Status Board**: ❌ No access - Cannot view transport operations
- **Transport Requests**: ❌ No access - Cannot view transport requests
- **Route Optimization**: ❌ No access - Cannot access route optimization
- **Real-Time Tracking**: ❌ No access - Cannot access real-time tracking

#### **Financial Planning Category:**
- **Analytics & Reporting**: ✅ Full access - Financial analytics and reports
- **Revenue Tracking**: ✅ Full access - Monitor revenue and billing
- **Cost Analysis**: ✅ Full access - Analyze costs and financial metrics
- **Resource Management**: ❌ No access - Cannot manage resources

#### **Tools & Utilities Category:**
- **Offline Capabilities**: ✅ Full access - Test offline functionality for financial operations
- **QR Code System**: ❌ No access - Not available for billing staff
- **Distance Matrix Management**: ❌ No access - Cannot access distance matrix
- **Agency Portal**: ❌ No access - Cannot access agency functions

#### **Settings Access:**
- **Module Visibility**: ❌ No access - Cannot modify any settings
- **Role Permissions**: ❌ No access - Cannot modify permissions
- **System Configuration**: ❌ No access - Cannot modify configuration

---

## 🔧 **Technical Implementation Details**

### **Module Visibility Control:**
- **ADMIN Role**: Full control over all module visibility settings
- **COORDINATOR Role**: Limited operational settings access
- **Other Roles**: No access to module visibility controls

### **Navigation Generation:**
- Navigation is dynamically generated based on user role and permissions
- Modules are filtered by `visibleToRoles` array in backend configuration
- Categories are automatically hidden if all sub-modules are disabled

### **Permission Validation:**
- Backend validates permissions before allowing access to modules
- Frontend checks permissions before rendering navigation elements
- API endpoints validate role-based access for all operations

### **Demo Mode Integration:**
- Demo credentials work through regular authentication flow
- No separate demo bypass or special endpoints
- Demo users see exactly what's configured in Module Visibility settings

---

## 📋 **Quick Reference Table**

| User Type | Role | Dispatch Ops | Financial Planning | Tools & Utilities | Settings Access |
|-----------|------|--------------|-------------------|-------------------|-----------------|
| **Developer** | `ADMIN` | ✅ Full | ✅ Full | ✅ Full | ✅ Full Control |
| **Coordinator** | `COORDINATOR` | ✅ Full | ✅ Full | ✅ Full | ⚠️ Limited |
| **Hospital** | `HOSPITAL_COORDINATOR` | ⚠️ Limited | ⚠️ Limited | ⚠️ Limited | ❌ None |
| **Agency** | `ADMIN` (Agency) | ⚠️ Limited | ⚠️ Limited | ✅ Full | ❌ None |
| **Billing** | `BILLING_STAFF` | ❌ None | ✅ Full | ⚠️ Limited | ❌ None |

### **Legend:**
- ✅ **Full**: Complete access to all functions
- ⚠️ **Limited**: Access to specific functions only
- ❌ **None**: No access to this category/module

---

## 🚨 **Troubleshooting Common Issues**

### **"Module Not Found" Errors:**
1. Check user role in authentication response
2. Verify module is enabled in Settings → Module Visibility
3. Confirm user has required permissions for the module

### **Navigation Not Loading:**
1. Check backend server status (port 5001)
2. Verify authentication token is valid
3. Check browser console for API errors

### **Missing Modules:**
1. Verify Module Visibility settings in Settings page
2. Check user role permissions
3. Ensure backend services are running

### **Permission Denied:**
1. Verify user role has required permissions
2. Check Module Visibility settings
3. Confirm backend permission validation is working

---

## 📚 **Related Documentation**

- **Demo Credentials**: `docs/notes/reference/demo_credentials.md`
- **Implementation Plan**: `docs/notes/medport_plan.md`
- **API Documentation**: Backend route files in `backend/src/routes/`
- **Frontend Components**: React components in `frontend/src/components/`

---

## 🔄 **Update History**

- **August 26, 2025**: Initial creation based on Phase 6.5 Phase 2 + Navigation Cleanup
- **Status**: Current and accurate for stable system state
- **Next Update**: After Module Visibility improvements are implemented

---

**This document serves as the authoritative reference for understanding exactly what each user credential can access in the MedPort system.**
