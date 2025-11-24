# Help Content Outlines - Existing Functionality

**Date:** January 2025  
**Purpose:** Starting point for writing help documentation for each module

---

## Healthcare Dashboard Help Outlines

### 1. Create Request Tab

#### Overview
- Purpose: Create new transport requests for patients
- When to use: When a patient needs to be transported

#### Key Features
- **Multi-step form** with progress indicator
- **Patient Information**
  - Patient ID (auto-generated or manual entry)
  - Patient name
  - Date of birth
  - Gender
  - Weight
  - Insurance information
- **Transport Details**
  - Transport level (BLS, ALS, Critical Care, etc.)
  - Urgency level (Routine, Urgent, STAT, etc.)
  - Diagnosis codes
  - Mobility level
  - Special needs (oxygen, monitoring, isolation, bariatric)
- **Location Selection**
  - From location (current facility)
  - To location (select from saved destinations or manual entry)
  - Address geocoding/validation
- **Scheduling**
  - Ready window (start and end times)
  - Date selection
- **QR Code Generation**
  - Automatic QR code for patient tracking
  - Printable/downloadable
- **Form Validation**
  - Required field validation
  - Date/time validation
  - Address validation

#### Step-by-Step Process
1. Navigate to Create Request tab
2. Fill in patient information
3. Select transport level and urgency
4. Choose from and to locations
5. Set ready window times
6. Add any special requirements
7. Review and submit

#### Tips
- Use saved destinations for frequently used locations
- QR codes can be printed for patient identification
- Form auto-saves draft (if implemented)

---

### 2. Transport Requests Tab

#### Overview
- Purpose: View and manage all transport requests
- When to use: To see pending trips, check status, edit requests

#### Key Features
- **Trip List View**
  - All trips created by your facility
  - Filtered by status (PENDING, PENDING_DISPATCH, ACCEPTED, etc.)
  - Date-based categorization (Today, Future, Past, Unscheduled)
- **Trip Details**
  - Patient information
  - Transport details
  - Location information
  - Agency responses (if dispatched)
  - Status indicators
- **Actions Available**
  - Edit trip (if not yet dispatched)
  - Dispatch trip to EMS agencies
  - View agency responses
  - Cancel trip
  - View trip history
- **Filtering and Sorting**
  - Filter by status
  - Filter by date range
  - Sort by date, priority, status
- **Agency Response Display**
  - See which agencies have responded
  - View response status (ACCEPTED, DECLINED, PENDING)
  - See selected agency (if healthcare provider has chosen)

#### Common Tasks
- Finding a specific trip
- Checking trip status
- Editing trip details before dispatch
- Viewing agency responses

---

### 3. In-Progress Tab

#### Overview
- Purpose: Monitor trips that are currently in progress
- When to use: To track active transports

#### Key Features
- **Active Trip List**
  - Trips with status: ACCEPTED, IN_PROGRESS
  - Real-time status updates
  - Agency assignment information
- **Status Tracking**
  - Pickup timestamp
  - Arrival timestamp
  - Departure timestamp
  - Estimated arrival time
- **Unit Information**
  - Assigned unit/vehicle
  - Unit contact information
- **Wait Time Calculation**
  - Time from request to pickup
  - Current trip duration

#### Monitoring Features
- Real-time updates (when SSE implemented)
- Status change notifications
- Estimated completion times

---

### 4. Completed Trips Tab

#### Overview
- Purpose: View historical completed trips
- When to use: For records, reporting, analysis

#### Key Features
- **Completed Trip List**
  - All trips with COMPLETED status
  - Date-based organization
  - Search functionality
- **Trip Details**
  - Full trip history
  - Completion timestamps
  - Healthcare completion timestamp
  - EMS completion timestamp
- **Export Options**
  - Export to CSV/PDF (if implemented)
  - Print trip details
- **Analytics**
  - Trip statistics
  - Performance metrics

---

### 5. Hospital Settings Tab

#### Overview
- Purpose: Configure facility settings and preferences
- When to use: Initial setup, updating facility information

#### Key Features
- **System Settings Sub-tab**
  - Facility name
  - Facility type
  - Contact information
  - Address and location
  - Multi-location management (upgrade option)
