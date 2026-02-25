/**
 * Epic FHIR Service - Authenticated FHIR GET requests
 * Uses Epic OAuth tokens to fetch Patient, Encounter, Condition, ServiceRequest, Location, Organization
 * See: docs/active/features/epic_integration.md
 */

import { getValidAccessToken } from './epicAuthService';

const FHIR_BASE = process.env.EPIC_FHIR_BASE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4';

export interface FhirBundle<T = unknown> {
  resourceType: 'Bundle';
  type: string;
  total?: number;
  entry?: Array<{ resource: T }>;
}

export interface FhirResource {
  resourceType: string;
  id?: string;
}

/**
 * Perform authenticated FHIR GET request
 */
async function fhirGet<T>(path: string, patientId?: string): Promise<T> {
  const accessToken = await getValidAccessToken(patientId);

  const url = path.startsWith('http') ? path : `${FHIR_BASE}/${path.replace(/^\//, '')}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/fhir+json',
      'Accept-Charset': 'utf-8'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Epic FHIR request failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<T>;
}

/**
 * GET /Patient/{id}
 */
export async function getPatient(patientId: string): Promise<FhirResource> {
  return fhirGet<FhirResource>(`Patient/${patientId}`);
}

/**
 * GET /Patient?identifier={system}|{value}
 * For MRN lookup; system often urn:oid:...
 */
export async function searchPatientByIdentifier(identifier: string, system?: string): Promise<FhirBundle> {
  const param = system ? `identifier=${encodeURIComponent(system + '|' + identifier)}` : `identifier=${encodeURIComponent(identifier)}`;
  return fhirGet<FhirBundle>(`Patient?${param}`);
}

/**
 * GET /Encounter?patient={id}&status=active
 */
export async function getActiveEncounters(patientId: string): Promise<FhirBundle> {
  return fhirGet<FhirBundle>(`Encounter?patient=${patientId}&status=active`);
}

/**
 * GET /Encounter/{id}
 */
export async function getEncounter(encounterId: string, patientId?: string): Promise<FhirResource> {
  return fhirGet<FhirResource>(`Encounter/${encounterId}`, patientId);
}

/**
 * GET /ServiceRequest?patient={id}&status=active
 * With _include for reasonReference and encounter if supported
 */
export async function getActiveServiceRequests(patientId: string): Promise<FhirBundle> {
  const params = new URLSearchParams({
    patient: patientId,
    status: 'active'
  });
  // Some Epic instances support _include
  const url = `ServiceRequest?${params.toString()}`;
  return fhirGet<FhirBundle>(url);
}

/**
 * GET /Condition?patient={id}&clinical-status=active
 */
export async function getActiveConditions(patientId: string): Promise<FhirBundle> {
  return fhirGet<FhirBundle>(`Condition?patient=${patientId}&clinical-status=active`);
}

/**
 * GET /Organization/{id}
 */
export async function getOrganization(orgId: string, patientId?: string): Promise<FhirResource> {
  // Strip "Organization/" prefix if present
  const id = orgId.replace(/^Organization\//, '');
  return fhirGet<FhirResource>(`Organization/${id}`, patientId);
}

/**
 * GET /Location/{id}
 */
export async function getLocation(locationId: string, patientId?: string): Promise<FhirResource> {
  const id = locationId.replace(/^Location\//, '');
  return fhirGet<FhirResource>(`Location/${id}`, patientId);
}
