# EPIC Integration

Epic does have APIs, but they’re not “open” in the casual sense—access is controlled and usually goes through formal programs and a sponsoring health system.[1][9]

### What Epic Offers

- **Epic on FHIR (Epic EMR API / “Epic on FHIR”)**: A suite of FHIR-based REST APIs that expose USCDI-style clinical data (Patient, Encounter, Observations, Meds, etc.). These use OAuth2/OpenID and SMART-on-FHIR–style scopes for auth.[5][6][7][9]
- **Epic Integration API / general APIs**: Broader APIs to integrate external apps and services with Epic’s EHR for real‑time data exchange and workflow integration.[3][6][5]
- **Developer ecosystem (Showroom / formerly App Orchard)**: To move from sandbox to production you typically need:  
  - An Epic customer sponsor (the hospital/health system you’re integrating with).  
  - Signed agreements and compliance with Epic’s requirements.  
  - App registration and configuration per customer instance.[9][10][1]

### Practical Implications for You

- You can prototype against Epic’s public FHIR resources and documentation (fhir.epic.com / open.epic).[10][9]
- To talk to a specific hospital’s Epic, you almost always must work with that org’s IT/Epic team so they register your app and grant scopes for their instance.[1][9][10]
- As a dev building an iOS app, you’d typically implement SMART-on-FHIR login (OAuth2) and then call Epic’s FHIR endpoints (R4/STU3) over HTTPS.[6][7][5]

Sources
[1] Epic EHR API Integration: The Strategic CTO's Reality Guide | Invene https://www.invene.com/blog/epic-ehr-api-integration
[2] Epic EHR Software - Pricing, Features, Demo & Comparison https://www.ehrinpractice.com/epic-ehr-software-profile-119.html
[3] Epic Integration API - Apix-Drive https://apix-drive.com/en/blog/other/epic-integration-api
[4] Building a Health App Integrated with Epic Systems API: a Full Guide https://www.linkedin.com/pulse/building-health-app-integrated-epic-systems-api-full-guide-andrieiev-gecqe
[5] Integrate Epic EMR & Boost Healthcare System Interoperability - Chetu https://www.chetu.com/blogs/healthcare/integrate-epic-emr-for-system-interoperability.php
[6] Epic FHIR API: Best Practices for A Smooth Integration | Blog | Itirra https://itirra.com/blog/epic-fhir-api-best-practices-for-a-smooth-integration/
[7] How to Integrate with EPIC EHR Using Python and SMART on FHIR ... https://www.spritle.com/blog/how-to-integrate-with-epic-ehr-using-python-and-smart-on-fhir-apis/
[8] Healthcare API Vendors - Healthie https://www.gethealthie.com/glossary/healthcare-api-vendors
[9] Epic On FHIR Integration, Or How To Enhance Interoperability - SPsoft https://spsoft.com/tech-insights/epic-on-fhir-integration-in-healthcare/
[10] Epic API - how to get started? : r/healthIT - Reddit https://www.reddit.com/r/healthIT/comments/lmzqcw/epic_api_how_to_get_started/

You get production access to Epic FHIR only after registering your app with Epic, passing review, and then being enabled by each Epic customer you work with.[1][2][3]

### 1. Register in Epic’s developer program

- Create a developer account and register your app (Epic App Orchard / fhir.epic.com).[3][4][1]
- Specify whether it is provider‑facing (SMART launch from Hyperspace), patient‑facing, or backend, and which FHIR resources/scopes you need (e.g., Patient, Encounter, Observation, MedicationRequest).[5][1][3]
- Use the sandbox/non‑prod client ID to build and test your SMART-on-FHIR/OAuth2 flows first.[6][5]

### 2. Prepare for Epic review

- Implement standard SMART on FHIR OAuth flows (auth code + PKCE for interactive apps; backend service flow if needed).[7][5][6]
- Ensure your app’s security, privacy, and clinical use case align with Epic’s guidelines; Epic does a security and use‑case review before production access.[2][8][1]
- Package your app (metadata, screenshots, documentation, risk profile) and submit it through the portal for evaluation; typical review is days to weeks depending on app type.[8][2][3]

### 3. Obtain production credentials

