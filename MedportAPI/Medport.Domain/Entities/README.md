# Domain Entities

This folder contains all domain entities for the Medport application. The entities are migrated from the Node.js/Prisma backend to C# Entity Framework Core.

## Entity Organization

All entities are in the `Medport.Domain.Entities` namespace and are organized by functionality:

### User Entities
- **CenterUser**: Administrative users for the Transport Control Center
- **HealthcareUser**: Users from healthcare facilities (hospitals, clinics, etc.)
- **EmsUser**: Users from EMS agencies

### Healthcare Entities
- **HealthcareLocation**: Physical locations managed by healthcare users
- **PickupLocation**: Specific pickup points within healthcare facilities
- **HealthcareDestination**: Saved destination locations for trips
- **HealthcareAgencyPreference**: Healthcare facility's preferred EMS agencies

### Hospital/Facility Entities	
- **Hospital**: Hospital records managed by the system

### EMS Entities
- **EmsAgency**: EMS agencies in the system
- **Unit**: EMS transport units (ambulances, helicopters, etc.)

### Transport Entities
- **TransportRequest**: Patient transport requests created by healthcare facilities
- **AgencyResponse**: EMS agency responses to transport requests

### Reference Data Entities
- **DropdownCategory**: Categories for dropdown menus (fixed, cannot be modified)
- **DropdownOption**: Options within dropdown categories

## Design Patterns

### ID Generation
All entities use `Guid.NewGuid().ToString()` for ID generation:	

### Audit Timestamps
All entities include timestamp tracking:

### Soft Deletes
User entities support soft deletes:

### Navigation Properties
Navigation properties use virtual keyword for lazy loading:

Navigation properties that would cause serialization cycles use `[JsonIgnore]`:

### JSON Properties
Complex objects are stored as `object` type for EF Core JSON serialization:

## Constants

Domain constants are defined in `Medport.Domain/Constants.cs`:

- **UserTypes**: User role types (ADMIN, USER, HEALTHCARE, EMS)
- **TransportLevels**: Service levels (BLS, ALS, CCT)
- **TripPriorities**: Priority levels (LOW, MEDIUM, HIGH, URGENT)
- **TripStatuses**: Trip statuses (PENDING, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED)
- **UnitStatuses**: Unit statuses (AVAILABLE, COMMITTED, OUT_OF_SERVICE, etc.)
- **FacilityTypes**: Facility types (HOSPITAL, CLINIC, URGENT_CARE, etc.)
- **DropdownCategories**: Fixed dropdown category slugs (dropdown-1 through dropdown-7)

## Database Mapping

These entities map to the following Node.js Prisma schemas:
- Hospital Database: `schema-hospital.prisma`
- EMS Database: `schema-ems.prisma`
- Center Database: `schema-center.prisma`

## Migration Notes

- All timestamps use UTC (`DateTime.UtcNow`)
- All IDs are strings (GUIDs as strings for consistency with Node.js)
- JSON objects are stored as `object` type for EF Core JSON support
- Collection properties are initialized with empty lists
- All properties have sensible defaults where appropriate