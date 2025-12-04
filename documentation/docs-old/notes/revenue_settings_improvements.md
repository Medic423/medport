# Revenue Settings Enhancement Plan

<<<<<<< HEAD
## 📊 Progress Summary
- **Phase 1 (Crew Cost Management)**: ✅ **COMPLETED** - All crew cost tracking, vehicle costs, and profitability analysis implemented
- **Phase 2 (Advanced Pricing Models)**: ✅ **COMPLETED** - Time-based, geographic, and service-specific pricing
- **Phase 3 (Route Optimization Parameters)**: ✅ **COMPLETED** - Optimization weights, constraints, and real-time preview
- **Phase 4 (Cost Analysis & Profitability)**: ✅ **COMPLETED** - Detailed cost breakdowns and analysis
- **Phase 5 (Real-time Optimization)**: ✅ **COMPLETED** - Live optimization engine and what-if scenarios

=======
>>>>>>> 013b3748 (docs: Add comprehensive revenue settings enhancement plan)
## Overview
Based on the revenue routes analysis document (`2_revenue_routes_af.md`) and our current database schema, this plan outlines comprehensive enhancements to the revenue calculation system to support advanced route optimization and cost modeling.

## Current State Analysis

### Existing Revenue Fields (Trip Model)
- `tripCost` - Basic trip cost calculation
- `distanceMiles` - Total trip distance
- `loadedMiles` - Revenue-generating miles
- `deadheadMiles` - Empty return miles
- `perMileRate` - Per-mile pricing
- `insurancePayRate` - Insurance-specific rates
- `revenuePerHour` - Revenue efficiency metric

### Existing Revenue Settings (Frontend)
- Base rates by transport level (BLS/ALS/CCT)
- Per-mile rates by transport level
- Priority multipliers (LOW/MEDIUM/HIGH/URGENT)
- Special requirements surcharge
- Insurance rate multipliers (Medicare/Medicaid/Private)

## Recommended Enhancements

### 1. Crew Cost Management

#### Database Schema Additions
**Unit Model Enhancements:**
```prisma
model Unit {
  // ... existing fields ...
  
  // Crew Cost Fields
  crewSize                Int?       // Number of crew members
  crewComposition         Json?      // Array of crew roles and certifications
  baseHourlyRate          Decimal?   @db.Decimal(8,2)  // Base crew cost per hour
  overtimeMultiplier      Decimal?   @db.Decimal(3,2)  // Overtime rate multiplier
  shiftLengthHours        Decimal?   @db.Decimal(4,2)   // Standard shift length
  maxOvertimeHours        Decimal?   @db.Decimal(4,2)   // Maximum overtime allowed
  
  // Operational Costs
  vehicleCostPerMile      Decimal?   @db.Decimal(6,2)   // Vehicle operational cost per mile
  fuelCostPerMile         Decimal?   @db.Decimal(6,2)   // Fuel cost per mile
  maintenanceCostPerMile  Decimal?   @db.Decimal(6,2)   // Maintenance cost per mile
  
  // Location & Staging
  homeBaseLocation        Json?      // Home base coordinates
  stagingLocations        Json?      // Array of staging locations
  maxServiceRadius        Decimal?   @db.Decimal(6,2)   // Maximum service radius in miles
  interceptCapability     Boolean    @default(false)    // Can perform intercepts
}
```

**Crew Role Model (New):**
```prisma
model CrewRole {
  id                String   @id @default(cuid())
  roleName          String   // EMT, Paramedic, RN, CCT Specialist
  certificationLevel String  // BLS, ALS, CCT, RN, etc.
  hourlyRate        Decimal  @db.Decimal(8,2)
  overtimeMultiplier Decimal @db.Decimal(3,2)
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@map("crew_roles")
}
```

#### Revenue Settings Enhancements
**Crew Cost Configuration:**
- Base hourly rates by crew role (EMT, Paramedic, RN, CCT Specialist)
- Overtime multipliers and rules
- Shift length configurations
- Crew composition requirements by transport level

