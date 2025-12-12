# How to Find GitHub Actions Migration Error
**Last Updated:** December 8, 2025

## Quick Steps

1. **Go to GitHub Actions:**
   - URL: https://github.com/Medic423/medport/actions
   - Or: Repository → **Actions** tab

2. **Find the Failed Workflow:**
   - Look for workflow: **"develop - Deploy Dev Backend"**
   - Find the most recent run with a ❌ (red X) or ⚠️ (yellow warning)
   - Click on the workflow run

3. **Navigate to the Error:**
   - Click on the **"build-and-deploy"** job (left sidebar)
   - Scroll down to find **"Run Database Migrations"** step
   - Click to expand it
   - Look for **ERROR** messages (usually in red)

## What the Error Will Look Like

### Common Error Patterns:

**1. Column Already Exists:**
```
ERROR: column "isDeleted" already exists in table "ems_users"
```

**2. Migration Already Applied:**
```
Error: Migration `20251204101500_add_user_deletion_fields` failed to apply.
```

**3. Permission Denied:**
```
ERROR: permission denied for table ems_users
```

**4. Connection Issue:**
```
Error: Can't reach database server at `xxx.postgres.database.azure.com:5432`
```

**5. Migration Lock:**
```
Error: Migration lock could not be acquired
```

## Screenshot Guide

```
GitHub Repository
└── Actions Tab
    └── Workflow Runs List
        └── [❌] develop - Deploy Dev Backend (Failed)
            └── build-and-deploy job
                └── Steps:
                    ├── ✅ Checkout repository
                    ├── ✅ Setup Node.js
                    ├── ✅ Install dependencies
                    ├── ✅ Generate Prisma Models
                    ├── ❌ Run Database Migrations ← ERROR HERE
                    ├── ⏸️ Build application (skipped)
                    └── ⏸️ Deploy (skipped)
```

## Copying the Error

1. Expand the **"Run Database Migrations"** step
2. Select the error text (usually starts with `ERROR:` or `Error:`)
3. Copy it (Cmd+C / Ctrl+C)
4. Share it for troubleshooting

## Direct Link Format

If you know the run ID, you can access directly:
```
https://github.com/Medic423/medport/actions/runs/[RUN_ID]
```

The run ID is shown in the URL when you click on a workflow run.

## What to Look For

- **Error message** (starts with ERROR or Error)
- **Migration name** that failed
- **Table/column name** mentioned in error
- **Stack trace** (if available)
- **Exit code** (usually non-zero for failures)

## After Finding the Error

Once you have the error message:
1. Check the troubleshooting guide: `docs/notes/migration-troubleshooting.md`
2. Connect to Azure database via pgAdmin
3. Apply the fix based on the specific error
4. Redeploy

