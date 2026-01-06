#!/bin/bash
# Custom startup script for Azure App Service
# This script runs AFTER Azure's built-in startup script
# It ensures node_modules exists before starting the app

cd /home/site/wwwroot

# Strategy: Extract pre-built node_modules archive (fast) instead of npm install (hangs)
# This avoids npm install hanging in Azure App Service environment

echo "=== Azure App Service Startup Script ==="
echo "Current directory: $(pwd)"
echo "Checking for node_modules..."

# Check if node_modules exists and is populated
if [ -d node_modules ] && [ -n "$(ls -A node_modules 2>/dev/null)" ]; then
    echo "✅ node_modules already exists and is populated."
    echo "Skipping dependency installation."
else
    echo "⚠️ node_modules is missing or empty."
    
    # Try to extract pre-built archive first (fast, reliable)
    if [ -f node_modules.tar.gz ]; then
        echo "Found node_modules.tar.gz archive. Extracting..."
        echo "Archive size: $(ls -lh node_modules.tar.gz | awk '{print $5}')"
        
        # Extract with progress output
        tar -xzf node_modules.tar.gz 2>&1 | head -20
        
        if [ $? -eq 0 ] && [ -d node_modules ] && [ -n "$(ls -A node_modules 2>/dev/null)" ]; then
            echo "✅ Successfully extracted node_modules from archive."
            echo "node_modules size: $(du -sh node_modules | awk '{print $1}')"
            
            # Clean up archive to prevent Azure's script from interfering
            echo "Removing archive to prevent Azure script interference..."
            rm -f node_modules.tar.gz
        else
            echo "⚠️ Extraction failed or incomplete. Falling back to npm install..."
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

