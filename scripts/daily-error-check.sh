#!/bin/bash

# Daily Error Check Script
# Run this script daily to catch frontend errors before they reach production

echo "🔍 Daily Frontend Error Check - $(date)"
echo "======================================"

# Change to project directory
cd "$(dirname "$0")/.."

# Run the error checker
./scripts/check-frontend-errors.sh

# Store result
ERROR_COUNT=$?

# Log results
if [ $ERROR_COUNT -eq 0 ]; then
    echo "✅ Daily check passed - No errors found"
    # Optional: Send success notification
    # curl -X POST "https://hooks.slack.com/..." -d "✅ TCC Frontend: No errors detected"
else
    echo "❌ Daily check failed - $ERROR_COUNT issues found"
    # Optional: Send alert notification
    # curl -X POST "https://hooks.slack.com/..." -d "❌ TCC Frontend: $ERROR_COUNT errors detected"
fi

# Create daily report
REPORT_FILE="reports/daily-error-check-$(date +%Y%m%d).txt"
mkdir -p reports
echo "Daily Frontend Error Check Report" > "$REPORT_FILE"
echo "Date: $(date)" >> "$REPORT_FILE"
echo "Errors Found: $ERROR_COUNT" >> "$REPORT_FILE"
echo "Status: $([ $ERROR_COUNT -eq 0 ] && echo "PASS" || echo "FAIL")" >> "$REPORT_FILE"

echo "📊 Report saved to: $REPORT_FILE"

exit $ERROR_COUNT