- Once approved, Epic issues production configuration (client IDs, endpoints, scopes) for your app.[3][6][8]
- You will have separate non‑production and production client IDs and redirect URIs configured.[6][8]
- For some app categories, especially patient‑facing using mandated FHIR APIs, the process can be lighter, but you still must complete registration and app setup.[4][9]

### 4. Enable at each Epic customer site

- Production access is per‑organization: every Epic-using health system must configure your app in their own Epic instance.[2][7][8]
- Their IT/Epic team provisions your app (client ID, redirect URL, scopes) and typically does their own security/clinical review and a non‑prod test phase.[7][8][2]
- Go‑live usually follows a phased rollout: pilot unit, then broader deployment with monitoring.[8][7]

### 5. Practical path for you

For an iOS app or web app you’re building:

1. Register the app on Epic’s FHIR/App Orchard portal and get sandbox credentials.[1][4][3]
2. Implement SMART-on-FHIR against the sandbox (launch, auth, FHIR reads/writes) until flows are solid.[5][6][7]
3. Submit for Epic review through the portal, addressing security and clinical questions.[1][2][3]
4. Once approved, work with your first hospital’s Epic team to configure and test production, then repeat for additional sites.[2][7][8]

If you share whether your target users are clinicians in Hyperspace, patients, or EMS crews, I can outline the exact SMART flow and scopes you’re likely to need for your first production deployment.

Sources
[1] Step-by-Step Guide to Implementing Epic FHIR Integration with Your ... https://itirra.com/blog/step-by-step-guide-to-implementing-epic-fhir-integration-with-your-system/
[2] How To Integrate Your Healthcare App With Epic EHR https://technologyrivers.com/blog/how-to-integrate-your-healthcare-app-with-epic-ehr/
[3] How to Develop and Deploy an EPIC EHR App using FHIR? https://techvariable.com/blogs/how-to-develop-and-deploy-an-epic-ehr-app-using-fhir
[4] FAQ - Vendor Services - Epic https://vendorservices.epic.com/FAQ/Index
[5] How to Register, Authenticate & Launch Apps with Epic's FHIR APIs https://6b.health/insight/how-to-register-authenticate-launch-apps-with-epics-fhir-apis/
[6] EHR Launch (SMART on FHIR) - Intraconnects Documentation https://docs.intraconnects.com/docs/ehr-basics/epic/Auth/ehrsmartauth/
[7] Epic EHR Integration Guide | Technical Deep-Dive 2026 https://www.tactionsoft.com/blog/epic-ehr-integration-guide/
[8] Epic EHR Integration: Technical Guide | Learn | Orbdoc https://orbdoc.com/learn/epic-integration-technical-guide
[9] Launch Your Epic FHIR App in 48 Hours! - YouTube https://www.youtube.com/watch?v=dUGTigLHVi8
[10] Epic On FHIR Integration, Or How To Enhance Interoperability - SPsoft https://spsoft.com/tech-insights/epic-on-fhir-integration-in-healthcare/



Epic's FHIR APIs support pulling EMS transport data through **ServiceRequest** (physician orders) and **Encounter** (transport context including destination hospital).[1][2]

### Target FHIR Resources

| Data Needed | FHIR Resource | Key Fields | Example Query |
|-------------|---------------|------------|---------------|
| Destination hospital | **Encounter** | `Encounter.serviceProvider` (Organization ref), `Encounter.location.location` (hospital Location), `Encounter.destination` | `GET /Encounter?patient={MRN}&status=active&type=transport` [1][3] |
| Medical problem | **Encounter** or **Condition** | `Encounter.reasonCode`, `Encounter.diagnosis.condition` (SNOMED codes), `Condition.code` | `GET /Encounter/{id}/diagnosis` or `GET /Condition?patient={MRN}&clinical-status=active` [4][5] |
| Physician transfer order | **ServiceRequest** | `ServiceRequest.code` (e.g., "EMS transport"), `ServiceRequest.requester` (Practitioner), `ServiceRequest.occurrence` (timing), `ServiceRequest.reasonReference` → Condition | `GET /ServiceRequest?patient={MRN}&code=transport&status=active` [4][2] |

### iOS App Architecture (SwiftUI + FHIR)

