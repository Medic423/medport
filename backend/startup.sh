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
    # Use background process with timeout kill as fallback if timeout command not available
    if [ -f package-lock.json ]; then
        echo "Using npm ci (requires package-lock.json)..."
        
        # Try timeout command first, fallback to background process with kill
        if command -v timeout >/dev/null 2>&1; then
            timeout 600 npm ci --omit=dev || {
                echo "⚠️ npm ci failed or timed out after 10 minutes. Trying npm install..."
                timeout 600 npm install --omit=dev --prefer-offline --no-audit || {
                    echo "❌ npm install also failed or timed out. Continuing anyway..."
                }
            }
        else
            # Fallback: run in background and kill after timeout
            echo "timeout command not available, using background process with kill..."
            npm ci --omit=dev &
            NPM_PID=$!
            sleep 600
            if kill -0 $NPM_PID 2>/dev/null; then
                echo "⚠️ npm ci still running after 10 minutes, killing process..."
                kill $NPM_PID 2>/dev/null || true
                wait $NPM_PID 2>/dev/null || true
                echo "⚠️ Trying npm install as fallback..."
                npm install --omit=dev --prefer-offline --no-audit &
                NPM_PID=$!
                sleep 600
                if kill -0 $NPM_PID 2>/dev/null; then
                    echo "❌ npm install also timed out. Continuing anyway..."
                    kill $NPM_PID 2>/dev/null || true
                    wait $NPM_PID 2>/dev/null || true
                else
                    wait $NPM_PID 2>/dev/null || true
                fi
            else
                wait $NPM_PID 2>/dev/null || true
            fi
        fi
    else
        echo "package-lock.json not found. Using npm install..."
        if command -v timeout >/dev/null 2>&1; then
            timeout 600 npm install --omit=dev --prefer-offline --no-audit || {
                echo "❌ npm install failed or timed out after 10 minutes. Continuing anyway..."
            }
        else
            npm install --omit=dev --prefer-offline --no-audit &
            NPM_PID=$!
            sleep 600
            if kill -0 $NPM_PID 2>/dev/null; then
                echo "❌ npm install timed out after 10 minutes. Continuing anyway..."
                kill $NPM_PID 2>/dev/null || true
                wait $NPM_PID 2>/dev/null || true
            else
                wait $NPM_PID 2>/dev/null || true
            fi
        fi
    fi
    
    echo "Dependencies installation completed (or timed out)."
else
    echo "node_modules already exists, skipping install."
fi

# Start the application
echo "Starting application..."
npm start

