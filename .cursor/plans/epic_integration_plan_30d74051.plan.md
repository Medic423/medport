---
name: Epic Integration Plan
overview: A phased plan to integrate Epic EMR via FHIR for TCC Healthcare Trip Creation. Phase 1 (app registration) is complete. Next: Phase 2 sandbox connectivity.
todos:
  - id: phase2-sandbox
    content: Phase 2 - Connect to Epic Sandbox (OAuth2 + FHIR client)
    status: completed
isProject: false
---

# Epic EMR Integration Plan

This plan integrates Epic EMR for system interoperability with the TCC Healthcare Trip Creation process. The integration uses Epic on FHIR (SMART-on-FHIR) to pull transport-relevant data (Patient, Encounter, ServiceRequest, Condition, Location) and either pre-fill the manual trip form or auto-create trips from Epic transport orders.

**Strategy**: Standalone web app with Epic pre-fill first; EHR launch (embedded in Epic Hyperspace) deferred to a later phase. Multi-customer architecture from the start.

**Reference**: [docs/active/features/epic_integration.md](docs/active/features/epic_integration.md) contains app registration wording, FHIR resource mappings, and technical notes.

---

## Branch Strategy


| Phase | Branch                                 | Description               |
| ----- | -------------------------------------- | ------------------------- |
| 1     | `feature/epic-phase1-app-registration` | Epic app registration     |
| 2     | `feature/epic-phase2-sandbox`          | Sandbox connectivity      |
| 3     | `feature/epic-phase3-trip-integration` | Trip creation integration |


---

## Phase 1: Epic Application Registration — COMPLETE

**Branch**: `feature/epic-phase1-app-registration`  
**Status**: Done (February 2026). App "EMS Transport Companion" created and in Test stage.

### Phase 1 Summary

- **Client ID**: `B1R5b00c5-e513-4e6a-a009-3c88c8182cdb`
- **Redirect URI**: `https://tencomm.com/auth/epic/callback` (add `http://localhost:3000/auth/epic/callback` in Epic for local dev if needed)
- **Incoming APIs**: Condition, Encounter, Location, Observation, Patient, Relationship (Read)
- **SMART**: STU3, SMART v2
- Credentials stored per [epic_credentials_setup.md](docs/active/features/epic_credentials_setup.md)

---

## Phase 2: Epic Sandbox Connectivity — NEXT

**Branch**: `feature/epic-phase2-sandbox`  
**Goal**: Implement OAuth2/SMART-on-FHIR auth and FHIR API client; validate against Epic sandbox.

### Technical Notes

