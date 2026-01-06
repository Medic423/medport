#!/bin/bash
# Custom startup script for Azure App Service
# This script runs AFTER Azure's built-in startup script
# It ensures node_modules exists before starting the app

# Immediate output to confirm script is running
echo "=========================================="
echo "STARTUP SCRIPT STARTING - $(date)"
echo "=========================================="

cd /home/site/wwwroot

# Strategy: Extract pre-built node_modules archive (fast) instead of npm install (hangs)
# This avoids npm install hanging in Azure App Service environment
# Using deps.tar.gz instead of node_modules.tar.gz to prevent Azure's script from detecting it

echo "=== Azure App Service Startup Script ==="
echo "Current directory: $(pwd)"
echo "Checking for node_modules..."
echo "Listing files in current directory:"
ls -lah | head -10

# Check if node_modules exists and is populated (ignore .gitkeep file)
# Azure may create a dummy node_modules/.gitkeep to prevent auto-install
if [ -d node_modules ] && [ -n "$(ls -A node_modules 2>/dev/null | grep -v '^\.gitkeep$')" ]; then
    echo "✅ node_modules already exists and is populated."
    echo "Skipping dependency installation."
else
    echo "⚠️ node_modules is missing or empty (only .gitkeep found)."
    # Remove dummy directory if it exists
    rm -rf node_modules 2>/dev/null || true
    
    # Try to extract pre-built archive first (fast, reliable)
    # Use deps.tar.gz instead of node_modules.tar.gz to prevent Azure's built-in script from detecting it
    if [ -f deps.tar.gz ]; then
        echo "Found deps.tar.gz archive. Extracting..."
        echo "Archive size: $(ls -lh deps.tar.gz | awk '{print $5}')"
        
        # Extract to /tmp first (faster, more reliable than extracting directly to wwwroot)
        echo "Extracting to /tmp first (more reliable in Azure)..."
        EXTRACTION_START=$(date +%s)
        
        # Create temp directory
        TEMP_DIR="/tmp/node_modules_extract_$$"
        mkdir -p "$TEMP_DIR"
        
        # Extract to temp directory with timeout
        echo "Starting extraction at $(date)..."
        if timeout 120 tar -xzf deps.tar.gz -C "$TEMP_DIR" 2>&1; then
            EXTRACTION_TIME=$(($(date +%s) - $EXTRACTION_START))
            echo "✅ Extraction to /tmp completed in ${EXTRACTION_TIME} seconds"
            
            # Move extracted node_modules to current directory
            echo "Moving node_modules to current directory..."
            if [ -d "$TEMP_DIR/node_modules" ]; then
                mv "$TEMP_DIR/node_modules" .
                MOVE_TIME=$(($(date +%s) - $EXTRACTION_START))
                echo "✅ Move completed. Total time: ${MOVE_TIME} seconds"
                rm -rf "$TEMP_DIR"
            else
                echo "⚠️ node_modules not found in extracted archive"
                rm -rf "$TEMP_DIR"
            fi
        else
            EXTRACTION_TIME=$(($(date +%s) - $EXTRACTION_START))
            echo "❌ Extraction failed or timed out after ${EXTRACTION_TIME} seconds"
            rm -rf "$TEMP_DIR"
        fi
        
        if [ -d node_modules ] && [ -n "$(ls -A node_modules 2>/dev/null)" ]; then
            echo "✅ Successfully extracted node_modules from archive."
            echo "node_modules size: $(du -sh node_modules | awk '{print $1}')"
            
            # Clean up archive
            echo "Removing archive..."
            rm -f deps.tar.gz
        else
            echo "⚠️ Extraction failed or incomplete. Falling back to npm install..."
            rm -rf node_modules 2>/dev/null || true
        fi
    elif [ -f node_modules.tar.gz ]; then
        # Fallback: if old name exists (from previous deployments), try it but warn
        echo "⚠️ Found node_modules.tar.gz (old name). Azure's script may interfere."
        echo "Extracting node_modules.tar.gz..."
        tar -xzf node_modules.tar.gz 2>&1 | tail -5
        
        if [ $? -eq 0 ] && [ -d node_modules ] && [ -n "$(ls -A node_modules 2>/dev/null)" ]; then
            echo "✅ Successfully extracted node_modules from archive."
            rm -f node_modules.tar.gz
        else
            echo "⚠️ Extraction failed. Falling back to npm install..."
            rm -rf node_modules 2>/dev/null || true
        fi
    fi
    
    # Fallback: npm install if extraction failed or archive doesn't exist
    if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
        echo "Installing dependencies via npm install (fallback method)..."
        echo "Note: This may hang in Azure - if it does, the archive extraction method should be used instead."
        
        # Use npm install with optimized flags
        npm install --omit=dev --prefer-offline --no-audit --loglevel=error --maxsockets=1
        
        if [ $? -eq 0 ]; then
            echo "✅ Dependencies installed successfully via npm install."
        else
            echo "⚠️ npm install exited with error code $?. Continuing anyway..."
        fi
    fi
fi

# Verify critical dependencies exist
if [ ! -d node_modules/@prisma/client ]; then
    echo "⚠️ WARNING: @prisma/client not found in node_modules!"
    echo "This may cause runtime errors. Attempting to install..."
    npm install @prisma/client --no-save --loglevel=error || echo "Failed to install @prisma/client"
fi

# Start the application
echo ""
echo "=== Starting Application ==="
npm start

