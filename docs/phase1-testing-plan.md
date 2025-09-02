# 🧪 Phase 1 Testing Plan - Database Siloing Implementation

## 🎯 **Testing Overview**

This testing plan validates the Phase 1 database siloing implementation, focusing on the Hospital module which has the most complete functionality. The tests ensure that the three-database architecture works correctly and maintains all existing functionality.

## 🏗️ **Test Environment Setup**

### **Prerequisites:**
- PostgreSQL running on ports 5432, 5433, 5434
- Node.js and npm installed
- Existing MedPort data for migration testing

### **Test Database Configuration:**
```bash
# Hospital DB (Port 5432)
HOSPITAL_DATABASE_URL="postgresql://postgres:password@localhost:5432/medport_hospital"

# EMS DB (Port 5433)  
EMS_DATABASE_URL="postgresql://postgres:password@localhost:5433/medport_ems"

# Center DB (Port 5434)
CENTER_DATABASE_URL="postgresql://postgres:password@localhost:5434/medport_center"
```

## 📋 **Test Categories**

### **1. Database Setup Tests**
### **2. Database Manager Tests**
### **3. Hospital Module Integration Tests**
### **4. Cross-Database Access Tests**
### **5. Event-Driven Communication Tests**
### **6. Authentication Service Tests**
### **7. Data Migration Tests**
### **8. Performance Tests**

---

## 🗄️ **1. Database Setup Tests**

### **Test 1.1: Database Creation**
```bash
# Test database creation script
chmod +x backend/scripts/setup-database-siloing.sh
cd backend
./scripts/setup-database-siloing.sh
```

**Expected Results:**
- ✅ All three databases created successfully
- ✅ Prisma schemas generated without errors
- ✅ Migrations completed successfully
- ✅ Health checks pass for all databases

**Validation Commands:**
```bash
# Check database existence
psql -h localhost -p 5432 -U postgres -d medport_hospital -c "SELECT 1;"
psql -h localhost -p 5433 -U postgres -d medport_ems -c "SELECT 1;"
psql -h localhost -p 5434 -U postgres -d medport_center -c "SELECT 1;"
```

### **Test 1.2: Schema Validation**
```bash
# Validate Prisma schemas
cd backend
npx prisma validate --schema=prisma/schema-hospital.prisma
npx prisma validate --schema=prisma/schema-ems.prisma
npx prisma validate --schema=prisma/schema-center.prisma
```

**Expected Results:**
- ✅ All schemas validate without errors
- ✅ All tables created with correct structure
- ✅ Foreign key relationships established

---

## 🔧 **2. Database Manager Tests**

### **Test 2.1: Connection Management**
```typescript
// Test file: backend/test/database-manager.test.ts
import { databaseManager } from '../src/services/databaseManager';

describe('Database Manager', () => {
  test('should create singleton instance', () => {
    const instance1 = DatabaseManager.getInstance();
    const instance2 = DatabaseManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('should connect to all databases', async () => {
    const health = await databaseManager.healthCheck();
    expect(health.hospital).toBe(true);
    expect(health.ems).toBe(true);
    expect(health.center).toBe(true);
  });

  test('should get correct database by user type', () => {
    const hospitalDB = databaseManager.getDatabase('hospital');
    const emsDB = databaseManager.getDatabase('ems');
    const centerDB = databaseManager.getDatabase('center');
    
    expect(hospitalDB).toBeDefined();
    expect(emsDB).toBeDefined();
    expect(centerDB).toBeDefined();
  });
});
```

### **Test 2.2: Cross-Database Queries**
```typescript
test('should get available agencies from center DB', async () => {
  const agencies = await databaseManager.getAvailableAgencies();
  expect(Array.isArray(agencies)).toBe(true);
});

test('should get all trips from hospital DB', async () => {
  const trips = await databaseManager.getAllTrips();
  expect(Array.isArray(trips)).toBe(true);
});

test('should get available trips for EMS', async () => {
  const trips = await databaseManager.getAvailableTrips();
  expect(Array.isArray(trips)).toBe(true);
});
```

---

## 🏥 **3. Hospital Module Integration Tests**

