# 🏗️ Revised Database Architecture with Cross-Database Access

## 🔄 **Cross-Database Access Flow**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MedPort System                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   Hospital DB   │    │     EMS DB      │    │   Center DB     │         │
│  │   (Port 5432)   │    │   (Port 5433)   │    │   (Port 5434)   │         │
│  │                 │    │                 │    │                 │         │
│  │ • HospitalUsers │    │ • EMSAgencies   │    │ • ALL Users     │         │
│  │ • Facilities    │    │ • Units         │    │ • Authentication│         │
│  │ • TransportReq  │    │ • Bids          │    │ • Service Mgmt  │         │
│  │ • Agency Prefs  │    │ • Routes        │    │ • Analytics     │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                       │                       │                 │
│           │                       │                       │                 │
│           └───────────────────────┼───────────────────────┘                 │
│                                   │                                         │
│  ┌─────────────────────────────────┼─────────────────────────────────┐     │
│  │        Cross-Database Access    │                                 │     │
│  │                                 │                                 │     │
│  │  Hospital → Center DB (EMS)     │  EMS → Hospital DB (Trips)     │     │
│  │  Center → Hospital DB (Trips)   │  Center → EMS DB (Agencies)    │     │
│  │  All → Center DB (Users)        │                                 │     │
│  └─────────────────────────────────┼─────────────────────────────────┘     │
│                                   │                                         │
│  ┌─────────────────────────────────┼─────────────────────────────────┐     │
│  │        Event-Driven System      │                                 │     │
│  │                                 │                                 │     │
│  │  Trip Created → EMS + Center    │  Trip Accepted → Hospital + Center │   │
│  │  User Created → Appropriate DB  │  Service Added → EMS + Hospital │     │
│  └─────────────────────────────────┼─────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📊 **Data Flow Examples**

### **1. Hospital Creates Trip Request**
```
Hospital DB: TransportRequest created
    ↓ (Event: trip.created)
Center DB: Analytics logged
    ↓ (Event: trip.created)
EMS DB: Available trip created for agencies
```

### **2. EMS Agency Accepts Trip**
```
EMS DB: TransportBid status = "ACCEPTED"
    ↓ (Event: trip.accepted)
Hospital DB: TransportRequest status updated
    ↓ (Event: trip.accepted)
Center DB: Performance metrics logged
```

### **3. User Registration (Any Type)**
```
Center DB: User account created
    ↓ (Event: user.created)
Appropriate DB: User-specific record created
    ↓ (Event: user.created)
Center DB: Registration analytics logged
```

## 🔗 **Cross-Database Query Examples**

### **Hospital Needs EMS Agencies**
```typescript
// Hospital queries Center DB for EMS agencies
const agencies = await centerDB.emsAgency.findMany({
  where: { isActive: true }
});
```

### **Transport Center Needs All Trips**
```typescript
// Center queries Hospital DB for all trips
const trips = await hospitalDB.transportRequest.findMany({
  include: { originFacility: true, destinationFacility: true }
});
```

### **EMS Needs Available Trips**
```typescript
// EMS queries Hospital DB for pending trips
const trips = await hospitalDB.transportRequest.findMany({
  where: { status: 'PENDING' }
});
```

## 🎯 **Key Benefits of Revised Architecture**

| Requirement | Solution | Database |
|-------------|----------|----------|
| **Hospital trips** | TransportRequest table | Hospital DB |
| **Hospital sees EMS** | Cross-DB query to Center | Center DB |
| **Center sees trips** | Cross-DB query to Hospital | Hospital DB |
| **EMS sees trips** | Cross-DB query to Hospital | Hospital DB |
| **All user accounts** | User table | Center DB |

## 🔐 **Authentication Flow**

```
User Login Request
    ↓
Center DB: Authenticate user
    ↓
Return user + userType
    ↓
Route to appropriate database:
- Hospital users → Hospital DB
- EMS users → EMS DB  
- Center users → Center DB
```

## 📈 **Scalability Benefits**

- **Hospital DB**: Scales with trip volume
- **EMS DB**: Scales with agency/unit count
- **Center DB**: Scales with user count and analytics
- **Cross-DB**: Event-driven, non-blocking communication

---

**This revised architecture ensures all your requirements are met while maintaining proper data isolation and system scalability.**
