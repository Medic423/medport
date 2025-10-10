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
    "emailNotifications" boolean DEFAULT true NOT NULL,
    phone text,
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
    "totalUnits" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.ems_agencies OWNER TO scooper;

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
    "originLatitude" double precision,
    "originLongitude" double precision,
    "perMileRate" numeric(8,2),
    "performanceScore" numeric(5,2),
    "requestTimestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "responseTimeMinutes" integer,
    "revenuePerHour" numeric(10,2),
    "tripCost" numeric(10,2),
    "pickupLocationId" text,
    "maxResponses" integer DEFAULT 5 NOT NULL,
    "responseDeadline" timestamp(3) without time zone,
    "responseStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "selectionMode" text DEFAULT 'SPECIFIC_AGENCIES'::text NOT NULL,
    "patientName" text
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
    "averageResponseTime" numeric(5,2),
    "lastUpdated" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.unit_analytics OWNER TO scooper;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1c886c08-1127-4071-b43e-de345e254992	895e21cf998661814597337599db9325abae05f6fd99d8e67af02969b30fb49b	2025-09-17 13:06:34.223816-04	20250908204607_enhanced_trip_schema	\N	\N	2025-09-17 13:06:34.212996-04	1
5864fac6-226c-4a26-ad5c-b37e4510f0b3	0b48e4bcc7145154bb481482c03de706b36c86f48c656b12d478b8dd45d54e53	2025-09-17 13:06:34.285118-04	20250917160504_add_unit_analytics_fields	\N	\N	2025-09-17 13:06:34.280292-04	1
5911ac16-efe7-4646-ba56-d8e345d8d6c0	89e9beb35f7e5647e64d45e1264c19dadd9fe7ca5c8749da84daaea7cedd7c3b	2025-09-17 13:06:34.234957-04	20250908204620_enhanced_trip_schema	\N	\N	2025-09-17 13:06:34.224315-04	1
80decc77-859b-48cd-8c62-9e1db6f132f4	c71696c75e737b3481ba216d59f1d3a930e9af1628919633f0c4c109610c2608	2025-09-17 13:06:34.239627-04	20250908204633_enhanced_trip_schema	\N	\N	2025-09-17 13:06:34.235351-04	1
7b7121c5-0a80-4f42-94be-6acc9f93fc20	49bb3390f5926ff720d5e23cb0bc1e4d1bae4c43b0a8b1b8880763b2e6071410	2025-09-17 13:06:34.246722-04	20250909152957_enhance_unit_model	\N	\N	2025-09-17 13:06:34.240023-04	1
da5e0246-2be3-4aac-93e1-32b4413f295d	44c66f0f01b5545c4b554877a4d559288f95d2877da41008144d5156ea2c5c9f	2025-09-17 13:06:34.292204-04	20250917165001_add_crew_cost_management	\N	\N	2025-09-17 13:06:34.285433-04	1
23dc18e8-c5b5-4704-ab97-4fafd1097678	c2943858992ba54d18dd0e4a2595116de8484154f028fb536528354e9a6ddf32	2025-09-17 13:06:34.25249-04	20250909155719_q	\N	\N	2025-09-17 13:06:34.247226-04	1
563bb11c-6bcb-49b6-88aa-b2a65cd46c0a	d8f906148b510b088f93398bf4a03c85b65c7d1df2558db866209a9bd91cbe1b	2025-09-17 13:06:34.253391-04	20250909163838_replace_shift_times_with_onduty	\N	\N	2025-09-17 13:06:34.252785-04	1
4e67edb3-c9bb-4534-bb33-9c605b3372c7	021a26ada7a3525e57f3e00837b7507da8987f9e8544ad631278e301eb9397d5	2025-09-17 13:06:34.255357-04	20250909170057_add_agency_relationship_to_ems_user	\N	\N	2025-09-17 13:06:34.25449-04	1
ab2bfc42-a720-4102-8581-702443997a65	20609b708b417229c937f6211ffcbb446e855a40a596277f09e8e7029079df85	2025-09-17 13:06:34.299235-04	20250917165101_add_crew_cost_management_ems	\N	\N	2025-09-17 13:06:34.29261-04	1
1f41f21a-b0ee-4b3f-8d04-1e4d5e990a3d	b165969b119bf18fc20c2746c550bed458bd9ab164d006a4d8f4c998f9830440	2025-09-17 13:06:34.256307-04	20250909171727_remove_ison_duty_field	\N	\N	2025-09-17 13:06:34.255667-04	1
a2912691-59c8-463c-b34b-ae39e08a01e4	44c66f0f01b5545c4b554877a4d559288f95d2877da41008144d5156ea2c5c9f	2025-09-17 13:06:34.263123-04	20250910173907_add_insurance_field_to_trips	\N	\N	2025-09-17 13:06:34.256674-04	1
e87ca890-c427-469a-b6cb-0141b391a940	3fc0330691698d518f0d9092134a2685cc6a4adb73dd38a18ef7ff12fc2e25d4	2025-09-17 13:06:34.26993-04	20250910173915_add_dropdown_options_model	\N	\N	2025-09-17 13:06:34.263513-04	1
e62d148a-4655-4f81-a7eb-31edf813d7d4	6be7f5643109916522b1e70e85a6f167acd2aaf7510dfe8509622052815c4356	2025-09-17 13:07:01.861794-04	20250917170653_add_center_tables	\N	\N	2025-09-17 13:07:01.841731-04	1
5b34e49f-1f01-43c2-8db9-68860c2bb71d	4a1bd746c01627aba00ccfe9b481edee2718906740abb1a39da1620b3fca7480	2025-09-17 13:06:34.276017-04	20250910191806_add_route_optimization_fields	\N	\N	2025-09-17 13:06:34.270326-04	1
0f26a777-8a6f-43a8-a496-58cf06943c52	72c63e7e10d1a7523f160174d852c31ad5370ee69c85901819a460c6040b504e	2025-09-17 13:06:34.276755-04	20250910192847_add_insurance_pricing_fields	\N	\N	2025-09-17 13:06:34.276226-04	1
82dd5e71-7d74-4671-96a8-934e4e04a2a4	28faf265f0615c404102eef682b9e38fac8942e38b2882916bec3856d820ecf0	2025-09-17 13:06:34.279947-04	20250917160459_add_analytics_fields	\N	\N	2025-09-17 13:06:34.277022-04	1
2bc10cfd-4bd7-4afe-b09f-f96cde297499	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-09-17 13:07:23.381467-04	20250917170718_add_insurance_company_column	\N	\N	2025-09-17 13:07:23.379133-04	1
1c0baf60-3e2b-4e04-affe-6648279da86c	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-09-17 13:07:45.168036-04	20250917170740_add_pricing_models	\N	\N	2025-09-17 13:07:45.165851-04	1
f25d681f-a625-4591-9ef9-754a7a5973ae	2b5ff8a958155f91030dfe877d8c1eab81d63a1878ebd0e5f7a4d8a8ba92dc56	2025-09-17 13:25:54.791142-04	20250917132535_add_route_optimization_settings	\N	\N	2025-09-17 13:25:54.78129-04	1
57221ffe-5538-4861-a6a8-99c15072de55	9e462482b50bcb3f8b62c8899fb28ca5cb5600e42d6b0527be4d38bf60e6c187	2025-09-17 13:41:56.901075-04	20250917180000_add_trip_cost_breakdown_and_cost_centers	\N	\N	2025-09-17 13:41:56.890762-04	1
\.


