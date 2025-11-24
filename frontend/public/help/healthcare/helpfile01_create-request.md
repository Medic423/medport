# Create Transport Request

## Overview

The **Create Request** tab allows you to create new transport requests for patients who need to be transported between healthcare facilities or to other destinations. 

**When to use:** Anytime EMS transport, or other transportation services are required.

---

## Quick Start

1. Navigate to the **Create Request** tab in the Healthcare Dashboard
2. Generate Patient ID and fill in the required patient information
3. In Trip Details select the "From, Pickup and To" locations and schedule a time for patient pick-up. 
4. Choose the appropriate Transport and Urgency Levels 
5. Select a Primary Diagnosis and patient Mobility Level
6. Check the boxes for any additional needs such as oxygen.
7. Click the "Create Request" button. 
8. The trip will be created and the "Dispatch Trip to Agencies" screen will be displayed.
9. Choose the "Dispatch Mode."
10. Select the Agencies you want to be notified of the trip. 
11. Click the "Dispatch to Selected Agencies" button.

### Validation
- **Required Fields:** Marked with asterisk (*)
- **Date Validation:** Ensures valid dates and times
- **Address Validation:** Geocoding verifies address accuracy
- **Error Messages:** Clear error messages guide corrections

---

## Step-by-Step Guide

### Step 1: Patient Information

#### Patient ID
- **Auto-generated:** The system automatically generates a unique Patient ID
- **Manual entry:** You can also enter an existing Patient ID manually
- **Format:** Patient IDs are alphanumeric and unique to each trip

#### Patient Details
- **Weight:** Enter patient's weight in kilograms. 
-**Pediatrics:** Select if the patient is a newborn, infant or toddler.
- **Age:** Enter patient's age.

#### Insurance Information 
- **Insurance Company:** Select from dropdown. 
- **Insurance Type:** Medicare, Medicaid, Private, Self-Pay, etc.

**Tip:** Insurance Information can be added or updated in "Hospital Settings"

---

### Step 2: Transport Details

#### Transport Level
Select the appropriate level of care required:

- **BLS (Basic Life Support):** Standard transport without advanced medical equipment
- **ALS (Advanced Life Support):** Requires paramedic-level care and equipment
- **Critical Care:** Requires specialized critical care transport team
- **Neonatal:** Specialized transport for newborns
- **Pediatric:** Specialized transport for pediatric patients

**Tip:** Transport Level's can be added or updated in "Hospital Settings"

#### Urgency Level
Indicate how quickly transport is needed:

- **Routine:** Standard scheduling, no immediate urgency
- **Urgent:** Needs to be scheduled soon, but not immediately
- **STAT:** Immediate transport required
- **Emergency:** Life-threatening situation requiring immediate response

**Tip:** Urgency Level's can be added or updated in "Hospital Settings"

#### Diagnosis 
- Select from the dropdown

**Tip:** Diagnosis can be added or updated in "Hospital Settings"

#### Mobility Level
Select the patient's mobility status:

- **Ambulatory:** Patient can walk
- **Wheelchair:** Patient requires wheelchair assistance
- **Stretcher:** Patient must be transported on stretcher
- **Bed-bound:** Patient cannot be moved from bed
- **Bariatric:** Patient requires special stretcher or ambulance

**Tip:** Mobility Level's can be added or updated in "Hospital Settings"

---

### Step 3: Special Requirements

#### Oxygen Requirements
- Check if patient requires oxygen during transport

#### Monitoring Requirements
- **Cardiac Monitoring:** Continuous ECG monitoring required
- **IV/Medication:** IV access or medication administration during transport
- Ventilator-dependent patients
- Behavioral/psychiatric considerations
- Language interpreter needs
- Other special accommodations

---

### Step 4: Review and Submit

#### Review Checklist
Before submitting, verify:

- ✅ Patient information is complete and accurate
- ✅ Transport level matches patient needs
- ✅ Urgency level is appropriate
- ✅ Special requirements are clearly indicated
- ✅ Locations are correct and geocoded
- ✅ Ready window is realistic

#### Submit Request
- Click **"Create Request"** button
- System validates all required fields and waits three seconds before saving and  moving to trip dispatch
- Request is assigned a Trip Number

---

### Step 4: Dispatch to Agencies

#### Trip Summary
- **Current Facility:** Automatically set to your facility
- **Location Name:** Your facility name is pre-filled
- **Address:** Facility address is automatically included

![Dispatch_Mode](/help/images/healthcare/01d-create_request_dispatch_trip_to_agencies.png)

#### Dispatch Mode
You have three options for displaying the agencies to dispatch trips to:
- **Preferred Providers:** Limits the providers shown to only those designated as Preferred Providers.  
- **Geographic:** Displays all transport providers within a set radius, in miles, of your facility
- **Radius Hybrid:**Displays Preferred Providers and providers who are registered with Tracc or listed in My EMS Providers.
- **Notification Radius (miles)** Adjust this number to either increase or decrease the number of EMS agencies for dispatch. 

#### Available Agencies
- **Preferred:** EMS or other transport providers that have been added in the "My EMS Providers" list. These providers are only show to the healthcare facility that is logged-in. 
- **Registered:**  These agencies have registered with Tracc and are displayed for all healthcare facilities.

#### After Agency Selection 
- You can now dispatch the trip to the selected EMS agencies by clicking the Dispatch to Selected Agencies

#### After Submission
- Request appears in **Transport Requests** tab
- Status is set to **PENDING**

---


## Form Features

### Validation
- **Required Fields:** Marked with asterisk (*)
- **Date Validation:** Ensures valid dates and times
- **Address Validation:** Geocoding verifies address accuracy
- **Error Messages:** Clear error messages guide corrections

---

## Troubleshooting

### Address Not Found
**Problem:** System cannot geocode address

**Solutions:**
- Verify address spelling and format
- Try entering address in parts (street, then city/state/ZIP separately)
- Use facility name + city if address fails
- Contact support if issue persists

### Form Won't Submit
**Problem:** Submit button is disabled or form shows errors

**Solutions:**
- Check for required fields marked with asterisk
- Review error messages at top of form
- Ensure dates/times are valid
- Verify address is geocoded successfully

---

## Related Topics

- [Transport Requests](./transport-requests.md) - View and manage submitted requests
- [Destinations](./destinations.md) - Manage saved destination locations
- [EMS Providers](./ems-providers.md) - View available EMS agencies
- [Hospital Settings](./hospital-settings.md) - Configure default values and preferences

---

## Video Tutorial

**Coming Soon:** Step-by-step video guide for creating transport requests.

---

## Need More Help?

If you need additional assistance:
- Check other help topics in the Help menu
- Contact your system administrator
- Review the [Hospital Settings](./hospital-settings.md) for default configuration options
- Contact Support - support@traccems.com

---

**Last Updated:** December 2025

