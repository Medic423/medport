# Epic App Configuration: Step-by-Step (Phase 2 Testing)

Explicit instructions for the two Epic app configuration steps required before testing Phase 2 sandbox connectivity.

**Prerequisites:** Epic developer account; EMS Transport Companion app already created (Phase 1 complete).

---

## Step 1: Add Redirect URI for Local Development

### 1.1 Log in to Epic FHIR Portal

1. Open a browser and go to **https://fhir.epic.com**
2. Click **Sign In** (or **Log in**)
3. Enter your Epic developer credentials
4. Complete any MFA if prompted

### 1.2 Navigate to Your App

1. From the fhir.epic.com homepage, go to **Developer** → **Apps** (or **Build Apps**)
   - Direct link: **https://fhir.epic.com/Developer/Apps**
2. Find and click your app: **EMS Transport Companion**
   - Non-Production Client ID (Sandbox): `80c917fc-f6fe-4b9f-91cd-89a09f1cbbcd` (use this for local/sandbox testing)

### 1.3 Locate Redirect URI / Endpoint URL

The exact label varies by Epic portal version. Look for one of:

- **Redirect URI** / **Redirect URIs**
- **Endpoint URL** (single URL)
- **Launch URL** / **Callback URL**
- A section such as **OAuth 2.0 Configuration** or **Application URLs**

Your current production Endpoint URL is: `https://tencomm.com/auth/epic/callback`

### 1.4 Add Local Development Redirect URI

- **If you can add multiple redirect URIs:** add a new row with exactly:
  ```text
  http://localhost:5001/api/epic/callback
  ```
  Keep the existing `https://tencomm.com/auth/epic/callback` (or `https://tencomm.com/api/epic/callback` if that’s what you use for prod).

- **If only one redirect URI is allowed:**  
  - For local testing, temporarily set it to:
    ```text
    http://localhost:5001/api/epic/callback
    ```
  - Remember to change it back for production.

**Important:**

- Use **`http`** for localhost (Epic usually allows this for sandbox).
- No trailing slash.
- Must match exactly what your backend uses in `EPIC_REDIRECT_URI`.
- Some Epic apps only allow one URL; if so, you must temporarily switch to the local one for testing.

### 1.5 Save

1. Click **Save** or **Update**
2. Confirm there are no validation errors

---

## Step 2: Add ServiceRequest Read (Orders) to Incoming APIs

### 2.1 Stay in the Same App

You should still be in the EMS Transport Companion app configuration.

### 2.2 Find the Incoming APIs Section

Look for:

- **Incoming APIs**
- **FHIR APIs**
- **APIs** or **Permissions**
- **Scopes** or **Requested Resources**

Current Incoming APIs (from Phase 1):

- Condition (Reason for Visit, Encounter Diagnosis, Problems)
- Encounter (Patient Chart)
- Location
- Observation
- Patient (Demographics)
- Relationship

### 2.3 Add ServiceRequest (Orders)

1. Locate an **Add API** / **Select APIs** / **+** control
2. Search or browse for:
   - **ServiceRequest**  
   or  
   - **Orders**  
   or  
   - **ServiceRequest Read (Orders)**
3. Select **Read** (or equivalent read-only scope)
4. Add it to the list of Incoming APIs
5. If the portal groups APIs by FHIR resource, ensure **ServiceRequest** is included with read permission

### 2.4 Save

1. Click **Save** or **Update**
2. Verify ServiceRequest (or Orders) appears in the Incoming APIs list

### 2.5 Confirm Application Status

- Click **Ready for Sandbox** and confirm the app status changes from **Draft** to **Ready for Sandbox** or **Test**
- **Important:** If the app stays in Draft after clicking Ready for Sandbox, OAuth will fail. See the "App Stuck in Draft" troubleshooting section below.
- Changes usually apply immediately for sandbox; some environments may require a short delay

---

## Step 3: SMART Scope Version and JWK Set URL

### 3.1 SMART Scope Version

- Set **SMART Scope Version** to **SMART v2**
- Our OAuth implementation uses SMART v2–style scopes (`patient/Patient.read`, `openid`, `fhirUser`, `offline_access`)

### 3.2 JWK Set URL (Non-Production and Production)

For apps using **client_secret** (symmetric) authentication, the **JWK Set URL** fields are typically **not used**. Epic authenticates the app via the shared Client Secret in the token request, not via a public key from a JWKS document.

- **If Epic allows leaving these fields empty:** Leave them empty for client_secret–based apps.
- **If Epic requires a value** and blocks "Ready for Sandbox" when they are empty, check Epic documentation or contact support for the correct value for a confidential client using client_secret.

Epic’s OIDC public keys endpoint (for validating Epic’s tokens) is:
```text
https://fhir.epic.com/interconnect-fhir-oauth/api/epic/2019/Security/Open/PublicKeys/530027/OIDC
```
This is for validating Epic’s JWTs, not for app registration. Do **not** use this in the JWK Set URL fields unless Epic support explicitly instructs you to.

---

## Verification Checklist

