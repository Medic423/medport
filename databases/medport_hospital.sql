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
-- Name: dropdown_options; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.dropdown_options (
    id text NOT NULL,
    category text NOT NULL,
    value text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.dropdown_options OWNER TO scooper;

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
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    coordinates jsonb
);


ALTER TABLE public.facilities OWNER TO scooper;

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
    "emailNotifications" boolean DEFAULT true NOT NULL,
    phone text,
    "smsNotifications" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.healthcare_users OWNER TO scooper;

--
-- Name: hospital_users; Type: TABLE; Schema: public; Owner: scooper
--

CREATE TABLE public.hospital_users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    "hospitalName" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.hospital_users OWNER TO scooper;

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
    "healthcareCreatedById" text,
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
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e68214b3-a706-42cd-a9b3-7b0b89a659f0	895e21cf998661814597337599db9325abae05f6fd99d8e67af02969b30fb49b	2025-09-08 16:46:33.300063-04	20250908204607_enhanced_trip_schema	\N	\N	2025-09-08 16:46:33.289356-04	1
85ca752a-1b3b-486b-859c-2b9f07763bc6	89e9beb35f7e5647e64d45e1264c19dadd9fe7ca5c8749da84daaea7cedd7c3b	2025-09-08 16:46:33.313551-04	20250908204620_enhanced_trip_schema	\N	\N	2025-09-08 16:46:33.300365-04	1
dbdb2cdb-f5b8-4954-8fdc-66cd67a4cda0	c71696c75e737b3481ba216d59f1d3a930e9af1628919633f0c4c109610c2608	2025-09-08 16:46:33.747252-04	20250908204633_enhanced_trip_schema	\N	\N	2025-09-08 16:46:33.741886-04	1
d42d14bb-fe57-45bf-88de-796e75dcdcfa	49bb3390f5926ff720d5e23cb0bc1e4d1bae4c43b0a8b1b8880763b2e6071410	2025-09-10 13:39:15.362664-04	20250909152957_enhance_unit_model	\N	\N	2025-09-10 13:39:15.347733-04	1
65b88899-97a9-419c-ae93-3e19d8d95d44	c2943858992ba54d18dd0e4a2595116de8484154f028fb536528354e9a6ddf32	2025-09-10 13:39:15.36995-04	20250909155719_q	\N	\N	2025-09-10 13:39:15.363009-04	1
a8dbf6a7-3873-4c8b-9934-5737f2558410	d8f906148b510b088f93398bf4a03c85b65c7d1df2558db866209a9bd91cbe1b	2025-09-10 13:39:15.371206-04	20250909163838_replace_shift_times_with_onduty	\N	\N	2025-09-10 13:39:15.370355-04	1
00365d2c-f73e-444a-afc1-7ac17a8945cd	021a26ada7a3525e57f3e00837b7507da8987f9e8544ad631278e301eb9397d5	2025-09-10 13:39:15.372447-04	20250909170057_add_agency_relationship_to_ems_user	\N	\N	2025-09-10 13:39:15.371414-04	1
99bcb4c6-1382-4b7c-9c8d-707be4d4a613	b165969b119bf18fc20c2746c550bed458bd9ab164d006a4d8f4c998f9830440	2025-09-10 13:39:15.373204-04	20250909171727_remove_ison_duty_field	\N	\N	2025-09-10 13:39:15.372637-04	1
1a340154-c5d3-4fa5-a68a-4fb4d957712f	44c66f0f01b5545c4b554877a4d559288f95d2877da41008144d5156ea2c5c9f	2025-09-10 13:39:15.37923-04	20250910173907_add_insurance_field_to_trips	\N	\N	2025-09-10 13:39:15.373416-04	1
bfc67521-1cb5-4508-9c16-1c5f9090c01a	3fc0330691698d518f0d9092134a2685cc6a4adb73dd38a18ef7ff12fc2e25d4	2025-09-10 13:39:15.792389-04	20250910173915_add_dropdown_options_model	\N	\N	2025-09-10 13:39:15.786121-04	1
\.


