# Trip Unit Assignment & Tracking Enhancements

## 🎯 **Project Overview**
Implement unit assignment to transport requests and add comprehensive trip tracking through three phases: Transport Requests → In-Progress → Completed Trips.

## 📋 **Implementation Plan**

### **Phase 1: Backend Foundation** ✅ **COMPLETED**

#### **1.1 Unit Management API** ✅ **COMPLETED**
- [x] Create `GET /api/units/on-duty` endpoint
  - Filter units by status: `ON_DUTY` and `AVAILABLE`
  - Return only units belonging to authenticated EMS agency
  - Include unit details: id, name, agencyName
- [x] Create `GET /api/units/:id` endpoint for unit details
- [x] Add unit status validation in existing unit endpoints

#### **1.2 Trip Assignment API** ✅ **COMPLETED**
- [x] Extend `PUT /api/trips/:id/status` to accept `assignedUnitId`
- [x] Add validation: unit must belong to accepting EMS agency
- [x] Add validation: unit must be `ON_DUTY` and `AVAILABLE`
- [x] Update unit status to `ASSIGNED` when assigned to trip
- [x] Update unit status to `ON_DUTY` when trip completed/cancelled

#### **1.3 Trip Status Enhancement** ✅ **COMPLETED**
- [x] Add `IN_PROGRESS` status to trip status enum
- [x] Modify trip acceptance flow: `PENDING` → `ACCEPTED` → `IN_PROGRESS` → `COMPLETED`
- [x] Add `arrivalTimestamp` and `departureTimestamp` fields to TransportRequest model
- [x] Update `PUT /api/trips/:id/status` to handle arrival/departure timestamps

#### **1.4 Database Schema Updates** ✅ **COMPLETED**
- [x] Add `arrivalTimestamp` field to TransportRequest model
- [x] Add `departureTimestamp` field to TransportRequest model
- [x] Ensure `assignedUnitId` relation is properly configured
- [x] Create database migration for new fields

#### **1.5 Trip Retrieval Enhancement** ✅ **COMPLETED**
- [x] Update trip queries to include `assignedUnit` relation data
- [x] Add `assignedAgency` relation data for healthcare dashboard
- [x] Ensure all trip endpoints return unit assignment information

---

### **Phase 2: EMS Dashboard Updates** ✅ **COMPLETED (Oct 6, 2025)**

#### **2.1 Available Trips Enhancement** ✅ **COMPLETED (Oct 6, 2025)**
- [x] Replace "Accept" button with Unit Selection Modal
- [x] Fetch available units from `GET /api/units/on-duty`
- [x] Display unit number, type, capabilities, and status
- [x] Require unit selection prior to acceptance
- [x] Assign via `PUT /api/trips/:id/status` with `assignedUnitId`

#### **2.2 My Trips Display Updates** ✅ **COMPLETED (Oct 6, 2025)**
- [x] Show assigned unit number and type on trip cards
- [x] Display unit status indicator
- [x] Preserve existing layout and styling

#### **2.3 Unit Status Management** ✅ **COMPLETED (Oct 6, 2025)**
- [x] Update unit status when accepting trips (AVAILABLE → COMMITTED)
- [x] Update unit status when completing trips (COMMITTED → AVAILABLE)
- [x] Dashboard reflects updates on refresh (websocket real-time planned Phase 3)

---

### **Phase 3: Healthcare Dashboard Enhancement** ✅ **COMPLETED (Oct 6, 2025)**

#### **3.1 Three-Tab Structure** ✅ **COMPLETED**
- [x] Add "In-Progress" tab between "Transport Requests" and "Completed Trips"
- [x] Update tab navigation to include three tabs
- [x] Implement tab-specific data filtering

#### **3.2 Transport Requests Tab Updates** ✅ **COMPLETED**
- [x] Display assigned unit information: "UnitNumber (Type)" or "Awaiting unit assignment"
- [x] Show unit assignment status prominently
- [x] Auto-refresh confirms updates when EMS assigns unit

