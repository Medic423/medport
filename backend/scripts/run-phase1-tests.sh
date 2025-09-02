#!/bin/bash

# Phase 1 Testing Script Runner
# Runs comprehensive tests for the database siloing implementation

echo "🧪 Phase 1 Testing - Database Siloing Implementation"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the backend directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed or not in PATH"
    exit 1
fi

# Check if PostgreSQL is running
print_status "Checking PostgreSQL status..."
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    print_error "PostgreSQL is not running on port 5432"
    print_warning "Please start PostgreSQL before running tests"
    exit 1
fi

# Check if databases exist
print_status "Checking database existence..."

# Check Hospital DB
if ! psql -h localhost -p 5432 -U $(whoami) -d medport_hospital -c "SELECT 1;" &> /dev/null; then
    print_error "Hospital database (medport_hospital) does not exist"
    print_warning "Please run setup-database-siloing.sh first"
    exit 1
fi

# Check EMS DB
if ! psql -h localhost -p 5432 -U $(whoami) -d medport_ems -c "SELECT 1;" &> /dev/null; then
    print_error "EMS database (medport_ems) does not exist"
    print_warning "Please run setup-database-siloing.sh first"
    exit 1
fi

# Check Center DB
if ! psql -h localhost -p 5432 -U $(whoami) -d medport_center -c "SELECT 1;" &> /dev/null; then
    print_error "Center database (medport_center) does not exist"
    print_warning "Please run setup-database-siloing.sh first"
    exit 1
fi

print_success "All databases are accessible"

# Check if TypeScript is compiled
print_status "Checking TypeScript compilation..."
if [ ! -d "dist" ]; then
    print_warning "TypeScript not compiled. Compiling now..."
    npm run build
    if [ $? -ne 0 ]; then
        print_error "TypeScript compilation failed"
        exit 1
    fi
fi

print_success "TypeScript compilation ready"

# Set environment variables
export HOSPITAL_DATABASE_URL="postgresql://$(whoami)@localhost:5432/medport_hospital"
export EMS_DATABASE_URL="postgresql://$(whoami)@localhost:5432/medport_ems"
export CENTER_DATABASE_URL="postgresql://$(whoami)@localhost:5432/medport_center"
export JWT_SECRET="test-secret-key"

print_status "Environment variables set"

# Run the test script
print_status "Running Phase 1 tests..."
echo ""

node scripts/test-phase1-implementation.js

# Check test results
if [ $? -eq 0 ]; then
    echo ""
    print_success "Phase 1 tests completed successfully!"
    print_success "Database siloing implementation is ready for Phase 2"
else
    echo ""
    print_error "Phase 1 tests failed!"
    print_warning "Please review the test results and fix any issues"
    exit 1
fi

echo ""
echo "=================================================="
print_status "Phase 1 Testing Complete"
echo "=================================================="

