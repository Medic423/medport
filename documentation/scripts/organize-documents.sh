#!/bin/bash

################################################################################
# Document Organization Script
# Automatically organizes project documentation based on intelligent rules
# 
# Features:
# - Intelligent document classification
# - Age-based archiving
# - Dry-run mode for safety
# - Document index generation
# - Rollback-safe (works with external docs directory)
#
# Usage:
#   ./organize-documents.sh [options]
#
# Options:
#   --dry-run        Show what would be done without making changes
#   --force          Skip confirmation prompts
#   --index-only     Only generate document index
#   --archive-days   Days before archiving (default: 30)
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
DOCS_DIR="$HOME/Documents/tcc-project-docs"
PROJECT_DIR="/Users/scooper/Code/tcc-new-project"
ARCHIVE_DAYS=30
DRY_RUN=false
FORCE=false
INDEX_ONLY=false

# Counters
MOVED_COUNT=0
ARCHIVED_COUNT=0
SKIPPED_COUNT=0

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
Document Organization Script

Usage:
  ./organize-documents.sh [options]

Options:
  --dry-run          Show what would be done without making changes
  --force            Skip confirmation prompts
  --index-only       Only generate document index
  --archive-days N   Days before archiving (default: 30)
  --help             Show this help message

Examples:
  # Dry run to see what would happen
  ./organize-documents.sh --dry-run

  # Organize with default settings
  ./organize-documents.sh

  # Only generate document index
  ./organize-documents.sh --index-only

  # Archive documents older than 60 days
  ./organize-documents.sh --archive-days 60

EOF
    exit 0
}

################################################################################
# Document Classification Functions
################################################################################

classify_document() {
    local filename="$1"
    local modified_days="$2"
    
    # Session summaries
    if [[ "$filename" =~ ^SESSION.*\.md$ ]] || [[ "$filename" =~ SESSION_SUMMARY.*\.md$ ]]; then
        if [ "$modified_days" -gt "$ARCHIVE_DAYS" ]; then
            echo "archive/sessions"
        else
            echo "active/sessions"
        fi
        return
    fi
    
    # Feature specifications
    if [[ "$filename" =~ ^FEATURE.*\.md$ ]] || [[ "$filename" =~ SPECIFICATION.*\.md$ ]]; then
        if [ "$modified_days" -gt "$ARCHIVE_DAYS" ]; then
            echo "archive/features"
        else
            echo "active/features"
        fi
        return
    fi
    
    # Bug reports and fixes
    if [[ "$filename" =~ ^BUG.*\.md$ ]] || [[ "$filename" =~ FIX.*\.md$ ]] || [[ "$filename" =~ CRITICAL.*FIX.*\.md$ ]]; then
        if [ "$modified_days" -gt "$ARCHIVE_DAYS" ]; then
            echo "archive/bugs"
        else
            echo "active/bugs"
        fi
        return
    fi
    
    # Testing documentation
    if [[ "$filename" =~ ^TEST.*\.md$ ]] || [[ "$filename" =~ TESTING.*\.md$ ]]; then
        if [ "$modified_days" -gt "$ARCHIVE_DAYS" ]; then
            echo "archive/testing"
        else
            echo "active/testing"
        fi
        return
    fi
    
    # Deployment documentation
    if [[ "$filename" =~ DEPLOY.*\.md$ ]] || [[ "$filename" =~ PRODUCTION.*\.md$ ]]; then
        if [ "$modified_days" -gt "$ARCHIVE_DAYS" ]; then
            echo "archive/deployment"
        else
            echo "reference/deployment"
        fi
        return
    fi
    
    # Backup documentation
    if [[ "$filename" =~ BACKUP.*\.md$ ]] || [[ "$filename" =~ RESTORE.*\.md$ ]]; then
        echo "archive/backups"
        return
    fi
    
    # Milestone documentation
    if [[ "$filename" =~ MILESTONE.*\.md$ ]] || [[ "$filename" =~ COMPLETION.*\.md$ ]]; then
        echo "archive/milestones"
        return
    fi
    
    # User guides
    if [[ "$filename" =~ USER.*GUIDE.*\.md$ ]] || [[ "$filename" =~ GUIDE.*\.md$ ]]; then
        echo "user-guides"
        return
    fi
    
    # API documentation
    if [[ "$filename" =~ API.*\.md$ ]]; then
        echo "reference/api"
        return
    fi
    
    # Database documentation
    if [[ "$filename" =~ DATABASE.*\.md$ ]] || [[ "$filename" =~ SCHEMA.*\.md$ ]]; then
        echo "reference/database"
        return
    fi
    
    # Architecture documentation
    if [[ "$filename" =~ ARCHITECTURE.*\.md$ ]] || [[ "$filename" =~ DESIGN.*\.md$ ]]; then
        echo "reference/architecture"
        return
    fi
    
    # Plan documents
    if [[ "$filename" =~ PLAN.*\.md$ ]] || [[ "$filename" =~ PROMPT.*\.md$ ]]; then
        if [ "$modified_days" -gt "$ARCHIVE_DAYS" ]; then
            echo "archive/sessions"
        else
            echo "active/sessions"
        fi
        return
    fi
    
    # Summary documents
    if [[ "$filename" =~ SUMMARY.*\.md$ ]]; then
        if [ "$modified_days" -gt "$ARCHIVE_DAYS" ]; then
            echo "archive/sessions"
        else
            echo "active/sessions"
        fi
        return
    fi
    
    # Default: active/sessions for recent, archive for old
    if [ "$modified_days" -gt "$ARCHIVE_DAYS" ]; then
        echo "archive/deprecated"
    else
        echo "active/sessions"
    fi
}