```
App Flow:
1. SMART Launch (Hyperspace button → ASContext) or Backend Service
2. Patient Match ($match → MRN lookup)
3. Pull Orders → Encounter → Condition chain
4. Cache in CoreData, sync via BackgroundTasks
```

**Key Components** (your Cursor/Swift setup):

1. **Auth (ASWebAuthenticationSession)**:
   ```swift
   // SMART OAuth2 + PKCE
   let scopes = ["patient/*.read", "encounter.read", "servicerequest.read", "condition.read"]
   let authURL = epicFHIRBase + "/oauth2/authorize?..." // client_id, redirect_uri, scope
   ```

2. **FHIR Client (FHIR.swift or custom URLSession)**:
   ```swift
   func fetchTransportOrders(mrn: String) async -> [ServiceRequest] {
     let url = base + "/ServiceRequest?patient=" + mrn + "&code:missing=false&status=active&_include=ServiceRequest:reasonReference&_include=ServiceRequest:encounter"
     let bundle: Bundle<ServiceRequest> = try await fhirRequest(url) // parses JSON → Swift structs
     return bundle.entry.map { $0.resource }
   }
   ```

3. **Data Flow**:
   - Paramedic scans QR/Barcode → MRN → Patient/$match → ServiceRequest (filter `code` for transport).
   - From ServiceRequest.occurrence → pickup/dropoff times.
   - ServiceRequest.encounter → destination hospital + reasonCode → medical problem (SNOMED).
   - ServiceRequest.requester → ordering MD.
   - Cache locally (Realm/CoreData) for offline runsheet.

4. **Scopes for production** (request these in app registration):
   ```
   patient/Encounter.read
   patient/ServiceRequest.read  
   patient/Condition.read
   patient/Location.read  // for hospital details
   user/Encounter.read    // if clinician context
   ```

### Production Steps (EMS‑Specific)

1. **Register app** on fhir.epic.com as "Emergency Medical Services (EMS) Transportation Ordering" type → gets you EMS-relevant resources.[1]
2. **Sandbox test** against Epic’s public FHIR sandbox with EMS demo data.
3. **Epic review** → emphasize read‑only EMS handoff (no writes, low PHI risk).
4. **Hospital enablement** → their ED/IT configures your app for their transport workflows.

This pulls exactly the transport triplet you need in ~3 FHIR calls. Want me to generate the full Swift FHIR client starter code? Or help with the Epic app registration form wording for EMS use case?[2][3][1]

Sources
[1] Documentation - Epic on FHIR https://fhir.epic.com/Documentation
[2] ServiceRequest (Orders) - Specifications - Epic on FHIR https://fhir.epic.com/Specifications?api=1054
[3] Encounter - FHIR v6.0.0-ballot3 https://build.fhir.org/encounter.html
[4] Epic EHR Integration Guide | Technical Deep-Dive 2026 https://www.tactionsoft.com/blog/epic-ehr-integration-guide/
[5] Epic EHR Integration: Technical Guide | Learn | Orbdoc https://orbdoc.com/learn/epic-integration-technical-guide
[6] Epic FHIR Integration: Using FHIR Epic APIs - Clarity Ventures https://www.clarity-ventures.com/articles/epic-ehr-emr-integrations-with-fhir-endpoints
[7] Encounter Disposition | Interoperability Standards Platform (ISP) https://isp.healthit.gov/uscdi-data/encounter-disposition
[8] Epic On FHIR Integration, Or How To Enhance Interoperability - SPsoft https://spsoft.com/tech-insights/epic-on-fhir-integration-in-healthcare/
[9] Medical API Hack: Build a FHIR Patient App for Epic EHR Systems https://www.youtube.com/watch?v=z_3wA-_QRzQ
[10] Epic on FHIR: Home https://fhir.epic.com


## Phase 1 Accomplishments (February 2026)

The **EMS Transport Companion** app has been successfully created in Epic and is in the **Test** stage (ready for sandbox connectivity).

### App Configuration Summary

