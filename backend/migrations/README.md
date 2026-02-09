# Database Migration Scripts for Subscription Plans

These SQL scripts should be run in **pgAdmin 4** in the order specified below. They create the subscription plan system and add subscription tracking to user tables.

## Execution Order

Run these scripts in pgAdmin 4 in the following order:

### 1. Create Subscription Plans Table
**File:** `01-create-subscription-plans-table.sql`

Creates the `subscription_plans` table with support for different user types (HEALTHCARE, EMS, ALL).

**What it does:**
- Creates `subscription_plans` table
- Adds unique constraint on `(name, userType)` to allow separate plans per user type
- Creates indexes for filtering by `userType` and `isActive`

### 2. Seed Subscription Plans Data
**File:** `02-seed-subscription-plans.sql`

Inserts the initial subscription plans for Healthcare and EMS users.

**What it does:**
- Seeds Healthcare plans: FREE, REGULAR ($99/month), PREMIUM ($299/month)
- Seeds EMS plans: FREE, REGULAR ($79/month), PREMIUM ($199/month)
- Uses `ON CONFLICT DO NOTHING` to prevent duplicate inserts

### 3. Add Subscription Fields to User Tables
**File:** `03-add-subscription-fields-to-user-tables.sql`

Adds subscription-related columns to `center_users`, `healthcare_users`, and `ems_users` tables.

**What it does:**
- Adds `subscriptionPlanId`, `subscriptionStatus`, `trialStartDate`, `trialEndDate`, `subscriptionStartDate`, `subscriptionEndDate`, `billingCycle` columns
- Creates indexes on subscription fields for performance
- **Note:** Foreign key constraints are commented out - uncomment if you want referential integrity

### 4. Backfill Existing Accounts
**File:** `04-backfill-existing-accounts.sql`

Assigns FREE plans to all existing accounts and sets trial dates.

**What it does:**
- Assigns Healthcare FREE plan to all `healthcare_users`
- Assigns EMS FREE plan to all `ems_users`
- Assigns appropriate FREE plan to `center_users` based on their `userType`
- Sets `subscriptionStatus` to 'TRIAL' if account was created within last 7 days, otherwise 'EXPIRED'
- Backfills `trialStartDate` from `createdAt`
- Calculates `trialEndDate` as `createdAt + 7 days`

## Verification

After running all scripts, verify the changes:

```sql
-- Check subscription plans were created
SELECT "name", "displayName", "userType", "monthlyPrice", "trialDays" 
FROM "subscription_plans" 
ORDER BY "userType", "name";

-- Check user tables have subscription fields
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('center_users', 'healthcare_users', 'ems_users')
  AND column_name LIKE 'subscription%' OR column_name LIKE 'trial%'
ORDER BY table_name, column_name;

-- Check existing accounts have plans assigned
SELECT 
  'healthcare_users' as table_name,
  COUNT(*) as total,
  COUNT("subscriptionPlanId") as with_plan,
  COUNT(CASE WHEN "subscriptionStatus" = 'TRIAL' THEN 1 END) as trial_count
FROM "healthcare_users"
UNION ALL
SELECT 
  'ems_users' as table_name,
  COUNT(*) as total,
  COUNT("subscriptionPlanId") as with_plan,
  COUNT(CASE WHEN "subscriptionStatus" = 'TRIAL' THEN 1 END) as trial_count
FROM "ems_users";
```

## After Running Scripts

1. **Regenerate Prisma Client:**
   ```bash
   cd backend
   npx prisma generate
   ```

2. **Restart Backend Server:**
   The backend server needs to be restarted to pick up the new Prisma schema.

3. **Test API Endpoint:**
   ```bash
   curl http://localhost:5001/api/public/subscription-plans?userType=HEALTHCARE
   curl http://localhost:5001/api/public/subscription-plans?userType=EMS
   ```

## Troubleshooting

- **If plans already exist:** The seed script uses `ON CONFLICT DO NOTHING`, so it's safe to run multiple times.
- **If columns already exist:** The scripts use `IF NOT EXISTS` clauses, so they're idempotent.
- **Foreign key errors:** If you get foreign key constraint errors, check that the `subscription_plans` table exists and has data before running script 04.