--
-- Data for Name: dropdown_options; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.dropdown_options (id, category, value, "isActive", "createdAt", "updatedAt") FROM stdin;
cmfebh8nk00006ldr64kp8y5k	insurance	Test Insurance	f	2025-09-10 18:32:31.761	2025-09-10 18:32:38.035
cmfeab9ec0000klkzej73tc8p	insurance	Aetna	t	2025-09-10 17:59:53.172	2025-09-21 17:19:36.058
cmfeab9eh0001klkzbze5ktmk	insurance	Anthem Blue Cross Blue Shield	t	2025-09-10 17:59:53.178	2025-09-21 17:19:36.061
cmfeab9ei0002klkzuyzi9i6c	insurance	Blue Cross Blue Shield	t	2025-09-10 17:59:53.179	2025-09-21 17:19:36.062
cmfeab9ej0003klkzdao34fhu	insurance	Cigna	t	2025-09-10 17:59:53.179	2025-09-21 17:19:36.062
cmfeab9ej0004klkzjxobfenj	insurance	Humana	t	2025-09-10 17:59:53.18	2025-09-21 17:19:36.063
cmfeab9ek0005klkz5n6kbge4	insurance	Kaiser Permanente	t	2025-09-10 17:59:53.18	2025-09-21 17:19:36.063
cmfeab9ek0006klkzqpcq53st	insurance	Medicare	t	2025-09-10 17:59:53.181	2025-09-21 17:19:36.063
cmfeab9el0007klkzryy4e4pn	insurance	Medicaid	t	2025-09-10 17:59:53.181	2025-09-21 17:19:36.064
cmfeab9el0008klkz6oemhitf	insurance	UnitedHealthcare	t	2025-09-10 17:59:53.182	2025-09-21 17:19:36.064
cmfeab9em0009klkzgopr62mt	insurance	AARP	t	2025-09-10 17:59:53.182	2025-09-21 17:19:36.065
cmfeab9em000aklkzh7fyguae	insurance	Tricare	t	2025-09-10 17:59:53.183	2025-09-21 17:19:36.065
cmfeab9en000bklkzjt68gsug	insurance	Other	t	2025-09-10 17:59:53.183	2025-09-21 17:19:36.066
cmfeab9en000cklkz6014gbx0	diagnosis	Acute Myocardial Infarction	t	2025-09-10 17:59:53.183	2025-09-21 17:19:36.066
cmfeab9en000dklkzzk5xvnvq	diagnosis	Stroke/CVA	t	2025-09-10 17:59:53.184	2025-09-21 17:19:36.067
cmfeab9eo000eklkzdchyb57s	diagnosis	Pneumonia	t	2025-09-10 17:59:53.184	2025-09-21 17:19:36.067
cmfeab9eo000fklkzz9q4l2os	diagnosis	Congestive Heart Failure	t	2025-09-10 17:59:53.185	2025-09-21 17:19:36.067
cmfeab9ep000gklkzc5a5bj5o	diagnosis	COPD Exacerbation	t	2025-09-10 17:59:53.185	2025-09-21 17:19:36.068
cmfeab9ep000hklkzvbgj3r62	diagnosis	Sepsis	t	2025-09-10 17:59:53.185	2025-09-21 17:19:36.068
cmfeab9ep000iklkz1elj0dg7	diagnosis	Trauma	t	2025-09-10 17:59:53.186	2025-09-21 17:19:36.068
cmfeab9eq000jklkz330fk3qd	diagnosis	Surgical Recovery	t	2025-09-10 17:59:53.186	2025-09-21 17:19:36.069
cmfeab9eq000kklkzv6xdtubd	diagnosis	Dialysis	t	2025-09-10 17:59:53.186	2025-09-21 17:19:36.069
cmfeab9eq000lklkza6m4t0ug	diagnosis	Oncology	t	2025-09-10 17:59:53.187	2025-09-21 17:19:36.07
cmfeab9eq000mklkzmlkjkb4a	diagnosis	Psychiatric Emergency	t	2025-09-10 17:59:53.187	2025-09-21 17:19:36.07
cmfeab9er000nklkz2vwqqxex	diagnosis	Other	t	2025-09-10 17:59:53.187	2025-09-21 17:19:36.07
cmfeab9er000oklkzlja4qbg4	mobility	Independent	t	2025-09-10 17:59:53.188	2025-09-21 17:19:36.071
cmfeab9er000pklkzays6fx2h	mobility	Assistive Device Required	t	2025-09-10 17:59:53.188	2025-09-21 17:19:36.072
cmfeab9es000qklkzb9q0ot89	mobility	Wheelchair Bound	t	2025-09-10 17:59:53.188	2025-09-21 17:19:36.072
cmfeab9es000rklkz2v9qvdl9	mobility	Bed Bound	t	2025-09-10 17:59:53.189	2025-09-21 17:19:36.072
cmfeab9et000sklkzqck41oai	mobility	Stretcher Required	t	2025-09-10 17:59:53.189	2025-09-21 17:19:36.073
cmfeab9et000tklkzalrx32pa	mobility	Bariatric Equipment Required	t	2025-09-10 17:59:53.189	2025-09-21 17:19:36.073
cmfeab9et000uklkzswpg737r	transport-level	BLS - Basic Life Support	t	2025-09-10 17:59:53.19	2025-09-21 17:19:36.073
cmfeab9eu000vklkze8turoh7	transport-level	ALS - Advanced Life Support	t	2025-09-10 17:59:53.19	2025-09-21 17:19:36.074
cmfeab9eu000wklkzc73189s9	transport-level	Critical Care	t	2025-09-10 17:59:53.19	2025-09-21 17:19:36.074
cmfeab9eu000xklkzmw5hjgqe	transport-level	Neonatal	t	2025-09-10 17:59:53.191	2025-09-21 17:19:36.074
cmfeab9eu000yklkznurqf0fe	transport-level	Bariatric	t	2025-09-10 17:59:53.191	2025-09-21 17:19:36.075
cmfeab9ev000zklkzqjk6lik4	transport-level	Non-Emergency	t	2025-09-10 17:59:53.191	2025-09-21 17:19:36.075
cmfeab9ev0010klkzgm4tta0w	urgency	Emergency	t	2025-09-10 17:59:53.192	2025-09-21 17:19:36.075
cmfeab9ev0011klkzmw7eju3p	urgency	Urgent	t	2025-09-10 17:59:53.192	2025-09-21 17:19:36.077
cmfeab9ew0012klkz6ncajnug	urgency	Routine	t	2025-09-10 17:59:53.192	2025-09-21 17:19:36.077
cmfeab9ew0013klkz482pewew	urgency	Scheduled	t	2025-09-10 17:59:53.192	2025-09-21 17:19:36.077
cmfeab9ew0014klkzyfjfex81	urgency	Discharge	t	2025-09-10 17:59:53.193	2025-09-21 17:19:36.078
\.


