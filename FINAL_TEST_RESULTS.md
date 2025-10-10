🧪 Testing End-to-End Trip Data Flow
====================================
🔐 Authenticating EMS user...
✅ EMS login succeeded; user: cmgct0avc0001l4rbufgkdsq1
📡 Checking server status...
✅ Backend server is running on port 5001
✅ Frontend server is running on port 3000

🔍 Test 1: Current trips in database
Found 9 trips in database
📊 Sample trip data:
{
  "tripNumber": "TRP-1759750017685",
  "patientId": "TEST-E2E-001",
  "status": "ACCEPTED",
  "fromLocation": "UPMC Altoona",
  "toLocation": "General Hospital",
  "createdAt": "2025-10-06T11:26:57.687Z"
}

🔍 Test 2: PENDING trips (for EMS Dashboard)
Found 3 PENDING trips
📊 Sample PENDING trip:
{
  "tripNumber": "TRP-1759676911547",
  "patientId": "P71YSBJ2X",
  "status": "PENDING",
  "fromLocation": null,
  "toLocation": null
}

🔍 Test 3: ACCEPTED/IN_PROGRESS/COMPLETED trips (for EMS Dashboard)
Found 6 ACCEPTED/IN_PROGRESS/COMPLETED trips

🔍 Test 4: Creating a new test trip
Creating new trip...
Response: {"success":true,"data":{"id":"cmgf1w8py000362m6ldi4qqwf","tripNumber":"TRP-1759750304038","patientId":"TEST-E2E-001","patientWeight":"180","specialNeeds":"Test end-to-end flow","originFacilityId":null,"destinationFacilityId":null,"fromLocation":"UPMC Altoona","toLocation":"General Hospital","scheduledTime":"2025-09-09T15:00:00.000Z","transportLevel":"BLS","urgencyLevel":"Routine","priority":"LOW","status":"PENDING","specialRequirements":"Test end-to-end flow","diagnosis":"General Medical","mobilityLevel":"Ambulatory","oxygenRequired":false,"monitoringRequired":false,"generateQRCode":false,"qrCodeData":null,"selectedAgencies":[],"notificationRadius":100,"requestTimestamp":"2025-10-06T11:31:44.038Z","acceptedTimestamp":null,"pickupTimestamp":null,"arrivalTimestamp":null,"departureTimestamp":null,"completionTimestamp":null,"pickupLocationId":null,"assignedAgencyId":null,"assignedUnitId":null,"createdById":null,"healthcareCreatedById":null,"isolation":false,"bariatric":false,"notes":"End-to-end test trip","createdAt":"2025-10-06T11:31:44.038Z","updatedAt":"2025-10-06T11:31:44.038Z"}}
✅ New trip created successfully
New trip ID: cmgf1w8py000362m6ldi4qqwf

🔍 Test 5: Verify trip appears in TCC Trips View
Total trips after creation: 10
✅ Trip appears in TCC Trips View

🔍 Test 6: Verify trip appears in EMS Dashboard (PENDING status)
PENDING trips after creation: 4
✅ Trip appears in EMS Dashboard as PENDING

🔍 Test 7: Test trip status update (Accept trip)
Accept response: {"success":true,"message":"Transport request status updated successfully","data":{"id":"cmgf1w8py000362m6ldi4qqwf","tripNumber":"TRP-1759750304038","patientId":"TEST-E2E-001","patientWeight":"180","specialNeeds":"Test end-to-end flow","originFacilityId":null,"destinationFacilityId":null,"fromLocation":"UPMC Altoona","toLocation":"General Hospital","scheduledTime":"2025-09-09T15:00:00.000Z","transportLevel":"BLS","urgencyLevel":"Routine","priority":"LOW","status":"ACCEPTED","specialRequirements":"Test end-to-end flow","diagnosis":"General Medical","mobilityLevel":"Ambulatory","oxygenRequired":false,"monitoringRequired":false,"generateQRCode":false,"qrCodeData":null,"selectedAgencies":[],"notificationRadius":100,"requestTimestamp":"2025-10-06T11:31:44.038Z","acceptedTimestamp":null,"pickupTimestamp":null,"arrivalTimestamp":null,"departureTimestamp":null,"completionTimestamp":null,"pickupLocationId":null,"assignedAgencyId":"cmgct0avc0001l4rbufgkdsq1","assignedUnitId":null,"createdById":null,"healthcareCreatedById":null,"isolation":false,"bariatric":false,"notes":"End-to-end test trip","createdAt":"2025-10-06T11:31:44.038Z","updatedAt":"2025-10-06T11:31:46.090Z","assignedUnit":null,"pickupLocation":null,"originFacility":null,"destinationFacility":null}}
✅ Trip status updated to ACCEPTED successfully

🔍 Test 8: Verify trip appears in EMS Dashboard as ACCEPTED
ACCEPTED/IN_PROGRESS/COMPLETED trips after acceptance: 7
✅ Trip appears in EMS Dashboard as ACCEPTED

🎉 End-to-End Trip Data Flow Test Complete!

📋 Summary:
- Total trips in database: 9
- PENDING trips: 3
- ACCEPTED/IN_PROGRESS/COMPLETED trips: 6

🌐 Next Steps:
1. Open http://localhost:3000 in your browser
2. Login as admin user
3. Navigate to the 'Trips' tab to see the TCC Trips View
4. Login as EMS user (fferguson@movalleyems.com / password123)
5. Check the 'Available Trips' tab to see PENDING trips
6. Test accepting a trip and verify it appears in 'My Trips'
🧪 Testing End-to-End Trip Data Flow
====================================
🔐 Authenticating EMS user...
✅ EMS login succeeded; user: cmgct0avc0001l4rbufgkdsq1
📡 Checking server status...
✅ Backend server is running on port 5001
✅ Frontend server is running on port 3000

