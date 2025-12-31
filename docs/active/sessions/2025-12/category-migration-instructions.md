# Category Migration Instructions - December 31, 2025

## Problem
Categories are showing in local dev but missing in dev-swa and production. The route is now registered, but the `dropdown_categories` table doesn't exist or is empty in those databases.

## Solution
Run the migration script to create the table and seed categories.

## Migration Script
**File:** `backend/apply-categories-migration-production.js`

This script:
- Creates `dropdown_categories` table if it doesn't exist
- Creates unique index on `slug`
- Adds `categoryId` column to `dropdown_options` if needed
- Adds foreign key constraint
- Seeds 6 initial categories
- Links existing options to categories
- **Idempotent** - safe to run multiple times

## How to Run

### For Production Database:
```bash
cd backend
DATABASE_URL="postgresql://traccems_admin:TVmedic429!@traccems-prod-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node apply-categories-migration-production.js
```

### For Dev-SWA Database:
```bash
cd backend
DATABASE_URL="postgresql://traccems_admin:password1!@traccems-dev-pgsql.postgres.database.azure.com:5432/postgres?sslmode=require" node apply-categories-migration-production.js
```

## Expected Output
```
🔄 Applying dropdown_categories migration...

Step 1: Creating dropdown_categories table...
✅ Table created or already exists

Step 2: Creating unique index on slug...
✅ Index created or already exists

Step 3: Adding categoryId column to dropdown_options...
✅ categoryId column added (or already exists)

Step 4: Adding foreign key constraint...
✅ Foreign key constraint added (or already exists)

Step 5: Seeding initial categories...
✅ Categories seeded

Step 6: Linking existing options to categories...
✅ Linked X option(s) to categories

Step 7: Verifying migration...
📊 Categories in database:
[Table showing 6 categories]

✅ Migration complete! Found 6 categories in database.
```

## Categories That Will Be Created
1. `transport-level` - Transport Levels
2. `urgency` - Urgency Levels
3. `diagnosis` - Primary Diagnosis
4. `mobility` - Mobility Levels
5. `insurance` - Insurance Companies
6. `special-needs` - Special Needs

## After Running Migration
1. Test Category Options tab in Hospital Settings
2. Verify categories appear in the list
3. Verify can add/edit/delete categories
4. Verify categories appear in Dropdown Options tab

## Troubleshooting

### If script fails with connection error:
- Check DATABASE_URL is correct
- Verify database is accessible
- Check firewall rules if needed

### If categories still don't appear:
- Check browser console for API errors
- Verify backend route is registered (should be fixed now)
- Check Network tab for `/api/dropdown-categories` calls
- Verify authentication is working (route requires admin auth)

### If table already exists but empty:
- Script will seed categories (ON CONFLICT DO NOTHING)
- If categories exist but wrong, may need to update manually