--
-- Data for Name: facilities; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.facilities (id, name, type, address, city, state, "zipCode", phone, email, "isActive", "createdAt", "updatedAt", coordinates) FROM stdin;
cmfe9vptk0000mvfj3xkwqp82	Altoona Regional Emergency Department	HOSPITAL	620 Howard Ave	Altoona	PA	16601	(814) 889-2011	emergency@altoonaregional.org	t	2025-09-10 17:47:47.961	2025-09-10 17:47:47.961	{"lat": 40.5187, "lng": -78.3947}
cmfe9vptn0001mvfj3kq5hmt4	UPMC Bedford Emergency Department	HOSPITAL	10455 Lincoln Hwy	Everett	PA	15537	(814) 623-3331	emergency@upmc.edu	t	2025-09-10 17:47:47.964	2025-09-10 17:47:47.964	{"lat": 40.0115, "lng": -78.3734}
cmfeawe730000mk4xvqxcvog4	Altoona Regional Emergency Department	HOSPITAL	620 Howard Ave	Altoona	PA	16601	(814) 889-2011	emergency@altoonaregional.org	t	2025-09-10 18:16:19.167	2025-09-10 18:16:19.167	{"lat": 40.5187, "lng": -78.3947}
cmfeawe760001mk4xqevdsdsa	UPMC Bedford Emergency Department	HOSPITAL	10455 Lincoln Hwy	Everett	PA	15537	(814) 623-3331	emergency@upmc.edu	t	2025-09-10 18:16:19.17	2025-09-10 18:16:19.17	{"lat": 40.0115, "lng": -78.3734}
cmfeebd00000013iwf3m8k6az	Altoona Regional Emergency Department	HOSPITAL	620 Howard Ave	Altoona	PA	16601	(814) 889-2011	emergency@altoonaregional.org	t	2025-09-10 19:51:56.305	2025-09-10 19:51:56.305	{"lat": 40.5187, "lng": -78.3947}
cmfeebd03000113iwnnolxvko	UPMC Bedford Emergency Department	HOSPITAL	10455 Lincoln Hwy	Everett	PA	15537	(814) 623-3331	emergency@upmc.edu	t	2025-09-10 19:51:56.308	2025-09-10 19:51:56.308	{"lat": 40.0115, "lng": -78.3734}
cmfmx94wn0000db7mquiule75	UPMC Children's Hospital	Pediatric Hospital	4401 Penn Ave	Pittsburgh	PA	15224	412-692-5325	info@chp.edu	t	2025-09-16 19:04:14.615	2025-09-16 19:04:14.615	\N
cmfmx94wt0001db7m8enhxkin	UPMC Magee-Womens Hospital	Women's Hospital	300 Halket St	Pittsburgh	PA	15213	412-641-1000	info@upmc.edu	t	2025-09-16 19:04:14.621	2025-09-16 19:04:14.621	\N
cmfmx94wt0002db7mkf88fhr7	UPMC St. Margaret	Community Hospital	815 Freeport Rd	Pittsburgh	PA	15215	412-784-4000	info@upmc.edu	t	2025-09-16 19:04:14.622	2025-09-16 19:04:14.622	\N
cmfmx94wu0003db7mbddanyjb	UPMC East	Community Hospital	2775 Mosside Blvd	Monroeville	PA	15146	412-357-3000	info@upmc.edu	t	2025-09-16 19:04:14.622	2025-09-16 19:04:14.622	\N
cmfmx94wu0004db7m5xdqz8j3	UPMC Passavant	Community Hospital	9100 Babcock Blvd	Pittsburgh	PA	15237	412-367-2100	info@upmc.edu	t	2025-09-16 19:04:14.622	2025-09-16 19:04:14.622	\N
cmfmxaapp0000dp9rjpgz7e6w	UPMC Children's Hospital	Pediatric Hospital	4401 Penn Ave	Pittsburgh	PA	15224	412-692-5325	info@chp.edu	t	2025-09-16 19:05:08.797	2025-09-16 19:05:08.797	\N
cmfmxaapr0001dp9rav2b4zxh	UPMC Magee-Womens Hospital	Women's Hospital	300 Halket St	Pittsburgh	PA	15213	412-641-1000	info@upmc.edu	t	2025-09-16 19:05:08.799	2025-09-16 19:05:08.799	\N
cmfmxaapr0002dp9rw52g60se	UPMC St. Margaret	Community Hospital	815 Freeport Rd	Pittsburgh	PA	15215	412-784-4000	info@upmc.edu	t	2025-09-16 19:05:08.8	2025-09-16 19:05:08.8	\N
cmfmxaaps0003dp9rgw6dumui	UPMC East	Community Hospital	2775 Mosside Blvd	Monroeville	PA	15146	412-357-3000	info@upmc.edu	t	2025-09-16 19:05:08.8	2025-09-16 19:05:08.8	\N
cmfmxaaps0004dp9rdiu4d0hy	UPMC Passavant	Community Hospital	9100 Babcock Blvd	Pittsburgh	PA	15237	412-367-2100	info@upmc.edu	t	2025-09-16 19:05:08.801	2025-09-16 19:05:08.801	\N
cmfmxalkv000050y27pf5db3o	UPMC Children's Hospital	Pediatric Hospital	4401 Penn Ave	Pittsburgh	PA	15224	412-692-5325	info@chp.edu	t	2025-09-16 19:05:22.88	2025-09-16 19:05:22.88	\N
cmfmxalkx000150y28hb84qzb	UPMC Magee-Womens Hospital	Women's Hospital	300 Halket St	Pittsburgh	PA	15213	412-641-1000	info@upmc.edu	t	2025-09-16 19:05:22.882	2025-09-16 19:05:22.882	\N
cmfmxalkx000250y2e4nye5e5	UPMC St. Margaret	Community Hospital	815 Freeport Rd	Pittsburgh	PA	15215	412-784-4000	info@upmc.edu	t	2025-09-16 19:05:22.882	2025-09-16 19:05:22.882	\N
cmfmxalky000350y2ne98xjng	UPMC East	Community Hospital	2775 Mosside Blvd	Monroeville	PA	15146	412-357-3000	info@upmc.edu	t	2025-09-16 19:05:22.882	2025-09-16 19:05:22.882	\N
cmfmxalky000450y2oig691fv	UPMC Passavant	Community Hospital	9100 Babcock Blvd	Pittsburgh	PA	15237	412-367-2100	info@upmc.edu	t	2025-09-16 19:05:22.883	2025-09-16 19:05:22.883	\N
\.


