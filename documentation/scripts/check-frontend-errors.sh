#!/bin/bash

# Frontend Error Checker Script
# Automatically detects common frontend errors like undefined properties

echo "🔍 Frontend Error Checker - TCC Production"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check for undefined property access patterns
check_undefined_properties() {
    echo -e "\n${YELLOW}Checking for undefined property access patterns...${NC}"
    
    local errors_found=0
    
    # Check for direct property access without optional chaining
    echo "🔍 Checking for direct property access (e.g., obj.property instead of obj?.property)..."
    
    # Find patterns like .BLS, .ALS, .CCT, .LOW, .MEDIUM, .HIGH, .URGENT without optional chaining
    local direct_access=$(find frontend/src/components -name "*.tsx" -o -name "*.ts" | xargs grep -n -E "\.(BLS|ALS|CCT|LOW|MEDIUM|HIGH|URGENT)([^?]|$)" | grep -v "?\.\w" | grep -v "||" | grep -v "//" | head -20)
    
    if [ -n "$direct_access" ]; then
        echo -e "${RED}❌ Found direct property access without optional chaining:${NC}"
        echo "$direct_access"
        errors_found=$((errors_found + 1))
    else
        echo -e "${GREEN}✅ No direct property access issues found${NC}"
    fi
    
    # Check for common undefined patterns
    echo -e "\n🔍 Checking for common undefined property patterns..."
    
    local undefined_patterns=$(find frontend/src/components -name "*.tsx" -o -name "*.ts" | xargs grep -n -E "(tripsByLevel|tripsByPriority|tripsByType)\.[A-Z]+" | grep -v "?\.\w" | grep -v "||" | grep -v "//" | head -10)
    
    if [ -n "$undefined_patterns" ]; then
        echo -e "${RED}❌ Found potential undefined property access:${NC}"
        echo "$undefined_patterns"
        errors_found=$((errors_found + 1))
    else
        echo -e "${GREEN}✅ No undefined property patterns found${NC}"
    fi
    
    return $errors_found
}

# Function to check for missing API endpoints
check_api_endpoints() {
    echo -e "\n${YELLOW}Checking for API endpoint consistency...${NC}"
    
    local errors_found=0
    
    # Check if frontend API calls match backend endpoints
    echo "🔍 Checking frontend API calls against backend endpoints..."
    
    # Extract API calls from frontend
    local frontend_apis=$(find frontend/src/components -name "*.tsx" -o -name "*.ts" | xargs grep -o -E "/api/[a-zA-Z0-9/_-]+" | sort -u)
    
    # Extract endpoints from backend
    local backend_endpoints=$(grep -o -E "'/api/[a-zA-Z0-9/_-]+'" vercel-api/api/index.js | tr -d "'" | sort -u)
    
    echo "Frontend API calls:"
    echo "$frontend_apis" | head -10
    echo ""
    echo "Backend endpoints:"
    echo "$backend_endpoints" | head -10
    
    # Check for missing endpoints (basic check)
    local missing_endpoints=0
    while IFS= read -r api_call; do
        if ! echo "$backend_endpoints" | grep -q "^$api_call$"; then
            echo -e "${RED}❌ Missing backend endpoint: $api_call${NC}"
            missing_endpoints=$((missing_endpoints + 1))
        fi
    done <<< "$frontend_apis"
    
    if [ $missing_endpoints -eq 0 ]; then
        echo -e "${GREEN}✅ All frontend API calls have corresponding backend endpoints${NC}"
    else
        errors_found=$((errors_found + missing_endpoints))
    fi
    
    return $errors_found
}

# Function to check for hardcoded URLs
check_hardcoded_urls() {
    echo -e "\n${YELLOW}Checking for hardcoded URLs...${NC}"
    
    local errors_found=0
    
    # Check for hardcoded URLs in frontend components
    local hardcoded_urls=$(find frontend/src/components -name "*.tsx" -o -name "*.ts" | xargs grep -n -E "https?://[a-zA-Z0-9.-]+" | grep -v "localhost" | grep -v "//" | head -10)
    
    if [ -n "$hardcoded_urls" ]; then
        echo -e "${RED}❌ Found hardcoded URLs:${NC}"
        echo "$hardcoded_urls"
        errors_found=$((errors_found + 1))
    else
        echo -e "${GREEN}✅ No hardcoded URLs found${NC}"
    fi
    
    return $errors_found
}

# Function to check for direct fetch calls
check_direct_fetch() {
    echo -e "\n${YELLOW}Checking for direct fetch calls...${NC}"
    
    local errors_found=0
    
    # Check for direct fetch calls instead of using API instance
    local direct_fetch=$(find frontend/src/components -name "*.tsx" -o -name "*.ts" | xargs grep -n -E "fetch\(" | grep -v "api\." | grep -v "//" | head -10)
    
    if [ -n "$direct_fetch" ]; then
        echo -e "${RED}❌ Found direct fetch calls (should use API instance):${NC}"
        echo "$direct_fetch"
        errors_found=$((errors_found + 1))
    else
        echo -e "${GREEN}✅ No direct fetch calls found${NC}"
    fi
    
    return $errors_found
}

# Function to generate error report
generate_report() {
    local total_errors=$1
    
    echo -e "\n${YELLOW}📊 ERROR CHECK REPORT${NC}"
    echo "==================="
    
    if [ $total_errors -eq 0 ]; then
        echo -e "${GREEN}🎉 EXCELLENT! No errors found!${NC}"
        echo -e "${GREEN}✅ Your frontend code follows best practices${NC}"
    else
        echo -e "${RED}❌ Found $total_errors potential issues${NC}"
        echo -e "${YELLOW}💡 Recommendations:${NC}"
        echo "  1. Use optional chaining (?.) for property access"
        echo "  2. Add fallback values (|| 0) for undefined properties"
        echo "  3. Use API instance instead of direct fetch calls"
        echo "  4. Avoid hardcoded URLs"
        echo "  5. Ensure backend endpoints match frontend API calls"
    fi
    
    echo -e "\n${YELLOW}🔧 Quick Fix Commands:${NC}"
    echo "  # Fix undefined properties:"
    echo "  find frontend/src/components -name '*.tsx' -exec sed -i 's/\\.BLS/\?.BLS || 0/g' {} \\;"
    echo "  # Check specific component:"
    echo "  grep -n 'tripsByLevel' frontend/src/components/Analytics.tsx"
}

# Main execution
main() {
    local total_errors=0
    
    echo "Starting comprehensive frontend error check..."
    echo "Checking directory: $(pwd)"
    
    # Run all checks
    check_undefined_properties
    total_errors=$((total_errors + $?))
    
    check_api_endpoints
    total_errors=$((total_errors + $?))
    
    check_hardcoded_urls
    total_errors=$((total_errors + $?))
    
    check_direct_fetch
    total_errors=$((total_errors + $?))
    
    # Generate final report
    generate_report $total_errors
    
    echo -e "\n${YELLOW}🕒 Check completed at: $(date)${NC}"
    
    # Exit with error code if issues found
    if [ $total_errors -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# Run the main function
main "$@"
