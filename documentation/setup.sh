#!/bin/bash

echo "🚀 Setting up TCC - Transport Control Center"
echo "============================================="

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create databases
echo "📊 Creating databases..."

# Hospital Database
echo "Creating Hospital database..."
psql -c "CREATE DATABASE tcc_hospital;" 2>/dev/null || echo "Hospital database already exists"

# EMS Database  
echo "Creating EMS database..."
psql -c "CREATE DATABASE tcc_ems;" 2>/dev/null || echo "EMS database already exists"

# Center Database
echo "Creating Center database..."
psql -c "CREATE DATABASE tcc_center;" 2>/dev/null || echo "Center database already exists"

echo "✅ Databases created"

# Set up environment
echo "🔧 Setting up environment..."
cd backend
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  Please edit backend/.env with your database credentials"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma clients
echo "🔨 Generating Prisma clients..."
npm run db:generate

# Push database schemas
echo "🗄️ Setting up database schemas..."
npm run db:push

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your database credentials"
echo "2. Start the backend: cd backend && npm run dev"
echo "3. Start the frontend: cd frontend && npm run dev"
echo "4. Open http://localhost:3000"
echo ""
echo "🔐 Default login: admin@tcc.com / admin123"