get_file_age_days() {
    local file="$1"
    local current_time=$(date +%s)
    local file_time
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        file_time=$(stat -f %m "$file")
    else
        # Linux
        file_time=$(stat -c %Y "$file")
    fi
    
    local age_seconds=$((current_time - file_time))
    local age_days=$((age_seconds / 86400))
    
    echo "$age_days"
}

################################################################################
# Document Processing Functions
################################################################################

process_documents() {
    local source_dir="$1"
    
    print_header "Processing Documents from $source_dir"
    
    # Find all markdown files
    while IFS= read -r -d '' file; do
        local filename=$(basename "$file")
        local age_days=$(get_file_age_days "$file")
        local target_subdir=$(classify_document "$filename" "$age_days")
        local target_path="$DOCS_DIR/$target_subdir/$filename"
        
        # Skip if file is already in the right location
        if [ "$file" == "$target_path" ]; then
            print_info "Already in correct location: $filename"
            ((SKIPPED_COUNT++))
            continue
        fi
        
        # Check if target already exists
        if [ -f "$target_path" ]; then
            print_warning "Target already exists: $target_subdir/$filename"
            ((SKIPPED_COUNT++))
            continue
        fi
        
        # Show what we're doing
        if [ "$age_days" -gt "$ARCHIVE_DAYS" ]; then
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
            print_success "Moved: $filename"
        fi
        
    done < <(find "$source_dir" -maxdepth 1 -type f -name "*.md" -print0)
}

################################################################################
# Document Index Generation
################################################################################

