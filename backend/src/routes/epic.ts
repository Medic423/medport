/**
 * Epic FHIR Integration Routes
 * OAuth2 flow and FHIR resource endpoints
 * See: docs/active/features/epic_integration.md, .cursor/plans/epic_integration_plan
 */

import express from 'express';
import {
  buildAuthorizeUrl,
  exchangeCodeForTokens,
  hasEpicTokens,
  refreshAccessToken
} from '../services/epicAuthService';
import * as epicFhir from '../services/epicFhirService';

const router = express.Router();

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').trim().replace(/[\r\n]/g, '');

/**
 * GET /api/epic/auth
 * Initiates Epic OAuth flow. Redirects to Epic authorize URL.
 * Frontend can also call and use the returned URL for client-side redirect.
 */
router.get('/auth', (req, res) => {
  try {
    const { url, state } = buildAuthorizeUrl();
    console.log('[Epic] Redirecting to auth URL (state:', state.substring(0, 8) + '...)');
    res.redirect(url);
  } catch (error) {
    console.error('Epic auth init error:', error);
    const msg = error instanceof Error ? error.message : 'Epic authorization failed';
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * GET /api/epic/auth/minimal
 * Same as /auth but uses minimal scopes (openid fhirUser offline_access).
 * Use for debugging: set EPIC_USE_MINIMAL_SCOPES=1 and try this endpoint.
 */
router.get('/auth/minimal', (req, res) => {
  try {
    process.env.EPIC_USE_MINIMAL_SCOPES = '1';
    const { url } = buildAuthorizeUrl();
    delete process.env.EPIC_USE_MINIMAL_SCOPES;
    res.redirect(url);
  } catch (error) {
    console.error('Epic auth minimal error:', error);
    const msg = error instanceof Error ? error.message : 'Epic authorization failed';
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * GET /api/epic/auth/url
 * Returns the authorize URL as JSON (for debugging and frontend redirect)
 */
router.get('/auth/url', (req, res) => {
  try {
    const { url, state } = buildAuthorizeUrl();
    const redirectUri = process.env.EPIC_REDIRECT_URI || '';
    const clientId = process.env.EPIC_CLIENT_ID || '';
    res.json({
      success: true,
      authUrl: url,
      state,
      redirectUri,
      clientId,
      hint: 'For sandbox use Non-Production Client ID (80c917fc...). Verify redirectUri matches Epic app config.'
    });
  } catch (error) {
    console.error('Epic auth URL error:', error);
    const msg = error instanceof Error ? error.message : 'Epic authorization failed';
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * GET /api/epic/callback
 * Epic redirects here with ?code=...&state=...
 * Exchanges code for tokens, then redirects to frontend.
 */
router.get('/callback', async (req, res) => {
  const { code, state, error: epicError } = req.query;

  if (epicError) {
    console.error('Epic OAuth error:', epicError);
    const errorDesc = req.query.error_description as string | undefined;
    const redirectUrl = `${FRONTEND_URL}/auth/epic/callback?error=${encodeURIComponent(String(epicError))}&error_description=${encodeURIComponent(errorDesc || '')}`;
    return res.redirect(redirectUrl);
  }

  if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
    const redirectUrl = `${FRONTEND_URL}/auth/epic/callback?error=missing_params`;
    return res.redirect(redirectUrl);
  }

  try {
    const tokenSet = await exchangeCodeForTokens(code, state);
    // Redirect to frontend with success; token is stored server-side
    const patient = tokenSet.patient || '';
    const redirectUrl = `${FRONTEND_URL}/auth/epic/callback?success=1${patient ? `&patient=${patient}` : ''}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Epic callback token exchange error:', error);
    const msg = error instanceof Error ? error.message : 'Token exchange failed';
    const redirectUrl = `${FRONTEND_URL}/auth/epic/callback?error=token_exchange&error_description=${encodeURIComponent(msg)}`;
    res.redirect(redirectUrl);
  }
});

/**
 * POST /api/epic/callback
 * Alternative: frontend receives callback at its own URL, POSTs code+state here.
 * Body: { code, state }
 */
router.post('/callback', async (req, res) => {
  const { code, state } = req.body || {};

  if (!code || !state) {
    return res.status(400).json({ success: false, error: 'code and state are required' });
  }

  try {
    const tokenSet = await exchangeCodeForTokens(code, state);
    res.json({
      success: true,
      message: 'Epic connected',
      patient: tokenSet.patient
    });
  } catch (error) {
    console.error('Epic POST callback error:', error);
    const msg = error instanceof Error ? error.message : 'Token exchange failed';
    res.status(400).json({ success: false, error: msg });
  }
});

/**
 * POST /api/epic/refresh
 * Manually refresh the access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { patient } = req.body || {};
    await refreshAccessToken(patient);
    res.json({ success: true, message: 'Token refreshed' });
  } catch (error) {
    console.error('Epic refresh error:', error);
    const msg = error instanceof Error ? error.message : 'Refresh failed';
    res.status(400).json({ success: false, error: msg });
  }
});

/**
 * GET /api/epic/status
 * Check if Epic is connected (has valid tokens)
 */
router.get('/status', (req, res) => {
  const connected = hasEpicTokens();
  res.json({ success: true, connected });
});

// --- FHIR Resource Endpoints ---

/**
 * GET /api/epic/Patient/:id
 */
router.get('/Patient/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await epicFhir.getPatient(id);
    res.json(patient);
  } catch (error) {
    console.error('Epic Patient GET error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch Patient';
    res.status(error instanceof Error && msg.includes('401') ? 401 : 500).json({ success: false, error: msg });
  }
});

/**
 * GET /api/epic/Patient?identifier=...
 */
router.get('/Patient', async (req, res) => {
  try {
    const { identifier, system } = req.query;
    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ success: false, error: 'identifier query param required' });
    }
    const bundle = await epicFhir.searchPatientByIdentifier(
      identifier,
      system as string | undefined
    );
    res.json(bundle);
  } catch (error) {
    console.error('Epic Patient search error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to search Patient';
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * GET /api/epic/Encounter?patient=:id
 */
router.get('/Encounter', async (req, res) => {
  try {
    const { patient } = req.query;
    if (!patient || typeof patient !== 'string') {
      return res.status(400).json({ success: false, error: 'patient query param required' });
    }
    const bundle = await epicFhir.getActiveEncounters(patient);
    res.json(bundle);
  } catch (error) {
    console.error('Epic Encounter search error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch Encounter';
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * GET /api/epic/Encounter/:id
 */
router.get('/Encounter/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { patient } = req.query;
    const encounter = await epicFhir.getEncounter(id, patient as string | undefined);
    res.json(encounter);
  } catch (error) {
    console.error('Epic Encounter GET error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch Encounter';
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * GET /api/epic/ServiceRequest?patient=:id
 */
router.get('/ServiceRequest', async (req, res) => {
  try {
    const { patient } = req.query;
    if (!patient || typeof patient !== 'string') {
      return res.status(400).json({ success: false, error: 'patient query param required' });
    }
    const bundle = await epicFhir.getActiveServiceRequests(patient);
    res.json(bundle);
  } catch (error) {
    console.error('Epic ServiceRequest error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch ServiceRequest';
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * GET /api/epic/Condition?patient=:id
 */
router.get('/Condition', async (req, res) => {
  try {
    const { patient } = req.query;
    if (!patient || typeof patient !== 'string') {
      return res.status(400).json({ success: false, error: 'patient query param required' });
    }
    const bundle = await epicFhir.getActiveConditions(patient);
    res.json(bundle);
  } catch (error) {
    console.error('Epic Condition error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch Condition';
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * GET /api/epic/Organization/:id
 */
router.get('/Organization/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { patient } = req.query;
    const org = await epicFhir.getOrganization(id, patient as string | undefined);
    res.json(org);
  } catch (error) {
    console.error('Epic Organization error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch Organization';
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * GET /api/epic/Location/:id
 */
router.get('/Location/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { patient } = req.query;
    const location = await epicFhir.getLocation(id, patient as string | undefined);
    res.json(location);
  } catch (error) {
    console.error('Epic Location error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch Location';
    res.status(500).json({ success: false, error: msg });
  }
});

export default router;
