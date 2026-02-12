# EMS Provider Fixes in Healthcare Module

**Date Created:** February 12, 2026  
**Status:** In Progress  
**Branch:** `fix/facilities-dispatch-bugs`

---

## Overview

This document tracks fixes for the Add Provider flow in the Healthcare module's EMS Providers tab. The goal is to allow healthcare facilities to add **existing registered EMS agencies** (from the TCC Admin list) to their provider list, rather than only creating new agencies from scratch.

---

## Problem Statement

When a healthcare user (e.g., Mount Nittany Medical Center) goes to **EMS Providers** → **+Add Provider**, the modal opens only the full EMS account creation form. There is no way to:

- Search for agencies already registered in the system (e.g., Pleasant Gap EMS)
- Add an existing registered agency to their preferred list
- Fall back to account creation only when the agency is not found

**Current behavior:** +Add Provider → Full creation form (name, contact, address, etc.) → Creates duplicate `ems_agency` record.

**Desired behavior:** +Add Provider → Search registered agencies → If found, add to list; if not found, offer "Add new provider" with creation form.

---

## Design Decisions (Confirmed)

| # | Question | Decision |
|---|----------|----------|
| 1 | Search type | Partial search (e.g., "Pleasant" → "Pleasant Gap EMS") |
| 2 | Search scope | Name primary; city/state for disambiguation if needed |
| 3 | Already-added agencies | Show in search results with "Already added" badge (don't hide) |
| 4 | Preferred vs regular when adding | Add as regular by default; user can toggle in list |
| 5 | TCC Admin list definition | Registered agencies = `addedBy = null` AND `isActive = true` |

---

## Data Model (Technical Context)

### EMS Agencies

- **Registered agencies** (EMS self-registered): `ems_agencies` with `addedBy = null`
- **Healthcare-added agencies** (manual create): `ems_agencies` with `addedBy = healthcareUserId`

### HealthcareAgencyPreference

- Links `healthcareUserId` ↔ `agencyId` (any `ems_agency`)
- Stores `isPreferred` (boolean)
- Enables a healthcare user to have a preference for any agency – registered or manually created

### Current Gaps

- `getAgenciesForHealthcareUser` filters by `addedBy: healthcareUserId` only – excludes registered agencies linked via preference
- No API to search registered agencies
- No API to "add existing" agency (create preference only)

---

## Implementation Plan

### Phase 1: Backend – Search Registered Agencies

**New endpoint:** `GET /api/healthcare/agencies/registered/search?q=...`

- Search `ems_agencies` where `addedBy = null` AND `isActive = true`
- Match on `name` (contains, case-insensitive); optionally city/state for disambiguation
- Return: id, name, city, state, contact info
- Mark agencies already in user's list (via `HealthcareAgencyPreference`) as "alreadyAdded"

**File:** `backend/src/services/healthcareAgencyService.ts`  
**New method:** `searchRegisteredAgenciesForHealthcareUser(healthcareUserId, query)`

**Route:** `backend/src/routes/healthcareAgencies.ts`  
**Position:** Place before `/:id` route to avoid conflicts

---

### Phase 2: Backend – Add Existing Agency

**New endpoint:** `POST /api/healthcare/agencies/add-existing`  
**Body:** `{ agencyId: string, isPreferred?: boolean }`

- Verify agency exists, is active, and is `addedBy = null` (registered)
- Create `HealthcareAgencyPreference` with `healthcareUserId`, `agencyId`, `isPreferred: false`
- Return the agency with preference
- Handle duplicate: if preference already exists, return success (idempotent)

**File:** `backend/src/services/healthcareAgencyService.ts`  
**New method:** `addExistingAgencyToHealthcareUser(healthcareUserId, agencyId, isPreferred?)`

> **Route note:** Use `POST /add-existing` (literal path) to avoid conflict with `/:id` – do not use `/:agencyId/add` since `add` would be captured as ID.

---

### Phase 3: Backend – list includes preference-linked agencies

**Update:** `getAgenciesForHealthcareUser`

- Include agencies where either:
  - `addedBy = healthcareUserId`, OR
  - `HealthcareAgencyPreference` exists for this `healthcareUserId` and this `agencyId`
- Ensure `isPreferred` comes from preference record
- Maintain existing filters (search, status, etc.)

---

### Phase 4: Frontend – API Methods

**File:** `frontend/src/services/api.ts`

- Add `searchRegistered(query: string)` → `GET /api/healthcare/agencies/registered/search?q=...`
- Add `addExisting(agencyId: string, isPreferred?: boolean)` → `POST /api/healthcare/agencies/add-existing` with body `{ agencyId, isPreferred }`

---

### Phase 5: Frontend – Add Provider Modal Redesign

**File:** `frontend/src/components/HealthcareEMSAgencies.tsx`

**New flow:**

1. **Step 1 – Search**
   - Search input (debounced ~300–400ms)
   - Call `searchRegistered` on input
   - Display results: name, city, state, contact
   - "Add" button per result (disabled if already added)
   - "Already added" badge for agencies already in list
   - "Can't find your agency? Add new provider" link → opens creation form

2. **Step 2 – Create new (fallback)**
   - Existing full creation form (unchanged)
   - For agencies not in the system

**UX notes:**
- Debounce search
- Empty state: "No agencies found. Add a new provider."
- Prevent duplicate adds

---

## Implementation Order

1. [x] Backend: `searchRegisteredAgenciesForHealthcareUser` + route
2. [x] Backend: `addExistingAgencyToHealthcareUser` + route
3. [x] Backend: Update `getAgenciesForHealthcareUser` to include preference-linked agencies
4. [x] Frontend: API methods in `api.ts`
5. [x] Frontend: Add Provider modal with search-first flow

---

## Technical Notes for Agents

### Key Files

| Purpose | Path |
|--------|------|
| Add Provider UI | `frontend/src/components/HealthcareEMSAgencies.tsx` |
| Healthcare agencies API | `frontend/src/services/api.ts` – `healthcareAgenciesAPI` |
| Backend routes | `backend/src/routes/healthcareAgencies.ts` |
| Backend service | `backend/src/services/healthcareAgencyService.ts` |

### Route Order

`healthcareAgencies.ts` route order matters. New routes must be placed **before** `/:id` to avoid `registered` or `search` being captured as an ID:
- `/available`
- `/` (GET, POST)
- `/trip-agencies`
- `/search/:query`
- **`/registered/search`** (new)
- **`POST /add-existing`** (new – body: `{ agencyId, isPreferred? }`)
- `/:id` (GET, PUT, PATCH, DELETE)

### Distinguishing Agency Types

- `addedBy = null` → Registered agency (in TCC Admin list)
- `addedBy = healthcareUserId` → Manually created by healthcare user
- `HealthcareAgencyPreference` → Links healthcare user to any agency (both types)

### Related Features

- **Dispatch flow:** Uses `healthcareTripDispatchService.getTripAgencies()` which considers both user agencies and geographic/availability. Adding registered agencies via preference should automatically include them in dispatch.
- **Available agencies:** `getAvailableAgenciesForHealthcareUser` already includes both `addedBy: null` and `addedBy: healthcareUserId` – verify it also includes agencies linked only via preference.

---

## Progress Log

| Date | Update |
|------|--------|
| 2026-02-12 | Document created. Design decisions confirmed. Plan finalized. |
| 2026-02-12 | **Implementation complete.** Phases 1–5 implemented. Backend: searchRegistered, add-existing, getAgenciesForHealthcareUser now includes preference-linked agencies; delete handles both owned and preference-only; togglePreferred works for both. Frontend: Add Provider modal shows search first, then "Add new provider" fallback. Edit button hidden for registered agencies (addedBy !== user.id). **UI testing recommended.** |
