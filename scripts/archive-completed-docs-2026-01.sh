#!/usr/bin/env bash
set -euo pipefail

# Archive Completed Documents from January 2026 Sessions
# Moves completed/fixed/resolved documents to archive
# Usage: ./scripts/archive-completed-docs-2026-01.sh [--dry-run]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

ACTIVE_DIR="${PROJECT_ROOT}/docs/active/sessions/2026-01"
ARCHIVE_DIR="${PROJECT_ROOT}/docs/archive/2026-01"

DRY_RUN="${1:-}"

# Create archive directory if it doesn't exist
mkdir -p "${ARCHIVE_DIR}"

echo "📚 Archiving Completed Documents - January 2026"
echo "=============================================="
echo "Active Directory: ${ACTIVE_DIR}"
echo "Archive Directory: ${ARCHIVE_DIR}"
if [ "$DRY_RUN" == "--dry-run" ]; then
    echo "Mode: DRY RUN (no files will be moved)"
else
    echo "Mode: LIVE (files will be moved)"
fi
echo ""

# Completion status patterns (case-insensitive)
COMPLETED_PATTERNS=(
    "✅.*COMPLETE"
    "✅.*COMPLETED"
    "✅.*FIXED"
    "✅.*RESOLVED"
    "✅.*VERIFIED"
    "✅.*WORKING"
    "Status.*✅.*COMPLETE"
    "Status.*✅.*COMPLETED"
    "Status.*✅.*FIXED"
    "Status.*✅.*RESOLVED"
    "Status.*✅.*VERIFIED"
    "Status.*✅.*WORKING"
    "Status.*FIXED AND VERIFIED"
    "Status.*DEPLOYMENT COMPLETE"
    "Status.*SUCCESS"
    "Status.*PASSED"
    "FIXED AND VERIFIED"
    "DEPLOYMENT COMPLETE"
    "READY FOR PRODUCTION"
    "BACKEND RUNNING"
)

# Files to always keep in active (reference/ongoing work)
KEEP_IN_ACTIVE=(
    "checklist_20260109_dev_comparison.md"
    "DEPLOYMENT_PROCESS.md"
    "ems-module-testing-plan.md"
    "STATUS_CHECK_20260109.md"
    "NEW_CHAT_PROMPT.md"
    "NEW_CHAT_PROMPT.txt"
    "BACKEND_DEPLOYMENT_FAILURE_ANALYSIS.md"
    "FIX_NODE_MODULES_EXTRACTION.md"
    "dev-swa-deployment-plan.md"
    "dev-swa-testing-checklist.md"
    "production-testing-checklist.md"
    "deployment-verification-checklist.md"
    "cors-503-error-analysis.md"
    "cors-fix-testing.md"
    "cors-fix-v2-deployment.md"
    "cors-options-fix.md"
    "database-alignment-analysis.md"
    "deployment-monitoring-20260110.md"
    "deployment-troubleshooting.md"
    "dev-swa-backend-restart-instructions.md"
    "dev-swa-crash-investigation-steps.md"
    "dev-swa-database-schema-check.md"
    "dev-swa-restart-in-progress.md"
    "dev-swa-deployment-verification.md"
    "ems-sms-notifications-deployment.md"
    "ems-trips-query-fix.md"
    "fix-healthcare-destinations-naming.md"
    "fix-orphaned-ems-agency-instructions.md"
    "git-workflow-clarification.md"
    "gps-testing-checklist.md"
    "gps-testing-quick-reference.md"
    "local-dev-alignment-confirmation.md"
    "local-dev-available-agencies-fix-plan.md"
    "login-timeout-investigation.md"
    "pgadmin-password-troubleshooting.md"
    "phase1-execution-plan.md"
    "phase1-risk-assessment.md"
    "plan_for_20260105.md"
    "production-backup-instructions.md"
    "production-deployment-conflict-20260104.md"
)

# Files to archive (completed work)
FILES_TO_ARCHIVE=()

# Check each markdown file
for file in "${ACTIVE_DIR}"/*.md; do
    [ -f "$file" ] || continue
    
    filename=$(basename "$file")
    
    # Skip files we want to keep active
    skip=false
    for keep_file in "${KEEP_IN_ACTIVE[@]}"; do
        if [ "$filename" == "$keep_file" ]; then
            skip=true
            break
        fi
    done
    
    if [ "$skip" == true ]; then
        echo "⏸️  Keeping active: ${filename}"
        continue
    fi
    
    # Check if file contains completion indicators
    is_completed=false
    
    # Read first 30 lines to check status (some files have status further down)
    head_content=$(head -30 "$file" 2>/dev/null || echo "")
    
    # Also check entire file for completion keywords (for troubleshooting docs that are resolved)
    full_content=$(cat "$file" 2>/dev/null || echo "")
    
    for pattern in "${COMPLETED_PATTERNS[@]}"; do
        if echo "$head_content" | grep -qiE "$pattern"; then
            is_completed=true
            break
        fi
    done
    
    # Check for resolved troubleshooting documents
    if echo "$full_content" | grep -qiE "(RESOLVED|FIXED|Issue.*resolved|Problem.*fixed|Status.*✅.*RESOLVED)"; then
        is_completed=true
    fi
    
    # Also check for specific completed file patterns
    case "$filename" in
        *-complete.md|*-completed.md|*-fix-complete.md|*-fix-summary*.md|*-verified.md|*-restored.md|*-resolved.md|backup-complete-*.md|deployment-complete*.md|*-success*.md|*-fixed.md|*-test-results.md|*-summary*.md)
            is_completed=true
            ;;
    esac
    
    if [ "$is_completed" == true ]; then
        FILES_TO_ARCHIVE+=("$filename")
        echo "📦 To archive: ${filename}"
    else
        echo "⏸️  Keeping active: ${filename} (not marked as completed)"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Files to archive: ${#FILES_TO_ARCHIVE[@]}"

if [ ${#FILES_TO_ARCHIVE[@]} -eq 0 ]; then
    echo "✅ No files to archive"
    exit 0
fi

echo ""
if [ "$DRY_RUN" == "--dry-run" ]; then
    echo "🔍 DRY RUN - No files will be moved"
    echo ""
    echo "Files that would be archived:"
    for file in "${FILES_TO_ARCHIVE[@]}"; do
        echo "  - ${file}"
    done
    echo ""
    echo "Run without --dry-run to actually move files"
else
    echo "📦 Archiving files..."
    for file in "${FILES_TO_ARCHIVE[@]}"; do
        src="${ACTIVE_DIR}/${file}"
        dst="${ARCHIVE_DIR}/${file}"
        
        if [ -f "$src" ]; then
            mv "$src" "$dst"
            echo "  ✅ Archived: ${file}"
        else
            echo "  ⚠️  File not found: ${file}"
        fi
    done
    echo ""
    echo "✅ Archive complete!"
    echo "   Archived ${#FILES_TO_ARCHIVE[@]} files to ${ARCHIVE_DIR}"
fi

echo ""