### 2. Advanced Pricing Models

#### Database Schema Additions
**Pricing Model (New):**
```prisma
model PricingModel {
  id                    String   @id @default(cuid())
  agencyId              String?  // Agency-specific pricing
  name                  String   // Model name (e.g., "Standard", "Peak Hours")
  isActive              Boolean  @default(true)
  
  // Base Pricing
  baseRates             Json     // Transport level base rates
  perMileRates          Json     // Per-mile rates by transport level
  priorityMultipliers   Json     // Priority-based multipliers
  
  // Time-based Pricing
  peakHourMultipliers   Json     // Time-of-day multipliers
  weekendMultipliers    Json     // Weekend/holiday multipliers
  seasonalMultipliers   Json     // Seasonal pricing adjustments
  
  // Geographic Pricing
  zoneMultipliers       Json     // Geographic zone multipliers
  distanceTiers         Json     // Distance-based pricing tiers
  
  // Service-specific Pricing
  specialRequirements   Json     // Special equipment/needs pricing
  isolationPricing      Decimal? @db.Decimal(8,2)
  bariatricPricing      Decimal? @db.Decimal(8,2)
  oxygenPricing         Decimal? @db.Decimal(8,2)
  monitoringPricing     Decimal? @db.Decimal(8,2)
  
  // Insurance-specific Rates
  insuranceRates        Json     // Insurance company specific rates
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@map("pricing_models")
}
```

#### Revenue Settings Enhancements
**Advanced Pricing Controls:**
- Time-based pricing (peak hours, weekends, holidays)
- Geographic zone pricing
- Distance tier pricing
- Service-specific surcharges
- Dynamic pricing based on demand

### 3. Route Optimization Parameters

#### Database Schema Additions
**Route Optimization Settings (New):**
```prisma
model RouteOptimizationSettings {
  id                    String   @id @default(cuid())
  agencyId              String?  // Agency-specific settings
  
  // Optimization Weights
  deadheadMileWeight    Decimal  @db.Decimal(5,2)  // α - penalty for deadhead miles
  waitTimeWeight        Decimal  @db.Decimal(5,2)  // β - penalty for wait time
  backhaulBonusWeight   Decimal  @db.Decimal(5,2)  // γ - bonus for backhaul pairs
  overtimeRiskWeight    Decimal  @db.Decimal(5,2)  // δ - penalty for overtime risk
  revenueWeight         Decimal  @db.Decimal(5,2)  // Revenue optimization weight
  
  // Constraints
  maxDeadheadMiles      Decimal  @db.Decimal(6,2)  // Maximum deadhead miles
  maxWaitTimeMinutes    Int      // Maximum wait time
  maxOvertimeHours      Decimal  @db.Decimal(4,2)  // Maximum overtime allowed
  maxBackhaulDistance   Decimal  @db.Decimal(6,2)  // Maximum backhaul distance
  maxBackhaulTimeWindow Int      // Maximum backhaul time window (minutes)
  
  // Backhaul Optimization
  backhaulTimeWindow    Int      // Time window for backhaul pairing (minutes)
  backhaulDistanceLimit Decimal  @db.Decimal(6,2)  // Maximum distance for backhaul
  backhaulRevenueBonus  Decimal  @db.Decimal(8,2)  // Base bonus for backhaul pairs
  
  // Performance Targets
  targetLoadedMileRatio Decimal  @db.Decimal(3,2)  // Target loaded mile ratio (0.0-1.0)
  targetRevenuePerHour  Decimal  @db.Decimal(8,2)  // Target revenue per hour
  targetResponseTime    Int      // Target response time (minutes)
  
  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@map("route_optimization_settings")
}
```

#### Revenue Settings Enhancements
**Route Optimization Controls:**
- Optimization weight sliders (deadhead, wait time, backhaul, overtime)
- Constraint settings (max distances, times, overtime limits)
- Backhaul pairing parameters
- Performance target settings

### 4. Cost Analysis & Profitability