#### **3.3 In-Progress Tab Implementation** ✅ **COMPLETED**
- [x] Filter trips with status: `ACCEPTED` and `IN_PROGRESS`
- [x] Display assigned unit information
- [x] Add "Mark Arrival" button
- [x] Add "Mark Departure" button
- [x] Show timestamps for pickup/arrival/departure
- [x] Update trip status flow: `ACCEPTED` → `IN_PROGRESS` → `COMPLETED`

#### **3.4 Completed Trips Tab Updates** ✅ **COMPLETED**
- [x] Display assigned unit information (when available)
- [x] Show arrival and departure timestamps
- [x] Calculate total transport time (departure - arrival) planned Phase 4 polish

---

### **Phase 4: UI/UX Enhancements** ⏳ **PENDING**

#### **4.1 Unit Assignment Modal** ⏳ **PENDING**
- [ ] Design clean modal for unit selection
- [ ] Show unit availability status
- [ ] Add confirmation step with trip and unit details
- [ ] Implement error handling for unavailable units

#### **4.2 In-Progress Trip Cards** ⏳ **PENDING**
- [ ] Design cards showing unit assignment
- [ ] Add prominent arrival/departure buttons
- [ ] Show timestamps and status indicators
- [ ] Implement real-time updates

#### **4.3 Status Indicators** ⏳ **PENDING**
- [ ] Add visual indicators for unit assignment
- [ ] Color-code trip statuses
- [ ] Show unit availability status
- [ ] Add loading states for async operations

---

### **Phase 5: Data Validation & Error Handling** ⏳ **PENDING**

#### **5.1 Unit Assignment Validation** ⏳ **PENDING**
- [ ] Validate unit belongs to correct EMS agency
- [ ] Validate unit is available before assignment
- [ ] Prevent assignment to multiple active trips
- [ ] Handle edge cases (unit goes offline, etc.)

#### **5.2 Trip Status Validation** ⏳ **PENDING**
- [ ] Validate status transitions (PENDING → ACCEPTED → IN_PROGRESS → COMPLETED)
- [ ] Validate timestamp ordering (arrival before departure)
- [ ] Handle concurrent status updates
- [ ] Add rollback mechanisms for failed operations

#### **5.3 Error Handling** ⏳ **PENDING**
- [ ] Add comprehensive error messages
- [ ] Implement retry mechanisms
- [ ] Add logging for debugging
- [ ] Handle network failures gracefully

---

### **Phase 6: Testing & Validation** 🚧 **IN PROGRESS**

#### **6.1 Unit Testing** ⏳ **PENDING**
- [ ] Test unit assignment API endpoints
- [ ] Test trip status transitions
- [ ] Test unit availability validation
- [ ] Test error scenarios

#### **6.2 Integration Testing** ⏳ **PENDING**
- [ ] Test complete EMS acceptance flow
- [ ] Test healthcare dashboard updates
- [ ] Test real-time status updates
- [ ] Test concurrent operations

#### **6.3 User Acceptance Testing** ⏳ **PENDING**
- [ ] Test EMS unit assignment workflow
- [ ] Test healthcare arrival/departure tracking
- [ ] Test three-tab navigation
- [ ] Validate user experience flows

---

## 🔧 **Technical Specifications**

### **Unit Assignment Format**
```
Display: "Agency Name - Unit Number"
Example: "Altoona EMS - Unit 439"
```

### **Trip Status Flow**
```
PENDING → ACCEPTED → IN_PROGRESS → COMPLETED
```

### **Unit Status Management**
- `ON_DUTY` - Unit is available for assignment
- `ASSIGNED` - Unit is assigned to active trip
- `OFF_DUTY` - Unit is not available

### **New Database Fields**
```sql
-- TransportRequest table additions
arrivalTimestamp: DateTime?
departureTimestamp: DateTime?
```

### **API Endpoints**
```
GET /api/units/on-duty - Get available units for EMS agency
PUT /api/trips/:id/status - Accept trip with unit assignment
PUT /api/trips/:id/status - Mark arrival/departure
```

---

## 📊 **Success Criteria**

