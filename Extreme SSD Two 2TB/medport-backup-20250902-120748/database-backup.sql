--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Homebrew)
-- Dumped by pg_dump version 15.13 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: scooper
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO scooper;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: scooper
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AgencyUserRole; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."AgencyUserRole" AS ENUM (
    'ADMIN',
    'STAFF',
    'BILLING_STAFF'
);


ALTER TYPE public."AgencyUserRole" OWNER TO scooper;

--
-- Name: AirMedicalStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."AirMedicalStatus" AS ENUM (
    'PLANNING',
    'SCHEDULED',
    'IN_FLIGHT',
    'LANDED',
    'COMPLETED',
    'CANCELLED',
    'GROUNDED',
    'WEATHER_DELAYED',
    'MAINTENANCE'
);


ALTER TYPE public."AirMedicalStatus" OWNER TO scooper;

--
-- Name: AirMedicalType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."AirMedicalType" AS ENUM (
    'HELICOPTER',
    'FIXED_WING',
    'JET',
    'TURBOPROP'
);


ALTER TYPE public."AirMedicalType" OWNER TO scooper;

--
-- Name: AlertSeverity; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."AlertSeverity" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


ALTER TYPE public."AlertSeverity" OWNER TO scooper;

--
-- Name: AssignmentStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."AssignmentStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."AssignmentStatus" OWNER TO scooper;

--
-- Name: AssignmentType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."AssignmentType" AS ENUM (
    'PRIMARY',
    'SECONDARY',
    'SUPPLEMENTAL'
);


ALTER TYPE public."AssignmentType" OWNER TO scooper;

--
-- Name: BedUpdateType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."BedUpdateType" AS ENUM (
    'BED_ADDED',
    'BED_REMOVED',
    'BED_OCCUPIED',
    'BED_VACATED',
    'HALLWAY_BED_ADDED',
    'HALLWAY_BED_REMOVED',
    'CRITICAL_BED_UPDATE'
);


ALTER TYPE public."BedUpdateType" OWNER TO scooper;

--
-- Name: BidStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."BidStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED',
    'WITHDRAWN'
);


ALTER TYPE public."BidStatus" OWNER TO scooper;

--
-- Name: CapacityAlertType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."CapacityAlertType" AS ENUM (
    'BED_CAPACITY',
    'HALLWAY_BED_THRESHOLD',
    'TRANSPORT_QUEUE_LENGTH',
    'WAIT_TIME_THRESHOLD',
    'CRITICAL_BED_SHORTAGE'
);


ALTER TYPE public."CapacityAlertType" OWNER TO scooper;

--
-- Name: CoordinationStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."CoordinationStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'FAILED'
);


ALTER TYPE public."CoordinationStatus" OWNER TO scooper;

--
-- Name: CoordinationType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."CoordinationType" AS ENUM (
    'HANDOFF',
    'ESCORT',
    'BACKUP',
    'RELAY',
    'INTERCEPT'
);


ALTER TYPE public."CoordinationType" OWNER TO scooper;

--
-- Name: DestinationType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."DestinationType" AS ENUM (
    'FACILITY',
    'PICKUP_LOCATION',
    'DROPOFF_LOCATION',
    'WAYPOINT',
    'CUSTOM'
);


ALTER TYPE public."DestinationType" OWNER TO scooper;

--
-- Name: DeviationType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."DeviationType" AS ENUM (
    'ROUTE_DEVIATION',
    'SPEED_VIOLATION',
    'STOPPED_UNEXPECTEDLY',
    'WRONG_DIRECTION',
    'OFF_ROUTE'
);


ALTER TYPE public."DeviationType" OWNER TO scooper;

--
-- Name: ETAUpdateStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."ETAUpdateStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."ETAUpdateStatus" OWNER TO scooper;

--
-- Name: FacilityType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."FacilityType" AS ENUM (
    'HOSPITAL',
    'NURSING_HOME',
    'CANCER_CENTER',
    'REHAB_FACILITY',
    'URGENT_CARE',
    'SPECIALTY_CLINIC'
);


ALTER TYPE public."FacilityType" OWNER TO scooper;

--
-- Name: ForecastType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."ForecastType" AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'SEASONAL',
    'EVENT_BASED'
);


ALTER TYPE public."ForecastType" OWNER TO scooper;

--
-- Name: GPSTrackingStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."GPSTrackingStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'ERROR',
    'OFFLINE'
);


ALTER TYPE public."GPSTrackingStatus" OWNER TO scooper;

--
-- Name: GeofenceEventStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."GeofenceEventStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'EXPIRED'
);


ALTER TYPE public."GeofenceEventStatus" OWNER TO scooper;

--
-- Name: GeofenceEventType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."GeofenceEventType" AS ENUM (
    'ENTERED',
    'EXITED',
    'APPROACHING',
    'DEPARTING'
);


ALTER TYPE public."GeofenceEventType" OWNER TO scooper;

--
-- Name: GeofenceType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."GeofenceType" AS ENUM (
    'FACILITY_ARRIVAL',
    'FACILITY_DEPARTURE',
    'SERVICE_AREA',
    'RESTRICTED_AREA',
    'CUSTOM'
);


ALTER TYPE public."GeofenceType" OWNER TO scooper;

--
-- Name: LegStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."LegStatus" AS ENUM (
    'PLANNED',
    'IN_PROGRESS',
    'COMPLETED',
    'DELAYED',
    'CANCELLED'
);


ALTER TYPE public."LegStatus" OWNER TO scooper;

--
-- Name: LocationHistorySource; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."LocationHistorySource" AS ENUM (
    'UNIT_DEVICE',
    'MOBILE_APP',
    'CAD_SYSTEM',
    'MANUAL_ENTRY'
);


ALTER TYPE public."LocationHistorySource" OWNER TO scooper;

--
-- Name: LocationHistoryType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."LocationHistoryType" AS ENUM (
    'GPS',
    'CELLULAR',
    'WIFI',
    'MANUAL'
);


ALTER TYPE public."LocationHistoryType" OWNER TO scooper;

--
-- Name: LocationSource; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."LocationSource" AS ENUM (
    'UNIT_DEVICE',
    'MOBILE_APP',
    'CAD_SYSTEM',
    'MANUAL_ENTRY',
    'ESTIMATION'
);


ALTER TYPE public."LocationSource" OWNER TO scooper;

--
-- Name: LocationType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."LocationType" AS ENUM (
    'GPS',
    'CELLULAR',
    'WIFI',
    'MANUAL',
    'ESTIMATED'
);


ALTER TYPE public."LocationType" OWNER TO scooper;

--
-- Name: LongDistanceStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."LongDistanceStatus" AS ENUM (
    'PLANNING',
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'WEATHER_DELAYED'
);


ALTER TYPE public."LongDistanceStatus" OWNER TO scooper;

--
-- Name: MultiPatientStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."MultiPatientStatus" AS ENUM (
    'PLANNING',
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."MultiPatientStatus" OWNER TO scooper;

--
-- Name: PatientTransportStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."PatientTransportStatus" AS ENUM (
    'PENDING',
    'SCHEDULED',
    'IN_TRANSIT',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."PatientTransportStatus" OWNER TO scooper;

--
-- Name: PatternType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."PatternType" AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'SEASONAL',
    'EVENT_DRIVEN'
);


ALTER TYPE public."PatternType" OWNER TO scooper;

--
-- Name: Priority; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."Priority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."Priority" OWNER TO scooper;

--
-- Name: QueueStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."QueueStatus" AS ENUM (
    'WAITING',
    'ASSIGNED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'ESCALATED'
);


ALTER TYPE public."QueueStatus" OWNER TO scooper;

--
-- Name: RequestStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."RequestStatus" AS ENUM (
    'PENDING',
    'SCHEDULED',
    'IN_TRANSIT',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."RequestStatus" OWNER TO scooper;

--
-- Name: RouteDeviationStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."RouteDeviationStatus" AS ENUM (
    'UNRESOLVED',
    'RESOLVED',
    'IGNORED'
);


ALTER TYPE public."RouteDeviationStatus" OWNER TO scooper;

--
-- Name: RouteOptimizationType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."RouteOptimizationType" AS ENUM (
    'CHAINED_TRIPS',
    'RETURN_TRIP',
    'MULTI_STOP',
    'GEOGRAPHIC',
    'TEMPORAL',
    'REVENUE_MAX'
);


ALTER TYPE public."RouteOptimizationType" OWNER TO scooper;

--
-- Name: RouteStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."RouteStatus" AS ENUM (
    'PLANNED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'OPTIMIZED',
    'SUGGESTED'
);


ALTER TYPE public."RouteStatus" OWNER TO scooper;

--
-- Name: RouteType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."RouteType" AS ENUM (
    'FASTEST',
    'SHORTEST',
    'MOST_EFFICIENT',
    'LOWEST_COST',
    'SCENIC'
);


ALTER TYPE public."RouteType" OWNER TO scooper;

--
-- Name: ServiceStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."ServiceStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'PENDING'
);


ALTER TYPE public."ServiceStatus" OWNER TO scooper;

--
-- Name: StopType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."StopType" AS ENUM (
    'PICKUP',
    'DROPOFF',
    'REFUEL',
    'REST',
    'EQUIPMENT',
    'TRANSFER'
);


ALTER TYPE public."StopType" OWNER TO scooper;

--
-- Name: TrafficSeverity; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."TrafficSeverity" AS ENUM (
    'NONE',
    'LIGHT',
    'MODERATE',
    'HEAVY',
    'SEVERE'
);


ALTER TYPE public."TrafficSeverity" OWNER TO scooper;

--
-- Name: TransportLevel; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."TransportLevel" AS ENUM (
    'BLS',
    'ALS',
    'CCT',
    'OTHER'
);


ALTER TYPE public."TransportLevel" OWNER TO scooper;

--
-- Name: TrendDirection; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."TrendDirection" AS ENUM (
    'INCREASING',
    'DECREASING',
    'STABLE',
    'CYCLICAL',
    'UNKNOWN'
);


ALTER TYPE public."TrendDirection" OWNER TO scooper;

--
-- Name: UnitStatus; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."UnitStatus" AS ENUM (
    'AVAILABLE',
    'IN_USE',
    'OUT_OF_SERVICE',
    'MAINTENANCE'
);


ALTER TYPE public."UnitStatus" OWNER TO scooper;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'COORDINATOR',
    'BILLING_STAFF',
    'TRANSPORT_AGENCY'
);


ALTER TYPE public."UserRole" OWNER TO scooper;

--
-- Name: WeatherAlertType; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."WeatherAlertType" AS ENUM (
    'TURBULENCE',
    'LOW_VISIBILITY',
    'HIGH_WINDS',
    'ICING',
    'THUNDERSTORMS',
    'SNOW',
    'FOG',
    'VOLCANIC_ASH'
);


ALTER TYPE public."WeatherAlertType" OWNER TO scooper;

--
-- Name: WeatherConditions; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."WeatherConditions" AS ENUM (
    'CLEAR',
    'PARTLY_CLOUDY',
    'CLOUDY',
    'RAIN',
    'SNOW',
    'FOG',
    'THUNDERSTORMS',
    'HIGH_WINDS',
    'ICING',
    'TURBULENCE'
);


ALTER TYPE public."WeatherConditions" OWNER TO scooper;

--
-- Name: WeatherImpactLevel; Type: TYPE; Schema: public; Owner: scooper
--

CREATE TYPE public."WeatherImpactLevel" AS ENUM (
    'NONE',
    'MINIMAL',
    'MODERATE',
    'SIGNIFICANT',
    'SEVERE'
);


