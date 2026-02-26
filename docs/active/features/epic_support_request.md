# Epic Support Request – Copy-Paste Ready

Use the content below when contacting Epic support (e.g., [fhir.epic.com FAQ/Contact](https://fhir.epic.com/FAQ) or [open.epic.com Contact](https://open.epic.com/Home/Contact)).

---

```
Subject: App "EMS Transport Companion" Stuck in Draft – Ready for Sandbox Does Not Apply

Hello,

I am developing the app "EMS Transport Companion" (Non-Production Client ID: B1R5b00c5-e513-4e6a-a009-3c88c8182cdb) on fhir.epic.com and need help with the following issues.

ISSUE 1: App Remains in Draft After Clicking "Ready for Sandbox"
When I make configuration changes, accept the terms, and click the "Ready for Sandbox" button, the app saves without showing any errors and returns me to the Build Apps screen. However, the app status remains "Draft" instead of changing to "Ready for Sandbox" or "Test."

This prevents OAuth authorization from working. When I attempt the OAuth 2.0 flow (visit the authorize URL), Epic’s OAuth page returns: "Something went wrong trying to authorize the client. Please try logging in again."

Could you please advise:
- What is preventing the app from transitioning from Draft to Ready for Sandbox?
- Are there any required fields or validation checks that might be failing silently?
- Is there a specific configuration section (e.g., JWK Set URL, SMART Scope Version, or another setting) that must be completed before Ready for Sandbox will apply?

ISSUE 2: JWK Set URL Fields (Optional – If Relevant)
The app configuration includes "Non-Production JWK Set URL" and "Production JWK Set URL" fields. Our app uses client_secret (symmetric) authentication, not asymmetric (e.g., private_key_jwt). Are these fields required for Ready for Sandbox when using client_secret? If they must be populated, what value should we use for a confidential client that authenticates with client_secret?

APP CONFIGURATION SUMMARY:
- Application Name: EMS Transport Companion
- Non-Production Client ID: 878e5c65-cb93-4eb7-a284-656189c4e2ef
- Confidential Client: Yes (using client_secret)
- SMART Scope Version: SMART v2
- Endpoint URIs: 
  - https://traccems.com/auth/epic/callback (production)
  - http://localhost:5001/api/epic/callback (local development)
- Incoming APIs: Patient, Encounter, Condition, ServiceRequest, Location, Organization, Observation, Relationship
- OAuth flow: Authorization Code + PKCE (S256)
- Auth endpoint used: https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize

STEPS ALREADY TRIED:
- Switched SMART Scope Version from v1 to v2 (no change)
- Verified redirect URIs match exactly (no trailing slash, correct port)
- Tried with and without the "aud" parameter in the authorization request
- Tried minimal scopes (openid fhirUser offline_access) – same error
- Reviewed all configuration sections for missing required fields – none apparent

Thank you for your assistance.
```

---

## How to Use

1. Copy everything between the ``` marks (including the Subject line and body).
2. Paste into Epic’s contact form or support email.
3. Adjust contact name or additional context if needed.
