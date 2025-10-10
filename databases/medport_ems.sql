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
-- Name: crew_roles; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.crew_roles (
    id text NOT NULL,
    "roleName" text NOT NULL,
    "certificationLevel" text NOT NULL,
    "hourlyRate" numeric(8,2) NOT NULL,
    "overtimeMultiplier" numeric(3,2) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.crew_roles OWNER TO scooper;

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
    "addedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "addedBy" text
);


ALTER TABLE public.ems_agencies OWNER TO scooper;

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
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "emailNotifications" boolean DEFAULT true NOT NULL,
    phone text,
    "smsNotifications" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.ems_users OWNER TO scooper;

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
    "transferRequestTime" timestamp(3) without time zone,
    "transferAcceptedTime" timestamp(3) without time zone,
    "emsArrivalTime" timestamp(3) without time zone,
    "emsDepartureTime" timestamp(3) without time zone,
    "requestTimestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "acceptedTimestamp" timestamp(3) without time zone,
    "pickupTimestamp" timestamp(3) without time zone,
    "completionTimestamp" timestamp(3) without time zone,
    "assignedAgencyId" text,
    "assignedUnitId" text,
    "createdById" text,
    "readyStart" timestamp(3) without time zone,
    "readyEnd" timestamp(3) without time zone,
    isolation boolean DEFAULT false NOT NULL,
    bariatric boolean DEFAULT false NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.transport_requests OWNER TO scooper;

