# Hospital Transport Center Implementation Plan

## Overview

The Hospital Transport Center feature enables a centralized transport coordination system where a single "Transport Center" can manage trips for multiple hospitals within a healthcare system (e.g., Penn Highlands managing trips for Dubois Regional, Clearfield, Tyrone, Huntingdon, and State College hospitals).

## Business Requirements

### Current Problem
- Transport Centers need to log out and log back in as different hospitals to create trips
- Inefficient workflow for multi-hospital systems
- Risk of creating trips under wrong hospital identity
- No centralized view of all system-wide transport requests

### Desired Solution
- Single login for Transport Center users
- Ability to select target hospital when creating trips
- Centralized dashboard showing all system trips
- Hospital-specific filtering and management
- Audit trail showing which hospital each trip was created for

## Technical Architecture

### 1. Database Schema Changes

#### New Table: `transport_centers`
```sql
CREATE TABLE transport_centers (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  description TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### New Table: `transport_center_hospitals`
```sql
CREATE TABLE transport_center_hospitals (
  id VARCHAR(191) PRIMARY KEY,
  transportCenterId VARCHAR(191) NOT NULL,
  hospitalId VARCHAR(191) NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (transportCenterId) REFERENCES transport_centers(id) ON DELETE CASCADE,
  FOREIGN KEY (hospitalId) REFERENCES hospitals(id) ON DELETE CASCADE,
  UNIQUE KEY unique_center_hospital (transportCenterId, hospitalId)
);
```

#### Update Existing Tables

**`users` table:**
```sql
ALTER TABLE users ADD COLUMN transportCenterId VARCHAR(191) NULL;
ALTER TABLE users ADD FOREIGN KEY (transportCenterId) REFERENCES transport_centers(id);
```

**`transport_requests` table:**
```sql
ALTER TABLE transport_requests ADD COLUMN createdByTransportCenterId VARCHAR(191) NULL;
ALTER TABLE transport_requests ADD FOREIGN KEY (createdByTransportCenterId) REFERENCES transport_centers(id);
```

### 2. User Types & Permissions

#### New User Type: `TRANSPORT_CENTER`
```typescript
type UserType = 'HEALTHCARE' | 'EMS' | 'TRANSPORT_CENTER' | 'ADMIN';
```

#### Permission Matrix
| User Type | Can Create Trips For | Can View | Can Edit | Can Complete |
|-----------|---------------------|----------|----------|--------------|
| HEALTHCARE | Own Hospital Only | Own Hospital | Own Hospital | Own Hospital |
| TRANSPORT_CENTER | All Assigned Hospitals | All Assigned Hospitals | All Assigned Hospitals | All Assigned Hospitals |
| EMS | N/A | All Hospitals | Own Accepted Trips | Own Accepted Trips |
| ADMIN | All Hospitals | All Hospitals | All Hospitals | All Hospitals |

### 3. Frontend Implementation

#### 3.1 Authentication & User Context
```typescript
interface TransportCenterUser extends User {
  userType: 'TRANSPORT_CENTER';
  transportCenterId: string;
  assignedHospitals: Hospital[];
}

