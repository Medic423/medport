#!/bin/bash

################################################################################
# Project Document Organization Script
# Organizes markdown files in the project's /docs directory before backup
# 
# Features:
# - Intelligent document classification
# - Age-based archiving
# - Duplicate detection
# - Dry-run mode for safety
# - Works with project /docs directory structure
#
# Usage:
#   ./scripts/organize-project-docs.sh [options]
#
# Options:
#   --dry-run        Show what would be done without making changes
#   --force          Skip confirmation prompts
#   --archive-days   Days before archiving (default: 60)
#   --help           Show this help message
################################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCS_DIR="$PROJECT_DIR/docs"
ARCHIVE_DAYS=60
DRY_RUN=false
FORCE=false

# Counters
MOVED_COUNT=0
ARCHIVED_COUNT=0
SKIPPED_COUNT=0
DUPLICATE_COUNT=0

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

show_help() {
    cat << EOF
Project Document Organization Script

Organizes markdown files in the project's /docs directory before backup.

Usage:
  ./scripts/organize-project-docs.sh [options]

Options:
  --dry-run          Show what would be done without making changes
  --force            Skip confirmation prompts
  --archive-days N   Days before archiving (default: 60)
  --help             Show this help message

Examples:
  # Dry run to see what would happen
  ./scripts/organize-project-docs.sh --dry-run

  # Organize with default settings
  ./scripts/organize-project-docs.sh

  # Archive documents older than 90 days
  ./scripts/organize-project-docs.sh --archive-days 90

EOF
    exit 0
}

################################################################################
# Document Classification Functions
################################################################################

classify_document() {
    local filename="$1"
    local filepath="$2"
    local modified_days="$3"
    
    # Check if file is already in correct location
    if [[ "$filepath" == *"/active/features/"* ]]; then
        echo "SKIP"  # Already organized
        return
    fi
    if [[ "$filepath" == *"/active/sessions/"* ]]; then
        echo "SKIP"  # Already organized
        return
    fi
    if [[ "$filepath" == *"/reference/"* ]]; then
        echo "SKIP"  # Already organized
        return
    fi
    if [[ "$filepath" == *"/archive/"* ]]; then
        echo "SKIP"  # Already archived
        return
    fi
    
    # Feature completion summaries
    if [[ "$filename" =~ ^phase[0-9]+-completion-summary\.md$ ]] || [[ "$filename" =~ completion-summary.*\.md$ ]]; then
        # Check if it's category-options related
        if grep -q "category-options\|Category Options\|dropdown.*categor" "$filepath" 2>/dev/null; then
            echo "active/features/category-options"
            return
        fi
        # Check if it's availability-status related
        if grep -q "availability.*status\|Availability Status" "$filepath" 2>/dev/null; then
            echo "active/features/availability-status"
            return
        fi
        # Default to active/features
        echo "active/features"
        return
    fi
    
    # End-to-end testing guides
    if [[ "$filename" =~ end-to-end.*test.*\.md$ ]] || [[ "$filename" =~ e2e.*test.*\.md$ ]]; then
        if grep -q "category-options\|Category Options" "$filepath" 2>/dev/null; then
            echo "active/features/category-options"
            return
        fi
        echo "active/features"
        return
    fi
    
    # Migration guides
    if [[ "$filename" =~ migration.*\.md$ ]] || [[ "$filename" =~ fix.*migration.*\.md$ ]]; then
        echo "reference/database/migrations"
        return
    fi
    
    # Azure documentation
    if [[ "$filename" =~ azure.*\.md$ ]] || [[ "$filename" =~ ^azure-.*\.md$ ]]; then
        echo "reference/azure"
        return
    fi
    
    # Deployment documentation
    if [[ "$filename" =~ deploy.*\.md$ ]] || [[ "$filename" =~ login-error.*\.md$ ]]; then
        echo "reference/deployment"
        return
    fi
    
    # Restore/backup instructions
    if [[ "$filename" =~ restore.*\.md$ ]] || [[ "$filename" =~ backup.*\.md$ ]]; then
        if [ "$modified_days" -gt "$ARCHIVE_DAYS" ]; then
            echo "archive/2025-12"  # Completed restore
        else
            echo "reference/backup"
        fi
        return
    fi
    
    # Session logs and reorganization logs
    if [[ "$filename" =~ reorganization.*\.md$ ]] || [[ "$filename" =~ phase.*log\.md$ ]]; then
        local current_month=$(date +"%Y-%m")
        echo "active/sessions/$current_month"
        return
    fi
    
    # Implementation plans
    if [[ "$filename" =~ implementation.*plan\.md$ ]] || [[ "$filename" =~ reimplementation.*plan\.md$ ]]; then
        local current_month=$(date +"%Y-%m")
        if [ "$modified_days" -gt "$ARCHIVE_DAYS" ]; then
            # Determine archive month from file date
            local file_year=$(stat -f "%Sm" -t "%Y" "$filepath" 2>/dev/null || date +"%Y")
            local file_month=$(stat -f "%Sm" -t "%m" "$filepath" 2>/dev/null || date +"%m")
            echo "archive/$file_year-$file_month"
        else
            echo "active/sessions/$current_month"
        fi
        return
    fi
    
    # Default: active sessions for recent, archive for old
    local current_month=$(date +"%Y-%m")
    if [ "$modified_days" -gt "$ARCHIVE_DAYS" ]; then
        local file_year=$(stat -f "%Sm" -t "%Y" "$filepath" 2>/dev/null || date +"%Y")
        local file_month=$(stat -f "%Sm" -t "%m" "$filepath" 2>/dev/null || date +"%m")
        echo "archive/$file_year-$file_month"
    else
        echo "active/sessions/$current_month"
    fi
}

