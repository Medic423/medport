#!/bin/bash
echo "Starting MedPort development environment..."

# Kill any processes using port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

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
echo "Development servers started on ports 3000 (frontend) and 5000 (backend)"
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
