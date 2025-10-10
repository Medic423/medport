# Revenue Calculation Settings - User Guide

## Overview

The Revenue Calculation Settings feature allows you to analyze the financial impact of transport requests and optimize revenue through advanced calculation methods, backhaul route analysis, and what-if scenario planning. This guide will walk you through the complete workflow from creating a trip to analyzing its revenue potential.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating a Transport Request](#creating-a-transport-request)
3. [Accessing Revenue Settings](#accessing-revenue-settings)
4. [Understanding Revenue Calculation Methods](#understanding-revenue-calculation-methods)
5. [Analyzing Trip Revenue](#analyzing-trip-revenue)
6. [Backhaul Route Analysis](#backhaul-route-analysis)
7. [What-If Scenario Planning](#what-if-scenario-planning)
8. [Real-time Optimization](#real-time-optimization)
9. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Admin or Healthcare user account
- Access to the TCC (Transport Coordination Center) system
- Basic understanding of transport levels (BLS, ALS, CCT)

### Login

1. Navigate to the TCC system
2. Log in with your credentials:
   - **Admin**: `admin@tcc.com` / `admin123`
   - **Healthcare**: Use your facility credentials

## Creating a Transport Request

Before analyzing revenue, you need to create a transport request. This serves as the basis for your revenue analysis.

### Step 1: Access Trip Creation

1. From the main dashboard, click **"Create Trip"** or **"New Transport Request"**
2. You'll see the Enhanced Trip Form with 5 steps

### Step 2: Patient Information

1. **Patient ID**: Enter a unique identifier or click "Generate ID" for automatic generation
2. **Patient Weight**: Enter weight in kilograms (optional)
3. **Insurance Company**: Select from dropdown (affects revenue calculations)
4. **Special Needs**: Enter any special requirements

### Step 3: Trip Details

1. **From Location**: Enter origin facility (pre-filled for healthcare users)
2. **To Location**: 
   - **Option A**: Select from facility list (recommended for backhaul analysis)
   - **Option B**: Enter manually (limited analysis capabilities)
3. **Scheduled Time**: Set pickup time
4. **Transport Level**: Choose BLS, ALS, or CCT
5. **Urgency Level**: Select Routine, Urgent, or Emergency

### Step 4: Clinical Information

1. **Primary Diagnosis**: Select from dropdown
2. **Mobility Level**: Choose patient mobility status
3. **Oxygen Required**: Check if needed
4. **Monitoring Required**: Check if continuous monitoring needed

### Step 5: Agency Selection

1. **Notification Radius**: Set search radius (10-200 miles)
2. **Available Agencies**: Review and select agencies within radius
3. **Review & Submit**: Confirm all details

## Accessing Revenue Settings

1. From the main dashboard, click **"Revenue Settings"** in the navigation
2. You'll see several sections:
   - Revenue Calculation Settings
   - Real-time Optimization Widget
   - What-if Scenario Panel

## Understanding Revenue Calculation Methods

The system uses multiple calculation methods to determine trip revenue:

### Base Revenue Calculation

- **BLS (Basic Life Support)**: $150 base rate
- **ALS (Advanced Life Support)**: $250 base rate  
- **CCT (Critical Care Transport)**: $400 base rate

### Priority Multipliers

- **Routine**: 1.0x (no multiplier)
- **Urgent**: 1.1x (+10%)
- **Emergency**: 1.25x (+25%)
- **Critical**: 1.5x (+50%)

### Distance-Based Revenue

- **Mileage Rate**: $2.50 per mile
- **Minimum Distance**: 5 miles
- **Maximum Distance**: 200 miles

### Additional Revenue Factors

- **Oxygen Required**: +$25
- **Monitoring Required**: +$50
- **Special Equipment**: +$75
- **Weekend/Holiday**: +20%

## Analyzing Trip Revenue

### Current Limitation

**Important**: The current system does not have a direct trip selection interface for revenue analysis. Instead, it uses sample data and what-if scenarios.

### Workaround: Using What-If Scenarios

1. **Access What-If Panel**: Scroll down to the "What-if Scenario" section
2. **Enter Trip Details**:
   - **Unit IDs**: Leave blank for auto-selection
   - **Request IDs**: Leave blank for auto-selection
3. **Set Analysis Parameters**:
   - **Deadhead Mile Weight**: 0.3 (default)
   - **Loaded Mile Weight**: 0.7 (default)
   - **Time Efficiency Weight**: 0.5 (default)
   - **Customer Satisfaction Weight**: 0.4 (default)

### Running Analysis

1. Click **"Run What-If Analysis"**
2. The system will:
   - Generate sample trip data
   - Calculate revenue based on current settings
   - Show optimization recommendations
   - Display potential backhaul opportunities

## Backhaul Route Analysis

### What is Backhaul Analysis?

Backhaul analysis identifies opportunities to pair transport requests for increased revenue and efficiency. The system automatically:

1. **Finds Compatible Trips**: Looks for trips with compatible transport levels
2. **Calculates Distance**: Measures distance between destinations
3. **Time Window Analysis**: Ensures trips can be completed within time constraints
4. **Revenue Optimization**: Identifies the most profitable pairings

### Backhaul Criteria

- **Maximum Distance**: 15 miles between destinations
- **Time Window**: 90 minutes between ready times
- **Transport Compatibility**:
  - BLS can pair with BLS
  - ALS can pair with ALS or BLS
  - CCT can pair with any level

### Return Trip Analysis

The system specifically looks for return trip opportunities (e.g., Altoona → Pittsburgh → Altoona):

- **Distance Bonus**: 50% additional revenue for return trips
- **Efficiency Score**: Higher efficiency for return routes
- **Revenue Potential**: Up to 20% bonus based on efficiency

### Example Backhaul Scenario

**Trip 1**: Altoona Regional → UPMC Pittsburgh (ALS, Urgent)
**Trip 2**: UPMC Pittsburgh → Altoona Regional (BLS, Routine)

**Analysis**:
- Distance: 8.2 miles (within 15-mile limit)
- Time Window: 45 minutes (within 90-minute limit)
- Compatibility: ALS + BLS (compatible)
- Revenue Bonus: $37.50 (50% bonus for return trip)
- Total Revenue: $312.50 + $165.00 + $37.50 = $515.00

## What-If Scenario Planning

### Purpose

What-if scenarios allow you to test different parameters and see their impact on revenue without affecting actual operations.

### Available Parameters

1. **Deadhead Mile Weight** (α): 0.0 - 1.0
   - Higher values prioritize reducing empty miles
   - Default: 0.3

2. **Loaded Mile Weight** (β): 0.0 - 1.0
   - Higher values prioritize revenue-generating miles
   - Default: 0.7

3. **Time Efficiency Weight** (γ): 0.0 - 1.0
   - Higher values prioritize faster response times
   - Default: 0.5

4. **Customer Satisfaction Weight** (δ): 0.0 - 1.0
   - Higher values prioritize customer experience
   - Default: 0.4

### Running Scenarios

1. **Adjust Parameters**: Use sliders or input fields
2. **Set Constraints**:
   - **Unit IDs**: Specify particular units (optional)
   - **Request IDs**: Specify particular requests (optional)
3. **Click "Run What-If Analysis"**
4. **Review Results**: Compare with baseline scenario

### Interpreting Results

- **Revenue Impact**: Shows potential revenue change
- **Efficiency Score**: Overall optimization rating
- **Recommendations**: Suggested parameter adjustments
- **Backhaul Opportunities**: Identified pairing opportunities

## Real-time Optimization

### Live Optimization Widget

The Real-time Optimization widget provides live updates on:

- **Total Trips**: Current trip count
- **Completed Trips**: Successfully finished trips
- **Average Response Time**: Current response performance
- **Average Trip Time**: Average completion time
- **Total Revenue**: Current revenue generated
- **Efficiency**: Overall system efficiency
- **Customer Satisfaction**: Current satisfaction rating

### Controls

- **Pause/Resume**: Toggle real-time updates
- **Status Indicator**: Shows connection status
- **Last Updated**: Timestamp of latest data

## Troubleshooting

### Common Issues

#### "Real-time Optimization Disconnected"
- **Cause**: Authentication or connection issues
- **Solution**: Refresh the page and log in again
- **Prevention**: Ensure stable internet connection

#### What-If Analysis Not Working
- **Cause**: Invalid parameters or system overload
- **Solution**: 
  1. Check parameter values (0.0 - 1.0 range)
  2. Wait for current analysis to complete
  3. Try with default parameters first

#### No Backhaul Opportunities Found
- **Cause**: Insufficient trip data or strict criteria
- **Solution**:
  1. Check if there are pending trips
  2. Adjust backhaul criteria in system settings
  3. Wait for more trip data to accumulate

### Getting Help

1. **Check System Status**: Look for error messages in the interface
2. **Review Parameters**: Ensure all values are within valid ranges
3. **Contact Support**: Use the system's help feature or contact your administrator

## Best Practices

### For Revenue Optimization

1. **Regular Analysis**: Run what-if scenarios weekly
2. **Parameter Tuning**: Start with defaults, adjust gradually
3. **Monitor Trends**: Watch real-time optimization metrics
4. **Backhaul Focus**: Prioritize return trip opportunities

### For Trip Creation

1. **Use Facility List**: Select destinations from the list for better analysis
2. **Accurate Information**: Provide complete clinical details
3. **Appropriate Urgency**: Set realistic urgency levels
4. **Insurance Information**: Include for accurate revenue calculations

### For System Performance

1. **Stable Connection**: Ensure reliable internet access
2. **Regular Updates**: Keep the system updated
3. **Data Quality**: Maintain accurate facility and agency information
4. **User Training**: Ensure all users understand the system

## Advanced Features

### Custom Revenue Models

The system supports custom revenue models through:
- **Insurance-Specific Rates**: Different rates per insurance company
- **Facility Partnerships**: Special rates for partner facilities
- **Seasonal Adjustments**: Time-based rate modifications
- **Geographic Pricing**: Location-based rate variations

### Integration Capabilities

- **EMR Integration**: Direct patient data import
- **Billing Systems**: Automated invoice generation
- **Analytics Platforms**: Data export for external analysis
- **Reporting Tools**: Custom report generation

## Conclusion

The Revenue Calculation Settings provide powerful tools for optimizing transport operations and maximizing revenue. By understanding the various calculation methods, backhaul analysis, and what-if scenarios, you can make informed decisions that improve both financial performance and operational efficiency.

Remember to regularly review and adjust parameters based on your organization's specific needs and operational patterns. The system is designed to learn and improve over time as more data becomes available.

---

*For technical support or feature requests, contact your system administrator or the TCC development team.*