### **Test 3.1: Hospital User Management**
```typescript
// Test hospital user creation and authentication
import { siloedAuthService } from '../src/services/siloedAuthService';

test('should create hospital user', async () => {
  const result = await siloedAuthService.createUser({
    email: 'test@hospital.com',
    password: 'password123',
    name: 'Test Hospital User',
    userType: 'HOSPITAL',
    hospitalId: 'hospital-123'
  });
  
  expect(result.success).toBe(true);
  expect(result.user.userType).toBe('HOSPITAL');
});

test('should authenticate hospital user', async () => {
  const result = await siloedAuthService.authenticateUser(
    'test@hospital.com',
    'password123'
  );
  
  expect(result.success).toBe(true);
  expect(result.user.userType).toBe('HOSPITAL');
});
```

### **Test 3.2: Hospital Facility Management**
```typescript
// Test facility CRUD operations
import { databaseManager } from '../src/services/databaseManager';

test('should create hospital facility', async () => {
  const hospitalDB = databaseManager.getHospitalDB();
  
  const facility = await hospitalDB.hospitalFacility.create({
    data: {
      hospitalId: 'hospital-123',
      name: 'Test Facility',
      type: 'HOSPITAL',
      address: '123 Test St',
      city: 'Test City',
      state: 'PA',
      zipCode: '12345',
      capabilities: ['ALS', 'BLS']
    }
  });
  
  expect(facility.id).toBeDefined();
  expect(facility.name).toBe('Test Facility');
});

test('should get hospital facilities', async () => {
  const hospitalDB = databaseManager.getHospitalDB();
  
  const facilities = await hospitalDB.hospitalFacility.findMany({
    where: { hospitalId: 'hospital-123' }
  });
  
  expect(Array.isArray(facilities)).toBe(true);
});
```

### **Test 3.3: Transport Request Management**
```typescript
// Test transport request creation and management
test('should create transport request', async () => {
  const hospitalDB = databaseManager.getHospitalDB();
  
  const request = await hospitalDB.transportRequest.create({
    data: {
      hospitalId: 'hospital-123',
      patientId: 'PAT-12345',
      originFacilityId: 'facility-1',
      destinationFacilityId: 'facility-2',
      transportLevel: 'ALS',
      priority: 'HIGH',
      createdById: 'user-123'
    }
  });
  
  expect(request.id).toBeDefined();
  expect(request.status).toBe('PENDING');
});

test('should update transport request status', async () => {
  const hospitalDB = databaseManager.getHospitalDB();
  
  const updated = await hospitalDB.transportRequest.update({
    where: { id: 'request-123' },
    data: { status: 'ASSIGNED' }
  });
  
  expect(updated.status).toBe('ASSIGNED');
});
```

---

## 🔗 **4. Cross-Database Access Tests**

### **Test 4.1: Hospital → Center DB Access**
```typescript
// Test hospital accessing EMS agencies from center DB
test('hospital should access EMS agencies', async () => {
  const agencies = await databaseManager.getAvailableAgencies();
  
  expect(Array.isArray(agencies)).toBe(true);
  agencies.forEach(agency => {
    expect(agency.id).toBeDefined();
    expect(agency.name).toBeDefined();
    expect(agency.isActive).toBe(true);
  });
});
```

### **Test 4.2: Center → Hospital DB Access**
```typescript
// Test center accessing all trips from hospital DB
test('center should access all trips', async () => {
  const trips = await databaseManager.getAllTrips();
  
  expect(Array.isArray(trips)).toBe(true);
  trips.forEach(trip => {
    expect(trip.id).toBeDefined();
    expect(trip.hospitalId).toBeDefined();
    expect(trip.status).toBeDefined();
  });
});
```

### **Test 4.3: EMS → Hospital DB Access**
```typescript
// Test EMS accessing available trips from hospital DB
test('EMS should access available trips', async () => {
  const trips = await databaseManager.getAvailableTrips();
  
  expect(Array.isArray(trips)).toBe(true);
  trips.forEach(trip => {
    expect(trip.status).toBe('PENDING');
  });
});
```

---

## 📡 **5. Event-Driven Communication Tests**

