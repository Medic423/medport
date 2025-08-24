# 🗺️ **Google Maps API Setup & Real-time Tracking Guide**

## **Overview**

This document explains how to set up Google Maps integration for MedPort and how the real-time tracking system works. The system is designed to be flexible and can work with various tracking methods, from simple QR code scans to advanced GPS hardware.

---

## **🔑 Google Maps API Setup**

### **Step 1: Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `medport-maps` (or your preferred name)
4. Click **"Create"**

### **Step 2: Enable Required APIs**

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for and enable these APIs:
   - **Maps JavaScript API** (required for map display)
   - **Places API** (for location search and autocomplete)
   - **Geocoding API** (for address-to-coordinates conversion)
   - **Directions API** (for route planning)

### **Step 3: Create API Key**

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the generated API key
4. **Important**: Click on the API key to configure restrictions:
   - **Application restrictions**: HTTP referrers
   - **API restrictions**: Restrict to only the APIs you enabled above

### **Step 4: Configure Environment Variables**

Create a `.env` file in the `frontend` directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5001/api
VITE_APP_NAME=MedPort
VITE_APP_VERSION=1.0.0

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your-actual-api-key-here

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_REAL_TIME_UPDATES=true

# Development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### **Step 5: Restart Development Server**

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

---

## **📱 Real-time Tracking System Architecture**

### **How It Works**

The real-time tracking system in MedPort is designed to be **hardware-agnostic** and can work with multiple tracking methods:

#### **1. QR Code-Based Tracking** ✅ **IMPLEMENTED**
- **Method**: Crew scans QR code at pickup/dropoff locations
- **Hardware**: Standard smartphone with camera
- **Process**: 
  - Crew scans QR code → Location recorded → Unit status updated
  - No special vehicle hardware required
  - Works with existing smartphones

#### **2. GPS Hardware Tracking** 🔄 **READY FOR INTEGRATION**
- **Method**: Dedicated GPS device in transport vehicle
- **Hardware**: GPS tracker, OBD-II device, or smartphone app
- **Process**: 
  - Device sends location updates via cellular/WiFi
  - Real-time coordinates transmitted to MedPort
  - Automatic location updates every 30 seconds

#### **3. Mobile App Tracking** 🔄 **READY FOR INTEGRATION**
- **Method**: Crew member's phone provides location
- **Hardware**: Crew's smartphone with location services enabled
- **Process**: 
  - Phone GPS sends location when app is active
  - Works in background with permission
  - Battery-efficient location sharing

---

## **🚗 Tracking Implementation Options**

### **Option A: QR Code Only (Current Implementation)**
```
Crew Action → QR Scan → Location Record → Status Update
```
**Pros:**
- ✅ No special hardware needed
- ✅ Works with existing smartphones
- ✅ Simple to implement and maintain
- ✅ Battery efficient
- ✅ Privacy-friendly (only records when scanning)

**Cons:**
- ❌ Only tracks at specific points (pickup/dropoff)
- ❌ No real-time location between points
- ❌ Requires manual crew action

**Use Case**: Perfect for facilities that only need to know when units arrive/depart

### **Option B: GPS Hardware Integration**
```
GPS Device → Cellular/WiFi → MedPort Server → Real-time Map
```
**Pros:**
- ✅ Continuous real-time tracking
- ✅ Accurate location data
- ✅ Works in remote areas
- ✅ Professional fleet management

**Cons:**
- ❌ Requires hardware installation
- ❌ Monthly cellular data costs
- ❌ Hardware maintenance
- ❌ Vehicle-specific installation

**Use Case**: Large fleets, critical medical transport, compliance requirements

### **Option C: Hybrid Approach (Recommended)**
```
QR Codes + Smartphone GPS + Optional Hardware
```
**Pros:**
- ✅ Flexible implementation
- ✅ Cost-effective
- ✅ Works with existing equipment
- ✅ Scalable from small to large operations

**Cons:**
- ❌ More complex setup
- ❌ Multiple tracking methods to manage