ALTER TYPE public."WeatherImpactLevel" OWNER TO scooper;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AgencyPerformance; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."AgencyPerformance" (
    id text NOT NULL,
    "agencyId" text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "totalTransports" integer DEFAULT 0 NOT NULL,
    "completedTransports" integer DEFAULT 0 NOT NULL,
    "cancelledTransports" integer DEFAULT 0 NOT NULL,
    "averageResponseTime" integer,
    "totalMiles" double precision DEFAULT 0 NOT NULL,
    "revenueGenerated" double precision DEFAULT 0 NOT NULL,
    "customerSatisfaction" double precision,
    "onTimePercentage" double precision,
    "safetyIncidents" integer DEFAULT 0 NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AgencyPerformance" OWNER TO scooper;

--
-- Name: AgencyProfile; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."AgencyProfile" (
    id text NOT NULL,
    "agencyId" text NOT NULL,
    description text,
    website text,
    "licenseNumber" text,
    "insuranceInfo" jsonb,
    certifications jsonb,
    specializations jsonb,
    "emergencyProcedures" jsonb,
    "contactPerson" text,
    "emergencyContact" text,
    "emergencyPhone" text,
    "serviceAreaNotes" text,
    "operatingNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AgencyProfile" OWNER TO scooper;

--
-- Name: AgencyUser; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."AgencyUser" (
    id text NOT NULL,
    "agencyId" text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role public."AgencyUserRole" DEFAULT 'STAFF'::public."AgencyUserRole" NOT NULL,
    phone text,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AgencyUser" OWNER TO scooper;

--
-- Name: AirMedicalResource; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."AirMedicalResource" (
    id text NOT NULL,
    "resourceType" public."AirMedicalType" NOT NULL,
    identifier text NOT NULL,
    "baseLocation" text NOT NULL,
    "serviceArea" jsonb NOT NULL,
    capabilities jsonb NOT NULL,
    "crewSize" integer NOT NULL,
    "maxRange" double precision NOT NULL,
    "maxPayload" double precision NOT NULL,
    "weatherMinimums" jsonb NOT NULL,
    "operatingHours" jsonb NOT NULL,
    "contactInfo" jsonb NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AirMedicalResource" OWNER TO scooper;

--
-- Name: AirMedicalTransport; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."AirMedicalTransport" (
    id text NOT NULL,
    "transportRequestId" text,
    "multiPatientTransportId" text,
    "longDistanceTransportId" text,
    "airMedicalResourceId" text NOT NULL,
    status public."AirMedicalStatus" DEFAULT 'PLANNING'::public."AirMedicalStatus" NOT NULL,
    "flightPlan" jsonb NOT NULL,
    "weatherConditions" public."WeatherConditions" NOT NULL,
    "estimatedDeparture" timestamp(3) without time zone NOT NULL,
    "estimatedArrival" timestamp(3) without time zone NOT NULL,
    "actualDeparture" timestamp(3) without time zone,
    "actualArrival" timestamp(3) without time zone,
    "groundingReason" text,
    "weatherDelay" boolean DEFAULT false NOT NULL,
    "crewNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AirMedicalTransport" OWNER TO scooper;

--
-- Name: BedStatusUpdate; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."BedStatusUpdate" (
    id text NOT NULL,
    "emergencyDepartmentId" text NOT NULL,
    "updateType" public."BedUpdateType" NOT NULL,
    "bedCount" integer NOT NULL,
    "updateReason" text,
    notes text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BedStatusUpdate" OWNER TO scooper;

--
-- Name: CapacityAlert; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."CapacityAlert" (
    id text NOT NULL,
    "emergencyDepartmentId" text NOT NULL,
    "alertType" public."CapacityAlertType" NOT NULL,
    severity public."AlertSeverity" NOT NULL,
    message text NOT NULL,
    threshold integer NOT NULL,
    "currentValue" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "acknowledgedBy" text,
    "acknowledgedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CapacityAlert" OWNER TO scooper;

--
-- Name: DemandPattern; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."DemandPattern" (
    id text NOT NULL,
    "facilityId" text NOT NULL,
    "patternType" public."PatternType" NOT NULL,
    "dayOfWeek" integer,
    "hourOfDay" integer,
    "averageDemand" double precision NOT NULL,
    "peakDemand" double precision NOT NULL,
    "seasonalFactor" double precision DEFAULT 1.0 NOT NULL,
    "trendDirection" public."TrendDirection" NOT NULL,
    confidence double precision DEFAULT 0.8 NOT NULL,
    "dataPoints" integer DEFAULT 0 NOT NULL,
    "lastUpdated" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DemandPattern" OWNER TO scooper;

--
-- Name: DistanceMatrix; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."DistanceMatrix" (
    id text NOT NULL,
    "fromFacilityId" text NOT NULL,
    "toFacilityId" text NOT NULL,
    "distanceMiles" double precision NOT NULL,
    "estimatedTimeMinutes" integer NOT NULL,
    "trafficFactor" double precision DEFAULT 1.0 NOT NULL,
    tolls double precision DEFAULT 0.0 NOT NULL,
    "fuelEfficiency" double precision,
    "routeType" public."RouteType" DEFAULT 'FASTEST'::public."RouteType" NOT NULL,
    "lastUpdated" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DistanceMatrix" OWNER TO scooper;

--
-- Name: ETAUpdate; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."ETAUpdate" (
    id text NOT NULL,
    "gpsTrackingId" text NOT NULL,
    "destinationId" text NOT NULL,
    "destinationType" public."DestinationType" NOT NULL,
    "currentETA" timestamp(3) without time zone NOT NULL,
    "previousETA" timestamp(3) without time zone,
    "trafficFactor" double precision DEFAULT 1.0 NOT NULL,
    "weatherFactor" double precision DEFAULT 1.0 NOT NULL,
    "routeConditions" jsonb,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."ETAUpdate" OWNER TO scooper;

--
-- Name: EmergencyDepartment; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."EmergencyDepartment" (
    id text NOT NULL,
    "facilityId" text NOT NULL,
    name text NOT NULL,
    "totalBeds" integer NOT NULL,
    "availableBeds" integer NOT NULL,
    "occupiedBeds" integer NOT NULL,
    "hallwayBeds" integer NOT NULL,
    "criticalBeds" integer NOT NULL,
    "capacityThreshold" integer DEFAULT 80 NOT NULL,
    "currentCensus" integer NOT NULL,
    "transportQueueLength" integer DEFAULT 0 NOT NULL,
    "averageWaitTime" integer DEFAULT 0 NOT NULL,
    "peakHours" jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EmergencyDepartment" OWNER TO scooper;

--
-- Name: Facility; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."Facility" (
    id text NOT NULL,
    name text NOT NULL,
    type public."FacilityType" NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    "zipCode" text NOT NULL,
    coordinates jsonb,
    phone text,
    email text,
    "operatingHours" jsonb,
    capabilities jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Facility" OWNER TO scooper;

--
-- Name: GPSTracking; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."GPSTracking" (
    id text NOT NULL,
    "unitId" text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    altitude double precision,
    speed double precision,
    heading double precision,
    accuracy double precision,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "batteryLevel" double precision,
    "signalStrength" double precision,
    "locationType" public."LocationType" DEFAULT 'GPS'::public."LocationType" NOT NULL,
    source public."LocationSource" DEFAULT 'UNIT_DEVICE'::public."LocationSource" NOT NULL
);


ALTER TABLE public."GPSTracking" OWNER TO scooper;

--
-- Name: GeofenceEvent; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."GeofenceEvent" (
    id text NOT NULL,
    "gpsTrackingId" text NOT NULL,
    "facilityId" text,
    "geofenceType" public."GeofenceType" NOT NULL,
    "eventType" public."GeofenceEventType" NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    radius double precision NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    notes text
);


ALTER TABLE public."GeofenceEvent" OWNER TO scooper;

--
-- Name: GroundTransportCoordination; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."GroundTransportCoordination" (
    id text NOT NULL,
    "airMedicalTransportId" text NOT NULL,
    "groundTransportId" text,
    "coordinationType" public."CoordinationType" NOT NULL,
    status public."CoordinationStatus" DEFAULT 'PENDING'::public."CoordinationStatus" NOT NULL,
    "handoffLocation" text NOT NULL,
    "handoffTime" timestamp(3) without time zone,
    "handoffNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GroundTransportCoordination" OWNER TO scooper;

--
-- Name: HospitalAgencyPreference; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."HospitalAgencyPreference" (
    id text NOT NULL,
    "hospitalId" text NOT NULL,
    "agencyId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "preferenceOrder" integer DEFAULT 0 NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HospitalAgencyPreference" OWNER TO scooper;

--
-- Name: LocationHistory; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."LocationHistory" (
    id text NOT NULL,
    "gpsTrackingId" text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    altitude double precision,
    speed double precision,
    heading double precision,
    accuracy double precision,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "locationType" public."LocationType" DEFAULT 'GPS'::public."LocationType" NOT NULL,
    source public."LocationSource" DEFAULT 'UNIT_DEVICE'::public."LocationSource" NOT NULL
);


ALTER TABLE public."LocationHistory" OWNER TO scooper;

--
-- Name: LongDistanceTransport; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."LongDistanceTransport" (
    id text NOT NULL,
    "transportNumber" text NOT NULL,
    "coordinatorId" text NOT NULL,
    status public."LongDistanceStatus" DEFAULT 'PLANNING'::public."LongDistanceStatus" NOT NULL,
    "totalDistance" double precision NOT NULL,
    "estimatedDuration" integer NOT NULL,
    "plannedStartTime" timestamp(3) without time zone NOT NULL,
    "plannedEndTime" timestamp(3) without time zone NOT NULL,
    "isMultiLeg" boolean DEFAULT false NOT NULL,
    "legCount" integer NOT NULL,
    "assignedAgencyId" text,
    "assignedUnitId" text,
    "costEstimate" double precision NOT NULL,
    "revenuePotential" double precision NOT NULL,
    "weatherConditions" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LongDistanceTransport" OWNER TO scooper;

--
-- Name: MultiPatientTransport; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."MultiPatientTransport" (
    id text NOT NULL,
    "batchNumber" text NOT NULL,
    "coordinatorId" text NOT NULL,
    status public."MultiPatientStatus" DEFAULT 'PLANNING'::public."MultiPatientStatus" NOT NULL,
    "totalPatients" integer NOT NULL,
    "totalDistance" double precision NOT NULL,
    "estimatedDuration" integer NOT NULL,
    "plannedStartTime" timestamp(3) without time zone NOT NULL,
    "plannedEndTime" timestamp(3) without time zone NOT NULL,
    "assignedAgencyId" text,
    "assignedUnitId" text,
    "routeOptimizationScore" double precision,
    "costSavings" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MultiPatientTransport" OWNER TO scooper;

--
-- Name: PatientTransport; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."PatientTransport" (
    id text NOT NULL,
    "multiPatientTransportId" text NOT NULL,
    "patientId" text NOT NULL,
    "originFacilityId" text NOT NULL,
    "destinationFacilityId" text NOT NULL,
    "transportLevel" public."TransportLevel" NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    "specialRequirements" text,
    "sequenceOrder" integer NOT NULL,
    "estimatedPickupTime" timestamp(3) without time zone NOT NULL,
    "estimatedDropoffTime" timestamp(3) without time zone NOT NULL,
    "actualPickupTime" timestamp(3) without time zone,
    "actualDropoffTime" timestamp(3) without time zone,
    status public."PatientTransportStatus" DEFAULT 'PENDING'::public."PatientTransportStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PatientTransport" OWNER TO scooper;

--
-- Name: ProviderForecast; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."ProviderForecast" (
    id text NOT NULL,
    "agencyId" text NOT NULL,
    "forecastDate" timestamp(3) without time zone NOT NULL,
    "forecastType" public."ForecastType" NOT NULL,
    "predictedDemand" integer NOT NULL,
    "availableCapacity" integer NOT NULL,
    "capacityUtilization" double precision NOT NULL,
    confidence double precision DEFAULT 0.8 NOT NULL,
    factors jsonb,
    recommendations text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProviderForecast" OWNER TO scooper;

--
-- Name: Route; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."Route" (
    id text NOT NULL,
    "routeNumber" text NOT NULL,
    "agencyId" text NOT NULL,
    "assignedUnitId" text,
    status public."RouteStatus" DEFAULT 'PLANNED'::public."RouteStatus" NOT NULL,
    "totalDistanceMiles" double precision NOT NULL,
    "estimatedTimeMinutes" integer NOT NULL,
    "emptyMilesReduction" double precision,
    "revenueOptimizationScore" double precision,
    "chainedTripCount" integer DEFAULT 0 NOT NULL,
    "estimatedRevenue" double precision,
    "plannedStartTime" timestamp(3) without time zone,
    "actualStartTime" timestamp(3) without time zone,
    "completionTime" timestamp(3) without time zone,
    "timeWindowStart" timestamp(3) without time zone,
    "timeWindowEnd" timestamp(3) without time zone,
    "optimizationType" public."RouteOptimizationType",
    "milesSaved" double precision,
    "unitsSaved" integer,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Route" OWNER TO scooper;

--
-- Name: RouteDeviation; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."RouteDeviation" (
    id text NOT NULL,
    "gpsTrackingId" text NOT NULL,
    "routeId" text,
    "deviationType" public."DeviationType" NOT NULL,
    severity public."AlertSeverity" NOT NULL,
    description text NOT NULL,
    "currentLatitude" double precision NOT NULL,
    "currentLongitude" double precision NOT NULL,
    "expectedLatitude" double precision NOT NULL,
    "expectedLongitude" double precision NOT NULL,
    "distanceOffRoute" double precision NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isResolved" boolean DEFAULT false NOT NULL,
    "resolvedAt" timestamp(3) without time zone,
    "resolvedBy" text,
    "resolutionNotes" text
);


ALTER TABLE public."RouteDeviation" OWNER TO scooper;

--
-- Name: RouteStop; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."RouteStop" (
    id text NOT NULL,
    "routeId" text NOT NULL,
    "stopOrder" integer NOT NULL,
    "facilityId" text NOT NULL,
    "transportRequestId" text,
    "stopType" public."StopType" NOT NULL,
    "estimatedArrival" timestamp(3) without time zone,
    "actualArrival" timestamp(3) without time zone,
    "estimatedDeparture" timestamp(3) without time zone,
    "actualDeparture" timestamp(3) without time zone,
    "stopDuration" integer,
    notes text,
    "multiPatientTransportId" text
);


ALTER TABLE public."RouteStop" OWNER TO scooper;

--
-- Name: ServiceArea; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."ServiceArea" (
    id text NOT NULL,
    "agencyId" text NOT NULL,
    name text NOT NULL,
    description text,
    "geographicBoundaries" jsonb NOT NULL,
    "coverageRadius" double precision,
    "primaryServiceArea" boolean DEFAULT false NOT NULL,
    "operatingHours" jsonb,
    "specialRestrictions" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ServiceArea" OWNER TO scooper;

--
-- Name: TrafficCondition; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."TrafficCondition" (
    id text NOT NULL,
    location text NOT NULL,
    severity public."TrafficSeverity" NOT NULL,
    description text NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone,
    "impactFactor" double precision DEFAULT 1.0 NOT NULL,
    "affectedRoutes" jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TrafficCondition" OWNER TO scooper;

--
-- Name: TransportAgency; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."TransportAgency" (
    id text NOT NULL,
    name text NOT NULL,
    "contactName" text,
    phone text NOT NULL,
    email text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    "zipCode" text NOT NULL,
    "serviceArea" jsonb,
    "operatingHours" jsonb,
    capabilities jsonb,
    "pricingStructure" jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "addedBy" text,
    status public."ServiceStatus" DEFAULT 'ACTIVE'::public."ServiceStatus" NOT NULL,
    "addedAt" timestamp(3) without time zone
);


ALTER TABLE public."TransportAgency" OWNER TO scooper;

--
-- Name: TransportBid; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."TransportBid" (
    id text NOT NULL,
    "transportRequestId" text NOT NULL,
    "agencyId" text NOT NULL,
    "agencyUserId" text NOT NULL,
    "bidAmount" double precision,
    "estimatedArrival" timestamp(3) without time zone,
    "unitType" public."TransportLevel" NOT NULL,
    "specialCapabilities" jsonb,
    notes text,
    status public."BidStatus" DEFAULT 'PENDING'::public."BidStatus" NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAt" timestamp(3) without time zone,
    "reviewedBy" text,
    "reviewNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TransportBid" OWNER TO scooper;

--
-- Name: TransportLeg; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."TransportLeg" (
    id text NOT NULL,
    "longDistanceTransportId" text NOT NULL,
    "legNumber" integer NOT NULL,
    "originFacilityId" text NOT NULL,
    "destinationFacilityId" text NOT NULL,
    distance double precision NOT NULL,
    "estimatedDuration" integer NOT NULL,
    "plannedStartTime" timestamp(3) without time zone NOT NULL,
    "plannedEndTime" timestamp(3) without time zone NOT NULL,
    "actualStartTime" timestamp(3) without time zone,
    "actualEndTime" timestamp(3) without time zone,
    status public."LegStatus" DEFAULT 'PLANNED'::public."LegStatus" NOT NULL,
    "patientId" text,
    "transportLevel" public."TransportLevel" NOT NULL,
    "specialRequirements" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TransportLeg" OWNER TO scooper;

--
-- Name: TransportQueue; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."TransportQueue" (
    id text NOT NULL,
    "emergencyDepartmentId" text NOT NULL,
    "transportRequestId" text NOT NULL,
    "queuePosition" integer NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    "waitTime" integer DEFAULT 0 NOT NULL,
    "estimatedWaitTime" integer,
    status public."QueueStatus" DEFAULT 'WAITING'::public."QueueStatus" NOT NULL,
    "assignedProviderId" text,
    "assignedUnitId" text,
    "queueTimestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignedTimestamp" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TransportQueue" OWNER TO scooper;

--
-- Name: TransportRequest; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."TransportRequest" (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "originFacilityId" text NOT NULL,
    "destinationFacilityId" text NOT NULL,
    "transportLevel" public."TransportLevel" NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "specialRequirements" text,
    "requestTimestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "pickupTimestamp" timestamp(3) without time zone,
    "completionTimestamp" timestamp(3) without time zone,
    "assignedAgencyId" text,
    "assignedUnitId" text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "routeOptimizationScore" double precision,
    "chainingOpportunities" jsonb,
    "timeFlexibility" integer,
    "revenuePotential" double precision,
    "acceptedTimestamp" timestamp(3) without time zone,
    "cancellationReason" text,
    "estimatedArrivalTime" timestamp(3) without time zone,
    "estimatedPickupTime" timestamp(3) without time zone,
    "etaUpdates" jsonb
);


ALTER TABLE public."TransportRequest" OWNER TO scooper;

--
-- Name: Unit; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."Unit" (
    id text NOT NULL,
    "agencyId" text NOT NULL,
    "unitNumber" text NOT NULL,
    type public."TransportLevel" NOT NULL,
    capabilities jsonb,
    "currentStatus" public."UnitStatus" DEFAULT 'AVAILABLE'::public."UnitStatus" NOT NULL,
    "currentLocation" jsonb,
    "shiftStart" timestamp(3) without time zone,
    "shiftEnd" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Unit" OWNER TO scooper;

--
-- Name: UnitAssignment; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."UnitAssignment" (
    id text NOT NULL,
    "unitId" text NOT NULL,
    "unitAvailabilityId" text NOT NULL,
    "transportRequestId" text,
    "assignmentType" public."AssignmentType" NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone,
    status public."AssignmentStatus" DEFAULT 'ACTIVE'::public."AssignmentStatus" NOT NULL,
    notes text,
    "assignedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UnitAssignment" OWNER TO scooper;

--
-- Name: UnitAvailability; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."UnitAvailability" (
    id text NOT NULL,
    "unitId" text NOT NULL,
    status public."UnitStatus" DEFAULT 'AVAILABLE'::public."UnitStatus" NOT NULL,
    location jsonb,
    "shiftStart" timestamp(3) without time zone,
    "shiftEnd" timestamp(3) without time zone,
    "crewMembers" jsonb,
    "currentAssignment" text,
    notes text,
    "lastUpdated" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UnitAvailability" OWNER TO scooper;

--
-- Name: User; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text,
    role public."UserRole" DEFAULT 'COORDINATOR'::public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO scooper;

--
-- Name: WeatherAlert; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."WeatherAlert" (
    id text NOT NULL,
    "alertType" public."WeatherAlertType" NOT NULL,
    severity public."AlertSeverity" NOT NULL,
    location text NOT NULL,
    description text NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    impact text NOT NULL,
    recommendations text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WeatherAlert" OWNER TO scooper;

--
-- Name: WeatherImpact; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."WeatherImpact" (
    id text NOT NULL,
    location text NOT NULL,
    "weatherType" public."WeatherConditions" NOT NULL,
    "impactLevel" public."WeatherImpactLevel" NOT NULL,
    description text NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone,
    "travelDelayFactor" double precision DEFAULT 1.0 NOT NULL,
    "affectedAreas" jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WeatherImpact" OWNER TO scooper;

--
-- Name: WeatherUpdate; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."WeatherUpdate" (
    id text NOT NULL,
    "longDistanceTransportId" text,
    "cloudCover" integer NOT NULL,
    location text NOT NULL,
    "multiPatientTransportId" text,
    precipitation double precision NOT NULL,
    temperature double precision NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    visibility double precision NOT NULL,
    "weatherConditions" public."WeatherConditions" NOT NULL,
    "windDirection" text NOT NULL,
    "windSpeed" double precision NOT NULL
);


ALTER TABLE public."WeatherUpdate" OWNER TO scooper;

--
-- Name: _AirMedicalResourceToWeatherAlert; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."_AirMedicalResourceToWeatherAlert" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_AirMedicalResourceToWeatherAlert" OWNER TO scooper;

--
-- Name: _AirMedicalTransportToWeatherAlert; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."_AirMedicalTransportToWeatherAlert" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_AirMedicalTransportToWeatherAlert" OWNER TO scooper;

--
-- Name: _RouteToTransportRequest; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public."_RouteToTransportRequest" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_RouteToTransportRequest" OWNER TO scooper;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO scooper;

--
-- Data for Name: AgencyPerformance; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."AgencyPerformance" (id, "agencyId", "periodStart", "periodEnd", "totalTransports", "completedTransports", "cancelledTransports", "averageResponseTime", "totalMiles", "revenueGenerated", "customerSatisfaction", "onTimePercentage", "safetyIncidents", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AgencyProfile; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."AgencyProfile" (id, "agencyId", description, website, "licenseNumber", "insuranceInfo", certifications, specializations, "emergencyProcedures", "contactPerson", "emergencyContact", "emergencyPhone", "serviceAreaNotes", "operatingNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AgencyUser; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."AgencyUser" (id, "agencyId", email, password, name, role, phone, "isActive", "lastLogin", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AirMedicalResource; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."AirMedicalResource" (id, "resourceType", identifier, "baseLocation", "serviceArea", capabilities, "crewSize", "maxRange", "maxPayload", "weatherMinimums", "operatingHours", "contactInfo", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AirMedicalTransport; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."AirMedicalTransport" (id, "transportRequestId", "multiPatientTransportId", "longDistanceTransportId", "airMedicalResourceId", status, "flightPlan", "weatherConditions", "estimatedDeparture", "estimatedArrival", "actualDeparture", "actualArrival", "groundingReason", "weatherDelay", "crewNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BedStatusUpdate; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."BedStatusUpdate" (id, "emergencyDepartmentId", "updateType", "bedCount", "updateReason", notes, "updatedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: CapacityAlert; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."CapacityAlert" (id, "emergencyDepartmentId", "alertType", severity, message, threshold, "currentValue", "isActive", "acknowledgedBy", "acknowledgedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DemandPattern; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."DemandPattern" (id, "facilityId", "patternType", "dayOfWeek", "hourOfDay", "averageDemand", "peakDemand", "seasonalFactor", "trendDirection", confidence, "dataPoints", "lastUpdated", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DistanceMatrix; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."DistanceMatrix" (id, "fromFacilityId", "toFacilityId", "distanceMiles", "estimatedTimeMinutes", "trafficFactor", tolls, "fuelEfficiency", "routeType", "lastUpdated") FROM stdin;
cmf2mdtef000uccy4qitkq6ni	cmf2mdtdu0000ccy49dqtj6gg	cmf2mdtdx0001ccy44vgm2ved	0.3	1	1	0	8	FASTEST	2025-09-02 14:04:33.688
cmf2mdtei000wccy4wy3rio3y	cmf2mdtdu0000ccy49dqtj6gg	cmf2mdtdy0002ccy4ojmtza9c	2.6	7	1	0	8	FASTEST	2025-09-02 14:04:33.69
cmf2mdtej000yccy42r6bkhmn	cmf2mdtdu0000ccy49dqtj6gg	cmf2mdtdz0003ccy46gfr4zv0	6.5	16	1	0	8	FASTEST	2025-09-02 14:04:33.691
cmf2mdtej0010ccy4yl4649ql	cmf2mdtdu0000ccy49dqtj6gg	cmf2mdtdz0004ccy4kges8lek	2.6	7	1	0	8	FASTEST	2025-09-02 14:04:33.692
cmf2mdtek0012ccy4z20rr5f7	cmf2mdtdx0001ccy44vgm2ved	cmf2mdtdu0000ccy49dqtj6gg	0.3	1	1	0	8	FASTEST	2025-09-02 14:04:33.693
cmf2mdtel0014ccy4c9uj8ke5	cmf2mdtdx0001ccy44vgm2ved	cmf2mdtdy0002ccy4ojmtza9c	2.3	6	1	0	8	FASTEST	2025-09-02 14:04:33.693
cmf2mdtem0016ccy4aw6r3o7q	cmf2mdtdx0001ccy44vgm2ved	cmf2mdtdz0003ccy46gfr4zv0	6.2	16	1	0	8	FASTEST	2025-09-02 14:04:33.694
cmf2mdtem0018ccy43gt96h5y	cmf2mdtdx0001ccy44vgm2ved	cmf2mdtdz0004ccy4kges8lek	2.3	6	1	0	8	FASTEST	2025-09-02 14:04:33.695
cmf2mdten001accy4retvuds8	cmf2mdtdy0002ccy4ojmtza9c	cmf2mdtdu0000ccy49dqtj6gg	2.6	7	1	0	8	FASTEST	2025-09-02 14:04:33.695
cmf2mdteo001cccy4fowxtjii	cmf2mdtdy0002ccy4ojmtza9c	cmf2mdtdx0001ccy44vgm2ved	2.3	6	1	0	8	FASTEST	2025-09-02 14:04:33.696
cmf2mdteo001eccy4rx1eyuau	cmf2mdtdy0002ccy4ojmtza9c	cmf2mdtdz0003ccy46gfr4zv0	3.9	10	1	0	8	FASTEST	2025-09-02 14:04:33.696
cmf2mdteo001gccy479ibapp9	cmf2mdtdy0002ccy4ojmtza9c	cmf2mdtdz0004ccy4kges8lek	2.9	7	1	0	8	FASTEST	2025-09-02 14:04:33.697
cmf2mdtep001iccy4s6ees9v5	cmf2mdtdz0003ccy46gfr4zv0	cmf2mdtdu0000ccy49dqtj6gg	6.5	16	1	0	8	FASTEST	2025-09-02 14:04:33.697
cmf2mdteq001kccy4cdo051fw	cmf2mdtdz0003ccy46gfr4zv0	cmf2mdtdx0001ccy44vgm2ved	6.2	16	1	0	8	FASTEST	2025-09-02 14:04:33.698
cmf2mdteq001mccy4352q4lze	cmf2mdtdz0003ccy46gfr4zv0	cmf2mdtdy0002ccy4ojmtza9c	3.9	10	1	0	8	FASTEST	2025-09-02 14:04:33.698
cmf2mdter001occy40v2uruvx	cmf2mdtdz0003ccy46gfr4zv0	cmf2mdtdz0004ccy4kges8lek	6.2	16	1	0	8	FASTEST	2025-09-02 14:04:33.699
cmf2mdter001qccy4pr8bvr6t	cmf2mdtdz0004ccy4kges8lek	cmf2mdtdu0000ccy49dqtj6gg	2.6	7	1	0	8	FASTEST	2025-09-02 14:04:33.7
cmf2mdtes001sccy4rcur31io	cmf2mdtdz0004ccy4kges8lek	cmf2mdtdx0001ccy44vgm2ved	2.3	6	1	0	8	FASTEST	2025-09-02 14:04:33.7
cmf2mdtes001uccy4blqvxyfk	cmf2mdtdz0004ccy4kges8lek	cmf2mdtdy0002ccy4ojmtza9c	2.9	7	1	0	8	FASTEST	2025-09-02 14:04:33.701
cmf2mdtet001wccy488lhgdla	cmf2mdtdz0004ccy4kges8lek	cmf2mdtdz0003ccy46gfr4zv0	6.2	16	1	0	8	FASTEST	2025-09-02 14:04:33.701
\.


--
-- Data for Name: ETAUpdate; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."ETAUpdate" (id, "gpsTrackingId", "destinationId", "destinationType", "currentETA", "previousETA", "trafficFactor", "weatherFactor", "routeConditions", "timestamp", "isActive") FROM stdin;
\.


--
-- Data for Name: EmergencyDepartment; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."EmergencyDepartment" (id, "facilityId", name, "totalBeds", "availableBeds", "occupiedBeds", "hallwayBeds", "criticalBeds", "capacityThreshold", "currentCensus", "transportQueueLength", "averageWaitTime", "peakHours", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Facility; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."Facility" (id, name, type, address, city, state, "zipCode", coordinates, phone, email, "operatingHours", capabilities, "isActive", "createdAt", "updatedAt") FROM stdin;
cmf2md56h0000ccfcwvc3ioiy	Penn Highlands Dubois	HOSPITAL	100 Hospital Ave	Dubois	PA	15801	{"lat": 41.1198, "lng": -78.7603}	814-371-2200	info@phhealthcare.org	{"open": "24/7"}	["EMERGENCY", "ICU", "SURGERY"]	t	2025-09-02 14:04:02.297	2025-09-02 14:04:02.297
cmf2mdtdu0000ccy49dqtj6gg	Pennsylvania Hospital	HOSPITAL	800 Spruce St	Philadelphia	PA	19107	{"lat": 39.9447, "lng": -75.155}	\N	\N	\N	["EMERGENCY", "ICU", "SURGERY", "REHAB"]	t	2025-09-02 14:04:33.667	2025-09-02 14:04:33.667
cmf2mdtdx0001ccy44vgm2ved	Jefferson University Hospital	HOSPITAL	111 S 11th St	Philadelphia	PA	19107	{"lat": 39.9489, "lng": -75.1578}	\N	\N	\N	["EMERGENCY", "ICU", "SURGERY", "CARDIOLOGY"]	t	2025-09-02 14:04:33.67	2025-09-02 14:04:33.67
cmf2mdtdy0002ccy4ojmtza9c	Temple University Hospital	HOSPITAL	3401 N Broad St	Philadelphia	PA	19140	{"lat": 39.9817, "lng": -75.155}	\N	\N	\N	["EMERGENCY", "ICU", "SURGERY", "TRAUMA"]	t	2025-09-02 14:04:33.67	2025-09-02 14:04:33.67
cmf2mdtdz0003ccy46gfr4zv0	Einstein Medical Center	HOSPITAL	5501 Old York Rd	Philadelphia	PA	19141	{"lat": 40.0376, "lng": -75.142}	\N	\N	\N	["EMERGENCY", "ICU", "SURGERY", "PEDIATRICS"]	t	2025-09-02 14:04:33.671	2025-09-02 14:04:33.671
cmf2mdtdz0004ccy4kges8lek	Penn Presbyterian Medical Center	HOSPITAL	51 N 39th St	Philadelphia	PA	19104	{"lat": 39.9589, "lng": -75.2}	\N	\N	\N	["EMERGENCY", "ICU", "SURGERY", "ORTHOPEDICS"]	t	2025-09-02 14:04:33.672	2025-09-02 14:04:33.672
\.


--
-- Data for Name: GPSTracking; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."GPSTracking" (id, "unitId", latitude, longitude, altitude, speed, heading, accuracy, "timestamp", "isActive", "batteryLevel", "signalStrength", "locationType", source) FROM stdin;
\.


--
-- Data for Name: GeofenceEvent; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."GeofenceEvent" (id, "gpsTrackingId", "facilityId", "geofenceType", "eventType", latitude, longitude, radius, "timestamp", "isActive", notes) FROM stdin;
\.


--
-- Data for Name: GroundTransportCoordination; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."GroundTransportCoordination" (id, "airMedicalTransportId", "groundTransportId", "coordinationType", status, "handoffLocation", "handoffTime", "handoffNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HospitalAgencyPreference; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."HospitalAgencyPreference" (id, "hospitalId", "agencyId", "isActive", "preferenceOrder", notes, "createdAt", "updatedAt") FROM stdin;
cmf2lj2xb0001cccq134t264d	cmf2ifqi00001ccfabys4mmsv	cmf2j9c8o0001ccwbdhgkmhw2	t	0	\N	2025-09-02 13:40:39.695	2025-09-02 13:40:39.695
\.


--
-- Data for Name: LocationHistory; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."LocationHistory" (id, "gpsTrackingId", latitude, longitude, altitude, speed, heading, accuracy, "timestamp", "locationType", source) FROM stdin;
\.


--
-- Data for Name: LongDistanceTransport; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."LongDistanceTransport" (id, "transportNumber", "coordinatorId", status, "totalDistance", "estimatedDuration", "plannedStartTime", "plannedEndTime", "isMultiLeg", "legCount", "assignedAgencyId", "assignedUnitId", "costEstimate", "revenuePotential", "weatherConditions", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MultiPatientTransport; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."MultiPatientTransport" (id, "batchNumber", "coordinatorId", status, "totalPatients", "totalDistance", "estimatedDuration", "plannedStartTime", "plannedEndTime", "assignedAgencyId", "assignedUnitId", "routeOptimizationScore", "costSavings", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PatientTransport; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."PatientTransport" (id, "multiPatientTransportId", "patientId", "originFacilityId", "destinationFacilityId", "transportLevel", priority, "specialRequirements", "sequenceOrder", "estimatedPickupTime", "estimatedDropoffTime", "actualPickupTime", "actualDropoffTime", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProviderForecast; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."ProviderForecast" (id, "agencyId", "forecastDate", "forecastType", "predictedDemand", "availableCapacity", "capacityUtilization", confidence, factors, recommendations, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Route; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."Route" (id, "routeNumber", "agencyId", "assignedUnitId", status, "totalDistanceMiles", "estimatedTimeMinutes", "emptyMilesReduction", "revenueOptimizationScore", "chainedTripCount", "estimatedRevenue", "plannedStartTime", "actualStartTime", "completionTime", "timeWindowStart", "timeWindowEnd", "optimizationType", "milesSaved", "unitsSaved", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RouteDeviation; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."RouteDeviation" (id, "gpsTrackingId", "routeId", "deviationType", severity, description, "currentLatitude", "currentLongitude", "expectedLatitude", "expectedLongitude", "distanceOffRoute", "timestamp", "isResolved", "resolvedAt", "resolvedBy", "resolutionNotes") FROM stdin;
\.


--
-- Data for Name: RouteStop; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."RouteStop" (id, "routeId", "stopOrder", "facilityId", "transportRequestId", "stopType", "estimatedArrival", "actualArrival", "estimatedDeparture", "actualDeparture", "stopDuration", notes, "multiPatientTransportId") FROM stdin;
\.


--
-- Data for Name: ServiceArea; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."ServiceArea" (id, "agencyId", name, description, "geographicBoundaries", "coverageRadius", "primaryServiceArea", "operatingHours", "specialRestrictions", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TrafficCondition; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."TrafficCondition" (id, location, severity, description, "startTime", "endTime", "impactFactor", "affectedRoutes", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TransportAgency; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."TransportAgency" (id, name, "contactName", phone, email, address, city, state, "zipCode", "serviceArea", "operatingHours", capabilities, "pricingStructure", "isActive", "createdAt", "updatedAt", "addedBy", status, "addedAt") FROM stdin;
cmf2igfj30003cc38ic3sy7zy	Test EMS Service	John Doe	555-123-4567	test@ems.com	123 Main St	Altoona	PA	16601	\N	\N	\N	\N	t	2025-09-02 12:14:37.215	2025-09-02 12:14:37.215	cmf2ifqhu0000ccfaao4338dj	ACTIVE	2025-09-02 12:14:37.214
cmf2isvu90001cc6t3wu0pek4	Test Frontend Service	Jane Smith	555-999-8888	test@frontend.com	456 Test St	Altoona	PA	16601	"Test County, PA"	\N	["Emergency Response", "Critical Care"]	\N	t	2025-09-02 12:24:18.226	2025-09-02 12:24:18.226	cmf2ifqhu0000ccfaao4338dj	ACTIVE	2025-09-02 12:24:18.225
cmf2j9c8o0001ccwbdhgkmhw2	JET EMS	Chuck Ferrell	8146950813	chuck41090@mac.com	197 Fox Chase Drive	Duncansville	PA	16635	"PA"	\N	["Emergency Response", "Critical Care"]	\N	t	2025-09-02 12:37:05.976	2025-09-02 12:44:27.019	cmf2ifqhu0000ccfaao4338dj	ACTIVE	2025-09-02 12:37:05.975
cmf2j7cqc0003ccu9skcayno5	Debug Test Service	Debug User	555-000-0000	debug@test.com	123 Debug St	Debug City	DC	00000	"Debug Area"	\N	["Emergency Response"]	\N	f	2025-09-02 12:35:33.3	2025-09-02 12:46:41.753	cmf2ifqhu0000ccfaao4338dj	INACTIVE	2025-09-02 12:35:33.299
cmf2mdte00005ccy47a9kgu2u	Philadelphia EMS	John Smith	215-555-0101	info@phillyems.com	123 Main St	Philadelphia	PA	19107	{"center": {"lat": 39.9447, "lng": -75.155}, "radius": 50}	{"end": "18:00", "start": "06:00"}	["BLS", "ALS", "CCT"]	{"base": 150, "perMile": 2.5}	t	2025-09-02 14:04:33.672	2025-09-02 14:04:33.672	\N	ACTIVE	\N
cmf2mdte20006ccy441yvrx9h	Pennsylvania Ambulance Service	Sarah Johnson	215-555-0202	dispatch@paambulance.com	456 Oak Ave	Philadelphia	PA	19104	{"center": {"lat": 39.9589, "lng": -75.2}, "radius": 40}	{"end": "20:00", "start": "08:00"}	["BLS", "ALS"]	{"base": 140, "perMile": 2.25}	t	2025-09-02 14:04:33.674	2025-09-02 14:04:33.674	\N	ACTIVE	\N
\.


--
-- Data for Name: TransportBid; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."TransportBid" (id, "transportRequestId", "agencyId", "agencyUserId", "bidAmount", "estimatedArrival", "unitType", "specialCapabilities", notes, status, "submittedAt", "reviewedAt", "reviewedBy", "reviewNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TransportLeg; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."TransportLeg" (id, "longDistanceTransportId", "legNumber", "originFacilityId", "destinationFacilityId", distance, "estimatedDuration", "plannedStartTime", "plannedEndTime", "actualStartTime", "actualEndTime", status, "patientId", "transportLevel", "specialRequirements", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TransportQueue; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."TransportQueue" (id, "emergencyDepartmentId", "transportRequestId", "queuePosition", priority, "waitTime", "estimatedWaitTime", status, "assignedProviderId", "assignedUnitId", "queueTimestamp", "assignedTimestamp", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TransportRequest; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."TransportRequest" (id, "patientId", "originFacilityId", "destinationFacilityId", "transportLevel", priority, status, "specialRequirements", "requestTimestamp", "pickupTimestamp", "completionTimestamp", "assignedAgencyId", "assignedUnitId", "createdById", "createdAt", "updatedAt", "routeOptimizationScore", "chainingOpportunities", "timeFlexibility", "revenuePotential", "acceptedTimestamp", "cancellationReason", "estimatedArrivalTime", "estimatedPickupTime", "etaUpdates") FROM stdin;
cmf2mdte8000iccy42st4meyr	demo-patient-001	cmf2mdtdu0000ccy49dqtj6gg	cmf2mdtdx0001ccy44vgm2ved	BLS	MEDIUM	PENDING	Wheelchair accessible	2025-09-02 14:04:33.681	2025-01-23 10:00:00	2025-01-23 11:00:00	\N	\N	cmf2mdpnx0000ccuti77tb3s9	2025-09-02 14:04:33.681	2025-09-02 14:04:33.681	75	["TEMPORAL", "SPATIAL"]	30	150	\N	\N	\N	\N	\N
cmf2mdteb000kccy43pfunzhj	demo-patient-002	cmf2mdtdx0001ccy44vgm2ved	cmf2mdtdu0000ccy49dqtj6gg	BLS	MEDIUM	PENDING	Oxygen required	2025-09-02 14:04:33.684	2025-01-23 11:30:00	2025-01-23 12:30:00	\N	\N	cmf2mdpnx0000ccuti77tb3s9	2025-09-02 14:04:33.684	2025-09-02 14:04:33.684	80	["RETURN_TRIP", "TEMPORAL"]	45	160	\N	\N	\N	\N	\N
cmf2mdtec000mccy443k552s6	demo-patient-003	cmf2mdtdu0000ccy49dqtj6gg	cmf2mdtdy0002ccy4ojmtza9c	ALS	HIGH	PENDING	Cardiac monitoring	2025-09-02 14:04:33.684	2025-01-23 14:00:00	2025-01-23 15:00:00	\N	\N	cmf2mdpnx0000ccuti77tb3s9	2025-09-02 14:04:33.684	2025-09-02 14:04:33.684	70	["MULTI_STOP", "SPATIAL"]	60	180	\N	\N	\N	\N	\N
cmf2mdted000occy40ymjthn0	demo-patient-004	cmf2mdtdy0002ccy4ojmtza9c	cmf2mdtdz0003ccy46gfr4zv0	BLS	MEDIUM	PENDING	Stretcher transport	2025-09-02 14:04:33.685	2025-01-23 15:30:00	2025-01-23 16:30:00	\N	\N	cmf2mdpnx0000ccuti77tb3s9	2025-09-02 14:04:33.685	2025-09-02 14:04:33.685	65	["GEOGRAPHIC", "TEMPORAL"]	40	140	\N	\N	\N	\N	\N
cmf2mdted000qccy4j58r4hte	demo-patient-005	cmf2mdtdz0003ccy46gfr4zv0	cmf2mdtdz0004ccy4kges8lek	CCT	URGENT	PENDING	Ventilator support	2025-09-02 14:04:33.686	2025-01-23 16:00:00	2025-01-23 17:00:00	\N	\N	cmf2mdpnx0000ccuti77tb3s9	2025-09-02 14:04:33.686	2025-09-02 14:04:33.686	85	["REVENUE_MAX", "TEMPORAL"]	25	220	\N	\N	\N	\N	\N
cmf2mdtee000sccy45cfh1nxn	demo-patient-006	cmf2mdtdz0004ccy4kges8lek	cmf2mdtdu0000ccy49dqtj6gg	BLS	MEDIUM	PENDING	Basic transport	2025-09-02 14:04:33.687	2025-01-23 17:30:00	2025-01-23 18:30:00	\N	\N	cmf2mdpnx0000ccuti77tb3s9	2025-09-02 14:04:33.687	2025-09-02 14:04:33.687	72	["RETURN_TRIP", "SPATIAL"]	35	155	\N	\N	\N	\N	\N
cmf2mnhqx0001ccz5fg2wpjhu	PT-TEST-123	cmf2mdtdz0003ccy46gfr4zv0	cmf2mdtdx0001ccy44vgm2ved	BLS	LOW	PENDING	Test requirements	2025-09-02 14:12:05.145	\N	\N	\N	\N	cmf2mdpnx0000ccuti77tb3s9	2025-09-02 14:12:05.145	2025-09-02 14:12:05.145	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmf2mrd930001ccbbr75p4e83	PT-TEST-456	cmf2mdtdz0003ccy46gfr4zv0	cmf2mdtdx0001ccy44vgm2ved	BLS	LOW	PENDING	Test requirements	2025-09-02 14:15:05.943	\N	\N	\N	\N	cmf2mdpnx0000ccuti77tb3s9	2025-09-02 14:15:05.943	2025-09-02 14:15:05.943	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmf2mt88i0003ccbbb12yanzh	PMTC1NJGY	cmf2mdtdz0003ccy46gfr4zv0	cmf2mdtdx0001ccy44vgm2ved	CCT	URGENT	PENDING	stretcher; Oxygen Required; Continuous Monitoring Required; Help	2025-09-02 14:16:32.755	\N	\N	\N	\N	cmf2ifqi00001ccfabys4mmsv	2025-09-02 14:16:32.755	2025-09-02 14:16:32.755	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmf2mtpxe0005ccbbaw20z5fw	PMTC1NJGY	cmf2mdtdz0003ccy46gfr4zv0	cmf2mdtdx0001ccy44vgm2ved	CCT	URGENT	PENDING	stretcher; Oxygen Required; Continuous Monitoring Required; Help	2025-09-02 14:16:55.683	\N	\N	\N	\N	cmf2ifqi00001ccfabys4mmsv	2025-09-02 14:16:55.683	2025-09-02 14:16:55.683	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmf2mu8fn0007ccbbsnsewtgd	PMTC1NJGY	cmf2mdtdz0003ccy46gfr4zv0	cmf2mdtdx0001ccy44vgm2ved	CCT	URGENT	PENDING	stretcher; Oxygen Required; Continuous Monitoring Required; Help	2025-09-02 14:17:19.667	\N	\N	\N	\N	cmf2ifqi00001ccfabys4mmsv	2025-09-02 14:17:19.667	2025-09-02 14:17:19.667	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmf2n28ka0009ccbb9wf3r5af	PMTC1NJGY	cmf2mdtdz0003ccy46gfr4zv0	cmf2mdtdx0001ccy44vgm2ved	CCT	URGENT	PENDING	stretcher; Oxygen Required; Continuous Monitoring Required; help	2025-09-02 14:23:33.083	\N	\N	\N	\N	cmf2ifqi00001ccfabys4mmsv	2025-09-02 14:23:33.083	2025-09-02 14:23:33.083	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmf2nf819000bccbbf7tiul61	PMTC1NJGY	cmf2mdtdz0003ccy46gfr4zv0	cmf2mdtdx0001ccy44vgm2ved	BLS	LOW	PENDING	wheelchair; Oxygen Required; Continuous Monitoring Required; help	2025-09-02 14:33:38.925	\N	\N	\N	\N	cmf2ifqi00001ccfabys4mmsv	2025-09-02 14:33:38.925	2025-09-02 14:33:38.925	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmf2nmg6c000dccbb1m9luvnx	PMTC1NJGY	cmf2mdtdz0003ccy46gfr4zv0	cmf2mdtdx0001ccy44vgm2ved	ALS	URGENT	PENDING	ambulatory; Oxygen Required; Continuous Monitoring Required; TEST	2025-09-02 14:39:16.068	\N	\N	\N	\N	cmf2ifqi00001ccfabys4mmsv	2025-09-02 14:39:16.068	2025-09-02 14:39:16.068	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: Unit; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."Unit" (id, "agencyId", "unitNumber", type, capabilities, "currentStatus", "currentLocation", "shiftStart", "shiftEnd", "isActive", "createdAt", "updatedAt") FROM stdin;
cmf2mdte30008ccy4fjz8v45y	cmf2mdte00005ccy47a9kgu2u	BLS-001	BLS	\N	AVAILABLE	{"lat": 39.9447, "lng": -75.155}	\N	\N	t	2025-09-02 14:04:33.675	2025-09-02 14:04:33.675
cmf2mdte4000accy4nysx4mt6	cmf2mdte00005ccy47a9kgu2u	BLS-002	BLS	\N	AVAILABLE	{"lat": 39.9489, "lng": -75.1578}	\N	\N	t	2025-09-02 14:04:33.677	2025-09-02 14:04:33.677
cmf2mdte5000cccy4pxhgn9fd	cmf2mdte00005ccy47a9kgu2u	ALS-001	ALS	\N	AVAILABLE	{"lat": 39.9817, "lng": -75.155}	\N	\N	t	2025-09-02 14:04:33.677	2025-09-02 14:04:33.677
cmf2mdte5000eccy4s3fjjm2t	cmf2mdte00005ccy47a9kgu2u	CCT-001	CCT	\N	AVAILABLE	{"lat": 40.0376, "lng": -75.142}	\N	\N	t	2025-09-02 14:04:33.678	2025-09-02 14:04:33.678
cmf2mdte6000gccy433f8h38v	cmf2mdte20006ccy441yvrx9h	CCT-002	CCT	\N	AVAILABLE	{"lat": 39.9589, "lng": -75.2}	\N	\N	t	2025-09-02 14:04:33.678	2025-09-02 14:04:33.678
\.


--
-- Data for Name: UnitAssignment; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."UnitAssignment" (id, "unitId", "unitAvailabilityId", "transportRequestId", "assignmentType", "startTime", "endTime", status, notes, "assignedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UnitAvailability; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."UnitAvailability" (id, "unitId", status, location, "shiftStart", "shiftEnd", "crewMembers", "currentAssignment", notes, "lastUpdated", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt") FROM stdin;
cmf2ifqhu0000ccfaao4338dj	center@medport.com	$2b$10$m2REMYpag4SXJ4/dUZp35eVK/oaJ/s8yLTqPI6FHuu/dyYS3mXxyG	Transport Center User	COORDINATOR	t	2025-09-02 12:14:04.769	2025-09-02 12:14:04.769
cmf2ifqi00001ccfabys4mmsv	hospital@medport.com	$2b$10$m2REMYpag4SXJ4/dUZp35eVK/oaJ/s8yLTqPI6FHuu/dyYS3mXxyG	Hospital User	ADMIN	t	2025-09-02 12:14:04.777	2025-09-02 12:14:04.777
cmf2ifqi20002ccfa0met2nqf	agency@medport.com	$2b$10$m2REMYpag4SXJ4/dUZp35eVK/oaJ/s8yLTqPI6FHuu/dyYS3mXxyG	EMS Agency User	TRANSPORT_AGENCY	t	2025-09-02 12:14:04.778	2025-09-02 12:14:04.778
cmf2mdpnx0000ccuti77tb3s9	demo@medport.com	demo-password-hash	Demo User	COORDINATOR	t	2025-09-02 14:04:28.846	2025-09-02 14:04:28.846
\.


--
-- Data for Name: WeatherAlert; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."WeatherAlert" (id, "alertType", severity, location, description, "startTime", "endTime", impact, recommendations, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WeatherImpact; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."WeatherImpact" (id, location, "weatherType", "impactLevel", description, "startTime", "endTime", "travelDelayFactor", "affectedAreas", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WeatherUpdate; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."WeatherUpdate" (id, "longDistanceTransportId", "cloudCover", location, "multiPatientTransportId", precipitation, temperature, "updatedAt", visibility, "weatherConditions", "windDirection", "windSpeed") FROM stdin;
\.


--
-- Data for Name: _AirMedicalResourceToWeatherAlert; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."_AirMedicalResourceToWeatherAlert" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _AirMedicalTransportToWeatherAlert; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."_AirMedicalTransportToWeatherAlert" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _RouteToTransportRequest; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public."_RouteToTransportRequest" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d48ef436-a33d-46f7-8658-8d0134628342	ca1c3daf3abd466e89db0277efb44358d9b0240a225d4afa73dc1d253ee70105	2025-09-02 08:13:54.761444-04	20250821181413_init	\N	\N	2025-09-02 08:13:54.747626-04	1
c2b3cfad-a544-4e10-8fef-6e31b9618f2e	b49568597e540829b4ebf02b84cf3e763fb6d3a6dc1bef84c1a4ba43528a0618	2025-09-02 08:13:54.768899-04	20250822193852_add_advanced_transport_tables	\N	\N	2025-09-02 08:13:54.76175-04	1
e47a55c2-cc0b-473a-b055-b6a74c68d43c	6d9d9f64c5cebbaa1577ebde3831b06b0687a0efa0ba3512a1a3cf8be5d77f3d	2025-09-02 08:13:54.77782-04	20250822200535_add_air_medical_integration	\N	\N	2025-09-02 08:13:54.769222-04	1
cd7534bd-c1ed-4634-b966-1bc75d41191b	903651c7b13566a992b78c7bb1613dd221ce6eb1a045d2e74baa64748834145f	2025-09-02 08:13:54.784314-04	20250822203937_add_emergency_department_optimization	\N	\N	2025-09-02 08:13:54.778186-04	1
a088b789-feeb-4f95-b9eb-d9b14c12ae29	f98ae0e46e0d22eac36596664aee1606f473db06de2ecca1ec005080ff4c8769	2025-09-02 08:13:54.792851-04	20250823105910_add_agency_portal_models	\N	\N	2025-09-02 08:13:54.784719-04	1
c4072c7f-9220-470d-9a33-c81f1accf09c	03c52ea13bf975465078d6feabb2bbba2bfb5e1eb53639ef4d08700e43f8a89d	2025-09-02 08:13:54.802563-04	20250824140056_add_real_time_tracking_models	\N	\N	2025-09-02 08:13:54.79314-04	1
80b38b43-a144-4d86-8594-220d7d1e77d6	5f84fba20f2df4a894d03fec23ae50f1bdd951f84fa778653cc9d1ed82219994	2025-09-02 08:13:54.80362-04	20250830145005_add_other_transport_level	\N	\N	2025-09-02 08:13:54.802828-04	1
1d19d70c-f2d6-4a23-b5eb-0b76333208d7	25bfdc69ea18cc0f0dd9c28c0b2b12d2de09111c9f847dad7dbbe0c1d4229f90	2025-09-02 08:13:54.804587-04	20250830151058_add_accepted_timestamp	\N	\N	2025-09-02 08:13:54.80382-04	1
64bcda24-13de-4a16-95fa-9a2420142a67	225506ea5f7cddf3067ce49837f17487b7b1fa341180a0f23f48f0421c352f55	2025-09-02 08:13:54.805554-04	20250830171810_add_eta_tracking_fields	\N	\N	2025-09-02 08:13:54.804791-04	1
e515b247-5218-4c4b-b82d-845121f726cf	3ab6e24e2da32647c687e5760996f56c6e8f71419f3625679b830665cfb9f845	2025-09-02 08:13:54.807752-04	20250902000000_add_transport_center_service_management	\N	\N	2025-09-02 08:13:54.80574-04	1
9496dd1b-4602-420c-994d-5b2cfbd289ce	6ee352279f888e1870ff9297d8f9980d3837485c543242e68f8b0ee9f1071c2e	2025-09-02 09:22:52.084269-04	20250831133123_add_hospital_agency_preferences	\N	\N	2025-09-02 09:22:52.072306-04	1
\.


--
-- Name: AgencyPerformance AgencyPerformance_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."AgencyPerformance"
    ADD CONSTRAINT "AgencyPerformance_pkey" PRIMARY KEY (id);


--
-- Name: AgencyProfile AgencyProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."AgencyProfile"
    ADD CONSTRAINT "AgencyProfile_pkey" PRIMARY KEY (id);


--
-- Name: AgencyUser AgencyUser_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."AgencyUser"
    ADD CONSTRAINT "AgencyUser_pkey" PRIMARY KEY (id);


--
-- Name: AirMedicalResource AirMedicalResource_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."AirMedicalResource"
    ADD CONSTRAINT "AirMedicalResource_pkey" PRIMARY KEY (id);


--
-- Name: AirMedicalTransport AirMedicalTransport_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."AirMedicalTransport"
    ADD CONSTRAINT "AirMedicalTransport_pkey" PRIMARY KEY (id);


--
-- Name: BedStatusUpdate BedStatusUpdate_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."BedStatusUpdate"
    ADD CONSTRAINT "BedStatusUpdate_pkey" PRIMARY KEY (id);


--
-- Name: CapacityAlert CapacityAlert_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."CapacityAlert"
    ADD CONSTRAINT "CapacityAlert_pkey" PRIMARY KEY (id);


--
-- Name: DemandPattern DemandPattern_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."DemandPattern"
    ADD CONSTRAINT "DemandPattern_pkey" PRIMARY KEY (id);


--
-- Name: DistanceMatrix DistanceMatrix_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."DistanceMatrix"
    ADD CONSTRAINT "DistanceMatrix_pkey" PRIMARY KEY (id);


--
-- Name: ETAUpdate ETAUpdate_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."ETAUpdate"
    ADD CONSTRAINT "ETAUpdate_pkey" PRIMARY KEY (id);


--
-- Name: EmergencyDepartment EmergencyDepartment_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."EmergencyDepartment"
    ADD CONSTRAINT "EmergencyDepartment_pkey" PRIMARY KEY (id);


--
-- Name: Facility Facility_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."Facility"
    ADD CONSTRAINT "Facility_pkey" PRIMARY KEY (id);


--
-- Name: GPSTracking GPSTracking_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."GPSTracking"
    ADD CONSTRAINT "GPSTracking_pkey" PRIMARY KEY (id);


--
-- Name: GeofenceEvent GeofenceEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."GeofenceEvent"
    ADD CONSTRAINT "GeofenceEvent_pkey" PRIMARY KEY (id);


--
-- Name: GroundTransportCoordination GroundTransportCoordination_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."GroundTransportCoordination"
    ADD CONSTRAINT "GroundTransportCoordination_pkey" PRIMARY KEY (id);


--
-- Name: HospitalAgencyPreference HospitalAgencyPreference_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."HospitalAgencyPreference"
    ADD CONSTRAINT "HospitalAgencyPreference_pkey" PRIMARY KEY (id);


--
-- Name: LocationHistory LocationHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."LocationHistory"
    ADD CONSTRAINT "LocationHistory_pkey" PRIMARY KEY (id);


--
-- Name: LongDistanceTransport LongDistanceTransport_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."LongDistanceTransport"
    ADD CONSTRAINT "LongDistanceTransport_pkey" PRIMARY KEY (id);


--
-- Name: MultiPatientTransport MultiPatientTransport_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."MultiPatientTransport"
    ADD CONSTRAINT "MultiPatientTransport_pkey" PRIMARY KEY (id);


--
-- Name: PatientTransport PatientTransport_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."PatientTransport"
    ADD CONSTRAINT "PatientTransport_pkey" PRIMARY KEY (id);


--
-- Name: ProviderForecast ProviderForecast_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."ProviderForecast"
    ADD CONSTRAINT "ProviderForecast_pkey" PRIMARY KEY (id);


--
-- Name: RouteDeviation RouteDeviation_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."RouteDeviation"
    ADD CONSTRAINT "RouteDeviation_pkey" PRIMARY KEY (id);


--
-- Name: RouteStop RouteStop_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."RouteStop"
    ADD CONSTRAINT "RouteStop_pkey" PRIMARY KEY (id);


--
-- Name: Route Route_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."Route"
    ADD CONSTRAINT "Route_pkey" PRIMARY KEY (id);


--
-- Name: ServiceArea ServiceArea_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."ServiceArea"
    ADD CONSTRAINT "ServiceArea_pkey" PRIMARY KEY (id);


--
-- Name: TrafficCondition TrafficCondition_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TrafficCondition"
    ADD CONSTRAINT "TrafficCondition_pkey" PRIMARY KEY (id);


--
-- Name: TransportAgency TransportAgency_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportAgency"
    ADD CONSTRAINT "TransportAgency_pkey" PRIMARY KEY (id);


--
-- Name: TransportBid TransportBid_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportBid"
    ADD CONSTRAINT "TransportBid_pkey" PRIMARY KEY (id);


--
-- Name: TransportLeg TransportLeg_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportLeg"
    ADD CONSTRAINT "TransportLeg_pkey" PRIMARY KEY (id);


--
-- Name: TransportQueue TransportQueue_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportQueue"
    ADD CONSTRAINT "TransportQueue_pkey" PRIMARY KEY (id);


--
-- Name: TransportRequest TransportRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportRequest"
    ADD CONSTRAINT "TransportRequest_pkey" PRIMARY KEY (id);


--
-- Name: UnitAssignment UnitAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."UnitAssignment"
    ADD CONSTRAINT "UnitAssignment_pkey" PRIMARY KEY (id);


--
-- Name: UnitAvailability UnitAvailability_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."UnitAvailability"
    ADD CONSTRAINT "UnitAvailability_pkey" PRIMARY KEY (id);


--
-- Name: Unit Unit_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."Unit"
    ADD CONSTRAINT "Unit_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WeatherAlert WeatherAlert_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."WeatherAlert"
    ADD CONSTRAINT "WeatherAlert_pkey" PRIMARY KEY (id);


--
-- Name: WeatherImpact WeatherImpact_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."WeatherImpact"
    ADD CONSTRAINT "WeatherImpact_pkey" PRIMARY KEY (id);


--
-- Name: WeatherUpdate WeatherUpdate_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."WeatherUpdate"
    ADD CONSTRAINT "WeatherUpdate_pkey" PRIMARY KEY (id);


--
-- Name: _AirMedicalResourceToWeatherAlert _AirMedicalResourceToWeatherAlert_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."_AirMedicalResourceToWeatherAlert"
    ADD CONSTRAINT "_AirMedicalResourceToWeatherAlert_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _AirMedicalTransportToWeatherAlert _AirMedicalTransportToWeatherAlert_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."_AirMedicalTransportToWeatherAlert"
    ADD CONSTRAINT "_AirMedicalTransportToWeatherAlert_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _RouteToTransportRequest _RouteToTransportRequest_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."_RouteToTransportRequest"
    ADD CONSTRAINT "_RouteToTransportRequest_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AgencyProfile_agencyId_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "AgencyProfile_agencyId_key" ON public."AgencyProfile" USING btree ("agencyId");


--
-- Name: AgencyUser_email_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "AgencyUser_email_key" ON public."AgencyUser" USING btree (email);


--
-- Name: AirMedicalResource_identifier_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "AirMedicalResource_identifier_key" ON public."AirMedicalResource" USING btree (identifier);


--
-- Name: DistanceMatrix_fromFacilityId_toFacilityId_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "DistanceMatrix_fromFacilityId_toFacilityId_key" ON public."DistanceMatrix" USING btree ("fromFacilityId", "toFacilityId");


--
-- Name: ETAUpdate_destinationId_timestamp_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "ETAUpdate_destinationId_timestamp_idx" ON public."ETAUpdate" USING btree ("destinationId", "timestamp");


--
-- Name: ETAUpdate_gpsTrackingId_timestamp_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "ETAUpdate_gpsTrackingId_timestamp_idx" ON public."ETAUpdate" USING btree ("gpsTrackingId", "timestamp");


--
-- Name: EmergencyDepartment_facilityId_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "EmergencyDepartment_facilityId_key" ON public."EmergencyDepartment" USING btree ("facilityId");


--
-- Name: GPSTracking_timestamp_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "GPSTracking_timestamp_idx" ON public."GPSTracking" USING btree ("timestamp");


--
-- Name: GPSTracking_unitId_timestamp_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "GPSTracking_unitId_timestamp_idx" ON public."GPSTracking" USING btree ("unitId", "timestamp");


--
-- Name: GeofenceEvent_facilityId_timestamp_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "GeofenceEvent_facilityId_timestamp_idx" ON public."GeofenceEvent" USING btree ("facilityId", "timestamp");


--
-- Name: GeofenceEvent_gpsTrackingId_timestamp_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "GeofenceEvent_gpsTrackingId_timestamp_idx" ON public."GeofenceEvent" USING btree ("gpsTrackingId", "timestamp");


--
-- Name: HospitalAgencyPreference_agencyId_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "HospitalAgencyPreference_agencyId_idx" ON public."HospitalAgencyPreference" USING btree ("agencyId");


--
-- Name: HospitalAgencyPreference_hospitalId_agencyId_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "HospitalAgencyPreference_hospitalId_agencyId_key" ON public."HospitalAgencyPreference" USING btree ("hospitalId", "agencyId");


--
-- Name: HospitalAgencyPreference_hospitalId_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "HospitalAgencyPreference_hospitalId_idx" ON public."HospitalAgencyPreference" USING btree ("hospitalId");


--
-- Name: LocationHistory_gpsTrackingId_timestamp_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "LocationHistory_gpsTrackingId_timestamp_idx" ON public."LocationHistory" USING btree ("gpsTrackingId", "timestamp");


--
-- Name: LocationHistory_timestamp_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "LocationHistory_timestamp_idx" ON public."LocationHistory" USING btree ("timestamp");


--
-- Name: LongDistanceTransport_transportNumber_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "LongDistanceTransport_transportNumber_key" ON public."LongDistanceTransport" USING btree ("transportNumber");


--
-- Name: MultiPatientTransport_batchNumber_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "MultiPatientTransport_batchNumber_key" ON public."MultiPatientTransport" USING btree ("batchNumber");


--
-- Name: RouteDeviation_gpsTrackingId_timestamp_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "RouteDeviation_gpsTrackingId_timestamp_idx" ON public."RouteDeviation" USING btree ("gpsTrackingId", "timestamp");


--
-- Name: RouteDeviation_routeId_timestamp_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "RouteDeviation_routeId_timestamp_idx" ON public."RouteDeviation" USING btree ("routeId", "timestamp");


--
-- Name: RouteStop_routeId_stopOrder_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "RouteStop_routeId_stopOrder_key" ON public."RouteStop" USING btree ("routeId", "stopOrder");


--
-- Name: Route_routeNumber_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "Route_routeNumber_key" ON public."Route" USING btree ("routeNumber");


--
-- Name: TrafficCondition_isActive_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "TrafficCondition_isActive_idx" ON public."TrafficCondition" USING btree ("isActive");


--
-- Name: TrafficCondition_location_startTime_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "TrafficCondition_location_startTime_idx" ON public."TrafficCondition" USING btree (location, "startTime");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: WeatherImpact_isActive_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "WeatherImpact_isActive_idx" ON public."WeatherImpact" USING btree ("isActive");


--
-- Name: WeatherImpact_location_startTime_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "WeatherImpact_location_startTime_idx" ON public."WeatherImpact" USING btree (location, "startTime");


--
-- Name: _AirMedicalResourceToWeatherAlert_B_index; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "_AirMedicalResourceToWeatherAlert_B_index" ON public."_AirMedicalResourceToWeatherAlert" USING btree ("B");


--
-- Name: _AirMedicalTransportToWeatherAlert_B_index; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "_AirMedicalTransportToWeatherAlert_B_index" ON public."_AirMedicalTransportToWeatherAlert" USING btree ("B");


--
-- Name: _RouteToTransportRequest_B_index; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "_RouteToTransportRequest_B_index" ON public."_RouteToTransportRequest" USING btree ("B");


--
-- Name: AgencyPerformance AgencyPerformance_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."AgencyPerformance"
    ADD CONSTRAINT "AgencyPerformance_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."TransportAgency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AgencyProfile AgencyProfile_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."AgencyProfile"
    ADD CONSTRAINT "AgencyProfile_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."TransportAgency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AgencyUser AgencyUser_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."AgencyUser"
    ADD CONSTRAINT "AgencyUser_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."TransportAgency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AirMedicalTransport AirMedicalTransport_airMedicalResourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."AirMedicalTransport"
    ADD CONSTRAINT "AirMedicalTransport_airMedicalResourceId_fkey" FOREIGN KEY ("airMedicalResourceId") REFERENCES public."AirMedicalResource"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AirMedicalTransport AirMedicalTransport_longDistanceTransportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."AirMedicalTransport"
    ADD CONSTRAINT "AirMedicalTransport_longDistanceTransportId_fkey" FOREIGN KEY ("longDistanceTransportId") REFERENCES public."LongDistanceTransport"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AirMedicalTransport AirMedicalTransport_multiPatientTransportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."AirMedicalTransport"
    ADD CONSTRAINT "AirMedicalTransport_multiPatientTransportId_fkey" FOREIGN KEY ("multiPatientTransportId") REFERENCES public."MultiPatientTransport"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AirMedicalTransport AirMedicalTransport_transportRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."AirMedicalTransport"
    ADD CONSTRAINT "AirMedicalTransport_transportRequestId_fkey" FOREIGN KEY ("transportRequestId") REFERENCES public."TransportRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BedStatusUpdate BedStatusUpdate_emergencyDepartmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."BedStatusUpdate"
    ADD CONSTRAINT "BedStatusUpdate_emergencyDepartmentId_fkey" FOREIGN KEY ("emergencyDepartmentId") REFERENCES public."EmergencyDepartment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CapacityAlert CapacityAlert_emergencyDepartmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."CapacityAlert"
    ADD CONSTRAINT "CapacityAlert_emergencyDepartmentId_fkey" FOREIGN KEY ("emergencyDepartmentId") REFERENCES public."EmergencyDepartment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DemandPattern DemandPattern_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."DemandPattern"
    ADD CONSTRAINT "DemandPattern_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DistanceMatrix DistanceMatrix_fromFacilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."DistanceMatrix"
    ADD CONSTRAINT "DistanceMatrix_fromFacilityId_fkey" FOREIGN KEY ("fromFacilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DistanceMatrix DistanceMatrix_toFacilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."DistanceMatrix"
    ADD CONSTRAINT "DistanceMatrix_toFacilityId_fkey" FOREIGN KEY ("toFacilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ETAUpdate ETAUpdate_gpsTrackingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."ETAUpdate"
    ADD CONSTRAINT "ETAUpdate_gpsTrackingId_fkey" FOREIGN KEY ("gpsTrackingId") REFERENCES public."GPSTracking"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EmergencyDepartment EmergencyDepartment_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."EmergencyDepartment"
    ADD CONSTRAINT "EmergencyDepartment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GPSTracking GPSTracking_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."GPSTracking"
    ADD CONSTRAINT "GPSTracking_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GeofenceEvent GeofenceEvent_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."GeofenceEvent"
    ADD CONSTRAINT "GeofenceEvent_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: GeofenceEvent GeofenceEvent_gpsTrackingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."GeofenceEvent"
    ADD CONSTRAINT "GeofenceEvent_gpsTrackingId_fkey" FOREIGN KEY ("gpsTrackingId") REFERENCES public."GPSTracking"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GroundTransportCoordination GroundTransportCoordination_airMedicalTransportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."GroundTransportCoordination"
    ADD CONSTRAINT "GroundTransportCoordination_airMedicalTransportId_fkey" FOREIGN KEY ("airMedicalTransportId") REFERENCES public."AirMedicalTransport"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GroundTransportCoordination GroundTransportCoordination_groundTransportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."GroundTransportCoordination"
    ADD CONSTRAINT "GroundTransportCoordination_groundTransportId_fkey" FOREIGN KEY ("groundTransportId") REFERENCES public."TransportRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: HospitalAgencyPreference HospitalAgencyPreference_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."HospitalAgencyPreference"
    ADD CONSTRAINT "HospitalAgencyPreference_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."TransportAgency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: HospitalAgencyPreference HospitalAgencyPreference_hospitalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."HospitalAgencyPreference"
    ADD CONSTRAINT "HospitalAgencyPreference_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LocationHistory LocationHistory_gpsTrackingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."LocationHistory"
    ADD CONSTRAINT "LocationHistory_gpsTrackingId_fkey" FOREIGN KEY ("gpsTrackingId") REFERENCES public."GPSTracking"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LongDistanceTransport LongDistanceTransport_assignedAgencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."LongDistanceTransport"
    ADD CONSTRAINT "LongDistanceTransport_assignedAgencyId_fkey" FOREIGN KEY ("assignedAgencyId") REFERENCES public."TransportAgency"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LongDistanceTransport LongDistanceTransport_assignedUnitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."LongDistanceTransport"
    ADD CONSTRAINT "LongDistanceTransport_assignedUnitId_fkey" FOREIGN KEY ("assignedUnitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LongDistanceTransport LongDistanceTransport_coordinatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."LongDistanceTransport"
    ADD CONSTRAINT "LongDistanceTransport_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MultiPatientTransport MultiPatientTransport_assignedAgencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."MultiPatientTransport"
    ADD CONSTRAINT "MultiPatientTransport_assignedAgencyId_fkey" FOREIGN KEY ("assignedAgencyId") REFERENCES public."TransportAgency"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MultiPatientTransport MultiPatientTransport_assignedUnitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."MultiPatientTransport"
    ADD CONSTRAINT "MultiPatientTransport_assignedUnitId_fkey" FOREIGN KEY ("assignedUnitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MultiPatientTransport MultiPatientTransport_coordinatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."MultiPatientTransport"
    ADD CONSTRAINT "MultiPatientTransport_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PatientTransport PatientTransport_destinationFacilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."PatientTransport"
    ADD CONSTRAINT "PatientTransport_destinationFacilityId_fkey" FOREIGN KEY ("destinationFacilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PatientTransport PatientTransport_multiPatientTransportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."PatientTransport"
    ADD CONSTRAINT "PatientTransport_multiPatientTransportId_fkey" FOREIGN KEY ("multiPatientTransportId") REFERENCES public."MultiPatientTransport"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PatientTransport PatientTransport_originFacilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."PatientTransport"
    ADD CONSTRAINT "PatientTransport_originFacilityId_fkey" FOREIGN KEY ("originFacilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProviderForecast ProviderForecast_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."ProviderForecast"
    ADD CONSTRAINT "ProviderForecast_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."TransportAgency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RouteDeviation RouteDeviation_gpsTrackingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."RouteDeviation"
    ADD CONSTRAINT "RouteDeviation_gpsTrackingId_fkey" FOREIGN KEY ("gpsTrackingId") REFERENCES public."GPSTracking"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RouteDeviation RouteDeviation_routeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."RouteDeviation"
    ADD CONSTRAINT "RouteDeviation_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES public."Route"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RouteStop RouteStop_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."RouteStop"
    ADD CONSTRAINT "RouteStop_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RouteStop RouteStop_multiPatientTransportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."RouteStop"
    ADD CONSTRAINT "RouteStop_multiPatientTransportId_fkey" FOREIGN KEY ("multiPatientTransportId") REFERENCES public."MultiPatientTransport"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RouteStop RouteStop_routeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."RouteStop"
    ADD CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES public."Route"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RouteStop RouteStop_transportRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."RouteStop"
    ADD CONSTRAINT "RouteStop_transportRequestId_fkey" FOREIGN KEY ("transportRequestId") REFERENCES public."TransportRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Route Route_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."Route"
    ADD CONSTRAINT "Route_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."TransportAgency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Route Route_assignedUnitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."Route"
    ADD CONSTRAINT "Route_assignedUnitId_fkey" FOREIGN KEY ("assignedUnitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Route Route_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."Route"
    ADD CONSTRAINT "Route_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServiceArea ServiceArea_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."ServiceArea"
    ADD CONSTRAINT "ServiceArea_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."TransportAgency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransportAgency TransportAgency_addedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportAgency"
    ADD CONSTRAINT "TransportAgency_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TransportBid TransportBid_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportBid"
    ADD CONSTRAINT "TransportBid_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."TransportAgency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransportBid TransportBid_agencyUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportBid"
    ADD CONSTRAINT "TransportBid_agencyUserId_fkey" FOREIGN KEY ("agencyUserId") REFERENCES public."AgencyUser"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransportBid TransportBid_transportRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportBid"
    ADD CONSTRAINT "TransportBid_transportRequestId_fkey" FOREIGN KEY ("transportRequestId") REFERENCES public."TransportRequest"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransportLeg TransportLeg_destinationFacilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportLeg"
    ADD CONSTRAINT "TransportLeg_destinationFacilityId_fkey" FOREIGN KEY ("destinationFacilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransportLeg TransportLeg_longDistanceTransportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportLeg"
    ADD CONSTRAINT "TransportLeg_longDistanceTransportId_fkey" FOREIGN KEY ("longDistanceTransportId") REFERENCES public."LongDistanceTransport"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransportLeg TransportLeg_originFacilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportLeg"
    ADD CONSTRAINT "TransportLeg_originFacilityId_fkey" FOREIGN KEY ("originFacilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransportQueue TransportQueue_assignedProviderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportQueue"
    ADD CONSTRAINT "TransportQueue_assignedProviderId_fkey" FOREIGN KEY ("assignedProviderId") REFERENCES public."TransportAgency"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TransportQueue TransportQueue_assignedUnitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportQueue"
    ADD CONSTRAINT "TransportQueue_assignedUnitId_fkey" FOREIGN KEY ("assignedUnitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TransportQueue TransportQueue_emergencyDepartmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportQueue"
    ADD CONSTRAINT "TransportQueue_emergencyDepartmentId_fkey" FOREIGN KEY ("emergencyDepartmentId") REFERENCES public."EmergencyDepartment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransportQueue TransportQueue_transportRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportQueue"
    ADD CONSTRAINT "TransportQueue_transportRequestId_fkey" FOREIGN KEY ("transportRequestId") REFERENCES public."TransportRequest"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransportRequest TransportRequest_assignedAgencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportRequest"
    ADD CONSTRAINT "TransportRequest_assignedAgencyId_fkey" FOREIGN KEY ("assignedAgencyId") REFERENCES public."TransportAgency"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TransportRequest TransportRequest_assignedUnitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportRequest"
    ADD CONSTRAINT "TransportRequest_assignedUnitId_fkey" FOREIGN KEY ("assignedUnitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TransportRequest TransportRequest_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportRequest"
    ADD CONSTRAINT "TransportRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransportRequest TransportRequest_destinationFacilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportRequest"
    ADD CONSTRAINT "TransportRequest_destinationFacilityId_fkey" FOREIGN KEY ("destinationFacilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransportRequest TransportRequest_originFacilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."TransportRequest"
    ADD CONSTRAINT "TransportRequest_originFacilityId_fkey" FOREIGN KEY ("originFacilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UnitAssignment UnitAssignment_assignedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."UnitAssignment"
    ADD CONSTRAINT "UnitAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES public."AgencyUser"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UnitAssignment UnitAssignment_transportRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."UnitAssignment"
    ADD CONSTRAINT "UnitAssignment_transportRequestId_fkey" FOREIGN KEY ("transportRequestId") REFERENCES public."TransportRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UnitAssignment UnitAssignment_unitAvailabilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."UnitAssignment"
    ADD CONSTRAINT "UnitAssignment_unitAvailabilityId_fkey" FOREIGN KEY ("unitAvailabilityId") REFERENCES public."UnitAvailability"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UnitAssignment UnitAssignment_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."UnitAssignment"
    ADD CONSTRAINT "UnitAssignment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UnitAvailability UnitAvailability_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."UnitAvailability"
    ADD CONSTRAINT "UnitAvailability_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Unit Unit_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."Unit"
    ADD CONSTRAINT "Unit_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public."TransportAgency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WeatherUpdate WeatherUpdate_longDistanceTransportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."WeatherUpdate"
    ADD CONSTRAINT "WeatherUpdate_longDistanceTransportId_fkey" FOREIGN KEY ("longDistanceTransportId") REFERENCES public."LongDistanceTransport"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WeatherUpdate WeatherUpdate_multiPatientTransportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."WeatherUpdate"
    ADD CONSTRAINT "WeatherUpdate_multiPatientTransportId_fkey" FOREIGN KEY ("multiPatientTransportId") REFERENCES public."MultiPatientTransport"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: _AirMedicalResourceToWeatherAlert _AirMedicalResourceToWeatherAlert_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."_AirMedicalResourceToWeatherAlert"
    ADD CONSTRAINT "_AirMedicalResourceToWeatherAlert_A_fkey" FOREIGN KEY ("A") REFERENCES public."AirMedicalResource"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _AirMedicalResourceToWeatherAlert _AirMedicalResourceToWeatherAlert_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."_AirMedicalResourceToWeatherAlert"
    ADD CONSTRAINT "_AirMedicalResourceToWeatherAlert_B_fkey" FOREIGN KEY ("B") REFERENCES public."WeatherAlert"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _AirMedicalTransportToWeatherAlert _AirMedicalTransportToWeatherAlert_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."_AirMedicalTransportToWeatherAlert"
    ADD CONSTRAINT "_AirMedicalTransportToWeatherAlert_A_fkey" FOREIGN KEY ("A") REFERENCES public."AirMedicalTransport"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _AirMedicalTransportToWeatherAlert _AirMedicalTransportToWeatherAlert_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."_AirMedicalTransportToWeatherAlert"
    ADD CONSTRAINT "_AirMedicalTransportToWeatherAlert_B_fkey" FOREIGN KEY ("B") REFERENCES public."WeatherAlert"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _RouteToTransportRequest _RouteToTransportRequest_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."_RouteToTransportRequest"
    ADD CONSTRAINT "_RouteToTransportRequest_A_fkey" FOREIGN KEY ("A") REFERENCES public."Route"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _RouteToTransportRequest _RouteToTransportRequest_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public."_RouteToTransportRequest"
    ADD CONSTRAINT "_RouteToTransportRequest_B_fkey" FOREIGN KEY ("B") REFERENCES public."TransportRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: scooper
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