### **Test 5.1: Trip Creation Events**
```typescript
// Test event emission and handling
import { eventBus } from '../src/services/eventBus';

test('should emit trip created event', async () => {
  const eventData = {
    tripId: 'trip-123',
    hospitalId: 'hospital-456',
    transportLevel: 'ALS',
    priority: 'HIGH',
    originFacilityId: 'facility-1',
    destinationFacilityId: 'facility-2'
  };
  
  // Emit event
  eventBus.emitTripCreated(eventData);
  
  // Wait for event processing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Verify event was processed (check database state)
  const centerDB = databaseManager.getCenterDB();
  const analytics = await centerDB.systemAnalytics.findFirst({
    where: { metricName: 'trip_created' }
  });
  
  expect(analytics).toBeDefined();
  expect(analytics.metricValue).toBe(1);
});
```

### **Test 5.2: Trip Acceptance Events**
```typescript
test('should emit trip accepted event', async () => {
  const eventData = {
    tripId: 'trip-123',
    agencyId: 'agency-789',
    unitId: 'unit-101',
    estimatedArrival: new Date()
  };
  
  eventBus.emitTripAccepted(eventData);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Verify hospital DB was updated
  const hospitalDB = databaseManager.getHospitalDB();
  const trip = await hospitalDB.transportRequest.findUnique({
    where: { id: 'trip-123' }
  });
  
  expect(trip.status).toBe('ASSIGNED');
  expect(trip.assignedAgencyId).toBe('agency-789');
});
```

---

## 🔐 **6. Authentication Service Tests**

### **Test 6.1: User Authentication**
```typescript
// Test centralized authentication
test('should authenticate user with correct credentials', async () => {
  const result = await siloedAuthService.authenticateUser(
    'test@hospital.com',
    'password123'
  );
  
  expect(result.success).toBe(true);
  expect(result.token).toBeDefined();
  expect(result.user.userType).toBe('HOSPITAL');
});

test('should reject invalid credentials', async () => {
  const result = await siloedAuthService.authenticateUser(
    'test@hospital.com',
    'wrongpassword'
  );
  
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});
```

### **Test 6.2: Token Verification**
```typescript
test('should verify valid JWT token', async () => {
  const authResult = await siloedAuthService.authenticateUser(
    'test@hospital.com',
    'password123'
  );
  
  const verifyResult = await siloedAuthService.verifyToken(authResult.token);
  
  expect(verifyResult.success).toBe(true);
  expect(verifyResult.user.email).toBe('test@hospital.com');
});

test('should reject invalid JWT token', async () => {
  const result = await siloedAuthService.verifyToken('invalid-token');
  
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});
```

---

## 📊 **7. Data Migration Tests**

### **Test 7.1: Migration Script Execution**
```bash
# Test data migration
cd backend
node scripts/migrate-to-siloed-databases.js
```

**Expected Results:**
- ✅ All users migrated to Center DB
- ✅ Hospital data migrated to Hospital DB
- ✅ EMS data migrated to EMS DB
- ✅ System data migrated to Center DB
- ✅ Data integrity maintained

### **Test 7.2: Data Integrity Validation**
```typescript
// Test data integrity after migration
test('should maintain data relationships', async () => {
  const centerDB = databaseManager.getCenterDB();
  const hospitalDB = databaseManager.getHospitalDB();
  
  // Get user from center DB
  const user = await centerDB.user.findFirst({
    where: { userType: 'HOSPITAL' }
  });
  
  // Verify corresponding hospital user exists
  const hospitalUser = await hospitalDB.hospitalUser.findUnique({
    where: { id: user.id }
  });
  
  expect(hospitalUser).toBeDefined();
  expect(hospitalUser.email).toBe(user.email);
});
```

---

## ⚡ **8. Performance Tests**

### **Test 8.1: Database Connection Performance**
```typescript
// Test connection performance
test('should establish connections quickly', async () => {
  const start = Date.now();
  
  const health = await databaseManager.healthCheck();
  
  const duration = Date.now() - start;
  
  expect(health.hospital).toBe(true);
  expect(health.ems).toBe(true);
  expect(health.center).toBe(true);
  expect(duration).toBeLessThan(1000); // Should connect within 1 second
});
```

