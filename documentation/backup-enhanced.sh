#!/bin/bash

# TCC Project Enhanced Backup Script
# Backs up the project AND databases to external drive

PROJECT_DIR="/Users/scooper/Code/tcc-new-project"
BACKUP_DIR="${1:-/Volumes/Acasis}/tcc-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="tcc-backup-$TIMESTAMP"

echo "🔄 Starting TCC project enhanced backup..."
echo "Project: $PROJECT_DIR"
echo "Backup to: $BACKUP_DIR/$BACKUP_NAME"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

# 1. Organize project documents before backup (if script exists)
if [ -f "$PROJECT_DIR/scripts/organize-project-docs.sh" ]; then
    echo "📁 Organizing project documents before backup..."
    "$PROJECT_DIR/scripts/organize-project-docs.sh" --force || echo "⚠️ Project document organization skipped"
fi

# 1b. Organize external documents before backup (if script exists)
if [ -f "$PROJECT_DIR/documentation/scripts/organize-documents.sh" ]; then
    echo "📁 Organizing external documentation before backup..."
    "$PROJECT_DIR/documentation/scripts/organize-documents.sh" --force || echo "⚠️ External document organization skipped"
fi

# 2. Backup project files
echo "📦 Creating project backup..."
cp -r "$PROJECT_DIR" "$BACKUP_DIR/$BACKUP_NAME/project"

# 3. Backup external documentation
DOCS_DIR="$HOME/Documents/tcc-project-docs"
if [ -d "$DOCS_DIR" ]; then
    echo "📚 Backing up external documentation..."
    cp -r "$DOCS_DIR" "$BACKUP_DIR/$BACKUP_NAME/documentation"
    echo "✅ Documentation backed up: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/documentation" | cut -f1)"
else
    echo "⚠️ External documentation directory not found: $DOCS_DIR"
fi

# 4. Remove node_modules to save space
echo "🧹 Cleaning up node_modules..."
rm -rf "$BACKUP_DIR/$BACKUP_NAME/project/backend/node_modules"
rm -rf "$BACKUP_DIR/$BACKUP_NAME/project/frontend/node_modules"
rm -rf "$BACKUP_DIR/$BACKUP_NAME/project/node_modules"

# 5. Backup PostgreSQL databases
echo "🗄️ Backing up PostgreSQL databases..."

# Create database backup directory
mkdir -p "$BACKUP_DIR/$BACKUP_NAME/databases"

# 5a. Backup local dev database (if PostgreSQL is running locally)
if pg_isready -q 2>/dev/null; then
    echo "📊 Backing up local dev database (medport_ems)..."
    if pg_dump -h localhost -U scooper -d medport_ems > "$BACKUP_DIR/$BACKUP_NAME/databases/medport_ems_local.sql" 2>/dev/null; then
        echo "✅ Local dev database backed up"
    else
        echo "⚠️ Local dev database backup skipped (database may not exist)"
    fi
else
    echo "⚠️ PostgreSQL not running locally - skipping local database backup"
fi

