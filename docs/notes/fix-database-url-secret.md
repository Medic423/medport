# Fix DATABASE_URL GitHub Secret
**Last Updated:** December 8, 2025

## Problem

GitHub Actions workflow is failing with:
```
Error: You must provide a nonempty URL. The environment variable `DATABASE_URL` resolved to an empty string.
```

## Root Cause

The `DATABASE_URL` secret is either:
- Not set in GitHub repository secrets
- Empty/blank
- Not accessible to the workflow

## Solution: Add DATABASE_URL Secret to GitHub

### Step 1: Get Your Azure Database Connection String

**From Azure Portal:**
1. Go to Azure Portal → Your PostgreSQL server resource
2. Navigate to **Settings** → **Connection strings**
3. Copy the **PostgreSQL** connection string
4. Format: `postgresql://username@servername:password@servername.postgres.database.azure.com:5432/dbname?sslmode=require`

**Or from your local `.env.local`:**
```bash
# Check your local DATABASE_URL
cd backend
cat .env.local | grep DATABASE_URL
```

**Note:** You'll need to update the connection string for Azure (different host, may need different credentials).

### Step 2: Add Secret to GitHub Repository

1. **Go to GitHub Repository Settings:**
   - Navigate to: https://github.com/Medic423/medport/settings/secrets/actions
   - Or: Repository → **Settings** → **Secrets and variables** → **Actions**

2. **Add New Secret:**
   - Click **"New repository secret"**
   - **Name:** `DATABASE_URL`
   - **Secret:** Paste your Azure PostgreSQL connection string
   - Click **"Add secret"**

### Step 3: Verify Secret Format

The connection string should look like:
```
postgresql://username@servername:password@servername.postgres.database.azure.com:5432/database_name?sslmode=require
```

**Important:**
- Use Azure database credentials (not local)
- Include `?sslmode=require` (Azure requires SSL)
- Username format: `username@servername` (Azure format)

### Step 4: Re-run Workflow

After adding the secret:
1. Go to: https://github.com/Medic423/medport/actions
2. Find the failed workflow run
3. Click **"Re-run all jobs"** or **"Re-run failed jobs"**
4. The workflow should now have access to `DATABASE_URL`

## Alternative: Check Existing Secret

If `DATABASE_URL` already exists:

1. **Check if it's set:**
   - Go to: https://github.com/Medic423/medport/settings/secrets/actions
   - Look for `DATABASE_URL` in the list

2. **Update if needed:**
   - Click on `DATABASE_URL`
   - Click **"Update"**
   - Verify the value is correct (not empty)
   - Save

## Getting Azure Connection String

### From Azure Portal:
1. Azure Portal → **PostgreSQL servers** → Your server
2. **Settings** → **Connection strings**
3. Select **PostgreSQL** tab
4. Copy the connection string
5. Replace placeholders:
   - `{your_username}` → Your actual username
   - `{your_password}` → Your actual password
   - `{your_database}` → Your database name

### Example Format:
```
postgresql://admin@tracc-ems-db:YourPassword123@tracc-ems-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

## Verification

After adding the secret, the workflow should:
1. ✅ Successfully read `DATABASE_URL` from secrets
2. ✅ Connect to Azure PostgreSQL database
3. ✅ Run migrations successfully
4. ✅ Deploy backend

## Troubleshooting

### Secret Still Not Working?

1. **Check secret name:** Must be exactly `DATABASE_URL` (case-sensitive)
2. **Check workflow syntax:** Should be `${{ secrets.DATABASE_URL }}`
3. **Check permissions:** Secret should be accessible to Actions
4. **Check connection string format:** Must be valid PostgreSQL URL

### Test Connection String Locally

Before adding to GitHub, test the connection string:
```bash
# Test connection
psql "postgresql://username@servername:password@server.postgres.database.azure.com:5432/dbname?sslmode=require" -c "SELECT 1;"
```

If this works, the connection string is correct.

## Security Notes

⚠️ **Important:**
- Never commit `DATABASE_URL` to git
- Always use GitHub Secrets for sensitive data
- Rotate passwords regularly
- Use different credentials for dev/prod if possible

## Next Steps

1. ✅ Add `DATABASE_URL` secret to GitHub
2. ✅ Verify secret is not empty
3. ✅ Re-run failed workflow
4. ✅ Verify migrations succeed
5. ✅ Verify backend deploys successfully