#### Database Schema Additions
**Trip Cost Breakdown (New):**
```prisma
model TripCostBreakdown {
  id                    String   @id @default(cuid())
  tripId                String   // Reference to Trip
  
  // Revenue Components
  baseRevenue           Decimal  @db.Decimal(10,2)
  mileageRevenue        Decimal  @db.Decimal(10,2)
  priorityRevenue       Decimal  @db.Decimal(10,2)
  specialRequirementsRevenue Decimal @db.Decimal(10,2)
  insuranceAdjustment   Decimal  @db.Decimal(10,2)
  totalRevenue          Decimal  @db.Decimal(10,2)
  
  // Cost Components
  crewLaborCost         Decimal  @db.Decimal(10,2)
  vehicleCost           Decimal  @db.Decimal(10,2)
  fuelCost              Decimal  @db.Decimal(10,2)
  maintenanceCost       Decimal  @db.Decimal(10,2)
  overheadCost          Decimal  @db.Decimal(10,2)
  totalCost             Decimal  @db.Decimal(10,2)
  
  // Profitability Metrics
  grossProfit           Decimal  @db.Decimal(10,2)
  profitMargin          Decimal  @db.Decimal(5,2)  // Percentage
  revenuePerMile        Decimal  @db.Decimal(8,2)
  costPerMile           Decimal  @db.Decimal(8,2)
  
  // Efficiency Metrics
  loadedMileRatio       Decimal  @db.Decimal(3,2)
  deadheadMileRatio     Decimal  @db.Decimal(3,2)
  utilizationRate       Decimal  @db.Decimal(3,2)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@map("trip_cost_breakdowns")
}
```

#### Revenue Settings Enhancements
**Cost Analysis Controls:**
- Overhead cost allocation methods
- Fuel cost tracking and adjustment
- Maintenance cost per mile settings
- Profit margin targets
- Cost center allocation

### 5. Real-time Revenue Optimization

#### Database Schema Additions
**Revenue Optimization Engine (New):**
```prisma
model RevenueOptimizationRun {
  id                    String   @id @default(cuid())
  agencyId              String?  // Agency-specific run
  
  // Run Parameters
  optimizationType      String   // "REAL_TIME", "DAILY_PLAN", "WHAT_IF"
  timeWindow            String   // "1H", "4H", "8H", "24H"
  includedTrips         String[] // Array of trip IDs included
  
  // Optimization Results
  totalRevenue          Decimal  @db.Decimal(12,2)
  totalCost             Decimal  @db.Decimal(12,2)
  netProfit             Decimal  @db.Decimal(12,2)
  loadedMileRatio       Decimal  @db.Decimal(3,2)
  backhaulPairs         Int
  averageResponseTime   Decimal  @db.Decimal(5,2)
  
  // Optimization Settings Used
  settingsSnapshot      Json     // Snapshot of settings used
  
  // Performance Metrics
  optimizationTimeMs    Int      // Time taken to optimize (milliseconds)
  tripsOptimized        Int      // Number of trips optimized
  unitsUtilized         Int      // Number of units utilized
  
  createdAt             DateTime @default(now())
  
  @@map("revenue_optimization_runs")
}
```

#### Revenue Settings Enhancements
**Real-time Optimization Controls:**
- Optimization frequency settings
- Real-time vs. batch optimization toggles
- What-if scenario modeling
- Performance monitoring dashboards

### 6. Enhanced Revenue Settings UI

#### New Settings Sections

**1. Crew Management**
- Crew role definitions and hourly rates
- Shift length and overtime rules
- Crew composition by transport level
- Labor cost tracking and adjustment

**2. Vehicle & Operational Costs**
- Vehicle cost per mile
- Fuel cost tracking and adjustment
- Maintenance cost allocation
- Insurance and registration costs

**3. Advanced Pricing**
- Time-based pricing rules
- Geographic zone pricing
- Service-specific surcharges
- Dynamic pricing controls

