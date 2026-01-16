# pgAdmin Database Assessment Guide - Production
**Date:** January 7, 2026  
**Status:** ✅ **CONNECTED** - Ready for assessment

---

## Current Status

✅ **pgAdmin Connected** - Production database accessible  
✅ **Password Verified** - `TVmedic429!` confirmed working

---

## Database Assessment Steps

### Step 1: List All Tables

**Run this query in pgAdmin Query Tool:**

```sql
SELECT 
    table_name,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_schema = 'public' 
     AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**This will show:**
- All tables in the production database
- Number of columns in each table

**Save the results** - This is your baseline inventory.

---

### Step 2: Compare with schema.prisma

**Get list of expected tables from schema.prisma:**

1. Open: `backend/prisma/schema.prisma`
2. Find all `model` declarations (these are your tables)
3. List them out

**Compare:**
- Which tables exist in production?
- Which tables are missing?
- Which tables have different column counts?

---

### Step 3: Check Critical Tables

**Check if these critical tables exist:**

```sql
-- Check critical EMS tables
SELECT EXISTS (SELECT FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'ems_users') as ems_users_exists,
       EXISTS (SELECT FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'ems_agencies') as ems_agencies_exists,
       EXISTS (SELECT FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'agency_responses') as agency_responses_exists,
       EXISTS (SELECT FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'transport_requests') as transport_requests_exists;

-- Check critical Healthcare tables
SELECT EXISTS (SELECT FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'healthcare_users') as healthcare_users_exists,
       EXISTS (SELECT FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'healthcare_locations') as healthcare_locations_exists;

-- Check critical Center tables
SELECT EXISTS (SELECT FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'center_users') as center_users_exists,
       EXISTS (SELECT FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'hospitals') as hospitals_exists;
```

---

### Step 4: Check Table Columns

**For each table that exists, check its columns:**

```sql
-- Example: Check columns in ems_users table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'ems_users'
ORDER BY ordinal_position;
```

**Repeat for each critical table** to see what columns exist vs. what's expected.

---

### Step 5: Check for Data

**Check if tables have data:**

```sql
-- Count rows in critical tables
SELECT 
    'ems_users' as table_name, 
    COUNT(*) as row_count 
FROM ems_users
UNION ALL
SELECT 'ems_agencies', COUNT(*) FROM ems_agencies
UNION ALL
SELECT 'agency_responses', COUNT(*) FROM agency_responses
UNION ALL
SELECT 'transport_requests', COUNT(*) FROM transport_requests
UNION ALL
SELECT 'healthcare_users', COUNT(*) FROM healthcare_users
UNION ALL
SELECT 'center_users', COUNT(*) FROM center_users;
```

---

## Assessment Checklist

### Tables to Check

**EMS Module:**
- [ ] `ems_users` - EMS user accounts
- [ ] `ems_agencies` - EMS agencies
- [ ] `agency_responses` - Agency responses (we know this exists)
- [ ] `transport_requests` - Transport requests (we know this exists)

**Healthcare Module:**
- [ ] `healthcare_users` - Healthcare user accounts
- [ ] `healthcare_locations` - Healthcare locations
- [ ] `healthcare_agency_preferences` - Agency preferences
- [ ] `healthcare_destinations` - Destinations

**Center/Admin Module:**
- [ ] `center_users` - Center users (we know this exists)
- [ ] `hospitals` - Hospitals
- [ ] `facilities` - Facilities
- [ ] `agencies` - Agencies

**Supporting Tables:**
- [ ] `dropdown_categories` - Dropdown categories
- [ ] `dropdown_options` - Dropdown options
- [ ] `pickup_locations` - Pickup locations
- [ ] `trips` - Trips (we know this exists)
- [ ] `units` - Units
- [ ] `system_analytics` - Analytics

---

## What to Document

**Create a document with:**

1. **Tables that exist:**
   - Table name
   - Column count
   - Row count (if has data)
   - Key columns present

2. **Tables that are missing:**
   - Table name
   - Why it's needed
   - Priority (Critical/Important/Nice-to-have)

3. **Tables with missing columns:**
   - Table name
   - Missing columns
   - Impact if missing

4. **Priority ranking:**
   - What blocks EMS functionality?
   - What blocks Healthcare functionality?
   - What can wait?

---

## Next Steps After Assessment

1. ✅ **Complete assessment** - Document all findings
2. ⏭️ **Prioritize fixes** - What's blocking functionality?
3. ⏭️ **Fix incrementally** - One table/column at a time
4. ⏭️ **Test after each fix** - Verify functionality works

---

## Quick Reference Queries

**List all tables:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Check if table exists:**
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'table_name_here'
);
```

**List columns in table:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'table_name_here'
ORDER BY ordinal_position;
```

**Count rows:**
```sql
SELECT COUNT(*) FROM table_name_here;
```

---

**Last Updated:** January 7, 2026  
**Status:** ✅ Connected, ready for assessment

