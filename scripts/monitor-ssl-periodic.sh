#!/bin/bash

# Periodic SSL Certificate Status Monitor
# Runs SSL status check every N minutes until certificate is ready

set -e

INTERVAL_MINUTES=${1:-15}  # Default: check every 15 minutes
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECK_SCRIPT="$SCRIPT_DIR/check-ssl-status.sh"

echo "=========================================="
echo "Periodic SSL Certificate Monitor"
echo "Checking every $INTERVAL_MINUTES minutes"
echo "Press Ctrl+C to stop"
echo "=========================================="
echo ""

# Check if check script exists
if [ ! -f "$CHECK_SCRIPT" ]; then
  echo "❌ Error: SSL check script not found at: $CHECK_SCRIPT"
  exit 1
fi

# Make sure check script is executable
chmod +x "$CHECK_SCRIPT"

# Counter
CHECK_COUNT=0

# Function to run check
run_check() {
  CHECK_COUNT=$((CHECK_COUNT + 1))
  echo ""
  echo "--- Check #$CHECK_COUNT ---"
  "$CHECK_SCRIPT"
  return $?
}

# Run initial check
run_check
LAST_EXIT_CODE=$?

# If SSL is ready, exit
if [ $LAST_EXIT_CODE -eq 0 ]; then
  echo ""
  echo "✅ SSL certificate is ready! Monitoring complete."
  exit 0
fi

# Continue monitoring
echo ""
echo "Starting periodic monitoring (every $INTERVAL_MINUTES minutes)..."
echo "Next check in $INTERVAL_MINUTES minutes..."
echo ""

while true; do
  sleep $((INTERVAL_MINUTES * 60))
  
  run_check
  LAST_EXIT_CODE=$?
  
  # If SSL is ready, exit
  if [ $LAST_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ SSL certificate is ready! Monitoring complete."
    exit 0
  fi
  
  echo ""
  echo "Next check in $INTERVAL_MINUTES minutes..."
  echo ""
done