| Setting | Value |
|---------|-------|
| **Application Name** | EMS Transport Companion |
| **Client ID** | `B1R5b00c5-e513-4e6a-a009-3c88c8182cdb` |
| **Application Audience** | Clinicians or Administrative Users |
| **Endpoint URL** | `https://tencomm.com/auth/epic/callback` |
| **Dynamic Clients** | Cannot Register Dynamic Clients |
| **Confidential Client** | Yes |
| **Persistent Access** | Requires Persistent Access |
| **Rolling Refresh Tokens** | Uses Rolling Refresh Tokens |
| **Indefinite Access** | Can Have Indefinite Access |
| **SMART on FHIR Version** | STU3 |
| **SMART Scope Version** | SMART v2 |
| **FHIR ID Generation** | Use Unrestricted FHIR Ids |

### Incoming APIs (FHIR Read)

- Condition (Reason for Visit, Encounter Diagnosis, Problems)
- Encounter (Patient Chart)
- Location
- Observation
- Patient (Demographics)
- Relationship

### Outgoing APIs

- None (read-only app)

### Phase 2 Reminder: Add ServiceRequest API

**ServiceRequest (Orders)** is not currently in the app's Incoming APIs. It is required for Phase 3 (creating trips from Epic transport orders) and for pulling physician transfer/transport orders. Add **ServiceRequest Read (Orders)** to the Epic app configuration in Phase 2 before implementing FHIR reads. See [Epic ServiceRequest Specifications](https://fhir.epic.com/Specifications?api=1054).

### Next Step

**Phase 2: Sandbox Connectivity** – Implement OAuth2 flow and FHIR API client to connect TCC to the Epic sandbox. See [epic_integration_plan.md](../../../.cursor/plans/epic_integration_plan_30d74051.plan.md) for Phase 2 TODOs.

**Note:** For local development, add `http://localhost:3000/auth/epic/callback` as an additional redirect URI in the Epic app configuration if needed.

---

## Epic Account Credentials

Store Epic portal login and OAuth credentials securely (e.g., password manager, `backend/.env.local`). See [epic_credentials_setup.md](epic_credentials_setup.md) for setup instructions. **Never commit credentials to version control.**

Here’s EMS‑specific wording you can adapt directly into the Epic app registration fields for an Epic-on-FHIR transport app.

***

## App name and short description

**App name**  
EMS Transport Companion

**Short description**  
Read‑only SMART‑on‑FHIR app that lets EMS crews and hospital staff view key transport details (destination, medical problem, transfer order) in one screen, using existing Epic patient and encounter data.[1][2]

***

## Long / marketing description

> EMS Transport Companion is a read‑only SMART‑on‑FHIR application embedded in Epic that helps clinicians and EMS partners coordinate interfacility and emergent transports more safely and efficiently. The app launches in the context of the selected Epic patient and encounter and displays the current destination facility, primary medical problem, and active transfer or transport orders in a single, streamlined view.[3][4][1]
>  
> By using Epic’s FHIR APIs, the app automatically pulls data such as Encounter details (including service location/destination), Conditions/diagnoses driving the transfer, and ServiceRequest/Orders representing the physician’s transport or transfer order. This reduces phone calls, duplicate data entry, and manual hand‑offs between case management, ED staff, and EMS crews.[2][1][3]
>  
> EMS Transport Companion does not write back to Epic and does not modify orders or documentation. It is designed as a conservative, read‑only tool that surfaces existing Epic data in a transport‑oriented layout to support better communication, faster throughput, and fewer errors during patient movement between facilities.[4][2]

***

## Intended users / clinical roles

You can list these as bullets or free text, depending on the form:

- Emergency department nurses and physicians  
- Case managers and discharge planners  
- Transfer center staff  
- EMS/transport coordinators and supervisors  
- Bed control / patient flow coordinators[3][4]

Example wording:

> Primary users are ED nurses, case managers, transfer center staff, and EMS coordinators who need a consolidated view of destination, diagnosis, and transfer orders when arranging or monitoring patient transport.[4][3]

***

## Clinical use case statement

> The app supports safe and timely interfacility and intra‑facility transports by giving clinicians and EMS partners a clear view of why the patient is being transported, where they are going, and under which physician order the transfer is occurring. It uses Epic FHIR R4 resources such as Encounter, ServiceRequest (Orders), Condition, Organization, and Location to present this information in a single view tailored to transport workflows.[5][6][2]
>  
> Typical scenarios include:  
> - An ED nurse arranging a ground or air transport to a higher level of care.  
> - A case manager coordinating a non‑emergent transfer to a post‑acute facility.  
> - A transfer center confirming destination and clinical indication with an EMS crew.[5][3][4]

