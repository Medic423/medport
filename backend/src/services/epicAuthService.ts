/**
 * Epic OAuth2 Service - Authorization Code + PKCE
 * Handles Epic FHIR sandbox OAuth flow: authorize URL, token exchange, refresh (rolling).
 * See: docs/active/features/epic_integration.md, Epic OAuth 2.0 docs
 */

import crypto from 'crypto';
import { createHash } from 'crypto';

// Epic SMART configuration (sandbox)
const EPIC_AUTH_ENDPOINT = 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize';
const EPIC_TOKEN_ENDPOINT = 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token';

// SMART scopes for EMS Transport Companion (read-only)
const DEFAULT_SCOPES = [
  'openid',
  'fhirUser',
  'patient/Patient.read',
  'patient/Encounter.read',
  'patient/Condition.read',
  'patient/ServiceRequest.read',
  'patient/Location.read',
  'patient/Organization.read',
  'offline_access'
].join(' ');

// Minimal scopes for debugging OAuth issues (set EPIC_USE_MINIMAL_SCOPES=1)
const MINIMAL_SCOPES = 'openid fhirUser offline_access';

export interface EpicTokenSet {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
  patient?: string;
  received_at: number;
}

export interface EpicAuthState {
  state: string;
  code_verifier: string;
  createdAt: number;
}

// In-memory storage for PKCE state and tokens (Phase 2; replace with Redis/DB for production)
const pkceStore = new Map<string, EpicAuthState>();
const tokenStore = new Map<string, EpicTokenSet>();

// Cleanup old PKCE entries (older than 10 min)
const PKCE_TTL_MS = 10 * 60 * 1000;
function cleanupPkceStore() {
  const now = Date.now();
  for (const [k, v] of pkceStore.entries()) {
    if (now - v.createdAt > PKCE_TTL_MS) pkceStore.delete(k);
  }
}

/**
 * Generate a cryptographically random code_verifier (43-128 chars for S256)
 */
function generateCodeVerifier(): string {
  const bytes = crypto.randomBytes(32);
  return bytes.toString('base64url');
}

/**
 * Create S256 code_challenge from code_verifier
 */
function createCodeChallenge(verifier: string): string {
  const digest = createHash('sha256').update(verifier).digest();
  return digest.toString('base64url');
}

/**
 * Build Epic authorization URL with PKCE for standalone launch
 */
export function buildAuthorizeUrl(options?: { redirectUri?: string; state?: string }): { url: string; state: string; codeVerifier: string } {
  const clientId = process.env.EPIC_CLIENT_ID;
  const redirectUri = options?.redirectUri ?? process.env.EPIC_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('EPIC_CLIENT_ID and EPIC_REDIRECT_URI must be set');
  }

  const state = options?.state ?? crypto.randomBytes(16).toString('hex');
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = createCodeChallenge(codeVerifier);

  pkceStore.set(state, { state, code_verifier: codeVerifier, createdAt: Date.now() });
  cleanupPkceStore();

  const cleanRedirect = redirectUri.trim().replace(/[\r\n]/g, '');
  const useMinimal = process.env.EPIC_USE_MINIMAL_SCOPES === '1' || process.env.EPIC_USE_MINIMAL_SCOPES === 'true';
  const scopes = useMinimal ? MINIMAL_SCOPES : DEFAULT_SCOPES;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: cleanRedirect,
    scope: scopes,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });
  // Epic/SMART uses 'aud' for FHIR server URL. Omit if EPIC_SKIP_AUD=1 (for debugging)
  if (process.env.EPIC_SKIP_AUD !== '1') {
    const aud = (process.env.EPIC_FHIR_BASE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4').trim();
    params.set('aud', aud);
  }

  const url = `${EPIC_AUTH_ENDPOINT}?${params.toString()}`;
  return { url, state, codeVerifier };
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForTokens(
  code: string,
  state: string
): Promise<EpicTokenSet> {
  const pkce = pkceStore.get(state);
  if (!pkce) {
    throw new Error('Invalid or expired state. Please try the authorization flow again.');
  }
  pkceStore.delete(state);

  const clientId = process.env.EPIC_CLIENT_ID;
  const clientSecret = process.env.EPIC_CLIENT_SECRET;
  const redirectUri = process.env.EPIC_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Epic credentials not configured');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
    code_verifier: pkce.code_verifier
  });

  const response = await fetch(EPIC_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Epic token exchange failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope?: string;
    patient?: string;
  };

  const tokenSet: EpicTokenSet = {
    ...data,
    received_at: Date.now()
  };

  // Store tokens (keyed by patient or 'default' for app-level)
  const key = data.patient || 'default';
  tokenStore.set(key, tokenSet);

  return tokenSet;
}

/**
 * Refresh access token using refresh_token (Epic rolling refresh)
 */
export async function refreshAccessToken(patientOrKey?: string): Promise<EpicTokenSet> {
  const key = patientOrKey || 'default';
  const current = tokenStore.get(key);
  if (!current?.refresh_token) {
    throw new Error('No refresh token available. Re-authorize with Epic.');
  }

  const clientId = process.env.EPIC_CLIENT_ID;
  const clientSecret = process.env.EPIC_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Epic credentials not configured');
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: current.refresh_token,
    client_id: clientId,
    client_secret: clientSecret
  });

  const response = await fetch(EPIC_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  if (!response.ok) {
    const text = await response.text();
    tokenStore.delete(key);
    throw new Error(`Epic token refresh failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope?: string;
    patient?: string;
  };

  const tokenSet: EpicTokenSet = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? current.refresh_token, // Epic rolling refresh may return new refresh_token
    expires_in: data.expires_in,
    token_type: data.token_type,
    scope: data.scope,
    patient: data.patient ?? current.patient,
    received_at: Date.now()
  };

  tokenStore.set(key, tokenSet);
  return tokenSet;
}

/**
 * Get current access token, refreshing if expired (with 60s buffer)
 */
export async function getValidAccessToken(patientOrKey?: string): Promise<string> {
  const key = patientOrKey || 'default';
  let token = tokenStore.get(key);

  if (!token) {
    throw new Error('Not connected to Epic. Complete the OAuth flow first.');
  }

  const expiresAt = token.received_at + token.expires_in * 1000;
  const bufferMs = 60 * 1000; // Refresh 60s before expiry

  if (Date.now() >= expiresAt - bufferMs && token.refresh_token) {
    token = await refreshAccessToken(key);
  }

  return token.access_token;
}

/**
 * Check if we have valid Epic tokens stored
 */
export function hasEpicTokens(patientOrKey?: string): boolean {
  const key = patientOrKey || 'default';
  const token = tokenStore.get(key);
  if (!token) return false;
  const expiresAt = token.received_at + token.expires_in * 1000;
  return Date.now() < expiresAt - 60000; // 60s buffer
}
