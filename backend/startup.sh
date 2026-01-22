#!/bin/sh
# Azure App Service startup script
# Extracts node_modules.tar.gz if node_modules doesn't exist, then starts the app

cd /home/site/wwwroot

# Extract node_modules if archive exists and node_modules doesn't exist
if [ -f "node_modules.tar.gz" ] && [ ! -d "node_modules" ]; then
  echo "Extracting node_modules.tar.gz..."
  tar -xzf node_modules.tar.gz
  echo "node_modules extracted successfully"
  echo "Node modules size: $(du -sh node_modules | cut -f1)"
else
  if [ -d "node_modules" ]; then
    echo "node_modules directory already exists, skipping extraction"
  else
    echo "WARNING: node_modules.tar.gz not found and node_modules doesn't exist"
  fi
fi

# Set default PORT if not set
if [ -z "$PORT" ]; then
  export PORT=8080
fi

# Start the application
echo "Starting application..."
npm start