- **Manage Locations Sub-tab**
  - Add/edit/delete locations
  - Location-specific settings
  - Geocoding for locations
- **Notification Settings**
  - Email preferences
  - SMS preferences
  - Notification types
- **Default Values**
  - Default transport levels
  - Default urgency levels
  - Default destinations

#### Settings Categories
- Basic Information
- Location Management
- Notification Preferences
- Default Values
- User Management (if org admin)

---

### 6. EMS Providers Tab

#### Overview
- Purpose: Manage preferred EMS providers and view available agencies
- When to use: To add preferred agencies, view agency information

#### Key Features
- **Available Agencies List**
  - All registered EMS agencies
  - Agency details (name, service type, contact)
  - Distance from facility
  - Service capabilities
- **Preferred Agencies**
  - Add agencies to preferred list
  - Remove from preferred list
  - Set priority order
- **Agency Information**
  - Service types (BLS, ALS, Critical Care)
  - Coverage area
  - Contact information
  - Response time estimates

#### Common Tasks
- Adding preferred EMS providers
- Viewing agency capabilities
- Checking agency availability

---

### 7. Destinations Tab

#### Overview
- Purpose: Manage frequently used destination locations
- When to use: To save common destinations for quick selection

#### Key Features
- **Destination List**
  - Saved destinations
  - Facility names
  - Addresses
  - Contact information
- **Add/Edit Destinations**
  - Facility name
  - Address (with geocoding)
  - Contact information
  - Notes
- **Quick Selection**
  - Use saved destinations in trip creation
  - Search destinations
  - Filter by type

#### Benefits
- Faster trip creation
- Consistent address formatting
- Reduced data entry errors

---

### 8. Team Members Tab

#### Overview
- Purpose: Manage users for your healthcare facility
- When to use: To add/remove team members, manage permissions

#### Key Features
- **User List**
  - All users associated with facility
  - User roles and permissions
  - Active/inactive status
- **Add User**
  - Email address
  - Name
  - Role assignment
  - Permissions
- **Edit User**
  - Update information
  - Change permissions
  - Reset password
- **Remove User**
  - Deactivate user
  - Transfer responsibilities

#### User Roles
- Org Admin (if multi-location)
- Standard User
- Read-only User (if implemented)

---

## EMS Dashboard Help Outlines

### 1. Available Trips Tab

#### Overview
- Purpose: View trips that have been dispatched to your agency
- When to use: To see new trip requests and decide whether to accept

#### Key Features
- **Trip List**
  - All trips dispatched to your agency
  - Status: PENDING (awaiting response)
  - Filtered by date, priority, location
- **Trip Details**
  - Patient ID (no other patient identifiers)
  - Transport level
  - Priority/urgency
  - From and to locations
  - Ready window
  - Special requirements
  - Distance and estimated time
- **Actions**
  - Accept trip
  - Decline trip
  - View full details
- **Notifications**
  - New trip alerts (when implemented)
  - SMS/email notifications (when implemented)

#### Decision Factors
- Service type match
- Distance and response time
- Unit availability
- Special requirements capability

---

### 2. My Trips Tab

#### Overview
- Purpose: View trips that your agency has accepted
- When to use: To manage active assignments, update trip status

#### Key Features
- **Accepted Trip List**
  - Trips with ACCEPTED status
  - Trips where your agency was selected by healthcare provider
  - Status: ACCEPTED, IN_PROGRESS
- **Trip Status Updates**
  - Update status buttons
  - Timestamp tracking
  - Status progression: ACCEPTED → IN_PROGRESS → COMPLETED
- **Unit Assignment**
  - Assign unit to trip
  - View unit details
  - Track unit location (if GPS enabled)
- **Status Timestamps**
  - Accepted timestamp
  - Pickup timestamp
  - Arrival timestamp
  - Departure timestamp
  - Completion timestamp

#### Status Update Process
1. Accept trip (from Available Trips)
2. Assign unit
3. Update to IN_PROGRESS when en route
4. Update pickup when patient loaded
5. Update arrival at destination
6. Update departure from destination
7. Mark COMPLETED when finished

