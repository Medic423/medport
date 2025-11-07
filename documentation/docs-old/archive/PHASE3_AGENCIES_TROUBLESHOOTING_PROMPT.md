# TCC Phase 3 - Agencies Troubleshooting Session

## 🎯 **CURRENT ISSUE TO RESOLVE**
The Enhanced Trip Form is not displaying EMS agencies in the "Available Agencies" section. The form shows "No agencies available within the specified radius" even though agencies exist in the database.

## 📋 **PROJECT STATUS SUMMARY**

### ✅ **COMPLETED FEATURES**
- **Enhanced Trip Form**: 5-step multi-step form with all enhanced fields
- **Cancel Button**: Added to allow users to exit form and return to dashboard
- **Destination Mode Toggle**: Users can select from dropdown OR manually enter destinations
- **Generate ID Button**: Auto-generates random patient IDs
- **Database Architecture**: Multi-siloed PostgreSQL setup (Center, EMS, Hospital)
- **Authentication**: Both TCC admin and Healthcare facility login working
- **Agencies API**: Fixed to use EMS database instead of Center database
- **Test Data**: Created test agencies in EMS database

### 🔧 **CURRENT TECHNICAL SETUP**

**Database Configuration:**
- **Center Database**: `tcc_center` (TCC admin users, trips)
- **EMS Database**: `tcc_ems` (EMS agencies, transport requests)
- **Hospital Database**: `tcc_hospital` (Healthcare users, transport requests)

**Working Credentials:**
- **TCC Admin**: `admin@tcc.com` / `admin123`
- **Healthcare**: `admin@altoonaregional.org` / `upmc123`

**Test Agencies Created:**
- Altoona Regional EMS
- Blair County EMS
- Penn Highlands EMS
- UPMC Central PA EMS

## 🐛 **CURRENT PROBLEM**

### **Issue Description:**
The Enhanced Trip Form's "Available Agencies" section shows "No agencies available within the specified radius" even though:
1. Agencies exist in the EMS database
2. The agencies API (`/api/tcc/agencies`) returns the test agencies
3. The form loads facilities correctly for destination dropdown

### **Error Analysis:**
From backend logs, the issue appears to be in the `getAgenciesForHospital` method:
```
TCC_DEBUG: Error getting agencies for hospital: Error: Hospital location not found
```

### **Root Cause:**
The `getAgenciesForHospital` method in `tripService.ts` is looking for hospitals with latitude/longitude coordinates, but the hospitals in the database don't have location data.

## 🔍 **FILES TO INVESTIGATE**

### **Key Files:**
1. **`backend/src/services/tripService.ts`** - `getAgenciesForHospital` method (lines ~470-510)
2. **`frontend/src/components/EnhancedTripForm.tsx`** - Agency loading logic
3. **`backend/src/routes/trips.ts`** - Agency filtering endpoint
4. **Database schemas** - Check hospital model for location fields

### **Database Queries to Run:**
```sql
-- Check if hospitals have location data
SELECT id, name, latitude, longitude FROM "Hospital" WHERE latitude IS NOT NULL;

-- Check agencies exist
SELECT id, name, latitude, longitude FROM "eMSAgency" WHERE "isActive" = true;
```

## 🎯 **IMMEDIATE TASKS**

### **Priority 1: Fix Agency Display**
1. **Check Hospital Location Data**: Verify hospitals have latitude/longitude
2. **Fix getAgenciesForHospital**: Update method to handle missing location data
3. **Test Agency Loading**: Verify agencies appear in form when hospital is selected

### **Priority 2: Complete Form Functionality**
1. **Test Manual Destinations**: Ensure out-of-state trips work
2. **Test Agency Selection**: Verify agencies can be selected for in-state trips
3. **Test Trip Creation**: Ensure enhanced trips save to all three databases

## 🚀 **QUICK START COMMANDS**

### **Start Development Environment:**
```bash
# Backend
cd /Users/scooper/Code/tcc-new-project/backend
npm start

# Frontend (in new terminal)
cd /Users/scooper/Code/tcc-new-project/frontend
npm run dev
```

### **Test APIs:**
```bash
# Test agencies API
curl -H "Authorization: Bearer $(curl -s -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@tcc.com","password":"admin123"}' | jq -r '.token')" http://localhost:5001/api/tcc/agencies

# Test healthcare login
curl -X POST http://localhost:5001/api/auth/healthcare/login -H "Content-Type: application/json" -d '{"email":"admin@altoonaregional.org","password":"upmc123"}'
```

### **Database Access:**
```bash
# EMS Database (agencies)
npx prisma studio --schema=prisma/schema-ems.prisma --port 5556

# Center Database (hospitals)
npx prisma studio --schema=prisma/schema-center.prisma --port 5557
```

## 📊 **EXPECTED BEHAVIOR**

### **Working Flow:**
1. User logs into Healthcare dashboard
2. Clicks "Create New Trip"
3. Fills out patient information
4. Selects destination (dropdown or manual)
5. **Agencies should appear** in Step 4 if destination is from dropdown
6. User can select agencies or proceed with broadcast
7. Trip is created and synced to all three databases

### **Current Broken Flow:**
- Step 5 fails: "No agencies available within the specified radius"

## 🔧 **DEBUGGING APPROACH**

### **Step 1: Verify Data**
- Check if hospitals have location coordinates
- Verify agencies have location coordinates
- Confirm agencies are active

### **Step 2: Fix Location Logic**
- Update `getAgenciesForHospital` to handle missing hospital locations
- Add fallback logic for when hospital location is unknown
- Consider using default radius or all agencies

### **Step 3: Test Integration**
- Test with hospital that has location data
- Test with hospital that lacks location data
- Verify frontend displays agencies correctly

## 📝 **NOTES**

- **Backup Created**: `/Volumes/Acasis/tcc-phase3-complete-20250908_174937.tar.gz`
- **Git Status**: All work committed and pushed to main branch
- **Current Branch**: `main` (phase-3-advanced-features merged)
- **Last Working**: Agencies API returns data, but form doesn't display them

## 🎯 **SUCCESS CRITERIA**

1. ✅ Agencies appear in Enhanced Trip Form when hospital is selected
2. ✅ Manual destinations work for out-of-state transport
3. ✅ Agency selection works for in-state transport
4. ✅ Enhanced trips save to all three databases
5. ✅ Form can be cancelled and return to dashboard

---

**Ready to troubleshoot! The main issue is that hospitals don't have location data, causing the agency filtering to fail.**