🔍 Test 1: Current trips in database
Found 13 trips in database
📊 Sample trip data:
{
  "tripNumber": "TRP-1759754435086",
  "patientId": "SEED-INPROG-001",
  "status": "PENDING",
  "fromLocation": "UPMC Altoona",
  "toLocation": "General Hospital",
  "createdAt": "2025-10-06T12:40:35.087Z"
}

🔍 Test 2: PENDING trips (for EMS Dashboard)
Found 3 PENDING trips
📊 Sample PENDING trip:
{
  "tripNumber": "TRP-1759754435086",
  "patientId": "SEED-INPROG-001",
  "status": "PENDING",
  "fromLocation": "UPMC Altoona",
  "toLocation": "General Hospital"
}

🔍 Test 3: ACCEPTED/IN_PROGRESS/COMPLETED trips (for EMS Dashboard)
Found 9 ACCEPTED/IN_PROGRESS/COMPLETED trips

🔍 Test 4: Creating a new test trip
Creating new trip...
Response: {"success":true,"data":{"id":"cmgf4ez4l000d62m670i27ykd","tripNumber":"TRP-1759754537300","patientId":"TEST-E2E-001","patientWeight":"180","specialNeeds":"Test end-to-end flow","originFacilityId":null,"destinationFacilityId":null,"fromLocation":"UPMC Altoona","toLocation":"General Hospital","scheduledTime":"2025-09-09T15:00:00.000Z","transportLevel":"BLS","urgencyLevel":"Routine","priority":"LOW","status":"PENDING","specialRequirements":"Test end-to-end flow","diagnosis":"General Medical","mobilityLevel":"Ambulatory","oxygenRequired":false,"monitoringRequired":false,"generateQRCode":false,"qrCodeData":null,"selectedAgencies":[],"notificationRadius":100,"requestTimestamp":"2025-10-06T12:42:17.300Z","acceptedTimestamp":null,"pickupTimestamp":null,"arrivalTimestamp":null,"departureTimestamp":null,"completionTimestamp":null,"pickupLocationId":null,"assignedAgencyId":null,"assignedUnitId":null,"createdById":null,"healthcareCreatedById":null,"isolation":false,"bariatric":false,"notes":"End-to-end test trip","createdAt":"2025-10-06T12:42:17.301Z","updatedAt":"2025-10-06T12:42:17.301Z"}}
✅ New trip created successfully
New trip ID: cmgf4ez4l000d62m670i27ykd

🔍 Test 5: Verify trip appears in TCC Trips View
Total trips after creation: 14
✅ Trip appears in TCC Trips View

🔍 Test 6: Verify trip appears in EMS Dashboard (PENDING status)
PENDING trips after creation: 4
✅ Trip appears in EMS Dashboard as PENDING

🔍 Test 7: Test trip status update (Accept trip)
Accept response: {"success":true,"message":"Transport request status updated successfully","data":{"id":"cmgf4ez4l000d62m670i27ykd","tripNumber":"TRP-1759754537300","patientId":"TEST-E2E-001","patientWeight":"180","specialNeeds":"Test end-to-end flow","originFacilityId":null,"destinationFacilityId":null,"fromLocation":"UPMC Altoona","toLocation":"General Hospital","scheduledTime":"2025-09-09T15:00:00.000Z","transportLevel":"BLS","urgencyLevel":"Routine","priority":"LOW","status":"ACCEPTED","specialRequirements":"Test end-to-end flow","diagnosis":"General Medical","mobilityLevel":"Ambulatory","oxygenRequired":false,"monitoringRequired":false,"generateQRCode":false,"qrCodeData":null,"selectedAgencies":[],"notificationRadius":100,"requestTimestamp":"2025-10-06T12:42:17.300Z","acceptedTimestamp":null,"pickupTimestamp":null,"arrivalTimestamp":null,"departureTimestamp":null,"completionTimestamp":null,"pickupLocationId":null,"assignedAgencyId":"cmgct0avc0001l4rbufgkdsq1","assignedUnitId":null,"createdById":null,"healthcareCreatedById":null,"isolation":false,"bariatric":false,"notes":"End-to-end test trip","createdAt":"2025-10-06T12:42:17.301Z","updatedAt":"2025-10-06T12:42:19.351Z","assignedUnit":null,"pickupLocation":null,"originFacility":null,"destinationFacility":null}}
✅ Trip status updated to ACCEPTED successfully

🔍 Test 8: Verify trip appears in EMS Dashboard as ACCEPTED
ACCEPTED/IN_PROGRESS/COMPLETED trips after acceptance: 10
✅ Trip appears in EMS Dashboard as ACCEPTED

🎉 End-to-End Trip Data Flow Test Complete!

📋 Summary:
- Total trips in database: 13
- PENDING trips: 3
- ACCEPTED/IN_PROGRESS/COMPLETED trips: 9

🌐 Next Steps:
1. Open http://localhost:3000 in your browser
2. Login as admin user
3. Navigate to the 'Trips' tab to see the TCC Trips View
4. Login as EMS user (fferguson@movalleyems.com / password123)
5. Check the 'Available Trips' tab to see PENDING trips
6. Test accepting a trip and verify it appears in 'My Trips'
