#!/bin/bash

# Azure Toll-Free Verification URL Verification Script
# Verifies that all required URLs are accessible for toll-free verification application

echo "=========================================="
echo "Azure Toll-Free Verification URL Check"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs to check (name:url pairs)
URLS=(
    "Website:https://traccems.com"
    "Privacy Policy:https://traccems.com/privacy-policy"
    "Terms:https://traccems.com/terms"
)

# Track results
PASSED=0
FAILED=0
WARNINGS=0

echo "Checking URLs required for Azure toll-free verification..."
echo ""

# Check each URL
for URL_PAIR in "${URLS[@]}"; do
    NAME="${URL_PAIR%%:*}"
    URL="${URL_PAIR#*:}"
    echo -n "Checking $NAME ($URL)... "
    
    # Use curl to check HTTP status
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL" 2>/dev/null || echo "000")
    
    # Handle curl output that might have extra characters
    HTTP_CODE=$(echo "$HTTP_CODE" | tr -d '\n\r' | grep -o '[0-9]*' | head -1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE)"
        PASSED=$((PASSED + 1))
    elif [ "$HTTP_CODE" = "000" ] || [ -z "$HTTP_CODE" ]; then
        echo -e "${RED}✗ FAIL${NC} (Connection failed)"
        echo "  Error: Could not connect to $URL"
        echo "  Note: This could be a network issue or the site may be temporarily unavailable"
        FAILED=$((FAILED + 1))
    elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
        echo -e "${YELLOW}⚠ WARNING${NC} (HTTP $HTTP_CODE - Redirect)"
        echo "  Note: URL redirects, verify final destination is correct"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $HTTP_CODE)"
        echo "  Error: Unexpected HTTP status code"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
fi
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
fi
echo ""

# Additional checks
echo "Additional Checks:"
echo ""

# Check HTTPS (SSL)
echo -n "Checking SSL certificate for traccems.com... "
SSL_CHECK=$(echo | openssl s_client -connect traccems.com:443 -servername traccems.com 2>/dev/null | grep -c "Verify return code: 0" || echo "0")
if [ "$SSL_CHECK" -gt 0 ] 2>/dev/null; then
    echo -e "${GREEN}✓ Valid SSL${NC}"
else
    echo -e "${YELLOW}⚠ SSL check inconclusive${NC}"
fi

# Check DNS resolution
echo -n "Checking DNS resolution for traccems.com... "
DNS_RESULT=$(dig +short traccems.com 2>/dev/null | head -1)
if [ -n "$DNS_RESULT" ]; then
    echo -e "${GREEN}✓ Resolves${NC} ($DNS_RESULT)"
else
    echo -e "${RED}✗ DNS resolution failed${NC}"
fi

echo ""
echo "=========================================="

# Exit with appropriate code
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ URL verification FAILED${NC}"
    echo "Fix the failed URLs before submitting Azure application."
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ URL verification passed with warnings${NC}"
    echo "Review redirects before submitting Azure application."
    exit 0
else
    echo -e "${GREEN}✅ All URLs verified successfully${NC}"
    echo "Ready to submit Azure toll-free verification application."
    exit 0
fi