### **Functional Requirements**
- [ ] EMS can assign available units when accepting trips
- [ ] Healthcare can see which unit is responding
- [ ] Healthcare can track arrival and departure times
- [ ] Units cannot be double-assigned
- [ ] Real-time updates across all dashboards

### **Performance Requirements**
- [ ] Unit assignment completes within 2 seconds
- [ ] Status updates propagate within 5 seconds
- [ ] No data loss during concurrent operations
- [ ] System handles 50+ concurrent users

### **User Experience Requirements**
- [ ] Intuitive unit selection process
- [ ] Clear visual indicators for all statuses
- [ ] Responsive design for all screen sizes
- [ ] Accessible interface for all users

---

## 🚀 **Deployment Strategy**

### **Development Phase**
- [ ] Implement in feature branch: `feature/trip-unit-assignment`
- [ ] Test thoroughly in development environment
- [ ] Code review and approval process

### **Staging Phase**
- [ ] Deploy to staging environment
- [ ] User acceptance testing
- [ ] Performance testing
- [ ] Security validation

### **Production Phase**
- [ ] Deploy to production during maintenance window
- [ ] Monitor system performance
- [ ] User training and documentation
- [ ] Rollback plan if issues arise

---

## 📝 **Notes & Considerations**

### **Current Limitations**
- No live GPS tracking capability
- No automatic arrival detection
- Manual timestamp entry required

### **Future Enhancements**
- GPS integration for automatic arrival detection
- Push notifications for status updates
- Mobile app for EMS field units
- Integration with existing dispatch systems

### **Risk Mitigation**
- Comprehensive testing before production
- Gradual rollout to subset of users
- Real-time monitoring and alerting
- Backup and recovery procedures

---

## 📅 **Timeline Estimate**

- **Phase 1 (Backend)**: 3-4 days
- **Phase 2 (EMS Dashboard)**: 2-3 days  
- **Phase 3 (Healthcare Dashboard)**: 3-4 days
- **Phase 4 (UI/UX)**: 2-3 days
- **Phase 5 (Validation)**: 2-3 days
- **Phase 6 (Testing)**: 2-3 days

**Total Estimated Time**: 14-20 days

---

## 🔄 **Progress Tracking**

**Last Updated**: October 6, 2025
**Current Phase**: Phase 3 - Healthcare Dashboard ✅ Completed
**Next Milestone**: Phase 4 polish (Completed cards consistency, total transport time)

---

## ✅ UI Testing Checklist (Phase 2)

### EMS Dashboard - Available Trips
- [ ] Clicking "Accept" opens Unit Selection Modal
- [ ] Modal lists on-duty units with number, type, capabilities, status
- [ ] Selecting a unit enables "Assign Unit"
- [ ] Assigning updates trip to ACCEPTED and moves it to My Trips

### EMS Dashboard - My Trips
- [ ] Accepted trip shows Assigned Unit number and type
- [ ] Status buttons show: Start Trip (ACCEPTED), Complete Trip (IN_PROGRESS)
- [ ] Start sets status to IN_PROGRESS and shows pickup timestamp (if present)
- [ ] Complete sets status to COMPLETED and frees unit (AVAILABLE)

### Units Tab
- [ ] Units reflect COMMITTED after acceptance
- [ ] Units reflect AVAILABLE after completion
- [ ] Toggling On Duty does not break assignment flow

### Error/Edge Cases
- [ ] Modal shows friendly error if assignment fails
- [ ] Decline on Available Trips still works and removes from list
- [ ] Refresh updates counts and lists without errors

### Cross-Checks
- [ ] Trip appears in PENDING before acceptance
- [ ] Trip appears in ACCEPTED after assignment
- [ ] End-to-end script passes locally (see FINAL_TEST_RESULTS.md)
**Blockers**: None identified
**Dependencies**: None

---

*This document will be updated as implementation progresses. Each completed item should be marked with ✅ and include completion date.*

## 🔧 UI Tweaks (Healthcare Portal)
- Replaced `Edit` pill with an edit icon on Transport Requests.
- Added `Delete` (trash) icon with confirmation to remove requests safely.
- Lists auto-refresh after delete to reflect current state.
  