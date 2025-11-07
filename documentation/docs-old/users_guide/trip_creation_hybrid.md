# Trip Creation Hybrid Selection System

## Overview

The TCC system supports two different approaches for agency selection during trip creation, giving hospitals flexibility to choose the most appropriate method for each transport request.

## Selection Modes

### **Broadcast Mode** (New)
- Trip is sent to all agencies within a specified radius
- Agencies respond with ACCEPTED or DECLINED
- Hospital reviews all responses and selects preferred agency
- Best for: Emergency trips, maximum coverage, competitive responses

### **Specific Agencies Mode** (Current)
- Hospital pre-selects specific agencies during trip creation
- Only selected agencies receive notifications
- Selected agencies can only accept or decline
- Best for: Routine trips, known capabilities, established relationships

## Trip Creation Workflow

### Step 4: Agency Selection Method

When creating a transport request, hospitals will choose between two selection modes:

#### **Option 1: Broadcast to All Agencies**
```
✅ Broadcast to all agencies in area
   - Agencies respond with accept/decline
   - You choose from responders
   - Maximum coverage and competitive responses
```

**Settings for Broadcast Mode:**
- **Notification Radius**: Distance in miles to search for agencies
- **Maximum Responses**: Limit number of agencies that can respond
- **Response Deadline**: Time limit for agency responses (e.g., 15 minutes)

#### **Option 2: Select Specific Agencies**
```
✅ Select specific agencies
   - Only selected agencies can respond
   - Current workflow
   - Known capabilities and established relationships
```

**Settings for Specific Agencies Mode:**
- **Agency Selection**: Choose from list of available agencies
- **Multiple Selection**: Can select multiple agencies
- **Capability Filtering**: Filter agencies by transport level (BLS, ALS, CCT)

## How Each Mode Works

### **Broadcast Mode Workflow**

1. **Trip Creation**
   - Hospital creates trip with broadcast settings
   - System identifies all agencies within radius
   - Trip is sent to all qualifying agencies

2. **Agency Response Phase**
   - Agencies receive notification
   - Agencies respond with ACCEPTED/DECLINED
   - Optional: Agencies can add response notes and estimated arrival time

3. **Hospital Selection Phase**
   - Hospital reviews all responses
   - Hospital sees response timeline and agency details
   - Hospital selects preferred agency from responders

4. **Assignment Completion**
   - Selected agency is notified of assignment
   - Other agencies are notified they were not selected
   - Trip status updates to ACCEPTED

### **Specific Agencies Mode Workflow**

1. **Trip Creation**
   - Hospital creates trip and selects specific agencies
   - System sends notifications only to selected agencies

2. **Agency Response Phase**
   - Selected agencies receive notification
   - Agencies respond with ACCEPTED/DECLINED
   - First agency to accept gets the trip

3. **Assignment Completion**
   - Trip is automatically assigned to first accepting agency
   - Other agencies are notified trip is no longer available

## When to Use Each Mode

### **Use Broadcast Mode When:**
- **Emergency trips** - Need fastest possible response
- **New areas** - Unfamiliar with local agencies
- **Competitive pricing** - Want to compare agency responses
- **Maximum coverage** - Need to ensure trip gets covered
- **Time-sensitive** - Multiple agencies increases success rate

### **Use Specific Agencies Mode When:**
- **Routine trips** - Regular transport with known agencies
- **Specialized requirements** - Need specific capabilities
- **Established relationships** - Prefer working with known agencies
- **Cost control** - Have preferred pricing arrangements
- **Quality assurance** - Want to use trusted providers

## Response Management

### **Hospital Dashboard - Response View**

When using broadcast mode, hospitals will see:

#### **Response Summary**
- Total agencies notified
- Number of responses received
- Response breakdown (accepted vs declined)
- Time remaining for responses

#### **Response Timeline**
- Chronological list of all responses
- Agency details and response notes
- Response timestamps
- Estimated arrival times

#### **Agency Selection Interface**
- Side-by-side comparison of accepting agencies
- Agency performance metrics
- Response time and notes
- One-click selection

### **Agency Dashboard - Response Interface**

Agencies will see enhanced response options:

#### **Response Form**
- Accept/Decline buttons
- Optional response notes field
- Estimated arrival time picker
- Response confirmation

#### **Response History**
- All responses made by the agency
- Response status (selected/not selected)
- Trip outcome tracking

## Benefits of Hybrid System

### **Flexibility**
- Choose the right approach for each trip
- Adapt to different situations and requirements
- Maintain existing workflows while adding new capabilities

### **Improved Coverage**
- Broadcast mode ensures trips get covered
- Multiple agencies increase success rate
- Better geographic coverage

### **Competitive Advantage**
- Agencies compete for trips
- Better response times
- Potential cost savings

### **Data Insights**
- Track agency performance
- Analyze response patterns
- Optimize selection strategies

## Migration and Compatibility

### **Existing Workflows**
- Current specific agencies mode continues unchanged
- No disruption to existing users
- Gradual adoption of broadcast mode

### **User Training**
- Minimal training required for specific agencies mode
- Additional training for broadcast mode features
- Documentation and tutorials provided

### **System Performance**
- Both modes use same underlying infrastructure
- Optimized for high-volume response handling
- Real-time updates and notifications

## Future Enhancements

### **Smart Recommendations**
- System suggests best mode based on trip characteristics
- Historical performance data
- Machine learning optimization

### **Advanced Filtering**
- Filter agencies by response time
- Filter by cost or quality metrics
- Geographic preferences

### **Automated Selection**
- Auto-select based on predefined criteria
- Performance-based automatic assignment
- Escalation rules for unresponsive agencies

This hybrid system provides hospitals with the flexibility to choose the most appropriate agency selection method for each transport request while maintaining the reliability and familiarity of the existing system.
