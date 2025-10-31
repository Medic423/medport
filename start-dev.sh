#!/bin/bash

# TCC Development Server Startup Script
# Standardized ports: Frontend=3000, Backend=5001
# Enhanced with process conflict prevention

echo "🚀 Starting TCC Development Environment..."
echo "📋 Standardized Ports:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001"
echo ""

# Enhanced process cleanup
echo "🧹 Cleaning up existing processes..."
echo "  - Killing nodemon processes..."
pkill -f nodemon 2>/dev/null || true
echo "  - Killing ts-node processes..."
pkill -f "ts-node src/index.ts" 2>/dev/null || true
echo "  - Killing processes on ports 3000 and 5001..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

# Wait for ports to be released
echo "⏳ Waiting for ports to be released..."
sleep 3

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
cd backend
npm run dev &
BACKEND_PID=$!
# Write backend PID file at project root
echo "$BACKEND_PID" > ../backend-live.pid 2>/dev/null || true

# Wait for backend to start and verify health
echo "⏳ Waiting for backend to start..."
sleep 5

# Health check
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "✅ Backend server is healthy"
else
    echo "❌ Backend server failed to start properly"
    echo "   Check backend logs for errors"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start frontend
echo "🎨 Starting Frontend Server (Port 3000)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
# Write frontend PID file at project root
echo "$FRONTEND_PID" > ../frontend-live.pid 2>/dev/null || true

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