---

### 3. Completed Trips Tab

#### Overview
- Purpose: View historical completed trips
- When to use: For records, reporting, invoicing

#### Key Features
- **Completed Trip List**
  - All trips with COMPLETED status
  - Date-based organization
  - Search and filter
- **Trip Details**
  - Full trip information
  - All timestamps
  - Unit assignment
  - Healthcare facility information
- **Export Options**
  - Export trip data
  - Generate reports
- **Analytics**
  - Trip statistics
  - Performance metrics
  - Revenue information (if implemented)

---

### 4. Units Tab

#### Overview
- Purpose: Manage EMS units/vehicles
- When to use: To add/edit units, assign units to trips

#### Key Features
- **Unit List**
  - All units for your agency
  - Unit number/identifier
  - Unit type (BLS, ALS, Critical Care)
  - Status (Available, Assigned, Out of Service)
- **Add/Edit Units**
  - Unit number
  - Unit type
  - Capabilities
  - Status
- **Unit Assignment**
  - Assign unit to trip
  - View unit assignments
  - Track unit availability
- **Unit Status**
  - Available
  - Assigned
  - Out of Service
  - Maintenance

#### Unit Management
- Adding new units
- Updating unit information
- Managing unit status
- Assigning units to trips

---

### 5. Users Tab

#### Overview
- Purpose: Manage users for your EMS agency
- When to use: To add/remove team members, manage permissions

#### Key Features
- **User List**
  - All users for your agency
  - User roles
  - Active status
- **Add User**
  - Email address
  - Name
  - Role assignment
- **Edit User**
  - Update information
  - Change permissions
  - Reset password
- **Remove User**
  - Deactivate user

#### User Roles
- Org Admin (if multi-agency)
- Standard User
- Dispatcher (if role exists)

---

### 6. Agency Info Tab

#### Overview
- Purpose: View and edit agency information
- When to use: To update agency details, contact information

#### Key Features
- **Agency Information**
  - Agency name
  - Service type (BLS/ALS)
  - Contact information
  - Address
- **Settings**
  - Notification preferences
  - Default values
  - Revenue settings (if applicable)
- **Edit Capabilities**
  - Update agency information
  - Change contact details
  - Update address

---

### 7. Trip Calculator Tab

#### Overview
- Purpose: Calculate trip costs and revenue
- When to use: To estimate trip pricing, review revenue

#### Key Features
- **Trip Cost Calculation**
  - Base rate
  - Mileage charges
  - Time charges
  - Special service charges
- **Revenue Calculation**
  - Trip revenue
  - Profit margins
  - Cost analysis
- **Settings**
  - Rate configuration
  - Mileage rates
  - Time rates
  - Special service rates

#### Calculation Factors
- Distance
- Time
- Service level
- Special requirements
- Insurance type

---

## TCC Admin Dashboard Help Outlines

### 1. Overview/Home

#### Overview
- Purpose: Dashboard overview with quick actions and statistics
- When to use: Starting point, quick access to common tasks

#### Key Features
- **Quick Actions**
  - Create Trip
  - Add Healthcare Facility
  - Add EMS Agency
  - Trip Management
- **Statistics Cards**
  - Active Trips
  - Healthcare Facilities
  - EMS Agencies
  - Active Units
- **Recent Activity**
  - Recent trips
  - Recent registrations
  - System alerts

---

### 2. Trip Management

#### Overview
- Purpose: View and manage all trips in the system
- When to use: To monitor all transport requests, troubleshoot issues

#### Key Features
- **All Trips View**
  - Complete trip list across all facilities
  - Filter by status, facility, agency
  - Search functionality
- **Trip Details**
  - Full trip information
  - Agency responses
  - Status history
  - Timestamps
- **Actions**
  - Edit trip
  - Cancel trip
  - Reassign agency
  - View history
- **Analytics**
  - Trip statistics
  - Performance metrics
  - Trends

---

### 3. Healthcare Facilities

#### Overview
- Purpose: Manage all healthcare facilities in the system
- When to use: To add/edit facilities, manage facility settings

