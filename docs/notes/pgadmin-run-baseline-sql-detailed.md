# Detailed Instructions: Run Prisma Baseline SQL in pgAdmin 4
**Last Updated:** December 8, 2025

## Prerequisites
✅ You're connected to Azure database in pgAdmin 4
✅ You can see the server and database in the left panel

## Step-by-Step Instructions

### Step 1: Navigate to the Database

In the **left panel (Object Browser)**:
1. Expand **Servers** (if not already expanded)
2. Expand **Azure TCC Database** (or whatever you named your server)
3. Expand **Databases**
4. Expand **postgres** (this is your database)
5. You should now see folders like: **Schemas**, **Tables**, etc.

### Step 2: Open Query Tool

**Method 1 (Recommended):**
1. **Right-click** on **postgres** database (in the left panel)
2. From the context menu, select **Query Tool**
3. A new tab/window will open with the Query Tool

**Method 2:**
1. Click on **postgres** database to select it
2. Click the **Query Tool** icon in the toolbar (looks like a play button or SQL icon)
3. Or go to **Tools** → **Query Tool**

### Step 3: Open the SQL File

**Option A: Copy/Paste SQL (Easiest)**
1. Open the file `backend/baseline-migrations-complete.sql` in your code editor
2. **Select All** (Cmd+A / Ctrl+A)
3. **Copy** (Cmd+C / Ctrl+C)
4. In pgAdmin Query Tool, **Paste** (Cmd+V / Ctrl+V)
5. The SQL should now appear in the query editor

**Option B: Open File in pgAdmin**
1. In the Query Tool window, go to **File** → **Open**
2. Navigate to: `/Users/scooper/Code/tcc-new-project/backend/`
3. Select `baseline-migrations-complete.sql`
4. Click **Open**
5. The SQL will load into the query editor

### Step 4: Review the SQL (Optional but Recommended)

You should see SQL that:
- Creates `_prisma_migrations` table
- Creates unique index
- Inserts 29 migration records
- Has verification queries at the end

**The SQL should look like:**
```sql
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    ...
);

CREATE UNIQUE INDEX IF NOT EXISTS ...
INSERT INTO "_prisma_migrations" ...
SELECT COUNT(*) as migration_count FROM "_prisma_migrations";
```

### Step 5: Execute the SQL

**Method 1: Using Button**
1. Click the **Execute** button (green play button, or F5 icon)
2. Or press **F5** on your keyboard

**Method 2: Using Menu**
1. Go to **Query** → **Execute** (or **Execute/Refresh**)

**Method 3: Keyboard Shortcut**
1. Press **F5**

### Step 6: Check Results

After executing, you'll see results in different tabs:

**Messages Tab:**
- Look for success messages like:
  - `CREATE TABLE`
  - `CREATE INDEX`
  - `INSERT 0 29` (or similar, indicating 29 rows inserted)
- If there are errors, they'll appear in red

**Data Output Tab:**
- Should show the verification query results:
  - `migration_count: 29`
  - List of all 29 migrations

### Step 7: Verify the Baseline Worked

In the Query Tool, run this verification query:

```sql
SELECT COUNT(*) FROM "_prisma_migrations";
```

**Expected Result:**
- Should return `29` (or show `migration_count: 29`)

**Also verify the table exists:**
1. In left panel, expand **postgres** → **Schemas** → **public** → **Tables**
2. Look for `_prisma_migrations` table
3. Right-click it → **View/Edit Data** → **All Rows**
4. Should show 29 rows

### Step 8: Verify Individual Migrations

Run this query to see all migrations:

```sql
SELECT migration_name, finished_at 
FROM "_prisma_migrations" 
ORDER BY migration_name;
```

**Expected Result:**
- Should list all 29 migrations
- Each with a `finished_at` timestamp

## Troubleshooting

### Error: "relation _prisma_migrations already exists"
- **This is OK!** The table already exists
- The `CREATE TABLE IF NOT EXISTS` handles this
- The INSERT will still work (ON CONFLICT handles duplicates)
- Continue to Step 7 to verify

### Error: "permission denied"
- Ensure you're connected as `traccems_admin`
- Check Azure database user permissions
- You may need to grant permissions in Azure Portal

### Error: "duplicate key value violates unique constraint"
- Some migrations may already exist
- This is handled by `ON CONFLICT DO NOTHING`
- Check how many migrations were actually inserted

### No Results Showing
- Check the **Messages** tab for execution status
- Check if there were any errors
- Try running the verification query manually

## Visual Guide: pgAdmin Layout

```
pgAdmin 4 Window
├── Left Panel (Object Browser)
│   ├── Servers
│   │   └── Azure TCC Database
│   │       └── Databases
│   │           └── postgres ← Right-click here → Query Tool
│
└── Right Panel (Query Tool - opens after Step 2)
    ├── SQL Editor (top)
    │   └── Paste/open baseline-migrations-complete.sql here
    │
    ├── Messages Tab (bottom)
    │   └── Shows execution results/errors
    │
    └── Data Output Tab (bottom)
        └── Shows query results
```

## Quick Checklist

- [ ] Connected to Azure database in pgAdmin ✅
- [ ] Opened Query Tool (right-click postgres → Query Tool)
- [ ] Opened/copied `backend/baseline-migrations-complete.sql`
- [ ] Pasted SQL into Query Tool
- [ ] Executed SQL (F5 or Execute button)
- [ ] Checked Messages tab for success
- [ ] Verified: `SELECT COUNT(*) FROM "_prisma_migrations";` returns 29
- [ ] Verified table exists in left panel

## After Successful Baseline

1. ✅ Close Query Tool (optional)
2. ✅ Re-run GitHub Actions workflow
3. ✅ Deployment should now succeed!

## File Location Reference

The SQL file is located at:
```
/Users/scooper/Code/tcc-new-project/backend/baseline-migrations-complete.sql
```

Or relative to project root:
```
backend/baseline-migrations-complete.sql
```