--
-- Data for Name: healthcare_users; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.healthcare_users (id, email, password, name, "facilityName", "facilityType", "isActive", "userType", "createdAt", "updatedAt", "emailNotifications", phone, "smsNotifications") FROM stdin;
cmfms8xik0002pwcifom4djh6	test@healthcare.com	$2b$10$myb3Pv5iGeFKkiQGfvoFUulSFrK4QnUTgfa9XT.vnMoMFdj7/knOa	Test User	Test Facility	HOSPITAL	f	HEALTHCARE	2025-09-16 16:44:06.956	2025-09-16 16:44:06.956	t	\N	f
cmfmxi7yt0000muavtflcqmtt	healthcare@tcc.com	$2a$10$6qc.N7Y8CGhvlgAij8AkXeguFX8RkM4zmQGIgKQeDkbTHgOvqieKS	Healthcare User	UPMC Presbyterian	HOSPITAL	t	HEALTHCARE	2025-09-16 19:11:18.485	2025-09-16 19:11:18.485	t	\N	f
cmfsch3h800005wr6lxpt9mkx	doe@pennhighlands.com	$2b$10$BeQVOVQ4OpGOlrVlmn1GY.93J5w6ToQ.GMyMzFDGgjC7/5hbUyGI.	John Doe	Penn Highlands - Tyrone	Hospital	f	HEALTHCARE	2025-09-20 14:09:11.132	2025-09-20 14:09:11.132	t	\N	f
cmfjwcwft0000cn4fgdyins2b	admin@altoonaregional.org	$2b$10$idoz5H4/IiuuPJIBW0ZvYu/iAQyAGnV3MCwOAEIP47DL2ScaeKPFq	Healthcare Admin	UPMC Altoona	Hospital	t	HEALTHCARE	2025-09-14 16:15:52.121	2025-09-21 17:19:38.775	t	\N	f
\.


