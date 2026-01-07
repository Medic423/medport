# TCC Backup Strategy & Recovery Guide

## **The Problem You Identified**

You correctly identified that **Git does NOT maintain critical files** needed for complete project restoration:

### **❌ What Git DOESN'T Backup:**
- Environment files (`.env*`) - These are in `.gitignore`
- Vercel configuration (`.vercel/` directory)
- Local database states
- Node modules (intentionally excluded)
- Local development configurations

### **✅ What Git DOES Backup:**
- Source code
- Configuration files (that aren't environment-specific)
- Documentation
- Package.json files

## **The Solution: Multi-Layer Backup Strategy**

### **Layer 1: Enhanced External Backup**
- **Script**: `documentation/backup-enhanced.sh` (called via `documentation/scripts/backup-enhanced-latest.sh`)
- **Purpose**: Creates complete project backup including ALL environment files and **Azure databases**
- **Location**: External drive (`/Volumes/Acasis/`)
- **Includes**: 
  - Environment files
  - Vercel config (if exists)
  - **Azure dev database** (`traccems-dev-pgsql`) - **REQUIRED**
  - Local database (if exists)
  - Restore scripts
- **Critical Requirement**: Backup will **FAIL** if no database backups are created (ensures disaster recovery capability)

### **Layer 2: Critical Scripts Backup**
- **Script**: `scripts/backup-critical-scripts-to-icloud.sh`
- **Purpose**: Backup the backup scripts themselves to iCloud
- **Location**: iCloud Drive
- **Why**: If you restore from an older backup, you get old backup scripts

### **Layer 3: Git Repository**
- **Purpose**: Source code version control
- **Limitation**: Missing environment files and configurations
- **Critical Requirement**: ALL commits must be user-verified working states (see workflow below)

## **CRITICAL: Git Commit Workflow**

### **❌ AI MUST NEVER Commit Without User Verification**

**The Problem:**
- AI commits code thinking "this should work"
- User tests and discovers it doesn't work
- Multiple fix commits pollute git history
- Result: No "known good" states to recover to

**The Solution:**
```
1. AI makes changes
2. AI runs automated checks (linting, type checking, build)
3. AI tells user: "Changes ready for testing"
4. User tests thoroughly in the UI
5. User explicitly says: "commit this" or "this works, commit it"
6. ONLY THEN does AI create commit
7. Commit message includes "USER VERIFIED WORKING" or similar confirmation
```

### **Why This Matters for Recovery:**

**Without Verification (Unreliable):**
```bash
git log --oneline
abc1234 feat: add Phase 3           ← Does this work? Unknown!
def5678 fix: Phase 3 bugs           ← Does THIS work? Unknown!
ghi9012 fix: more Phase 3 fixes     ← Which one is safe?!
```

**With Verification (Reliable):**
```bash
git log --oneline
abc1234 feat: add Phase 3 - USER VERIFIED     ← ✅ Works!
def5678 feat: add Phase 2 - USER VERIFIED     ← ✅ Works!
ghi9012 feat: add Phase 1 - USER VERIFIED     ← ✅ Works!
# ANY commit is safe to restore to!
```

### **Benefits:**
- ✅ Every commit is a "known good" checkpoint
- ✅ Git history becomes reliable for recovery
- ✅ Safe to use `git reset` to any commit
- ✅ Combined with enhanced backups = trustworthy complete recovery
- ✅ Prevents the git mess that caused previous data loss

### **Emergency Rollback (Now Safe):**
```bash
# Since every commit is verified, rolling back is safe:
git log --oneline  # All commits are "known good"
git reset --hard <any-commit>  # Safe to use ANY commit
git push --force-with-lease  # Update remote if needed
```

## **Recovery Scenarios**

### **Scenario 1: Complete System Loss**
1. **Download critical scripts** from iCloud
2. **Make executable**: `chmod +x *.sh`
3. **Run enhanced backup** to create fresh complete backup
4. **Restore project** using enhanced backup's restore scripts

### **Scenario 2: Restore from Older Backup**
1. **Problem**: Older backup has old backup script (no environment files)
2. **Solution**: Download latest scripts from iCloud first
3. **Then**: Use latest enhanced backup script to create new complete backup
4. **Finally**: Restore using the new complete backup

### **Scenario 3: Development Environment Rebuild**
1. **Use**: `scripts/start-dev-complete.sh` for safe startup
2. **Verify**: All services are healthy
3. **Test**: All three login systems work

## **Critical Files That Must Be Preserved**

### **Environment Files:**
```
backend/.env                    # Backend development config
backend/.env.production         # Backend production config (if exists)
frontend/.env.production        # Frontend production config
frontend/.env.local            # Frontend local config
.vercel/.env.preview.local     # Vercel preview config
```

### **Configuration Files:**
```
vercel.json                    # Root Vercel config (API rewrites)
frontend/vercel.json          # Frontend Vercel config
.vercel/                      # Complete Vercel directory
```

### **Database Backups:**
```
Local (if exists):
  medport_ems_local.sql       # Local development database (optional)

Azure Databases (CRITICAL):
  traccems-dev-pgsql.sql      # Azure dev database (REQUIRED for disaster recovery)
  traccems-prod-pgsql.sql     # Azure production database (REQUIRED for disaster recovery)
```

**⚠️ CRITICAL:** The backup script will **FAIL** if no database backups are created. This ensures backups are usable for disaster recovery.

**Production Database Backup:**
- **REQUIRED:** Production database backup is now included in all backups
- **Source:** Connection string retrieved from `TraccEms-Prod-Backend` App Service `DATABASE_URL` environment variable
- **Purpose:** Complete disaster recovery capability for production environment
- **Note:** Production database backups are critical for restoring production data in case of disaster

## **Document Cleanup During Backup**

### **Automatic Organization**

Before creating a backup, the backup script automatically organizes all markdown documents in the project's `/docs` directory:

1. **Project Documents:** Runs `scripts/organize-project-docs.sh` to organize `/docs` folder
2. **External Documents:** Runs `documentation/scripts/organize-documents.sh` for external docs (if exists)

### **What Gets Organized**

- **Removes Duplicates:** Detects and removes duplicate files
- **Categorizes Files:** Moves files from `docs/notes/` to appropriate locations:
  - `active/features/[feature-name]/` - Feature documentation
  - `active/sessions/[YYYY-MM]/` - Session notes
  - `reference/` - Technical reference materials
  - `archive/[YYYY-MM]/` - Historical documents (>60 days old)
- **Ensures Clean Structure:** Every backup has organized, consistent documentation

### **Benefits**

- ✅ **Clean Backups:** No duplicate or misplaced files
- ✅ **Easy Restoration:** Restored backups are immediately usable
- ✅ **Consistent Structure:** All backups have same organization
- ✅ **No Manual Work:** Happens automatically before backup

### **Documentation**

For detailed information about document organization:
- See `docs/reference/backup/DOCUMENT_CLEANUP_STRATEGY.md`
- Run `./scripts/organize-project-docs.sh --dry-run` to preview changes

## **Maintenance Schedule**

### **Daily (Development):**
- Use `scripts/start-dev-complete.sh` for safe startup
- Verify all login systems work

### **Weekly:**
- Run `scripts/backup-enhanced-latest.sh` for complete backup
- Run `scripts/backup-critical-scripts-to-icloud.sh` to update iCloud
- Documents are automatically organized before backup

### **Before Major Changes:**
- Always create enhanced backup before significant modifications
- Update critical scripts in iCloud if you modify them
- Documents are automatically organized before backup

### **After Git Operations:**
- Remember: Git restore won't include environment files
- Always verify environment files are intact after Git operations
- Documents are automatically organized before backup

## **Your Strategic Insight**

Your observation was **absolutely correct**:

> "If you restored from a backup older than this one you would get a version that doesn't maintain separation correct."

This is exactly why we need:
1. **Version-controlled backup scripts** in iCloud
2. **Enhanced backup script** that includes environment files
3. **Separate storage** for critical scripts outside the main project

## **Quick Commands**

### **Create Complete Backup:**
```bash
./scripts/backup-enhanced-latest.sh
```

### **Update Critical Scripts in iCloud:**
```bash
./scripts/backup-critical-scripts-to-icloud.sh
```

### **Run Complete Backup (External Drive + iCloud):**
```bash
bash documentation/scripts/backup-complete-with-icloud.sh /Volumes/Acasis/
```
This runs:
1. Enhanced backup to external drive (includes Azure database)
2. Critical scripts backup to iCloud
3. Full backup copy to iCloud Drive

### **Run Both Backups Together (Legacy):**
```bash
./scripts/backup-run-all.sh /Volumes/Acasis/
```

### **Restore from Backup:**
```bash
cd /path/to/backup
./restore-complete.sh
```

### **Isolated Restore (Dry Run) Procedure**
Restore to a separate temp directory and a non-production DB namespace to validate backups without touching your live environment.

1) Prepare temp directory
```bash
RESTORE_ROOT="/Volumes/Acasis/tcc-backups/<backup-folder>"
TEST_DIR="/tmp/tcc-restore-test"
rm -rf "$TEST_DIR" && mkdir -p "$TEST_DIR"
cp -r "$RESTORE_ROOT/project" "$TEST_DIR/"
```

