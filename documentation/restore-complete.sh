#!/bin/bash

# TCC Complete Restore Script
# Restores project and databases from backup

echo "🔄 Starting TCC complete restoration..."

# 1. Restore project files
echo "📦 Restoring project files..."
if [ -d "project" ]; then
    cp -r project/* /Users/scooper/Code/tcc-new-project/
    echo "✅ Project files restored"
else
    echo "❌ Project directory not found"
    exit 1
fi

# 2. Install dependencies
echo "📦 Installing dependencies..."
cd /Users/scooper/Code/tcc-new-project
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Restore databases
echo "🗄️ Restoring databases..."
./restore-databases.sh

# 4. Generate Prisma clients
echo "🔧 Generating Prisma clients..."
cd backend
npx prisma generate
cd ..

echo "✅ Complete restoration finished!"
echo "🚀 You can now run: npm run dev"