--
-- Name: units; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.units (
    id text NOT NULL,
    "agencyId" text,
    "unitNumber" text NOT NULL,
    type text NOT NULL,
    capabilities text[],
    "currentStatus" text DEFAULT 'AVAILABLE'::text NOT NULL,
    "currentLocation" jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "assignedTripId" text,
    "lastStatusUpdate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "statusHistory" jsonb,
    "currentTripDetails" jsonb,
    "lastKnownLocation" jsonb,
    "locationUpdatedAt" timestamp(3) without time zone,
    "totalTripsCompleted" integer DEFAULT 0 NOT NULL,
    "averageResponseTime" double precision,
    "lastMaintenanceDate" timestamp(3) without time zone,
    "maintenanceStatus" text DEFAULT 'OPERATIONAL'::text,
    "locationUpdateTimestamp" timestamp(3) without time zone,
    "performanceScore" numeric(5,2),
    "crewSize" integer,
    "crewComposition" jsonb,
    "baseHourlyRate" numeric(8,2),
    "overtimeMultiplier" numeric(3,2),
    "shiftLengthHours" numeric(4,2),
    "maxOvertimeHours" numeric(4,2),
    "vehicleCostPerMile" numeric(6,2),
    "fuelCostPerMile" numeric(6,2),
    "maintenanceCostPerMile" numeric(6,2),
    "homeBaseLocation" jsonb,
    "stagingLocations" jsonb,
    "maxServiceRadius" numeric(6,2),
    "interceptCapability" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.units OWNER TO scooper;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3b7dcef4-96f4-43fc-93a9-b333aa1aed6d	895e21cf998661814597337599db9325abae05f6fd99d8e67af02969b30fb49b	2025-09-17 12:50:53.138557-04	20250908204607_enhanced_trip_schema	\N	\N	2025-09-17 12:50:53.125105-04	1
f2b52bf8-efbf-45eb-8bc2-e7ef2f8eeadf	0b48e4bcc7145154bb481482c03de706b36c86f48c656b12d478b8dd45d54e53	2025-09-17 12:50:53.199269-04	20250917160504_add_unit_analytics_fields	\N	\N	2025-09-17 12:50:53.19342-04	1
7de7d34b-4f31-4e3a-810e-8e0032bcf536	89e9beb35f7e5647e64d45e1264c19dadd9fe7ca5c8749da84daaea7cedd7c3b	2025-09-17 12:50:53.146358-04	20250908204620_enhanced_trip_schema	\N	\N	2025-09-17 12:50:53.138988-04	1
06095982-c1f1-4821-ae9a-1da7f16cb619	c71696c75e737b3481ba216d59f1d3a930e9af1628919633f0c4c109610c2608	2025-09-17 12:50:53.153139-04	20250908204633_enhanced_trip_schema	\N	\N	2025-09-17 12:50:53.146702-04	1
754a0875-318e-48f2-9dd2-ed7aa7aa4f7f	49bb3390f5926ff720d5e23cb0bc1e4d1bae4c43b0a8b1b8880763b2e6071410	2025-09-17 12:50:53.160801-04	20250909152957_enhance_unit_model	\N	\N	2025-09-17 12:50:53.153486-04	1
3875fc03-5849-4f9e-ab03-948c60c58aaa	44c66f0f01b5545c4b554877a4d559288f95d2877da41008144d5156ea2c5c9f	2025-09-17 12:50:53.206856-04	20250917165001_add_crew_cost_management	\N	\N	2025-09-17 12:50:53.199517-04	1
c974a9d8-dbcc-46e0-a39d-4753c0f4cc6e	c2943858992ba54d18dd0e4a2595116de8484154f028fb536528354e9a6ddf32	2025-09-17 12:50:53.166687-04	20250909155719_q	\N	\N	2025-09-17 12:50:53.16109-04	1
5bc96cc1-b91b-4037-8f08-822d44f9078c	d8f906148b510b088f93398bf4a03c85b65c7d1df2558db866209a9bd91cbe1b	2025-09-17 12:50:53.16781-04	20250909163838_replace_shift_times_with_onduty	\N	\N	2025-09-17 12:50:53.166956-04	1
30b9722e-972c-4c38-8867-545b86edb24d	021a26ada7a3525e57f3e00837b7507da8987f9e8544ad631278e301eb9397d5	2025-09-17 12:50:53.169401-04	20250909170057_add_agency_relationship_to_ems_user	\N	\N	2025-09-17 12:50:53.168061-04	1
7b1b56af-120b-4c3b-9a6d-196f340ea4d4	20609b708b417229c937f6211ffcbb446e855a40a596277f09e8e7029079df85	2025-09-17 12:51:10.27618-04	20250917165101_add_crew_cost_management_ems	\N	\N	2025-09-17 12:51:10.257985-04	1
aad6fa0c-751b-4492-a175-be56250f4b83	b165969b119bf18fc20c2746c550bed458bd9ab164d006a4d8f4c998f9830440	2025-09-17 12:50:53.170457-04	20250909171727_remove_ison_duty_field	\N	\N	2025-09-17 12:50:53.1697-04	1
95f830ba-3090-444b-9487-b637fce2f2ce	44c66f0f01b5545c4b554877a4d559288f95d2877da41008144d5156ea2c5c9f	2025-09-17 12:50:53.17658-04	20250910173907_add_insurance_field_to_trips	\N	\N	2025-09-17 12:50:53.170742-04	1
e6cf4110-6c50-4688-a9b4-585785b99829	3fc0330691698d518f0d9092134a2685cc6a4adb73dd38a18ef7ff12fc2e25d4	2025-09-17 12:50:53.183879-04	20250910173915_add_dropdown_options_model	\N	\N	2025-09-17 12:50:53.176847-04	1
d2f9175b-e4f5-4283-b1bc-5ea366ca0b5e	4a1bd746c01627aba00ccfe9b481edee2718906740abb1a39da1620b3fca7480	2025-09-17 12:50:53.190235-04	20250910191806_add_route_optimization_fields	\N	\N	2025-09-17 12:50:53.184147-04	1
ae7460a1-af2a-4871-af65-567ce7cadd51	72c63e7e10d1a7523f160174d852c31ad5370ee69c85901819a460c6040b504e	2025-09-17 12:50:53.191253-04	20250910192847_add_insurance_pricing_fields	\N	\N	2025-09-17 12:50:53.190458-04	1
7ba78f57-0860-4419-92e6-5d4965e305f1	28faf265f0615c404102eef682b9e38fac8942e38b2882916bec3856d820ecf0	2025-09-17 12:50:53.193186-04	20250917160459_add_analytics_fields	\N	\N	2025-09-17 12:50:53.191451-04	1
\.


--
-- Data for Name: crew_roles; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.crew_roles (id, "roleName", "certificationLevel", "hourlyRate", "overtimeMultiplier", "isActive", "createdAt", "updatedAt") FROM stdin;
cmfo7xy230000xlv6gjymill4	EMT	BLS	25.00	1.50	t	2025-09-17 16:51:14.475	2025-09-17 16:51:14.475
cmfo7xy250001xlv6bqnhajpc	Paramedic	ALS	35.00	1.50	t	2025-09-17 16:51:14.477	2025-09-17 16:51:14.477
cmfo7xy250002xlv699yaixrt	RN	CCT	45.00	1.50	t	2025-09-17 16:51:14.478	2025-09-17 16:51:14.478
cmfo7xy260003xlv6xqrryd3c	CCT Specialist	CCT	40.00	1.50	t	2025-09-17 16:51:14.478	2025-09-17 16:51:14.478
cmfo7xy260004xlv6k5j93te7	Critical Care Paramedic	CCT	42.00	1.50	t	2025-09-17 16:51:14.479	2025-09-17 16:51:14.479
\.


--
-- Data for Name: ems_agencies; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.ems_agencies (id, name, "contactName", phone, email, address, city, state, "zipCode", "serviceArea", "operatingHours", capabilities, "pricingStructure", "isActive", status, "createdAt", "updatedAt", "addedAt", "addedBy") FROM stdin;
cmfo85iq80000u0qbivx3funu	Default EMS Agency	Admin	555-0123	admin@ems.com	123 Main St	Pittsburgh	PA	15213	{Pittsburgh,"Allegheny County"}	\N	{BLS,ALS,CCT}	\N	t	ACTIVE	2025-09-17 16:57:07.856	2025-09-17 16:57:07.856	2025-09-17 16:57:07.856	\N
ems-agency-1	Test EMS Agency 1	John Smith	555-0001	agency1@test.com	123 Main St	Test City	PA	12345	{"Test City","Nearby Area"}	\N	{BLS,ALS}	\N	t	ACTIVE	2025-09-20 13:22:20.183	2025-09-20 13:22:20.183	2025-09-20 13:22:20.183	\N
ems-agency-2	Test EMS Agency 2	Jane Doe	555-0002	agency2@test.com	456 Oak Ave	Test City	PA	12345	{"Test City","Nearby Area"}	\N	{BLS,ALS}	\N	t	ACTIVE	2025-09-20 13:22:20.186	2025-09-20 13:22:20.186	2025-09-20 13:22:20.186	\N
ems-agency-3	Test EMS Agency 3	Bob Johnson	555-0003	agency3@test.com	789 Pine St	Test City	PA	12345	{"Test City","Nearby Area"}	\N	{BLS,ALS}	\N	t	ACTIVE	2025-09-20 13:22:20.187	2025-09-20 13:22:20.187	2025-09-20 13:22:20.187	\N
cmftypywt0001hlslw6s7wpc6	Mountain Valley EMS	Frank Ferguson	555-123-4567	contact@movalleyems.com	123 Main Street	Mountain Valley	CA	90210	{"Mountain Valley","Valley View",Hillside}	\N	{BLS,ALS,CCT}	\N	t	ACTIVE	2025-09-21 17:19:42.846	2025-09-21 17:19:42.846	2025-09-21 17:19:42.846	\N
cmftypzwx0000p4vf9tdqdwql	Altoona Regional EMS	John Smith	814-555-0101	contact@altoonaems.com	123 Main St	Altoona	PA	16601	{Altoona,"surrounding areas"}	\N	{ALS,BLS,CCT}	\N	t	ACTIVE	2025-09-21 17:19:44.145	2025-09-21 17:19:44.145	2025-09-21 17:19:44.145	\N
cmftypzwz0001p4vf2d5b64ie	Blair County EMS	Sarah Johnson	814-555-0102	dispatch@blaircountyems.com	456 Oak Ave	Hollidaysburg	PA	16648	{"Blair County"}	\N	{ALS,BLS}	\N	t	ACTIVE	2025-09-21 17:19:44.148	2025-09-21 17:19:44.148	2025-09-21 17:19:44.148	\N
cmftypzx00002p4vffw74zbra	Mountain View EMS	Mike Wilson	814-555-0103	info@mountainviewems.com	789 Pine St	Tyrone	PA	16686	{Tyrone,"surrounding areas"}	\N	{BLS}	\N	t	ACTIVE	2025-09-21 17:19:44.149	2025-09-21 17:19:44.149	2025-09-21 17:19:44.149	\N
cmftypzx10003p4vfxpvlwies	Central PA Medical Transport	Lisa Brown	814-555-0104	contact@centralpamedical.com	321 Elm St	State College	PA	16801	{"Central Pennsylvania"}	\N	{CCT,ALS}	\N	t	ACTIVE	2025-09-21 17:19:44.149	2025-09-21 17:19:44.149	2025-09-21 17:19:44.149	\N
\.


--
-- Data for Name: ems_users; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.ems_users (id, email, password, name, "agencyName", "agencyId", "isActive", "userType", "createdAt", "updatedAt", "emailNotifications", phone, "smsNotifications") FROM stdin;
cmfo85iru0002u0qbmsb9hedk	ems@test.com	$2b$10$akqKrMn4onZV47ke5tR0BuoS6Hj/d54vEfSGjo5TFIbmHWQYxVW.y	EMS Test User	Default EMS Agency	cmfo85iq80000u0qbivx3funu	t	EMS	2025-09-17 16:57:07.915	2025-09-17 16:57:07.915	t	\N	f
cmfscohvm000061de4jwqk3y1	rick@newsroomsolutions.com	$2b$10$Mvlo7/GObJa0sve3dNmsAuL1Noqu.HzyeIlfeQldvC1/gN.mMFuhq	Paramedic Bob	Blacklick Valley Ambulance	\N	t	EMS	2025-09-20 14:14:56.387	2025-09-20 14:14:56.387	t	\N	f
cmftypywo0000hlsl8crvmqbg	fferguson@movalleyems.com	$2b$10$UZrAwb6DlllV39vdbDyUQ.efeM0kkMuBPXXio6hx090S1P7sPDLAC	Frank Ferguson	Mountain Valley EMS	\N	t	EMS	2025-09-21 17:19:42.841	2025-09-21 17:19:42.841	t	\N	f
\.


--
-- Data for Name: transport_requests; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.transport_requests (id, "tripNumber", "patientId", "patientWeight", "specialNeeds", "originFacilityId", "destinationFacilityId", "fromLocation", "toLocation", "scheduledTime", "transportLevel", "urgencyLevel", priority, status, "specialRequirements", diagnosis, "mobilityLevel", "oxygenRequired", "monitoringRequired", "generateQRCode", "qrCodeData", "selectedAgencies", "notificationRadius", "transferRequestTime", "transferAcceptedTime", "emsArrivalTime", "emsDepartureTime", "requestTimestamp", "acceptedTimestamp", "pickupTimestamp", "completionTimestamp", "assignedAgencyId", "assignedUnitId", "createdById", "readyStart", "readyEnd", isolation, bariatric, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.units (id, "agencyId", "unitNumber", type, capabilities, "currentStatus", "currentLocation", "isActive", "assignedTripId", "lastStatusUpdate", "statusHistory", "currentTripDetails", "lastKnownLocation", "locationUpdatedAt", "totalTripsCompleted", "averageResponseTime", "lastMaintenanceDate", "maintenanceStatus", "locationUpdateTimestamp", "performanceScore", "crewSize", "crewComposition", "baseHourlyRate", "overtimeMultiplier", "shiftLengthHours", "maxOvertimeHours", "vehicleCostPerMile", "fuelCostPerMile", "maintenanceCostPerMile", "homeBaseLocation", "stagingLocations", "maxServiceRadius", "interceptCapability", "createdAt", "updatedAt") FROM stdin;
cmfqz7d6z000111oo6enc5d5i	cmfo85iq80000u0qbivx3funu	422	AMBULANCE	{BLS,ALS}	AVAILABLE	\N	t	\N	2025-09-19 15:09:55.978	[{"reason": "Unit created", "status": "AVAILABLE", "timestamp": "2025-09-19T15:09:55.978Z"}]	\N	\N	\N	0	\N	\N	OPERATIONAL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2025-09-19 15:09:55.979	2025-09-19 15:09:55.979
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: crew_roles crew_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.crew_roles
    ADD CONSTRAINT crew_roles_pkey PRIMARY KEY (id);


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
-- Name: transport_requests transport_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_pkey PRIMARY KEY (id);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: ems_users_email_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX ems_users_email_key ON public.ems_users USING btree (email);


--
-- Name: transport_requests_tripNumber_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "transport_requests_tripNumber_key" ON public.transport_requests USING btree ("tripNumber");


--
-- Name: ems_users ems_users_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.ems_users
    ADD CONSTRAINT "ems_users_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public.ems_agencies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transport_requests transport_requests_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT "transport_requests_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.ems_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: units units_agencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT "units_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES public.ems_agencies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: scooper
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

