#!/bin/bash

echo "Setting up MedPort development database..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Create database if it doesn't exist
echo "Creating database 'medport_dev' if it doesn't exist..."
createdb -U postgres medport_dev 2>/dev/null || echo "Database 'medport_dev' already exists."

# Run Prisma migrations
echo "Running Prisma migrations..."
cd "$(dirname "$0")/.."
npx prisma migrate dev --name init

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Seed database with test data (optional)
echo "Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy env.example to .env and configure your database URL"
echo "2. Update other environment variables as needed"
echo "3. Run 'npm run dev' to start the development server"
