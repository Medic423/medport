#!/bin/bash
# Sync help files from external location to application
# This script copies markdown files, renames them, copies images, and updates image paths

set -e  # Exit on error

# Configuration
EXTERNAL_DOCS="/Users/scooper/Documents/TraccEMS/Users Guide"
FRONTEND_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_HELP="${FRONTEND_ROOT}/src/help"
PUBLIC_HELP="${FRONTEND_ROOT}/public/help"
PUBLIC_IMAGES="${PUBLIC_HELP}/images"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔄 Syncing help files from external location..."

# Create directories if they don't exist
mkdir -p "${SRC_HELP}/healthcare"
mkdir -p "${SRC_HELP}/ems"
mkdir -p "${PUBLIC_IMAGES}/healthcare"
mkdir -p "${PUBLIC_IMAGES}/ems"

# Function to rename file (remove prefix)
rename_file() {
    local filename="$1"
    local user_type="$2"
    
    # Remove healthcare_ or ems_ prefix
    if [[ "$user_type" == "healthcare" ]]; then
        newname=$(echo "$filename" | sed 's/^healthcare_//')
    elif [[ "$user_type" == "ems" ]]; then
        newname=$(echo "$filename" | sed 's/^ems_//')
    else
        newname="$filename"
    fi
    
    echo "$newname"
}

# Function to update image paths in markdown content
update_image_paths() {
    local content="$1"
    local user_type="$2"
    
    # Replace relative paths like ./Screen shots/ or ../Screen shots/ with absolute paths
    # Pattern: ![alt text](./Screen shots/image.png) or ![alt text](../Screen shots/image.png)
    # Replace with: ![alt text](/help/images/{userType}/image.png)
    
    # Handle ./Screen shots/ pattern
    content=$(echo "$content" | sed "s|!\[\([^\]]*\)\](\./Screen shots/\([^)]*\))|![\1](/help/images/${user_type}/\2)|g")
    
    # Handle ../Screen shots/ pattern
    content=$(echo "$content" | sed "s|!\[\([^\]]*\)\](\.\./Screen shots/\([^)]*\))|![\1](/help/images/${user_type}/\2)|g")
    
    # Handle Screen shots/ pattern (without ./ or ../)
    content=$(echo "$content" | sed "s|!\[\([^\]]*\)\](Screen shots/\([^)]*\))|![\1](/help/images/${user_type}/\2)|g")
    
    echo "$content"
}

# Sync Healthcare files
if [ -d "${EXTERNAL_DOCS}/Healthcare" ]; then
    echo "📁 Syncing Healthcare files..."
    
    # Copy and rename markdown files
    for file in "${EXTERNAL_DOCS}/Healthcare"/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            
            # Skip index.md files (preserve manual ones)
            if [[ "$filename" == "index.md" ]]; then
                echo "  ⏭️  Skipping index.md (preserving manual file)"
                continue
            fi
            
            newname=$(rename_file "$filename" "healthcare")
            dest="${SRC_HELP}/healthcare/${newname}"
            
            # Read content, update image paths, then write
            content=$(cat "$file")
            content=$(update_image_paths "$content" "healthcare")
            echo "$content" > "$dest"
            
            echo "  ✅ ${filename} → ${newname}"
        fi
    done
    
    # Copy images
    if [ -d "${EXTERNAL_DOCS}/Healthcare/Screen shots" ]; then
        echo "  📸 Copying Healthcare images..."
        cp -f "${EXTERNAL_DOCS}/Healthcare/Screen shots"/*.png "${PUBLIC_IMAGES}/healthcare/" 2>/dev/null || true
        cp -f "${EXTERNAL_DOCS}/Healthcare/Screen shots"/*.jpg "${PUBLIC_IMAGES}/healthcare/" 2>/dev/null || true
        cp -f "${EXTERNAL_DOCS}/Healthcare/Screen shots"/*.jpeg "${PUBLIC_IMAGES}/healthcare/" 2>/dev/null || true
        echo "  ✅ Healthcare images synced"
    fi
fi

# Sync EMS files
if [ -d "${EXTERNAL_DOCS}/EMS" ]; then
    echo "📁 Syncing EMS files..."
    
    # Copy and rename markdown files
    for file in "${EXTERNAL_DOCS}/EMS"/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            
            # Skip index.md files (preserve manual ones)
            if [[ "$filename" == "index.md" ]]; then
                echo "  ⏭️  Skipping index.md (preserving manual file)"
                continue
            fi
            
            newname=$(rename_file "$filename" "ems")
            dest="${SRC_HELP}/ems/${newname}"
            
            # Read content, update image paths, then write
            content=$(cat "$file")
            content=$(update_image_paths "$content" "ems")
            echo "$content" > "$dest"
            
            echo "  ✅ ${filename} → ${newname}"
        fi
    done
    
    # Copy images
    if [ -d "${EXTERNAL_DOCS}/EMS/Screen shots" ]; then
        echo "  📸 Copying EMS images..."
        cp -f "${EXTERNAL_DOCS}/EMS/Screen shots"/*.png "${PUBLIC_IMAGES}/ems/" 2>/dev/null || true
        cp -f "${EXTERNAL_DOCS}/EMS/Screen shots"/*.jpg "${PUBLIC_IMAGES}/ems/" 2>/dev/null || true
        cp -f "${EXTERNAL_DOCS}/EMS/Screen shots"/*.jpeg "${PUBLIC_IMAGES}/ems/" 2>/dev/null || true
        echo "  ✅ EMS images synced"
    fi
fi

echo -e "${GREEN}✅ Help files sync complete!${NC}"