### **Test 8.2: Cross-Database Query Performance**
```typescript
// Test cross-database query performance
test('should execute cross-database queries efficiently', async () => {
  const start = Date.now();
  
  const agencies = await databaseManager.getAvailableAgencies();
  const trips = await databaseManager.getAllTrips();
  
  const duration = Date.now() - start;
  
  expect(Array.isArray(agencies)).toBe(true);
  expect(Array.isArray(trips)).toBe(true);
  expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
});
```

---

## 🧪 **Test Execution Plan**

### **Phase 1A: Setup and Basic Functionality**
1. Run database setup script
2. Execute database manager tests
3. Test basic hospital module functionality
4. Validate cross-database access

### **Phase 1B: Advanced Features**
1. Test event-driven communication
2. Validate authentication service
3. Run data migration tests
4. Execute performance tests

### **Phase 1C: Integration Testing**
1. Test complete hospital workflow
2. Validate all cross-database operations
3. Test error handling and edge cases
4. Performance and load testing

---

## 📋 **Test Checklist**

### **Database Setup:**
- [ ] All three databases created successfully
- [ ] Prisma schemas generated without errors
- [ ] Migrations completed successfully
- [ ] Health checks pass for all databases

### **Database Manager:**
- [ ] Singleton pattern working correctly
- [ ] All database connections established
- [ ] Cross-database queries functioning
- [ ] Health check monitoring working

### **Hospital Module:**
- [ ] User creation and authentication working
- [ ] Facility management functioning
- [ ] Transport request creation working
- [ ] Status updates functioning correctly

### **Cross-Database Access:**
- [ ] Hospital → Center DB access working
- [ ] Center → Hospital DB access working
- [ ] EMS → Hospital DB access working
- [ ] All access patterns validated

### **Event-Driven Communication:**
- [ ] Trip creation events working
- [ ] Trip acceptance events working
- [ ] Event processing functioning
- [ ] Analytics logging working

### **Authentication Service:**
- [ ] User authentication working
- [ ] Token verification functioning
- [ ] User creation working
- [ ] Cross-database user management working

### **Data Migration:**
- [ ] Migration script executes successfully
- [ ] All data migrated correctly
- [ ] Data integrity maintained
- [ ] Relationships preserved

### **Performance:**
- [ ] Database connections established quickly
- [ ] Cross-database queries perform well
- [ ] Event processing is efficient
- [ ] System maintains responsiveness

---

## 🚨 **Troubleshooting Guide**

### **Common Issues:**

1. **Database Connection Errors:**
   ```bash
   # Check PostgreSQL status
   brew services list | grep postgresql
   
   # Restart PostgreSQL
   brew services restart postgresql
   ```

2. **Prisma Schema Errors:**
   ```bash
   # Regenerate Prisma client
   npx prisma generate
   
   # Reset database
   npx prisma db push --force-reset
   ```

3. **Migration Failures:**
   ```bash
   # Check database logs
   tail -f /usr/local/var/log/postgres.log
   
   # Verify data integrity
   psql -d medport -c "SELECT COUNT(*) FROM users;"
   ```

### **Test Environment Reset:**
```bash
# Reset all test databases
dropdb -h localhost -p 5432 -U postgres medport_hospital
dropdb -h localhost -p 5433 -U postgres medport_ems
dropdb -h localhost -p 5434 -U postgres medport_center

# Recreate databases
./scripts/setup-database-siloing.sh
```

---

## 📊 **Success Criteria**

### **Functional Requirements:**
- ✅ All three databases operational
- ✅ Cross-database access working
- ✅ Hospital module fully functional
- ✅ Event-driven communication working
- ✅ Authentication centralized and working

### **Performance Requirements:**
- ✅ Database connections < 1 second
- ✅ Cross-database queries < 2 seconds
- ✅ Event processing < 100ms
- ✅ System maintains responsiveness

### **Data Integrity Requirements:**
- ✅ All existing data migrated correctly
- ✅ Relationships preserved across databases
- ✅ No data loss during migration
- ✅ Referential integrity maintained

---

**This testing plan ensures that Phase 1 of the database siloing implementation is thoroughly validated before proceeding to Phase 2.**

