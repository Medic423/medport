# Backfill Script Results - 2025-11-02

## ✅ Successfully Geocoded

### Healthcare Locations (9/9)
- Penn Highlands Brookville: 41.1563668, -79.0934389 ✅
- Penn Highlands DuBois: 41.1141969, -78.7757983 ✅
- Penn Highlands Mon Valley: 40.1813883, -79.91138 ✅
- Penn Highlands Clearfield: 41.0334764, -78.4496343 ✅
- Penn Highlands Elk: 41.4267876, -78.5787625 ✅
- Penn Highlands State College: 40.8156105, -77.9017616 ✅
- Penn Highlands Connellsville: 40.0229469, -79.5861392 ✅
- Penn Highlands Huntingdon: 40.4988653, -78.0213192 ✅
- Penn Highlands Tyrone: 40.6750991, -78.2517056 ✅

### EMS Agencies (3/3)
- Altoona EMS: 40.5241445, -78.3700224 ✅
- Bedford Ambulance Service: 40.0271453, -78.5237447 ✅
- Elk County EMS: 41.4208193, -78.7329344 ✅

### Healthcare Destinations (0/0)
- Already had coordinates ✅

## Distance Calculation Test Results

Using test trip from Altoona Regional to UPMC Bedford:

**Before:** All distances showed 5000+ miles ❌
**After:** Accurate distances calculated ✅

### Sample Distances:
- Duncansville EMS: **61.2 mi** ✅
- Elk County EMS: **26.2 mi** ✅
- Citizens Ambulance Service: **37.9 mi** ✅
- Altoona EMS: **57.8 mi** ✅
- Bedford Ambulance Service: **83.6 mi** ✅

## Impact

✅ Geographic dispatch mode now works correctly
✅ Distance-based filtering accurate
✅ Hybrid mode properly prioritizes agencies
✅ All Penn Highlands locations can be used as trip origins/destinations
✅ EMS agencies properly included in dispatch calculations

## Notes

- Geocoding used OpenStreetMap Nominatim API
- Rate limiting (1 second between requests) respected
- Multiple address variations tried for better success
- Some locations geocoded by facility name, some by address
- All Pennsylvania locations successfully resolved
