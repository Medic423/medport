# 🏥 **FIRST DRAFT: NEW TCC PROJECT ANALYSIS & RECOMMENDATION**

## 📋 **EXECUTIVE SUMMARY**

**Recommendation**: **START FRESH** with a new project based on the five reference documents, incorporating only the working base layer from the current system.

**Rationale**: The current system has fundamental architectural flaws that make it unsuitable for the core requirements. The siloed database architecture is sound, but the application layer is too complex and fragmented to meet the simple, fast requirements outlined in the reference documents.

## 🎯 **CURRENT PROGRESS STATUS**

### **✅ MAJOR MILESTONE: MAIN BRANCH MERGE COMPLETE**
- **Date**: September 7, 2025
- **Status**: All production features successfully merged to main branch
- **Branch Status**: `main` and `production` branches are now identical
- **System Status**: Stable and ready for continued development
- **Backup Status**: Project backed up to external drive `/Volumes/Acasis/`


### **✅ Phase 1: COMPLETE (100%)**
- [x] Database setup with siloed architecture
- [x] TCC admin dashboard with full CRUD operations
- [x] Hospital, EMS agency, and facility management
- [x] Authentication system with JWT (Admin/User types)
- [x] Basic reporting and analytics (Analytics tab with revenue optimization)
- [x] Public login screen with role selection
- [x] Account creation forms (Healthcare and EMS registration)

### **🔄 Phase 2: IN PROGRESS (40%)**
- [x] Public login screen with role selection (Healthcare/EMS/TCC)
- [x] Account creation flows with different forms for each role
- [ ] Approval queue system for new accounts
- [ ] Freemium tier implementation
- [ ] Healthcare Portal with trip creation form
- [ ] EMS Dashboard with trip management
- [ ] Trip API endpoints (create, read, update)
- [ ] Database relations and foreign keys
- [ ] Email notifications

### **🔄 Phase 3: PARTIALLY COMPLETE (50%)**
- [x] Route optimization algorithms (Backend only)
- [x] Revenue optimization engine (Backend only)
- [ ] Advanced EMS features (UI missing - should be in Analytics tab)

### **📅 Phase 4: PLANNED**
- [ ] Mobile application development
- [ ] Mapping integration
- [ ] Advanced reporting

### **📅 Phase 5: PLANNED**
- [ ] Production deployment (Render)
- [ ] Multi-state operations
- [ ] Pricing models

---

## 🌐 **PUBLIC LOGIN SCREEN ARCHITECTURE**

### **Domain Structure:**
- **Main Domain**: `tcc.com` - Public login screen with role selection
- **TCC Admin**: `admin.tcc.com` - Transport Control Center dashboard
- **User Dashboards**: `app.tcc.com` - Healthcare and EMS user dashboards

### **Public Login Screen Features:**
1. **Role Selection Buttons**:
   - 🏥 **Healthcare Facility Login** (Green)
   - 🚑 **EMS Agency Login** (Orange) 
   - 🏢 **Transport Center Login** (Blue)

