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
    
    # Use npm ci if package-lock.json exists (faster, more reliable)
    # Otherwise fall back to npm install
    if [ -f package-lock.json ]; then
        echo "Using npm ci (requires package-lock.json)..."
        timeout 600 npm ci --omit=dev || {
            echo "⚠️ npm ci failed or timed out after 10 minutes. Trying npm install..."
            timeout 600 npm install --omit=dev --prefer-offline --no-audit || {
                echo "❌ npm install also failed or timed out. Continuing anyway..."
            }
        }
    else
        echo "package-lock.json not found. Using npm install..."
        timeout 600 npm install --omit=dev --prefer-offline --no-audit || {
            echo "❌ npm install failed or timed out after 10 minutes. Continuing anyway..."
        }
    fi
    
    echo "Dependencies installation completed (or timed out)."
else
    echo "node_modules already exists, skipping install."
fi

# Start the application
echo "Starting application..."
npm start

