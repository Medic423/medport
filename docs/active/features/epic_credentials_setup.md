# Epic FHIR Credentials Setup

This document describes how to securely store Epic FHIR credentials for the TCC Epic integration. **Never commit credentials to version control.**

## Where to Store Credentials

Add Epic credentials to **`backend/.env`** or **`backend/.env.local`** (`.env.local` overrides `.env` and is typically used for local/dev secrets).

Both files are listed in `.gitignore` and will not be committed.

## Required Variables

Copy these from `backend/src/.env.example` and fill in the actual values:

| Variable | Description | Example (placeholder) |
|----------|-------------|------------------------|
| `EPIC_CLIENT_ID` | Non-production Client ID from Epic app registration | `B1R5b00c5-e513-4e6a-a009-3c88c8182cdb` (EMS Transport Companion) |
| `EPIC_CLIENT_SECRET` | Sandbox Client Secret from Epic app registration | (from Epic portal; store securely) |
| `EPIC_FHIR_BASE_URL` | Epic FHIR R4 base URL | `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4` |
| `EPIC_REDIRECT_URI` | OAuth callback URL (must match Epic registration) | `https://tencomm.com/auth/epic/callback` (prod) or `http://localhost:3000/auth/epic/callback` (dev) |

## Setup Steps

1. **Copy the template** (if you don't have Epic vars yet):
   ```bash
   # Add Epic section to your existing backend/.env or backend/.env.local
   # Reference: backend/src/.env.example
   ```

2. **Add your credentials** to `backend/.env.local`:
   - `EPIC_CLIENT_ID` – from Epic Build Apps / Client Registration
   - `EPIC_CLIENT_SECRET` – from Epic (generate in portal; store securely)
   - `EPIC_FHIR_BASE_URL` – sandbox URL (see Epic docs for your app)
   - `EPIC_REDIRECT_URI` – must exactly match the redirect URI registered in Epic

3. **Verify** `.env` and `.env.local` are in `.gitignore` (they are by default).

## Security Reminders

- **Rotate the secret** if it was ever shared in chat, email, or committed to git.
- **Use a password manager** for Epic portal login credentials.
- **Production**: Use separate production credentials; never use sandbox secrets in production.
- **Per-customer**: Each Epic customer (hospital) may have separate client IDs; plan for multi-tenant config in Phase 5.

## Rotating the Sandbox Client Secret

If the sandbox client secret was exposed:

1. Log in to [fhir.epic.com](https://fhir.epic.com) → Build Apps
2. Open your app (EMS Transport Companion)
3. Generate a new Client Secret; revoke or discard the old one
4. Update `EPIC_CLIENT_SECRET` in `backend/.env.local`
