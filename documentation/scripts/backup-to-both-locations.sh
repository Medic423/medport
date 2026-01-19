#!/bin/bash

# TCC Project Enhanced Backup Script - Dual Location Backup
# Backs up the project AND databases to both external drive AND iCloud Drive
# Follows BACKUP_STRATEGY.md guidelines

set -e

PROJECT_DIR="/Users/scooper/Code/tcc-new-project"
ACASIS_BACKUP_DIR="/Volumes/Acasis/tcc-backups"
ICLOUD_BACKUP_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/tcc-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="tcc-backup-$TIMESTAMP"

echo "🔄 Starting TCC project enhanced backup (dual location)..."
echo "Project: $PROJECT_DIR"
echo "Backup to:"
echo "  1. External Drive: $ACASIS_BACKUP_DIR/$BACKUP_NAME"
echo "  2. iCloud Drive: $ICLOUD_BACKUP_DIR/$BACKUP_NAME"
echo ""

# Verify git is clean
echo "🔍 Verifying git status..."
cd "$PROJECT_DIR"
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "⚠️  WARNING: Git working tree has uncommitted changes!"
    echo "   Modified files:"
    git status --short | head -10
    echo ""
    echo "   Note: Backup will continue, but consider committing changes for a clean backup."
else
    echo "✅ Git working tree is clean"
fi

# Check git branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📌 Current git branch: $CURRENT_BRANCH"
echo ""

# Create backup directories
mkdir -p "$ACASIS_BACKUP_DIR/$BACKUP_NAME"
mkdir -p "$ICLOUD_BACKUP_DIR/$BACKUP_NAME"

