# Create Transport Request

## Overview

The **Create Request** tab allows you to create new transport requests for patients who need to be transported between healthcare facilities. This is the primary way to request EMS transport services in the system.

**When to use:** Use this tab whenever a patient needs to be transported from your facility to another location.

---

## Quick Start

1. Navigate to the **Create Request** tab in the Healthcare Dashboard
2. Fill in the required patient information
3. Select transport details (level, urgency, locations)
4. Set the ready window (when the patient will be ready for transport)
5. Review and submit the request

---

## Step-by-Step Guide

### Step 1: Patient Information

#### Patient ID
- **Auto-generated:** The system can automatically generate a unique Patient ID
- **Manual entry:** You can also enter an existing Patient ID manually
- **Format:** Patient IDs are alphanumeric and unique to each trip

#### Patient Details
- **Patient Name:** Full name of the patient
- **Date of Birth:** Patient's date of birth (used for age calculation)
- **Gender:** Patient's gender
- **Weight:** Patient's weight (important for bariatric considerations)

#### Insurance Information
- **Insurance Company:** Select from dropdown or enter manually
- **Insurance Type:** Medicare, Medicaid, Private, Self-Pay, etc.
- **Policy Number:** Insurance policy number (optional)

---

### Step 2: Transport Details

#### Transport Level
Select the appropriate level of care required:

- **BLS (Basic Life Support):** Standard transport without advanced medical equipment
- **ALS (Advanced Life Support):** Requires paramedic-level care and equipment
- **Critical Care:** Requires specialized critical care transport team
- **Neonatal:** Specialized transport for newborns
- **Pediatric:** Specialized transport for pediatric patients

**Tip:** Select the lowest appropriate level to ensure cost-effective transport while maintaining patient safety.

#### Urgency Level
Indicate how quickly transport is needed:

- **Routine:** Standard scheduling, no immediate urgency
- **Urgent:** Needs to be scheduled soon, but not immediately
- **STAT:** Immediate transport required
- **Emergency:** Life-threatening situation requiring immediate response

**Note:** Higher urgency levels may result in higher costs and may require specific agency capabilities.

#### Diagnosis Codes
- Enter primary diagnosis code (ICD-10 format recommended)
- Additional diagnosis codes can be added if needed
- Diagnosis helps EMS agencies prepare appropriate equipment and personnel

#### Mobility Level
Select the patient's mobility status:

- **Ambulatory:** Patient can walk
- **Wheelchair:** Patient requires wheelchair assistance
- **Stretcher:** Patient must be transported on stretcher
- **Bed-bound:** Patient cannot be moved from bed

---

### Step 3: Special Requirements

#### Special Needs
Select all special needs that apply to this patient from the available checkboxes. Options are configured by your hospital administrator in Hospital Settings -> Category Options -> special-needs.

Common special needs may include:
- **Oxygen Required:** Patient requires oxygen during transport
- **Monitoring Required:** Continuous monitoring needed during transport
- **Ventilator Required:** Patient requires ventilator support
- **Bariatric Stretcher:** Patient requires bariatric-capable transport
- Other needs as configured by your hospital

**Note:** You can select multiple special needs by checking multiple boxes. Selected items will be displayed below the checkboxes for confirmation.

**Important:** Special needs help EMS agencies prepare appropriate equipment and personnel for safe transport.

---

### Step 4: Location Selection

#### From Location
- **Current Facility:** Automatically set to your facility
- **Location Name:** Your facility name is pre-filled
- **Address:** Facility address is automatically included

#### To Location
You have two options:

**Option A: Select from Saved Destinations**
- Click "Select Destination" dropdown
- Choose from your saved destinations
- Address and contact information are automatically filled

**Option B: Manual Entry**
- Click "Enter Address Manually"
- Enter facility name
- Enter complete address (street, city, state, ZIP)
- The system will geocode the address to verify location

**Geocoding:** The system automatically validates and geocodes addresses to ensure accurate routing.

---

### Step 5: Scheduling