--
-- Data for Name: hospital_users; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.hospital_users (id, email, password, name, "hospitalName", "isActive", "createdAt", "updatedAt") FROM stdin;
cmfe9vpzr0002mvfjsx0zvos9	nurse@altoonaregional.org	$2a$12$.E15toZNDoBhWzP5asy9XOJzgimxRYws8J4ANhb8HlzGNKCEV/aGS	Sarah Johnson	Altoona Regional Health System	t	2025-09-10 17:47:48.183	2025-09-10 17:47:48.183
\.


--
-- Data for Name: transport_requests; Type: TABLE DATA; Schema: public; Owner: scooper
--

COPY public.transport_requests (id, "tripNumber", "patientId", "patientWeight", "specialNeeds", "originFacilityId", "destinationFacilityId", "fromLocation", "toLocation", "scheduledTime", "transportLevel", "urgencyLevel", priority, status, "specialRequirements", diagnosis, "mobilityLevel", "oxygenRequired", "monitoringRequired", "generateQRCode", "qrCodeData", "selectedAgencies", "notificationRadius", "transferRequestTime", "transferAcceptedTime", "emsArrivalTime", "emsDepartureTime", "requestTimestamp", "acceptedTimestamp", "pickupTimestamp", "completionTimestamp", "assignedAgencyId", "assignedUnitId", "createdById", "healthcareCreatedById", "readyStart", "readyEnd", isolation, bariatric, notes, "createdAt", "updatedAt") FROM stdin;
cmfe9vpzv0004mvfjh7062nma	\N	PAT-001	\N	\N	cmfe9vptk0000mvfj3xkwqp82	cmfe9vptn0001mvfj3kq5hmt4	\N	\N	\N	ALS	\N	MEDIUM	PENDING	Oxygen required	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	2025-09-10 17:47:48.187	\N	\N	\N	\N	\N	cmfe9vpzr0002mvfjsx0zvos9	\N	\N	\N	f	f	\N	2025-09-10 17:47:48.187	2025-09-10 17:47:48.187
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: dropdown_options dropdown_options_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.dropdown_options
    ADD CONSTRAINT dropdown_options_pkey PRIMARY KEY (id);