# Function to perform backup to a specific location
backup_to_location() {
    local TARGET_DIR="$1"
    local LOCATION_NAME="$2"
    
    echo "📦 Backing up to $LOCATION_NAME..."
    
    # 1. Organize project documents before backup (if script exists)
    if [ -f "$PROJECT_DIR/scripts/organize-project-docs.sh" ]; then
        echo "   📁 Organizing project documents..."
        "$PROJECT_DIR/scripts/organize-project-docs.sh" --force || echo "   ⚠️ Project document organization skipped"
    fi
    
    # 1b. Organize external documents before backup (if script exists)
    if [ -f "$PROJECT_DIR/documentation/scripts/organize-documents.sh" ]; then
        echo "   📁 Organizing external documentation..."
        "$PROJECT_DIR/documentation/scripts/organize-documents.sh" --force || echo "   ⚠️ External document organization skipped"
    fi
    
    # 2. Backup project files
    echo "   📦 Copying project files..."
    cp -r "$PROJECT_DIR" "$TARGET_DIR/project"
    
    # 3. Backup external documentation
    DOCS_DIR="$HOME/Documents/tcc-project-docs"
    if [ -d "$DOCS_DIR" ]; then
        echo "   📚 Backing up external documentation..."
        cp -r "$DOCS_DIR" "$TARGET_DIR/documentation"
    else
        echo "   ⚠️ External documentation directory not found: $DOCS_DIR"
    fi
    
    # 4. Remove node_modules to save space
    echo "   🧹 Removing node_modules..."
    rm -rf "$TARGET_DIR/project/backend/node_modules"
    rm -rf "$TARGET_DIR/project/frontend/node_modules"
    rm -rf "$TARGET_DIR/project/node_modules"
    
    # 5. Backup PostgreSQL databases
    echo "   🗄️ Backing up PostgreSQL databases..."
    mkdir -p "$TARGET_DIR/databases"
    
    # 5a. Backup local dev database (if PostgreSQL is running locally)
    if pg_isready -q 2>/dev/null; then
        echo "   📊 Backing up local dev database (medport_ems)..."
        if pg_dump -h localhost -p 5432 -U scooper -d medport_ems > "$TARGET_DIR/databases/medport_ems_local.sql" 2>/dev/null; then
            DB_SIZE=$(wc -l < "$TARGET_DIR/databases/medport_ems_local.sql")
            echo "   ✅ Local dev database backed up ($DB_SIZE lines)"
        else
            echo "   ⚠️ Local dev database backup skipped (database may not exist)"
        fi
    else
        echo "   ⚠️ PostgreSQL not running locally - skipping local database backup"
    fi
    
    # 5b. Backup Azure dev database (traccems-dev-pgsql)
    echo "   📊 Backing up Azure dev database (traccems-dev-pgsql)..."
    if command -v pg_dump >/dev/null 2>&1 && command -v az >/dev/null 2>&1; then
        DEV_DB_CONNECTION=$(az webapp config appsettings list \
            --name TraccEms-Dev-Backend \
            --resource-group TraccEms-Dev-USCentral \
            --query "[?name=='DATABASE_URL'].value" -o tsv 2>/dev/null || echo "")
        
        if [ -n "$DEV_DB_CONNECTION" ]; then
            echo "   📥 Exporting Azure dev database (this may take a few minutes)..."
            
            # Extract connection details
            DB_USER=$(echo "$DEV_DB_CONNECTION" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')
            DB_PASSWORD=$(echo "$DEV_DB_CONNECTION" | sed -n 's|postgresql://[^:]*:\([^@]*\)@.*|\1|p')
            DB_HOST=$(echo "$DEV_DB_CONNECTION" | sed -n 's|.*@\([^:]*\):.*|\1|p')
            DB_PORT=$(echo "$DEV_DB_CONNECTION" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
            DB_NAME=$(echo "$DEV_DB_CONNECTION" | sed -n 's|.*/[^?]*/\([^?]*\).*|\1|p' || echo "postgres")
            
            if [ -z "$DB_NAME" ] || [ "$DB_NAME" = "$DEV_DB_CONNECTION" ]; then
                DB_NAME=$(echo "$DEV_DB_CONNECTION" | sed -n 's|.*/\([^?]*\)?.*|\1|p' || echo "postgres")
            fi
            
            if [ -n "$DB_HOST" ] && [ -n "$DB_NAME" ] && [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ]; then
                PG_DUMP_CMD="pg_dump"
                if [ -f "/opt/homebrew/opt/postgresql@17/bin/pg_dump" ]; then
                    PG_DUMP_CMD="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
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
                    > "$TARGET_DIR/databases/traccems-dev-pgsql.sql" 2>&1; then
                    if [ -s "$TARGET_DIR/databases/traccems-dev-pgsql.sql" ]; then
                        BACKUP_SIZE=$(wc -l < "$TARGET_DIR/databases/traccems-dev-pgsql.sql")
                        BACKUP_FILE_SIZE=$(ls -lh "$TARGET_DIR/databases/traccems-dev-pgsql.sql" | awk '{print $5}')
                        echo "   ✅ Azure dev database backed up: $BACKUP_FILE_SIZE ($BACKUP_SIZE lines)"
                    else
                        echo "   ❌ ERROR: Azure dev database backup file is empty!"
                        rm -f "$TARGET_DIR/databases/traccems-dev-pgsql.sql"
                    fi
                else
                    echo "   ❌ ERROR: Azure dev database backup failed!"
                fi
                unset PGPASSWORD
            fi
        else
            echo "   ⚠️ Azure dev database connection string not found (skipping)"
        fi
    else
        echo "   ⚠️ pg_dump or Azure CLI not found - skipping Azure dev database backup"
    fi
    
    # 5c. Backup Azure production database (traccems-prod-pgsql)
    echo "   📊 Backing up Azure production database (traccems-prod-pgsql)..."
    if command -v pg_dump >/dev/null 2>&1 && command -v az >/dev/null 2>&1; then
        PROD_DB_CONNECTION=$(az webapp config appsettings list \
            --name TraccEms-Prod-Backend \
            --resource-group TraccEms-Prod-USCentral \
            --query "[?name=='DATABASE_URL'].value" -o tsv 2>/dev/null || echo "")
        
        if [ -n "$PROD_DB_CONNECTION" ]; then
            echo "   📥 Exporting Azure production database (this may take a few minutes)..."
            
            # Extract connection details
            PROD_DB_USER=$(echo "$PROD_DB_CONNECTION" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')
            PROD_DB_PASSWORD=$(echo "$PROD_DB_CONNECTION" | sed -n 's|postgresql://[^:]*:\([^@]*\)@.*|\1|p')
            PROD_DB_HOST=$(echo "$PROD_DB_CONNECTION" | sed -n 's|.*@\([^:]*\):.*|\1|p')
            PROD_DB_PORT=$(echo "$PROD_DB_CONNECTION" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
            PROD_DB_NAME=$(echo "$PROD_DB_CONNECTION" | sed -n 's|.*/[^?]*/\([^?]*\).*|\1|p' || echo "postgres")
            
            if [ -z "$PROD_DB_NAME" ] || [ "$PROD_DB_NAME" = "$PROD_DB_CONNECTION" ]; then
                PROD_DB_NAME=$(echo "$PROD_DB_CONNECTION" | sed -n 's|.*/\([^?]*\)?.*|\1|p' || echo "postgres")
            fi
            
            if [ -n "$PROD_DB_HOST" ] && [ -n "$PROD_DB_NAME" ] && [ -n "$PROD_DB_USER" ] && [ -n "$PROD_DB_PASSWORD" ]; then
                PG_DUMP_CMD="pg_dump"
                if [ -f "/opt/homebrew/opt/postgresql@17/bin/pg_dump" ]; then
                    PG_DUMP_CMD="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
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
                    > "$TARGET_DIR/databases/traccems-prod-pgsql.sql" 2>&1; then
                    if [ -s "$TARGET_DIR/databases/traccems-prod-pgsql.sql" ]; then
                        PROD_BACKUP_SIZE=$(wc -l < "$TARGET_DIR/databases/traccems-prod-pgsql.sql")
                        PROD_BACKUP_FILE_SIZE=$(ls -lh "$TARGET_DIR/databases/traccems-prod-pgsql.sql" | awk '{print $5}')
                        echo "   ✅ Azure production database backed up: $PROD_BACKUP_FILE_SIZE ($PROD_BACKUP_SIZE lines)"
                    else
                        echo "   ❌ ERROR: Azure production database backup file is empty!"
                        rm -f "$TARGET_DIR/databases/traccems-prod-pgsql.sql"
                    fi
                else
                    echo "   ❌ ERROR: Azure production database backup failed!"
                fi
                unset PGPASSWORD
            fi
        else
            echo "   ⚠️ Azure production database connection string not found (skipping)"
        fi
    else
        echo "   ⚠️ pg_dump or Azure CLI not found - skipping Azure production database backup"
    fi
    
    # 6. Create restore script
    echo "   📝 Creating restore script..."
    cat > "$TARGET_DIR/restore-databases.sh" << 'RESTOREEOF'
#!/bin/bash
echo "🔄 Restoring TCC databases..."
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi
echo "📊 Dropping existing medport_ems database (if exists)..."
dropdb -h localhost -U scooper medport_ems 2>/dev/null || true
echo "📊 Creating fresh medport_ems database..."
createdb -h localhost -U scooper medport_ems
if [ -f "databases/medport_ems_local.sql" ]; then
    echo "📊 Restoring medport_ems database..."
    psql -h localhost -U scooper -d medport_ems < databases/medport_ems_local.sql
    echo "✅ Database restoration completed!"
else
    echo "⚠️ Local database backup file not found"
fi
RESTOREEOF
    chmod +x "$TARGET_DIR/restore-databases.sh"
    
    # 7. Create backup info file
    echo "   📝 Creating backup info file..."
    cat > "$TARGET_DIR/BACKUP_INFO.txt" << EOF
TCC Project Backup
==================
Backup Date: $(date)
Git Branch: $CURRENT_BRANCH
Git Commit: $(git rev-parse HEAD)
Git Status: $(git status --short | wc -l | xargs) uncommitted changes

Backup Contents:
- Project source code
- Environment files (.env*)
- Database backups (local and Azure)
- External documentation
- Restore scripts

Restore Instructions:
1. Copy project files to desired location
2. Run restore-databases.sh to restore local database
3. Restore .env files from backup
4. Run npm install in backend/ and frontend/
5. Start development servers

For complete restore instructions, see:
docs/reference/backup/BACKUP_STRATEGY.md
EOF
    
    # Calculate backup size
    BACKUP_SIZE=$(du -sh "$TARGET_DIR" | cut -f1)
    echo "   ✅ Backup complete: $BACKUP_SIZE"
}

# Perform backup to both locations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Location 1: External Drive (/Volumes/Acasis/)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "/Volumes/Acasis" ]; then
    backup_to_location "$ACASIS_BACKUP_DIR/$BACKUP_NAME" "External Drive"
else
    echo "❌ ERROR: External drive (/Volumes/Acasis/) not mounted!"
    echo "   Skipping external drive backup"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Location 2: iCloud Drive"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
backup_to_location "$ICLOUD_BACKUP_DIR/$BACKUP_NAME" "iCloud Drive"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Backup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Backup locations:"
echo "  1. External Drive: $ACASIS_BACKUP_DIR/$BACKUP_NAME"
echo "  2. iCloud Drive: $ICLOUD_BACKUP_DIR/$BACKUP_NAME"
echo ""
echo "Next steps:"
echo "  - Verify backups exist in both locations"
echo "  - Check backup sizes are reasonable"
echo "  - Review BACKUP_INFO.txt in each backup directory"
echo ""
