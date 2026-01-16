# Expected Tables from schema.prisma
**Date:** January 7, 2026  
**Purpose:** Reference list of all tables that should exist in production

---

## All Models (Tables) from schema.prisma

These are the tables that **should exist** in production according to `schema.prisma`:

1. `AgencyResponse` → `agency_responses` ✅ (we know this exists)
2. `BackhaulOpportunity` → `backhaul_opportunities`
3. `CenterUser` → `center_users` ✅ (we know this exists)
4. `CostCenter` → `cost_centers`
5. `DropdownCategory` → `dropdown_categories`
6. `DropdownOption` → `dropdown_options`
7. `EMSAgency` → `ems_agencies` ✅ (we know this exists)
8. `EMSUser` → `ems_users` ✅ (we know this exists)
9. `Facility` → `facilities`
10. `HealthcareAgencyPreference` → `healthcare_agency_preferences`
11. `HealthcareDestination` → `healthcare_destinations`
12. `HealthcareLocation` → `healthcare_locations`
13. `HealthcareUser` → `healthcare_users` ✅ (we know this exists)
14. `Hospital` → `hospitals` ✅ (we know this exists)
15. `NotificationLog` → `notification_logs`
16. `NotificationPreference` → `notification_preferences`
17. `PickupLocation` → `pickup_locations`
18. `PricingModel` → `pricing_models`
19. `RouteOptimizationSetting` → `route_optimization_settings`
20. `SystemAnalytics` → `system_analytics` ✅ (we know this exists)
21. `TransportRequest` → `transport_requests` ✅ (we know this exists)
22. `Trip` → `trips` ✅ (we know this exists)
23. `TripCostBreakdown` → `trip_cost_breakdowns` (Note: plural!)
24. `Unit` → `units`
25. `UnitAnalytics` → `unit_analytics`

---

## Quick Assessment Query

**Run this in pgAdmin to see which tables exist:**

```sql
WITH expected_tables AS (
  SELECT unnest(ARRAY[
    'agency_responses',
    'backhaul_opportunities',
    'center_users',
    'cost_centers',
    'dropdown_categories',
    'dropdown_options',
    'ems_agencies',
    'ems_users',
    'facilities',
    'healthcare_agency_preferences',
    'healthcare_destinations',
    'healthcare_locations',
    'healthcare_users',
    'hospitals',
    'notification_logs',
    'notification_preferences',
    'pickup_locations',
    'pricing_models',
    'route_optimization_settings',
    'system_analytics',
    'transport_requests',
    'trips',
    'trip_cost_breakdowns',
    'units',
    'unit_analytics'
  ]) AS table_name
)
SELECT 
    et.table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = et.table_name
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status
FROM expected_tables et
ORDER BY et.table_name;
```

---

## Priority Classification

### Critical (Blocking Core Functionality)

**EMS Module:**
- ✅ `ems_users` - EMS user accounts
- ✅ `ems_agencies` - EMS agencies  
- ✅ `agency_responses` - Agency responses
- ✅ `transport_requests` - Transport requests

**Healthcare Module:**
- ✅ `healthcare_users` - Healthcare user accounts
- ❓ `healthcare_locations` - Healthcare locations (needed for trip creation)
- ❓ `healthcare_agency_preferences` - Agency preferences
- ❓ `healthcare_destinations` - Destinations

**Center/Admin:**
- ✅ `center_users` - Center users
- ✅ `hospitals` - Hospitals

### Important (Supporting Features)

- ❓ `dropdown_categories` - Dropdown categories
- ❓ `dropdown_options` - Dropdown options
- ❓ `pickup_locations` - Pickup locations
- ✅ `trips` - Trips
- ❓ `units` - Units

### Nice-to-Have (Advanced Features)

- ❓ `backhaul_opportunities` - Backhaul opportunities
- ❓ `cost_centers` - Cost centers
- ❓ `pricing_models` - Pricing models
- ❓ `route_optimization_settings` - Route optimization
- ❓ `trip_cost_breakdown` - Trip cost breakdown
- ❓ `unit_analytics` - Unit analytics
- ❓ `notification_logs` - Notification logs
- ❓ `notification_preferences` - Notification preferences
- ✅ `system_analytics` - System analytics

---

**Legend:**
- ✅ = We know this exists
- ❓ = Need to check

---

**Last Updated:** January 7, 2026