- Epic uses OAuth 2.0 Authorization Code + PKCE for standalone apps. See [Epic OAuth 2.0 Tutorial](https://fhir.epic.com/Documentation).
- **Redirect URI**: Use `https://tencomm.com/auth/epic/callback` for production; for local dev, add `http://localhost:3000/auth/epic/callback` in Epic app config and set `EPIC_REDIRECT_URI` accordingly.
- Sandbox base URL: `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/` (app uses STU3; verify R4 vs STU3 endpoints in Epic docs).
- Target FHIR resources (from app config): Patient, Encounter, Condition, Location, Observation, Relationship. Add **ServiceRequest** (Orders) in Epic if needed for transport orders.
- **Organization** read may be needed for facility resolution; verify in Epic app's Incoming APIs.

### Phase 2 TODOs

- [x] **2.1** Create branch `feature/epic-phase2-sandbox` from main
- [x] **2.2** Add backend env vars: `EPIC_CLIENT_ID`, `EPIC_CLIENT_SECRET`, `EPIC_FHIR_BASE_URL`, `EPIC_REDIRECT_URI` (use `https://tencomm.com/auth/epic/callback` or localhost for dev)
- [x] **2.3** Implement Epic OAuth2 authorize URL builder (with PKCE code_verifier/code_challenge)
- [x] **2.4** Implement token exchange endpoint (authorization code → access token)
- [x] **2.5** Implement token refresh logic (Epic issues refresh tokens; handle rolling refresh)
- [x] **2.6** Create `EpicFhirService` (or equivalent) to perform authenticated FHIR GET requests
- [x] **2.7** Implement `GET /Patient/{id}` and `GET /Patient?identifier={MRN}` (or `$match` if available in sandbox)
- [x] **2.8** Implement `GET /Encounter?patient={id}&status=active` and `GET /Encounter/{id}`
- [x] **2.9** Implement `GET /ServiceRequest?patient={id}&status=active` with `_include` for reasonReference, encounter (add ServiceRequest to Epic app if not already)
- [x] **2.10** Implement `GET /Condition?patient={id}&clinical-status=active`
- [x] **2.11** Implement `GET /Organization/{id}` and `GET /Location/{id}` for resolving references
- [x] **2.12** Add backend route(s) for Epic auth flow: `/api/epic/auth`, `/api/epic/callback`, `/api/epic/patient/{id}`, etc.
- [ ] **2.13** Test full OAuth flow against sandbox (authorize → callback → token)
- [ ] **2.14** Test FHIR reads with sandbox test patients (see Epic Sandbox Test Data docs)
- [ ] **2.15** Document sandbox test patient IDs and sample ServiceRequest/Encounter IDs for QA

---

## Phase 3: Healthcare Trip Creation Integration

**Branch**: `feature/epic-phase3-trip-integration`  
**Goal**: Pre-fill EnhancedTripForm from Epic data and support auto-creating trips from Epic transport orders.

### Technical Notes

- **Pre-fill flow**: User initiates "Import from Epic" → OAuth (if not connected) → select patient/encounter → fetch FHIR data → map to form fields → user reviews and submits.
- **Auto-create flow**: User selects Epic transport order (ServiceRequest) → system maps ServiceRequest + Encounter + Condition to `EnhancedCreateTripRequest` → create trip via existing `tripService.createEnhancedTrip()`.
- **Field mapping** (FHIR → TCC):
  - `Patient.id` / MRN → `patientId`
  - `Encounter.serviceProvider` / `location` → `fromLocation`, `toLocation` (resolve Organization/Location)
  - `Condition.code` (display) → `diagnosis`
  - `ServiceRequest.occurrence` → `scheduledTime`
  - `ServiceRequest` code → infer `transportLevel`, `urgencyLevel` (may need configurable mapping)
  - `Patient` weight/age if available → `patientWeight`, `patientAgeYears`/`patientAgeCategory`
- **Multi-customer**: Store Epic connection per `HealthcareUser` or `HealthcareLocation`; support multiple Epic instances (different `EPIC_FHIR_BASE_URL` per customer) in future. For Phase 3, single sandbox config is acceptable.

### Phase 3 TODOs

- **3.1** Create branch `feature/epic-phase3-trip-integration` from `feature/epic-phase2-sandbox`
- **3.2** Add "Import from Epic" button/entry point to [EnhancedTripForm.tsx](frontend/src/components/EnhancedTripForm.tsx) (e.g., Step 1 or header)
- **3.3** Implement Epic patient picker UI (search by MRN or list recent patients from session)
- **3.4** Implement Epic encounter/order picker (list active Encounters and ServiceRequests for selected patient)
- **3.5** Build FHIR-to-form mapping function: map Patient + Encounter + ServiceRequest + Condition(s) → `FormData` partial
- **3.6** Pre-fill form: populate `formData` with mapped values; user can edit before submit
- **3.7** Add "Create Trip from Order" action: when user selects a ServiceRequest, map to `EnhancedCreateTripRequest` and call `POST /api/trips/enhanced`
- **3.8** Handle missing/optional Epic fields (e.g., no Organization → manual `toLocation` entry)
- **3.9** Add `createdVia: 'EPIC_IMPORT'` or `'EPIC_ORDER'` to trip audit trail (extend `EnhancedCreateTripRequest` if needed)
- **3.10** Store Epic patient/encounter IDs in trip metadata for traceability (optional schema addition; confirm with DB change approval)
- **3.11** E2E test: Import from Epic → pre-fill → submit trip
- **3.12** E2E test: Create trip from Epic transport order
- **3.13** Update [helpfile01_create-request.md](frontend/src/help/healthcare/helpfile01_create-request.md) with Epic import instructions

---

## Future Phases (Out of Scope for This Plan)

- **Phase 4 – EHR Launch**: Configure app for EHR-launched SMART flow (launch from Epic Hyperspace with `patient`, `encounter` in URL). Requires Epic app config update and frontend launch parameter handling.
- **Phase 5 – Multi-Customer Production**: Per-customer Epic instance config, BAA, and hospital enablement. Each Epic customer provisions the app in their instance.

---

## FHIR Resource Reference (Quick Reference)


| TCC Field      | FHIR Resource              | FHIR Field                                        |
| -------------- | -------------------------- | ------------------------------------------------- |
| patientId      | Patient                    | id, identifier (MRN)                              |
| fromLocation   | Encounter                  | location, serviceProvider → Organization/Location |
| toLocation     | Encounter                  | location (destination), serviceProvider           |
| diagnosis      | Condition                  | code.text, code.coding.display                    |
| scheduledTime  | ServiceRequest             | occurrence                                        |
| transportLevel | ServiceRequest             | code (map to BLS/ALS/CCT)                         |
| urgencyLevel   | ServiceRequest / Encounter | reasonCode, priority                              |


---

## Security Reminders

- Never commit Epic credentials. Use `.env` and `.env.example` (with placeholders only).
- OAuth tokens should be stored server-side (session/DB) and never exposed to client.
- All Epic FHIR calls over HTTPS; validate TLS in production.

