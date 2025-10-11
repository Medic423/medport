# Dual-Mode Location Implementation (GPS + Manual)

**Date:** October 11, 2025  
**Status:** ✅ Complete - Field & Command Center Modes  
**Branch:** `fix/route-optimization-errors`

## 🎯 Business Context

**Revenue Model:** TCC suggests optimized backhaul routes to EMS customers. If they use TCC's suggested routes, TCC receives a percentage of the revenue generated from those trips.

**User Types:**
1. **Field Staff** - Drivers/EMTs who are physically with the unit → Use GPS
2. **Command Center** - Dispatch/coordinators tracking units remotely → Use Manual mode

## ✨ Features Implemented

### **1. Dual Mode Toggle**
Two buttons at the top of location section:
- **🎯 GPS (Field)** - For drivers using their current location
- **📍 Manual (Dispatch)** - For command center setting unit locations

### **2. GPS Mode (Field Staff)**
**What it does:**
- One-click "Use My Current Location" button
- Browser requests GPS permission
- Automatically checks if location matches any facility
- Shows facility name if matched

**Example:**
```
Location Set ✓
📍 UPMC Presbyterian Hospital - 200 Lothrop St, Pittsburgh, PA
Lat: 40.442516, Lng: -79.958880
```

### **3. Manual Mode (Command Center)**
**What it does:**
- Search box: "Search facilities or enter address..."
- As you type, shows dropdown of matching facilities
- Click a facility to set location instantly
- OR enter custom address and press Enter
- Uses geocoding to convert address to coordinates
- Also checks for facility matches

**Example Flow:**
```
User types: "UPMC Pres"

Dropdown shows:
┌─────────────────────────────────────────┐
│ UPMC Presbyterian Hospital              │
│ 200 Lothrop St • Pittsburgh             │
├─────────────────────────────────────────┤
│ UPMC Presbyterian Shadyside             │
│ 5230 Centre Ave • Pittsburgh            │
└─────────────────────────────────────────┘

Click one → Location set instantly!
```

### **4. Facility Matching (Smart)**
**When location is set (GPS or Manual):**
- Checks all facilities in system
- Matches within ~100 meters (0.001 degrees)
- Shows facility name if matched
- Helps confirm unit is at known location

**Benefits:**
- Command center knows exactly which facility unit is at
- Better for billing/tracking
- Validates location accuracy

### **5. Address Geocoding**
**For custom addresses:**
- Enter any address: "123 Main St, Pittsburgh, PA"
- Press Enter or click "Use This Address"
- Uses OpenStreetMap Nominatim service (free)
- Converts address → lat/lng coordinates
- Still checks for facility match

## 🎨 User Experience

### **Field Staff Workflow:**
```
1. Select Unit → "Unit 423"
2. GPS (Field) → Already selected by default
3. Click "Use My Current Location"
4. Browser asks permission → Allow
5. ✓ Location Set
   📍 UPMC Presbyterian Hospital - 200 Lothrop St
   Lat: 40.442516, Lng: -79.958880
6. Select requests → Continue optimization
```

**Time: ~5 seconds**

### **Command Center Workflow:**
```
1. Select Unit → "Unit 423"
2. Click "Manual (Dispatch)"
3. Start typing → "UPMC Pre..."
4. Dropdown appears with matches
5. Click facility → Done!
   ✓ Location Set
   📍 UPMC Presbyterian Hospital - 200 Lothrop St
```

**Time: ~3 seconds** (no GPS wait!)

### **Custom Address Workflow:**
```
1. Select Unit → "Unit 423"
2. Click "Manual (Dispatch)"
3. Type full address → "200 Lothrop St, Pittsburgh, PA"
4. Press Enter or click "Use This Address"
5. ✓ Location Set (with facility match if found)
```

## 🔧 Technical Implementation

### **State Management:**
```typescript
const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('gps');
const [matchedFacility, setMatchedFacility] = useState<string | null>(null);
const [manualAddress, setManualAddress] = useState('');
const [facilities, setFacilities] = useState<any[]>([]);
const [filteredFacilities, setFilteredFacilities] = useState<any[]>([]);
```

### **Key Functions:**

#### **1. Load Facilities**
```typescript
const loadFacilities = async () => {
  const response = await api.get('/api/tcc/facilities');
  setFacilities(response.data.data || []);
};
```

#### **2. Check Facility Match**
```typescript
const checkFacilityMatch = (lat: number, lng: number) => {
  const threshold = 0.001; // ~100 meters
  const matched = facilities.find(facility => {
    const latMatch = Math.abs((facility.latitude || 0) - lat) < threshold;
    const lngMatch = Math.abs((facility.longitude || 0) - lng) < threshold;
    return latMatch && lngMatch;
  });
  if (matched) {
    setMatchedFacility(`${matched.name} - ${matched.address || ''}`);
  }
};
```

#### **3. Manual Location Selection**
```typescript
const setManualLocation = (facility: any) => {
  setUnitLocation({
    lat: facility.latitude,
    lng: facility.longitude
  });
  setMatchedFacility(`${facility.name} - ${facility.address || ''}`);
};
```

#### **4. Address Geocoding**
```typescript
const geocodeAddress = async (address: string) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  );
  const data = await response.json();
  if (data && data.length > 0) {
    setUnitLocation({
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    });
    checkFacilityMatch(...);
  }
};
```

### **Facility Search/Filter:**
```typescript
useEffect(() => {
  if (manualAddress.length >= 2) {
    const filtered = facilities.filter(facility =>
      facility.name.toLowerCase().includes(manualAddress.toLowerCase()) ||
      facility.address?.toLowerCase().includes(manualAddress.toLowerCase()) ||
      facility.city?.toLowerCase().includes(manualAddress.toLowerCase())
    );
    setFilteredFacilities(filtered);
  }
}, [manualAddress, facilities]);
```