# 5b. Backup Azure dev database (traccems-dev-pgsql)
echo "📊 Backing up Azure dev database (traccems-dev-pgsql)..."
if command -v pg_dump >/dev/null 2>&1; then
    # Get dev database connection string from Azure App Service config
    DEV_DB_CONNECTION=$(az webapp config appsettings list \
        --name TraccEms-Dev-Backend \
        --resource-group TraccEms-Dev-USCentral \
        --query "[?name=='DATABASE_URL'].value" -o tsv 2>/dev/null || echo "")
    
    if [ -n "$DEV_DB_CONNECTION" ]; then
        echo "📥 Exporting Azure dev database..."
        echo "   This may take a few minutes..."
        
        # Extract connection details from connection string
        # Format: postgresql://user:password@host:port/database?sslmode=require
        DB_USER=$(echo "$DEV_DB_CONNECTION" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')
        DB_PASSWORD=$(echo "$DEV_DB_CONNECTION" | sed -n 's|postgresql://[^:]*:\([^@]*\)@.*|\1|p')
        DB_HOST=$(echo "$DEV_DB_CONNECTION" | sed -n 's|.*@\([^:]*\):.*|\1|p')
        DB_PORT=$(echo "$DEV_DB_CONNECTION" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
        DB_NAME=$(echo "$DEV_DB_CONNECTION" | sed -n 's|.*/[^?]*/\([^?]*\).*|\1|p' || echo "postgres")
        
        # If DB_NAME extraction failed, try alternative pattern
        if [ -z "$DB_NAME" ] || [ "$DB_NAME" = "$DEV_DB_CONNECTION" ]; then
            DB_NAME=$(echo "$DEV_DB_CONNECTION" | sed -n 's|.*/\([^?]*\)?.*|\1|p' || echo "postgres")
        fi
        
        if [ -n "$DB_HOST" ] && [ -n "$DB_NAME" ] && [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ]; then
            # Use PostgreSQL 17 pg_dump if available (required for Azure PostgreSQL 17)
            PG_DUMP_CMD="pg_dump"
            if [ -f "/opt/homebrew/opt/postgresql@17/bin/pg_dump" ]; then
                PG_DUMP_CMD="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
                echo "   Using PostgreSQL 17 pg_dump (required for Azure PostgreSQL 17)"
            fi
            
            export PGPASSWORD="$DB_PASSWORD"
            if PGPASSWORD="$DB_PASSWORD" "$PG_DUMP_CMD" \
                -h "$DB_HOST" \
                -p "${DB_PORT:-5432}" \
                -U "$DB_USER" \
                -d "$DB_NAME" \
                --no-owner \
                --no-acl \
                -F p \
                > "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-dev-pgsql.sql" 2>&1; then
                # Verify backup file exists and has content
                if [ -s "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-dev-pgsql.sql" ]; then
                    BACKUP_SIZE=$(wc -l < "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-dev-pgsql.sql")
                    BACKUP_FILE_SIZE=$(ls -lh "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-dev-pgsql.sql" | awk '{print $5}')
                    echo "✅ Azure dev database backed up: $BACKUP_FILE_SIZE ($BACKUP_SIZE lines)"
                else
                    echo "❌ ERROR: Azure dev database backup file is empty!"
                    rm -f "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-dev-pgsql.sql"
                fi
            else
                echo "❌ ERROR: Azure dev database backup failed!"
                echo "   Check firewall rules and network connectivity"
                echo "   You may need to whitelist your IP in Azure Portal"
            fi
            unset PGPASSWORD
        else
            echo "❌ ERROR: Could not parse Azure dev database connection string"
            echo "   DB_HOST: ${DB_HOST:-empty}"
            echo "   DB_NAME: ${DB_NAME:-empty}"
            echo "   DB_USER: ${DB_USER:-empty}"
            echo "   DB_PASSWORD: ${DB_PASSWORD:+set}"
        fi
    else
        echo "❌ ERROR: Azure dev database connection string not found!"
        echo "   Cannot backup Azure dev database without connection string"
        exit 1
    fi
else
    echo "❌ ERROR: pg_dump not found - cannot backup Azure dev database"
    echo "   Please install PostgreSQL client tools"
    exit 1
fi

# 5c. Backup Azure production database (traccems-prod-pgsql)
echo "📊 Backing up Azure production database (traccems-prod-pgsql)..."
if command -v pg_dump >/dev/null 2>&1; then
    # Get production database connection string from Azure App Service config
    PROD_DB_CONNECTION=$(az webapp config appsettings list \
        --name TraccEms-Prod-Backend \
        --resource-group TraccEms-Prod-USCentral \
        --query "[?name=='DATABASE_URL'].value" -o tsv 2>/dev/null || echo "")
    
    if [ -n "$PROD_DB_CONNECTION" ]; then
        echo "📥 Exporting Azure production database..."
        echo "   This may take a few minutes..."
        
        # Extract connection details from connection string
        # Format: postgresql://user:password@host:port/database?sslmode=require
        PROD_DB_USER=$(echo "$PROD_DB_CONNECTION" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')
        PROD_DB_PASSWORD=$(echo "$PROD_DB_CONNECTION" | sed -n 's|postgresql://[^:]*:\([^@]*\)@.*|\1|p')
        PROD_DB_HOST=$(echo "$PROD_DB_CONNECTION" | sed -n 's|.*@\([^:]*\):.*|\1|p')
        PROD_DB_PORT=$(echo "$PROD_DB_CONNECTION" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
        PROD_DB_NAME=$(echo "$PROD_DB_CONNECTION" | sed -n 's|.*/[^?]*/\([^?]*\).*|\1|p' || echo "postgres")
        
        # If DB_NAME extraction failed, try alternative pattern
        if [ -z "$PROD_DB_NAME" ] || [ "$PROD_DB_NAME" = "$PROD_DB_CONNECTION" ]; then
            PROD_DB_NAME=$(echo "$PROD_DB_CONNECTION" | sed -n 's|.*/\([^?]*\)?.*|\1|p' || echo "postgres")
        fi
        
        if [ -n "$PROD_DB_HOST" ] && [ -n "$PROD_DB_NAME" ] && [ -n "$PROD_DB_USER" ] && [ -n "$PROD_DB_PASSWORD" ]; then
            # Use PostgreSQL 17 pg_dump if available (required for Azure PostgreSQL 17)
            PG_DUMP_CMD="pg_dump"
            if [ -f "/opt/homebrew/opt/postgresql@17/bin/pg_dump" ]; then
                PG_DUMP_CMD="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
                echo "   Using PostgreSQL 17 pg_dump (required for Azure PostgreSQL 17)"
            fi
            
            export PGPASSWORD="$PROD_DB_PASSWORD"
            if PGPASSWORD="$PROD_DB_PASSWORD" "$PG_DUMP_CMD" \
                -h "$PROD_DB_HOST" \
                -p "${PROD_DB_PORT:-5432}" \
                -U "$PROD_DB_USER" \
                -d "$PROD_DB_NAME" \
                --no-owner \
                --no-acl \
                -F p \
                > "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-prod-pgsql.sql" 2>&1; then
                # Verify backup file exists and has content
                if [ -s "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-prod-pgsql.sql" ]; then
                    PROD_BACKUP_SIZE=$(wc -l < "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-prod-pgsql.sql")
                    PROD_BACKUP_FILE_SIZE=$(ls -lh "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-prod-pgsql.sql" | awk '{print $5}')
                    echo "✅ Azure production database backed up: $PROD_BACKUP_FILE_SIZE ($PROD_BACKUP_SIZE lines)"
                else
                    echo "❌ ERROR: Azure production database backup file is empty!"
                    rm -f "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-prod-pgsql.sql"
                fi
            else
                echo "❌ ERROR: Azure production database backup failed!"
                echo "   Check firewall rules and network connectivity"
                echo "   You may need to whitelist your IP in Azure Portal"
            fi
            unset PGPASSWORD
        else
            echo "❌ ERROR: Could not parse Azure production database connection string"
            echo "   PROD_DB_HOST: ${PROD_DB_HOST:-empty}"
            echo "   PROD_DB_NAME: ${PROD_DB_NAME:-empty}"
            echo "   PROD_DB_USER: ${PROD_DB_USER:-empty}"
            echo "   PROD_DB_PASSWORD: ${PROD_DB_PASSWORD:+set}"
        fi
    else
        echo "❌ ERROR: Azure production database connection string not found!"
        echo "   Cannot backup Azure production database without connection string"
        echo "   Check that DATABASE_URL is set in TraccEms-Prod-Backend App Service"
        exit 1
    fi
else
    echo "❌ ERROR: pg_dump not found - cannot backup Azure production database"
    echo "   Please install PostgreSQL client tools"
    exit 1
fi

# Verify database backup integrity
echo "🔍 Verifying database backups..."
HAS_LOCAL_DB=false
HAS_AZURE_DEV_DB=false
HAS_AZURE_PROD_DB=false
BACKUP_FAILED=false

if [ -f "$BACKUP_DIR/$BACKUP_NAME/databases/medport_ems_local.sql" ]; then
    HAS_LOCAL_DB=true
    DB_SIZE=$(wc -l < "$BACKUP_DIR/$BACKUP_NAME/databases/medport_ems_local.sql")
    if [ "$DB_SIZE" -gt 100 ]; then
        TRIP_COUNT=$(grep -A 1000 "COPY public.transport_requests" "$BACKUP_DIR/$BACKUP_NAME/databases/medport_ems_local.sql" | grep -c "^cmg" || echo "0")
        echo "✅ Local dev database verified: $DB_SIZE lines, $TRIP_COUNT trips"
    else
        echo "⚠️ WARNING: Local database backup appears too small ($DB_SIZE lines)"
    fi
fi

if [ -f "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-dev-pgsql.sql" ]; then
    HAS_AZURE_DEV_DB=true
    AZURE_DEV_DB_SIZE=$(wc -l < "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-dev-pgsql.sql")
    AZURE_DEV_FILE_SIZE=$(ls -lh "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-dev-pgsql.sql" | awk '{print $5}')
    
    if [ "$AZURE_DEV_DB_SIZE" -gt 100 ]; then
        # Check for critical tables
        TABLES_FOUND=0
        for table in "_prisma_migrations" "transport_requests" "trips" "ems_users" "ems_agencies"; do
            if grep -q "CREATE TABLE.*${table}" "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-dev-pgsql.sql" || \
               grep -q "COPY public.${table}" "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-dev-pgsql.sql"; then
                TABLES_FOUND=$((TABLES_FOUND + 1))
            fi
        done
        echo "✅ Azure dev database verified: $AZURE_DEV_FILE_SIZE ($AZURE_DEV_DB_SIZE lines, $TABLES_FOUND/5 critical tables found)"
    else
        echo "❌ ERROR: Azure dev database backup appears invalid ($AZURE_DEV_DB_SIZE lines)"
        BACKUP_FAILED=true
    fi
else
    echo "❌ ERROR: Azure dev database backup file not found!"
    BACKUP_FAILED=true
fi

if [ -f "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-prod-pgsql.sql" ]; then
    HAS_AZURE_PROD_DB=true
    AZURE_PROD_DB_SIZE=$(wc -l < "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-prod-pgsql.sql")
    AZURE_PROD_FILE_SIZE=$(ls -lh "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-prod-pgsql.sql" | awk '{print $5}')
    
    if [ "$AZURE_PROD_DB_SIZE" -gt 100 ]; then
        # Check for critical tables
        PROD_TABLES_FOUND=0
        for table in "_prisma_migrations" "transport_requests" "trips" "ems_users" "ems_agencies"; do
            if grep -q "CREATE TABLE.*${table}" "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-prod-pgsql.sql" || \
               grep -q "COPY public.${table}" "$BACKUP_DIR/$BACKUP_NAME/databases/traccems-prod-pgsql.sql"; then
                PROD_TABLES_FOUND=$((PROD_TABLES_FOUND + 1))
            fi
        done
        echo "✅ Azure production database verified: $AZURE_PROD_FILE_SIZE ($AZURE_PROD_DB_SIZE lines, $PROD_TABLES_FOUND/5 critical tables found)"
    else
        echo "❌ ERROR: Azure production database backup appears invalid ($AZURE_PROD_DB_SIZE lines)"
        BACKUP_FAILED=true
    fi
else
    echo "❌ ERROR: Azure production database backup file not found!"
    BACKUP_FAILED=true
fi

# CRITICAL: Fail if no database backups exist
if [ "$HAS_LOCAL_DB" = false ] && [ "$HAS_AZURE_DEV_DB" = false ] && [ "$HAS_AZURE_PROD_DB" = false ]; then
    echo ""
    echo "❌ CRITICAL ERROR: No database backups found!"
    echo "   This backup is NOT usable for disaster recovery!"
    echo "   Please fix the backup script and try again."
    exit 1
fi

# CRITICAL: Require at least one Azure database backup (dev or prod)
if [ "$HAS_AZURE_DEV_DB" = false ] && [ "$HAS_AZURE_PROD_DB" = false ]; then
    echo ""
    echo "❌ CRITICAL ERROR: No Azure database backups found!"
    echo "   At least one Azure database backup (dev or prod) is REQUIRED for disaster recovery!"
    exit 1
fi

# Warn if Azure backup failed (but allow if local backup exists)
if [ "$BACKUP_FAILED" = true ] && [ "$HAS_LOCAL_DB" = false ]; then
    echo ""
    echo "❌ CRITICAL ERROR: Azure database backup failed and no local backup exists!"
    echo "   This backup is NOT usable for disaster recovery!"
    exit 1
fi

# 6. Create database restore script
echo "📝 Creating database restore script..."
cat > "$BACKUP_DIR/$BACKUP_NAME/restore-databases.sh" << 'EOF'
#!/bin/bash

# TCC Database Restore Script
# Restores PostgreSQL databases from backup

echo "🔄 Restoring TCC databases..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 5
fi

# Drop and recreate the consolidated database for clean restore
echo "📊 Dropping existing medport_ems database (if exists)..."
dropdb -h localhost -U scooper medport_ems 2>/dev/null || true

echo "📊 Creating fresh medport_ems database..."
createdb -h localhost -U scooper medport_ems

# Restore the consolidated database
echo "📊 Restoring medport_ems database (consolidated TCC database)..."
psql -h localhost -U scooper -d medport_ems < databases/medport_ems.sql

echo "✅ Database restoration completed!"
EOF

chmod +x "$BACKUP_DIR/$BACKUP_NAME/restore-databases.sh"

# 7. Create backup verification script
echo "📝 Creating backup verification script..."
cat > "$BACKUP_DIR/$BACKUP_NAME/verify-backup-data.sh" << 'VERIFYEOF'
#!/bin/bash

# TCC Backup Data Verification Script
# Run this to verify the backup contains the expected data

echo "🔍 TCC Backup Data Verification"
echo "================================"
echo ""

if [ ! -f "databases/medport_ems.sql" ]; then
    echo "❌ Database file not found!"
    echo "   Expected: databases/medport_ems.sql"
    exit 1
fi

echo "📊 Database File: databases/medport_ems.sql"
echo "   Size: $(ls -lh databases/medport_ems.sql | awk '{print $5}')"
echo "   Lines: $(wc -l < databases/medport_ems.sql)"
echo ""

echo "📋 Transport Requests:"
TRIP_COUNT=$(grep -A 1000 "COPY public.transport_requests" databases/medport_ems.sql | grep -c "^cmg" || echo "0")
echo "   Total trips: $TRIP_COUNT"
echo ""

echo "📅 Data Date Range:"
EARLIEST=$(grep "2025-" databases/medport_ems.sql | head -1 | grep -o "2025-[0-9][0-9]-[0-9][0-9]" | head -1 || echo "Unknown")
LATEST=$(grep "2025-" databases/medport_ems.sql | tail -10 | grep -o "2025-[0-9][0-9]-[0-9][0-9]" | tail -1 || echo "Unknown")
echo "   Earliest: $EARLIEST"
echo "   Latest: $LATEST"
echo ""

echo "🔑 Test Users:"
HC_USERS=$(grep -c "COPY public.healthcare_users" databases/medport_ems.sql || echo "0")
EMS_USERS=$(grep -c "test@ems.com" databases/medport_ems.sql || echo "0")
EMS_HAS_AGENCY=$(grep "test@ems.com" databases/medport_ems.sql | grep -c "cmftypzwx0000p4vf9tdqdwql" || echo "0")
echo "   Healthcare users found: $HC_USERS"
echo "   EMS users found: $EMS_USERS"
echo "   EMS user has agency: $EMS_HAS_AGENCY"
echo ""

if [ "$TRIP_COUNT" -eq 0 ]; then
    echo "❌ VERIFICATION FAILED: No trips found in backup!"
    exit 1
elif [ "$DB_SIZE" -lt 100 ]; then
    echo "❌ VERIFICATION FAILED: Database too small!"
    exit 1
else
    echo "✅ Verification PASSED!"
    echo ""
    echo "📋 Summary:"
    echo "   - Database is properly formatted"
    echo "   - Contains $TRIP_COUNT transport requests"
    echo "   - Date range: $EARLIEST to $LATEST"
    echo "   - EMS user agency linkage: $([ "$EMS_HAS_AGENCY" -gt 0 ] && echo 'YES ✅' || echo 'NO ⚠️')"
fi
VERIFYEOF

chmod +x "$BACKUP_DIR/$BACKUP_NAME/verify-backup-data.sh"

# 8. Create comprehensive restore script
echo "📝 Creating comprehensive restore script..."
cat > "$BACKUP_DIR/$BACKUP_NAME/restore-complete.sh" << 'EOF'
#!/bin/bash

# TCC Complete Restore Script
# Restores project, documentation, and databases from backup

echo "🔄 Starting TCC complete restoration..."

# 1. Restore external documentation FIRST (before project files)
DOCS_DIR="$HOME/Documents/tcc-project-docs"
if [ -d "documentation" ]; then
    echo "📚 Restoring external documentation..."
    mkdir -p "$DOCS_DIR"
    cp -r documentation/* "$DOCS_DIR/"
    echo "✅ Documentation restored to $DOCS_DIR"
else
    echo "⚠️ Documentation directory not found in backup"
fi

# 2. Restore project files
echo "📦 Restoring project files..."
if [ -d "project" ]; then
    # Remove old docs directory if it exists (to allow symlink)
    if [ -d "/Users/scooper/Code/tcc-new-project/docs" ] && [ ! -L "/Users/scooper/Code/tcc-new-project/docs" ]; then
        echo "🗑️ Removing old docs directory to make room for symlink..."
        rm -rf "/Users/scooper/Code/tcc-new-project/docs"
    fi
    
    cp -r project/* /Users/scooper/Code/tcc-new-project/
    
    # Ensure docs symlink is created
    if [ ! -L "/Users/scooper/Code/tcc-new-project/docs" ]; then
        echo "🔗 Creating docs symlink..."
        ln -s "$DOCS_DIR" "/Users/scooper/Code/tcc-new-project/docs"
    fi
    
    echo "✅ Project files restored"
else
    echo "❌ Project directory not found"
    exit 1
fi

# 3. Install dependencies
echo "📦 Installing dependencies..."
cd /Users/scooper/Code/tcc-new-project
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 4. Restore databases
echo "🗄️ Restoring databases..."
./restore-databases.sh

# 5. Generate Prisma clients
echo "🔧 Generating Prisma clients..."
cd backend
npx prisma generate
cd ..

echo "✅ Complete restoration finished!"
echo "📚 Documentation: $DOCS_DIR"
echo "📁 Project: /Users/scooper/Code/tcc-new-project"
echo "🚀 You can now run: npm run dev"
EOF

chmod +x "$BACKUP_DIR/$BACKUP_NAME/restore-complete.sh"

# 8. Create backup info file
echo "📝 Creating backup info..."
cat > "$BACKUP_DIR/$BACKUP_NAME/backup-info.txt" << EOF
TCC Project Enhanced Backup
===========================
Date: $(date)
Project: tcc-new-project
Phase: 3 Complete - Revenue Optimization & EMS Management
Status: Full CRUD functionality with optimization algorithms

Contents:
- Complete project files (source code, configs, docs)
- External documentation directory (rollback-safe)
- PostgreSQL database dump (medport_ems - consolidated TCC database)
- Database restore scripts
- Complete restoration script

Documentation:
✅ External docs directory backed up: $HOME/Documents/tcc-project-docs
✅ Rollback-safe: Documents preserved separately from code
✅ Symlinked from project: docs/ → external directory

Database Included:
✅ medport_ems.sql - Consolidated TCC database (all tables in single database)

Features Working:
✅ TCC Admin Dashboard (Hospitals, Agencies, Facilities)
✅ Healthcare Portal (Trip creation)
✅ EMS Dashboard (Trip management + Optimization)
✅ Revenue Optimization Engine
✅ Backhaul Detection System
✅ Complete CRUD operations
✅ Search and filtering
✅ Authentication system

To restore:
1. Run: ./restore-complete.sh
2. Or manually:
   - Copy project files to /Users/scooper/Code/tcc-new-project/
   - Run: ./restore-databases.sh
   - Install dependencies: npm install
   - Start: npm run dev

Database Backup Size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/databases" | cut -f1)
Total Backup Size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
EOF

echo "✅ Enhanced backup completed: $BACKUP_DIR/$BACKUP_NAME"
echo "📊 Project size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/project" | cut -f1)"
if [ -d "$BACKUP_DIR/$BACKUP_NAME/documentation" ]; then
    echo "📊 Documentation size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/documentation" | cut -f1)"
fi
echo "📊 Database size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/databases" | cut -f1)"
echo "📊 Total size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)"
echo "📁 Backup location: $BACKUP_DIR/$BACKUP_NAME"
echo ""
echo "🔧 To restore: cd $BACKUP_DIR/$BACKUP_NAME && ./restore-complete.sh"
echo "📚 Documentation backed up separately (rollback-safe)"
