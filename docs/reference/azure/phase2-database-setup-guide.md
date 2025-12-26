# Phase 2: Database Setup - Implementation Guide
**Created:** December 26, 2025  
**Status:** Ready to Begin  
**Goal:** Initialize production database schema and verify setup

## Overview

Phase 2 involves setting up the production database schema by running Prisma migrations. The production database is currently empty and needs all migrations applied.

**Migrations Count:** 30 migrations found in `backend/prisma/migrations/`

---

## Prerequisites

- ✅ Phase 1 Complete: All Azure resources created
- ✅ Database created: `traccems-prod-pgsql`
- ✅ Connection string configured: `postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require`
- ✅ Firewall configured: "Allow Azure services" enabled
- ✅ DATABASE_URL set in App Service (for future deployments)

---

## Task 2.1: Initialize Production Database Schema

### Option A: Run Migrations via Azure CLI (Recommended for Initial Setup)

This method runs migrations directly from your local machine using Azure CLI authentication.

#### Step 1: Set Production DATABASE_URL Locally

```bash
# Set environment variable for this session
export DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require"

# Verify it's set
echo $DATABASE_URL
```

#### Step 2: Navigate to Backend Directory

```bash
cd backend
```

#### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client (v5.x.x) to ./node_modules/@prisma/client
```

#### Step 4: Run Migrations

```bash
npx prisma migrate deploy
```

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✅ 30 migrations found in prisma/migrations
✅ Applied 30 migrations to database
✅ Database schema is now up to date
```

**What This Does:**
- Applies all 30 migrations to the production database
- Creates all tables, indexes, and constraints
- Creates `_prisma_migrations` table to track migration history
- Does NOT modify existing data (database is empty, so this is safe)

#### Step 5: Verify Migrations Applied

```bash
# Connect to database and check migration count
npx prisma db execute --stdin <<< "SELECT COUNT(*) as migration_count FROM _prisma_migrations;"
```

**Expected:** Should return 30 (or the number of migrations applied)

### Option B: Run Migrations via GitHub Actions (Alternative)

This method uses the production workflow we'll create in Phase 3. Migrations will run automatically as part of deployment.

**Note:** This option requires Phase 3 workflows to be set up first.

---

## Task 2.2: Verify Database Schema

### Step 1: Check Migration Table

```bash
cd backend
npx prisma db execute --stdin <<< "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 10;"
```

**Expected:** Should show the last 10 migrations with timestamps

### Step 2: Verify Key Tables Exist

```bash
npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
```

**Expected:** Should show all tables including:
- `_prisma_migrations`
- `User`
- `Hospital`
- `EMSAgency`
- `Trip`
- `Unit`
- And all other application tables

### Step 3: Check Table Count

```bash
npx prisma db execute --stdin <<< "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
```

**Expected:** Should return the number of tables created (typically 20+ tables)

---

## Task 2.3: Seed Production Database (Optional)

### Decision: Seed Data Strategy

**Option 1: Start Empty (Recommended)**
- Production database starts completely empty
- Users create accounts through registration
- No test data in production
- **Recommended for production**

**Option 2: Seed Initial Admin User**
- Create one admin user for initial access
- Useful if you need to access admin features immediately
- Can be done manually via SQL or Prisma Studio

**Option 3: Seed Test Data (Not Recommended)**
- Only if you need sample data for testing
- Should be removed before going live

### If Seeding Admin User (Optional)

**Via SQL:**
```sql
-- Connect to production database
-- Insert admin user (adjust fields as needed)
INSERT INTO "User" (email, password_hash, role, "createdAt", "updatedAt")
VALUES ('admin@traccems.com', '[hashed_password]', 'ADMIN', NOW(), NOW());
```

**Via Prisma Studio (Local):**
```bash
cd backend
DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" npx prisma studio
```

---

## Verification Checklist

After completing Phase 2:

- [x] All migrations applied successfully ✅ **COMPLETED** - All 30 migrations applied on December 26, 2025
- [x] `_prisma_migrations` table exists with 30 migrations ✅
- [x] Key tables created (User, Hospital, EMSAgency, Trip, Unit, etc.) ✅
- [x] Database schema matches dev database structure ✅
- [x] No migration errors ✅ (Fixed 4 migration dependency issues)
- [ ] Seed data decision made (if applicable) - **Decision: Start with empty database (recommended)**

---

## Troubleshooting

### Issue: Migration Fails with "Database schema is not empty"

**Cause:** Prisma detects existing tables but no migration history.

**Solution:** This shouldn't happen with a fresh database, but if it does:
```bash
# Baseline the database (mark all migrations as applied)
npx prisma migrate resolve --applied [migration_name]
# Repeat for each migration, or use SQL script
```

### Issue: Connection Timeout

**Cause:** Firewall blocking connection or network issues.

**Solution:**
1. Verify firewall: "Allow Azure services" enabled
2. Add your current IP to firewall rules
3. Check database server status in Azure Portal

### Issue: Authentication Failed

**Cause:** Incorrect username/password in connection string.

**Solution:**
1. Verify username: `traccems_admin`
2. Verify password is correct (no spaces)
3. Check connection string format

---

## Next Steps

After Phase 2 is complete:
1. ✅ Database schema initialized
2. ✅ All migrations applied
3. ✅ Ready for Phase 3: GitHub Actions Workflows
4. ✅ Ready for code deployment

---

## Important Notes

⚠️ **Database Protection:** Per project rules, migrations should only be run with explicit approval. This guide provides instructions but requires your approval before execution.

⚠️ **Backup:** Before running migrations, ensure you have a backup strategy in place (Azure automated backups are enabled).

✅ **Safety:** Since the production database is empty, running migrations is safe and will only create tables.

---

**Last Updated:** December 26, 2025  
**Status:** ✅ **COMPLETED** - All migrations successfully applied

## Migration Fixes Applied

During migration, several dependency issues were identified and fixed:

1. **`20251008113055_add_multi_location_healthcare`**: Added conditional creation of `healthcare_users` and `transport_requests` tables if they don't exist (they were dropped in earlier migrations).

2. **`20251102140000_add_healthcare_agency_preferences`**: Fixed PostgreSQL syntax error - replaced `IF NOT EXISTS` with `ADD CONSTRAINT` (not supported) with DO block checking `pg_constraint`.

3. **`20251204101500_add_user_deletion_fields`**: Made `ems_users` table alterations conditional (table may not exist in production schema).

4. **`20251209140000_add_dropdown_categories`**: Made `dropdown_options` table alterations conditional and added `ON CONFLICT` handling for seed data.

All fixes use PostgreSQL DO blocks to check for table/column/constraint existence before applying changes, making migrations idempotent and safe for production use.