| Item | Value | Status |
|------|-------|--------|
| Redirect URI for local dev | `http://localhost:5001/api/epic/callback` | ☐ Added |
| ServiceRequest (Orders) | In Incoming APIs with Read | ☐ Added |
| SMART Scope Version | SMART v2 | ☐ Set |
| JWK Set URL | Empty (if allowed) for client_secret auth | ☐ Verified |
| App status | **Ready for Sandbox** or **Test** (not Draft) | ☐ Confirmed |
| Non-Production Client ID | `80c917fc-f6fe-4b9f-91cd-89a09f1cbbcd` | ☐ Set in .env.local |
| Backend env | `EPIC_REDIRECT_URI=http://localhost:5001/api/epic/callback` | ☐ Set |

---

## How to Look Up the Non-Production Client ID

Epic assigns **two** Client IDs per app: one for Production and one for Non-Production (sandbox). For testing against fhir.epic.com, you must use the **Non-Production Client ID**.

### Where to Find It

1. **Epic Developer Portal**
   - Log in to [https://fhir.epic.com](https://fhir.epic.com)
   - Go to **Developer** → **Apps** (or **Build Apps**)
   - Click your app (**EMS Transport Companion**)
   - On the app detail or configuration page, look for a section such as:
     - **Client IDs** / **OAuth 2.0 Client Configuration**
     - **Non-Production Client ID** (for sandbox)
     - **Production Client ID** or **Client ID** (for production)
   - The Non-Production value is the UUID used for sandbox OAuth.

2. **Epic Support**
   - If the portal layout doesn’t clearly show both IDs, or you’re unsure which is which, contact [Epic support](https://open.epic.com/Home/Contact) and ask: *“Please confirm the Non-Production Client ID for EMS Transport Companion for sandbox testing.”*

3. **Per Epic’s Email**
   - Epic support may send a table listing both IDs. Use the **Non-Production Client ID** row for sandbox; use **Client ID (Production)** only when connecting to production Epic instances.

---

## If the Portal Layout Differs

Epic’s portal layout can change. If you don’t see these sections:

1. Check for **Settings**, **Configuration**, or **Edit App**
2. Look for tabs such as **OAuth**, **APIs**, **Scopes**
3. Use the portal search for “redirect”, “ServiceRequest”, or “Orders”
4. Review the [Epic Developer Guide](https://fhir.epic.com/Documentation?docId=developerguidelines) (requires login)
5. Use [Epic’s contact/help](https://open.epic.com/Home/Contact) if you still can’t find the options

---

---

## Troubleshooting

### App Stuck in Draft – "Ready for Sandbox" Does Not Apply (Root Cause of OAuth Failure)

**If your app shows "Draft" on [My Apps](https://fhir.epic.com/Developer/Apps) and stays in Draft after clicking "Ready for Sandbox":**

OAuth will not work while the app is in Draft. Epic only allows authorization for apps that have successfully transitioned to sandbox-ready status.

**What to check:**

1. **Required configuration** – Epic may block the transition if required fields are missing. Go through all app configuration sections (e.g., Application Details, OAuth, Incoming APIs, Privacy/Security) and confirm:
   - All required fields are filled
   - No validation errors or warning banners
   - Endpoint URI / Redirect URI is set
   - At least one Incoming API is selected

2. **Terms and conditions** – Ensure you accept any terms on the configuration page before clicking "Ready for Sandbox."

3. **Browser / session** – Try a different browser or an incognito window, or log out and log back in, then try "Ready for Sandbox" again.

4. **Epic documentation** – See [App Creation & Request Process Overview](https://fhir.epic.com/Documentation) (login required) for the expected workflow.

5. **Contact Epic Support** – If it still stays in Draft:
   - [Epic on FHIR FAQs](https://fhir.epic.com/FAQ)
   - [Contact](https://open.epic.com/Home/Contact)
   - Describe: app name, that it remains "Draft" after clicking "Ready for Sandbox" with no visible errors, and that OAuth fails with "Something went wrong trying to authorize the client."

---

### "Something went wrong trying to authorize the client"

If you see this error on the Epic OAuth page (before login):

1. **Confirm app is not in Draft** – See "App Stuck in Draft" above. OAuth will fail while the app is Draft.

2. **Redirect URI must match exactly** – Check `http://localhost:5001/api/epic/auth/url` – it returns `redirectUri`. It must match what's in the Epic portal character-for-character (no trailing slash, correct port).

3. **Try without `aud` parameter** – Add `EPIC_SKIP_AUD=1` to `backend/.env.local`, restart, and try again. Some Epic configs reject requests with `aud`.

4. **Try minimal scopes** – Add `EPIC_USE_MINIMAL_SCOPES=1` to `backend/.env.local`, restart, and visit `http://localhost:5001/api/epic/auth/minimal` instead of `/api/epic/auth`.

5. **Epic propagation delay** – App config changes can take hours (or up to 24–48 hours) to propagate. If you just moved to "Ready for Sandbox," wait and retry.

6. **Client ID** – Confirm you're using the **Non-Production** (sandbox) Client ID from the Epic portal, not a production one.

---

## Next: Environment Setup

After completing both steps, configure your backend:

1. Ensure `backend/.env.local` includes:
   ```env
   EPIC_CLIENT_ID="80c917fc-f6fe-4b9f-91cd-89a09f1cbbcd"
   EPIC_CLIENT_SECRET="<your-secret>"
   EPIC_FHIR_BASE_URL="https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"
   EPIC_REDIRECT_URI="http://localhost:5001/api/epic/callback"
   ```
2. Continue to **Testing Step 2** (Environment) in `plan_for_20260225.md`.