2) Optional: validate scripts from the restored copy
```bash
pushd "$TEST_DIR/project" >/dev/null
./scripts/check-backend-health.sh || true
./scripts/check-frontend-errors.sh || true
popd >/dev/null
```

3) Optional: isolated DB import (use a separate DB name or Docker)
- Recommended: import `databases/traccems-dev-pgsql.sql` (Azure dev database) into a disposable local DB (e.g., `medport_ems_test`) or a Docker Postgres container.
- Or import `databases/medport_ems_local.sql` if local database exists.
- Do not run restore scripts against your live Azure databases.

4) Optional: run services from the restored copy
```bash
pushd "$TEST_DIR/project" >/dev/null
# Set env vars to point to the isolated DB (e.g., *_TEST URLs)
# Then start backend/frontend in different ports if needed.
popd >/dev/null
```

5) Cleanup
```bash
rm -rf "$TEST_DIR"
```

Add this dry run to the weekly routine before major merges/releases.

### **Docker Postgres Snapshot DB (Keep in Sync)**
Maintain a local Docker Postgres with a restorable snapshot of the latest backup for safe testing.

1) Start Docker Postgres (one-time)
```bash
docker run --name tcc-pg-test \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=medport_ems_test \
  -p 5544:5432 -d postgres:16-alpine
```

