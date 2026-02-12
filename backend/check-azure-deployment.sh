#!/bin/bash
# Diagnostic script to check Azure deployment status
# Run this via Azure CLI or Kudu/SSH

echo "=== Azure Backend Deployment Diagnostic ==="
echo ""

# Check if we're in the right directory
echo "1. Current directory:"
pwd
echo ""

# Check if dist/index.js exists
echo "2. Checking dist/index.js:"
if [ -f "dist/index.js" ]; then
  echo "✅ dist/index.js EXISTS"
  ls -lh dist/index.js
  echo ""
  echo "First 20 lines of dist/index.js:"
  head -20 dist/index.js
else
  echo "❌ dist/index.js DOES NOT EXIST"
  echo ""
  echo "Contents of dist/ directory:"
  ls -la dist/ 2>/dev/null || echo "dist/ directory does not exist"
fi
echo ""

# Check node_modules
echo "3. Checking node_modules:"
if [ -d "node_modules" ]; then
  echo "✅ node_modules EXISTS"
  echo "Size: $(du -sh node_modules | cut -f1)"
  echo ""
  echo "Checking @prisma/client:"
  if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ @prisma/client exists"
  else
    echo "❌ @prisma/client DOES NOT EXIST"
  fi
else
  echo "❌ node_modules DOES NOT EXIST"
fi
echo ""

# Check package.json
echo "4. Checking package.json:"
if [ -f "package.json" ]; then
  echo "✅ package.json EXISTS"
  echo "Start script:"
  grep '"start"' package.json
else
  echo "❌ package.json DOES NOT EXIST"
fi
echo ""

# Check environment variables
echo "5. Checking environment variables:"
echo "PORT: ${PORT:-not set}"
echo "NODE_ENV: ${NODE_ENV:-not set}"
echo "DATABASE_URL: ${DATABASE_URL:+SET (hidden)}"
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is NOT SET"
else
  echo "✅ DATABASE_URL is SET"
fi
echo ""

# Try to run npm start manually (non-blocking)
echo "6. Attempting to run 'npm start' manually:"
echo "   (This will show any immediate errors)"
timeout 5 npm start 2>&1 || echo "Command timed out or failed"
echo ""

# Check if Node.js process is running
echo "7. Checking for running Node.js processes:"
ps aux | grep -E "node|npm" | grep -v grep || echo "No Node.js processes found"
echo ""

echo "=== Diagnostic Complete ==="
