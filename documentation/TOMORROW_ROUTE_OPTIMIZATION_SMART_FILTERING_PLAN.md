# Route Optimization Smart Filtering Implementation Plan

**Date Created:** October 11, 2025  
**Target Date:** October 12, 2025  
**Status:** 📋 Ready for Implementation  
**Priority:** High - Revenue Generation Feature

---

## 🎯 **Business Objective**

Enable TCC to suggest **realistic, profitable backhaul opportunities** to EMS customers by filtering trips based on:
1. Origin proximity to unit's current location
2. Destination proximity to unit's home base
3. Configurable distance thresholds

**Revenue Model:** TCC earns 10-15% commission on trips accepted via their backhaul suggestions.

---

## 📋 **Requirements from User**

### **Step 3: Select Requests** - Three Criteria:

#### **1. Always Display Trip ID**
- Show clear Trip ID at the top of each request
- Makes it easy for command center to reference specific trips
- Essential for tracking and billing

#### **2. Origin Location Filtering (Configurable Distance)**
**Example Scenario:**
```
Unit 423 is at: Presbyterian Hospital, Pittsburgh
Home Base: Altoona EMS Station

Available Trips:
❌ Trip from Mt. Lebanon (10 miles away) - Too far to drive empty
✅ Trip from Allegheny General (3 miles away) - Close enough!
   → Destination: Altoona (30 miles from home)
   → Accept this trip = revenue for the backhaul!
```

**Logic:**
- Check distance from **unit's current location** to **trip's origin**
- Only show trips where `distance(currentLocation, tripOrigin) <= MAX_ORIGIN_DISTANCE`
- Default: 5-10 miles (configurable)

#### **3. Destination Location Filtering (Configurable Distance)**
**Example Scenario:**
```
Home Base: Altoona EMS Station

Trip Destinations:
❌ Trip to Philadelphia (200 miles) - Too far from home
❌ Trip to Erie (150 miles) - Too far from home
✅ Trip to Altoona (0 miles from home) - Perfect!
✅ Trip to Hollidaysburg (10 miles from home) - Close enough!
```

**Logic:**
- Check distance from **trip's destination** to **unit's home base**
- Only show trips where `distance(tripDestination, homeBase) <= MAX_DESTINATION_DISTANCE`
- Default: 30-50 miles (configurable)

---

## 🏗️ **Implementation Plan**

### **Phase 1: Database Schema Updates**

#### **1.1 Add Home Base to Units Table**
**Why:** Need to know where each unit's "home" is

```sql
-- Migration: Add home base fields to units table
ALTER TABLE units ADD COLUMN home_base_latitude DOUBLE PRECISION;
ALTER TABLE units ADD COLUMN home_base_longitude DOUBLE PRECISION;
ALTER TABLE units ADD COLUMN home_base_name VARCHAR(255);
ALTER TABLE units ADD COLUMN home_base_address TEXT;
```

**Data Entry:**
- Command center sets home base for each unit (one-time setup)
- Can be edited in Units Management
- Similar UI to location setting but for "home base"

#### **1.2 Add Origin/Destination Coordinates to Transport Requests**
**Current Problem:** `transport_requests` table is missing:
- `originLatitude`
- `originLongitude`  
- `destinationLatitude`
- `destinationLongitude`

**Solution:** Already identified in previous debugging - need to populate these fields

```sql
-- Verify fields exist (they should from schema)
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'transport_requests' 
AND column_name LIKE '%latitude%' OR column_name LIKE '%longitude%';

-- If missing, add them:
ALTER TABLE transport_requests ADD COLUMN origin_latitude DOUBLE PRECISION;
ALTER TABLE transport_requests ADD COLUMN origin_longitude DOUBLE PRECISION;
ALTER TABLE transport_requests ADD COLUMN destination_latitude DOUBLE PRECISION;
ALTER TABLE transport_requests ADD COLUMN destination_longitude DOUBLE PRECISION;
```

