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
        
        # Extract with progress output and timeout protection
        echo "Extracting archive (this may take 30-90 seconds for 49MB archive)..."
        echo "Starting extraction at $(date)..."
        
        # Check disk space first
        echo "Checking disk space..."
        df -h /home | tail -1
        
        # Extract with timeout and progress monitoring
        EXTRACTION_START=$(date +%s)
        timeout 180 tar -xzf deps.tar.gz 2>&1 &
        TAR_PID=$!
        
        # Show progress every 5 seconds
        while kill -0 $TAR_PID 2>/dev/null; do
            sleep 5
            ELAPSED=$(($(date +%s) - $EXTRACTION_START))
            echo "[${ELAPSED}s] Extraction in progress..."
            
            # Check if node_modules is being created
            if [ -d node_modules ]; then
                COUNT=$(find node_modules -type d 2>/dev/null | wc -l)
                echo "[${ELAPSED}s] Found $COUNT directories in node_modules so far..."
            fi
            
            # Warn if taking too long
            if [ $ELAPSED -gt 120 ]; then
                echo "⚠️ [${ELAPSED}s] Extraction taking longer than expected..."
            fi
        done
        
        # Wait for tar to complete and get exit code
        wait $TAR_PID
        TAR_EXIT=$?
        
        EXTRACTION_TIME=$(($(date +%s) - $EXTRACTION_START))
        
        if [ $TAR_EXIT -eq 0 ]; then
            echo "✅ Extraction completed in ${EXTRACTION_TIME} seconds"
        elif [ $TAR_EXIT -eq 124 ]; then
            echo "❌ Extraction timed out after ${EXTRACTION_TIME} seconds (180s limit)"
        else
            echo "⚠️ Extraction exited with code $TAR_EXIT after ${EXTRACTION_TIME} seconds"
        fi
        
        if [ $? -eq 0 ] && [ -d node_modules ] && [ -n "$(ls -A node_modules 2>/dev/null)" ]; then
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