**4. Route Optimization**
- Optimization weight controls
- Constraint settings
- Backhaul pairing parameters
- Performance targets

**5. Cost Analysis**
- Overhead allocation methods
- Cost center management
- Profitability targets
- Break-even analysis

**6. Real-time Controls**
- Optimization frequency
- Live vs. batch processing
- What-if scenario modeling
- Performance monitoring

### 7. Implementation Phases

<<<<<<< HEAD
#### Phase 1: Crew Cost Management (Week 1-2) ✅ COMPLETED
**Database Changes:**
- ✅ Added crew cost fields to Unit model in EMS schema (crewSize, crewComposition, baseHourlyRate, overtimeMultiplier, shiftLengthHours, maxOvertimeHours)
- ✅ Added operational cost fields (vehicleCostPerMile, fuelCostPerMile, maintenanceCostPerMile)
- ✅ Added location & staging fields (homeBaseLocation, stagingLocations, maxServiceRadius, interceptCapability)
- ✅ Created CrewRole model with 5 default roles (EMT, Paramedic, RN, CCT Specialist, Critical Care Paramedic)
- ✅ Seeded database with default crew roles and hourly rates

**Frontend Implementation:**
- ✅ Enhanced RevenueSettings component with comprehensive crew cost management
- ✅ Added Crew Cost Management section with role-based hourly rates and overtime rules
- ✅ Added Vehicle & Operational Costs section with per-mile cost tracking
- ✅ Added Crew Composition display showing roles by transport level (BLS/ALS/CCT)
- ✅ Enhanced revenue preview with detailed cost breakdown and profitability analysis
- ✅ Implemented real-time calculations for crew costs, vehicle costs, and profit margins

**Features Delivered:**
- ✅ Crew role management with hourly rates ($25-$45/hr range)
- ✅ Overtime multiplier and shift length configuration
- ✅ Vehicle operational cost tracking (vehicle, fuel, maintenance per mile)
- ✅ Crew composition by transport level (BLS: 2 EMTs, ALS: EMT+Paramedic, CCT: RN+Critical Care Paramedic)
- ✅ Real-time profit margin calculations with color-coded cost breakdowns
- ✅ Settings persistence with localStorage and reset functionality
- ✅ Synchronized between TCC and EMS Analytics systems

**Test Results:**
- ✅ Sample ALS trip (15 miles, 2.5 hours): $281.56 revenue, $167.25 total cost, $114.31 net profit (40.60% margin)
- ✅ All crew cost calculations working correctly
- ✅ Database schema issues resolved
- ✅ Both TCC and EMS systems operational

#### Phase 2: Advanced Pricing Models (Week 3-4) ✅ COMPLETED
**Database Changes:**
- ✅ Created PricingModel table with comprehensive pricing configuration fields
- ✅ Added time-based pricing fields (peakHourMultipliers, weekendMultipliers, seasonalMultipliers)
- ✅ Added geographic pricing fields (zoneMultipliers, distanceTiers)
- ✅ Added service-specific pricing fields (specialRequirements, isolationPricing, bariatricPricing, oxygenPricing, monitoringPricing)
- ✅ Added insurance-specific rate configurations
- ✅ Seeded database with 3 default pricing models (Standard, Peak Hours, Weekend)

**Frontend Implementation:**
- ✅ Added 4 new Advanced Pricing sections to RevenueSettings component
- ✅ Implemented time-based pricing controls (peak hours, weekends, seasons)
- ✅ Added geographic zone pricing configuration with visual controls
- ✅ Added distance tier pricing controls with volume discounts
- ✅ Added service-specific surcharge management
- ✅ Implemented insurance-specific rate controls with discount/surcharge indicators

