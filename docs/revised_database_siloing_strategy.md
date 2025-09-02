# 🗄️ Revised Database Siloing Strategy for MedPort

## 🎯 **Clarified Requirements**

Based on your questions, I need to revise the database siloing strategy to ensure proper cross-database access:

1. **Hospital Database**: Contains all trips created by hospitals
2. **Hospital Module**: Must access EMS agencies from Transport Center database
3. **Transport Center**: Must see all trips from Hospital database
4. **EMS Agencies**: Must see/filter all trips from Hospital database
5. **Account Creation**: All user accounts stored in Transport Center database

## 🔄 **Revised Architecture: Cross-Database Access Strategy**

### **Database 1: Hospital Database (Port 5432)**
**Purpose**: Hospital-specific data and trip management
**Contains**:
```sql
-- Hospital-specific data
HospitalUser {
  id, email, password, name, hospitalName, 
  isActive, createdAt, updatedAt
}

HospitalFacility {
  id, hospitalId, name, type, address, city, state, zipCode,
  coordinates, phone, email, operatingHours, capabilities,
  isActive, createdAt, updatedAt
}

TransportRequest {
  id, hospitalId, patientId, originFacilityId, destinationFacilityId,
  transportLevel, priority, status, specialRequirements,
  requestTimestamp, acceptedTimestamp, pickupTimestamp, completionTimestamp,
  assignedAgencyId, assignedUnitId, createdById, createdAt, updatedAt,
  cancellationReason
}

HospitalAgencyPreference {
  id, hospitalId, agencyId, isActive, preferenceOrder, notes,
  createdAt, updatedAt
}
```

### **Database 2: EMS Database (Port 5433)**
**Purpose**: EMS agency operations and unit management
**Contains**:
```sql
-- EMS-specific data
EMSAgency {
  id, name, contactName, phone, email, address, city, state, zipCode,
  serviceArea, operatingHours, capabilities, pricingStructure,
  isActive, status, addedBy, addedAt, createdAt, updatedAt
}

Unit {
  id, agencyId, unitNumber, type, capabilities, currentStatus,
  currentLocation, shiftStart, shiftEnd, isActive, createdAt, updatedAt
}

UnitAvailability {
  id, unitId, status, startTime, endTime, notes, createdAt, updatedAt
}

TransportBid {
  id, agencyId, transportRequestId, bidAmount, estimatedArrival,
  estimatedPickup, specialNotes, status, submittedAt, updatedAt
}

EMSRoute {
  id, agencyId, routeName, routeType, waypoints, distance, estimatedTime,
  status, createdAt, updatedAt
}
```

### **Database 3: Transport Center Database (Port 5434)**
**Purpose**: System administration, user management, and cross-database coordination
**Contains**:
```sql
-- User account management (ALL user types)
User {
  id, email, password, name, userType, // 'hospital', 'ems', 'center'
  hospitalId, agencyId, // Foreign key references
  isActive, createdAt, updatedAt
}

-- System configuration and service registry
SystemConfiguration {
  id, key, value, description, category, isActive, updatedBy, updatedAt
}

ServiceRegistry {
  id, serviceName, serviceType, status, addedBy, addedAt,
  configuration, metadata, createdAt, updatedAt
}

-- Cross-database reference tracking
DatabaseReferences {
  id, entityType, entityId, sourceDatabase, targetDatabase,
  referenceId, createdAt, updatedAt
}

-- System analytics and monitoring
SystemAnalytics {
  id, metricName, metricValue, timestamp, category, metadata
}

AuditLog {
  id, userId, action, entityType, entityId, changes, timestamp, ipAddress
}
```

## 🔗 **Cross-Database Access Patterns**

### **1. Hospital Access to EMS Agencies**
```typescript
// Hospital needs to see EMS agencies
async function getAvailableAgencies() {
  // Query Transport Center database for EMS agencies
  const agencies = await centerDB.emsAgency.findMany({
    where: { isActive: true }
  });
  return agencies;
}
```

### **2. Transport Center Access to All Trips**
```typescript
// Transport Center needs to see all trips
async function getAllTrips() {
  // Query Hospital database for all transport requests
  const trips = await hospitalDB.transportRequest.findMany({
    include: { originFacility: true, destinationFacility: true }
  });
  return trips;
}
```

### **3. EMS Access to All Trips**
```typescript
// EMS agencies need to see all available trips
async function getAvailableTrips(agencyId: string) {
  // Query Hospital database for pending trips
  const trips = await hospitalDB.transportRequest.findMany({
    where: { status: 'PENDING' },
    include: { originFacility: true, destinationFacility: true }
  });
  return trips;
}
```

### **4. User Authentication (All in Transport Center)**
```typescript
// All user authentication handled by Transport Center
async function authenticateUser(email: string, password: string) {
  const user = await centerDB.user.findUnique({
    where: { email },
    include: { hospital: true, agency: true }
  });
  
  if (user) {
    // Route to appropriate database based on userType
    switch (user.userType) {
      case 'hospital':
        return { user, database: 'hospital' };
      case 'ems':
        return { user, database: 'ems' };
      case 'center':
        return { user, database: 'center' };
    }
  }
}
```