--
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_pkey PRIMARY KEY (id);


--
-- Name: healthcare_users healthcare_users_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.healthcare_users
    ADD CONSTRAINT healthcare_users_pkey PRIMARY KEY (id);


--
-- Name: hospital_users hospital_users_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.hospital_users
    ADD CONSTRAINT hospital_users_pkey PRIMARY KEY (id);


--
-- Name: transport_requests transport_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT transport_requests_pkey PRIMARY KEY (id);


--
-- Name: dropdown_options_category_value_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX dropdown_options_category_value_key ON public.dropdown_options USING btree (category, value);


--
-- Name: healthcare_users_email_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX healthcare_users_email_key ON public.healthcare_users USING btree (email);


--
-- Name: hospital_users_email_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX hospital_users_email_key ON public.hospital_users USING btree (email);


--
-- Name: transport_requests_tripNumber_key; Type: INDEX; Schema: public; Owner: scooper
--

CREATE UNIQUE INDEX "transport_requests_tripNumber_key" ON public.transport_requests USING btree ("tripNumber");


--
-- Name: transport_requests transport_requests_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT "transport_requests_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.hospital_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transport_requests transport_requests_destinationFacilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT "transport_requests_destinationFacilityId_fkey" FOREIGN KEY ("destinationFacilityId") REFERENCES public.facilities(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transport_requests transport_requests_healthcareCreatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT "transport_requests_healthcareCreatedById_fkey" FOREIGN KEY ("healthcareCreatedById") REFERENCES public.healthcare_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transport_requests transport_requests_originFacilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: scooper
--

ALTER TABLE ONLY public.transport_requests
    ADD CONSTRAINT "transport_requests_originFacilityId_fkey" FOREIGN KEY ("originFacilityId") REFERENCES public.facilities(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: scooper
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

