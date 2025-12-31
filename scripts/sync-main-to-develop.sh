#!/bin/bash

# Sync Main to Develop Script
# Purpose: After deploying fixes to production, sync them back to develop
# This ensures dev-swa gets all production fixes automatically

set -e

echo "🔄 Syncing main → develop to keep dev-swa in sync..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Make sure main is up to date
echo "📥 Pulling latest from origin/main..."
git checkout main
git pull origin main

# Check if there are commits in main that aren't in develop
COMMITS_AHEAD=$(git rev-list --count develop..main 2>/dev/null || echo "0")

if [ "$COMMITS_AHEAD" -eq "0" ]; then
    echo "✅ develop is already up to date with main"
    git checkout "$CURRENT_BRANCH"
    exit 0
fi

echo "📊 Found $COMMITS_AHEAD commit(s) in main that need to be synced to develop"

# Switch to develop
echo "🔄 Switching to develop branch..."
git checkout develop

# Pull latest develop
echo "📥 Pulling latest from origin/develop..."
git pull origin develop

# Merge main into develop
echo "🔀 Merging main into develop..."
if git merge main --no-edit; then
    echo "✅ Merge successful"
else
    echo "⚠️  Merge conflicts detected. Please resolve manually:"
    echo "   git status"
    echo "   # Resolve conflicts, then:"
    echo "   git add ."
    echo "   git commit"
    exit 1
fi

# Push to origin/develop (this triggers dev-swa deployment)
echo "📤 Pushing to origin/develop (triggers dev-swa deployment)..."
git push origin develop

echo ""
echo "✅ Sync complete!"
echo "   - All production fixes are now in develop"
echo "   - Dev-swa will automatically deploy these fixes"
echo "   - Both environments are now in sync"

# Return to original branch
git checkout "$CURRENT_BRANCH" 2>/dev/null || true

echo ""
echo "📍 Returned to branch: $(git branch --show-current)"

