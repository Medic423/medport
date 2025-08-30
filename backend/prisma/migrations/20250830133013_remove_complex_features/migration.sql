-- Remove complex feature tables that are not used by the siloed login system
-- This migration removes advanced transport coordination, air medical integration,
-- emergency department optimization, agency portal models, and real-time tracking

-- Drop complex feature tables (in reverse dependency order)

-- Real-time Tracking Models (Phase 6.1)
DROP TABLE IF EXISTS "WeatherImpact" CASCADE;
DROP TABLE IF EXISTS "TrafficCondition" CASCADE;
DROP TABLE IF EXISTS "ETAUpdate" CASCADE;
DROP TABLE IF EXISTS "RouteDeviation" CASCADE;
DROP TABLE IF EXISTS "GeofenceEvent" CASCADE;
DROP TABLE IF EXISTS "LocationHistory" CASCADE;
DROP TABLE IF EXISTS "GPSTracking" CASCADE;

-- Agency Portal Models (Phase 3.1)
DROP TABLE IF EXISTS "AgencyPerformance" CASCADE;
DROP TABLE IF EXISTS "ServiceArea" CASCADE;
DROP TABLE IF EXISTS "TransportBid" CASCADE;
DROP TABLE IF EXISTS "UnitAssignment" CASCADE;
DROP TABLE IF EXISTS "UnitAvailability" CASCADE;
DROP TABLE IF EXISTS "AgencyProfile" CASCADE;
DROP TABLE IF EXISTS "AgencyUser" CASCADE;

-- Emergency Department Optimization Models (Phase 2.7)
DROP TABLE IF EXISTS "CapacityAlert" CASCADE;
DROP TABLE IF EXISTS "TransportQueue" CASCADE;
DROP TABLE IF EXISTS "BedStatusUpdate" CASCADE;
DROP TABLE IF EXISTS "EmergencyDepartment" CASCADE;
DROP TABLE IF EXISTS "DemandPattern" CASCADE;
DROP TABLE IF EXISTS "ProviderForecast" CASCADE;

-- Air Medical Integration Models
DROP TABLE IF EXISTS "GroundTransportCoordination" CASCADE;
DROP TABLE IF EXISTS "WeatherAlert" CASCADE;
DROP TABLE IF EXISTS "AirMedicalTransport" CASCADE;
DROP TABLE IF EXISTS "AirMedicalResource" CASCADE;

-- Advanced Transport Models
DROP TABLE IF EXISTS "WeatherUpdate" CASCADE;
DROP TABLE IF EXISTS "TransportLeg" CASCADE;
DROP TABLE IF EXISTS "LongDistanceTransport" CASCADE;
DROP TABLE IF EXISTS "PatientTransport" CASCADE;
DROP TABLE IF EXISTS "MultiPatientTransport" CASCADE;

-- Drop complex enums that are no longer needed
DROP TYPE IF EXISTS "WeatherImpactLevel" CASCADE;
DROP TYPE IF EXISTS "TrafficSeverity" CASCADE;
DROP TYPE IF EXISTS "ETAUpdateStatus" CASCADE;
DROP TYPE IF EXISTS "RouteDeviationStatus" CASCADE;
DROP TYPE IF EXISTS "GeofenceEventStatus" CASCADE;
DROP TYPE IF EXISTS "LocationHistorySource" CASCADE;
DROP TYPE IF EXISTS "LocationHistoryType" CASCADE;
DROP TYPE IF EXISTS "GPSTrackingStatus" CASCADE;
DROP TYPE IF EXISTS "DestinationType" CASCADE;
DROP TYPE IF EXISTS "DeviationType" CASCADE;
DROP TYPE IF EXISTS "GeofenceEventType" CASCADE;
DROP TYPE IF EXISTS "GeofenceType" CASCADE;
DROP TYPE IF EXISTS "LocationSource" CASCADE;
DROP TYPE IF EXISTS "LocationType" CASCADE;
DROP TYPE IF EXISTS "BidStatus" CASCADE;
DROP TYPE IF EXISTS "AssignmentStatus" CASCADE;
DROP TYPE IF EXISTS "AssignmentType" CASCADE;
DROP TYPE IF EXISTS "AgencyUserRole" CASCADE;
DROP TYPE IF EXISTS "CapacityAlertType" CASCADE;
DROP TYPE IF EXISTS "QueueStatus" CASCADE;
DROP TYPE IF EXISTS "BedUpdateType" CASCADE;
DROP TYPE IF EXISTS "TrendDirection" CASCADE;
DROP TYPE IF EXISTS "PatternType" CASCADE;
DROP TYPE IF EXISTS "ForecastType" CASCADE;
DROP TYPE IF EXISTS "CoordinationStatus" CASCADE;
DROP TYPE IF EXISTS "CoordinationType" CASCADE;
DROP TYPE IF EXISTS "WeatherAlertType" CASCADE;
DROP TYPE IF EXISTS "AirMedicalStatus" CASCADE;
DROP TYPE IF EXISTS "AirMedicalType" CASCADE;
DROP TYPE IF EXISTS "WeatherConditions" CASCADE;
DROP TYPE IF EXISTS "LegStatus" CASCADE;
DROP TYPE IF EXISTS "LongDistanceStatus" CASCADE;
DROP TYPE IF EXISTS "PatientTransportStatus" CASCADE;
DROP TYPE IF EXISTS "MultiPatientStatus" CASCADE;