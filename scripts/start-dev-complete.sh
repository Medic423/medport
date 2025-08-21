#!/bin/bash
echo "Starting MedPort development environment..."

# Kill any processes using our target ports
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

# Start backend on port 5001
cd backend
PORT=5001 npm run dev &
BACKEND_PID=$!

# Start frontend on port 3002
cd ../frontend
PORT=3002 npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID (Port 5001)"
echo "Frontend PID: $FRONTEND_PID (Port 3002)"
echo "Development servers started on ports 3002 (frontend) and 5001 (backend)"
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