**Data Population:**
- Geocode existing trips' `fromLocation` and `toLocation` addresses
- For new trips, geocode addresses on creation
- Fall back to facility coordinates if address matches a facility

---

### **Phase 2: Settings/Configuration System**

#### **2.1 Create Optimization Settings Table**
```sql
CREATE TABLE IF NOT EXISTS optimization_settings (
  id VARCHAR(50) PRIMARY KEY,
  agency_id VARCHAR(255),
  max_origin_distance_miles INTEGER DEFAULT 10,
  max_destination_distance_miles INTEGER DEFAULT 50,
  enable_origin_filtering BOOLEAN DEFAULT TRUE,
  enable_destination_filtering BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(255)
);
```

#### **2.2 Settings UI Component**
**Location:** Route Optimization page → Settings panel (already exists!)

**Add Fields:**
```typescript
interface OptimizationConstraints {
  // ... existing fields ...
  maxOriginDistance: number;        // Default: 10 miles
  maxDestinationDistance: number;   // Default: 50 miles
  enableOriginFiltering: boolean;   // Default: true
  enableDestinationFiltering: boolean; // Default: true
}
```

**UI:**
```
┌─────────────────────────────────────────┐
│ ⚙️ Optimization Settings                │
├─────────────────────────────────────────┤
│                                         │
│ 📍 Request Filtering                    │
│                                         │
│ ☑ Filter by origin proximity           │
│   Max distance from current location:  │
│   [10] miles                            │
│                                         │
│ ☑ Filter by destination proximity      │
│   Max distance from home base:         │
│   [50] miles                            │
│                                         │
│ 💡 Tip: Larger distances = more        │
│    opportunities, but less profitable   │
│                                         │
└─────────────────────────────────────────┘
```

---

### **Phase 3: Backend API Updates**

#### **3.1 Haversine Distance Function**
**Already exists:** `backend/src/services/coordinateService.ts`

```typescript
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Haversine formula - returns distance in miles
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

#### **3.2 Update `/api/trips?status=PENDING` Endpoint**
**File:** `backend/src/routes/trips.ts`

**Add Query Parameters:**
```typescript
interface GetTripsQuery {
  status?: string;
  unitLocationLat?: number;  // NEW
  unitLocationLng?: number;  // NEW
  homeBaseLat?: number;      // NEW
  homeBaseLng?: number;      // NEW
  maxOriginDistance?: number; // NEW
  maxDestinationDistance?: number; // NEW
}
```

**Filtering Logic:**
```typescript
async function getFilteredPendingRequests(query: GetTripsQuery) {
  // 1. Get all PENDING trips
  const trips = await prisma.transportRequest.findMany({
    where: { status: 'PENDING' }
  });
  
  // 2. Filter by origin proximity
  if (query.unitLocationLat && query.maxOriginDistance) {
    trips = trips.filter(trip => {
      if (!trip.originLatitude || !trip.originLongitude) return false;
      
      const distance = calculateDistance(
        query.unitLocationLat,
        query.unitLocationLng,
        trip.originLatitude,
        trip.originLongitude
      );
      
      return distance <= query.maxOriginDistance;
    });
  }
  
  // 3. Filter by destination proximity
  if (query.homeBaseLat && query.maxDestinationDistance) {
    trips = trips.filter(trip => {
      if (!trip.destinationLatitude || !trip.destinationLongitude) return false;
      
      const distance = calculateDistance(
        query.homeBaseLat,
        query.homeBaseLng,
        trip.destinationLatitude,
        trip.destinationLongitude
      );
      
      return distance <= query.maxDestinationDistance;
    });
  }
  
  return trips;
}
```

#### **3.3 Add Home Base to Unit APIs**
**File:** `backend/src/services/unitService.ts`

**Update Unit Interface:**
```typescript
interface Unit {
  // ... existing fields ...
  homeBase?: {
    lat: number;
    lng: number;
    name?: string;
    address?: string;
  };
}
```

**Add Endpoint:**
```typescript
// PUT /api/units/:unitId/home-base
router.put('/:unitId/home-base', async (req, res) => {
  const { unitId } = req.params;
  const { latitude, longitude, name, address } = req.body;
  
  const unit = await prisma.unit.update({
    where: { id: unitId },
    data: {
      homeBaseLatitude: latitude,
      homeBaseLongitude: longitude,
      homeBaseName: name,
      homeBaseAddress: address
    }
  });
  
  res.json({ success: true, data: unit });
});
```

---

### **Phase 4: Frontend Updates**

#### **4.1 Update TCCRouteOptimizer Component**

**Add Home Base Display:**
```typescript
const [selectedUnitHomeBase, setSelectedUnitHomeBase] = useState<{
  lat: number;
  lng: number;
  name?: string;
} | null>(null);

