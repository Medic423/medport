#!/bin/bash
echo "Starting MedPort development environment..."

# Kill any processes using port 3002
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

# Start backend
cd backend
npm run dev &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Development servers started on ports 3002 (frontend) and 5001 (backend)"
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