## 🏗️ **Database Connection Management**

### **Multi-Database Prisma Setup**
```typescript
// database-manager.ts
class DatabaseManager {
  private hospitalDB: PrismaClient;
  private emsDB: PrismaClient;
  private centerDB: PrismaClient;

  constructor() {
    this.hospitalDB = new PrismaClient({
      datasources: { db: { url: process.env.HOSPITAL_DATABASE_URL } }
    });
    this.emsDB = new PrismaClient({
      datasources: { db: { url: process.env.EMS_DATABASE_URL } }
    });
    this.centerDB = new PrismaClient({
      datasources: { db: { url: process.env.CENTER_DATABASE_URL } }
    });
  }

  getDatabase(userType: 'hospital' | 'ems' | 'center'): PrismaClient {
    switch (userType) {
      case 'hospital': return this.hospitalDB;
      case 'ems': return this.emsDB;
      case 'center': return this.centerDB;
    }
  }

  // Cross-database operations
  async getAvailableAgencies() {
    return this.centerDB.emsAgency.findMany({ where: { isActive: true } });
  }

  async getAllTrips() {
    return this.hospitalDB.transportRequest.findMany();
  }
}
```

## 🔄 **Event-Driven Cross-Database Communication**

### **Trip Creation Flow**
```typescript
// 1. Hospital creates trip in Hospital DB
const trip = await hospitalDB.transportRequest.create({...});

// 2. Emit event to other databases
eventBus.emit('trip.created', {
  tripId: trip.id,
  hospitalId: trip.hospitalId,
  transportLevel: trip.transportLevel,
  priority: trip.priority
});

// 3. EMS DB receives event and creates available trip
eventBus.on('trip.created', async (data) => {
  await emsDB.availableTrip.create({
    transportRequestId: data.tripId,
    hospitalId: data.hospitalId,
    transportLevel: data.transportLevel,
    priority: data.priority
  });
});

// 4. Center DB logs analytics
eventBus.on('trip.created', async (data) => {
  await centerDB.systemAnalytics.create({
    metricName: 'trip_created',
    metricValue: 1,
    category: 'hospital_operations'
  });
});
```

## 📊 **Data Flow Examples**

### **Hospital Creates Trip Request**
1. **Hospital DB**: Create TransportRequest record
2. **Event**: Emit "trip.created" event
3. **Center DB**: Log analytics event
4. **EMS DB**: Create available trip for agencies

### **EMS Accepts Trip**
1. **EMS DB**: Update TransportBid status to "ACCEPTED"
2. **Event**: Emit "trip.accepted" event
3. **Hospital DB**: Update TransportRequest status
4. **Center DB**: Log performance metrics

### **User Registration (All Types)**
1. **Center DB**: Create User record with userType
2. **Event**: Emit "user.created" event
3. **Appropriate DB**: Create user-specific record (Hospital/EMS)
4. **Center DB**: Log user registration analytics

## 🎯 **Revised Benefits**

### **1. Proper Data Isolation**
- ✅ Hospital data isolated from EMS changes
- ✅ EMS data isolated from hospital changes
- ✅ User accounts centralized for security

### **2. Cross-Database Access**
- ✅ Hospitals can see all EMS agencies
- ✅ Transport Center can see all trips
- ✅ EMS agencies can see all available trips
- ✅ All user authentication centralized

### **3. Scalability**
- ✅ Each database can scale independently
- ✅ Cross-database queries optimized
- ✅ Event-driven architecture for real-time updates

### **4. Security**
- ✅ User authentication centralized
- ✅ Database-specific access controls
- ✅ Audit logging across all databases

## 🚀 **Implementation Plan**

### **Phase 1: Database Setup**
- [ ] Set up three separate PostgreSQL instances
- [ ] Create schemas for each database
- [ ] Set up cross-database connection management

### **Phase 2: User Management Centralization**
- [ ] Move all user accounts to Transport Center database
- [ ] Update authentication to use centralized user management
- [ ] Create user-specific records in appropriate databases

### **Phase 3: Cross-Database API Implementation**
- [ ] Implement DatabaseManager class
- [ ] Create cross-database query methods
- [ ] Add event-driven communication system

### **Phase 4: Data Migration**
- [ ] Migrate existing data to appropriate databases
- [ ] Set up cross-database references
- [ ] Verify data integrity

### **Phase 5: Frontend Updates**
- [ ] Update API calls to use new database structure
- [ ] Test all cross-database functionality
- [ ] Performance optimization

## ✅ **Answers to Your Questions**

1. **✅ Hospital database contains all trips** - Yes, TransportRequest table in Hospital DB
2. **✅ Hospital can access EMS agencies** - Yes, via Transport Center database
3. **✅ Transport Center can see all trips** - Yes, via Hospital database queries
4. **✅ EMS can see/filter all trips** - Yes, via Hospital database queries
5. **✅ All accounts in Transport Center** - Yes, centralized user management

---

**This revised strategy maintains data isolation while enabling the cross-database access patterns you need for the system to function properly.**
