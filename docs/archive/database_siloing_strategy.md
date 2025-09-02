# 🗄️ Database Siloing Strategy for MedPort

## 🚨 **Problem Statement**

The current single database architecture creates a **single point of failure** where:
- Database schema changes affect the entire system
- Service Management changes break Hospital Dashboard functionality
- One database corruption takes down all three user types
- Scaling becomes impossible as the database grows
- Development changes have unintended side effects across all modules

## 🎯 **Solution: Three Siloed Databases**

### **Database Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    MedPort System                           │
├─────────────────────────────────────────────────────────────┤
│  Hospital Database    │  EMS Database    │  Center Database │
│  (Port 5432)         │  (Port 5433)     │  (Port 5434)     │
├─────────────────────────────────────────────────────────────┤
│  • Users (Hospitals) │  • Users (EMS)   │  • Users (Center)│
│  • Facilities        │  • TransportAgency│  • System Config │
│  • TransportRequests │  • Units         │  • Service Mgmt  │
│  • Agency Preferences│  • Bids          │  • Analytics     │
│  • Trip History      │  • Routes        │  • Monitoring    │
└─────────────────────────────────────────────────────────────┘
```

## 📊 **Database 1: Hospital Database (Port 5432)**

### **Purpose**: Hospital-specific data and operations
### **Users**: Hospital staff, case managers, administrators

### **Tables**:
```sql
-- Core Hospital Data
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

TripHistory {
  id, transportRequestId, status, timestamp, notes, updatedBy
}
```

### **Benefits**:
- ✅ Hospital data isolated from EMS changes
- ✅ Fast queries for hospital-specific operations
- ✅ Independent scaling and backup strategies
- ✅ Hospital compliance and audit requirements

## 🚑 **Database 2: EMS Database (Port 5433)**

### **Purpose**: EMS agency operations and trip management
### **Users**: EMS staff, dispatchers, billing personnel

### **Tables**:
```sql
-- Core EMS Data
EMSAgency {
  id, name, contactName, phone, email, address, city, state, zipCode,
  serviceArea, operatingHours, capabilities, pricingStructure,
  isActive, status, addedBy, addedAt, createdAt, updatedAt
}

