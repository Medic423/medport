# DATABASE_URL Secret Value
**Last Updated:** December 8, 2025

## Connection String

```
postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres
```

## Recommended Format (with SSL)

Azure PostgreSQL typically requires SSL connections. Use this format:

```
postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require
```

## Adding to GitHub Secrets

1. **Go to:** https://github.com/Medic423/medport/settings/secrets/actions

2. **Click:** "New repository secret" (or update existing `DATABASE_URL`)

3. **Name:** `DATABASE_URL`

4. **Value:** Use the connection string above (with `?sslmode=require` recommended)

5. **Click:** "Add secret"

## Connection String Breakdown

- **Protocol:** `postgresql://`
- **Username:** `traccems_admin`
- **Password:** `password1!`
- **Host:** `traccems-dev-pgsql.postgres.database.azure.com`
- **Port:** `5432`
- **Database:** `postgres`
- **SSL:** `?sslmode=require` (recommended for Azure)

## Testing Connection

After adding the secret, the workflow should:
1. ✅ Read `DATABASE_URL` from secrets
2. ✅ Connect to Azure PostgreSQL
3. ✅ Run Prisma migrations
4. ✅ Deploy backend successfully

## Security Notes

⚠️ **Important:**
- This secret contains sensitive credentials
- Never commit this to git
- Keep it secure in GitHub Secrets only
- Rotate password if compromised

## Troubleshooting

If connection still fails:
1. Check Azure firewall rules (allow GitHub Actions IPs)
2. Verify username/password are correct
3. Ensure database exists: `postgres`
4. Check Azure service status
5. Try with `?sslmode=require` if not already included

