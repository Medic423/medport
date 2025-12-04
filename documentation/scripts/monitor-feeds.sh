#!/bin/bash

# TCC Feed Monitor
# Polls critical endpoints at a fixed interval and prints warnings on failures.
# Usage:
#   API_URL=https://api.example.com TCC_TOKEN=... INTERVAL=60 ./scripts/monitor-feeds.sh
# Defaults:
#   API_URL=http://localhost:5001
#   INTERVAL=60 seconds

API_URL=${API_URL:-http://localhost:5001}
TOKEN=${TCC_TOKEN:-}
INTERVAL=${INTERVAL:-60}

declare -a FEEDS=(
  "/health|no|Health"
  "/api/tcc/analytics/overview|yes|Analytics Overview"
  "/api/tcc/agencies|yes|Agencies"
  "/api/dropdown-options|yes|Dropdown Categories"
  "/api/tcc/hospitals|yes|Hospitals"
  "/api/ems/analytics/overview|yes|EMS Overview"
  "/api/ems/analytics/trips|yes|EMS Trips"
  "/api/ems/analytics/units|yes|EMS Units"
  "/api/ems/analytics/performance|yes|EMS Performance"
)

echo "🩺 TCC Feed Monitor starting"
echo "API_URL=$API_URL | interval=${INTERVAL}s"

while true; do
  echo "\n$(date '+%Y-%m-%d %H:%M:%S') — Checking feeds..."
  for entry in "${FEEDS[@]}"; do
    IFS='|' read -r path auth label <<< "$entry"
    url="$API_URL$path"
    if [ "$auth" = "yes" ] && [ -z "$TOKEN" ]; then
      echo "⚠️  $label ($path): auth required — set TCC_TOKEN"
      continue
    fi
    if [ "$auth" = "yes" ]; then
      code=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$url" || echo "000")
    else
      code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    fi
    if [ "$code" = "200" ]; then
      echo "✅ $label ($path): 200"
    else
      echo "❌ $label ($path): $code"
      # Simple audible bell if supported
      printf "\a" 2>/dev/null || true
    fi
  done
  sleep "$INTERVAL"
done