EMSAgencyUser {
  id, agencyId, email, password, name, role, phone,
  isActive, lastLogin, createdAt, updatedAt
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

ServiceArea {
  id, agencyId, name, center, radius, isActive, createdAt, updatedAt
}
```

### **Benefits**:
- ✅ EMS operations isolated from hospital changes
- ✅ Optimized for real-time unit tracking
- ✅ Independent billing and route optimization
- ✅ EMS-specific compliance requirements

## 🏢 **Database 3: Transport Center Database (Port 5434)**

### **Purpose**: System administration, service management, and analytics
### **Users**: Transport Center coordinators, system administrators

### **Tables**:
```sql
-- Core Center Data
CenterUser {
  id, email, password, name, role, permissions, isActive,
  createdAt, updatedAt
}

SystemConfiguration {
  id, key, value, description, category, isActive, updatedBy, updatedAt
}

ServiceRegistry {
  id, serviceName, serviceType, status, addedBy, addedAt,
  configuration, metadata, createdAt, updatedAt
}

SystemAnalytics {
  id, metricName, metricValue, timestamp, category, metadata
}

AuditLog {
  id, userId, action, entityType, entityId, changes, timestamp, ipAddress
}

FeatureToggle {
  id, featureName, isEnabled, targetUsers, configuration, updatedBy, updatedAt
}

NotificationTemplate {
  id, templateName, templateType, content, variables, isActive, createdAt, updatedAt
}
```

### **Benefits**:
- ✅ System administration isolated from operational data
- ✅ Centralized service management
- ✅ System-wide analytics and monitoring
- ✅ Feature toggle and configuration management

## 🔄 **Cross-Database Communication Strategy**

### **1. API Gateway Pattern**
```
Frontend → API Gateway → Database Router → Appropriate Database
```

### **2. Event-Driven Architecture**
```javascript
// When hospital creates trip request
Hospital DB: TransportRequest created
    ↓ (Event)
Center DB: Log analytics event
    ↓ (Event) 
EMS DB: Create available trip for agencies
```

### **3. Shared Data Synchronization**
```javascript
// Service Registry in Center DB
ServiceRegistry {
  id: "agency-123",
  serviceName: "Metro EMS",
  serviceType: "EMS_AGENCY",
  status: "ACTIVE",
  // Reference to EMS DB agency
  externalId: "ems-db-agency-456"
}
```

## 🛠️ **Implementation Plan**

### **Phase 1: Database Setup (Week 1)**
- [ ] Set up three separate PostgreSQL instances
- [ ] Create database schemas for each silo
- [ ] Set up connection pooling and routing
- [ ] Create database migration scripts

### **Phase 2: Data Migration (Week 2)**
- [ ] Export existing data from current database
- [ ] Split data into appropriate silos
- [ ] Migrate Hospital data to Hospital DB
- [ ] Migrate EMS data to EMS DB
- [ ] Migrate Center data to Center DB
- [ ] Verify data integrity

### **Phase 3: API Layer Updates (Week 3)**
- [ ] Update Prisma schemas for each database
- [ ] Create database routing middleware
- [ ] Update API endpoints to use correct database
- [ ] Implement cross-database event system
- [ ] Add database connection management

### **Phase 4: Frontend Updates (Week 4)**
- [ ] Update API calls to use new endpoints
- [ ] Test all three user types
- [ ] Verify data isolation
- [ ] Performance testing

### **Phase 5: Production Deployment (Week 5)**
- [ ] Set up production databases
- [ ] Deploy with zero-downtime migration
- [ ] Monitor system performance
- [ ] Rollback plan ready

## 🔧 **Technical Implementation**

### **Database Connection Management**
```typescript
// database-router.ts
class DatabaseRouter {
  private hospitalDB: PrismaClient;
  private emsDB: PrismaClient;
  private centerDB: PrismaClient;

  getDatabase(userType: 'hospital' | 'ems' | 'center'): PrismaClient {
    switch (userType) {
      case 'hospital': return this.hospitalDB;
      case 'ems': return this.emsDB;
      case 'center': return this.centerDB;
    }
  }
}
```

### **Cross-Database Events**
```typescript
// event-bus.ts
class EventBus {
  emit(event: string, data: any) {
    // Emit to appropriate databases
    if (event === 'trip.created') {
      this.centerDB.analytics.create({...});
      this.emsDB.availableTrips.create({...});
    }
  }
}
```

### **API Endpoint Updates**
```typescript
// hospital-routes.ts
router.get('/transport-requests', authenticateHospital, async (req, res) => {
  const db = databaseRouter.getDatabase('hospital');
  const requests = await db.transportRequest.findMany({
    where: { hospitalId: req.user.hospitalId }
  });
  res.json(requests);
});
```

## 📈 **Benefits of Database Siloing**

### **1. Fault Isolation**
- ✅ Hospital database corruption doesn't affect EMS operations
- ✅ EMS system changes don't break hospital functionality
- ✅ Center maintenance doesn't impact operational systems

### **2. Performance Optimization**
- ✅ Smaller, focused databases = faster queries
- ✅ Database-specific indexing strategies
- ✅ Independent scaling based on usage patterns

### **3. Development Safety**
- ✅ Schema changes isolated to relevant database
- ✅ No more "fix one thing, break another" issues
- ✅ Independent development teams can work safely

### **4. Compliance & Security**
- ✅ Hospital data isolated for HIPAA compliance
- ✅ EMS data isolated for operational security
- ✅ Center data isolated for administrative control

### **5. Scalability**
- ✅ Each database can scale independently
- ✅ Geographic distribution possible
- ✅ Different backup/retention strategies

## 🚨 **Migration Risks & Mitigation**

### **Risks**:
- Data consistency during migration
- API endpoint changes
- Frontend integration issues
- Performance impact during transition

### **Mitigation**:
- Comprehensive data validation scripts
- API versioning and backward compatibility
- Gradual rollout with feature flags
- Performance monitoring and rollback plans

## 💰 **Cost Analysis**

### **Current**: 1 Database
- Single PostgreSQL instance
- Single backup strategy
- Single scaling point

### **Proposed**: 3 Databases
- 3 PostgreSQL instances (3x cost)
- 3 backup strategies (3x cost)
- 3 scaling points (3x flexibility)

### **ROI**:
- Reduced downtime = higher revenue
- Faster development = lower costs
- Better performance = better user experience
- Compliance benefits = reduced legal risk

## 🎯 **Success Metrics**

### **Technical Metrics**:
- [ ] Zero cross-database failures
- [ ] 50% faster query performance
- [ ] 99.9% uptime per database
- [ ] Independent scaling achieved

### **Business Metrics**:
- [ ] Reduced development time
- [ ] Faster feature deployment
- [ ] Better system reliability
- [ ] Improved user satisfaction

## 🚀 **Next Steps**

1. **Approve this database siloing strategy**
2. **Create feature branch**: `feature/database-siloing`
3. **Begin Phase 1**: Database setup and schema creation
4. **Implement gradual migration** with zero downtime
5. **Monitor and optimize** each database independently

---

**This database siloing strategy will transform MedPort from a fragile single-database system to a robust, scalable, fault-tolerant architecture that can grow with the business while maintaining system stability.**
