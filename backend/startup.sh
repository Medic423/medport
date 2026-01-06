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
    npm install --production
    echo "Dependencies installed."
else
    echo "node_modules already exists, skipping install."
fi

# Start the application
echo "Starting application..."
npm start

