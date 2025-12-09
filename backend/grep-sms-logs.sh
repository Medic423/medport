#!/bin/bash
# Grep command to filter SMS-related logs from backend terminal output
# Usage: Run this script or pipe backend logs through it

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "📱 SMS LOG FILTER"
echo "=========================================="
echo ""
echo "Filtering for SMS-related messages..."
echo ""

# If a file is provided as argument, grep that file
# Otherwise, this is meant to be piped into
if [ -n "$1" ]; then
    INPUT="$1"
else
    INPUT="-"
fi

# Main grep pattern - looks for SMS, notification, radius, and trigger-related messages
grep -E --color=always \
    -i "SMS|notification|radius|trigger|azure.*sms|trip.*sms|sms.*service|📱|🌐.*POST.*trips" \
    "$INPUT" | \
    sed -E \
    -e "s/(SMS|sms)/${GREEN}\1${NC}/g" \
    -e "s/(notification|radius|trigger)/${YELLOW}\1${NC}/g" \
    -e "s/(✅|ENABLED|SET)/${GREEN}\1${NC}/g" \
    -e "s/(❌|DISABLED|NOT SET|Error|error)/${RED}\1${NC}/g" \
    -e "s/(📱|🌐|🚨|TCC_DEBUG)/${BLUE}\1${NC}/g"