interface UserContext {
  user: TransportCenterUser;
  selectedHospital: Hospital | null; // For trip creation
  availableHospitals: Hospital[];
}
```

#### 3.2 Hospital Selector Component
```typescript
const HospitalSelector: React.FC = () => {
  const { user, selectedHospital, setSelectedHospital } = useUserContext();
  
  if (user.userType !== 'TRANSPORT_CENTER') return null;
  
  return (
    <div className="hospital-selector">
      <label>Creating trip for:</label>
      <select 
        value={selectedHospital?.id || ''} 
        onChange={(e) => setSelectedHospital(findHospital(e.target.value))}
      >
        <option value="">Select Hospital</option>
        {user.assignedHospitals.map(hospital => (
          <option key={hospital.id} value={hospital.id}>
            {hospital.name}
          </option>
        ))}
      </select>
    </div>
  );
};
```

#### 3.3 Enhanced Trip Creation Form
```typescript
const EnhancedTripForm: React.FC = () => {
  const { user, selectedHospital } = useUserContext();
  
  const handleSubmit = async (tripData: CreateTripRequest) => {
    if (user.userType === 'TRANSPORT_CENTER' && !selectedHospital) {
      throw new Error('Please select a hospital for this trip');
    }
    
    const finalTripData = {
      ...tripData,
      originFacilityId: selectedHospital?.id || user.facilityId,
      createdByTransportCenterId: user.userType === 'TRANSPORT_CENTER' ? user.transportCenterId : null
    };
    
    await tripsAPI.create(finalTripData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {user.userType === 'TRANSPORT_CENTER' && <HospitalSelector />}
      {/* Rest of form */}
    </form>
  );
};
```

#### 3.4 Enhanced Dashboard Views

**Transport Center Dashboard:**
```typescript
const TransportCenterDashboard: React.FC = () => {
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('all');
  
  return (
    <div>
      <div className="filters">
        <select 
          value={selectedHospitalFilter}
          onChange={(e) => setSelectedHospitalFilter(e.target.value)}
        >
          <option value="all">All Hospitals</option>
          {user.assignedHospitals.map(hospital => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.name}
            </option>
          ))}
        </select>
      </div>
      
      <TripList 
        filter={{ hospitalId: selectedHospitalFilter === 'all' ? null : selectedHospitalFilter }}
        showHospitalColumn={true}
      />
    </div>
  );
};
```

**Enhanced Trip Card:**
```typescript
const TripCard: React.FC<{ trip: Trip }> = ({ trip }) => (
  <div className="trip-card">
    <div className="trip-header">
      <h4>Patient {trip.patientId}</h4>
      {trip.createdByTransportCenter && (
        <span className="transport-center-badge">
          Created by Transport Center for {trip.originFacility.name}
        </span>
      )}
    </div>
    <p>{trip.origin} → {trip.destination}</p>
    {/* Rest of trip details */}
  </div>
);
```

### 4. Backend Implementation

#### 4.1 Updated Authentication Middleware
```typescript
const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // ... existing auth logic ...
  
  const user = await getUserById(decoded.id);
  
  if (user.userType === 'TRANSPORT_CENTER') {
    // Load assigned hospitals
    const assignedHospitals = await getTransportCenterHospitals(user.transportCenterId);
    req.user = {
      ...user,
      assignedHospitals
    };
  }
  
  next();
};
```

#### 4.2 Enhanced Trip Service
```typescript
class TripService {
  async createTrip(data: CreateTripRequest, user: User) {
    const tripData = {
      ...data,
      createdByTransportCenterId: user.userType === 'TRANSPORT_CENTER' ? user.transportCenterId : null
    };
    
    return await prisma.transportRequest.create({ data: tripData });
  }
  
  async getTrips(filters: TripFilters, user: User) {
    let whereClause = {};
    
    if (user.userType === 'TRANSPORT_CENTER') {
      // Filter by assigned hospitals
      const hospitalIds = user.assignedHospitals.map(h => h.id);
      whereClause = {
        ...whereClause,
        OR: [
          { originFacilityId: { in: hospitalIds } },
          { destinationFacilityId: { in: hospitalIds } }
        ]
      };
    } else if (user.userType === 'HEALTHCARE') {
      // Filter by user's hospital only
      whereClause = {
        ...whereClause,
        OR: [
          { originFacilityId: user.facilityId },
          { destinationFacilityId: user.facilityId }
        ]
      };
    }
    
    return await prisma.transportRequest.findMany({
      where: whereClause,
      include: {
        originFacility: true,
        destinationFacility: true,
        createdByTransportCenter: true
      }
    });
  }
}
```

#### 4.3 New API Endpoints
```typescript
// Get transport center assigned hospitals
GET /api/transport-centers/:id/hospitals

// Create transport center
POST /api/transport-centers
{
  "name": "Penn Highlands Transport Center",
  "hospitalIds": ["hospital1", "hospital2", "hospital3"]
}