**Key Features Delivered:**
- ✅ **Time-based Pricing**: Peak hour multipliers (6-9AM: 1.3x, 5-8PM: 1.4x), weekend surcharges (Saturday: 1.2x, Sunday: 1.3x), seasonal adjustments (Winter: 1.1x)
- ✅ **Geographic Pricing**: Zone-based multipliers (Urban: 1.0x, Suburban: 1.1x, Rural: 1.3x, Remote: 1.5x)
- ✅ **Distance Tiers**: Volume discounts (0-10mi: 1.0x, 10-25mi: 0.95x, 25-50mi: 0.9x, 50+mi: 0.85x)
- ✅ **Service Surcharges**: Configurable surcharges (Oxygen: $25, Monitoring: $50, Isolation: $75, Bariatric: $100)
- ✅ **Insurance-specific Rates**: Different rate structures (Medicare: 0.85x, Medicaid: 0.80x, Private: 1.0x, SelfPay: 1.2x)
- ✅ **Real-time Controls**: All pricing adjustments update immediately with visual feedback

**Deliverables Completed:**
- ✅ Enhanced RevenueSettings with 4 comprehensive pricing sections
- ✅ Real-time pricing controls with immediate visual feedback
- ✅ Agency-specific pricing model management through database
- ✅ Full integration with existing crew cost calculations
- ✅ Advanced revenue optimization based on time, location, and service type
- ✅ Synchronized between TCC and EMS Analytics systems
- ✅ Fixed TCC login credentials issue (admin@tcc.com / admin123)

#### Phase 3: Route Optimization Parameters (Week 5-6) ✅ COMPLETED
**Database Changes:**
- ✅ Created RouteOptimizationSettings table with comprehensive optimization parameters
- ✅ Added optimization weights (α, β, γ, δ parameters) for deadhead miles, wait time, backhaul bonus, overtime risk
- ✅ Added constraint settings (max deadhead miles, wait time, overtime, response time, service distance)
- ✅ Added backhaul optimization parameters (time window, distance limit, revenue bonus)
- ✅ Added performance targets (loaded mile ratio, revenue per hour, response time, efficiency)
- ✅ Added algorithm settings (optimization algorithm, max time, real-time optimization)
- ✅ Added advanced settings (crew availability, equipment compatibility, patient priority weights)
- ✅ Successfully migrated database with new table structure

**Backend Implementation:**
- ✅ Added 5 new API endpoints for optimization settings management
- ✅ Implemented GET /api/optimize/settings for retrieving settings (agency-specific or global)
- ✅ Implemented POST /api/optimize/settings for creating/updating settings
- ✅ Implemented POST /api/optimize/settings/reset for resetting to defaults
- ✅ Implemented POST /api/optimize/preview for real-time optimization preview
- ✅ Implemented POST /api/optimize/what-if for scenario analysis
- ✅ Added comprehensive optimization calculation functions with constraint validation
- ✅ Added backhaul opportunity detection and efficiency calculations
- ✅ Fixed TypeScript compilation issues and Prisma client generation

**Frontend Implementation:**
- ✅ Added comprehensive Route Optimization Settings section to RevenueSettings component
- ✅ Implemented 5 new UI sections with interactive controls:
  - Route Optimization Weights (α, β, γ, δ parameters with sliders)
  - Constraint Settings (max limits with input controls)
  - Backhaul Optimization (time window, distance, revenue bonus)
  - Performance Targets (loaded mile ratio, revenue/hour, response time, efficiency)
  - Algorithm Settings (algorithm selection, timing, real-time toggle)
- ✅ Added real-time optimization preview panel with:
  - Optimization metrics display (revenue, loaded mile ratio, backhaul pairs)
  - Performance vs targets comparison with visual indicators
  - Current optimization weights summary
  - Mock optimization calculations based on current settings
- ✅ Integrated with existing Phase 1 & 2 features seamlessly
- ✅ Added proper TypeScript interfaces and state management

