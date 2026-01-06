#!/bin/bash
# Custom startup script for Azure App Service
# This script runs AFTER Azure's built-in startup script
# It ensures node_modules exists before starting the app

cd /home/site/wwwroot

# Remove tar.gz if it exists to prevent Azure's script from detecting it
if [ -f node_modules.tar.gz ]; then
    echo "Removing node_modules.tar.gz to prevent Azure script interference..."
    rm -f node_modules.tar.gz
fi

# Check if /node_modules is empty or missing
if [ ! -d /node_modules ] || [ -z "$(ls -A /node_modules 2>/dev/null)" ]; then
    echo "node_modules is missing or empty. Installing dependencies..."
    echo "Using npm install with optimized flags (npm ci hangs in Azure)..."
    
    # Use npm install with flags to make it faster and more reliable
    # --prefer-offline: Use cache when possible
    # --no-audit: Skip security audit (faster)
    # --omit=dev: Only install production dependencies
    # --loglevel=error: Reduce output noise
    npm install --omit=dev --prefer-offline --no-audit --loglevel=error
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully."
    else
        echo "⚠️ npm install exited with error code $?. Continuing anyway..."
    fi
else
    echo "node_modules already exists, skipping install."
fi

# Start the application
echo "Starting application..."
npm start