// Assign hospitals to transport center
POST /api/transport-centers/:id/hospitals
{
  "hospitalIds": ["hospital1", "hospital2"]
}
```

### 5. Migration Strategy

#### Phase 1: Database Setup
1. Create new tables (`transport_centers`, `transport_center_hospitals`)
2. Add new columns to existing tables
3. Create indexes for performance

#### Phase 2: Backend Implementation
1. Update authentication middleware
2. Enhance trip service with transport center logic
3. Create transport center management APIs
4. Add audit logging

#### Phase 3: Frontend Implementation
1. Create hospital selector component
2. Update trip creation form
3. Enhance dashboard with hospital filtering
4. Update trip cards to show transport center info

#### Phase 4: Testing & Rollout
1. Unit tests for all new functionality
2. Integration tests for transport center workflows
3. User acceptance testing with Penn Highlands
4. Gradual rollout to other healthcare systems

### 6. Configuration & Setup

#### 6.1 Transport Center Creation
```typescript
// Admin interface for creating transport centers
const TransportCenterSetup: React.FC = () => (
  <div>
    <h2>Create Transport Center</h2>
    <form>
      <input name="name" placeholder="Transport Center Name" />
      <MultiSelect 
        options={availableHospitals}
        selected={selectedHospitals}
        onChange={setSelectedHospitals}
        placeholder="Select Hospitals"
      />
      <button type="submit">Create Transport Center</button>
    </form>
  </div>
);
```

#### 6.2 User Assignment
```typescript
// Assign users to transport centers
const UserTransportCenterAssignment: React.FC = () => (
  <div>
    <select name="user">
      {availableUsers.map(user => (
        <option key={user.id} value={user.id}>
          {user.name} ({user.email})
        </option>
      ))}
    </select>
    <select name="transportCenter">
      {transportCenters.map(tc => (
        <option key={tc.id} value={tc.id}>
          {tc.name}
        </option>
      ))}
    </select>
    <button>Assign User to Transport Center</button>
  </div>
);
```

### 7. Security Considerations

#### 7.1 Data Isolation
- Transport centers can only access assigned hospitals
- Audit trail for all transport center actions
- Role-based access control enforcement

#### 7.2 API Security
- Validate hospital assignments on every request
- Prevent cross-hospital data access
- Rate limiting for transport center operations

#### 7.3 Audit Requirements
```typescript
interface AuditLog {
  id: string;
  userId: string;
  transportCenterId?: string;
  action: 'CREATE_TRIP' | 'UPDATE_TRIP' | 'ASSIGN_HOSPITAL';
  targetHospitalId?: string;
  details: any;
  timestamp: Date;
}
```

### 8. Performance Considerations

#### 8.1 Database Optimization
- Indexes on `transport_center_hospitals` table
- Efficient joins for hospital filtering
- Caching for transport center assignments

#### 8.2 Frontend Optimization
- Lazy loading of hospital data
- Debounced hospital selector
- Optimized trip list rendering

### 9. Success Metrics

#### 9.1 User Experience
- Reduced login/logout frequency
- Faster trip creation workflow
- Improved system-wide visibility

#### 9.2 System Performance
- Response times for transport center operations
- Database query performance
- User satisfaction scores

### 10. Future Enhancements

#### 10.1 Advanced Features
- Hospital-specific trip templates
- Automated hospital selection based on patient location
- Transport center analytics dashboard
- Integration with hospital management systems

#### 10.2 Scalability
- Support for multiple transport centers per system
- Hierarchical hospital management
- Regional transport center coordination

## Implementation Timeline

- **Week 1-2**: Database schema and backend APIs
- **Week 3-4**: Frontend components and integration
- **Week 5**: Testing and bug fixes
- **Week 6**: User acceptance testing with Penn Highlands
- **Week 7**: Production deployment and monitoring

## Risk Mitigation

1. **Data Migration**: Careful migration of existing trips and users
2. **Backward Compatibility**: Ensure existing healthcare users unaffected
3. **Performance**: Monitor database performance with new joins
4. **User Training**: Comprehensive training for transport center staff
5. **Rollback Plan**: Ability to disable transport center features if needed

This implementation will provide Penn Highlands and other multi-hospital systems with the centralized transport coordination they need while maintaining security and audit requirements.