**Key Features Delivered:**
- ✅ **Optimization Weights**: Interactive sliders for α, β, γ, δ parameters (0-3 range)
- ✅ **Constraint Management**: Configurable limits for deadhead miles, wait time, overtime, response time
- ✅ **Backhaul Optimization**: Time window and distance-based pairing with revenue bonuses
- ✅ **Performance Targets**: Goal setting and real-time performance comparison
- ✅ **Algorithm Selection**: Multiple optimization algorithms (Hybrid, Greedy, Genetic, Simulated Annealing)
- ✅ **Real-time Preview**: Live optimization calculations with visual feedback
- ✅ **Agency-specific Settings**: Support for both global and agency-specific configurations

**Test Results:**
- ✅ Backend API successfully returns default optimization settings
- ✅ Database migration completed without issues
- ✅ Frontend renders all new Route Optimization sections
- ✅ All TypeScript compilation errors resolved
- ✅ Integration with existing Phase 1 & 2 features working correctly

#### Phase 4: Cost Analysis & Profitability (Week 7-8) ✅ COMPLETED
**Database Changes:**
- ✅ Created TripCostBreakdown table with comprehensive revenue/cost tracking
- ✅ Added revenue components (base, mileage, priority, special requirements, insurance)
- ✅ Added cost components (crew labor, vehicle, fuel, maintenance, overhead)
- ✅ Added profitability metrics (gross profit, profit margin, revenue per mile, cost per mile)
- ✅ Added efficiency metrics (loaded mile ratio, deadhead mile ratio, utilization rate)
- ✅ Created CostCenter table for overhead allocation management
- ✅ Successfully applied database migrations

**Backend Implementation:**
- ✅ Added cost analysis service methods in analyticsService.ts
- ✅ Implemented getTripCostBreakdowns() for detailed trip cost retrieval
- ✅ Implemented getCostAnalysisSummary() for aggregated cost analysis
- ✅ Implemented getProfitabilityAnalysis() for profitability trends
- ✅ Implemented createTripCostBreakdown() for new cost breakdown creation
- ✅ Added 4 new API endpoints for cost analysis functionality
- ✅ Fixed TypeScript compilation errors and Prisma client issues
- ✅ Added proper authentication to all cost analysis endpoints

**Frontend Implementation:**
- ✅ Added comprehensive Cost Analysis Dashboard section to RevenueSettings component
- ✅ Implemented real-time cost breakdown visualization with key financial metrics
- ✅ Added profitability analysis charts and efficiency metrics tracking
- ✅ Added cost center allocation controls and break-even analysis tools
- ✅ Implemented "Add Sample Data" functionality for testing
- ✅ Added period selection and date range filtering
- ✅ Fixed authentication token issues in API calls
- ✅ Added comprehensive debugging and error handling

**Key Features Delivered:**
- ✅ **Detailed Trip Cost Breakdowns**: Revenue and cost component tracking
- ✅ **Profitability Analysis**: Gross profit, profit margin, revenue/cost per mile
- ✅ **Efficiency Metrics**: Loaded mile ratio, deadhead mile ratio, utilization rate
- ✅ **Cost Center Management**: Overhead allocation and cost center tracking
- ✅ **Real-time Visualization**: Live cost breakdown charts and metrics
- ✅ **Sample Data Generation**: Testing functionality with realistic cost data
- ✅ **Period Analysis**: Monthly, quarterly, and custom date range analysis

**Test Results:**
- ✅ Backend API endpoints working correctly with authentication
- ✅ Frontend Cost Analysis Dashboard rendering properly
- ✅ Sample data creation and display working
- ✅ All cost analysis calculations functioning correctly
- ✅ Database migrations applied successfully
- ✅ Enhanced backup with database exports completed

**Issues Resolved:**
- ✅ Fixed duplicate 'token' variable declaration error
- ✅ Added authentication headers to all API calls
- ✅ Resolved Prisma client generation issues
- ✅ Fixed TypeScript compilation errors
- ✅ Successfully committed and pushed all changes to Git