2. **Account Creation Flows**:
   - **Healthcare Facility Registration**:
     - Facility type dropdown (Hospital, Clinic, Urgent Care, Rehabilitation, Doctor's Office, Dialysis Center, etc.)
     - Facility information form
     - Contact person details
     - Service area selection
   - **EMS Agency Registration**:
     - Service type dropdown (EMS, Wheelchair Van, Other)
     - Agency information form
     - Service capabilities
     - Coverage area selection

3. **Approval Queue System**:
   - New accounts go to TCC admin approval queue
   - Email notifications to TCC admins
   - Account status tracking (Pending, Approved, Rejected)
   - Email notifications to applicants

### **Freemium Model Implementation:**
- **Free Tier Features**:
  - Healthcare: Post trips, monitor status, basic email/SMS notifications
  - EMS: View trips with 100-mile radius filter, trip type filtering (ALS/BLS/CCT)
  - Monthly trip limits (e.g., 10 trips per month for free users)
- **Paid Tier Features**:
  - Unlimited trips
  - Advanced analytics and reporting
  - Priority support
  - All optimization features
- **Upgrade Prompts**: Throughout the interface for free users

---

## 🎯 **CORE REQUIREMENTS ANALYSIS**

### **From Reference Documents:**

#### **1. Simple & Fast Trip Entry (Healthcare Organizations)**
- **Current State**: ❌ **BROKEN** - Trip creation fails due to facility search issues
- **Required**: Simple form with facility selection, LOS, time windows, special flags
- **Reference**: Documents 1-4 emphasize "simple", "fast", "minimal viable product"

#### **2. EMS Dashboard with Route Optimization**
- **Current State**: ❌ **INCOMPLETE** - Basic demo optimization only
- **Required**: Filterable trip list, accept/decline, revenue optimization, backhaul detection
- **Reference**: Documents 2-4 detail sophisticated revenue optimization algorithms

#### **3. Transport Control Center (Admin)**
- **Current State**: ❌ **MISSING** - No hospital management system exists
- **Required**: Manage hospitals, EMS agencies, system administration
- **Reference**: Document 5 identifies this as "CRITICAL - BLOCKING CORE FUNCTIONALITY"

---

## 🔍 **CURRENT SYSTEM ANALYSIS**

### **✅ What Works (Keep in New Project):**

#### **1. Database Architecture (SILOED)**
- **Three PostgreSQL databases**: Hospital (5432), EMS (5433), Center (5434)
- **DatabaseManager**: Cross-database connection management
- **Authentication**: JWT-based with user types (hospital/ems/center)
- **Status**: ✅ **SOLID FOUNDATION**

#### **2. Base Infrastructure**
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Tailwind CSS
- **Database**: Prisma ORM with proper schemas
- **Status**: ✅ **REUSABLE**

#### **3. Authentication System**
- **SimpleAuth**: User type determination (hospital/ems/center)
- **Session Management**: JWT tokens with proper validation
- **Status**: ✅ **WORKING**

### **❌ What's Broken (Don't Migrate):**

#### **1. Trip Creation System**
- **Problem**: Facility search queries wrong database
- **Impact**: Cannot create trips (core functionality broken)
- **Root Cause**: Complex cross-database queries not properly implemented

#### **2. Hospital Management**
- **Problem**: No way to add/manage hospitals
- **Impact**: System cannot function without hospital data
- **Root Cause**: Missing UI and proper API endpoints

#### **3. Route Optimization**
- **Problem**: Only demo data, no real algorithms
- **Impact**: EMS cannot optimize routes or maximize revenue
- **Root Cause**: Services written for different database schema

#### **4. Revenue Optimization**
- **Problem**: Complex system that doesn't work
- **Impact**: No real revenue optimization capabilities
- **Root Cause**: Over-engineered for requirements

---

## 📊 **REFERENCE DOCUMENTS REQUIREMENTS MAPPING**

### **Document 1: Features Each Module**
- **Healthcare Portal**: Simple trip entry with LOS, time windows, flags
- **EMS Optimization**: Route optimization, revenue maximization, backhaul detection
- **Center Console**: System administration, trip oversight

### **Document 2: Revenue Routes**
- **Objective**: Maximize Σ(Revenue - VariableCost) - λ1*DeadheadMiles - λ2*LatePenalties + λ3*BackhaulPairs
- **Algorithm**: Greedy scorer with backhaul pairing heuristic
- **KPIs**: Loaded-mile ratio, $/unit-hr, % paired trips, Accept→Pickup median

### **Document 3: Route Optimization**
- **MVP Focus**: Lightweight backend + frontend prototype
- **Tech Stack**: Node.js + Express + SQLite (for MVP)
- **Features**: Queue API, optimization service, simple UI

### **Document 4: Transport Optimizer**
- **Features**: Hospital request portal, EMS route optimization, dispatch console
- **Optimization**: Greedy scorer, backhaul detection (90 min, 15 mi radius)
- **KPIs**: Loaded-mile ratio, $/unit-hr, Accept→Pickup time

### **Document 5: Hospital Creation & Management**
- **Critical Issue**: No hospital management system exists
- **Required**: Hospital CRUD, facility management, multi-state support
- **Impact**: System cannot function without this

---

## 🏗️ **RECOMMENDED NEW PROJECT ARCHITECTURE**

### **Phase 1: Transport Control Center Foundation (1 week - 40 hours)**

#### **1.1 Database Setup & Authentication**
- [x] Fresh PostgreSQL setup with siloed architecture
- [x] Database schemas (Hospital, EMS, Center)
- [x] DatabaseManager for cross-database connections
- [x] JWT authentication with admin-only access
- [x] Admin login: Full TCC system access
- [x] Simple authentication (no complex role system)

#### **1.2 Transport Control Center Module**
**Frontend: React admin dashboard**
- [x] Hospital management (CRUD operations)
- [x] EMS agency management (CRUD operations)
- [x] Facility management (CRUD operations)
- [x] System monitoring dashboard
- [ ] Basic reporting interface (Analytics tab placeholder)

**Backend: Admin APIs**
- [x] Hospital CRUD endpoints
- [x] EMS agency CRUD endpoints
- [x] Facility CRUD endpoints
- [x] System statistics endpoints
- [x] User management (admin/user roles)

#### **1.3 Basic Reporting System**
- [ ] Current trips in system count
- [ ] Trips accepted by transport agencies (by timeframe)
- [ ] Trips booked by each healthcare facility
- [ ] System health monitoring
- [ ] User activity tracking

#### **1.4 Foundation for Other Modules**
- [x] Database seeding with test data
- [x] API endpoints for cross-module communication
- [ ] Authentication system ready for healthcare/EMS modules (Admin only working)
- [x] Facility data ready for trip creation
- [x] Agency data ready for trip assignment

### **Phase 2: Healthcare Portal & EMS Dashboard (1-2 weeks)**

#### **2.1 Healthcare Portal (Simple Trip Entry)**
**Frontend: React component with minimal form**
- [x] Facility selection (dropdown with search)
- [x] LOS selection (BLS/ALS/CCT)
- [x] Time window (ready_start, ready_end)
- [x] Special flags (Isolation, Bariatric, etc.)
- [x] Submit button

**Backend: Trip creation APIs**
- [x] POST /api/trips
- [x] Validate input
- [x] Store in Hospital DB
- [ ] Send notifications (email-based)

#### **2.2 EMS Dashboard (Trip Management)**
**Frontend: React component with trip list**
- [x] Filterable trip list (status, LOS, location)
- [x] Accept/Decline buttons
- [x] ETA input
- [ ] Basic route optimization view

**Backend: Trip management APIs**
- [x] GET /api/trips (with filters)
- [x] POST /api/trips/:id/accept
- [x] POST /api/trips/:id/decline
- [ ] Basic optimization endpoints

#### **2.3 Email Notification System**
**Backend: Notification Service**
- [ ] Email service setup (SMTP configuration)
- [ ] Email templates for trip notifications
- [ ] New trip request notifications to EMS agencies
- [ ] Trip status update notifications to healthcare facilities
- [ ] Email delivery tracking and error handling
- [ ] Configuration for different notification types

**Frontend: Notification Settings**
- [ ] User notification preferences
- [ ] Email address management
- [ ] Notification history/logs

### **Phase 3: Route Optimization & Revenue Engine (1-2 weeks)**

#### **3.1 Revenue Optimization Engine** ✅ **BACKEND COMPLETE**
- [x] Algorithm: Greedy scorer from Document 2
- [x] score(u, r, t_now) = revenue(r) - α*deadhead_miles - β*wait_time + γ*backhaul_bonus - δ*overtime_risk
- [x] Backhaul pairing: 90 min, 15 mi radius
- [x] KPIs: Loaded-mile ratio, $/unit-hr, % paired trips
- [x] Backend service for optimization
- [x] Real-time scoring
- [x] Revenue tracking

#### **3.2 Advanced EMS Features** ❌ **UI MISSING**
- [ ] Route optimization dashboard (Backend ready, UI needed in Analytics tab)
- [ ] Revenue analytics (Backend ready, UI needed in Analytics tab)
- [ ] Unit management (Backend ready, UI needed in Analytics tab)
- [ ] Performance tracking (Backend ready, UI needed in Analytics tab)

### **Phase 4: Mobile App & Advanced Features (1-2 weeks)**

#### **4.1 Mobile Application**
- [ ] Platform: React Native (recommended)
- [ ] Trip entry for healthcare users
- [ ] Trip management for EMS users
- [ ] Offline capability
- [ ] Push notifications

#### **4.2 Mapping Integration**
- [ ] Service: Google Maps or Mapbox
- [ ] Distance/time calculation
- [ ] Route visualization
- [ ] Real-time tracking
- [ ] Geofencing capabilities

#### **4.3 Advanced Reporting & Analytics**
- [ ] Revenue tracking per agency
- [ ] Performance metrics (response times, completion rates)
- [ ] Geographic analysis
- [ ] Real-time dashboard updates

### **Phase 5: Production & Scaling (1 week)**

#### **5.1 Multi-State Operations**
- [ ] Geographic filtering
- [ ] Regional analytics
- [ ] Multi-state hospital management

#### **5.2 Pricing Models**
- [ ] Freemium tiers
- [ ] Usage-based pricing (per 100 trips)
- [ ] Optimization fees (percentage of optimized trips)

#### **5.3 Production Readiness**
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Monitoring and logging
- [ ] Deployment automation
- [ ] **Render deployment configuration**

---

## 🚀 **RENDER DEPLOYMENT STRATEGY**

### **Timing Recommendation: Phase 2 Complete**

**Answer: It's NOT too early to configure Render, but timing matters:**

#### **✅ Phase 2 Complete (Recommended)**
- **Why**: Core functionality is working and stable
- **Benefits**: 
  - Real-world testing environment
  - Stakeholder demos possible
  - Database performance validation
  - Production-like environment for Phase 3 development

#### **❌ Too Early (Phase 1)**
- **Why**: Only admin functionality, no core business logic
- **Risks**: 
  - Premature optimization
  - Configuration changes needed as features are added
  - Wasted time on deployment before core features are ready

#### **⚠️ Too Late (Phase 4+)**
- **Why**: Missing valuable production testing time
- **Risks**:
  - Performance issues discovered too late
  - Database scaling problems in production
  - Integration issues with external services

### **Render Configuration Checklist (Phase 2 Complete)**
- [ ] **Backend Service**: Node.js + Express + PostgreSQL
- [ ] **Frontend Service**: React + Vite build
- [ ] **Database**: PostgreSQL with 3 databases (Hospital, EMS, Center)
- [ ] **Environment Variables**: All API keys and database URLs
- [ ] **Domain Setup**: Custom domain for production
- [ ] **SSL Certificates**: Automatic HTTPS
- [ ] **Monitoring**: Basic health checks and logging
- [ ] **Backup Strategy**: Database backup configuration

### **Development vs Production**
- **Development**: Continue using local development (ports 3000/5001)
- **Production**: Render for stakeholder demos and testing
- **Staging**: Optional Render staging environment for testing

---

## 🛠️ **MIGRATION STRATEGY**

### **What to Keep from Current System:**
1. **Database Architecture**: Siloed databases (Hospital/EMS/Center)
2. **DatabaseManager**: Cross-database connection management
3. **Authentication**: JWT system with user types
4. **Base Infrastructure**: Node.js, Express, React, Tailwind
5. **Database Schemas**: Core models (User, Hospital, EMSAgency, TransportRequest)

### **What to Rebuild:**
1. **Trip Creation**: Simple, working form
2. **Hospital Management**: Complete CRUD system
3. **Route Optimization**: Real algorithms from reference documents
4. **Revenue Optimization**: Greedy scorer with backhaul detection
5. **Frontend Components**: Clean, simple UI focused on core functionality

### **What to Discard:**
1. **Complex Services**: 25+ services with database mismatches
2. **Orphaned Components**: 6+ unused frontend components
3. **Over-engineered Features**: Advanced transport, air medical, etc.
4. **Broken Integrations**: Facility search, trip creation, etc.

---

## 📈 **SUCCESS CRITERIA**

### **Phase 1 Complete When (1 week):**
- [x] TCC users can manage hospitals (CRUD operations)
- [x] TCC users can manage EMS agencies (CRUD operations)
- [x] TCC users can manage facilities (CRUD operations)
- [x] Basic reporting shows system statistics
- [x] Admin/user authentication works correctly
- [x] Database setup is complete and stable
- [x] Foundation data is ready for other modules

### **Phase 2 Complete When (1-2 weeks):**
- [x] Healthcare users can create trips in < 2 minutes
- [x] EMS users can view and accept trips
- [x] Trip creation works end-to-end
- [ ] Basic notifications work (email-based)
- [x] No database errors or broken functionality

### **Phase 3 Complete When (1-2 weeks):**
- [ ] Route optimization works with real algorithms from reference documents
- [ ] Revenue optimization shows measurable improvements
- [ ] Backhaul detection suggests valid pairings (90 min, 15 mi radius)
- [ ] KPIs track loaded-mile ratio and revenue
- [ ] Greedy scorer algorithm implemented correctly

### **Phase 4 Complete When (1-2 weeks):**
- [ ] Mobile app works for trip entry and management
- [ ] Mapping integration provides distance/time calculations
- [ ] Advanced reporting shows detailed analytics
- [ ] Real-time updates work across modules

### **Phase 5 Complete When (1 week):**
- [ ] Multi-state operations work
- [ ] Pricing models are implemented
- [ ] System is production-ready
- [ ] All reference document requirements met
- [ ] Mobile app is deployed and functional
- [ ] **Render deployment is live and stable**

---

## ❓ **QUESTIONS FOR CLARIFICATION**

### **1. Database Migration** ✅ **ANSWERED**
- **Keep current siloed database structure**: ✅ **YES**
- **Start completely fresh**: ✅ **YES** - No data migration needed
- **Database constraints**: ✅ **NONE** - Full flexibility

### **2. Feature Prioritization** ✅ **ANSWERED**
- **Most critical module first**: ✅ **Transport Control Center** - Creates data needed by other modules
- **Features to keep**: ✅ **None specified** - Clean slate approach
- **Pricing models timing**: ✅ **Phase 3** - Focus on core functionality first

### **3. Technical Approach** ✅ **ANSWERED**
- **Database platform**: ✅ **PostgreSQL** - Better for large data volumes
- **Algorithm implementation**: ✅ **Exact algorithms** from reference documents
- **Authentication system**: ✅ **Same approach** with admin/user login per module
- **Admin vs User access**: ✅ **Admin** = full access, **User** = excludes Admin tab

### **4. Timeline & Resources** ✅ **ANSWERED**
- **Working hours**: ✅ **40 hours/week full-time**
- **Phase 1 timeline**: ✅ **1 week** - Aggressive but achievable
- **SMS/Email services**: ✅ **Avoid external services** - Prefer built-in solutions
- **Development environment**: ✅ **Start fresh** - New clean setup

### **5. Integration Requirements** ✅ **ANSWERED**
- **External integrations**: ✅ **Mapping** (most likely)
- **Mobile apps**: ✅ **YES** - For nurses to enter trips anywhere in facility
- **Reporting requirements**: ✅ **TCC module** needs:
  - Current trips in system count
  - Trips accepted by transport agencies (timeframes)
  - Trips booked by each healthcare facility

## ❓ **ADDITIONAL CLARIFYING QUESTIONS** ✅ **ALL ANSWERED**

### **6. Transport Control Center Priority** ✅ **ANSWERED**
- **Confirmation**: ✅ **YES** - TCC module first to create foundational data
- **Admin vs User logins**: ✅ **ADMIN ONLY** - TCC only needs admin access

### **7. Mobile App Strategy** ✅ **ANSWERED**
- **Timeline**: ✅ **AFTER PRODUCTION** - Not until web app is production-ready
- **Functionality**: ✅ **BOTH** - Trip entry (healthcare) + Trip management (EMS)
- **Platform**: ✅ **REACT NATIVE** - Single codebase for both platforms

### **8. Notification System** ✅ **ANSWERED**
- **Built-in approach**: ✅ **EMAIL + BASIC SMS** - No external services initially
- **Future planning**: ✅ **SCAFFOLD FOR TWILIO** - Design for easy integration later
- **Real-time updates**: ✅ **POLLING ACCEPTABLE** - No need for real-time initially

### **9. Mapping Integration** ✅ **ANSWERED**
- **Service preference**: ✅ **GOOGLE MAPS** - Your preferred choice
- **Features needed**: ✅ **DISTANCE/TIME CALCULATION** - Core functionality first

### **10. Reporting & Analytics** ✅ **ANSWERED**
- **TCC reporting**: ✅ **BASIC METRICS** - Current trips, accepted trips, booked trips
- **Real-time vs batch**: ✅ **ON-DEMAND** - Generated when requested

### **11. Phase 1 Scope Clarification** ✅ **ANSWERED**
- **TCC Module**: ✅ **PURE TCC FUNCTIONALITY** - No trip creation/testing
- **Authentication**: ✅ **ADMIN LOGIN ONLY** - Single admin access level
- **Database**: ✅ **FRESH POSTGRESQL** - Clean siloed architecture
- **Timeline**: ✅ **1 WEEK (40 HOURS)** - Aggressive but achievable

---

## 🎯 **NEXT STEPS**

### **Immediate Actions (This Week):**
1. ✅ **Update planning document** - COMPLETED
2. ✅ **Complete Phase 1.3: Analytics Tab** - COMPLETED
3. ✅ **Complete Phase 1.4: Two-User-Type Authentication** - COMPLETED
4. ✅ **Create Public Login Screen** - Role selection with account creation flows - COMPLETED
5. ✅ **Merge to Main Branch** - All features successfully merged to main - COMPLETED
6. **Implement Approval Queue System** - TCC admin approval for new accounts
7. **Add Freemium Tier Logic** - Free vs paid user feature restrictions

### **Current Priority Order:**
1. **Approval Queue System** - TCC admin approval workflow (3-4 hours)
2. **Freemium Implementation** - User tier restrictions and upgrade prompts (2-3 hours)
3. **Email Verification System** - Simple email link verification (2-3 hours)
4. **Trip Limits System** - Configurable monthly trip limits (2-3 hours)
5. **Domain Setup** - Configure subdomains for different user types (1-2 hours)

### **Ready to Start Development:**
- ✅ All requirements clarified
- ✅ Technical specification complete
- ✅ Database schemas defined
- ✅ API endpoints specified
- ✅ Frontend components planned
- ✅ Authentication system designed
- ✅ Project structure outlined

## 📋 **PHASE 1 DETAILED TECHNICAL SPECIFICATION**

### **1. Database Schemas (PostgreSQL - 3 Siloed Databases)**

#### **Hospital Database (Port 5432)**
```sql
-- Hospital users and facilities
CREATE TABLE hospital_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE facilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- HOSPITAL, CLINIC, URGENT_CARE, etc.
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  coordinates JSONB, -- {lat: number, lng: number}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transport_requests (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  origin_facility_id TEXT REFERENCES facilities(id),
  destination_facility_id TEXT REFERENCES facilities(id),
  transport_level TEXT NOT NULL, -- BLS, ALS, CCT
  priority TEXT NOT NULL, -- LOW, MEDIUM, HIGH, URGENT
  status TEXT DEFAULT 'PENDING',
  special_requirements TEXT,
  request_timestamp TIMESTAMP DEFAULT NOW(),
  accepted_timestamp TIMESTAMP,
  pickup_timestamp TIMESTAMP,
  completion_timestamp TIMESTAMP,
  assigned_agency_id TEXT,
  assigned_unit_id TEXT,
  created_by_id TEXT REFERENCES hospital_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **EMS Database (Port 5433)**
```sql
-- EMS agencies and units
CREATE TABLE ems_agencies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  service_area TEXT[],
  operating_hours JSONB,
  capabilities TEXT[], -- BLS, ALS, CCT
  pricing_structure JSONB,
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'ACTIVE',
  added_by TEXT,
  added_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE units (
  id TEXT PRIMARY KEY,
  agency_id TEXT REFERENCES ems_agencies(id),
  unit_number TEXT NOT NULL,
  type TEXT NOT NULL, -- AMBULANCE, WHEELCHAIR_VAN, etc.
  capabilities TEXT[],
  current_status TEXT DEFAULT 'AVAILABLE',
  current_location JSONB,
  shift_start TIMESTAMP,
  shift_end TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Center Database (Port 5434)**
```sql
-- System administration and analytics
CREATE TABLE center_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  user_type TEXT NOT NULL, -- ADMIN
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE hospitals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  type TEXT NOT NULL,
  capabilities TEXT[],
  region TEXT NOT NULL,
  coordinates JSONB,
  operating_hours TEXT,
  is_active BOOLEAN DEFAULT true,
  requires_review BOOLEAN DEFAULT false,
  approved_at TIMESTAMP,
  approved_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE system_analytics (
  id TEXT PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **2. API Endpoints (Express.js + TypeScript)**

#### **Authentication Endpoints**
```typescript
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/verify
```

#### **Hospital Management Endpoints**
```typescript
GET    /api/tcc/hospitals              // List all hospitals
POST   /api/tcc/hospitals              // Create new hospital
GET    /api/tcc/hospitals/:id          // Get hospital details
PUT    /api/tcc/hospitals/:id          // Update hospital
DELETE /api/tcc/hospitals/:id          // Delete hospital
GET    /api/tcc/hospitals/search       // Search hospitals
```

#### **EMS Agency Management Endpoints**
```typescript
GET    /api/tcc/agencies               // List all EMS agencies
POST   /api/tcc/agencies               // Create new agency
GET    /api/tcc/agencies/:id           // Get agency details
PUT    /api/tcc/agencies/:id           // Update agency
DELETE /api/tcc/agencies/:id           // Delete agency
GET    /api/tcc/agencies/search        // Search agencies
```

#### **Facility Management Endpoints**
```typescript
GET    /api/tcc/facilities             // List all facilities
POST   /api/tcc/facilities             // Create new facility
GET    /api/tcc/facilities/:id         // Get facility details
PUT    /api/tcc/facilities/:id         // Update facility
DELETE /api/tcc/facilities/:id         // Delete facility
GET    /api/tcc/facilities/search      // Search facilities
```

#### **Reporting Endpoints**
```typescript
GET    /api/tcc/analytics/overview     // System overview metrics
GET    /api/tcc/analytics/trips        // Trip statistics
GET    /api/tcc/analytics/agencies     // Agency performance
GET    /api/tcc/analytics/hospitals    // Hospital activity
```

### **3. Frontend Components (React + TypeScript + Tailwind)**

#### **Main Dashboard Component**
```typescript
// TCCDashboard.tsx
- Navigation sidebar
- Overview metrics cards
- Recent activity feed
- Quick action buttons
```

#### **Hospital Management Components**
```typescript
// HospitalList.tsx
- Table with search/filter
- Add/Edit/Delete buttons
- Status indicators

// HospitalForm.tsx
- Form for creating/editing hospitals
- Validation
- Save/Cancel buttons
```

#### **EMS Agency Management Components**
```typescript
// AgencyList.tsx
- Table with search/filter
- Add/Edit/Delete buttons
- Status indicators

// AgencyForm.tsx
- Form for creating/editing agencies
- Validation
- Save/Cancel buttons
```

#### **Facility Management Components**
```typescript
// FacilityList.tsx
- Table with search/filter
- Add/Edit/Delete buttons
- Status indicators

// FacilityForm.tsx
- Form for creating/editing facilities
- Validation
- Save/Cancel buttons
```

#### **Reporting Components**
```typescript
// AnalyticsDashboard.tsx
- Metrics cards
- Charts and graphs
- Export functionality

// ReportsList.tsx
- Available reports
- Generate/Download buttons
```

### **4. Authentication System (JWT)**

#### **Admin Authentication**
```typescript
// Simple admin-only authentication
interface AdminUser {
  id: string;
  email: string;
  name: string;
  userType: 'ADMIN';
}

// JWT token contains:
{
  id: string;
  email: string;
  userType: 'ADMIN';
  iat: number;
  exp: number;
}
```

#### **Middleware**
```typescript
// authenticateAdmin.ts
- Verify JWT token
- Check userType === 'ADMIN'
- Add user to request object
```

### **5. Notification System (Email + SMS Scaffold)**

#### **Email Notifications**
```typescript
// EmailService.ts
- SMTP configuration
- Email templates
- Send notification function
- Error handling
```

#### **SMS Scaffold**
```typescript
// NotificationService.ts
- Email-to-SMS gateway support
- Twilio integration ready
- Fallback mechanisms
- Configuration management
```

### **6. Database Manager (Cross-Database)**

```typescript
// DatabaseManager.ts
class DatabaseManager {
  getHospitalDB(): PrismaClient
  getEMSDB(): PrismaClient
  getCenterDB(): PrismaClient
  healthCheck(): Promise<boolean>
}
```

### **7. Project Structure**

```
tcc-new-project/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── hospitals.ts
│   │   │   ├── agencies.ts
│   │   │   ├── facilities.ts
│   │   │   └── analytics.ts
│   │   ├── services/
│   │   │   ├── databaseManager.ts
│   │   │   ├── authService.ts
│   │   │   ├── hospitalService.ts
│   │   │   ├── agencyService.ts
│   │   │   ├── facilityService.ts
│   │   │   └── notificationService.ts
│   │   ├── middleware/
│   │   │   └── authenticateAdmin.ts
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema-hospital.prisma
│   │   ├── schema-ems.prisma
│   │   └── schema-center.prisma
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TCCDashboard.tsx
│   │   │   ├── HospitalList.tsx
│   │   │   ├── HospitalForm.tsx
│   │   │   ├── AgencyList.tsx
│   │   │   ├── AgencyForm.tsx
│   │   │   ├── FacilityList.tsx
│   │   │   ├── FacilityForm.tsx
│   │   │   └── AnalyticsDashboard.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── App.tsx
│   └── package.json
└── README.md
```

### **Development Environment Setup:**
- **Fresh project structure** (separate from current medport)
- **PostgreSQL databases** (3 siloed databases)
- **Node.js/Express backend** with TypeScript
- **React frontend** with Tailwind CSS
- **Prisma ORM** for database management

---

## 🚀 **RECOMMENDATION CONFIRMED**

**Starting fresh is absolutely the right approach.** Your answers confirm that:

1. **TCC-first approach** makes perfect sense - create the foundational data first
2. **1-week timeline** for Phase 1 is aggressive but achievable with 40 hours
3. **Clean slate** approach will avoid all the current system's problems
4. **PostgreSQL + exact algorithms** will give you the best foundation for scaling

The current system's 25+ broken services and complex architecture would take longer to fix than building a clean, simple system from scratch that meets your exact requirements.

**Ready to proceed with Phase 1 TCC module development once you answer the additional questions!**
