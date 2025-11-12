#!/bin/bash

# Complete Dev Startup Wrapper for TCC
# Use this script for consistent local restarts per project workflow

set -e

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
START_SCRIPT="$ROOT_DIR/start-dev.sh"
HEALTH_URL="http://localhost:5001/health"
API_BASE="http://localhost:5001"

echo "🚀 TCC Complete Dev Startup"
echo "==========================="

# Check for start-dev.sh in root first, then fallback to documentation
if [ ! -x "$START_SCRIPT" ]; then
  # Try documentation location as fallback
  DOC_START_SCRIPT="$ROOT_DIR/documentation/start-dev.sh"
  if [ -x "$DOC_START_SCRIPT" ]; then
    START_SCRIPT="$DOC_START_SCRIPT"
    echo "⚠️  Using start-dev.sh from documentation folder"
  else
    echo "❌ start-dev.sh not found at:"
    echo "   $START_SCRIPT"
    echo "   or $DOC_START_SCRIPT"
    exit 1
  fi
fi

echo "▶️  Launching start-dev.sh..."
"$START_SCRIPT" &
START_PID=$!

echo "⏳ Waiting for backend health..."
attempts=0
max_attempts=30
while [ $attempts -lt $max_attempts ]; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")
  if [ "$code" = "200" ]; then
    echo "✅ Backend healthy at $HEALTH_URL"
    break
  fi
  attempts=$((attempts+1))
  sleep 2
done

if [ "$code" != "200" ]; then
  echo "❌ Backend did not become healthy in time"
  exit 1
fi

echo "🔎 Running feed health checks..."

# Critical feed endpoints (path|auth)
FEEDS=(
  "/health|no"
  "/api/tcc/analytics/overview|yes"
  "/api/tcc/agencies|yes"
  "/api/dropdown-options|yes"
  "/api/tcc/hospitals|yes"
  "/api/ems/analytics/overview|yes"
  "/api/ems/analytics/trips|yes"
  "/api/ems/analytics/units|yes"
  "/api/ems/analytics/performance|yes"
)

TOKEN="${TCC_TOKEN:-}"

failed=0
for entry in "${FEEDS[@]}"; do
  IFS='|' read -r path needs_auth <<< "$entry"
  url="$API_BASE$path"
  if [ "$needs_auth" = "yes" ] && [ -z "$TOKEN" ]; then
    echo "⚠️  $path requires auth (set TCC_TOKEN to validate)"
    continue
  fi
  if [ "$needs_auth" = "yes" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$url" || echo "000")
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
  fi
  if [ "$status" = "200" ]; then
    echo "✅ $path -> 200"
  else
    echo "❌ $path -> $status"
    failed=1
  fi
done

if [ $failed -ne 0 ]; then
  echo "⚠️  One or more feeds are unhealthy. See results above."
fi

echo ""
echo "🔍 Running critical trip creation smoke test..."
if [ -x "$ROOT_DIR/scripts/check-trip-creation.sh" ]; then
  if "$ROOT_DIR/scripts/check-trip-creation.sh"; then
    echo ""
  else
    echo ""
    echo "⚠️  Trip creation smoke test failed! This is critical."
    echo "⚠️  Trip creation may not work. Investigate before proceeding."
  fi
else
  echo "⚠️  Trip creation smoke test script not found or not executable"
fi

echo "🌐 Frontend expected at http://localhost:3000"
echo "🔧 Backend at http://localhost:5001"
echo "📊 Health: $HEALTH_URL"
echo "✅ Development servers are running in the background (PID: $START_PID)"
echo "📝 Tip: To stop them: kill $START_PID"
echo "🗒️  Logs: backend-live.log, frontend-live.log (project root)"
exit 0