#### Phase 5: Real-time Optimization (Week 9-10) ✅ COMPLETED
**Backend Implementation:**
- ✅ Added Server-Sent Events (SSE) stream endpoint `/api/optimize/stream` for real-time metrics
- ✅ Implemented what-if scenario analysis endpoint `/api/optimize/what-if`
- ✅ Added real-time optimization metrics streaming every 5 seconds
- ✅ Implemented backhaul detection and optimization algorithms
- ✅ Added revenue optimization calculations with live data
- ✅ Fixed SSE authentication with cookie-based token passing
- ✅ Added comprehensive error handling and connection management

**Frontend Implementation:**
- ✅ Added Real-time Optimization Widget with live metrics display
- ✅ Implemented What-if Scenario panel with interactive parameter controls
- ✅ Added live connection status with pause/resume functionality
- ✅ Implemented real-time metrics updates (total trips, completed trips, response time, revenue, efficiency)
- ✅ Added what-if scenario parameter adjustment (deadhead mile weight, loaded mile weight, time efficiency, customer satisfaction)
- ✅ Integrated with existing Phase 1-4 features seamlessly

**Key Features Delivered:**
- ✅ **Real-time Metrics**: Live updates of optimization metrics every 5 seconds
- ✅ **What-if Scenarios**: Interactive parameter adjustment for scenario testing
- ✅ **Backhaul Analysis**: Automatic detection and optimization of backhaul opportunities
- ✅ **Live Connection**: Real-time SSE stream with pause/resume controls
- ✅ **User Tutorial**: Comprehensive user guide for revenue calculation settings
- ✅ **Authentication**: Cookie-based authentication for SSE streams

**Test Results:**
- ✅ SSE stream successfully connects and sends live metrics
- ✅ What-if scenario analysis working with parameter adjustments
- ✅ Real-time optimization widget displaying live data
- ✅ Backend optimization engine processing scenarios correctly
- ✅ User tutorial created and documented
- ✅ All Phase 5 deliverables completed successfully
=======
#### Phase 1: Crew Cost Management (Week 1-2)
- Add crew role model and unit cost fields
- Implement crew cost calculation in revenue settings
- Add crew management UI to revenue settings

#### Phase 2: Advanced Pricing Models (Week 3-4)
- Create pricing model system
- Implement time-based and geographic pricing
- Add advanced pricing controls to UI

#### Phase 3: Route Optimization Parameters (Week 5-6)
- Add route optimization settings model
- Implement optimization weight controls
- Add constraint and target settings

#### Phase 4: Cost Analysis & Profitability (Week 7-8)
- Create trip cost breakdown system
- Implement detailed cost tracking
- Add profitability analysis tools

#### Phase 5: Real-time Optimization (Week 9-10)
- Build revenue optimization engine
- Implement real-time optimization
- Add what-if scenario modeling
>>>>>>> 013b3748 (docs: Add comprehensive revenue settings enhancement plan)

### 8. Expected Benefits

**Revenue Optimization:**
- 15-25% increase in loaded mile ratio
- 10-20% increase in net revenue per trip
- 20-30% reduction in deadhead miles
- 5-15% improvement in backhaul pairing

**Cost Management:**
- Accurate crew cost tracking
- Better overhead allocation
- Improved profitability analysis
- Real-time cost monitoring

**Operational Efficiency:**
- Optimized route planning
- Reduced response times
- Better resource utilization
- Improved customer satisfaction

**Business Intelligence:**
- Detailed cost breakdowns
- Profitability analysis
- Performance benchmarking
- What-if scenario planning

### 9. Technical Considerations

**Database Performance:**
- Index optimization for route calculations
- Caching for frequently accessed pricing data
- Partitioning for large trip datasets

**Real-time Processing:**
- Event-driven optimization triggers
- Background job processing
- WebSocket updates for live data

**Scalability:**
- Microservices architecture for optimization engine
- Horizontal scaling for high-volume agencies
- Cloud-based optimization services

**Integration:**
- API endpoints for external optimization services
- Webhook support for real-time updates
- Export capabilities for external analysis tools

This comprehensive enhancement plan will transform the revenue calculation system from a basic pricing tool into a sophisticated revenue optimization platform that maximizes profitability while maintaining operational efficiency.