***

## SMART launch type and context

For an in‑Epic tool:

> The application is an EHR‑launched SMART‑on‑FHIR app opened from within Epic’s clinical workspace. It requires patient and encounter context so that when launched, it immediately displays transport‑relevant information for the currently selected patient encounter.[7][1]

Add a sentence about patterns:

> We support the EHR‑launched SMART flow (Authorization Code + PKCE) and honor Epic launch parameters such as `patient`, `encounter`, `need_patient_banner`, and `smart_style_url`.[1][2]

***

## Requested FHIR resources and scopes (read‑only)

List these exactly as a justification block:

> **FHIR resources:**  
> - Patient: to display patient identifiers and basic demographics.  
> - Encounter: to determine the current encounter, level of care, and destination/service location.  
> - Condition: to show the primary medical problem/diagnosis driving the transfer.  
> - ServiceRequest / Orders: to show active transfer/transport orders and ordering provider.  
> - Organization and Location: to identify the destination hospital or unit by name and address.[6][8][2]
>  
> **Scopes (read‑only only):**  
> - `patient/Patient.read`  
> - `patient/Encounter.read`  
> - `patient/Condition.read`  
> - `patient/ServiceRequest.read` (or equivalent Orders resource)  
> - `patient/Organization.read`  
> - `patient/Location.read`  
>  
> The app is strictly read‑only and does not create, update, or delete any Epic data.[2][6]

***

## Privacy, security, and data handling

> EMS Transport Companion uses OAuth 2.0 and SMART‑on‑FHIR for authentication and authorization and only accesses data for the patient and encounter in context. All communication with Epic occurs over TLS. The app does not persist PHI outside the organization’s environment beyond short‑lived session caching needed for rendering the current screen; no long‑term external storage, analytics, or secondary data use is performed without the customer’s explicit agreement.[1][2]

If you plan to store anything externally, add a line describing encryption at rest and BAA.

***

## Value proposition for hospitals

> By reducing phone calls, redundant data entry, and manual hand‑offs, the app can shorten transport ordering/coordination time and decrease delays in moving patients to the appropriate level of care, which supports throughput and bed management goals.[3][4]

***

If you paste the above into your registration form, we can then tighten it to fit specific character limits (e.g., 140‑char short description, 500‑char long description) and tune wording to match your exact feature set (iOS‑only, web, EMS agency branding, etc.).

Sources
[1] How to Register, Authenticate & Launch Apps with Epic's FHIR APIs https://6b.health/insight/how-to-register-authenticate-launch-apps-with-epics-fhir-apis/
[2] Documentation - Epic on FHIR https://fhir.epic.com/Documentation
[3] GMR Develops medical transport ordering app to interface with ... https://www.ems1.com/ems-products/technology/press-releases/gmr-develops-medical-transport-ordering-app-to-interface-with-industry-leading-ehr-WKgtb3fD8iOdIaZn/
[4] CarePort® Patient Event Notification Solution Now Available in Epic ... https://wellsky.com/careport-patient-event-notification-solution-now-available-in-epic-app-orchard-marketplace/
[5] FHIR Use Cases: How FHIR is Transforming Healthcare - Binariks https://binariks.com/blog/fhir-use-cases/
[6] ServiceRequest (Orders) - Specifications - Epic on FHIR https://fhir.epic.com/Specifications?api=1054
[7] Integrating SMART on FHIR App With Epic - Technosoft Solutions https://techno-soft.com/integrating-smart-app-with-epic.html
[8] Encounter - FHIR v6.0.0-ballot3 https://build.fhir.org/encounter.html
[9] A Guide to Epic FHIR Embedded Applications for Healthcare IT ... https://itirra.com/blog/a-guide-to-epic-fhir-embedded-applications-for-healthcare-it-leaders/
[10] Epic on FHIR: Home https://fhir.epic.com
[11] Epic On FHIR Integration, Or How To Enhance Interoperability - SPsoft https://spsoft.com/tech-insights/epic-on-fhir-integration-in-healthcare/
[12] Epic EHR Integration Guide | Technical Deep-Dive 2026 https://www.tactionsoft.com/blog/epic-ehr-integration-guide/
