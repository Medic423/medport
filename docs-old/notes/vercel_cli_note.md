# Vercel CLI Deployment Note

- The Vercel CLI is available and should be used to trigger production deployments.
- Prefer CLI deploys to avoid GitHub tag push-protection issues.

Quick commands

```bash
# Install once (if needed)
npm i -g vercel

# Login (one-time)
vercel login

# Link project (one-time in repo root)
vercel link

# Deploy preview (optional)
vercel --prod=false

# Deploy production from current main state
vercel --prod
```

Monorepo tips
- Frontend: set project root to `frontend/` during `vercel link` if needed.
- API (serverless): set project root to `vercel-api/`.

Post-deploy checks
- Health: `/health`
- Feeds: `/api/tcc/agencies`, `/api/tcc/analytics/overview`, EMS analytics`
