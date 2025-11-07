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

# Create databases if they don't exist
echo "📊 Creating databases..."
createdb -h localhost -U scooper medport_center 2>/dev/null || true
createdb -h localhost -U scooper medport_hospital 2>/dev/null || true
createdb -h localhost -U scooper medport_ems 2>/dev/null || true

# Restore databases
echo "📊 Restoring medport_center database..."
psql -h localhost -U scooper -d medport_center < databases/medport_center.sql

echo "📊 Restoring medport_hospital database..."
psql -h localhost -U scooper -d medport_hospital < databases/medport_hospital.sql

echo "📊 Restoring medport_ems database..."
psql -h localhost -U scooper -d medport_ems < databases/medport_ems.sql

echo "✅ Database restoration completed!"
