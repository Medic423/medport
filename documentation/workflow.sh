#!/bin/bash

# TCC Development Workflow Script
# Best practices for feature development and backup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if we're in a git repository
check_git_repo() {
    if [ ! -d ".git" ]; then
        print_error "Not in a git repository. Please run from project root."
        exit 1
    fi
}

# Function to check if working directory is clean
check_clean_working_dir() {
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Working directory has uncommitted changes:"
        git status --short
        echo ""
        read -p "Do you want to commit these changes first? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter commit message: " commit_msg
            git add .
            git commit -m "$commit_msg"
            print_success "Changes committed"
        else
            print_error "Please commit or stash changes before proceeding"
            exit 1
        fi
    fi
}

# Function to start new feature
start_feature() {
    if [ -z "$1" ]; then
        print_error "Please provide feature name: ./workflow.sh start-feature feature-name"
        exit 1
    fi
    
    local feature_name="$1"
    local branch_name="feature/$feature_name"
    
    print_status "Starting new feature: $feature_name"
    
    # Check if we're in git repo
    check_git_repo
    
    # Check if working directory is clean
    check_clean_working_dir
    
    # Switch to main and pull latest
    print_status "Switching to main branch and pulling latest changes..."
    git checkout main
    git pull origin main
    
    # Create and switch to feature branch
    print_status "Creating feature branch: $branch_name"
    git checkout -b "$branch_name"
    
    print_success "Feature branch '$branch_name' created and ready for development!"
    print_status "Start developing your feature. When ready, use: ./workflow.sh finish-feature"
}

# Function to finish feature
finish_feature() {
    print_status "Finishing feature development..."
    
    # Check if we're in git repo
    check_git_repo
    
    # Get current branch name
    local current_branch=$(git branch --show-current)
    
    if [[ ! "$current_branch" =~ ^feature/ ]]; then
        print_error "Not on a feature branch. Current branch: $current_branch"
        print_status "Please switch to a feature branch or use: ./workflow.sh start-feature feature-name"
        exit 1
    fi
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes:"
        git status --short
        echo ""
        read -p "Do you want to commit these changes? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter commit message: " commit_msg
            git add .
            git commit -m "$commit_msg"
            print_success "Changes committed"
        else
            print_error "Please commit changes before finishing feature"
            exit 1
        fi
    fi
    
    # Test the feature
    print_status "Testing feature before merging..."
    print_status "Starting development servers for testing..."
    
    # Start servers in background
    npm run dev &
    local dev_pid=$!
    
    # Wait for servers to start
    print_status "Waiting for servers to start..."
    sleep 10
    
    # Check if servers are running
    if curl -s http://localhost:5001/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_error "Backend failed to start. Please check for errors."
        kill $dev_pid 2>/dev/null || true
        exit 1
    fi
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is running"
    else
        print_error "Frontend failed to start. Please check for errors."
        kill $dev_pid 2>/dev/null || true
        exit 1
    fi
    
    print_status "Feature testing complete. Stopping development servers..."
    kill $dev_pid 2>/dev/null || true
    sleep 3
    
    # Merge to main
    print_status "Merging feature to main branch..."
    git checkout main
    git merge "$current_branch" --no-ff -m "feat: $current_branch"
    
    # Push to remote
    print_status "Pushing changes to remote..."
    git push origin main
    
    # Create backup
    print_status "Creating external backup..."
    ./backup.sh
    
    # Clean up feature branch
    print_status "Cleaning up feature branch..."
    git branch -d "$current_branch"
    git push origin --delete "$current_branch" 2>/dev/null || true
    
    print_success "Feature '$current_branch' successfully merged to main and backed up!"
    print_status "Feature branch has been deleted locally and remotely."
}

# Function to create backup
create_backup() {
    print_status "Creating external backup..."
    ./backup.sh
    print_success "Backup completed!"
}

# Function to restore from backup
restore_backup() {
    if [ -z "$1" ]; then
        print_error "Please provide backup path: ./workflow.sh restore /path/to/backup"
        exit 1
    fi
    
    local backup_path="$1"
    
    if [ ! -d "$backup_path" ]; then
        print_error "Backup directory not found: $backup_path"
        exit 1
    fi
    
    print_warning "This will restore from backup and may overwrite current changes!"
    read -p "Are you sure? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restore cancelled"
        exit 0
    fi
    
    print_status "Restoring from backup: $backup_path"
    cd "$backup_path"
    ./restore-complete.sh
    
    print_success "Restore completed!"
}

# Function to show available backups
list_backups() {
    local backup_dir="${1:-/Volumes/Acasis/tcc-backups}"
    
    if [ ! -d "$backup_dir" ]; then
        print_error "Backup directory not found: $backup_dir"
        exit 1
    fi
    
    print_status "Available backups in $backup_dir:"
    echo ""
    ls -la "$backup_dir" | grep "tcc-backup-" | while read line; do
        local date_part=$(echo "$line" | awk '{print $6, $7, $8}')
        local name_part=$(echo "$line" | awk '{print $9}')
        echo "  📁 $name_part ($date_part)"
    done
}

# Function to show help
show_help() {
    echo "TCC Development Workflow Script"
    echo "================================"
    echo ""
    echo "Usage: ./workflow.sh <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start-feature <name>    Start new feature development"
    echo "  finish-feature         Finish current feature and merge to main"
    echo "  backup                 Create external backup"
    echo "  restore <path>         Restore from backup"
    echo "  list-backups [dir]     List available backups"
    echo "  help                   Show this help"
    echo ""
    echo "Examples:"
    echo "  ./workflow.sh start-feature user-authentication"
    echo "  ./workflow.sh finish-feature"
    echo "  ./workflow.sh backup"
    echo "  ./workflow.sh restore /Volumes/Acasis/tcc-backups/tcc-backup-20250915_153253"
    echo "  ./workflow.sh list-backups"
}

# Main script logic
case "$1" in
    "start-feature")
        start_feature "$2"
        ;;
    "finish-feature")
        finish_feature
        ;;
    "backup")
        create_backup
        ;;
    "restore")
        restore_backup "$2"
        ;;
    "list-backups")
        list_backups "$2"
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