// When unit is selected, load home base
useEffect(() => {
  if (selectedUnit) {
    const unit = availableUnits.find(u => u.id === selectedUnit);
    if (unit?.homeBase) {
      setSelectedUnitHomeBase(unit.homeBase);
    }
  }
}, [selectedUnit]);
```

**Display Home Base Info:**
```tsx
{selectedUnit && selectedUnitHomeBase && (
  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
    <p className="text-sm font-medium text-green-900">
      🏠 Home Base: {selectedUnitHomeBase.name || 'Set'}
    </p>
    <p className="text-xs text-gray-600">
      Showing trips within {settings.maxDestinationDistance} miles of home
    </p>
  </div>
)}
```

#### **4.2 Update Request Loading with Filters**

```typescript
const loadPendingRequests = async () => {
  if (!unitLocation || !selectedUnitHomeBase) {
    // Can't filter without location data
    setPendingRequests([]);
    return;
  }
  
  const params = {
    status: 'PENDING',
    unitLocationLat: unitLocation.lat,
    unitLocationLng: unitLocation.lng,
    homeBaseLat: selectedUnitHomeBase.lat,
    homeBaseLng: selectedUnitHomeBase.lng,
    maxOriginDistance: optimizationSettings.constraints.maxOriginDistance,
    maxDestinationDistance: optimizationSettings.constraints.maxDestinationDistance
  };
  
  const response = await api.get('/api/trips', { params });
  setPendingRequests(response.data.data);
};
```

#### **4.3 Enhanced Request Display**

```tsx
{pendingRequests.map((request) => {
  // Calculate distances for display
  const originDistance = calculateDistance(
    unitLocation.lat,
    unitLocation.lng,
    request.originLocation.lat,
    request.originLocation.lng
  );
  
  const destinationDistance = calculateDistance(
    selectedUnitHomeBase.lat,
    selectedUnitHomeBase.lng,
    request.destinationLocation.lat,
    request.destinationLocation.lng
  );
  
  return (
    <label key={request.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg border">
      <input
        type="checkbox"
        checked={selectedRequests.includes(request.id)}
        onChange={() => handleRequestToggle(request.id)}
        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
      />
      <div className="ml-3 flex-1">
        {/* Trip ID - Always visible */}
        <div className="text-sm font-medium text-gray-900">
          Trip ID: {request.id}
        </div>
        
        {/* Patient & Route */}
        <div className="text-sm text-gray-700 mt-1">
          Patient: {request.patientId}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {request.originFacilityName} → {request.destinationFacilityName}
        </div>
        
        {/* Distances */}
        <div className="flex items-center gap-4 mt-2">
          <div className="text-xs text-blue-600">
            📍 {originDistance.toFixed(1)} mi from you
          </div>
          <div className="text-xs text-green-600">
            🏠 {destinationDistance.toFixed(1)} mi from home
          </div>
        </div>
        
        {/* Details */}
        <div className="text-xs text-gray-400 mt-1">
          {request.transportLevel} • {request.priority} • {request.readyStart.toLocaleString()}
        </div>
      </div>
    </label>
  );
})}
```

---

### **Phase 5: Home Base Management UI**

#### **5.1 Add Home Base Tab to Units Management**
**File:** `frontend/src/components/UnitsManagement.tsx`

**New Tab:**
```tsx
<button
  onClick={() => setActiveTab('homebases')}
  className={`${activeTab === 'homebases' ? 'border-orange-500 text-orange-600' : '...'}`}
>
  <Home className="h-5 w-5 mr-2" />
  Home Bases
</button>
```

**Content:**
```tsx
{activeTab === 'homebases' && (
  <div className="space-y-6">
    <h3 className="text-lg font-medium">Unit Home Bases</h3>
    <p className="text-sm text-gray-600">
      Set the home base for each unit. This is used to filter backhaul opportunities
      that end near the unit's home location.
    </p>
    
    {units.map(unit => (
      <div key={unit.id} className="border rounded-lg p-4">
        <h4 className="font-medium">{unit.unitNumber}</h4>
        
        {unit.homeBase ? (
          <div className="mt-2">
            <p className="text-sm text-green-700">
              🏠 {unit.homeBase.name || unit.homeBase.address}
            </p>
            <p className="text-xs text-gray-500">
              Lat: {unit.homeBase.lat.toFixed(6)}, Lng: {unit.homeBase.lng.toFixed(6)}
            </p>
            <button onClick={() => editHomeBase(unit)}>Change</button>
          </div>
        ) : (
          <button onClick={() => setHomeBase(unit)}>
            Set Home Base
          </button>
        )}
      </div>
    ))}
  </div>
)}
```

---

## 📊 **Data Requirements**

### **Before Implementation:**

1. **Units Need Home Bases**
   - Get addresses of each EMS agency's station
   - Geocode addresses to lat/lng
   - Store in database

2. **Trips Need Coordinates**
   - Audit existing trips for missing coordinates
   - Geocode `fromLocation` and `toLocation` addresses
   - Update existing records
   - Ensure new trip creation includes geocoding

3. **Test Data**
   - Create test scenario:
     - Unit at Pittsburgh Presbyterian
     - Home base: Altoona
     - Trip from Allegheny General → Hollidaysburg
     - Should appear in filtered results!

---

## 🔧 **Implementation Steps (Day 1 - Tomorrow)**

### **Morning (3-4 hours):**

1. ✅ **Database Schema**
   - [ ] Add home base columns to `units` table
   - [ ] Verify origin/destination lat/lng columns exist in `transport_requests`
   - [ ] Create migration script
   - [ ] Run migration on dev database

2. ✅ **Backend API**
   - [ ] Add home base endpoints to `unitService.ts`
   - [ ] Update trip filtering logic in `trips.ts`
   - [ ] Test filtering with sample data
   - [ ] Add distance calculations to response

### **Afternoon (3-4 hours):**

3. ✅ **Frontend - Home Base Management**
   - [ ] Add Home Base tab to Units Management
   - [ ] Create home base setting UI (similar to location)
   - [ ] Test setting home base for units

4. ✅ **Frontend - Smart Filtering**
   - [ ] Update settings to include distance thresholds
   - [ ] Modify request loading to include filter params
   - [ ] Update request display to show Trip ID prominently
   - [ ] Add distance indicators (from you / from home)
   - [ ] Test with filtered results

### **Evening (1-2 hours):**

5. ✅ **Testing & Validation**
   - [ ] Test complete scenario end-to-end
   - [ ] Verify distances are calculated correctly
   - [ ] Confirm filtering works as expected
   - [ ] Test with multiple units and bases
   - [ ] Document any issues

6. ✅ **Commit & Backup** (After user verification!)
   - [ ] User tests thoroughly
   - [ ] User confirms "this works"
   - [ ] Git commit with "USER VERIFIED WORKING"
   - [ ] Run enhanced backup

---

## 🧪 **Testing Scenarios**

### **Scenario 1: Perfect Backhaul**
```
Unit: Medic 1
Current Location: Presbyterian Hospital, Pittsburgh (40.4426, -79.9588)
Home Base: Altoona EMS Station (40.5187, -78.3947)

Trip Available:
- ID: TRIP-001
- Origin: Allegheny General (3 miles from unit) ✅
- Destination: Hollidaysburg (5 miles from home) ✅
- Result: SHOULD APPEAR in filtered list
```

### **Scenario 2: Origin Too Far**
```
Unit: Medic 1
Current Location: Presbyterian Hospital, Pittsburgh
Home Base: Altoona EMS Station

Trip Available:
- ID: TRIP-002
- Origin: Erie Hospital (120 miles from unit) ❌
- Destination: Altoona (0 miles from home) ✅
- Result: SHOULD NOT APPEAR (origin too far)
```

### **Scenario 3: Destination Too Far**
```
Unit: Medic 1
Current Location: Presbyterian Hospital, Pittsburgh
Home Base: Altoona EMS Station

Trip Available:
- ID: TRIP-003
- Origin: Allegheny General (3 miles from unit) ✅
- Destination: Philadelphia (300 miles from home) ❌
- Result: SHOULD NOT APPEAR (destination too far)
```

---

## 💰 **Business Value**

### **Before Smart Filtering:**
```
Shows ALL pending trips
↓
Driver wastes time reviewing irrelevant trips
↓
Misses good opportunities in the noise
↓
Lower acceptance rate
↓
Less commission for TCC
```

### **After Smart Filtering:**
```
Shows ONLY relevant trips
↓
Driver sees 3-5 perfect opportunities
↓
Higher acceptance rate (more likely to accept)
↓
More trips completed via TCC suggestions
↓
Higher commission revenue for TCC! 💰
```

**Estimated Impact:**
- Current: 10% acceptance rate on suggestions
- With Filtering: 40-50% acceptance rate
- **4-5x more revenue** from the same number of suggestions!

---

## 📝 **Documentation to Update**

- [ ] Update Route Optimization user guide
- [ ] Add Home Base setup instructions
- [ ] Document distance threshold recommendations
- [ ] Create training video for command center
- [ ] Update API documentation

---

## ⚠️ **Potential Challenges**

### **Challenge 1: Missing Coordinates**
**Problem:** Some trips may not have origin/destination coordinates  
**Solution:** 
- Show warning in UI
- Provide geocoding tool for backfill
- Exclude trips with missing coords from filtering

### **Challenge 2: Incorrect Home Base**
**Problem:** Unit home base set to wrong location  
**Solution:**
- Easy to edit in Units Management
- Show home base on map for visual confirmation
- Allow quick reset to agency address

### **Challenge 3: Distance Threshold Tuning**
**Problem:** Default distances may not work for all agencies  
**Solution:**
- Make thresholds configurable
- Provide recommendations based on agency type:
  - Urban: 5 mi origin, 30 mi destination
  - Rural: 15 mi origin, 75 mi destination
  - Long-haul: 25 mi origin, 150 mi destination

---

## ✅ **Success Criteria**

- [ ] Trip ID always visible in request list
- [ ] Requests filtered by origin distance from current location
- [ ] Requests filtered by destination distance from home base
- [ ] Distance thresholds configurable in settings
- [ ] Home bases set for all units
- [ ] Distances displayed clearly in UI
- [ ] Performance: Filtering completes in < 500ms
- [ ] User tested and verified working
- [ ] Committed with "USER VERIFIED WORKING"
- [ ] Enhanced backup completed

---

## 🚀 **Ready for Implementation!**

All planning complete. Ready to start coding tomorrow morning with clear requirements and test scenarios.

**Estimated Time:** 7-9 hours total (one full day)  
**Complexity:** Medium (database + backend + frontend)  
**Business Impact:** High (4-5x revenue increase potential!)  
**Risk:** Low (can fall back to showing all trips if filtering fails)

---

**Next Steps Tomorrow:**
1. Coffee ☕
2. Database migrations
3. Backend API updates
4. Frontend UI implementation
5. Testing with real scenarios
6. User verification
7. Commit + Backup
8. 🎉 Celebrate realistic backhaul suggestions!