2) Import the latest DB from a backup folder
```bash
RESTORE_ROOT="/Volumes/Acasis/tcc-backups/<backup-folder>"
# Use Azure dev database backup (or local if available)
docker cp "$RESTORE_ROOT/databases/traccems-dev-pgsql.sql" tcc-pg-test:/tmp/traccems-dev-pgsql.sql
docker exec -i tcc-pg-test \
  psql -U postgres -d medport_ems_test -f /tmp/traccems-dev-pgsql.sql
```

3) Verify
```bash
docker exec -i tcc-pg-test psql -U postgres -d medport_ems_test -c "SELECT count(*) FROM transport_requests;"
```

4) Update the Docker DB when a new backup is created
```bash
# Option A: Re-import over the same DB (fast for small DBs)
docker cp "/Volumes/Acasis/tcc-backups/<new-backup>/databases/traccems-dev-pgsql.sql" tcc-pg-test:/tmp/traccems-dev-pgsql.sql
docker exec -i tcc-pg-test psql -U postgres -d medport_ems_test -f /tmp/traccems-dev-pgsql.sql

# Option B: Recreate the DB (ensures a clean state)
docker exec -i tcc-pg-test psql -U postgres -c "DROP DATABASE IF EXISTS medport_ems_test;"
docker exec -i tcc-pg-test psql -U postgres -c "CREATE DATABASE medport_ems_test;"
docker exec -i tcc-pg-test psql -U postgres -d medport_ems_test -f /tmp/medport_ems.sql
```

5) Point a local app instance at Docker DB (optional)
```bash
# Example .env override for backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5544/medport_ems_test?schema=public
```

6) Stop/Start the container
```bash
docker stop tcc-pg-test
docker start tcc-pg-test
```

### **Safe Development Startup:**
```bash
./scripts/start-dev-complete.sh
```

## **Emergency Recovery Checklist**