generate_index() {
    print_header "Generating Document Index"
    
    local index_file="$DOCS_DIR/INDEX.md"
    local temp_index=$(mktemp)
    
    cat > "$temp_index" << 'EOF'
# TCC Project Documentation Index

> **Last Updated**: $(date +"%Y-%m-%d %H:%M:%S")
> **Generated by**: organize-documents.sh

This index provides a comprehensive overview of all project documentation.

---

## 📁 Directory Structure

```
docs/
├── active/          Current work-in-progress documents
├── reference/       Technical reference materials
├── user-guides/     End-user documentation
├── archive/         Historical documents
└── templates/       Document templates
```

---

EOF
    
    # Function to add directory section
    add_directory_section() {
        local dir="$1"
        local title="$2"
        local description="$3"
        
        echo "" >> "$temp_index"
        echo "## $title" >> "$temp_index"
        echo "" >> "$temp_index"
        echo "$description" >> "$temp_index"
        echo "" >> "$temp_index"
        
        if [ -d "$DOCS_DIR/$dir" ]; then
            local file_count=$(find "$DOCS_DIR/$dir" -type f -name "*.md" | wc -l | tr -d ' ')
            echo "**Files**: $file_count" >> "$temp_index"
            echo "" >> "$temp_index"
            
            # List files
            if [ "$file_count" -gt 0 ]; then
                find "$DOCS_DIR/$dir" -type f -name "*.md" | sort | while read -r file; do
                    local rel_path="${file#$DOCS_DIR/}"
                    local filename=$(basename "$file")
                    local age_days=$(get_file_age_days "$file")
                    echo "- [$filename]($rel_path) (${age_days} days old)" >> "$temp_index"
                done
            else
                echo "*No documents in this section*" >> "$temp_index"
            fi
        else
            echo "*Directory not found*" >> "$temp_index"
        fi
        
        echo "" >> "$temp_index"
    }
    
    # Generate sections
    add_directory_section "active/sessions" "📅 Active Sessions" "Current session notes and work logs"
    add_directory_section "active/features" "🚀 Active Features" "Features currently in development"
    add_directory_section "active/bugs" "🐛 Active Bug Fixes" "Bugs currently being investigated or fixed"
    add_directory_section "active/testing" "🧪 Active Testing" "Current testing plans and results"
    
    add_directory_section "reference/api" "📚 API Documentation" "API endpoint documentation and reference"
    add_directory_section "reference/database" "🗄️ Database Documentation" "Database schemas and documentation"
    add_directory_section "reference/architecture" "🏗️ Architecture Documentation" "System architecture and design"
    add_directory_section "reference/deployment" "🚀 Deployment Documentation" "Deployment guides and procedures"
    
    add_directory_section "user-guides/healthcare" "👨‍⚕️ Healthcare Portal Guides" "Healthcare user documentation"
    add_directory_section "user-guides/ems" "🚑 EMS Dashboard Guides" "EMS user documentation"
    add_directory_section "user-guides/admin" "⚙️ Admin Panel Guides" "Administrator documentation"
    add_directory_section "user-guides/quick-start" "⚡ Quick Start Guides" "Getting started documentation"
    
    add_directory_section "archive/sessions" "📦 Archived Sessions" "Historical session notes"
    add_directory_section "archive/milestones" "🎯 Project Milestones" "Major project milestones"
    add_directory_section "archive/backups" "💾 Backup Documentation" "Backup-related documentation"
    add_directory_section "archive/deprecated" "🗑️ Deprecated Documentation" "Outdated or deprecated docs"
    
    # Statistics
    cat >> "$temp_index" << EOF

---

## 📊 Documentation Statistics

EOF
    
    local total_docs=$(find "$DOCS_DIR" -type f -name "*.md" ! -path "*/templates/*" | wc -l | tr -d ' ')
    local active_docs=$(find "$DOCS_DIR/active" -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    local archived_docs=$(find "$DOCS_DIR/archive" -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    local reference_docs=$(find "$DOCS_DIR/reference" -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    local user_guide_docs=$(find "$DOCS_DIR/user-guides" -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    
    cat >> "$temp_index" << EOF
- **Total Documents**: $total_docs
- **Active Documents**: $active_docs
- **Archived Documents**: $archived_docs
- **Reference Documents**: $reference_docs
- **User Guides**: $user_guide_docs

---

## 🔍 Quick Links

### Most Recent Documents
EOF
    
    echo "" >> "$temp_index"
    
    # List 10 most recent documents
    find "$DOCS_DIR" -type f -name "*.md" ! -path "*/templates/*" ! -name "INDEX.md" -print0 | \
        xargs -0 ls -t | head -10 | while read -r file; do
        local rel_path="${file#$DOCS_DIR/}"
        local filename=$(basename "$file")
        echo "- [$filename]($rel_path)" >> "$temp_index"
    done
    
    cat >> "$temp_index" << EOF

---

## 📝 Document Templates

See [templates/README.md](templates/README.md) for available document templates.

---

*This index is automatically generated by the document organization system.*
*To regenerate: \`./scripts/organize-documents.sh --index-only\`*
EOF
    
    # Replace date placeholder
    sed -i '' "s/\$(date +\"%Y-%m-%d %H:%M:%S\")/$(date +"%Y-%m-%d %H:%M:%S")/g" "$temp_index"
    
    if [ "$DRY_RUN" = false ]; then
        mv "$temp_index" "$index_file"
        print_success "Document index generated: $index_file"
    else
        print_info "Would generate index at: $index_file"
        rm "$temp_index"
    fi
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
            --index-only)
                INDEX_ONLY=true
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
    
    print_header "TCC Document Organization System"
    
    if [ "$DRY_RUN" = true ]; then
        print_warning "DRY RUN MODE - No changes will be made"
    fi
    
    echo ""
    print_info "Documents directory: $DOCS_DIR"
    print_info "Archive after: $ARCHIVE_DAYS days"
    echo ""
    
    # Check if docs directory exists
    if [ ! -d "$DOCS_DIR" ]; then
        print_error "Documents directory not found: $DOCS_DIR"
        exit 1
    fi
    
    # Generate index only if requested
    if [ "$INDEX_ONLY" = true ]; then
        generate_index
        exit 0
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
    
    # Process documents from project root
    if [ -d "$PROJECT_DIR" ]; then
        process_documents "$PROJECT_DIR"
    fi
    
    # Process documents from docs root that aren't in proper subdirectories
    if [ -d "$DOCS_DIR" ]; then
        process_documents "$DOCS_DIR"
    fi
    
    # Generate index
    generate_index
    
    # Summary
    echo ""
    print_header "Summary"
    print_info "Documents organized: $MOVED_COUNT"
    print_info "Documents archived: $ARCHIVED_COUNT"
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

