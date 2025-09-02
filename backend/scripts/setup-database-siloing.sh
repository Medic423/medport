#!/bin/bash

# Database Siloing Setup Script
# Sets up three separate PostgreSQL instances for MedPort

echo "🗄️ Setting up MedPort Database Siloing Architecture..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
HOSPITAL_DB="medport_hospital"
EMS_DB="medport_ems"
CENTER_DB="medport_center"
POSTGRES_USER=$(whoami)
POSTGRES_PASSWORD=""

# Ports (using same port with different databases for development)
HOSPITAL_PORT=5432
EMS_PORT=5432
CENTER_PORT=5432

echo -e "${BLUE}📋 Database Configuration:${NC}"
echo "  Hospital DB: $HOSPITAL_DB (Port $HOSPITAL_PORT)"
echo "  EMS DB: $EMS_DB (Port $EMS_PORT)"
echo "  Center DB: $CENTER_DB (Port $CENTER_PORT)"
echo ""

# Function to check if PostgreSQL is running
check_postgres() {
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}❌ PostgreSQL is not installed or not in PATH${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ PostgreSQL is available${NC}"
}

# Function to create database
create_database() {
    local db_name=$1
    local port=$2
    
    echo -e "${YELLOW}🔧 Creating database: $db_name on port $port${NC}"
    
    # Create database if it doesn't exist
    psql -h localhost -p $port -U $POSTGRES_USER -d postgres -c "CREATE DATABASE $db_name;" 2>/dev/null || echo "Database $db_name may already exist"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database $db_name created successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Database $db_name may already exist or there was an issue${NC}"
    fi
}

# Function to run Prisma migrations
run_migrations() {
    local schema_file=$1
    local db_name=$2
    local port=$3
    
    echo -e "${YELLOW}🔄 Running migrations for $db_name...${NC}"
    
    # Generate Prisma client
    npx prisma generate --schema=$schema_file
    
    # Run migrations
    npx prisma db push --schema=$schema_file
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migrations completed for $db_name${NC}"
    else
        echo -e "${RED}❌ Migration failed for $db_name${NC}"
        exit 1
    fi
}

# Main setup process
main() {
    echo -e "${BLUE}🚀 Starting database siloing setup...${NC}"
    
    # Check PostgreSQL
    check_postgres
    
    # Create databases
    echo -e "${BLUE}📦 Creating databases...${NC}"
    create_database $HOSPITAL_DB $HOSPITAL_PORT
    create_database $EMS_DB $EMS_PORT
    create_database $CENTER_DB $CENTER_PORT
    
    # Set environment variables for migrations
export HOSPITAL_DATABASE_URL="postgresql://$POSTGRES_USER@localhost:$HOSPITAL_PORT/$HOSPITAL_DB"
export EMS_DATABASE_URL="postgresql://$POSTGRES_USER@localhost:$EMS_PORT/$EMS_DB"
export CENTER_DATABASE_URL="postgresql://$POSTGRES_USER@localhost:$CENTER_PORT/$CENTER_DB"

# Run migrations
echo -e "${BLUE}🔄 Running database migrations...${NC}"
run_migrations "prisma/schema-hospital.prisma" $HOSPITAL_DB $HOSPITAL_PORT
run_migrations "prisma/schema-ems.prisma" $EMS_DB $EMS_PORT
run_migrations "prisma/schema-center.prisma" $CENTER_DB $CENTER_PORT
    
    # Create environment file
    echo -e "${BLUE}📝 Creating environment configuration...${NC}"
    cat > .env.database-siloing << EOF
# Database Siloing Configuration
# Three separate PostgreSQL instances for fault isolation

# Hospital Database (Port 5432) - Contains all trips, hospital users, facilities
HOSPITAL_DATABASE_URL="postgresql://$POSTGRES_USER@localhost:$HOSPITAL_PORT/$HOSPITAL_DB"

# EMS Database (Port 5433) - Contains EMS agencies, units, bids, routes  
EMS_DATABASE_URL="postgresql://$POSTGRES_USER@localhost:$EMS_PORT/$EMS_DB"

# Center Database (Port 5434) - Contains ALL user accounts, system config, analytics
CENTER_DATABASE_URL="postgresql://$POSTGRES_USER@localhost:$CENTER_PORT/$CENTER_DB"

# Legacy database URL (for migration purposes)
DATABASE_URL="postgresql://$POSTGRES_USER@localhost:$HOSPITAL_PORT/medport"

# Cross-database communication settings
ENABLE_CROSS_DB_LOGGING=true
CROSS_DB_TIMEOUT=30000

# JWT Secret for testing
JWT_SECRET="test-secret-key-for-database-siloing"
EOF
    
    echo -e "${GREEN}✅ Environment configuration created: .env.database-siloing${NC}"
    
    # Health check
    echo -e "${BLUE}🏥 Running health checks...${NC}"
    
    # Test Hospital DB
    psql -h localhost -p $HOSPITAL_PORT -U $POSTGRES_USER -d $HOSPITAL_DB -c "SELECT 1;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Hospital DB health check passed${NC}"
    else
        echo -e "${RED}❌ Hospital DB health check failed${NC}"
    fi
    
    # Test EMS DB
    psql -h localhost -p $EMS_PORT -U $POSTGRES_USER -d $EMS_DB -c "SELECT 1;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ EMS DB health check passed${NC}"
    else
        echo -e "${RED}❌ EMS DB health check failed${NC}"
    fi
    
    # Test Center DB
    psql -h localhost -p $CENTER_PORT -U $POSTGRES_USER -d $CENTER_DB -c "SELECT 1;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Center DB health check passed${NC}"
    else
        echo -e "${RED}❌ Center DB health check failed${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Database siloing setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "  1. Copy .env.database-siloing to .env (or merge with existing .env)"
    echo "  2. Update your application to use DatabaseManager"
    echo "  3. Run data migration script to move existing data"
    echo "  4. Test cross-database functionality"
    echo ""
    echo -e "${YELLOW}⚠️  Note: Make sure PostgreSQL is running on ports $HOSPITAL_PORT, $EMS_PORT, and $CENTER_PORT${NC}"
}

# Run main function
main "$@"