get_file_age_days() {
    local file="$1"
    local current_time=$(date +%s)
    local file_time
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        file_time=$(stat -f %m "$file" 2>/dev/null || echo "$current_time")
    else
        # Linux
        file_time=$(stat -c %Y "$file" 2>/dev/null || echo "$current_time")
    fi
    
    local age_seconds=$((current_time - file_time))
    local age_days=$((age_seconds / 86400))
    
    echo "$age_days"
}

check_duplicate() {
    local file="$1"
    local filename=$(basename "$file")
    local target_dir="$2"
    
    # Check if file already exists in target location
    if [ -f "$DOCS_DIR/$target_dir/$filename" ]; then
        # Compare files
        if diff -q "$file" "$DOCS_DIR/$target_dir/$filename" > /dev/null 2>&1; then
            echo "DUPLICATE"
            return 0
        else
            echo "EXISTS_DIFFERENT"
            return 0
        fi
    fi
    
    echo "UNIQUE"
    return 0
}

################################################################################
# Document Processing Functions
################################################################################

process_documents() {
    local source_dir="$1"
    
    print_header "Processing Documents from $source_dir"
    
    if [ ! -d "$source_dir" ]; then
        print_warning "Source directory not found: $source_dir"
        return
    fi
    
    # Find all markdown files in notes directory
    while IFS= read -r -d '' file; do
        local filename=$(basename "$file")
        local age_days=$(get_file_age_days "$file")
        local target_subdir=$(classify_document "$filename" "$file" "$age_days")
        
        # Skip if already in correct location
        if [ "$target_subdir" == "SKIP" ]; then
            print_info "Already organized: $filename"
            ((SKIPPED_COUNT++))
            continue
        fi
        
        # Check for duplicates
        local dup_status=$(check_duplicate "$file" "$target_subdir")
        
        if [ "$dup_status" == "DUPLICATE" ]; then
            print_warning "Duplicate found: $filename (exists in $target_subdir/)"
            if [ "$DRY_RUN" = false ]; then
                rm "$file"
                print_success "Removed duplicate: $filename"
            else
                print_info "Would remove duplicate: $filename"
            fi
            ((DUPLICATE_COUNT++))
            continue
        fi
        
        if [ "$dup_status" == "EXISTS_DIFFERENT" ]; then
            print_warning "File exists with different content: $target_subdir/$filename"
            print_info "Skipping: $filename"
            ((SKIPPED_COUNT++))
            continue
        fi
        
        local target_path="$DOCS_DIR/$target_subdir/$filename"
        
        # Show what we're doing
        if [[ "$target_subdir" == archive/* ]]; then
            print_info "Archiving: $filename → $target_subdir (${age_days} days old)"
            ((ARCHIVED_COUNT++))
        else
            print_info "Organizing: $filename → $target_subdir"
            ((MOVED_COUNT++))
        fi
        
        # Actually move the file (unless dry run)
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$(dirname "$target_path")"
            mv "$file" "$target_path"
            print_success "Moved: $filename → $target_subdir"
        fi
        
    done < <(find "$source_dir" -maxdepth 1 -type f -name "*.md" -print0 2>/dev/null)
}

################################################################################
# Main Script Logic
################################################################################

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --archive-days)
                ARCHIVE_DAYS="$2"
                shift 2
                ;;
            --help)
                show_help
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
}

main() {
    parse_arguments "$@"
    
    print_header "TCC Project Document Organization"
    
    if [ "$DRY_RUN" = true ]; then
        print_warning "DRY RUN MODE - No changes will be made"
    fi
    
    echo ""
    print_info "Project directory: $PROJECT_DIR"
    print_info "Docs directory: $DOCS_DIR"
    print_info "Archive after: $ARCHIVE_DAYS days"
    echo ""
    
    # Check if docs directory exists
    if [ ! -d "$DOCS_DIR" ]; then
        print_error "Docs directory not found: $DOCS_DIR"
        exit 1
    fi
    
    # Confirmation prompt
    if [ "$FORCE" = false ] && [ "$DRY_RUN" = false ]; then
        echo ""
        read -p "Proceed with document organization? (y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warning "Operation cancelled"
            exit 0
        fi
    fi
    
    # Process documents from docs/notes/
    if [ -d "$DOCS_DIR/notes" ]; then
        process_documents "$DOCS_DIR/notes"
    else
        print_warning "Notes directory not found: $DOCS_DIR/notes"
    fi
    
    # Summary
    echo ""
    print_header "Summary"
    print_info "Documents organized: $MOVED_COUNT"
    print_info "Documents archived: $ARCHIVED_COUNT"
    print_info "Duplicates removed: $DUPLICATE_COUNT"
    print_info "Documents skipped: $SKIPPED_COUNT"
    
    if [ "$DRY_RUN" = true ]; then
        echo ""
        print_warning "This was a dry run. Run without --dry-run to apply changes."
    else
        echo ""
        print_success "Document organization complete!"
    fi
}

# Run main function
main "$@"

