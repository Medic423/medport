--
-- PostgreSQL database dump
--

-- Dumped from database version 14.19 (Homebrew)
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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- Name: agency_responses; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.agency_responses (
    id text NOT NULL,
    "tripId" text NOT NULL,
    "agencyId" text NOT NULL,
    response text NOT NULL,
    "responseTimestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "responseNotes" text,
    "estimatedArrival" timestamp(3) without time zone,
    "isSelected" boolean DEFAULT false NOT NULL,
    "assignedUnitId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.agency_responses OWNER TO scooper;

--
-- Name: backhaul_opportunities; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.backhaul_opportunities (
    id text NOT NULL,
    "tripId1" text NOT NULL,
    "tripId2" text NOT NULL,
    "revenueBonus" numeric(10,2),
    efficiency numeric(5,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.backhaul_opportunities OWNER TO scooper;

--
-- Name: center_users; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.center_users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    "userType" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    phone text,
    "emailNotifications" boolean DEFAULT true NOT NULL,
    "smsNotifications" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.center_users OWNER TO scooper;

--
-- Name: cost_centers; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.cost_centers (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    code text NOT NULL,
    "overheadRate" numeric(5,2) DEFAULT 0.0 NOT NULL,
    "fixedCosts" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "variableCosts" numeric(10,2) DEFAULT 0.0 NOT NULL,
    "allocationMethod" text DEFAULT 'TRIP_COUNT'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cost_centers OWNER TO scooper;

--
-- Name: dropdown_categories; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.dropdown_categories (
    id text NOT NULL,
    slug text NOT NULL,
    "displayName" text NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.dropdown_categories OWNER TO scooper;

--
-- Name: dropdown_category_defaults; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.dropdown_category_defaults (
    id text NOT NULL,
    category text NOT NULL,
    "optionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.dropdown_category_defaults OWNER TO scooper;

--
-- Name: dropdown_options; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.dropdown_options (
    id text NOT NULL,
    category text NOT NULL,
    "categoryId" text,
    value text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.dropdown_options OWNER TO scooper;

--
-- Name: ems_agencies; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.ems_agencies (
    id text NOT NULL,
    name text NOT NULL,
    "contactName" text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    "zipCode" text NOT NULL,
    "serviceArea" text[],
    "operatingHours" jsonb,
    capabilities text[],
    "pricingStructure" jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "acceptsNotifications" boolean DEFAULT true NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" text,
    "availableUnits" integer DEFAULT 0 NOT NULL,
    "lastUpdated" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    latitude double precision,
    longitude double precision,
    "notificationMethods" text[],
    "requiresReview" boolean DEFAULT false NOT NULL,
    "serviceRadius" integer,
    "totalUnits" integer DEFAULT 0 NOT NULL,
    "availabilityStatus" jsonb DEFAULT '{"isAvailable": false, "availableLevels": []}'::jsonb,
    "addedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "addedBy" text
);


ALTER TABLE public.ems_agencies OWNER TO scooper;

--
-- Name: COLUMN ems_agencies."availabilityStatus"; Type: COMMENT; Schema: public; Owner: scooper
--

COMMENT ON COLUMN public.ems_agencies."availabilityStatus" IS 'Agency-level availability status for EMS agencies. Stores isAvailable boolean and availableLevels array (BLS/ALS). Completely isolated from HealthcareAgencyPreference and Unit models.';


--
-- Name: ems_users; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.ems_users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    "agencyName" text NOT NULL,
    "agencyId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "userType" text DEFAULT 'EMS'::text NOT NULL,
    "isSubUser" boolean DEFAULT false NOT NULL,
    "parentUserId" text,
    "mustChangePassword" boolean DEFAULT false NOT NULL,
    "orgAdmin" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ems_users OWNER TO scooper;

--
-- Name: facilities; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.facilities (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    "zipCode" text NOT NULL,
    phone text,
    email text,
    region text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" text,
    capabilities text[],
    coordinates jsonb,
    latitude double precision,
    longitude double precision,
    "operatingHours" text,
    "requiresReview" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.facilities OWNER TO scooper;

--
-- Name: healthcare_agency_preferences; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.healthcare_agency_preferences (
    id text NOT NULL,
    "healthcareUserId" text NOT NULL,
    "agencyId" text NOT NULL,
    "isPreferred" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.healthcare_agency_preferences OWNER TO scooper;

--
-- Name: healthcare_destinations; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.healthcare_destinations (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    phone text,
    email text,
    latitude double precision,
    longitude double precision,
    notes text,
    "contactName" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "healthcareUserId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "zipCode" text NOT NULL
);


ALTER TABLE public.healthcare_destinations OWNER TO scooper;

--
-- Name: healthcare_locations; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.healthcare_locations (
    id text NOT NULL,
    "healthcareUserId" text NOT NULL,
    "locationName" text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    "zipCode" text NOT NULL,
    phone text,
    "facilityType" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    latitude double precision,
    longitude double precision
);


ALTER TABLE public.healthcare_locations OWNER TO scooper;

--
-- Name: healthcare_users; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.healthcare_users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    "facilityName" text NOT NULL,
    "facilityType" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "userType" text DEFAULT 'HEALTHCARE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "manageMultipleLocations" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "isSubUser" boolean DEFAULT false NOT NULL,
    "mustChangePassword" boolean DEFAULT false NOT NULL,
    "orgAdmin" boolean DEFAULT false NOT NULL,
    "parentUserId" text
);


ALTER TABLE public.healthcare_users OWNER TO scooper;

--
-- Name: hospitals; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.hospitals (
    id text NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    "zipCode" text NOT NULL,
    phone text,
    email text,
    type text NOT NULL,
    capabilities text[],
    region text NOT NULL,
    coordinates jsonb,
    latitude double precision,
    longitude double precision,
    "operatingHours" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "requiresReview" boolean DEFAULT false NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.hospitals OWNER TO scooper;

--
-- Name: notification_logs; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.notification_logs (
    id text NOT NULL,
    "userId" text NOT NULL,
    "notificationType" text NOT NULL,
    channel text NOT NULL,
    status text NOT NULL,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deliveredAt" timestamp(3) without time zone,
    "errorMessage" text
);


ALTER TABLE public.notification_logs OWNER TO scooper;

--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.notification_preferences (
    id text NOT NULL,
    "userId" text NOT NULL,
    "notificationType" text NOT NULL,
    "emailEnabled" boolean DEFAULT true NOT NULL,
    "smsEnabled" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_preferences OWNER TO scooper;

--
-- Name: pickup_locations; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.pickup_locations (
    id text NOT NULL,
    "hospitalId" text NOT NULL,
    name text NOT NULL,
    description text,
    "contactPhone" text,
    "contactEmail" text,
    floor text,
    room text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pickup_locations OWNER TO scooper;

--
-- Name: pricing_models; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.pricing_models (
    id text NOT NULL,
    "agencyId" text,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "baseRates" jsonb NOT NULL,
    "perMileRates" jsonb NOT NULL,
    "priorityMultipliers" jsonb NOT NULL,
    "peakHourMultipliers" jsonb NOT NULL,
    "weekendMultipliers" jsonb NOT NULL,
    "seasonalMultipliers" jsonb NOT NULL,
    "zoneMultipliers" jsonb NOT NULL,
    "distanceTiers" jsonb NOT NULL,
    "specialRequirements" jsonb NOT NULL,
    "isolationPricing" numeric(8,2),
    "bariatricPricing" numeric(8,2),
    "oxygenPricing" numeric(8,2),
    "monitoringPricing" numeric(8,2),
    "insuranceRates" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pricing_models OWNER TO scooper;

--
-- Name: route_optimization_settings; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.route_optimization_settings (
    id text NOT NULL,
    "agencyId" text,
    "deadheadMileWeight" numeric(5,2) DEFAULT 1.0 NOT NULL,
    "waitTimeWeight" numeric(5,2) DEFAULT 1.0 NOT NULL,
    "backhaulBonusWeight" numeric(5,2) DEFAULT 1.0 NOT NULL,
    "overtimeRiskWeight" numeric(5,2) DEFAULT 1.0 NOT NULL,
    "revenueWeight" numeric(5,2) DEFAULT 1.0 NOT NULL,
    "maxDeadheadMiles" numeric(6,2) DEFAULT 50.0 NOT NULL,
    "maxWaitTimeMinutes" integer DEFAULT 30 NOT NULL,
    "maxOvertimeHours" numeric(4,2) DEFAULT 4.0 NOT NULL,
    "maxResponseTimeMinutes" integer DEFAULT 15 NOT NULL,
    "maxServiceDistance" numeric(6,2) DEFAULT 100.0 NOT NULL,
    "backhaulTimeWindow" integer DEFAULT 60 NOT NULL,
    "backhaulDistanceLimit" numeric(6,2) DEFAULT 25.0 NOT NULL,
    "backhaulRevenueBonus" numeric(8,2) DEFAULT 50.0 NOT NULL,
    "enableBackhaulOptimization" boolean DEFAULT true NOT NULL,
    "targetLoadedMileRatio" numeric(3,2) DEFAULT 0.75 NOT NULL,
    "targetRevenuePerHour" numeric(8,2) DEFAULT 200.0 NOT NULL,
    "targetResponseTime" integer DEFAULT 12 NOT NULL,
    "targetEfficiency" numeric(3,2) DEFAULT 0.85 NOT NULL,
    "optimizationAlgorithm" text DEFAULT 'HYBRID'::text NOT NULL,
    "maxOptimizationTime" integer DEFAULT 30 NOT NULL,
    "enableRealTimeOptimization" boolean DEFAULT true NOT NULL,
    "crewAvailabilityWeight" numeric(5,2) DEFAULT 1.0 NOT NULL,
    "equipmentCompatibilityWeight" numeric(5,2) DEFAULT 1.0 NOT NULL,
    "patientPriorityWeight" numeric(5,2) DEFAULT 1.0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.route_optimization_settings OWNER TO scooper;

--
-- Name: system_analytics; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.system_analytics (
    id text NOT NULL,
    "metricName" text NOT NULL,
    "metricValue" jsonb NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.system_analytics OWNER TO scooper;

--
-- Name: transport_requests; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.transport_requests (
    id text NOT NULL,
    "tripNumber" text,
    "patientId" text NOT NULL,
    "patientWeight" text,
    "specialNeeds" text,
    "originFacilityId" text,
    "destinationFacilityId" text,
    "fromLocation" text,
    "toLocation" text,
    "scheduledTime" timestamp(3) without time zone,
    "transportLevel" text NOT NULL,
    "urgencyLevel" text,
    priority text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "specialRequirements" text,
    diagnosis text,
    "mobilityLevel" text,
    "oxygenRequired" boolean DEFAULT false NOT NULL,
    "monitoringRequired" boolean DEFAULT false NOT NULL,
    "generateQRCode" boolean DEFAULT false NOT NULL,
    "qrCodeData" text,
    "selectedAgencies" text[],
    "notificationRadius" integer,
    "requestTimestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "acceptedTimestamp" timestamp(3) without time zone,
    "pickupTimestamp" timestamp(3) without time zone,
    "completionTimestamp" timestamp(3) without time zone,
    "assignedAgencyId" text,
    "assignedUnitId" text,
    "createdById" text,
    isolation boolean DEFAULT false NOT NULL,
    bariatric boolean DEFAULT false NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "fromLocationId" text,
    "isMultiLocationFacility" boolean DEFAULT false NOT NULL,
    "patientAgeYears" integer,
    "patientAgeCategory" text,
    "healthcareCompletionTimestamp" timestamp(3) without time zone,
    "emsCompletionTimestamp" timestamp(3) without time zone,
    "arrivalTimestamp" timestamp(3) without time zone,
    "departureTimestamp" timestamp(3) without time zone,
    "healthcareCreatedById" text,
    "pickupLocationId" text
);


ALTER TABLE public.transport_requests OWNER TO scooper;

--
-- Name: trip_cost_breakdowns; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.trip_cost_breakdowns (
    id text NOT NULL,
    "tripId" text NOT NULL,
    "baseRevenue" numeric(10,2) NOT NULL,
    "mileageRevenue" numeric(10,2) NOT NULL,
    "priorityRevenue" numeric(10,2) NOT NULL,
    "specialRequirementsRevenue" numeric(10,2) NOT NULL,
    "insuranceAdjustment" numeric(10,2) NOT NULL,
    "totalRevenue" numeric(10,2) NOT NULL,
    "crewLaborCost" numeric(10,2) NOT NULL,
    "vehicleCost" numeric(10,2) NOT NULL,
    "fuelCost" numeric(10,2) NOT NULL,
    "maintenanceCost" numeric(10,2) NOT NULL,
    "overheadCost" numeric(10,2) NOT NULL,
    "totalCost" numeric(10,2) NOT NULL,
    "grossProfit" numeric(10,2) NOT NULL,
    "profitMargin" numeric(5,2) NOT NULL,
    "revenuePerMile" numeric(8,2) NOT NULL,
    "costPerMile" numeric(8,2) NOT NULL,
    "loadedMileRatio" numeric(3,2) NOT NULL,
    "deadheadMileRatio" numeric(3,2) NOT NULL,
    "utilizationRate" numeric(3,2) NOT NULL,
    "tripDistance" numeric(6,2) NOT NULL,
    "loadedMiles" numeric(6,2) NOT NULL,
    "deadheadMiles" numeric(6,2) NOT NULL,
    "tripDurationHours" numeric(4,2) NOT NULL,
    "transportLevel" text NOT NULL,
    "priorityLevel" text NOT NULL,
    "costCenterId" text,
    "costCenterName" text,
    "calculatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.trip_cost_breakdowns OWNER TO scooper;

--
-- Name: trips; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.trips (
    id text NOT NULL,
    "tripNumber" text NOT NULL,
    "patientId" text NOT NULL,
    "patientWeight" text,
    "specialNeeds" text,
    "fromLocation" text NOT NULL,
    "toLocation" text NOT NULL,
    "scheduledTime" timestamp(3) without time zone NOT NULL,
    "transportLevel" text NOT NULL,
    "urgencyLevel" text NOT NULL,
    diagnosis text,
    "mobilityLevel" text,
    "oxygenRequired" boolean DEFAULT false NOT NULL,
    "monitoringRequired" boolean DEFAULT false NOT NULL,
    "generateQRCode" boolean DEFAULT false NOT NULL,
    "qrCodeData" text,
    "selectedAgencies" text[],
    "notificationRadius" integer,
    "transferRequestTime" timestamp(3) without time zone,
    "transferAcceptedTime" timestamp(3) without time zone,
    "emsArrivalTime" timestamp(3) without time zone,
    "emsDepartureTime" timestamp(3) without time zone,
    "actualStartTime" timestamp(3) without time zone,
    "actualEndTime" timestamp(3) without time zone,
    status text NOT NULL,
    priority text NOT NULL,
    notes text,
    "assignedTo" text,
    "assignedAgencyId" text,
    "assignedUnitId" text,
    "acceptedTimestamp" timestamp(3) without time zone,
    "pickupTimestamp" timestamp(3) without time zone,
    "completionTimestamp" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "patientAgeYears" integer,
    "patientAgeCategory" text,
    "actualTripTimeMinutes" integer,
    "backhaulOpportunity" boolean DEFAULT false NOT NULL,
    "completionTimeMinutes" integer,
    "customerSatisfaction" integer,
    "deadheadMiles" double precision,
    "destinationLatitude" double precision,
    "destinationLongitude" double precision,
    "distanceMiles" double precision,
    efficiency numeric(5,2),
    "estimatedTripTimeMinutes" integer,
    "insuranceCompany" text,
    "insurancePayRate" numeric(10,2),
    "loadedMiles" numeric(10,2),
    "maxResponses" integer DEFAULT 5 NOT NULL,
    "originLatitude" double precision,
    "originLongitude" double precision,
    "perMileRate" numeric(8,2),
    "performanceScore" numeric(5,2),
    "pickupLocationId" text,
    "requestTimestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "responseDeadline" timestamp(3) without time zone,
    "responseStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "responseTimeMinutes" integer,
    "revenuePerHour" numeric(10,2),
    "selectionMode" text DEFAULT 'SPECIFIC_AGENCIES'::text NOT NULL,
    "tripCost" numeric(10,2)
);


ALTER TABLE public.trips OWNER TO scooper;

--
-- Name: unit_analytics; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.unit_analytics (
    id text NOT NULL,
    "unitId" text NOT NULL,
    "performanceScore" numeric(5,2),
    efficiency numeric(5,2),
    "totalTrips" integer DEFAULT 0 NOT NULL,
    "totalTripsCompleted" integer DEFAULT 0 NOT NULL,
    "averageResponseTime" numeric(5,2),
    "lastUpdated" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.unit_analytics OWNER TO scooper;

--
-- Name: units; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.units (
    id text NOT NULL,
    "agencyId" text NOT NULL,
    "unitNumber" text NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'AVAILABLE'::text NOT NULL,
    "currentStatus" text DEFAULT 'AVAILABLE'::text NOT NULL,
    "currentLocation" text,
    capabilities text[],
    "crewSize" integer DEFAULT 2 NOT NULL,
    equipment text[],
    location jsonb,
    latitude double precision,
    longitude double precision,
    "lastMaintenance" timestamp(3) without time zone,
    "nextMaintenance" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastStatusUpdate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.units OWNER TO scooper;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
afc17301-9aee-4b67-9f9e-a999f84b7085	60482fe8c0a6b397fcfadd53d962450e01e6e57f433aed5c0f141da5b0b0202f	2025-12-28 18:29:58.417003-05	20251209140000_add_dropdown_categories	\N	\N	2025-12-28 18:29:58.414846-05	1
aa4c2f0d-aa71-49bd-b90a-4a1420372330	895e21cf998661814597337599db9325abae05f6fd99d8e67af02969b30fb49b	2025-12-28 18:29:58.258879-05	20250908204607_enhanced_trip_schema	\N	\N	2025-12-28 18:29:58.243884-05	1
05a1174f-5a9a-4a51-af76-7e19aab4c43c	28faf265f0615c404102eef682b9e38fac8942e38b2882916bec3856d820ecf0	2025-12-28 18:29:58.328306-05	20250917160459_add_analytics_fields	\N	\N	2025-12-28 18:29:58.326509-05	1
1a9ac206-d6a4-4dd4-8719-336225fb7de9	89e9beb35f7e5647e64d45e1264c19dadd9fe7ca5c8749da84daaea7cedd7c3b	2025-12-28 18:29:58.273238-05	20250908204620_enhanced_trip_schema	\N	\N	2025-12-28 18:29:58.25946-05	1
19a533b1-e540-4a8f-94fa-6f0b128487bc	c71696c75e737b3481ba216d59f1d3a930e9af1628919633f0c4c109610c2608	2025-12-28 18:29:58.278654-05	20250908204633_enhanced_trip_schema	\N	\N	2025-12-28 18:29:58.273656-05	1
8d440f2c-7e57-4854-9324-5c50d9ecc009	865fec19172efd02b413ea424e75cc97d0a9db0884d76337dd5e05b9db90061f	2025-12-28 18:29:58.401813-05	20251008113055_add_multi_location_healthcare	\N	\N	2025-12-28 18:29:58.359481-05	1
16504781-b2e2-4050-a003-f36b0c7ac34b	49bb3390f5926ff720d5e23cb0bc1e4d1bae4c43b0a8b1b8880763b2e6071410	2025-12-28 18:29:58.285632-05	20250909152957_enhance_unit_model	\N	\N	2025-12-28 18:29:58.279701-05	1
7a6353f9-8768-4997-8938-b5bd3a70a932	0b48e4bcc7145154bb481482c03de706b36c86f48c656b12d478b8dd45d54e53	2025-12-28 18:29:58.334423-05	20250917160504_add_unit_analytics_fields	\N	\N	2025-12-28 18:29:58.328826-05	1
0e893017-9bc8-452b-be68-045a8ffb247b	c2943858992ba54d18dd0e4a2595116de8484154f028fb536528354e9a6ddf32	2025-12-28 18:29:58.29756-05	20250909155719_q	\N	\N	2025-12-28 18:29:58.287322-05	1
956b1f26-5cf7-4fb4-b518-c0bf21b3bee5	d8f906148b510b088f93398bf4a03c85b65c7d1df2558db866209a9bd91cbe1b	2025-12-28 18:29:58.298875-05	20250909163838_replace_shift_times_with_onduty	\N	\N	2025-12-28 18:29:58.298033-05	1
86a963a5-cd0f-4c46-a439-0948d59eb3db	021a26ada7a3525e57f3e00837b7507da8987f9e8544ad631278e301eb9397d5	2025-12-28 18:29:58.301122-05	20250909170057_add_agency_relationship_to_ems_user	\N	\N	2025-12-28 18:29:58.299233-05	1
3c2c69d0-7294-4306-900e-c1b3683084eb	44c66f0f01b5545c4b554877a4d559288f95d2877da41008144d5156ea2c5c9f	2025-12-28 18:29:58.341649-05	20250917165001_add_crew_cost_management	\N	\N	2025-12-28 18:29:58.334822-05	1
4c149794-dc53-4e7d-9e3c-62088fa72f6a	b165969b119bf18fc20c2746c550bed458bd9ab164d006a4d8f4c998f9830440	2025-12-28 18:29:58.302005-05	20250909171727_remove_ison_duty_field	\N	\N	2025-12-28 18:29:58.301365-05	1
4a0cb5f9-4280-480d-8077-1129e2fde9b9	44c66f0f01b5545c4b554877a4d559288f95d2877da41008144d5156ea2c5c9f	2025-12-28 18:29:58.308867-05	20250910173907_add_insurance_field_to_trips	\N	\N	2025-12-28 18:29:58.302382-05	1
113101e0-4f70-491e-91a4-1912bc22e818	1a5748a38cb9e887b471800d2c3305d97355fae41cf0ade2f0323277caaf95ed	2025-12-28 18:29:58.4098-05	20251116131400_add_separate_completion_timestamps	\N	\N	2025-12-28 18:29:58.409067-05	1
339e35c3-b02d-4258-848c-1d69447812af	3fc0330691698d518f0d9092134a2685cc6a4adb73dd38a18ef7ff12fc2e25d4	2025-12-28 18:29:58.31591-05	20250910173915_add_dropdown_options_model	\N	\N	2025-12-28 18:29:58.309248-05	1
22d43afb-03dc-4c22-83af-ce08b16363a6	20609b708b417229c937f6211ffcbb446e855a40a596277f09e8e7029079df85	2025-12-28 18:29:58.348489-05	20250917165101_add_crew_cost_management_ems	\N	\N	2025-12-28 18:29:58.342001-05	1
62ec6808-778f-4d0c-bcb1-ea8552e093c1	4a1bd746c01627aba00ccfe9b481edee2718906740abb1a39da1620b3fca7480	2025-12-28 18:29:58.322052-05	20250910191806_add_route_optimization_fields	\N	\N	2025-12-28 18:29:58.31624-05	1
d7d289f9-c545-428d-ae43-d16459519a7c	72c63e7e10d1a7523f160174d852c31ad5370ee69c85901819a460c6040b504e	2025-12-28 18:29:58.323029-05	20250910192847_add_insurance_pricing_fields	\N	\N	2025-12-28 18:29:58.322322-05	1
f5f051f6-e26b-410b-ae2b-e07440248cc3	407c386bc7aa8cca8a3a12d8bd463fb97642b3119c82ccaa372e9e6c8d792ae4	2025-12-28 18:29:58.402986-05	20251008124127_add_gps_coordinates_to_healthcare_locations	\N	\N	2025-12-28 18:29:58.402215-05	1
1b5af8ff-33ff-4815-b6d2-227037edef55	2b5ff8a958155f91030dfe877d8c1eab81d63a1878ebd0e5f7a4d8a8ba92dc56	2025-12-28 18:29:58.326239-05	20250917132535_add_route_optimization_settings	\N	\N	2025-12-28 18:29:58.323288-05	1
6414e027-7fda-44ed-9119-cf4b5dbe4244	6be7f5643109916522b1e70e85a6f167acd2aaf7510dfe8509622052815c4356	2025-12-28 18:29:58.355173-05	20250917170653_add_center_tables	\N	\N	2025-12-28 18:29:58.348881-05	1
2bc51e28-3ea0-4a5f-8648-26b313f810da	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-12-28 18:29:58.356099-05	20250917170718_add_insurance_company_column	\N	\N	2025-12-28 18:29:58.35548-05	1
355936fc-a143-4efe-b24a-bc916eea985a	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-12-28 18:29:58.356949-05	20250917170740_add_pricing_models	\N	\N	2025-12-28 18:29:58.356372-05	1
17fdaee9-b99b-4a93-b1e6-fcb8cae00ba2	7fd0f042c47228a123141eb7120ed753e48e17344f76c6af527bcf429ae40175	2025-12-28 18:29:58.404154-05	20251031133000_add_patient_age_fields	\N	\N	2025-12-28 18:29:58.403363-05	1
7fd72b8d-dd7e-4a36-8598-ff1df8a6d94b	9e462482b50bcb3f8b62c8899fb28ca5cb5600e42d6b0527be4d38bf60e6c187	2025-12-28 18:29:58.359097-05	20250917180000_add_trip_cost_breakdown_and_cost_centers	\N	\N	2025-12-28 18:29:58.357246-05	1
c9c53e23-48ea-4541-8866-060894b7bf8e	fd0dee07a8125a33ab4b7079889d34968cbd2e7853b4c2c5c0e69adb1da1708c	2025-12-28 18:29:58.406433-05	20251102101911_add_healthcare_destinations	\N	\N	2025-12-28 18:29:58.404391-05	1
d8bde733-7054-4d8d-b45f-e0943f7ee238	9217323e7ce12fa5f5b0830de5aa94349aa8ab27187a65e26f1936ebbecdef3b	2025-12-28 18:29:58.411676-05	20251204101500_add_user_deletion_fields	\N	\N	2025-12-28 18:29:58.410104-05	1
45918edb-9d81-40d4-920a-3fd70ee4ad4c	36471baaa976b4e51de3e48ae780dd2858a6e0ddf9b523d6f74a79be1196c873	2025-12-28 18:29:58.408838-05	20251102140000_add_healthcare_agency_preferences	\N	\N	2025-12-28 18:29:58.406796-05	1
77f48384-748a-41df-9e60-d7525aaf9cec	a9d0935e870e87a585e2120083fc8b517a257f84c1127ddd52d29e56d81a922b	2025-12-28 18:29:58.414518-05	20251204130000_add_ems_agency_availability_status	\N	\N	2025-12-28 18:29:58.411952-05	1
\.


--
-- Data for Name: agency_responses; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.agency_responses (id, "tripId", "agencyId", response, "responseTimestamp", "responseNotes", "estimatedArrival", "isSelected", "assignedUnitId", "createdAt", "updatedAt") FROM stdin;
cmk5jrn13000257e0f42l567h	cmk5jr5jb000057e0glpfi92r	cmjx97a6c0001k7umo2cds80x	PENDING	2026-01-08 14:33:09.974	\N	\N	f	\N	2026-01-08 14:33:09.975	2026-01-08 14:33:09.975
cmk5jrn13000457e0rd4c36gf	cmk5jr5jb000057e0glpfi92r	cmhhu71yi000660o5emytfhep	PENDING	2026-01-08 14:33:09.974	\N	\N	f	\N	2026-01-08 14:33:09.975	2026-01-08 14:33:09.975
cmkbgz89l000ia3r9dsaorpqh	cmkbgxike0008a3r9kyp8ulzr	cmhhu71yi000660o5emytfhep	ACCEPTED	2026-01-12 18:01:42.297	Accepted by EMS agency	\N	t	\N	2026-01-12 18:01:42.297	2026-01-12 18:02:01.791
cmkbgya6a000ea3r91ny0rzon	cmkbgxike0008a3r9kyp8ulzr	cmjx97a6c0001k7umo2cds80x	PENDING	2026-01-12 18:00:58.114	\N	\N	f	\N	2026-01-12 18:00:58.115	2026-01-12 18:02:01.792
cmkbgya6a000ca3r9jcz3qprs	cmkbgxike0008a3r9kyp8ulzr	cmjzv5trk00018tl57uwzelvw	PENDING	2026-01-12 18:00:58.114	\N	\N	f	\N	2026-01-12 18:00:58.115	2026-01-12 18:02:01.792
cmkbgya6b000ga3r9d475aov1	cmkbgxike0008a3r9kyp8ulzr	cmhhyiyb40000il04n642kbum	PENDING	2026-01-12 18:00:58.114	\N	\N	f	\N	2026-01-12 18:00:58.115	2026-01-12 18:02:01.792
cmkbgya6a000da3r9i652epc3	cmkbgxike0008a3r9kyp8ulzr	cmhhu71yi000660o5emytfhep	PENDING	2026-01-12 18:00:58.114	\N	\N	f	\N	2026-01-12 18:00:58.115	2026-01-12 18:02:01.792
cmkbhjlw0000a1056wu6g2sqc	cmkbhg65q00001056xyfkceje	cmjw1yff800038lewjn2jurtz	ACCEPTED	2026-01-12 18:17:33.072	Accepted by EMS agency	\N	t	\N	2026-01-12 18:17:33.073	2026-01-12 18:17:47.361
cmkbhgzbg00041056thhbmnop	cmkbhg65q00001056xyfkceje	cmkbfhyml0000a3r9gj6bqn58	PENDING	2026-01-12 18:15:30.508	\N	\N	f	\N	2026-01-12 18:15:30.509	2026-01-12 18:17:47.362
cmkbhgzbg00051056tbojnw66	cmkbhg65q00001056xyfkceje	cmkbfzaau0003a3r952ydg9ww	PENDING	2026-01-12 18:15:30.508	\N	\N	f	\N	2026-01-12 18:15:30.509	2026-01-12 18:17:47.362
cmkbhgzbg00061056lxkfceqg	cmkbhg65q00001056xyfkceje	cmjx97a6c0001k7umo2cds80x	PENDING	2026-01-12 18:15:30.508	\N	\N	f	\N	2026-01-12 18:15:30.509	2026-01-12 18:17:47.362
cmkbhgzbg000810568kp7zgkk	cmkbhg65q00001056xyfkceje	cmjzwns3a0001h0lbyq28wt15	PENDING	2026-01-12 18:15:30.508	\N	\N	f	\N	2026-01-12 18:15:30.509	2026-01-12 18:17:47.362
cmkbi69c9000f1056gdia1s6m	cmk5kovcm0008h504kwp2siw7	cmkbhyix8f26f90829e	ACCEPTED	2026-01-12 18:35:09.896	Accepted by EMS agency	\N	t	\N	2026-01-12 18:35:09.897	2026-01-12 18:36:00.567
cmk5kpfor000ah5047037v540	cmk5kovcm0008h504kwp2siw7	cmjzv5trk00018tl57uwzelvw	PENDING	2026-01-08 14:59:26.762	\N	\N	f	\N	2026-01-08 14:59:26.763	2026-01-12 18:36:00.569
cmk5kpfor000ch504098423hu	cmk5kovcm0008h504kwp2siw7	cmhi0hjxn000013b4mlfliwlw	PENDING	2026-01-08 14:59:26.762	\N	\N	f	\N	2026-01-08 14:59:26.763	2026-01-12 18:36:00.569
cmk5kpfor000eh504ugn6avm9	cmk5kovcm0008h504kwp2siw7	cmju5gdca00011ootg4nqgvid	PENDING	2026-01-08 14:59:26.762	\N	\N	f	\N	2026-01-08 14:59:26.763	2026-01-12 18:36:00.569
cmk5kpfor000gh504zfl3ik3r	cmk5kovcm0008h504kwp2siw7	cmjx97a6c0001k7umo2cds80x	PENDING	2026-01-08 14:59:26.762	\N	\N	f	\N	2026-01-08 14:59:26.763	2026-01-12 18:36:00.569
cmkbi95or000h1056mdmobhfi	cmk5kgaur0003h504d9ju4jxx	cmkbhyix8f26f90829e	ACCEPTED	2026-01-12 18:37:25.13	Accepted by EMS agency	\N	t	\N	2026-01-12 18:37:25.131	2026-01-12 18:37:40.117
cmk5kja9o0005h5042ojxa3bg	cmk5kgaur0003h504d9ju4jxx	cmhhu71yi000660o5emytfhep	PENDING	2026-01-08 14:54:39.804	\N	\N	f	\N	2026-01-08 14:54:39.805	2026-01-12 18:37:40.118
cmk5kja9o0007h504bx8v161u	cmk5kgaur0003h504d9ju4jxx	cmhi0hjxn000013b4mlfliwlw	PENDING	2026-01-08 14:54:39.804	\N	\N	f	\N	2026-01-08 14:54:39.805	2026-01-12 18:37:40.118
\.


--
-- Data for Name: backhaul_opportunities; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.backhaul_opportunities (id, "tripId1", "tripId2", "revenueBonus", efficiency, "createdAt", "isActive") FROM stdin;
\.


--
-- Data for Name: center_users; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.center_users (id, email, password, name, "userType", "isActive", "createdAt", "updatedAt", "deletedAt", "isDeleted", phone, "emailNotifications", "smsNotifications") FROM stdin;
cmhhu71y8000060o54zf44dun	admin@tcc.com	$2b$12$ZMb7krd0zhVW1y25LhQbgeMwznQSYF0PtpkXcaLsZrY7Dsae80WKG	TCC Administrator	ADMIN	t	2025-11-02 14:59:12.417	2025-12-28 18:41:37.574	\N	f	\N	t	f
cmhhu71yc000160o5lmbkendz	user@tcc.com	$2a$12$cow0uhBAHf1n1H0kh7LdXugOJ8a.6rmjbdrEuvckIeeIatsmq5J4C	TCC User	USER	t	2025-11-02 14:59:12.421	2025-12-28 18:41:37.577	\N	f	\N	t	f
\.


--
-- Data for Name: cost_centers; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.cost_centers (id, name, description, code, "overheadRate", "fixedCosts", "variableCosts", "allocationMethod", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: dropdown_categories; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.dropdown_categories (id, slug, "displayName", "displayOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
c3a57e86-6e6c-459d-8e0b-63743385265b	transport-level	Transport Levels	1	t	2025-12-28 18:29:58.415	2025-12-28 18:52:20.968
78b820d9-44bd-404a-a679-8c6a9b5fb7c9	urgency	Urgency Levels	2	t	2025-12-28 18:29:58.415	2025-12-28 18:52:20.97
a4142fad-3ccf-4948-adda-a00bab7a7493	diagnosis	Primary Diagnosis	3	t	2025-12-28 18:29:58.415	2025-12-28 18:52:20.972
dc2ef15d-e659-4e7f-b405-7b7069dddc5e	mobility	Mobility Levels	4	t	2025-12-28 18:29:58.415	2025-12-28 18:52:20.973
2d833278-0f19-47e3-9dc2-ad8cf5d6dce3	insurance	Insurance Companies	5	t	2025-12-28 18:29:58.415	2025-12-28 18:52:20.974
33c72468-fc8d-428a-9818-274c441a24a7	special-needs	Special Needs	6	t	2025-12-28 18:29:58.415	2025-12-28 18:52:20.975
88081b50-8ace-4a7d-ba5c-af35a5cc9952	secondary-insurance	Secondary Insurance	7	t	2025-12-12 16:35:10.828	2025-12-28 18:52:20.976
\.


--
-- Data for Name: dropdown_category_defaults; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.dropdown_category_defaults (id, category, "optionId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: dropdown_options; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.dropdown_options (id, category, "categoryId", value, "isActive", "createdAt", "updatedAt") FROM stdin;
cmhhu72u4001e60o5rouevq0w	diagnosis	\N	Acute Myocardial Infarction	t	2025-11-02 09:59:13.565	2025-12-28 18:52:24.455
cmhhu72u3001a60o5vnfui0l5	diagnosis	\N	Cardiac	t	2025-11-02 09:59:13.564	2025-12-28 18:52:24.456
cmhhu72u5001h60o5mmm5jrjt	diagnosis	\N	Congestive Heart Failure	t	2025-11-02 09:59:13.566	2025-12-28 18:52:24.457
cmhhu72u6001i60o588ly0db2	diagnosis	\N	COPD Exacerbation	t	2025-11-02 09:59:13.566	2025-12-28 18:52:24.458
cmhhu72u7001l60o55jnxxw3k	diagnosis	\N	Dialysis	t	2025-11-02 09:59:13.567	2025-12-28 18:52:24.46
cmhhu72u4001c60o592b16mi9	diagnosis	\N	Neurological	t	2025-11-02 09:59:13.564	2025-12-28 18:52:24.46
cmhhu72u7001m60o5qzouki4d	diagnosis	\N	Oncology	t	2025-11-02 09:59:13.568	2025-12-28 18:52:24.461
cmhhu72u8001o60o5yn5425q3	diagnosis	\N	Other	t	2025-11-02 09:59:13.568	2025-12-28 18:52:24.462
cmhhu72u5001g60o5c42j89l7	diagnosis	\N	Pneumonia	t	2025-11-02 09:59:13.566	2025-12-28 18:52:24.462
cmhhu72u8001n60o552c2c38e	diagnosis	\N	Psychiatric Emergency	t	2025-11-02 09:59:13.568	2025-12-28 18:52:24.462
cmhhu72u3001b60o5htbboimg	diagnosis	\N	Respiratory	t	2025-11-02 09:59:13.564	2025-12-28 18:52:24.463
cmhhu72u6001j60o5zkp8orru	diagnosis	\N	Sepsis	t	2025-11-02 09:59:13.567	2025-12-28 18:52:24.463
cmhhu72u5001f60o597nfbv3k	diagnosis	\N	Stroke/CVA	t	2025-11-02 09:59:13.565	2025-12-28 18:52:24.464
cmhhu72u6001k60o5phom0hy1	diagnosis	\N	Surgical Recovery	t	2025-11-02 09:59:13.567	2025-12-28 18:52:24.464
cmhhu72u4001d60o5ei1al0z7	diagnosis	\N	Trauma	t	2025-11-02 09:59:13.565	2025-12-28 18:52:24.465
cmhhu72u0001160o5iiyc7jbv	insurance	\N	Aetna	t	2025-11-02 09:59:13.561	2025-12-28 18:52:24.465
cmhhu72u0001260o5fi72f5oj	insurance	\N	Anthem Blue Cross Blue Shield	t	2025-11-02 09:59:13.561	2025-12-28 18:52:24.466
cmhhu72u1001360o55b88mf4a	insurance	\N	Blue Cross Blue Shield	t	2025-11-02 09:59:13.561	2025-12-28 18:52:24.466
cmhhu72u1001460o5vm26592v	insurance	\N	Cigna	t	2025-11-02 09:59:13.561	2025-12-28 18:52:24.467
cmhhu72u1001560o5i0tcbjpf	insurance	\N	Humana	t	2025-11-02 09:59:13.562	2025-12-28 18:52:24.467
cmhhu72u0001060o50rtomrk8	insurance	\N	Medicaid	t	2025-11-02 09:59:13.56	2025-12-28 18:52:24.468
cmhhu72tz000z60o5eabiwl5d	insurance	\N	Medicare	t	2025-11-02 09:59:13.559	2025-12-28 18:52:24.468
cmhhu72u3001960o5g9qc5auy	insurance	\N	Other	t	2025-11-02 09:59:13.563	2025-12-28 18:52:24.469
cmhhu72u2001760o5fxgg1vwq	insurance	\N	Private	t	2025-11-02 09:59:13.563	2025-12-28 18:52:24.469
cmhhu72u2001860o50p6mgvkj	insurance	\N	Self-pay	t	2025-11-02 09:59:13.563	2025-12-28 18:52:24.47
cmhhu72u2001660o5laa1ywvr	insurance	\N	UnitedHealthcare	t	2025-11-02 09:59:13.562	2025-12-28 18:52:24.47
cmhhu72u8001p60o5dm0fsznb	mobility	\N	Ambulatory	t	2025-11-02 09:59:13.569	2025-12-28 18:52:24.47
cmhhu72ua001u60o5pvhcg20j	mobility	\N	Assistive Device Required	t	2025-11-02 09:59:13.57	2025-12-28 18:52:24.471
cmhhu72ub001y60o5ebgd0uzw	mobility	\N	Bariatric Equipment Required	t	2025-11-02 09:59:13.572	2025-12-28 18:52:24.471
cmhhu72u9001s60o5w5p03500	mobility	\N	Bed-bound	t	2025-11-02 09:59:13.57	2025-12-28 18:52:24.472
cmhhu72ub001w60o56290e83o	mobility	\N	Bed Bound	t	2025-11-02 09:59:13.571	2025-12-28 18:52:24.472
cmhhu72ua001t60o5xw2gq7bi	mobility	\N	Independent	t	2025-11-02 09:59:13.57	2025-12-28 18:52:24.472
cmhhu72u9001r60o5kzzn74y2	mobility	\N	Stretcher	t	2025-11-02 09:59:13.569	2025-12-28 18:52:24.473
cmhhu72ub001x60o5a8z85hxg	mobility	\N	Stretcher Required	t	2025-11-02 09:59:13.571	2025-12-28 18:52:24.473
cmhhu72u9001q60o52z1eortv	mobility	\N	Wheelchair	t	2025-11-02 09:59:13.569	2025-12-28 18:52:24.473
cmhhu72ua001v60o5hbrupmap	mobility	\N	Wheelchair Bound	t	2025-11-02 09:59:13.571	2025-12-28 18:52:24.474
854f45f8-4b34-4e94-a6e4-fd28156738bb	secondary-insurance	\N	Medicare	t	2025-12-12 16:48:57.8	2025-12-28 18:52:24.474
cmhi37nxl0002r929cpsvkm83	secondary-insurance	\N	Private	t	2025-11-02 14:11:37.45	2025-12-28 18:52:24.475
cmhi37ag40001r929z6c5siq0	secondary-insurance	\N	VA	t	2025-11-02 14:11:19.972	2025-12-28 18:52:24.475
cmhhu72ug002f60o5x40vruha	special-needs	\N	Bariatric Stretcher	t	2025-11-02 09:59:13.576	2025-12-28 18:52:24.475
a34b9d25-d701-4e7a-99f4-099c4c92203c	special-needs	\N	Cardiac Monitoring	t	2025-12-12 16:48:50.867	2025-12-28 18:52:24.476
f5952eca-c586-4787-b9aa-8630e9194db3	special-needs	\N	IV Pumps	t	2025-12-12 16:48:50.933	2025-12-28 18:52:24.476
cmhhu72ug002h60o5ow9icl45	special-needs	\N	Monitoring Required	t	2025-11-02 09:59:13.577	2025-12-28 18:52:24.476
0be86ba1-66e2-44e6-bfa0-e266c897ec84	special-needs	\N	On LVAD	t	2025-12-12 16:48:50.987	2025-12-28 18:52:24.477
cmhhu72ug002g60o5rmqnq19d	special-needs	\N	Oxygen Required	t	2025-11-02 09:59:13.577	2025-12-28 18:52:24.477
cmhhu72uh002i60o5j4gku5cq	special-needs	\N	Ventilator Required	t	2025-11-02 09:59:13.577	2025-12-28 18:52:24.477
cmhhu72uc002060o5npqed1vr	transport-level	\N	ALS	t	2025-11-02 09:59:13.572	2025-12-28 18:52:24.478
cmhhu72ud002360o5tvoodrm9	transport-level	\N	ALS - Advanced Life Support	t	2025-11-02 09:59:13.573	2025-12-28 18:52:24.478
cmhhu72ud002660o58w6gj6ko	transport-level	\N	Bariatric	t	2025-11-02 09:59:13.574	2025-12-28 18:52:24.478
cmhhu72ub001z60o5we5nmdly	transport-level	\N	BLS	t	2025-11-02 09:59:13.572	2025-12-28 18:52:24.479
cmhhu72uc002260o52ck5a81w	transport-level	\N	BLS - Basic Life Support	t	2025-11-02 09:59:13.573	2025-12-28 18:52:24.479
cmhhu72uc002160o5ssdwxu3c	transport-level	\N	CCT	t	2025-11-02 09:59:13.573	2025-12-28 18:52:24.479
cmhhu72ud002460o5kq6hu140	transport-level	\N	Critical Care	t	2025-11-02 09:59:13.573	2025-12-28 18:52:24.48
cmhhu72ud002560o58h3szjd7	transport-level	\N	Neonatal	t	2025-11-02 09:59:13.574	2025-12-28 18:52:24.48
cmhhu72ue002760o5sk2jlzao	transport-level	\N	Non-Emergency	t	2025-11-02 09:59:13.574	2025-12-28 18:52:24.48
cmhhu72ue002860o51ji34jyn	transport-level	\N	Other	t	2025-11-02 09:59:13.574	2025-12-28 18:52:24.481
cmhhu72ug002e60o5qn7rwm73	urgency	\N	Discharge	t	2025-11-02 09:59:13.576	2025-12-28 18:52:24.481
cmhhu72uf002c60o5848m4ujk	urgency	\N	Emergency	t	2025-11-02 09:59:13.576	2025-12-28 18:52:24.481
cmjqd97mo0003zyrzc6yfsglz	urgency	\N	Emergent	t	2025-12-28 23:34:19.872	2025-12-28 18:52:24.482
cmjqd97m90000zyrzbg8s9n4v	urgency	\N	Routine	t	2025-12-28 23:34:19.858	2025-12-28 18:52:24.482
cmhhu72uf002d60o5ys3jah4s	urgency	\N	Scheduled	t	2025-11-02 09:59:13.576	2025-12-28 18:52:24.482
cmjqd97mf0002zyrzqgg3629c	urgency	\N	Urgent	t	2025-12-28 23:34:19.864	2025-12-28 18:52:24.483
\.


--
-- Data for Name: ems_agencies; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.ems_agencies (id, name, "contactName", phone, email, address, city, state, "zipCode", "serviceArea", "operatingHours", capabilities, "pricingStructure", "isActive", status, "createdAt", "updatedAt", "acceptsNotifications", "approvedAt", "approvedBy", "availableUnits", "lastUpdated", latitude, longitude, "notificationMethods", "requiresReview", "serviceRadius", "totalUnits", "availabilityStatus", "addedAt", "addedBy") FROM stdin;
cmhi0hjxn000013b4mlfliwlw	Citizens Ambulance Service	Jeff Foxworthy	8005551212	jeff@citizens.com	805 Hospital Rd	Indiana	PA	15701	{}	\N	{BLS,ALS}	\N	t	ACTIVE	2025-11-02 12:55:19.98	2025-11-02 12:55:19.98	t	\N	\N	0	2025-11-02 12:55:19.98	40.6093363	-79.1580229	\N	f	\N	0	{"isAvailable": false, "availableLevels": []}	2025-11-02 12:55:19.98	cmhhu72tr000g60o5eh13qop3
cmhhu71yi000660o5emytfhep	Elk County EMS	John Doer	(814) 555-0303	doe@elkcoems.com	789 Main Street	Ridgway	PA	15853	{"ELK COUNTY","CAMERON COUNTY"}	{"end": "23:59", "start": "00:00"}	{BLS,ALS}	{"baseRate": 175, "perMileRate": 2.75}	t	ACTIVE	2025-11-02 09:59:12.426	2025-12-29 14:55:29.727	t	\N	\N	0	2025-11-02 09:59:12.426	41.4208193	-78.7329344	\N	f	\N	0	{"isAvailable": true, "availableLevels": ["BLS", "ALS"]}	2025-11-02 09:59:12.426	\N
cmju5gdca00011ootg4nqgvid	Jet Response	Chuck Ferrell	8146950813	chuck@traccems.com	700 Ayers Ave. Lemoyne PA 17043	Lemoyne	PA	17043	{"Emergency Medical Services","Critical Care Transport","Pediatric Transport"}	"24/7"	{"Critical Care"}	\N	t	ACTIVE	2025-12-31 15:07:01.642	2025-12-31 15:07:01.642	t	\N	\N	0	2025-12-31 15:07:01.642	40.239695	-76.895206	\N	f	\N	0	{"isAvailable": false, "availableLevels": []}	2025-12-31 15:07:01.642	\N
cmjw1inhs00008lewvbimjojc	Elderly Ambulance	Chuck Ferrell	8146950813	chuck@elderlyambulance.com	197 Fox Chase Drive	Duncansville	PA	16635	{"Emergency Medical Services","Wheelchair Transport"}	"24/7"	{BLS}	\N	t	ACTIVE	2026-01-01 22:52:22	2026-01-01 22:52:22	t	\N	\N	0	2026-01-01 22:52:22	\N	\N	\N	f	\N	0	{"isAvailable": false, "availableLevels": []}	2026-01-01 22:52:22	\N
cmjw3n8tr000012euyi1iup18	Cresson EMS	Peter Smith	(800) 5551212	peter@cressonems.com	725 2nd St	Cresson	PA	16630	{}	"24/7"	{}	\N	t	ACTIVE	2026-01-01 23:51:55.503	2026-01-01 23:51:55.503	t	\N	\N	0	2026-01-01 23:51:55.503	40.4630187	-78.5891445	\N	f	\N	0	{"isAvailable": false, "availableLevels": []}	2026-01-01 23:51:55.503	\N
cmhhyiyb40000il04n642kbum	HALAS	Joey Jones	8005551212	joey@halas.com	1 Scotchvalley Road 	Hollidaysburg	PA	16648	{}	\N	{BLS,ALS}	\N	t	ACTIVE	2025-11-02 12:00:26.032	2026-01-02 18:43:02.586	t	\N	\N	0	2025-11-02 12:00:26.032	\N	\N	\N	f	\N	0	{"isAvailable": false, "availableLevels": []}	2025-11-02 12:00:26.032	cmhhu72tr000g60o5eh13qop3
cmhhu71yh000560o54fc3xdsu	Bedford Ambulance Service	Jane Doe	(814) 555-0202	info@bedfordambulance.com	456 Oak Ave	Bedford	PA	15522	{}	{"end": "23:59", "start": "00:00"}	{BLS,ALS}	{"baseRate": 125, "perMileRate": 2.25}	f	ACTIVE	2025-11-02 09:59:12.426	2026-01-02 18:44:50.875	t	\N	\N	0	2025-11-02 09:59:12.426	40.0271453	-78.5237447	\N	f	\N	0	{"isAvailable": false, "availableLevels": []}	2025-11-02 09:59:12.426	\N
cmkbfhyml0000a3r9gj6bqn58	East Hills Ambulance	Tom Litinger	814 266 8910	litz@eha.com	3111 Elton Rd	Johnstown	PA	 15904	{}	\N	{BLS,ALS}	\N	t	ACTIVE	2026-01-12 17:20:17.038	2026-01-12 17:20:17.038	t	\N	\N	0	2026-01-12 17:20:17.038	\N	\N	\N	f	\N	0	{"isAvailable": false, "availableLevels": []}	2026-01-12 17:20:17.038	cmhhu72tr000g60o5eh13qop3
cmkbfzaau0003a3r952ydg9ww	Bellefonte EMS	Sally Williams	800 555 1212	sally@bellems.com	369 Phoenix Ave	Bellefonte	PA	16823	{}	\N	{BLS,ALS}	\N	t	ACTIVE	2026-01-12 17:33:45.319	2026-01-12 17:33:45.319	t	\N	\N	0	2026-01-12 17:33:45.319	40.9085264	-77.7822502	\N	f	\N	0	{"isAvailable": false, "availableLevels": []}	2026-01-12 17:33:45.319	cmhhu72tr000g60o5eh13qop3
cmjx97a6c0001k7umo2cds80x	Port Matilda Emergency Medical Services	James Green	814-692-1035	admin@portmatildaems.org	402 South High Street	Port Matilda	PA	16870	{"Emergency Medical Services"}	"24/7"	{BLS,ALS}	\N	t	ACTIVE	2026-01-02 19:15:14.629	2026-01-12 17:57:59.478	t	\N	\N	0	2026-01-02 19:15:14.629	40.7970739	-78.0516393	\N	f	\N	0	{"isAvailable": true, "availableLevels": ["BLS", "ALS"]}	2026-01-02 19:15:14.629	\N
cmjw1yff800038lewjn2jurtz	Chuck's Ambulance	Chuck Ferrell	8146950813	chuck@chuckambulance.com	197 Fox Chase Drive	Duncansville	PA	16635	{}	"24/7"	{}	\N	t	ACTIVE	2026-01-01 23:04:38.037	2026-01-12 17:58:26.795	t	\N	\N	0	2026-01-01 23:04:38.037	\N	\N	\N	f	\N	0	{"isAvailable": true, "availableLevels": ["BLS", "ALS", "CCT"]}	2026-01-01 23:04:38.037	\N
cmkbhyix8f26f90829e	Centre LifeLink EMS	Bob Williams	8005551212	bob@cll.com	125 Puddintown Road	State College	PA	16804	{BLS,ALS}	"00:00 - 23:59"	{BLS,ALS}	\N	t	ACTIVE	2026-01-12 13:29:09.066	2026-01-12 19:46:22.061	t	\N	\N	0	2026-01-12 13:29:09.066	40.8085744	-77.8376558	\N	f	\N	0	{"isAvailable": true, "availableLevels": ["BLS", "ALS"]}	2026-01-12 13:29:09.066	\N
\.


--
-- Data for Name: ems_users; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.ems_users (id, email, password, name, "agencyName", "agencyId", "isActive", "userType", "isSubUser", "parentUserId", "mustChangePassword", "orgAdmin", "deletedAt", "isDeleted", "createdAt", "updatedAt") FROM stdin;
cmhhu724r000860o5e28ou8zm	doe@elkcoems.com	$2a$12$OH6rF8bW6tjK7CdYlkuZ.uv4cRGEEavNHUojHHesnd2yIBTPvYx1S	John Doer	Elk County EMS	cmhhu71yi000660o5emytfhep	t	EMS	f	\N	f	f	\N	f	2025-11-02 14:59:12.651	2025-12-28 18:41:37.589
cmju4oc6800005uolhoiffgsq	matt.trimble@jetresponseems.com	$2b$10$emYsv/vuFwvbpYqKmcAG7ellbRI5rYTyLm5cPWeP1h0qb6tqOrocq	Matt Trimble	Jet Response Two	\N	t	EMS	f	\N	f	t	\N	f	2025-12-31 14:45:13.761	2025-12-31 14:45:13.761
cmju46n3f00021832ba24t9ce	matt.trimble@jetresponse.com	$2a$10$Bq7lVpkOKHOLjdMR7oxfWOQHW/BcFUZ.eWuFbJX0K36lmVMALGyB.	Matt Trimble	Jet Response	\N	t	EMS	f	\N	f	t	\N	f	2025-12-31 14:31:28.108	2025-12-31 14:35:42.991
cmju5gdc700001ooth3npkkjl	chuck@traccems.com	$2b$10$NytCrKCTxawRF35tYOouTOy.1VdaKTGyJWUFY9Spb1irsVFmEMYh2	Chuck Ferrell	Jet Response	cmju5gdca00011ootg4nqgvid	t	EMS	f	\N	f	f	\N	f	2025-12-31 15:07:01.639	2025-12-31 15:18:48.069
cmjw1injq00028lew5zqh2sdt	chuck@elderlyambulance.com	$2b$10$8l5fQXozI.3yNEBvVjEF0eRoachrM6YhRDKf/jx8Q.caOH/m.9iKu	Chuck Ferrell	Elderly Ambulance	cmjw1inhs00008lewvbimjojc	t	EMS	f	\N	f	t	\N	f	2026-01-01 22:52:22.07	2026-01-01 22:52:22.07
cmhhu72h8000c60o5xsm5ig0l	fferguson@movalleyems.com	$2a$12$B1ixAnSvxG9G5/g.5KtCk.NhrQGbW4u74LuXpzTL2MUk7IFhGNRJS	Frank Ferguson	Mountain Valley EMS	\N	t	EMS	f	\N	f	f	\N	f	2025-11-02 14:59:13.1	2025-12-28 18:41:37.59
cmhhu72b0000a60o5yg0f0lo4	test@ems.com	$2a$12$KIJVcinesaB7Yk8pPGK7TuPySbEwRxrsuuVtZlltIrg/iD8gOCwSi	Test EMS User	Altoona EMS	\N	t	EMS	f	\N	f	f	\N	f	2025-11-02 14:59:12.876	2025-12-28 18:41:37.591
cmhjcipde0001pz809h7wukdu	burt@movalley.com	$2a$12$IrNK93NcRR0WwVDKFJATO.mqLMn3NsTelTh.Kk4.PhYiXKgdbQRTq	Brad Burt	Mountain Valley EMS	\N	f	EMS	t	cmhhu72h8000c60o5xsm5ig0l	f	f	2025-12-29 20:24:51.219	t	2025-11-03 16:19:55.251	2025-12-29 20:24:51.22
cmju6xlbd0005q6oynoqiar5g	chuck41090@icloud.com	$2b$10$sivPgPZ2oCH2huqw4tOapOzYsg1T0tMcdaPTsAEcSe0VYMHSw9a5a	Chuck Ferrell	Chuck's Ambulance	\N	t	EMS	f	\N	f	t	\N	f	2025-12-31 15:48:24.745	2025-12-31 15:48:24.745
cmju6nc0q0002q6oy2yice0jg	chuck@icloud.com	$2b$10$G4Venh8pOBTKnBBgJU2uY.HpGT7Q2tTNSeSSVyoUPNsWVZdLXA2MW	Chuck Ferrell	Chuck's Ambulance Service	\N	t	EMS	f	\N	f	t	\N	f	2025-12-31 15:40:26.138	2025-12-31 15:40:26.138
cmjw1yfh600058lewsadojpow	chuck@chuckambulance.com	$2b$10$fB.JZpArwfzQgBE6lt26Rusm8nBRPf2FBI64h7R1olEHP1evYkPi6	Chuck Ferrell	Chuck's Ambulance	cmjw1yff800038lewjn2jurtz	t	EMS	f	\N	f	f	\N	f	2026-01-01 23:04:38.106	2026-01-01 23:04:38.106
cmjw3n8vl000212eu7pj6spiq	peter@cressonems.com	$2b$10$PViz4LA/IU9plDRPZJi6.uavPjIbItpedwPfFPoYoTNO9JANnvad6	Peter Smith	Cresson EMS	cmjw3n8tr000012euyi1iup18	t	EMS	f	\N	f	t	\N	f	2026-01-01 23:51:55.569	2026-01-01 23:51:55.569
cmjx97a850003k7umk3034cz9	admin@portmatildaems.org	$2b$10$Fs2NlpJk8Mwr2jbeFHtoEeyHnEQg/Ug7WpB4cVt8runOw3Eoo7yWG	James Green	Port Matilda Emergency Medical Services	cmjx97a6c0001k7umo2cds80x	t	EMS	f	\N	f	t	\N	f	2026-01-02 19:15:14.694	2026-01-02 19:15:14.694
cmkbicoa6000j10566d0khas7	peter@cll.com	$2a$12$gPH1RIuhHCmnJLa/nlowS.HaJTo87/CvHxr1SZbcnx8truHBlWL3W	Peter Hahn	Centre LifeLink EMS	cmkbhyix8f26f90829e	t	EMS	t	cmkbhyiz2000d1056xnfa3imp	t	f	\N	f	2026-01-12 18:40:09.199	2026-01-12 18:40:09.199
cmkbhyiz2000d1056xnfa3imp	bob@cll.com	$2b$10$VxEYCA2oSlqhrvqIixtQ8eJ5WD5Gcb8gnnYnHRUFPF2rcufA///Dq	Bob Williams	Centre LifeLink EMS	cmkbhyix8f26f90829e	t	EMS	f	\N	f	t	\N	f	2026-01-12 18:29:09.134	2026-01-12 19:46:22.057
cmjzv5tt500038tl536f04vdu	test-ems-fix-1767539130584@test.local	$2b$10$2V79NbLKIz.s3w2ZxoTj.OM1esgYpZ61Xgb3jSmB6NYwXF.YTD1.K	Test EMS Contact	Test EMS Agency 1767539130584	\N	t	EMS	f	\N	f	t	\N	f	2026-01-04 15:05:30.666	2026-01-04 15:05:30.666
cmjzwns4t0003h0lbglw1n3dr	test-ems-fix-1767541647825@test.local	$2b$10$BVs9vIOeSe3QGXj.bfrbC.rmQOELTIoeUOCak5rbPQFt/gTKlpoXe	Test EMS Contact	Test EMS Agency 1767541647825	\N	t	EMS	f	\N	f	t	\N	f	2026-01-04 15:47:27.918	2026-01-04 15:47:27.918
cmjzx8qaf0003l3cw2hdlnrrj	test-ems-fix-1767542625213@test.local	$2b$10$3JNZF3i/bUv7krj13oGzduixf9XzC4.xTkNZYPTOFm6Wn0.ztWW62	Test EMS Contact	Test EMS Agency 1767542625213	\N	t	EMS	f	\N	f	t	\N	f	2026-01-04 16:03:45.303	2026-01-04 16:03:45.303
cmjzxpfmy00023dpa6swfp4iv	test-ems-fix-1767543404530@test.local	$2b$10$dhDK.brs6bsn9/zrorXkU.tNclZJwHpO3M7eR51XS64RCugd25ILi	Test EMS Contact	Test EMS Agency 1767543404530	\N	t	EMS	f	\N	f	t	\N	f	2026-01-04 16:16:44.65	2026-01-04 16:16:44.65
\.


--
-- Data for Name: facilities; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.facilities (id, name, type, address, city, state, "zipCode", phone, email, region, "isActive", "createdAt", "updatedAt", "approvedAt", "approvedBy", capabilities, coordinates, latitude, longitude, "operatingHours", "requiresReview") FROM stdin;
cmhhu72ha000d60o55hijzyt8	Altoona Regional Emergency Department	HOSPITAL	620 Howard Ave	Altoona	PA	16601	(814) 889-2011	emergency@altoonaregional.org	Central PA	t	2025-11-02 09:59:13.102	2025-12-28 18:45:09.352	\N	\N	{}	{"lat": 40.5187, "lng": -78.3947}	\N	\N	{}	f
cmhhu72hb000e60o5rgylwacz	UPMC Bedford Emergency Department	HOSPITAL	10455 Lincoln Hwy	Everett	PA	15537	(814) 623-3331	emergency@upmc.edu	Central PA	t	2025-11-02 09:59:13.103	2025-12-28 18:45:09.354	\N	\N	{}	{"lat": 40.0115, "lng": -78.3734}	\N	\N	{}	f
\.


--
-- Data for Name: healthcare_agency_preferences; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.healthcare_agency_preferences (id, "healthcareUserId", "agencyId", "isPreferred", "createdAt", "updatedAt") FROM stdin;
cmkbfhymt0002a3r9w3sw5k4s	cmhhu72tr000g60o5eh13qop3	cmkbfhyml0000a3r9gj6bqn58	f	2026-01-12 17:20:17.045	2026-01-12 17:20:17.045
cmkbfzaax0005a3r9kjssrwkv	cmhhu72tr000g60o5eh13qop3	cmkbfzaau0003a3r952ydg9ww	f	2026-01-12 17:33:45.321	2026-01-12 17:33:45.321
\.


--
-- Data for Name: healthcare_destinations; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.healthcare_destinations (id, name, type, address, city, state, phone, email, latitude, longitude, notes, "contactName", "createdAt", "healthcareUserId", "isActive", "updatedAt", "zipCode") FROM stdin;
cmkbc3g9t0001j9ep87mn9tqn	Celebration Villa of Altoona	Nursing Home	170 Red Fox Drive	Duncansville	PA	(814) 695-8425	sherick@cva.com	\N	\N	\N	Vicki Sherick	2026-01-12 15:45:01.218	cmhhu72tr000g60o5eh13qop3	t	2026-01-12 15:45:01.218	16635
cmkbc9izq0003j9ep16szm5g6	Graystone Manor	Other	2611 8th Ave	Altoona	PA	814 944 3340	ordo@gm.com	40.5010124	-78.4091065	\N	Connie Ordo	2026-01-12 15:49:44.679	cmhhu72tr000g60o5eh13qop3	t	2026-01-12 15:49:44.679	16602
\.


--
-- Data for Name: healthcare_locations; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.healthcare_locations (id, "healthcareUserId", "locationName", address, city, state, "zipCode", phone, "facilityType", "isActive", "isPrimary", "createdAt", "updatedAt", latitude, longitude) FROM stdin;
cmhhu72tt000i60o506c80rs6	cmhhu72tr000g60o5eh13qop3	Penn Highlands Brookville	100 Hospital Road	Brookville	PA	15825	(814) 849-1852	HOSPITAL	t	t	2025-11-02 09:59:13.553	2025-12-28 18:45:09.473	41.1563668	-79.0934389
cmhhu72tv000o60o5371jeuzr	cmhhu72tr000g60o5eh13qop3	Penn Highlands Clearfield	809 Turnpike Avenue	Clearfield	PA	16830	(814) 765-5300	HOSPITAL	t	f	2025-11-02 09:59:13.555	2025-12-28 18:45:09.474	41.0334764	-78.4496343
cmhhu72tx000u60o54h4s3zux	cmhhu72tr000g60o5eh13qop3	Penn Highlands Connellsville	401 East Murphy Avenue	Connellsville	PA	15425	(724) 628-1500	HOSPITAL	t	f	2025-11-02 09:59:13.558	2025-12-28 18:45:09.475	40.0229469	-79.5861392
cmhhu72tu000k60o560ylbflb	cmhhu72tr000g60o5eh13qop3	Penn Highlands DuBois	100 Hospital Avenue	DuBois	PA	15801	(814) 371-2200	HOSPITAL	t	f	2025-11-02 09:59:13.554	2025-12-28 18:45:09.476	41.1141969	-78.7757983
cmhhu72tv000q60o5i9lc7q0j	cmhhu72tr000g60o5eh13qop3	Penn Highlands Elk	763 Johnsonburg Road	St. Marys	PA	15857	(814) 834-4200	HOSPITAL	t	f	2025-11-02 09:59:13.556	2025-12-28 18:45:09.476	41.4267876	-78.5787625
cmhhu72ty000w60o5gsqacwu9	cmhhu72tr000g60o5eh13qop3	Penn Highlands Huntingdon	1225 Warm Springs Avenue	Huntingdon	PA	16652	(814) 643-3300	HOSPITAL	t	f	2025-11-02 09:59:13.558	2025-12-28 18:45:09.477	40.4988653	-78.0213192
cmhhu72tw000s60o5ilatptdl	cmhhu72tr000g60o5eh13qop3	Penn Highlands State College	239 Colonnade Boulevard	State College	PA	16803	(814) 231-7000	HOSPITAL	t	f	2025-11-02 09:59:13.556	2025-12-28 18:45:09.478	40.8156105	-77.9017616
cmhhu72ty000y60o5hqbzbd3p	cmhhu72tr000g60o5eh13qop3	Penn Highlands Tyrone	187 Hospital Drive	Tyrone	PA	16686	(814) 684-1255	HOSPITAL	t	f	2025-11-02 09:59:13.559	2025-12-28 18:45:09.479	40.6750991	-78.2517056
cmhhu72tu000m60o5g35qx5mh	cmhhu72tr000g60o5eh13qop3	Penn Highlands Mon Valley	1163 Country Club Road	Monongahela	PA	15063	(724) 258-1000	Hospital	t	f	2025-11-02 09:59:13.555	2026-01-02 18:51:10.874	40.1813883	-79.91138
cmjx8vh9x0004o3kydyhq3aw7	cmjx8vh9v0001o3kypugskwo3	Monumental Medical Center	725 2nd St	Cresson	PA	16630	800 5551212	Hospital	t	t	2026-01-02 19:06:03.957	2026-01-02 19:07:05.261	40.4630187	-78.5891445
\.


--
-- Data for Name: healthcare_users; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.healthcare_users (id, email, password, name, "facilityName", "facilityType", "isActive", "userType", "createdAt", "updatedAt", "manageMultipleLocations", "deletedAt", "isDeleted", "isSubUser", "mustChangePassword", "orgAdmin", "parentUserId") FROM stdin;
cmhhu72nh000f60o53r10j15i	nurse@altoonaregional.org	$2a$12$1VBb0ZMKIMLInEWYtjJ0a.KBsUpWg.nzZBvo7zMMu0sUMAnoZp50e	Sarah Johnson	Altoona Regional Health System	HOSPITAL	f	HEALTHCARE	2025-11-02 14:59:13.326	2025-12-29 20:30:30.763	f	2025-12-29 20:30:30.763	t	f	t	f	\N
cmj1u9l7x0001zat9ahe2v1a6	chuck41090@mac.com	$2a$12$045JVP52MgWx5LW5YZQKcuvnMr9HfFIX8heYTQaBILxd1IcGCHYQK	Danny Ferrell	Ferrell Hospitals	Healthcare	t	HEALTHCARE	2025-12-11 19:36:16.551	2025-12-29 20:31:53.099	f	2025-12-29 20:20:17.839	t	t	t	f	cmhhu72tr000g60o5eh13qop3
cmhp81j8j0001o072dzhjfyh7	ahazlett@pssolutions.net	$2a$12$oYCxV7eTF2GAleYcS2tPbOmbmXH.hpaYwN05P8LDiTaKc3ptHUSCC	Allen Hazlett	Ferrell Hospitals	Healthcare	t	HEALTHCARE	2025-11-07 19:01:12.723	2025-12-29 20:31:54.772	f	2025-12-29 20:20:27.367	t	t	f	f	cmhhu72tr000g60o5eh13qop3
cmju46hby0000f0esl8az2tu1	sally.williams@upmcaltoona.org	$2a$10$.WNvi54Wf/igaW8GsiITgOUH4FIPJoRtFX7iQEcTnUbzWlVewcRpu	Sally Williams, RN	UPMC Altoona	Hospital	t	HEALTHCARE	2025-12-31 14:31:20.638	2025-12-31 14:35:40.635	f	\N	f	f	f	t	\N
cmjx7nhwq000312eu9060m41d	dunn@mmc.org	$2b$10$P729WSbR56PlCTTecNVqQevceFcqP617eln1NhknFeBETiCegKax.	Harry Dunn	Monumental Medical Center	Hospital	f	HEALTHCARE	2026-01-02 18:31:51.915	2026-01-02 18:31:51.915	t	\N	f	f	f	t	\N
cmjx8vh9v0001o3kypugskwo3	dunn@mmc.com	$2b$10$0h/z4ef5Vi1yy.jlX1wynORypDTEfUsXwFTimGWU9YRuNF5m/XqLK	Harry Dunn	'Monumental Medical Center' 	Hospital	f	HEALTHCARE	2026-01-02 19:06:03.954	2026-01-02 19:06:03.954	t	\N	f	f	f	t	\N
cmkbgsuib0007a3r9quzmflsp	dunn@ferrellhospitals.com	$2a$12$PRWqOTeKjNam252fazV09O0szG9gOeLp6oL0eOxRVwOB4yYkOcQvS	Harry Dunn	Ferrell Hospitals	Healthcare	t	HEALTHCARE	2026-01-12 17:56:44.531	2026-01-12 17:56:44.531	f	\N	f	t	t	f	cmhhu72tr000g60o5eh13qop3
cmhj8bf6f0001r6nuydckya77	drew@phhealthcare.com	$2a$12$PaxRYeq4.t4A4S57lasfIe8Wou3dnItNootwyXMPW.TkKe7npPOFK	Drew Hahn	Ferrell Hospitals	Healthcare	t	HEALTHCARE	2025-11-03 14:22:16.983	2025-12-28 18:41:37.584	f	\N	f	t	t	f	cmhhu72tr000g60o5eh13qop3
cmhj8lhoq0003r6nugqyeov6k	rick@ph.org	$2a$12$HocVh4oua4WvNuB5oe04Te5UoiM8B9Y1j7bXz1hX0adU9isT6a5ha	Rick Summers	Ferrell Hospitals	Healthcare	t	HEALTHCARE	2025-11-03 14:30:06.794	2025-12-28 18:41:37.585	f	\N	f	t	f	f	cmhhu72tr000g60o5eh13qop3
cmhhu72tr000g60o5eh13qop3	chuck@ferrellhospitals.com	$2a$12$fW5qbPukgwjRpIKG4.44ZeW6AfWnWITTdQnLVwWR4XAOsxL2EMoZq	Chuck Ferrell	Ferrell Hospitals	HOSPITAL	t	HEALTHCARE	2025-11-02 14:59:13.551	2025-12-28 18:41:37.582	t	\N	f	f	f	t	\N
\.


--
-- Data for Name: hospitals; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.hospitals (id, name, address, city, state, "zipCode", phone, email, type, capabilities, region, coordinates, latitude, longitude, "operatingHours", "isActive", "requiresReview", "approvedAt", "approvedBy", "createdAt", "updatedAt") FROM stdin;
cmhhu71ye000260o5dd3nn8lf	Altoona Regional Health System	620 Howard Ave	Altoona	PA	16601	(814) 889-2011	info@altoonaregional.org	HOSPITAL	{EMERGENCY,SURGERY,ICU,RADIOLOGY}	ALTOONA	{"lat": 40.5187, "lng": -78.3947}	\N	\N	24/7	t	f	\N	\N	2025-11-02 09:59:12.422	2025-11-02 09:59:12.422
cmhhu71yf000360o5m6eqny85	UPMC Bedford	10455 Lincoln Hwy	Everett	PA	15537	(814) 623-3331	info@upmc.edu	HOSPITAL	{EMERGENCY,SURGERY,ICU}	BEDFORD	{"lat": 40.0115, "lng": -78.3734}	\N	\N	24/7	t	f	\N	\N	2025-11-02 09:59:12.423	2025-11-02 09:59:12.423
cmju46hc80001f0es5x74n9c7	UPMC Altoona	620 Howard Ave	Altoona	PA	16601	+1 814 889 2011	sally.williams@upmcaltoona.org	Hospital	{}	Central PA	\N	40.5225127	-78.398237	\N	t	f	\N	\N	2025-12-31 14:31:20.648	2025-12-31 14:35:40.639
cmjx7nhwu000412eun5qgrn3s	Monumental Medical Center	725 2nd St	Cresson	PA	16630	(814) 5551212	dunn@mmc.org	Hospital	{}	Region to be determined	\N	40.4630187	-78.5891445	\N	f	t	\N	\N	2026-01-02 18:31:51.918	2026-01-02 18:31:51.918
cmjx8vh9w0002o3kykb24nvel	'Monumental Medical Center' 	725 2nd St	Cresson	PA	16630	800 5551212	dunn@mmc.com	Hospital	{}	Region to be determined	\N	40.4630187	-78.5891445	\N	f	t	\N	\N	2026-01-02 19:06:03.956	2026-01-02 19:06:03.956
\.


--
-- Data for Name: notification_logs; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.notification_logs (id, "userId", "notificationType", channel, status, "sentAt", "deliveredAt", "errorMessage") FROM stdin;
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.notification_preferences (id, "userId", "notificationType", "emailEnabled", "smsEnabled", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: pickup_locations; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.pickup_locations (id, "hospitalId", name, description, "contactPhone", "contactEmail", floor, room, "isActive", "createdAt", "updatedAt") FROM stdin;
pickup-1762095553578-o2jxtsuws	cmhhu71ye000260o5dd3nn8lf	Emergency Department Alternate	Alternate ED entrance for stretchers	(814) 889-2011	\N	1	ED Bay	t	2025-11-02 09:59:13.578	2025-11-02 09:59:13.578
pickup-1762095553577-p5yt2ybi5	cmhhu71ye000260o5dd3nn8lf	Emergency Department Main Entrance	Main ED entrance	(814) 889-2011	\N	1	Main Entrance	t	2025-11-02 09:59:13.577	2025-11-02 09:59:13.577
pickup-1762095553579-xj1yk7wxi	cmhhu71ye000260o5dd3nn8lf	ICU Floor	ICU pickup location	(814) 889-2011	\N	3	ICU Wing	t	2025-11-02 09:59:13.579	2025-11-02 09:59:13.579
pickup-1762095553578-n4expnnoo	cmhhu71ye000260o5dd3nn8lf	Main Hospital Entrance	Main hospital entrance	(814) 889-2011	\N	1	Lobby	t	2025-11-02 09:59:13.578	2025-11-02 09:59:13.578
pickup-1762095553579-ythblhwil	cmhhu71ye000260o5dd3nn8lf	Surgery Recovery	Post-surgical recovery pickup	(814) 889-2011	\N	2	PACU	t	2025-11-02 09:59:13.579	2025-11-02 09:59:13.579
pickup-1762095553579-gta28nqy1	cmhhu71yf000360o5m6eqny85	Emergency Department	Main ED entrance	(814) 623-3331	\N	1	ED Lobby	t	2025-11-02 09:59:13.579	2025-11-02 09:59:13.579
pickup-1762095553580-grir14jjq	cmhhu71yf000360o5m6eqny85	ICU Entrance	ICU transfer location	(814) 623-3331	\N	2	ICU	t	2025-11-02 09:59:13.58	2025-11-02 09:59:13.58
pickup-1762095553579-8o54m5z27	cmhhu71yf000360o5m6eqny85	Main Entrance	Main hospital entrance	(814) 623-3331	\N	1	Front Lobby	t	2025-11-02 09:59:13.579	2025-11-02 09:59:13.579
pickup-1762095553581-lx4f1olhv	cmhhu72tt000i60o506c80rs6	Emergency Department	Main ED	(814) 849-1852	\N	\N	\N	t	2025-11-02 09:59:13.581	2025-11-02 09:59:13.581
pickup-1762095553581-fn2lymxk9	cmhhu72tt000i60o506c80rs6	Main Entrance	Main hospital entrance	(814) 849-1852	\N	\N	\N	t	2025-11-02 09:59:13.581	2025-11-02 09:59:13.581
pickup-1762095553581-7cjifsz5h	cmhhu72tu000k60o560ylbflb	Emergency Department	Main ED	(814) 371-2200	\N	\N	\N	t	2025-11-02 09:59:13.581	2025-11-02 09:59:13.581
pickup-1762095553581-iw1f7esb7	cmhhu72tu000k60o560ylbflb	Main Entrance	Main entrance	(814) 371-2200	\N	\N	\N	t	2025-11-02 09:59:13.581	2025-11-02 09:59:13.581
pickup-1762095553582-dy93iqhlk	cmhhu72tu000m60o5g35qx5mh	Emergency Department	Main ED	(724) 258-1000	\N	\N	\N	t	2025-11-02 09:59:13.582	2025-11-02 09:59:13.582
pickup-1762095553582-h7fjrk8ua	cmhhu72tu000m60o5g35qx5mh	Patient Tower	Patient tower entrance	(724) 258-1000	\N	\N	\N	t	2025-11-02 09:59:13.582	2025-11-02 09:59:13.582
pickup-1762095553582-tnt2lqawp	cmhhu72tv000o60o5371jeuzr	Emergency Department	Main ED	(814) 765-5300	\N	\N	\N	t	2025-11-02 09:59:13.582	2025-11-02 09:59:13.582
pickup-1762095553582-ia386i126	cmhhu72tv000o60o5371jeuzr	Main Entrance	Main entrance	(814) 765-5300	\N	\N	\N	t	2025-11-02 09:59:13.582	2025-11-02 09:59:13.582
pickup-1762095553583-1kl4dstq8	cmhhu72tv000q60o5i9lc7q0j	Emergency Department	Main ED	(814) 834-4200	\N	\N	\N	t	2025-11-02 09:59:13.583	2025-11-02 09:59:13.583
pickup-1762095553583-u093ie0pm	cmhhu72tv000q60o5i9lc7q0j	Main Entrance	Main entrance	(814) 834-4200	\N	\N	\N	t	2025-11-02 09:59:13.583	2025-11-02 09:59:13.583
pickup-1762095553583-u4swoyxub	cmhhu72tw000s60o5ilatptdl	Emergency Department	Main ED	(814) 231-7000	\N	\N	\N	t	2025-11-02 09:59:13.583	2025-11-02 09:59:13.583
pickup-1762095553583-0q0pmzl9t	cmhhu72tw000s60o5ilatptdl	Main Entrance	Main entrance	(814) 231-7000	\N	\N	\N	t	2025-11-02 09:59:13.583	2025-11-02 09:59:13.583
pickup-1762095553584-bsw2z4sij	cmhhu72tx000u60o54h4s3zux	Emergency Department	Main ED	(724) 628-1500	\N	\N	\N	t	2025-11-02 09:59:13.584	2025-11-02 09:59:13.584
pickup-1762095553584-tpvfro0i0	cmhhu72tx000u60o54h4s3zux	Main Entrance	Main entrance	(724) 628-1500	\N	\N	\N	t	2025-11-02 09:59:13.584	2025-11-02 09:59:13.584
pickup-1762095553584-yzf07wge2	cmhhu72ty000w60o5gsqacwu9	Emergency Department	Main ED	(814) 643-3300	\N	\N	\N	t	2025-11-02 09:59:13.584	2025-11-02 09:59:13.584
pickup-1762095553584-d5r5sj698	cmhhu72ty000w60o5gsqacwu9	Main Entrance	Main entrance	(814) 643-3300	\N	\N	\N	t	2025-11-02 09:59:13.584	2025-11-02 09:59:13.584
pickup-1762095553584-uku40r0t6	cmhhu72ty000y60o5hqbzbd3p	Emergency Department	Main ED	(814) 684-1255	\N	\N	\N	t	2025-11-02 09:59:13.584	2025-11-02 09:59:13.584
pickup-1762095553585-3ug2w9j37	cmhhu72ty000y60o5hqbzbd3p	Main Entrance	Main entrance	(814) 684-1255	\N	\N	\N	t	2025-11-02 09:59:13.585	2025-11-02 09:59:13.585
\.


--
-- Data for Name: pricing_models; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.pricing_models (id, "agencyId", name, "isActive", "baseRates", "perMileRates", "priorityMultipliers", "peakHourMultipliers", "weekendMultipliers", "seasonalMultipliers", "zoneMultipliers", "distanceTiers", "specialRequirements", "isolationPricing", "bariatricPricing", "oxygenPricing", "monitoringPricing", "insuranceRates", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: route_optimization_settings; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.route_optimization_settings (id, "agencyId", "deadheadMileWeight", "waitTimeWeight", "backhaulBonusWeight", "overtimeRiskWeight", "revenueWeight", "maxDeadheadMiles", "maxWaitTimeMinutes", "maxOvertimeHours", "maxResponseTimeMinutes", "maxServiceDistance", "backhaulTimeWindow", "backhaulDistanceLimit", "backhaulRevenueBonus", "enableBackhaulOptimization", "targetLoadedMileRatio", "targetRevenuePerHour", "targetResponseTime", "targetEfficiency", "optimizationAlgorithm", "maxOptimizationTime", "enableRealTimeOptimization", "crewAvailabilityWeight", "equipmentCompatibilityWeight", "patientPriorityWeight", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: system_analytics; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.system_analytics (id, "metricName", "metricValue", "timestamp", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: transport_requests; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.transport_requests (id, "tripNumber", "patientId", "patientWeight", "specialNeeds", "originFacilityId", "destinationFacilityId", "fromLocation", "toLocation", "scheduledTime", "transportLevel", "urgencyLevel", priority, status, "specialRequirements", diagnosis, "mobilityLevel", "oxygenRequired", "monitoringRequired", "generateQRCode", "qrCodeData", "selectedAgencies", "notificationRadius", "requestTimestamp", "acceptedTimestamp", "pickupTimestamp", "completionTimestamp", "assignedAgencyId", "assignedUnitId", "createdById", isolation, bariatric, notes, "createdAt", "updatedAt", "fromLocationId", "isMultiLocationFacility", "patientAgeYears", "patientAgeCategory", "healthcareCompletionTimestamp", "emsCompletionTimestamp", "arrivalTimestamp", "departureTimestamp", "healthcareCreatedById", "pickupLocationId") FROM stdin;
cmk5jr5jb000057e0glpfi92r	TRP-1767882767301	P6ZLVHTQD	100	Monitoring Required, IV Pumps	\N	\N	Penn Highlands Clearfield	Penn Highlands State College	2026-01-08 19:31:00	BLS	Routine	LOW	PENDING	Monitoring Required, IV Pumps	COPD Exacerbation	Stretcher	f	f	f	\N	{cmjx97a6c0001k7umo2cds80x,cmhhu71yi000660o5emytfhep}	100	2026-01-08 14:32:47.302	\N	\N	\N	\N	\N	\N	f	f	Secondary Insurance: Medicare	2026-01-08 14:32:47.304	2026-01-08 14:33:09.98	cmhhu72tv000o60o5371jeuzr	t	\N	\N	\N	\N	\N	\N	cmhhu72tr000g60o5eh13qop3	pickup-1762095553582-tnt2lqawp
cmk5kgaur0003h504d9ju4jxx	TRP-1767883940592	PB1RNPHM4	100	Cardiac Monitoring, IV Pumps, Oxygen Required	\N	\N	Penn Highlands Brookville	Penn Highlands DuBois	2026-01-08 19:51:00	BLS	Routine	LOW	COMPLETED	Cardiac Monitoring, IV Pumps, Oxygen Required	Acute Myocardial Infarction	Stretcher	f	f	f	\N	{cmhhu71yi000660o5emytfhep,cmhi0hjxn000013b4mlfliwlw}	100	2026-01-08 14:52:20.592	2026-01-12 18:37:40.119	2026-01-12 18:37:59.061	\N	cmkbhyix8f26f90829e	\N	\N	f	f	Secondary Insurance: Medicare	2026-01-08 14:52:20.596	2026-01-12 18:38:57.222	cmhhu72tt000i60o506c80rs6	f	\N	\N	\N	2026-01-12 18:38:57.217	2026-01-12 18:38:17.583	2026-01-12 18:38:25.876	cmhhu72tr000g60o5eh13qop3	pickup-1762095553581-lx4f1olhv
cmkbhg65q00001056xyfkceje	TRP-1768241692712	PQ064PCBT	50	IV Pumps	\N	\N	Penn Highlands Connellsville	Graystone Manor	2026-01-12 23:14:00	BLS	Routine	LOW	HEALTHCARE_COMPLETED	IV Pumps	Oncology	Stretcher	f	f	f	\N	{cmkbfhyml0000a3r9gj6bqn58,cmjx97a6c0001k7umo2cds80x,cmkbfzaau0003a3r952ydg9ww,cmjzwns3a0001h0lbyq28wt15}	100	2026-01-12 18:14:52.713	2026-01-12 18:17:47.362	2026-01-12 18:18:02.257	\N	cmjw1yff800038lewjn2jurtz	\N	\N	f	f	Secondary Insurance: Medicare	2026-01-12 18:14:52.718	2026-01-12 18:36:21.164	cmhhu72tx000u60o54h4s3zux	t	\N	\N	2026-01-12 18:36:21.164	2026-01-12 18:18:09.284	2026-01-12 18:36:21.158	\N	cmhhu72tr000g60o5eh13qop3	pickup-1762095553584-bsw2z4sij
cmkbgxike0008a3r9kyp8ulzr	TRP-1768240822330	PPWBCFYJI	50	IV Pumps	\N	\N	Penn Highlands Huntingdon	Penn Highlands DuBois	2026-01-12 22:59:00	BLS	Routine	LOW	HEALTHCARE_COMPLETED	IV Pumps	Neurological	Stretcher	f	f	f	\N	{cmjzv5trk00018tl57uwzelvw,cmjx97a6c0001k7umo2cds80x,cmhhu71yi000660o5emytfhep,cmhhyiyb40000il04n642kbum}	100	2026-01-12 18:00:22.331	2026-01-12 18:02:01.792	2026-01-12 18:02:22.642	\N	cmhhu71yi000660o5emytfhep	\N	\N	f	f	Secondary Insurance: Private	2026-01-12 18:00:22.334	2026-01-12 18:03:03.904	cmhhu72ty000w60o5gsqacwu9	t	\N	\N	2026-01-12 18:03:03.898	\N	2026-01-12 18:02:46.676	2026-01-12 18:02:54.409	cmhhu72tr000g60o5eh13qop3	pickup-1762095553584-yzf07wge2
cmk5kovcm0008h504kwp2siw7	TRP-1767884340404	PGPBO7436	125	Monitoring Required	\N	\N	Penn Highlands Huntingdon	Penn Highlands Tyrone	2026-01-08 19:58:00	ALS	Urgent	MEDIUM	HEALTHCARE_COMPLETED	Monitoring Required	Acute Myocardial Infarction	Ambulatory	f	f	f	\N	{cmjzv5trk00018tl57uwzelvw,cmjx97a6c0001k7umo2cds80x,cmhi0hjxn000013b4mlfliwlw,cmju5gdca00011ootg4nqgvid}	100	2026-01-08 14:59:00.404	2026-01-12 18:36:00.569	\N	\N	cmkbhyix8f26f90829e	\N	\N	f	f	Secondary Insurance: Medicare	2026-01-08 14:59:00.407	2026-01-12 18:36:28.456	cmhhu72ty000w60o5gsqacwu9	f	\N	\N	2026-01-12 18:36:28.45	\N	2026-01-12 18:36:22.466	2026-01-12 18:36:24.675	cmhhu72tr000g60o5eh13qop3	pickup-1762095553584-yzf07wge2
\.


--
-- Data for Name: trip_cost_breakdowns; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.trip_cost_breakdowns (id, "tripId", "baseRevenue", "mileageRevenue", "priorityRevenue", "specialRequirementsRevenue", "insuranceAdjustment", "totalRevenue", "crewLaborCost", "vehicleCost", "fuelCost", "maintenanceCost", "overheadCost", "totalCost", "grossProfit", "profitMargin", "revenuePerMile", "costPerMile", "loadedMileRatio", "deadheadMileRatio", "utilizationRate", "tripDistance", "loadedMiles", "deadheadMiles", "tripDurationHours", "transportLevel", "priorityLevel", "costCenterId", "costCenterName", "calculatedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.trips (id, "tripNumber", "patientId", "patientWeight", "specialNeeds", "fromLocation", "toLocation", "scheduledTime", "transportLevel", "urgencyLevel", diagnosis, "mobilityLevel", "oxygenRequired", "monitoringRequired", "generateQRCode", "qrCodeData", "selectedAgencies", "notificationRadius", "transferRequestTime", "transferAcceptedTime", "emsArrivalTime", "emsDepartureTime", "actualStartTime", "actualEndTime", status, priority, notes, "assignedTo", "assignedAgencyId", "assignedUnitId", "acceptedTimestamp", "pickupTimestamp", "completionTimestamp", "createdAt", "updatedAt", "patientAgeYears", "patientAgeCategory", "actualTripTimeMinutes", "backhaulOpportunity", "completionTimeMinutes", "customerSatisfaction", "deadheadMiles", "destinationLatitude", "destinationLongitude", "distanceMiles", efficiency, "estimatedTripTimeMinutes", "insuranceCompany", "insurancePayRate", "loadedMiles", "maxResponses", "originLatitude", "originLongitude", "perMileRate", "performanceScore", "pickupLocationId", "requestTimestamp", "responseDeadline", "responseStatus", "responseTimeMinutes", "revenuePerHour", "selectionMode", "tripCost") FROM stdin;
\.


--
-- Data for Name: unit_analytics; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.unit_analytics (id, "unitId", "performanceScore", efficiency, "totalTrips", "totalTripsCompleted", "averageResponseTime", "lastUpdated") FROM stdin;
analytics-cmk0coirt0001hurneyt6me8a	cmk0coirt0001hurneyt6me8a	0.00	0.00	0	0	0.00	2026-01-04 23:15:56.305
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.units (id, "agencyId", "unitNumber", type, status, "currentStatus", "currentLocation", capabilities, "crewSize", equipment, location, latitude, longitude, "lastMaintenance", "nextMaintenance", "isActive", "createdAt", "updatedAt", "lastStatusUpdate") FROM stdin;
cmk0coirt0001hurneyt6me8a	cmhhu71yi000660o5emytfhep	Elk 10	AMBULANCE	AVAILABLE	AVAILABLE	\N	{BLS}	2	{}	\N	\N	\N	2026-01-04 23:15:56.297	2026-02-03 23:15:56.297	t	2026-01-04 23:15:56.298	2026-01-04 23:15:56.298	2026-01-04 23:15:56.297
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: agency_responses agency_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.agency_responses
    ADD CONSTRAINT agency_responses_pkey PRIMARY KEY (id);


--
-- Name: backhaul_opportunities backhaul_opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.backhaul_opportunities
    ADD CONSTRAINT backhaul_opportunities_pkey PRIMARY KEY (id);


--
-- Name: center_users center_users_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.center_users
    ADD CONSTRAINT center_users_pkey PRIMARY KEY (id);


--
-- Name: cost_centers cost_centers_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_pkey PRIMARY KEY (id);


--
-- Name: dropdown_categories dropdown_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.dropdown_categories
    ADD CONSTRAINT dropdown_categories_pkey PRIMARY KEY (id);


--
-- Name: dropdown_category_defaults dropdown_category_defaults_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.dropdown_category_defaults
    ADD CONSTRAINT dropdown_category_defaults_pkey PRIMARY KEY (id);


--
-- Name: dropdown_options dropdown_options_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.dropdown_options
    ADD CONSTRAINT dropdown_options_pkey PRIMARY KEY (id);


--
-- Name: ems_agencies ems_agencies_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.ems_agencies
    ADD CONSTRAINT ems_agencies_pkey PRIMARY KEY (id);


--
-- Name: ems_users ems_users_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.ems_users
    ADD CONSTRAINT ems_users_pkey PRIMARY KEY (id);


--
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_pkey PRIMARY KEY (id);


--
-- Name: healthcare_agency_preferences healthcare_agency_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.healthcare_agency_preferences
    ADD CONSTRAINT healthcare_agency_preferences_pkey PRIMARY KEY (id);


--
-- Name: healthcare_destinations healthcare_destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.healthcare_destinations
    ADD CONSTRAINT healthcare_destinations_pkey PRIMARY KEY (id);


--
-- Name: healthcare_locations healthcare_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.healthcare_locations
    ADD CONSTRAINT healthcare_locations_pkey PRIMARY KEY (id);


--
-- Name: healthcare_users healthcare_users_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.healthcare_users
    ADD CONSTRAINT healthcare_users_pkey PRIMARY KEY (id);


--
-- Name: hospitals hospitals_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.hospitals
    ADD CONSTRAINT hospitals_pkey PRIMARY KEY (id);


--
-- Name: notification_logs notification_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: pickup_locations pickup_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.pickup_locations
    ADD CONSTRAINT pickup_locations_pkey PRIMARY KEY (id);


--
-- Name: pricing_models pricing_models_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.pricing_models
    ADD CONSTRAINT pricing_models_pkey PRIMARY KEY (id);


--
-- Name: route_optimization_settings route_optimization_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.route_optimization_settings
    ADD CONSTRAINT route_optimization_settings_pkey PRIMARY KEY (id);


--
-- Name: system_analytics system_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.system_analytics
    ADD CONSTRAINT system_analytics_pkey PRIMARY KEY (id);


--
-- Name: transport_requests transport_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_pkey PRIMARY KEY (id);


--
-- Name: trip_cost_breakdowns trip_cost_breakdowns_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.trip_cost_breakdowns
    ADD CONSTRAINT trip_cost_breakdowns_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: unit_analytics unit_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.unit_analytics
    ADD CONSTRAINT unit_analytics_pkey PRIMARY KEY (id);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: center_users_email_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX center_users_email_key ON public.center_users USING btree (email);


--
-- Name: center_users_isDeleted_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "center_users_isDeleted_idx" ON public.center_users USING btree ("isDeleted");


--
-- Name: cost_centers_code_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX cost_centers_code_key ON public.cost_centers USING btree (code);


--
-- Name: dropdown_categories_slug_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX dropdown_categories_slug_key ON public.dropdown_categories USING btree (slug);


--
-- Name: dropdown_category_defaults_category_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX dropdown_category_defaults_category_key ON public.dropdown_category_defaults USING btree (category);


--
-- Name: dropdown_category_defaults_optionId_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "dropdown_category_defaults_optionId_key" ON public.dropdown_category_defaults USING btree ("optionId");


--
-- Name: dropdown_options_category_value_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX dropdown_options_category_value_key ON public.dropdown_options USING btree (category, value);


--
-- Name: ems_users_email_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX ems_users_email_key ON public.ems_users USING btree (email);


--
-- Name: ems_users_isDeleted_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "ems_users_isDeleted_idx" ON public.ems_users USING btree ("isDeleted");


--
-- Name: healthcare_agency_preferences_agencyId_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "healthcare_agency_preferences_agencyId_idx" ON public.healthcare_agency_preferences USING btree ("agencyId");


--
-- Name: healthcare_agency_preferences_healthcareUserId_agencyId_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "healthcare_agency_preferences_healthcareUserId_agencyId_key" ON public.healthcare_agency_preferences USING btree ("healthcareUserId", "agencyId");


--
-- Name: healthcare_agency_preferences_healthcareUserId_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "healthcare_agency_preferences_healthcareUserId_idx" ON public.healthcare_agency_preferences USING btree ("healthcareUserId");


--
-- Name: healthcare_destinations_healthcareUserId_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "healthcare_destinations_healthcareUserId_idx" ON public.healthcare_destinations USING btree ("healthcareUserId");


--
-- Name: healthcare_destinations_isActive_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "healthcare_destinations_isActive_idx" ON public.healthcare_destinations USING btree ("isActive");


--
-- Name: healthcare_locations_healthcareUserId_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "healthcare_locations_healthcareUserId_idx" ON public.healthcare_locations USING btree ("healthcareUserId");


--
-- Name: healthcare_locations_isActive_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "healthcare_locations_isActive_idx" ON public.healthcare_locations USING btree ("isActive");


--
-- Name: healthcare_users_email_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX healthcare_users_email_key ON public.healthcare_users USING btree (email);


--
-- Name: healthcare_users_isDeleted_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "healthcare_users_isDeleted_idx" ON public.healthcare_users USING btree ("isDeleted");


--
-- Name: notification_preferences_userId_notificationType_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "notification_preferences_userId_notificationType_key" ON public.notification_preferences USING btree ("userId", "notificationType");


--
-- Name: transport_requests_fromLocationId_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "transport_requests_fromLocationId_idx" ON public.transport_requests USING btree ("fromLocationId");


--
-- Name: transport_requests_isMultiLocationFacility_idx; Type: INDEX; Schema: public; Owner: scooper
--

CREATE INDEX "transport_requests_isMultiLocationFacility_idx" ON public.transport_requests USING btree ("isMultiLocationFacility");


--
-- Name: transport_requests_tripNumber_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "transport_requests_tripNumber_key" ON public.transport_requests USING btree ("tripNumber");


--
-- Name: trips_tripNumber_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "trips_tripNumber_key" ON public.trips USING btree ("tripNumber");


--
-- Name: unit_analytics_unitId_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "unit_analytics_unitId_key" ON public.unit_analytics USING btree ("unitId");


--
-- Name: units_agencyId_unitNumber_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "units_agencyId_unitNumber_key" ON public.units USING btree ("agencyId", "unitNumber");


--
-- Name: agency_responses agency_responses_assignedUnitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.agency_responses
    ADD CONSTRAINT "agency_responses_assignedUnitId_fkey" FOREIGN KEY ("assignedUnitId") REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: agency_responses agency_responses_tripId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.agency_responses
    ADD CONSTRAINT "agency_responses_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES public.transport_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dropdown_category_defaults dropdown_category_defaults_optionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.dropdown_category_defaults
    ADD CONSTRAINT "dropdown_category_defaults_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES public.dropdown_options(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dropdown_options dropdown_options_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.dropdown_options
    ADD CONSTRAINT "dropdown_options_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.dropdown_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ems_users ems_users_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.ems_users
    ADD CONSTRAINT "ems_users_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public.ems_agencies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ems_users ems_users_parentUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.ems_users
    ADD CONSTRAINT "ems_users_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES public.ems_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: healthcare_agency_preferences healthcare_agency_preferences_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.healthcare_agency_preferences
    ADD CONSTRAINT "healthcare_agency_preferences_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public.ems_agencies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: healthcare_agency_preferences healthcare_agency_preferences_healthcareUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.healthcare_agency_preferences
    ADD CONSTRAINT "healthcare_agency_preferences_healthcareUserId_fkey" FOREIGN KEY ("healthcareUserId") REFERENCES public.healthcare_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: healthcare_destinations healthcare_destinations_healthcareUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.healthcare_destinations
    ADD CONSTRAINT "healthcare_destinations_healthcareUserId_fkey" FOREIGN KEY ("healthcareUserId") REFERENCES public.healthcare_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: healthcare_locations healthcare_locations_healthcareUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.healthcare_locations
    ADD CONSTRAINT "healthcare_locations_healthcareUserId_fkey" FOREIGN KEY ("healthcareUserId") REFERENCES public.healthcare_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: healthcare_users healthcare_users_parentUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.healthcare_users
    ADD CONSTRAINT "healthcare_users_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES public.healthcare_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notification_logs notification_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT "notification_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.center_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_preferences notification_preferences_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.center_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transport_requests transport_requests_assignedUnitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT "transport_requests_assignedUnitId_fkey" FOREIGN KEY ("assignedUnitId") REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transport_requests transport_requests_destinationFacilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT "transport_requests_destinationFacilityId_fkey" FOREIGN KEY ("destinationFacilityId") REFERENCES public.facilities(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transport_requests transport_requests_fromLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT "transport_requests_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES public.healthcare_locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transport_requests transport_requests_originFacilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT "transport_requests_originFacilityId_fkey" FOREIGN KEY ("originFacilityId") REFERENCES public.facilities(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transport_requests transport_requests_pickupLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT "transport_requests_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES public.pickup_locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: trips trips_pickupLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT "trips_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES public.pickup_locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: unit_analytics unit_analytics_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.unit_analytics
    ADD CONSTRAINT "unit_analytics_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: units units_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT "units_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public.ems_agencies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: scooper
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