## 📊 Comparison: Before vs After

### **Before (GPS Only):**
- ✅ Field staff could use GPS
- ❌ Command center couldn't set locations remotely
- ❌ No facility matching
- ❌ No address entry
- ❌ Limited use case

### **After (Dual Mode):**
- ✅ Field staff can use GPS
- ✅ Command center can set locations manually
- ✅ Automatic facility matching
- ✅ Address geocoding
- ✅ Full flexibility for all users

## 💼 Business Benefits

### **For TCC:**
1. **Revenue Tracking** - Know exactly which facility unit is at
2. **Better Suggestions** - Accurate locations = better backhaul opportunities
3. **Command Center Control** - Dispatchers can optimize routes remotely
4. **Billing Accuracy** - Facility matches help with invoicing

### **For EMS Customers:**
1. **Flexible** - Works for field and dispatch
2. **Fast** - Quick location setting (3-5 seconds)
3. **Accurate** - Facility matching validates locations
4. **More Revenue** - Better backhaul suggestions = more trips

### **Revenue Model Example:**
```
Unit 423 at UPMC Presbyterian
↓
TCC finds backhaul: UPMC → Allegheny General
↓
EMS accepts TCC's suggestion
↓
Trip generates $500 revenue
↓
TCC receives 10-15% = $50-75
```

**With accurate locations, TCC can suggest MORE profitable backhauls!**

## 🎯 Use Cases

### **Use Case 1: Field Driver**
**Scenario:** Driver just dropped off patient at hospital

**Flow:**
1. Open Route Optimization
2. Select their unit
3. GPS mode (default)
4. Click "Use My Current Location"
5. System shows: "📍 UPMC Presbyterian Hospital"
6. See backhaul opportunities from that location
7. Accept suggested route → TCC earns percentage

### **Use Case 2: Command Center Dispatcher**
**Scenario:** Dispatcher tracking Unit 423, knows it's at UPMC

**Flow:**
1. Open Route Optimization
2. Select Unit 423
3. Switch to "Manual (Dispatch)"
4. Type "UPMC Pres"
5. Click facility from dropdown
6. System shows same location
7. Run optimization for that unit
8. Call driver with suggested backhaul

### **Use Case 3: Custom Address**
**Scenario:** Unit at unknown location (rest stop, gas station, etc.)

**Flow:**
1. Select unit
2. Manual mode
3. Enter address: "123 Main St, Pittsburgh"
4. System geocodes to coordinates
5. Checks for facility match (none found)
6. Still works for optimization!

## 🔐 Data Flow

### **GPS Mode:**
```
Browser → navigator.geolocation
   ↓
Coordinates (lat, lng)
   ↓
checkFacilityMatch()
   ↓
Display matched facility (if any)
   ↓
Pass to optimization API
```

### **Manual Mode (Facility):**
```
User types → Filter facilities
   ↓
User clicks facility
   ↓
Get facility coordinates from DB
   ↓
Set as unitLocation
   ↓
Display facility name
   ↓
Pass to optimization API
```

### **Manual Mode (Address):**
```
User enters address
   ↓
Nominatim API (geocoding)
   ↓
Coordinates (lat, lng)
   ↓
checkFacilityMatch()
   ↓
Display matched facility (if any)
   ↓
Pass to optimization API
```

## 🚀 Testing

### **GPS Mode:**
- [x] GPS button works
- [x] Browser requests permission
- [x] Coordinates display
- [x] Facility matching works
- [x] Shows facility name when matched
- [x] Can change location

### **Manual Mode:**
- [x] Mode toggle switches
- [x] Search filters facilities
- [x] Dropdown shows matches
- [x] Clicking facility sets location
- [x] Address geocoding works
- [x] Facility matching works for addresses
- [x] Can change location

### **Integration:**
- [x] Location passed to optimization API
- [x] Buttons require location
- [x] Works with backhaul analysis
- [x] Works with route optimization
- [x] Facility data loads on mount

## 📝 API Dependencies

### **Internal APIs:**
- `GET /api/tcc/facilities` - Load all facilities for matching
- `GET /api/tcc/units` - Load units
- `POST /api/optimize/routes` - Run optimization (with unitLocation)
- `POST /api/optimize/backhaul` - Backhaul analysis

### **External APIs:**
- **Nominatim (OpenStreetMap)**
  - Free geocoding service
  - No API key required
  - Rate limit: 1 request/second (reasonable for manual entry)
  - Format: `https://nominatim.openstreetmap.org/search?format=json&q=ADDRESS`

## 🎁 Nice-to-Have Future Enhancements

1. **Location History** - Remember last locations for units
2. **Favorite Facilities** - Quick-select common locations
3. **Real-Time Tracking** - Auto-update GPS in background
4. **Map View** - Show unit location on map
5. **Location Suggestions** - "Unit 423 is usually at UPMC around this time"
6. **Batch Location Setting** - Set locations for multiple units at once
7. **Google Maps Integration** - Better geocoding (requires API key)

## ✅ Success Metrics

**Adoption:**
- Field staff use GPS mode
- Command center uses Manual mode
- Both modes used regularly

**Accuracy:**
- High facility match rate
- Low "location not found" errors
- Accurate optimization results

**Revenue:**
- More backhaul suggestions accepted
- Higher TCC commission revenue
- Customer satisfaction with suggestions

---

**Status:** ✅ Production Ready  
**Servers:** Running on ports 3000 (frontend) and 5001 (backend)  
**Test URL:** http://localhost:3000/dashboard/operations/route-optimization  
**Ready For:** Field testing with real EMS customers!