--
-- Data for Name: agency_responses; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.agency_responses (id, "tripId", "agencyId", response, "responseTimestamp", "responseNotes", "estimatedArrival", "isSelected", "createdAt", "updatedAt") FROM stdin;
cmfsau6460003qkcr7jqbk6p4	cmfsau6400001qkcr8enuwe9v	ems-agency-1	ACCEPTED	2025-09-20 13:23:21.847	We can handle this transport - Unit 1 available	2025-09-20 13:33:21.843	f	2025-09-20 13:23:21.847	2025-09-20 13:23:21.847
cmfsau64b0005qkcr1u08gh29	cmfsau6400001qkcr8enuwe9v	ems-agency-2	ACCEPTED	2025-09-20 13:23:21.852	We are closer and can respond faster	2025-09-20 13:31:21.849	f	2025-09-20 13:23:21.852	2025-09-20 13:23:21.852
cmfsau64e0007qkcrdk3tzfgw	cmfsau6400001qkcr8enuwe9v	ems-agency-3	DECLINED	2025-09-20 13:23:21.854	No units available at this time	\N	f	2025-09-20 13:23:21.854	2025-09-20 13:23:21.854
cmfsawupy0003pfb67980z3pl	cmfsawupq0001pfb6cqlm2nlb	ems-agency-1	ACCEPTED	2025-09-20 13:25:27.047	We can handle this transport - Unit 1 available	2025-09-20 13:35:27.042	f	2025-09-20 13:25:27.047	2025-09-20 13:25:27.047
cmfsawuq70007pfb6krtjoyg9	cmfsawupq0001pfb6cqlm2nlb	ems-agency-3	DECLINED	2025-09-20 13:25:27.055	No units available at this time	\N	f	2025-09-20 13:25:27.055	2025-09-20 13:25:27.055
cmfsawuq40005pfb69qbo6pzm	cmfsawupq0001pfb6cqlm2nlb	ems-agency-2	ACCEPTED	2025-09-20 13:25:27.053	We are closer and can respond faster	2025-09-20 13:33:27.05	t	2025-09-20 13:25:27.053	2025-09-20 13:25:27.066
cmfsaz9xm000114p94ah3rlno	cmfsat16q0009g18jyejy5zy8	cmfo85iru0002u0qbmsb9hedk	DECLINED	2025-09-20 13:27:20.074	Agency declined this transport request	\N	f	2025-09-20 13:27:20.074	2025-09-20 13:27:20.074
cmfsaze8p000314p9gi71spvg	cmfsas4bk0001g18jtqu51sck	cmfo85iru0002u0qbmsb9hedk	DECLINED	2025-09-20 13:27:25.657	Agency declined this transport request	\N	f	2025-09-20 13:27:25.657	2025-09-20 13:27:25.657
cmfsb69bx000714p9dennou63	cmfsb69bq000514p9v409f25n	ems-agency-1	ACCEPTED	2025-09-20 13:32:45.885	We can handle this transport - Unit 1 available	2025-09-20 13:42:45.882	f	2025-09-20 13:32:45.885	2025-09-20 13:32:45.885
cmfsb69c5000b14p9i68lot66	cmfsb69bq000514p9v409f25n	ems-agency-3	DECLINED	2025-09-20 13:32:45.893	No units available at this time	\N	f	2025-09-20 13:32:45.893	2025-09-20 13:32:45.893
cmfsb69c2000914p9bsou8qpv	cmfsb69bq000514p9v409f25n	ems-agency-2	ACCEPTED	2025-09-20 13:32:45.891	We are closer and can respond faster	2025-09-20 13:40:45.888	t	2025-09-20 13:32:45.891	2025-09-20 13:32:45.902
cmfsbc0yy000i14p99uxctcgy	cmfsbc0yo000e14p9weff1sax	test-agency-2	ACCEPTED	2025-09-20 13:37:14.987	We are closer and can respond faster	2025-09-20 13:47:14.985	f	2025-09-20 13:37:14.987	2025-09-20 13:37:14.987
cmfsbc0z2000k14p9fe1rc0l6	cmfsbc0yo000e14p9weff1sax	test-agency-3	DECLINED	2025-09-20 13:37:14.99	No units available at this time	\N	f	2025-09-20 13:37:14.99	2025-09-20 13:37:14.99
cmfsbc0yu000g14p9xzjboon9	cmfsbc0yo000e14p9weff1sax	test-agency-1	ACCEPTED	2025-09-20 13:37:14.982	We can handle this transport - Unit 1 available	2025-09-20 13:52:14.979	t	2025-09-20 13:37:14.982	2025-09-20 13:37:51.213
\.


