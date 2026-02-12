#!/bin/bash
# Copy help files from src/help to public/help during build
# This script ensures public/help is in sync with src/help

set -e  # Exit on error

FRONTEND_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_HELP="${FRONTEND_ROOT}/src/help"
PUBLIC_HELP="${FRONTEND_ROOT}/public/help"

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "📋 Copying help files to public directory..."

# Create public/help directories if they don't exist
mkdir -p "${PUBLIC_HELP}/healthcare"
mkdir -p "${PUBLIC_HELP}/ems"

# Copy Healthcare files
if [ -d "${SRC_HELP}/healthcare" ]; then
    echo "  📁 Copying Healthcare files..."
    cp -f "${SRC_HELP}/healthcare"/*.md "${PUBLIC_HELP}/healthcare/" 2>/dev/null || true
fi

# Copy EMS files
if [ -d "${SRC_HELP}/ems" ]; then
    echo "  📁 Copying EMS files..."
    cp -f "${SRC_HELP}/ems"/*.md "${PUBLIC_HELP}/ems/" 2>/dev/null || true
fi

# Note: Images are already in public/help/images/ from sync script
# so we don't need to copy them here

echo -e "${GREEN}✅ Help files copied to public directory${NC}"