**Use Case**: Most medical transport operations

---

## **🔌 Current System Status**

### **What's Already Implemented** ✅
- **Database Models**: GPS tracking, location history, geofence events
- **API Endpoints**: Real-time tracking, location updates, unit status
- **Frontend Components**: Interactive map, real-time dashboard
- **WebSocket Infrastructure**: Real-time communication ready
- **QR Code System**: Location recording at scan points

### **What's Ready for Integration** 🔄
- **GPS Hardware**: API endpoints ready for device integration
- **Mobile Apps**: WebSocket connections ready for app integration
- **CAD Systems**: Event system ready for dispatch integration
- **Geofencing**: Automatic facility arrival detection ready

---

## **📋 Implementation Roadmap**

### **Phase 1: QR Code Tracking (COMPLETED)** ✅
- Crew scans QR codes at facilities
- Location and timestamp recorded
- Unit status updated in real-time
- Map shows unit locations at scan points

### **Phase 2: Smartphone GPS (NEXT)** 🔄
- Crew enables location sharing in MedPort app
- Phone sends GPS coordinates every 30 seconds
- Real-time map updates with unit movement
- Battery-optimized location tracking

### **Phase 3: Hardware Integration (FUTURE)** 📋
- GPS device installation in vehicles
- Automatic location transmission
- Professional fleet management features
- Compliance and reporting tools

---

## **💡 Recommendations for Your Use Case**

### **Start Simple (Recommended)**
1. **Use QR code tracking** for facility arrival/departure
2. **Add smartphone GPS** for crew members who want real-time tracking
3. **Evaluate hardware needs** based on actual usage and requirements

### **Why This Approach Works**
- **No upfront hardware costs**
- **Uses existing smartphones**
- **Easy to implement and test**
- **Scalable as needs grow**
- **Complies with privacy regulations**

### **Hardware Requirements**
- **Minimum**: Smartphone with camera (QR scanning)
- **Enhanced**: Smartphone with GPS (real-time tracking)
- **Professional**: Dedicated GPS devices (fleet management)

---

## **🔧 Technical Implementation Details**

### **Current Tracking Flow**
```
1. Crew scans QR code
2. Location recorded in database
3. WebSocket event sent to all connected clients
4. Map updates in real-time
5. Dashboard shows current unit status
```

### **Future GPS Integration Flow**
```
1. GPS device/app sends location update
2. Location validated and stored
3. WebSocket broadcasts to all clients
4. Map markers move in real-time
5. Geofence events triggered automatically
```

### **Database Schema Ready**
- `GPSTracking`: Current unit locations
- `LocationHistory`: Historical location data
- `GeofenceEvent`: Facility arrival/departure events
- `RouteDeviation`: Off-route alerts
- `ETAUpdate`: Estimated arrival times

---

## **📞 Support & Next Steps**

### **Immediate Actions**
1. **Set up Google Maps API key** (follow steps above)
2. **Test QR code tracking** with existing system
3. **Evaluate tracking needs** for your operation

### **When You're Ready to Test**
1. **Contact the development team** for GPS integration
2. **Define tracking requirements** (real-time vs. point-based)
3. **Choose implementation approach** (QR, GPS, or hybrid)
4. **Plan pilot program** with select units

### **Questions to Consider**
- How often do you need location updates?
- Do you need real-time tracking or just arrival/departure?
- What's your budget for hardware/implementation?
- How many units need tracking?
- What compliance requirements exist?

---

## **📚 Additional Resources**

- **Google Maps API Documentation**: [https://developers.google.com/maps](https://developers.google.com/maps)
- **MedPort API Documentation**: Available in the codebase
- **WebSocket Implementation**: See `backend/src/services/webSocketService.ts`
- **Map Component**: See `frontend/src/components/InteractiveMap.tsx`

---

**Status**: 🎯 **Ready for implementation when you're available**  
**Next Review**: When you're ready to test tracking features  
**Priority**: Low (can wait until you're available)
