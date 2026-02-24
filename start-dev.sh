#!/bin/bash

# TCC Development Server Startup Script
# Standardized ports: Frontend=3000, Backend=5001
# Enhanced with process conflict prevention and environment validation

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_ENV="$ROOT_DIR/backend/.env"
BACKEND_ENV_LOCAL="$ROOT_DIR/backend/.env.local"
BACKUP_DIR="/Volumes/Acasis/tcc-backups"

echo "🚀 Starting TCC Development Environment..."
echo "📋 Standardized Ports:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001"
echo ""

# Validate backend .env file exists
echo "🔍 Validating environment configuration..."
if [ ! -f "$BACKEND_ENV" ] && [ ! -f "$BACKEND_ENV_LOCAL" ]; then
    echo "❌ ERROR: Backend environment file not found!"
    echo "   Expected: $BACKEND_ENV or $BACKEND_ENV_LOCAL"
    echo ""
    echo "💡 Solution: Restore .env file from backup"
    
    # Find latest backup
    LATEST_BACKUP=$(ls -td "$BACKUP_DIR"/tcc-backup-* 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ] && [ -f "$LATEST_BACKUP/project/backend/.env" ]; then
        echo ""
        echo "📦 Found backup: $(basename "$LATEST_BACKUP")"
        echo "   To restore, run:"
        echo "   cp \"$LATEST_BACKUP/project/backend/.env\" \"$BACKEND_ENV\""
        echo ""
        read -p "   Restore from backup now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp "$LATEST_BACKUP/project/backend/.env" "$BACKEND_ENV"
            echo "✅ Restored .env from backup"
        else
            echo "❌ Cannot start backend without DATABASE_URL"
            exit 1
        fi
    else
        echo ""
        echo "⚠️  No backup found at $BACKUP_DIR"
        echo "   Please create backend/.env with DATABASE_URL"
        exit 1
    fi
fi

# Validate DATABASE_URL exists in .env file
ENV_FILE="$BACKEND_ENV"
if [ ! -f "$ENV_FILE" ]; then
    ENV_FILE="$BACKEND_ENV_LOCAL"
fi

if ! grep -q "DATABASE_URL" "$ENV_FILE" 2>/dev/null; then
    echo "❌ ERROR: DATABASE_URL not found in $ENV_FILE"
    echo "   Backend requires DATABASE_URL to initialize Prisma client"
    echo ""
    echo "💡 Solution: Add DATABASE_URL to $ENV_FILE"
    exit 1
fi

echo "✅ Environment configuration validated"
echo ""

# Enhanced process cleanup
echo "🧹 Cleaning up existing processes..."
echo "  - Killing nodemon processes..."
pkill -f nodemon 2>/dev/null || true
echo "  - Killing ts-node processes..."
pkill -f "ts-node src/index.ts" 2>/dev/null || true
echo "  - Killing vite processes..."
pkill -f "vite" 2>/dev/null || true
echo "  - Killing processes on ports 3000, 3001, and 5001..."
for port in 3000 3001 5001; do
  lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null || true
done

# Wait for ports to be released (retry loop - processes need time to shut down)
echo "⏳ Waiting for ports to be released..."
PORT_WAIT=0
MAX_PORT_WAIT=15
while [ $PORT_WAIT -lt $MAX_PORT_WAIT ]; do
  if ! lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1 && \
     ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    break
  fi
  sleep 2
  PORT_WAIT=$((PORT_WAIT + 2))
done

# Verify ports are free
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Port 5001 is still in use. Please check for remaining processes."
    echo "   Run: lsof -i :5001"
    exit 1
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Port 3000 is still in use. Please check for remaining processes."
    echo "   Run: lsof -i :3000"
    exit 1
fi

# Start backend with enhanced process management
echo "🔧 Starting Backend Server (Port 5001)..."
cd "$ROOT_DIR/backend"
npm run dev &
BACKEND_PID=$!
# Write backend PID file at project root
echo "$BACKEND_PID" > "$ROOT_DIR/backend-live.pid" 2>/dev/null || true

# Wait for backend to start and verify health
echo "⏳ Waiting for backend to start..."
sleep 5

# Health check with retries
MAX_RETRIES=6
RETRY_COUNT=0
BACKEND_HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:5001/health > /dev/null 2>&1; then
        BACKEND_HEALTHY=true
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 2
done

if [ "$BACKEND_HEALTHY" = true ]; then
    echo "✅ Backend server is healthy"
else
    echo "❌ Backend server failed to start properly"
    echo "   Check backend logs for errors"
    echo "   Common issues:"
    echo "   - DATABASE_URL not set or incorrect"
    echo "   - Database server not running"
    echo "   - Port 5001 already in use"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start frontend
echo "🎨 Starting Frontend Server (Port 3000)..."
cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
# Write frontend PID file at project root
echo "$FRONTEND_PID" > "$ROOT_DIR/frontend-live.pid" 2>/dev/null || true

# Wait for frontend to start
sleep 3

echo ""
echo "✅ Development servers started successfully!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5001"
echo "📊 Health Check: http://localhost:5001/health"
echo ""
echo "💡 Tips:"
echo "   - Use 'npm run dev:health' to check server status"
echo "   - Use 'npm run dev:clean' for clean restart"
echo "   - Use 'npm run dev:safe' for health check + clean restart"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ Servers stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for user interrupt
wait
