#!/bin/bash

# Stop TCC development servers (frontend + backend)
# Tries PID files first, then falls back to process/port cleanup

set -e

ROOT_DIR="/Users/scooper/Code/tcc-new-project"
cd "$ROOT_DIR"

echo "🛑 Stopping TCC Development Environment..."

BACKEND_PID_FILES=("backend-live.pid" "backend.pid")
FRONTEND_PID_FILES=("frontend-live.pid" "frontend.pid")

kill_pid_file() {
  local pid_file="$1"
  if [ -f "$pid_file" ]; then
    local pid
    pid=$(cat "$pid_file" 2>/dev/null || echo "")
    if [ -n "$pid" ] && ps -p "$pid" >/dev/null 2>&1; then
      echo "• Killing PID $(printf %s "$pid") from $(printf %s "$pid_file")"
      kill "$pid" 2>/dev/null || true
      sleep 1
      if ps -p "$pid" >/dev/null 2>&1; then
        echo "  ↳ Force killing PID $(printf %s "$pid")"
        kill -9 "$pid" 2>/dev/null || true
      fi
    fi
    rm -f "$pid_file" 2>/dev/null || true
  fi
}

echo "🔎 Using PID files if present..."
for f in "${BACKEND_PID_FILES[@]}"; do
  kill_pid_file "$f"
done
for f in "${FRONTEND_PID_FILES[@]}"; do
  kill_pid_file "$f"
done

echo "🧹 Cleaning known dev processes (safe to run multiple times)..."
# nodemon backend
pkill -f "nodemon" 2>/dev/null || true
pkill -f "ts-node src/index.ts" 2>/dev/null || true

# vite frontend
pkill -f "vite" 2>/dev/null || true

echo "🔌 Releasing dev ports (3000 frontend, 5001 backend)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

echo "🗑️  Removing stale PID files..."
rm -f backend-live.pid backend.pid frontend-live.pid frontend.pid 2>/dev/null || true

echo "✅ TCC dev services stopped"