1. ✅ Download critical scripts from iCloud
2. ✅ Make scripts executable
3. ✅ Create fresh enhanced backup
4. ✅ Restore project using enhanced backup
5. ✅ Verify all login systems work
6. ✅ Test dev/prod separation

## **Azure Database Backup Technical Notes**

### **PostgreSQL Version Requirements**

**⚠️ CRITICAL:** Azure PostgreSQL Flexible Server uses **PostgreSQL 17**. The backup script requires **PostgreSQL 17 `pg_dump`** to backup Azure databases.

**Installation:**
```bash
brew install postgresql@17
```

**How It Works:**
- The backup script automatically detects and uses `/opt/homebrew/opt/postgresql@17/bin/pg_dump` if available
- Falls back to system `pg_dump` if PostgreSQL 17 is not installed (will fail for Azure databases)
- **Version mismatch error:** If you see "server version mismatch", install PostgreSQL 17

### **Azure Database Connection**

The backup script automatically retrieves the Azure dev database connection string from:
- Azure App Service configuration (`TraccEms-Dev-Backend` → `DATABASE_URL` environment variable)

**Connection Details:**
- **Host:** `traccems-dev-pgsql.postgres.database.azure.com`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `traccems_admin`
- **SSL:** Required (`sslmode=require`)

### **Firewall Requirements**

Azure PostgreSQL firewall must allow connections from your current IP address. The backup script will fail with a connection error if:
- Your IP is not whitelisted in Azure Portal
- Network connectivity issues exist

**To Fix:**
1. Go to Azure Portal → `traccems-dev-pgsql` → Networking
2. Add firewall rule for your current IP address
3. Or temporarily enable "Allow access to Azure services"

### **Backup Verification**

The backup script verifies database backups contain:
- Minimum 100 lines (ensures backup is not empty)
- Critical tables: `_prisma_migrations`, `transport_requests`, `trips`, `ems_users`, `ems_agencies`
- **Backup fails if verification fails** (ensures disaster recovery capability)

### **What Gets Backed Up**

**Azure Dev Database (`traccems-dev-pgsql`):**
- ✅ **REQUIRED** - Backup will fail if this cannot be backed up
- Contains all development data
- Can be restored to new Azure PostgreSQL instance or local PostgreSQL

**Local Database (`medport_ems`):**
- ✅ Optional - Only backed up if PostgreSQL is running locally and database exists
- Used for local development

**Azure Production Database (`traccems-prod-pgsql`):**
- ✅ **REQUIRED** - Backup will fail if this cannot be backed up
- Contains all production data
- Can be restored to new Azure PostgreSQL instance or local PostgreSQL
- **Source:** Connection string retrieved from `TraccEms-Prod-Backend` App Service `DATABASE_URL` environment variable

### **Disaster Recovery Scenarios**

**Scenario A: Restore Azure Dev Database**
```bash
cd /path/to/backup/databases
export PGPASSWORD='password1!'
psql -h traccems-dev-pgsql.postgres.database.azure.com \
     -p 5432 \
     -U traccems_admin \
     -d postgres \
     -f traccems-dev-pgsql.sql
```

**Scenario B: Restore to New Azure Instance**
1. Create new Azure PostgreSQL Flexible Server
2. Update firewall rules
3. Restore from backup SQL file

**Scenario C: Restore to Local PostgreSQL**
```bash
createdb medport_ems_restored
psql -d medport_ems_restored -f traccems-dev-pgsql.sql
```

## **Why This Strategy Works**

- **Git**: Handles source code versioning
- **Enhanced Backup**: Handles environment files, configurations, and **Azure databases**
- **iCloud Scripts**: Ensures you always have latest backup capabilities
- **External Drive**: Provides complete offline backup capability
- **iCloud Drive**: Provides off-site cloud backup
- **Database Verification**: Ensures backups are usable for disaster recovery
- **Multiple Layers**: Redundancy prevents total loss

**Updated:** 
- December 26, 2025 - Added Azure database backup support with PostgreSQL 17 requirement
- January 7, 2026 - Added Azure production database backup as REQUIRED (previously optional)

Your strategic thinking about this backup architecture was spot-on! 🎯