#### Key Features
- **Facilities List**
  - All registered healthcare facilities
  - Facility details
  - Status (Active/Inactive)
- **Add Facility**
  - Registration form
  - Facility information
  - Location details
- **Edit Facility**
  - Update information
  - Manage settings
  - View facility users
- **Facility Settings**
  - System settings
  - Location management
  - User management
  - Notification preferences

---

### 4. EMS Agencies

#### Overview
- Purpose: Manage all EMS agencies in the system
- When to use: To add/edit agencies, manage agency settings

#### Key Features
- **Agencies List**
  - All registered EMS agencies
  - Agency details
  - Service types
  - Status
- **Add Agency**
  - Registration form
  - Agency information
  - Service capabilities
- **Edit Agency**
  - Update information
  - Manage settings
  - View agency users
  - Manage units
- **Agency Settings**
  - Agency information
  - Unit management
  - User management
  - Revenue settings

---

### 5. Route Optimization

#### Overview
- Purpose: Optimize routes for multiple trips
- When to use: To plan efficient routes, reduce travel time

#### Key Features
- **Trip Selection**
  - Select multiple trips
  - Filter by criteria
- **Optimization Algorithm**
  - Calculate optimal routes
  - Minimize travel time
  - Minimize distance
- **Route Visualization**
  - Map display
  - Route lines
  - Waypoints
- **Route Assignment**
  - Assign optimized routes to units
  - Export route information

---

### 6. Analytics

#### Overview
- Purpose: View system-wide analytics and reports
- When to use: For reporting, analysis, decision-making

#### Key Features
- **Trip Analytics**
  - Trip volume
  - Response times
  - Completion rates
- **Financial Analytics**
  - Revenue reports
  - Cost analysis
  - Profitability
- **Performance Metrics**
  - Agency performance
  - Facility performance
  - System efficiency
- **Reports**
  - Generate reports
  - Export data
  - Custom date ranges

---

### 7. User Management

#### Overview
- Purpose: Manage all users in the system
- When to use: To add/edit users, manage permissions, reset passwords

#### Key Features
- **User List**
  - All users across all facilities/agencies
  - User types
  - Status
- **Add User**
  - User registration
  - Role assignment
  - Facility/agency assignment
- **Edit User**
  - Update information
  - Change permissions
  - Reset password
  - Transfer between facilities/agencies
- **User Roles**
  - ADMIN
  - USER
  - HEALTHCARE
  - EMS

---

## Common Features Across All Modules

### Authentication
- Login process
- Password requirements
- Password reset
- Session management

### Notifications
- Email notifications
- SMS notifications (when implemented)
- Browser notifications (when implemented)
- Notification preferences

### Search and Filtering
- Search functionality
- Filter options
- Sort options
- Date range selection

### Data Export
- Export to CSV
- Export to PDF (if implemented)
- Print functionality

### Responsive Design
- Mobile-friendly interface
- Tablet optimization
- Desktop features

---

## Video Tutorial Topics

### Healthcare Module
1. "How to Create a Transport Request" (3-5 min)
2. "How to Dispatch a Trip to EMS Agencies" (2-3 min)
3. "How to View and Manage Transport Requests" (2-3 min)
4. "How to Manage Hospital Settings" (3-4 min)
5. "How to Add Preferred EMS Providers" (2 min)
6. "How to Manage Destinations" (2 min)
7. "How to Manage Team Members" (2-3 min)

### EMS Module
1. "How to View and Accept Available Trips" (2-3 min)
2. "How to Update Trip Status" (3-4 min)
3. "How to Manage Units" (2-3 min)
4. "How to Use the Trip Calculator" (3-4 min)
5. "How to Manage Agency Information" (2 min)
6. "How to Manage Users" (2 min)

### TCC Admin Module
1. "Overview of TCC Admin Dashboard" (2-3 min)
2. "How to Manage Healthcare Facilities" (3-4 min)
3. "How to Manage EMS Agencies" (3-4 min)
4. "How to Use Route Optimization" (4-5 min)
5. "How to View Analytics and Reports" (3-4 min)
6. "How to Manage Users" (3-4 min)

---

**Document Status:** Ready for Content Creation