--
-- Data for Name: backhaul_opportunities; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.backhaul_opportunities (id, "tripId1", "tripId2", "revenueBonus", efficiency, "createdAt", "isActive") FROM stdin;
\.


--
-- Data for Name: center_users; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.center_users (id, email, password, name, "userType", "isActive", "createdAt", "updatedAt", "emailNotifications", phone, "smsNotifications") FROM stdin;
cmfo8v62p0000u0i5dl1p0a22	admin@tcc.com	$2b$10$INpVIto8xd5aIIxm0p0NLuiC9dNQllfdHOJD71bv8oZjeSDWn6ycW	TCC Administrator	ADMIN	t	2025-09-17 17:17:04.513	2025-09-21 17:19:38.711	t	8146950813	t
\.


--
-- Data for Name: cost_centers; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.cost_centers (id, name, description, code, "overheadRate", "fixedCosts", "variableCosts", "allocationMethod", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ems_agencies; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.ems_agencies (id, name, "contactName", phone, email, address, city, state, "zipCode", "serviceArea", "operatingHours", capabilities, "pricingStructure", "isActive", status, "createdAt", "updatedAt", "acceptsNotifications", "approvedAt", "approvedBy", "availableUnits", "lastUpdated", latitude, longitude, "notificationMethods", "requiresReview", "serviceRadius", "totalUnits") FROM stdin;
cmfscohw10001azsoq64zvbnq	Blacklick Valley Ambulance	Paramedic Bob	8885551212	rick@newsroomsolutions.com	1077 1st St	Nanty-Glo	PA	15943	{"Emergency Medical Services","Wheelchair Transport"}	{"end": "17:00", "start": "08:00"}	{BLS,ALS}	\N	t	ACTIVE	2025-09-20 14:14:56.393	2025-09-20 14:14:56.393	t	\N	\N	0	2025-09-20 14:14:56.393	40.4722123	-78.8357071	\N	f	\N	0
cmftyqtyo000114ckyirybp1u	Altoona Regional EMS	John Smith	814-889-2011	ems@altoonaregional.org	620 Howard Ave	Altoona	PA	16601	{Altoona,"Blair County"}	\N	{BLS,ALS,CCT}	\N	t	ACTIVE	2025-09-21 17:20:23.088	2025-09-21 17:20:23.088	t	\N	\N	0	2025-09-21 17:20:23.088	\N	\N	\N	f	\N	5
\.


--
-- Data for Name: hospitals; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.hospitals (id, name, address, city, state, "zipCode", phone, email, type, capabilities, region, coordinates, latitude, longitude, "operatingHours", "isActive", "requiresReview", "approvedAt", "approvedBy", "createdAt", "updatedAt") FROM stdin;
cmfpmra2j0000nje0r6uvdtyo	Test Hospital	123 Main St	Test City	PA	12345	555-1234	test@hospital.com	General	{Emergency,Surgery}	Central	\N	\N	\N	\N	t	f	\N	\N	2025-09-18 16:33:43.867	2025-09-18 16:33:43.867
cmfsch3hh0000azsossq5eiay	Penn Highlands - Tyrone	187 Hospital Drive	Tyrone	PA	16686	8146841255	doe@pennhighlands.com	Hospital	{}	Region to be determined	\N	40.6750991	-78.2517056	\N	f	t	\N	\N	2025-09-20 14:09:11.14	2025-09-20 14:09:11.14
cmftyqtyk000014ckay5vzij7	Altoona Regional Health System	620 Howard Ave	Altoona	PA	16601	814-889-2011	info@altoonaregional.org	Hospital	{Emergency,Surgery,ICU}	Central PA	\N	40.5187	-78.3947	24/7	t	f	\N	\N	2025-09-21 17:20:23.085	2025-09-21 17:20:23.085
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
cmfsdx3660001qhb6993e6q2f	cmfo8v62p0000u0i5dl1p0a22	trip_assignment	t	t	2025-09-20 14:49:36.846	2025-09-20 17:10:42.869
cmfsdx3680003qhb6qw9vgj98	cmfo8v62p0000u0i5dl1p0a22	trip_status_update	t	t	2025-09-20 14:49:36.848	2025-09-20 17:10:42.871
cmfselrgr0009qhb6o63an673	cmfo8v62p0000u0i5dl1p0a22	trip_accepted	t	t	2025-09-20 15:08:48.076	2025-09-20 17:10:42.872
cmfsemwzh000tqhb6zcn39szg	cmfo8v62p0000u0i5dl1p0a22	invalid_type	t	t	2025-09-20 15:09:41.885	2025-09-20 17:10:42.872
\.


--
-- Data for Name: pickup_locations; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.pickup_locations (id, "hospitalId", name, description, "contactPhone", "contactEmail", floor, room, "isActive", "createdAt", "updatedAt") FROM stdin;
cmfpmrj5q0002nje0n95ommk0	cmfpmra2j0000nje0r6uvdtyo	Emergency Department	Main emergency entrance	555-1234	ed@testhospital.com	1st Floor	Room 101	t	2025-09-18 16:33:55.647	2025-09-18 16:33:55.647
cmfpne7h40001gar5dtayyrih	cmfpmra2j0000nje0r6uvdtyo	East Tower	\N	800 5551212	nurse@hospital.com	1st Floor	102	t	2025-09-18 16:51:33.592	2025-09-18 16:51:33.592
cmfpnoadz0001e0zb8ehppwsh	cmfpmra2j0000nje0r6uvdtyo	Emergency Department	Main emergency department entrance	(814) 889-2011	emergency@altoonaregional.org	Ground Floor	ED-1	t	2025-09-18 16:59:23.928	2025-09-18 16:59:23.928
cmfpnoae10003e0zbut3nye1f	cmfpmra2j0000nje0r6uvdtyo	First Floor Nurses Station	Main nursing station on first floor	(814) 889-2012	nursing@altoonaregional.org	1st Floor	NS-101	t	2025-09-18 16:59:23.93	2025-09-18 16:59:23.93
cmfpnoae20005e0zba7po0c2s	cmfpmra2j0000nje0r6uvdtyo	ICU Unit	Intensive Care Unit	(814) 889-2013	icu@altoonaregional.org	2nd Floor	ICU-201	t	2025-09-18 16:59:23.93	2025-09-18 16:59:23.93
cmfpnoae20007e0zbwa3dmq02	cmfpmra2j0000nje0r6uvdtyo	Surgery Recovery	Post-surgical recovery area	(814) 889-2014	surgery@altoonaregional.org	3rd Floor	SR-301	t	2025-09-18 16:59:23.931	2025-09-18 16:59:23.931
cmfpnoae30009e0zbziglbq98	cmfpmra2j0000nje0r6uvdtyo	Cancer Center	Oncology treatment center	(814) 889-2015	oncology@altoonaregional.org	1st Floor	CC-102	t	2025-09-18 16:59:23.932	2025-09-18 16:59:23.932
pickup-1758712142707-xfxpru81z	cmftyqtyk000014ckay5vzij7	Cancer Center	Nurses Station	8005551212	nurse@cancercdenter.com	1	\N	t	2025-09-24 11:09:02.709	2025-09-24 11:09:02.707
pickup-1758802691747-zxy3l8tp9	cmftyqtyk000014ckay5vzij7	MRI Center	Nurses Station	8005551212	nurse@phd.com	1st	Room 431	t	2025-09-25 12:18:11.748	2025-09-25 12:18:11.747
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
cmfsdneot00001ekg6183lzmv	notification_settings	{"createdAt": "2025-09-20T14:42:05.213Z", "phoneNumber": "8146950813", "emailAddress": "chuck41090@mac.com", "newTripAlerts": true, "statusUpdates": true, "smsNotifications": true, "emailNotifications": true}	2025-09-20 14:42:05.213	cmfo8v62p0000u0i5dl1p0a22	2025-09-20 14:42:05.213
cmfsdpsso000013zgkzjx3dv8	notification_settings	{"createdAt": "2025-09-20T14:43:56.808Z", "phoneNumber": "8146950813", "emailAddress": "chuck41090@mac.com", "newTripAlerts": true, "statusUpdates": true, "smsNotifications": true, "emailNotifications": true}	2025-09-20 14:43:56.808	cmfo8v62p0000u0i5dl1p0a22	2025-09-20 14:43:56.808
\.


--
-- Data for Name: trip_cost_breakdowns; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.trip_cost_breakdowns (id, "tripId", "baseRevenue", "mileageRevenue", "priorityRevenue", "specialRequirementsRevenue", "insuranceAdjustment", "totalRevenue", "crewLaborCost", "vehicleCost", "fuelCost", "maintenanceCost", "overheadCost", "totalCost", "grossProfit", "profitMargin", "revenuePerMile", "costPerMile", "loadedMileRatio", "deadheadMileRatio", "utilizationRate", "tripDistance", "loadedMiles", "deadheadMiles", "tripDurationHours", "transportLevel", "priorityLevel", "costCenterId", "costCenterName", "calculatedAt", "createdAt", "updatedAt") FROM stdin;
cmfoao94b0000129nzbl2wol7	test-trip-123	250.00	56.25	27.50	0.00	-50.63	283.13	87.50	11.25	3.75	2.25	15.00	119.75	163.38	57.70	18.88	7.98	0.80	0.20	0.85	15.00	12.00	3.00	2.50	ALS	MEDIUM	\N	\N	2025-09-17 18:07:41.1	2025-09-17 18:07:41.1	2025-09-17 18:07:41.1
cmfoapvdz0001129n87ngc6z1	sample-trip-1758132536611	250.00	56.25	27.50	0.00	-50.63	283.13	87.50	11.25	3.75	2.25	15.00	119.75	163.38	57.70	18.88	7.98	0.80	0.20	0.85	15.00	12.00	3.00	2.50	ALS	MEDIUM	\N	\N	2025-09-17 18:08:56.615	2025-09-17 18:08:56.615	2025-09-17 18:08:56.615
cmfpj01cr0000dam1lwg8b67c	sample-trip-1758206913998	250.00	56.25	27.50	0.00	-50.63	283.13	87.50	11.25	3.75	2.25	15.00	119.75	163.38	57.70	18.88	7.98	0.80	0.20	0.85	15.00	12.00	3.00	2.50	ALS	MEDIUM	\N	\N	2025-09-18 14:48:34.012	2025-09-18 14:48:34.012	2025-09-18 14:48:34.012
cmfpj2mkk0001dam1rj8045r3	sample-trip-1758207034815	250.00	56.25	27.50	0.00	-50.63	283.13	87.50	11.25	3.75	2.25	15.00	119.75	163.38	57.70	18.88	7.98	0.80	0.20	0.85	15.00	12.00	3.00	2.50	ALS	MEDIUM	\N	\N	2025-09-18 14:50:34.821	2025-09-18 14:50:34.821	2025-09-18 14:50:34.821
cmfpjdj66000011mtbjl1qqdn	trip-1758207543	200.00	120.00	30.00	0.00	0.00	350.00	100.00	40.00	20.00	10.00	15.00	185.00	165.00	47.10	10.00	5.00	0.80	0.20	0.85	20.00	16.00	4.00	2.00	ALS	MEDIUM	\N	\N	2025-09-18 14:59:03	2025-09-18 14:59:03.63	2025-09-18 14:59:03.63
cmfpjdj6j000111mtxftk8zl8	trip-1755615543	200.00	120.00	30.00	0.00	0.00	350.00	100.00	40.00	20.00	10.00	15.00	185.00	165.00	47.10	10.00	5.00	0.80	0.20	0.85	20.00	16.00	4.00	2.00	ALS	MEDIUM	\N	\N	2025-08-15 12:00:00	2025-09-18 14:59:03.643	2025-09-18 14:59:03.643
cmfpjfw0g000211mtnz9kdc3a	trip-week-1758207653	200.00	120.00	30.00	0.00	0.00	350.00	100.00	40.00	20.00	10.00	15.00	185.00	165.00	47.10	10.00	5.00	0.80	0.20	0.85	20.00	16.00	4.00	2.00	ALS	MEDIUM	\N	\N	2025-09-16 15:00:53	2025-09-18 15:00:53.584	2025-09-18 15:00:53.584
cmfpjfw0t000311mt4pf7qq33	trip-month-1758207653	200.00	120.00	30.00	0.00	0.00	350.00	100.00	40.00	20.00	10.00	15.00	185.00	165.00	47.10	10.00	5.00	0.80	0.20	0.85	20.00	16.00	4.00	2.00	ALS	MEDIUM	\N	\N	2025-08-29 15:00:53	2025-09-18 15:00:53.597	2025-09-18 15:00:53.597
cmfplhjoi000012ykre0e3sun	test-trip-123	250.00	56.25	27.50	0.00	-50.63	283.13	87.50	11.25	3.75	2.25	15.00	119.75	163.38	57.70	18.88	7.98	0.80	0.20	0.85	15.00	12.00	3.00	2.50	ALS	MEDIUM	\N	\N	2025-09-18 15:58:10.146	2025-09-18 15:58:10.146	2025-09-18 15:58:10.146
cmfplimpx000112yk8y0fdybw	sample-trip-1758211140738	250.00	56.25	27.50	0.00	-50.63	283.13	87.50	11.25	3.75	2.25	15.00	119.75	163.38	57.70	18.88	7.98	0.80	0.20	0.85	15.00	12.00	3.00	2.50	ALS	MEDIUM	\N	\N	2025-09-18 15:59:00.742	2025-09-18 15:59:00.742	2025-09-18 15:59:00.742
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.trips (id, "tripNumber", "patientId", "patientWeight", "specialNeeds", "fromLocation", "toLocation", "scheduledTime", "transportLevel", "urgencyLevel", diagnosis, "mobilityLevel", "oxygenRequired", "monitoringRequired", "generateQRCode", "qrCodeData", "selectedAgencies", "notificationRadius", "transferRequestTime", "transferAcceptedTime", "emsArrivalTime", "emsDepartureTime", "actualStartTime", "actualEndTime", status, priority, notes, "assignedTo", "assignedAgencyId", "assignedUnitId", "acceptedTimestamp", "pickupTimestamp", "completionTimestamp", "createdAt", "updatedAt", "actualTripTimeMinutes", "backhaulOpportunity", "completionTimeMinutes", "customerSatisfaction", "deadheadMiles", "destinationLatitude", "destinationLongitude", "distanceMiles", efficiency, "estimatedTripTimeMinutes", "insuranceCompany", "insurancePayRate", "loadedMiles", "originLatitude", "originLongitude", "perMileRate", "performanceScore", "requestTimestamp", "responseTimeMinutes", "revenuePerHour", "tripCost", "pickupLocationId", "maxResponses", "responseDeadline", "responseStatus", "selectionMode", "patientName") FROM stdin;
cmfpnzud00003kbujmztrilgu	TRP-1758215303027	PMYPZR4WU	250	none	Test Hospital	Test Hospital	2025-09-19 01:00:00	BLS	Routine	Cardiac	Wheelchair	f	f	f	\N	{cmfo85iq80000u0qbivx3funu}	100	2025-09-18 17:08:23.027	\N	\N	\N	\N	\N	COMPLETED	LOW	\N	\N	\N	\N	\N	\N	2025-09-18 19:51:50.363	2025-09-18 17:08:23.028	2025-09-18 19:51:50.367	\N	f	\N	\N	\N	\N	\N	5	\N	\N	Medicaid	100.00	\N	\N	\N	1.75	\N	2025-09-18 17:08:23.028	\N	\N	200.00	cmfpne7h40001gar5dtayyrih	5	\N	PENDING	SPECIFIC_AGENCIES	\N
cmfr7q41t000312vnu8wedogt	TRP-1758308907520	PFDJ93BH4	500	none	Test Hospital	Test Hospital	2025-09-19 23:07:00	BLS	Routine	Dialysis	Stretcher	t	f	f	\N	{cmfo85iq80000u0qbivx3funu}	100	2025-09-19 19:08:27.52	\N	\N	\N	\N	\N	DECLINED	LOW	\N	\N	\N	\N	\N	\N	\N	2025-09-19 19:08:27.521	2025-09-20 11:47:04.189	\N	f	\N	\N	\N	\N	\N	5	\N	\N	Medicaid	100.00	\N	\N	\N	1.75	\N	2025-09-19 19:08:27.521	\N	\N	200.00	cmfpne7h40001gar5dtayyrih	5	\N	PENDING	SPECIFIC_AGENCIES	\N
cmfr7ds7q000112vnw5zg7yqb	TRP-1758308332308	PAOOBOMRX	500	none	Test Hospital	Penn Highlands Dubois	2025-09-19 22:47:00	BLS	Routine	Neurological	Stretcher	t	t	f	\N	{}	100	2025-09-19 18:58:52.308	\N	\N	\N	\N	\N	DECLINED	LOW	\N	\N	\N	\N	\N	\N	\N	2025-09-19 18:58:52.31	2025-09-20 11:48:59.105	\N	f	\N	\N	\N	\N	\N	5	\N	\N	Kaiser Permanente	150.00	\N	\N	\N	2.50	\N	2025-09-19 18:58:52.31	\N	\N	200.00	cmfpnoae20005e0zba7po0c2s	5	\N	PENDING	SPECIFIC_AGENCIES	\N
cmfsb69bq000514p9v409f25n	TRP-1758375165878	TEST-PATIENT-WORKFLOW	\N	\N	Test Hospital A	Test Hospital B	2025-09-20 13:32:45.878	BLS	Routine	\N	\N	f	f	f	\N	{}	100	2025-09-20 13:32:45.878	\N	\N	\N	\N	\N	COMPLETED	MEDIUM	\N	\N	ems-agency-2	\N	2025-09-20 13:32:45.902	2025-09-20 13:39:23.655	2025-09-20 13:39:32.071	2025-09-20 13:32:45.879	2025-09-20 13:39:32.073	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-20 13:32:45.879	\N	\N	\N	\N	3	2025-09-20 13:47:45.875	AGENCY_SELECTED	BROADCAST	\N
cmfpnp2xl0001kbujxi6ws2va	TRP-1758214800920	TEST-PATIENT-001	\N	\N	Test Hospital	UPMC Bedford Emergency Department	2025-09-19 10:00:00	BLS	Routine	\N	\N	f	f	f	\N	{}	100	2025-09-18 17:00:00.92	\N	\N	\N	\N	\N	PENDING	LOW	\N	\N	\N	\N	\N	\N	\N	2025-09-18 17:00:00.922	2025-09-20 12:28:25.842	\N	f	\N	\N	\N	\N	\N	5	\N	\N	\N	150.00	\N	\N	\N	2.50	\N	2025-09-18 17:00:00.922	\N	\N	150.00	cmfpnoae30009e0zbziglbq98	5	\N	PENDING	SPECIFIC_AGENCIES	\N
cmfsan2160001jwp1uquvq4qm	TRP-1758374269962	TEST-PATIENT-001	\N	\N	Test Hospital A	Test Hospital B	2025-09-20 13:17:49.961	BLS	Routine	\N	\N	f	f	f	\N	{}	100	2025-09-20 13:17:49.962	\N	\N	\N	\N	\N	PENDING	MEDIUM	\N	\N	\N	\N	\N	\N	\N	2025-09-20 13:17:49.962	2025-09-20 13:17:49.962	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-20 13:17:49.962	\N	\N	\N	\N	3	2025-09-20 13:32:49.959	PENDING	BROADCAST	\N
cmfsau6400001qkcr8enuwe9v	TRP-1758374601839	TEST-PATIENT-WORKFLOW	\N	\N	Test Hospital A	Test Hospital B	2025-09-20 13:23:21.839	BLS	Routine	\N	\N	f	f	f	\N	{}	100	2025-09-20 13:23:21.839	\N	\N	\N	\N	\N	PENDING	MEDIUM	\N	\N	\N	\N	\N	\N	\N	2025-09-20 13:23:21.84	2025-09-20 13:23:21.848	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-20 13:23:21.84	\N	\N	\N	\N	3	2025-09-20 13:38:21.837	RESPONSES_RECEIVED	BROADCAST	\N
cmfsawupq0001pfb6cqlm2nlb	TRP-1758374727038	TEST-PATIENT-WORKFLOW	\N	\N	Test Hospital A	Test Hospital B	2025-09-20 13:25:27.038	BLS	Routine	\N	\N	f	f	f	\N	{}	100	2025-09-20 13:25:27.038	\N	\N	\N	\N	\N	ACCEPTED	MEDIUM	\N	\N	ems-agency-2	\N	2025-09-20 13:25:27.066	\N	\N	2025-09-20 13:25:27.039	2025-09-20 13:25:27.067	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-20 13:25:27.039	\N	\N	\N	\N	3	2025-09-20 13:40:27.036	AGENCY_SELECTED	BROADCAST	\N
cmfsat16q0009g18jyejy5zy8	TRP-1758374548802	TEST-PATIENT-WORKFLOW	\N	\N	Test Hospital A	Test Hospital B	2025-09-20 13:22:28.801	BLS	Routine	\N	\N	f	f	f	\N	{}	100	2025-09-20 13:22:28.802	\N	\N	\N	\N	\N	PENDING	MEDIUM	\N	\N	\N	\N	\N	\N	\N	2025-09-20 13:22:28.802	2025-09-20 13:27:20.077	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-20 13:22:28.802	\N	\N	\N	\N	3	2025-09-20 13:37:28.799	RESPONSES_RECEIVED	BROADCAST	\N
cmfsas4bk0001g18jtqu51sck	TRP-1758374506206	TEST-PATIENT-WORKFLOW	\N	\N	Test Hospital A	Test Hospital B	2025-09-20 13:21:46.206	BLS	Routine	\N	\N	f	f	f	\N	{}	100	2025-09-20 13:21:46.206	\N	\N	\N	\N	\N	PENDING	MEDIUM	\N	\N	\N	\N	\N	\N	\N	2025-09-20 13:21:46.207	2025-09-20 13:27:25.659	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-20 13:21:46.207	\N	\N	\N	\N	3	2025-09-20 13:36:46.204	RESPONSES_RECEIVED	BROADCAST	\N
cmfsbc0yo000e14p9weff1sax	TRP-1758375434976	TEST-SELECTION-001	\N	\N	Test Hospital A	Test Hospital B	2025-09-20 13:37:14.976	BLS	Urgent	\N	\N	f	f	f	\N	{}	100	2025-09-20 13:37:14.976	\N	\N	\N	\N	\N	ACCEPTED	MEDIUM	\N	\N	test-agency-1	\N	2025-09-20 13:37:51.214	\N	\N	2025-09-20 13:37:14.976	2025-09-20 13:37:51.215	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-20 13:37:14.976	\N	\N	\N	\N	3	2025-09-20 14:07:14.973	AGENCY_SELECTED	BROADCAST	\N
cmfxwxo150001u3nnzvgd85gu	TRP-1758714047460	PYVYT0FWL	250	none	Penn Highlands - Tyrone	Altoona Regional Health System	2025-09-24 15:38:00	BLS	Routine	UTI	Wheelchair	t	t	f	\N	{cmfo85iq80000u0qbivx3funu,ems-agency-1}	100	2025-09-24 11:40:47.46	\N	\N	\N	\N	\N	PENDING	LOW	\N	\N	\N	\N	\N	\N	\N	2025-09-24 11:40:47.465	2025-09-24 11:40:47.465	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	Medicare	\N	\N	\N	\N	\N	\N	2025-09-24 11:40:47.465	\N	\N	\N	\N	5	2025-09-24 12:10:47.46	PENDING	SPECIFIC_AGENCIES	\N
cmfzdfr660001lkumfo84lptr	TRP-1758802231365	PTEST129	180	\N	UPMC Altoona	Johns Hopkins Hospital	2025-12-31 12:00:00	BLS	Routine	Stable Angina	Ambulatory	f	f	t	\N	{}	100	2025-09-25 12:10:31.365	\N	\N	\N	\N	\N	PENDING	LOW	Test trip via curl	\N	\N	\N	\N	\N	\N	2025-09-25 12:10:31.373	2025-09-25 12:10:31.373	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-25 12:10:31.373	\N	\N	\N	\N	5	2025-09-25 12:40:31.365	PENDING	SPECIFIC_AGENCIES	\N
cmfzdsdor0003lkumt3vrggsw	TRP-1758802820425	PA3AQSR3J	250	no	Test Hospital	Altoona Regional Health System	2025-09-25 16:19:00	ALS	Emergent	Dialysis	Stretcher	t	t	f	\N	{ems-agency-1}	100	2025-09-25 12:20:20.425	\N	\N	\N	\N	\N	PENDING	HIGH	\N	\N	\N	\N	\N	\N	\N	2025-09-25 12:20:20.427	2025-09-25 12:20:20.427	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	Medicare	\N	\N	\N	\N	\N	\N	2025-09-25 12:20:20.427	\N	\N	\N	cmfpnoadz0001e0zb8ehppwsh	5	2025-09-25 12:50:20.425	PENDING	SPECIFIC_AGENCIES	\N
cmfzdzx7p0005lkumxruyydim	TRP-1758803172324	PGYEP622T	250	no	Altoona Regional Health System	Test Hospital	2025-09-25 16:25:00	CCT	Emergent	Cardiac	Stretcher	t	t	f	\N	{ems-agency-2}	100	2025-09-25 12:26:12.324	\N	\N	\N	\N	\N	PENDING	HIGH	\N	\N	\N	\N	\N	\N	\N	2025-09-25 12:26:12.325	2025-09-25 12:26:12.325	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	Kaiser Permanente	\N	\N	\N	\N	\N	\N	2025-09-25 12:26:12.325	\N	\N	\N	pickup-1758802691747-zxy3l8tp9	5	2025-09-25 12:56:12.324	PENDING	SPECIFIC_AGENCIES	\N
cmfze7x4z0007lkumt8evaae6	TRP-1758803545473	PZFSHYFRO	250	no	Penn Highlands - Tyrone	Altoona Regional Health System	2025-09-25 16:31:00	BLS	Routine	UTI	Wheelchair	t	f	f	\N	{cmfo85iq80000u0qbivx3funu}	100	2025-09-25 12:32:25.473	\N	\N	\N	\N	\N	PENDING	LOW	\N	\N	\N	\N	\N	\N	\N	2025-09-25 12:32:25.474	2025-09-25 12:32:25.474	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	Blue Cross Blue Shield	\N	\N	\N	\N	\N	\N	2025-09-25 12:32:25.474	\N	\N	\N	\N	5	2025-09-25 13:02:25.473	PENDING	SPECIFIC_AGENCIES	\N
cmfzef6a50009lkumx1l8t462	TRP-1758803883916	PP000DJ3B	250	No	Test Hospital	Penn Highlands - Tyrone	2025-09-25 16:36:00	BLS	Routine	Cardiac	Stretcher	t	t	f	\N	{cmfo85iq80000u0qbivx3funu}	100	2025-09-25 12:38:03.916	\N	\N	\N	\N	\N	PENDING	LOW	\N	\N	\N	\N	\N	\N	\N	2025-09-25 12:38:03.917	2025-09-25 12:38:03.917	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	UnitedHealthcare	\N	\N	\N	\N	\N	\N	2025-09-25 12:38:03.917	\N	\N	\N	cmfpnoadz0001e0zb8ehppwsh	5	2025-09-25 13:08:03.916	PENDING	SPECIFIC_AGENCIES	\N
cmfzef7oj000blkuma8qa6p9y	TRP-1758803885729	PP000DJ3B	250	No	Test Hospital	Penn Highlands - Tyrone	2025-09-25 16:36:00	BLS	Routine	Cardiac	Stretcher	t	t	f	\N	{cmfo85iq80000u0qbivx3funu}	100	2025-09-25 12:38:05.729	\N	\N	\N	\N	\N	PENDING	LOW	\N	\N	\N	\N	\N	\N	\N	2025-09-25 12:38:05.731	2025-09-25 12:38:05.731	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	UnitedHealthcare	\N	\N	\N	\N	\N	\N	2025-09-25 12:38:05.731	\N	\N	\N	cmfpnoadz0001e0zb8ehppwsh	5	2025-09-25 13:08:05.729	PENDING	SPECIFIC_AGENCIES	\N
cmfzetr9a000dlkum8j1fg6w3	TRP-1758804564285	TEST-E2E-001	180	Test end-to-end flow	UPMC Altoona	General Hospital	2025-09-09 15:00:00	BLS	Routine	General Medical	Ambulatory	f	f	f	\N	{}	100	2025-09-25 12:49:24.285	\N	\N	\N	\N	\N	ACCEPTED	LOW	End-to-end test trip	\N	test-agency-id	\N	\N	\N	\N	2025-09-25 12:49:24.286	2025-09-25 12:49:26.35	\N	f	\N	\N	\N	\N	\N	5	\N	\N	\N	150.00	\N	\N	\N	2.50	\N	2025-09-25 12:49:24.286	\N	\N	200.00	\N	5	\N	PENDING	SPECIFIC_AGENCIES	\N
\.


--
-- Data for Name: unit_analytics; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.unit_analytics (id, "unitId", "performanceScore", efficiency, "totalTrips", "averageResponseTime", "lastUpdated") FROM stdin;
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
-- Name: ems_agencies ems_agencies_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.ems_agencies
    ADD CONSTRAINT ems_agencies_pkey PRIMARY KEY (id);


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
-- Name: center_users_email_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX center_users_email_key ON public.center_users USING btree (email);


--
-- Name: cost_centers_code_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX cost_centers_code_key ON public.cost_centers USING btree (code);


--
-- Name: notification_preferences_userId_notificationType_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "notification_preferences_userId_notificationType_key" ON public.notification_preferences USING btree ("userId", "notificationType");


--
-- Name: trips_tripNumber_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "trips_tripNumber_key" ON public.trips USING btree ("tripNumber");


--
-- Name: agency_responses agency_responses_tripId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.agency_responses
    ADD CONSTRAINT "agency_responses_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES public.trips(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: pickup_locations pickup_locations_hospitalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.pickup_locations
    ADD CONSTRAINT "pickup_locations_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES public.hospitals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trips trips_pickupLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT "trips_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES public.pickup_locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: scooper
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