#### Ready Window
Set the time window when the patient will be ready for transport:

- **Ready Start Time:** Earliest time patient will be ready
- **Ready End Time:** Latest time patient will be ready
- **Date:** Select the date for transport

**Best Practice:** Provide a realistic window. Too narrow a window may limit agency availability, while too wide a window may delay transport.

#### Scheduling Tips
- **Same-day transport:** Set ready window for today
- **Future transport:** Schedule in advance for better agency availability
- **Flexible timing:** Wider windows allow more agencies to respond

---

### Step 6: Review and Submit

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
- System validates all required fields
- Request is saved and assigned a Trip Number
- QR code is generated automatically

#### After Submission
- Request appears in **Transport Requests** tab
- Status is set to **PENDING**
- You can now dispatch the request to EMS agencies

---

## QR Code Generation

### Automatic QR Code
- A QR code is automatically generated when you create a request
- QR code contains the Trip Number and Patient ID
- QR code can be printed or downloaded

### Using the QR Code
- **Print:** Print QR code for patient identification
- **Download:** Download QR code as image file
- **Scan:** EMS agencies can scan QR code to quickly access trip information

**Tip:** Attach printed QR code to patient paperwork or wristband for easy identification.

---

## Form Features

### Auto-Save (if implemented)
- Form automatically saves draft as you type
- Drafts are restored if you navigate away
- Prevents data loss

### Validation
- **Required Fields:** Marked with asterisk (*)
- **Date Validation:** Ensures valid dates and times
- **Address Validation:** Geocoding verifies address accuracy
- **Error Messages:** Clear error messages guide corrections

### Progress Indicator
- Multi-step form shows progress
- Visual indicator shows which step you're on
- Can navigate between steps before submission

---

## Common Scenarios

### Scenario 1: Routine Discharge
**Situation:** Patient is being discharged and needs transport home.

**Steps:**
1. Enter patient information
2. Select **BLS** transport level
3. Set **Routine** urgency
4. Select home address as destination (may need manual entry)
5. Set ready window for discharge time
6. Submit request

### Scenario 2: STAT Transfer
**Situation:** Patient needs immediate transfer to higher level of care.

**Steps:**
1. Enter patient information quickly
2. Select appropriate **ALS** or **Critical Care** level
3. Set **STAT** urgency
4. Select receiving facility
5. Set immediate ready window
6. Submit and dispatch immediately

### Scenario 3: Isolation Patient
**Situation:** Patient requires isolation precautions.

**Steps:**
1. Complete all standard information
2. **Important:** Check appropriate isolation requirement
3. Add notes about specific isolation needs
4. Ensure receiving facility is aware
5. Submit request

### Scenario 4: Bariatric Patient
**Situation:** Patient exceeds standard stretcher weight capacity.

**Steps:**
1. Enter patient weight
2. Check **Bariatric Transport** requirement
3. System will only show agencies with bariatric capability
4. May require wider ready window for specialized equipment
5. Submit request

---

## Tips and Best Practices

### Data Entry
- **Be thorough:** Complete all relevant fields for best agency matching
- **Be accurate:** Double-check addresses and times
- **Use saved destinations:** Save frequently used locations to speed up entry
- **Check special requirements:** Select all applicable special needs from the checkboxes

### Timing
- **Plan ahead:** Schedule routine transports in advance
- **Realistic windows:** Set achievable ready windows
- **Consider delays:** Account for potential delays in ready window

### Communication
- **Clear notes:** Add notes for any special circumstances
- **Contact information:** Ensure receiving facility contact info is correct
- **Follow-up:** Monitor request status after submission

### Cost Considerations
- **Appropriate level:** Select lowest appropriate transport level
- **Routine vs. STAT:** Use STAT only when truly necessary
- **Distance:** Consider distance when selecting urgency

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

### QR Code Not Generating
**Problem:** QR code doesn't appear after submission

**Solutions:**
- Refresh the page
- Check if request was successfully created
- Try downloading QR code again
- Contact support if issue persists

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

---

**Last Updated:** January 2025

