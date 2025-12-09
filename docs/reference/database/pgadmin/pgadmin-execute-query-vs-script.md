# pgAdmin: Execute Query vs Execute Script
**Date:** December 9, 2025

## When to Use Each

### Execute Query (F5) - For Single Statements

**Use for:**
- Single SQL statements (UPDATE, SELECT, INSERT, DELETE)
- Quick checks and verifications
- Testing individual queries

**How to use:**
1. Type or paste SQL in Query Tool
2. Place cursor on the query (or select it)
3. Press **F5** or click **Execute** button (play icon)
4. Results appear in Data Output tab

**Example:**
```sql
-- This single UPDATE statement - use Execute Query (F5)
UPDATE _prisma_migrations 
SET rolled_back_at = NOW()
WHERE migration_name = '20251209140000_add_dropdown_categories';
```

### Execute Script (Alt+F5) - For Entire Files

**Use for:**
- Complete SQL files with multiple statements
- Migration files
- Files with CREATE TABLE, ALTER TABLE, INSERT statements
- Files that need to run from top to bottom

**How to use:**
1. **Option A**: File → Open → Select SQL file → Execute Script (Alt+F5)
2. **Option B**: Copy entire file content → Paste in Query Tool → Execute Script (Alt+F5)
3. Results appear in Messages tab (not Data Output)

**Example:**
- `backend/apply-dropdown-categories-migration.sql` - Use Execute Script
- `backend/resolve-failed-migration.sql` - Use Execute Script (has multiple statements)

## Quick Reference

| What You're Running | Use |
|---------------------|-----|
| Single UPDATE statement | Execute Query (F5) |
| Single SELECT statement | Execute Query (F5) |
| Complete migration file | Execute Script (Alt+F5) |
| Multiple statements in sequence | Execute Script (Alt+F5) |
| File with CREATE/ALTER/INSERT | Execute Script (Alt+F5) |

## For Our Current Fix

### Quick Fix (Single Statement):
```sql
UPDATE _prisma_migrations 
SET rolled_back_at = NOW()
WHERE migration_name = '20251209140000_add_dropdown_categories';
```
→ Use **Execute Query (F5)**

### Full Migration File:
`backend/apply-dropdown-categories-migration.sql`
→ Use **Execute Script (Alt+F5)** or File → Open → Execute Script

### Diagnostic Script:
`backend/resolve-failed-migration.sql` (has multiple SELECT statements)
→ Use **Execute Script (Alt+F5)**

## Tips

- **Execute Query (F5)** shows results in Data Output tab (for SELECT)
- **Execute Script (Alt+F5)** shows messages in Messages tab
- If you get "no results" but see "Success" in Messages, that's normal for non-SELECT statements
- For files, you can also use: Right-click file → Execute Script

